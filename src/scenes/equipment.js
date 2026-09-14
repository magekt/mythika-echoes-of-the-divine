function equipmentFitText(ctx, text, maxWidth, font) {
  ctx.save();
  ctx.font = font;
  let value = String(text || '');
  if (ctx.measureText(value).width <= maxWidth) {
    ctx.restore();
    return value;
  }
  while (value.length > 1 && ctx.measureText(value + '\u2026').width > maxWidth) value = value.slice(0, -1);
  ctx.restore();
  return value.replace(/\s+\S*$/, '') + '\u2026';
}

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

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.selectedHero = null;
    this.data.selectedItem = null;
    this.data.scrollY = 0;
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

    // --- Tabs: equal rhythm, with explicit 44px action targets ---
    const tabH = 48;
    const tabGap = 8;
    const tabW = (G.W - 28 - tabGap * 2) / 3;
    const tabX = function(index) { return 14 + index * (tabW + tabGap); };

    // MagneticBtn owns the text baseline (center + 4px), keeping each label
    // visually centered in the full 44px hit area instead of near its top edge.
    const tabButton = function(index, label, active) {
      return UI.MagneticBtn(tabX(index), y, tabW, tabH, label, {
        variant: active ? 'primary' : 'secondary'
      });
    };

    const invBtn = tabButton(0, 'Inventory', this.data.tab === 'inventory');
    invBtn.onClick = function() {
      if (equipmentScene.data.tab === 'inventory') return false;
      equipmentScene.data.tab = 'inventory';
      equipmentScene.buildUI();
    };
    this.data.buttons.push(invBtn);

    const equipBtn = tabButton(1, 'Equipped', this.data.tab === 'equipped');
    equipBtn.onClick = function() {
      if (equipmentScene.data.tab === 'equipped') return false;
      equipmentScene.data.tab = 'equipped';
      equipmentScene.buildUI();
    };
    this.data.buttons.push(equipBtn);

    const statsBtn = tabButton(2, 'Stats', this.data.tab === 'stats');
    statsBtn.onClick = function() {
      if (equipmentScene.data.tab === 'stats') return false;
      equipmentScene.data.tab = 'stats';
      equipmentScene.buildUI();
    };
    this.data.buttons.push(statsBtn);

    y += tabH + 12;

    // --- Inventory: two-column cards keep item names legible ---
    if (this.data.tab === 'inventory') {
      const items = (G.state.inventory || []).filter(i => typeof i === 'object' && i.type && (i.type === 'weapon' || i.type === 'armor' || i.type === 'accessory'));
      const mx = 14;
      const gridGap = 8;
      const gridCols = 2;
      const cw = (G.W - mx * 2 - gridGap * (gridCols - 1)) / gridCols;
      const cardH = 100;

      if (items.length === 0) {
        const emptyShell = UI.PremiumShell(mx, y, G.W - mx * 2, 132, { outerR: 10, innerBg: R.colors.surfaceElevated });
        SD.push({ render: function(ctx) {
          emptyShell.render(ctx);
          const c = emptyShell.contentRect();
          R.roundRect(ctx, c.x + c.w / 2 - 18, c.y + 4, 36, 36, 18, R.colors.accentMuted);
          R.textCenter(ctx, '◇', c.x + c.w / 2, c.y + 29, R.colors.accent, R.fonts.lg);
          R.textCenter(ctx, 'Your inventory is quiet', c.x + c.w / 2, c.y + 58, R.colors.textPrimary, R.fonts.md);
          R.textCenter(ctx, equipmentFitText(ctx, 'Find equipment on the road, then return here to equip it.', c.w - 16, R.fonts.sm), c.x + c.w / 2, c.y + 78, R.colors.textSecondary, R.fonts.sm);
        }});
        y += 144;
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const c = i % gridCols;
        const r = Math.floor(i / gridCols);
        const bx = mx + c * (cw + gridGap);
        const by = y + r * (cardH + gridGap);

        const btn = UI.Button(bx, by, cw, cardH, '', R.colors.surface);
        btn._item = item;
        btn._index = i;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, R.radius.m, R.colors.surface);
          ctx.strokeStyle = R.colors.borderHairline;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          R.text(ctx, equipmentFitText(ctx, this._item.name, bw - 20, R.fonts.md), bx + 10, by + 18, getLootColor(this._item.rarity), R.fonts.md);
          R.text(ctx, equipmentFitText(ctx, this._item.rarityName, bw - 20, R.fonts.md), bx + 10, by + 36, R.colors.textSecondary, R.fonts.md);
          const stats = [];
          if (this._item.atk) stats.push('ATK+' + this._item.atk);
          if (this._item.def) stats.push('DEF+' + this._item.def);
          if (this._item.mag) stats.push('MAG+' + this._item.mag);
          R.textRight(ctx, equipmentFitText(ctx, stats.join(' '), bw - 20, R.fonts.sm), bx + bw - 10, by + 58, R.colors.accent, R.fonts.sm);
          R.textRight(ctx, this._item.type.toUpperCase(), bx + bw - 10, by + 76, R.colors.textSecondary, R.fonts.md);
        };
        btn.onClick = function() {
          equipmentScene.data.selectedItem = this._item;
          equipmentScene.showEquipDialog();
        };
        this.data.buttons.push(btn);
      }
      // Advance y past all cards + gap
      const nRows = Math.ceil(items.length / gridCols);
      y += nRows * (cardH + gridGap) + 10;
    }
    // --- Equipped: 3 slots with proper touch targets ---
    else if (this.data.tab === 'equipped') {
      const hero = this.data.selectedHero;
      if (hero) {
        const slots = ['weapon', 'armor', 'accessory'];
        for (const slot of slots) {
          const equipped = hero[slot + 'Equipped'];
          const btn = UI.Button(14, y, G.W - 28, 56, '', R.colors.surface); // comfortable touch target
          btn._slot = slot;
          btn._item = equipped;
          btn.render = function(ctx) {
            const bx = this.x, by = this.y, bw = this.w, bh = this.h;
            R.roundRect(ctx, bx, by, bw, bh, R.radius.m, R.colors.surface);
            ctx.strokeStyle = R.colors.borderHairline;
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
            R.text(ctx, this._slot.toUpperCase(), bx + 10, by + 18, R.colors.textSecondary, R.fonts.sm);
            if (this._item) {
              R.text(ctx, equipmentFitText(ctx, this._item.name, bw - 20, R.fonts.md), bx + 10, by + 40, getLootColor(this._item.rarity), R.fonts.md);
            } else {
              R.text(ctx, 'Empty', bx + 10, by + 40, R.colors.textDim, R.fonts.md);
            }
          };
          btn.onClick = function() {
            if (this._item) {
              equipmentScene.unequipItem(this._slot);
            }
          };
          this.data.buttons.push(btn);
          y += 60; // 56px height + 4px gap
        }
      }
    }
    // --- Stats tab ---
    else if (this.data.tab === 'stats') {
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
          SD.push({ text: [label + ': ' + value, 22, y + 14, R.colors.textPrimary, R.fonts.md] });
          y += 28;
        }
        if (hero.classId) {
          SD.push({ text: ['Class: ' + hero.classId.charAt(0).toUpperCase() + hero.classId.slice(1), 22, y + 14, R.colors.accent, R.fonts.md] });
          y += 28;
        }
        if (hero.skills) {
          for (const skill of hero.skills) {
            SD.push({ text: [skill.name + ': ' + skill.desc, 22, y + 14, R.colors.textSecondary, R.fonts.sm] });
            y += 24;
          }
        }
      }
    }

    // --- Back button ---
    y += 10;
    const backBtn = UI.MagneticBtn(60, y, G.W - 120, 48, 'Back', { variant: 'primary' });
    backBtn.onClick = function() { gScene('ashram', true, { restoreScroll: true }); };
    this.data.buttons.push(backBtn);
    y += 48;

    this.data.contentHeight = y;
    // Timestamp drives the 90ms content crossfade on tab switches.
    this.data._builtAt = performance.now();
  },

  showEquipDialog: function() {
    const item = this.data.selectedItem;
    const hero = this.data.selectedHero;
    if (!item || !hero) return;

    const result = EquipmentSystem.equip(hero, item);
    if (!result.ok) {
      const message = result.reason === 'incompatible-weapon'
        ? hero.name + ' cannot use ' + item.name + '!'
        : 'Cannot equip ' + item.name + '.';
      Notify.show(message, 2, R.colors.red);
      Audio.error();
      return;
    }

    Notify.show('Equipped ' + item.name, 2, getLootColor(item.rarity));
    this.buildUI();
  },

  unequipItem: function(slotType) {
    const hero = this.data.selectedHero;
    if (!hero) return;
    const result = EquipmentSystem.unequip(hero, slotType);
    if (!result.ok) return;
    
    Notify.show('Unequipped ' + result.item.name, 2, R.colors.textPrimary);
    this.buildUI();
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 104);
    R.textCenter(ctx, 'Equipment', G.W / 2, 24, R.colors.accent, R.fonts.lg);
    if (this.data.selectedHero) {
      R.textCenter(ctx, equipmentFitText(ctx, this.data.selectedHero.name + ' Lv.' + this.data.selectedHero.level, G.W - 40, R.fonts.sm), G.W / 2, 44, R.colors.textPrimary, R.fonts.sm);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    // Content crossfade on tab switch (chrome above stays anchored).
    const bt = this.data._builtAt;
    const fade = (!bt || G.state.reduceMotion) ? 1 : Math.min(1, (performance.now() - bt) / 90);
    ctx.globalAlpha = ctx.globalAlpha * fade;
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight())) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);
    for (const draw of this.data.staticDraws) {
      if (draw.render) draw.render(ctx);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
