const CultivationSystem = {};

CultivationSystem.getRealmData = function() {
  const idx = getRealmIndex(G.state.realm);
  return REALMS[idx] || REALMS[0];
};

CultivationSystem.addCultivationBase = function(amount) {
  G.state.cultivationBase = (G.state.cultivationBase || 0) + amount;
};

CultivationSystem.addPrana = function(amount) {
  G.state.prana = (G.state.prana || 0) + amount;
};

CultivationSystem.getCultivationPerSecond = function() {
  const base = getCultivationPerSecond(G.state.ashramLevel || 1);
  const hero = (G.state.party || [])[0];
  const accMag = hero && hero.accessoryEquipped && hero.accessoryEquipped.mag ? hero.accessoryEquipped.mag * 0.5 : 0;
  let cultPerSec = base + accMag;
  const activeBeast = (G.state.spiritBeasts || []).find(b => b.id === G.state.activeBeast);
  if (activeBeast) {
    const bonus = activeBeast.level * 0.1;
    cultPerSec += bonus;
  }
  return cultPerSec;
};

CultivationSystem.getPranaPerSecond = function() {
  const base = getPranaPerSecond(G.state.ashramLevel || 1);
  const hero = (G.state.party || [])[0];
  const accMag = hero && hero.accessoryEquipped && hero.accessoryEquipped.mag ? hero.accessoryEquipped.mag * 0.3 : 0;
  let pranaPerSec = base + accMag;
  const activeBeast = (G.state.spiritBeasts || []).find(b => b.id === G.state.activeBeast);
  if (activeBeast) {
    const bonus = activeBeast.level * 0.1;
    pranaPerSec += bonus * 0.5;
  }
  return pranaPerSec;
};

CultivationSystem.tick = function(dt) {
  const cpRate = this.getCultivationPerSecond();
  this.addCultivationBase(cpRate * dt);
  const pranaRate = this.getPranaPerSecond();
  this.addPrana(pranaRate * dt);
};

CultivationSystem.canBreakthrough = function() {
  const realm = this.getRealmData();
  const needed = getCultivationForLevel(getRealmIndex(G.state.realm) + 1);
  return (G.state.cultivationBase || 0) >= needed;
};

CultivationSystem.getBreakthroughStats = function(realmIdx) {
  const boosts = [
    { hp: 2, str: 1, def: 1 },
    { hp: 3, str: 1, agi: 1, def: 1 },
    { hp: 5, str: 2, agi: 1, mag: 1, def: 1 },
    { hp: 8, str: 2, agi: 2, mag: 2, def: 2 },
    { hp: 12, str: 3, agi: 3, mag: 3, def: 3 }
  ];
  return boosts[Math.min(realmIdx, boosts.length - 1)] || boosts[0];
};

CultivationSystem.attemptBreakthrough = function() {
  if (!this.canBreakthrough()) return { success: false, reason: 'Not enough cultivation base' };
  const realm = this.getRealmData();
  const needed = getCultivationForLevel(getRealmIndex(G.state.realm) + 1);
  const tribBonus = (G.state.flags && G.state.flags.tribulationBonus) || 0;
  const baseChance = 0.4 + (G.state.ashramLevel || 1) * 0.05 + tribBonus / 100;
  const success = Math.random() < Math.min(0.9, baseChance);
  if (success) {
    G.state.cultivationBase -= needed;
    G.state.realmStage++;
    if (G.state.realmStage > realm.stages) {
      G.state.realmStage = 1;
      const nextIdx = getRealmIndex(G.state.realm) + 1;
      if (nextIdx < REALMS.length) {
        G.state.realm = REALMS[nextIdx].id;
        QuestSystem.trackRealm(G.state.realm);
        if (G.state.realm === 'paramukta') {
          try { JourneySystem.start('paramuktaPilgrimage'); Notify.show('New Journey: Pilgrimage Beyond Mukta!', 3, R.colors.gold); } catch(e) {}
        }
      }
    }
    const realmIdx = getRealmIndex(G.state.realm);
    const stats = this.getBreakthroughStats(realmIdx);
    let bonusText = '';
    for (const hero of G.state.party) {
      hero.maxHp += stats.hp;
      hero.hp = Math.min(hero.hp + stats.hp, hero.maxHp);
      hero.str += stats.str || 0;
      hero.agi += stats.agi || 0;
      hero.mag += stats.mag || 0;
      hero.def += stats.def || 0;
    }
    bonusText = ' +' + stats.hp + 'HP';
    if (stats.str) bonusText += ' +' + stats.str + 'STR';
    if (stats.agi) bonusText += ' +' + stats.agi + 'AGI';
    if (stats.mag) bonusText += ' +' + stats.mag + 'MAG';
    if (stats.def) bonusText += ' +' + stats.def + 'DEF';
    const xpGain = 10 + realmIdx * 15;
    const leveled = Progression.addPartyXP(xpGain);
    if (leveled) bonusText += ' LVL UP!';
    AchievementSystem.check();
    Audio.levelUp();
    return { success: true, bonusText: bonusText };
  } else {
    G.state.cultivationBase = Math.max(0, G.state.cultivationBase - Math.floor(needed * 0.2));
    Audio.error();
    return { success: false, reason: 'Breakthrough failed! Lost some cultivation base.' };
  }
};

CultivationSystem.getRealmProgress = function() {
  const realm = this.getRealmData();
  const needed = getCultivationForLevel(getRealmIndex(G.state.realm) + 1);
  const current = G.state.cultivationBase || 0;
  return { current, needed, progress: needed > 0 ? Math.min(1, current / needed) : 0 };
};
