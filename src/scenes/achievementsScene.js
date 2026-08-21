const achievementsScene = Scene.create({
  name: 'achievements',
  data: {
    buttons: [],
    scrollY: 0,
    staticDraws: [],
    contentHeight: 0
  },

  enter: function() {
    AchievementSystem.init();
    AchievementSystem.check();
    this.data.scrollY = 0;
    this.buildButtons();
  },

  getContentTop: function() { return 86; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    const allAch = AchievementSystem.getAll();
    const unlocked = allAch.filter(a => a.progress.unlocked);
    const locked = allAch.filter(a => !a.progress.unlocked);
    let y = this.getContentTop();

    if (unlocked.length > 0) {
      for (const a of unlocked) {
        const btn = UI.Button(14, y, G.W - 28, 30, '', R.colors.green);
        btn._a = a;
        btn.enabled = false;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 5, R.colors.green);
          R.text(ctx, '\u2713 ' + this._a.name + ' \u2014 ' + this._a.desc, bx + 10, by + 18, R.colors.white, R.fonts.sm);
        };
        this.data.buttons.push(btn);
        y += 36;
      }
      y += 4;
    }

    if (locked.length > 0) {
      for (const a of locked) {
        const btn = UI.Button(14, y, G.W - 28, 30, '', R.colors.btn);
        btn._a = a;
        btn.enabled = false;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 5, R.colors.btn);
          R.text(ctx, '\u25CB ' + this._a.name + ' \u2014 ' + this._a.desc, bx + 10, by + 18, R.colors.textDim, R.fonts.sm);
        };
        this.data.buttons.push(btn);
        y += 36;
      }
    }

    if (unlocked.length === 0 && locked.length === 0) {
      y += 10;
      SD.push({ text: ['No achievements yet.', 18, y, R.colors.textDim, R.fonts.sm] });
      y += 20;
    }

    y += 6;
    const back = UI.Button(60, y, G.W - 120, 30, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    const sd = Input.getScrollDelta();
    if (sd) {
      this.data.scrollY += sd * 0.8;
      this.clampScroll();
    }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    R.roundRect(ctx, 10, 6, G.W - 20, 74, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 73);
    R.textCenter(ctx, 'Achievements', G.W / 2, 22, R.colors.gold, R.fonts.lg);
    const uc = AchievementSystem.getUnlockedCount();
    const tc = AchievementSystem.getTotalCount();
    const allAch = AchievementSystem.getAll();
    const locked = allAch.filter(a => !a.progress.unlocked);
    R.textCenter(ctx, uc + ' / ' + tc + ' unlocked', G.W / 2, 46, R.colors.text, R.fonts.sm);
    R.textCenter(ctx, uc === tc ? 'All achievements complete!' : (locked.length + ' remaining'), G.W / 2, 64, uc === tc ? R.colors.green : R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, this.getContentHeight());
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    for (const b of this.data.buttons) b.render(ctx);
    for (const d of this.data.staticDraws) if (d.text) R.text(ctx, d.text[0], d.text[1], d.text[2], d.text[3], d.text[4]);

    ctx.restore();

    if (this.data.contentHeight > this.getContentHeight()) {
      const vh = this.getContentHeight();
      const ratio = vh / this.data.contentHeight;
      const barH = Math.max(16, ratio * vh);
      const maxTrack = vh - barH;
      const scrollFrac = this.data.scrollY / Math.max(1, this.data.contentHeight - vh);
      const barY = top + scrollFrac * maxTrack;
      R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
    }
  }
});
