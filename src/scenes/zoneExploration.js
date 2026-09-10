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
    contentHeight: 0,

    // New: encounter state
    currentEnemy: null,
    enemyHpPct: 0,
    lootItems: []
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
    this.data.currentEnemy = null;
    this.data.enemyHpPct = 0;
    this.data.lootItems = [];
    this.buildButtons();
  },

  leave: function() {
    this.data.buttons = [];
    this.data.log = [];
    this.data.zone = null;
    this.data.zoneId = null;
    this.data.currentEnemy = null;
    this.data.enemyHpPct = 0;
    this.data.lootItems = [];
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

  // ── Build the full zone exploration UI ──────────────────────────
  buildButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;

    // --- Zone Info Header (26px height, panel bg, accent label) ---
    // Design: 26px height, R.colors.panel bg, accent color label
    const hh = 26;
    const hdr = UI.Button(14, 134, G.W - 28, hh, '', 'transparent');
    hdr._label = this.data.zone.name;
    hdr._color = R.colors.gold;
    hdr.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, R.radius.m, R.colors.panel);
      R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.sm);
      // Description line below label
      R.textCenter(ctx, this.data.zone.desc, this.x + this.w / 2, this.y + this.h - 4, R.colors.textDim, R.fonts.xs);
    };
    this.data.buttons.push(hdr);

    // --- Encounter Panel (card: 86px height, R.radius.m, 8px gap, R.colors.surface) ---
    // Design: Cards 86px height, 8px gap, 14px margin, R.radius.m (8px)
    const encY = this.getContentTop() + hh + 14;  // 134 + 26 + 14 = 174
    const encCard = UI.Button(14, encY, G.W - 28, 86, '', 'transparent');
    encCard._currentEnemy = this.data.currentEnemy;
    encCard._enemyHpPct = this.data.enemyHpPct;
    encCard.render = function(ctx) {
      const bx = this.x, by = this.y, bw = this.w, bh = this.h;
      R.roundRect(ctx, bx, by, bw, bh, R.radius.m, R.colors.surface);
      ctx.strokeStyle = R.colors.borderHairline;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

      // Enemy name / sprite area
      if (this._currentEnemy) {
        const enemy = this._currentEnemy;
        // Enemy name
        R.textCenter(ctx, enemy.name, bx + bw / 2, by + 22, R.colors.gold, R.fonts.md);
        // HP bar: 8px height, accentMuted track, borderFocus fill
        const hpBarY = by + 44;
        R.roundRect(ctx, bx + 12, hpBarY, bw - 24, 8, R.radius.s, R.colors.accentMuted);
        const fillW = (bw - 24) * Math.max(0, Math.min(1, this._enemyHpPct));
        if (fillW > 0) {
          R.roundRect(ctx, bx + 12, hpBarY, fillW, 8, R.radius.s, R.colors.borderFocus);
        }
        R.textCenter(ctx, Math.floor(enemy.hp) + '/' + enemy.maxHp, bx + bw / 2, hpBarY + 12, R.colors.white, R.fonts.xs);
      } else {
        R.textCenter(ctx, 'No encounter', bx + bw / 2, by + 22, R.colors.textDim, R.fonts.sm);
      }
    };
    this.data.buttons.push(encCard);

    // --- Action Buttons (Attack, Skill, Flee - 44px+ height, BtnGold for primary) ---
    // Design: minimum 38px height for primary actions, 44×44 touch targets
    // Using 44px to satisfy both the 38px minimum and 44×44 touch target rule
    const btnY = encY + 86 + 14;  // 174 + 86 + 14 = 274
    // 3 buttons across with 8px gap, total width = G.W - 28(margin) - 8(gap) = G.W - 36
    // Each button width: (G.W - 36 - 8) / 3 = (G.W - 44) / 3 for spacing, or just divide evenly
    // Using the pattern: buttons start at 14px margin, then space evenly
    const btnGroupWidth = G.W - 28 - 8;  // 28px side margins, 8px gap between 3 buttons
    const btnW = Math.floor(btnGroupWidth / 3);  // equal width, will have slight gap if not perfect
    const btnGap = (btnGroupWidth - 3 * btnW) / 4;  // 4 gaps: left of first, between, between, right of last

    // Attack button - primary, BtnGold
    const attackBtn = UI.BtnGold(14 + btnGap, btnY, btnW, 44, 'Attack');
    attackBtn.onClick = function() {
      zoneExplorationScene.triggerEncounter();
    };
    this.data.buttons.push(attackBtn);

    // Skill button
    const skillBtn = UI.Button(14 + btnGap + btnW + btnGap, btnY, btnW, 44, 'Skill');
    skillBtn.onClick = function() {
      Notify.show('Skill selection coming soon', 2, R.colors.blueLight);
    };
    this.data.buttons.push(skillBtn);

    // Flee button
    const fleeBtn = UI.Button(14 + btnGap + 2 * (btnW + btnGap), btnY, btnW, 44, 'Flee');
    fleeBtn.onClick = function() {
      gScene('travelMap', true);
    };
    this.data.buttons.push(fleeBtn);

    // --- Drop/Loot Display (cards, 86px height, if any items found) ---
    // Design: Cards 86px height, 8px gap, 14px margin, R.radius.m (8px)
    const lootY = btnY + 44 + 14;  // 274 + 44 + 14 = 332
    if (this.data.lootItems && this.data.lootItems.length > 0) {
      const gridCols = 3;
      const gridGap = 8;
      const mx = 14;  // 14px margin each side
      const cw = (G.W - mx * 2 - gridGap * (gridCols - 1)) / gridCols;
      const ch = 86;  // loot card height matches card design rule

      let idx = 0;
      for (const item of this.data.lootItems) {
        const c = idx % gridCols;
        const r = Math.floor(idx / gridCols);
        const bx = mx + c * (cw + gridGap);
        const by = lootY + r * (ch + gridGap);

        const btn = UI.Button(bx, by, cw, ch, '', 'transparent');
        btn._item = item;
        btn.render = function(ctx) {
          R.roundRect(ctx, this.x, this.y, this.w, this.h, R.radius.m, R.colors.surface);
          ctx.strokeStyle = 'rgba(232,160,48,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w - 1, this.h - 1);
          // Item icon
          const icon = item.icon || '?';
          R.textCenter(ctx, icon, this.x + this.w / 2, this.y + 28, R.colors.gold, R.fonts.xl);
          // Item name
          R.textCenter(ctx, item.name || 'Unknown', this.x + this.w / 2, this.y + this.h - 12, R.colors.textDim, R.fonts.sm);
        };
        btn.onClick = function() {
          // TODO: show item details
        };
        this.data.buttons.push(btn);
        idx++;
      }
      // Advance y past the loot grid
      const lootRows = Math.ceil(this.data.lootItems.length / gridCols);
      lootY += lootRows * (ch + gridGap) + 10;
    }

    // --- Log History (scrollable) ---
    // Log entries added as buttons; Scene.cullButtons + clipContent handles scrolling
    const logY = (this.data.lootItems && this.data.lootItems.length > 0)
      ? (lootY + 86 + 14)  // after loot grid if present
      : (btnY + 44 + 14);  // after action buttons if no loot
    let y = logY;

    const logSlice = this.data.log.slice(-6);
    for (const msg of logSlice) {
      const logBtn = UI.Button(14, y, G.W - 28, 18, '', 'transparent');
      logBtn._logMsg = msg;
      logBtn.render = function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        R.roundRect(ctx, this.x, this.y, this.w, this.h, 3, ctx.fillStyle);
        R.textCenter(ctx, this._logMsg, this.x + this.w / 2, this.y + 11, R.colors.text, R.fonts.sm);
      };
      this.data.buttons.push(logBtn);
      y += 20;
    }

    // --- Back/Leave button (standard back button pattern) ---
    // Design: standard back button, 44px height minimum
    const backY = y + 8;
    const backBtn = UI.Button(14, backY, G.W - 28, 44, 'Back to Map');
    backBtn.onClick = function() { gScene('travelMap', true); };
    this.data.buttons.push(backBtn);
    y += 44 + 6;  // 44px button + 6px gap

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
    this.data.currentEnemy = enemy;
    this.data.enemyHpPct = enemy.hp / enemy.maxHp * 100;
    this.checkZoneComplete();
    gScene('combatScene');
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

  render: function(ctx) {
    if (!this.data.zone) return;
    R.drawZoneBackground(ctx, this.data.zoneId);

    Scene.drawHeader(ctx, 122, this.data.zone.name, 24);

    // Exploration progress bar
    const pct = G.state.zoneProgress[this.data.zoneId] || 0;
    const pb = UI.ProgressBar(40, 56, G.W - 80, 12, R.colors.gold, R.colors.borderHairline);
    pb.setProgress(pct, 100);
    pb.text = '';
    pb.render(ctx);
    R.textCenter(ctx, 'Exploration: ' + pct + '%', G.W / 2, 74, R.colors.text, R.fonts.sm);

    if (this.data.zoneComplete) {
      R.textCenter(ctx, '\u2713 Zone Complete!', G.W / 2, 94, R.colors.green, R.fonts.md);
      R.textCenter(ctx, 'All mysteries unveiled', G.W / 2, 112, R.colors.textDim, R.fonts.sm);
    } else {
      const frac = Math.max(0, Math.min(1, this.data.encounterTimer / this.data.totalEncounterTimer));
      R.roundRect(ctx, 40, 88, G.W - 80, 6, 3, R.colors.accentMuted);
      R.roundRect(ctx, 40, 88, (G.W - 80) * frac, 6, 3, R.colors.borderFocus);
      R.textCenter(ctx, 'Next encounter: ' + this.data.encounterTimer.toFixed(1) + 's', G.W / 2, 104, R.colors.textDim, R.fonts.sm);
      R.textCenter(ctx, 'Exploring ' + this.data.zone.name + '...', G.W / 2, 118, R.colors.text, R.fonts.sm);
    }

    // Clip content for scrollable UI
    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    let ly = top + 4;

    // Log entries rendered as static text in the clip region
    const logSlice = this.data.log.slice(-6);
    for (const msg of logSlice) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      R.roundRect(ctx, 12, ly - 1, G.W - 24, 16, 3, ctx.fillStyle);
      R.textCenter(ctx, msg, G.W / 2, ly + 11, R.colors.text, R.fonts.sm);
      ly += 18;
    }

    // Render visible buttons (culling handles scroll)
    const vis = Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight());
    for (const b of vis) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY, 18);
  }
});