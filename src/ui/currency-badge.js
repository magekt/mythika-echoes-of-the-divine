// Currency badge component: displays gold amount with coin icon
// Used in Ashram and other scenes to show player's gold

UI.CurrencyBadge = function(x, y, opts) {
  opts = opts || {};
  return {
    x, y,
    width: opts.width || 100,
    height: opts.height || 32,
    amount: opts.amount || 0,
    color: opts.color || R.colors.gold,
    icon: opts.icon || '💰',

    render: function(ctx) {
      // Background
      ctx.fillStyle = 'rgba(60,60,80,0.5)';
      R.roundRect(ctx, this.x, this.y, this.width, this.height, 4, ctx.fillStyle);

      // Border
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const r = 4, x = this.x, y = this.y, w = this.width, h = this.height;
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

      // Coin icon
      ctx.font = R.fonts.lg;
      ctx.textAlign = 'center';
      ctx.fillStyle = this.color;
      ctx.fillText(this.icon, this.x + 16, this.y + this.height / 2 + 5);

      // Amount text
      ctx.font = R.fonts.md;
      ctx.textAlign = 'left';
      ctx.fillStyle = this.color;
      ctx.fillText(this.amount.toString(), this.x + 32, this.y + this.height / 2 + 5);
    },

    contains: function(px, py) {
      return px >= this.x && px <= this.x + this.width &&
             py >= this.y && py <= this.y + this.height;
    }
  };
};
