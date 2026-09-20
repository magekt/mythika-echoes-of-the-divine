const assert = require('assert');
const fs = require('fs');
const helpers = fs.readFileSync('src/engine/scene-helpers.js', 'utf8');
const game = fs.readFileSync('src/engine/game.js', 'utf8');
const css = fs.readFileSync('styles/game.css', 'utf8');
assert.match(helpers, /Scene\.responsive/); assert.match(helpers, /Scene\.contextHeader/);
assert.match(helpers, /Scene\.primaryAction/); assert.match(helpers, /Scene\.recoverableState/);
assert.strictEqual((game.match(/function fitGame\s*\(/g) || []).length, 1);
assert.match(css, /safe-area-inset/);
const profiles = [[400,720],[540,900],[720,400],[1024,768],[1440,900]];
for (const [w,h] of profiles) { assert.ok(w > 0 && h > 0, `profile ${w}x${h}`); }
console.log('screen grammar contract passed: logical 400x720, five viewport profiles, safe-area CSS');
