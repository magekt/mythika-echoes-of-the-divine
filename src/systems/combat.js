const Combat = {
  turnOrder: [],
  currentTurn: 0,
  isPlayerTurn: true,
  battleOver: false,
  comboCount: 0,
  comboTimer: 0,
  combos: []
};

Combat.AILMENT_EFFECTS = {
  rakta: { name: 'Bleed', dmgPerTurn: 5, duration: 3, color: '#c83030' },
  vajra: { name: 'Stun', duration: 1, color: '#e8c880' },
  agni: { name: 'Burn', dmgPerTurn: 8, duration: 3, color: '#e8a030' },
  visha: { name: 'Poison', dmgPerTurn: 6, duration: 4, color: '#30c830' },
  shila: { name: 'Freeze', duration: 2, color: '#3080c8' },
  vayu: { name: 'Wind', dmgPerTurn: 3, duration: 2, color: '#80c8c8' },
  confuse: { name: 'Confuse', duration: 1, color: '#c8a0e8' }
};

Combat.CRIT_MULTIPLIER = 1.5;

Combat.startBattle = function(heroes, enemies) {
  this.heroes = heroes;
  this.enemies = enemies;
  this.turnOrder = [];
  this.currentTurn = 0;
  this.battleOver = false;
  this.comboCount = 0;
  this.comboTimer = 0;
  this.combos = [];
  // Elite-class battle-scoped effects (reset every battle)
  this.firstCritUsed = false;
  this.spellBoostUsed = false;
  for (const h of heroes) { h.ailments = {}; h.buffs = {}; }
  for (const e of enemies) { e.ailments = {}; e.buffs = {}; }
  this.applyElitePassives(heroes);
  this.buildTurnOrder();
};

Combat.applyElitePassives = function(heroes) {
  let partyHpBuff = 0;
  for (const h of heroes) {
    if (h.partyHpBuff) partyHpBuff = Math.max(partyHpBuff, h.partyHpBuff);
  }
  if (partyHpBuff > 0) {
    for (const h of heroes) {
      const bonus = Math.floor(h.maxHp * partyHpBuff / 100);
      h.maxHp += bonus;
      h.hp += bonus;
    }
  }
};

Combat.buildTurnOrder = function() {
  this.turnOrder = [];
  for (const h of this.heroes) {
    if (h.hp > 0) this.turnOrder.push({ type: 'hero', ref: h, agi: h.agi + Math.random() * 5 });
  }
  for (const e of this.enemies) {
    if (e.hp > 0) this.turnOrder.push({ type: 'enemy', ref: e, agi: e.agi + Math.random() * 5 });
  }
  this.turnOrder.sort((a, b) => b.agi - a.agi);
  this.currentTurn = 0;
  this.isPlayerTurn = this.turnOrder[0] && this.turnOrder[0].type === 'hero';
};

Combat.getCurrentActor = function() {
  return this.turnOrder[this.currentTurn] || null;
};

Combat.nextTurn = function() {
  this.currentTurn++;
  if (this.currentTurn >= this.turnOrder.length) {
    this.processAilments();
    this.buildTurnOrder();
    this.checkBattleEnd();
    return;
  }
  let tries = 0;
  while (tries++ < this.turnOrder.length) {
    const actor = this.turnOrder[this.currentTurn];
    if (!actor || (actor.ref && actor.ref.hp > 0)) break;
    this.currentTurn++;
    if (this.currentTurn >= this.turnOrder.length) {
      this.processAilments();
      this.buildTurnOrder();
      this.checkBattleEnd();
      return;
    }
  }
  this.isPlayerTurn = this.turnOrder[this.currentTurn].type === 'hero';
};

