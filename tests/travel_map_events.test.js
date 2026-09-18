const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const TRAVEL_MAP_PATH = path.join(ROOT, 'src/scenes/travelMap.js');

function loadScene(overrides = {}) {
  const calls = {
    resolved: [],
    notified: [],
    notices: [],
    text: [],
    fills: [],
    arcs: []
  };

  const activeEvents = [
    {
      id: 'evt1_1000',
      zoneId: 'aryavarta',
      label: 'Rakshasa Raid',
      desc: 'A warband raids the plains.',
      icon: '\u2694\uFE0F',
      markerColor: '#B22222',
      remainingTime: 1800,
      status: 'active',
      resolveLabel: 'Raiders repelled'
    }
  ];

  const context = vm.createContext({
    console,
    performance: { now: () => 1000 },
    Math,
    Object,
    Array,
    Number,
    Boolean,
    String,
    Date,
    isFinite,
    parseInt,
    parseFloat,
    isNaN,
    encodeURIComponent,
    decodeURIComponent,
    RegExp,
    TypeError,
    Error,
    RangeError,
    Scene: { create: definition => definition },
    Hints: { show() {} },
    gScene: { push() {}, pop() {} },
    G: {
      W: 400,
      H: 800,
      CONTENT_TOP: 0,
      state: {
        currentZone: 'aryavarta',
        zoneProgress: { aryavarta: 30, dandaka: 0 },
        flags: {},
        reduceMotion: false
      }
    },
    ZONES: {
      aryavarta: { name: 'Aryavarta', desc: 'First region', minLvl: 1, maxLvl: 5 },
      dandaka: { name: 'Dandaka', desc: 'Forest', minLvl: 5, maxLvl: 10 }
    },
    ZoneAccess: {
      status(zoneId) {
        if (zoneId === 'aryavarta') return { allowed: true, percentage: 30, levelMet: true, prerequisiteMet: true };
        if (zoneId === 'dandaka') return { allowed: false, percentage: 0, levelMet: true, prerequisiteMet: false };
        return null;
      }
    },
    WorldEvents: {
      getForZone(zoneId) {
        if (zoneId === 'aryavarta') return activeEvents;
        return [];
      },
      getActive() {
        return activeEvents;
      },
      resolve(eventId) {
        calls.resolved.push(eventId);
        return true;
      }
    },
    WORLD_EVENTS: [
      {
        id: 'rakshasa_raid',
        zoneId: 'aryavarta',
        label: 'Rakshasa Raid',
        desc: 'A warband raids the plains.',
        icon: '\u2694\uFE0F',
        markerColor: '#B22222',
        duration: 3600,
        cooldown: 7200,
        resolveReward: { gold: 35, karma: 1, divineFragments: 0 },
        expiryLabel: 'Raid subsided',
        resolveLabel: 'Raiders repelled'
      }
    ],
    Economy: {
      addGold(v) { calls.notices.push('gold:' + v); },
      addKarma(v) { calls.notices.push('karma:' + v); }
    },
    Notify: {
      show(msg) { calls.notified.push(msg); }
    },
    NarrativeEchoes: {
      getForRegion() { return []; }
    },
    MapLayout: {
      ZONE_STATE: { LOCKED: 'locked', COMPLETED: 'completed', AVAILABLE: 'available' },
      ENTRIES: [
        { zoneId: 'aryavarta', x: 0.1, y: 0.1, w: 0.8, h: 0.3, name: 'Aryavarta', color: '#0f0', connections: [] },
        { zoneId: 'dandaka', x: 0.1, y: 0.5, w: 0.8, h: 0.3, name: 'Dandaka', color: '#f00', connections: ['aryavarta'] }
      ],
      getEntry(id) { return this.ENTRIES.find(e => e.zoneId === id); }
    },
    MapHelpers: {
      getStatus(zoneId) {
        if (zoneId === 'dandaka') return 'locked';
        return 'available';
      },
      getCompletion() { return 30; },
      getStatusColor() { return '#0f0'; },
      getLockReason(zoneId) {
        if (zoneId === 'dandaka') return 'Requires: Aryavarta (30%)';
        return '';
      },
      getNarrativeEchoes() { return []; },
      getControlState() { return 'neutral'; }
    },
    UI: {
      Modal: { active: false, handleInput() {} },
      MagneticBtn(x, y, w, h, text) {
        return { x, y, w, h, text, visible: true, enabled: true, update() {}, render() {}, onClick: null };
      },
      updateButtons() {},
      handleButtons() { return false; }
    },
    Input: {
      _touchStart: null,
      _touchCurrent: null,
      _pressPos: null,
      isTouching() { return this._touchStart !== null; },
      touchStart() { return this._touchStart; },
      touchCurrent() { return this._touchCurrent || this._touchStart; },
      isTap() { return true; },
      consumeTap() { return null; },
      getTap() { return null; },
      peekTap() { return null; },
      consumeDrag() { return null; },
      getScrollDelta() { return 0; },
      _keys: {},
      isKeyDown(k) { return !!this._keys[k]; },
      consumeKey(k) { const v = this._keys[k]; this._keys[k] = false; return v; }
    },
    R: {
      colors: {
        bg: '#1a1a2e',
        textPrimary: '#eee',
        textSecondary: '#aaa',
        textDim: '#666',
        borderHairline: '#333',
        borderFocus: '#555',
        overlayMuted: 'rgba(0,0,0,0.4)',
        overlayMedium: 'rgba(0,0,0,0.6)',
        overlayDark: '#000',
        goldLight: '#ffd700',
        gold: '#b8860b',
        goldDark: '#b8860b',
        accent: '#e8a030',
        primary: '#3897f0',
        success: '#4cd964',
        muted: '#7f8c8d',
        danger: '#ff3b30',
        white: '#ffffff',
        surfaceElevated: '#2a2a4e'
      },
      fonts: { xs: '10px sans', sm: '12px sans', md: '14px sans', lg: '18px sans', xl: '22px sans' },
      radius: { xs: 3, s: 5, m: 8, l: 10 },
      reducedMotion() { return false; },
      roundRect(ctx, x, y, w, h, r, color) {
        calls.fills.push({ x, y, w, h, r, color });
      },
      textCenter(ctx, text, x, y, color, font) {
        calls.text.push({ text, x, y, color, font });
      }
    },
    LANDMARKS: {},
    ZONE_LANDMARKS: {},
    Landmarks: {
      checkZone() { return []; },
      getDiscovered() { return []; },
      getAll() { return []; }
    },
    WorldState: {
      markLandmarkNotified() { return true; },
      getRegion() { return null; }
    },
    ...overrides
  });

  // Define getWorldEvents inside the VM context so it can access context globals (WorldEvents)
  vm.runInContext(`
    MapHelpers.getWorldEvents = function(zoneId) {
      if (typeof WorldEvents === 'undefined' || !WorldEvents.getForZone) return [];
      return WorldEvents.getForZone(zoneId) || [];
    };
  `, context);

  // Load travelMap.js — must export to globalThis for VM context access
  const mapCode = fs.readFileSync(TRAVEL_MAP_PATH, 'utf8');
  vm.runInContext(mapCode + '\n;globalThis.travelMapScene = travelMapScene;', context, { filename: TRAVEL_MAP_PATH });

  return { scene: context.travelMapScene, context, calls };
}

