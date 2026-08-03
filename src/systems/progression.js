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

Progression.difficultyModifiers = {
  normal: { xpMul: 1.0, goldMul: 1.0, enemyHpMul: 1.0, enemyDmgMul: 1.0, label: 'Normal' },
  hard:   { xpMul: 1.25, goldMul: 1.3, enemyHpMul: 1.35, enemyDmgMul: 1.25, label: 'Hard' },
  impossible: { xpMul: 1.5, goldMul: 1.6, enemyHpMul: 1.7, enemyDmgMul: 1.5, label: 'Impossible' }
};

Progression.applyDifficulty = function(enemies) {
  const mode = G.state.difficulty || 'normal';
  const mod = this.difficultyModifiers[mode];
  if (!mod || mode === 'normal') return enemies;
  for (const e of enemies) {
    e.maxHp = Math.floor(e.maxHp * mod.enemyHpMul);
    e.hp = e.maxHp;
    e.str = Math.floor(e.str * mod.enemyDmgMul);
    e.mag = Math.floor(e.mag * mod.enemyDmgMul);
    e.xp = Math.floor(e.xp * mod.xpMul);
    e.gold = Math.floor(e.gold * mod.goldMul);
  }
  return enemies;
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
