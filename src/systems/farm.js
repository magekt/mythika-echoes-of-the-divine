const FarmSystem = {};

FarmSystem._newPlot = function() {
  return { herb: null, growTimer: 0, harvested: false, readyForReplant: false };
};

FarmSystem.normalizePlot = function(plot) {
  if (!plot || typeof plot !== 'object') return this._newPlot();
  if (!plot.herb || typeof HERB_GROWTH === 'undefined' || !HERB_GROWTH[plot.herb]) {
    plot.herb = null;
    plot.growTimer = 0;
    plot.harvested = false;
    plot.readyForReplant = false;
    return plot;
  }
  const herb = HERB_GROWTH[plot.herb];
  const timer = Number(plot.growTimer);
  plot.growTimer = isFinite(timer) ? Math.max(0, Math.min(herb.growTime, timer)) : 0;
  plot.harvested = !!plot.harvested;
  plot.readyForReplant = !!plot.readyForReplant;
  return plot;
};

FarmSystem.normalize = function() {
  if (!Array.isArray(G.state.farmPlots)) G.state.farmPlots = [];
  for (let i = 0; i < G.state.farmPlots.length; i++) {
    G.state.farmPlots[i] = this.normalizePlot(G.state.farmPlots[i]);
  }
  return G.state.farmPlots;
};

FarmSystem.ensurePlots = function(count) {
  this.normalize();
  while (G.state.farmPlots.length < count) G.state.farmPlots.push(this._newPlot());
  return G.state.farmPlots;
};

FarmSystem._save = function() {
  if (typeof SaveSystem !== 'undefined' && SaveSystem.save) SaveSystem.save();
};

FarmSystem._replant = function(plot, herbData) {
  const cost = Math.max(0, Number(herbData.buyCost) || 0);
  if ((G.state.gold || 0) < cost) return false;
  if (cost > 0 && !Economy.spendGold(cost)) return false;
  plot.growTimer = 0;
  plot.harvested = false;
  plot.readyForReplant = false;
  return true;
};

FarmSystem._harvest = function(plot, herbData) {
  if (!Array.isArray(G.state.inventory)) G.state.inventory = [];
  G.state.inventory = G.state.inventory.filter(item => item && typeof item === 'object');
  Economy.addItem({
    name: herbData.name,
    type: 'herb',
    herbId: plot.herb,
    desc: herbData.name + ' herb'
  });
  if (typeof Progression !== 'undefined' && Array.isArray(G.state.party)) {
    try { Progression.addPartyXP(5); } catch (e) {}
  }
};

FarmSystem.plantPlot = function(plotIdx, herbId) {
  this.normalize();
  const plot = G.state.farmPlots[plotIdx];
  const herbData = typeof HERB_GROWTH !== 'undefined' && HERB_GROWTH[herbId];
  if (!plot || plot.herb || !herbData) return { success: false, reason: 'This plot is not available' };
  const cost = Math.max(0, Number(herbData.buyCost) || 0);
  if (cost > 0 && !Economy.spendGold(cost)) return { success: false, reason: 'Not enough gold! Need ' + cost + 'g' };
  plot.herb = herbId;
  plot.growTimer = 0;
  plot.harvested = false;
  plot.readyForReplant = false;
  this._save();
  return { success: true, herb: herbData };
};

FarmSystem.collectOrReplant = function(plotIdx) {
  this.normalize();
  const plot = G.state.farmPlots[plotIdx];
  if (!plot || !plot.herb || typeof HERB_GROWTH === 'undefined' || !HERB_GROWTH[plot.herb]) {
    return { success: false, reason: 'This plot is not ready' };
  }
  const herbData = HERB_GROWTH[plot.herb];
  if (plot.readyForReplant) {
    if (!this._replant(plot, herbData)) {
      return { success: false, reason: 'Not enough gold! Need ' + herbData.buyCost + 'g' };
    }
    this._save();
    return { success: true, action: 'replanted', herb: herbData };
  }
  if (!plot.harvested) return { success: false, reason: 'This crop is still growing' };

  // Legacy saves use harvested=true for a crop that has not been collected yet.
  this._harvest(plot, herbData);
  plot.herb = null;
  plot.growTimer = 0;
  plot.harvested = false;
  plot.readyForReplant = false;
  this._save();
  return { success: true, action: 'harvested', herb: herbData };
};

FarmSystem.tick = function(dt, options) {
  const opts = options || {};
  const seconds = Number(dt);
  const result = { changed: false, needsSave: false, harvested: 0, replanted: 0, ready: 0 };
  if (!isFinite(seconds) || seconds <= 0) return result;
  this.normalize();

  for (const plot of G.state.farmPlots) {
    if (!plot.herb || typeof HERB_GROWTH === 'undefined' || !HERB_GROWTH[plot.herb]) continue;
    const herbData = HERB_GROWTH[plot.herb];
    if (plot.harvested) {
      if (plot.readyForReplant && this._replant(plot, herbData)) {
        result.changed = true;
        result.needsSave = true;
        result.replanted++;
      } else if (plot.readyForReplant) {
        result.ready++;
      }
      if (plot.harvested) continue;
    }

    let remaining = seconds;
    let cycles = 0;
    while (remaining > 0 && plot.herb && !plot.harvested && cycles < 10000) {
      const timeLeft = Math.max(0, herbData.growTime - plot.growTimer);
      if (remaining < timeLeft) {
        plot.growTimer += remaining;
        result.changed = true;
        remaining = 0;
        break;
      }

      remaining = Math.max(0, remaining - timeLeft);
      plot.growTimer = herbData.growTime;
      this._harvest(plot, herbData);
      result.changed = true;
      result.needsSave = true;
      result.harvested++;
      cycles++;

      if (!this._replant(plot, herbData)) {
        plot.harvested = true;
        plot.readyForReplant = true;
        result.ready++;
        break;
      }
      result.replanted++;
    }
  }

  if (result.changed && opts.notify !== false && typeof Notify !== 'undefined') {
    if (result.harvested === 1) Notify.show('Crop harvested! +5 XP', 2);
    else if (result.harvested > 1) Notify.show(result.harvested + ' crops harvested! +5 XP each', 2);
  }
  if (result.needsSave && opts.save !== false) this._save();
  return result;
};
