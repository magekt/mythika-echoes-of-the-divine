const Combat = {
  turnOrder: [],
  currentTurn: 0,
  isPlayerTurn: true,
  battleOver: false,
  comboCount: 0,
  comboTimer: 0,
  combos: [],
  enemyIntent: null,
  intentVersion: 0
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
// Vajra Siddhi adds thunder to every crit.
Combat.critMultiplier = function() {
  return this.CRIT_MULTIPLIER + (typeof Progression !== 'undefined' ? Progression.perkValue('vajra') / 100 : 0);
};

Combat.startBattle = function(heroes, enemies) {
  this.heroes = heroes;
  this.enemies = enemies;
  this.turnOrder = [];
  this.currentTurn = 0;
  this.battleOver = false;
  this.comboCount = 0;
  this.comboTimer = 0;
  this.combos = [];
  this.enemyIntent = null;
  this.intentVersion++;
  // Elite-class battle-scoped effects (reset every battle)
  this.firstCritUsed = false;
  this.spellBoostUsed = false;
  // Phase 24 combat bonds: applied bonuses for scene display (reset every battle)
  this.bondBonuses = [];
  // Phase 25 signature combos: partner-turn consumption flags + result ledger.
  this.consumedTurns = {};
  this.comboResults = [];
  for (const h of heroes) { h.ailments = {}; h.buffs = {}; }
  for (const e of enemies) { e.ailments = {}; e.buffs = {}; }
  this.applyElitePassives(heroes);
  this.applyBondPassives(heroes);
  this.buildTurnOrder();
};

// Phase 24: tier passives (+1/+2/+4 role stat) + adjacent Sworn+ synergy tags.
// Operates on battle clones only — never writes G.state. Missing BondSystem
// means zero bonuses (formulas below degrade via || 0 guards).
Combat.applyBondPassives = function(heroes) {
  this.bondBonuses = [];
  try {
    if (typeof BondSystem === 'undefined' || !BondSystem || typeof BondSystem.combatBonusFor !== 'function') return;
    if (!Array.isArray(heroes) || heroes.length === 0) return;
    const orderedIds = heroes.map(h => h && h.id);
    let playerId = heroes[0] && heroes[0].id;
    try {
      if (typeof G !== 'undefined' && G && G.state && G.state.player && G.state.player.id) playerId = G.state.player.id;
    } catch (e) {}
    for (const h of heroes) {
      if (!h || !h.id) continue;
      const b = BondSystem.combatBonusFor(h.id, orderedIds, playerId);
      if (!b || !b.eligible || !(b.passive > 0)) continue;
      h[b.roleStat] = (h[b.roleStat] || 0) + b.passive;
      const entry = { heroId: h.id, name: h.name || h.id, passive: b.passive, roleStat: b.roleStat, synergy: b.synergy ? b.synergy.tag : null, lingering: !!b.lingering };
      if (b.synergy) {
        if (b.synergy.tag === 'crit' && b.synergy.critBonus) h.bondCritBonus = b.synergy.critBonus;
        else if (b.synergy.tag === 'burst' && b.synergy.dmgPct) h.bondDmgPct = b.synergy.dmgPct;
        else if (b.synergy.tag === 'ward' && b.synergy.healPct) h.bondHealPct = b.synergy.healPct;
        else if (b.synergy.tag === 'swiftness' && b.synergy.agiBonus) h.agi = (h.agi || 0) + b.synergy.agiBonus;
        else if (b.synergy.tag === 'intercept' && b.synergy.interceptPct) h.bondInterceptPct = b.synergy.interceptPct;
      }
      this.bondBonuses.push(entry);
    }
  } catch (e) {
    this.bondBonuses = this.bondBonuses || [];
  }
};

// Phase 24: Bhima intercept — damage TO a hero is reduced while a bonded
// Sworn+ bhima (bondInterceptPct set at battle start) stands alive adjacent
// to the player. Enemy-vs-enemy damage never intercepts.
Combat._bondInterceptPctFor = function(defender) {
  try {
    if (!defender || !Array.isArray(this.heroes) || this.heroes.indexOf(defender) < 0) return 0;
    let playerId = null;
    try {
      if (typeof G !== 'undefined' && G && G.state && G.state.player && G.state.player.id) playerId = G.state.player.id;
    } catch (e) {}
    const orderedIds = this.heroes.map(h => h && h.id);
    if (!playerId) playerId = orderedIds[0];
    for (const h of this.heroes) {
      if (!h || h.hp <= 0 || !(h.bondInterceptPct > 0)) continue;
      if (h === defender) continue;
      let adjacent = false;
      try {
        if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.adjacentToPlayer === 'function') {
          adjacent = BondSystem.adjacentToPlayer(h.id, orderedIds, playerId);
        } else {
          adjacent = Math.abs(orderedIds.indexOf(h.id) - orderedIds.indexOf(playerId)) === 1;
        }
      } catch (e) { adjacent = false; }
      if (adjacent) return h.bondInterceptPct;
    }
    return 0;
  } catch (e) {
    return 0;
  }
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

// Phase 25: fallback combo table used only when BondSystem is absent.
// Mirrors BondSystem.COMBOS kinds so offline/degraded combat still resolves.
Combat.SIGNATURE_FALLBACK = {
  arjuna: { heroId: 'arjuna', name: 'Gandiva Twin Strike', kind: 'strike', base: 1.8, statScale: 0.04, hits: 2 },
  bhima: { heroId: 'bhima', name: 'Mountain-Guard Slam', kind: 'slam', base: 1.6, statScale: 0.04, shield: 15 },
  karna: { heroId: 'karna', name: 'Sunburst Volley', kind: 'volley', base: 1.2, statScale: 0.03 },
  draupadi: { heroId: 'draupadi', name: 'Panchali Warding Aegis', kind: 'aegis', base: 0.25, statScale: 0.008, shield: 12 },
  hanuman: { heroId: 'hanuman', name: 'Mountain-Leap Sunder', kind: 'leap', base: 2.2, statScale: 0.05, splash: 0.5 }
};

Combat.SIGNATURE_ROLE_STAT = { arjuna: 'str', bhima: 'def', karna: 'str', draupadi: 'mag', hanuman: 'agi' };

// Phase 25: signature duo skill. Operates on battle clones only — never writes
// G.state except the exactly-once combo_* unlock flag (best-effort, guarded).
// Consumes the partner's upcoming turn via consumedTurns (skipped once by
// nextTurn); the hero's own turn is consumed by the caller advancing.
// Returns { ok, kind, name, total, lines } (lines: 1-2 log-band strings).
Combat.performSignatureCombo = function(hero, partner, opts) {
  const fail = function(reason) { return { ok: false, reason: reason }; };
  try {
    if (!hero || !hero.id || !(hero.hp > 0)) return fail('hero_unable');
    if (!partner || !partner.id || !(partner.hp > 0)) return fail('partner_unable');
    if (partner.id === hero.id) return fail('no_partner');
    if (!Array.isArray(this.heroes) ||
        this.heroes.indexOf(hero) < 0 || this.heroes.indexOf(partner) < 0) return fail('not_in_battle');
    let def = null;
    try {
      if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.comboFor === 'function') {
        def = BondSystem.comboFor(hero.id);
      }
    } catch (e) { def = null; }
    if (!def && Object.prototype.hasOwnProperty.call(this.SIGNATURE_FALLBACK, hero.id)) {
      const f = this.SIGNATURE_FALLBACK[hero.id];
      def = {};
      for (const k of Object.keys(f)) def[k] = f[k];
    }
    if (!def) return fail('unknown');
    let roleStat = this.SIGNATURE_ROLE_STAT[hero.id] || 'str';
    try {
      if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.roleStatFor === 'function') {
        roleStat = BondSystem.roleStatFor(hero.id) || roleStat;
      }
    } catch (e) {}
    const roleVal = Number(hero[roleStat]);
    const hasWeapon = !!(hero.weaponEquipped);
    let mult = def.base, bonus = 0;
    try {
      if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.comboPotencyFor === 'function') {
        const p = BondSystem.comboPotencyFor(hero.id, roleVal, hero.weaponLvl, hasWeapon);
        if (p && Number.isFinite(Number(p.mult))) mult = Number(p.mult);
        if (p && Number.isFinite(Number(p.bonus))) bonus = Number(p.bonus);
      } else {
        mult = Number(def.base) + Number(def.statScale || 0) * (Number.isFinite(roleVal) ? Math.max(0, roleVal) : 0);
        bonus = hasWeapon ? 0.15 * Math.max(1, Math.floor(Number(hero.weaponLvl) || 1)) : 0;
      }
    } catch (e) {}
    const eff = mult * (1 + bonus);
    const o = (opts && typeof opts === 'object' && !Array.isArray(opts)) ? opts : {};
    let target = (o.target && o.target.hp > 0) ? o.target : null;
    if (!target) target = this.getRandomEnemy();
    const kind = def.kind;
    let total = 0;
    const heroName = hero.name || hero.id;
    const partnerName = partner.name || partner.id;
    if (kind === 'strike') {
      if (!target) return fail('no_target');
      const hits = Math.max(1, Math.floor(Number(def.hits) || 1));
      for (let i = 0; i < hits && target.hp > 0; i++) {
        const r = this.performAttack(hero, target, { dmg: eff });
        total += r.dmg;
      }
    } else if (kind === 'leap') {
      if (!target) return fail('no_target');
      const r = this.performAttack(hero, target, { dmg: eff });
      total += r.dmg;
      const splashMult = eff * (Number(def.splash) || 0.5);
      for (const e of this.enemies) {
        if (e === target || e.hp <= 0) continue;
        const rs = this.performAttack(hero, e, { dmg: splashMult });
        total += rs.dmg;
      }
    } else if (kind === 'volley') {
      const foes = this.getAliveEnemies();
      if (foes.length === 0) return fail('no_target');
      for (const e of foes) {
        const r = this.performAttack(hero, e, { dmg: eff });
        total += r.dmg;
      }
    } else if (kind === 'slam') {
      if (!target) return fail('no_target');
      const r = this.performAttack(hero, target, { dmg: eff });
      total += r.dmg;
      const shieldAmt = Math.max(1, Math.floor(Number(def.shield) || 10));
      for (const h of this.heroes) {
        if (h.hp > 0) this.applyBuff(h, 'shield', shieldAmt, 2);
      }
    } else if (kind === 'aegis') {
      const healFrac = Math.max(0, mult);
      for (const h of this.heroes) {
        if (h.hp <= 0) continue;
        const healAmt = Math.floor(h.maxHp * healFrac * (1 + bonus));
        h.hp = Math.min(h.maxHp, h.hp + healAmt);
        total += healAmt;
      }
      const shieldAmt = Math.max(1, Math.floor(Number(def.shield) || 10));
      for (const h of this.heroes) {
        if (h.hp > 0) this.applyBuff(h, 'shield', shieldAmt, 2);
      }
    } else {
      return fail('unknown');
    }
    this.consumedTurns = this.consumedTurns || {};
    this.consumedTurns[partner.id] = true;
    this.comboResults = this.comboResults || [];
    this.comboResults.push({ heroId: hero.id, partnerId: partner.id, kind: kind, total: total });
    try {
      if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.markComboSeen === 'function') {
        BondSystem.markComboSeen(hero.id);
      }
    } catch (e) {}
    this.checkBattleEnd();
    const lines = (kind === 'aegis')
      ? [heroName + ' + ' + partnerName + ': ' + def.name + ' - party warded (+' + total + ' HP)!']
      : [heroName + ' + ' + partnerName + ': ' + def.name + ' - ' + total + ' damage!'];
    return { ok: true, kind: kind, name: def.name, total: total, lines: lines };
  } catch (e) {
    return fail('error');
  }
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
  while (tries++ < this.turnOrder.length + 1) {
    const actor = this.turnOrder[this.currentTurn];
    // Phase 25: a duo skill consumes the partner's upcoming turn exactly once.
    if (actor && actor.ref && actor.ref.id && this.consumedTurns && this.consumedTurns[actor.ref.id]) {
      delete this.consumedTurns[actor.ref.id];
      this.currentTurn++;
      if (this.currentTurn >= this.turnOrder.length) {
        this.processAilments();
        this.buildTurnOrder();
        this.checkBattleEnd();
        return;
      }
      continue;
    }
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
  const ayurRegen = (typeof Progression !== 'undefined') ? Progression.perkValue('ayurveda') + Progression.perkValue('amrita') : 0;
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
  let atk = attacker.str || 1;
  if (attacker.weaponEquipped && attacker.weaponEquipped.atk) {
    atk += attacker.weaponEquipped.atk;
  }
  // Forge weapon levels now matter in combat (15% per level).
  const wLvl = attacker.weaponLvl || 1;
  atk = Math.floor(atk * (1 + wLvl * 0.15));
  // Aura light pass: partyAtk, vayuDmg, furyAtk (conditional), allElemDmg
  const partyAtk = (typeof AURAS !== 'undefined' && AURAS.getTotal) ? AURAS.getTotal('partyAtk') : 0;
  if (partyAtk) atk = Math.floor(atk * (1 + partyAtk / 100));
  const vayu = (typeof AURAS !== 'undefined' && AURAS.getTotal) ? AURAS.getTotal('vayuDmg') : 0;
  if (vayu) atk = Math.floor(atk * (1 + vayu / 100));
  const allElem = (typeof AURAS !== 'undefined' && AURAS.getTotal) ? AURAS.getTotal('allElemDmg') : 0;
  if (allElem) atk = Math.floor(atk * (1 + allElem / 100));
  const fury = (typeof AURAS !== 'undefined' && AURAS.getTotal) ? AURAS.getTotal('furyAtk') : 0;
  if (fury && attacker.hp && attacker.maxHp && attacker.hp < attacker.maxHp * 0.3) {
    atk = Math.floor(atk * (1 + fury / 100));
  }
  if (attacker.buffs && attacker.buffs.atkBuff) {
    atk = Math.floor(atk * attacker.buffs.atkBuff.value);
  }
  return atk;
}

