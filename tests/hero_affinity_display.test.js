const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BOND_PATH = path.join(ROOT, 'src/systems/bond.js');
const SURFACE_PATH = path.join(ROOT, 'src/ui/heroSurface.js');
const PARTY_PATH = path.join(ROOT, 'src/scenes/party.js');
const HERO_IDS = ['arjuna', 'bhima', 'karna', 'draupadi', 'hanuman'];

function toHost(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeR(calls) {
  return {
    colors: {
      gold: 'gold', text: 'text', textDim: 'textDim', info: 'info',
      success: 'success', panel: 'panel', borderHairline: 'track'
    },
    fonts: { xs: 'xs', sm: 'sm', md: 'md' },
    radius: { xs: 3, m: 8 },
    roundRect: function(ctx, x, y, w, h, r, fill) {
      calls.push({ op: 'roundRect', x, y, w, h, r, fill: String(fill) });
    },
    text: function(ctx, str, x, y, color, font) {
      calls.push({ op: 'text', str: String(str), x, y, color: String(color) });
    },
    reducedMotion: function() { return false; },
    spring: function(config) {
      config = config || {};
      var stiffness = config.stiffness !== undefined ? config.stiffness : 170;
      var damping = config.damping !== undefined ? config.damping : 26;
      var target = config.target !== undefined ? config.target : 1;
      return function(current, velocity, dt) {
        var force = stiffness * (target - current) - damping * velocity;
        velocity += force * dt;
        var value = current + velocity * dt;
        return { value: value, velocity: velocity };
      };
    },
    easePremium: function(t) {
      if (typeof t !== 'number' || Number.isNaN(t)) t = 0;
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    },
    springConfigs: {
      buttonPress: { stiffness: 300, damping: 24, target: 0.97 },
      iconPress: { stiffness: 300, damping: 24, target: 1.05 },
      panelEnter: { stiffness: 300, damping: 24, target: 1 },
      modalOverlay: { stiffness: 300, damping: 24, target: 1 },
      modalButton: { stiffness: 300, damping: 24, target: 1, delay: 40 },
      revealStagger: { stiffness: 300, damping: 24, target: 1, delay: 40 },
      sceneEnter: { stiffness: 300, damping: 24, target: 1, duration: 400 }
    }
  };
}

function loadSurface(options = {}) {
  const calls = [];
  const calcHeroStats = hero => ({ maxHp: hero.hp + 10, maxMp: hero.mp + 2, str: 7, agi: 8, mag: 9, def: 10 });
  const Progression = { xpForLevel: level => level * 100 };
  
  // Set required globals on globalThis for the VM context
  globalThis.calcHeroStats = calcHeroStats;
  globalThis.Progression = Progression;
  
  const R = makeR(calls);
  const context = vm.createContext({
    global: globalThis,
    globalThis: globalThis,
    console,
    G: { state: { party: options.party || [], affinity: options.affinity || {} } },
    HERO_IDS: HERO_IDS.slice(),
    HEROES: { arjuna: {}, bhima: {}, karna: {}, draupadi: {}, hanuman: {} },
    R: R
  });
  // DO NOT set context.globalThis = context - it breaks globalThis binding
  
  // Load renderer first
  const rendererSource = fs.readFileSync(path.join(ROOT, 'src/engine/renderer.js'), 'utf8');
  vm.runInContext(rendererSource, context, { filename: 'renderer.js' });
  
  // Load component
  const componentSource = fs.readFileSync(path.join(ROOT, 'src/ui/component.js'), 'utf8');
  vm.runInContext(componentSource, context, { filename: 'component.js' });
  
  if (!options.withoutBond) {
    const bondSource = fs.readFileSync(BOND_PATH, 'utf8');
    vm.runInContext(bondSource + '\n;globalThis.BondSystem = BondSystem;', context, { filename: BOND_PATH });
  }
  const surfaceSource = fs.readFileSync(SURFACE_PATH, 'utf8');
  vm.runInContext(surfaceSource, context, { filename: SURFACE_PATH });
  return { UI: globalThis.UI, BondSystem: globalThis.BondSystem, calls, R, context };
}

const HERO = {
  id: 'arjuna', name: 'Arjuna', role: 'Ranged DPS', classId: 'kshatriya',
  level: 3, hp: 60, maxHp: 80, mp: 20, maxMp: 30,
  str: 12, agi: 14, mag: 8, def: 8, xp: 10
};

test('getModel resolves affinity for a recruited hero', () => {
  const { UI } = loadSurface({ party: [{ id: 'arjuna' }], affinity: { arjuna: 40 } });
  const model = toHost(UI.HeroSurface.getModel(HERO, 'compact'));
  assert.equal(model.affinity.value, 40);
  assert.equal(model.affinity.tier, 'Trusted');
  assert.equal(model.affinity.visible, true);
  assert.equal(model.affinity.ratio, 0.4);
  // existing fields untouched
  assert.equal(model.name, 'Arjuna');
  assert.equal(model.hp.current, 60);
});

test('getModel hides affinity for an unrecruited hero', () => {
  const { UI } = loadSurface({ party: [], affinity: {} });
  const model = toHost(UI.HeroSurface.getModel(HERO, 'detail'));
  assert.deepEqual(model.affinity, { value: 0, tier: 'Wary', visible: false, ratio: 0 });
});

test('getModel keeps a safe default when BondSystem is absent', () => {
  const { UI } = loadSurface({ withoutBond: true, party: [{ id: 'arjuna' }], affinity: { arjuna: 80 } });
  const model = toHost(UI.HeroSurface.getModel(HERO, 'compact'));
  assert.deepEqual(model.affinity, { value: 0, tier: 'Wary', visible: false, ratio: 0 });
});

test('_render draws a meter plus tier line when visible', () => {
  const { UI, calls, R } = loadSurface({ party: [{ id: 'arjuna' }], affinity: { arjuna: 60 } });
  const before = calls.length;
  globalThis.R = R;
  UI.HeroSurface._render({}, 0, 0, 200, 120, HERO, 'compact');
  const extra = calls.slice(before);
  const bars = extra.filter(c => c.op === 'roundRect');
  const texts = extra.filter(c => c.op === 'text' && /Sworn/.test(c.str));
  assert.ok(bars.length >= 2, 'expected track + fill roundRect calls, got ' + bars.length);
  assert.equal(texts.length, 1, 'expected one tier line, got ' + JSON.stringify(texts));
  assert.ok(/60\/100/.test(texts[0].str), 'tier line must carry numeric value: ' + texts[0].str);
  // no raw hex in affinity drawing
  for (const c of extra) {
    if (c.fill) assert.ok(!/^#/.test(c.fill), 'raw hex fill forbidden: ' + c.fill);
    if (c.color) assert.ok(!/^#/.test(c.color), 'raw hex color forbidden: ' + c.color);
  }
});

test('_render draws nothing extra when hidden', () => {
  // Use single context, mutate G.state between calls to avoid BondSystem sharing issues
  const calls = [];
  const R = makeR(calls);
  const context = vm.createContext({
    global: globalThis,
    globalThis: globalThis,
    console,
    G: { state: { party: [{ id: 'arjuna' }], affinity: { arjuna: 60 } } },
    HERO_IDS: ['arjuna'],
    HEROES: { arjuna: {} },
    R: R
  });
  // Load all scripts
  const rendererSource = fs.readFileSync(path.join(ROOT, 'src/engine/renderer.js'), 'utf8');
  const componentSource = fs.readFileSync(path.join(ROOT, 'src/ui/component.js'), 'utf8');
  const bondSource = fs.readFileSync(BOND_PATH, 'utf8');
  const surfaceSource = fs.readFileSync(SURFACE_PATH, 'utf8');
  vm.runInContext(rendererSource, context);
  vm.runInContext(componentSource, context);
  vm.runInContext(bondSource + '\n;globalThis.BondSystem = BondSystem;', context);
  vm.runInContext(surfaceSource, context);
  const UI = context.globalThis.UI;

  // Test visible hero
  context.G.state.party = [{ id: 'arjuna' }];
  context.G.state.affinity = { arjuna: 60 };
  const before1 = calls.length;
  globalThis.R = R;
  UI.HeroSurface._render({}, 0, 0, 200, 120, HERO, 'compact');
  const vBars = calls.slice(before1).filter(c => c.op === 'roundRect').length;

  // Test hidden hero (empty party)
  context.G.state.party = [];
  context.G.state.affinity = {};
  const before2 = calls.length;
  globalThis.R = R;
  UI.HeroSurface._render({}, 0, 0, 200, 120, HERO, 'compact');
  const hBars = calls.slice(before2).filter(c => c.op === 'roundRect').length;

  console.log('vBars:', vBars, 'hBars:', hBars);
  assert.ok(vBars > hBars, 'visible hero must emit more draw calls than hidden hero');
  
  // Test hidden hero has no tier text
  const hiddenTier = calls.slice(before2).filter(c => c.op === 'text' && /Wary|Trusted|Sworn|Legend/.test(c.str));
  assert.equal(hiddenTier.length, 0, 'hidden hero must emit no tier text');
});

test('recruitHero seeds affinity 0 via ensureSeed', () => {
  const source = fs.readFileSync(PARTY_PATH, 'utf8');
  assert.match(source, /BondSystem\.ensureSeed/);
  assert.match(source, /G\.state\.party\.push/);
  assert.ok(source.indexOf('G.state.party.push') < source.indexOf('BondSystem.ensureSeed'),
    'ensureSeed must run after party push');
  // seeding behavior itself through the contract
  const { BondSystem, context } = loadSurface({ party: [{ id: 'arjuna' }], affinity: {} });
  assert.equal(BondSystem.ensureSeed('arjuna'), true);
  assert.equal(context.G.state.affinity.arjuna, 0);
  assert.equal(BondSystem.tierFor(context.G.state.affinity.arjuna), 'Wary');
});
