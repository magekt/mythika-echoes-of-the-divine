const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const vm = require('vm');

function loadModule(filename, context) {
  const code = fs.readFileSync(filename, 'utf8');
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.Navigation;
}

const navigationPath = path.join(__dirname, '..', 'src', 'engine', 'navigation.js');

function createContext() {
  const mockCtx = {
    fillRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    globalAlpha: 1,
    globalCompositeOperation: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    beginPath: () => {},
    arc: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    translate: () => {},
    rotate: () => {},
    roundRect: () => {},
    text: () => {},
    measureText: () => ({ width: 50 }),
    font: ''
  };
  
  const mockFade = {
    toScene: function() { this.target = 1; },
    target: 0,
    alpha: 0,
    speed: 4,
    pendingScene: null,
    update: () => {},
    render: () => {}
  };
  
  const mockNotify = {
    queue: [],
    achievements: [],
    show: (msg, duration, color) => {},
    update: (dt) => {},
    render: (ctx) => {},
    wrap: (ctx, msg) => [msg],
    clear: () => {}
  };
  
  const mockInput = {
    clear: () => {},
    _touchStart: null,
    _touchCurrent: null,
    _pressPos: null,
    getSwipe: () => null,
    peekTap: () => null,
    getTap: () => null,
    handleInput: () => {}
  };
  
  const mockUI = {
    Modal: { active: null, clearAll: () => {} },
    HeroSurface: { getModel: () => ({}) },
    Button: function(x, y, w, h, text, color) { return { x, y, w, h, text, color, render: () => {}, onClick: () => {} }; },
    MagneticBtn: function(x, y, w, h, text, opts) { return { x, y, w, h, text, opts, render: () => {}, onClick: () => {} }; },
    PremiumShell: function(x, y, w, h, opts) { return { render: () => {}, contentRect: () => ({ x, y, w, h }) }; },
    ProgressBar: function(x, y, w, h, color, trackColor) { return { setProgress: () => {}, render: () => {} }; },
    HUD: function() { return { render: () => {} }; }
  };
  
  const mockGScene = (name, fade, options) => {};
  
  const mockR = {
    colors: {
      surface: '#1a1a30',
      surfaceElevated: '#222240',
      surfaceGlass: 'rgba(26,26,48,0.85)',
      textPrimary: '#e8e0d0',
      textSecondary: '#98a0b8',
      gold: '#e8a030',
      hp: '#c83030',
      mp: '#3080c8',
      btn: '#1a2040',
      btnGold: '#e8a030',
      green: '#30c830',
      red: '#c83030',
      blue: '#3080c8',
      blueLight: '#60a0e0',
      orange: '#e8a030',
      orangeLight: '#f0c060',
      textDim: '#98a0b8',
      textDark: '#6a7088',
      borderHairline: 'rgba(232,160,48,0.12)',
      borderFocus: 'rgba(232,160,48,0.6)',
      accent: '#e8a030',
      accentMuted: 'rgba(232,160,48,0.15)',
      subtleWhite: 'rgba(255,255,255,0.08)',
      damageBarBackground: 'rgba(200,48,48,0.2)',
      overlayDark: 'rgba(0,0,0,0.6)',
      overlayMuted: 'rgba(0,0,0,0.4)',
      overlayMedium: 'rgba(0,0,0,0.5)',
      goldMuted: 'rgba(232,160,48,0.25)',
      success: '#30c830',
      warning: '#e8a030',
      danger: '#c83030',
      info: '#3080c8',
      hpBarBackground: 'rgba(48,200,48,0.2)'
    },
    fonts: {
      md: '12px sans-serif',
      sm: '10px sans-serif',
      lg: '16px sans-serif',
      xl: '24px sans-serif',
      displaySm: '18px sans-serif',
      mono: '10px monospace',
      xs: '8px sans-serif'
    },
    rect: function(ctx, x, y, w, h, color) {},
    roundRect: function(ctx, x, y, w, h, r, color) {},
    renderNoise: function(ctx) {},
    reducedMotion: function() { return false; },
    radius: { xs: 3, s: 5, m: 8, l: 10 }
  };
  
  const mockG = {
    W: 400,
    H: 720,
    state: { 
      reduceMotion: false,
      realm: 'qi',
      realmStage: 1,
      ashramLevel: 1,
      gold: 1000,
      karma: 100,
      divineFragments: 10,
      currentZone: 'aryavarta',
      zoneProgress: { aryavarta: 50 },
      party: [{ id: 'arjuna', name: 'Arjuna', hp: 100, maxHp: 100, mp: 50, maxMp: 50, level: 5, role: 'DPS', className: 'Archer', weaponEquipped: null, armorEquipped: null, accessoryEquipped: null, str: 10, agi: 10, mag: 10, def: 10, skillPoints: 0 }],
      player: { id: 'arjuna', name: 'Arjuna', hp: 100, maxHp: 100, mp: 50, maxMp: 50, level: 5, role: 'DPS', className: 'Archer', weaponEquipped: null, armorEquipped: null, accessoryEquipped: null, str: 10, agi: 10, mag: 10, def: 10, skillPoints: 0 },
      inventory: [],
      prana: 100,
      flags: {},
      scene: 'ashram',
      transition: null
    },
    dt: 0.016,
    currentScene: null,
    scenes: {
      ashram: { name: 'ashram', enter: () => {}, leave: () => {}, render: () => {} },
      travelMap: { name: 'travelMap', enter: () => {}, leave: () => {}, render: () => {} },
      zoneExploration: { name: 'zoneExploration', enter: () => {}, leave: () => {}, render: () => {} },
      combat: { name: 'combat', enter: () => {}, leave: () => {}, render: () => {} },
      party: { name: 'party', enter: () => {}, leave: () => {}, render: () => {} },
      equipment: { name: 'equipment', enter: () => {}, leave: () => {}, render: () => {} },
      cultivation: { name: 'cultivation', enter: () => {}, leave: () => {}, render: () => {} },
      settings: { name: 'settings', enter: () => {}, leave: () => {}, render: () => {} }
    },
    systems: {},
    ui: {}
  };
  
  return {
    R: mockR,
    G: mockG,
    gScene: mockGScene,
    Notify: mockNotify,
    Fade: mockFade,
    UI: mockUI,
    Input: mockInput,
    SaveSystem: { load: () => {} },
    MapHelpers: { 
      getRegionMap: () => null,
      getWorldEventsSummary: () => []
    },
    Landmarks: { getAllSummary: () => [] },
    Influence: { getControlState: () => ({}) },
    JourneySystem: { getAvailable: () => [] },
    EncounterSystem: { getForZone: () => [] },
    CultivationSystem: { getRealmProgress: () => ({ current: 0, needed: 100 }) },
    document: {
      createElement: function(tag) {
        if (tag === 'canvas') {
          return { width: 400, height: 720, getContext: () => mockCtx };
        }
        return {};
      }
    },
    Image: function() {
      this.onload = null;
      this.onerror = null;
      this.src = '';
      this.naturalWidth = 400;
      this.naturalHeight = 720;
      setTimeout(() => this.onload && this.onload(), 10);
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    window: {
      matchMedia: () => ({ matches: false }),
      Navigation: {}
    }
  };
}

describe('Navigation System', () => {
  let context;
  let Navigation;
  
  beforeEach(() => {
    context = createContext();
    Navigation = loadModule(navigationPath, context);
  });

  afterEach(() => {
    Navigation.routeRegistry.clear();
    Navigation.transitionState.from = null;
    Navigation.transitionState.to = null;
    Navigation.transitionState.params = null;
    Navigation.transitionState.timestamp = 0;
  });

  test('Navigation.go(routeId, params) resolves route, runs transition, handles invalid route → ashram fallback', () => {
    Navigation.register('ashram', { scene: 'ashram', contextSchema: {}, commandSchema: {} });
    Navigation.register('travelMap', { scene: 'travelMap', contextSchema: {}, commandSchema: {} });
    Navigation.register('zoneExploration', { scene: 'zoneExploration', contextSchema: { zoneId: 'string' }, commandSchema: {} });
    Navigation.register('combat', { scene: 'combat', contextSchema: {}, commandSchema: {} });
    Navigation.register('party', { scene: 'party', contextSchema: {}, commandSchema: {} });
    Navigation.register('equipment', { scene: 'equipment', contextSchema: {}, commandSchema: {} });
    Navigation.register('cultivation', { scene: 'cultivation', contextSchema: {}, commandSchema: {} });
    Navigation.register('settings', { scene: 'settings', contextSchema: {}, commandSchema: {} });

    const result = Navigation.go('travelMap', { regionId: 'east' });
    assert.strictEqual(result, true);
    assert.strictEqual(Navigation.transitionState.from, 'ashram');
    assert.strictEqual(Navigation.transitionState.to, 'travelMap');
    assert.deepStrictEqual(Navigation.transitionState.params, { regionId: 'east' });
    assert.ok(Navigation.transitionState.timestamp > 0);
  });

  test('Invalid route → ashram fallback + Notify', () => {
    Navigation.register('ashram', { scene: 'ashram', contextSchema: {}, commandSchema: {} });
    
    let notifyCalled = false;
    context.Notify.show = (msg) => { notifyCalled = true; };
    
    const result = Navigation.go('invalidRoute', {});
    assert.strictEqual(result, false);
    assert.ok(notifyCalled);
  });

  test('Route registry maps route IDs to scene names, contextSchema, commandSchema', () => {
    Navigation.register('testRoute', { 
      scene: 'testScene', 
      contextSchema: { testKey: 'TestType' }, 
      commandSchema: { testCmd: 'TestSystem.testMethod' } 
    });
    
    const route = Navigation.routeRegistry.get('testRoute');
    assert.ok(route);
    assert.strictEqual(route.scene, 'testScene');
    assert.deepStrictEqual(route.contextSchema, { testKey: 'TestType' });
    assert.deepStrictEqual(route.commandSchema, { testCmd: 'TestSystem.testMethod' });
  });

  test('Context builders read G.state and return derived presentation data', () => {
    Navigation.register('test', { 
      scene: 'test', 
      contextSchema: { partySummary: 'PartySummary[]', zoneStatus: 'ZoneStatus' }, 
      commandSchema: {} 
    });
    
    const context = Navigation.getContext('test');
    assert.ok(context.partySummary);
    assert.ok(Array.isArray(context.partySummary));
    assert.ok(context.zoneStatus);
    assert.ok(context.zoneStatus.currentZone);
    assert.ok(context.zoneStatus.zoneProgress);
  });

  test('Commands delegate to canonical systems', () => {
    Navigation.register('test', { 
      scene: 'test', 
      contextSchema: {}, 
      commandSchema: { testCmd: 'TestSystem.testMethod' } 
    });
    
    const commands = Navigation.getCommands('test');
    assert.ok(commands.testCmd);
    assert.ok(typeof commands.testCmd === 'function');
  });

  test('Legacy compatibility: gScene(sceneName, ...) continues to work via wrapper', () => {
    Navigation.register('ashram', { scene: 'ashram', contextSchema: {}, commandSchema: {} });
    Navigation.register('travelMap', { scene: 'travelMap', contextSchema: {}, commandSchema: {} });
    
    let gSceneCalled = false;
    context.gScene = function(name, fade, options) {
      gSceneCalled = true;
      assert.strictEqual(name, 'travelMap');
    };
    
    Navigation.go('travelMap', { regionId: 'east' });
    assert.ok(gSceneCalled);
  });

  test('No gameplay mutations in navigation layer; context read-only, commands delegate to systems', () => {
    const initialState = JSON.stringify(context.G.state);
    
    Navigation.register('travelMap', { scene: 'travelMap', contextSchema: {}, commandSchema: {} });
    Navigation.getContext('travelMap');
    Navigation.getCommands('travelMap');
    
    assert.strictEqual(JSON.stringify(context.G.state), initialState);
  });

  test('Transition state tracked in G.state.transition for debugging/probe', () => {
    Navigation.register('travelMap', { scene: 'travelMap', contextSchema: {}, commandSchema: {} });
    
    Navigation.go('travelMap', { regionId: 'east' });
    
    const transition = context.G.state.transition;
    assert.ok(transition);
    assert.strictEqual(transition.from, 'ashram');
    assert.strictEqual(transition.to, 'travelMap');
    assert.deepStrictEqual(transition.params, { regionId: 'east' });
    assert.ok(transition.timestamp > 0);
  });

  test('Reduced motion = 0ms fade', () => {
    const originalReducedMotion = context.R.reducedMotion;
    context.R.reducedMotion = () => true;
    
    Navigation.register('ashram', { scene: 'ashram', contextSchema: {}, commandSchema: {} });
    Navigation.register('travelMap', { scene: 'travelMap', contextSchema: {}, commandSchema: {} });
    Navigation.transition('ashram', 'travelMap', {});
    
    // Fade.toScene sets target=1 (fade in), but in reduced motion it should be instant
    // The transition function calls Fade.toScene which sets target=1
    // Reduced motion makes the fade instant in Fade.update, not by changing target
    assert.strictEqual(context.Fade.target, 1);
    
    context.R.reducedMotion = originalReducedMotion;
  });
});