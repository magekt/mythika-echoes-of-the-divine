UI.ProgressBar = function(x, y, w, h, color, bgColor) {
  return {
    x, y, w, h,
    color: color || R.colors.gold,
    bgColor: bgColor || R.colors.borderHairline,
    value: 0,
    maxValue: 100,
    showText: false,
    text: '',
    textColor: R.colors.textPrimary,

    setProgress: function(val, max) {
      this.value = val;
      this.maxValue = max || 1;
    },

    render: function(ctx) {
      const r = 4; // 4px radius for 8px height bar
      // Background track with borderHairline
      R.roundRect(ctx, this.x, this.y, this.w, this.h, r, this.bgColor);
      
      // Subtle border
      ctx.strokeStyle = R.colors.borderHairline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x + r, this.y);
      ctx.lineTo(this.x + this.w - r, this.y);
      ctx.quadraticCurveTo(this.x + this.w, this.y, this.x + this.w, this.y + r);
      ctx.lineTo(this.x + this.w, this.y + this.h - r);
      ctx.quadraticCurveTo(this.x + this.w, this.y + this.h, this.x + this.w - r, this.y + this.h);
      ctx.lineTo(this.x + r, this.y + this.h);
      ctx.quadraticCurveTo(this.x, this.y + this.h, this.x, this.y + this.h - r);
      ctx.lineTo(this.x, this.y + r);
      ctx.quadraticCurveTo(this.x, this.y, this.x + r, this.y);
      ctx.closePath();
      ctx.stroke();
      
      // Fill with solid gold color (no gradient per design spec)
      const pct = this.maxValue > 0 ? Math.max(0, Math.min(1, this.value / this.maxValue)) : 0;
      if (pct > 0) {
        const fillW = (this.w - 2) * pct;
        R.roundRect(ctx, this.x + 1, this.y + 1, fillW, this.h - 2, Math.max(0, r - 1), this.color);
      }
      
      if (this.showText) {
        const t = this.text || Math.floor(this.value) + '/' + Math.floor(this.maxValue);
        R.textCenter(ctx, t, this.x + this.w / 2, this.y + this.h / 2 + 4, this.textColor, R.fonts.sm);
      }
    }
  };
};

UI.HPBar = function(x, y, w) {
  return UI.ProgressBar(x, y, w, 10, R.colors.hp);
};

UI.MPBar = function(x, y, w) {
  return UI.ProgressBar(x, y, w, 10, R.colors.mp);
};

UI.XPBar = function(x, y, w) {
  return UI.ProgressBar(x, y, w, 10, R.colors.exp);
};