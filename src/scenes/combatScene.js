const ENLIGHTENMENT_STORIES = {
  meditate: {
    story: 'You sit cross-legged amidst the remnants of battle. The prana flows through you like a warm river, cleansing your chakras.',
    buff: 1.2, timer: 60
  },
  pushOn: {
    story: 'You grit your teeth and push forward, channeling the thrill of combat into relentless growth. Experience floods your being.',
    buff: 0.9, xpBuff: 1.15, timer: 60
  },
  rest: {
    story: 'You lay down your weapon and breathe deep. The gentle hum of the earth restores your spirit at a measured pace.',
    buff: 1.1, timer: 90
  }
};

const ENCOUNTER_STORIES = {
  aryavarta: [
    'The tall grass rustles as something stirs within the golden fields...',
    'A flock of startled birds erupts from the treeline ahead.',
    'The scent of wildflowers mixes with the iron tang of blood.',
    'Footsteps echo on the ancient stone path winding through the plains.'
  ],
  dandaka: [
    'The twisted trees groan as dark energy seeps through the canopy...',
    'Whispers in an ancient tongue slither through the gloom.',
    'Blue fireflies scatter as a presence emerges from the shadows.',
    'The very air grows heavy with centuries of untold sorrow.'
  ],
  meru: [
    'A cold wind howls across the jagged peaks, carrying the cries of elemental spirits...',
    'The snow beneath your feet cracks, revealing ancient ice rituals.',
    'Lightning splits the sky as the mountain tests your resolve.',
    'A shimmering aura surrounds the summit — the elementals are watching.'
  ],
  patala: [
    'The heat grows unbearable as you descend into the infernal depths...',
    'Lava bubbles cast an eerie crimson glow on the stone pillars.',
    'The wails of the damned echo through the cavernous darkness.',
    'Asura runes pulse on the walls, marking this as their domain.'
  ],
  svarga: [
    'Celestial light pierces through the clouds as you step onto the heavenly plane...',
    'The melody of a divine veena resonates through the golden halls.',
    'Fragrant garlands litter the marble pathways of the abandoned celestial court.',
    'A bolt of divine energy crackles across the pristine sky.'
  ]
};

