#!/usr/bin/env python3
"""Mythika verification harness (H4).

Boots the game headlessly in Chrome across the device matrix and proves the
rAF loop actually started by grepping for the '[Mythika] booted dpr=' beacon
emitted by gInit(). Saves one screenshot per profile for visual review.

Stdlib only. Single invocation covers every profile:

    python3 tools/verify_matrix.py            # run all profiles
    python3 tools/verify_matrix.py --keep     # keep server + shots dir listed
"""

import argparse
import base64
import http.server
import json
import os
import re
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import functools
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# name, width, height, device-scale-factor, note shown on failure triage
PROFILES = [
    ("desktop",    1280, 1400, 1, "scale-capped at 1, gold frame visible"),
    ("phone",       390,  844, 3, "DPR3 crispness, borderless <=420px CSS"),
    ("phone-land",  844,  390, 3, "short viewport -> rotate hint expected"),
]

# Layout-sweep viewports (Phase 30 LAY-00): portrait + landscape phones.
LAYOUT_PROFILES = [
    ("phone",       390,  844, 3),
    ("phone-land",  844,  390, 3),
]

LAYOUT_DIR = os.path.join(ROOT, "tools", "layout_harness")
LAYOUT_BUDGET_FLOOR = 30000  # ~26 settled scenes x 350ms + boot + margin


def build_layout_page():
    """Generate the sweep page: index.html with the harness scripts first.

    Mechanism substitution for CONTEXT D-hook (Playwright add_init_script):
    Playwright is unavailable (AGENTS.md forbids dependency installs; stdlib
    only), so the wrapper is installed via script ORDER instead — inject.js
    (then driver.js) load before the first src="src/" game script, which sees
    every draw call exactly like add_init_script would, with no game-code
    edits. Served loopback-only at /__layout__.html; never committed.
    """
    with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    tags = ('<script src="/tools/layout_harness/inject.js"></script>\n'
            '<script src="/tools/layout_harness/driver.js"></script>\n')
    marker = 'src="src/'
    idx = html.find(marker)
    if idx == -1:
        raise RuntimeError("no local src/ script tag found in index.html")
    # Insert before the <script ...> tag containing the first local src.
    tag_start = html.rfind("<script", 0, idx)
    if tag_start == -1:
        raise RuntimeError("malformed script tag in index.html")
    return (html[:tag_start] + tags + html[tag_start:]).encode("utf8")

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    shutil.which("google-chrome"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]


def find_chrome():
    # MYTHIKA_CHROME lets CI (setup-chrome installs off-PATH) or a developer
    # pin the binary; implies the sandbox/shm workarounds runners need.
    env = os.environ.get("MYTHIKA_CHROME")
    if env and os.path.exists(env):
        return env
    for c in CHROME_CANDIDATES:
        if c and os.path.exists(c):
            return c
    return None


# Runner environments need these; locally they are only added when
# MYTHIKA_CHROME is pinned (harness-driven runs).
RUNNER_FLAGS = (
    ["--no-sandbox", "--disable-dev-shm-usage"]
    if os.environ.get("CI") or os.environ.get("MYTHIKA_CHROME")
    else []
)


def serve(routes=None):
    routes = routes or {}

    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, fmt, *args2):
            pass

        def do_GET(self):
            path = self.path.split("?", 1)[0]
            if path in routes:
                body, ctype = routes[path]
                self.send_response(200)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(body)
                return
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

    handler = functools.partial(QuietHandler, directory=ROOT)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, port


def run_profile(chrome, port, name, w, h, dpr, note, outdir, budget_ms):
    shot = os.path.join(outdir, name + ".png")
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--hide-scrollbars",
        "--window-size=%d,%d" % (w, h),
        *RUNNER_FLAGS,
        "--force-device-scale-factor=%s" % dpr,
        "--virtual-time-budget=%d" % budget_ms,
        "--enable-logging=stderr",
        "--v=0",
        "--screenshot=" + shot,
        "http://127.0.0.1:%d/index.html" % port,
    ]
    proc = subprocess.run(
        cmd, capture_output=True, text=True, timeout=60
    )
    err = proc.stderr or ""
    booted = "[Mythika] booted" in err
    uncaught = "Uncaught" in err
    ok = booted and not uncaught and os.path.exists(shot)
    return ok, booted, uncaught, shot, note


