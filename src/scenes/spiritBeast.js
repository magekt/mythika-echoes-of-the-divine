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
        const btn = UI.Button(14, y, G.W - 28, 44, '', active ? R.colors.green : R.colors.panel);
        btn._beast = beast;
        btn._active = active;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 6, this.color);
          ctx.strokeStyle = 'rgba(138,138,160,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          if (!this._active) ctx.globalAlpha = 0.7;
          const beastData = SPIRIT_BEASTS[this._beast.id];
          R.text(ctx, (this._active ? '\u2605 ' : '') + this._beast.name, bx + 14, by + 16, this._active ? R.colors.gold : R.colors.text, R.fonts.md);
          R.text(ctx, 'Tier ' + this._beast.tier + ' Lv.' + this._beast.level + ' | ' + (beastData ? beastData.skill : '?'), bx + 14, by + 32, R.colors.textDim, R.fonts.sm);
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
        y += 50;
      }
    }

    const deactivate = UI.Button(14, y + 4, (G.W - 42) / 2, 28, 'Deactivate All');
    deactivate.onClick = function() {
      for (const b of G.state.spiritBeasts) b.active = false;
      G.state.activeBeast = null;
      Notify.show('All beasts deactivated.', 2);
      spiritBeastScene.enter();
    };
    this.data.buttons.push(deactivate);

    const back = UI.Button((G.W - 42) / 2 + 18, y + 4, (G.W - 42) / 2, 28, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
    y += 40;

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

    const infoH = 80;
    SD.push({ rect: [10, y, G.W - 20, infoH, 6, R.colors.panel] });
    let iy = y + 12;
    SD.push({ text: [beast.name + ' (Tier ' + beast.tier + ' Lv.' + beast.level + ')', 22, iy, R.colors.gold, R.fonts.md] });
    SD.push({ text: ['Skill: ' + (beast.skill || '?'), 22, iy + 20, R.colors.text, R.fonts.sm] });
    const bonus = getBeastBonus(beast);
    SD.push({ text: ['HP:' + bonus.hp + ' STR:' + bonus.str + ' AGI:' + bonus.agi + ' MAG:' + bonus.mag + ' DEF:' + bonus.def, 22, iy + 38, R.colors.textDim, R.fonts.sm] });
    if (beast.passiveDesc) {
      SD.push({ text: ['Passive: ' + beast.passiveDesc, 22, iy + 56, R.colors.green, R.fonts.sm] });
    } else {
      SD.push({ text: ['Active: ' + (beast.active ? 'Yes' : 'No'), 22, iy + 56, beast.active ? R.colors.green : R.colors.textDim, R.fonts.sm] });
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
        
        const evolveBtn = UI.Button(14, y, G.W - 28, 32, 'Evolve to ' + evo.name + '!', R.colors.btnGold);
        evolveBtn.onClick = function() {
          const result = evolveBeast(beast);
          if (result) {
            Notify.show(beast.name + ' evolved!', 3, R.colors.gold);
            Audio.levelUp();
            spiritBeastScene.buildDetail();
          }
        };
        this.data.buttons.push(evolveBtn);
        y += 38;
      }
    }

    const pranaCost = beast.level * 50;
    const fishCost = beast.tier * 5;

    const activateBtn = UI.Button(14, y, G.W - 28, 30, beast.active ? 'Deactivate' : 'Activate', R.colors.btnGold);
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
    y += 36;

    const canPrana = (G.state.prana || 0) >= pranaCost;
    const pranaBtn = UI.Button(14, y, G.W - 28, 30, 'Level Up (' + pranaCost + ' Prana)', canPrana ? R.colors.btnGold : R.colors.btn);
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
    y += 36;

    const canFish = (G.state.fishCaught || 0) >= fishCost;
    const fishBtn = UI.Button(14, y, G.W - 28, 30, 'Evolve Tier (' + fishCost + ' Fish)', canFish ? R.colors.btnGold : R.colors.btn);
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
    y += 40;

    const back = UI.Button(60, y + 4, G.W - 120, 30, 'Back to List', R.colors.btnGold);
    back.onClick = function() {
      spiritBeastScene.data.view = 'list';
      spiritBeastScene.data.scrollY = 0;
      spiritBeastScene.buildList();
    };
    this.data.buttons.push(back);
    y += 44;

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
