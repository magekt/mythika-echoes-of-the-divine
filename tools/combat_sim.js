#!/usr/bin/env node
/* tools/combat_sim.js
 *
 * Headless 200-fight combat simulator (Phase 30, Plan 30-02). Produces the
 * HP-loss / death-rate / clear-rate numbers BAL-01/BAL-02 assert against in
 * Phase 35. Measurement only: no combat-rule or data edits.
 *
 * METHOD (per CONTEXT decision): parse index.html at runtime for the local
 * <script src="src/..."> order, concatenate the remaining sources into ONE
 * Node vm script, and run it in a single vm.createContext. One script (not
 * one runInContext per file) preserves the lexical-`const` globals shared
 * across the ~94 classic script tags without refactoring game code.
 *
 * SKIPS (logged to stderr, recorded in provenance):
 *   - src/engine/firebase-config.js + src/engine/auth.js (network/auth
 *     surface the sim must not touch; the inline Firebase module bridge is
 *     never picked up because only src="src/..." tags are parsed);
 *   - src/main.js (boot IIFE: would call bootGame/gInit and enter scenes;
 *     the sim needs systems + data, never the boot wiring);
 *   - src/systems/bond.js (defines BOTH BondSystem and BeastBond; kept
 *     ABSENT deliberately so the sim measures base pacing).
 *
 * HERO CONSTRUCTION: createHeroState(HERO_IDS[0]) — the first roster hero
 * (arjuna) via the real factory — then weaponEquipped/armorEquipped/
 * accessoryEquipped nulled (no equipment/forge bonuses), level pinned to 1,
 * HP/MP refilled. Everything else (stats, skills) is verbatim base data.
 *
 * ENCOUNTER MIRROR: zoneExploration.triggerEncounter (src/scenes/
 * zoneExploration.js) minus scene navigation and reward commit:
 *   getZoneEnemy('aryavarta', 1) -> Progression.applyDifficulty ->
 *   25% Progression.createEliteVariant -> pctGain = 5 + floor(rand*15)
 *   (x1.5 when elite). RNG call order is preserved so the stream matches.
 * fightsToClear = ceil(100 / meanPctGain); both the measured increment and
 * the derived count are reported (never a hardcoded 16%).
 *
 * FIGHT POLICY (fixed, transparent): each round, every alive hero strikes a
 * random alive enemy via Combat.performAttack(hero, target, null) (basic
 * attack, no skills), then every alive enemy acts via Combat.enemyAI. One
 * combatant action = one turn; 200-turn cap per fight (cap hits flagged,
 * never infinite). Combatants are deep-cloned per fight: no state leaks.
 *
 * DETERMINISM: mulberry32(seed) replaces Math.random INSIDE the vm context
 * before sources evaluate. stdout is the JSON report ONLY (audit logs go to
 * stderr), so `--seed 1 --fights 200` twice is byte-identical.
 *
 * CLI: node tools/combat_sim.js --seed 1 --fights 200 [--json out.json]
 * Full 200-fight default run completes in < 60s on a dev machine.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');

const SKIP_FILES = new Set([
  'src/engine/firebase-config.js',
  'src/engine/auth.js',
  'src/main.js',
  'src/systems/bond.js'
]);

function parseArgs(argv) {
  const out = { seed: 1, fights: 200, json: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--seed' && i + 1 < argv.length) out.seed = Number(argv[++i]);
    else if (argv[i] === '--fights' && i + 1 < argv.length) out.fights = Number(argv[++i]);
    else if (argv[i] === '--json' && i + 1 < argv.length) out.json = argv[++i];
  }
  if (!Number.isFinite(out.seed)) out.seed = 1;
  if (!Number.isFinite(out.fights) || out.fights < 1) out.fights = 200;
  out.fights = Math.floor(out.fights);
  return out;
}

function localScriptOrder() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const re = /<script\s+[^>]*src="([^"]+)"[^>]*>/gi;
  const order = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1].startsWith('src/')) order.push(m[1]);
  }
  return order;
}

// Deterministic PRNG (same algorithm family the sweep driver uses).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildContext(seed) {
  const storage = new Map();
  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: function () { return Date.now(); } },
    location: { search: '', protocol: 'file:', href: 'file://combat-sim' },
    navigator: {},
    localStorage: {
      getItem: function (k) { return storage.has(k) ? storage.get(k) : null; },
      setItem: function (k, v) { storage.set(k, String(v)); },
      removeItem: function (k) { storage.delete(k); }
    },
    document: {
      getElementById: function () { return null; },
      addEventListener: function () {},
      removeEventListener: function () {},
      createElement: function () { return { getContext: function () { return null; }, style: {} }; },
      body: { appendChild: function () {}, removeChild: function () {} },
      hidden: true
    },
    window: {
      innerWidth: 400,
      innerHeight: 720,
      devicePixelRatio: 1,
      addEventListener: function () {},
      removeEventListener: function () {},
      location: { search: '', protocol: 'file:', href: 'file://combat-sim' },
      matchMedia: function () { return { matches: false }; }
    },
    requestAnimationFrame: function () { return 0; },
    cancelAnimationFrame: function () {}
  });

  // Seed BEFORE sources evaluate so every load-time and runtime draw from
  // Math.random is deterministic.
  context.__mulberry32 = mulberry32;
  vm.runInContext('Math.random = __mulberry32(' + (seed >>> 0) + ');', context);

  const order = localScriptOrder();
  const loaded = [];
  const skipped = [];
  const parts = [];
  for (const rel of order) {
    if (SKIP_FILES.has(rel)) {
      skipped.push(rel);
      continue;
    }
    const full = path.join(ROOT, rel);
    parts.push(fs.readFileSync(full, 'utf8') + '\n');
    loaded.push(rel);
  }
  const combined = parts.join('\n;\n');
  try {
    vm.runInContext(combined, context, { filename: 'combat_sim_combined.js' });
  } catch (e) {
    console.error('combat_sim: context evaluation failed: ' + (e && e.stack ? e.stack : e));
    process.exit(2);
  }

  // Post-eval stubs: silence side-effectful outputs of the real pipeline.
  vm.runInContext([
    'if (typeof Audio !== "undefined" && Audio) {',
    '  ["hit","crit","skill","heal","combo","levelUp","click","playMusic"].forEach(function(k){',
    '    try { Audio[k] = function(){}; } catch (e) {}',
    '  });',
    '}',
    'if (typeof R !== "undefined" && R) { try { R.triggerComboFlash = function(){}; } catch (e) {} }',
    'if (typeof Progression !== "undefined" && Progression) { try { Progression.perkValue = function(){ return 0; }; } catch (e) {} }',
    'if (typeof AURAS !== "undefined" && AURAS) { try { AURAS.getTotal = function(){ return 0; }; } catch (e) {} }'
  ].join('\n'), context);

  const bondAbsent = vm.runInContext(
    '(typeof BondSystem === "undefined") && (typeof BeastBond === "undefined");', context);

  return { context, loaded, skipped, bondAbsent: !!bondAbsent };
}

const DRIVER_SRC = `
(function (FIGHTS) {
  var HERO_ID = HERO_IDS[0];
  function baseHero() {
    var h = createHeroState(HERO_ID);
    h.weaponEquipped = null;
    h.armorEquipped = null;
    h.accessoryEquipped = null;
    h.level = 1;
    h.xp = 0;
    h.hp = h.maxHp;
    h.mp = h.maxMp;
    return h;
  }
  G.state.currentZone = 'aryavarta';
  G.state.player = baseHero();
  var perFight = [];
  var deathFights = 0;
  var hpLossFirstFive = 0;
  var pctGainSum = 0;
  var capHits = 0;
  for (var f = 0; f < FIGHTS; f++) {
    var hero = JSON.parse(JSON.stringify(baseHero()));
    // --- encounter mirror (zoneExploration.triggerEncounter order) ---
    var enemy = getZoneEnemy('aryavarta', 1);
    Progression.applyDifficulty([enemy]);
    var elite = false;
    if (Math.random() < 0.25) {
      enemy = Progression.createEliteVariant(enemy);
      elite = true;
    }
    var pctGain = 5 + Math.floor(Math.random() * 15);
    if (elite) pctGain = Math.floor(pctGain * 1.5);
    pctGainSum += pctGain;
    // --- fight loop: fixed transparent policy ---
    Combat.startBattle([hero], [JSON.parse(JSON.stringify(enemy))]);
    var battleHero = Combat.heroes[0];
    var heroMax = battleHero.maxHp;
    var turns = 0;
    var CAP = 200;
    while (!Combat.battleOver && turns < CAP) {
      var ah = Combat.getAliveHeroes();
      for (var i = 0; i < ah.length && !Combat.battleOver && turns < CAP; i++) {
        var tgt = Combat.getRandomEnemy();
        if (!tgt) break;
        Combat.performAttack(ah[i], tgt, null);
        turns++;
      }
      if (Combat.battleOver) break;
      var ae = Combat.getAliveEnemies();
      for (var j = 0; j < ae.length && !Combat.battleOver && turns < CAP; j++) {
        Combat.enemyAI(ae[j]);
        turns++;
      }
    }
    var capHit = !Combat.battleOver;
    if (capHit) capHits++;
    var hpLoss = heroMax > 0 ? (heroMax - Math.max(0, battleHero.hp)) / heroMax : 0;
    var died = battleHero.hp <= 0;
    if (died) deathFights++;
    if (f < 5) hpLossFirstFive += hpLoss;
    perFight.push({
      fight: f + 1,
      enemy: enemy.name,
      enemyLevel: enemy.level,
      elite: elite,
      turns: turns,
      hpLoss: Math.round(hpLoss * 10000) / 10000,
      heroDied: died,
      capHit: capHit,
      pctGain: pctGain
    });
  }
  var n5 = Math.min(5, FIGHTS);
  var meanHpLossFirstFive = n5 > 0 ? hpLossFirstFive / n5 : 0;
  var meanPctGain = FIGHTS > 0 ? pctGainSum / FIGHTS : 0;
  return {
    perFight: perFight,
    deathFights: deathFights,
    meanHpLossFirstFive: Math.round(meanHpLossFirstFive * 10000) / 10000,
    deathRate: Math.round((deathFights / FIGHTS) * 10000) / 10000,
    meanPctGain: Math.round(meanPctGain * 100) / 100,
    fightsToClear: meanPctGain > 0 ? Math.ceil(100 / meanPctGain) : null,
    capHits: capHits
  };
})
`;

function main() {
  const args = parseArgs(process.argv.slice(2));
  const built = buildContext(args.seed);
  console.error('combat_sim: seed=' + args.seed +
    ' filesLoaded=' + built.loaded.length +
    ' filesSkipped=' + built.skipped.length +
    ' bondSystemsAbsent=' + built.bondAbsent);
  if (!built.bondAbsent) {
    console.error('combat_sim: FATAL: BondSystem/BeastBond present; base-pacing measurement compromised');
    process.exit(2);
  }
  let summary;
  try {
    const driver = vm.runInContext(DRIVER_SRC, built.context);
    summary = driver(args.fights);
  } catch (e) {
    console.error('combat_sim: campaign driver failed: ' + (e && e.stack ? e.stack : e));
    process.exit(2);
  }
  const report = {
    seed: args.seed,
    fights: args.fights,
    policy: 'heroes-basic-attack-random-target_then_enemyAI_per-round_200-action-cap',
    partySize: 1,
    heroId: null,
    metrics: {
      meanHpLossFirstFive: summary.meanHpLossFirstFive,
      deathRate: summary.deathRate,
      fightsToClear: summary.fightsToClear,
      meanPctGain: summary.meanPctGain,
      deathFights: summary.deathFights,
      capHits: summary.capHits,
      perFight: summary.perFight
    },
    provenance: {
      filesLoaded: built.loaded.length,
      filesSkipped: built.skipped,
      bondSystemsAbsent: built.bondAbsent,
      encounterMirror: 'zoneExploration.triggerEncounter (getZoneEnemy -> applyDifficulty -> 25% elite -> pctGain roll order preserved)',
      heroConstruction: 'createHeroState(HERO_IDS[0]) with equipped slots nulled, level 1, HP/MP full'
    }
  };
  try {
    report.heroId = vm.runInContext('HERO_IDS[0];', built.context);
  } catch (e) { report.heroId = 'unknown'; }
  const json = JSON.stringify(report);
  if (args.json) fs.writeFileSync(args.json, json);
  process.stdout.write(json + '\n');
}

main();
