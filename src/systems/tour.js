// First-battle guided tour system
// Fires on zoneExploration enter() when this is the player's first combat.

const TourSystem = {
  active: null,
  step: 0,

  CALLS: [
    "Tap the enemy to begin your first battle",
    "Tap Attack to strike the enemy on your turn",
    "Turns alternate — watch the turn indicator",
    "Claim your rewards when the battle ends",
    "Explore the zone to find more encounters"
  ],

  start: function(tourId) {
    if (tourId !== 'firstBattle') return false;
    if (G.state.tourSeen && G.state.tourSeen.firstBattle) return false;
    if ((G.state.combatCount || 0) > 0) return false;
    this.active = tourId;
    this.step = 0;
    return true;
  },

  stop: function() {
    this.active = null;
    this.step = 0;
  },

  advance: function() {
    if (!this.active) return;
    this.step++;
    if (this.step >= this.CALLS.length) {
      G.state.tourSeen = G.state.tourSeen || {};
      G.state.tourSeen.firstBattle = true;
      this.stop();
    }
  },

  isActive: function() {
    return !!this.active;
  },

  render: function(ctx) {
    if (!this.isActive()) return;
    const text = this.CALLS[this.step];
    ctx.font = R.fonts.sm;
    const tw = ctx.measureText(text).width;
    const pad = 16, h = 44;
    const w = tw + pad * 2;
    const x = G.W / 2 - w / 2;
    const y = 84;

    R.roundRect(ctx, x, y, w, h, 8, 'rgba(18,18,40,0.92)');
    ctx.strokeStyle = R.colors.orange;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const r = Math.min(8, w / 2, h / 2);
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

    ctx.fillStyle = R.colors.gold;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, G.W / 2, y + h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
};