Combat.processAilments = function() {
  const ayurRegen = (typeof Progression !== 'undefined') ? Progression.perkValue('ayurveda') : 0;
  for (const h of this.heroes) {
    this.tickAilments(h);
    this.tickBuffs(h);
    if (ayurRegen > 0 && h.hp > 0 && h.hp < h.maxHp) {
      h.hp = Math.min(h.maxHp, h.hp + ayurRegen);
    }
    if (h.regenHpPct && h.hp > 0) {
      const regen = Math.max(1, Math.floor(h.maxHp * h.regenHpPct / 100));
      h.hp = Math.min(h.maxHp, h.hp + regen);
    }
    if (h.mpRegen && h.hp > 0) {
      h.mp = Math.min(h.maxMp, h.mp + h.mpRegen);
    }
  }
  for (const e of this.enemies) {
    this.tickAilments(e);
    this.tickBuffs(e);
  }
};

Combat.tickAilments = function(entity) {
  if (!entity.ailments) return;
  for (const key of Object.keys(entity.ailments)) {
    const a = entity.ailments[key];
    if (!a) continue;
    const def = this.AILMENT_EFFECTS[key];
    if (a.dmgPerTurn) {
      entity.hp -= a.dmgPerTurn;
      if (entity.hp < 0) entity.hp = 0;
    }
    a.turnsLeft--;
    if (a.turnsLeft <= 0) delete entity.ailments[key];
  }
};

Combat.applyBuff = function(entity, buffId, value, duration) {
  if (!entity.buffs) entity.buffs = {};
  if (buffId === 'shield') value = Math.floor(value * (1 + this.perkShieldPct() / 100));
  entity.buffs[buffId] = { value: value, turnsLeft: duration || 1 };
};

// Tapas Siddhi: +% shield potency (lives here to avoid a combat->scene dependency).
Combat.perkShieldPct = function() {
  return (typeof Progression !== 'undefined') ? Progression.perkValue('tapas') : 0;
};

Combat.tickBuffs = function(entity) {
  if (!entity.buffs) return;
  for (const key of Object.keys(entity.buffs)) {
    entity.buffs[key].turnsLeft--;
    if (entity.buffs[key].turnsLeft <= 0) delete entity.buffs[key];
  }
};

Combat.applyAilment = function(target, ailmentId, duration) {
  const def = this.AILMENT_EFFECTS[ailmentId];
  if (!def) return;
  if (!target.ailments) target.ailments = {};
  const dur = duration || def.duration;
  target.ailments[ailmentId] = {
    turnsLeft: dur,
    dmgPerTurn: def.dmgPerTurn || 0
  };
};

function _getEffectiveAtk(attacker, skill) {
  let atk = (attacker.str || 1) + (attacker.equipAtk || 0);
  if (attacker.weaponEquipped && attacker.weaponEquipped.atk) {
    atk += attacker.weaponEquipped.atk;
  }
  if (attacker.buffs && attacker.buffs.atkBuff) {
    atk = Math.floor(atk * attacker.buffs.atkBuff.value);
  }
  return atk;
}

function _getEffectiveMag(attacker, skill) {
  let mag = (attacker.mag || 1) + (attacker.equipAccMag || 0) + (attacker.equipArmorMag || 0);
  if (attacker.weaponEquipped && attacker.weaponEquipped.mag) {
    mag += attacker.weaponEquipped.mag;
  }
  if (attacker.armorEquipped && attacker.armorEquipped.mag) {
    mag += attacker.armorEquipped.mag;
  }
  if (attacker.accessoryEquipped && attacker.accessoryEquipped.mag) {
    mag += attacker.accessoryEquipped.mag;
  }
  if (attacker.magicMilestone) {
    mag = Math.floor(mag * 1.15);   // Light Wizard milestone: enduring wisdom
  }
  if (attacker.buffs && attacker.buffs.atkBuff) {
    mag = Math.floor(mag * attacker.buffs.atkBuff.value);
  }
  if (attacker.elementalDmgPct && skill) {
    mag = Math.floor(mag * (1 + attacker.elementalDmgPct / 100));
  }
  return mag;
}

function _getEffectiveDef(defender) {
  let def = (defender.def || 0) + (defender.equipDef || 0) + (defender.equipAccDef || 0);
  if (defender.armorEquipped && defender.armorEquipped.def) {
    def += defender.armorEquipped.def;
  }
  if (defender.accessoryEquipped && defender.accessoryEquipped.def) {
    def += defender.accessoryEquipped.def;
  }
  if (defender.buffs && defender.buffs.defBuff) {
    def = Math.floor(def * defender.buffs.defBuff.value);
  }
  return def;
}

