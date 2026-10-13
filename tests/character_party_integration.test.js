const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
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

const context = { Progression: { xpForLevel: level => level * 100 }, calcHeroStats: hero => ({ maxHp: hero.maxHp || 100, maxMp: hero.maxMp || 40 }) };
vm.runInNewContext(shared, { globalThis: context });
const fresh = { id: 'fresh', name: 'Aster', role: 'Vanguard', level: 2, hp: 90, maxHp: 120, mp: 20, maxMp: 40, xp: 50, weaponEquipped: { name: 'Iron Fang' } };
const partial = { name: 'Unknown recruit', hp: 0, level: 0 };
const defeated = { name: 'Fallen ally', role: 'Support', hp: 0, maxHp: 80, ailmentName: 'Stunned', ailments: [{ name: 'Poisoned' }] };
const legacy = { name: 'Legacy hero', classId: 'mystic', hp: 12, maxHp: 20, xp: 3, armorEquipped: { name: 'Old robe' } };
for (const [hero, expectedRole, expectedStatus] of [[fresh, 'Vanguard', 'No active status'], [partial, 'Unassigned role', 'No active status'], [defeated, 'Support', 'Stunned'], [legacy, 'Unassigned role', 'No active status']]) {
  const before = JSON.stringify(hero);
  const model = context.UI.HeroSurface.getModel(hero, 'detail');
  assert.strictEqual(model.role, expectedRole, 'role fallback/identity is stable');
  assert(model.status.includes(expectedStatus), 'status fallback remains readable');
  assert(model.hp.max >= 1 && model.xp.needed >= 1, 'legacy health and XP remain bounded');
  assert.strictEqual(JSON.stringify(hero), before, 'view-model derivation is read-only');
}
assert.strictEqual(context.UI.HeroSurface.getModel(defeated, 'result').nextAction, 'Return to safety', 'defeated result keeps safe continuation');
assert.strictEqual(context.UI.HeroSurface.getModel(fresh, 'cultivation').nextAction, 'Meditate or break through', 'cultivation exposes canonical next action');
assert.strictEqual(context.UI.HeroSurface.getModel(fresh, 'combat').nextAction, 'Act or target a foe', 'combat exposes canonical next action');
console.log('character_party_integration.test.js: all contracts passed');
