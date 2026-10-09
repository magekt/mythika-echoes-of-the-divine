const spiritBeastScene = Scene.create({
  name: 'spiritBeast',
  data: {
    beasts: [],
    buttons: [],
    view: 'list',
    selectedBeast: null,
    scrollY: 0,
    contentHeight: 0,
    staticDraws: []
  },

  enter: function() {
    this.data.beasts = G.state.spiritBeasts || [];
    this.data.view = 'list';
    this.data.selectedBeast = null;
    this.data.scrollY = 0;
    this.buildList();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.beasts = [];
    this.data.selectedBeast = null;
    this.data.scrollY = 0;
  },

  getContentTop: function() { return 88; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildList: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    if (this.data.beasts.length === 0) {
      y += 10;
      SD.push({ text: ['No spirit beasts yet.', 20, y, R.colors.textDim, R.fonts.sm] });
      y += 18;
      SD.push({ text: ['Defeat enemies to find beasts!', 20, y, R.colors.textDim, R.fonts.sm] });
      y += 40;
    } else {
      for (const beast of this.data.beasts) {
        const active = beast.active || beast.id === G.state.activeBeast;
        // 86px card height per design system, with 8px gap below
        const btn = UI.Button(14, y, G.W - 28, 86, '', active ? R.colors.green : R.colors.panel);
        btn._beast = beast;
        btn._active = active;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
          ctx.strokeStyle = 'rgba(232,160,48,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          if (!this._active) ctx.globalAlpha = 0.7;
          const beastData = SPIRIT_BEASTS[this._beast.id];
          R.text(ctx, (this._active ? '\u2605 ' : '') + this._beast.name, bx + 14, by + 16, this._active ? R.colors.gold : R.colors.text, R.fonts.md);
          R.text(ctx, 'Tier ' + this._beast.tier + ' Lv.' + this._beast.level + ' | ' + (beastData ? beastData.skill : '?'), bx + 14, by + 30, R.colors.textDim, R.fonts.sm);
          // Stats row
          const bonus = getBeastBonus(beast);
          R.text(ctx, 'HP:' + bonus.hp + ' STR:' + bonus.str + ' AGI:' + bonus.agi + ' DEF:' + bonus.def, bx + 14, by + 48, R.colors.textDim, R.fonts.xs);
          // Phase 26 beast hearts: one hearts line, guarded (absent BeastBond = current card).
          try {
            if (typeof BeastBond !== 'undefined' && BeastBond && typeof BeastBond.get === 'function') {
              const h = BeastBond.get(this._beast.id).heart || 0;
              R.text(ctx, 'Bond: ' + '♥'.repeat(h) + '♡'.repeat(3 - h), bx + 14, by + 62, R.colors.gold, R.fonts.xs);
            }
          } catch (e) {}
          if (this._active) R.text(ctx, 'ACTIVE', bx + bw - 60, by + 16, R.colors.green, R.fonts.sm);
          ctx.globalAlpha = 1;
        };
        btn.onClick = function() {
          const b = this._beast;
          spiritBeastScene.data.selectedBeast = b;
          spiritBeastScene.data.view = 'detail';
          spiritBeastScene.data.scrollY = 0;
          spiritBeastScene.buildDetail();
        };
        this.data.buttons.push(btn);
        y += 92; // 86px card + 8px gap per design system
      }
    }

    const deactivate = UI.MagneticBtn(14, y + 4, (G.W - 42) / 2, 38, 'Deactivate All');
    deactivate.onClick = function() {
      for (const b of G.state.spiritBeasts) b.active = false;
      G.state.activeBeast = null;
      Notify.show('All beasts deactivated.', 2);
      spiritBeastScene.enter();
    };
    this.data.buttons.push(deactivate);

    const back = UI.MagneticBtn((G.W - 42) / 2 + 18, y + 4, (G.W - 42) / 2, 38, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', false, { restoreScroll: true }); };
    this.data.buttons.push(back);
    y += 48; // 38px button + 8px gap + 2px adjustment

    this.data.contentHeight = y;
  },

  buildDetail: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    const beast = this.data.selectedBeast;
    const beastData = SPIRIT_BEASTS[beast.id];
    let y = this.getContentTop();

    const infoH = (function() {
      try {
        if (typeof BeastBond !== 'undefined' && BeastBond && typeof BeastBond.statusFor === 'function') return 96;
      } catch (e) {}
      return 80;
    })();
    SD.push({ rect: [10, y, G.W - 20, infoH, 6, R.colors.panel] });
    let iy = y + 12;
    SD.push({ text: [beast.name + ' (Tier ' + beast.tier + ' Lv.' + beast.level + ')', 22, iy, R.colors.gold, R.fonts.md] });
    SD.push({ text: ['Skill: ' + (beast.skill || '?'), 22, iy + 20, R.colors.text, R.fonts.sm] });
    const bonus = getBeastBonus(beast);
    SD.push({ text: ['HP:' + bonus.hp + ' STR:' + bonus.str + ' AGI:' + bonus.agi + ' MAG:' + bonus.mag + ' DEF:' + bonus.def, 22, iy + 38, R.colors.textDim, R.fonts.sm] });
    // Phase 26 beast hearts: hearts + XP progress line (guarded; absent BeastBond = legacy layout).
    try {
      if (typeof BeastBond !== 'undefined' && BeastBond && typeof BeastBond.statusFor === 'function') {
        const st = BeastBond.statusFor(beast.id);
        const hh = Math.max(0, Math.min(3, st.heart || 0));
        const prog = 'Bond: ' + '♥'.repeat(hh) + '♡'.repeat(3 - hh) + '  Bond XP: ' + st.xp + (st.nextAt ? '/' + st.nextAt : ' (MAX)');
        SD.push({ text: [prog, 22, iy + 56, R.colors.gold, R.fonts.sm] });
      }
    } catch (e) {}
    if (beast.passiveDesc) {
      SD.push({ text: ['Passive: ' + beast.passiveDesc, 22, iy + (infoH > 80 ? 74 : 56), R.colors.green, R.fonts.sm] });
    } else {
      SD.push({ text: ['Active: ' + (beast.active ? 'Yes' : 'No'), 22, iy + (infoH > 80 ? 74 : 56), beast.active ? R.colors.green : R.colors.textDim, R.fonts.sm] });
    }

    y += infoH + 8;

    if (canEvolve(beast)) {
      const evo = getBeastEvolution(beast.id, beast.level);
      if (evo) {
        SD.push({ rect: [14, y, G.W - 28, 60, 6, R.colors.panel], stroke: [15, y + 1, G.W - 30, 58, R.colors.gold] });
        SD.push({ text: ['EVOLUTION AVAILABLE:', 22, y + 14, R.colors.gold, R.fonts.sm] });
        SD.push({ text: [evo.name, 22, y + 30, R.colors.orange, R.fonts.md] });
        SD.push({ text: [evo.desc, 22, y + 46, R.colors.text, R.fonts.sm] });
        y += 66;
        
        const evolveBtn = UI.MagneticBtn(14, y, G.W - 28, 38, 'Evolve to ' + evo.name + '!', 'primary');
        evolveBtn.onClick = function() {
          const result = evolveBeast(beast);
          if (result) {
            Notify.show(beast.name + ' evolved!', 3, R.colors.gold);
            Audio.levelUp();
            spiritBeastScene.buildDetail();
          }
        };
        this.data.buttons.push(evolveBtn);
        y += 46; // 38px button + 8px gap
      }
    }

    const pranaCost = beast.level * 50;
    const fishCost = beast.tier * 5;

    const activateBtn = UI.MagneticBtn(14, y, G.W - 28, 38, beast.active ? 'Deactivate' : 'Activate', beast.active ? 'primary' : 'primary');
    activateBtn.onClick = function() {
      if (beast.active) {
        beast.active = false;
        G.state.activeBeast = null;
        Notify.show('Deactivated.', 2);
      } else {
        for (const b of G.state.spiritBeasts) b.active = false;
        beast.active = true;
        G.state.activeBeast = beast.id;
        Notify.show(beast.name + ' activated!', 2);
      }
      spiritBeastScene.buildDetail();
    };
    this.data.buttons.push(activateBtn);
    y += 46;

    const canPrana = (G.state.prana || 0) >= pranaCost;
    const pranaBtn = UI.MagneticBtn(14, y, G.W - 28, 38, 'Level Up (' + pranaCost + ' Prana)', canPrana ? 'primary' : 'secondary');
    pranaBtn.enabled = canPrana;
    pranaBtn.onClick = function() {
      if ((G.state.prana || 0) < pranaCost) return;
      G.state.prana -= pranaCost;
      beast.level++;
      beast.maxHp += 2;
      beast.hp = beast.maxHp;
      beast.str += 1;
      beast.agi += 1;
      beast.def += 1;
      beast.mag += 1;
      Notify.show(beast.name + ' reached Lv.' + beast.level + '!', 2);
      Audio.levelUp();
      spiritBeastScene.enter();
    };
    this.data.buttons.push(pranaBtn);
    y += 46;

    const canFish = (G.state.fishCaught || 0) >= fishCost;
    const fishBtn = UI.MagneticBtn(14, y, G.W - 28, 38, 'Evolve Tier (' + fishCost + ' Fish)', canFish ? 'primary' : 'secondary');
    fishBtn.enabled = canFish;
    fishBtn.onClick = function() {
      if ((G.state.fishCaught || 0) < fishCost) return;
      G.state.fishCaught -= fishCost;
      beast.tier++;
      beast.maxHp += 10;
      beast.hp = beast.maxHp;
      beast.str += 3;
      beast.agi += 3;
      beast.def += 3;
      beast.mag += 3;
      Notify.show(beast.name + ' evolved to Tier ' + beast.tier + '!', 3, R.colors.gold);
      Audio.levelUp();
      spiritBeastScene.enter();
    };
    this.data.buttons.push(fishBtn);
    y += 48;

    // Phase 26 beast hearts: feed + prana/gold training via BeastBond.
    // The scene never mutates gold/inventory/prana directly; every denial
    // explains itself via Toast. Hidden when BeastBond is absent.
    try {
      if (typeof BeastBond !== 'undefined' && BeastBond && typeof BeastBond.feed === 'function') {
        const hasBond = function() {
          try { return typeof BeastBond.statusFor === 'function'; } catch (e) { return false; }
        }();
        if (hasBond) {
          const say = function(msg, color) {
            try {
              if (typeof UI !== 'undefined' && UI.Feedback) UI.Feedback.Toast(msg, { color: color || R.colors.text, icon: '♥' });
              else Notify.show(msg, 2);
            } catch (e) {}
          };
          const deny = function(r) {
            if (!r || r.ok) return false;
            if (r.reason === 'capped') say('Care limit reached for today — bonds deepen with rest.', R.colors.textDim);
            else if (r.reason === 'cooldown') say('Training cooldown: ' + Math.max(1, Math.ceil((r.retryMs || 0) / 1000)) + 's', R.colors.textDim);
            else if (r.reason === 'no_item') say('No feed item — harvest a crop or brew a herb.', R.colors.textDim);
            else if (r.reason === 'no_gold') say('Not enough gold (need ' + (r.need || 0) + 'g).', R.colors.red);
            else if (r.reason === 'no_prana') say('Not enough prana (need ' + (r.need || 0) + ').', R.colors.red);
            else say('This beast cannot train right now.', R.colors.textDim);
            return true;
          };
          const praise = function(r, xpText) {
            if (r.heartUp) {
              say(beast.name + ' bond deepened! Hearts: ' + r.heart + '/3', R.colors.gold);
              try { Audio.levelUp(); } catch (e) {}
            } else {
              say(xpText + ' bond XP', R.colors.green);
            }
            spiritBeastScene.buildDetail();
          };
          const heartNow = (function() {
            try { return BeastBond.get(beast.id).heart || 0; } catch (e) { return 0; }
          })();
          const firstFeedItem = function() {
            try {
              const inv = (typeof G !== 'undefined' && G.state && G.state.inventory) || [];
              for (const it of inv) {
                if (it && BeastBond.isFeedItem(it)) return it;
              }
            } catch (e) {}
            return null;
          };
          let feedGold = 20;
          try { feedGold = BeastBond.feedGoldFor(heartNow); } catch (e) {}
          let trainGold = 40;
          try { trainGold = BeastBond.trainGoldFor(heartNow); } catch (e) {}
          const pick = firstFeedItem();
          const feedBtn = UI.MagneticBtn(14, y, G.W - 28, 38, pick ? 'Feed ' + pick.name + ' (' + feedGold + 'g)' : 'Feed (need herb/draught)', pick ? 'primary' : 'secondary');
          feedBtn.onClick = function() {
            try {
              const item = (function() {
                try {
                  const inv = (G.state && G.state.inventory) || [];
                  for (const it of inv) {
                    if (it && BeastBond.isFeedItem(it)) return it;
                  }
                } catch (e) {}
                return null;
              })();
              if (!item) { say('No feed item — harvest a crop or brew a herb.', R.colors.textDim); return; }
              const r = BeastBond.feed(beast.id, item.name);
              if (!r || !r.ok) { deny(r); return; }
              praise(r, 'Yum! +11');
            } catch (e) {}
          };
          this.data.buttons.push(feedBtn);
          y += 46;

          const pranaBtn = UI.MagneticBtn(14, y, G.W - 28, 38, 'Train (' + BeastBond.PRANA_COST + ' prana)', 'primary');
          pranaBtn.onClick = function() {
            try {
              const r = BeastBond.pranaTrain(beast.id);
              if (!r || !r.ok) { deny(r); return; }
              praise(r, '+6');
            } catch (e) {}
          };
          this.data.buttons.push(pranaBtn);
          y += 46;

          const goldBtn = UI.MagneticBtn(14, y, G.W - 28, 38, 'Intense Train (' + trainGold + 'g)', 'primary');
          goldBtn.onClick = function() {
            try {
              const r = BeastBond.goldTrain(beast.id);
              if (!r || !r.ok) { deny(r); return; }
              praise(r, '+14');
            } catch (e) {}
          };
          this.data.buttons.push(goldBtn);
          y += 48;
        }
      }
    } catch (e) {}

    const back = UI.MagneticBtn(60, y + 4, G.W - 120, 38, 'Back to List', R.colors.btnGold);
    back.onClick = function() {
      spiritBeastScene.data.view = 'list';
      spiritBeastScene.data.scrollY = 0;
      spiritBeastScene.buildList();
    };
    this.data.buttons.push(back);
    y += 48;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 76, 'Spirit Beasts', 22);
    R.textCenter(ctx, 'Active: ' + (G.state.activeBeast ? ((SPIRIT_BEASTS[G.state.activeBeast] || {}).name || G.state.activeBeast) : 'None'), G.W / 2, 46, R.colors.gold, R.fonts.sm);
    R.textCenter(ctx, 'Prana: ' + Math.floor(G.state.prana || 0) + ' | Fish: ' + (G.state.fishCaught || 0), G.W / 2, 64, R.colors.text, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    Scene.drawStatic(ctx, this.data.staticDraws);
    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
