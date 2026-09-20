const assert = require('assert');
const fs = require('fs');
const read = file => fs.readFileSync('src/scenes/' + file, 'utf8');
const shared = fs.readFileSync('src/ui/heroSurface.js', 'utf8');

assert(shared.includes('getModel'), 'shared hero selector exists');
for (const [file, variant] of [['party.js', 'renderCompact'], ['equipment.js', 'renderDetail'], ['cultivationScene.js', 'renderDetail'], ['combatScene.js', 'renderCompact'], ['combatScene.js', 'renderResult']]) {
  assert(read(file).includes('UI.HeroSurface.' + variant), `${file} consumes ${variant}`);
}
const party = read('party.js');
const equipment = read('equipment.js');
const cultivation = read('cultivationScene.js');
const combat = read('combatScene.js');
assert(/EquipmentSystem\.equip/.test(party), 'party keeps equipment authority');
assert(/EquipmentSystem\.equip/.test(equipment) && /EquipmentSystem\.unequip/.test(equipment), 'equipment keeps equipment authority');
assert(/CultivationSystem\.addCultivationBase/.test(cultivation) && /CultivationSystem\.attemptBreakthrough/.test(cultivation), 'cultivation keeps canonical actions');
for (const call of ['Combat.performAttack', 'Combat.checkBattleEnd', 'Progression.addPartyXP', 'SaveSystem.save']) assert(combat.includes(call), `combat keeps ${call}`);
assert(!/G\.state\.(xp|gold|party)\s*=/.test(shared), 'hero surface does not mutate canonical state');
assert(/turnState !== 'reactionWindow' && this\.data\.turnState !== 'result'/.test(combat), 'Phase 14 log band remains exclusive');
assert(/layout\.result/.test(combat), 'result geometry remains named and distinct');
console.log('character_party_integration.test.js: all contracts passed');
