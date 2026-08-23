const titleScene = Scene.create({
  name: 'title',
  data: {
    buttons: [],
    particles: [],
    titleY: -100
  },

  enter: function() {
    Audio.playMusic('title');
    this.data.particles = [];
    for (let i = 0; i < 30; i++) {
      this.data.particles.push({
        x: Math.random() * G.W, y: Math.random() * G.H,
        vx: (Math.random() - 0.5) * 0.5, vy: -0.3 - Math.random() * 0.5,
        size: 1 + Math.random() * 2, alpha: 0.3 + Math.random() * 0.7,
        color: Math.random() < 0.5 ? R.colors.orange : R.colors.blue
      });
    }
    this.data.titleY = -100;
    // First-ever visit earns the full cinematic (1.6s); every later visit
    // keeps the brisk 900ms settle. Flag persists with the save.
    if (!G.state.flags) G.state.flags = {};
    this.data._enterDur = G.state.flags.titleSeen ? 0.9 : 1.6;
    this.data._enterT = 0;
    this.data.buttons = [];
    const bw = 200, bh = 38;
    const cx = G.W / 2 - bw / 2;
    const newBtn = UI.BtnGold(cx, 380, bw, bh, 'New Game');
    newBtn.onClick = function() { gScene('characterCreate', true); };
    this.data.buttons.push(newBtn);

    if (SaveSystem.hasSave()) {
      const loadBtn = UI.BtnGold(cx, 430, bw, bh, 'Continue');
      loadBtn.onClick = function() {
        SaveSystem.load();
        gScene('ashram', true);
      };
      this.data.buttons.push(loadBtn);
    }
  },

  update: function(dt) {
    // Ease-out settle: fast arrival, soft landing — 1.6s cinematic on the
    // first-ever visit, 900ms afterwards. Instant under Reduce Motion.
    if (G.state.reduceMotion) {
      this.data.titleY = 60;
      G.state.flags.titleSeen = true;
    } else {
      const dur = this.data._enterDur || 0.9;
      this.data._enterT = Math.min(dur, (this.data._enterT || 0) + dt);
      const ep = this.data._enterT / dur;
      const eased = 1 - Math.pow(1 - ep, 3);
      this.data.titleY = -100 + 160 * eased;
      if (ep >= 1) G.state.flags.titleSeen = true;
    }
    // Reduce Motion: particles render as a static starfield (no drift loop).
    if (!G.state.reduceMotion) {
      for (const p of this.data.particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = G.H + 10; p.x = Math.random() * G.W; }
      }
    }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons);
  },

  render: function(ctx) {
    for (const p of this.data.particles) {
      ctx.globalAlpha = p.alpha;
      R.rect(ctx, p.x, p.y, p.size, p.size, p.color);
    }
    ctx.globalAlpha = 1;

    const ty = Math.floor(this.data.titleY);
    // Bake the glowing wordmark once (lazy: needs G.dpr, set after boot) —
    // canvas shadowBlur per frame is a needless cost on low-end GPUs. One
    // drawImage blit per frame instead.
    if (!this.data.titleSprite && typeof document !== 'undefined' && G.dpr) {
      const spr = document.createElement('canvas');
      spr.width = 208 * G.dpr;
      spr.height = 72 * G.dpr;
      const sc = spr.getContext('2d');
      sc.scale(G.dpr, G.dpr);
      sc.shadowColor = R.colors.orange;
      sc.shadowBlur = 25;
      R.pixelText(sc, 'MYTHIKA', 20, 18, R.colors.gold, 6);
      this.data.titleSprite = spr;
    }
    if (this.data.titleSprite) {
      ctx.drawImage(this.data.titleSprite, G.W / 2 - 104, ty - 18, 208, 72);
    } else {
      ctx.shadowColor = R.colors.orange;
      ctx.shadowBlur = 25;
      R.pixelText(ctx, 'MYTHIKA', G.W / 2 - 80, ty, R.colors.gold, 6);
      ctx.shadowBlur = 0;
    }

    R.textCenter(ctx, 'Echoes of the Divine', G.W / 2, ty + 50, R.colors.textDim, R.fonts.md);
    R.drawEnemy(ctx, 'dragon', G.W / 2, ty + 100, 40, false);
    R.textCenter(ctx, 'Mount Meru', G.W / 2, ty + 155, R.colors.textDim, R.fonts.sm);

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);

    const ver = UI.TextDim(G.W / 2, G.H - 30, 'v1.0 - A Mythic Idle RPG');
    ver.render(ctx);
  }
});
