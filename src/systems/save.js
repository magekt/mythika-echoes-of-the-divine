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
  // - numeric fields must be finite numbers (crafted/corrupt files included)
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
  const numericFields = ['gold', 'karma', 'divineFragments', 'prana', 'cultivationBase',
                         'trialBest', 'tournamentWins', 'rebirthCount', 'ashramLevel', 'fishCaught'];
  for (const field of numericFields) {
    if (G.state[field] != null) {
      const n = parseFloat(G.state[field]);
      G.state[field] = isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    }
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
    // Restore the user's text-size preference with the loaded save.
    if (typeof R !== 'undefined' && R.applyFontScale) R.applyFontScale(G.state.uiFontScale || 1);
    if (elapsed > 60) {
      const cultPerSec = getCultivationPerSecond(G.state.ashramLevel || 1);
      const pranaPerSec = getPranaPerSecond(G.state.ashramLevel || 1);
      const cultGain = Math.floor(elapsed * cultPerSec);
      const pranaGain = Math.floor(elapsed * pranaPerSec);
      G.state.cultivationBase = (G.state.cultivationBase || 0) + cultGain;
      G.state.prana = (G.state.prana || 0) + pranaGain;
      // Offline farm: fast-forward each plot's growTimer so herbs can be
      // ready even when the farm scene was never active.
      let farmReady = 0;
      for (const plot of G.state.farmPlots || []) {
        if (plot.herb && !plot.harvested) {
          const herbData = (typeof HERB_GROWTH !== 'undefined' && HERB_GROWTH[plot.herb]) || null;
          if (herbData) {
            plot.growTimer = Math.min(herbData.growTime, (plot.growTimer || 0) + elapsed);
            if (plot.growTimer >= herbData.growTime) {
              plot.harvested = true;
              farmReady++;
            }
          }
        }
      }
      let awayMsg = 'While you were away: +' + cultGain + ' cultivation, +' + pranaGain + ' prana';
      if (farmReady > 0) awayMsg += ', ' + farmReady + ' herb' + (farmReady > 1 ? 's' : '') + ' ready';
      Notify.show(awayMsg, 5, R.colors.gold);
    }
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
};

// Download the current save as a JSON file (manual backup).
SaveSystem.exportFile = function() {
  try {
    const data = JSON.stringify({
      state: JSON.parse(JSON.stringify(G.state)),
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
      Object.assign(G.state, data.state);
      this.migrate();
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
