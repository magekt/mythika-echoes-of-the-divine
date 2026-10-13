const SaveSystem = {
  SAVE_KEY: 'mythika_save',
  autoSaveInterval: 30000,
  _timer: null,
  _cloudSynced: false
};

SaveSystem.save = function() {
  try {
    if (typeof ZoneRewardSystem !== 'undefined' && ZoneRewardSystem.normalize) {
      ZoneRewardSystem.normalize();
    }
    const snap = JSON.parse(JSON.stringify(G.state));
    // Diagnostics buffers are session-local; never persist them.
    if (snap && snap.diagnostics) delete snap.diagnostics;
    const data = {
      state: snap,
      version: 1,
      timestamp: Date.now()
    };
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Save failed:', e);
    return false;
  }
};

SaveSystem.hydrate = function(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;

  const nextState = G.createDefaultState();
  for (const key of Object.keys(state)) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') nextState[key] = state[key];
  }
  for (const key of Object.keys(G.state)) delete G.state[key];
  Object.assign(G.state, nextState);
  this.migrate();
  return true;
};

SaveSystem.migrate = function() {
  // Heal saves created before the object-based gear model:
  // - inventory entries must be real objects with a name
  // - gear slots must be objects or null (legacy strings are dropped)
  // - numeric fields must be finite numbers (crafted/corrupt files included)
  if (typeof G.state.debugMode !== 'boolean') G.state.debugMode = false;
  if (!Array.isArray(G.state.inventory)) G.state.inventory = [];
  G.state.inventory = G.state.inventory.filter(i => typeof i === 'object' && i !== null && i.name);
  if (!Array.isArray(G.state.party)) G.state.party = [];
  G.state.party = G.state.party.filter(hero => hero && typeof hero === 'object' && !Array.isArray(hero));
  if (!G.state.flags || typeof G.state.flags !== 'object' || Array.isArray(G.state.flags)) G.state.flags = {};
  if (!G.state.perks || typeof G.state.perks !== 'object' || Array.isArray(G.state.perks)) G.state.perks = {};
  if (!G.state.encounters || typeof G.state.encounters !== 'object' || Array.isArray(G.state.encounters)) {
    G.state.encounters = {};
  }
  if (!G.state.encounters.seen || typeof G.state.encounters.seen !== 'object' || Array.isArray(G.state.encounters.seen)) {
    G.state.encounters.seen = {};
  }
  if (typeof EquipmentSystem !== 'undefined' && EquipmentSystem.normalize) EquipmentSystem.normalize();
  if (G.state.challenge != null) {
    const c = parseFloat(G.state.challenge);
    G.state.challenge = isFinite(c) ? Math.max(0.6, Math.min(1.5, c)) : 1.0;
  }
  const numericFields = ['gold', 'karma', 'divineFragments', 'prana', 'cultivationBase',
                         'trialBest', 'tournamentWins', 'rebirthCount', 'ashramLevel', 'fishCaught'];
  for (const field of numericFields) {
    if (G.state[field] != null) {
      const n = parseFloat(G.state[field]);
      G.state[field] = isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    }
  }
  // Welcome gift: one-time gold grant for every save (existing included).
  // Tune via WELCOME_GOLD in game.js; flagged so it never grants twice.
  var welcomeGold = (typeof WELCOME_GOLD !== 'undefined' && isFinite(WELCOME_GOLD)) ? Math.max(0, Math.floor(WELCOME_GOLD)) : 0;
  if (welcomeGold > 0 && G.state.flags && !G.state.flags.welcomeGold) {
    const base = (G.state.gold != null && isFinite(G.state.gold)) ? Math.floor(G.state.gold) : 0;
    G.state.gold = Math.max(0, base) + welcomeGold;
    G.state.flags.welcomeGold = true;
  }
  if (typeof ZoneRewardSystem !== 'undefined' && ZoneRewardSystem.normalize) {
    ZoneRewardSystem.normalize();
  }
  if (typeof WorldState !== 'undefined' && WorldState.normalize) {
    G.state.world = WorldState.normalize(G.state.world);
  } else {
    G.state.world = G.createDefaultState().world;
  }
  if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.normalize === 'function') {
    G.state.affinity = BondSystem.normalize(G.state.affinity);
  } else {
    const fallbackUnsafe = { '__proto__': true, constructor: true, prototype: true };
    const out = {};
    const candidate = G.state.affinity;
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const ids = (typeof HERO_IDS !== 'undefined' && Array.isArray(HERO_IDS)) ? HERO_IDS : null;
      const allowed = ids ? {} : null;
      if (allowed) {
        for (const id of ids) {
          if (typeof id === 'string') allowed[id] = true;
        }
      }
      for (const key of Object.keys(candidate)) {
        if (typeof key !== 'string' || key.length === 0 || fallbackUnsafe[key]) continue;
        if (allowed && !allowed[key]) continue;
        const n = Number(candidate[key]);
        out[key] = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.floor(n))) : 0;
      }
    }
    G.state.affinity = out;
  }
  // Phase 24 combat bonds: linger flags persist in flags; heal crafted or
  // stale bond_linger_* values while leaving all other flags verbatim.
  if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.normalizeLinger === 'function') {
    G.state.flags = BondSystem.normalizeLinger(G.state.flags);
  }
  // Phase 25 signature combos: combo_* unlock flags persist in flags; heal
  // crafted or stale combo_* values while leaving all other flags verbatim.
  if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.normalizeCombo === 'function') {
    G.state.flags = BondSystem.normalizeCombo(G.state.flags);
  }
  // Phase 29 hero gifts: gift_* pair counts + giftweek_/gifttotal_ weekly
  // totals persist in flags; heal crafted or stale values while leaving all
  // other flags verbatim.
  if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.normalizeGifts === 'function') {
    G.state.flags = BondSystem.normalizeGifts(G.state.flags);
  }
  // Phase 26 beast hearts: beastBond persists under versioning; heal crafted
  // or stale values while leaving all other state verbatim.
  if (typeof BeastBond !== 'undefined' && BeastBond && typeof BeastBond.normalize === 'function') {
    G.state.beastBond = BeastBond.normalize(G.state.beastBond);
  } else {
    const bbUnsafe = { '__proto__': true, constructor: true, prototype: true };
    const bbOut = { xp: {}, feed: { day: 0, counts: {} }, train: { day: 0, counts: {} }, trainCd: {} };
    const bbCand = G.state.beastBond;
    if (bbCand && typeof bbCand === 'object' && !Array.isArray(bbCand) && bbCand.xp && typeof bbCand.xp === 'object' && !Array.isArray(bbCand.xp)) {
      const ids = (typeof SPIRIT_BEASTS !== 'undefined' && SPIRIT_BEASTS && typeof SPIRIT_BEASTS === 'object') ? SPIRIT_BEASTS : null;
      for (const key of Object.keys(bbCand.xp)) {
        if (typeof key !== 'string' || key.length === 0 || bbUnsafe[key]) continue;
        if (ids && !Object.prototype.hasOwnProperty.call(ids, key)) continue;
        const n = Math.floor(Number(bbCand.xp[key]));
        bbOut.xp[key] = Number.isFinite(n) ? Math.max(0, Math.min(9999, n)) : 0;
      }
    }
    G.state.beastBond = bbOut;
  }
  if (typeof FarmSystem !== 'undefined' && FarmSystem.normalize) FarmSystem.normalize();
  const party = Array.isArray(G.state.party) ? G.state.party : [];
  if (party.length > 0) {
    const playerId = G.state.player && G.state.player.id;
    G.state.player = party.find(hero => playerId != null && hero && hero.id === playerId) || party[0];
  } else {
    G.state.player = null;
  }
};

