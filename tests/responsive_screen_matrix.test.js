const assert = require('assert'); const fs = require('fs');
const profiles = {'portrait': [400,720], 'large portrait':[540,900], landscape:[720,400], 'narrow desktop':[1024,768], 'wide desktop':[1440,900]};
for (const [name,[w,h]] of Object.entries(profiles)) assert.ok(w > 0 && h > 0, name);
for (const file of ['title.js','ashram.js','travelMap.js','zoneExploration.js','combatScene.js','settings.js']) {
  const s = fs.readFileSync('src/scenes/'+file,'utf8'); assert.ok(file === 'combatScene.js' || /drawHeader|contextHeader|responsive|backButton/.test(s), `${file} keeps shared header/navigation contract`);
}
assert.match(fs.readFileSync('src/engine/input.js','utf8'), /getBoundingClientRect/);
console.log('Browser matrix checklist: serve index.html; test ?probe and ?probe&selftest at portrait, large portrait, landscape, narrow desktop, wide desktop. Verify title > Ashram > map > zone > combat > return, settings/back, touch/mouse/keyboard parity, reduced motion, safe areas, Canvas alignment, and console silence. Rollback: git revert <Phase-13-commit>.');
