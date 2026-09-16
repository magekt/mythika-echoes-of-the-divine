function forgeFitText(ctx, text, maxWidth, font) {
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

const ForgeAccess = {
  costs: { weapon: 30, armor: 25, accessory: 20 },
  status: function(heroId, slot) {
    const hero = (G.state.party || []).find(h => h && h.id === heroId);
    if (!hero) return { allowed: false, reason: 'Hero not found', hero: null };
    const cost = ForgeAccess.costs[slot] || 30;
    const gold = G.state.gold || 0;
    if (gold < cost) return { allowed: false, reason: 'Need ' + cost + 'g (' + gold + 'g available)', hero: hero, cost: cost };
    return { allowed: true, reason: '', hero: hero, cost: cost };
  },
  enter: function(heroId, slot) {
    const s = this.status(heroId, slot);
    if (!s.allowed) return s;
    return { ...s, allowed: true };
  }
};

const forgeScene = Scene.create({
  name: 'forge',
  data: {
    buttons: [],
    selectedHero: null,
    staticDraws: [],
    slot: null,
    upgradeCosts: ForgeAccess.costs,
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

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.selectedHero = null;
    this.data.slot = null;
    this.data.scrollY = 0;
  },

  getContentTop: function() { return 104; },
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

    // One-column hero cards keep names and upgrade levels legible on mobile.
    const gridGap = 10;
    const mx = 14;
    const cw = G.W - mx * 2;
    const ch = 108;

    for (let i = 0; i < G.state.party.length; i++) {
      const hero = G.state.party[i];
      const by = y + i * (ch + gridGap);
      const shell = UI.PremiumShell(mx, by, cw, ch, { outerR: 10, innerBg: R.colors.surfaceElevated });
      const btn = UI.Button(mx, by, cw, ch, '', R.colors.surfaceElevated);
      btn._hero = hero;
      btn._shell = shell;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        this._shell.render(ctx);
        const content = this._shell.contentRect();
        const iconX = content.x + 22;
        const iconY = content.y + 12;
        R.drawHero(ctx, this._hero.id, iconX, iconY, 32);
        const copyX = content.x + 68;
        const copyW = content.w - 82;
        // Establish a clear title-to-metadata hierarchy inside the shell.
        R.text(ctx, forgeFitText(ctx, this._hero.name, copyW - 48, R.fonts.lg), copyX, content.y + 18, R.colors.accent, R.fonts.lg);
        R.textRight(ctx, 'Lv.' + this._hero.level, content.x + content.w - 10, content.y + 18, R.colors.text, R.fonts.md);
        R.text(ctx, 'Weapon  ' + this._hero.weaponLvl + '   Armor  ' + this._hero.armorLvl, copyX, content.y + 40, R.colors.text, R.fonts.md);
        R.text(ctx, 'Accessory  ' + this._hero.accessoryLvl, copyX, content.y + 56, R.colors.text, R.fonts.md);
        R.text(ctx, 'Choose a hero to tune their gear', copyX, content.y + 76, R.colors.textSecondary, R.fonts.md);
        // Upgrade marker, kept inside the shell and away from the title.
        R.roundRect(ctx, content.x + content.w - 24, content.y + content.h - 18, 14, 14, 7, R.colors.danger);
        R.textCenter(ctx, 'U', content.x + content.w - 17, content.y + content.h - 7, R.colors.textPrimary, R.fonts.xs);
      };
      btn.onClick = function() {
        const h = this._hero;
        forgeScene.data.selectedHero = h;
        forgeScene.data.scrollY = 0;
        forgeScene.buildSlotMenu();
      };
      this.data.buttons.push(btn);
    }
    y += G.state.party.length * (ch + gridGap);

    // Empty state
    if (G.state.party.length === 0) {
      const emptyShell = UI.PremiumShell(14, y, G.W - 28, 132, { outerR: 10 });
      SD.push({ render: function(ctx) {
        emptyShell.render(ctx);
        const c = emptyShell.contentRect();
        R.textCenter(ctx, 'Forge awaits its first champion', c.x + c.w / 2, c.y + 30, R.colors.accent, R.fonts.md);
        R.textCenter(ctx, forgeFitText(ctx, 'Recruit a hero at the Party hall to begin upgrading gear.', c.w - 16, R.fonts.sm), c.x + c.w / 2, c.y + 52, R.colors.textSecondary, R.fonts.sm);
      }});
      y += 144;
    }

    if (G.state.party.length > 0) {
      const npcShell = UI.PremiumShell(14, y, G.W - 28, 80, { outerR: 8 });
      SD.push({ render: function(ctx) {
        npcShell.render(ctx);
        const c = npcShell.contentRect();
        R.textCenter(ctx, 'NPC Smith', c.x + c.w / 2, c.y + 20, R.colors.gold, R.fonts.md);
        R.textCenter(ctx, 'Forge a unique weapon from ancient plans', c.x + c.w / 2, c.y + 40, R.colors.textDim, R.fonts.sm);
        R.textCenter(ctx, 'Cost: 500g per hero', c.x + c.w / 2, c.y + 58, R.colors.textSecondary, R.fonts.sm);
      }});
      y += 92;
    }

    // Full-size magnetic navigation target; the shared helper is 30px tall.
    const back = UI.MagneticBtn(60, y + 6, G.W - 120, 48, 'Back to Ashram', {
      trailingIcon: 'arrow-left',
      variant: 'primary'
    });
    back.onClick = function() { gScene('ashram', true, { restoreScroll: true }); };
    this.data.buttons.push(back);
    y += 54;

    this.data.contentHeight = y;
  },

  buildSlotMenu: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const hero = this.data.selectedHero;
    let y = this.getContentTop();

    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    const infoShell = UI.PremiumShell(14, y, G.W - 28, 72, { outerR: 10, innerBg: R.colors.surfaceElevated });
    SD.push({ render: function(ctx) {
      infoShell.render(ctx);
      const c = infoShell.contentRect();
      R.text(ctx, 'UPGRADING', c.x + 12, c.y + 16, R.colors.textSecondary, R.fonts.md);
      R.text(ctx, forgeFitText(ctx, hero.name, c.w - 92, R.fonts.lg), c.x + 12, c.y + 36, R.colors.accent, R.fonts.lg);
      R.textRight(ctx, (G.state.gold || 0) + 'g', c.x + c.w - 12, c.y + 28, R.colors.textPrimary, R.fonts.md);
      R.textRight(ctx, 'Gold', c.x + c.w - 12, c.y + 44, R.colors.textSecondary, R.fonts.md);
    }});
    y += 84;

    const questForged = !!(G.state.quests && G.state.quests.ary_forge1 && G.state.quests.ary_forge1.completed);
    const costMultiplier = questForged ? 0.9 : 1;
    if (questForged) {
      SD.push({ text: ['Quest Bonus: -10% cost', 14, y, R.colors.green, R.fonts.sm] });
      y += 20;
    }

    const slots = [
      { id: 'weapon', label: 'Weapon (' + Scene.gearLabel(hero.weaponEquipped) + ' Lv.' + hero.weaponLvl + ')', cost: Math.floor(this.data.upgradeCosts.weapon * costMultiplier) },
      { id: 'armor', label: 'Armor (' + Scene.gearLabel(hero.armorEquipped) + ' Lv.' + hero.armorLvl + ')', cost: Math.floor(this.data.upgradeCosts.armor * costMultiplier) },
      { id: 'accessory', label: 'Accessory (' + Scene.gearLabel(hero.accessoryEquipped) + ' Lv.' + hero.accessoryLvl + ')', cost: Math.floor(this.data.upgradeCosts.accessory * costMultiplier) }
    ];

    for (const slot of slots) {
      const canAfford = (G.state.gold || 0) >= slot.cost;
      // Keep upgrade choices comfortably tappable while preserving the
      // existing cost and economy behavior.
      const btn = UI.Button(14, y, G.W - 28, 52, '', canAfford ? R.colors.accent : R.colors.surfaceElevated);
      btn._slot = slot;
      btn._canAfford = canAfford;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        const col = this._canAfford ? R.colors.accent : R.colors.surfaceElevated;
        R.roundRect(ctx, bx, by, bw, bh, R.radius.m, col);
        if (!this._canAfford) ctx.globalAlpha = 0.5;
        R.roundRect(ctx, bx, by, 4, bh, 0, R.colors.accent);
        const label = forgeFitText(ctx, this._slot.label, bw - 120, R.fonts.md);
        R.text(ctx, label, bx + 14, by + 22, this._canAfford ? R.colors.textPrimary : R.colors.textSecondary, R.fonts.md);
        R.textRight(ctx, 'Cost ' + this._slot.cost + 'g', bx + bw - 14, by + 22, this._canAfford ? R.colors.textPrimary : R.colors.danger, R.fonts.md);
        ctx.globalAlpha = 1;
      };
      btn.onClick = function() {
        const s = this._slot;
        const gate = ForgeAccess.enter(hero.id, s.id);
        if (!gate.allowed) {
          Notify.show(gate.reason, 2, R.colors.red);
          return;
        }
        forgeScene.upgradeSlot(s.id);
      };
      this.data.buttons.push(btn);
      y += 60; // step between slot options
    }

    // NPC Smith special upgrade
    if (hero.weaponEquipped && (G.state.gold || 0) >= 500) {
      const npcBtn = UI.MagneticBtn(60, y, G.W - 120, 44, 'NPC Smith Upgrade', { trailingIcon: 'hammer' });
      npcBtn._hero = hero;
      npcBtn.onClick = function() {
        if (Economy.spendGold(500)) {
          hero.weaponLvl++;
          hero.weaponLvl++;
          Notify.show('NPC Smith forged a blessed upgrade!', 3, R.colors.gold);
          Audio.levelUp();
          forgeScene.buildSlotMenu();
        }
      };
      this.data.buttons.push(npcBtn);
      y += 52;
    }

    // Back button - BtnGold, 44px primary action
    const back = UI.MagneticBtn(60, y + 8, G.W - 120, 48, 'Back to Heroes', {
      trailingIcon: 'arrow-left',
      variant: 'secondary'
    });
    back.onClick = function() {
      forgeScene.data.selectedHero = null;
      forgeScene.data.scrollY = 0;
      forgeScene.buildHeroList();
    };
    this.data.buttons.push(back);
    y += 56;

    this.data.contentHeight = y;
  },

  upgradeSlot: function(slotId) {
    const hero = this.data.selectedHero;
    const gate = ForgeAccess.enter(hero ? hero.id : null, slotId);
    if (!gate.allowed) {
      Notify.show(gate.reason, 2, R.colors.red);
      return false;
    }
    const costMultiplier = (G.state.quests && G.state.quests.ary_forge1 && G.state.quests.ary_forge1.completed) ? 0.9 : 1;
    const cost = Math.floor(this.data.upgradeCosts[slotId] * costMultiplier);
    const slotName = slotId.charAt(0).toUpperCase() + slotId.slice(1);

    if (!Economy.spendGoldOrNotify(cost)) return false;
    if (slotId === 'weapon') { hero.weaponLvl++; }
    else if (slotId === 'armor') { hero.armorLvl++; }
    else if (slotId === 'accessory') { hero.accessoryLvl++; }
    this.data.upgradeCosts[slotId] = Math.floor(cost * 1.5);
    QuestSystem.trackForge(slotId);
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
    Scene.drawHeader(ctx, 96);
    R.textCenter(ctx, 'Forge', G.W / 2, 32, R.colors.accent, R.fonts.xl);
    R.textCenter(ctx, 'Gold: ' + (G.state.gold || 0) + 'g', G.W / 2, 66, R.colors.accent, R.fonts.md);
    if (this.data.selectedHero) {
      R.textCenter(ctx, forgeFitText(ctx, 'Upgrading: ' + this.data.selectedHero.name, G.W - 40, R.fonts.md), G.W / 2, 86, R.colors.textPrimary, R.fonts.md);
    } else {
      R.textCenter(ctx, 'Select a hero to upgrade:', G.W / 2, 86, R.colors.textPrimary, R.fonts.md);
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);
    for (const draw of this.data.staticDraws) {
      if (draw.render) draw.render(ctx);
    }

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    UI.Modal.render(ctx);
  }
});
