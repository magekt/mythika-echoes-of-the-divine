const characterCreateScene = Scene.create({
  name: 'characterCreate',
  data: {
    step: 0,
    selectedClass: null,
    selectedElite: null,
    selectedHero: 'arjuna',
    heroName: 'Arjuna',
    buttons: [],
    infoText: '',
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.step = 0;
    this.data.selectedClass = null;
    this.data.selectedElite = null;
    this.data.selectedHero = 'arjuna';
    this.data.heroName = 'Arjuna';
    this.data.buttons = [];
    this.data.infoText = '';
    this.data.scrollY = 0;
    this.data.contentHeight = 0;
    this.buildClassButtons();
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

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    R.textCenter(ctx, 'Create Your Legend', G.W / 2, 22, R.colors.orange, R.fonts.lg);

    const steps = ['Path', 'Hero', 'Elite'];
    for (let i = 0; i < steps.length; i++) {
      const cx = 45 + i * 88;
      const isCurrent = i === this.data.step;
      const isDone = i < this.data.step;
      if (i > 0) {
        ctx.fillStyle = isDone ? R.colors.green : 'rgba(138,138,160,0.2)';
        ctx.fillRect(cx - 56, 40, 40, 2);
      }
      ctx.fillStyle = isDone ? R.colors.green : (isCurrent ? R.colors.orange : R.colors.textDark);
      ctx.beginPath();
      ctx.arc(cx - 8, 41, 7, 0, Math.PI * 2);
      ctx.fill();
      if (isDone || isCurrent) {
        ctx.fillStyle = R.colors.bg;
        R.textCenter(ctx, isDone ? '\u2713' : String(i + 1), cx - 8, 45, R.colors.bg, R.fonts.sm);
      }
      ctx.fillStyle = isCurrent ? R.colors.orange : (isDone ? R.colors.green : R.colors.textDim);
      R.textCenter(ctx, steps[i], cx - 8, 55, ctx.fillStyle, R.fonts.sm);
    }
    ctx.fillStyle = 'rgba(138,138,160,0.15)';
    ctx.fillRect(15, 66, G.W - 30, 1);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    if (this.data.step === 0) {
      R.textCenter(ctx, 'Choose your spiritual path', G.W / 2, 86, R.colors.text, R.fonts.md);
    } else if (this.data.step === 1) {
      const cls = CLASS_DATA[this.data.selectedClass];
      const icon = { kshatriya: '\u2694', rishi: '\u2727', yogi: '\u262F' }[this.data.selectedClass] || '';
      R.textCenter(ctx, icon + ' ' + (cls ? cls.name : '?') + ' selected', G.W / 2, 80, R.colors.blueLight, R.fonts.sm);
      R.textCenter(ctx, 'Choose your hero', G.W / 2, 98, R.colors.text, R.fonts.md);
    } else if (this.data.step === 2) {
      const hero = HEROES[this.data.selectedHero];
      const cls = CLASS_DATA[this.data.selectedClass];
      if (hero && cls) {
        R.roundRect(ctx, 20, 76, G.W - 40, 72, 8, R.colors.panel);
        ctx.strokeStyle = 'rgba(232,160,48,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(28, 76); ctx.lineTo(G.W - 28, 76);
        ctx.quadraticCurveTo(G.W - 20, 76, G.W - 20, 84);
        ctx.lineTo(G.W - 20, 140);
        ctx.quadraticCurveTo(G.W - 20, 148, G.W - 28, 148);
        ctx.lineTo(28, 148);
        ctx.quadraticCurveTo(20, 148, 20, 140);
        ctx.lineTo(20, 84);
        ctx.quadraticCurveTo(20, 76, 28, 76);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = R.colors.orange;
        ctx.fillRect(20, 76, 4, 72);
        R.text(ctx, hero.name + ' \u2014 ' + hero.title, 36, 94, R.colors.orange, R.fonts.md);
        R.text(ctx, cls.name + ' Path', 36, 112, R.colors.blueLight, R.fonts.sm);
        R.text(ctx, 'HP:' + hero.hp + ' MP:' + hero.mp + ' STR:' + hero.str + ' AGI:' + hero.agi + ' MAG:' + hero.mag + ' DEF:' + hero.def, 36, 130, R.colors.text, R.fonts.sm);
      }
      R.textCenter(ctx, 'Choose your Elite Class', G.W / 2, 166, R.colors.orange, R.fonts.md);
    }

    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY, 18);
    UI.Modal.render(ctx);
  },

  buildClassButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    let y = 108;
    const icons = { kshatriya: '\u2694', rishi: '\u2727', yogi: '\u262F' };
    const accents = { kshatriya: R.colors.orange, rishi: R.colors.blue, yogi: R.colors.green };
    for (const [id, cls] of Object.entries(CLASS_DATA)) {
      const icon = icons[id] || '\u25CF';
      const accent = accents[id] || R.colors.blue;
      const btn = UI.Button(20, y, G.W - 40, 80, '', R.colors.btn);
      btn._id = id;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        const isSelected = characterCreateScene.data.selectedClass === this._id;
        const bg = isSelected ? 'rgba(232,160,48,0.1)' : R.colors.btn;
        R.roundRect(ctx, bx, by, bw, bh, 8, bg);
        ctx.strokeStyle = isSelected ? accent : 'rgba(48,128,200,0.3)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(bx + 8, by); ctx.lineTo(bx + bw - 8, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 8);
        ctx.lineTo(bx + bw, by + bh - 8);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 8, by + bh);
        ctx.lineTo(bx + 8, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 8);
        ctx.lineTo(bx, by + 8);
        ctx.quadraticCurveTo(bx, by, bx + 8, by);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = accent;
        ctx.fillRect(bx + 4, by + 6, 4, bh - 12);
        R.text(ctx, icon + '  ' + cls.name, bx + 18, by + 20, R.colors.orange, R.fonts.md);
        R.text(ctx, cls.desc + ' \u2014 ' + cls.focus, bx + 18, by + 40, R.colors.textDim, R.fonts.sm);
        const bonusStr = 'HP+' + cls.startBonus.hp + (cls.startBonus.str ? ' STR+' + cls.startBonus.str : '') + (cls.startBonus.mag ? ' MAG+' + cls.startBonus.mag : '') + (cls.startBonus.mp ? ' MP+' + cls.startBonus.mp : '');
        R.text(ctx, bonusStr, bx + 18, by + 60, R.colors.blueLight, R.fonts.sm);
      };
      btn.onClick = function() {
        characterCreateScene.data.selectedClass = this._id;
        characterCreateScene.data.step = 1;
        characterCreateScene.buildHeroButtons();
      };
      this.data.buttons.push(btn);
      y += 88;
    }
    y += 8;
    const back = UI.Button(60, y, 280, 36, '\u2190  Back to Title');
    back.onClick = function() { gScene('title'); };
    this.data.buttons.push(back);
    y += 48;
    this.data.contentHeight = y;
  },

  buildHeroButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    let y = 115;
    for (const [hid, hero] of Object.entries(HEROES)) {
      const btn = UI.Button(15, y, G.W - 30, 74, '', R.colors.btn);
      btn._hid = hid;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        const isSelected = characterCreateScene.data.selectedHero === this._hid;
        const bg = isSelected ? 'rgba(48,128,200,0.12)' : R.colors.btn;
        R.roundRect(ctx, bx, by, bw, bh, 8, bg);
        ctx.strokeStyle = isSelected ? R.colors.blue : 'rgba(26,64,96,0.4)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(bx + 8, by); ctx.lineTo(bx + bw - 8, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 8);
        ctx.lineTo(bx + bw, by + bh - 8);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 8, by + bh);
        ctx.lineTo(bx + 8, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 8);
        ctx.lineTo(bx, by + 8);
        ctx.quadraticCurveTo(bx, by, bx + 8, by);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = R.colors.blue;
        ctx.fillRect(bx + 3, by + 6, 4, bh - 12);
        R.text(ctx, hero.name + ' \u2014 ' + hero.title, bx + 18, by + 20, R.colors.orange, R.fonts.md);
        R.text(ctx, hero.role, bx + 18, by + 38, R.colors.textDim, R.fonts.sm);
        R.text(ctx, 'HP:' + hero.hp + ' MP:' + hero.mp + ' STR:' + hero.str + ' AGI:' + hero.agi + ' MAG:' + hero.mag + ' DEF:' + hero.def, bx + 18, by + 58, R.colors.blueLight, R.fonts.sm);
      };
      btn.onClick = function() {
        characterCreateScene.data.selectedHero = this._hid;
        characterCreateScene.data.heroName = HEROES[this._hid].name;
        characterCreateScene.data.step = 2;
        characterCreateScene.buildConfirmButtons();
      };
      this.data.buttons.push(btn);
      y += 82;
    }
    y += 8;
    const back = UI.Button(60, y, 280, 36, '\u2190  Back');
    back.onClick = function() {
      characterCreateScene.data.step = 0;
      characterCreateScene.buildClassButtons();
    };
    this.data.buttons.push(back);
    y += 48;
    this.data.contentHeight = y;
  },

  buildConfirmButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const hero = HEROES[this.data.selectedHero];
    const cls = CLASS_DATA[this.data.selectedClass];
    const eliteClasses = cls ? cls.eliteClasses : [];

    let y = 182;

    for (const ec of eliteClasses) {
      const bonus = ec.bonus;
      const bonusParts = [];
      if (bonus.dmgPct) bonusParts.push('+' + bonus.dmgPct + '% DMG');
      if (bonus.hpPct) bonusParts.push('+' + bonus.hpPct + '% HP');
      if (bonus.agi) bonusParts.push('+' + bonus.agi + ' AGI');
      if (bonus.hp) bonusParts.push('+' + bonus.hp + ' HP');
      if (bonus.critPct) bonusParts.push('+' + bonus.critPct + '% CRIT');
      if (bonus.partyHpPct) bonusParts.push('Party +' + bonus.partyHpPct + '% HP');
      if (bonus.elementalDmgPct) bonusParts.push('+' + bonus.elementalDmgPct + '% ELEM');
      if (bonus.ailmentDuration) bonusParts.push('+' + bonus.ailmentDuration + ' turn ailment');
      if (bonus.defPct) bonusParts.push('+' + bonus.defPct + '% DEF');
      if (bonus.regenHpPct) bonusParts.push(bonus.regenHpPct + '% HP/turn');
      if (bonus.mpPct) bonusParts.push('+' + bonus.mpPct + '% MP');
      if (bonus.mpRegen) bonusParts.push('+' + bonus.mpRegen + ' MP/turn');
      if (bonus.spellDmgPct) bonusParts.push('+' + bonus.spellDmgPct + '% spell (1x)');
      if (bonus.magicMilestone) bonusParts.push('+1 Magic Milestone');
      if (bonus.dualCast) bonusParts.push('Dual Cast');
      if (bonus.healDualCast) bonusParts.push('Dual Heal Cast');
      if (bonus.firstCrit2x) bonusParts.push('First Crit 2x');
      const bonusStr = bonusParts.length > 0 ? '\u2726 ' + bonusParts.join(' \u2022 ') : '';

      const btn = UI.Button(20, y, G.W - 40, 62, '', R.colors.panel);
      btn._ec = ec;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        const isSelected = characterCreateScene.data.selectedElite && characterCreateScene.data.selectedElite.id === this._ec.id;
        const bg = isSelected ? 'rgba(232,160,48,0.12)' : R.colors.panel;
        R.roundRect(ctx, bx, by, bw, bh, 8, bg);
        ctx.strokeStyle = isSelected ? R.colors.orange : 'rgba(232,160,48,0.25)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(bx + 8, by); ctx.lineTo(bx + bw - 8, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 8);
        ctx.lineTo(bx + bw, by + bh - 8);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 8, by + bh);
        ctx.lineTo(bx + 8, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 8);
        ctx.lineTo(bx, by + 8);
        ctx.quadraticCurveTo(bx, by, bx + 8, by);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = isSelected ? R.colors.orange : 'rgba(232,160,48,0.4)';
        ctx.fillRect(bx + 3, by + 6, 4, bh - 12);
        R.text(ctx, ec.name, bx + 18, by + 16, R.colors.orange, R.fonts.md);
        R.text(ctx, ec.desc, bx + 18, by + 32, R.colors.text, R.fonts.sm);
        if (bonusStr) {
          R.text(ctx, bonusStr, bx + 18, by + 48, R.colors.blueLight, R.fonts.sm);
        }
      };
      btn.onClick = function() {
        characterCreateScene.data.selectedElite = this._ec;
        const hero = HEROES[characterCreateScene.data.selectedHero];
        const cls = CLASS_DATA[characterCreateScene.data.selectedClass];
        UI.Modal.confirm('Confirm Creation', 'Create ' + hero.name + ' as ' + cls.name + ' with ' + this._ec.name + '?', function(ok){ if(ok) characterCreateScene.confirmCreate(); });
      };
      this.data.buttons.push(btn);
      y += 70;
    }

    y += 6;
    const skip = UI.Button(60, y, 280, 36, '\u2192  Skip Elite (choose later)', R.colors.btn);
    skip.onClick = function() {
      characterCreateScene.data.selectedElite = null;
      const hero = HEROES[characterCreateScene.data.selectedHero];
      const cls = CLASS_DATA[characterCreateScene.data.selectedClass];
      UI.Modal.confirm('Confirm Creation', 'Create ' + hero.name + ' as ' + cls.name + ' (no Elite)?', function(ok){ if(ok) characterCreateScene.confirmCreate(); });
    };
    this.data.buttons.push(skip);
    y += 46;

    const back = UI.Button(60, y, 280, 36, '\u2190  Back', R.colors.btn);
    back.onClick = function() {
      characterCreateScene.data.step = 1;
      characterCreateScene.buildHeroButtons();
    };
    this.data.buttons.push(back);
    y += 48;
    this.data.contentHeight = y;
  },

  confirmCreate: function() {
    const heroId = this.data.selectedHero;
    const hero = createHeroState(heroId);
    const cls = CLASS_DATA[this.data.selectedClass];
    hero.classId = cls.id;
    hero.className = cls.name;
    const sb = cls.startBonus;
    if (sb) {
      if (sb.hp) hero.maxHp += sb.hp;
      if (sb.mp) { hero.maxMp += sb.mp; hero.mp = hero.maxMp; }
      if (sb.str) hero.str += sb.str;
      if (sb.mag) hero.mag += sb.mag;
      if (sb.agi) hero.agi += sb.agi;
      if (sb.def) hero.def += sb.def;
    }
    if (this.data.selectedElite) {
      hero.eliteClassId = this.data.selectedElite.id;
      hero.eliteClassName = this.data.selectedElite.name;
      const bonus = this.data.selectedElite.bonus;
      if (bonus.hpPct) hero.maxHp = Math.floor(hero.maxHp * (1 + bonus.hpPct / 100));
      if (bonus.dmgPct) hero.str = Math.floor(hero.str * (1 + bonus.dmgPct / 100));
      if (bonus.agi) hero.agi += bonus.agi;
      if (bonus.hp) hero.maxHp += bonus.hp;
      if (bonus.critPct) hero.baseCrit = (hero.baseCrit || 10) + bonus.critPct;
      if (bonus.partyHpPct) hero.partyHpBuff = bonus.partyHpPct;
      if (bonus.elementalDmgPct) hero.elementalDmgPct = bonus.elementalDmgPct;
      if (bonus.ailmentDuration) hero.ailmentDurationBonus = bonus.ailmentDuration;
      if (bonus.defPct) hero.def = Math.floor(hero.def * (1 + bonus.defPct / 100));
      if (bonus.regenHpPct) hero.regenHpPct = bonus.regenHpPct;
      if (bonus.mpPct) { hero.maxMp = Math.floor(hero.maxMp * (1 + bonus.mpPct / 100)); hero.mp = hero.maxMp; }
      if (bonus.mpRegen) hero.mpRegen = bonus.mpRegen;
    }
    hero.hp = hero.maxHp;
    hero.mp = hero.maxMp;
    G.state.party = [hero];
    G.state.player = hero;
    G.state.gold = 50;
    G.state.inventory = [];
    Economy.addItem({ name: 'HP Potion', type: 'consumable', heal: 30, cost: 15, desc: 'Restores 30 HP' });
    Economy.addItem({ name: 'HP Potion', type: 'consumable', heal: 30, cost: 15, desc: 'Restores 30 HP' });
    G.state.ashramLevel = 1;
    G.state.alchemyRecipes = ['xpPill'];
    const starterBeast = createBeastState('wolf');
    if (starterBeast) G.state.spiritBeasts = [starterBeast];
    Audio.menuSwoosh();
    gScene('welcome');
  }
});