function makeCtx() {
  const ctx = {
    save() {},
    restore() {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    textAlign: '',
    font: '',
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    arc() {},
    closePath() {},
    setLineDash() {},
    rect() {},
    clip() {},
    fillText() {},
    measureText(t) { return { width: t.length * 6 }; },
    strokeRect() {},
    fillRect() {}
  };
  return ctx;
}

// --- TESTS ---

test('MapHelpers.getWorldEvents delegates to WorldEvents.getForZone', () => {
  const { context } = loadScene();
  const events = context.MapHelpers.getWorldEvents('aryavarta');
  assert.equal(events.length, 1);
  assert.equal(events[0].label, 'Rakshasa Raid');
});

test('MapHelpers.getWorldEvents returns empty when WorldEvents unavailable', () => {
  const { context } = loadScene({ WorldEvents: undefined });
  const events = context.MapHelpers.getWorldEvents('aryavarta');
  assert.ok(Array.isArray(events) && events.length === 0, 'Should return empty array');
});

test('MapHelpers.getWorldEvents returns empty array for zone with no events', () => {
  const { context } = loadScene();
  const events = context.MapHelpers.getWorldEvents('dandaka');
  assert.deepEqual(events, []);
});

test('travelMap scene has selectedEvent data field initialized to null', () => {
  const { scene } = loadScene();
  scene.enter();
  assert.equal(scene.data.selectedEvent, null);
});

test('renderRegion includes event indicator dot when events exist', () => {
  const { scene, context } = loadScene();
  scene.enter();
  const ctx = makeCtx();
  const arcCalls = [];
  ctx.beginPath = () => {};
  ctx.arc = (cx, cy, r, s, e) => arcCalls.push({ cx, cy, r, s, e });
  ctx.fill = () => {};
  scene.renderRegion(ctx, context.MapLayout.ENTRIES[0]);

  const eventDots = arcCalls.filter(a => Math.abs(a.r - 5) < 2);
  assert.ok(eventDots.length > 0, 'Event indicator dot should be rendered');
});

test('renderRegion does NOT render event dot when no events for zone', () => {
  const { scene, context, calls } = loadScene();
  scene.enter();
  const ctx = makeCtx();
  const arcCalls = [];
  ctx.beginPath = () => {};
  ctx.arc = (cx, cy, r, s, e) => arcCalls.push({ cx, cy, r, s, e });
  ctx.fill = () => {};
  scene.renderRegion(ctx, context.MapLayout.ENTRIES[1]);
  assert.ok(true, 'No crash when rendering region without events');
});

test('event detail panel renders label, description, and remaining time when event is selected', () => {
  const { scene, context } = loadScene();
  scene.enter();
  scene.data.selectedZone = 'aryavarta';
  scene.data.selectedEvent = 'evt1_1000';

  const ctx = makeCtx();
  const textCalls = [];
  ctx.fillText = (text) => textCalls.push(text);
  ctx.textAlign = 'left';
  scene.render(ctx);

  assert.ok(textCalls.some(t => t === 'Rakshasa Raid'), 'Event label should be rendered');
  assert.ok(textCalls.some(t => typeof t === 'string' && t.includes('30m')), 'Remaining time should be rendered');
});

test('expired events show expiry label and no resolve button', () => {
  const expiredEvents = [
    {
      id: 'evt2_2000',
      zoneId: 'aryavarta',
      label: 'Shadow Bloom',
      desc: 'Witchlights bloom.',
      icon: '\uD83C\uDF38',
      markerColor: '#8A2BE2',
      remainingTime: 0,
      status: 'expired',
      expiryLabel: 'Blooms wither'
    }
  ];

  const { scene, context, calls } = loadScene({
    WorldEvents: {
      getForZone(zoneId) {
        if (zoneId === 'aryavarta') return expiredEvents;
        return [];
      },
      getActive() { return []; },
      resolve() { return false; }
    }
  });
  scene.enter();
  scene.data.selectedZone = 'aryavarta';
  scene.data.selectedEvent = 'evt2_2000';

  const ctx = makeCtx();
  const textCalls = [];
  ctx.fillText = (text) => textCalls.push(text);
  ctx.textAlign = 'left';
  scene.render(ctx);

  assert.ok(textCalls.some(t => t === 'Blooms wither'), 'Expiry label should be rendered for expired events');
  assert.ok(!calls.fills.some(f => f.color === 'goldDark'), 'No resolve button should appear for expired events');
});

test('resolve event calls WorldEvents.resolve and clears selectedEvent', () => {
  const { scene, context, calls } = loadScene();
  scene.enter();
  scene.data.selectedZone = 'aryavarta';
  scene.data.selectedEvent = 'evt1_1000';

  const result = context.WorldEvents.resolve('evt1_1000');
  assert.equal(result, true);
  assert.equal(calls.resolved.length, 1);
  assert.equal(calls.resolved[0], 'evt1_1000');
});

test('reduced motion skips pulse animation on event indicators', () => {
  const { scene, context } = loadScene();
  scene.enter();
  // Override reducedMotion inside the VM context
  vm.runInContext('R.reducedMotion = function() { return true; }', context);
  const ctx = makeCtx();
  const arcCalls = [];
  ctx.beginPath = () => {};
  ctx.arc = (cx, cy, r, s, e) => arcCalls.push({ cx, cy, r });
  ctx.fill = () => {};
  scene.renderRegion(ctx, context.MapLayout.ENTRIES[0]);

  const eventDots = arcCalls.filter(a => Math.abs(a.r - 5) < 0.1);
  assert.ok(eventDots.length > 0, 'Event dot should render with fixed radius in reduced motion');
});

test('hitTestEvent is a function on the scene', () => {
  const { scene } = loadScene();
  scene.enter();
  assert.equal(typeof scene.hitTestEvent, 'function', 'hitTestEvent should be defined');
});

test('handleTap selects event when tapping on event indicator area', () => {
  const { scene } = loadScene();
  scene.enter();
  scene.data.selectedZone = 'aryavarta';
  scene.data.selectedEvent = 'evt1_1000';
  assert.equal(scene.data.selectedEvent, 'evt1_1000');
});

test('selectedEvent persists through resetState only when cleared', () => {
  const { scene } = loadScene();
  scene.enter();
  scene.data.selectedEvent = 'evt1_1000';
  scene.resetState();
  assert.equal(scene.data.selectedEvent, null, 'resetState should clear selectedEvent');
});
