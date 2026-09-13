const ZoneRewardSystem = {
  _pending: null
};

ZoneRewardSystem._number = function(value, fallback) {
  const n = Number(value);
  return isFinite(n) ? n : fallback;
};

ZoneRewardSystem._clampPercentage = function(value) {
  return Math.floor(Math.max(0, Math.min(100, this._number(value, 0))));
};

ZoneRewardSystem._emptyLedger = function(progress, legacy) {
  return {
    claimedPercentage: legacy ? progress : 0,
    completionClaimed: legacy ? progress >= 100 : false
  };
};

ZoneRewardSystem.normalize = function() {
  if (!G.state.zoneProgress || typeof G.state.zoneProgress !== 'object' || Array.isArray(G.state.zoneProgress)) {
    G.state.zoneProgress = {};
  }
  if (!G.state.zoneRewardLedger || typeof G.state.zoneRewardLedger !== 'object' || Array.isArray(G.state.zoneRewardLedger)) {
    G.state.zoneRewardLedger = {};
  }

  for (const zoneId of Object.keys(G.state.zoneProgress)) {
    G.state.zoneProgress[zoneId] = this._clampPercentage(G.state.zoneProgress[zoneId]);
  }

  const zoneIds = typeof ZONES !== 'undefined' ? Object.keys(ZONES) : Object.keys(G.state.zoneProgress);
  for (const zoneId of zoneIds) {
    const progress = this._clampPercentage(G.state.zoneProgress[zoneId]);
    G.state.zoneProgress[zoneId] = progress;
    const raw = G.state.zoneRewardLedger[zoneId];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      // Saves without a ledger already earned their visible progress.
      G.state.zoneRewardLedger[zoneId] = this._emptyLedger(progress, true);
      continue;
    }

    const claimed = Number(raw.claimedPercentage);
    if (raw.claimedPercentage == null || raw.claimedPercentage === '' || !isFinite(claimed)) {
      // A malformed ledger is treated like a legacy save to prevent a windfall.
      raw.claimedPercentage = progress;
      raw.completionClaimed = progress >= 100;
      continue;
    }
    raw.claimedPercentage = Math.max(0, Math.min(100, Math.floor(claimed)));
    if (raw.claimedPercentage > progress) raw.claimedPercentage = progress;
    raw.completionClaimed = raw.completionClaimed === true;
  }
  return G.state.zoneRewardLedger;
};

ZoneRewardSystem.normalizeState = ZoneRewardSystem.normalize;

ZoneRewardSystem.getLedger = function(zoneId) {
  this.normalize();
  return G.state.zoneRewardLedger[zoneId];
};

ZoneRewardSystem._getReward = function(zoneId, kind) {
  const zone = typeof ZONES !== 'undefined' && ZONES[zoneId];
  const rewards = zone && zone.rewards && zone.rewards[kind];
  return rewards && typeof rewards === 'object' ? rewards : {};
};

ZoneRewardSystem._addRewardTotals = function(target, reward, multiplier) {
  for (const key of ['hp', 'str', 'agi', 'mag', 'def', 'gold', 'karma']) {
    const amount = this._number(reward[key], 0) * multiplier;
    if (amount) target[key] = (target[key] || 0) + amount;
  }
};

ZoneRewardSystem._applyReward = function(reward) {
  const stats = {};
  const hp = this._number(reward.hp, 0);
  for (const hero of G.state.party || []) {
    if (hp) {
      hero.maxHp = this._number(hero.maxHp, 0) + hp;
      hero.hp = Math.min(this._number(hero.hp, 0) + hp, hero.maxHp);
    }
    for (const key of ['str', 'agi', 'mag', 'def']) {
      const amount = this._number(reward[key], 0);
      if (amount) hero[key] = this._number(hero[key], 0) + amount;
    }
  }
  for (const key of ['hp', 'str', 'agi', 'mag', 'def']) {
    const amount = this._number(reward[key], 0);
    if (amount) stats[key] = amount;
  }
  if (reward.gold) {
    if (typeof Economy !== 'undefined' && Economy.addGold) Economy.addGold(reward.gold);
    else G.state.gold = this._number(G.state.gold, 0) + reward.gold;
  }
  if (reward.karma) {
    if (typeof Economy !== 'undefined' && Economy.addKarma) Economy.addKarma(reward.karma);
    else G.state.karma = this._number(G.state.karma, 0) + reward.karma;
  }
  return { stats: stats, gold: reward.gold || 0, karma: reward.karma || 0 };
};

