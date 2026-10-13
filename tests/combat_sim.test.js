/* tests/combat_sim.test.js
 *
 * Contract tests for the Phase 30 headless combat simulator (Plan 30-02).
 * node:test + assert/strict, stdlib only; spawns tools/combat_sim.js as a
 * child process. Small fight counts (<=20) keep the file fast.
 *
 * Deliberately NOT asserted here: BAL-01 thresholds (>=15% HP loss, >=5%
 * deaths). Those are Phase 35 tuning asserts against sim output; the current
 * build may legitimately fail them (that is the pacing bug, not a sim bug).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SIM = path.join(ROOT, 'tools/combat_sim.js');

function run(args, timeoutMs) {
  const stdout = execFileSync(process.execPath, [SIM].concat(args), {
    encoding: 'utf8',
    timeout: timeoutMs || 30000,
    maxBuffer: 16 * 1024 * 1024
  });
  return stdout;
}

test('same seed twice produces identical stdout', () => {
  const a = run(['--seed', '7', '--fights', '20']);
  const b = run(['--seed', '7', '--fights', '20']);
  assert.equal(a, b);
});

test('different seeds produce parseable finite metrics', () => {
  const a = JSON.parse(run(['--seed', '7', '--fights', '20']));
  const b = JSON.parse(run(['--seed', '8', '--fights', '20']));
  for (const r of [a, b]) {
    assert.equal(typeof r.seed, 'number');
    assert.equal(r.fights, 20);
    assert.ok(Number.isFinite(r.metrics.meanHpLossFirstFive));
    assert.ok(Number.isFinite(r.metrics.deathRate));
    assert.ok(r.metrics.meanHpLossFirstFive >= 0 && r.metrics.meanHpLossFirstFive <= 1);
    assert.ok(r.metrics.deathRate >= 0 && r.metrics.deathRate <= 1);
    assert.ok(Number.isFinite(r.metrics.fightsToClear) && r.metrics.fightsToClear > 0);
    assert.equal(r.metrics.perFight.length, 20);
  }
  // (Almost certainly different streams; not asserted strictly.)
  assert.ok(a.metrics.perFight.length === 20 && b.metrics.perFight.length === 20);
});

test('output shape carries exactly the BAL-01/BAL-02 input metrics', () => {
  const r = JSON.parse(run(['--seed', '3', '--fights', '10']));
  assert.ok(r.policy && typeof r.policy === 'string');
  assert.equal(r.partySize, 1);
  for (const k of ['meanHpLossFirstFive', 'deathRate', 'fightsToClear', 'perFight']) {
    assert.ok(k in r.metrics, 'metrics.' + k + ' present');
  }
  assert.ok(r.provenance && typeof r.provenance === 'object');
  for (const f of r.metrics.perFight) {
    for (const k of ['fight', 'enemy', 'enemyLevel', 'turns', 'hpLoss', 'heroDied', 'pctGain']) {
      assert.ok(k in f, 'perFight.' + k + ' present');
    }
    assert.ok(f.turns <= 200);
  }
});

test('--fights 20 completes within 30s (speed guard)', () => {
  const t0 = Date.now();
  run(['--seed', '9', '--fights', '20'], 30000);
  assert.ok(Date.now() - t0 < 30000);
});

test('honesty guard: base-pacing provenance, no NaN/undefined leakage', () => {
  const stdout = run(['--seed', '11', '--fights', '10']);
  assert.ok(stdout.indexOf('NaN') === -1, 'stdout must not contain NaN');
  assert.ok(stdout.indexOf('undefined') === -1, 'stdout must not contain undefined');
  const r = JSON.parse(stdout);
  assert.equal(r.provenance.bondSystemsAbsent, true);
  // Real Combat pipeline: enemies come from the Aryavarta table.
  const zonePool = ['Bandit', 'Wolf', 'Giant Spider', 'Rakshasa', 'Wild Boar', 'Cobra'];
  for (const f of r.metrics.perFight) {
    const base = f.enemy.replace(/^(Elder|Ancient|Corrupted|Frenzied|Blessed) /, '');
    assert.ok(zonePool.indexOf(base) !== -1, 'enemy ' + f.enemy + ' from zone-1 table');
  }
});