function _applyShield(defender, dmg) {
  if (!defender.buffs || !defender.buffs.shield || dmg <= 0) return dmg;
  const shieldAmt = defender.buffs.shield.value;
  if (dmg <= shieldAmt) {
    defender.buffs.shield.value -= dmg;
    return 0;
  } else {
    delete defender.buffs.shield;
    return dmg - shieldAmt;
  }
}

Combat.calcDamage = function(attacker, defender, skill, isCrit) {
  const atk = _getEffectiveAtk(attacker, skill);
  const def = _getEffectiveDef(defender);
  const base = Math.max(1, atk * (skill ? skill.dmg || 1 : 1) - def * 0.5);
  const variance = 0.85 + Math.random() * 0.3;
  let dmg = Math.floor(base * variance);
  if (this.comboCount >= 2) {
    const mult = 1.0 + Math.min(10, this.comboCount - 1) * 0.1;
    dmg = Math.floor(dmg * mult);
  }
  if (isCrit) dmg = Math.floor(dmg * this.CRIT_MULTIPLIER);
  if (isCrit && attacker.firstCrit2x && !this.firstCritUsed) {
    dmg *= 2;                      // Assassin: the first crit of a battle lands twice as hard
    this.firstCritUsed = true;
  }
  dmg = _applyShield(defender, dmg);
  return Math.max(1, dmg);
};

Combat.calcMagicDamage = function(attacker, defender, skill) {
  const atk = _getEffectiveMag(attacker, skill);
  const def = _getEffectiveDef(defender);
  const base = Math.max(1, atk * (skill ? skill.dmg || 1 : 1) - def * 0.3);
  const variance = 0.85 + Math.random() * 0.3;
  let dmg = Math.floor(base * variance);
  if (attacker.spellDmgPct && !this.spellBoostUsed) {
    dmg = Math.floor(dmg * (1 + attacker.spellDmgPct / 100));   // Dark Wizard: opening spell amplified
    this.spellBoostUsed = true;
  }
  if (this.comboCount >= 2) {
    const mult = 1.0 + Math.min(10, this.comboCount - 1) * 0.1;
    dmg = Math.floor(dmg * mult);
  }
  dmg = _applyShield(defender, dmg);
  return Math.max(1, dmg);
};

Combat.performAttack = function(attacker, defender, skill) {
  const critChance = ((attacker.baseCrit || 10) + (attacker.equipCrit || 0) + (typeof Progression !== 'undefined' ? Progression.perkValue('drishti') : 0)) / 100;
  const isCrit = Math.random() < critChance;
  let dmg = 0;
  if (skill && skill.mag) {
    dmg = this.calcMagicDamage(attacker, defender, skill);
  } else {
    dmg = this.calcDamage(attacker, defender, skill, isCrit);
  }
  defender.hp -= dmg;
  if (defender.hp < 0) defender.hp = 0;

  if (skill && skill.ailment && defender.hp > 0) {
    const durationBonus = attacker.ailmentDurationBonus || 0;
    this.applyAilment(defender, skill.ailment, 2 + durationBonus);
  }

  if (skill && skill.heal && attacker.type === 'hero') {
    for (const h of this.heroes) {
      if (h.hp > 0) {
        const healAmt = Math.floor(h.maxHp * skill.heal);
        h.hp = Math.min(h.maxHp, h.hp + healAmt);
        if (attacker.healDualCast) {
          Combat.applyBuff(h, 'shield', Math.floor(healAmt * 0.2), 2);   // Paladin: dual cast leaves a ward
        }
      }
    }
    Audio.heal();
  } else if (isCrit) {
    Audio.crit();
  } else if (skill) {
    Audio.skill();
  } else {
    Audio.hit();
  }

  this.checkCombo(attacker);
  this.checkBattleEnd();
  return { dmg, isCrit };
};

