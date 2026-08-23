const JourneySystem = {};

JourneySystem.init = function() {
  if (!G.state.journeys) G.state.journeys = { active: null, progress: {} };
  if (!G.state.journeys.progress) G.state.journeys.progress = {};
};

JourneySystem.getProgress = function(journeyId) {
  this.init();
  return G.state.journeys.progress[journeyId] || { nodeId: null, completed: false, choices: [] };
};

JourneySystem.isCompleted = function(journeyId) {
  return !!this.getProgress(journeyId).completed;
};

JourneySystem.getAvailable = function() {
  this.init();
  const state = G.state;
  const all = typeof getAvailableJourneys === 'function' ? getAvailableJourneys(state) : Object.values(JOURNEYS);
  return all.map(j => {
    const p = this.getProgress(j.id);
    return { ...j, progress: p, status: p.completed ? 'completed' : (p.nodeId ? 'in_progress' : 'available') };
  });
};

JourneySystem.start = function(journeyId) {
  this.init();
  const j = JOURNEYS[journeyId];
  if (!j || !j.nodes || !j.nodes[0]) return false;
  const p = this.getProgress(journeyId);
  if (p.completed) return false;
  if (!p.nodeId) {
    p.nodeId = j.nodes[0].id;
    G.state.journeys.progress[journeyId] = p;
    G.state.journeys.active = journeyId;
    Notify.show('Journey begun: ' + j.name, 2, R.colors.gold);
    // PostHog: journey started
    try { if (typeof posthog !== 'undefined') posthog.capture('journey_started', { journeyId }); } catch(e) {}
    return true;
  }
  G.state.journeys.active = journeyId;
  return true;
};

JourneySystem.getCurrentNode = function(journeyId) {
  this.init();
  const j = JOURNEYS[journeyId];
  const p = this.getProgress(journeyId);
  if (!j || !p.nodeId) return null;
  return j.nodes.find(n => n.id === p.nodeId) || null;
};

JourneySystem.choose = function(journeyId, choiceIdx) {
  this.init();
  const j = JOURNEYS[journeyId];
  const p = this.getProgress(journeyId);
  const node = this.getCurrentNode(journeyId);
  if (!j || !node || !node.choices[choiceIdx]) return false;
  const choice = node.choices[choiceIdx];
  // apply reward
  if (choice.reward) {
    const r = choice.reward;
    if (r.gold) Economy.addGold(r.gold);
    if (r.karma) Economy.addKarma(r.karma);
    if (r.xp) Progression.addPartyXP(r.xp);
    if (r.prana) CultivationSystem.addPrana(r.prana);
    if (r.cultivationBase) CultivationSystem.addCultivationBase(r.cultivationBase);
    if (r.divineFragments) Economy.addDivineFragments(r.divineFragments);
    if (r.hp) {
      for (const h of G.state.party || []) { h.maxHp += r.hp; h.hp += r.hp; }
    }
    if (r.str) { for (const h of G.state.party || []) h.str += r.str; }
    if (r.agi) { for (const h of G.state.party || []) h.agi += r.agi; }
    if (r.mag) { for (const h of G.state.party || []) h.mag += r.mag; }
    if (r.def) { for (const h of G.state.party || []) h.def += r.def; }
  }
  if (choice.unlockAura && typeof AURAS !== 'undefined' && AURAS[choice.unlockAura]) {
    // auto-equip hint: push to equipped if slot free (max 3)
    if (!G.state.equippedAuras) G.state.equippedAuras = [];
    if (!G.state.equippedAuras.includes(choice.unlockAura) && G.state.equippedAuras.length < 3) {
      G.state.equippedAuras.push(choice.unlockAura);
      Notify.show('Aura unlocked: ' + AURAS[choice.unlockAura].name, 2, R.colors.blueLight);
    }
  }
  if (choice.evolveBoost) {
    const beast = (G.state.spiritBeasts || []).find(b => b.id === choice.evolveBoost);
    if (beast) { beast.xp = (beast.xp || 0) + 50; }
  }
  p.choices.push({ nodeId: node.id, choiceIdx, text: choice.text });
  // advance
  if (choice.next) {
    p.nodeId = choice.next;
  } else {
    p.completed = true;
    p.nodeId = null;
    G.state.journeys.active = null;
    Notify.show('Journey complete: ' + j.name + '!', 3, R.colors.gold);
    Audio.levelUp();
    AchievementSystem.check();
    try { if (typeof posthog !== 'undefined') posthog.capture('journey_completed', { journeyId }); } catch(e) {}
  }
  G.state.journeys.progress[journeyId] = p;
  return true;
};

JourneySystem.getActiveJourney = function() {
  this.init();
  const id = G.state.journeys.active;
  return id ? JOURNEYS[id] : null;
};
