// LivingZones (Phase 28, ZON-01/ZON-02) — companion-reactive zone depth.
// Read-only resolution over ZONE_VARIANTS + bond state; all writes flow
// through EncounterSystem.choose (exactly-once seen ledger). Tease hints
// never block: below-threshold players keep the standard encounter.
// Every API never throws and degrades safe when globals are absent.

const LivingZones = {
  _unsafeKeys: { '__proto__': true, constructor: true, prototype: true },

  _safeKey: function(key) {
    return typeof key === 'string' && key.length > 0 && !this._unsafeKeys[key];
  },

  _getState: function() {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.G && globalThis.G.state) return globalThis.G.state;
      if (typeof G !== 'undefined' && G && G.state) return G.state;
    } catch (e) {}
    return null;
  },

  _variants: function() {
    try {
      const table = (typeof ZONE_VARIANTS !== 'undefined' && ZONE_VARIANTS)
        || (typeof globalThis !== 'undefined' && globalThis.ZONE_VARIANTS) || null;
      if (!Array.isArray(table)) return [];
      return table;
    } catch (e) {
      return [];
    }
  },

  _seen: function() {
    try {
      const state = this._getState();
      if (!state || !state.encounters || typeof state.encounters !== 'object' || Array.isArray(state.encounters)) return {};
      const seen = state.encounters.seen;
      if (!seen || typeof seen !== 'object' || Array.isArray(seen)) return {};
      return seen;
    } catch (e) {
      return {};
    }
  },

  _ctxFor: function() {
    let level = 1, karma = 0;
    try {
      const state = this._getState();
      if (state) {
        if (Array.isArray(state.party)) {
          for (const h of state.party) {
            const lvl = h && Math.floor(Number(h.level));
            if (Number.isFinite(lvl) && lvl > level) level = lvl;
          }
        }
        const k = Number(state.karma);
        if (Number.isFinite(k)) karma = k;
      }
    } catch (e) {}
    return { level: level, karma: karma };
  },

  _thresholdOf: function(variant) {
    try {
      const req = variant && variant.bondReq;
      if (!req || typeof req !== 'object') return 0;
      if (typeof req.hero === 'string') {
        const n = Math.floor(Number(req.affinityMin));
        return Number.isFinite(n) && n > 0 ? n : 0;
      }
      if (typeof req.beast === 'string') {
        const n = Math.floor(Number(req.heartMin));
        return Number.isFinite(n) && n > 0 ? n * 25 : 0;
      }
    } catch (e) {}
    return 0;
  },

  _isVariant: function(id) {
    return typeof id === 'string' && id.indexOf('lz_') === 0;
  },

  variantsFor: function(zoneId) {
    try {
      if (!this._safeKey(zoneId)) return [];
      return this._variants().filter(function(v) {
        return v && v.id && Array.isArray(v.zones) && v.zones.indexOf(zoneId) >= 0;
      });
    } catch (e) {
      return [];
    }
  },

  _isEligible: function(variant, zoneId, ctx) {
    try {
      if (!variant || typeof variant.id !== 'string') return false;
      const lookup = (typeof ENCOUNTERS !== 'undefined' && ENCOUNTERS)
        || (typeof globalThis !== 'undefined' && globalThis.ENCOUNTERS) || null;
      const enc = (lookup && lookup[variant.id]) || variant;
      if (typeof encounterAvailable === 'function') {
        return encounterAvailable(enc, { zoneId: zoneId, level: ctx.level, karma: ctx.karma }) === true;
      }
      if (typeof globalThis !== 'undefined' && typeof globalThis.encounterAvailable === 'function') {
        return globalThis.encounterAvailable(enc, { zoneId: zoneId, level: ctx.level, karma: ctx.karma }) === true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  eligibleIn: function(zoneId) {
    try {
      if (!this._safeKey(zoneId)) return [];
      const self = this;
      const seen = this._seen();
      const ctx = this._ctxFor();
      const out = this.variantsFor(zoneId).filter(function(v) {
        if (!v || !self._safeKey(v.id)) return false;
        if (seen[v.id]) return false;
        return self._isEligible(v, zoneId, ctx);
      });
      out.sort(function(a, b) { return self._thresholdOf(b) - self._thresholdOf(a); });
      return out;
    } catch (e) {
      return [];
    }
  },

  resolveFor: function(zoneId) {
    try {
      const list = this.eligibleIn(zoneId);
      return list.length > 0 ? list[0] : null;
    } catch (e) {
      return null;
    }
  },

  _displayName: function(kind, id) {
    try {
      if (kind === 'hero') {
        const table = (typeof HEROES !== 'undefined' && HEROES)
          || (typeof globalThis !== 'undefined' && globalThis.HEROES) || null;
        if (table && table[id] && typeof table[id].name === 'string' && table[id].name) return table[id].name;
        return id;
      }
      const table = (typeof SPIRIT_BEASTS !== 'undefined' && SPIRIT_BEASTS)
        || (typeof globalThis !== 'undefined' && globalThis.SPIRIT_BEASTS) || null;
      if (table && table[id] && typeof table[id].name === 'string' && table[id].name) return table[id].name;
      return id;
    } catch (e) {
      return id;
    }
  },

  _zoneName: function(zoneId) {
    try {
      const table = (typeof ZONES !== 'undefined' && ZONES)
        || (typeof globalThis !== 'undefined' && globalThis.ZONES) || null;
      if (table && table[zoneId] && typeof table[zoneId].name === 'string' && table[zoneId].name) return table[zoneId].name;
    } catch (e) {}
    return 'these lands';
  },

  _heroValue: function(heroId) {
    try {
      const api = (typeof BondSystem !== 'undefined' && BondSystem)
        || (typeof globalThis !== 'undefined' && globalThis.BondSystem) || null;
      if (!api || typeof api.valueFor !== 'function') return null;
      const n = Number(api.valueFor(heroId));
      return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.floor(n))) : null;
    } catch (e) {
      return null;
    }
  },

  _isRecruited: function(heroId) {
    try {
      const api = (typeof BondSystem !== 'undefined' && BondSystem)
        || (typeof globalThis !== 'undefined' && globalThis.BondSystem) || null;
      if (!api || typeof api.isRecruited !== 'function') return false;
      return api.isRecruited(heroId) === true;
    } catch (e) {
      return false;
    }
  },

  _hasOath: function(heroId) {
    try {
      const state = this._getState();
      if (!state || !state.flags || typeof state.flags !== 'object' || Array.isArray(state.flags)) return false;
      return state.flags['bond_' + heroId + '_oath'] === true;
    } catch (e) {
      return false;
    }
  },

  _beastHeart: function(beastId) {
    try {
      const api = (typeof BeastBond !== 'undefined' && BeastBond)
        || (typeof globalThis !== 'undefined' && globalThis.BeastBond) || null;
      if (!api || typeof api.heartFor !== 'function' || typeof api.xpFor !== 'function') return null;
      const h = Math.floor(Number(api.heartFor(api.xpFor(beastId))));
      if (!Number.isFinite(h)) return null;
      const xp = Number(api.xpFor(beastId));
      if (Number.isFinite(xp) && xp <= 0) return 0;
      return Math.max(0, Math.min(3, h));
    } catch (e) {
      return null;
    }
  },

  teaseFor: function(zoneId) {
    try {
      if (!this._safeKey(zoneId)) return null;
      const self = this;
      const seen = this._seen();
      const ctx = this._ctxFor();
      const locked = this.variantsFor(zoneId).filter(function(v) {
        if (!v || !self._safeKey(v.id)) return false;
        if (seen[v.id]) return false;
        return !self._isEligible(v, zoneId, ctx);
      });
      if (locked.length === 0) return null;
      locked.sort(function(a, b) { return self._thresholdOf(a) - self._thresholdOf(b); });
      const near = locked[0];
      const req = near.bondReq || {};
      const kind = typeof req.hero === 'string' ? 'hero' : 'beast';
      const id = typeof req.hero === 'string' ? req.hero : req.beast;
      if (!self._safeKey(id)) return null;
      return 'Deeper bonds with ' + self._displayName(kind, id) + ' may open more in ' + self._zoneName(zoneId) + '…';
    } catch (e) {
      return null;
    }
  },

  companionFor: function(zoneId) {
    try {
      if (!this._safeKey(zoneId)) return null;
      const self = this;
      const heroes = [];
      const beasts = [];
      for (const v of this.variantsFor(zoneId)) {
        const req = (v && v.bondReq) || {};
        if (typeof req.hero === 'string' && self._safeKey(req.hero) && heroes.indexOf(req.hero) < 0) heroes.push(req.hero);
        if (typeof req.beast === 'string' && self._safeKey(req.beast) && beasts.indexOf(req.beast) < 0) beasts.push(req.beast);
      }
      let bestOath = null;
      let bestHero = null;
      for (const id of heroes) {
        if (!self._isRecruited(id)) continue;
        const val = self._heroValue(id);
        if (val == null || val <= 0) continue;
        const entry = { kind: 'hero', id: id, name: self._displayName('hero', id), affinity: val, heart: 0, oath: self._hasOath(id) };
        if (entry.oath && (!bestOath || val > bestOath.affinity)) bestOath = entry;
        if (!bestHero || val > bestHero.affinity) bestHero = entry;
      }
      if (bestOath) return bestOath;
      if (bestHero) return bestHero;
      let bestBeast = null;
      for (const id of beasts) {
        const heart = self._beastHeart(id);
        if (heart == null || heart <= 0) continue;
        const entry = { kind: 'beast', id: id, name: self._displayName('beast', id), affinity: 0, heart: heart, oath: heart >= 2 };
        if (!bestBeast || heart > bestBeast.heart) bestBeast = entry;
      }
      return bestBeast;
    } catch (e) {
      return null;
    }
  },

  landmarkBondNote: function(zoneId) {
    try {
      const c = this.companionFor(zoneId);
      if (!c) return null;
      if (c.oath) return 'The land remembers ' + c.name + ', oath-bound companion.';
      return c.name + '\u2019s bond lingers here.';
    } catch (e) {
      return null;
    }
  },

  echoWitness: function(regionId) {
    try {
      const c = this.companionFor(regionId);
      if (!c || !c.oath) return null;
      return ' \u2014 witnessed by ' + c.name + ', oath-bound';
    } catch (e) {
      return null;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LivingZones };
}
