// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

/**
 * Panel component using UI.Component + mixins.
 * Double-bezel shell via R.doubleBezel, enter animation via R.easePremium.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} [color]
 * @param {string} [borderColor]
 * @returns {object}
 */
UI.Panel = function(x, y, w, h, color, borderColor) {
  const panel = UI.Component(x, y, w, h, {
    color: color || R.colors.panel,
    borderColor: borderColor || R.colors.panelLight,
    visible: true,
    enterProgress: 0,
    children: [],
    title: null,
    closeBtn: null,

    setTitle: function(text, titleColor) {
      this.title = { text, color: titleColor || R.colors.orange };
    },

    addChild: function(child) {
      this.children.push(child);
    },

    clear: function() {
      this.children = [];
    },

    handleInput: function() {
      if (!this.visible) return false;
      const all = [];
      if (this.closeBtn) all.push(this.closeBtn);
      for (const c of this.children) {
        if (c.contains) all.push(c);
      }
      return UI.handleButtons(all);
    }
  });

  // Update hook: drives enterProgress with R.easePremium easing
  panel._updateHook = function(dt, p) {
    if (R.reducedMotion && R.reducedMotion()) {
      p.enterProgress = 1;
      return;
    }
    // Linear progress, eased at render time via R.easePremium
    p.enterProgress = Math.min(1, p.enterProgress + (dt || 0) / 0.25);
  };

  // Render hook: double-bezel shell with eased alpha, title, children at full opacity
  panel._renderHook = function(ctx, p) {
    if (!p.visible) return;
    // Phase 48 — outer shell + inset-highlight inner core (Doppelrand).
    const alpha = R.easePremium(p.enterProgress);
    ctx.globalAlpha = alpha;
    R.doubleBezel(ctx, p.x, p.y, p.w, p.h, {
      shellFill: p.color || R.colors.surfaceElevated,
      shellStroke: p.borderColor || R.colors.hairline,
      radius: R.radius.m,
    });
    if (p.title) {
      R.textCenter(ctx, p.title.text, p.x + p.w / 2, p.y + 16, p.title.color, R.fonts.lg);
    }
    ctx.globalAlpha = 1;
    // Children manage their own alpha (buttons), so render at full opacity.
    for (const child of p.children) {
      if (child.render) child.render(ctx);
    }
    if (p.closeBtn) p.closeBtn.render(ctx);
  };

  // Contains with radius awareness
  UI.mixinContains(panel, 'm');

  return panel;
};

/**
 * Dialog component — a Panel with text content and a close button.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} title
 * @param {string} text
 * @returns {object}
 */
UI.Dialog = function(x, y, w, h, title, text) {
  const d = UI.Panel(x, y, w, h);
  d.setTitle(title);
  const lines = text.split('\n');
  let ty = y + 36;
  for (const line of lines) {
    const t = { render: function(ctx) { R.textCenter(ctx, line, d.x + d.w / 2, ty, R.colors.text, R.fonts.sm); } };
    d.addChild({ render: t.render });
    ty += 18;
  }
  const closeBtn = UI.Button(x + w / 2 - 40, y + h - 32, 80, 24, 'Close');
  closeBtn.onClick = function() { d.visible = false; };
  d.closeBtn = closeBtn;
  return d;
};