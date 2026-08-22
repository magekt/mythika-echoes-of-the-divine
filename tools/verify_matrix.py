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
import http.server
import os
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

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    shutil.which("google-chrome"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]


def find_chrome():
    for c in CHROME_CANDIDATES:
        if c and os.path.exists(c):
            return c
    return None


def serve():
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, fmt, *args2):
            pass

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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--budget", type=int, default=6000,
                    help="virtual time budget per profile (ms)")
    ap.add_argument("--outdir", default=None)
    ap.add_argument("--fps", type=int, default=0, metavar="MIN",
                    help="also run a real-time 12s probe and require >= MIN fps")
    args = ap.parse_args()

    chrome = find_chrome()
    if not chrome:
        print("FAIL: no Chrome/Chromium/Edge binary found")
        return 1

    outdir = args.outdir or os.path.join(ROOT, "tools", "shots")
    os.makedirs(outdir, exist_ok=True)

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