Combat.checkCombo = function(actor) {
  const now = Date.now();
  if (this.comboTimer > 0 && now - this.comboTimer < 1000) {
    this.comboCount++;
  } else {
    this.comboCount = 1;
  }
  this.comboTimer = now;
  if (this.comboCount >= 3 && this.comboCount % 2 === 1) {
    R.triggerComboFlash(this.comboCount);
  }
  if (this.comboCount >= 3) {
    Audio.combo();
  }
};

Combat.checkBattleEnd = function() {
  const allEnemiesDead = this.enemies.every(e => e.hp <= 0);
  const allHeroesDead = this.heroes.every(h => h.hp <= 0);
  if (allEnemiesDead || allHeroesDead) {
    this.battleOver = true;
  }
};

Combat.getAliveEnemies = function() {
  return this.enemies.filter(e => e.hp > 0);
};

Combat.getAliveHeroes = function() {
  return this.heroes.filter(h => h.hp > 0);
};

Combat.getRandomEnemy = function() {
  const alive = this.getAliveEnemies();
  return alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
};

Combat.getRandomHero = function() {
  const alive = this.getAliveHeroes();
  return alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
};

Combat.enemyAI = function(enemy) {
  if (enemy.ailments) {
    if (enemy.ailments.vajra) {
      delete enemy.ailments.vajra;
      return { skipped: 'stunned' };
    }
    if (enemy.ailments.confuse) {
      delete enemy.ailments.confuse;
      return { skipped: 'confused' };
    }
  }
  
  const target = this.getRandomHero();
  if (!target) return { skipped: 'no_target' };
  
  if (enemy.abilities && enemy.abilities.length > 0 && Math.random() < 0.4) {
    const abilityId = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
    const ability = ENEMY_ABILITIES[abilityId];
    if (ability) {
      const result = this.performEnemyAbility(enemy, target, ability);
      return result;
    }
  }
  
  return this.performAttack(enemy, target, null);
};

Combat.performEnemyAbility = function(enemy, target, ability) {
  let dmg = 0;
  const hasDamage = ability.dmg && ability.dmg > 0;
  if (hasDamage) {
    const atk = _getEffectiveAtk(enemy, null) * ability.dmg;
    const def = _getEffectiveDef(target);
    const base = Math.max(1, atk - def * 0.5);
    const variance = 0.85 + Math.random() * 0.3;
    dmg = Math.floor(base * variance);
    dmg = _applyShield(target, dmg);
    dmg = Math.max(1, dmg);
    target.hp -= dmg;
    if (target.hp < 0) target.hp = 0;
  }
  
  if (ability.ailment && target.hp > 0) {
    this.applyAilment(target, ability.ailment, 2);
  }
  
  if (ability.heal) {
    const healAmt = Math.floor(enemy.maxHp * ability.heal);
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmt);
  }
  
  if (ability.buff) {
    this.applyBuff(enemy, ability.buff, ability.value, 3);
  }
  
  Audio.hit();
  this.checkCombo(enemy);
  this.checkBattleEnd();
  return { dmg: dmg, ability: ability.name, isCrit: false };
};

Combat.getLoot = function() {
  const totalXP = this.enemies.reduce((sum, e) => sum + (e.xp || 0), 0);
  const totalGold = this.enemies.reduce((sum, e) => sum + (e.gold || 0), 0);
  return { xp: totalXP, gold: totalGold };
};

Combat.awardBeastXP = function() {
  const activeId = G.state.activeBeast;
  if (!activeId) return;
  const beast = (G.state.spiritBeasts || []).find(b => b.id === activeId);
  if (!beast) return;
  const xpGain = Math.floor(10 + Math.random() * 20);
  beast.xp = (beast.xp || 0) + xpGain;
  let needed = beast.level * 30;
  let leveled = false;
  while (beast.xp >= needed && beast.level < 30) {
    beast.xp -= needed;
    beast.level++;
    leveled = true;
    needed = beast.level * 30;
    beast.maxHp += 2;
    beast.str += 1;
    beast.agi += 1;
    beast.def += 1;
    beast.mag += 1;
  }
  if (beast.level >= 30) beast.xp = Math.min(beast.xp, needed - 1);
  if (leveled) Notify.show(beast.name + ' reached Lv.' + beast.level + '!', 2, R.colors.green);
};
