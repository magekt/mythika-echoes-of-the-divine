const welcomeScene = Scene.create({
  name: 'welcome',
  data: {
    buttons: [],
    particles: [],
    introText: 'In the age of myths,\nthe divine echoed across the heavens\u2026\n\nNow only embers remain.\nMount Meru awaits a new legend.\n\nYou are the seeker.\nYour journey begins.',
    introChars: 0,
    introTimer: 0,
    introSpeed: 0.035,
    introDone: false
  },

  enter: function() {
    this.data.introChars = 0;
    this.data.introTimer = 0;
    this.data.introDone = false;
    this.data.particles = [];
    for (let i = 0; i < 40; i++) {
      this.data.particles.push({
        x: Math.random() * G.W, y: Math.random() * G.H,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.2 - Math.random() * 0.3,
        size: 1 + Math.random() * 2, alpha: 0.2 + Math.random() * 0.5
      });
    }
    this.data.buttons = [];
  },

  update: function(dt) {
    for (const p of this.data.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = G.H + 10; p.x = Math.random() * G.W; }
    }
    this.data.introTimer += dt;
    if (this.data.introTimer >= this.data.introSpeed) {
      this.data.introTimer = 0;
      if (this.data.introChars < this.data.introText.length) {
        this.data.introChars++;
      } else {
        this.data.introDone = true;
      }
    }
    const tap = Input.getTap();
    if (tap) {
      if (this.data.introChars < this.data.introText.length) {
        this.data.introChars = this.data.introText.length;
        this.data.introDone = true;
      } else if (this.data.introDone) {
        Audio.menuSwoosh();
        gScene('ashram');
      }
    }
  },

  render: function(ctx) {
    for (const p of this.data.particles) {
      ctx.globalAlpha = p.alpha * 0.35;
      R.rect(ctx, p.x, p.y, p.size, p.size, '#e8a030');
    }
    ctx.globalAlpha = 1;

    const shown = this.data.introText.substring(0, this.data.introChars);
    const lines = shown.split('\n');
    const blockH = lines.length * 24;
    const startY = (G.H - blockH) / 2;
    for (let i = 0; i < lines.length; i++) {
      const isLast = i === lines.length - 1 && !this.data.introDone;
      ctx.globalAlpha = isLast ? 0.8 : 1;
      R.textCenter(ctx, lines[i] || ' ', G.W / 2, startY + i * 24,
        i < lines.length - 1 ? R.colors.textDim : R.colors.orange,
        i < lines.length - 1 ? R.fonts.sm : R.fonts.md);
    }
    ctx.globalAlpha = 1;

    const progress = this.data.introChars / this.data.introText.length;
    ctx.fillStyle = 'rgba(48,128,200,0.3)';
    ctx.fillRect(60, G.H - 18, G.W - 120, 2);
    ctx.fillStyle = R.colors.orange;
    ctx.fillRect(60, G.H - 18, (G.W - 120) * progress, 2);

    if (this.data.introDone) {
      ctx.globalAlpha = 0.4 + Math.sin(G.frameCount * 0.06) * 0.3;
      R.textCenter(ctx, 'Tap to continue', G.W / 2, G.H - 40, R.colors.textDim, R.fonts.sm);
      ctx.globalAlpha = 1;
    }
  }
});
