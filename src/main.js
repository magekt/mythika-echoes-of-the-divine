(function() {
  // Installable PWA: network-first service worker (offline fallback), skip on file://
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }

  registerScene('title', titleScene);
  registerScene('characterCreate', characterCreateScene);
  registerScene('ashram', ashramScene);
  registerScene('travelMap', travelMapScene);
  registerScene('zoneExploration', zoneExplorationScene);
  registerScene('combatScene', combatScene);
  registerScene('party', partyScene);
  registerScene('cultivationScene', cultivationScene);
  registerScene('alchemyScene', alchemyScene);
  registerScene('punarjanma', punarjanmaScene);
  registerScene('spiritBeast', spiritBeastScene);
  registerScene('questLog', questLogScene);
  registerScene('forge', forgeScene);
  registerScene('tournament', tournamentScene);
  registerScene('trials', trialsScene);
  registerScene('bazaar', bazaarScene);
  registerScene('farm', farmScene);
  registerScene('fishing', fishingScene);
  registerScene('settings', settingsScene);
  registerScene('achievements', achievementsScene);
  registerScene('equipment', equipmentScene);
  registerScene('welcome', welcomeScene);
  registerScene('debug', debugScene);

  G.currentScene = G.scenes['title'];
  if (G.currentScene && G.currentScene.enter) G.currentScene.enter();
})();
