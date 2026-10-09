const BondSystem = {
  TIERS: [
    { min: 0, name: 'Wary' },
    { min: 25, name: 'Trusted' },
    { min: 50, name: 'Sworn' },
    { min: 90, name: 'Legend' }
  ],

  _unsafeKeys: {
    '__proto__': true,
    constructor: true,
    prototype: true
  },

  _safeKey: function(key) {
    return typeof key === 'string' && key.length > 0 && !this._unsafeKeys[key];
  },

  _clampValue: function(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.floor(n)));
  },

  _validIds: function(validIds) {
    if (Array.isArray(validIds)) return validIds;
    if (typeof HERO_IDS !== 'undefined' && Array.isArray(HERO_IDS)) return HERO_IDS;
    if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.HERO_IDS)) return globalThis.HERO_IDS;
    return null;
  },

  _knownIds: function() {
    if (typeof HEROES !== 'undefined' && HEROES && typeof HEROES === 'object') return HEROES;
    if (typeof globalThis !== 'undefined' && globalThis.HEROES && typeof globalThis.HEROES === 'object') return globalThis.HEROES;
    if (typeof HERO_IDS !== 'undefined' && Array.isArray(HERO_IDS)) {
      const map = {};
      for (const id of HERO_IDS) map[id] = true;
      return map;
    }
    return null;
  },

  tierFor: function(value) {
    const v = this._clampValue(value);
    let name = 'Wary';
    for (const tier of this.TIERS) {
      if (v >= tier.min) name = tier.name;
    }
    return name;
  },

  isRecruited: function(heroId) {
    try {
      if (typeof G === 'undefined' || !G || !G.state) return false;
      if (typeof globalThis !== 'undefined' && globalThis.G && globalThis.G.state) {
        const party = globalThis.G.state.party;
        if (!Array.isArray(party)) return false;
        return party.some(function(h) { return h && h.id === heroId; });
      }
      const party = G.state.party;
      if (!Array.isArray(party)) return false;
      return party.some(function(h) { return h && h.id === heroId; });
    } catch (e) {
      return false;
    }
  },

  _getState: function() {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.G && globalThis.G.state) return globalThis.G.state;
      if (typeof G !== 'undefined' && G && G.state) return G.state;
    } catch (e) {}
    return null;
  },

  valueFor: function(heroId) {
    try {
      const state = this._getState();
      if (!state || !state.affinity || typeof state.affinity !== 'object' || Array.isArray(state.affinity)) return 0;
      if (!Object.prototype.hasOwnProperty.call(state.affinity, heroId)) return 0;
      return this._clampValue(state.affinity[heroId]);
    } catch (e) {
      return 0;
    }
  },

  get: function(heroId) {
    const hidden = { value: 0, tier: 'Wary', visible: false };
    try {
      if (!this._safeKey(heroId)) return hidden;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return hidden;
      const value = this.valueFor(heroId);
      const visible = this.isRecruited(heroId);
      return { value: value, tier: this.tierFor(value), visible: visible };
    } catch (e) {
      return hidden;
    }
  },

  normalize: function(candidate, validIds) {
    try {
      const out = {};
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return out;
      const ids = this._validIds(validIds);
      const allowed = ids ? {} : null;
      if (allowed) {
        for (const id of ids) {
          if (typeof id === 'string') allowed[id] = true;
        }
      }
      for (const key of Object.keys(candidate)) {
        if (!this._safeKey(key)) continue;
        if (allowed && !allowed[key]) continue;
        out[key] = this._clampValue(candidate[key]);
      }
      return out;
    } catch (e) {
      return {};
    }
  },

  GAIN_SMALL: 2,
  GAIN_MAJOR: 4,
  // Weekly-equivalent replay cap: a completed bond scene may be replayed for
  // +1 up to 3 times, then grants nothing (no infinite farming).
  REPLAY_CAP: 3,

  _isActiveInParty: function(heroId) {
    try {
      const state = this._getState();
      if (!state || !Array.isArray(state.party)) return false;
      for (const h of state.party) {
        if (h && h.id === heroId) return h.active !== false;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  add: function(heroId, amount) {
    try {
      if (!this._safeKey(heroId)) return { applied: 0, before: 0, after: 0, tierUp: false };
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) {
        return { applied: 0, before: 0, after: 0, tierUp: false };
      }
      const state = this._getState();
      if (!state || !state.affinity || typeof state.affinity !== 'object' || Array.isArray(state.affinity)) {
        return { applied: 0, before: 0, after: 0, tierUp: false };
      }
      const before = Object.prototype.hasOwnProperty.call(state.affinity, heroId)
        ? this._clampValue(state.affinity[heroId]) : 0;
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) return { applied: 0, before: before, after: before, tierUp: false };
      if (!this.isRecruited(heroId) || !this._isActiveInParty(heroId)) {
        return { applied: 0, before: before, after: before, tierUp: false };
      }
      const applied = Math.floor(n);
      if (applied <= 0) return { applied: 0, before: before, after: before, tierUp: false };
      const after = Math.min(100, before + applied);
      state.affinity[heroId] = after;
      const tierUp = applied > 0 && this.tierFor(after) !== this.tierFor(before);
      return { applied: applied, before: before, after: after, tierUp: tierUp };
    } catch (e) {
      return { applied: 0, before: 0, after: 0, tierUp: false };
    }
  },

  _bondFlags: function() {
    try {
      const state = this._getState();
      if (!state) return {};
      if (!state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) return {};
      return state.flags;
    } catch (e) {
      return {};
    }
  },

  _tierMeets: function(value, tierReq) {
    if (tierReq == null) return true;
    const v = this._clampValue(value);
    if (tierReq === 'Trusted') return v >= 25;
    if (tierReq === 'Sworn') return v >= 50;
    if (tierReq === 'Legend') return v >= 90;
    return false;
  },

  bondAvailable: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return null;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return null;
      if (!this.isRecruited(heroId)) return null;
      const flags = this._bondFlags();
      const value = this.valueFor(heroId);
      const stages = ['recruit', 'crisis', 'oath'];
      const reqs = { recruit: null, crisis: 'Trusted', oath: 'Sworn' };
      for (const stage of stages) {
        const key = 'bond_' + heroId + '_' + stage;
        if (!this._safeKey(key)) continue;
        if (flags[key]) continue;
        if (!this._tierMeets(value, reqs[stage])) continue;
        return 'bond_' + heroId + '_' + stage;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  completeBond: function(eventId, choiceIdx) {
    try {
      const lookup = (typeof BOND_EVENTS !== 'undefined' && BOND_EVENTS)
        || (typeof globalThis !== 'undefined' && globalThis.BOND_EVENTS) || null;
      if (!lookup || typeof lookup !== 'object') return { ok: false };
      if (typeof eventId !== 'string' || !this._safeKey(eventId)) return { ok: false };
      if (!Object.prototype.hasOwnProperty.call(lookup, eventId)) return { ok: false };
      const entry = lookup[eventId];
      if (!entry || typeof entry !== 'object') return { ok: false };
      const heroId = entry.heroId;
      if (!this._safeKey(heroId)) return { ok: false };
      if (!this.isRecruited(heroId)) return { ok: false };
      // Re-validate the tier gate at completion time (stale UI cannot skip tiers).
      if (!this._tierMeets(this.valueFor(heroId), entry.tierReq)) return { ok: false };
      const state = this._getState();
      if (!state) return { ok: false };
      if (!state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) state.flags = {};
      const flagKey = 'bond_' + heroId + '_' + (entry.arc || 'recruit');
      const replayKey = flagKey + '_replays';
      if (!this._safeKey(flagKey) || !this._safeKey(replayKey)) return { ok: false };
      const idx = Number.isInteger(choiceIdx) && choiceIdx >= 0 ? choiceIdx : 0;
      const choice = entry.choices && entry.choices[idx];
      if (!state.flags[flagKey]) {
        // First completion: full gain from the chosen choice via this.add.
        // Note: this.add gates on the ACTIVE party, so a recruited-but-benched
        // hero still marks the flag here while gaining 0.
        let applied = 0;
        let tierUp = false;
        const aff = choice && choice.affinity && typeof choice.affinity === 'object' && !Array.isArray(choice.affinity)
          ? choice.affinity : null;
        if (aff) {
          for (const [hid, gain] of Object.entries(aff)) {
            const r = this.add(hid, gain);
            if (r && r.applied > 0) {
              applied += r.applied;
              if (r.tierUp) tierUp = true;
            }
          }
        }
        state.flags[flagKey] = true;
        return { ok: true, first: true, applied: applied, tierUp: tierUp };
      }
      // Replay path: +1 up to REPLAY_CAP, then hard cap with no write.
      let replays = Math.floor(Number(state.flags[replayKey]));
      if (!Number.isFinite(replays) || replays < 0) replays = 0;
      if (replays >= this.REPLAY_CAP) return { ok: true, first: false, capped: true, applied: 0 };
      const r = this.add(heroId, 1);
      const applied = (r && r.applied) || 0;
      state.flags[replayKey] = replays + 1;
      if (state.flags[replayKey] !== replays + 1) state.flags[replayKey] = replays + 1;
      return { ok: true, first: false, applied: applied, tierUp: !!(r && r.tierUp), replays: replays + 1 };
    } catch (e) {
      return { ok: false };
    }
  },

  ensureSeed: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return false;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return false;
      const state = this._getState();
      if (!state || !state.affinity || typeof state.affinity !== 'object' || Array.isArray(state.affinity)) return false;
      if (Object.prototype.hasOwnProperty.call(state.affinity, heroId)) return false;
      state.affinity[heroId] = 0;
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- Phase 24: Combat Bonds ---
  // DAO-style non-cumulative tier bumps to the hero's role stat. Applied in
  // combat stat calc only (Combat.applyBondPassives), never to G.state.
  ROLE_STAT: { arjuna: 'str', bhima: 'def', karna: 'str', draupadi: 'mag', hanuman: 'agi' },

  PASSIVE_BY_TIER: { Wary: 0, Trusted: 1, Sworn: 2, Legend: 4 },

  // Single synergy tag per hero (not a tree). Gated on Sworn+ (see synergyFor)
  // AND adjacency to the player in party order (see combatBonusFor).
  SYNERGY: {
    arjuna: { tag: 'crit', critBonus: 5, minTier: 'Sworn' },
    bhima: { tag: 'intercept', interceptPct: 15, minTier: 'Sworn' },
    karna: { tag: 'burst', dmgPct: 8, minTier: 'Sworn' },
    draupadi: { tag: 'ward', healPct: 10, minTier: 'Sworn' },
    hanuman: { tag: 'swiftness', agiBonus: 2, minTier: 'Sworn' }
  },

  passiveFor: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return 0;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return 0;
      const tier = this.tierFor(this.valueFor(heroId));
      const bonus = this.PASSIVE_BY_TIER[tier];
      return typeof bonus === 'number' ? bonus : 0;
    } catch (e) {
      return 0;
    }
  },

  roleStatFor: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return 'str';
      const stat = this.ROLE_STAT[heroId];
      return typeof stat === 'string' && stat ? stat : 'str';
    } catch (e) {
      return 'str';
    }
  },

  synergyFor: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return null;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return null;
      if (!Object.prototype.hasOwnProperty.call(this.SYNERGY, heroId)) return null;
      const tier = this.tierFor(this.valueFor(heroId));
      if (tier !== 'Sworn' && tier !== 'Legend') return null;
      const entry = this.SYNERGY[heroId];
      const copy = {};
      for (const key of Object.keys(entry)) copy[key] = entry[key];
      return copy;
    } catch (e) {
      return null;
    }
  },

  adjacentToPlayer: function(heroId, orderedIds, playerId) {
    try {
      if (!Array.isArray(orderedIds)) return false;
      if (typeof heroId !== 'string' || typeof playerId !== 'string') return false;
      const hi = orderedIds.indexOf(heroId);
      const pi = orderedIds.indexOf(playerId);
      if (hi < 0 || pi < 0) return false;
      return Math.abs(hi - pi) === 1;
    } catch (e) {
      return false;
    }
  },

  _lingerKey: function(heroId) {
    return 'bond_linger_' + heroId;
  },

  isLingering: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return false;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return false;
      const flags = this._bondFlags();
      return flags[this._lingerKey(heroId)] === true;
    } catch (e) {
      return false;
    }
  },

  isCombatEligible: function(heroId) {
    try {
      return this._isActiveInParty(heroId) || this.isLingering(heroId);
    } catch (e) {
      return false;
    }
  },

  setActive: function(heroId, active) {
    try {
      if (!this._safeKey(heroId)) return { ok: false };
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return { ok: false };
      const state = this._getState();
      if (!state || !Array.isArray(state.party)) return { ok: false };
      let entry = null;
      for (const h of state.party) {
        if (h && h.id === heroId) { entry = h; break; }
      }
      if (!entry) return { ok: false };
      if (!state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) state.flags = {};
      const key = this._lingerKey(heroId);
      if (active === false) {
        entry.active = false;
        // Linger one battle: a benched hero that HAD a bonus keeps it for
        // the next completed battle. Wary (passive 0) heroes set no flag.
        if (this.passiveFor(heroId) > 0) {
          state.flags[key] = true;
          return { ok: true, lingering: true };
        }
        if (Object.prototype.hasOwnProperty.call(state.flags, key)) delete state.flags[key];
        return { ok: true, lingering: false };
      }
      entry.active = true;
      // Moving the hero back in resets normally.
      if (Object.prototype.hasOwnProperty.call(state.flags, key)) delete state.flags[key];
      return { ok: true, lingering: false };
    } catch (e) {
      return { ok: false };
    }
  },

  combatBonusFor: function(heroId, orderedIds, playerId) {
    const none = { eligible: false, passive: 0, roleStat: 'str', synergy: null, lingering: false, adjacent: false };
    try {
      if (!this._safeKey(heroId)) return none;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return none;
      const lingering = this.isLingering(heroId);
      const eligible = this._isActiveInParty(heroId) || lingering;
      if (!eligible) return none;
      const adjacent = this.adjacentToPlayer(heroId, orderedIds, playerId);
      const synergy = adjacent ? this.synergyFor(heroId) : null;
      return {
        eligible: true,
        passive: this.passiveFor(heroId),
        roleStat: this.roleStatFor(heroId),
        synergy: synergy,
        lingering: lingering,
        adjacent: adjacent
      };
    } catch (e) {
      return none;
    }
  },

  consumeLingerAfterBattle: function() {
    try {
      const state = this._getState();
      if (!state || !state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) return 0;
      let cleared = 0;
      for (const key of Object.keys(state.flags)) {
        if (typeof key !== 'string' || key.indexOf('bond_linger_') !== 0) continue;
        if (state.flags[key] !== true) continue;
        delete state.flags[key];
        cleared++;
      }
      return cleared;
    } catch (e) {
      return 0;
    }
  },

  normalizeLinger: function(flags) {
    try {
      const out = {};
      if (!flags || typeof flags !== 'object' || Array.isArray(flags)) return out;
      const known = this._knownIds();
      for (const key of Object.keys(flags)) {
        if (!this._safeKey(key)) continue;
        if (typeof key === 'string' && key.indexOf('bond_linger_') === 0) {
          // Keep only true-valued flags for known heroes; drop the rest.
          if (flags[key] !== true) continue;
          const heroId = key.slice('bond_linger_'.length);
          if (!this._safeKey(heroId)) continue;
          if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) continue;
          out[key] = true;
          continue;
        }
        out[key] = flags[key];
      }
      return out;
    } catch (e) {
      return {};
    }
  },
  // --- Phase 26: Beast Hearts & Care Actions ---
  // Bond hearts (0-3) derived from cumulative bond XP stored in
  // G.state.beastBond = { xp, feed: {day, counts}, train: {day, counts},
  // trainCd }. Hearts are DERIVED via HEART_THRESHOLDS, never stored.
  // Mutations go through the canonical economy (Economy.spendGold /
  // Economy.removeItemByName); prana decrements G.state.prana directly
  // (no canonical spend helper exists — matches spiritBeast.js precedent).
  // Every denial returns an explicit reason; nothing fails silently.
  // --- Phase 25: Signature Combos ---
  // One Legend-gated duo skill per hero. Availability + potency live here;
  // execution authority lives in Combat.performSignatureCombo (battle clones).
  // Unlock flags (combo_<hero>) persist in G.state.flags exactly-once.
  COMBOS: {
    arjuna: { heroId: 'arjuna', name: 'Gandiva Twin Strike', kind: 'strike', base: 1.8, statScale: 0.04, hits: 2, flavor: 'Arjuna looses twin shafts of Gandiva in perfect unison with his bond-mate.' },
    bhima: { heroId: 'bhima', name: 'Mountain-Guard Slam', kind: 'slam', base: 1.6, statScale: 0.04, shield: 15, flavor: 'Bhima brings the gada down as one, then stands as a living wall before his bond-mate.' },
    karna: { heroId: 'karna', name: 'Sunburst Volley', kind: 'volley', base: 1.2, statScale: 0.03, flavor: 'Karna calls on Surya; shafts of dawn-fire fall upon every foe at once.' },
    draupadi: { heroId: 'draupadi', name: 'Panchali Warding Aegis', kind: 'aegis', base: 0.25, statScale: 0.008, shield: 12, flavor: 'Draupadi raises a warding mantra; her blessing knits wounds and turns blades aside.' },
    hanuman: { heroId: 'hanuman', name: 'Mountain-Leap Sunder', kind: 'leap', base: 2.2, statScale: 0.05, splash: 0.5, flavor: 'Hanuman leaps as at the ocean-crossing and falls among the foe, the shock scattering all.' }
  },

  comboFor: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return null;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return null;
      if (!Object.prototype.hasOwnProperty.call(this.COMBOS, heroId)) return null;
      const entry = this.COMBOS[heroId];
      const copy = {};
      for (const key of Object.keys(entry)) copy[key] = entry[key];
      return copy;
    } catch (e) {
      return null;
    }
  },

  _activeInParty: function(heroId) {
    try {
      if (typeof heroId !== 'string') return false;
      const state = this._getState();
      if (!state || !Array.isArray(state.party)) return false;
      for (const h of state.party) {
        if (h && h.id === heroId) return h.active !== false;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  comboAvailable: function(heroId, orderedIds, playerId) {
    const denied = function(reason) {
      return { available: false, heroId: (typeof heroId === 'string' ? heroId : null), partnerId: null, reason: reason };
    };
    try {
      if (!this._safeKey(heroId)) return denied('unknown');
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return denied('unknown');
      if (!Object.prototype.hasOwnProperty.call(this.COMBOS, heroId)) return denied('unknown');
      if (this.tierFor(this.valueFor(heroId)) !== 'Legend') return denied('not_legend');
      if (!(this._isActiveInParty(heroId) || this.isLingering(heroId))) return denied('hero_inactive');
      if (!Array.isArray(orderedIds)) return denied('no_partner');
      let partnerId = null;
      if (typeof playerId === 'string' && playerId !== heroId &&
          orderedIds.indexOf(playerId) >= 0 && this._activeInParty(playerId)) {
        partnerId = playerId;
      } else {
        for (const id of orderedIds) {
          if (typeof id !== 'string' || id === heroId) continue;
          if (this._activeInParty(id)) { partnerId = id; break; }
        }
      }
      if (!partnerId) return denied('no_partner');
      return { available: true, heroId: heroId, partnerId: partnerId, reason: 'ok' };
    } catch (e) {
      return denied('unknown');
    }
  },

  comboPotencyFor: function(heroId, roleStatValue, weaponLvl, hasWeapon) {
    try {
      const def = (this._safeKey(heroId) && Object.prototype.hasOwnProperty.call(this.COMBOS, heroId))
        ? this.COMBOS[heroId] : null;
      const base = (def && Number.isFinite(Number(def.base))) ? Number(def.base) : 1.0;
      const scale = (def && Number.isFinite(Number(def.statScale))) ? Number(def.statScale) : 0;
      const stat = Number(roleStatValue);
      const statSafe = Number.isFinite(stat) ? Math.max(0, stat) : 0;
      const mult = base + scale * statSafe;
      let bonus = 0;
      if (hasWeapon) {
        const lvl = Math.floor(Number(weaponLvl));
        bonus = 0.15 * (Number.isFinite(lvl) ? Math.max(1, lvl) : 1);
      }
      return { mult: mult, bonus: bonus };
    } catch (e) {
      return { mult: 1.0, bonus: 0 };
    }
  },

  _comboKey: function(heroId) {
    return 'combo_' + heroId;
  },

  comboSeen: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return false;
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return false;
      const flags = this._bondFlags();
      return flags[this._comboKey(heroId)] === true;
    } catch (e) {
      return false;
    }
  },

  markComboSeen: function(heroId) {
    try {
      if (!this._safeKey(heroId)) return { ok: false };
      const known = this._knownIds();
      if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) return { ok: false };
      if (!Object.prototype.hasOwnProperty.call(this.COMBOS, heroId)) return { ok: false };
      const state = this._getState();
      if (!state) return { ok: false };
      if (!state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) state.flags = {};
      const key = this._comboKey(heroId);
      if (!this._safeKey(key)) return { ok: false };
      if (state.flags[key] === true) return { ok: true, first: false };
      state.flags[key] = true;
      return { ok: true, first: true };
    } catch (e) {
      return { ok: false };
    }
  },

  normalizeCombo: function(flags) {
    try {
      const out = {};
      if (!flags || typeof flags !== 'object' || Array.isArray(flags)) return out;
      const known = this._knownIds();
      for (const key of Object.keys(flags)) {
        if (!this._safeKey(key)) continue;
        if (typeof key === 'string' && key.indexOf('combo_') === 0) {
          // Keep only true-valued flags for known combo heroes; drop the rest.
          if (flags[key] !== true) continue;
          const heroId = key.slice('combo_'.length);
          if (!this._safeKey(heroId)) continue;
          if (known && !Object.prototype.hasOwnProperty.call(known, heroId)) continue;
          if (!Object.prototype.hasOwnProperty.call(this.COMBOS, heroId)) continue;
          out[key] = true;
          continue;
        }
        out[key] = flags[key];
      }
      return out;
    } catch (e) {
      return {};
    }
  }
};

