/* tools/layout_harness/driver.js
 *
 * Layout-sweep driver (Phase 30, Plan 30-03). Classic script, loaded in the
 * generated /__layout__.html sweep page AFTER inject.js and BEFORE all game
 * scripts (see tools/verify_matrix.py --layout). Runs only when the page URL
 * carries ?layout=1; otherwise a no-op.
 *
 * FLOW: wait for the [Mythika] booted state -> seed localStorage with
 * tools/layout_harness/seeded_save.json under key mythika_save -> hydrate it
 * -> pin Math.random to a fixed mulberry32 seed -> enter each scene with
 * gScene(name, false) (no fade veil; seeded save has reduceMotion on so
 * 150-250ms fades and toast slide-ins are already settled) -> discard the
 * transition frame -> wait ~350ms past settle -> endFrame + selfCheck ->
 * emit one base64 beacon per scene:
 *     [Mythika] layout <b64(JSON {scene, W, H, boxes, clip, harnessOk,
 *                                harnessErrors})>
 * plus a shot beacon (canvas.toDataURL, raw: no quotes/whitespace inside):
 *     [Mythika] layout-shot <scene> <dataURL|null>
 * and a final `[Mythika] layout-done <count>` marker.
 *
 * SPECIAL ENTRIES (fixed RNG throughout):
 *   combatScene-1v1 / combatScene-5v3 via the real combat start path
 *     (G.state.party + G.state.currentEnemies, then gScene('combatScene'));
 *   zoneExploration-encounter mirrors triggerEncounter's pre-navigation
 *     state (currentEnemy + enemyHpPct + log line, no scene nav);
 *   bazaar-buy (tab 0) / bazaar-sell (tabBar.setActive(1) + rebuild);
 *   modal-open (UI.Modal.show over the party scene: overlay exclusion +
 *     finally-clear proven by harnessOk).
 *
 * W/H in every beacon are the canvas backing-store pixels (game logical
 * 400x720 x DPR via G.ctx.setTransform): boxes are recorded in device px,
 * so asserts must use beacon W/H, never assumed constants.
 */
