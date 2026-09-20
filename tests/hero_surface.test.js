const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui/heroSurface.js', 'utf8');
const context = { UI: {}, R: {}, calcHeroStats: hero => ({ maxHp: hero.hp + 10, maxMp: hero.mp + 2, str: 7, agi: 8, mag: 9, def: 10 }), Progression: { xpForLevel: level => level * 100 }, console };
vm.runInNewContext(source, context);
const surface = context.UI.HeroSurface;
assert(surface && typeof surface.getModel === 'function', 'HeroSurface selector is exported');

const hero = {
  id: 'arjuna', name: 'Arjuna', role: 'Ranged DPS', className: 'Kshatriya', level: 3, xp: 40,
  hp: 70, maxHp: 100, mp: 12, maxMp: 30,
  weaponEquipped: { name: 'Bow', type: 'weapon' }, armorEquipped: null, accessoryEquipped: { name: 'Amulet', type: 'accessory' },
  ailmentName: 'Bleed', buffs: [{ name: 'Focus' }]
};
const before = JSON.stringify(hero);
const model = surface.getModel(hero, 'detail');
assert.strictEqual(model.name, 'Arjuna');
assert.strictEqual(model.role, 'Ranged DPS');
assert.deepStrictEqual(model.hp, { current: 70, max: 110, ratio: 70 / 110 });
assert.strictEqual(model.xp.needed, 300);
assert.deepStrictEqual(model.equipment.map(slot => slot.label), ['Bow', 'Empty', 'Amulet']);
assert.match(model.status, /Bleed/);
assert.match(model.nextAction, /equip|inspect/i);
assert.deepStrictEqual(model.stats, { maxHp: 110, maxMp: 32, str: 7, agi: 8, mag: 9, def: 10 });
assert.strictEqual(JSON.stringify(hero), before, 'selector does not mutate hero state');

const fallback = surface.getModel({ hp: 'bad', level: 'old', weaponEquipped: [], buffs: 'bad' }, 'result');
assert.strictEqual(fallback.name, 'Unknown hero');
assert.strictEqual(fallback.hp.current, 0);
assert.strictEqual(fallback.equipment[0].label, 'Empty');
assert.match(fallback.status, /No active status/);
assert.match(fallback.nextAction, /continue|return/i);
assert.doesNotThrow(() => surface.getModel(null, 'compact'));

console.log('hero_surface.test.js: RED contract is active');
