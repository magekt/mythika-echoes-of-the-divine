const forgeScene = Scene.create({
  name: 'forge',
  data: {
    buttons: [],
    selectedHero: null,
    staticDraws: [],
    slot: null,
    upgradeCosts: { weapon: 30, armor: 25, accessory: 20 },
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.buttons = [];
    this.data.selectedHero = null;
    this.data.slot = null;
    this.data.scrollY = 0;
    this.buildHeroList();
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

  buildHeroList: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    for (const hero of G.state.party) {
      const btn = UI.Button(14, y, G.W - 28, 54, '', R.colors.panel);
      btn._hero = hero;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 6, R.colors.panel);
        ctx.strokeStyle = 'rgba(138,138,160,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        R.drawHero(ctx, this._hero.id, bx + 10, by + 8, 20);
        R.text(ctx, this._hero.name + ' \u2014 Lv.' + this._hero.level, bx + 40, by + 16, R.colors.gold, R.fonts.md);
        R.text(ctx, 'Wpn Lv.' + this._hero.weaponLvl + ' | Arm Lv.' + this._hero.armorLvl + ' | Acc Lv.' + this._hero.accessoryLvl, bx + 40, by + 34, R.colors.textDim, R.fonts.sm);
      };
      btn.onClick = function() {
        const h = this._hero;
        forgeScene.data.selectedHero = h;
        forgeScene.data.scrollY = 0;
        forgeScene.buildSlotMenu();
      };
      this.data.buttons.push(btn);
      y += 60;
    }

    // Empty state: without this, a hero-less Forge looks like dead buttons.
    if (G.state.party.length === 0) {
      SD.push({ textCenter: ['No heroes yet.', G.W / 2, y + 22, R.colors.text, R.fonts.md] });
      SD.push({ textCenter: ['Recruit your first hero at the Party hall.', G.W / 2, y + 40, R.colors.textDim, R.fonts.sm] });
      y += 56;
    }

    this.data.buttons.push(Scene.backButton(y + 6, { fade: true }));
    y += 44;

    this.data.contentHeight = y;
  },

  buildSlotMenu: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const hero = this.data.selectedHero;
    let y = this.getContentTop();

    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    const infoStr = 'Upgrading: ' + hero.name + '  |  Gold: ' + (G.state.gold || 0) + 'g';
    SD.push({ text: [infoStr, 18, y + 4, R.colors.text, R.fonts.sm] });
    y += 20;

    const slots = [
      { id: 'weapon', label: 'Weapon (' + Scene.gearLabel(hero.weaponEquipped) + ' Lv.' + hero.weaponLvl + ')', cost: this.data.upgradeCosts.weapon },
      { id: 'armor', label: 'Armor (' + Scene.gearLabel(hero.armorEquipped) + ' Lv.' + hero.armorLvl + ')', cost: this.data.upgradeCosts.armor },
      { id: 'accessory', label: 'Accessory (' + Scene.gearLabel(hero.accessoryEquipped) + ' Lv.' + hero.accessoryLvl + ')', cost: this.data.upgradeCosts.accessory }
    ];

    for (const slot of slots) {
      const canAfford = (G.state.gold || 0) >= slot.cost;
      const btn = UI.Button(14, y, G.W - 28, 44, '', canAfford ? R.colors.btnGold : R.colors.btn);
      btn._slot = slot;
      btn._canAfford = canAfford;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 6, this.color);
        if (!this._canAfford) ctx.globalAlpha = 0.5;
        R.roundRect(ctx, bx, by, 4, bh, 0, R.colors.gold);
        R.text(ctx, this._slot.label, bx + 14, by + 14, R.colors.text, R.fonts.sm);
        R.text(ctx, 'Cost: ' + this._slot.cost + 'g', bx + 14, by + 30, this._canAfford ? R.colors.gold : R.colors.red, R.fonts.sm);
        ctx.globalAlpha = 1;
      };
      btn.onClick = function() {
        const s = this._slot;
        forgeScene.upgradeSlot(s.id);
      };
      this.data.buttons.push(btn);
      y += 50;
    }

    const back = UI.Button(60, y + 8, G.W - 120, 30, 'Back to Heroes', R.colors.btnGold);
    back.onClick = function() {
      forgeScene.data.selectedHero = null;
      forgeScene.data.scrollY = 0;
      forgeScene.buildHeroList();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  upgradeSlot: function(slotId) {
    const hero = this.data.selectedHero;
    const cost = this.data.upgradeCosts[slotId];
    const slotName = slotId.charAt(0).toUpperCase() + slotId.slice(1);

    if (!Economy.spendGoldOrNotify(cost)) return false;
    if (slotId === 'weapon') { hero.weaponLvl++; }
    else if (slotId === 'armor') { hero.armorLvl++; }
    else if (slotId === 'accessory') { hero.accessoryLvl++; }
    this.data.upgradeCosts[slotId] = Math.floor(cost * 1.5);
    Notify.show(slotName + ' upgraded to Lv.' + (slotId === 'weapon' ? hero.weaponLvl : slotId === 'armor' ? hero.armorLvl : hero.accessoryLvl) + '!', 2);
    Audio.levelUp();
    this.buildSlotMenu();
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 74, 'Forge', 22);
    R.textCenter(ctx, 'Gold: ' + (G.state.gold || 0) + 'g', G.W / 2, 46, R.colors.gold, R.fonts.sm);
    if (this.data.selectedHero) {
      R.textCenter(ctx, 'Upgrading: ' + this.data.selectedHero.name, G.W / 2, 66, R.colors.text, R.fonts.sm);
    } else {
      R.textCenter(ctx, 'Select a hero to upgrade:', G.W / 2, 66, R.colors.text, R.fonts.sm);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    UI.Modal.render(ctx);
  }
});
