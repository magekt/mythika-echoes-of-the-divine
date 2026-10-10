/* tools/layout_harness/inject.js
 *
 * Layout-harness injector (Phase 30, Plan 30-01).
 *
 * Classic (non-module) script. Designed to load BEFORE all game scripts in a
 * generated sweep page (see tools/verify_matrix.py --layout; ordering-equivalent
 * to Playwright add_init_script). It wraps CanvasRenderingContext2D.prototype.
 * fillText so EVERY draw call is recorded (wrapping R.text alone would miss the
 * 26 raw ctx.fillText sites in travelMap.js), then calls through with identical
 * args so rendering is pixel-identical.
 *
 * Box model (see computeBoxFromCtx): width from ctx.measureText, height ~= 1.2x
 * the parsed px font size, x adjusted for ctx.textAlign, y treated as the
 * alphabetic baseline (box extends upward by h), all transformed by
 * ctx.getTransform() into game coordinates. Height is intentionally a touch
 * generous (full 1.2x above baseline): the harness errs toward reporting.
 *
 * Overlay protocol: Notify.render / Modal.render set
 * window.__layoutHarness.overlay = true on entry and clear it in a `finally`
 * block on exit (wired in Plan 30-03). Draws made while the flag is set are
 * tagged overlay:true and excluded from asserts. selfCheck() proves the flag
 * is false at frame end (leakage guard).
 *
 * Scope: intersection + canvas + active-scroll-clip containment only.
 * Panel-level containment is deferred (CONTEXT decision).
 *
 * No-op outside the harness page: prototype wrapping only happens when the
 * page URL carries ?layout=1. The __layoutHarness global is still defined so
 * the engine flag writes always land somewhere.
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Pure box math (no DOM): unit-testable via module.exports below.     */
  /* ------------------------------------------------------------------ */

  function parseFontPx(font) {
    var m = /(\d+(?:\.\d+)?)px/.exec(String(font || ''));
    return m ? parseFloat(m[1]) : 12;
  }

  function boxHeightForFont(font) {
    return parseFontPx(font) * 1.2;
  }

  function adjustX(x, w, align) {
    if (align === 'center') return x - w / 2;
    if (align === 'right' || align === 'end') return x - w;
    return x;
  }

  function applyTransform(x, y, m) {
    if (!m) return { x: x, y: y };
    return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f };
  }

  function transformScales(m) {
    if (!m) return { sx: 1, sy: 1 };
    var sx = Math.hypot(m.a, m.b);
    var sy = Math.hypot(m.c, m.d);
    return { sx: sx > 0 ? sx : 1, sy: sy > 0 ? sy : 1 };
  }

  // Rect (user-space) + transform -> game-coordinate AABB.
  function transformRect(r, m) {
    if (!m) return { x: r.x, y: r.y, w: r.w, h: r.h };
    var p1 = applyTransform(r.x, r.y, m);
    var p2 = applyTransform(r.x + r.w, r.y, m);
    var p3 = applyTransform(r.x, r.y + r.h, m);
    var p4 = applyTransform(r.x + r.w, r.y + r.h, m);
    var x0 = Math.min(p1.x, p2.x, p3.x, p4.x);
    var x1 = Math.max(p1.x, p2.x, p3.x, p4.x);
    var y0 = Math.min(p1.y, p2.y, p3.y, p4.y);
    var y1 = Math.max(p1.y, p2.y, p3.y, p4.y);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  // Read everything off a canvas ctx (or a stub with the same surface).
  function computeBoxFromCtx(text, x, y, ctx) {
    var width = 0;
    try {
      width = ctx.measureText(text).width;
    } catch (e) {
      width = String(text).length * 6;
    }
    var font = '';
    var align = 'left';
    var m = null;
    try { font = ctx.font; } catch (e) {}
    try { align = ctx.textAlign || 'left'; } catch (e) {}
    try {
      if (typeof ctx.getTransform === 'function') m = ctx.getTransform();
    } catch (e) { m = null; }
    var h = boxHeightForFont(font);
    var s = transformScales(m);
    var lx = adjustX(x, width, align);
    var base = applyTransform(lx, y, m);
    return {
      text: String(text),
      x: base.x,
      y: base.y - h * s.sy,
      w: width * s.sx,
      h: h * s.sy
    };
  }

  /* ------------------------------------------------------------------ */
  /* Harness protocol object.                                            */
  /* ------------------------------------------------------------------ */

  function createHarness() {
    return {
      overlay: false,
      frameBoxes: [],
      clipStack: [],
      currentClip: null,
      lastRect: null,
      errors: [],
      record: function (box) {
        box.overlay = !!this.overlay;
        box.clip = this.currentClip ? {
          x: this.currentClip.x, y: this.currentClip.y,
          w: this.currentClip.w, h: this.currentClip.h
        } : null;
        this.frameBoxes.push(box);
      },
      onSave: function () {
        this.clipStack.push(this.currentClip);
      },
      onRestore: function () {
        this.currentClip = this.clipStack.length ? this.clipStack.pop() : null;
      },
      onRect: function (rect) {
        this.lastRect = rect;
      },
      // rect() then clip() is the game's only clip pattern (all 6 sites);
      // promote the last rect, transformed to game coordinates.
      onClip: function (transform) {
        if (this.lastRect) {
          try {
            this.currentClip = transformRect(this.lastRect, transform);
          } catch (e) {
            this.currentClip = null;
          }
        } else {
          this.currentClip = null;
        }
      },
      // Snapshot the settled frame and reset the buffer.
      endFrame: function () {
        var snap = { boxes: this.frameBoxes.slice(), clip: this.currentClip };
        this.frameBoxes = [];
        return snap;
      },
      // Leakage guard: the overlay flag must be false at frame end.
      selfCheck: function () {
        if (this.overlay) {
          this.errors.push('overlay flag leaked at frame end');
          this.overlay = false;
          return false;
        }
        return true;
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /* Browser install.                                                    */
  /* ------------------------------------------------------------------ */

  function currentTransformOf(ctx) {
    try {
      if (typeof ctx.getTransform === 'function') return ctx.getTransform();
    } catch (e) {}
    return null;
  }

  function installOnWindow(win) {
    var H = win.__layoutHarness || createHarness();
    win.__layoutHarness = H;

    var armed = false;
    try {
      armed = !!win.location && /[?&]layout=1(?:&|$)/.test(win.location.search || '');
    } catch (e) { armed = false; }
    if (!armed) return H;
    if (H._installed) return H;
    H._installed = true;

    try {
      var proto = win.CanvasRenderingContext2D && win.CanvasRenderingContext2D.prototype;
      if (!proto) {
        H.errors.push('no CanvasRenderingContext2D prototype; wrapper not installed');
        return H;
      }
      var origFillText = proto.fillText;
      var origSave = proto.save;
      var origRestore = proto.restore;
      var origRect = proto.rect;
      var origClip = proto.clip;

      proto.fillText = function (text, x, y) {
        try {
          H.record(computeBoxFromCtx(text, x, y, this));
        } catch (e) {}
        return origFillText.apply(this, arguments);
      };
      proto.save = function () {
        try { H.onSave(); } catch (e) {}
        return origSave.apply(this, arguments);
      };
      proto.restore = function () {
        try { H.onRestore(); } catch (e) {}
        return origRestore.apply(this, arguments);
      };
      proto.rect = function (x, y, w, h) {
        try { H.onRect({ x: x, y: y, w: w, h: h }); } catch (e) {}
        return origRect.apply(this, arguments);
      };
      proto.clip = function () {
        try {
          var t = null;
          try { t = this.getTransform(); } catch (e2) {}
          H.onClip(t);
        } catch (e) {}
        return origClip.apply(this, arguments);
      };
    } catch (e) {
      try { H.errors.push('install failed: ' + (e && e.message)); } catch (e2) {}
    }
    return H;
  }

  if (typeof window !== 'undefined') {
    installOnWindow(window);
  }

  // Unit-test surface (classic scripts tolerate a guarded module export).
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseFontPx: parseFontPx,
      boxHeightForFont: boxHeightForFont,
      adjustX: adjustX,
      applyTransform: applyTransform,
      transformScales: transformScales,
      transformRect: transformRect,
      computeBoxFromCtx: computeBoxFromCtx,
      createHarness: createHarness,
      installOnWindow: installOnWindow
    };
  }
})();
