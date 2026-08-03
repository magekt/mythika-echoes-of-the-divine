UI.Panel = function(x, y, w, h, color, borderColor) {
  return {
    x, y, w, h,
    color: color || R.colors.panel,
    borderColor: borderColor || R.colors.panelLight,
    visible: true,
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

    render: function(ctx) {
      if (!this.visible) return;
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, this.color);
      if (this.borderColor) {
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const r = 6, x = this.x, y = this.y, w = this.w, h = this.h;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.stroke();
      }
      if (this.title) {
        R.textCenter(ctx, this.title.text, this.x + this.w / 2, this.y + 16, this.title.color, R.fonts.lg);
      }
      for (const c of this.children) {
        if (c.render) c.render(ctx);
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
