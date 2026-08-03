const partyScene = Scene.create({
  name: 'party',
  data: {
    selectedHero: null,
    buttons: [],
    view: 'list',
    itemsView: false,
    equipSlot: null,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.selectedHero = null;
    this.data.view = 'list';
    this.data.itemsView = false;
    this.data.equipSlot = null;
    this.data.scrollY = 0;
    this.buildList();
  },

  getContentTop: function() { return 74; },
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
    let y = this.getContentTop();

    R.textCenter(G.ctx, '', 0, 0, '');

    for (const hero of G.state.party) {
      const alive = hero.hp > 0;
      const btn = UI.Button(14, y, G.W - 28, 66, '', alive ? R.colors.panel : R.colors.btn);
      btn._hero = hero;
      btn._alive = alive;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 8, this.color);
        ctx.strokeStyle = 'rgba(138,138,160,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        if (!this._alive) ctx.globalAlpha = 0.5;
        R.drawHero(ctx, this._hero.id, bx + 10, by + 8, 20);
        R.text(ctx, this._hero.name, bx + 40, by + 14, this._alive ? R.colors.gold : R.colors.textDim, R.fonts.md);
        const cls = this._hero.role + (this._hero.className ? ' ' + this._hero.className : '');
        R.text(ctx, 'Lv.' + this._hero.level + ' ' + cls, bx + 40, by + 30, R.colors.text, R.fonts.sm);
        const hpPct = this._hero.hp / Math.max(1, this._hero.maxHp);
        const mpPct = this._hero.mp / Math.max(1, this._hero.maxMp);
        R.roundRect(ctx, bx + 40, by + 44, bw - 56, 4, 2, 'rgba(200,48,48,0.2)');
        R.roundRect(ctx, bx + 40, by + 44, Math.max(0, (bw - 56) * hpPct), 4, 2, R.colors.hp);
        R.roundRect(ctx, bx + 40, by + 50, bw - 56, 3, 2, 'rgba(48,128,200,0.2)');
        R.roundRect(ctx, bx + 40, by + 50, Math.max(0, (bw - 56) * mpPct), 3, 2, R.colors.mp);
        R.text(ctx, Math.floor(this._hero.hp) + '/' + this._hero.maxHp, bx + 40, by + 62, R.colors.white, R.fonts.xs);
        R.text(ctx, Math.floor(this._hero.mp) + '/' + this._hero.maxMp, bx + 40 + 80, by + 62, R.colors.white, R.fonts.xs);
        ctx.globalAlpha = 1;
      };
      btn.onClick = function() { partyScene.selectHero(this._hero); };
      this.data.buttons.push(btn);
      y += 72;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 32, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true); };
    this.data.buttons.push(back);
    y += 50;

    this.data.contentHeight = y;
  },

  selectHero: function(hero) {
    this.data.selectedHero = hero;
    this.data.view = 'detail';
    this.data.itemsView = false;
    this.data.equipSlot = null;
    this.data.scrollY = 0;
    this.buildDetail();
  },

  getDetailInfoHeight: function() {
    const hero = this.data.selectedHero;
    if (!hero) return 0;
    let h = 116;
    h += 20;
    h += 48;
    if (hero.skills && hero.skills.length) {
      h += 16;
      h += hero.skills.length * 14;
      if (hero.signalSkill) h += 16;
    }
    if (hero.regenHpPct || hero.mpRegen || hero.baseCrit || hero.elementalDmgPct || hero.ailmentDurationBonus || hero.partyHpBuff) {
      h += 16;
      let count = 0;
      if (hero.baseCrit) count++;
      if (hero.elementalDmgPct) count++;
      if (hero.ailmentDurationBonus) count++;
      if (hero.regenHpPct) count++;
      if (hero.mpRegen) count++;
      if (hero.partyHpBuff) count++;
      h += count * 14 + 6;
    }
    return h;
  },

  renderDetailInfo: function(ctx, offsetY) {
    const hero = this.data.selectedHero;
    if (!hero) return;
    let y = offsetY;

    R.roundRect(ctx, 10, y, G.W - 20, 110, 8, R.colors.panel);

    let hy = y + 12;
    R.drawHero(ctx, hero.id, 22, hy, 28);
    R.text(ctx, hero.name, 58, hy + 10, R.colors.gold, R.fonts.lg);
    const titleStr = hero.title || '';
    const clsStr = hero.role + (hero.className ? ' [' + hero.className + ']' : '');
    R.text(ctx, 'Lv.' + hero.level + ' ' + clsStr, 58, hy + 30, R.colors.text, R.fonts.sm);
    if (titleStr) R.text(ctx, '"' + titleStr + '"', 58, hy + 44, R.colors.textDim, R.fonts.sm);

    const hpPct = hero.hp / Math.max(1, hero.maxHp);
    const mpPct = hero.mp / Math.max(1, hero.maxMp);
    R.roundRect(ctx, 58, hy + 52, 160, 5, 2, 'rgba(200,48,48,0.2)');
    R.roundRect(ctx, 58, hy + 52, Math.max(0, 160 * hpPct), 5, 2, R.colors.hp);
    R.text(ctx, Math.floor(hero.hp) + '/' + hero.maxHp, 220, hy + 56, R.colors.white, R.fonts.xs);
    R.roundRect(ctx, 58, hy + 60, 160, 5, 2, 'rgba(48,128,200,0.2)');
    R.roundRect(ctx, 58, hy + 60, Math.max(0, 160 * mpPct), 5, 2, R.colors.mp);
    R.text(ctx, Math.floor(hero.mp) + '/' + hero.maxMp, 220, hy + 64, R.colors.white, R.fonts.xs);

    y += 116;

    const statLine = 'STR:' + hero.str + '  AGI:' + hero.agi + '  MAG:' + hero.mag + '  DEF:' + hero.def;
    R.text(ctx, statLine, 18, y, R.colors.text, R.fonts.sm);
    y += 18;

    const equipLine = 'Weapon: ' + hero.weaponEquipped + ' (Lv.' + hero.weaponLvl + ')' + (hero.equipAtk ? ' +' + hero.equipAtk + ' ATK' : '');
    R.text(ctx, equipLine, 18, y, R.colors.textDim, R.fonts.sm);
    y += 14;
    R.text(ctx, 'Armor: ' + hero.armorEquipped + ' (Lv.' + hero.armorLvl + ')' + (hero.equipDef ? ' +' + hero.equipDef + ' DEF' : ''), 18, y, R.colors.textDim, R.fonts.sm);
    y += 14;
    R.text(ctx, 'Accessory: ' + hero.accessoryEquipped + ' (Lv.' + hero.accessoryLvl + ')' + (hero.equipAccMag ? ' +' + hero.equipAccMag + ' MAG' : ''), 18, y, R.colors.textDim, R.fonts.sm);
    y += 20;

    if (hero.skills && hero.skills.length) {
      R.text(ctx, 'Skills:', 18, y, R.colors.gold, R.fonts.sm);
      y += 16;
      for (const s of hero.skills) {
        R.text(ctx, '\u25C6 ' + s.name + ': ' + s.desc, 22, y, R.colors.text, R.fonts.sm);
        y += 14;
      }
      if (hero.signalSkill) {
        R.text(ctx, '\u2605 Signal: ' + hero.signalSkill.name, 22, y, R.colors.gold, R.fonts.sm);
        y += 16;
      }
    }

    if (hero.regenHpPct || hero.mpRegen || hero.baseCrit || hero.elementalDmgPct || hero.ailmentDurationBonus || hero.partyHpBuff) {
      R.text(ctx, 'Passives:', 18, y, R.colors.gold, R.fonts.sm);
      y += 16;
      if (hero.baseCrit) { R.text(ctx, '  CRIT: ' + hero.baseCrit + '%', 22, y, R.colors.textDim, R.fonts.sm); y += 14; }
      if (hero.elementalDmgPct) { R.text(ctx, '  Elemental: +' + hero.elementalDmgPct + '%', 22, y, R.colors.textDim, R.fonts.sm); y += 14; }
      if (hero.ailmentDurationBonus) { R.text(ctx, '  Ailment Duration: +' + hero.ailmentDurationBonus + ' turns', 22, y, R.colors.textDim, R.fonts.sm); y += 14; }
      if (hero.regenHpPct) { R.text(ctx, '  HP Regen: ' + hero.regenHpPct + '%/turn', 22, y, R.colors.textDim, R.fonts.sm); y += 14; }
      if (hero.mpRegen) { R.text(ctx, '  MP Regen: ' + hero.mpRegen + '/turn', 22, y, R.colors.textDim, R.fonts.sm); y += 14; }
      if (hero.partyHpBuff) { R.text(ctx, '  Party HP: +' + hero.partyHpBuff + '%', 22, y, R.colors.textDim, R.fonts.sm); y += 14; }
    }
  },

  buildDetail: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const hero = this.data.selectedHero;
    const infoH = this.getDetailInfoHeight();
    let y = infoH + 10;
    const useItemBtn = UI.Button(30, y, G.W - 60, 28, 'Use Item');
    useItemBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = null;
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('consumable');
    };
    this.data.buttons.push(useItemBtn);
    y += 36;

    const equipWeaponBtn = UI.Button(30, y, G.W - 60, 28, 'Equip Weapon (' + hero.weaponEquipped + ')');
    equipWeaponBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = 'weapon';
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('weapon');
    };
    this.data.buttons.push(equipWeaponBtn);
    y += 34;

    const equipArmorBtn = UI.Button(30, y, G.W - 60, 28, 'Equip Armor (' + hero.armorEquipped + ')');
    equipArmorBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = 'armor';
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('armor');
    };
    this.data.buttons.push(equipArmorBtn);
    y += 34;

    const equipAccBtn = UI.Button(30, y, G.W - 60, 28, 'Equip Accessory (' + hero.accessoryEquipped + ')');
    equipAccBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = 'accessory';
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('accessory');
    };
    this.data.buttons.push(equipAccBtn);
    y += 38;

    const back = UI.Button(60, y + 4, G.W - 120, 30, 'Back to Party', R.colors.btnGold);
    back.onClick = function() {
      partyScene.data.view = 'list';
      partyScene.data.itemsView = false;
      partyScene.data.scrollY = 0;
      partyScene.buildList();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  buildItemList: function(filterType) {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const hero = this.data.selectedHero;
    let y = this.getContentTop();

    const items = G.state.inventory.filter(function(item) {
      if (filterType === 'weapon' && item.type === 'weapon') return true;
      if (filterType === 'armor' && item.type === 'armor') return true;
      if (filterType === 'accessory' && item.type === 'accessory') return true;
      if (filterType === 'consumable' && item.type === 'consumable') return true;
      return false;
    });

    R.text(G.ctx, 'Select ' + filterType + ' for ' + hero.name, 18, y + 8, R.colors.gold, R.fonts.sm);
    y += 22;

    if (items.length === 0) {
      R.text(G.ctx, 'No ' + filterType + 's available.', 18, y, R.colors.textDim, R.fonts.sm);
      y += 20;
    } else {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const idx = G.state.inventory.indexOf(item);
        const qtyStr = item.qty && item.qty > 1 ? ' x' + item.qty : '';
        let label = item.name + qtyStr;
        let comparison = '';
        if (filterType !== 'consumable') {
          const currentAtk = hero.equipAtk || 0;
          const currentDef = hero.equipDef || 0;
          const currentMag = hero.equipAccMag || 0;
          const newAtk = item.atk || 0;
          const newDef = item.def || 0;
          const newMag = item.mag || 0;
          const diffs = [];
          if (newAtk !== currentAtk) diffs.push((newAtk > currentAtk ? '+' : '') + (newAtk - currentAtk) + ' ATK');
          if (newDef !== currentDef) diffs.push((newDef > currentDef ? '+' : '') + (newDef - currentDef) + ' DEF');
          if (newMag !== currentMag) diffs.push((newMag > currentMag ? '+' : '') + (newMag - currentMag) + ' MAG');
          if (diffs.length) comparison = ' (' + diffs.join(', ') + ')';
        }
        const btn = UI.Button(14, y, G.W - 28, 28, label + comparison, R.colors.btnGold);
        btn._item = item;
        btn._idx = idx;
        btn._type = filterType;
        btn._hero = hero;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 4, R.colors.btnGold);
          ctx.fillStyle = this._type === 'consumable' ? R.colors.green : R.colors.blue;
          R.roundRect(ctx, bx, by, 4, bh, 0, ctx.fillStyle);
          const text = this._text || '';
          const parenIdx = text.lastIndexOf(' (');
          if (parenIdx > 0) {
            R.text(ctx, text.substring(0, parenIdx), bx + 12, by + 16, R.colors.white, R.fonts.sm);
            const diffText = text.substring(parenIdx);
            const diffColor = diffText.includes('+') ? R.colors.green : (diffText.includes('-') ? R.colors.red : R.colors.textDim);
            ctx.font = R.fonts.sm;
            const mainW = ctx.measureText(text.substring(0, parenIdx)).width;
            R.text(ctx, diffText, bx + 12 + mainW, by + 16, diffColor, R.fonts.sm);
          } else {
            R.text(ctx, text, bx + 12, by + 16, R.colors.white, R.fonts.sm);
          }
        };
        btn.onClick = (function(item, idx, hero, filterType) {
          return function() {
            if (filterType === 'consumable') {
              applyItemEffect(item, hero);
              Economy.removeItem(idx);
              Notify.show('Used ' + item.name + ' on ' + hero.name + '!', 2);
              Audio.heal();
              partyScene.data.itemsView = false;
              partyScene.data.scrollY = 0;
              partyScene.buildDetail();
            } else if (filterType === 'weapon' || filterType === 'armor' || filterType === 'accessory') {
              const slot = filterType;
              if (slot === 'weapon') {
                if (item.subtype && item.subtype !== hero.weaponType) {
                  Notify.show(hero.name + ' cannot use ' + item.name + '!', 2);
                  Audio.error();
                  return;
                }
                hero.weaponEquipped = item.name;
                hero.weaponLvl = item.atk ? 1 : hero.weaponLvl;
                hero.equipAtk = item.atk || 0;
                hero.equipCrit = item.crit || 0;
              } else if (slot === 'armor') {
                hero.armorEquipped = item.name;
                hero.armorLvl = item.def ? 1 : hero.armorLvl;
                hero.equipDef = item.def || 0;
                hero.equipArmorMag = item.mag || 0;
              } else if (slot === 'accessory') {
                hero.accessoryEquipped = item.name;
                hero.equipAccMag = item.mag || 0;
                hero.equipAccDef = item.def || 0;
                hero.equipAccHp = item.hp || 0;
                hero.equipCrit = (hero.equipCrit || 0) + (item.crit || 0);
              }
              Economy.removeItem(idx);
              Notify.show('Equipped ' + item.name + '!', 2);
              Audio.click();
              partyScene.data.itemsView = false;
              partyScene.data.scrollY = 0;
              partyScene.buildDetail();
            }
          };
        })(item, idx, hero, filterType);
        this.data.buttons.push(btn);
        y += 34;
      }
    }

    y += 6;
    const back = UI.Button(60, y, G.W - 120, 30, 'Back', R.colors.btnGold);
    back.onClick = function() {
      partyScene.data.itemsView = false;
      partyScene.data.scrollY = 0;
      partyScene.buildDetail();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    const sd = Input.getScrollDelta();
    if (sd) {
      this.data.scrollY += sd * 0.8;
      this.clampScroll();
    }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    if (this.data.view === 'list') {
      R.roundRect(ctx, 10, 6, G.W - 20, 62, 8, R.colors.panel);
      R.textCenter(ctx, 'Party', G.W / 2, 24, R.colors.gold, R.fonts.lg);
      R.textCenter(ctx, 'Tap a hero to manage:', G.W / 2, 48, R.colors.text, R.fonts.sm);
      ctx.strokeStyle = 'rgba(232,160,48,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, 6.5, G.W - 21, 61);

      const top = this.getContentTop();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, G.W, this.getContentHeight());
      ctx.clip();
      ctx.translate(0, -this.data.scrollY);
      for (const b of this.data.buttons) b.render(ctx);
      ctx.restore();

      if (this.data.contentHeight > this.getContentHeight()) {
        const vh = this.getContentHeight();
        const ratio = vh / this.data.contentHeight;
        const barH = Math.max(16, ratio * vh);
        const maxTrack = vh - barH;
        const scrollFrac = this.data.scrollY / Math.max(1, this.data.contentHeight - vh);
        const barY = top + scrollFrac * maxTrack;
        R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
      }

    } else if (this.data.itemsView) {
      const hero = this.data.selectedHero;
      R.roundRect(ctx, 10, 6, G.W - 20, 62, 8, R.colors.panel);
      R.textCenter(ctx, hero.name + ' — Items', G.W / 2, 24, R.colors.gold, R.fonts.lg);
      R.textCenter(ctx, 'Inventory: ' + G.state.inventory.length + ' items', G.W / 2, 48, R.colors.text, R.fonts.sm);
      ctx.strokeStyle = 'rgba(232,160,48,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, 6.5, G.W - 21, 61);

      const top = this.getContentTop();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, G.W, this.getContentHeight());
      ctx.clip();
      ctx.translate(0, -this.data.scrollY);
      for (const b of this.data.buttons) b.render(ctx);
      ctx.restore();

      if (this.data.contentHeight > this.getContentHeight()) {
        const vh = this.getContentHeight();
        const ratio = vh / this.data.contentHeight;
        const barH = Math.max(16, ratio * vh);
        const maxTrack = vh - barH;
        const scrollFrac = this.data.scrollY / Math.max(1, this.data.contentHeight - vh);
        const barY = top + scrollFrac * maxTrack;
        R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
      }

    } else {
      const hero = this.data.selectedHero;
      R.roundRect(ctx, 10, 6, G.W - 20, 62, 8, R.colors.panel);
      R.textCenter(ctx, hero.name + ' — ' + (hero.title || ''), G.W / 2, 24, R.colors.gold, R.fonts.lg);
      R.textCenter(ctx, 'Inventory: ' + G.state.inventory.length + ' items', G.W / 2, 48, R.colors.text, R.fonts.sm);
      ctx.strokeStyle = 'rgba(232,160,48,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10.5, 6.5, G.W - 21, 61);

      const top = this.getContentTop();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, G.W, this.getContentHeight());
      ctx.clip();
      ctx.translate(0, -this.data.scrollY);
      this.renderDetailInfo(ctx, this.getContentTop());
      for (const b of this.data.buttons) b.render(ctx);
      ctx.restore();

      if (this.data.contentHeight > this.getContentHeight()) {
        const vh = this.getContentHeight();
        const ratio = vh / this.data.contentHeight;
        const barH = Math.max(16, ratio * vh);
        const maxTrack = vh - barH;
        const scrollFrac = this.data.scrollY / Math.max(1, this.data.contentHeight - vh);
        const barY = top + scrollFrac * maxTrack;
        R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
      }
    }
  }
});
