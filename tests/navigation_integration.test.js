const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadNavigation() {
  const context = {
    window: {},
    console: { warn: () => {}, error: () => {}, log: () => {} },
    G: {
      state: {
        party: [{ id: 'h1', name: 'Hero', level: 2, role: 'tank', hp: 80, maxHp: 100, mp: 20, maxMp: 30 }],
        player: null, currentZone: 'z1', inventory: [], scene: 'ashram'
      },
      scenes: { ashram: {}, travelMap: {}, zoneExploration: {}, combat: {}, party: {}, equipment: {}, cultivation: {} },
      W: 400, H: 720
    },
    R: { reducedMotion: () => false, colors: { red: '#f00' } },
    Fade: { toScene: () => {} },
    ZONES: { z1: { name: 'Zone 1' } },
    UI: { HeroSurface: { getModel: (h) => ({ id: h.id }) } },
    MapHelpers: {},
    Landmarks: {},
    Influence: {},
    JourneySystem: {},
    EncounterSystem: {},
    CultivationSystem: {},
    Notify: { show: () => {} }
  };
  context.window = context;
  context.gSceneCalls = [];
  context.gScene = (name) => { context.gSceneCalls.push(name); return true; };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'engine', 'navigation.js'), 'utf8'), context);
  // navigation.js wraps window.gScene; restore test spy afterwards
  context.gSceneCalls = [];
  context.gScene = (name) => { context.gSceneCalls.push(name); return true; };
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'engine', 'navigation_routes.js'), 'utf8'), context);
  return context;
}

test('core slice and character screens register explicit contracts', () => {
  const ctx = loadNavigation();
  const Nav = ctx.Navigation;
  for (const routeId of ['ashram', 'travelMap', 'zoneExploration', 'combat', 'party', 'equipment', 'cultivation']) {
    assert(Nav.routeRegistry.has(routeId), routeId + ' must be registered');
    const route = Nav.routeRegistry.get(routeId);
    assert(Object.keys(route.contextSchema).length > 0, routeId + ' needs context schema');
    assert(Object.keys(route.commandSchema).length > 0, routeId + ' needs command schema');
  }
});

test('Navigation.go completes core slice with origin-aware return', () => {
  const ctx = loadNavigation();
  const Nav = ctx.Navigation;
  assert.strictEqual(Nav.go('travelMap'), true);
  assert.strictEqual(Nav.go('zoneExploration', { zoneId: 'z1' }), true);
  assert.strictEqual(Nav.go('combat', { encounterId: 'e1' }), true);
  assert.deepStrictEqual(ctx.gSceneCalls, ['travelMap', 'zoneExploration', 'combat']);
  assert.strictEqual(ctx.G.state.transition.to, 'combat');
  assert.strictEqual(Nav.go('zoneExploration'), true);
  assert.strictEqual(Nav.go('travelMap'), true);
  assert.strictEqual(Nav.go('ashram'), true);
});

test('legacy gScene callers still resolve', () => {
  const ctx = loadNavigation();
  const Nav = ctx.Navigation;
  for (const legacy of ['partyScene', 'combatScene', 'travelMapScene', 'zoneExplorationScene', 'ashramScene']) {
    assert(Nav.legacySceneMap[legacy], legacy + ' must map to a canonical route');
  }
});

test('context data is derived presentation data, not raw state', () => {
  const ctx = loadNavigation();
  const Nav = ctx.Navigation;
  const partyCtx = Nav.getContext('party');
  assert(partyCtx && partyCtx.heroSurface, 'party context must expose heroSurface model');
  assert.notStrictEqual(partyCtx.heroSurface, ctx.G.state.party, 'context must not leak raw state refs');
  const combatCtx = Nav.getContext('combat');
  assert(combatCtx && Array.isArray(combatCtx.partySurface), 'combat context must expose partySurface');
});

test('commands delegate to canonical systems and failure recovers to ashram', () => {
  const ctx = loadNavigation();
  const Nav = ctx.Navigation;
  const before = ctx.gSceneCalls.length;
  assert.strictEqual(Nav.go('invalidRoute'), false);
  assert(ctx.gSceneCalls.length > before, 'invalid route must fall back through gScene');
  assert.strictEqual(ctx.gSceneCalls[ctx.gSceneCalls.length - 1], 'ashram');
  const ashramCommands = Nav.getCommands('ashram');
  assert(Object.keys(ashramCommands).length > 0, 'ashram must expose commands');
});
