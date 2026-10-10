import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TRAVEL_MAP_PATH = path.join(ROOT, 'src/scenes/travelMap.js');

// Proven vm sandbox mock structure (mirrors travel_map_perf.test.js).
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
    Scene: {
      create: definition => definition,
      responsive() { return {}; },
      navigate(target, opts) {
        context.navigationCalls.push({ target, opts });
      }
    },
    Hints: { show() {} },
    navigationCalls: [],
    gScene() {},
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
      getById() { return null; },
      pruneHistory() {}
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
      getEntry(id) { return this.ENTRIES.find(e => e.zoneId === id); },
      getEntries() { return this.ENTRIES; }
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
      getControlState() { return null; },
      getWorldEvents() { return []; }
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
      getTap(evt) { return null; },
      peekTap() { return null; },
      getScrollDelta() { return null; },
      clear() {},
      getTouches() { return []; }
    },
    R: {
      colors: {
        bg: '#0a0a1a', borderHairline: 'rgba(232,160,48,0.12)', borderFocus: 'rgba(232,160,48,0.6)',
        textPrimary: '#f5f0e8', textSecondary: '#98a0b8', surfaceElevated: '#222240',
        accent: '#e8a030', gold: '#e8a030', danger: '#c83030', success: '#30c830',
        white: '#f5f0e8', red: '#c83030'
      },
      fonts: { xs: '10px sans', sm: '12px sans', md: '14px sans', lg: '18px sans', xl: '22px sans' },
      radius: { xs: 3, s: 5, m: 8, l: 10 },
      reducedMotion() { return false; },
      roundRect(ctx, x, y, w, h, r, color) {
        calls.roundRects.push({ x, y, w, h, r, color });
      },
      textCenter() {},
      text() {}
    },
    Audio: { click() {} },
    ...overrides
  });

  const mapCode = fs.readFileSync(TRAVEL_MAP_PATH, 'utf8');
  vm.runInContext(mapCode + '\n;globalThis.travelMapScene = travelMapScene;', context, { filename: TRAVEL_MAP_PATH });

  return { scene: context.travelMapScene, context, calls };
}

function makeCtx() {
  return {
    save() {}, restore() {},
    fillStyle: '', strokeStyle: '', lineWidth: 0, globalAlpha: 1,
    textAlign: '', font: '',
    beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
    arc() {}, closePath() {}, setLineDash() {}, rect() {}, clip() {},
    fillText() {}, measureText(t) { return { width: t.length * 6 }; },
    strokeRect() {}, fillRect() {}, drawImage() {}
  };
}

// --- LIFECYCLE TESTS ---

test('Repeated enter/leave cycles do not grow buttons array beyond 3', () => {
  const { scene } = loadScene();
  for (let i = 0; i < 10; i++) {
    scene.enter();
    scene.leave();
  }
  scene.enter();
  assert.ok(scene.data.buttons.length <= 3, `Expected at most 3 buttons after 10 cycles, got ${scene.data.buttons.length}`);
});

test('After leave, no stale selections survive', () => {
  const { scene } = loadScene();
  scene.enter();
  scene.data.selectedZone = 'aryavarta';
  scene.data.selectedLandmark = 'test_landmark';
  scene.data.selectedEvent = 'test_event';
  scene.leave();
  assert.equal(scene.data.selectedZone, null, 'selectedZone should be null after leave');
  assert.equal(scene.data.selectedLandmark, null, 'selectedLandmark should be null after leave');
  assert.equal(scene.data.selectedEvent, null, 'selectedEvent should be null after leave');
});

test('After leave, all state fields are cleared', () => {
  const { scene } = loadScene();
  scene.enter();
  scene.data.scrollY = 100;
  scene.data.mapX = 50;
  scene.data.mapY = 75;
  scene.data.isDragging = true;
  scene.data.didDrag = true;
  scene.leave();
  assert.equal(scene.data.scrollY, 0, 'scrollY cleared');
  assert.equal(scene.data.mapX, 0, 'mapX cleared');
  assert.equal(scene.data.mapY, 0, 'mapY cleared');
  assert.equal(scene.data.isDragging, false, 'isDragging cleared');
  assert.equal(scene.data.didDrag, false, 'didDrag cleared');
});

test('Repeated enter/leave cycles keep buttons array stable at exactly 3', () => {
  const { scene } = loadScene();
  const lengths = [];
  for (let i = 0; i < 5; i++) {
    scene.enter();
    lengths.push(scene.data.buttons.length);
    scene.leave();
  }
  assert.ok(lengths.every(l => l === 3), `Expected every enter to create exactly 3 buttons, got: ${lengths}`);
});

test('Caches are cleared on resetState()', () => {
  const { scene } = loadScene();
  const ctx = makeCtx();
  scene.enter();
  scene.render(ctx);
  assert.ok(scene.data._cachedMetrics !== null, 'metrics cached after render');
  scene.leave();
  assert.equal(scene.data._cachedMetrics, null, 'metrics cleared after leave');
  assert.equal(scene.data._cachedRects, null, 'rects cleared after leave');
  assert.equal(scene.data._descCache, null, 'descCache cleared after leave');
});

test('Back navigates through the canonical transition API', () => {
  const { scene, context } = loadScene();
  scene.enter();
  scene.data.backBtn.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(context.navigationCalls)), [{
    target: 'ashram',
    opts: { fade: true, enterOptions: { restoreScroll: true } }
  }]);
});

test('Enter Zone navigates through the canonical transition API', () => {
  const { scene, context } = loadScene();
  scene.enter();
  scene.data.selectedZone = 'aryavarta';
  scene.data.enterBtn.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(context.navigationCalls)), [{
    target: 'zoneExploration',
    opts: { fade: true }
  }]);
});
