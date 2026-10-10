const fs = require('fs');
const assert = require('assert');

const nav = fs.readFileSync('src/engine/navigation.js', 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const routes = fs.readFileSync('src/engine/navigation_routes.js', 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const html = fs.readFileSync('index.html', 'utf8');
const profiles = [
  ['400x720', 'portrait'],
  ['540x900', 'large portrait'],
  ['720x400', 'landscape'],
  ['1024x768', 'narrow desktop'],
  ['1440x900', 'wide desktop']
];
const inputs = ['touch tap', 'mouse click', 'keyboard activation'];

function has(src, text, message) {
  assert(src.includes(text), message);
}

has(nav, 'function go(', 'Navigation.go route entry is required');
has(nav, 'legacySceneMap', 'legacy scene compatibility map is required');
has(nav, "gScene('ashram'", 'ashram failure fallback is required');
has(nav, 'transitionState', 'transition state tracking is required');
has(nav, 'reducedMotion', 'reduced-motion transition contract is required');
for (const routeId of ['ashram', 'travelMap', 'zoneExploration', 'combat', 'party', 'equipment', 'cultivation']) {
  has(routes, routeId + ':', 'route ' + routeId + ' must be registered');
}
has(routes, 'contextSchema', 'context schemas are required');
has(routes, 'commandSchema', 'command schemas are required');
assert(html.includes('<script src="src/engine/navigation.js"></script>'), 'navigation.js must load in dependency order');
assert(html.includes('<script src="src/engine/navigation_routes.js"></script>'), 'navigation_routes.js must load after navigation.js');
assert(!/console\.log\s*\(/.test(routes), 'routes source must not contain unconditional debug logging');

console.log('navigation_browser_matrix.test.js: source contract passed');
console.log('Manual browser matrix (REQ-030):');
for (const [size, label] of profiles) {
  console.log(`- ${size} (${label}): ashram -> travelMap -> zoneExploration -> combat -> result -> return`);
  console.log(`  inputs: ${inputs.join(', ')}; repeat with reduced motion and ?probe`);
}
console.log('- Failure: invalid route -> ashram + Notify; missing params -> ashram + Notify.');
console.log('- Legacy: gScene(partyScene/combatScene/travelMapScene) must reach canonical scenes.');
