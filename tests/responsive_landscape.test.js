const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Locked 42-01 geometry: landscape 866x400, portrait 400x866 (round() rule).
// The 42-02 plan stubs 865; these tests use the corrected 42-01 values.
describe('Scene.responsive landscape rects (plan 42-02)', () => {
  beforeEach(() => {
    delete require.cache[path.join(__dirname, '..', 'src', 'engine', 'scene-helpers.js')];
    global.Scene = {};
    global.G = { W: 866, H: 400 };
    require('../src/engine/scene-helpers.js');
  });

  it('reports landscape profile for wide viewports', () => {
    assert.equal(Scene.responsive({ width: 844, height: 390 }).profile, 'landscape');
  });

  it('returns the locked landscape header rect', () => {
    const r = Scene.responsive({ width: 844, height: 390 });
    assert.equal(r.header.h, 56);
    assert.deepEqual(r.header, { x: 14, y: 6, w: 838, h: 56 });
  });

  it('returns the locked landscape primary rect', () => {
    const r = Scene.responsive({ width: 844, height: 390 });
    assert.deepEqual(r.primary, { x: 40, y: 320, w: 786, h: 40 });
  });

  it('returns the locked landscape back rect', () => {
    const r = Scene.responsive({ width: 844, height: 390 });
    assert.deepEqual(r.back, { x: 40, y: 366, w: 786, h: 28 });
  });

  it('returns the locked landscape safe rect', () => {
    const r = Scene.responsive({ width: 844, height: 390 });
    assert.deepEqual(r.safe, { x: 14, y: 8, w: 838, h: 384 });
  });

  it('keeps actions inside the 400-tall viewport with bottom margins', () => {
    const r = Scene.responsive({ width: 844, height: 390 });
    assert.equal(r.primary.y + r.primary.h, 360, 'primary bottom = G.H-40');
    assert.equal(r.back.y + r.back.h, 394, 'back bottom = G.H-6');
    assert.ok(r.back.y + r.back.h <= 400, 'back fully on-canvas');
  });

  it('leaves portrait rects byte-identical', () => {
    global.G = { W: 400, H: 866 };
    const r = Scene.responsive({ width: 400, height: 866 });
    assert.equal(r.profile, 'portrait');
    assert.deepEqual(r.safe, { x: 14, y: 10, w: 372, h: 846 });
    assert.deepEqual(r.header, { x: 14, y: 8, w: 372, h: 72 });
    assert.equal(r.header.h, 72);
    assert.deepEqual(r.primary, { x: 40, y: 774, w: 320, h: 48 });
    assert.equal(r.primary.y, 774, 'portrait primary.y = G.H-92');
    assert.deepEqual(r.back, { x: 40, y: 826, w: 320, h: 32 });
    assert.equal(r.back.y, 826, 'portrait back.y = G.H-40');
  });
});

describe('fill correctness source contracts (plan 42-02 task 3)', () => {
  // Contract pins: drawImage(entry.authored, 0, 0, G.W, G.H) stretch-fill,
  // getContentHeight() scroll regions, landscape band > 200 at H=400.
  const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

  it('backgrounds stretch-fill live dims for authored and fallback art', () => {
    const src = read('src/engine/backgrounds.js');
    assert.match(src, /drawImage\(entry\.authored, 0, 0, G\.W, G\.H\)/);
    assert.match(src, /drawImage\(entry\.fallback, 0, 0, G\.W, G\.H\)/);
  });

  it('ashram nav and content height anchor to the real viewport bottom', () => {
    const src = read('src/scenes/ashram.js');
    assert.match(src, /G\.H - this\.navBarHeight/);
    assert.match(src, /G\.H - this\.getContentTop\(\) - this\.navBarHeight/);
  });

  it('cull/clip derive scroll regions from live content height', () => {
    const src = read('src/engine/scene-helpers.js');
    assert.match(src, /cullButtons = function\(buttons, scrollY, viewportH\)/);
    assert.match(src, /scene\.getContentHeight\(\)/);
  });

  it('landscape content band stays usable at short H=400', () => {
    const ashram = read('src/scenes/ashram.js');
    const navBarHeight = Number(/navBarHeight:\s*(\d+)/.exec(ashram)[1]);
    assert.ok(navBarHeight <= 66, `navBarHeight ${navBarHeight} fits short viewports`);
    const contentTop = 134; // zoneExploration getContentTop
    const H = 400; // locked landscape height
    const band = H - contentTop - navBarHeight;
    assert.ok(band > 200, `landscape band ${band} (> 200) keeps content tappable`);
  });
});
