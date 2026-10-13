// Phase 19-01: lifecycle guard contracts (dependency-free, CommonJS).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function loadLifecycle(ctxOverrides) {
  const ctx = vm.createContext(Object.assign({
    console, setTimeout, clearTimeout, Date, Math, Object, Array,
    Map, Set, Error, TypeError,
    G: { scenes: {}, state: {}, _lastLifecycleError: null },
    Notify: { shown: [], show(msg) { this.shown.push(String(msg)); } },
    gSceneCalls: [],
  }, ctxOverrides || {}));
  ctx.gScene = function (name, fade, opts) { ctx.gSceneCalls.push({ name, fade, opts }); };
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/engine/lifecycle.js'), 'utf8'), ctx, { filename: 'lifecycle.js' });
  // scene.js integration check needs Lifecycle visible; load scene.js too.
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/engine/scene.js'), 'utf8'), ctx, { filename: 'scene.js' });
  ctx.Lifecycle = vm.runInContext('Lifecycle', ctx);
  ctx.Scene = vm.runInContext('Scene', ctx);
  return ctx;
}

function mkScene(ctx, name) {
  return { name: name || 'probe', data: {}, enter() {}, leave() {} };
}

test('wrapEnter catches errors, cleans partial state, recovers', () => {
  const ctx = loadLifecycle({ G: { scenes: { ashram: {} }, state: {}, _lastLifecycleError: null }, Notify: { shown: [], show(m) { this.shown.push(String(m)); } } });
  const s = mkScene(ctx, 'map');
  s.data.buttons = [{ x: 1 }];
  const fn = ctx.Lifecycle.wrapEnter(s, function () { s.data.buttons.push({ x: 2 }); throw new Error('boom'); });
  assert.doesNotThrow(() => fn());
  assert.equal(Array.prototype.slice.call(s.data.buttons).length, 0);
  assert.equal(ctx.gSceneCalls[0].name, 'ashram');
  assert.ok(ctx.Notify.shown.length >= 1);
  assert.ok(ctx.G._lastLifecycleError && ctx.G._lastLifecycleError.route === 'map');
});

test('wrapLeave catches errors, always cleans, never throws', () => {
  const ctx = loadLifecycle();
  const s = mkScene(ctx, 'zone');
  s.data.buttons = [{ x: 1 }];
  const fn = ctx.Lifecycle.wrapLeave(s, function () { throw new Error('leave-boom'); });
  assert.doesNotThrow(() => fn());
  assert.equal(Array.prototype.slice.call(s.data.buttons).length, 0);
});

test('timers auto-clear on leave; 10 cycles leave zero orphans', () => {
  const ctx = loadLifecycle();
  const s = mkScene(ctx, 'cyc');
  for (let i = 0; i < 10; i++) {
    ctx.Lifecycle.schedule(s, () => {}, 60000);
    ctx.Lifecycle.wrapLeave(s, function () {})();
  }
  assert.equal(s.data._lifecycle.timers.length, 0);
  assert.ok(ctx.Lifecycle.assertClean(s).clean);
});

test('listeners auto-remove on leave; zero orphans', () => {
  const ctx = loadLifecycle();
  let removed = 0;
  const target = { addEventListener() {}, removeEventListener() { removed++; } };
  const s = mkScene(ctx, 'lis');
  for (let i = 0; i < 10; i++) {
    ctx.Lifecycle.trackListener(s, target, 'click', () => {});
    ctx.Lifecycle.wrapLeave(s, function () {})();
  }
  assert.equal(removed, 10);
  assert.equal(s.data._lifecycle.listeners.length, 0);
});

test('caches auto-clear on leave; bounded size', () => {
  const ctx = loadLifecycle();
  const s = mkScene(ctx, 'cache');
  const m = new Map([['a', 1]]);
  ctx.Lifecycle.trackCache(s, m);
  ctx.Lifecycle.wrapLeave(s, function () {})();
  assert.equal(m.size, 0);
});

test('assertClean flags dirty state, passes after cleanup', () => {
  const ctx = loadLifecycle();
  const s = mkScene(ctx, 'dirty');
  s.data.buttons = [{ x: 1 }];
  s.data.scrollY = 5;
  assert.equal(ctx.Lifecycle.assertClean(s).clean, false);
  ctx.Lifecycle.cleanupScene(s);
  assert.equal(ctx.Lifecycle.assertClean(s).clean, true);
});

test('failureRecovery routes to ashram + Notify', () => {
  const ctx = loadLifecycle({ G: { scenes: { ashram: {} }, state: {} }, Notify: { shown: [], show(m) { this.shown.push(String(m)); } } });
  ctx.Lifecycle.failureRecovery('combat', new Error('x'));
  assert.equal(ctx.gSceneCalls[0].name, 'ashram');
  assert.ok(ctx.Notify.shown.length >= 1);
});

test('no G.state gameplay mutations (only transitional error tracking)', () => {
  const ctx = loadLifecycle();
  const before = JSON.stringify(ctx.G.state);
  const s = mkScene(ctx, 'pure');
  ctx.Lifecycle.wrapEnter(s, function () { s.data.buttons.push(1); })();
  ctx.Lifecycle.wrapLeave(s, function () {})();
  ctx.Lifecycle.assertClean(s);
  assert.equal(JSON.stringify(ctx.G.state), before);
});

test('Scene.create auto-wraps enter/leave without signature change', () => {
  const ctx = loadLifecycle({ G: { scenes: { ashram: {} }, state: {} }, Notify: { shown: [], show() {} } });
  const s = ctx.Scene.create({ name: 't', enter() { throw new Error('e'); }, leave() { this.data.buttons = [1]; } });
  assert.doesNotThrow(() => s.enter());
  assert.doesNotThrow(() => s.leave());
  assert.equal(Array.prototype.slice.call(s.data.buttons).length, 0);
});
