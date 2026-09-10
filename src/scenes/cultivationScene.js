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

  getContentTop: function() { return G.CONTENT_TOP; },
  getContentHeight: function() { return G.H - this.getContentTop() - 44; },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  // Info panel height (must match renderInfoPanel below): shell 200px.
  infoPanelH: 200,

  buildButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    // Actions start below the scrolled info panel — one flow, no overlaps.
    let y = this.getContentTop() + this.infoPanelH + 12;

    // (Stat cards removed — all info lives in the scrolled panel above,
    // so nothing duplicates or overlaps. Actions follow directly.)

    // --- Primary Action Buttons ---
    // Meditate button - Primary (Gold), minimum 38px height
    const medAmt = 5 + Math.max(0, (G.state.ashramLevel || 1) - 1) * 2;
    const medBtn = UI.MagneticBtn(60, y, G.W - 120, 48, 'Meditate', { trailingIcon: 'arrow-right' });
    medBtn.onClick = function() {
      CultivationSystem.addCultivationBase(medAmt);
      return true;
    };
    this.data.buttons.push(medBtn);
    y += 56;

    // Attempt Breakthrough button - Secondary (Surface with gold border)
    const canBreak = CultivationSystem.canBreakthrough();
    const bt = UI.MagneticBtn(60, y, G.W - 120, 48, 'Attempt Breakthrough', { trailingIcon: 'arrow-right' });
    bt.enabled = canBreak;
    bt._variant = 'secondary';
    bt.render = function(ctx) {
      const bx = this.x, by = this.y, bw = this.w, bh = this.h;
      const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
      
      // Spring scale for press feedback
      const scale = this._springScale || 1;
      ctx.save();
      // Centered scale: undo the FULL forward translate (see button.js).
      ctx.translate(bx + bw/2, by + bh/2);
      ctx.scale(scale, scale);
      ctx.translate(-(bx + bw/2), -(by + bh/2));
      
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
      // Centered scale: undo the FULL forward translate (see button.js).
      ctx.translate(bx + bw/2, by + bh/2);
      ctx.scale(scale, scale);
      ctx.translate(-(bx + bw/2), -(by + bh/2));
      
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

  // Info panel drawn INSIDE the scrollable clip (single flow with the
  // actions below it). A fixed panel here used to paint over the content.
  // Shell is infoPanelH tall; keep rows within content bounds (~172px).
  renderInfoPanel: function(ctx, py) {
    const shell = UI.PremiumShell(10, py, G.W - 20, this.infoPanelH, { outerR: 12 });
    shell.render(ctx);
    const content = shell.contentRect();

    const realm = CultivationSystem.getRealmData();
    const progress = CultivationSystem.getRealmProgress();
    const canBreak = CultivationSystem.canBreakthrough();
    const stats = CultivationSystem.getBreakthroughStats(getRealmIndex(G.state.realm));

    let iy = content.y + 10;
    R.textCenter(ctx, 'Cultivation Realm', content.x + content.w / 2, iy, R.colors.gold, R.fonts.md);
    iy += 20;
    R.textCenter(ctx, 'Realm: ' + realm.name, content.x + content.w / 2, iy, R.colors.text, R.fonts.md);
    iy += 16;
    R.textCenter(ctx, 'Stage: ' + G.state.realmStage + '/' + realm.stages, content.x + content.w / 2, iy, R.colors.text, R.fonts.sm);
    iy += 18;

    const pb = UI.ProgressBar(content.x + 14, iy, content.w - 28, 8, R.colors.gold, R.colors.borderHairline);
    pb.setProgress(progress.current, progress.needed);
    pb.render(ctx);
    iy += 18;
    R.textCenter(ctx, 'Cultivation Base: ' + Math.floor(progress.current) + ' / ' + progress.needed, content.x + content.w / 2, iy, R.colors.textDim, R.fonts.sm);
    iy += 16;

    R.textCenter(ctx, 'Prana: ' + Math.floor(G.state.prana || 0) + '  ·  +' + CultivationSystem.getCultivationPerSecond().toFixed(1) + '/s gathering  ·  +' + CultivationSystem.getPranaPerSecond().toFixed(1) + '/s prana', content.x + content.w / 2, iy, R.colors.blue, R.fonts.sm);
    iy += 16;

    R.textCenter(ctx, canBreak ? 'Ready for breakthrough!' : 'Need more cultivation base', content.x + content.w / 2, iy, canBreak ? R.colors.green : R.colors.textDim, R.fonts.sm);
    iy += 16;

    let statStr = 'Next: +' + stats.hp + 'HP';
    if (stats.str) statStr += ' +' + stats.str + 'STR';
    if (stats.agi) statStr += ' +' + stats.agi + 'AGI';
    if (stats.mag) statStr += ' +' + stats.mag + 'MAG';
    if (stats.def) statStr += ' +' + stats.def + 'DEF';
    R.textCenter(ctx, statStr, content.x + content.w / 2, iy, R.colors.textDim, R.fonts.sm);
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

    // Compact fixed header (no CTA — Meditate lives in the scrollable
    // actions below; a second CTA here duplicated it and overlapped content).
    {
      const cx = G.W/2;
      R.roundRect(ctx, cx - 80, 24, 160, 24, 12, 'rgba(232,160,48,0.12)');
      R.textCenter(ctx, 'INNER PATH', cx, 40, R.colors.gold, R.fonts.sm);
      R.textCenter(ctx, 'Cultivation', cx, 72, R.colors.textPrimary, R.fonts.displaySm);
      R.textCenter(ctx, 'Refine spirit, gather prana, ascend realms.', cx, 92, R.colors.textSecondary, R.fonts.md);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    // Single flow: info panel first, then the action buttons below it.
    this.renderInfoPanel(ctx, top);
    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});