function _getEffectiveMag(attacker, skill) {
  let mag = attacker.mag || 1;
  if (attacker.weaponEquipped && attacker.weaponEquipped.mag) {
    mag += attacker.weaponEquipped.mag;
  }
  if (attacker.armorEquipped && attacker.armorEquipped.mag) {
    mag += attacker.armorEquipped.mag;
  }
  if (attacker.accessoryEquipped && attacker.accessoryEquipped.mag) {
    mag += attacker.accessoryEquipped.mag;
  }
  // Forge accessory levels empower magic.
  const accLvl = attacker.accessoryLvl || 1;
  mag = Math.floor(mag * (1 + accLvl * 0.15));
  const agni = (typeof AURAS !== 'undefined' && AURAS.getTotal) ? AURAS.getTotal('agniDmg') : 0;
  if (agni) mag = Math.floor(mag * (1 + agni / 100));
  const allElem = (typeof AURAS !== 'undefined' && AURAS.getTotal) ? AURAS.getTotal('allElemDmg') : 0;
  if (allElem) mag = Math.floor(mag * (1 + allElem / 100));
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
  let def = defender.def || 0;
  if (defender.armorEquipped && defender.armorEquipped.def) {
    def += defender.armorEquipped.def;
  }
  if (defender.accessoryEquipped && defender.accessoryEquipped.def) {
    def += defender.accessoryEquipped.def;
  }
  // Forge armor levels add durability.
  const aLvl = defender.armorLvl || 1;
  def = Math.floor(def * (1 + aLvl * 0.15));
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
  if (isCrit) dmg = Math.floor(dmg * this.critMultiplier());
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

Combat.performAttack = function(attacker, defender, skill, damageMultiplier) {
  const weaponCrit = attacker.weaponEquipped && attacker.weaponEquipped.crit || 0;
  const armorCrit = attacker.armorEquipped && attacker.armorEquipped.crit || 0;
  const accessoryCrit = attacker.accessoryEquipped && attacker.accessoryEquipped.crit || 0;
  // Phase 24: bonded archer synergy grants +crit alongside the player.
  const bondCrit = (attacker.bondCritBonus || 0);
  const critChance = ((attacker.baseCrit || 10) + weaponCrit + armorCrit + accessoryCrit + bondCrit + (typeof Progression !== 'undefined' ? Progression.perkValue('drishti') : 0)) / 100;
  const isCrit = Math.random() < critChance;
  let dmg = 0;
  if (skill && skill.mag) {
    dmg = this.calcMagicDamage(attacker, defender, skill);
  } else {
    dmg = this.calcDamage(attacker, defender, skill, isCrit);
  }
  if (skill && !skill.heal && typeof Progression !== 'undefined') {
    dmg = Math.floor(dmg * (1 + Progression.perkValue('gyana') / 100));
  }
  // Phase 24: bonded burst synergy amplifies the hero's own strikes.
  if (attacker.bondDmgPct) dmg = Math.floor(dmg * (1 + attacker.bondDmgPct / 100));
  if (damageMultiplier !== undefined) dmg = Math.floor(dmg * damageMultiplier);
  // Phase 24: bonded intercept reduces damage landing on heroes.
  const interceptPct = this._bondInterceptPctFor(defender);
  if (interceptPct > 0) dmg = Math.floor(dmg * (1 - interceptPct / 100));
  defender.hp -= dmg;
  if (defender.hp < 0) defender.hp = 0;

  if (skill && skill.ailment && defender.hp > 0) {
    const durationBonus = attacker.ailmentDurationBonus || 0;
    this.applyAilment(defender, skill.ailment, 2 + durationBonus);
  }

  if (skill && skill.heal && attacker.type === 'hero') {
    for (const h of this.heroes) {
      if (h.hp > 0) {
        let healAmt = Math.floor(h.maxHp * skill.heal);
        // Phase 24: bonded ward synergy deepens the hero's own blessings.
        if (attacker.bondHealPct) healAmt = Math.floor(healAmt * (1 + attacker.bondHealPct / 100));
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

Combat.getTimingGrade = function(elapsed, duration) {
  const ratio = Math.max(0, Math.min(1, elapsed / Math.max(0.1, duration)));
  if (ratio <= 0.28) return 'perfect';
  if (ratio <= 0.62) return 'good';
  return 'late';
};

Combat.prepareEnemyIntent = function(enemy) {
  const target = this.getRandomHero();
  if (!target) return { enemy: enemy, target: null, skipped: 'no_target', version: this.intentVersion };
  if (enemy.ailments) {
    if (enemy.ailments.vajra) {
      delete enemy.ailments.vajra;
      return { enemy: enemy, target: target, skipped: 'stunned', version: this.intentVersion };
    }
    if (enemy.ailments.confuse) {
      delete enemy.ailments.confuse;
      return { enemy: enemy, target: target, skipped: 'confused', version: this.intentVersion };
    }
  }

  let ability = null;
  let step = null;
  const patterns = Array.isArray(enemy.patterns) && enemy.patterns.length ? enemy.patterns : null;
  if (patterns) {
    const index = Number.isFinite(enemy.patternIndex) ? enemy.patternIndex : 0;
    step = patterns[index % patterns.length];
    enemy.patternIndex = (index + 1) % patterns.length;
    if (step !== 'attack') ability = ENEMY_ABILITIES[step] || null;
    if (!ability && step !== 'attack') step = 'attack';
  } else if (enemy.abilities && enemy.abilities.length > 0 && Math.random() < 0.4) {
    const abilityId = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
    ability = ENEMY_ABILITIES[abilityId] || null;
    step = ability ? abilityId : 'attack';
  } else {
    step = 'attack';
  }

  const attackType = ability ? (ability.intent || 'melee') : (enemy.attackType || 'melee');
  const intent = {
    enemy: enemy,
    target: target,
    ability: ability,
    step: step,
    name: ability ? ability.name : 'Melee strike',
    attackType: attackType,
    interruptible: !!ability,
    version: this.intentVersion
  };
  this.enemyIntent = intent;
  return intent;
};

Combat.resolveEnemyIntent = function(intent, damageMultiplier) {
  if (!intent || intent.skipped || !intent.target || intent.target.hp <= 0) {
    return { skipped: intent && intent.skipped ? intent.skipped : 'no_target', dmg: 0 };
  }
  const mult = damageMultiplier === undefined ? 1 : Math.max(0, damageMultiplier);
  if (intent.ability) return this.performEnemyAbility(intent.enemy, intent.target, intent.ability, mult);
  return this.performAttack(intent.enemy, intent.target, null, mult);
};

Combat.resolveReaction = function(intent, action, grade) {
  if (!intent || intent.skipped) return { outcome: 'failure', skipped: intent && intent.skipped };
  const enemy = intent.enemy;
  const target = intent.target;
  const perfect = grade === 'perfect';
  const good = grade === 'good';
  let mitigation = 1;
  let outcome = 'failure';
  let counter = null;

  if (action === 'parry' && intent.attackType === 'melee') {
    if (perfect || good) {
      outcome = 'parry';
      mitigation = 0;
      if (perfect && target.hp > 0 && enemy.hp > 0) counter = this.performAttack(target, enemy, null);
    } else if (grade === 'late') {
      mitigation = 0.55;
      outcome = 'mitigation';
    }
  } else if (action === 'meleeDodge' && intent.attackType === 'melee') {
    if (perfect || (good && Math.random() < 0.85) || (grade === 'late' && Math.random() < 0.45)) {
      outcome = 'evade';
      mitigation = 0;
    }
  } else if (action === 'projectileDodge' && intent.attackType === 'ranged') {
    if (perfect || good || (grade === 'late' && Math.random() < 0.55)) {
      outcome = 'evade';
      mitigation = 0;
    }
  } else if (action === 'cover' && intent.attackType === 'ranged') {
    mitigation = perfect ? 0.2 : good ? 0.35 : grade === 'late' ? 0.6 : 1;
    outcome = mitigation < 1 ? 'mitigation' : 'failure';
  } else if (action === 'guard') {
    mitigation = perfect ? 0.25 : good ? 0.4 : grade === 'late' ? 0.6 : 1;
    outcome = mitigation < 1 ? 'mitigation' : 'failure';
  } else if (action === 'interrupt' && intent.interruptible) {
    if (perfect || good) {
      outcome = 'interrupt';
      mitigation = 0;
      if (target.hp > 0 && enemy.hp > 0) counter = this.performAttack(target, enemy, null);
    } else if (grade === 'late') {
      mitigation = 0.65;
      outcome = 'mitigation';
    }
  }

  if (outcome === 'evade' || outcome === 'parry' || outcome === 'interrupt') {
    this.checkBattleEnd();
    return { outcome: outcome, dmg: 0, counter: counter, target: target, enemy: enemy };
  }
  const result = this.resolveEnemyIntent(intent, mitigation);
  result.outcome = outcome;
  result.target = target;
  result.enemy = enemy;
  return result;
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

Combat.performEnemyAbility = function(enemy, target, ability, damageMultiplier) {
  let dmg = 0;
  const hasDamage = ability.dmg && ability.dmg > 0;
  if (hasDamage) {
    const atk = _getEffectiveAtk(enemy, null) * ability.dmg;
    const def = _getEffectiveDef(target);
    const base = Math.max(1, atk - def * 0.5);
    const variance = 0.85 + Math.random() * 0.3;
    dmg = Math.floor(base * variance);
    if (damageMultiplier !== undefined) dmg = Math.floor(dmg * damageMultiplier);
    // Phase 24: bonded intercept also softens enemy abilities landing on heroes.
    if (this.heroes && this.heroes.indexOf(target) >= 0) {
      const interceptPct = this._bondInterceptPctFor(target);
      if (interceptPct > 0) dmg = Math.floor(dmg * (1 - interceptPct / 100));
    }
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
  // Phase 26 beast hearts: battle-together bond XP rides the existing call
  // site (no new hooks, no double-award). Absent BeastBond = level XP only.
  try {
    if (typeof BeastBond !== 'undefined' && BeastBond && typeof BeastBond.addBattleXP === 'function') {
      const bond = BeastBond.addBattleXP(activeId);
      if (bond && bond.ok && bond.heartUp) {
        const msg = beast.name + ' bond deepened! Hearts: ' + bond.heart + '/3';
        if (typeof UI !== 'undefined' && UI.Feedback) UI.Feedback.Toast(msg, { color: R.colors.gold, icon: '♥' });
        else if (typeof Notify !== 'undefined') Notify.show(msg, 3, R.colors.gold);
      }
    }
  } catch (e) {}
};
