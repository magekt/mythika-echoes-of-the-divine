const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const ctx = {
  console: console,
  process: process,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
  Uint8Array: Uint8Array,
  Date: Date,
  Math: Math,
  JSON: JSON,
  crypto: require('crypto').webcrypto,
  atob: a => Buffer.from(a, 'base64').toString('binary'),
  btoa: b => Buffer.from(b, 'binary').toString('base64'),
  localStorage: (function() {
    let s = {};
    return {
      getItem: k => s[k] || null,
      setItem: (k, v) => { s[k] = String(v); },
      removeItem: k => { delete s[k]; },
      clear: () => { s = {}; }
    };
  })(),
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  },
  StorageEvent: class {},
  document: { dispatchEvent: () => {} },
  Event: class {}
};
ctx.window = ctx;

const files = [
  'src/data/heroes.js',
  'src/data/enemies.js',
  'src/data/zones.js',
  'src/data/items.js',
  'src/data/classes.js',
  'src/data/cultivation.js',
  'src/data/alchemy_recipes.js',
  'src/data/spirit_beasts.js',
  'src/data/quests.js',
  'src/data/achievements.js',
  'src/data/auras.js',
  'src/data/perks.js',
  'src/data/journeys.js',
  'src/engine/localAuth.js',
  'src/systems/economy.js',
  'src/systems/hints.js',
  'src/systems/progression.js',
  'src/systems/alchemy.js',
  'src/systems/cultivation_sys.js',
  'src/systems/save.js',
  'src/systems/quest.js',
  'src/systems/achievements.js',
  'src/systems/combat.js',
  'src/systems/duel.js',
  'src/systems/journey.js'
];

vm.createContext(ctx);

// Setup minimal G engine state
vm.runInContext(`
  const G = {
    state: {
      gold: 100,
      karma: 0,
      divineFragments: 0,
      ashramLevel: 1,
      realm: 'shishya',
      realmStage: 1,
      cultivationBase: 0,
      prana: 10,
      party: [],
      inventory: [],
      equipped: {},
      completedQuests: [],
      activeQuests: [],
      achievements: [],
      flags: {}
    },
    SCROLL_SPEED: 1,
    W: 400,
    H: 720,
    CONTENT_TOP: 116
  };
  const Notify = {
    show: (msg) => console.log('   [Notify]', msg),
    achievement: (name, desc) => console.log('   [Achievement Unlock]', name, desc)
  };
  const Audio = {
    play: () => {},
    levelUp: () => {},
    error: () => {},
    menuSwoosh: () => {}
  };
`, ctx);

for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  vm.runInContext(code, ctx);
}

console.log('All 24 data and system files loaded cleanly in VM!');

// Run test suite
vm.runInContext(`
(async function() {
  console.log('--- Testing Economy ---');
  Economy.addGold(50);
  if (G.state.gold !== 150) throw new Error('addGold failed');
  Economy.spendGold(20);
  if (G.state.gold !== 130) throw new Error('spendGold failed');
  console.log('Economy PASS');

  console.log('--- Testing Cultivation ---');
  const r0 = CultivationSystem.getRealmData();
  console.log('Initial realm:', r0.name);
  CultivationSystem.addCultivationBase(1000);
  if (G.state.cultivationBase < 1000) throw new Error('addCultivationBase failed');
  const canBreak = CultivationSystem.canBreakthrough();
  console.log('Can breakthrough:', canBreak);
  const breakRes = CultivationSystem.attemptBreakthrough();
  console.log('Breakthrough result:', breakRes);
  console.log('Cultivation PASS');

  console.log('--- Testing Party & Combat ---');
  const hero = { ...HEROES.arjuna, hp: HEROES.arjuna.maxHp, mp: HEROES.arjuna.maxMp, level: 1 };
  G.state.player = hero;
  G.state.party = [hero];
  const enemy = { ...ENEMIES.wolf, hp: ENEMIES.wolf.hp, maxHp: ENEMIES.wolf.hp };
  Combat.startBattle([hero], [enemy]);
  console.log('Encounter started with:', Combat.enemies.map(e => e.name));
  const dmg = Combat.calcDamage(hero, enemy);
  enemy.hp = Math.max(0, enemy.hp - dmg);
  console.log('Damage dealt:', dmg, 'Enemy HP after attack:', enemy.hp);
  console.log('Combat PASS');

  console.log('--- Testing Save System ---');
  SaveSystem.save();
  G.state.gold = 9999;
  SaveSystem.load();
  if (G.state.gold !== 130) throw new Error('Save/load failed to restore gold');
  console.log('Save PASS');

  console.log('--- Testing Alchemy ---');
  AlchemySystem.learnRecipe('xpPill');
  const learned = AlchemySystem.getLearnedRecipes();
  if (!learned.some(r => r.id === 'xpPill')) throw new Error('Recipe learning failed');
  console.log('Alchemy PASS');

  console.log('--- Testing Quests ---');
  const zoneQ = QuestSystem.getQuests('aryavarta');
  console.log('Aryavarta quests count:', zoneQ.length);
  if (zoneQ.length === 0) throw new Error('No quests found for aryavarta');
  console.log('Quest PASS');

  console.log('--- Testing LocalAuth ---');
  const reg = await LocalAuth.signUpEmail('hero@mythika.com', 'Password123');
  console.log('Registered user:', reg.user && reg.user.email);
  if (!reg.user) throw new Error('Sign up failed: ' + (reg.error || ''));
  LocalAuth.signOut();
  const login = await LocalAuth.signInEmail('hero@mythika.com', 'Password123');
  if (!login.user) throw new Error('Login failed: ' + (login.error || ''));
  console.log('Logged in user:', login.user.email);
  console.log('LocalAuth PASS');
  console.log('*** ALL NODE.JS UNIT TESTS PASSED ***');
})().catch(e => {
  console.error('TEST FAILURE:', e);
  process.exit(1);
});
`, ctx);
