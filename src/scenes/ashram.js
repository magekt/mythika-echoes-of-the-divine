const ashramScene = Scene.create({
  name: 'ashram',
  data: {
    buttons: [],
    infoText: '',
    popup: null,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function(options) {
    Hints.show('welcome', 'Welcome to your Ashram. Tap Travel to begin your journey.');
    if ((G.state.gold || 0) >= 100) Hints.show('bazaar', 'You have coin to spend — the Bazaar buys and sells gear.');
    Audio.playMusic('ashram');
    this.data.popup = null;
    this.buildMenu(!!(options && options.restoreScroll));
    SaveSystem.startAutoSave();
  },

  leave: function() {
    SaveSystem.stopAutoSave();
    this._fluidNav = null;
    this.data.buttons = [];
    this.data.navButtons = [];
    this.data.popup = null;
  },

  navBarHeight: 44,
  // Content scrolls below the fixed header stack (header 24-92, stats
  // 100-212, resources 222, zone 236 when active). Set per build in buildMenu.
  getContentTop: function() { return this.data.contentTop || 230; },
  getContentHeight: function() { return G.H - this.getContentTop() - this.navBarHeight; },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildNavButtons: function() {
    this.data.navButtons = [];
    const navItems = [
      { text: 'Map', scene: 'travelMap', icon: '\u25B6' },
      { text: 'Party', scene: 'party', icon: '\u263A' },
      { text: 'Shop', scene: 'bazaar', icon: '\u2699' },
      { text: 'Rest', scene: '', icon: '\u266B' },
      { text: 'More', scene: 'settings', icon: '\u2630' }
    ];
    const navY = G.H - this.navBarHeight;
    const navW = G.W / navItems.length;
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const btn = UI.Button(i * navW, navY, navW, this.navBarHeight, '', 'transparent');
      btn._scene = item.scene;
      btn._icon = item.icon;
      btn._text = item.text;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        ctx.fillStyle = 'rgba(26,32,64,0.95)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'rgba(138,138,160,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by);
        ctx.stroke();
        const active = G.state.scene === this._scene;
        const col = active ? R.colors.gold : R.colors.textDim;
        R.textCenter(ctx, this._icon, bx + bw / 2, by + 18, col, R.fonts.lg);
        R.textCenter(ctx, this._text, bx + bw / 2, by + 34, col, R.fonts.sm);

        let badge = 0;
        if (this._text === 'Map') {
          for (const [id, zone] of Object.entries(ZONES)) {
            const pct = G.state.zoneProgress[id] || 0;
            if (pct < 100 && ZoneAccess.status(id).allowed) badge++;
          }
        } else if (this._text === 'Party') {
          const hero = G.state.player;
          if (hero && hero.skillPoints && hero.skillPoints > 0) badge = hero.skillPoints;
        }
        if (badge > 0) {
          R.roundRect(ctx, bx + bw - 18, by + 2, 16, 14, 7, R.colors.red);
          R.textCenter(ctx, badge.toString(), bx + bw - 10, by + 12, R.colors.white, R.fonts.sm);
        }
      };
      btn.onClick = function() {
        if (this._scene === '') {
          for (const h of G.state.party) {
            h.hp = h.maxHp;
            h.mp = h.maxMp;
          }
          Notify.show('Party restored to full vitality', 2, R.colors.green);
        } else {
          gScene(this._scene, true);
        }
      };
      this.data.navButtons.push(btn);
    }
  },

  buildMenu: function(preserveScroll) {
    this.data.buttons = [];
    if (!preserveScroll) this.data.scrollY = 0;
    this.buildNavButtons();

    const sections = [
      {
        label: 'PROGRESSION', color: R.colors.orange,
        items: [
          { text: 'Travel', scene: 'travelMap', icon: '\u25B6' },
          { text: 'Party', scene: 'party', icon: '\u263A' },
          { text: 'Cultivate', scene: 'cultivationScene', icon: '\u2727' }
        ]
      },
      {
        label: 'ACTIVITIES', color: R.colors.blue,
        items: [
          { text: 'Alchemy', scene: 'alchemyScene', icon: '\u2606' },
          { text: 'Forge', scene: 'forge', icon: '\u2694' },
          { text: 'Beasts', scene: 'spiritBeast', icon: '\u2603' },
          { text: 'Farm', scene: 'farm', icon: '\u2618' },
          { text: 'Fishing', scene: 'fishing', icon: '\u2248' },
          { text: 'Journeys', scene: 'journeyScene', icon: '\u2726' }
        ]
      },
      {
        label: 'SERVICES', color: R.colors.green,
        items: [
          { text: 'Bazaar', scene: 'bazaar', icon: '\u2699' },
          { text: 'Equipment', scene: 'equipment', icon: '\u2694' },
          { text: 'Tourney', scene: 'tournament', icon: '\u2605' },
          { text: 'Quests', scene: 'questLog', icon: '\u2713' },
          { text: 'Achieve', scene: 'achievements', icon: '\u2605' }
        ]
      },
      {
        label: 'UTILITY', color: R.colors.textDim,
        items: [
          { text: 'Rest', scene: '', icon: '\u266B' },
          { text: 'Trials', scene: 'trials', icon: '\u2666', badge: G.state.trialBest || null },
          { text: 'Rebirth', scene: 'punarjanma', icon: '\u21BB' },
          { text: 'Settings', scene: 'settings', icon: '\u2630' },
          { text: 'Debug', scene: 'debug', icon: '\u25A0' }
        ]
      }
    ];

    // Fixed stack ends at 222 (236 with an active zone); content scrolls below it.
    this.data.contentTop = G.state.currentZone ? 248 : 230;
    let y = this.getContentTop();

    // Ashram Upgrade: steeper curve 1000*lv^1.5 gold + 5*lv DF → +0.05 cult/s, +0.5 prana/s & unlocks recipe tiers
    {
      const lv = G.state.ashramLevel || 1;
      const nextGold = Math.floor(1000 * Math.pow(lv, 1.5));
      const nextDF = 5 * lv;
      const canUpgrade = (G.state.gold || 0) >= nextGold && (G.state.divineFragments || 0) >= nextDF;
      const btn = UI.Button(14, y, G.W - 28, 36, '', canUpgrade ? R.colors.btnGold : R.colors.btn);
      btn._lv = lv;
      btn._nextGold = nextGold;
      btn._nextDF = nextDF;
      btn._canUpgrade = canUpgrade;
      btn.enabled = true;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 6, this._canUpgrade ? R.colors.btnGold : R.colors.btn);
        const label = 'Upgrade Ashram Lv.' + this._lv + ' \u2192 ' + (this._lv + 1) + '  (' + this._nextGold + 'g + ' + this._nextDF + ' DF)';
        R.textCenter(ctx, label, bx + bw / 2, by + 13, this._canUpgrade ? R.colors.white : R.colors.textDim, R.fonts.sm);
        R.textCenter(ctx, '+0.05 cultivation/s, +0.5 prana/s & unlocks recipes', bx + bw / 2, by + 26, this._canUpgrade ? R.colors.goldLight : R.colors.textDark, R.fonts.xs);
      };
      btn.onClick = function() {
        const lv2 = G.state.ashramLevel || 1;
        const costG = Math.floor(1000 * Math.pow(lv2, 1.5));
        const costDF = 5 * lv2;
        if ((G.state.gold || 0) < costG || (G.state.divineFragments || 0) < costDF) {
          Notify.show('Need ' + costG + 'g + ' + costDF + ' DF', 2, R.colors.red);
          return false;
        }
        Economy.spendGold(costG);
        Economy.spendDivineFragments(costDF);
        G.state.ashramLevel = lv2 + 1;
        Notify.show('Ashram upgraded to Lv.' + G.state.ashramLevel + '!', 2, R.colors.gold);
        Audio.levelUp();
        ashramScene.buildMenu();
      };
      this.data.buttons.push(btn);
      y += 42;
    }

    // 3-column section grid — uses the sections[] array defined above
    const gridCols = 3;
    const gridGap = 8;
    const mx = 14;
    const cw = (G.W - mx * 2 - gridGap * (gridCols - 1)) / gridCols;
    const ch = 86; // was 70

    for (const section of sections) {
      // Section header bar — button so it renders in the render(ctx) pass
      const hh = 26;
      const hdr = UI.Button(mx, y, G.W - mx * 2, hh, '', 'transparent');
      hdr._label = section.label;
      hdr._color = section.color;
      hdr.render = function(ctx) {
        R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.panel);
        R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.sm);
      };
      this.data.buttons.push(hdr);
      y += hh + 8;

      // 3-column cards
      let idx = 0;
      for (const item of section.items) {
        const c = idx % gridCols;
        const r = Math.floor(idx / gridCols);
        const bx = mx + c * (cw + gridGap);
        const by = y + r * (ch + gridGap);

        const btn = UI.Button(bx, by, cw, ch, '', 'transparent');
        btn._item = item;
        btn._scene = item.scene;
        btn._accent = section.color;
        btn.render = function(ctx) {
          R.roundRect(ctx, this.x, this.y, this.w, this.h, 8, R.colors.surface);
          ctx.strokeStyle = 'rgba(232,160,48,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w - 1, this.h - 1);
          R.textCenter(ctx, this._item.icon, this.x + this.w / 2, this.y + 34, this._accent, R.fonts.xl);
          R.textCenter(ctx, this._item.text, this.x + this.w / 2, this.y + this.h - 12, R.colors.textDim, R.fonts.sm);
          if (this._item.badge) {
            R.text(ctx, this._item.badge, this.x + this.w - 8, this.y + 12, R.colors.gold, R.fonts.xs, 'right');
          }
        };
        btn.onClick = function() {
          if (this._scene === '') {
            for (const h of G.state.party) { h.hp = h.maxHp; h.mp = h.maxMp; }
            Notify.show('Party restored to full vitality', 2, R.colors.green);
          } else {
            gScene(this._scene, true);
          }
        };
        this.data.buttons.push(btn);
        idx++;
      }
      const rows = Math.ceil(section.items.length / gridCols);
      y += rows * (ch + gridGap) + 10;
    }

    this.data.contentHeight = y + 20;
    this.clampScroll();
  },

  update: function(dt) {
    CultivationSystem.tick(dt);
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    if (this.data.popup) {
      this.data.popup.handleInput();
      return;
    }
    Scene.scrollInput(this);
    const swipe = Input.getSwipe();
    if (swipe === 'left' || swipe === 'right') {
      const scenes = ['ashram', 'travelMap', 'party', 'cultivationScene', 'alchemyScene', 'spiritBeast', 'bazaar', 'farm', 'fishing', 'tournament', 'questLog', 'achievements', 'settings'];
      const idx = scenes.indexOf('ashram');
      let next = 'ashram';
      if (swipe === 'left' && idx < scenes.length - 1) next = scenes[idx + 1];
      else if (swipe === 'right' && idx > 0) next = scenes[idx - 1];
      if (G.scenes[next]) gScene(next);
      return;
    }
    UI.updateButtons(this.data.buttons, dt);
    // Update fluid nav
    if (this._fluidNav) this._fluidNav.update(dt);
    // Handle fluid nav tap
    const tap = Input.peekTap();
    if (tap && this._fluidNav && this._fluidNav.handleTap(tap.x, tap.y)) {
      Input.getTap();
    }
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
    UI.Modal.handleInput();
  },

  render: function(ctx) {
    const realm = REALMS.find(r => r.id === G.state.realm) || REALMS[0];

    // Render noise/grain overlay for editorial luxury feel
    R.renderNoise(ctx);

    // Fixed header bands (unclipped) — stacked with no overlaps:
    // header 24-92, stats 100-212 (player only), resources 222,
    // zone 236 (when active). Scrollable content starts below at getContentTop().
    {
      const cx = G.W/2;
      R.roundRect(ctx, cx - 80, 24, 160, 24, 12, 'rgba(232,160,48,0.12)');
      R.textCenter(ctx, 'Lv.' + (G.state.ashramLevel || 1), cx, 40, R.colors.gold, R.fonts.sm);
      R.textCenter(ctx, 'Ashram', cx, 72, R.colors.textPrimary, R.fonts.displaySm);
      R.textCenter(ctx, 'Sanctuary • Cultivate • Forge', cx, 92, R.colors.textSecondary, R.fonts.sm);
    }

    // Player stats panel with PremiumShell (100-212; all children inside)
    const p = G.state.player;
    if (p) {
      const hpPct = Math.max(0, Math.min(100, Math.floor(p.hp / Math.max(1, p.maxHp) * 100)));
      const mpPct = Math.max(0, Math.min(100, Math.floor(p.mp / Math.max(1, p.maxMp) * 100)));

      const statsShell = UI.PremiumShell(10, 100, G.W - 20, 112, { outerR: 16 });
      statsShell.render(ctx);
      const content = statsShell.contentRect();

      R.textCenter(ctx, p.name + ' \u2014 Lv.' + p.level + ' ' + (p.className || ''), content.x + content.w/2, content.y + 12, R.colors.textPrimary, R.fonts.md);
      R.textCenter(ctx, 'Realm: ' + realm.name + ' (Stage ' + G.state.realmStage + '/' + realm.stages + ')', content.x + content.w/2, content.y + 30, R.colors.textSecondary, R.fonts.sm);

      // HP bar
      R.roundRect(ctx, content.x + 12, content.y + 44, content.w - 24, 8, 4, 'rgba(200,48,48,0.15)');
      ctx.fillStyle = p.hp > 0 ? R.colors.hp : R.colors.textDark;
      R.roundRect(ctx, content.x + 12, content.y + 44, Math.max(0, (content.w - 24) * hpPct / 100), 8, 4, ctx.fillStyle);
      R.textCenter(ctx, Math.floor(p.hp) + '/' + p.maxHp, content.x + content.w/2, content.y + 58, R.colors.white, R.fonts.sm);

      // MP bar
      R.roundRect(ctx, content.x + 12, content.y + 64, content.w - 24, 6, 3, 'rgba(48,128,200,0.15)');
      ctx.fillStyle = mpPct > 0 ? R.colors.mp : R.colors.textDark;
      R.roundRect(ctx, content.x + 12, content.y + 64, Math.max(0, (content.w - 24) * mpPct / 100), 6, 3, ctx.fillStyle);
      R.textCenter(ctx, Math.floor(p.mp) + '/' + p.maxMp, content.x + content.w/2, content.y + 76, R.colors.white, R.fonts.sm);
    }

    // Single-line resources row, clear of every panel
    R.textCenter(ctx, '\u26A1 ' + Math.floor(G.state.gold || 0) + 'g', G.W / 2 - 110, 222, R.colors.gold, R.fonts.sm);
    R.textCenter(ctx, '\u2727 ' + Math.floor(G.state.karma || 0), G.W / 2, 222, R.colors.blueLight, R.fonts.sm);
    R.textCenter(ctx, '\u2606 ' + (G.state.divineFragments || 0) + ' DF', G.W / 2 + 110, 222, R.colors.orange, R.fonts.sm);

    if (G.state.currentZone) {
      const zoneName = ZONES[G.state.currentZone] ? ZONES[G.state.currentZone].name : G.state.currentZone;
      const zonePct = G.state.zoneProgress[G.state.currentZone] || 0;
      R.textCenter(ctx, 'Zone: ' + zoneName + ' (' + zonePct + '%)', G.W / 2, 236, R.colors.textDim, R.fonts.sm);
    }

    const top = this.getContentTop();
    const contentH = this.getContentHeight();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, contentH);
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    const vis = Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight());
    for (const b of vis) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, contentH, this.data.scrollY, 18);

    // Render FluidNav instead of static navButtons
    if (!this._fluidNav) {
      this._fluidNav = Scene.FluidNav();
    }
    this._fluidNav.update(1/60); // approximate dt
    this._fluidNav.render(ctx);

    UI.Modal.render(ctx);
    if (this.data.popup) this.data.popup.render(ctx);
  }
});
