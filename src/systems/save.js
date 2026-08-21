const SaveSystem = {
  SAVE_KEY: 'mythika_save',
  autoSaveInterval: 30000,
  _timer: null
};

SaveSystem.save = function() {
  try {
    const data = {
      state: JSON.parse(JSON.stringify(G.state)),
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

SaveSystem.migrate = function() {
  // Heal saves created before the object-based gear model:
  // - inventory entries must be real objects with a name
  // - gear slots must be objects or null (legacy strings are dropped)
  // - challenge must be a finite number
  if (Array.isArray(G.state.inventory)) {
    G.state.inventory = G.state.inventory.filter(i => typeof i === 'object' && i !== null && i.name);
  }
  const gearSlots = ['weaponEquipped', 'armorEquipped', 'accessoryEquipped'];
  for (const hero of G.state.party || []) {
    for (const slot of gearSlots) {
      if (typeof hero[slot] === 'string') hero[slot] = null;
    }
  }
  if (G.state.challenge != null) {
    const c = parseFloat(G.state.challenge);
    G.state.challenge = isFinite(c) ? Math.max(0.6, Math.min(1.5, c)) : 1.0;
  }
};

SaveSystem.load = function() {
  try {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== 1) return false;
    const now = Date.now();
    const elapsed = data.timestamp ? Math.min((now - data.timestamp) / 1000, 28800) : 0;
    Object.assign(G.state, data.state);
    this.migrate();
    if (elapsed > 60) {
      const cultPerSec = getCultivationPerSecond(G.state.ashramLevel || 1);
      const pranaPerSec = getPranaPerSecond(G.state.ashramLevel || 1);
      const cultGain = Math.floor(elapsed * cultPerSec);
      const pranaGain = Math.floor(elapsed * pranaPerSec);
      G.state.cultivationBase = (G.state.cultivationBase || 0) + cultGain;
      G.state.prana = (G.state.prana || 0) + pranaGain;
      Notify.show('While you were away: +' + cultGain + ' cultivation, +' + pranaGain + ' prana', 5, R.colors.gold);
    }
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
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
