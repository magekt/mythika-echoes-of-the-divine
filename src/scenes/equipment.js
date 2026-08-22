const equipmentScene = Scene.create({
  name: 'equipment',
  data: {
    buttons: [],
    selectedHero: null,
    selectedItem: null,
    tab: 'inventory',
    scrollY: 0,
    contentHeight: 0,
    staticDraws: []
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.selectedHero = G.state.player;
    this.data.selectedItem = null;
    this.data.tab = 'inventory';
    this.buildUI();
  },

  getContentTop: function() { return G.CONTENT_TOP; },
  getContentHeight: function() { return G.H - this.getContentTop() - 44; },

  clampScroll: function() {
    const maxScroll = Math.max(0, this.data.contentHeight - this.getContentHeight());
    this.data.scrollY = Math.max(0, Math.min(this.data.scrollY, maxScroll));
  },

  buildUI: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    const invBtn = UI.Button(14, y, 95, 28, 'Inventory', this.data.tab === 'inventory' ? R.colors.btnGold : R.colors.btn);
    invBtn.onClick = function() { equipmentScene.data.tab = 'inventory'; equipmentScene.buildUI(); };
    this.data.buttons.push(invBtn);

    const equipBtn = UI.Button(115, y, 95, 28, 'Equipped', this.data.tab === 'equipped' ? R.colors.btnGold : R.colors.btn);
    equipBtn.onClick = function() { equipmentScene.data.tab = 'equipped'; equipmentScene.buildUI(); };
    this.data.buttons.push(equipBtn);

    const statsBtn = UI.Button(216, y, 95, 28, 'Stats', this.data.tab === 'stats' ? R.colors.btnGold : R.colors.btn);
    statsBtn.onClick = function() { equipmentScene.data.tab = 'stats'; equipmentScene.buildUI(); };
    this.data.buttons.push(statsBtn);

    y += 36;

    if (this.data.tab === 'inventory') {
      const items = (G.state.inventory || []).filter(i => typeof i === 'object' && i.type && (i.type === 'weapon' || i.type === 'armor' || i.type === 'accessory'));
      if (items.length === 0) {
        const ty = y + 20;
        SD.push({ textCenter: ['No equipment found', G.W / 2, ty, R.colors.textDim, R.fonts.sm] });
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const btn = UI.Button(14, y, G.W - 28, 36, '', R.colors.btn);
        btn._item = item;
        btn._index = i;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 6, this.color);
          ctx.strokeStyle = getLootColor(this._item.rarity);
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
          R.text(ctx, this._item.name, bx + 10, by + 14, getLootColor(this._item.rarity), R.fonts.md);
          R.text(ctx, this._item.rarityName, bx + 10, by + 28, R.colors.textDim, R.fonts.sm);
          const stats = [];
          if (this._item.atk) stats.push('ATK+' + this._item.atk);
          if (this._item.def) stats.push('DEF+' + this._item.def);
          if (this._item.mag) stats.push('MAG+' + this._item.mag);
          R.text(ctx, stats.join(' '), bx + bw - 10, by + 14, R.colors.gold, R.fonts.sm);
          ctx.textAlign = 'right';
          ctx.fillStyle = R.colors.textDim;
          ctx.font = R.fonts.sm;
          ctx.fillText(this._item.type.toUpperCase(), bx + bw - 10, by + 28);
          ctx.textAlign = 'left';
        };
        btn.onClick = function() {
          equipmentScene.data.selectedItem = this._item;
          equipmentScene.showEquipDialog();
        };
        this.data.buttons.push(btn);
        y += 40;
      }
    } else if (this.data.tab === 'equipped') {
      const hero = this.data.selectedHero;
      if (hero) {
        const slots = ['weapon', 'armor', 'accessory'];
        for (const slot of slots) {
          const equipped = hero[slot + 'Equipped'];
          const btn = UI.Button(14, y, G.W - 28, 42, '', R.colors.btn);
          btn._slot = slot;
          btn._item = equipped;
          btn.render = function(ctx) {
            const bx = this.x, by = this.y, bw = this.w, bh = this.h;
            R.roundRect(ctx, bx, by, bw, bh, 6, this.color);
            R.text(ctx, this._slot.toUpperCase(), bx + 10, by + 14, R.colors.textDim, R.fonts.sm);
            if (this._item) {
              R.text(ctx, this._item.name, bx + 10, by + 28, getLootColor(this._item.rarity), R.fonts.md);
            } else {
              R.text(ctx, 'Empty', bx + 10, by + 28, R.colors.textDark, R.fonts.md);
            }
          };
          btn.onClick = function() {
            if (this._item) {
              equipmentScene.unequipItem(this._slot);
            }
          };
          this.data.buttons.push(btn);
          y += 46;
        }
      }
    } else if (this.data.tab === 'stats') {
      const hero = this.data.selectedHero;
      if (hero) {
        const stats = [
          ['HP', hero.hp + '/' + hero.maxHp],
          ['MP', hero.mp + '/' + hero.maxMp],
          ['STR', hero.str],
          ['AGI', hero.agi],
          ['DEF', hero.def],
          ['MAG', hero.mag],
          ['Level', hero.level]
        ];
        for (const [label, value] of stats) {
          SD.push({ text: [label + ': ' + value, 22, y + 12, R.colors.text, R.fonts.md] });
          y += 20;
        }
      }
    }

    y += 10;
    const backBtn = UI.BtnGold(60, y, G.W - 120, 32, 'Back');
    backBtn.onClick = function() { gScene('ashram', true); };
    this.data.buttons.push(backBtn);
    y += 42;

    this.data.contentHeight = y;
    // Timestamp drives the 90ms content crossfade on tab switches.
    this.data._builtAt = performance.now();
  },

  showEquipDialog: function() {
    const item = this.data.selectedItem;
    const hero = this.data.selectedHero;
    if (!item || !hero) return;

    const slot = item.type === 'weapon' ? 'weaponEquipped' : item.type === 'armor' ? 'armorEquipped' : 'accessoryEquipped';
    const oldItem = hero[slot];
    
    // Swap only real inventory items back into the bag; legacy string slots are discarded.
    if (oldItem && typeof oldItem === 'object') {
      const idx = G.state.inventory.indexOf(oldItem);
      if (idx >= 0) G.state.inventory.splice(idx, 1);
      G.state.inventory.push(oldItem);
    }

    const invIdx = G.state.inventory.indexOf(item);
    if (invIdx >= 0) G.state.inventory.splice(invIdx, 1);
    hero[slot] = item;

    Notify.show('Equipped ' + item.name, 2, getLootColor(item.rarity));
    this.buildUI();
  },

  unequipItem: function(slotType) {
    const hero = this.data.selectedHero;
    if (!hero) return;
    
    const slot = slotType + 'Equipped';
    const item = hero[slot];
    if (!item) return;

    hero[slot] = null;

    // Legacy saves may hold plain strings in gear slots — discard instead of re-inventorying.
    if (typeof item === 'string') {
      Notify.show('Removed legacy gear', 2, R.colors.textDim);
      this.buildUI();
      return;
    }

    if (!G.state.inventory) G.state.inventory = [];
    G.state.inventory.push(item);
    
    Notify.show('Unequipped ' + item.name, 2, R.colors.text);
    this.buildUI();
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 104);
    R.textCenter(ctx, 'Equipment', G.W / 2, 24, R.colors.gold, R.fonts.lg);
    if (this.data.selectedHero) {
      R.textCenter(ctx, this.data.selectedHero.name + ' Lv.' + this.data.selectedHero.level, G.W / 2, 44, R.colors.text, R.fonts.sm);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    // Content crossfade on tab switch (chrome above stays anchored).
    const bt = this.data._builtAt;
    const fade = (!bt || G.state.reduceMotion) ? 1 : Math.min(1, (performance.now() - bt) / 90);
    ctx.globalAlpha = ctx.globalAlpha * fade;
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight())) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);
    ctx.globalAlpha = 1;

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
