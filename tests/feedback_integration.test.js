const fs = require('fs');
const assert = require('assert');

function src(p) {
  return fs.readFileSync(p, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

// Global drain: toasts queued anywhere must update and render every frame.
const game = src('src/engine/game.js');
assert(game.includes('UI.Feedback.updateToasts'), 'game loop must drain feedback toasts on update');
assert(game.includes('UI.Feedback.renderToasts'), 'game loop must render feedback toasts every frame');

// Every character/world screen must surface blockers and confirmations via Feedback.
for (const scene of ['party', 'equipment', 'cultivationScene', 'combatScene', 'travelMap', 'zoneExploration']) {
  const code = src('src/scenes/' + scene + '.js');
  assert(code.includes('UI.Feedback.Toast'), scene + ' must surface feedback toasts');
}

// Library stays bounded and presentation-owned.
const lib = src('src/ui/feedback.js');
assert(/MAX_TOASTS\s*=\s*3/.test(lib), 'toast queue must stay bounded');
assert(/MAX_DISMISSED\s*=\s*50/.test(lib), 'dismissal store must stay bounded');
assert(!/G\.state\.(gold|party|inventory)\s*=/.test(lib), 'feedback library must not mutate gameplay state');

console.log('feedback_integration.test.js: cross-scene feedback contract passed');
console.log('- toast drain: game update + render');
console.log('- wired scenes: party, equipment, cultivation, combat, travelMap, zoneExploration');
