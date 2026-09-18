const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const WORLD_STATE_PATH = path.join(ROOT, 'src/systems/world_state.js');
const ECONOMY_PATH = path.join(ROOT, 'src/systems/economy.js');
const ZONES_PATH = path.join(ROOT, 'src/data/zones.js');
const WORLD_EVENTS_DATA_PATH = path.join(ROOT, 'src/data/world_events.js');
const WORLD_EVENTS_SYS_PATH = path.join(ROOT, 'src/systems/world_events.js');

function loadContract() {
  const storage = new Map();
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
  };
  const context = vm.createContext({
    console, setTimeout, clearTimeout,
    performance: { now: () => 0 },
    location: { search: '' },
    localStorage,
    document: { getElementById: () => null, addEventListener: () => {} },
    window: { innerWidth: 400, innerHeight: 720, devicePixelRatio: 1, addEventListener: () => {}, console }
  });

  vm.runInContext(
    fs.readFileSync(GAME_PATH, 'utf8') + '\n;globalThis.G = G;',
    context, { filename: GAME_PATH }
  );
  vm.runInContext(
    fs.readFileSync(WORLD_STATE_PATH, 'utf8') + '\n;globalThis.WorldState = WorldState;',
    context, { filename: WORLD_STATE_PATH }
  );
  vm.runInContext(
    fs.readFileSync(ECONOMY_PATH, 'utf8') + '\n;globalThis.Economy = Economy;',
    context, { filename: ECONOMY_PATH }
  );
  vm.runInContext(
    fs.readFileSync(ZONES_PATH, 'utf8') + '\n;globalThis.ZONES = ZONES; globalThis.ZoneAccess = ZoneAccess;',
    context, { filename: ZONES_PATH }
  );
  vm.runInContext(
    fs.readFileSync(WORLD_EVENTS_DATA_PATH, 'utf8') + '\n;globalThis.WORLD_EVENTS = WORLD_EVENTS;',
    context, { filename: WORLD_EVENTS_DATA_PATH }
  );
  vm.runInContext(
    fs.readFileSync(WORLD_EVENTS_SYS_PATH, 'utf8') + '\n;globalThis.WorldEvents = WorldEvents;',
    context, { filename: WORLD_EVENTS_SYS_PATH }
  );

  return {
    G: context.G,
    WorldState: context.WorldState,
    Economy: context.Economy,
    WorldEvents: context.WorldEvents,
    WORLD_EVENTS: context.WORLD_EVENTS
  };
}

