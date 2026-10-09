(function() {
  // Installable PWA (offline fallback), skip on file://.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }

  function failBoot(missing) {
    var message = '[Mythika] boot blocked; missing capability: ' + missing.join(', ');
    if (window.console) console.error(message);
    var status = document.getElementById('status-bar');
    if (status) {
      status.textContent = 'Mythika could not start. Please reload this page.';
      status.setAttribute('role', 'alert');
    }
    var container = document.getElementById('game-container');
    if (container) container.classList.remove('loading');
  }

  // Validate the shared surfaces once, before the loop can repeatedly throw.
  var required = [
    ['G', typeof G === 'undefined'], ['R', typeof R === 'undefined'],
    ['UI', typeof UI === 'undefined'], ['Scene', typeof Scene === 'undefined'],
    ['Input', typeof Input === 'undefined'], ['Fade', typeof Fade === 'undefined']
  ];
  var missing = required.filter(function(item) { return item[1]; }).map(function(item) { return item[0]; });
  if (typeof registerScene !== 'function') missing.push('registerScene');
  if (missing.length) {
    failBoot(missing);
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

  // Local enter wrapper: a throwing enter() must not abort the boot
  // (or the game loop never starts and every button stays dead).
  function enterCurrent() {
    var s = G.currentScene;
    if (!s) return;
    try { if (s.enter) s.enter(); }
    catch (err) {
      if (window.console) console.error('[Mythika] scene enter failed', err);
      try { if (typeof Notify !== 'undefined') Notify.show('A screen failed to load', 2.5, '#c83030'); } catch (e2) {}
    }
  }


  // Deterministic early boot: scripts load synchronously at the end of
  // <body>, so the DOM exists right now — start immediately instead of
  // waiting for window.load (which blocks on every subresource). The load
  // listener stays as a safety net; the _booted guard (plus game.js's own
  // _loopStarted guard) makes double-boot impossible.
  function bootGame() {
    if (G._booted) return;
    G._booted = true;
    var bootProbe = /[?&]probe(?:&|$)/.test(location.search);
    var bootStarted = bootProbe && performance.now();
    // Fall back to the first registered scene if title itself failed to
    // load — a missing boot scene must not leave a dead canvas.
    G.currentScene = G.scenes['title'] || G.scenes[Object.keys(G.scenes)[0]];
    if (!G.currentScene) {
      if (window.console) console.error('[Mythika] no scenes registered, aborting boot');
      return;
    }
    enterCurrent();
    if (bootProbe) console.log('[Mythika] boot-phase scene-enter=' + (performance.now() - bootStarted).toFixed(1) + 'ms');
    if (window.firebaseReady && typeof Auth !== 'undefined' && !Auth.auth) {
      Auth.init(window.firebaseApp, window.firebaseAuth, window.firebaseDb);
    }
    // gInit (canvas, input, audio, rAF loop) lives in game.js.
    if (typeof gInit === 'function') gInit();
    if (bootProbe) console.log('[Mythika] boot-phase gInit=' + (performance.now() - bootStarted).toFixed(1) + 'ms');
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
  document.addEventListener('firebase-ready', function() {
    if (typeof Auth !== 'undefined' && !Auth.auth) Auth.init(window.firebaseApp, window.firebaseAuth, window.firebaseDb);
  });
  window.addEventListener('load', function() { bootGame(); });
  bootGame();
})();
