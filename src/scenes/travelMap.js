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

      // Two columns keep realm cards readable on the 400px mobile canvas.
      // A single-zone realm still gets the full-width editorial treatment.
      const gridCols = 2;
      const gridGap = 8;
      const mx = 14;
      const cols = Math.max(1, Math.min(group.zoneIds.length, gridCols));
      const cw = (G.W - mx * 2 - gridGap * (cols - 1)) / cols;
      const ch = 112;

      let idx = 0;
      for (const zoneId of group.zoneIds) {
        const zone = ZONES[zoneId];
        const access = ZoneAccess.status(zoneId);
        const pct = access.percentage;
        const complete = access.complete;
        const unlocked = access.allowed;

        const btn = UI.Button(mx + (idx % cols) * (cw + gridGap), y + Math.floor(idx / cols) * (ch + gridGap), cw, ch, '', unlocked ? R.colors.surface : R.colors.surfaceElevated);
        btn._zone = zone;
        btn._zoneId = zoneId;
        btn._pct = pct;
        btn._complete = complete;
        btn._unlocked = unlocked;
        btn._reqLevel = zone.reqLevel || 1;
        btn._reqZone = zone.reqZone;
        btn._reqZoneName = zone.reqZone && ZONES[zone.reqZone] ? ZONES[zone.reqZone].name : '';
        btn._isCurrentZone = zoneId === G.state.currentZone;
        btn._isVeteran = (G.state.tournamentWins || 0) >= 3;
        btn.data = { id: zoneId, zone };

        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;

          const statusColor = this._complete ? R.colors.success : (this._unlocked ? R.colors.accent : R.colors.textDim);
          const borderColor = this._complete ? R.colors.success : (this._unlocked ? R.colors.borderFocus : R.colors.borderHairline);
          const fillColor = this._unlocked ? R.colors.surface : R.colors.surfaceElevated;
          R.roundRect(ctx, bx, by, bw, bh, R.radius.m, fillColor);
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = this._isCurrentZone ? 2 : 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

          // Zone name and state stay on separate rows so narrow cards never
          // force the title, progress, or requirement into the same line.
          R.text(ctx, this._zone.name, bx + 12, by + 18, statusColor, R.fonts.md);
          const stateLabel = this._complete ? 'Complete' : (this._unlocked ? (this._isCurrentZone ? 'Current path' : 'Available') : 'Locked');
          R.text(ctx, stateLabel, bx + 12, by + 37, statusColor, R.fonts.sm);

          R.text(ctx, 'Progress ' + this._pct + '%', bx + 12, by + 58, R.colors.textSecondary, R.fonts.sm);
          R.textRight(ctx, 'Req. Lv ' + this._reqLevel, bx + bw - 12, by + 58, R.colors.textSecondary, R.fonts.sm);

          if (this._unlocked) {
            R.text(ctx, this._complete ? 'Path cleared' : 'Ready to explore', bx + 12, by + 82, R.colors.textDim, R.fonts.sm);
          } else {
            R.text(ctx, 'Need Level ' + this._reqLevel, bx + 12, by + 82, R.colors.warning, R.fonts.sm);
            R.text(ctx, this._reqZoneName ? 'Clear ' + this._reqZoneName : 'Previous zone required', bx + 12, by + 99, R.colors.textDim, R.fonts.xs);
          }

          // Veteran badge on the current zone card
          if (this._isCurrentZone && this._isVeteran) {
            const badgeW = 46;
            const badgeH = 16;
            R.roundRect(ctx, bx + bw - badgeW - 8, by + bh - badgeH - 6, badgeW, badgeH, 8, R.colors.gold);
            ctx.textAlign = 'center';
            ctx.fillStyle = R.colors.textPrimary;
            ctx.font = R.fonts.xs;
            ctx.fillText('Veteran', bx + bw - 8 - badgeW / 2, by + bh - 6 - badgeH / 2 + 4);
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

      const rows = Math.ceil(group.zoneIds.length / cols);
      y += rows * (ch + gridGap) + 10;
    }

    // Back button to ashram
    const back = UI.Button(60, y + 6, G.W - 120, 48, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true, { restoreScroll: true }); };
    this.data.buttons.push(back);
    y += 62;

    this.data.contentHeight = y;
  },

  buildActionButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const zone = ZONES[this.data.selectedZone];
    const access = ZoneAccess.status(this.data.selectedZone);
    const pct = access.percentage;
    const complete = access.complete;
    const unlocked = access.allowed;

    this.data.infoPanelHeight = 128;

    let y = this.getContentTop() + this.data.infoPanelHeight + 12;

    if (!complete) {
      const explore = UI.BtnGold(20, y, G.W - 40, 48, 'Explore Zone');
      explore.enabled = unlocked;
      if (!unlocked) explore.text = 'Explore Zone (Locked)';
      explore.onClick = function() {
        const result = ZoneAccess.enter(travelMapScene.data.selectedZone);
        if (!result.allowed) {
          Notify.show('This zone is still locked.', 2, R.colors.warning);
          return;
        }
        gScene('zoneExploration', true);
      };
      this.data.buttons.push(explore);
      y += 60;

      const boss = UI.Button(20, y, G.W - 40, 48, 'Fight Boss', R.colors.red, R.colors.orangeLight, R.colors.white);
      boss.enabled = unlocked;
      if (!unlocked) boss.text = 'Fight Boss (Locked)';
      boss.onClick = function() {
        const result = ZoneAccess.enter(travelMapScene.data.selectedZone);
        if (!result.allowed) {
          Notify.show('This zone is still locked.', 2, R.colors.warning);
          return;
        }
        G.state.isBossFight = true;
        G.state.returnToExploration = false;
        const bossEnemy = getZoneBoss(travelMapScene.data.selectedZone);
        Progression.applyDifficulty([bossEnemy]);
        G.state.currentEnemies = [bossEnemy];
        gScene('combatScene', true);
      };
      this.data.buttons.push(boss);
      y += 60;
    } else {
      y += 48;
    }

    // Back to zones button
    const back = UI.Button(20, y + 4, G.W - 40, 48, 'Back to Zones', R.colors.surfaceElevated, R.colors.btnHover, R.colors.textPrimary);
    const backRender = back.render;
    back.render = function(ctx) {
      backRender.call(this, ctx);
      ctx.strokeStyle = this._pressed ? R.colors.accent : R.colors.borderHairline;
      ctx.lineWidth = this._pressed ? 2 : 1;
      ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w - 1, this.h - 1);
    };
    back.onClick = function() {
      travelMapScene.data.selectedZone = null;
      travelMapScene.data.scrollY = 0;
      travelMapScene.buildZoneButtons();
    };
    this.data.buttons.push(back);
    y += 64;

    this.data.contentHeight = y;
  },

  renderInfoPanel: function(ctx, offsetY) {
    if (!this.data.selectedZone) return;
    const zone = ZONES[this.data.selectedZone];
    const access = ZoneAccess.status(this.data.selectedZone);
    const pct = access.percentage;
    const complete = access.complete;
    const unlocked = access.allowed;
    const y = offsetY;

    const shell = UI.PremiumShell(10, y, G.W - 20, this.data.infoPanelHeight, {
      outerR: R.radius.l,
      innerR: R.radius.m,
      outerBg: R.colors.surfaceElevated,
      outerBorder: unlocked ? R.colors.borderFocus : R.colors.borderHairline,
      innerBg: R.colors.panel,
      innerHighlight: R.colors.subtleWhite
    });
    shell.render(ctx);

    let iy = y + 14;
    const stateColor = complete ? R.colors.success : (unlocked ? R.colors.accent : R.colors.warning);
    const stateLabel = complete ? 'Complete' : (unlocked ? 'Available' : 'Locked');
    R.text(ctx, zone.name, 22, iy, stateColor, R.fonts.lg);
    R.textRight(ctx, stateLabel, G.W - 22, iy, stateColor, R.fonts.sm);
    R.text(ctx, zone.desc, 22, iy + 20, R.colors.textDim, R.fonts.sm);
    R.text(ctx, 'Progress: ' + pct + '%  |  Req Level: ' + (zone.reqLevel || 1), 22, iy + 40, R.colors.text, R.fonts.sm);

    if (zone.enemies && zone.enemies.length > 0) {
      const enemyNames = zone.enemies.slice(0, 3).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ');
      const suffix = zone.enemies.length > 3 ? '...' : '';
      R.text(ctx, 'Enemies: ' + enemyNames + suffix, 22, iy + 58, R.colors.textDim, R.fonts.sm);
    }

    if (!unlocked) {
      const reqZoneName = zone.reqZone && ZONES[zone.reqZone] ? ZONES[zone.reqZone].name : '';
      R.text(ctx, 'Locked: need Level ' + (zone.reqLevel || 1), 22, iy + 78, R.colors.warning, R.fonts.sm);
      R.text(ctx, reqZoneName ? 'Clear ' + reqZoneName + ' to unlock' : 'Complete the previous path to unlock', 22, iy + 96, R.colors.textDim, R.fonts.sm);
    } else {
      R.text(ctx, complete ? 'Path cleared — rewards secured' : 'Ready for exploration', 22, iy + 82, stateColor, R.fonts.sm);
    }

    // Use ProgressBar component for zone completion percentage
    const pb = UI.ProgressBar(22, iy + 106, G.W - 64, 8, complete ? R.colors.success : R.colors.gold, R.colors.borderHairline);
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
        gScene('ashram', true, { restoreScroll: true });
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
        gScene('ashram', true, { restoreScroll: true });
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
