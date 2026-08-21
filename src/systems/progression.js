const Progression = {};

Progression.addXP = function(hero, amount) {
  hero.xp = (hero.xp || 0) + amount;
  const needed = Progression.xpForLevel(hero.level);
  let leveled = false;
  while (hero.xp >= needed && hero.level < 50) {
    hero.xp -= needed;
    hero.level++;
    Progression.applyLevelUp(hero);
    leveled = true;
  }
  if (hero.xp >= needed && hero.level >= 50) hero.xp = needed - 1;
  return leveled;
};

Progression.xpForLevel = function(lvl) {
  if (lvl <= 1) return 40;
  if (lvl <= 10) return Math.floor(45 * Math.pow(lvl, 1.2));
  if (lvl <= 20) return Math.floor(65 * Math.pow(lvl, 1.4));
  if (lvl <= 30) return Math.floor(100 * Math.pow(lvl, 1.5));
  return Math.floor(180 * Math.pow(lvl, 1.55));
};

Progression.getChallenge = function() {
  if (G.state.challenge == null) {
    const map = { normal: 1.0, hard: 1.25, nightmare: 1.5, mythic: 1.75 };
    G.state.challenge = (G.state.difficulty && map[G.state.difficulty]) || 1.0;
    delete G.state.difficulty;
  }
  return G.state.challenge;
};

Progression.adjustChallenge = function(r) {
  const cur = this.getChallenge();
  let delta;
  if (!r.won) delta = -0.15;
  else if (r.hpPct >= 0.7 && r.turnsPerEnemy <= 5) delta = 0.08;
  else if (r.hpPct >= 0.4) delta = 0.02;
  else delta = -0.04;
  G.state.challenge = Math.max(0.6, Math.min(1.5, cur + delta));
};

Progression.getZoneDifficulty = function(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone) return 1.0;
  const baseLevel = zone.reqLevel || 1;
  const playerLevel = G.state.player ? G.state.player.level : 1;
  const levelDiff = playerLevel - baseLevel;
  if (levelDiff > 10) return 0.7;
  if (levelDiff > 5) return 0.85;
  if (levelDiff < -5) return 1.3;
  if (levelDiff < -10) return 1.5;
  return 1.0;
};

Progression.applyDifficulty = function(enemies) {
  const challenge = this.getChallenge();
  const zoneDiff = this.getZoneDifficulty(G.state.currentZone);
  const rewardMul = (1 + (challenge - 1) * 0.5) * (1 + (zoneDiff - 1) * 0.3);

  for (const e of enemies) {
    e.maxHp = Math.floor(e.maxHp * challenge * zoneDiff);
    e.hp = e.maxHp;
    e.str = Math.floor(e.str * challenge * zoneDiff);
    e.mag = Math.floor(e.mag * challenge * zoneDiff);
    e.def = Math.floor(e.def * (0.8 + zoneDiff * 0.2));
    e.xp = Math.floor(e.xp * rewardMul);
    e.gold = Math.floor(e.gold * rewardMul);
  }
  return enemies;
};

Progression.getLootBonus = function() {
  return 1 + (this.getChallenge() - 1) * 0.75;
};

Progression.applyLevelUp = function(hero) {
  const base = HEROES[hero.id];
  hero.maxHp += Math.floor(base.hp * 0.08);
  hero.hp = hero.maxHp;
  hero.maxMp += Math.floor(base.mp * 0.06);
  hero.mp = hero.maxMp;
  hero.str += Math.floor(base.str * 0.08);
  hero.agi += Math.floor(base.agi * 0.06);
  hero.mag += Math.floor(base.mag * 0.07);
  hero.def += Math.floor(base.def * 0.07);
  hero.skillPoints = (hero.skillPoints || 0) + 1;
  R.triggerLevelUp();
  Audio.levelUp();
};

Progression.addPartyXP = function(amount) {
  let leveled = false;
  if (G.state.xpBuff) amount = Math.floor(amount * G.state.xpBuff);
  for (const h of G.state.party) {
    if (h.active && h.hp > 0 && Progression.addXP(h, amount)) leveled = true;
  }
  return leveled;
};

Progression.getHeroStats = function(hero) {
  return calcHeroStats(hero);
};

Progression.createEliteVariant = function(enemy) {
  const prefixes = ['Elder', 'Ancient', 'Corrupted', 'Frenzied', 'Blessed'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const mul = 1.5 + Math.random() * 0.3;
  return {
    ...enemy,
    name: prefix + ' ' + enemy.name,
    maxHp: Math.floor(enemy.maxHp * mul),
    hp: Math.floor(enemy.hp * mul),
    str: Math.floor(enemy.str * mul),
    mag: Math.floor(enemy.mag * mul),
    def: Math.floor(enemy.def * mul),
    xp: Math.floor(enemy.xp * mul * 1.5),
    gold: Math.floor(enemy.gold * mul * 1.5),
    isElite: true
  };
};
