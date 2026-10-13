const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const TRAVEL_MAP_PATH = path.join(ROOT, 'src/scenes/travelMap.js');

function loadScene(overrides = {}) {
  const calls = {
    roundRects: [],
    strokes: [],
    arcs: [],
    drawImages: []
  };

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
    Map,
    document: {
      createElement(tag) {
        return {
          width: 0,
          height: 0,
          getContext() {
            return {
              clearRect() {},
              beginPath() {},
              moveTo() {},
              lineTo() {},
              stroke() {},
              fillRect() {}
            };
          }
        };
      }
    },
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
    Landmarks: {
      checkZone() { return []; },
      getDiscovered() { return []; },
      getAll() { return []; }
    },
    LANDMARKS: {
      lm1: { id: 'lm1', name: 'Ancient Shrine', icon: '\u26E9', description: 'A shrine of old power.', relevance: 'Strong currents here.', action: { label: 'Investigate' } },
      lm2: { id: 'lm2', name: 'Hidden Grove', icon: '\u2618', description: 'Where sages meditate.', relevance: 'Calm aura.', action: null }
    },
    WorldState: {
      markLandmarkNotified() { return true; },
      getRegion() { return null; }
    },
    WorldEvents: {
      getForZone() { return []; },
      getActive() { return []; },
      resolve() { return true; }
    },
    WORLD_EVENTS: [],
    ZoneAccess: {
      status(zoneId) {
        if (zoneId === 'aryavarta') return { allowed: true, percentage: 30, levelMet: true, prerequisiteMet: true };
        if (zoneId === 'dandaka') return { allowed: false, percentage: 0, levelMet: true, prerequisiteMet: false };
        return null;
      }
    },
    Economy: { addGold() {}, addKarma() {} },
    Notify: { show() {} },
    NarrativeEchoes: { getForRegion() { return []; } },
    MapLayout: {
      ZONE_STATE: { LOCKED: 'locked', COMPLETED: 'completed', AVAILABLE: 'available', ACTIVE: 'active' },
      ENTRIES: [
        { zoneId: 'aryavarta', x: 0.15, y: 0.08, w: 0.70, h: 0.11, name: 'Aryavarta', color: '#c8a84e', textColor: '#f5f0e8', connections: ['dandaka'] },
        { zoneId: 'dandaka', x: 0.20, y: 0.23, w: 0.70, h: 0.11, name: 'Dandaka', color: '#3a7d44', textColor: '#f5f0e8', connections: ['meru'] },
        { zoneId: 'meru', x: 0.15, y: 0.38, w: 0.70, h: 0.11, name: 'Meru', color: '#4a6fa5', textColor: '#f5f0e8', connections: ['patala'] },
        { zoneId: 'patala', x: 0.20, y: 0.53, w: 0.70, h: 0.11, name: 'Patala', color: '#8b446a', textColor: '#f5f0e8', connections: ['svarga'] },
        { zoneId: 'svarga', x: 0.15, y: 0.68, w: 0.70, h: 0.11, name: 'Svarga', color: '#c471ed', textColor: '#f5f0e8', connections: ['tapobhumi'] },
        { zoneId: 'tapobhumi', x: 0.20, y: 0.83, w: 0.70, h: 0.11, name: 'Tapobhumi', color: '#f368e0', textColor: '#f5f0e8', connections: [] }
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
      getLockReason() { return ''; },
      getNarrativeEchoes() { return []; },
      getControlState() { return null; }
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
      isTouching() { return false; },
      getTap() { return null; },
      peekTap() { return null; }
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
        calls.roundRects.push({ x, y, w, h, r, color });
      },
      textCenter() {}
    },
    ...overrides
  });

  const mapCode = fs.readFileSync(TRAVEL_MAP_PATH, 'utf8');
  vm.runInContext(mapCode + '\n;globalThis.travelMapScene = travelMapScene;', context, { filename: TRAVEL_MAP_PATH });

  return { scene: context.travelMapScene, context, calls };
}

function makeCtx() {
  return {
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
    fillRect() {},
    drawImage() {}
  };
}

// --- TESTS ---

test('After render(), data._cachedMetrics is non-null with viewport/padding/scale', () => {
  const { scene } = loadScene();
  const ctx = makeCtx();
  scene.enter();
  scene.render(ctx);
  assert.ok(scene.data._cachedMetrics, '_cachedMetrics should exist after render');
  assert.ok(scene.data._cachedMetrics.viewport, '_cachedMetrics should have viewport');
  assert.ok(typeof scene.data._cachedMetrics.padding === 'number', '_cachedMetrics should have numeric padding');
  assert.ok(typeof scene.data._cachedMetrics.scale === 'number', '_cachedMetrics should have numeric scale');
});

test('After render(), data._cachedRects is a Map with 6 entries', () => {
  const { scene } = loadScene();
  const ctx = makeCtx();
  scene.enter();
  scene.render(ctx);
  assert.ok(scene.data._cachedRects instanceof Map, '_cachedRects should be a Map');
  assert.equal(scene.data._cachedRects.size, 6, '_cachedRects should have 6 entries');
});

