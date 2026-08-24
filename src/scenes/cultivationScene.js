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

  leave: function() {
    this._heroMoment = null;
    this._infoShell = null;
    this.data.buttons = [];
    this.data.scrollY = 0;
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

    // Meditate button - Primary (Gold)
    const medAmt = 5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2;
    const medBtn = UI.MagneticBtn(60, y, G.W - 120, 48, 'Meditate', { trailingIcon: 'arrow-right' });
    medBtn.onClick = function() {
      CultivationSystem.addCultivationBase(5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2);
      return true;
    };
    this.data.buttons.push(medBtn);
    y += 56;

    // Attempt Breakthrough button - Secondary (Surface with gold border)
    const bt = UI.MagneticBtn(60, y, G.W - 120, 48, 'Attempt Breakthrough', { trailingIcon: 'arrow-right' });
    bt.enabled = canBreak;
    bt._variant = 'secondary';
    bt.render = function(ctx) {
      const bx = this.x, by = this.y, bw = this.w, bh = this.h;
      const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
      
      // Spring scale for press feedback
      const scale = this._springScale || 1;
      ctx.save();
      ctx.translate(bx + bw/2, by + bh/2);
      ctx.scale(scale, scale);
      ctx.translate(-bw/2, -bh/2);
      
      if (this.enabled) {
        // Secondary variant: surface background, gold border
        R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
        R.textCenter(ctx, 'Attempt Breakthrough', bx + bw / 2, by + 28, R.colors.textPrimary, R.fonts.md);
      } else {
        // Disabled state
        R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
        ctx.strokeStyle = R.colors.borderHairline;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        ctx.globalAlpha = 0.5;
        R.textCenter(ctx, 'Attempt Breakthrough', bx + bw / 2, by + 28, R.colors.textDim, R.fonts.md);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      
      // Trailing icon physics
      if (this._trailingIcon && this._hovered && this.enabled && !reduceMotion) {
        const ix = bx + bw - 28 + (this._iconSpringX || 0);
        const iy = by + bh/2 - 12 + (this._iconSpringY || 0);
        ctx.save();
        ctx.translate(ix, iy);
        ctx.scale(1.05, 1.05);
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-4, 0); ctx.lineTo(4, 0);
        ctx.moveTo(0, -4); ctx.lineTo(4, 0);
        ctx.moveTo(0, 4); ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();
      }
    };
    bt.onClick = function() {
      const result = CultivationSystem.attemptBreakthrough();
      if (result.success) {
        Notify.show('Breakthrough! ' + (result.bonusText || ''), 3, R.colors.gold);
        Audio.levelUp();
        this.buildButtons(); // Rebuild buttons to update state
        return true;
      }
      Notify.show(result.reason || 'Breakthrough failed!', 3);
      Audio.error();
      return false;
    }.bind(this);
    this.data.buttons.push(bt);
    y += 56;

    // Back to Ashram button - Ghost (text only)
    const back = UI.MagneticBtn(60, y + 4, G.W - 120, 40, 'Back to Ashram', { trailingIcon: 'arrow-left' });
    back._variant = 'ghost';
    back.render = function(ctx) {
      const bx = this.x, by = this.y, bw = this.w, bh = this.h;
      const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
      
      const scale = this._springScale || 1;
      ctx.save();
      ctx.translate(bx + bw/2, by + bh/2);
      ctx.scale(scale, scale);
      ctx.translate(-bw/2, -bh/2);
      
      // Ghost variant: no background, text only with hover underline
      if (this._hovered && !reduceMotion) {
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - 4);
        ctx.lineTo(bx + bw, by + bh - 4);
        ctx.stroke();
      }
      R.textCenter(ctx, 'Back to Ashram', bx + bw / 2, by + 24, this._hovered ? R.colors.gold : R.colors.textPrimary, R.fonts.md);
      ctx.restore();
      
      // Leading icon for ghost button
      if (this._trailingIcon && this._hovered && !reduceMotion) {
        const ix = bx + 20 + (this._iconSpringX || 0);
        const iy = by + bh/2 - 12 + (this._iconSpringY || 0);
        ctx.save();
        ctx.translate(ix, iy);
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(4, 0); ctx.lineTo(-4, 0);
        ctx.moveTo(0, -4); ctx.lineTo(-4, 0);
        ctx.moveTo(0, 4); ctx.lineTo(-4, 0);
        ctx.stroke();
        ctx.restore();
      }
    };
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
    // Render noise/grain overlay for editorial luxury feel
    R.renderNoise(ctx);

    // Hero Moment for Cultivation - using displaySm font and proper styling
    if (!this._heroMoment) {
      this._heroMoment = Scene.HeroMoment({
        title: 'Cultivation',
        subtitle: 'Refine your spirit, gather prana, and ascend through realms.',
        ctaLabel: 'Meditate',
        ctaAction: () => {
          const medAmt = 5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2;
          CultivationSystem.addCultivationBase(medAmt);
        },
        eyebrow: 'INNER PATH',
        accent: R.colors.gold
      });
    }
    this._heroMoment.render(ctx);

    // Info panel with PremiumShell - Double-bezel depth
    const realm = CultivationSystem.getRealmData();
    const progress = CultivationSystem.getRealmProgress();
    const canBreak = CultivationSystem.canBreakthrough();
    const stats = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));

    const infoShell = UI.PremiumShell(10, 110, G.W - 20, 240, { outerR: 16 });
    infoShell.render(ctx);
    const content = infoShell.contentRect();
    let iy = content.y + 12;

    // Title with displaySm font
    R.textCenter(ctx, 'Cultivation', content.x + content.w/2, iy, R.colors.gold, R.fonts.displaySm);
    iy += 28;

    // Asymmetric 4-col grid layout for info
    const col1 = content.x + 20;
    const col2 = content.x + content.w * 0.35;
    const col3 = content.x + content.w * 0.6;
    const col4 = content.x + content.w * 0.85;

    // Column 1: Realm & Stage
    R.text(ctx, 'Realm', col1, iy, R.colors.textDim, R.fonts.sm);
    iy += 16;
    R.text(ctx, realm.name, col1, iy, R.colors.textPrimary, R.fonts.md);
    iy += 20;
    R.text(ctx, 'Stage', col1, iy, R.colors.textDim, R.fonts.sm);
    iy += 16;
    R.text(ctx, G.state.realmStage + '/' + realm.stages, col1, iy, R.colors.gold, R.fonts.md);
    iy += 24;

    // Progress Bar - 8px height, gold fill, borderHairline track
    const pb = UI.ProgressBar(content.x + 20, iy, content.w - 40, 8, R.colors.gold, R.colors.borderHairline);
    pb.setProgress(progress.current, progress.needed);
    pb.render(ctx);
    iy += 20;
    R.textCenter(ctx, 'Cultivation Base: ' + Math.floor(progress.current) + ' / ' + progress.needed, content.x + content.w/2, iy, R.colors.textDim, R.fonts.sm);
    iy += 20;

    // Column 2: Prana & Rates (right side)
    let rightY = content.y + 12 + 28;
    R.text(ctx, 'Prana', col3, rightY, R.colors.textDim, R.fonts.sm);
    rightY += 16;
    R.text(ctx, Math.floor(G.state.prana || 0).toLocaleString(), col3, rightY, R.colors.blue, R.fonts.displaySm);
    rightY += 24;
    R.text(ctx, 'Gathering Rate', col3, rightY, R.colors.textDim, R.fonts.sm);
    rightY += 16;
    R.text(ctx, '+' + CultivationSystem.getCultivationPerSecond().toFixed(1) + '/s', col3, rightY, R.colors.green, R.fonts.md);
    rightY += 20;
    R.text(ctx, 'Prana Rate', col3, rightY, R.colors.textDim, R.fonts.sm);
    rightY += 16;
    R.text(ctx, '+' + CultivationSystem.getPranaPerSecond().toFixed(1) + '/s', col3, rightY, R.colors.blue, R.fonts.md);
    rightY += 24;

    // Breakthrough Status
    const canBreakText = canBreak ? 'Ready for breakthrough!' : 'Need more cultivation base';
    const breakColor = canBreak ? R.colors.green : R.colors.textDim;
    R.text(ctx, canBreakText, col3, rightY, breakColor, R.fonts.sm);
    rightY += 20;

    // Next Realm Stats
    const statsData = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));
    let statStr = 'Next Realm:';
    R.text(ctx, statStr, col3, rightY, R.colors.textDim, R.fonts.sm);
    rightY += 16;
    R.text(ctx, '+' + statsData.hp + ' HP', col3, rightY, R.colors.textSecondary, R.fonts.sm);
    rightY += 14;
    if (statsData.str) { R.text(ctx, '+' + statsData.str + ' STR', col3, rightY, R.colors.textSecondary, R.fonts.sm); rightY += 14; }
    if (statsData.agi) { R.text(ctx, '+' + statsData.agi + ' AGI', col3, rightY, R.colors.textSecondary, R.fonts.sm); rightY += 14; }
    if (statsData.mag) { R.text(ctx, '+' + statsData.mag + ' MAG', col3, rightY, R.colors.textSecondary, R.fonts.sm); rightY += 14; }
    if (statsData.def) { R.text(ctx, '+' + statsData.def + ' DEF', col3, rightY, R.colors.textSecondary, R.fonts.sm); rightY += 14; }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});