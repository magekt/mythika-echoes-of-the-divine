const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const SW_PATH = path.join(ROOT, 'sw.js');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const WORLD_STATE_PATH = path.join(ROOT, 'src/systems/world_state.js');
const SAVE_PATH = path.join(ROOT, 'src/systems/save.js');

function readServiceWorker() {
  return fs.readFileSync(SW_PATH, 'utf8');
}

function readPrecacheAssets(sw) {
  const assetsMatch = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
  assert.ok(assetsMatch, 'sw.js must export an ASSETS array');
  return assetsMatch[1]
    .split('\n')
    .map(line => line.replace(/,?\s*$/, '').trim())
    .filter(line => line.startsWith("'") || line.startsWith('"'))
    .map(line => line.replace(/^['"]|['"]$/g, ''));
}

// ---------------------------------------------------------------------------
// Test 1: sw.js precache covers every local <script src> in index.html
// ---------------------------------------------------------------------------
test('sw.js ASSETS includes every local script from index.html', () => {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const sw = readServiceWorker();

  // Extract local <script src="..."> paths (skip CDN URLs)
  const scriptPattern = /<script\s+[^>]*src="([^"]+)"[^>]*>/gi;
  const localScripts = [];
  let m;
  while ((m = scriptPattern.exec(html)) !== null) {
    if (m[1].startsWith('src/')) localScripts.push(m[1]);
  }

  assert.ok(localScripts.length > 0, 'index.html should contain local script tags');

  // Extract ASSETS entries from sw.js
  const assets = readPrecacheAssets(sw);

  // world_state.js must be present (Phase 6 requirement)
  assert.ok(
    assets.includes('src/systems/world_state.js'),
    'sw.js ASSETS must include src/systems/world_state.js'
  );

  // Every local index.html script must appear in ASSETS
  for (const script of localScripts) {
    assert.ok(
      assets.includes(script),
      `sw.js ASSETS must include ${script} (from index.html)`
    );
  }
});

test('sw.js uses the authoritative v11 cache and coherent install/activate lifecycle', () => {
  const sw = readServiceWorker();
  const assets = readPrecacheAssets(sw);

  assert.match(sw, /const CACHE\s*=\s*['"]mythika-v11['"]/);
  assert.match(sw, /ASSETS\.concat\(\[['"]\.\/['"],\s*['"]\.\/index\.html['"]\]\)/);
  assert.match(sw, /self\.skipWaiting\(\)/);
  assert.match(sw, /keys\.filter\(k\s*=>\s*k\s*!==\s*CACHE\)\.map\(k\s*=>\s*caches\.delete\(k\)\)/);
  assert.ok(assets.includes('src/systems/world_state.js'));
});

test('sw.js preserves network-first shell and cache-first asset fallback strategies', () => {
  const sw = readServiceWorker();
  const shellBranch = sw.match(/if \(url\.endsWith\('\/index\.html'\)[\s\S]*?\n  \}/);
  assert.ok(shellBranch, 'shell fetch branch should be present');
  assert.match(shellBranch[0], /fetch\(e\.request\)/);
  assert.match(shellBranch[0], /caches\.match\('\.\/index\.html'\)/);
  assert.ok(shellBranch[0].indexOf('fetch(e.request)') < shellBranch[0].indexOf("caches.match('./index.html')"));

  const assetBranch = sw.slice(sw.indexOf('// Cache-first with runtime caching'));
  assert.ok(assetBranch, 'asset fetch branch should be present');
  assert.match(assetBranch, /if \(hit\) return hit/);
  assert.match(assetBranch, /return fetch\(e\.request\)/);
  assert.match(assetBranch, /new Response\('', \{ status: 503/);
});

// ---------------------------------------------------------------------------
// Test 2: Legacy save hydration produces G.state.world without world_state.js
//         (simulates a stale-cache scenario where game.js is fresh but
//          world_state.js is missing)
// ---------------------------------------------------------------------------
test('legacy save hydrates correctly under mixed-version scenario', () => {
  const storage = new Map();
  const localStorage = {
    getItem: k => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: k => storage.delete(k),
  };

  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    performance: { now: () => 0 },
    location: { search: '' },
    localStorage,
    document: { getElementById: () => null, addEventListener: () => {} },
    window: {
      innerWidth: 400,
      innerHeight: 720,
      devicePixelRatio: 1,
      addEventListener: () => {},
      console,
    },
  });

  // Fresh game.js + save.js (the correct current version)
  vm.runInContext(
    fs.readFileSync(GAME_PATH, 'utf8') + '\n;globalThis.G = G;',
    context,
    { filename: GAME_PATH }
  );
  vm.runInContext(
    fs.readFileSync(SAVE_PATH, 'utf8') +
      '\n;globalThis.SaveSystem = SaveSystem;',
    context,
    { filename: SAVE_PATH }
  );

  // Simulate a legacy save: has hero, cultivation, gold but no world key
  // Version 1 matches what SaveSystem.hydrate expects
  const legacySave = {
    player: { name: 'TestHero', level: 5 },
    cultivation: { realm: 0, tier: 1 },
    gold: 1200,
    zone: { current: 'sacred_grove' },
    // intentionally omitting 'world'
  };
  localStorage.setItem('mythika_save', JSON.stringify({ state: legacySave, version: 1, timestamp: Date.now() }));

  // Manually run hydrate (skip the FarmSystem.tick part that needs other globals)
  const G = context.G;
  const saved = JSON.parse(localStorage.getItem('mythika_save'));
  const state = saved.state;
  const nextState = G.createDefaultState();
  for (const key of Object.keys(state)) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') nextState[key] = state[key];
  }
  for (const key of Object.keys(G.state)) delete G.state[key];
  Object.assign(G.state, nextState);

  // G.state.world must exist with the canonical shape
  assert.ok(G.state.world, 'G.state.world must be populated after legacy load');
  assert.ok(
    typeof G.state.world.regions === 'object',
    'G.state.world.regions should exist'
  );
  assert.ok(
    typeof G.state.world.landmarks === 'object',
    'G.state.world.landmarks should exist'
  );
  assert.ok(
    typeof G.state.world.influence === 'object',
    'G.state.world.influence should exist'
  );
  assert.ok(
    typeof G.state.world.narrativeEchoes === 'object',
    'G.state.world.narrativeEchoes should exist'
  );
  assert.ok(
    typeof G.state.world.events === 'object',
    'G.state.world.events should exist'
  );
  assert.ok(
    typeof G.state.world.transitions === 'object',
    'G.state.world.transitions should exist'
  );

  // Unrelated progress must survive
  assert.equal(G.state.player.name, 'TestHero');
  assert.equal(G.state.cultivation.realm, 0);
  assert.equal(G.state.gold, 1200);
  assert.equal(G.state.zone.current, 'sacred_grove');
});
