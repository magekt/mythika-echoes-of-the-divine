const assert = require('assert'); const fs = require('fs'); const path = require('path');
const profiles = {'portrait': [400,720], 'large portrait':[540,900], landscape:[720,400], 'narrow desktop':[1024,768], 'wide desktop':[1440,900], 'phone-portrait-390x844': [390,844], 'phone-landscape-844x390': [844,390]};
for (const [name,[w,h]] of Object.entries(profiles)) assert.ok(w > 0 && h > 0, name);
for (const file of ['title.js','ashram.js','travelMap.js','zoneExploration.js','combatScene.js','settings.js']) {
  const s = fs.readFileSync('src/scenes/'+file,'utf8'); assert.ok(file === 'combatScene.js' || /drawHeader|contextHeader|responsive|backButton/.test(s), `${file} keeps shared header/navigation contract`);
}
assert.match(fs.readFileSync('src/engine/input.js','utf8'), /getBoundingClientRect/);
// 42-03 dims-contract block: phase acceptance contract duplicating viewport_dims expectations
// deliberately. 42-01 locked values are source of truth (LOCKED round() rule: 866/866, not 865).
(function dimsContract() {
  const VIEWPORT_PATH = path.resolve(__dirname, '..', 'src/engine/viewport.js');
  delete require.cache[VIEWPORT_PATH];
  require(VIEWPORT_PATH);
  const computeViewportDims = globalThis.computeViewportDims;
  assert.equal(typeof computeViewportDims, 'function', 'computeViewportDims must be a function');
  const ZERO = { t: 0, r: 0, b: 0, l: 0 };
  const expected = {
    '390,844': { W: 400, H: 866, dpr: 1, mode: 'phone-portrait' },
    '844,390': { W: 866, H: 400, dpr: 1, mode: 'phone-landscape' },
    '400,720': { W: 400, H: 720, dpr: 1, mode: 'phone-portrait' },
    '540,900': { W: 400, H: 667, dpr: 1, mode: 'phone-portrait' },
    '720,400': { W: 720, H: 400, dpr: 1, mode: 'phone-landscape' },
    '1024,768': { W: 400, H: 720, dpr: 1, mode: 'desktop' },
    '1440,900': { W: 400, H: 720, dpr: 1, mode: 'desktop' }
  };
  for (const [key, want] of Object.entries(expected)) {
    const [vw, vh] = key.split(',').map(Number);
    assert.deepStrictEqual(computeViewportDims(vw, vh, 1, ZERO), want, `computeViewportDims(${key})`);
  }
})();
// 42-03 no-fixed-stage block: adaptive fill pipeline present (no hardcoded 400x720 stage).
(function noFixedStage() {
  const css = fs.readFileSync('styles/game.css', 'utf8');
  assert.ok(css.includes('#game-container.fill'), 'styles/game.css must contain #game-container.fill');
  assert.ok(css.includes('box-sizing: border-box'), 'styles/game.css must contain box-sizing: border-box');
  const gameSrc = fs.readFileSync('src/engine/game.js', 'utf8');
  assert.ok(gameSrc.includes('visualViewport'), 'src/engine/game.js must contain visualViewport');
})();
console.log('Browser matrix checklist: serve index.html; test ?probe and ?probe&selftest at portrait, large portrait, landscape, narrow desktop, wide desktop. Verify title > Ashram > map > zone > combat > return, settings/back, touch/mouse/keyboard parity, reduced motion, safe areas, Canvas alignment, and console silence. Rollback: git revert <Phase-13-commit>.');
