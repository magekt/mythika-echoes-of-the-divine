const cultivationScene = Scene.create({
  name: 'cultivationScene',
  data: {
    buttons: [],
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.buildButtons();
  },

  getContentTop: function() { return 74; },
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
    let y = this.getContentTop();

    const realm = CultivationSystem.getRealmData();
    const progress = CultivationSystem.getRealmProgress();
    const canBreak = CultivationSystem.canBreakthrough();
    const stats = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));

    const infoH = 240;
    y += infoH + 10;

    const bt = UI.BtnGold(60, y, G.W - 120, 38, 'Attempt Breakthrough');
    bt.enabled = canBreak;
    bt.render = function(ctx) {
      const bx = this.x, by = this.y, bw = this.w, bh = this.h;
      R.roundRect(ctx, bx, by, bw, bh, 6, this.enabled ? R.colors.btnGold : R.colors.btn);
      if (!this.enabled) ctx.globalAlpha = 0.5;
      R.textCenter(ctx, 'Attempt Breakthrough', bx + bw / 2, by + 22, this.enabled ? R.colors.white : R.colors.textDim, R.fonts.md);
      ctx.globalAlpha = 1;
    };
    bt.onClick = function() {
      const result = CultivationSystem.attemptBreakthrough();
      if (result.success) {
        Notify.show('Breakthrough! ' + (result.bonusText || ''), 3, R.colors.gold);
        Audio.levelUp();
      } else {
        Notify.show(result.reason || 'Breakthrough failed!', 3);
        Audio.error();
      }
    };
    this.data.buttons.push(bt);
    y += 46;

    const back = UI.Button(60, y + 4, G.W - 120, 32, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  renderInfo: function(ctx, offsetY) {
    let y = offsetY;

    R.drawCultivationAura(ctx, G.W / 2, y + 36, G.state.totalPlayTime);

    R.roundRect(ctx, 10, y, G.W - 20, 240, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, y + 0.5, G.W - 21, 239);

    const realm = CultivationSystem.getRealmData();
    let iy = y + 12;
    R.textCenter(ctx, 'Cultivation', G.W / 2, iy, R.colors.gold, R.fonts.lg);
    iy += 22;

    R.textCenter(ctx, 'Realm: ' + realm.name, G.W / 2, iy, R.colors.text, R.fonts.md);
    iy += 18;
    R.textCenter(ctx, 'Stage: ' + G.state.realmStage + '/' + realm.stages, G.W / 2, iy, R.colors.text, R.fonts.sm);
    iy += 20;

    const progress = CultivationSystem.getRealmProgress();
    const pb = UI.ProgressBar(40, iy, G.W - 80, 12, R.colors.gold, '#2a1510');
    pb.setProgress(progress.current, progress.needed);
    pb.render(ctx);
    iy += 20;
    R.textCenter(ctx, 'Cultivation Base: ' + Math.floor(progress.current) + ' / ' + progress.needed, G.W / 2, iy, R.colors.textDim, R.fonts.sm);
    iy += 16;

    R.textCenter(ctx, 'Prana: ' + Math.floor(G.state.prana || 0), G.W / 2, iy, R.colors.blue, R.fonts.sm);
    iy += 14;
    R.textCenter(ctx, 'Gathering: +' + CultivationSystem.getCultivationPerSecond().toFixed(1) + '/s', G.W / 2, iy, R.colors.textDim, R.fonts.sm);
    iy += 14;
    R.textCenter(ctx, 'Prana Rate: +' + CultivationSystem.getPranaPerSecond().toFixed(1) + '/s', G.W / 2, iy, R.colors.textDim, R.fonts.sm);
    iy += 18;

    const canBreak = CultivationSystem.canBreakthrough();
    R.textCenter(ctx, canBreak ? 'Ready for breakthrough!' : 'Need more cultivation base', G.W / 2, iy, canBreak ? R.colors.green : R.colors.textDim, R.fonts.sm);
    iy += 16;

    const stats = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));
    let statStr = 'Next: +' + stats.hp + 'HP';
    if (stats.str) statStr += ' +' + stats.str + 'STR';
    if (stats.agi) statStr += ' +' + stats.agi + 'AGI';
    if (stats.mag) statStr += ' +' + stats.mag + 'MAG';
    if (stats.def) statStr += ' +' + stats.def + 'DEF';
    R.textCenter(ctx, statStr, G.W / 2, iy, R.colors.textDim, R.fonts.sm);
  },

  update: function(dt) {
    CultivationSystem.tick(dt);
    const sd = Input.getScrollDelta();
    if (sd) {
      this.data.scrollY += sd * 0.8;
      this.clampScroll();
    }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    R.roundRect(ctx, 10, 6, G.W - 20, 62, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 61);
    R.textCenter(ctx, 'Cultivation', G.W / 2, 24, R.colors.gold, R.fonts.lg);
    R.textCenter(ctx, 'Refine your spirit and ascend realms', G.W / 2, 48, R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, this.getContentHeight());
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

      this.renderInfo(ctx, this.getContentTop());
    for (const b of this.data.buttons) b.render(ctx);

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
