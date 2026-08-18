const QuestSystem = {};

QuestSystem.init = function() {
  if (!G.state.quests) G.state.quests = {};
  if (!G.state.questChains) G.state.questChains = {};
};

QuestSystem.getQuests = function(zoneId) {
  this.init();
  const zoneQuests = getZoneQuests(zoneId);
  return zoneQuests.map(q => {
    const prog = G.state.quests[q.id] || { count: 0, completed: false, claimed: false };
    return { ...q, progress: prog };
  });
};

QuestSystem.getQuestChains = function(zoneId) {
  this.init();
  const chains = QUEST_CHAINS[zoneId] || [];
  return chains.map(chain => {
    const chainProg = G.state.questChains[chain.id] || { currentStep: 0, completed: false, claimed: false };
    const steps = chain.steps.map((step, idx) => {
      const stepProg = G.state.quests[step.id] || { count: 0, completed: false, claimed: false };
      return { ...step, progress: stepProg, active: idx === chainProg.currentStep && !chainProg.completed };
    });
    const available = this.isChainAvailable(chain);
    return { ...chain, steps, chainProgress: chainProg, available, activeStep: steps[chainProg.currentStep] };
  });
};

QuestSystem.isChainAvailable = function(chain) {
  this.init();
  if (!chain.prerequisite) return true;
  const prereqProg = G.state.questChains[chain.prerequisite];
  return prereqProg && prereqProg.completed;
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

QuestSystem.getQuestChainCount = function() {
  this.init();
  let count = 0;
  for (const zoneId of Object.keys(QUEST_CHAINS)) {
    for (const chain of QUEST_CHAINS[zoneId]) {
      const prog = G.state.questChains[chain.id];
      if (prog && !prog.completed) count++;
    }
  }
  return count;
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
  
  this.trackChainKill(enemyId, zoneId);
  return anyCompleted;
};

QuestSystem.trackChainKill = function(enemyId, zoneId) {
  this.init();
  const chains = QUEST_CHAINS[zoneId] || [];
  for (const chain of chains) {
    const chainProg = G.state.questChains[chain.id] || { currentStep: 0, completed: false, claimed: false };
    if (chainProg.completed) continue;
    if (!this.isChainAvailable(chain)) continue;
    
    const currentStep = chain.steps[chainProg.currentStep];
    if (!currentStep) continue;
    if (currentStep.type !== 'kill' && currentStep.type !== 'boss') continue;
    if (currentStep.target !== enemyId) continue;
    
    const stepProg = G.state.quests[currentStep.id] || { count: 0, completed: false, claimed: false };
    if (stepProg.completed) continue;
    
    stepProg.count = (stepProg.count || 0) + 1;
    if (stepProg.count >= currentStep.count) {
      stepProg.completed = true;
      G.state.quests[currentStep.id] = stepProg;
      Notify.show('Chain step complete: ' + currentStep.name + '!', 2, R.colors.gold);
      
      if (chainProg.currentStep < chain.steps.length - 1) {
        chainProg.currentStep++;
      } else {
        chainProg.completed = true;
        Notify.show('Quest chain complete: ' + chain.name + '!', 4, R.colors.gold);
        Audio.levelUp();
      }
      G.state.questChains[chain.id] = chainProg;
    } else {
      G.state.quests[currentStep.id] = stepProg;
    }
  }
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

QuestSystem.canClaimChain = function(chainId) {
  this.init();
  const prog = G.state.questChains[chainId];
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

QuestSystem.claimChain = function(chainId) {
  this.init();
  if (!this.canClaimChain(chainId)) return false;
  
  let chain = null;
  for (const zoneId of Object.keys(QUEST_CHAINS)) {
    chain = QUEST_CHAINS[zoneId].find(c => c.id === chainId);
    if (chain) break;
  }
  if (!chain) return false;

  const reward = chain.finalReward;
  if (reward.gold) Economy.addGold(reward.gold);
  if (reward.xp) Progression.addPartyXP(reward.xp);
  if (reward.karma) Economy.addKarma(reward.karma);
  if (reward.item) {
    const loot = generateLoot(G.state.currentZone || 'aryavarta', 10);
    if (loot.length > 0) {
      if (!G.state.inventory) G.state.inventory = [];
      G.state.inventory.push(loot[0]);
      Notify.show('Received: ' + loot[0].name + '!', 3, getLootColor(loot[0].rarity));
    }
  }

  const prog = G.state.questChains[chainId];
  prog.claimed = true;
  G.state.questChains[chainId] = prog;
  Notify.show('Claimed chain reward for ' + chain.name + '!', 3, R.colors.gold);
  Audio.levelUp();
  return true;
};