(function () {
  'use strict';
  var qs = '';
  try { qs = window.location.search || ''; } catch (e) {}
  if (!/[?&]layout=1(?:&|$)/.test(qs)) return;

  var SEED = 20261009;
  var SETTLE_MS = 350;

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function b64encodeUnicode(s) {
    // btoa is Latin1-only; UTF-8 round-trip keeps ⚔/★/• intact.
    return btoa(unescape(encodeURIComponent(s)));
  }

  function beacon(obj) {
    try {
      console.log('[Mythika] layout ' + b64encodeUnicode(JSON.stringify(obj)));
    } catch (e) {}
  }

  function canvasSize() {
    try {
      if (typeof G !== 'undefined' && G.canvas) {
        return { W: G.canvas.width || 400, H: G.canvas.height || 720 };
      }
    } catch (e) {}
    return { W: 400, H: 720 };
  }

  function snapShot(id) {
    // Downscaled JPEG thumbnail (~15KB): full-res PNG beacons would risk
    // Chrome console truncation in --enable-logging output. The profile-level
    // --screenshot PNG is retained separately by verify_matrix.py.
    var dataUrl = null;
    try {
      var c = document.getElementById('game-canvas');
      if (c) {
        var t = document.createElement('canvas');
        t.width = 200;
        t.height = Math.max(1, Math.round(200 * c.height / Math.max(1, c.width)));
        t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
        dataUrl = t.toDataURL('image/jpeg', 0.7);
      }
    } catch (e) { dataUrl = null; }
    try {
      console.log('[Mythika] layout-shot ' + id + ' ' + (dataUrl || 'null'));
    } catch (e2) {}
  }

  function settleAndSnap(id, entered) {
    var H = window.__layoutHarness;
    // Forced synchronous frames: under --virtual-time-budget almost no rAF
    // frames fire during a sleep, so ambient rendering is timing luck (most
    // scenes captured 0 boxes). gLoopFrame is a global; driving it directly
    // is deterministic. Settle frames first (reduceMotion is on, no fade
    // veil: 8 x 16ms settles every entrance tween), discard, then capture
    // exactly ONE settled frame — accumulating frames would self-overlap
    // identical boxes into false violations.
    H.endFrame();
    var t = performance.now();
    var frameErr = null;
    for (var i = 0; i < 8; i++) {
      try { gLoopFrame(t + i * 16); }
      catch (e) {
        var stack = '';
        try { stack = String((e && e.stack) || e).split('\n').slice(0, 4).join(' | ').slice(0, 400); } catch (e2) {}
        frameErr = 'frame failed: ' + (e && e.message ? e.message : e) + ' @ ' + stack;
        break;
      }
    }
    H.endFrame();
    if (!frameErr) {
      try { gLoopFrame(t + 8 * 16); }
      catch (e) {
        var stack2 = '';
        try { stack2 = String((e && e.stack) || e).split('\n').slice(0, 4).join(' | ').slice(0, 400); } catch (e3) {}
        frameErr = 'frame failed: ' + (e && e.message ? e.message : e) + ' @ ' + stack2;
      }
    }
    var snap = H.endFrame();
    var ok = H.selfCheck();
    if (frameErr) ok = false;
    var size = canvasSize();
    var actual = '';
    try { actual = (G.currentScene && G.currentScene.name) || ''; } catch (e4) {}
    var stScene = '';
    try { stScene = (G.state && G.state.scene) || ''; } catch (e5) {}
    beacon({
      scene: id,
      enteredActual: entered || '',
      actualScene: actual,
      stateScene: stScene,
      W: size.W,
      H: size.H,
      boxes: snap.boxes,
      clip: snap.clip,
      harnessOk: ok,
      harnessErrors: frameErr ? [frameErr].concat(H.errors.slice()) : H.errors.slice()
    });
    snapShot(id);
    return Promise.resolve();
  }

  function snapScene(id, enterFn) {
    var entered = '';
    try {
      enterFn();
      try { entered = (G.currentScene && G.currentScene.name) || ''; } catch (e0) {}
    } catch (e) {
      beacon({ scene: id, enteredActual: entered, actualScene: '', stateScene: '',
               W: 400, H: 720, boxes: [], clip: null, harnessOk: false,
               harnessErrors: ['enter failed: ' + (e && e.message ? e.message : e)] });
      snapShot(id);
      return Promise.resolve();
    }
    return settleAndSnap(id, entered);
  }

  function fullHpParty(list) {
    return list.map(function (h) {
      var c = JSON.parse(JSON.stringify(h));
      c.hp = c.maxHp;
      c.mp = c.maxMp;
      return c;
    });
  }

  var CHECKED = ['title', 'ashram', 'travelMap', 'zoneExploration', 'combatScene',
    'party', 'cultivationScene', 'alchemyScene', 'punarjanma', 'spiritBeast',
    'questLog', 'forge', 'tournament', 'trials', 'bazaar', 'farm', 'fishing',
    'settings', 'achievements', 'equipment'];

  var reported = 0;
  function count() { reported++; }

  function run() {
    // 1. wait for boot (bootGame sets G._booted, gInit logs the beacon).
    var waits = 0;
    function booted() {
      // NOTE: game globals are lexical consts (const G = ...), NOT window
      // properties — window.G is always undefined. Use a typeof-guarded
      // bare reference like main.js does.
      try {
        return (typeof G !== 'undefined') && !!G._booted && G.frameCount > 2;
      } catch (e) { return false; }
    }
    function waitBoot() {
      if (booted()) return Promise.resolve();
      if (++waits > 300) {
        beacon({ scene: '_setup', W: 400, H: 720, boxes: [], clip: null,
                 harnessOk: false, harnessErrors: ['boot never completed'] });
        return Promise.resolve();
      }
      return sleep(100).then(waitBoot);
    }
    return waitBoot().then(function () {
      // HARNESS-ONLY bridge (no game-code change): backgrounds.js assigns to
      // window.R.Backgrounds, but game code reads lexical R.Backgrounds,
      // which is therefore undefined in production — every Backgrounds call
      // site throws mid-render (the rAF watchdog swallows it, so frames come
      // out partial). Bridging the two R objects in-memory lets the sweep
      // capture complete frames as designed. SURFACED BUG, not fixed here:
      // backgrounds never paint on master; see 30-03-SUMMARY.
      try {
        if ((typeof R !== 'undefined') && R && !R.Backgrounds &&
            (typeof window.R !== 'undefined') && window.R && window.R.Backgrounds) {
          R.Backgrounds = window.R.Backgrounds;
        }
        // Unify the split R: heroSurface.js reads global.R (window.R, the
        // bare backgrounds stub without colors), game code reads lexical R.
        // Point window.R at the real R so hero cards render as designed.
        // Same surfaced-bug family as above; harness-only, no game edit.
        if ((typeof R !== 'undefined') && R && window.R !== R) {
          window.R = R;
          console.log('[Mythika] layout-bridge R unified');
        } else {
          console.log('[Mythika] layout-bridge R.Backgrounds');
        }
      } catch (e) {}
      // 2. seed localStorage + hydrate, then pin RNG (hydrate/migrate draw
      // no RNG, but re-pinning keeps the stream auditable from here).
      return fetch('/tools/layout_harness/seeded_save.json').then(function (r) { return r.json(); }).then(function (payload) {
        try { localStorage.setItem('mythika_save', JSON.stringify(payload)); } catch (e) {}
        try {
          if (typeof SaveSystem !== 'undefined' && SaveSystem.hydrate) SaveSystem.hydrate(payload.state);
        } catch (e) {}
        Math.random = mulberry32(SEED);
      }).catch(function (e) {
        beacon({ scene: '_setup', W: 400, H: 720, boxes: [], clip: null,
                 harnessOk: false, harnessErrors: ['seed failed: ' + e] });
        Math.random = mulberry32(SEED);
      });
    }).then(function () {
      // 3. plain sweep over the checked set. Plain combatScene with no staged
      // enemies would arm its 600ms empty-redirect timer (an ashram detour
      // artifact, not a layout state), so stage one enemy like the real path.
      var chain = Promise.resolve();
      CHECKED.forEach(function (name) {
        chain = chain.then(function () {
          return snapScene(name, function () {
            if (name === 'combatScene' && (!G.state.currentEnemies || !G.state.currentEnemies.length)) {
              G.state.currentEnemies = [getZoneEnemy('aryavarta', 1)];
              G.state.isBossFight = false;
            }
            gScene(name, false);
          }).then(count);
        });
      });
      return chain;
    }).then(function () {
      // 4a. combat 1v1 via the real start path.
      return snapScene('combatScene-1v1', function () {
        var saved = G.state.party;
        var one = fullHpParty(saved.slice(0, 1));
        G.state.party = one;
        G.state.player = one[0];
        G.state.currentEnemies = [getZoneEnemy('aryavarta', 1)];
        G.state.isBossFight = false;
        try { gScene('combatScene', false); }
        finally { G.state.party = saved; G.state.player = saved[0] || null; }
      }).then(count);
    }).then(function () {
      // 4b. combat 5v3 via the real start path.
      return snapScene('combatScene-5v3', function () {
        var five = fullHpParty(G.state.party.slice(0, 5));
        G.state.party = five;
        G.state.player = five[0];
        var es = [];
        for (var k = 0; k < 3; k++) es.push(getZoneEnemy('aryavarta', 3));
        G.state.currentEnemies = es;
        G.state.isBossFight = false;
        gScene('combatScene', false);
      }).then(count);
    }).then(function () {
      // 5. zone with encounter banner (pre-navigation triggerEncounter state).
      return snapScene('zoneExploration-encounter', function () {
        G.state.currentZone = 'aryavarta';
        gScene('zoneExploration', false);
        var enemy = getZoneEnemy('aryavarta', 3);
        zoneExplorationScene.data.currentEnemy = enemy;
        zoneExplorationScene.data.enemyHpPct = 100;
        zoneExplorationScene.data.log.push('A formidable ' + enemy.name + ' appears!');
      }).then(count);
    }).then(function () {
      // 6a/6b. bazaar buy then sell tabs.
      return snapScene('bazaar-buy', function () {
        gScene('bazaar', false);
      }).then(count).then(function () {
        return snapScene('bazaar-sell', function () {
          gScene('bazaar', false);
          bazaarScene.data.tabBar.setActive(1);
          bazaarScene.buildBuySellLists();
        }).then(count);
      });
    }).then(function () {
      // 7. modal over a content scene (overlay exclusion proof).
      return snapScene('modal-open', function () {
        gScene('party', false);
        UI.Modal.show({
          title: 'Confirm Creation',
          body: 'Spend 100g to create?',
          buttons: [{ label: 'Cancel', value: false }, { label: 'Confirm', value: true, primary: true }]
        });
      }).then(count);
    }).then(function () {
      try { console.log('[Mythika] layout-done ' + reported); } catch (e) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { run(); });
  } else {
    run();
  }
})();
