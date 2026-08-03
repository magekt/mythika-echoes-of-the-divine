UI.Card = function(x, y, w, h, opts) {
  const o = opts || {};
  return {
    x, y, w, h,
    title: o.title || '',
    subtitle: o.subtitle || '',
    stats: o.stats || [],
    color: o.color || R.colors.panel,
    borderColor: o.borderColor || R.colors.panelLight,
    highlightColor: o.highlightColor || R.colors.orange,
    highlighted: false,
    visible: true,
    onClick: o.onClick || null,
    data: o.data || null,

    setStats: function(stats) {
      this.stats = stats;
    },

    setTitle: function(title, subtitle) {
      this.title = title;
      if (subtitle !== undefined) this.subtitle = subtitle;
    },

    contains: function(px, py) {
      return px >= this.x && px <= this.x + this.w &&
             py >= this.y && py <= this.y + this.h;
    },

    handleInput: function() {
      if (!this.visible) return false;
      const tap = Input.getTap();
      if (!tap) return false;
      if (this.contains(tap.x, tap.y)) {
        Audio.click();
        if (this.onClick) this.onClick(this.data);
        return true;
      }
      return false;
    },

    render: function(ctx) {
      if (!this.visible) return;
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, this.highlighted ? this.highlightColor : this.color);
      if (this.borderColor && !this.highlighted) {
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
        R.textCenter(ctx, this.title, this.x + this.w / 2, this.y + 16, R.colors.orange, R.fonts.md);
      }
      if (this.subtitle) {
        R.textCenter(ctx, this.subtitle, this.x + this.w / 2, this.y + 30, R.colors.textDim, R.fonts.sm);
      }
      let sy = this.subtitle ? this.y + 42 : this.y + 28;
      const col1 = this.stats.length <= 4 ? this.x + this.w / 2 : this.x + this.w / 4;
      const col2 = this.x + this.w * 3 / 4;
      for (let i = 0; i < this.stats.length; i++) {
        const s = this.stats[i];
        const cx = i < 4 ? col1 : col2;
        R.textCenter(ctx, s.label + ': ' + s.value, cx, sy, s.color || R.colors.text, R.fonts.sm);
        if (i === 3) { sy += 14; }
        if (i > 3) { sy += 14; }
        if (i < 3) sy += 14;
      }
    }
  };
};
