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

    const medAmt = 5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2;
    const medBtn = UI.MagneticBtn(60, y, G.W - 120, 40, 'Meditate (+' + medAmt + ')', { trailingIcon: 'arrow-right' });
    medBtn.onClick = function() {
      CultivationSystem.addCultivationBase(5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2);
      return true;
    };
    this.data.buttons.push(medBtn);
    y += 48;

    const bt = UI.MagneticBtn(60, y, G.W - 120, 48, 'Attempt Breakthrough', { trailingIcon: 'arrow-right' });
    bt.enabled = canBreak;
    bt.render = function(ctx) {
      const bx = this.x, by = this.y, bw = this.w, bh = this.h;
      R.roundRect(ctx, bx, by, bw, bh, 6, this.enabled ? R.colors.btnGold : R.colors.btn);
      if (!this.enabled) ctx.globalAlpha = 0.5;
      R.textCenter(ctx, 'Attempt Breakthrough', bx + bw / 2, by + 28, this.enabled ? R.colors.white : R.colors.textDim, R.fonts.md);
      ctx.globalAlpha = 1;
    };
    bt.onClick = function() {
      const result = CultivationSystem.attemptBreakthrough();
      if (result.success) {
        Notify.show('Breakthrough! ' + (result.bonusText || ''), 3, R.colors.gold);
        Audio.levelUp();
        return true;
      }
      Notify.show(result.reason || 'Breakthrough failed!', 3);
      Audio.error();
      return false;
    };
    this.data.buttons.push(bt);
    y += 56;

    const back = UI.MagneticBtn(60, y + 4, G.W - 120, 40, 'Back to Ashram', { trailingIcon: 'arrow-left' });
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
    y += 48;

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
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    // Render noise/grain overlay
    R.renderNoise(ctx);

    // Hero Moment for Cultivation
    if (!this._heroMoment) {
      this._heroMoment = Scene.HeroMoment({
        title: 'Cultivation',
        subtitle: 'Refine your spirit and ascend realms. Meditate to accelerate your progress.',
        ctaLabel: 'Meditate',
        ctaAction: () => {
          const medAmt = 5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2;
          CultivationSystem.addCultivationBase(medAmt);
        },
        eyebrow: 'Realm ' + G.state.realmStage + '/' + CultivationSystem.getRealmData().stages,
        accent: R.colors.accent
      });
    }
    this._heroMoment.render(ctx);

    // Info panel with PremiumShell
    const realm = CultivationSystem.getRealmData();
    const progress = CultivationSystem.getRealmProgress();
    const canBreak = CultivationSystem.canBreakthrough();
    const stats = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));

    const infoShell = UI.PremiumShell(10, 110, G.W - 20, 240, { outerR: 16 });
    infoShell.render(ctx);
    const content = infoShell.contentRect();
    let iy = content.y + 12;

    R.textCenter(ctx, 'Cultivation', content.x + content.w/2, iy, R.colors.gold, R.fonts.displaySm);
    iy += 28;

    R.textCenter(ctx, 'Realm: ' + realm.name, content.x + content.w/2, iy, R.colors.textPrimary, R.fonts.md);
    iy += 22;
    R.textCenter(ctx, 'Stage: ' + G.state.realmStage + '/' + realm.stages, content.x + content.w/2, iy, R.colors.textSecondary, R.fonts.sm);
    iy += 24;

    const pb = UI.ProgressBar(content.x + 20, iy, content.w - 40, 14, R.colors.gold, '#2a1510');
    pb.setProgress(progress.current, progress.needed);
    pb.render(ctx);
    iy += 24;
    R.textCenter(ctx, 'Cultivation Base: ' + Math.floor(progress.current) + ' / ' + progress.needed, content.x + content.w/2, iy, R.colors.textDim, R.fonts.sm);
    iy += 20;

    R.textCenter(ctx, 'Prana: ' + Math.floor(G.state.prana || 0), content.x + content.w/2, iy, R.colors.blue, R.fonts.sm);
    iy += 18;
    R.textCenter(ctx, 'Gathering: +' + CultivationSystem.getCultivationPerSecond().toFixed(1) + '/s', content.x + content.w/2, iy, R.colors.textDim, R.fonts.sm);
    iy += 18;
    R.textCenter(ctx, 'Prana Rate: +' + CultivationSystem.getPranaPerSecond().toFixed(1) + '/s', content.x + content.w/2, iy, R.colors.textDim, R.fonts.sm);
    iy += 22;

    const canBreakText = canBreak ? 'Ready for breakthrough!' : 'Need more cultivation base';
    R.textCenter(ctx, canBreakText, content.x + content.w/2, iy, canBreak ? R.colors.green : R.colors.textDim, R.fonts.sm);
    iy += 20;

    const statsData = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));
    let statStr = 'Next: +' + statsData.hp + 'HP';
    if (statsData.str) statStr += ' +' + statsData.str + 'STR';
    if (statsData.agi) statStr += ' +' + statsData.agi + 'AGI';
    if (statsData.mag) statStr += ' +' + statsData.mag + 'MAG';
    if (statsData.def) statStr += ' +' + statsData.def + 'DEF';
    R.textCenter(ctx, statStr, content.x + content.w/2, iy, R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
