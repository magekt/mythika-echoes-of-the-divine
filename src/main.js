(function() {
  // Installable PWA: network-first service worker (offline fallback), skip on file://
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }

  registerScene('title', titleScene);  registerScene('characterCreate', characterCreateScene);
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

  // Deterministic early boot (H1): scripts load synchronously at the end of
  // <body>, so the DOM exists right now — start immediately instead of waiting
  // for window.load (which blocks on every subresource). The load listener
  // stays as a safety net; the _booted guard makes bootGame idempotent so the
  // rAF loop can never be started twice.
  function bootGame() {
    if (G._booted) return;
    G._booted = true;
    G.currentScene = G.scenes['title'];
    safeEnter(G.currentScene);
    gInit();
    fitGame();
  }
  window.addEventListener('load', function() { bootGame(); });
  bootGame();
})();
