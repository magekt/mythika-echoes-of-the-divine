UI.Text = function(x, y, text, color, font, align) {
  return {
    x, y, text, color: color || R.colors.text,
    font: font || R.fonts.md, align: align || 'left',
    visible: true,

    setText: function(t) { this.text = t; },

    render: function(ctx) {
      if (!this.visible) return;
      const fn = this.align === 'center' ? R.textCenter : R.text;
      fn(ctx, this.text, this.x, this.y, this.color, this.font);
    }
  };
};

UI.TextTitle = function(x, y, text) {
  return UI.Text(x, y, text, R.colors.gold, R.fonts.xl, 'center');
};

UI.TextBody = function(x, y, text) {
  return UI.Text(x, y, text, R.colors.text, R.fonts.sm);
};

UI.TextDim = function(x, y, text) {
  return UI.Text(x, y, text, R.colors.textDim, R.fonts.sm);
};

UI.TextGold = function(x, y, text) {
  return UI.Text(x, y, text, R.colors.gold, R.fonts.md, 'center');
};

UI.TextSection = function(x, y, text) {
  return UI.Text(x, y, text, R.colors.gold, R.fonts.lg, 'left');
};
