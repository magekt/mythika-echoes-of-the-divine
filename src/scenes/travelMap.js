const travelMapScene = Scene.create({
  name: 'travelMap',
  data: {
    buttons: [],
    selectedZone: null,
    zoneInfo: null,
    scrollY: 0,
    contentHeight: 0,
    infoPanelHeight: 0
  },

  enter: function() {
    this.data.buttons = [];
    this.data.selectedZone = null;
    this.data.zoneInfo = null;
    this.data.scrollY = 0;
    this.buildZoneButtons();
  },

  getContentTop: function() { return G.CONTENT_TOP; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildZoneButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    let y = this.getContentTop();

    for (const [id, zone] of Object.entries(ZONES)) {
      const pct = G.state.zoneProgress[id] || 0;
      const complete = pct >= 100;
      const reqProgress = !zone.reqZone || (G.state.zoneProgress[zone.reqZone] || 0) >= 100;
      const reqLevel = (G.state.party || []).some(h => h.level >= (zone.reqLevel || 1));
      const unlocked = (reqProgress && reqLevel) || complete;

      const btn = UI.Button(14, y, G.W - 28, 50, '', complete ? R.colors.green : (unlocked ? R.colors.panel : R.colors.btn));
      btn._data = { id, zone, unlocked, complete };
      btn._zone = zone;
      btn._pct = pct;
      btn._unlocked = unlocked;
      btn._complete = complete;
      btn.enabled = unlocked;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 8, this.color);
        ctx.strokeStyle = 'rgba(138,138,160,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        if (!this._unlocked) ctx.globalAlpha = 0.5;
        const statusColor = this._complete ? R.colors.green : (this._unlocked ? R.colors.gold : R.colors.textDim);
        R.text(ctx, this._zone.name, bx + 14, by + 16, statusColor, R.fonts.md);
        R.text(ctx, this._pct + '%', bx + 14, by + 34, R.colors.textDim, R.fonts.sm);
        if (this._complete) {
          ctx.textAlign = 'right';
          ctx.fillStyle = R.colors.green;
          ctx.font = R.fonts.sm;
          ctx.fillText('Complete', bx + bw - 14, by + 20);
          ctx.textAlign = 'left';
        } else if (!this._unlocked) {
          ctx.textAlign = 'right';
          ctx.fillStyle = R.colors.textDim;
          ctx.font = R.fonts.sm;
          const reqProgress = !this._zone.reqZone || (G.state.zoneProgress[this._zone.reqZone] || 0) >= 100;
          const reqLevel = (G.state.party || []).some(h => h.level >= (this._zone.reqLevel || 1));
          let label = '';
          if (!reqProgress) {
            const reqName = ZONES[this._zone.reqZone] ? ZONES[this._zone.reqZone].name : this._zone.reqZone;
            label = 'Need: ' + reqName;
          }
          if (!reqLevel) label = label ? label + ' Lv' + (this._zone.reqLevel||1) + '+' : 'Lv' + (this._zone.reqLevel||1) + '+';
          ctx.fillText(label, bx + bw - 14, by + 20);
          ctx.textAlign = 'left';
        }
        ctx.globalAlpha = 1;
      };
      btn.onClick = function() {
        const d = this._data;
        travelMapScene.data.selectedZone = d.id;
        travelMapScene.data.zoneInfo = d.zone;
        travelMapScene.data.scrollY = 0;
        travelMapScene.buildActionButtons();
      };
      this.data.buttons.push(btn);
      y += 56;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 32, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true); };
    this.data.buttons.push(back);
    y += 46;

    this.data.contentHeight = y;
  },

  buildActionButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const zone = ZONES[this.data.selectedZone];
    const pct = G.state.zoneProgress[this.data.selectedZone] || 0;
    const complete = pct >= 100;

    this.data.infoPanelHeight = 90;

    let y = this.getContentTop() + this.data.infoPanelHeight + 10;

    if (!complete) {
      const explore = UI.BtnGold(30, y, G.W - 60, 36, 'Explore Zone');
      explore.onClick = function() {
        G.state.zoneProgress[travelMapScene.data.selectedZone] = G.state.zoneProgress[travelMapScene.data.selectedZone] || 0;
        G.state.currentZone = travelMapScene.data.selectedZone;
        gScene('zoneExploration', true);
      };
      this.data.buttons.push(explore);
      y += 42;

      const boss = UI.Button(30, y, G.W - 60, 36, 'Fight Boss', R.colors.red);
      boss.onClick = function() {
        G.state.currentZone = travelMapScene.data.selectedZone;
        G.state.isBossFight = true;
        G.state.returnToExploration = false;
        const bossEnemy = getZoneBoss(travelMapScene.data.selectedZone);
        Progression.applyDifficulty([bossEnemy]);
        G.state.currentEnemies = [bossEnemy];
        gScene('combatScene', true);
      };
      this.data.buttons.push(boss);
      y += 42;
    } else {
      y += 36;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 30, 'Back to Zones', R.colors.btnGold);
    back.onClick = function() {
      travelMapScene.data.selectedZone = null;
      travelMapScene.data.scrollY = 0;
      travelMapScene.buildZoneButtons();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  renderInfoPanel: function(ctx, offsetY) {
    if (!this.data.selectedZone) return;
    const zone = ZONES[this.data.selectedZone];
    const pct = G.state.zoneProgress[this.data.selectedZone] || 0;
    const y = offsetY;

    R.roundRect(ctx, 10, y, G.W - 20, this.data.infoPanelHeight, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, y + 0.5, G.W - 21, this.data.infoPanelHeight - 1);

    let iy = y + 14;
    R.text(ctx, zone.name, 22, iy, R.colors.gold, R.fonts.lg);
    R.text(ctx, zone.desc, 22, iy + 20, R.colors.textDim, R.fonts.sm);
    R.text(ctx, 'Progress: ' + pct + '%  |  Req Level: ' + (zone.reqLevel || 1), 22, iy + 38, R.colors.text, R.fonts.sm);

    if (zone.enemies && zone.enemies.length > 0) {
      const enemyNames = zone.enemies.slice(0, 3).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ');
      const suffix = zone.enemies.length > 3 ? '...' : '';
      R.text(ctx, 'Enemies: ' + enemyNames + suffix, 22, iy + 54, R.colors.textDim, R.fonts.sm);
    }

    const pb = UI.ProgressBar(22, iy + 66, G.W - 64, 8, R.colors.gold, '#2a1510');
    pb.setProgress(pct, 100);
    pb.render(ctx);
  },

  update: function(dt) {
    const backTap = Input.peekTap();
    if (backTap && backTap.x >= 14 && backTap.x <= 74 && backTap.y >= 10 && backTap.y <= 34) {
      Input.getTap();
      if (this.data.selectedZone) {
        this.data.selectedZone = null;
        this.data.scrollY = 0;
        this.buildZoneButtons();
      } else {
        gScene('ashram', true);
      }
      return;
    }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 104);

    const backBtn = UI.Button(14, 10, 60, 24, '\u2190 Back', R.colors.btn);
    backBtn.onClick = function() {
      if (travelMapScene.data.selectedZone) {
        travelMapScene.data.selectedZone = null;
        travelMapScene.data.scrollY = 0;
        travelMapScene.buildZoneButtons();
      } else {
        gScene('ashram', true);
      }
    };
    backBtn.render(ctx);

    R.textCenter(ctx, 'Travel Map', G.W / 2, 24, R.colors.gold, R.fonts.lg);
    const challenge = Progression.getChallenge();
    const threatLabel = challenge < 0.8 ? 'Calm' : challenge < 1.0 ? 'Steady' : challenge < 1.2 ? 'Intense' : 'Relentless';
    R.textCenter(ctx, 'Threat: ' + threatLabel + ' (' + Math.round(challenge * 100) + '%)', G.W / 2, 44, R.colors.textDim, R.fonts.sm);

    if (this.data.selectedZone) {
      const zone = ZONES[this.data.selectedZone];
      R.textCenter(ctx, zone.name, G.W / 2, 66, R.colors.gold, R.fonts.sm);
      R.textCenter(ctx, zone.desc, G.W / 2, 84, R.colors.textDim, R.fonts.sm);
    } else {
      R.textCenter(ctx, 'Select a zone to explore:', G.W / 2, 66, R.colors.text, R.fonts.sm);
      R.textCenter(ctx, G.state.currentZone ? 'Current: ' + (ZONES[G.state.currentZone] ? ZONES[G.state.currentZone].name : G.state.currentZone) : '', G.W / 2, 84, R.colors.textDim, R.fonts.sm);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    if (this.data.selectedZone) {
      this.renderInfoPanel(ctx, this.getContentTop());
    }
    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