SaveSystem.load = function() {
  try {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== 1) return false;
    const now = Date.now();
    const elapsed = data.timestamp ? Math.max(0, Math.min((now - data.timestamp) / 1000, 28800)) : 0;
    if (!this.hydrate(data.state)) return false;
    // Restore the user's text-size preference with the loaded save.
    if (typeof R !== 'undefined' && R.applyFontScale) R.applyFontScale(G.state.uiFontScale || 1);
    const farmResult = typeof FarmSystem !== 'undefined' && FarmSystem.tick
      ? FarmSystem.tick(elapsed, { notify: false, save: false })
      : { changed: false, harvested: 0, ready: 0 };
    const worldEventsChanged = typeof WorldEvents !== 'undefined' && WorldEvents.tick
      ? WorldEvents.tick(elapsed)
      : false;
    if (elapsed > 60) {
      const cultPerSec = getCultivationPerSecond(G.state.ashramLevel || 1);
      const pranaPerSec = getPranaPerSecond(G.state.ashramLevel || 1);
      const cultGain = Math.floor(elapsed * cultPerSec);
      const pranaGain = Math.floor(elapsed * pranaPerSec);
      G.state.cultivationBase = (G.state.cultivationBase || 0) + cultGain;
      G.state.prana = (G.state.prana || 0) + pranaGain;
      let awayMsg = 'While you were away: +' + cultGain + ' cultivation, +' + pranaGain + ' prana';
      if (farmResult.harvested > 0) awayMsg += ', harvested ' + farmResult.harvested + ' herb' + (farmResult.harvested > 1 ? 's' : '');
      if (farmResult.ready > 0) awayMsg += ', ' + farmResult.ready + ' plot' + (farmResult.ready > 1 ? 's' : '') + ' ready to replant';
      Notify.show(awayMsg, 5, R.colors.gold);
    }
    if (farmResult.changed || worldEventsChanged) this.save();
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
};