const combatScene = Scene.create({
  name: 'combatScene',
  data: {
    heroes: [],
    enemies: [],
    turnState: 'start',
    log: [],
    selectedSkill: null,
    selectedEnemy: null,
    buttons: [],
    actionButtons: [],
    enemyButtons: [],
    result: null,
    fleeAttempted: false,
    damageFlash: 0,
    autoBattle: false,
    encounterStory: '',
    beastSkillUsed: false,
    beastCooldown: 0,
    scrollY: 0,
    turnCount: 0
  },

  enter: function() {
    Hints.show('combat', 'Tap a foe on the right to target it. Chained hits build combo damage.');
    const zone = G.state.currentZone;
    const musicMap = { aryavarta: 'combat_aryavarta', dandaka: 'combat_dandaka', meru: 'combat_meru', patala: 'combat_patala', svarga: 'combat_svarga' };
    Audio.playMusic(musicMap[zone] || 'combat_aryavarta');
    this.data.heroes = JSON.parse(JSON.stringify(G.state.party.filter(h => h.hp > 0)));
    this.data.enemies = JSON.parse(JSON.stringify(G.state.currentEnemies || []));
    if (this.data.enemies.length === 0) {
      this.data.log.push('No enemies found — returning to Ashram.');
      setTimeout(function(){ if (G.currentScene===combatScene) gScene('ashram',true); }, 600);
      return;
    }
    this.data.beastSkillUsed = false;
    this.data.beastCooldown = 0;
    this.data.turnCount = 0;
    this.data.runId = (this.data.runId || 0) + 1;   // invalidates timers from a previous battle
    const stories = ENCOUNTER_STORIES[zone] || ENCOUNTER_STORIES.aryavarta;
    this.data.encounterStory = stories[Math.floor(Math.random() * stories.length)];
    this.data.log = ['Battle begins!'];
    this.data.selectedSkill = null;
    this.data.buttons = [];
    this.data.actionButtons = [];
    this.data.result = null;
    this.data.damageFlash = 0;
    this.data.showEnlightenment = false;
    this.data.autoBattle = false;
    this.data.scrollY = 0;
    this.data.selectedEnemy = null;
    this.data.enemyButtons = [];
    Combat.startBattle(this.data.heroes, this.data.enemies);
    const firstAlive = this.data.enemies.find(e => e.hp > 0);
    if (firstAlive) this.data.selectedEnemy = firstAlive;
    const firstActor = Combat.getCurrentActor();
    if (firstActor && firstActor.type === 'hero') {
      this.data.turnState = 'playerTurn';
      this.buildActionButtons();
    } else {
      this.data.turnState = 'enemyTurn';
      if (firstActor) this.doEnemyTurn(firstActor);
    }
  },

  getActionAreaTop: function() { return 270; },
  getActionAreaHeight: function() { return G.H - this.getActionAreaTop(); },

  clampScroll: function() {
    if (this.data.actionButtons.length === 0) return;
    const logH = Math.min(4, this.data.log.length) * 18 + 20;
    const contentH = logH + this.data.actionButtons.length * 34 + 30;
    const maxScroll = Math.max(0, contentH - this.getActionAreaHeight());
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildActionButtons: function() {
    this.data.buttons = [];
    this.data.actionButtons = [];
    this.data.scrollY = 0;

    if (this.data.turnState === 'playerTurn') {
      const actor = Combat.getCurrentActor();
      if (actor && actor.type === 'hero') {
        const hero = actor.ref;
        const skills = hero.skills || [];
        let y = 6;

        const atkBtn = UI.BtnGold(20, y, G.W / 2 - 26, 30, 'Attack');
        atkBtn.onClick = function() { combatScene.doPlayerAttack(null); };
        this.data.actionButtons.push(atkBtn);

        const defBtn = UI.Button(G.W / 2 + 6, y, G.W / 2 - 26, 30, 'Defend');
        defBtn.onClick = function() { combatScene.doDefend(); };
        this.data.actionButtons.push(defBtn);
        y += 36;

          for (const skill of skills) {
          const label = skill.name + ' (' + (skill.cost || 0) + ' MP)';
          const btn = UI.Button(20, y, G.W - 40, 28, label);
          btn.data = skill;
          btn.enabled = hero.mp >= (skill.cost || 0);
          btn.onClick = function() { combatScene.doPlayerAttack(this.data); };
          this.data.actionButtons.push(btn);
          y += 32;
        }

        const beast = (G.state.spiritBeasts || []).find(b => b.id === G.state.activeBeast);
        if (beast) {
          if (this.data.beastCooldown <= 0) {
            const beastLabel = 'Beast: ' + beast.name + ' \u2192 ' + beast.skill;
            const beastBtn = UI.Button(20, y, G.W - 40, 28, beastLabel, R.colors.green);
            beastBtn.onClick = function() { combatScene.doBeastSkill(); };
            this.data.actionButtons.push(beastBtn);
            y += 32;
          } else {
            const cdLabel = this.data.beastSkillUsed ? 'Beast: ' + beast.name + ' (used)' : 'Beast: ' + beast.name + ' (' + this.data.beastCooldown + 't)';
            const cdBtn = UI.Button(20, y, G.W - 40, 28, cdLabel, R.colors.btn);
            cdBtn.enabled = false;
            this.data.actionButtons.push(cdBtn);
            y += 32;
          }
        }

        y += 4;

        const autoBtn = UI.Button(20, y, (G.W - 40) / 2 - 3, 26, this.data.autoBattle ? 'Auto: ON' : 'Auto: OFF', this.data.autoBattle ? R.colors.green : R.colors.btn);
        autoBtn.onClick = function() {
          combatScene.data.autoBattle = !combatScene.data.autoBattle;
          combatScene.buildActionButtons();
          if (combatScene.data.autoBattle) combatScene.doAutoTurn();
        };
        this.data.actionButtons.push(autoBtn);

        const flee = UI.Button(G.W / 2 + 3, y, (G.W - 40) / 2 - 3, 26, 'Flee');
        flee.onClick = function() { combatScene.doFlee(); };
        this.data.actionButtons.push(flee);

        this.data.enemyButtons = [];
        let ey = 6;
        for (const enemy of this.data.enemies) {
          if (enemy.hp <= 0) continue;
          const isSelected = this.data.selectedEnemy === enemy;
          const btn = UI.Button(G.W - 62, ey, 56, 28, enemy.name.substring(0, 5), isSelected ? R.colors.btnGold : R.colors.btn);
          btn._enemyRef = enemy;
          btn.onClick = (function(e) {
            return function() {
              combatScene.data.selectedEnemy = e;
              combatScene.buildActionButtons();
            };
          })(enemy);
          this.data.enemyButtons.push(btn);
          ey += 32;
        }
      }
    } else if (this.data.turnState === 'result') {
      const btn = UI.BtnGold(100, 10, 200, 36, 'Continue');
      btn.onClick = function() {
        gScene('ashram', true);
      };
      this.data.actionButtons.push(btn);
    }
  },

  doAutoTurn: function() {
    if (!this.data.autoBattle || this.data.turnState !== 'playerTurn') return;
    const actor = Combat.getCurrentActor();
    if (!actor || actor.type !== 'hero') return;
    const hero = actor.ref;
    const skills = hero.skills || [];
    const usableSkills = skills.filter(s => hero.mp >= (s.cost || 0));
    if (usableSkills.length > 0 && Math.random() < 0.4) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
      this.doPlayerAttack(skill);
    } else {
      this.doPlayerAttack(null);
    }
  },

  doBeastSkill: function() {
    const beast = (G.state.spiritBeasts || []).find(b => b.id === G.state.activeBeast);
    if (!beast) return;
    const beastData = SPIRIT_BEASTS[beast.id];
    if (!beastData) return;
    const skill = beastData.skill;

    switch (skill) {
      case 'Howl':
        for (const h of this.data.heroes) {
          if (h.hp > 0) Combat.applyBuff(h, 'atkBuff', 1.1, 3);
        }
        this.data.log.push('Beast: Howl — Party ATK +10% for 3 turns');
        break;

      case 'Venom Bite': {
        let t = this.data.selectedEnemy;
        if (!t || t.hp <= 0) t = Combat.getRandomEnemy();
        if (t) { Combat.applyAilment(t, 'visha', 3); this.data.log.push('Beast: Venom Bite — ' + t.name + ' poisoned!'); }
        break;
      }

      case 'Dark Veil':
        for (const e of this.data.enemies) {
          if (e.hp > 0) Combat.applyBuff(e, 'accDebuff', 0.85, 3);
        }
        this.data.log.push('Beast: Dark Veil — Enemy accuracy reduced');
        break;

      case 'Fortify':
        for (const h of this.data.heroes) {
          if (h.hp > 0) Combat.applyBuff(h, 'defBuff', 1.2, 3);
        }
        this.data.log.push('Beast: Fortify — Party DEF +20% for 3 turns');
        break;

      case 'Spirit Flame': {
        let t = this.data.selectedEnemy;
        if (!t || t.hp <= 0) t = Combat.getRandomEnemy();
        if (t) {
          const dmg = Math.max(1, Math.floor(25 * (1 + (beast.mag || 1) * 0.1)));
          t.hp -= dmg;
          if (t.hp < 0) t.hp = 0;
          if (t.hp <= 0) this.deathBurstAt(t, false);
          this.data.log.push('Beast: Spirit Flame — ' + t.name + ' takes ' + dmg + ' damage');
        }
        break;
      }

      case 'Tempest':
        for (const e of this.data.enemies) {
          if (e.hp <= 0) continue;
          const dmg = Math.max(1, Math.floor(40 * (1 + (beast.mag || 1) * 0.1)));
          e.hp -= dmg;
          if (e.hp < 0) e.hp = 0;
          if (e.hp <= 0) this.deathBurstAt(e, false);
        }
        this.data.log.push('Beast: ' + beast.name + ' — Tempest AoE ' + (Math.max(1, Math.floor(40 * (1 + (beast.mag || 1) * 0.1)))) + ' wind dmg to all');
        R.screenShake(6, 0.3);
        break;

      case 'Rebirth Flame': {
        const fallen = this.data.heroes.find(h => h.hp <= 0);
        if (fallen) {
          fallen.hp = Math.floor(fallen.maxHp * 0.3);
          this.data.log.push('Beast: Rebirth Flame — ' + fallen.name + ' revived with 30% HP!');
          this.data.beastSkillUsed = true;
          this.data.beastCooldown = 999;
        } else {
          this.data.log.push('No fallen allies to revive!');
          this.buildActionButtons();
          return;
        }
        break;
      }

      case 'Shell Guard': {
        const t = Combat.getRandomHero();
        if (t) {
          Combat.applyBuff(t, 'shield', 20, 2);
          this.data.log.push('Beast: Shell Guard — ' + t.name + ' shielded for 20 damage');
        }
        break;
      }

      case 'Rending Claw': {
        let t = this.data.selectedEnemy;
        if (!t || t.hp <= 0) t = Combat.getRandomEnemy();
        if (t) {
          const dmg = Math.max(1, Math.floor(30 * (1 + (beast.str || 1) * 0.1)));
          t.hp -= dmg;
          if (t.hp < 0) t.hp = 0;
          if (t.hp <= 0) this.deathBurstAt(t, false);
          Combat.applyAilment(t, 'rakta', 3);
          this.data.log.push('Beast: Rending Claw — ' + t.name + ' takes ' + dmg + ' damage + Bleed!');
        }
        break;
      }

      case 'Mirage': {
        let t = this.data.selectedEnemy;
        if (!t || t.hp <= 0) t = Combat.getRandomEnemy();
        if (t) {
          Combat.applyAilment(t, 'confuse', 1);
          this.data.log.push('Beast: Mirage — ' + t.name + ' confused!');
        }
        break;
      }
    }

    if (!this.data.beastSkillUsed) this.data.beastCooldown = 2;
    Combat.checkBattleEnd();
    if (Combat.battleOver) {
      this.endBattle();
    } else {
      this.advanceTurn();
    }
  },

  // Spawn a death burst at an entity's battlefield position.
  deathBurstAt: function(entity, isHero) {
    let x, y;
    if (isHero) {
      const idx = Math.max(0, this.data.heroes.indexOf(entity));
      x = idx * 70 + 30;
      y = 50;
    } else {
      const idx = this.data.enemies.indexOf(entity);
      x = 370 - idx * 70;
      y = 50;
    }
    R.deathBurst(x, y, isHero ? R.colors.blue : R.colors.red);
  },

  doPlayerAttack: function(skill) {
    const actor = Combat.getCurrentActor();
    if (!actor || actor.type !== 'hero') return;
    const hero = actor.ref;
    if (skill && skill.cost) {
      if (hero.mp < skill.cost) return;
      hero.mp -= skill.cost;
    }
    let target = this.data.selectedEnemy;
    if (!target || target.hp <= 0) {
      target = Combat.getRandomEnemy();
    }
    if (!target) return;

    if (skill && skill.heal) {
      for (const h of this.data.heroes) {
        if (h.hp > 0) {
          const healAmt = Math.floor(h.maxHp * skill.heal);
          h.hp = Math.min(h.maxHp, h.hp + healAmt);
        }
      }
      this.data.log.push(hero.name + ' uses ' + skill.name + ' — party healed!');
      this.data.damageFlash = 0.2;
      this.advanceTurn();
      return;
    }

    const result = Combat.performAttack(hero, target, skill);
    this.data.log.push(hero.name + ' attacks ' + target.name + ' for ' + result.dmg + (result.isCrit ? ' CRIT!' : ''));
    this.data.damageFlash = 0.2;
    if (target.hp <= 0) this.deathBurstAt(target, false);
    const heroIdx = this.data.heroes.findIndex(h => h.id === hero.id);
    const heroX = Math.max(0, heroIdx) * 70 + 30;
    const heroY = 50;
    const enemyIdx = this.data.enemies.indexOf(target);
    const enemyX = 370 - enemyIdx * 70;
    const enemyY = 50;
    const weaponType = hero.weaponType || 'bow';
    const projType = weaponType === 'bow' ? 'arrow' : weaponType === 'spear' ? 'spear' : 'mace';
    R.fireProjectile(heroX, heroY, enemyX, enemyY, result.isCrit ? R.colors.goldLight : R.colors.gold, 250, projType);
    setTimeout(function() {
      R.damageNumber(G.ctx, enemyX, enemyY - 20, result.dmg, result.isCrit ? R.colors.gold : R.colors.red);
    }, 200);
    if (target.hp <= 0) this.deathBurstAt(target, false);

    // Battle Wizard: an offensive skill follows up with a half-strength second strike.
    if (hero.dualCast && skill && !skill.heal && target.hp > 0) {
      const echo = JSON.parse(JSON.stringify(skill));
      echo.dmg = (skill.dmg || 1) * 0.5;
      const r2 = Combat.performAttack(hero, target, echo);
      this.data.log.push('Dual cast! ' + hero.name + ' strikes again for ' + r2.dmg);
      if (target.hp <= 0) this.deathBurstAt(target, false);
    }
    R.screenShake(result.isCrit ? 8 : 4, result.isCrit ? 0.4 : 0.2);
    this.advanceTurn();
  },

  doDefend: function() {
    const actor = Combat.getCurrentActor();
    if (!actor || actor.type !== 'hero') return;
    const hero = actor.ref;
    Combat.applyBuff(hero, 'defBuff', 1.5, 1);
    this.data.log.push(hero.name + ' defends!');
    this.advanceTurn();
  },

  doFlee: function() {
    if (G.state.isBossFight) {
      this.data.log.push('Cannot flee from a boss!');
      return;
    }
    if (Math.random() < 0.5) {
      this.data.log.push('Fled successfully!');
      G.state.fledCombat = true;
      gScene('ashram');
    } else {
      this.data.log.push('Failed to flee!');
      this.advanceTurn();
    }
  },

  advanceTurn: function() {
    Combat.nextTurn();
    this.data.buttons = [];
    this.data.actionButtons = [];
    if (this.data.beastCooldown > 0) this.data.beastCooldown--;
    if (!this.data.enemies.some(e => e === this.data.selectedEnemy && e.hp > 0)) {
      this.data.selectedEnemy = this.data.enemies.find(e => e.hp > 0) || null;
    }
    if (Combat.battleOver) {
      this.endBattle();
      return;
    }
    const actor = Combat.getCurrentActor();
    if (actor && actor.type !== 'enemy') this.data.turnCount++;
    if (actor && actor.type === 'enemy') {
      this.data.turnState = 'enemyTurn';
      this.doEnemyTurn(actor);
    } else {
      this.data.turnState = 'playerTurn';
      this.buildActionButtons();
      if (this.data.autoBattle) {
        var autoRunId = this.data.runId;
        setTimeout(function() { if (G.currentScene !== combatScene || combatScene.data.runId !== autoRunId) return; combatScene.doAutoTurn(); }, 300);
      }
    }
  },

  doEnemyTurn: function(actor) {
    const enemy = actor.ref;
    const result = Combat.enemyAI(enemy);
    if (result && result.skipped) {
      if (result.skipped === 'stunned') this.data.log.push(enemy.name + ' is stunned and skips its turn!');
      else if (result.skipped === 'confused') this.data.log.push(enemy.name + ' is confused and skips its turn!');
      else if (result.skipped === 'no_target') this.data.log.push(enemy.name + ' has no target!');
    } else if (result) {
      const target = Combat.getRandomHero();
      if (target) {
        const abilityText = result.ability ? ' uses ' + result.ability : ' attacks';
        if (result.dmg > 0) this.data.log.push(enemy.name + abilityText + ' on ' + target.name + ' for ' + result.dmg);
        else this.data.log.push(enemy.name + abilityText + ' on ' + target.name);
        const enemyIdx = this.data.enemies.indexOf(enemy);
        const enemyX = 370 - enemyIdx * 70;
        const enemyY = 50;
        const targetIdx = this.data.heroes.findIndex(h => h.id === target.id);
        const heroX = targetIdx * 70 + 30;
        const heroY = 50;
        R.fireProjectile(enemyX, enemyY, heroX, heroY, R.colors.red, 200, 'spear');
        setTimeout(function() {
          R.damageNumber(G.ctx, heroX, heroY - 20, result.dmg, R.colors.red);
        }, 200);
        if (target.hp <= 0) combatScene.deathBurstAt(target, true);
        R.screenShake(3, 0.15);
      }
    } else {
      this.data.log.push(enemy.name + ' is confused and skips its turn!');
    }
    var enemyRunId = this.data.runId;
    setTimeout(function() {
      if (G.currentScene !== combatScene || combatScene.data.runId !== enemyRunId) return;
      combatScene.advanceTurn();
    }, 500);
  },

  endBattle: function() {
    this.data.turnState = 'result';
    const won = this.data.enemies.every(e => e.hp <= 0);
    const heroes = this.data.heroes;
    const totalHp = heroes.reduce((s, h) => s + Math.max(0, h.hp), 0);
    const totalMax = heroes.reduce((s, h) => s + Math.max(1, h.maxHp), 0);
    Progression.adjustChallenge({
      won: won,
      hpPct: totalHp / totalMax,
      turnsPerEnemy: this.data.turnCount / Math.max(1, this.data.enemies.length)
    });
    this.data.buttons = [];
    this.data.enemyButtons = [];
    this.data.actionButtons = [];
    Combat.awardBeastXP();
    if (won) {
      const loot = Combat.getLoot();
      Economy.addGold(Math.floor(loot.gold * (1 + Progression.perkValue('kirti') / 100)));
      const xpPerHero = Math.floor(loot.xp / Math.max(1, this.data.heroes.filter(h => h.hp > 0).length));
      const leveled = Progression.addPartyXP(xpPerHero);
      for (const e of this.data.enemies) {
        if (e.hp <= 0) QuestSystem.trackKill(e.id, G.state.currentZone);
      }
      this.data.log.push('Victory! Gained ' + loot.gold + ' gold, ' + xpPerHero + ' XP each');
      
      const droppedLoot = [];
      for (const e of this.data.enemies) {
        if (e.hp <= 0) {
          const items = generateLoot(G.state.currentZone, e.level);
          droppedLoot.push(...items);
        }
      }
      if (droppedLoot.length > 0) {
        if (!G.state.inventory) G.state.inventory = [];
        for (const item of droppedLoot) {
          G.state.inventory.push(item);
          this.data.log.push('Found: ' + item.name + ' (' + item.rarityName + ')');
        }
      }
      if (G.state.isBossFight) {
        Economy.addKarma(1);
        if (!G.state.flags) G.state.flags = {};
        G.state.flags.bossesDefeated = (G.state.flags.bossesDefeated || 0) + 1;
        G.state.flags['boss_' + G.state.currentZone] = true;
        this.data.log.push('Boss defeated! +1 Karma');
        G.state.zoneProgress[G.state.currentZone] = 100;
        SaveSystem.save();
        const zone = ZONES[G.state.currentZone];
        if (zone) {
          const rewardGold = 50 + (zone.reqLevel || 1) * 10;
          Economy.addGold(rewardGold);
          this.data.log.push('Zone complete! +' + rewardGold + ' Gold');
        }
      }
      if (leveled) { this.data.log.push('Level up!'); R.triggerLevelUp(); }
      AchievementSystem.check();
      if (Math.random() < 0.15) {
        const zoneBeastPools = {
          aryavarta: ['wolf', 'serpent'],
          dandaka: ['owl', 'turtle'],
          meru: ['bear', 'tiger'],
          patala: ['fox', 'phoenix'],
          svarga: ['dragon', 'kitsune']
        };
        const pool = zoneBeastPools[G.state.currentZone] || ['wolf', 'serpent'];
        const bid = pool[Math.floor(Math.random() * pool.length)];
        const beast = createBeastState(bid);
        if (beast && !G.state.spiritBeasts.some(b => b.id === bid)) {
          G.state.spiritBeasts.push(beast);
          this.data.log.push('A ' + beast.name + ' spirit bond formed!');
          Hints.show('beast', 'A spirit beast joined you — activate it from Beasts at the Ashram.');
        }
      }
      for (let i = 0; i < G.state.party.length; i++) {
        const orig = G.state.party[i];
        if (orig.hp <= 0) continue;
        const combatHero = this.data.heroes.find(h => h.id === orig.id);
        if (combatHero) {
          orig.hp = Math.min(combatHero.hp, orig.maxHp);
          orig.mp = combatHero.mp;
        }
      }
      this.data.result = { won: true };
      this.data.showEnlightenment = true;
      this.buildEnlightenmentButtons();
    } else {
      this.data.log.push('Defeated! Retreating to Ashram...');
      for (const h of G.state.party) h.hp = Math.floor(h.maxHp * 0.3);
      this.data.result = { won: false };
      this.buildContinueButton();
    }
  },

  buildEnlightenmentButtons: function() {
    this.data.actionButtons = [];
    this.data.scrollY = 0;
    const enlightenments = [
      { id: 'meditate', text: 'Meditate: Still your mind', story: ENLIGHTENMENT_STORIES.meditate.story, buff: 1.2, timer: 60 },
      { id: 'pushOn', text: 'Push On: Relentless drive', story: ENLIGHTENMENT_STORIES.pushOn.story, buff: 0.9, xpBuff: 1.15, timer: 60 },
      { id: 'rest', text: 'Rest: Recover your spirit', story: ENLIGHTENMENT_STORIES.rest.story, buff: 1.1, timer: 90 }
    ];
    let y = 6;
    for (const e of enlightenments) {
      const btn = UI.Button(20, y, G.W - 40, 48, e.text, R.colors.btnGold);
      btn.onClick = (function(opt) {
        return function() {
          G.state.enlightenmentBuff = opt.buff;
          G.state.enlightenmentTimer = opt.timer;
          if (opt.xpBuff) G.state.xpBuff = opt.xpBuff;
          else G.state.xpBuff = null;
          Notify.show('"' + opt.story + '"', 3, R.colors.gold);
          combatScene.data.showEnlightenment = false;
          combatScene.buildContinueButton();
        };
      })(e);
      this.data.actionButtons.push(btn);
      y += 54;
    }
    const decline = UI.Button(20, y, G.W - 40, 28, 'Decline Blessing', R.colors.btn);
    decline.onClick = function() {
      combatScene.data.showEnlightenment = false;
      combatScene.buildContinueButton();
    };
    this.data.actionButtons.push(decline);
    y += 34;
    this.data.enemyButtons = [];
  },

  buildContinueButton: function() {
    this.data.actionButtons = [];
    this.data.scrollY = 0;
    const btn = UI.BtnGold(60, 6, 280, 42, 'Continue');
    btn.onClick = function() {
      if (combatScene.data.result && combatScene.data.result.won && G.state.returnToExploration) {
        gScene('zoneExploration', true);
      } else {
        gScene('ashram', true);
      }
    };
    this.data.actionButtons.push(btn);
  },

  update: function(dt) {
    if (this.data.damageFlash > 0) this.data.damageFlash -= dt;
    Scene.scrollInput(this);
    UI.updateButtons(this.data.actionButtons, dt);
    UI.updateButtons(this.data.enemyButtons, dt);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.actionButtons, this.getActionAreaTop() - 6 - this.data.scrollY);
    UI.handleButtons(this.data.enemyButtons);
    if (this.data.buttons.length > 0) UI.handleButtons(this.data.buttons);
  },

  render: function(ctx) {
    R.drawZoneBackground(ctx, G.state.currentZone);
    if (this.data.damageFlash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, 0, G.W, G.H);
    }

    R.roundRect(ctx, 10, 6, G.W - 20, 96, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 95);

    R.textCenter(ctx, '\u2694 Combat ' + (G.state.isBossFight ? '\u2605 BOSS' : ''), G.W / 2, 22, G.state.isBossFight ? R.colors.red : R.colors.gold, R.fonts.lg);

    if (this.data.turnState === 'playerTurn') {
      const currentActor = Combat.getCurrentActor();
      if (currentActor && currentActor.ref) {
        R.roundRect(ctx, G.W / 2 - 70, 76, 140, 16, 4, 'rgba(48,200,48,0.2)');
        R.textCenter(ctx, '\u25B6 ' + currentActor.ref.name + '\'s Turn', G.W / 2, 88, R.colors.green, R.fonts.sm);
      }
      if (Combat.comboCount >= 2) {
        const multiplier = 1.0 + Math.min(10, Combat.comboCount - 1) * 0.1;
        R.textCenter(ctx, 'COMBO x' + Combat.comboCount + ' (' + multiplier.toFixed(1) + 'x DMG)', G.W / 2, 104, R.colors.red, R.fonts.sm);
      }
    } else if (this.data.turnState === 'enemyTurn') {
      R.roundRect(ctx, G.W / 2 - 70, 76, 140, 16, 4, 'rgba(200,48,48,0.2)');
      R.textCenter(ctx, '\u25C0 Enemy Turn', G.W / 2, 88, R.colors.red, R.fonts.sm);
    }

    let hx = 12;
    const heroStep = this.data.heroes.length <= 3 ? 90 : 68;   // keep 4-5 hero bars on-canvas
    const hy = 32;
    for (const h of this.data.heroes) {
      const col = h.hp > 0 ? R.colors.text : R.colors.textDim;
      R.drawHero(ctx, h.id, hx + 12, hy, 22);
      R.textCenter(ctx, h.name, hx + 12, hy + 30, col, R.fonts.sm);
      if (h.hp > 0) {
        R.roundRect(ctx, hx, hy + 34, 48, 4, 2, 'rgba(200,48,48,0.2)');
        R.roundRect(ctx, hx, hy + 34, 48 * Math.min(1, Math.max(0, h.hp / h.maxHp)), 4, 2, R.colors.hp);
        R.roundRect(ctx, hx, hy + 40, 48, 3, 2, 'rgba(48,128,200,0.2)');
        R.roundRect(ctx, hx, hy + 40, 48 * (h.mp / h.maxMp), 3, 2, R.colors.mp);
      }
      const buffStr = [];
      if (h.buffs) {
        if (h.buffs.defBuff) buffStr.push('DEF+');
        if (h.buffs.shield) buffStr.push('Shield');
      }
      const ailStr = h.ailments ? Object.keys(h.ailments).join(',') : '';
      if (buffStr.length || ailStr) {
        ctx.fillStyle = R.colors.textDim;
        ctx.font = R.fonts.sm;
        R.textCenter(ctx, (buffStr.length ? buffStr.join(' ') : '') + (ailStr ? ' [' + ailStr + ']' : ''), hx + 12, hy + 48, R.colors.textDim, R.fonts.sm);
      }
      hx += heroStep;
    }

    let ex = G.W - 22, ey = 32;
    for (const e of this.data.enemies) {
      R.drawEnemy(ctx, e.id, ex - 12, ey, 22);
      R.textCenter(ctx, e.name, ex - 12, ey + 30, e.hp > 0 ? R.colors.red : R.colors.textDim, R.fonts.sm);
      if (e.hp > 0) {
        R.roundRect(ctx, ex - 48, ey + 34, 48, 4, 2, 'rgba(200,48,48,0.2)');
        R.roundRect(ctx, ex - 48, ey + 34, 48 * Math.min(1, Math.max(0, e.hp / e.maxHp)), 4, 2, R.colors.hp);
      }
      const ailStr = e.ailments ? Object.keys(e.ailments).join(',') : '';
      if (ailStr) {
        R.textCenter(ctx, '[' + ailStr + ']', ex - 12, ey + 44, R.colors.textDim, R.fonts.sm);
      }
      ex -= 90;
    }
    for (const b of this.data.enemyButtons) b.render(ctx);
    // Fixed combat log (does not scroll with action list)
    {
      const logSlice = this.data.log.slice(-4);
      let logY = this.getActionAreaTop() - 78;
      for (const msg of logSlice) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        R.roundRect(ctx, 14, logY - 1, G.W - 28, 16, 3, ctx.fillStyle);
        R.textCenter(ctx, msg, G.W / 2, logY + 11, R.colors.text, R.fonts.sm);
        logY += 18;
      }
    }

    const top = this.getActionAreaTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(8, top - 4, G.W - 16, this.getActionAreaHeight() + 4);
    ctx.clip();
    ctx.translate(0, top - 6 - this.data.scrollY);

    const actionContentH = this.data.actionButtons.length * 42 + 120;
    R.roundRect(ctx, 10, 6, G.W - 20, actionContentH, 8, 'rgba(0,0,0,0.6)');

    const logLine = this.data.encounterStory && this.data.turnState !== 'result' ? this.data.encounterStory : '';
    if (logLine) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      R.roundRect(ctx, 12, 10, G.W - 24, 20, 4, ctx.fillStyle);
      R.textCenter(ctx, logLine, G.W / 2, 23, R.colors.textDim, R.fonts.sm);
    }

    let ly = 34;

    if (this.data.showEnlightenment) {
      ly += 4;
      for (const b of this.data.actionButtons) {
        b.y = ly;
        b.render(ctx);
        ly += 56;
      }
    } else if (this.data.turnState === 'enemyTurn') {
      ly += 8;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      R.roundRect(ctx, 80, ly, 240, 28, 6, ctx.fillStyle);
      R.textCenter(ctx, 'Enemy is acting...', G.W / 2, ly + 19, R.colors.textDim, R.fonts.md);
    } else if (this.data.turnState !== 'result') {
      ly += 4;
      for (const b of this.data.actionButtons) {
        b.y = ly;
        b.render(ctx);
        ly += 34;
      }
    }

    if (this.data.turnState === 'result' && !this.data.showEnlightenment) {
      ly += 8;
      for (const b of this.data.actionButtons) {
        b.y = ly;
        b.render(ctx);
        ly += 50;
      }
    }

    ctx.restore();

    if (this.data.actionButtons.length > 0) {
      const logH2 = Math.min(4, this.data.log.length) * 18 + 20;
      const contentH2 = logH2 + this.data.actionButtons.length * 34 + 30;
      const maxScroll = Math.max(1, contentH2 - this.getActionAreaHeight());
      if (maxScroll > 0 && this.data.actionButtons.length > 1) {
        const vh = this.getActionAreaHeight();
        const ratio = vh / contentH2;
        const barH = Math.max(16, ratio * vh);
        const maxTrack = vh - barH;
        const scrollFrac = this.data.scrollY / maxScroll;
        const barY = top + scrollFrac * maxTrack;
        R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
      }
    }

    Audio.musicVolume(Combat.battleOver ? 1.0 : 0.7);
  }
});