// --- Phase 26: BeastBond (hearts 0-3 via battle XP + feed/train care) ---
// Standalone global (not on BondSystem) so hero-affinity thresholds stay
// untouched. See the Phase 26 comment inside BondSystem for state shape.
var BeastBond = {
  HEART_THRESHOLDS: [0, 30, 80, 160],
  BATTLE_XP: 8,
  FEED_XP: 11,
  PRANA_TRAIN_XP: 6,
  GOLD_TRAIN_XP: 14,
  FEED_GOLD_BASE: 20,
  GOLD_TRAIN_BASE: 40,
  PRANA_COST: 25,
  FEED_CAP: 3,
  TRAIN_CAP: 5,
  GOLD_TRAIN_CD_MS: 300000,
  MAX_XP: 9999,

  _unsafeKeys: { '__proto__': true, constructor: true, prototype: true },

  _safeKey: function(key) {
    return typeof key === 'string' && key.length > 0 && !this._unsafeKeys[key];
  },

  _now: function() {
    try {
      if (typeof Date !== 'undefined' && Date.now) return Date.now();
    } catch (e) {}
    return 0;
  },

  _dayOf: function(now) {
    const n = Number(now);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n / 86400000);
  },

  _knownIds: function() {
    try {
      if (typeof SPIRIT_BEASTS !== 'undefined' && SPIRIT_BEASTS && typeof SPIRIT_BEASTS === 'object') return SPIRIT_BEASTS;
      if (typeof globalThis !== 'undefined' && globalThis.SPIRIT_BEASTS && typeof globalThis.SPIRIT_BEASTS === 'object') return globalThis.SPIRIT_BEASTS;
    } catch (e) {}
    return null;
  },

  _isKnown: function(beastId) {
    if (!this._safeKey(beastId)) return false;
    const known = this._knownIds();
    if (known && !Object.prototype.hasOwnProperty.call(known, beastId)) return false;
    return true;
  },

  _getState: function() {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.G && globalThis.G.state) return globalThis.G.state;
      if (typeof G !== 'undefined' && G && G.state) return G.state;
    } catch (e) {}
    return null;
  },

  _emptyShape: function() {
    return { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} };
  },

  _store: function() {
    try {
      const state = this._getState();
      if (!state) return this._emptyShape();
      if (!state.beastBond || typeof state.beastBond !== 'object' || Array.isArray(state.beastBond)) {
        state.beastBond = this._emptyShape();
      }
      const bb = state.beastBond;
      if (!bb.xp || typeof bb.xp !== 'object' || Array.isArray(bb.xp)) bb.xp = {};
      if (!bb.feed || typeof bb.feed !== 'object' || Array.isArray(bb.feed)) bb.feed = { day: 0, counts: {} };
      if (!bb.train || typeof bb.train !== 'object' || Array.isArray(bb.train)) bb.train = { day: 0, counts: {} };
      if (!bb.trainCd || typeof bb.trainCd !== 'object' || Array.isArray(bb.trainCd)) bb.trainCd = {};
      if (typeof bb.feed.day !== 'number') bb.feed.day = 0;
      if (typeof bb.train.day !== 'number') bb.train.day = 0;
      if (!bb.feed.counts || typeof bb.feed.counts !== 'object') bb.feed.counts = {};
      if (!bb.train.counts || typeof bb.train.counts !== 'object') bb.train.counts = {};
      return bb;
    } catch (e) {
      return this._emptyShape();
    }
  },

  _clampHearts: function(h) {
    const n = Math.floor(Number(h));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(3, n));
  },

  _clampXp: function(x) {
    const n = Math.floor(Number(x));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(this.MAX_XP, n));
  },

  heartFor: function(xp) {
    try {
      const x = this._clampXp(xp);
      const t = this.HEART_THRESHOLDS;
      let heart = 0;
      for (let i = 0; i < t.length; i++) {
        if (x >= t[i]) heart = i;
      }
      return Math.max(0, Math.min(3, heart));
    } catch (e) {
      return 0;
    }
  },

  xpFor: function(beastId) {
    try {
      if (!this._safeKey(beastId)) return 0;
      const bb = this._store();
      if (!Object.prototype.hasOwnProperty.call(bb.xp, beastId)) return 0;
      return this._clampXp(bb.xp[beastId]);
    } catch (e) {
      return 0;
    }
  },

  get: function(beastId) {
    try {
      const xp = this.xpFor(beastId);
      return { xp: xp, heart: this.heartFor(xp) };
    } catch (e) {
      return { xp: 0, heart: 0 };
    }
  },

  feedGoldFor: function(hearts) {
    const h = this._clampHearts(hearts);
    return Math.round(this.FEED_GOLD_BASE * Math.pow(1.2, h));
  },

  trainGoldFor: function(hearts) {
    const h = this._clampHearts(hearts);
    return Math.round(this.GOLD_TRAIN_BASE * Math.pow(1.2, h));
  },

  isFeedItem: function(item) {
    try {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
      if (typeof item.name !== 'string' || item.name.length === 0) return false;
      if (item.type === 'herb') return true;
      if (item.type === 'consumable' && typeof item.recipeId === 'string' && item.recipeId.length > 0) return true;
      try {
        const hg = (typeof HERB_GROWTH !== 'undefined' && HERB_GROWTH)
          || (typeof globalThis !== 'undefined' && globalThis.HERB_GROWTH) || null;
        if (hg && typeof hg === 'object') {
          for (const key of Object.keys(hg)) {
            const entry = hg[key];
            if (entry && entry.name === item.name) return true;
          }
        }
      } catch (e) {}
      return false;
    } catch (e) {
      return false;
    }
  },

  _addXp: function(beastId, amount) {
    const before = this.xpFor(beastId);
    const after = this._clampXp(before + Math.max(0, Math.floor(Number(amount) || 0)));
    const bb = this._store();
    bb.xp[beastId] = after;
    const hb = this.heartFor(before), ha = this.heartFor(after);
    return { xp: after, heart: ha, heartUp: ha > hb };
  },

  _rollDay: function(track, now) {
    const day = this._dayOf(now);
    if (track.day !== day) {
      track.day = day;
      track.counts = {};
    }
    return day;
  },

  _countFor: function(track, beastId) {
    const n = Math.floor(Number(track.counts[beastId]));
    return Number.isFinite(n) && n > 0 ? n : 0;
  },

  addBattleXP: function(beastId) {
    try {
      if (!this._isKnown(beastId)) return { ok: false, reason: 'unknown_beast' };
      const r = this._addXp(beastId, this.BATTLE_XP);
      return { ok: true, xp: r.xp, heart: r.heart, heartUp: r.heartUp };
    } catch (e) {
      return { ok: false, reason: 'unknown_beast' };
    }
  },

  _economy: function() {
    try {
      const eco = (typeof Economy !== 'undefined' && Economy)
        || (typeof globalThis !== 'undefined' && globalThis.Economy) || null;
      return eco;
    } catch (e) {
      return null;
    }
  },

  _findFeedItem: function(itemName) {
    try {
      const state = this._getState();
      if (!state || !Array.isArray(state.inventory)) return null;
      for (const item of state.inventory) {
        if (item && item.name === itemName && this.isFeedItem(item)) return item;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  feed: function(beastId, itemName) {
    try {
      if (!this._isKnown(beastId)) return { ok: false, reason: 'unknown_beast' };
      if (typeof itemName !== 'string' || itemName.length === 0) return { ok: false, reason: 'no_item' };
      const found = this._findFeedItem(itemName);
      if (!found) return { ok: false, reason: 'no_item' };
      const bb = this._store();
      const now = this._now();
      this._rollDay(bb.feed, now);
      if (this._countFor(bb.feed, beastId) >= this.FEED_CAP) return { ok: false, reason: 'capped' };
      const cost = this.feedGoldFor(this.heartFor(this.xpFor(beastId)));
      const eco = this._economy();
      const gold = (function() {
        try {
          if (typeof globalThis !== 'undefined' && globalThis.G && globalThis.G.state) return globalThis.G.state.gold || 0;
          if (typeof G !== 'undefined' && G && G.state) return G.state.gold || 0;
        } catch (e) {}
        return 0;
      })();
      if (gold < cost) return { ok: false, reason: 'no_gold', need: cost, have: Math.floor(gold) };
      if (eco && typeof eco.removeItemByName === 'function' && typeof eco.spendGold === 'function') {
        if (!eco.removeItemByName(itemName, 1)) return { ok: false, reason: 'no_item' };
        if (!eco.spendGold(cost)) return { ok: false, reason: 'no_gold', need: cost, have: Math.floor(gold) };
      } else {
        return { ok: false, reason: 'no_item' };
      }
      const r = this._addXp(beastId, this.FEED_XP);
      bb.feed.counts[beastId] = this._countFor(bb.feed, beastId) + 1;
      return { ok: true, xp: r.xp, heart: r.heart, heartUp: r.heartUp, item: itemName, gold: cost };
    } catch (e) {
      return { ok: false, reason: 'no_item' };
    }
  },

  pranaTrain: function(beastId) {
    try {
      if (!this._isKnown(beastId)) return { ok: false, reason: 'unknown_beast' };
      const bb = this._store();
      const now = this._now();
      this._rollDay(bb.train, now);
      if (this._countFor(bb.train, beastId) >= this.TRAIN_CAP) return { ok: false, reason: 'capped' };
      const state = this._getState();
      const prana = state ? (Number(state.prana) || 0) : 0;
      if (prana < this.PRANA_COST) return { ok: false, reason: 'no_prana', need: this.PRANA_COST, have: Math.floor(prana) };
      if (state) state.prana = prana - this.PRANA_COST;
      const r = this._addXp(beastId, this.PRANA_TRAIN_XP);
      bb.train.counts[beastId] = this._countFor(bb.train, beastId) + 1;
      return { ok: true, xp: r.xp, heart: r.heart, heartUp: r.heartUp, prana: this.PRANA_COST };
    } catch (e) {
      return { ok: false, reason: 'no_prana' };
    }
  },

  goldTrain: function(beastId) {
    try {
      if (!this._isKnown(beastId)) return { ok: false, reason: 'unknown_beast' };
      const bb = this._store();
      const now = this._now();
      this._rollDay(bb.train, now);
      if (this._countFor(bb.train, beastId) >= this.TRAIN_CAP) return { ok: false, reason: 'capped' };
      const last = Number(bb.trainCd[beastId]);
      if (Number.isFinite(last) && last > 0 && now < last + this.GOLD_TRAIN_CD_MS) {
        return { ok: false, reason: 'cooldown', retryMs: Math.ceil(last + this.GOLD_TRAIN_CD_MS - now) };
      }
      const cost = this.trainGoldFor(this.heartFor(this.xpFor(beastId)));
      const gold = (function() {
        try {
          if (typeof globalThis !== 'undefined' && globalThis.G && globalThis.G.state) return globalThis.G.state.gold || 0;
          if (typeof G !== 'undefined' && G && G.state) return G.state.gold || 0;
        } catch (e) {}
        return 0;
      })();
      if (gold < cost) return { ok: false, reason: 'no_gold', need: cost, have: Math.floor(gold) };
      const eco = this._economy();
      if (!eco || typeof eco.spendGold !== 'function') return { ok: false, reason: 'no_gold', need: cost, have: Math.floor(gold) };
      if (!eco.spendGold(cost)) return { ok: false, reason: 'no_gold', need: cost, have: Math.floor(gold) };
      const r = this._addXp(beastId, this.GOLD_TRAIN_XP);
      bb.train.counts[beastId] = this._countFor(bb.train, beastId) + 1;
      bb.trainCd[beastId] = now;
      return { ok: true, xp: r.xp, heart: r.heart, heartUp: r.heartUp, gold: cost };
    } catch (e) {
      return { ok: false, reason: 'no_gold' };
    }
  },

  statusFor: function(beastId) {
    const empty = { xp: 0, heart: 0, nextAt: this.HEART_THRESHOLDS[1], feedLeft: this.FEED_CAP, trainLeft: this.TRAIN_CAP, goldCdMs: 0 };
    try {
      if (!this._safeKey(beastId)) return empty;
      const xp = this.xpFor(beastId);
      const heart = this.heartFor(xp);
      const nextAt = heart >= 3 ? null : this.HEART_THRESHOLDS[heart + 1];
      const bb = this._store();
      const now = this._now();
      const feedDay = this._dayOf(now);
      const feedLeft = (bb.feed.day === feedDay) ? Math.max(0, this.FEED_CAP - this._countFor(bb.feed, beastId)) : this.FEED_CAP;
      const trainLeft = (bb.train.day === feedDay) ? Math.max(0, this.TRAIN_CAP - this._countFor(bb.train, beastId)) : this.TRAIN_CAP;
      let goldCdMs = 0;
      const last = Number(bb.trainCd[beastId]);
      if (Number.isFinite(last) && last > 0 && now < last + this.GOLD_TRAIN_CD_MS) {
        goldCdMs = Math.ceil(last + this.GOLD_TRAIN_CD_MS - now);
      }
      return { xp: xp, heart: heart, nextAt: nextAt, feedLeft: feedLeft, trainLeft: trainLeft, goldCdMs: goldCdMs };
    } catch (e) {
      return empty;
    }
  },

  normalize: function(candidate) {
    try {
      const out = this._emptyShape();
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return out;
      const known = this._knownIds();
      const scrubMap = function(src, max) {
        const dst = {};
        if (!src || typeof src !== 'object' || Array.isArray(src)) return dst;
        for (const key of Object.keys(src)) {
          if (typeof key !== 'string' || key.length === 0) continue;
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
          if (known && !Object.prototype.hasOwnProperty.call(known, key)) continue;
          const n = Math.floor(Number(src[key]));
          if (!Number.isFinite(n)) continue;
          dst[key] = Math.max(0, Math.min(max, n));
        }
        return dst;
      };
      out.xp = scrubMap(candidate.xp, this.MAX_XP);
      if (candidate.feed && typeof candidate.feed === 'object' && !Array.isArray(candidate.feed)) {
        const d = Math.floor(Number(candidate.feed.day));
        out.feed.day = Number.isFinite(d) && d > 0 ? d : 0;
        out.feed.counts = scrubMap(candidate.feed.counts, 99);
      }
      if (candidate.train && typeof candidate.train === 'object' && !Array.isArray(candidate.train)) {
        const d = Math.floor(Number(candidate.train.day));
        out.train.day = Number.isFinite(d) && d > 0 ? d : 0;
        out.train.counts = scrubMap(candidate.train.counts, 99);
      }
      if (candidate.trainCd && typeof candidate.trainCd === 'object' && !Array.isArray(candidate.trainCd)) {
        for (const key of Object.keys(candidate.trainCd)) {
          if (typeof key !== 'string' || key.length === 0) continue;
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
          if (known && !Object.prototype.hasOwnProperty.call(known, key)) continue;
          const n = Number(candidate.trainCd[key]);
          if (!Number.isFinite(n) || n <= 0) continue;
          out.trainCd[key] = Math.floor(n);
        }
      }
      return out;
    } catch (e) {
      return this._emptyShape();
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BondSystem, BeastBond };
}
