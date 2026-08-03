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
    if (this.data.titleY < 60) this.data.titleY += 60 * dt;
    for (const p of this.data.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = G.H + 10; p.x = Math.random() * G.W; }
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
    ctx.shadowColor = R.colors.orange;
    ctx.shadowBlur = 25;
    R.pixelText(ctx, 'MYTHIKA', G.W / 2 - 80, ty, R.colors.gold, 6);
    ctx.shadowBlur = 0;

    R.textCenter(ctx, 'Echoes of the Divine', G.W / 2, ty + 50, R.colors.textDim, R.fonts.md);
    R.drawEnemy(ctx, 'dragon', G.W / 2, ty + 100, 40);
    R.textCenter(ctx, 'Mount Meru', G.W / 2, ty + 155, R.colors.textDim, R.fonts.sm);

    for (const b of this.data.buttons) b.render(ctx);

    const ver = UI.TextDim(G.W / 2, G.H - 30, 'v1.0 - A Mythic Idle RPG');
    ver.render(ctx);
  }
});
