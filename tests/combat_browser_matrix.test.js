const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('src/scenes/combatScene.js', 'utf8');
const executable = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const profiles = [
  ['400x720', 'portrait'],
  ['540x900', 'large portrait'],
  ['720x400', 'landscape'],
  ['1024x768', 'narrow desktop'],
  ['1440x900', 'wide desktop']
];
const inputs = ['touch tap', 'mouse click', 'keyboard activation'];

function includes(text, message) {
  assert(executable.includes(text), message);
}

includes('doPlayerAttack', 'attack action route is required');
includes('reactionWindow', 'reaction state route is required');
includes('endBattle', 'battle result route is required');
includes('buildContinueButton', 'labeled continuation builder is required');
includes('returnToExploration', 'origin-aware return route is required');
assert(/gScene\('zoneExploration'/.test(executable), 'zone exploration return must remain available');
assert(/gScene\('ashram'/.test(executable), 'Ashram fallback return must remain available');
assert(/G\.(W|H)/.test(executable), 'logical responsive viewport contract is required');
assert(/UI\.handleButtons\(this\.data\.actionButtons/.test(executable), 'Canvas action routing must remain present');
assert(/R\.reducedMotion/.test(executable), 'reduced-motion presentation contract is required');
assert(!/console\.log\s*\(/.test(executable), 'combat source must not contain unconditional debug logging');

console.log('combat_browser_matrix.test.js: source contract passed');
console.log('Manual browser matrix (REQ-024):');
for (const [size, label] of profiles) {
  console.log(`- ${size} (${label}): normal -> attack -> reaction/result -> Continue`);
  console.log(`  inputs: ${inputs.join(', ')}; repeat with reduced motion and ?probe`);
}
console.log('- Victory: verify XP/gold/effect summary and returnToExploration -> zoneExploration.');
console.log('- Defeat: verify defeat summary and labeled Continue -> Ashram.');
