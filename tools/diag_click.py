#!/usr/bin/env python3
"""Diagnostic: drive real mouse + touch clicks into the running game via CDP
pipe and report which stage of the input chain swallows them.

Usage: python3 tools/diag_click.py [port]   (default 8931, server must run)
"""
import json, os, subprocess, sys, time, tempfile

PORT = sys.argv[1] if len(sys.argv) > 1 else "8931"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE = tempfile.mkdtemp(prefix="mythika-cdp-")

r_in, w_in = os.pipe()
r_out, w_out = os.pipe()

def pre():
    os.dup2(w_in, 3)
    os.dup2(r_out, 4)

proc = subprocess.Popen(
    [CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
     "--user-data-dir=" + PROFILE,
     "--window-size=500,900", "--remote-debugging-pipe",
     "about:blank"],
    preexec_fn=pre, pass_fds=(w_in, r_out, 3, 4),
    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
# Parent KEEPS w_in (write) and r_out (read): the child inherited duplicates
# on fds 3/4 via preexec, but these are our talking ends.

_id = [0]
buf = b""

def send(method, params=None):
    _id[0] += 1
    msg = json.dumps({"id": _id[0], "method": method, "params": params or {}})
    os.write(w_in, msg.encode() + b"\x00")
    return _id[0]

def wait_msg(want_id=None, timeout=15):
    global buf
    deadline = time.time() + timeout
    while time.time() < deadline:
        while b"\x00" in buf:
            raw, buf = buf.split(b"\x00", 1)
            if not raw.strip():
                continue
            try:
                m = json.loads(raw)
            except Exception:
                continue
            if want_id is None or m.get("id") == want_id:
                return m
        import select
        r, _, _ = select.select([r_out], [], [], 0.2)
        if r:
            chunk = os.read(r_out, 65536)
            if not chunk:
                time.sleep(0.05)
                continue
            buf += chunk
        # NOTE: the Chrome launcher process forks and exits(0) immediately;
        # the real browser child keeps fd4. Never treat poll() as fatal here.
    return None

def ev(expr):
    mid = send("Runtime.evaluate", {"expression": expr, "returnByValue": True})
    m = wait_msg(mid)
    if not m:
        return {"__timeout": True}
    res = m.get("result", {}).get("result", {})
    if "value" in res:
        return res["value"]
    return {"__error": m.get("result", {}).get("exceptionDetails", {}).get("text", "eval-error")}

# boot page
send("Page.enable"); send("Runtime.enable")
mid = send("Page.navigate", {"url": "http://127.0.0.1:%s/index.html?probe=1" % PORT})
wait_msg(mid, timeout=20)
time.sleep(3)

print("== boot state ==")
print(ev("({scene: G.state.scene, dpr: G.dpr, frames: G.frameCount, booted: !!G._booted})"))

print("== jump straight to forge ==")
print(ev("(function(){ SaveSystem.seedDemo ? SaveSystem.seedDemo() : null; gScene('forge'); return G.state.scene; })()"))
time.sleep(1)
print(ev("({scene: G.state.scene, modalActive: !!UI.Modal.active, btnCount: forgeScene.data.buttons.length,"
         " btns: forgeScene.data.buttons.map(function(b){return {x:b.x,y:b.y,w:b.w,h:b.h,text:b.text,enabled:b.enabled};}) })"))

# canvas geometry
geo = ev("(function(){var r=G.canvas.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};})()")
print("canvas geo:", geo)

sx = geo["width"] / 400.0
sy = geo["height"] / 720.0
b0 = ev("forgeScene.data.buttons[0]")
cx = geo["left"] + (b0["x"] + b0["w"] / 2) * sx
cy = geo["top"] + (b0["y"] + b0["h"] / 2) * sy
print("clicking hero button at", cx, cy)

for phase in ["mouse", "touch"]:
    print("== %s click attempt ==" % phase)
    if phase == "mouse":
        send("Input.dispatchMouseEvent", {"type": "mousePressed", "x": cx, "y": cy, "button": "left", "clickCount": 1})
        time.sleep(0.05)
        send("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": cx, "y": cy, "button": "left", "clickCount": 1})
    else:
        send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": cx, "y": cy}]})
        time.sleep(0.05)
        send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    time.sleep(0.8)
    print(ev("({selectedHero: forgeScene.data.selectedHero && forgeScene.data.selectedHero.id,"
             " lastTapAt: Input._lastTapAt, now: performance.now(),"
             " queuedClicks: Input.clicks.length, queuedTouches: Input.touches.length,"
             " errStreak: G._errStreak || 0})"))
    # reset back to hero list for the second attempt
    print(ev("forgeScene.buildHeroList(); 'reset'"))

print("== direct handler probe ==")
print(ev("(function(){ var t={x: forgeScene.data.buttons[0].x+50, y: forgeScene.data.buttons[0].y+25, t:'click'};"
         " Input.clicks=[t]; var consumed=UI.handleButtons(forgeScene.data.buttons, -forgeScene.data.scrollY);"
         " return {consumed:consumed, selectedHero: forgeScene.data.selectedHero && forgeScene.data.selectedHero.id}; })()"))

proc.kill()
