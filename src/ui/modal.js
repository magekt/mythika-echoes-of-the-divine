// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

UI.Modal = UI.Modal || {};
UI.Modal.active = null;
UI.Modal.queue = [];
UI.Modal._ghost = null;

// Dialogs are scene-local: a confirmation must never follow the player into
// another screen (it would gate that scene's update forever). Called on
// every scene transition.
UI.Modal.clearAll = function() {
  UI.Modal.active = null;
  UI.Modal.queue = [];
  UI.Modal._ghost = null;
};

/**
 * Creates a modal component using UI.Component + mixins.
 * @param {object} opts
 * @returns {object}
 */
UI.Modal.create = function(opts) {
  // Canvas fillText ignores "\n" — fold multi-line bodies into wrapped lines.
  let body = opts.body || '';
  let lines = opts.lines || [];
  if (body.indexOf('\n') !== -1) {
    lines = body.split('\n').concat(lines);
    body = '';
  }

  const m = UI.Component(opts.x || 40, opts.y || 200, opts.w || 320, opts.h || 200, {
    title: opts.title || '',
    body: body,
    lines: lines,
    buttons: opts.buttons || [{ label: 'OK', primary: true }],
    onResult: opts.onResult || null,
    buttonHeight: opts.buttonHeight || 32,
    visible: true,
    _created: 0,
    _overlayProgress: 0,
    _btnProgress: [],
    _buttonList: [],
    _openedAt: 0,
    color: opts.color || R.colors.panel,
    borderColor: opts.borderColor || R.colors.hairline,
    _buildButtons: function() {
      this._buttonList = [];
      const bw = Math.min(140, (this.w - 40) / Math.max(1, this.buttons.length));
      const totalW = this.buttons.length * bw + (this.buttons.length - 1) * 10;
      let bx = this.x + (this.w - totalW) / 2;
      const by = this.y + this.h - this.buttonHeight - 12;
      for (let i = 0; i < this.buttons.length; i++) {
        const btnDef = this.buttons[i];
        const btn = UI.Button(bx, by, bw, this.buttonHeight, btnDef.label, btnDef.primary ? R.colors.btnGold : R.colors.btn);
        btn._modalResult = btnDef.value !== undefined ? btnDef.value : i;
        btn.onClick = function() {
          UI.Modal.dismiss(btn._modalResult);
        };
        this._buttonList.push(btn);
        bx += bw + 10;
      }
    }
  });

  m._buildButtons();
  m._openedAt = performance.now();

  // Assign instance hooks (UI.Component pattern)
  m._updateHook = UI.Modal._updateHook;
  m._renderHook = UI.Modal._renderHook;

  return m;
};

// Update hook: drives enter animation progress
UI.Modal._updateHook = function(dt, m) {
  // Phase 48 — PAN-04: reduced-motion is media-aware (checks G.state.reduceMotion
  // AND prefers-reduced-motion) via R.reducedMotion().
  const reduceMotion = R.reducedMotion();

  // Drive enter progress on first render (no external update hook).
  if (!m._created) m._created = performance.now();

  if (reduceMotion) {
    m._overlayProgress = 1;
    for (let i = 0; i < m.buttons.length; i++) m._btnProgress[i] = 1;
  } else {
    m._overlayProgress = Math.min(1, (performance.now() - m._created) / 250);

    // Phase 48 — PAN-03: 40ms stagger cascade (button[0] at 0, button[1] at 40ms…).
    const btnDelayMs = 40;
    for (let i = 0; i < m.buttons.length; i++) {
      const startDelayMs = 250 + i * btnDelayMs;
      m._btnProgress[i] = Math.max(0, Math.min(1, (performance.now() - m._created - startDelayMs) / 400));
    }
  }

  // Update buttons
  for (const btn of m._buttonList) {
    if (btn.update) btn.update(dt);
  }
};

