// Map card component: zone card with lock icon, dynamic height
// Used in travel map to display zone info with visual lock state

UI.MapCard = function(x, y, w, opts) {
  opts = opts || {};
  return {
    x, y, w,
    height: opts.height || 60,
    zoneId: opts.zoneId,
    label: opts.label || 'Zone',
    locked: opts.locked || false,
    lockReason: opts.lockReason || 'Locked',
    progress: opts.progress || 0,
    onClick: null,

    render: function(ctx) {
      const h = this.height;
      
      // Card background
      const r8 = Math.min(8, this.w / 2, h / 2);
      ctx.fillStyle = this.locked ? 'rgba(40,40,60,0.6)' : 'rgba(60,80,120,0.8)';
      R.roundRect(ctx, this.x, this.y, this.w, h, r8, ctx.fillStyle);

      // Card border
      ctx.strokeStyle = this.locked ? R.colors.textDim : R.colors.gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const x = this.x, y = this.y, w = this.w;
      ctx.moveTo(x + r8, y);
      ctx.lineTo(x + w - r8, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r8);
      ctx.lineTo(x + w, y + h - r8);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r8, y + h);
      ctx.lineTo(x + r8, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r8);
      ctx.lineTo(x, y + r8);
      ctx.quadraticCurveTo(x, y, x + r8, y);
      ctx.closePath();
      ctx.stroke();
      // Subtle top highlight
      if (!this.locked) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(this.x + 4, this.y + 2, this.w - 8, 1);
      }

      // Lock icon (if locked)
      if (this.locked) {
        const lockX = this.x + 12;
        const lockY = this.y + h / 2 - 6;
        ctx.fillStyle = R.colors.danger;
        ctx.font = R.fonts.lg;
        ctx.textAlign = 'center';
        ctx.fillText('🔒', lockX + 4, lockY + 10);
      }

      // Zone label
      ctx.fillStyle = this.locked ? R.colors.textDim : R.colors.gold;
      ctx.font = R.fonts.md;
      ctx.textAlign = 'left';
      const labelX = this.locked ? this.x + 32 : this.x + 12;
      ctx.fillText(this.label, labelX, this.y + h / 2 + 5);

      // Progress bar (if unlocked)
      if (!this.locked && this.progress > 0) {
        const barW = this.w - 24;
        const barH = 4;
        const barX = this.x + 12;
        const barY = this.y + h - 12;
        ctx.fillStyle = 'rgba(100,100,120,0.5)';
        R.roundRect(ctx, barX, barY, barW, barH, 2, ctx.fillStyle);
        const progW = barW * (this.progress / 100);
        ctx.fillStyle = R.colors.gold;
        R.roundRect(ctx, barX, barY, progW, barH, 2, ctx.fillStyle);
      }
    },

    contains: function(px, py) {
      return px >= this.x && px <= this.x + this.w &&
             py >= this.y && py <= this.y + this.height;
    }
  };
};
