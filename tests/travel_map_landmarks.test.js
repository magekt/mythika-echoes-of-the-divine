const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const TRAVEL_MAP_PATH = path.join(ROOT, 'src/scenes/travelMap.js');

function loadScene(overrides = {}) {
  const calls = {
    checkedZones: [],
    notified: [],
    notices: [],
    text: [],
    arcs: []
  };
  const landmarkRecords = {
    aryavarta: [
      {
        id: 'known',
        name: 'Known Shrine',
        icon: 'K',
        description: 'A remembered shrine.',
        relevance: 'It guards the first road.',
        action: { type: 'info', label: 'Listen to the shrine' },
        discovered: true
      },
      {
        id: 'hidden',
        name: 'Hidden Shrine',
        icon: 'H',
        description: 'Still concealed.',
        relevance: 'Unknown.',
        action: null,
        discovered: false
      }
    ]
  };
  const context = vm.createContext({
    console,
    performance: { now: () => 0 },
    Math,
    Object,
    Array,
    Number,
    Boolean,
    Scene: { create: definition => definition },
    Hints: { show() {} },
    G: {
      W: 400,
      H: 800,
      CONTENT_TOP: 0,
      state: {
        currentZone: 'aryavarta',
        zoneProgress: { aryavarta: 30, dandaka: 0 },
        flags: {}
      }
    },
    ZONES: {
      aryavarta: { name: 'Aryavarta', desc: 'First region', minLvl: 1, maxLvl: 5 },
      dandaka: { name: 'Dandaka', desc: 'Forest', minLvl: 5, maxLvl: 10 }
    },
    LANDMARKS: {
      known: landmarkRecords.aryavarta[0],
      hidden: landmarkRecords.aryavarta[1],
      fresh: { id: 'fresh', name: 'Fresh Discovery' }
    },
    ZONE_LANDMARKS: { aryavarta: ['known', 'hidden'], dandaka: [] },
    Landmarks: {
      checkZone(zoneId) {
        calls.checkedZones.push(zoneId);
        return zoneId === 'aryavarta' ? ['fresh'] : [];
      },
      getDiscovered(zoneId) {
        return (landmarkRecords[zoneId] || []).filter(item => item.discovered).map(item => item.id);
      },
      getAll(zoneId) {
        return landmarkRecords[zoneId] || [];
      }
    },
    WorldState: {
      markLandmarkNotified(id) {
        calls.notified.push(id);
        return true;
      },
      getRegion() { return null; }
    },
    Notify: {
      show(message) { calls.notices.push(message); }
    },
    MapLayout: {
      ZONE_STATE: { LOCKED: 'locked', COMPLETED: 'completed', AVAILABLE: 'available' },
      ENTRIES: [{ zoneId: 'aryavarta', x: 0.1, y: 0.1, w: 0.8, h: 0.5, name: 'Aryavarta', color: '#000' }],
      getEntry(id) { return this.ENTRIES.find(entry => entry.zoneId === id); }
    },
    MapHelpers: {
      getStatus() { return 'available'; },
      getCompletion() { return 30; },
      getStatusColor() { return '#0f0'; },
      getLockReason() { return ''; }
    },
    UI: {
      Modal: { active: false, handleInput() {} },
      MagneticBtn(x, y, w, h, text) {
        return { x, y, w, h, text, visible: true, enabled: true, update() {}, render() {} };
      },
      updateButtons() {},
      handleButtons() { return false; }
    },
    Input: {
      _touchStart: null,
      _touchCurrent: null,
      _pressPos: null,
      peekTap() { return null; },
      getTap() { return null; }
    },
    R: {
      radius: { s: 5, l: 10 },
      fonts: { xs: '10px sans', sm: '12px sans', lg: '18px sans', xl: '24px sans' },
      colors: {
        bg: '#000', borderHairline: '#111', borderFocus: '#222', overlayMedium: '#333',
        overlayMuted: '#444', overlayDark: '#555', textPrimary: '#fff', textSecondary: '#aaa',
        textDim: '#777', gold: '#d4af37', goldLight: '#ffd700', surfaceElevated: '#222', warning: '#f80'
      },
      roundRect() {}, textCenter() {}, reducedMotion() { return true; }
    },
    gScene: { pop() {}, push() {} },
    ...overrides
  });

  const source = fs.readFileSync(TRAVEL_MAP_PATH, 'utf8');
  vm.runInContext(source + '\n;globalThis.travelMapScene = travelMapScene;', context, { filename: TRAVEL_MAP_PATH });
  return { scene: context.travelMapScene, context, calls };
}

function makeContext(calls) {
  return {
    fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1,
    save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, stroke() {}, strokeRect() {},
    moveTo() {}, lineTo() {}, setLineDash() {}, fillRect() {},
    arc(x, y, radius) { calls.arcs.push({ x, y, radius, color: this.fillStyle }); },
    fill() {},
    fillText(text) { calls.text.push(String(text)); },
    measureText(text) { return { width: String(text).length * 6 }; },
    textAlign: 'left', font: ''
  };
}

test('map entry checks visited zones and sends each discovery notice once through WorldState', () => {
  const { scene, calls } = loadScene();
  scene.enter();

  assert.deepEqual(calls.checkedZones, ['aryavarta']);
  assert.deepEqual(calls.notified, ['fresh']);
  assert.ok(calls.notices.some(message => message.includes('Fresh Discovery')));
});

test('region rendering distinguishes discovered and undiscovered landmark indicators', () => {
  const { scene, calls } = loadScene();
  const ctx = makeContext(calls);
  scene.resetState();
  scene.renderRegion(ctx, scene ? scene.data && { zoneId: 'aryavarta', x: 0.1, y: 0.1, w: 0.8, h: 0.5, name: 'Aryavarta', color: '#000' } : null);

  assert.equal(calls.arcs.length, 2);
  assert.notEqual(calls.arcs[0].color, calls.arcs[1].color);
});

test('tapping a discovered landmark opens a readable landmark detail view', () => {
  const { scene, calls } = loadScene();
  const ctx = makeContext(calls);
  scene.resetState();
  scene.selectZone('aryavarta');

  const hit = scene.getLandmarkHitAreas('aryavarta')[0];
  assert.ok(hit, 'discovered landmark should expose a touch target');
  assert.equal(scene.handleTap({ x: hit.x + hit.w / 2, y: hit.y + hit.h / 2 }), true);
  assert.equal(scene.data.selectedLandmark, 'known');

  scene.renderLandmarkDetail(ctx);
  assert.ok(calls.text.includes('Known Shrine'));
  assert.ok(calls.text.some(text => text.includes('remembered shrine')));
  assert.ok(calls.text.some(text => text.includes('guards the first road')));
  assert.ok(calls.text.includes('Listen to the shrine'));
});