// Render hook: shared painter for overlay + panel + content
UI.Modal._renderHook = function(ctx, m) {
  if (!ctx) return;
  if (typeof window !== 'undefined' && window.__layoutHarness) window.__layoutHarness.overlay = true;
  try {
    const reduceMotion = R.reducedMotion();

    // Enter: fade + scale 0.96->1 over 120ms (easeOutCubic) so dialogs arrive,
    // not flash. Skipped under reduced motion.
    let e = 1;
    if (!reduceMotion && m._openedAt) {
      const t = Math.min(1, (performance.now() - m._openedAt) / 120);
      e = 1 - Math.pow(1 - t, 3);
    }
    const alpha = e;
    const scale = 0.96 + 0.04 * e;

    ctx.save();
    // Phase 48 — PAN-02: overlay backdrop alpha interpolates (not instant).
    const overlayAlpha = m._overlayProgress !== undefined ? m._overlayProgress : 1;
    ctx.globalAlpha = alpha * R.easePremium(overlayAlpha);
    ctx.fillStyle = R.colors.overlay;
    ctx.fillRect(0, 0, G.W, G.H);
    const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    // Phase 48 — nested-shell panel (Doppelrand) via R.doubleBezel.
    R.doubleBezel(ctx, m.x, m.y, m.w, m.h, {
      shellFill: m.color || R.colors.panel,
      shellStroke: m.borderColor || R.colors.hairline,
      radius: R.radius.l,
    });
    R.textCenter(ctx, m.title, m.x + m.w / 2, m.y + 28, R.colors.orange, R.fonts.md);
    if (m.body) {
      R.textCenter(ctx, m.body, m.x + m.w / 2, m.y + 56, R.colors.text, R.fonts.sm);
    }
    let ly = m.y + 56;
    for (const line of m.lines) {
      ly += 18;
      R.textCenter(ctx, line, m.x + m.w / 2, ly, R.colors.textDim, R.fonts.sm);
    }
    // Phase 48 — PAN-03: 40ms stagger cascade for buttons.
    for (let i = 0; i < m._buttonList.length; i++) {
      const b = m._buttonList[i];
      const bp = m._btnProgress ? m._btnProgress[i] : 1;
      ctx.globalAlpha = R.easePremium(bp);
      b.render(ctx);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  } finally { if (typeof window !== 'undefined' && window.__layoutHarness) window.__layoutHarness.overlay = false; }
};

UI.Modal.show = function(opts) {
  if (typeof Audio !== 'undefined' && Audio.modalOpen) Audio.modalOpen();
  const m = UI.Modal.create(opts);
  UI.Modal.queue.push(m);
  if (!UI.Modal.active) UI.Modal.active = UI.Modal.queue.shift();
  return m;
};

UI.Modal.dismiss = function(result) {
  if (UI.Modal.active) {
    const cb = UI.Modal.active.onResult;
    // Keep a ghost that fades out over 100ms so the dialog dissolves instead
    // of vanishing (exits subtler than enters). The callback fires now — only
    // the pixels linger. Skipped under Reduce Motion.
    UI.Modal.active._closedAt = performance.now();
    UI.Modal._ghost = UI.Modal.active;
    UI.Modal.active.visible = false;
    UI.Modal.active = null;
    if (cb) cb(result);
  }
  if (UI.Modal.queue.length > 0) {
    UI.Modal.active = UI.Modal.queue.shift();
    UI.Modal.active._openedAt = performance.now();
    // A replacement dialog covers continuity; drop the old ghost.
    UI.Modal._ghost = null;
  }
};

UI.Modal.handleInput = function() {
  if (!UI.Modal.active || !UI.Modal.active.visible) return false;
  return UI.handleButtons(UI.Modal.active._buttonList);
};

// Global update for active modal (called from game loop)
UI.Modal.update = function(dt) {
  // Update ghost if present
  const g = UI.Modal._ghost;
  if (g) {
    const reduceMotion = R.reducedMotion();
    const t = Math.max(0, Math.min(1, (performance.now() - g._closedAt) / 100));
    if (reduceMotion || t >= 1) {
      UI.Modal._ghost = null;
    } else {
      g._alpha = R.easePremium(1 - t);
      g._scale = 1;
    }
  }

  // Update active modal
  if (UI.Modal.active && UI.Modal.active.visible) {
    if (UI.Modal.active._updateHook) UI.Modal.active._updateHook(dt, UI.Modal.active);
  }
};

// Global render for modal system
UI.Modal.render = function(ctx) {
  // Render ghost first (dissolving)
  const g = UI.Modal._ghost;
  if (g) {
    const reduceMotion = R.reducedMotion();
    if (!reduceMotion) {
      g._alpha = g._alpha || 1;
      g._scale = g._scale || 1;
      UI.Modal._paint(ctx, g);
    }
  }
  // Render active modal
  if (UI.Modal.active && UI.Modal.active.visible) {
    if (UI.Modal.active._renderHook) UI.Modal.active._renderHook(ctx, UI.Modal.active);
  }
};

// Shared painter for overlay + panel + content (used by ghost and active)
UI.Modal._paint = function(ctx, m) {
  if (!ctx) return;
  ctx.save();
  // Phase 48 — PAN-02: overlay backdrop alpha interpolates (not instant).
  const overlayAlpha = m._overlayProgress !== undefined ? m._overlayProgress : 1;
  ctx.globalAlpha = (m._alpha !== undefined ? m._alpha : 1) * R.easePremium(overlayAlpha);
  ctx.fillStyle = R.colors.overlay;
  ctx.fillRect(0, 0, G.W, G.H);
  const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
  const s = m._scale || 1;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  // Phase 48 — nested-shell panel (Doppelrand) via R.doubleBezel.
  R.doubleBezel(ctx, m.x, m.y, m.w, m.h, {
    shellFill: m.color || R.colors.panel,
    shellStroke: m.borderColor || R.colors.hairline,
    radius: R.radius.l,
  });
  R.textCenter(ctx, m.title, m.x + m.w / 2, m.y + 28, R.colors.orange, R.fonts.md);
  if (m.body) {
    R.textCenter(ctx, m.body, m.x + m.w / 2, m.y + 56, R.colors.text, R.fonts.sm);
  }
  let ly = m.y + 56;
  for (const line of m.lines) {
    ly += 18;
    R.textCenter(ctx, line, m.x + m.w / 2, ly, R.colors.textDim, R.fonts.sm);
  }
  // Phase 48 — PAN-03: 40ms stagger cascade for buttons.
  for (let i = 0; i < m._buttonList.length; i++) {
    const b = m._buttonList[i];
    const bp = m._btnProgress ? m._btnProgress[i] : 1;
    ctx.globalAlpha = R.easePremium(bp);
    b.render(ctx);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
};

UI.Modal.confirm = function(title, body, onConfirm, options) {
  const o = options || {};
  return UI.Modal.show({
    title: title,
    body: body,
    buttons: [
      { label: 'Cancel', value: false },
      { label: 'Confirm', value: true, primary: true }
    ],
    onResult: function(result) { if (onConfirm) onConfirm(result); },
    buttonHeight: o.buttonHeight,
    h: o.h,
    x: o.x,
    y: o.y,
    w: o.w
  });
};

UI.Modal.alert = function(title, body) {
  return UI.Modal.show({
    title: title,
    body: body,
    buttons: [{ label: 'OK', value: true, primary: true }]
  });
};

// Backwards compatibility: expose _updateHook and _renderHook on active modal pattern
// (Some code may call UI.Modal.update/render directly)