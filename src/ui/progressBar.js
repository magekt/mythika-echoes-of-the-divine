UI.ProgressBar = function(x, y, w, h, color, bgColor) {
  return {
    x, y, w, h,
    color: color || R.colors.orange,
    bgColor: bgColor || '#0a0a1a',
    value: 0,
    maxValue: 100,
    showText: true,
    text: '',
    textColor: R.colors.white,

    setProgress: function(val, max) {
      this.value = val;
      this.maxValue = max || 1;
    },

    render: function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, R.radius.xs, this.bgColor);
      ctx.strokeStyle = R.colors.blueDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const r = 3, x = this.x, y = this.y, w = this.w, h = this.h;
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.stroke();
      const pct = this.maxValue > 0 ? Math.max(0, Math.min(1, this.value / this.maxValue)) : 0;
      if (pct > 0) {
        const fillW = (this.w - 2) * pct;
        const grad = ctx.createLinearGradient(this.x, this.y, this.x + fillW, this.y);
        grad.addColorStop(0, R.colors.orange);
        grad.addColorStop(1, R.colors.orangeLight);
        R.roundRect(ctx, this.x + 1, this.y + 1, fillW, this.h - 2, 2, grad);
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
