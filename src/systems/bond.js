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
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BondSystem };
}
