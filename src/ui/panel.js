UI.Panel = function(x, y, w, h, color, borderColor) {
  return {
    x, y, w, h,
    color: color || R.colors.panel,
    borderColor: borderColor || R.colors.panelLight,
    visible: true,
    enterProgress: 0,
    children: [],
    title: null,
    closeBtn: null,

    setTitle: function(text, color) {
      this.title = { text, color: color || R.colors.orange };
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
    },

    update: function(dt) {
      if (R.reducedMotion()) {
        this.enterProgress = 1;
        return;
      }
      this.enterProgress = Math.min(1, this.enterProgress + (dt || 0) / 0.25);
    },

    render: function(ctx) {
      if (!this.visible) return;
      // Phase 48 — outer shell + inset-highlight inner core (Doppelrand).
      const alpha = R.easePremium(this.enterProgress);
      ctx.globalAlpha = alpha;
      R.doubleBezel(ctx, this.x, this.y, this.w, this.h, {
        shellFill: this.color || R.colors.surfaceElevated,
        shellStroke: this.borderColor || R.colors.hairline,
        radius: R.radius.m,
      });
      if (this.title) {
        R.textCenter(ctx, this.title.text, this.x + this.w / 2, this.y + 16, this.title.color, R.fonts.lg);
      }
      ctx.globalAlpha = 1;
      // Children manage their own alpha (buttons), so render at full opacity.
      for (const child of this.children) {
        if (child.render) child.render(ctx);
      }
      if (this.closeBtn) this.closeBtn.render(ctx);
    },

    contains: function(px, py) {
      return px >= this.x && px <= this.x + this.w &&
             py >= this.y && py <= this.y + this.h;
    }
  };
};

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
