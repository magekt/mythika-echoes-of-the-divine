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

SaveSystem.load = function() {
  try {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== 1) return false;
    const now = Date.now();
    const elapsed = data.timestamp ? Math.min((now - data.timestamp) / 1000, 28800) : 0;
    Object.assign(G.state, data.state);
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
