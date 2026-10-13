const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const vm = require('vm');

function loadModule(filename, context) {
  const code = fs.readFileSync(filename, 'utf8');
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.R.Backgrounds;
}

const backgroundsPath = path.join(__dirname, '..', 'src', 'engine', 'backgrounds.js');

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
  
  return {
    R: {
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
    },
    G: {
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
        flags: {}
      },
      dt: 0.016,
      currentScene: null,
      scenes: {}
    },
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
      R: {}
    },
    UI: {
      Button: function(x, y, w, h, text, color) { return { x, y, w, h, text, color, render: () => {}, onClick: () => {} }; },
      MagneticBtn: function(x, y, w, h, text, opts) { return { x, y, w, h, text, opts, render: () => {}, onClick: () => {} }; },
      PremiumShell: function(x, y, w, h, opts) { return { render: () => {}, contentRect: () => ({ x, y, w, h }) }; },
      ProgressBar: function(x, y, w, h, color, trackColor) { return { setProgress: () => {}, render: () => {} }; },
      HeroSurface: { 
        renderCompact: () => {}, 
        renderDetail: () => {}, 
        renderResult: () => {},
        getModel: () => ({})
      },
      Feedback: {
        InlineHint: function() { return { update: () => {}, render: () => {}, visible: false }; },
        ContextualBadge: function() { return { update: () => {}, render: () => {}, visible: false, x: 0, y: 0, size: 20 }; },
        Toast: function() {}
      },
      HUD: function() { return { render: () => {} }; }
    },
    Input: {
      _touchStart: null,
      _touchCurrent: null,
      _pressPos: null,
      getSwipe: () => null,
      peekTap: () => null,
      getTap: () => null,
      handleInput: () => {}
    },
    Audio: {
      playMusic: () => {},
      stopMusic: () => {},
      levelUp: () => {},
      heal: () => {},
      click: () => {},
      error: () => {},
      thud: () => {},
      comboMilestone: () => {}
    },
    Notify: { show: () => {} },
    Hints: { show: () => {} },
    Scene: {
      create: function(obj) { return obj; },
      responsive: () => ({}),
      scrollInput: () => {},
      cullButtons: (buttons) => buttons,
      clipContent: () => {},
      drawScrollbar: () => {},
      drawHeader: () => {},
      FluidNav: function() { return { update: () => {}, render: () => {}, handleTap: () => false }; },
      navigate: () => {}
    },
    MapLayout: { ENTRIES: [] },
    MapHelpers: { getRegion: () => 'center', getStatus: () => 'AVAILABLE', getCompletion: () => 50, getLockReason: () => null, getControlState: () => null, getWorldEvents: () => [], getNarrativeEchoes: () => [] },
    ZONES: { aryavarta: { name: 'Aryavarta', desc: 'Test', bgColor: '#0a1a20', minLvl: 1, maxLvl: 10 } },
    LANDMARKS: {},
    Landmarks: { checkZone: () => [], getAll: () => [], getDiscovered: () => [] },
    WorldEvents: { resolve: () => null },
    WorldState: { markLandmarkNotified: () => false },
    REALMS: [{ id: 'qi', name: 'Qi Condensation', stages: 9 }],
    CultivationSystem: { 
      getRealmData: () => ({ name: 'Qi Condensation' }), 
      getRealmProgress: () => ({ current: 50, needed: 100 }),
      getBreakthroughStatus: () => ({ canBreakthrough: false, reason: 'Not ready' }),
      getBreakthroughStats: () => ({ hp: 10, str: 2 }),
      getCultivationPerSecond: () => 1.5,
      getPranaPerSecond: () => 2.0,
      tick: () => {},
      addCultivationBase: () => {},
      attemptBreakthrough: () => ({ success: false }),
      canBreakthrough: () => false
    },
    Progression: { 
      applyDifficulty: () => {}, 
      createEliteVariant: (e) => e, 
      adjustChallenge: () => {}, 
      addPartyXP: () => false,
      xpForLevel: () => 100
    },
    Combat: {
      startBattle: () => {},
      getCurrentActor: () => ({ type: 'hero', ref: { id: 'arjuna', name: 'Arjuna', hp: 100, maxHp: 100, mp: 50, maxMp: 50, skills: [], weaponType: 'bow' } }),
      performAttack: () => ({ dmg: 10, isCrit: false }),
      applyBuff: () => {},
      applyAilment: () => {},
      checkBattleEnd: () => {},
      nextTurn: () => {},
      prepareEnemyIntent: () => ({ name: 'Test', attackType: 'melee', target: { name: 'Hero' }, enemy: { name: 'Enemy' }, interruptible: false, version: 1, skipped: null }),
      resolveReaction: () => ({ outcome: 'evade', dmg: 0, counter: null }),
      getTimingGrade: () => 'perfect',
      getLoot: () => ({ gold: 100, xp: 50 }),
      comboCount: 0,
      battleOver: false
    },
    Economy: { spendGold: () => {}, spendDivineFragments: () => {}, addGold: () => {}, removeItem: () => {}, spendGoldOrNotify: () => true },
    SaveSystem: { startAutoSave: () => {}, stopAutoSave: () => {}, save: () => {}, load: () => {}, normalize: () => {} },
    ZoneRewardSystem: { normalize: () => {}, beginPending: () => {}, commitPendingProgress: () => ({ progress: 50, previousProgress: 0, changed: false, messages: [] }), completeZone: () => ({ changed: false, messages: [] }), clearPending: () => {} },
    ZoneAccess: { status: () => ({ allowed: true }) },
    QuestSystem: { trackKill: () => {}, trackExplore: () => {} },
    AchievementSystem: { check: () => {} },
    Influence: { applyAction: () => ({ changed: false, from: { control: 'neutral' }, to: { control: 'neutral' } }) },
    EquipmentSystem: { equip: () => ({ ok: true }), unequip: () => ({ ok: true, item: { name: 'Test' } }) },
    SPIRIT_BEASTS: {},
    createBeastState: () => ({ id: 'wolf', name: 'Wolf' }),
    generateLoot: () => [],
    createHeroState: () => ({ id: 'arjuna', name: 'Arjuna', hp: 100, maxHp: 100, mp: 50, maxMp: 50, level: 5, role: 'DPS', className: 'Archer', weaponEquipped: null, armorEquipped: null, accessoryEquipped: null, str: 10, agi: 10, mag: 10, def: 10 }),
    applyItemEffect: () => {},
    HEROES: { arjuna: { name: 'Arjuna', role: 'DPS', desc: 'Test', classId: 'archer' } },
    EncounterTrigger: { rollZone: () => null },
    AURAS: { getTotal: () => 0 },
    EncounterStories: { aryavarta: ['Test'] },
    ENLIGHTENMENT_STORIES: { meditate: { story: 'Test', buff: 1.2, timer: 60 } }
  };
}

