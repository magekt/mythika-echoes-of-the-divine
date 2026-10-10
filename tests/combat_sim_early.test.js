const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

test('BAL-01 metrics meet pacing requirements', () => {
  const metricsPath = path.join(__dirname, 'combat_metrics_early.json');
  
  // Ensure data exists
  if (!fs.existsSync(metricsPath)) {
      execSync(path.join(__dirname, '../tools/combat_sim_early.js'));
  }
  
  const results = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  const m = results.metrics;

  // BAL-01 requirements:
  // - Lv1 hero loses ≥15% HP on average over first five fights
  // - ≥5% of zone-1 runs result in hero death
  assert.ok(m.meanHpLossFirstFive >= 0.15, `HP loss too low: ${m.meanHpLossFirstFive} (expected >= 0.15)`);
  assert.ok(m.deathRate >= 0.05, `Death rate too low: ${m.deathRate} (expected >= 0.05)`);
});
