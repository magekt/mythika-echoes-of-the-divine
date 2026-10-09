const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/scenes/equipment.js', 'utf8');
const buttonSource = fs.readFileSync('src/ui/button.js', 'utf8');
const characterCreate = fs.readFileSync('src/scenes/characterCreate.js', 'utf8');

assert(!source.includes("UI.HeroSurface.getModel(this.data.selectedHero, 'equipment')"),
  'Equipment should not eagerly call the optional HeroSurface selector while building UI');
assert(source.includes("UI.HeroSurface.renderDetail(ctx, 14, y, G.W - 28, 78, equipmentScene.data.selectedHero, 'equipment')"),
  'Equipment should render through the canonical HeroSurface detail renderer');
assert(source.includes('EquipmentSystem.equip(hero, item)'), 'Equipment keeps the canonical equip route');
assert(source.includes('EquipmentSystem.unequip(hero, slotType)'), 'Equipment keeps the canonical unequip route');
assert(!source.includes('UI.HeroSurface.getModel(this.data.selectedHero'),
  'Equipment must not eagerly resolve an optional hero surface model during build');
assert(characterCreate.includes("id: 'starter_leather'"),
  'Fresh heroes receive a deterministic starter equipment item');
assert(characterCreate.includes("G.state.inventory = []"),
  'Starter inventory is initialized only while creating a new hero');
assert(source.includes('Your inventory is quiet'),
  'Equipment renders an intentional empty-inventory state');
assert(buttonSource.includes('const UI = globalThis.UI = {};'),
  'The shared UI namespace must be registered globally before HeroSurface loads');

console.log('equipment_scene_regression.test.js: PASS');
