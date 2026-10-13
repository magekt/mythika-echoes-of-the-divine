const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('src/scenes/combatScene.js', 'utf8');
const executable = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

function has(pattern, message) {
  assert(pattern.test(executable), message);
}

has(/getCombatLayout\s*:\s*function/, 'combat layout helper is required');
for (const band of ['header', 'roster', 'intent', 'log', 'actions', 'result']) {
  has(new RegExp(band + ':\\s*\\{'), `named ${band} band is required`);
}
has(/turnState\s*!==\s*'reactionWindow'\s*&&\s*this\.data\.turnState\s*!==\s*'result'/, 'normal log must be hidden during reaction and result states');
has(/turnState\s*===\s*'reactionWindow'/, 'reaction layout branch is required');
has(/turnState\s*===\s*'result'/, 'result layout branch is required');
has(/UI\.handleButtons\(this\.data\.actionButtons,\s*this\.getActionAreaTop\(\)\s*-\s*6\s*-\s*this\.data\.scrollY\)/, 'logical action offset must remain intact');
has(/UI\.Button\([^\n]*,\s*44,/, 'action controls must retain a minimum 44px hit target');
has(/R\.reducedMotion\(\)/, 'reduced-motion guard must remain available to combat presentation');
for (const call of ['Combat.performAttack', 'Combat.resolveReaction', 'Combat.checkBattleEnd', 'Combat.getLoot', 'Progression.addPartyXP', 'Economy.addGold', 'ZoneRewardSystem.commitPendingProgress', 'SaveSystem.save']) {
  assert(executable.includes(call), `authoritative call removed: ${call}`);
}
has(/buildContinueButton[\s\S]*?returnToExploration[\s\S]*?gScene\('zoneExploration'/, 'origin-aware continuation path is required');
assert(!/console\.log\s*\(/.test(executable), 'combat must not add unconditional debug logging');

console.log('combat_readability.test.js: all contracts passed');