def run_layout_profile(chrome, port, name, w, h, dpr, outdir, budget_ms):
    shot = os.path.join(outdir, "layout-%s.png" % name)
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--hide-scrollbars",
        "--window-size=%d,%d" % (w, h),
        *RUNNER_FLAGS,
        "--force-device-scale-factor=%s" % dpr,
        "--virtual-time-budget=%d" % budget_ms,
        "--enable-logging=stderr",
        "--v=0",
        "--screenshot=" + shot,
        "http://127.0.0.1:%d/__layout__.html?layout=1" % port,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    return proc.stderr or "", shot


def parse_layout_beacons(err):
    scenes = {}
    shots = {}
    done = None
    for line in err.splitlines():
        m = re.search(r"\[Mythika\] layout ([A-Za-z0-9+/=]+)", line)
        if m:
            try:
                raw = base64.b64decode(m.group(1)).decode("utf-8")
                obj = json.loads(raw)
                if isinstance(obj, dict) and "scene" in obj:
                    scenes[obj["scene"]] = obj
            except Exception:
                pass
            continue
        m2 = re.search(r"\[Mythika\] layout-shot (\S+) (\S+)", line)
        if m2:
            shots[m2.group(1)] = None if m2.group(2) == "null" else m2.group(2)
            continue
        m3 = re.search(r"\[Mythika\] layout-done (\d+)", line)
        if m3:
            done = int(m3.group(1))
    return scenes, shots, done


EVAL_JS = """const fs = require('fs');
const { findViolations } = require(%s);
const allowlist = JSON.parse(fs.readFileSync(%s, 'utf8')).allowlist || [];
const scenes = JSON.parse(fs.readFileSync(%s, 'utf8'));
const out = scenes.map(function (s) {
  const r = findViolations(s.boxes || [], {
    W: s.W || 400, H: s.H || 720, clip: s.clip || null, allowlist: allowlist });
  return { scene: s.scene, actualScene: s.actualScene || null,
           enteredActual: s.enteredActual || null,
           stateScene: s.stateScene || null, boxCount: r.boxCount,
           violations: r.violations, waived: r.waived,
           harnessOk: !!s.harnessOk, harnessErrors: s.harnessErrors || [] };
});
fs.writeFileSync(%s, JSON.stringify(out));
"""


def evaluate_layout(scenes, profile):
    """Run every scene's boxes through the single assert.js implementation."""
    tmpdir = tempfile.mkdtemp(prefix="mythika-layout-")
    try:
        scenes_path = os.path.join(tmpdir, "scenes.json")
        out_path = os.path.join(tmpdir, "findings.json")
        eval_path = os.path.join(tmpdir, "eval.js")
        with open(scenes_path, "w", encoding="utf-8") as f:
            json.dump(list(scenes.values()), f)
        assert_path = os.path.join(LAYOUT_DIR, "assert.js")
        allow_path = os.path.join(LAYOUT_DIR, "allowlist.json")
        with open(eval_path, "w", encoding="utf-8") as f:
            f.write(EVAL_JS % (json.dumps(assert_path), json.dumps(allow_path),
                               json.dumps(scenes_path), json.dumps(out_path)))
        proc = subprocess.run(["node", eval_path], capture_output=True,
                              text=True, timeout=60)
        if proc.returncode != 0:
            raise RuntimeError("assert.js eval failed: %s" % proc.stderr[-2000:])
        with open(out_path, encoding="utf-8") as f:
            return json.load(f)
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def pair_matches_violation(pair, scene, violation):
    if pair.get("kind") != violation.get("kind"):
        return False
    if pair.get("scene") not in scene:
        return False
    am, bm = pair.get("aMatch", ""), pair.get("bMatch", "")
    va = str(violation.get("a") or "")
    vb = str(violation.get("b") or "")
    if violation.get("kind") == "intersect":
        straight = (not am or am in va) and (not bm or bm in vb)
        swapped = (not am or am in vb) and (not bm or bm in va)
        return straight or swapped
    return (not bm) and (not am or am in va)


