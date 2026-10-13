// Wordmark component: centered logo with footer text
// Used in title scene and potentially in other branded contexts

UI.Wordmark = function(x, y, options) {
  options = options || {};
  return {
    x, y,
    width: options.width || 200,
    height: options.height || 80,
    title: options.title || 'MYTHIKA',
    footer: options.footer || 'Mount Meru',
    glowBlur: options.glowBlur || 24,
    
    render: function(ctx) {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      // Title text with glow
      ctx.shadowColor = R.colors.orange;
      ctx.shadowBlur = this.glowBlur;
      ctx.font = R.fonts.display;
      ctx.fillStyle = R.colors.gold;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.title, cx, cy - 12);
      
      // Footer text below
      ctx.shadowBlur = 0;
      ctx.font = R.fonts.sm;
      ctx.fillStyle = R.colors.textDim;
      ctx.fillText(this.footer, cx, cy + 20);
    },
    
    contains: function(px, py) {
      return px >= this.x && px <= this.x + this.width &&
             py >= this.y && py <= this.y + this.height;
    }
  };
};