/* Helper: make all four test zones accessible (high level, prereqs met) */
function unlockAllZones(G) {
  G.state.party = [{ id: 'test', level: 50 }];
  G.state.zoneProgress = { aryavarta: 100, dandaka: 100, meru: 100, patala: 0 };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

test('generate creates an active event in an eligible zone', () => {
  const { G, WorldState, WorldEvents, WORLD_EVENTS } = loadContract();
  unlockAllZones(G);

  const beforeCount = Object.keys(WorldState.getWorld().events.active).length;
  const eventId = WorldEvents.generate();

  assert.ok(eventId, 'generate should return an event id');
  const world = WorldState.getWorld();
  const activeKeys = Object.keys(world.events.active);
  assert.equal(activeKeys.length, beforeCount + 1, 'one new active event');

  const record = world.events.active[eventId];
  assert.equal(typeof record.templateId, 'string');
  assert.equal(typeof record.zoneId, 'string');
  assert.equal(typeof record.startedAt, 'number');
  assert.ok(record.duration > 0, 'duration must be positive');
  assert.equal(record.status, 'active');
  assert.ok(
    WORLD_EVENTS.some(t => t.id === record.templateId),
    'templateId must reference a known WORLD_EVENTS template'
  );
});

test('generate does not exceed 3 concurrent active events', () => {
  const { G, WorldState, WorldEvents } = loadContract();
  unlockAllZones(G);

  // Manually activate 3 events
  for (let i = 0; i < 3; i++) {
    WorldState.setEventActive('manual_' + i, {
      templateId: 'manual_tpl_' + i,
      zoneId: 'aryavarta',
      startedAt: Date.now(),
      duration: 3600,
      status: 'active'
    });
  }

  const eventId = WorldEvents.generate();
  assert.equal(eventId, null, 'generate should return null when 3 events are already active');
  assert.equal(Object.keys(WorldState.getWorld().events.active).length, 3);
});

test('generate excludes templates that are already active', () => {
  const { G, WorldState, WorldEvents, WORLD_EVENTS } = loadContract();
  unlockAllZones(G);

  const template = WORLD_EVENTS[0];
  WorldState.setEventActive('existing_' + template.id, {
    templateId: template.id,
    zoneId: template.zoneId,
    startedAt: Date.now(),
    duration: template.duration,
    status: 'active'
  });

  // Generate a few times — should never produce the same template id
  for (let i = 0; i < 5; i++) {
    const eventId = WorldEvents.generate();
    if (!eventId) break;
    const record = WorldState.getWorld().events.active[eventId];
    assert.notEqual(
      record.templateId, template.id,
      'should not activate a template that is already active'
    );
  }
});

test('generate excludes templates that are on cooldown', () => {
  const { G, WorldState, WorldEvents, WORLD_EVENTS } = loadContract();
  // Make only aryavarta accessible
  G.state.party = [{ id: 'test', level: 50 }];
  G.state.zoneProgress = { aryavarta: 0 };

  // Resolve the first aryavarta template very recently → on cooldown
  const aryTemplates = WORLD_EVENTS.filter(t => t.zoneId === 'aryavarta');
  assert.ok(aryTemplates.length >= 2, 'aryavarta needs at least 2 templates');
  const cooledTemplate = aryTemplates[0];

  WorldState.setEventActive('pre_' + cooledTemplate.id, {
    templateId: cooledTemplate.id,
    zoneId: cooledTemplate.zoneId,
    startedAt: Date.now() - cooledTemplate.duration,
    duration: cooledTemplate.duration,
    status: 'active'
  });
  WorldState.resolveEvent('pre_' + cooledTemplate.id, {
    templateId: cooledTemplate.id,
    zoneId: cooledTemplate.zoneId,
    startedAt: Date.now() - cooledTemplate.duration,
    duration: cooledTemplate.duration,
    result: 'resolved',
    resolvedAt: Date.now()
  });

  // Generate — should not pick the cooled-down template
  const eventId = WorldEvents.generate();
  assert.ok(eventId, 'should find an eligible template');
  const record = WorldState.getWorld().events.active[eventId];
  assert.notEqual(
    record.templateId, cooledTemplate.id,
    'should not pick a template that was just resolved (on cooldown)'
  );
});

test('tick expires events that have exceeded their duration', () => {
  const { G, WorldState, WorldEvents } = loadContract();
  unlockAllZones(G);
  const now = Date.now();

  // Event started 3605s ago with 3600s duration → already expired
  WorldState.setEventActive('ev_expire', {
    templateId: 'rakshasa_raid',
    zoneId: 'aryavarta',
    startedAt: now - 3605,
    duration: 3600,
    status: 'active'
  });
  assert.ok(
    Object.prototype.hasOwnProperty.call(WorldState.getWorld().events.active, 'ev_expire'),
    'event starts as active'
  );

  WorldEvents.tick(0);

  const world = WorldState.getWorld();
  assert.ok(
    !Object.prototype.hasOwnProperty.call(world.events.active, 'ev_expire'),
    'event removed from active'
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(world.events.resolved, 'ev_expire'),
    'event moved to resolved'
  );
  const outcome = world.events.resolved['ev_expire'];
  assert.equal(outcome.result, 'expired');
  assert.equal(typeof outcome.expiredAt, 'number');
  assert.equal(outcome.templateId, 'rakshasa_raid');
  assert.equal(outcome.zoneId, 'aryavarta');
});

test('resolve applies rewards and prevents double resolution', () => {
  const { G, WorldState, WorldEvents, WORLD_EVENTS } = loadContract();
  unlockAllZones(G);
  const template = WORLD_EVENTS[0];
  const now = Date.now();

  WorldState.setEventActive('ev_resolve', {
    templateId: template.id,
    zoneId: template.zoneId,
    startedAt: now - 100,
    duration: 3600,
    status: 'active'
  });

  const goldBefore = G.state.gold || 0;
  const karmaBefore = G.state.karma || 0;

  // First resolve — should succeed
  const result1 = WorldEvents.resolve('ev_resolve');
  assert.equal(result1, true, 'first resolve should succeed');

  const reward = template.resolveReward || {};
  assert.equal(G.state.gold, goldBefore + (reward.gold || 0), 'gold increased by reward');
  assert.equal(G.state.karma, karmaBefore + (reward.karma || 0), 'karma increased by reward');

  const resolved = WorldState.getWorld().events.resolved['ev_resolve'];
  assert.equal(resolved.result, 'resolved');
  assert.equal(typeof resolved.resolvedAt, 'number');
  assert.ok(
    !Object.prototype.hasOwnProperty.call(WorldState.getWorld().events.active, 'ev_resolve'),
    'no longer active'
  );

  // Second resolve — should fail, no double reward
  const goldMid = G.state.gold;
  const karmaMid = G.state.karma;
  const result2 = WorldEvents.resolve('ev_resolve');
  assert.equal(result2, false, 'second resolve returns false');
  assert.equal(G.state.gold, goldMid, 'gold unchanged after double resolve');
  assert.equal(G.state.karma, karmaMid, 'karma unchanged after double resolve');
});

test('getForZone returns only events in the specified zone with remaining time', () => {
  const { G, WorldState, WorldEvents } = loadContract();
  unlockAllZones(G);
  const now = Date.now();

  WorldState.setEventActive('ev_a1', {
    templateId: 'rakshasa_raid', zoneId: 'aryavarta',
    startedAt: now, duration: 3600, status: 'active'
  });
  WorldState.setEventActive('ev_d1', {
    templateId: 'naga_migration', zoneId: 'dandaka',
    startedAt: now, duration: 5400, status: 'active'
  });

  const aryavartaEvents = WorldEvents.getForZone('aryavarta');
  assert.equal(aryavartaEvents.length, 1);
  assert.equal(aryavartaEvents[0].zoneId, 'aryavarta');
  assert.equal(aryavartaEvents[0].id, 'ev_a1');
  assert.ok(aryavartaEvents[0].remainingTime > 3500, 'remainingTime close to duration');
  assert.ok(aryavartaEvents[0].remainingTime <= 3600);
});

test('getActive returns all active events with remaining time', () => {
  const { G, WorldState, WorldEvents, WORLD_EVENTS } = loadContract();
  unlockAllZones(G);
  const now = Date.now();

  for (let i = 0; i < 2; i++) {
    WorldState.setEventActive('ev_active_' + i, {
      templateId: WORLD_EVENTS[i].id,
      zoneId: WORLD_EVENTS[i].zoneId,
      startedAt: now,
      duration: WORLD_EVENTS[i].duration,
      status: 'active'
    });
  }

  const all = WorldEvents.getActive();
  assert.equal(all.length, 2);
  assert.ok(all.every(e => typeof e.remainingTime === 'number' && e.remainingTime >= 0));
});

test('pruneHistory bounds resolved count at 20 entries', () => {
  const { G, WorldState, WorldEvents } = loadContract();

  // Add 22 resolved entries with staggered resolvedAt
  for (let i = 0; i < 22; i++) {
    WorldState.resolveEvent('hist_' + i, {
      templateId: 'tpl_' + i,
      zoneId: 'aryavarta',
      startedAt: Date.now() - 100000 + i * 100,
      duration: 3600,
      result: 'resolved',
      resolvedAt: Date.now() - 100000 + i * 100
    });
  }

  assert.equal(
    Object.keys(WorldState.getWorld().events.resolved).length, 22
  );

  const removed = WorldEvents.pruneHistory();
  assert.equal(removed, 2);
  assert.equal(
    Object.keys(WorldState.getWorld().events.resolved).length, 20
  );

  // The oldest 2 entries (hist_0, hist_1) should have been removed
  const resolved = WorldState.getWorld().events.resolved;
  assert.ok(!Object.prototype.hasOwnProperty.call(resolved, 'hist_0'), 'oldest entry removed');
  assert.ok(!Object.prototype.hasOwnProperty.call(resolved, 'hist_1'), 'second oldest entry removed');
  assert.ok(Object.prototype.hasOwnProperty.call(resolved, 'hist_2'), 'third oldest kept');
  assert.ok(Object.prototype.hasOwnProperty.call(resolved, 'hist_21'), 'newest entry kept');
});

test('tick handles offline elapsed correctly — events expired during away time', () => {
  const { G, WorldState, WorldEvents } = loadContract();
  unlockAllZones(G);
  const now = Date.now();

  // Event started 3600s ago with 3600s duration → remaining ≈ 0
  WorldState.setEventActive('ev_off1', {
    templateId: 'rakshasa_raid', zoneId: 'aryavarta',
    startedAt: now - 3600, duration: 3600, status: 'active'
  });
  // Event started 4000s ago with 7200s duration → remaining ≈ 3200
  WorldState.setEventActive('ev_off2', {
    templateId: 'naga_migration', zoneId: 'dandaka',
    startedAt: now - 4000, duration: 7200, status: 'active'
  });

  // Offline for 4000s — both should expire (remaining ≤ elapsed)
  WorldEvents.tick(4000);
  const world = WorldState.getWorld();
  assert.ok(
    !Object.prototype.hasOwnProperty.call(world.events.active, 'ev_off1'),
    'ev_off1 should expire (remaining ~0 ≤ elapsed 4000)'
  );
  assert.ok(
    !Object.prototype.hasOwnProperty.call(world.events.active, 'ev_off2'),
    'ev_off2 should expire (remaining ~3200 ≤ elapsed 4000)'
  );

  // New event with plenty of remaining — 1000s elapsed vs 3100s remaining → survives
  WorldState.setEventActive('ev_off3', {
    templateId: 'rakshasa_raid', zoneId: 'aryavarta',
    startedAt: now - 500, duration: 3600, status: 'active'
  });
  WorldEvents.tick(1000);
  const w2 = WorldState.getWorld();
  assert.ok(
    Object.prototype.hasOwnProperty.call(w2.events.active, 'ev_off3'),
    'ev_off3 should survive (remaining ~3100 > elapsed 1000)'
  );
});
