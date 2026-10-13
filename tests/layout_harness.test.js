/* tests/layout_harness.test.js
 *
 * Contract tests for the Phase 30 layout-harness core (Plan 30-01):
 * box math (inject.js), asserts (assert.js), and frozen-fixture shape.
 * node:test + assert/strict, zero dependencies. No live-browser behavior here;
 * the live fail-first proof is Plan 30-03's job.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INJECT_PATH = path.join(ROOT, 'tools/layout_harness/inject.js');
const ASSERT_PATH = path.join(ROOT, 'tools/layout_harness/assert.js');
const SEED_PATH = path.join(ROOT, 'tools/layout_harness/seeded_save.json');
const PAIRS_PATH = path.join(ROOT, 'tools/layout_harness/expected_pairs.json');

const inject = require(INJECT_PATH);
const { findViolations } = require(ASSERT_PATH);

// Stub canvas ctx with the exact surface computeBoxFromCtx reads.
function stubCtx(over) {
  return Object.assign({
    font: '10px sans-serif',
    textAlign: 'left',
    measureText: function (t) { return { width: String(t).length * 6 }; },
    getTransform: function () { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
  }, over || {});
}

// --- box math ------------------------------------------------------------

test('computeBoxFromCtx: left/center/right align adjustments', () => {
  var left = inject.computeBoxFromCtx('abcd', 100, 50, stubCtx({ textAlign: 'left' }));
  assert.equal(left.x, 100);
  assert.equal(left.w, 24);
  var center = inject.computeBoxFromCtx('abcd', 100, 50, stubCtx({ textAlign: 'center' }));
  assert.equal(center.x, 88);
  var right = inject.computeBoxFromCtx('abcd', 100, 50, stubCtx({ textAlign: 'right' }));
  assert.equal(right.x, 76);
});

test('computeBoxFromCtx: height ~= 1.2x parsed px size, y is baseline', () => {
  var box = inject.computeBoxFromCtx('ab', 0, 50, stubCtx({ font: '10px sans-serif' }));
  assert.equal(box.h, 12);
  assert.equal(box.y, 38);
  var lg = inject.computeBoxFromCtx('ab', 0, 50, stubCtx({ font: '16px "Geist", sans-serif' }));
  assert.ok(Math.abs(lg.h - 19.2) < 1e-9);
});

test('computeBoxFromCtx: getTransform lands boxes in game coordinates', () => {
  // Combat scroll panel pattern: ctx.translate(0, top - 6 - scrollY).
  var ctx = stubCtx({
    getTransform: function () { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: -100 }; }
  });
  var box = inject.computeBoxFromCtx('ab', 10, 200, ctx);
  assert.equal(box.x, 10);
  assert.equal(box.y, 200 - 12 - 100);
  // DPR scale doubles extents.
  var scaled = stubCtx({
    getTransform: function () { return { a: 2, b: 0, c: 0, d: 2, e: 0, f: 0 }; }
  });
  var sbox = inject.computeBoxFromCtx('ab', 10, 200, scaled);
  assert.equal(sbox.x, 20);
  assert.equal(sbox.w, 24);
});

test('createHarness: overlay tagging, endFrame reset, selfCheck leakage guard', () => {
  var H = inject.createHarness();
  H.record({ text: 'a', x: 0, y: 0, w: 10, h: 10 });
  H.overlay = true;
  H.record({ text: 'toast', x: 0, y: 0, w: 10, h: 10 });
  var snap = H.endFrame();
  assert.equal(snap.boxes.length, 2);
  assert.equal(snap.boxes[0].overlay, false);
  assert.equal(snap.boxes[1].overlay, true);
  assert.equal(H.frameBoxes.length, 0);
  // Flag still set at frame end -> selfCheck fails AND clears (finally
  // semantics live in Notify/Modal render; this is the backstop).
  assert.equal(H.selfCheck(), false);
  assert.equal(H.overlay, false);
  assert.equal(H.selfCheck(), true);
});

test('createHarness: save/restore clip stack and rect-then-clip promotion', () => {
  var H = inject.createHarness();
  H.onSave();
  H.onRect({ x: 10, y: 20, w: 100, h: 50 });
  H.onClip({ a: 1, b: 0, c: 0, d: 1, e: 5, f: 5 });
  assert.deepEqual(H.currentClip, { x: 15, y: 25, w: 100, h: 50 });
  H.record({ text: 'clipped', x: 0, y: 0, w: 10, h: 10 });
  assert.deepEqual(H.frameBoxes[0].clip, { x: 15, y: 25, w: 100, h: 50 });
  H.onRestore();
  assert.equal(H.currentClip, null);
});

test('createHarness: a throw mid-overlay-render never exempts later draws', () => {
  var H = inject.createHarness();
  H.overlay = true;
  try {
    throw new Error('boom mid-render');
  } catch (e) {
    // Engine wraps draws in try/finally; simulate the finally here.
    H.overlay = false;
  } finally {
    H.overlay = false;
  }
  H.record({ text: 'later', x: 0, y: 0, w: 5, h: 5 });
  assert.equal(H.frameBoxes[0].overlay, false);
  assert.equal(H.selfCheck(), true);
});

// --- findViolations --------------------------------------------------------

function box(text, x, y, w, h, extra) {
  return Object.assign({ text: text, x: x, y: y, w: w, h: h }, extra || {});
}

test('findViolations: overlapping non-overlay boxes are reported', () => {
  var res = findViolations([
    box('HP 80/80', 0, 36, 30, 12),
    box('MP 30/30', 0, 42, 30, 12)
  ], { W: 400, H: 720 });
  assert.equal(res.violations.length, 1);
  assert.equal(res.violations[0].kind, 'intersect');
  assert.equal(res.violations[0].a, 'HP 80/80');
  assert.equal(res.boxCount, 2);
});

test('findViolations: 1px edge kiss is tolerated', () => {
  var res = findViolations([
    box('a', 0, 0, 10, 10),
    box('b', 10, 0, 10, 10)
  ], { W: 400, H: 720 });
  assert.equal(res.violations.length, 0);
});

test('findViolations: overlay boxes are excluded from every rule', () => {
  var res = findViolations([
    box('toast', 0, 0, 200, 20, { overlay: true }),
    box('scene text', 0, 0, 200, 20),
    box('offscreen toast', 500, 0, 50, 10, { overlay: true })
  ], { W: 400, H: 720 });
  assert.equal(res.violations.length, 0);
  assert.equal(res.boxCount, 1);
});

test('findViolations: canvas overflow beyond 2px is reported', () => {
  var inside = findViolations([box('edge', 390, 0, 11, 10)], { W: 400, H: 720 });
  assert.equal(inside.violations.length, 0);
  var outside = findViolations([box('off', 395, 0, 20, 10)], { W: 400, H: 720 });
  assert.equal(outside.violations.length, 1);
  assert.equal(outside.violations[0].kind, 'overflow');
});

test('findViolations: scroll-clip overflow uses per-box clip then opts.clip', () => {
  var clip = { x: 10, y: 100, w: 300, h: 400 };
  var perBox = findViolations(
    [box('row', 0, 110, 50, 12, { clip: clip })], { W: 400, H: 720 });
  assert.equal(perBox.violations.length, 1);
  assert.equal(perBox.violations[0].kind, 'clip');
  var fallback = findViolations(
    [box('row', 0, 110, 50, 12)], { W: 400, H: 720, clip: clip });
  assert.equal(fallback.violations.length, 1);
  var contained = findViolations(
    [box('row', 20, 110, 50, 12)], { W: 400, H: 720, clip: clip });
  assert.equal(contained.violations.length, 0);
});

test('findViolations: allowlist waives (never drops) matching pairs', () => {
  var allowlist = [{ aMatch: 'HP', bMatch: 'MP' }];
  var res = findViolations([
    box('HP 80/80', 0, 36, 30, 12),
    box('MP 30/30', 0, 42, 30, 12)
  ], { W: 400, H: 720, allowlist: allowlist });
  assert.equal(res.violations.length, 0);
  assert.equal(res.waived.length, 1);
  assert.equal(res.waived[0].kind, 'intersect');
});

// --- frozen fixture shape --------------------------------------------------

test('seeded_save.json: loadable envelope with reduceMotion and mid-game state', () => {
  var raw = fs.readFileSync(SEED_PATH, 'utf8');
  var payload = JSON.parse(raw);
  assert.equal(payload.version, 1);
  assert.ok(payload.state && typeof payload.state === 'object');
  assert.equal(payload.state.reduceMotion, true);
  assert.equal(payload.state.currentZone, 'aryavarta');
  assert.ok(Array.isArray(payload.state.party) && payload.state.party.length >= 5);
  assert.ok((payload.state.gold || 0) >= 1000);
  assert.ok(Array.isArray(payload.state.inventory) && payload.state.inventory.length >= 8);
});

test('expected_pairs.json: frozen oracle shape with verified counts', () => {
  var fixture = JSON.parse(fs.readFileSync(PAIRS_PATH, 'utf8'));
  assert.ok(fixture._comment.indexOf('harness is the bug') !== -1);
  assert.ok(fixture.counts.fillText > 0);
  assert.ok(Array.isArray(fixture.expectedViolations) && fixture.expectedViolations.length > 0);
  for (var i = 0; i < fixture.expectedViolations.length; i++) {
    var p = fixture.expectedViolations[i];
    assert.ok(typeof p.scene === 'string' && p.scene.length > 0, 'pair needs scene');
    assert.ok(typeof p.aMatch === 'string', 'pair needs aMatch');
    assert.ok(typeof p.bMatch === 'string', 'pair needs bMatch');
    assert.ok(['intersect', 'overflow', 'clip'].indexOf(p.kind) !== -1, 'pair needs kind');
  }
  assert.ok(fixture.scenes.checkedSubset.length >= 20);
  assert.ok(fixture.scenes.fullRegistry.length >= fixture.scenes.checkedSubset.length);
});

test('expected_pairs.json: counts match fresh source greps', () => {
  var fixture = JSON.parse(fs.readFileSync(PAIRS_PATH, 'utf8'));
  function walkJs(dir) {
    var out = [];
    for (var e of fs.readdirSync(dir, { withFileTypes: true })) {
      var p = path.join(dir, e.name);
      if (e.isDirectory()) out = out.concat(walkJs(p));
      else if (e.isFile() && e.name.endsWith('.js')) out.push(p);
    }
    return out;
  }
  var files = walkJs(path.join(ROOT, 'src'));
  var fillText = 0, translate = 0, clip = 0;
  for (var f of files) {
    var src = fs.readFileSync(f, 'utf8');
    fillText += (src.match(/ctx\.fillText/g) || []).length;
    translate += (src.match(/ctx\.translate/g) || []).length;
    clip += (src.match(/ctx\.clip\(\)/g) || []).length;
  }
  assert.equal(fixture.counts.fillText, fillText);
  assert.equal(fixture.counts.translate, translate);
  assert.equal(fixture.counts.clip, clip);
  var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  var localScripts = (html.match(/src="src\//g) || []).length;
  assert.equal(fixture.counts.localScripts, localScripts);
});
