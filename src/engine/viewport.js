/* src/engine/viewport.js
 *
 * Phase 42 adaptive fill viewport core (Plan 42-01):
 * pure logical-viewport math + DPR backing helper.
 *
 * Classic script (no modules/exports syntax): loads via <script> before
 * game.js in index.html and attaches to globalThis. require()-able in
 * Node — no DOM/browser-global reads at load time.
 */
(function (root) {
  'use strict';

  function clampInt(v, lo, hi) {
    v = Math.round(v);
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
  }

  function num(v, fb) {
    v = Number(v);
    return (typeof v === 'number' && isFinite(v)) ? v : fb;
  }

  // LOCKED branch rule (42-01): desktop iff NOT (vw < 600 || vh < 500);
  // portrait iff vw <= vh, else landscape. Safe-area insets shrink the
  // usable area BEFORE the math; vw/vh clamped to >= 1; dpr capped at 3.
  // Portrait: W=400, H=clamp(round(400*uh/uw),400,1000).
  // Landscape: H=400, W=clamp(round(400*uw/uh),400,1000).
  function computeViewportDims(vw, vh, dpr, safe) {
    var s = safe || {};
    var uw = Math.max(1, num(vw, 400) - num(s.l, 0) - num(s.r, 0));
    var uh = Math.max(1, num(vh, 720) - num(s.t, 0) - num(s.b, 0));
    var d = num(dpr, 1);
    if (!(d > 0)) d = 1;
    if (d > 3) d = 3;
    var isPhone = (uw < 600 || uh < 500);
    if (!isPhone) return { W: 400, H: 720, dpr: d, mode: 'desktop' };
    if (uw <= uh) {
      return { W: 400, H: clampInt(400 * uh / uw, 400, 1000), dpr: d, mode: 'phone-portrait' };
    }
    return { W: clampInt(400 * uw / uh, 400, 1000), H: 400, dpr: d, mode: 'phone-landscape' };
  }

  // Back a canvas at device resolution. No DOM reads inside (testable):
  // caller passes the resolved logical size + dpr.
  function initDprBacking(canvas, W, H, dpr) {
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  if (typeof window !== 'undefined' || typeof globalThis !== 'undefined') {
    root.computeViewportDims = computeViewportDims;
    root.initDprBacking = initDprBacking;
    root.Viewport = { compute: computeViewportDims, initBacking: initDprBacking };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