// Download the current save as a JSON file (manual backup).
SaveSystem.exportFile = function() {
  try {
    if (typeof ZoneRewardSystem !== 'undefined' && ZoneRewardSystem.normalize) {
      ZoneRewardSystem.normalize();
    }
    const data = JSON.stringify({
      state: (function() {
        const snap = JSON.parse(JSON.stringify(G.state));
        if (snap && snap.diagnostics) delete snap.diagnostics;
        return snap;
      })(),
      version: 1,
      timestamp: Date.now()
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mythika-save.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    return true;
  } catch (e) {
    console.warn('Export failed:', e);
    return false;
  }
};

// Restore from a previously exported JSON file. cb(ok, message).
SaveSystem.importFile = function(file, cb) {
  if (!file) { cb(false, 'No file chosen'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || data.version !== 1 || !data.state) { cb(false, 'Invalid save file'); return; }
      if (!Array.isArray(data.state.party) || !data.state.party.length) { cb(false, 'Save missing party data'); return; }
      if (!this.hydrate(data.state)) { cb(false, 'Invalid save file'); return; }
      // Mirror load(): imported saves may carry a text-size preference.
      if (typeof R !== 'undefined' && R.applyFontScale) R.applyFontScale(G.state.uiFontScale || 1);
      cb(true, 'Save imported!');
    } catch (e) {
      cb(false, 'Corrupted save file');
    }
  };
  reader.onerror = () => cb(false, 'Could not read file');
  reader.readAsText(file);
};

SaveSystem.delete = function() {
  try {
    localStorage.removeItem(this.SAVE_KEY);
    return true;
  } catch (e) {
    return false;
  }
};

SaveSystem.hasSave = function() {
  return localStorage.getItem(this.SAVE_KEY) !== null;
};

SaveSystem.startAutoSave = function() {
  this.stopAutoSave();
  this._timer = setInterval(() => this.save(), this.autoSaveInterval);
  // Also sync to cloud on first auto-save if user is signed in
  if (typeof Auth !== 'undefined' && Auth.user && window.firebaseAuth && window.firebaseDb) {
    Auth.saveToCloud(G.state).catch(function() {});
  }
};

SaveSystem.stopAutoSave = function() {
  if (this._timer) {
    clearInterval(this._timer);
    this._timer = null;
  }
};

SaveSystem.getSaveInfo = function() {
  try {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      gold: data.state.gold || 0,
      realm: data.state.realm || 'manushya',
      partySize: (data.state.party || []).length,
      timestamp: data.timestamp || 0,
      playTime: data.state.totalPlayTime || 0
    };
  } catch (e) {
    return null;
  }
};

SaveSystem.cloudSave = async function() {
  if (typeof Auth !== 'undefined' && Auth.user && window.firebaseAuth && window.firebaseDb) {
    try {
      const result = await Auth.saveToCloud(G.state);
      if (result.success) {
        Notify.show('Saved to cloud', 2, R.colors.green);
      } else {
        Notify.show('Cloud save failed: ' + result.error, 3, R.colors.red);
      }
    } catch (e) {
      Notify.show('Cloud save failed: ' + e.message, 3, R.colors.red);
    }
  }
};

SaveSystem.cloudLoad = async function() {
  if (typeof Auth !== 'undefined' && Auth.user && window.firebaseAuth && window.firebaseDb) {
    try {
      const result = await Auth.loadFromCloud();
      if (result.data) {
        if (!this.hydrate(result.data)) return false;
        Notify.show('Cloud save loaded', 2, R.colors.green);
        return true;
      }
    } catch (e) {
      Notify.show('Cloud load failed: ' + e.message, 3, R.colors.red);
    }
  }
  return false;
};
