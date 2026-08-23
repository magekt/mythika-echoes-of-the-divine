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
        // Compute incremental progress for numeric achievements
        let cur = 0, target = 0;
        const id = a.id;
        if (id === 'fishmonger') { cur = G.state.fishCaught || 0; target = 20; }
        else if (id === 'master_fisher') { cur = G.state.fishCaught || 0; target = 100; }
        else if (id === 'alchemist') { cur = (G.state.flags && G.state.flags.itemsCrafted || 0); target = 10; }
        else if (id === 'master_alchemist') { cur = (G.state.flags && G.state.flags.itemsCrafted || 0); target = 50; }
        else if (id === 'spirit_master') { cur = (G.state.spiritBeasts || []).length; target = 3; }
        else if (id === 'beast_tamer') { cur = Math.max(0, ...(G.state.spiritBeasts || []).map(b => b.tier || 1), 0); target = 4; }
        else if (id === 'wealthy') { cur = G.state.gold || 0; target = 5000; }
        else if (id === 'millionaire') { cur = G.state.gold || 0; target = 20000; }
        else if (id === 'tournament_champ') { cur = G.state.tournamentWins || 0; target = 10; }
        else if (id === 'boss_slayer') { cur = (G.state.flags && G.state.flags.bossesDefeated || 0); target = 5; }
        else if (id === 'collector') { cur = (G.state.inventory || []).length; target = 20; }
        else if (id === 'max_level') { cur = Math.max(0, ...(G.state.party || []).map(h => h.level || 1)); target = 50; }
        else if (id === 'samsara_master') { cur = G.state.rebirthCount || 0; target = 5; }
        else if (id === 'trial_adept') { cur = G.state.trialBest || 0; target = 10; }
        else if (id === 'trial_master') { cur = G.state.trialBest || 0; target = 25; }
        else if (id === 'full_pantheon') { cur = (G.state.party || []).length; target = 5; }
        const hasProgress = target > 0;
        const pct = hasProgress ? Math.min(1, cur / target) : 0;
        const h = hasProgress ? 42 : 30;
        const btn = UI.Button(14, y, G.W - 28, h, '', R.colors.btn);
        btn._a = a;
        btn._cur = cur;
        btn._target = target;
        btn._pct = pct;
        btn._hasProgress = hasProgress;
        btn.enabled = false;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          ctx.globalAlpha = 0.5;
          R.roundRect(ctx, bx, by, bw, bh, 5, R.colors.btn);
          R.text(ctx, '\u25CB ' + this._a.name + ' \u2014 ' + this._a.desc, bx + 10, by + 14, R.colors.textDim, R.fonts.sm);
          if (this._hasProgress) {
            R.text(ctx, this._cur + ' / ' + this._target, bx + bw - 10, by + 14, R.colors.gold, R.fonts.sm, 'right');
            const barW = bw - 20;
            R.roundRect(ctx, bx + 10, by + 22, barW, 6, 3, 'rgba(138,138,160,0.15)');
            R.roundRect(ctx, bx + 10, by + 22, barW * this._pct, 6, 3, R.colors.gold);
          }
          ctx.globalAlpha = 1;
        };
        this.data.buttons.push(btn);
        y += h + 6;
      }
    }

    if (unlocked.length === 0 && locked.length === 0) {
      y += 10;
      SD.push({ text: ['No achievements yet.', 18, y, R.colors.textDim, R.fonts.sm] });
      y += 20;
    }

    y += 6;
    this.data.buttons.push(Scene.backButton(y));
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 74, 'Achievements', 22);
    const uc = AchievementSystem.getUnlockedCount();
    const tc = AchievementSystem.getTotalCount();
    const allAch = AchievementSystem.getAll();
    const locked = allAch.filter(a => !a.progress.unlocked);
    R.textCenter(ctx, uc + ' / ' + tc + ' unlocked', G.W / 2, 46, R.colors.text, R.fonts.sm);
    R.textCenter(ctx, uc === tc ? 'All achievements complete!' : (locked.length + ' remaining'), G.W / 2, 64, uc === tc ? R.colors.green : R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
