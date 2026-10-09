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
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BondSystem };
}
