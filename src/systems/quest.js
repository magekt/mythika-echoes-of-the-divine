const QuestSystem = {};

QuestSystem.init = function() {
  if (!G.state.quests) G.state.quests = {};
};

QuestSystem.getQuests = function(zoneId) {
  this.init();
  const zoneQuests = getZoneQuests(zoneId);
  return zoneQuests.map(q => {
    const prog = G.state.quests[q.id] || { count: 0, completed: false, claimed: false };
    return { ...q, progress: prog };
  });
};

QuestSystem.getAvailableQuests = function(zoneId) {
  return this.getQuests(zoneId).filter(q => !q.progress.completed || !q.progress.claimed);
};

QuestSystem.getActiveQuestCount = function() {
  this.init();
  return Object.keys(G.state.quests).filter(id => {
    const q = G.state.quests[id];
    return q && !q.completed;
  }).length;
};

QuestSystem.trackKill = function(enemyId, zoneId) {
  this.init();
  const zoneQuests = getZoneQuests(zoneId);
  let anyCompleted = false;
  for (const q of zoneQuests) {
    if (q.type !== 'kill' && q.type !== 'boss') continue;
    if (q.target !== enemyId) continue;
    const prog = G.state.quests[q.id] || { count: 0, completed: false, claimed: false };
    if (prog.completed) continue;
    prog.count = (prog.count || 0) + 1;
    if (prog.count >= q.count) {
      prog.completed = true;
      anyCompleted = true;
      Notify.show('Quest complete: ' + q.name + '!', 3, R.colors.gold);
    }
    G.state.quests[q.id] = prog;
  }
  return anyCompleted;
};

QuestSystem.trackRealm = function(realmId) {
  this.init();
  const allQuests = getAllQuests();
  let anyCompleted = false;
  for (const q of allQuests) {
    if (q.type !== 'realm') continue;
    if (q.target !== realmId) continue;
    const prog = G.state.quests[q.id] || { count: 0, completed: false, claimed: false };
    if (prog.completed) continue;
    prog.count = 1;
    prog.completed = true;
    anyCompleted = true;
    Notify.show('Quest complete: ' + q.name + '!', 3, R.colors.gold);
    G.state.quests[q.id] = prog;
  }
  return anyCompleted;
};

QuestSystem.canClaim = function(questId) {
  this.init();
  const prog = G.state.quests[questId];
  return prog && prog.completed && !prog.claimed;
};

QuestSystem.claim = function(questId) {
  this.init();
  if (!this.canClaim(questId)) return false;
  const prog = G.state.quests[questId];
  const allQuests = getAllQuests();
  const quest = allQuests.find(q => q.id === questId);
  if (!quest) return false;

  if (quest.reward.gold) Economy.addGold(quest.reward.gold);
  if (quest.reward.xp) Progression.addPartyXP(quest.reward.xp);
  if (quest.reward.karma) Economy.addKarma(quest.reward.karma);
  if (quest.reward.df) Economy.addDivineFragments(quest.reward.df);

  prog.claimed = true;
  G.state.quests[questId] = prog;
  Notify.show('Claimed reward for ' + quest.name + '!', 2, R.colors.gold);
  Audio.levelUp();
  return true;
};
