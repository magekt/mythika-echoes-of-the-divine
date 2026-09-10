(function() {
  // Installable PWA (offline fallback), skip on file://.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }

  // Without the engine or the scene registry nothing can boot.
  if (typeof G === 'undefined' || typeof registerScene !== 'function') {
    if (window.console) console.error('[Mythika] engine missing, aborting boot');
    return;
  }

  // Resilient registration: one failed/missing script must never kill the
  // whole boot. An undefined scene once aborted this IIFE before boot ran,
  // leaving a painted-but-dead screen with inert buttons.
  // NOTE: `typeof X !== 'undefined'` is required; a bare reference to a
  // scene whose script failed to load throws ReferenceError immediately.
  var SCENE_TABLE = [
    ['title', typeof titleScene !== 'undefined' ? titleScene : null],
    ['characterCreate', typeof characterCreateScene !== 'undefined' ? characterCreateScene : null],
    ['ashram', typeof ashramScene !== 'undefined' ? ashramScene : null],
    ['travelMap', typeof travelMapScene !== 'undefined' ? travelMapScene : null],
    ['zoneExploration', typeof zoneExplorationScene !== 'undefined' ? zoneExplorationScene : null],
    ['combatScene', typeof combatScene !== 'undefined' ? combatScene : null],
    ['party', typeof partyScene !== 'undefined' ? partyScene : null],
    ['cultivationScene', typeof cultivationScene !== 'undefined' ? cultivationScene : null],
    ['alchemyScene', typeof alchemyScene !== 'undefined' ? alchemyScene : null],
    ['punarjanma', typeof punarjanmaScene !== 'undefined' ? punarjanmaScene : null],
    ['spiritBeast', typeof spiritBeastScene !== 'undefined' ? spiritBeastScene : null],
    ['questLog', typeof questLogScene !== 'undefined' ? questLogScene : null],
    ['forge', typeof forgeScene !== 'undefined' ? forgeScene : null],
    ['tournament', typeof tournamentScene !== 'undefined' ? tournamentScene : null],
    ['trials', typeof trialsScene !== 'undefined' ? trialsScene : null],
    ['bazaar', typeof bazaarScene !== 'undefined' ? bazaarScene : null],
    ['farm', typeof farmScene !== 'undefined' ? farmScene : null],
    ['fishing', typeof fishingScene !== 'undefined' ? fishingScene : null],
    ['settings', typeof settingsScene !== 'undefined' ? settingsScene : null],
    ['achievements', typeof achievementsScene !== 'undefined' ? achievementsScene : null],
    ['equipment', typeof equipmentScene !== 'undefined' ? equipmentScene : null],
    ['welcome', typeof welcomeScene !== 'undefined' ? welcomeScene : null],
    ['debug', typeof debugScene !== 'undefined' ? debugScene : null],
    ['journeyScene', typeof journeyScene !== 'undefined' ? journeyScene : null],
    ['authScene', typeof authScene !== 'undefined' ? authScene : null]
  ];
  SCENE_TABLE.forEach(function(pair) {
    try {
      if (pair[1]) registerScene(pair[0], pair[1]);
      else if (window.console) console.warn('[Mythika] scene script missing, skipped: ' + pair[0]);
    } catch (err) {
      if (window.console) console.warn('[Mythika] scene registration failed, skipped: ' + pair[0], err);
    }
  });

  // Local enter wrapper: this build of game.js has no safeEnter, so a
  // throwing enter() must not abort the boot (or the loop never starts).
  function enterCurrent() {
    var s = G.currentScene;
    if (!s) return;
    try { if (s.enter) s.enter(); }
    catch (err) {
      if (window.console) console.error('[Mythika] scene enter failed', err);
      try { if (typeof Notify !== 'undefined') Notify.show('A screen failed to load', 2.5, '#c83030'); } catch (e2) {}
    }
  }

  // Container scaling lives here (not in game.js) so boot has no hidden
  // dependency on engine helpers beyond gInit.
  function fitGame() {
    try {
      var el = document.getElementById('game-container');
      if (!el) return;
      var scale = Math.max(0.2, Math.min(window.innerWidth / 404, window.innerHeight / 724, 1));
      el.style.transform = 'scale(' + scale + ')';
      el.style.transformOrigin = 'center center';
    } catch (e) {}
  }

  // Deterministic early boot: scripts load synchronously at the end of
  // <body>, so the DOM exists right now — start immediately instead of
  // waiting for window.load (which blocks on every subresource). The load
  // listener stays as a safety net; the _booted guard (plus game.js's own
  // _loopStarted guard) makes double-boot impossible.
  function bootGame() {
    if (G._booted) return;
    G._booted = true;
    // Fall back to the first registered scene if title itself failed to
    // load — a missing boot scene must not leave a dead canvas.
    G.currentScene = G.scenes['title'] || G.scenes[Object.keys(G.scenes)[0]];
    if (!G.currentScene) {
      if (window.console) console.error('[Mythika] no scenes registered, aborting boot');
      return;
    }
    enterCurrent();
    // gInit (canvas, input, audio, rAF loop) lives in game.js.
    if (typeof gInit === 'function') gInit();
    fitGame();
    if (window.console && G.state) console.log('[Mythika] booted scene=' + G.state.scene);
    // Belt-and-braces: the CSS boot splash is normally removed by the first
    // rendered frame; never let it cover the game if rendering stalls.
    setTimeout(function() {
      try {
        var el = document.getElementById('game-container');
        if (el && G.frameCount > 0) el.classList.remove('loading', 'out');
      } catch (e) {}
    }, 3000);
  }
  window.addEventListener('resize', fitGame);
  window.addEventListener('load', function() { bootGame(); });
  bootGame();
})();
