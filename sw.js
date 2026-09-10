// Mythika service worker v5
// Assets: cache-first (instant loads). Files missing from the precache list
// are fetched from network, cached at runtime on success, and NEVER reject
// (a rejected FetchEvent promise surfaces as net::ERR_FAILED and can leave
// the game half-booted with dead buttons).
// index.html: network-first so deploys land immediately.
const CACHE = 'mythika-v5';

const ASSETS = [
'src/engine/firebase-config.js',
'src/engine/localAuth.js',
'src/engine/auth.js',
'src/engine/game.js',
  'src/engine/scene.js',
  'src/engine/scene-helpers.js',
  'src/engine/input.js',
  'src/engine/audio.js',
  'src/engine/renderer.js',
  'src/data/heroes.js',
  'src/data/enemies.js',
  'src/data/zones.js',
  'src/data/perks.js',
  'src/data/auras.js',
  'src/data/items.js',
  'src/data/classes.js',
  'src/data/cultivation.js',
  'src/data/alchemy_recipes.js',
  'src/data/spirit_beasts.js',
  'src/data/quests.js',
  'src/data/achievements.js',
  'src/data/journeys.js',
  'src/systems/economy.js',
  'src/systems/hints.js',
  'src/systems/progression.js',
  'src/systems/combat.js',
  'src/systems/duel.js',
  'src/systems/cultivation_sys.js',
  'src/systems/alchemy.js',
  'src/systems/save.js',
  'src/systems/quest.js',
  'src/systems/achievements.js',
  'src/systems/journey.js',
  'src/ui/button.js',
  'src/ui/panel.js',
  'src/ui/progressBar.js',
  'src/ui/text.js',
  'src/ui/list.js',
  'src/ui/tabbar.js',
  'src/ui/modal.js',
  'src/ui/card.js',
  'src/scenes/title.js',
  'src/scenes/characterCreate.js',
  'src/scenes/ashram.js',
  'src/scenes/travelMap.js',
  'src/scenes/zoneExploration.js',
  'src/scenes/combatScene.js',
  'src/scenes/party.js',
  'src/scenes/cultivationScene.js',
  'src/scenes/alchemyScene.js',
  'src/scenes/punarjanma.js',
  'src/scenes/spiritBeast.js',
  'src/scenes/forge.js',
  'src/scenes/tournament.js',
  'src/scenes/trials.js',
  'src/scenes/bazaar.js',
  'src/scenes/farm.js',
  'src/scenes/fishing.js',
  'src/scenes/settings.js',
  'src/scenes/questLog.js',
  'src/scenes/equipment.js',
  'src/scenes/achievementsScene.js',
  'src/scenes/debug.js',
  'src/scenes/welcome.js',
  'src/scenes/journeyScene.js',
  'src/scenes/authScene.js',
  'src/main.js',
  'styles/game.css',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      // Tolerant precache: one missing file must not fail the whole install
      // (c.addAll is atomic and would pin the old worker in place forever).
      return Promise.all(ASSETS.concat(['./', './index.html']).map(function(url) {
        return c.add(url).catch(function() { return null; });
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  const url = e.request.url;

  // Always revalidate the shell so deploys are picked up immediately.
  if (url.endsWith('/index.html') || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first with runtime caching and a guaranteed non-rejecting tail:
  // newly added files are cached on first successful fetch, and if both
  // cache and network fail we answer (navigations get the shell, anything
  // else a 503 with an empty body) instead of an unhandled rejection that
  // kills dependent boot code.
  e.respondWith(
    caches.match(e.request).then(function(hit) {
      if (hit) return hit;
      return fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function() {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
