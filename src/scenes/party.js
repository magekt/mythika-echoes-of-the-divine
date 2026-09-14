const partyScene = Scene.create({
  name: 'party',
  data: {
    selectedHero: null,
    buttons: [],
    staticDraws: [],
    view: 'list',
    itemsView: false,
    equipSlot: null,
    scrollY: 0,
    contentHeight: 0,
    recruitCosts: [800, 2500, 6000, 14000]
  },

  enter: function() {
    this.data.selectedHero = null;
    this.data.view = 'list';
    this.data.itemsView = false;
    this.data.equipSlot = null;
    this.data.scrollY = 0;
    this.buildList();
  },

  leave: function() {
    this._heroMoment = null;
    this._fluidNav = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.selectedHero = null;
    this.data.scrollY = 0;
  },

  getContentTop: function() { return G.CONTENT_TOP; },
  getContentHeight: function() {
    // The detail view has no bottom navigation bar. Reclaim that reserved
    // band so the final 48px action remains readable on the first render.
    const bottomInset = this.data.view === 'detail' && !this.data.itemsView ? 8 : 44;
    return G.H - this.getContentTop() - bottomInset;
  },

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

    // --- Heroes Section Header (26px, panel bg, gold accent) ---
    const secHh = 26;
    const hdr = UI.Button(14, y, G.W - 28, secHh, '', 'transparent');
    hdr._label = 'My Party';
    hdr._color = R.colors.gold;
    hdr.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.panel);
      R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.sm);
    };
    this.data.buttons.push(hdr);
    y += secHh + 8;

    // --- 3-Column Grid Cards (86px height per design system) ---
    // Since party list is effectively 1-column on mobile, use 86px cards
    // with full-width layout matching the grid pattern
    const cardH = 86; // was 66px — upgraded for tap target (44×44 minimum)

    for (const hero of G.state.party) {
      const alive = hero.hp > 0;
      const btn = UI.Button(14, y, G.W - 28, cardH, '', alive ? R.colors.panel : R.colors.btn);
      btn._hero = hero;
      btn._alive = alive;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 8, this.color);
        ctx.strokeStyle = R.colors.borderHairline;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        if (!this._alive) ctx.globalAlpha = 0.5;
        // Sprite gutter (left 64px): sprite + its auto label stay clear of
        // all text and bars (previously the sprite bled past the card edge).
        R.drawHero(ctx, this._hero.id, bx + 30, by + 16, 28);
        const tx = bx + 64;
        const right = bx + bw - 14;
        const barW = bw - 64 - 14 - 64;
        R.text(ctx, this._hero.name, tx, by + 22, this._alive ? R.colors.gold : R.colors.textDim, R.fonts.md);
        const cls = this._hero.role + (this._hero.className ? ' ' + this._hero.className : '');
        R.text(ctx, 'Lv.' + this._hero.level + ' ' + cls, tx, by + 40, R.colors.text, R.fonts.sm);
        const hpPct = this._hero.hp / Math.max(1, this._hero.maxHp);
        const mpPct = this._hero.mp / Math.max(1, this._hero.maxMp);
        // HP bar with its value reserved in the right gutter (never painted over)
        R.roundRect(ctx, tx, by + 50, barW, 8, 4, R.colors.borderHairline);
        ctx.fillStyle = R.colors.hp;
        R.roundRect(ctx, tx, by + 50, Math.max(0, barW * hpPct), 8, 4, ctx.fillStyle);
        R.text(ctx, Math.floor(this._hero.hp) + '/' + this._hero.maxHp, right, by + 58, R.colors.white, R.fonts.xs, 'right');
        // MP bar, same pattern
        R.roundRect(ctx, tx, by + 62, barW, 8, 4, R.colors.blueDark);
        ctx.fillStyle = R.colors.mp;
        R.roundRect(ctx, tx, by + 62, Math.max(0, barW * mpPct), 8, 4, ctx.fillStyle);
        R.text(ctx, Math.floor(this._hero.mp) + '/' + this._hero.maxMp, right, by + 70, R.colors.white, R.fonts.xs, 'right');
        ctx.globalAlpha = 1;
      };
      btn.onClick = function() { partyScene.selectHero(this._hero); };
      this.data.buttons.push(btn);
      y += cardH + 4; // 4px gap between cards instead of 72px
    }

    // Recruit Hall: grow the party toward the full pantheon (max 5 heroes).
    if (G.state.party.length < 5) {
      const cost = this.data.recruitCosts[G.state.party.length - 1] || 14000;
      const canAfford = (G.state.gold || 0) >= cost;
      // Primary action button: minimum 38px height, prefer 38px
      const rec = UI.Button(14, y + 4, G.W - 28, 38, 'Recruit Hero (' + cost + 'g)', canAfford ? R.colors.btnGold : R.colors.btn);
      rec.enabled = canAfford;
      rec.onClick = function() {
        partyScene.data.view = 'recruit';
        partyScene.data.scrollY = 0;
        partyScene.buildRecruitList();
      };
      this.data.buttons.push(rec);
      y += 44;
    }

    // Back to Ashram button - Primary action (38px minimum height)
    const back = UI.Button(60, y + 6, G.W - 120, 38, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true, { restoreScroll: true }); };
    this.data.buttons.push(back);
    y += 48;

    this.data.contentHeight = y;
  },

  // Recruit Hall: pick from heroes not yet in the party.
  buildRecruitList: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    const cost = this.data.recruitCosts[G.state.party.length - 1] || 14000;
    const inParty = G.state.party.map(x => x.id);
    SD.push({ text: ['Recruit joins at 60% of your leader\'s level — ' + cost + 'g', 18, y + 8, R.colors.gold, R.fonts.sm] });
    y += 24;

    for (const hid of Object.keys(HEROES)) {
      if (inParty.indexOf(hid) !== -1) continue;
      const heroDef = HEROES[hid];
      const btn = UI.Button(14, y, G.W - 28, 54, '', R.colors.panel);
      btn._hid = hid;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 6, R.colors.panel);
        ctx.strokeStyle = R.colors.borderHairline;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        R.drawHero(ctx, this._hid, bx + 10, by + 8, 20);
        R.text(ctx, heroDef ? HEROES[this._hid].name : this._hid, bx + 40, by + 16, R.colors.gold, R.fonts.md);
        R.text(ctx, (heroDef ? HEROES[this._hid].role + ': ' : '') + (heroDef ? HEROES[this._hid].desc : ''), bx + 40, by + 34, R.colors.textDim, R.fonts.xs);
      };
      btn.onClick = function() { partyScene.recruitHero(this._hid); };
      this.data.buttons.push(btn);
      y += 62;
    }

    const back = UI.Button(60, y + 8, G.W - 120, 30, 'Back to Party', R.colors.btnGold);
    back.onClick = function() {
      partyScene.data.view = 'list';
      partyScene.data.scrollY = 0;
      partyScene.buildList();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  recruitHero: function(hid) {
    const idx = G.state.party.length - 1;
    const cost = this.data.recruitCosts[idx] || 14000;
    if (!Economy.spendGoldOrNotify(cost)) return false;

    const recruit = createHeroState(hid);
    // Allies arrive seasoned: 60% of the leader's level, via real level-ups.
    // Clamp to the Lv.50 cap and bound the loop — an over-levelled leader
    // (crafted/migrated save) must never hang the main thread here.
    const target = Math.min(50, Math.max(1, Math.floor((G.state.player ? G.state.player.level : 1) * 0.6)));
    let guard = 0;
    while (recruit.level < target && guard++ < 60) {
      Progression.addXP(recruit, Progression.xpForLevel(recruit.level));
    }
    recruit.hp = recruit.maxHp;
    recruit.mp = recruit.maxMp;

    G.state.party.push(recruit);
    Notify.show(recruit.name + ' joins your party!', 3, R.colors.gold);
    Audio.levelUp();
    Hints.show('recruit', 'Allies fight alongside you automatically in every battle.');
    AchievementSystem.check();
    this.data.view = 'list';
    this.data.scrollY = 0;
    this.buildList();
  },

  selectHero: function(hero) {    this.data.selectedHero = hero;
    this.data.view = 'detail';
    this.data.itemsView = false;
    this.data.equipSlot = null;
    this.data.scrollY = 0;
    this.buildDetail();
  },

  getDetailInfoHeight: function() {
    const hero = this.data.selectedHero;
    if (!hero) return 0;
    // Keep this in lockstep with renderDetailInfo(). The previous estimate
    // omitted the three equipment rows, which placed the action controls on
    // top of the lower half of the hero panel.
    let h = 196;
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
      h += count * 14;
    }
    return h;
  },

  getDetailActionLayout: function() {
    const infoBottom = this.getContentTop() + this.getDetailInfoHeight();
    const panelY = infoBottom + 8;
    const topPad = 16;
    const buttonH = 48;
    const gap = 8;
    const firstButtonY = panelY + topPad;
    const actionCount = 5;
    const panelH = topPad + actionCount * buttonH + (actionCount - 1) * gap + 12;

    return {
      panelY: panelY,
      panelH: panelH,
      firstButtonY: firstButtonY,
      buttonH: buttonH,
      gap: gap,
      contentHeight: panelY + panelH + 8
    };
  },

  renderDetailInfo: function(ctx, offsetY) {
    const hero = this.data.selectedHero;
    if (!hero) return;
    let y = offsetY;

    const infoShell = UI.PremiumShell(10, y, G.W - 20, 110, {
      outerR: R.radius.l,
      innerR: R.radius.m,
      outerBg: R.colors.surfaceElevated,
      outerBorder: R.colors.borderHairline,
      innerBg: R.colors.panel,
      innerHighlight: R.colors.subtleWhite
    });
    infoShell.render(ctx);

    let hy = y + 12;
    R.drawHero(ctx, hero.id, 22, hy, 28);
    R.text(ctx, hero.name, 58, hy + 10, R.colors.gold, R.fonts.lg);
    const titleStr = hero.title || '';
    const clsStr = hero.role + (hero.className ? ' [' + hero.className + ']' : '');
    R.text(ctx, 'Lv.' + hero.level + ' ' + clsStr, 58, hy + 30, R.colors.text, R.fonts.sm);
    if (titleStr) R.text(ctx, '"' + titleStr + '"', 58, hy + 44, R.colors.textDim, R.fonts.sm);

    const hpPct = hero.hp / Math.max(1, hero.maxHp);
    const mpPct = hero.mp / Math.max(1, hero.maxMp);
    R.roundRect(ctx, 58, hy + 52, 160, 5, 2, R.colors.damageBarBackground);
    R.roundRect(ctx, 58, hy + 52, Math.max(0, 160 * hpPct), 5, 2, R.colors.hp);
    R.text(ctx, Math.floor(hero.hp) + '/' + hero.maxHp, 220, hy + 56, R.colors.white, R.fonts.xs);
    R.roundRect(ctx, 58, hy + 60, 160, 5, 2, R.colors.blueDark);
    R.roundRect(ctx, 58, hy + 60, Math.max(0, 160 * mpPct), 5, 2, R.colors.mp);
    R.text(ctx, Math.floor(hero.mp) + '/' + hero.maxMp, 220, hy + 64, R.colors.white, R.fonts.xs);

    y += 116;

    const statLine = 'STR:' + hero.str + '  AGI:' + hero.agi + '  MAG:' + hero.mag + '  DEF:' + hero.def;
    R.text(ctx, statLine, 18, y, R.colors.text, R.fonts.sm);
    y += 18;

    const wepName = Scene.gearLabel(hero.weaponEquipped);
    const weaponAtk = hero.weaponEquipped && hero.weaponEquipped.atk || 0;
    const equipLine = 'Weapon: ' + wepName + ' (Lv.' + hero.weaponLvl + ')' + (weaponAtk ? ' +' + weaponAtk + ' ATK' : '');
    R.text(ctx, equipLine, 18, y, R.colors.textDim, R.fonts.sm);
    y += 14;
    const armName = Scene.gearLabel(hero.armorEquipped);
    const armorDef = hero.armorEquipped && hero.armorEquipped.def || 0;
    R.text(ctx, 'Armor: ' + armName + ' (Lv.' + hero.armorLvl + ')' + (armorDef ? ' +' + armorDef + ' DEF' : ''), 18, y, R.colors.textDim, R.fonts.sm);
    y += 14;
    const accName = Scene.gearLabel(hero.accessoryEquipped);
    const accessoryMag = hero.accessoryEquipped && hero.accessoryEquipped.mag || 0;
    R.text(ctx, 'Accessory: ' + accName + ' (Lv.' + hero.accessoryLvl + ')' + (accessoryMag ? ' +' + accessoryMag + ' MAG' : ''), 18, y, R.colors.textDim, R.fonts.sm);
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
    const layout = this.getDetailActionLayout();
    let y = layout.firstButtonY;

    const drawActionBorder = function(ctx, btn) {
      const x = btn.x + 0.5;
      const y = btn.y + 0.5;
      const w = btn.w - 1;
      const h = btn.h - 1;
      const r = R.radius.m;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.stroke();
    };

    const makeActionButton = function(label, color, hoverColor, textColor) {
      const btn = UI.Button(20, y, G.W - 40, layout.buttonH, label, color, hoverColor, textColor);
      const baseRender = btn.render;
      btn.render = function(ctx) {
        baseRender.call(this, ctx);
        // Secondary actions get a quiet hairline so the group reads as a
        // deliberate control surface without competing with the primary CTA.
        if (this.color !== R.colors.btnGold) {
          ctx.strokeStyle = this._pressed ? R.colors.accent : R.colors.borderHairline;
          ctx.lineWidth = this._pressed ? 2 : 1;
          drawActionBorder(ctx, this);
        }
      };
      partyScene.data.buttons.push(btn);
      y += layout.buttonH + layout.gap;
      return btn;
    };

    const useItemBtn = makeActionButton('Use Item', R.colors.btnGold, R.colors.orangeLight, R.colors.bg);
    useItemBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = null;
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('consumable');
    };

    const equipWeaponBtn = makeActionButton(
      'Equip Weapon (' + Scene.gearLabel(hero.weaponEquipped) + ')',
      R.colors.surfaceElevated,
      R.colors.btnHover,
      R.colors.textPrimary
    );
    equipWeaponBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = 'weapon';
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('weapon');
    };

    const equipArmorBtn = makeActionButton(
      'Equip Armor (' + Scene.gearLabel(hero.armorEquipped) + ')',
      R.colors.surfaceElevated,
      R.colors.btnHover,
      R.colors.textPrimary
    );
    equipArmorBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = 'armor';
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('armor');
    };

    const equipAccBtn = makeActionButton(
      'Equip Accessory (' + Scene.gearLabel(hero.accessoryEquipped) + ')',
      R.colors.surfaceElevated,
      R.colors.btnHover,
      R.colors.textPrimary
    );
    equipAccBtn.onClick = function() {
      partyScene.data.itemsView = true;
      partyScene.data.equipSlot = 'accessory';
      partyScene.data.scrollY = 0;
      partyScene.buildItemList('accessory');
    };

    const back = UI.Button(20, y, G.W - 40, layout.buttonH, 'Back to Party', R.colors.surface, R.colors.btnHover, R.colors.textPrimary);
    const backBaseRender = back.render;
    back.render = function(ctx) {
      backBaseRender.call(this, ctx);
      ctx.strokeStyle = this._pressed ? R.colors.accent : R.colors.borderHairline;
      ctx.lineWidth = this._pressed ? 2 : 1;
      drawActionBorder(ctx, this);
    };
    back.onClick = function() {
      partyScene.data.view = 'list';
      partyScene.data.itemsView = false;
      partyScene.data.scrollY = 0;
      partyScene.buildList();
    };
    this.data.buttons.push(back);
    this.data.contentHeight = layout.contentHeight;
  },

  buildItemList: function(filterType) {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    const hero = this.data.selectedHero;
    let y = this.getContentTop();

    const items = G.state.inventory.filter(function(item) {
      if (filterType === 'weapon' && item.type === 'weapon') return true;
      if (filterType === 'armor' && item.type === 'armor') return true;
      if (filterType === 'accessory' && item.type === 'accessory') return true;
      if (filterType === 'consumable' && item.type === 'consumable') return true;
      return false;
    });

    SD.push({ text: ['Select ' + filterType + ' for ' + hero.name, 18, y + 8, R.colors.gold, R.fonts.sm] });
    y += 22;

    if (items.length === 0) {
      SD.push({ text: ['No ' + filterType + 's available.', 18, y, R.colors.textDim, R.fonts.sm] });
      y += 20;
    } else {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const idx = G.state.inventory.indexOf(item);
        const qtyStr = item.qty && item.qty > 1 ? ' x' + item.qty : '';
        let label = item.name + qtyStr;
        let comparison = '';
        if (filterType !== 'consumable') {
          const equipped = hero[filterType + 'Equipped'] || {};
          const currentAtk = equipped.atk || 0;
          const currentDef = equipped.def || 0;
          const currentMag = equipped.mag || 0;
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
          const text = this.text || '';
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
              const result = EquipmentSystem.equip(hero, item);
              if (!result.ok) {
                const message = result.reason === 'incompatible-weapon'
                  ? hero.name + ' cannot use ' + item.name + '!'
                  : 'Cannot equip ' + item.name + '.';
                Notify.show(message, 2);
                Audio.error();
                return;
              }
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
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    if (this.data.view === 'list') {
      Scene.drawHeader(ctx, 62);
      R.textCenter(ctx, 'Party', G.W / 2, 24, R.colors.gold, R.fonts.lg);
      R.textCenter(ctx, 'Tap a hero to manage:', G.W / 2, 48, R.colors.text, R.fonts.sm);

      const top = this.getContentTop();
Scene.clipContent(ctx, this);
    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);
    ctx.restore();

      Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    } else if (this.data.itemsView) {
      const hero = this.data.selectedHero;
      Scene.drawHeader(ctx, 62);
      R.textCenter(ctx, hero.name + ' — Items', G.W / 2, 24, R.colors.gold, R.fonts.lg);
      R.textCenter(ctx, 'Inventory: ' + G.state.inventory.length + ' items', G.W / 2, 48, R.colors.text, R.fonts.sm);

      const top = this.getContentTop();
      Scene.clipContent(ctx, this);
      for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight())) b.render(ctx);
      Scene.drawStatic(ctx, this.data.staticDraws);
      ctx.restore();

      Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    } else {
      const hero = this.data.selectedHero;
      Scene.drawHeader(ctx, 62);
      R.textCenter(ctx, hero.name + ' — ' + (hero.title || ''), G.W / 2, 24, R.colors.gold, R.fonts.lg);
      R.textCenter(ctx, 'Inventory: ' + G.state.inventory.length + ' items', G.W / 2, 48, R.colors.text, R.fonts.sm);

      const top = this.getContentTop();
      Scene.clipContent(ctx, this);
      this.renderDetailInfo(ctx, this.getContentTop());
      const actionLayout = this.getDetailActionLayout();
      const actionShell = UI.PremiumShell(14, actionLayout.panelY, G.W - 28, actionLayout.panelH, {
        outerR: R.radius.l,
        innerR: R.radius.m,
        outerBg: R.colors.surfaceElevated,
        outerBorder: R.colors.borderHairline,
        innerBg: R.colors.surface,
        innerHighlight: R.colors.subtleWhite
      });
      actionShell.render(ctx);
      for (const b of this.data.buttons) b.render(ctx);
      ctx.restore();

      Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
    }
  }
});
