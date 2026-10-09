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
