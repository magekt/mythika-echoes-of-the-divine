const zoneExplorationScene = Scene.create({
  name: 'zoneExploration',
  data: {
    zoneId: null,
    zone: null,
    exploring: true,
    encounterTimer: 0,
    totalEncounterTimer: 0,
    progressGained: 0,
    log: [],
    buttons: [],
    state: 'exploring',
    zoneComplete: false,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.zoneId = G.state.currentZone;
    this.data.zone = ZONES[this.data.zoneId];
    // Defensive: a stale/missing currentZone must not crash the scene.
    if (!this.data.zone) {
      Notify.show('No zone selected — returning to the map.', 2, R.colors.red);
      gScene('travelMap', true);
      return;
    }
    this.data.exploring = true;
    this.data.encounterTimer = 2 + Math.random() * 2;
    this.data.totalEncounterTimer = this.data.encounterTimer;
    this.data.progressGained = 0;
    this.data.log = ['Entering ' + this.data.zone.name + '...'];
    this.data.state = 'exploring';
    this.data.zoneComplete = (G.state.zoneProgress[this.data.zoneId] || 0) >= 100;
    this.data.scrollY = 0;
    this.buildButtons();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.log = [];
    this.data.zone = null;
    this.data.zoneId = null;
  },

  getContentTop: function() { return 134; },
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
    const logH = Math.min(this.data.log.length, 8) * 20 + 10;
    let y = this.getContentTop() + logH + 8;

    if (this.data.zoneComplete) {
      const bossKey = 'boss_' + this.data.zoneId;
      const bossDone = G.state.flags && G.state.flags[bossKey];
      if (!bossDone) {
        const bossBtn = UI.Button(30, y, G.W - 60, 30, 'Fight Zone Boss', R.colors.btnRed, '#c04040');
        bossBtn.onClick = function() {
          G.state.isBossFight = true;
          G.state.returnToExploration = false;
          const bossEnemy = getZoneBoss(zoneExplorationScene.data.zoneId);
          Progression.applyDifficulty([bossEnemy]);
          G.state.currentEnemies = [bossEnemy];
          gScene('combatScene');
        };
        this.data.buttons.push(bossBtn);
        y += 38;
      } else {
        y += 8;
      }
    } else {
      const exploreBtn = UI.Button(30, y, G.W - 60, 30, 'Manual Explore', R.colors.btnGold);
      exploreBtn.onClick = function() {
        zoneExplorationScene.triggerEncounter();
      };
      this.data.buttons.push(exploreBtn);
      y += 38;
    }

    const back = UI.Button(30, y, G.W - 60, 30, 'Back to Map');
    back.onClick = function() { gScene('travelMap', true); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  checkZoneComplete: function() {
    const pct = G.state.zoneProgress[this.data.zoneId] || 0;
    if (pct >= 100 && !this.data.zoneComplete) {
      this.data.zoneComplete = true;
      this.data.log.push('Zone fully explored!');
      const zone = this.data.zone;
      const rewardGold = 30 + (zone.reqLevel || 1) * 5;
      Economy.addGold(rewardGold);
      Economy.addKarma(1);
      this.data.log.push('Reward: +' + rewardGold + ' Gold, +1 Karma');
      Notify.show(this.data.zone.name + ' explored! +' + rewardGold + 'g', 3, R.colors.gold);
      Audio.levelUp();
    }
  },

  update: function(dt) {
    if (!this.data.zone) return;
    if (this.data.state === 'exploring' && !this.data.zoneComplete) {
      this.data.encounterTimer -= dt;
      if (this.data.encounterTimer <= 0) {
        this.data.log.push('An enemy appears!');
        this.triggerEncounter();
        this.data.encounterTimer = 2 + Math.random() * 2;
        this.data.totalEncounterTimer = this.data.encounterTimer;
      }
      }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  triggerEncounter: function() {
    const zone = this.data.zone;
    const playerLvl = G.state.player ? G.state.player.level : 1;
    let enemy = getZoneEnemy(this.data.zoneId, playerLvl);
    let pctGain = 5 + Math.floor(Math.random() * 15);
    let isMiniBoss = false;

    Progression.applyDifficulty([enemy]);

    if (Math.random() < 0.25 && !G.state.isBossFight) {
      enemy = Progression.createEliteVariant(enemy);
      pctGain = Math.floor(pctGain * 1.5);
      isMiniBoss = true;
      this.data.log.push('A formidable ' + enemy.name + ' appears!');
    }

    this.data.progressGained += pctGain;
    const curPct = G.state.zoneProgress[this.data.zoneId] || 0;
    G.state.zoneProgress[this.data.zoneId] = Math.min(100, curPct + pctGain);
    G.state.currentEnemies = [enemy];
    G.state.isBossFight = false;
    G.state.returnToExploration = true;
    this.checkZoneComplete();
    gScene('combatScene');
  },

  render: function(ctx) {
    if (!this.data.zone) return;
    R.drawZoneBackground(ctx, this.data.zoneId);

    Scene.drawHeader(ctx, 122);

    R.textCenter(ctx, this.data.zone.name, G.W / 2, 24, R.colors.gold, R.fonts.lg);
    R.textCenter(ctx, this.data.zone.desc, G.W / 2, 46, R.colors.textDim, R.fonts.sm);

    const pct = G.state.zoneProgress[this.data.zoneId] || 0;
    const pb = UI.ProgressBar(40, 56, G.W - 80, 12, R.colors.gold, '#2a1510');
    pb.setProgress(pct, 100);
    pb.text = '';
    pb.render(ctx);
    R.textCenter(ctx, 'Exploration: ' + pct + '%', G.W / 2, 74, R.colors.text, R.fonts.sm);

    if (this.data.zoneComplete) {
      R.textCenter(ctx, '\u2713 Zone Complete!', G.W / 2, 94, R.colors.green, R.fonts.md);
      R.textCenter(ctx, 'All mysteries unveiled', G.W / 2, 112, R.colors.textDim, R.fonts.sm);
    } else {
      const frac = Math.max(0, Math.min(1, this.data.encounterTimer / this.data.totalEncounterTimer));
      R.roundRect(ctx, 40, 88, G.W - 80, 6, 3, 'rgba(200,48,48,0.15)');
      R.roundRect(ctx, 40, 88, (G.W - 80) * frac, 6, 3, 'rgba(200,48,48,0.6)');
      R.textCenter(ctx, 'Next encounter: ' + this.data.encounterTimer.toFixed(1) + 's', G.W / 2, 104, R.colors.textDim, R.fonts.sm);
      R.textCenter(ctx, 'Exploring ' + this.data.zone.name + '...', G.W / 2, 118, R.colors.text, R.fonts.sm);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    let ly = top + 4;
    const logSlice = this.data.log.slice(-8);
    for (const msg of logSlice) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      R.roundRect(ctx, 12, ly - 1, G.W - 24, 16, 3, ctx.fillStyle);
      R.textCenter(ctx, msg, G.W / 2, ly + 11, R.colors.text, R.fonts.sm);
      ly += 18;
    }

    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
