const travelMapScene = Scene.create({
  name: 'travelMap',
  data: {
    buttons: [],
    selectedZone: null,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    Hints.show('map', 'Locked zones list their requirements. Explore a zone to 100% to advance.');
    this.data.buttons = [];
    this.data.selectedZone = null;
    this.data.scrollY = 0;
    this.buildZoneButtons();
  },

  leave: function() {
    this.data.buttons = [];
    this.data.selectedZone = null;
    this.data.scrollY = 0;
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

  // Group zones by realm/category with section headers
  groupZonesByRealm: function() {
    const groups = {
      manushya: { label: 'Manushya Realm', color: R.colors.gold, zoneIds: [] },
      sadhaka: { label: 'Sadhaka Realm', color: R.colors.blue, zoneIds: [] },
      yogi: { label: 'Yogi Realm', color: R.colors.orange, zoneIds: [] },
      siddha: { label: 'Siddha Realm', color: R.colors.green, zoneIds: [] },
      mukta: { label: 'Mukta Realm', color: R.colors.gold, zoneIds: [] }
    };

    for (const [id, zone] of Object.entries(ZONES)) {
      if (zone.realm in groups) {
        groups[zone.realm].zoneIds.push(id);
      }
    }

    const result = [];
    for (const [key, group] of Object.entries(groups)) {
      if (group.zoneIds.length > 0) {
        result.push(group);
      }
    }
    return result;
  },

  buildZoneButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;

    const zoneGroups = this.groupZonesByRealm();
    let y = this.getContentTop();

    for (const group of zoneGroups) {
      // Section header bar — 26px height, panel bg, accent color label
      const hh = 26;
      const hdr = UI.Button(14, y, G.W - 28, hh, '', 'transparent');
      hdr._label = group.label;
      hdr._color = group.color;
      hdr.render = function(ctx) {
        R.roundRect(ctx, this.x, this.y, this.w, this.h, R.radius.m, R.colors.panel);
        R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.sm);
      };
      this.data.buttons.push(hdr);
      y += hh + 8;

      // 3-column cards for zones in this group
      const gridCols = 3;
      const gridGap = 8;
      const mx = 14;
      const cw = (G.W - mx * 2 - gridGap * (gridCols - 1)) / gridCols;
      const ch = 86; // Card height per design system

      let idx = 0;
      for (const zoneId of group.zoneIds) {
        const zone = ZONES[zoneId];
        const pct = G.state.zoneProgress[zoneId] || 0;
        const complete = pct >= 100;
        const reqProgress = !zone.reqZone || (G.state.zoneProgress[zone.reqZone] || 0) >= 100;
        const reqLevel = (G.state.party || []).some(h => h.level >= (zone.reqLevel || 1));
        const unlocked = (reqProgress && reqLevel) || complete;

        const btn = UI.Button(mx + (idx % gridCols) * (cw + gridGap), y + Math.floor(idx / gridCols) * (ch + gridGap), cw, ch, '', unlocked ? R.colors.surface : R.colors.btn);
        btn._zone = zone;
        btn._zoneId = zoneId;
        btn._pct = pct;
        btn._complete = complete;
        btn._unlocked = unlocked;
        btn._reqLevel = zone.reqLevel || 1;
        btn._reqZone = zone.reqZone;
        btn.data = { id: zoneId, zone };

        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;

          if (this._unlocked) {
            // Open card: surface background with subtle gold border
            R.roundRect(ctx, bx, by, bw, bh, R.radius.m, R.colors.surface);
            ctx.strokeStyle = 'rgba(232,160,48,0.08)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          } else {
            // Locked card: dimmed with lock indicator
            ctx.globalAlpha = 0.5;
            R.roundRect(ctx, bx, by, bw, bh, R.radius.m, R.colors.surface);
            ctx.strokeStyle = 'rgba(232,160,48,0.08)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
            ctx.globalAlpha = 1;

            // Lock icon in card center
            ctx.textAlign = 'center';
            ctx.fillStyle = R.colors.gold;
            ctx.font = R.fonts.xl;
            ctx.fillText('\u26a1', bx + bw / 2, by + bh / 2 + 4);
          }

          // Zone name — status color based on state
          const statusColor = this._complete ? R.colors.green : (this._unlocked ? R.colors.gold : R.colors.textDim);
          R.text(ctx, this._zone.name, bx + 14, by + 16, statusColor, R.fonts.md);

          // Progress percentage
          R.text(ctx, this._pct + '%', bx + 14, by + 34, R.colors.textDim, R.fonts.sm);

          // Level requirement on the right side
          R.text(ctx, 'Lv ' + this._reqLevel, bx + bw - 14, by + 34, R.colors.textDim, R.fonts.sm, 'right');

          // Complete indicator
          if (this._complete) {
            ctx.textAlign = 'right';
            ctx.fillStyle = R.colors.green;
            ctx.font = R.fonts.sm;
            ctx.fillText('Complete', bx + bw - 14, by + 20);
            ctx.textAlign = 'left';
          }
        };

        btn.onClick = function() {
          const d = this.data;
          travelMapScene.data.selectedZone = d.id;
          travelMapScene.data.scrollY = 0;
          travelMapScene.buildActionButtons();
        };

        this.data.buttons.push(btn);
        idx++;
      }

      const rows = Math.ceil(group.zoneIds.length / gridCols);
      y += rows * (ch + gridGap) + 10;
    }

    // Back button to ashram
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

    // Back to zones button
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

    R.roundRect(ctx, 10, y, G.W - 20, this.data.infoPanelHeight, R.radius.m, R.colors.panel);
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

    // Use ProgressBar component for zone completion percentage
    const pb = UI.ProgressBar(22, iy + 66, G.W - 64, 8, R.colors.gold, R.colors.borderHairline);
    pb.setProgress(pct, 100);
    pb.render(ctx);
  },

  update: function(dt) {
    // Handle back tap — works both when zone selected and when no zone selected
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
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight())) b.render(ctx);
    UI.HUD().render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY, 18);
  }
});