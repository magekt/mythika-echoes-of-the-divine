/* tests/backgrounds_binding.test.js
 *
 * Regression test for the live-boot Ashram crash:
 *   [Mythika] loop error TypeError: Cannot read properties of undefined
 *   (reading 'renderBackground') at Object.render (ashram.js:294)
 *
 * Root cause: src/engine/renderer.js declares `const R` (lexical — never
 * attaches to window) while backgrounds.js only wrote window.R.Backgrounds,
 * stranding Backgrounds on a disjoint object. The fix attaches to the lexical
 * R first, then syncs window.R to the same object.
 *
 * Loads renderer.js then backgrounds.js into one VM context (index.html script
 * order renderer.js:115 -> backgrounds.js:116) and asserts identity.
 * node:test + node:assert only. Run: node --test tests/backgrounds_binding.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const RENDERER_PATH = path.join(ROOT, 'src/engine/renderer.js');
const BACKGROUNDS_PATH = path.join(ROOT, 'src/engine/backgrounds.js');

function mockCtx() {
  return {
    fillRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    globalAlpha: 1,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    beginPath: () => {},
    arc: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    translate: () => {},
    rotate: () => {}
  };
}

// Mirrors the classic-script global scope: lexical consts shared by load order,
// window present but initially WITHOUT R (const R never attaches to it).
function loadInScriptOrder() {
  const rendererSrc = fs.readFileSync(RENDERER_PATH, 'utf8');
  const backgroundsSrc = fs.readFileSync(BACKGROUNDS_PATH, 'utf8');
  const context = {
    window: {},
    document: {
      createElement: function (tag) {
        if (tag === 'canvas') {
          return { width: 400, height: 720, getContext: () => mockCtx() };
        }
        return {};
      }
    },
    console: console
  };
  vm.createContext(context);
  vm.runInContext(rendererSrc, context, { filename: 'renderer.js' });
  vm.runInContext(backgroundsSrc, context, { filename: 'backgrounds.js' });
  // Expose the lexical bindings for assertion (same-scope read).
  vm.runInContext(
    ';globalThis.__lexicalR = R; globalThis.__lexicalBackgrounds = Backgrounds;',
    context,
    { filename: 'probe.js' }
  );
  return context;
}

test('lexical R.Backgrounds is defined with the scene render API', () => {
  const ctx = loadInScriptOrder();
  const R = ctx.__lexicalR;
  assert.ok(R.Backgrounds, 'R.Backgrounds must be attached to the lexical R binding');
  for (const fn of ['renderBackground', 'renderCharacterMoment', 'registerSlot', 'get']) {
    assert.equal(typeof R.Backgrounds[fn], 'function', 'Backgrounds.' + fn + ' must be a function');
  }
});

test('window.R.Backgrounds === R.Backgrounds (no disjoint split)', () => {
  const ctx = loadInScriptOrder();
  assert.ok(ctx.window.R, 'window.R must exist after backgrounds.js runs');
  // Strict identity: one shared object, not two parallel namespaces.
  assert.ok(ctx.window.R.Backgrounds === ctx.__lexicalR.Backgrounds,
    'window.R.Backgrounds must be the same object as lexical R.Backgrounds');
});

test("registerSlot('ashram-test') then get() resolves (ashram.js:19 slot path)", () => {
  const ctx = loadInScriptOrder();
  const R = ctx.__lexicalR;
  R.Backgrounds.registerSlot('ashram-test', function () {
    return { width: 400, height: 720 };
  });
  const entry = R.Backgrounds.get('ashram-test');
  assert.ok(entry, 'get() must return an entry for a registered slot');
  assert.ok(entry.fallback, 'entry must carry a fallback canvas');
});
