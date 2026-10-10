#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Wrapper for BAL-01 requirements:
// - Headless simulation of 200 Lv1 hero fights
// - Uses the existing robust deterministic simulator
const SIM = path.join(__dirname, 'combat_sim.js');
const OUTPUT_FILE = path.join(__dirname, '../tests/combat_metrics_early.json');

try {
  const output = execFileSync(process.execPath, [`"${SIM}"`, '--fights', '200', '--seed', '42'], { encoding: 'utf8', shell: true });
  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Metrics written to ${OUTPUT_FILE}`);
} catch (e) {
  console.error('Simulation failed', e);
  process.exit(1);
}
