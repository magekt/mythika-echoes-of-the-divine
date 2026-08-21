const ashramScene = Scene.create({
  name: 'ashram',
  data: {
    buttons: [],
    infoText: '',
    popup: null,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    Audio.playMusic('ashram');
    this.data.scrollY = 0;
    this.data.popup = null;
    this.buildMenu();
    SaveSystem.startAutoSave();
  },

  leave: function() {
    SaveSystem.stopAutoSave();
  },

  navBarHeight: 44,
  getContentTop: function() { return G.CONTENT_TOP; },
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
      { text: 'More', scene: '_more', icon: '\u2630' }
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
            const reqProgress = !zone.reqZone || (G.state.zoneProgress[zone.reqZone] || 0) >= 100;
            const reqLevel = (G.state.party || []).some(h => h.level >= (zone.reqLevel || 1));
            if (pct < 100 && reqProgress && reqLevel) badge++;
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
        } else if (this._scene === '_more') {
          gScene('settings', true);
        } else {
          gScene(this._scene, true);
        }
      };
      this.data.navButtons.push(btn);
    }
  },

  buildMenu: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.buildNavButtons();

    const cols = 3;
    const gap = 12;
    const ml = 18;
    const cw = (G.W - ml * 2 - gap * (cols - 1)) / cols;
    const cardH = 82;
    const rowGap = 8;

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
          { text: 'Fishing', scene: 'fishing', icon: '\u2248' }
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
          { text: 'Rebirth', scene: 'punarjanma', icon: '\u21BB' },
          { text: 'Settings', scene: 'settings', icon: '\u2630' },
          { text: 'Debug', scene: 'debug', icon: '\u25A0' }
        ]
      }
    ];

    let y = this.getContentTop();

    for (const section of sections) {
      const hdr = UI.Button(0, y, G.W, 22, '', 'transparent');
      hdr._isHeader = true;
      hdr._label = section.label;
      hdr._color = section.color;
      hdr.enabled = false;
      hdr.render = function(ctx) {
        const hx = 18, hy = this.y;
        ctx.fillStyle = 'rgba(138,138,160,0.08)';
        ctx.fillRect(hx, hy + 10, G.W - 36, 1);
        R.text(ctx, '\u2501  ' + this._label + '  \u2501', hx + 8, hy + 14, this._color, R.fonts.sm);
      };
      this.data.buttons.push(hdr);
      y += 22;

      const items = section.items;
      for (let i = 0; i < items.length; i += cols) {
        for (let j = 0; j < cols; j++) {
          const idx = i + j;
          if (idx >= items.length) break;
          const item = items[idx];
          const bx = ml + j * (cw + gap);
          const btn = UI.Button(bx, y, cw, cardH, '', R.colors.btn);
          btn._scene = item.scene;
          btn._icon = item.icon;
          btn._text = item.text;
          btn._accent = section.color;
          btn.render = function(ctx) {
            const bx = this.x, by = this.y, bw = this.w, bh = this.h;
            R.roundRect(ctx, bx, by, bw, bh, 10, R.colors.btn);
            R.roundRect(ctx, bx, by, bw, 6, 10, this._accent);
            ctx.fillRect(bx + 2, by + 6, bw - 4, 2);
            ctx.fillStyle = 'rgba(138,138,160,0.08)';
            ctx.fillRect(bx + 4, by + 10, bw - 8, 1);
            ctx.strokeStyle = 'rgba(138,138,160,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 0.5, by + 6.5, bw - 1, bh - 7);
            R.textCenter(ctx, this._icon, bx + bw / 2, by + 44, R.colors.text, R.fonts.xl);
            ctx.fillStyle = 'rgba(138,138,160,0.12)';
            ctx.fillRect(bx + 10, by + bh - 22, bw - 20, 1);
            R.textCenter(ctx, this._text, bx + bw / 2, by + bh - 10, this._accent, R.fonts.md);
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
          this.data.buttons.push(btn);
        }
        y += cardH + rowGap;
      }
      y += 4;
    }

    this.data.contentHeight = y + 20;
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
    UI.updateButtons(this.data.navButtons, dt);
    UI.handleButtons(this.data.navButtons);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
    UI.Modal.handleInput();
  },

  render: function(ctx) {
    const realm = REALMS.find(r => r.id === G.state.realm) || REALMS[0];

    R.roundRect(ctx, 10, 8, G.W - 20, 100, 10, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 8.5, G.W - 21, 99);

    R.textCenter(ctx, 'Ashram (Lv.' + G.state.ashramLevel + ')', G.W / 2, 24, R.colors.gold, R.fonts.lg);

    const p = G.state.player;
    if (p) {
      const hpPct = Math.floor(p.hp / p.maxHp * 100);
      const mpPct = Math.floor(p.mp / p.maxMp * 100);

      R.textCenter(ctx, p.name + ' \u2014 Lv.' + p.level + ' ' + (p.className || ''), G.W / 2, 44, R.colors.text, R.fonts.sm);
      R.textCenter(ctx, 'Realm: ' + realm.name + ' (Stage ' + G.state.realmStage + '/' + realm.stages + ')', G.W / 2, 56, R.colors.textDim, R.fonts.sm);

      ctx.fillStyle = 'rgba(200,48,48,0.15)';
      R.roundRect(ctx, 20, 62, G.W - 40, 7, 4, 'rgba(200,48,48,0.15)');
      ctx.fillStyle = p.hp > 0 ? R.colors.hp : R.colors.textDark;
      R.roundRect(ctx, 20, 62, (G.W - 40) * hpPct / 100, 7, 4, ctx.fillStyle);
      R.textCenter(ctx, Math.floor(p.hp) + '/' + p.maxHp, G.W / 2, 68, R.colors.white, R.fonts.sm);

      ctx.fillStyle = 'rgba(48,128,200,0.15)';
      R.roundRect(ctx, 20, 73, G.W - 40, 5, 3, 'rgba(48,128,200,0.15)');
      ctx.fillStyle = mpPct > 0 ? R.colors.mp : R.colors.textDark;
      R.roundRect(ctx, 20, 73, (G.W - 40) * mpPct / 100, 5, 3, ctx.fillStyle);
      R.textCenter(ctx, Math.floor(p.mp) + '/' + p.maxMp, G.W / 2, 77, R.colors.white, R.fonts.sm);
    }

    ctx.fillStyle = R.colors.gold;
    ctx.fillRect(18, 84, G.W - 36, 1);

    R.textCenter(ctx, '\u26A1 ' + Math.floor(G.state.gold || 0) + ' Gold', G.W / 2 - 95, 97, R.colors.gold, R.fonts.sm);
    R.textCenter(ctx, '\u2727 ' + Math.floor(G.state.karma || 0) + ' Karma', G.W / 2, 97, R.colors.blueLight, R.fonts.sm);
    R.textCenter(ctx, '\u2606 ' + (G.state.divineFragments || 0) + ' DF', G.W / 2 + 95, 97, R.colors.orange, R.fonts.sm);

    if (G.state.currentZone) {
      const zoneName = ZONES[G.state.currentZone] ? ZONES[G.state.currentZone].name : G.state.currentZone;
      const zonePct = G.state.zoneProgress[G.state.currentZone] || 0;
      R.textCenter(ctx, 'Zone: ' + zoneName + ' (' + zonePct + '%)', G.W / 2, 110, R.colors.textDim, R.fonts.sm);
    }

    const top = this.getContentTop();
    const contentH = this.getContentHeight();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, contentH);
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, contentH, this.data.scrollY, 18);

    for (const b of this.data.navButtons) b.render(ctx);

    UI.Modal.render(ctx);
    if (this.data.popup) this.data.popup.render(ctx);
  }
});