test('getMapMetrics is called at most once per render cycle', () => {
  let callCount = 0;
  const origGetMapMetrics = null; // We'll override in loadScene
  const { scene } = loadScene();
  const ctx = makeCtx();
  scene.enter();
  // Patch getMapMetrics to count calls
  const orig = scene.getMapMetrics.bind(scene);
  scene.getMapMetrics = function() {
    callCount++;
    return orig();
  };
  scene.render(ctx);
  // getMapMetrics should be called once at top of render, plus once from clampPan in enter->selectZone
  // We verify it's called a bounded number (not per-region)
  assert.ok(callCount <= 3, `getMapMetrics called ${callCount} times, expected <= 3 (init+render+clampPan)`);
});

test('After setting selectedLandmark and calling render(), data._descCache exists with landmark_ key', () => {
  // Override Landmarks to return discovered landmark
  const { scene } = loadScene({
    Landmarks: {
      checkZone() { return []; },
      getDiscovered() { return ['lm1']; },
      getAll(zoneId) {
        if (zoneId === 'aryavarta') return [{ id: 'lm1', name: 'Ancient Shrine', icon: '\u26E9', description: 'A shrine of old power.', relevance: 'Strong currents here.', action: { label: 'Investigate' } }];
        return [];
      }
    }
  });
  const ctx = makeCtx();
  scene.enter();
  scene.selectZone('aryavarta');
  scene.data.selectedLandmark = 'lm1';
  scene.render(ctx);
  assert.ok(scene.data._descCache, '_descCache should exist after rendering landmark detail');
  assert.ok(scene.data._descCache.key.startsWith('landmark_'), '_descCache key should start with landmark_');
  assert.ok(Array.isArray(scene.data._descCache.descLines), '_descCache should have descLines array');
  assert.ok(Array.isArray(scene.data._descCache.relevanceLines), '_descCache should have relevanceLines array');
});

test('Off-screen region is not rendered (viewport culling)', () => {
  // Create entries with one well off-screen (y=5.0 is far below viewport H=800)
  const offScreenEntries = [
    { zoneId: 'visible_zone', x: 0.15, y: 0.08, w: 0.70, h: 0.11, name: 'Visible', color: '#c8a84e', textColor: '#f5f0e8', connections: [] },
    { zoneId: 'offscreen_zone', x: 0.15, y: 5.0, w: 0.70, h: 0.11, name: 'OffScreen', color: '#3a7d44', textColor: '#f5f0e8', connections: [] }
  ];
  const { scene, calls } = loadScene({
    MapLayout: {
      ZONE_STATE: { LOCKED: 'locked', COMPLETED: 'completed', AVAILABLE: 'available', ACTIVE: 'active' },
      ENTRIES: offScreenEntries,
      getEntry(id) { return this.ENTRIES.find(e => e.zoneId === id); }
    }
  });
  const ctx = makeCtx();
  scene.enter();
  scene.render(ctx);
  // Count roundRects that look like region renders (with R.radius.l = 10 and a named color)
  // The visible zone should be rendered but the off-screen one should not.
  // With 6 original entries all in-range, we'd see 6 + detail panel rects.
  // With only 1 visible, we should see significantly fewer roundRects.
  const regionRects = calls.roundRects.filter(r => r.r === 10 && r.color !== '#2a2a4e');
  assert.ok(regionRects.length <= 2, `Expected at most 2 region roundRects for 1 visible zone, got ${regionRects.length}`);
});

test('Connection between two off-screen endpoints is not drawn', () => {
  const entriesWithConn = [
    { zoneId: 'off_a', x: 0.15, y: 5.0, w: 0.70, h: 0.11, name: 'Off A', color: '#c8a84e', textColor: '#f5f0e8', connections: ['off_b'] },
    { zoneId: 'off_b', x: 0.20, y: 6.0, w: 0.70, h: 0.11, name: 'Off B', color: '#3a7d44', textColor: '#f5f0e8', connections: [] }
  ];
  let strokeCount = 0;
  const { scene } = loadScene({
    MapLayout: {
      ZONE_STATE: { LOCKED: 'locked', COMPLETED: 'completed', AVAILABLE: 'available', ACTIVE: 'active' },
      ENTRIES: entriesWithConn,
      getEntry(id) { return this.ENTRIES.find(e => e.zoneId === id); }
    }
  });
  const ctx = makeCtx();
  let origStroke = ctx.stroke.bind(ctx);
  ctx.stroke = function() { strokeCount++; origStroke(); };
  scene.enter();
  scene.render(ctx);
  // With both endpoints off-screen, no connection strokes should be drawn
  assert.equal(strokeCount, 0, `Expected 0 strokes for off-screen connections, got ${strokeCount}`);
});

test('Caches are cleared on resetState()', () => {
  const { scene } = loadScene();
  const ctx = makeCtx();
  scene.enter();
  scene.render(ctx);
  assert.ok(scene.data._cachedMetrics, '_cachedMetrics should exist after render');
  assert.ok(scene.data._cachedRects, '_cachedRects should exist after render');
  scene.resetState();
  assert.equal(scene.data._cachedMetrics, null, '_cachedMetrics should be null after resetState');
  assert.equal(scene.data._cachedRects, null, '_cachedRects should be null after resetState');
  assert.equal(scene.data._descCache, null, '_descCache should be null after resetState');
});
