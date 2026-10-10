/* tests/toast_lifecycle.test.js
 *
 * Regression test for LAY-05 (stale toasts follow the player across scenes,
 * e.g. locked-zone toast travelMap -> Back -> Ashram -> Party).
 *
 * Concurrent-toast cap (documented here — this header IS the cap spec):
 *   3 per system (Notify.queue, Feedback toastQueue); oldest evicted first;
 *   achievement banners exempt (Notify.achievements is unbounded-by-cap and
 *   short-lived at 3.5s each).
 *
 * Loads the REAL src/engine/game.js then src/ui/feedback.js into one VM
 * context (production script order) with stubbed browser globals, so these
 * tests fail on pre-fix code (no clearScene) and pass with scene-tagged
 * clearing. Run: node --test tests/toast_lifecycle.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GAME_PATH = path.join(ROOT, 'src/engine/game.js');
const FEEDBACK_PATH = path.join(ROOT, 'src/ui/feedback.js');

function loadRealSystems() {
  const gameSrc = fs.readFileSync(GAME_PATH, 'utf8');
  const feedbackSrc = fs.readFileSync(FEEDBACK_PATH, 'utf8');
  const context = {
    window: {
      addEventListener: function () {},
      innerWidth: 400,
      innerHeight: 720,
      devicePixelRatio: 1,
      matchMedia: function () { return { matches: false }; }
    },
    document: {
      addEventListener: function () {},
      getElementById: function () { return null; },
      createElement: function () { return {}; }
    },
    R: {
      colors: { gold: '#e8a030', red: '#c83030' },
      fonts: { md: '12px sans-serif' },
      reducedMotion: function () { return true; },
      roundRect: function () {},
      textCenter: function () {}
    },
    Audio: {
      levelUp: function () {},
      click: function () {}
    },
    console: console
  };
  vm.createContext(context);
  vm.runInContext(gameSrc, context, { filename: 'game.js' });
  vm.runInContext(feedbackSrc, context, { filename: 'feedback.js' });
  // globalThis.UI (set by feedback.js) is a global property, so the bare
  // `UI` read inside clearSceneToasts resolves to the real Feedback module.
  // Probe defensively: on pre-fix code clearSceneToasts is undeclared, and the
  // typeof guards in the tests below must be what fails — not this probe.
  vm.runInContext(
    ';globalThis.__T = { Notify: Notify, G: G, clearSceneToasts: (typeof clearSceneToasts !== \'undefined\' ? clearSceneToasts : undefined), Feedback: globalThis.UI.Feedback };',
    context,
    { filename: 'probe.js' }
  );
  // Fresh queues per test: Notify mutates module-level arrays in place.
  context.__T.Notify.queue = [];
  context.__T.Notify.achievements = [];
  context.__T.Feedback.Toast.clear();
  return context.__T;
}

// --- Notify (game.js) -------------------------------------------------------

test('Notify.clearScene exists (fails loudly on pre-fix code)', () => {
  const T = loadRealSystems();
  assert.equal(typeof T.Notify.clearScene, 'function',
    'Notify.clearScene must exist — scene-scoped clearing is the LAY-05 fix');
});

test('Notify.show stamps the creating scene', () => {
  const T = loadRealSystems();
  T.G.state.scene = 'travelMap';
  T.Notify.show('Zone sealed', 2);
  assert.equal(T.Notify.queue.length, 1);
  assert.equal(T.Notify.queue[0].scene, 'travelMap');
});

test('Notify.clearScene empties the queue', () => {
  const T = loadRealSystems();
  T.G.state.scene = 'travelMap';
  T.Notify.show('one', 2);
  T.Notify.show('two', 2);
  T.Notify.clearScene();
  assert.equal(T.Notify.queue.length, 0);
});

test('Notify.clearScene never touches achievement banners', () => {
  const T = loadRealSystems();
  T.G.state.scene = 'travelMap';
  T.Notify.show('stale toast', 2);
  T.Notify.achievement('First Steps', 'Begin the journey', '*');
  T.Notify.clearScene();
  assert.equal(T.Notify.queue.length, 0);
  assert.equal(T.Notify.achievements.length, 1);
  assert.equal(T.Notify.achievements[0].name, 'First Steps');
});

test('Notify cap: pushing 4 toasts keeps max 3, oldest evicted', () => {
  const T = loadRealSystems();
  T.Notify.show('a', 2);
  T.Notify.show('b', 2);
  T.Notify.show('c', 2);
  T.Notify.show('d', 2);
  assert.equal(T.Notify.queue.length, 3);
  assert.equal(T.Notify.queue[0].msg, 'b');
  assert.equal(T.Notify.queue[2].msg, 'd');
});

// --- Feedback (feedback.js) -------------------------------------------------

test('Feedback clearSceneToasts exists (fails loudly on pre-fix code)', () => {
  const T = loadRealSystems();
  assert.equal(typeof T.Feedback.clearSceneToasts, 'function',
    'UI.Feedback.clearSceneToasts must exist — scene-scoped clearing is the LAY-05 fix');
});

test('Feedback Toast stamps sceneTag', () => {
  const T = loadRealSystems();
  T.G.state.scene = 'travelMap';
  T.Feedback.Toast('Zone sealed');
  const q = T.Feedback.getToastQueue();
  assert.equal(q.length, 1);
  assert.equal(q[0].sceneTag, 'travelMap');
});

test('Feedback clearSceneToasts empties the queue', () => {
  const T = loadRealSystems();
  T.Feedback.Toast('one');
  T.Feedback.Toast('two');
  T.Feedback.clearSceneToasts();
  assert.equal(T.Feedback.getToastQueue().length, 0);
});

test('Feedback cap: pushing 4 toasts keeps max 3, oldest evicted', () => {
  const T = loadRealSystems();
  T.Feedback.Toast('a');
  T.Feedback.Toast('b');
  T.Feedback.Toast('c');
  T.Feedback.Toast('d');
  const q = T.Feedback.getToastQueue();
  assert.equal(q.length, 3);
  assert.equal(q[0].message, 'b');
  assert.equal(q[2].message, 'd');
});

// --- Repro-path replay (LAY-05 Starting step, queue level) -------------------

test('repro path: travelMap toast dies across Back/Ashram/Party legs', () => {
  const T = loadRealSystems();
  // Locked-zone toast fires in travelMap…
  T.G.state.scene = 'travelMap';
  T.Notify.show('Zone sealed — return later', 2);
  T.Feedback.Toast('Zone sealed — return later');
  // …then the player taps Back -> Ashram -> Party (one transition each).
  for (const scene of ['ashram', 'party', 'ashram']) {
    T.G.state.scene = scene;
    T.clearSceneToasts();
  }
  assert.equal(T.Notify.queue.length, 0, 'no stale Notify toast may survive the path');
  assert.equal(T.Feedback.getToastQueue().length, 0, 'no stale Feedback toast may survive the path');
});

test('achievement banner shown pre-transition still present post-transition', () => {
  const T = loadRealSystems();
  T.G.state.scene = 'travelMap';
  T.Notify.achievement('Explorer', 'Found a landmark', '*');
  T.G.state.scene = 'ashram';
  T.clearSceneToasts();
  assert.equal(T.Notify.achievements.length, 1);
  assert.equal(T.Notify.achievements[0].name, 'Explorer');
});

test('clearSceneToasts choke point clears BOTH real queues at once', () => {
  const T = loadRealSystems();
  T.G.state.scene = 'travelMap';
  T.Notify.show('stale', 2);
  T.Feedback.Toast('stale');
  T.clearSceneToasts();
  assert.equal(T.Notify.queue.length, 0);
  assert.equal(T.Feedback.getToastQueue().length, 0);
});
