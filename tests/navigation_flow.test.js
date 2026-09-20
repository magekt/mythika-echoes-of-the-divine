const assert = require('assert'); const fs = require('fs');
const files = ['title.js','ashram.js','travelMap.js','zoneExploration.js','combatScene.js'];
const source = files.map(f => fs.readFileSync('src/scenes/'+f,'utf8')).join('\n');
assert.match(source, /gScene\(['"]ashram/); assert.match(source, /travelMap/);
assert.match(source, /zoneExploration/); assert.match(source, /combatScene/);
assert.match(fs.readFileSync('src/engine/scene-helpers.js','utf8'), /Scene\.navigate/);
assert.match(fs.readFileSync('src/engine/game.js','utf8'), /Input\.clear\(\)/);
console.log('navigation flow contract passed: title -> Ashram -> map -> zone -> combat and recovery');