def run_layout(chrome, outdir, budget_ms):
    layout_page = build_layout_page()
    httpd, port = serve({"/__layout__.html": (layout_page, "text/html")})
    print("chrome: %s" % chrome)
    print("server: http://127.0.0.1:%d/__layout__.html?layout=1" % port)

    with open(os.path.join(LAYOUT_DIR, "expected_pairs.json"),
              encoding="utf-8") as f:
        expected = json.load(f)
    expected_pairs = expected.get("expectedViolations", [])

    budget = max(budget_ms, LAYOUT_BUDGET_FLOOR)
    failures = 0
    all_violations = []
    pair_hits = {i: [] for i in range(len(expected_pairs))}

    for (name, w, h, dpr) in LAYOUT_PROFILES:
        t0 = time.time()
        err, prof_shot = run_layout_profile(chrome, port, name, w, h, dpr,
                                            outdir, budget)
        scenes, shots, done = parse_layout_beacons(err)
        status = "sweep reported %d scene(s), done=%s" % (len(scenes), done)
        print("layout %-11s %dx%d@%dx  %.1fs  %s" % (
            name, w, h, dpr, time.time() - t0, status))

        if "[Mythika] booted" not in err:
            print("     FAIL: no boot beacon; sweep never started")
            failures += 1
            continue
        if done is None:
            print("     FAIL: driver did not finish (no layout-done marker)")
            failures += 1
        uncaught = "Uncaught" in err
        if uncaught:
            print("     FAIL: console reported an uncaught error")
            failures += 1

        findings = evaluate_layout(scenes, name) if scenes else []
        report = []
        for finding in findings:
            scene = finding["scene"]
            shot_path = None
            durl = shots.get(scene)
            if durl and durl.startswith("data:image/jpeg;base64,"):
                shot_path = os.path.join(
                    outdir, "layout-%s-%s.jpg" % (scene, name))
                with open(shot_path, "wb") as f:
                    f.write(base64.b64decode(durl.split(",", 1)[1]))
            entry = {"scene": scene, "profile": name,
                     "actualScene": finding.get("actualScene"),
                     "enteredActual": finding.get("enteredActual"),
                     "stateScene": finding.get("stateScene"),
                     "boxCount": finding["boxCount"],
                     "harnessOk": finding["harnessOk"],
                     "harnessErrors": finding["harnessErrors"],
                     "violations": finding["violations"],
                     "waived": finding["waived"],
                     "shotPath": shot_path}
            report.append(entry)
            for v in finding["violations"]:
                all_violations.append({"scene": scene, "profile": name,
                                       "finding": v})
                for i, pair in enumerate(expected_pairs):
                    if pair_matches_violation(pair, scene, v):
                        pair_hits[i].append("%s/%s" % (scene, name))
            if not finding["harnessOk"] or finding["harnessErrors"]:
                print("     FAIL: harness error in %s: %s" % (
                    scene, finding["harnessErrors"]))
                failures += 1
            actual = finding.get("actualScene") or ""
            entered = finding.get("enteredActual") or ""
            base = scene.split("-")[0]
            # modal-open shows a modal OVER the party scene: underlying
            # 'party' is the correct entry, not a mismatch.
            expects = {"modal-open": "party"}
            want = expects.get(scene, scene)
            want_base = expects.get(scene, base)
            if entered and entered != want and entered != want_base:
                print("     FAIL: enter landed on %s (asked %s)" % (
                    entered, scene))
                failures += 1
            if actual and actual != want and actual != want_base:
                print("     FAIL: scene mismatch: asked %s, entered %s, rendering %s" % (
                    scene, entered or "?", actual))
                failures += 1

        report_path = os.path.join(outdir, "layout-%s.json" % name)
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        n_viol = sum(len(e["violations"]) for e in report)
        print("     %d violation(s), report=%s" % (n_viol, report_path))
        if n_viol:
            failures += 1

    print("--- expected-pair match (fail-first oracle) ---")
    missing = 0
    for i, pair in enumerate(expected_pairs):
        hits = pair_hits[i]
        mark = "HIT " if hits else "MISS"
        if not hits:
            missing += 1
        print("  %s scene=%s kind=%s a=%r b=%r -> %s" % (
            mark, pair.get("scene"), pair.get("kind"),
            pair.get("aMatch"), pair.get("bMatch"),
            ",".join(sorted(set(hits))) or "no violation matched"))
    print("matched %d/%d frozen pairs" % (
        len(expected_pairs) - missing, len(expected_pairs)))
    if missing:
        print("NOTE: %d frozen pair(s) unmatched — harness may be blind there; "
              "do NOT delete pairs to force green (see fixture comment)" % missing)

    print("screenshots in %s" % outdir)
    if failures:
        print("RESULT: layout sweep FAILED (%d failing profile(s)/scene(s)); "
              "%d total violation(s) outside allowlist" % (
                  failures, len(all_violations)))
        return 1
    print("RESULT: layout sweep clean (0 violations outside allowlist)")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--budget", type=int, default=6000,
                    help="virtual time budget per profile (ms)")
    ap.add_argument("--outdir", default=None)
    ap.add_argument("--fps", type=int, default=0, metavar="MIN",
                    help="also run a real-time 12s probe and require >= MIN fps")
    ap.add_argument("--layout", action="store_true",
                    help="run the Phase 30 layout sweep (JSON report, "
                         "nonzero exit on violations outside allowlist)")
    args = ap.parse_args()

    chrome = find_chrome()
    if not chrome:
        print("FAIL: no Chrome/Chromium/Edge binary found")
        return 1

    outdir = args.outdir or os.path.join(ROOT, "tools", "shots")
    os.makedirs(outdir, exist_ok=True)

    if args.layout:
        return run_layout(chrome, outdir, args.budget)

    httpd, port = serve()
    failures = 0
    print("chrome: %s" % chrome)
    print("server: http://127.0.0.1:%d  (Ctrl-C after run if --keep)" % port)

    if args.fps > 0:
        # Real-time pacing (no virtual-time budget): count frames across a
        # 12s wall window via the ?probe fps beacons emitted every 5s.
        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--no-first-run",
            "--hide-scrollbars",
            "--window-size=1280,1400",
            *RUNNER_FLAGS,
            "--enable-logging=stderr",
            "--v=0",
            # NOTE: no --screenshot here — it would exit right after capture,
            # before the first 5s fps beacon. We keep the session alive and
            # kill it ourselves after the sampling window.
            "http://127.0.0.1:%d/index.html?probe=1" % port,
        ]
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL,
                                stderr=subprocess.PIPE, text=True)
        time.sleep(12)
        proc.kill()
        err = proc.communicate()[1] or ""
        import re
        fps_vals = [int(m) for m in re.findall(r"\[Mythika\] fps=(\d+)", err)]
        booted = "[Mythika] booted" in err
        uncaught = "Uncaught" in err
        best = max(fps_vals) if fps_vals else 0
        ok = booted and not uncaught and best >= args.fps
        print("%-4s fps-probe      measured=%d  (need >= %d; beacons=%s)" % (
            "PASS" if ok else "FAIL", best, args.fps, fps_vals or "none"))
        if not booted:
            print("     no boot beacon in real-time window")
        if not ok:
            failures += 1

    for (name, w, h, dpr, note) in PROFILES:
        t0 = time.time()
        ok, booted, uncaught, shot, _ = run_profile(
            chrome, port, name, w, h, dpr, note, outdir, args.budget
        )
        status = "PASS" if ok else "FAIL"
        print("%-4s %-11s %dx%d@%dx  %.1fs  shot=%s" % (
            status, name, w, h, dpr, time.time() - t0, shot))
        if not booted:
            print("     no boot beacon; note: %s" % note)
        if uncaught:
            print("     console reported an uncaught error")
        if not ok:
            failures += 1

    print("screenshots in %s" % outdir)
    if failures:
        print("RESULT: %d profile(s) FAILED" % failures)
        return 1
    print("RESULT: all %d profiles booted clean" % len(PROFILES))
    return 0


if __name__ == "__main__":
    sys.exit(main())
