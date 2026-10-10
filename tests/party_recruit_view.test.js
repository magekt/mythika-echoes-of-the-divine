/* tests/party_recruit_view.test.js
 *
 * Regression test for 31-UAT test 5 (Recruit Hall repaints stale hero
 * detail chrome behind recruit-candidate buttons).
 *
 * Root cause: partyScene.render() had no branch for data.view==='recruit',
 * so the Recruit Hall fell through to the detail else-branch and repainted
 * the previously selected hero's header/detail/action-button shell.
 * selectedHero was never cleared on the list-to-recruit switch. No scene
 * transition occurs (in-scene view switch by design), so the Phase 31
 * clearSceneToasts choke point correctly never fires — the stale pixels
 * are chrome, not queued toasts.
 *
 * Fix: explicit `view === 'recruit'` render branch (header + culled
 * buttons + staticDraws + HUD, never reading selectedHero) + nulling
 * selectedHero/itemsView on the list-to-recruit switch.
 *
 * Run: node --test tests/party_recruit_view.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PARTY_PATH = path.join(ROOT, 'src/scenes/party.js');

function loadPartySource() {
  return fs.readFileSync(PARTY_PATH, 'utf8');
}

// --- Static dispatch assertions ---------------------------------------------

test('render has an explicit view === recruit branch', () => {
  const src = loadPartySource();
  assert.match(
    src,
    /view\s*===\s*['"]recruit['"]/,
    "party.js render must contain an explicit view === 'recruit' branch"
  );
});

test('recruit branch sits before the detail else-branch', () => {
  const src = loadPartySource();
  const recruitIdx = src.search(/else\s+if\s*\(\s*this\.data\.view\s*===\s*['"]recruit['"]/);
  assert.ok(recruitIdx !== -1, 'recruit else-if branch must exist');
  // The detail else-branch reads selectedHero unconditionally; the recruit
  // branch must be positioned before it so view==='recruit' never falls
  // through to detail chrome.
  const detailElseIdx = src.indexOf('} else {', recruitIdx);
  assert.ok(detailElseIdx > recruitIdx, 'a detail else must follow the recruit branch');
  const detailReadsHero = src.indexOf('this.data.selectedHero', detailElseIdx);
  assert.ok(detailReadsHero > detailElseIdx, 'detail else-branch still reads selectedHero (untouched)');
});

test('recruit branch paints staticDraws and never reads selectedHero', () => {
  const src = loadPartySource();
  const head = src.search(/else\s+if\s*\(\s*this\.data\.view\s*===\s*['"]recruit['"]/);
  assert.ok(head !== -1, 'recruit branch head must exist');
  const tail = src.indexOf('} else {', head);
  assert.ok(tail > head, 'recruit branch must close before the detail else');
  const body = src.slice(head, tail);
  assert.match(body, /drawStatic/, 'recruit branch must call Scene.drawStatic so the buildRecruitList header line paints');
  assert.match(body, /cullButtons/, 'recruit branch must render culled buttons');
  assert.doesNotMatch(body, /selectedHero/, 'recruit branch must NOT reference selectedHero (no stale chrome)');
});

test('recruit branch lives inside render(), not in an event handler', () => {
  const src = loadPartySource();
  // Regression guard: the branch must be part of the render() dispatch.
  // A same-shaped `else if (view === 'recruit')` chained onto an onClick
  // `if` (e.g. the gift handler) would satisfy the string checks above
  // while leaving render() falling through to detail chrome — and would
  // crash on the undefined `ctx` at runtime. Pin the location.
  const recruitIdx = src.search(/else\s+if\s*\(\s*this\.data\.view\s*===\s*['"]recruit['"]/);
  assert.ok(recruitIdx !== -1, 'recruit else-if branch must exist');
  const renderStart = src.lastIndexOf('render: function(ctx)', recruitIdx);
  assert.ok(renderStart !== -1, 'recruit branch must come after render() starts');
  const between = src.slice(renderStart, recruitIdx);
  // No other top-level scene member may intervene between render() start
  // and the branch (members are 2-space indented `name: function`).
  assert.doesNotMatch(
    between,
    /\n  [a-zA-Z_$][\w$]*\s*:\s*function/,
    'recruit branch must be inside render() — no other scene member may sit between render() and the branch'
  );
  // The only `=== 'recruit'` comparison in the file must be this one:
  // the view switch uses assignment (`=`), never comparison.
  const allCompares = [...src.matchAll(/===\s*['"]recruit['"]/g)];
  assert.equal(allCompares.length, 1, 'exactly one view === recruit comparison must exist (the render branch)');
  assert.ok(allCompares[0].index > renderStart, 'the single comparison sits inside render()');
});

test('list-to-recruit switch clears selectedHero and itemsView', () => {
  const src = loadPartySource();
  // The Recruit Hero onClick sets view='recruit'; it must also null the
  // previously selected hero so no stale pointer survives the switch.
  const switchIdx = src.indexOf("data.view = 'recruit'");
  assert.ok(switchIdx !== -1, 'recruit onClick must set view to recruit');
  const window = src.slice(switchIdx, switchIdx + 400);
  assert.match(window, /selectedHero\s*=\s*null/, 'recruit switch must null selectedHero');
  assert.match(window, /itemsView\s*=\s*false/, 'recruit switch must clear itemsView');
  assert.match(window, /buildRecruitList\(\)/, 'recruit switch must rebuild the recruit list');
});

// --- Behavioral assertion ----------------------------------------------------
// Driving the real partyScene object needs browser-only globals (Canvas ctx,
// G.state/HEROES/Scene.create/UI.Button/R.Backgrounds, Audio, Economy, …).
// Wiring a faithful subset in Node would test the stubs, not the scene, so
// the live behavior rides on manual UAT (31-UAT.md test 5 path) while the
// static assertions above pin the dispatch contract.

test('behavioral: selectHero then Recruit clears selection (browser-only, UAT-covered)', { skip: 'requires browser globals (Canvas ctx, G.state, HEROES, Scene.create); covered by 31-UAT.md test 5 manual path' }, () => {
  // Intended drive, for reference:
  //   partyScene.selectHero(heroX) -> data.view === 'detail'
  //   recruitBtn.onClick()         -> data.view === 'recruit',
  //                                  data.selectedHero === null,
  //                                  every button has _hid or is Back-to-Party
  //   backBtn.onClick() + selectHero(heroX) -> detail view works again
});