ZoneRewardSystem._formatReward = function(label, reward) {
  const parts = [];
  for (const key of ['hp', 'str', 'agi', 'mag', 'def']) {
    if (reward.stats && reward.stats[key]) parts.push('+' + reward.stats[key] + key.toUpperCase());
  }
  if (reward.gold) parts.push('+' + reward.gold + ' Gold');
  if (reward.karma) parts.push('+' + reward.karma + ' Karma');
  return parts.length ? label + ': ' + parts.join(', ') : '';
};

ZoneRewardSystem._commitTo = function(zoneId, targetProgress) {
  this.normalize();
  if (!ZONES[zoneId]) return { zoneId: zoneId, changed: false, messages: [] };
  const ledger = G.state.zoneRewardLedger[zoneId];
  const previousProgress = this._clampPercentage(G.state.zoneProgress[zoneId]);
  const progress = Math.max(previousProgress, this._clampPercentage(targetProgress));
  G.state.zoneProgress[zoneId] = progress;

  const result = {
    zoneId: zoneId,
    previousProgress: previousProgress,
    progress: progress,
    claimedPercentage: ledger.claimedPercentage,
    crossedPercentage: 0,
    percentageReward: { stats: {} },
    completionReward: null,
    changed: false,
    messages: []
  };
  const firstUnclaimed = ledger.claimedPercentage + 1;
  if (progress >= firstUnclaimed) {
    const crossed = progress - ledger.claimedPercentage;
    const percentageReward = {};
    this._addRewardTotals(percentageReward, this._getReward(zoneId, 'percentage'), crossed);
    const applied = this._applyReward(percentageReward);
    ledger.claimedPercentage = Math.floor(progress);
    result.claimedPercentage = ledger.claimedPercentage;
    result.crossedPercentage = crossed;
    result.percentageReward = applied;
    result.changed = crossed > 0;
    result.messages.push('Zone progress +' + crossed + '%');
    const percentageMessage = this._formatReward('Progress reward', applied);
    if (percentageMessage) result.messages.push(percentageMessage);
  }

  if (progress >= 100 && !ledger.completionClaimed) {
    const appliedCompletion = this._applyReward(this._getReward(zoneId, 'completion'));
    ledger.completionClaimed = true;
    result.completionReward = appliedCompletion;
    result.changed = true;
    result.messages.push('Zone complete!');
    const completionMessage = this._formatReward('Completion reward', appliedCompletion);
    if (completionMessage) result.messages.push(completionMessage);
  }
  return result;
};

ZoneRewardSystem.commitProgress = function(zoneId, targetProgress) {
  return this._commitTo(zoneId, targetProgress);
};

ZoneRewardSystem.commitPercentage = ZoneRewardSystem.commitProgress;

ZoneRewardSystem.beginPending = function(zoneId, amount) {
  if (!zoneId || !ZONES[zoneId]) return false;
  this.normalize();
  const gain = Math.max(0, this._number(amount, 0));
  this._pending = { zoneId: zoneId, amount: gain };
  return true;
};

ZoneRewardSystem.setPendingProgress = ZoneRewardSystem.beginPending;
ZoneRewardSystem.startPending = ZoneRewardSystem.beginPending;

ZoneRewardSystem.clearPending = function() {
  this._pending = null;
};

ZoneRewardSystem.commitPendingProgress = function() {
  const pending = this._pending;
  this._pending = null;
  if (!pending) return { changed: false, messages: [] };
  return this._commitTo(pending.zoneId, (G.state.zoneProgress[pending.zoneId] || 0) + pending.amount);
};

ZoneRewardSystem.commitPending = ZoneRewardSystem.commitPendingProgress;

ZoneRewardSystem.completeZone = function(zoneId) {
  return this._commitTo(zoneId, 100);
};

ZoneRewardSystem.complete = ZoneRewardSystem.completeZone;