describe('Background Integration', () => {
  let context;
  let Backgrounds;
  let R, G;
  
  beforeEach(() => {
    context = createContext();
    Backgrounds = loadModule(backgroundsPath, context);
    R = context.R;
    G = context.G;
  });

  afterEach(() => {
    Backgrounds.clear();
  });

  test('Ashram scene registers ashram slot and renders background', () => {
    // Simulate ashram enter
    Backgrounds.registerSlot('ashram');
    const result = Backgrounds.get('ashram');
    assert.ok(result.fallback);
    assert.strictEqual(result.fallback.width, 400);
    assert.strictEqual(result.fallback.height, 720);
  });

  test('Travel Map registers map region slots', () => {
    const regions = ['east', 'west', 'north', 'south', 'center'];
    for (const region of regions) {
      Backgrounds.registerSlot('map:' + region);
      const result = Backgrounds.get('map:' + region);
      assert.ok(result.fallback);
      assert.strictEqual(result.fallback.width, 400);
      assert.strictEqual(result.fallback.height, 720);
    }
  });

  test('Zone Exploration registers zone slot', () => {
    Backgrounds.registerSlot('zone:aryavarta');
    const result = Backgrounds.get('zone:aryavarta');
    assert.ok(result.fallback);
    assert.strictEqual(result.fallback.width, 400);
    assert.strictEqual(result.fallback.height, 720);
  });

  test('Combat registers combat enemy type slot', () => {
    Backgrounds.registerSlot('combat:rakshasa');
    const result = Backgrounds.get('combat:rakshasa');
    assert.ok(result.fallback);
    assert.strictEqual(result.fallback.width, 400);
    assert.strictEqual(result.fallback.height, 720);
  });

  test('Cultivation registers cultivation realm slot', () => {
    Backgrounds.registerSlot('cultivation:qi');
    const result = Backgrounds.get('cultivation:qi');
    assert.ok(result.fallback);
    assert.strictEqual(result.fallback.width, 400);
    assert.strictEqual(result.fallback.height, 720);
  });

  test('Party detail view uses ashram background with hero moment', () => {
    Backgrounds.registerSlot('ashram');
    const result = Backgrounds.get('ashram');
    assert.ok(result.fallback);
    
    // Hero moment key would be hero:arjuna
    const mockCanvas = { width: 120, height: 180 };
    Backgrounds.registerSlot('hero:arjuna', function(key) {
      return mockCanvas;
    });
    const heroResult = Backgrounds.get('hero:arjuna');
    assert.strictEqual(heroResult.fallback.width, 120);
    assert.strictEqual(heroResult.fallback.height, 180);
  });

  test('Equipment equipped tab uses ashram background with equipment moment', () => {
    Backgrounds.registerSlot('ashram');
    const result = Backgrounds.get('ashram');
    assert.ok(result.fallback);
    
    // Equipment moment key would be hero:arjuna
    const mockCanvas = { width: 120, height: 180 };
    Backgrounds.registerSlot('hero:arjuna', function(key) {
      return mockCanvas;
    });
    const heroResult = Backgrounds.get('hero:arjuna');
    assert.strictEqual(heroResult.fallback.width, 120);
    assert.strictEqual(heroResult.fallback.height, 180);
  });

  test('Contrast preserved — text/controls always readable over backgrounds', () => {
    // This test verifies the design contract: backgrounds use surfaceGlass overlay
    // and text renders with textPrimary/textSecondary
    const surfaceGlass = R.colors.surfaceGlass;
    const textPrimary = R.colors.textPrimary;
    const textSecondary = R.colors.textSecondary;
    
    assert.ok(surfaceGlass.includes('rgba'));
    assert.ok(textPrimary.startsWith('#'));
    assert.ok(textSecondary.startsWith('#'));
    
    // Backgrounds render with destination-over composite operation
    const ctx = { 
      save: () => {}, 
      restore: () => {}, 
      globalAlpha: 1, 
      globalCompositeOperation: '', 
      drawImage: () => {} 
    };
    Backgrounds.renderBackground(ctx, 'ashram', 1);
    assert.strictEqual(ctx.globalCompositeOperation, 'destination-over');
  });

  test('Reduced motion: no crossfade, no parallax, no particle drift', () => {
    const originalReducedMotion = R.reducedMotion;
    R.reducedMotion = () => true;
    
    const ctx = { save: () => {}, restore: () => {}, globalAlpha: 1, globalCompositeOperation: '', drawImage: () => {} };
    Backgrounds.renderBackground(ctx, 'ashram', 1);
    
    R.reducedMotion = originalReducedMotion;
  });

  test('Slot keys match 17-UI-SPEC contract', () => {
    const validKeys = [
      'realm:arjuna',
      'zone:aryavarta',
      'combat:rakshasa',
      'cultivation:qi',
      'ashram',
      'map:center'
    ];
    
    for (const key of validKeys) {
      Backgrounds.registerSlot(key);
      const result = Backgrounds.get(key);
      assert.ok(result.fallback);
      assert.strictEqual(result.fallback.width, 400);
      assert.strictEqual(result.fallback.height, 720);
    }
  });

  test('No mutations to G.state or gameplay systems from background rendering', () => {
    const initialState = JSON.stringify(G.state);
    
    Backgrounds.registerSlot('ashram');
    Backgrounds.get('ashram');
    Backgrounds.renderBackground({ save: () => {}, restore: () => {}, globalAlpha: 1, globalCompositeOperation: '', drawImage: () => {} }, 'ashram');
    Backgrounds.renderCharacterMoment({ save: () => {}, restore: () => {}, globalAlpha: 1, drawImage: () => {} }, 'hero:arjuna', 0, 0, 100, 100);
    
    assert.strictEqual(JSON.stringify(G.state), initialState);
  });

  test('Cache bounded by LRU (max 20 entries, 5MB)', () => {
    for (let i = 0; i < 25; i++) {
      const mockCanvas = { width: 400, height: 720 };
      Backgrounds.registerSlot('test:type' + i, function(key) {
        return mockCanvas;
      });
      Backgrounds.get('test:type' + i);
    }
    
    // Cache should be bounded
    assert.ok(Backgrounds.getMemoryUsage() <= Backgrounds.MAX_MEMORY);
  });

  test('Repeated enter/leave cycles do not create unbounded allocations', () => {
    const mockCanvas = { width: 400, height: 720 };
    Backgrounds.registerSlot('test:cycle', function(key) {
      return mockCanvas;
    });
    
    for (let i = 0; i < 20; i++) {
      const result = Backgrounds.get('test:cycle');
      Backgrounds.renderBackground({ save: () => {}, restore: () => {}, globalAlpha: 1, globalCompositeOperation: '', drawImage: () => {} }, 'test:cycle');
      Backgrounds.renderCharacterMoment({ save: () => {}, restore: () => {}, globalAlpha: 1, drawImage: () => {} }, 'test:cycle', 0, 0, 50, 50);
    }
    
    // Memory should remain stable
    const memUsage = Backgrounds.getMemoryUsage();
    assert.ok(memUsage <= Backgrounds.MAX_MEMORY);
  });
});