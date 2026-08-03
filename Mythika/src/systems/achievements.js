const AchievementSystem = {};

AchievementSystem.init = function() {
  if (!G.state.achievements) G.state.achievements = {};
  if (!G.state.flags) G.state.flags = {};
};

AchievementSystem.check = function(forceCheck) {
  this.init();
  let unlocked = false;
  for (const ach of ACHIEVEMENTS) {
    const prog = G.state.achievements[ach.id];
    if (prog && prog.unlocked) continue;
    if (ach.check()) {
      G.state.achievements[ach.id] = { unlocked: true, timestamp: Date.now() };
      Notify.achievement(ach.name, ach.desc, ach.icon);
      unlocked = true;
    }
  }
  return unlocked;
};

AchievementSystem.getAll = function() {
  this.init();
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    progress: G.state.achievements[ach.id] || { unlocked: false }
  }));
};

AchievementSystem.getUnlockedCount = function() {
  this.init();
  return Object.values(G.state.achievements).filter(a => a.unlocked).length;
};

AchievementSystem.getTotalCount = function() {
  return ACHIEVEMENTS.length;
};
