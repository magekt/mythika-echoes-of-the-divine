const Economy = {};

Economy.addGold = function(amount) {
  G.state.gold = Math.max(0, (G.state.gold || 0) + amount);
};

Economy.spendGold = function(amount) {
  if ((G.state.gold || 0) < amount) return false;
  G.state.gold -= amount;
  return true;
};

// spendGold with the standard "Not enough gold!" toast on failure.
Economy.spendGoldOrNotify = function(amount) {
  if (this.spendGold(amount)) return true;
  Notify.show('Not enough gold! Need ' + amount + 'g', 2, R.colors.red);
  return false;
};

Economy.addKarma = function(amount) {
  G.state.karma = (G.state.karma || 0) + amount;
};

Economy.spendKarma = function(amount) {
  if ((G.state.karma || 0) < amount) return false;
  G.state.karma -= amount;
  return true;
};

Economy.addDivineFragments = function(amount) {
  G.state.divineFragments = Math.max(0, (G.state.divineFragments || 0) + amount);
};

Economy.spendDivineFragments = function(amount) {
  if ((G.state.divineFragments || 0) < amount) return false;
  G.state.divineFragments -= amount;
  return true;
};

Economy.addItem = function(item) {
  if (!G.state.inventory) G.state.inventory = [];
  if (item.type === 'consumable') {
    const existing = G.state.inventory.find(i => i.name === item.name && i.type === 'consumable');
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
      if (typeof QuestSystem !== 'undefined' && QuestSystem.trackCollect) QuestSystem.trackCollect(item.name, 1);
      return;
    }
  }
  if (item.type === 'herb' && item.name) {
    // Herbs also stack like consumables for cleaner inventory
    const existingHerb = G.state.inventory.find(i => i.name === item.name && i.type === 'herb');
    if (existingHerb) {
      existingHerb.qty = (existingHerb.qty || 1) + (item.qty || 1);
      if (typeof QuestSystem !== 'undefined' && QuestSystem.trackCollect) QuestSystem.trackCollect(item.name, item.qty || 1);
      return;
    }
  }
  item.qty = item.qty || 1;
  G.state.inventory.push(item);
  if (item.name && typeof QuestSystem !== 'undefined' && QuestSystem.trackCollect) QuestSystem.trackCollect(item.name, item.qty || 1);
};

Economy.removeItem = function(index) {
  if (!G.state.inventory || index < 0 || index >= G.state.inventory.length) return false;
  const item = G.state.inventory[index];
  if (item.type === 'consumable' && item.qty > 1) {
    item.qty--;
    return true;
  }
  G.state.inventory.splice(index, 1);
  return true;
};

Economy.removeItemByName = function(itemName, qty) {
  qty = qty || 1;
  if (!G.state.inventory) return false;
  for (let i = G.state.inventory.length - 1; i >= 0 && qty > 0; i--) {
    const item = G.state.inventory[i];
    if (item.name === itemName) {
      if (item.qty && item.qty > 1) {
        const removed = Math.min(item.qty, qty);
        item.qty -= removed;
        qty -= removed;
      } else {
        G.state.inventory.splice(i, 1);
        qty--;
      }
    }
  }
  return qty <= 0;
};

Economy.hasItem = function(itemName) {
  return (G.state.inventory || []).some(i => i.name === itemName);
};

Economy.getItemCount = function(itemName) {
  let count = 0;
  for (const i of (G.state.inventory || [])) {
    if (i.name === itemName) count += i.qty || 1;
  }
  return count;
};
