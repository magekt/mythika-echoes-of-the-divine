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
  this.isPlayerTurn = this.turnOrder[this.currentTurn].type === 'hero';
};

Combat.processAilments = function() {
  for (const h of this.heroes) {
    this.tickAilments(h);
    this.tickBuffs(h);
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
  entity.buffs[buffId] = { value: value, turnsLeft: duration || 1 };
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
  if (attacker.buffs && attacker.buffs.atkBuff) {
    atk = Math.floor(atk * attacker.buffs.atkBuff.value);
  }
  return atk;
}

function _getEffectiveMag(attacker, skill) {
  let mag = (attacker.mag || 1) + (attacker.equipAccMag || 0) + (attacker.equipArmorMag || 0);
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
  if (isCrit) dmg = Math.floor(dmg * this.CRIT_MULTIPLIER);
  dmg = _applyShield(defender, dmg);
  return Math.max(1, dmg);
};

Combat.calcMagicDamage = function(attacker, defender, skill) {
  const atk = _getEffectiveMag(attacker, skill);
  const def = _getEffectiveDef(defender);
  const base = Math.max(1, atk * (skill ? skill.dmg || 1 : 1) - def * 0.3);
  const variance = 0.85 + Math.random() * 0.3;
  let dmg = Math.floor(base * variance);
  dmg = _applyShield(defender, dmg);
  return Math.max(1, dmg);
};

Combat.performAttack = function(attacker, defender, skill) {
  const critChance = ((attacker.baseCrit || 10) + (attacker.equipCrit || 0)) / 100;
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
      }
    }
  }

  if (isCrit) Audio.attack();
  else Audio.hit();

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
  if (this.comboCount >= 3) {
    Audio.combo();
    this.comboCount = 0;
    this.comboTimer = 0;
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
    if (enemy.ailments.vajra || enemy.ailments.confuse) {
      delete enemy.ailments.vajra;
      delete enemy.ailments.confuse;
      return null;
    }
  }
  const target = this.getRandomHero();
  if (!target) return null;
  return this.performAttack(enemy, target, null);
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
  const needed = beast.level * 30;
  while (beast.xp >= needed && beast.level < 30) {
    beast.xp -= needed;
    beast.level++;
    beast.maxHp += 2;
    beast.str += 1;
    beast.agi += 1;
    beast.def += 1;
    beast.mag += 1;
  }
};
