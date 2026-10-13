const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = require('node:path').resolve(__dirname, '..');
const WORLD_STATE_PATH = require('node:path').join(ROOT, 'src/systems/world_state.js');
const RULES_PATH = require('node:path').join(ROOT, 'src/data/influence_rules.js');
const INFLUENCE_PATH = require('node:path').join(ROOT, 'src/systems/influence.js');

function loadInfluence() {
  delete require.cache[WORLD_STATE_PATH];
  delete require.cache[RULES_PATH];
  delete require.cache[INFLUENCE_PATH];

  global.G = { state: { world: null } };
  global.WorldState = require(WORLD_STATE_PATH).WorldState;
  global.G.state.world = global.WorldState.createDefault();
  global.ZONES = require('../src/data/zones.js').ZONES;
  global.INFLUENCE_RULES = require(RULES_PATH).INFLUENCE_RULES;
  const notices = [];
  global.Notify = { show: message => notices.push(message) };

  return {
    Influence: require(INFLUENCE_PATH).Influence,
    notices
  };
}

test.afterEach(() => {
  delete global.G;
  delete global.WorldState;
  delete global.ZONES;
  delete global.INFLUENCE_RULES;
  delete global.Notify;
});

test('rules cover every qualifying action category and canonical zone', () => {
  const { INFLUENCE_RULES } = require(RULES_PATH);
  assert.deepEqual(
    Object.keys(INFLUENCE_RULES).filter(key => key !== 'getRule').sort(),
    ['boss_defeat', 'encounter_choice', 'journey_complete', 'zone_complete']
  );

  const zoneIds = ['aryavarta', 'dandaka', 'meru', 'patala', 'svarga', 'tapobhumi'];
  for (const actionType of ['zone_complete', 'boss_defeat']) {
    for (const zoneId of zoneIds) {
      const rule = INFLUENCE_RULES.getRule(actionType, zoneId);
      assert.equal(rule.zoneId, zoneId);
      assert.equal(typeof rule.delta, 'number');
      assert.deepEqual(rule.thresholds, { 50: 'contested', 80: 'player' });
    }
  }

  assert.equal(INFLUENCE_RULES.getRule('__proto__', 'x'), null);
  assert.equal(INFLUENCE_RULES.getRule('zone_complete', '__proto__'), null);
  assert.equal(INFLUENCE_RULES.getRule('unknown', 'unknown'), null);
});

test('applyAction changes influence once, records history, and identifies its cause', () => {
  const { Influence, notices } = loadInfluence();

  const first = Influence.applyAction('zone_complete', 'aryavarta');
  assert.deepEqual(first, {
    changed: true,
    zoneId: 'aryavarta',
    from: { value: 0, control: 'neutral' },
    to: { value: 20, control: 'neutral' },
    delta: 20
  });
  assert.equal(notices.length, 1);
  assert.match(notices[0], /zone complete/i);
  assert.match(notices[0], /Aryavarta/i);
  assert.match(notices[0], /\+20/);

  const second = Influence.applyAction('zone_complete', 'aryavarta');
  assert.deepEqual(second, { changed: false });
  assert.equal(Influence.getInfluence('aryavarta').value, 20);
  assert.equal(notices.length, 1);

  const history = Influence.getHistory('aryavarta');
  assert.equal(history.length, 1);
  assert.equal(history[0].transitionId, 'zone_complete:aryavarta');
  assert.equal(history[0].actionType, 'zone_complete');
});

test('control thresholds and bounds are deterministic for positive and negative influence', () => {
  const { Influence } = loadInfluence();

  global.WorldState.setInfluence('aryavarta', 65, 'contested');
  const controlled = Influence.applyAction('zone_complete', 'aryavarta');
  assert.equal(controlled.to.value, 85);
  assert.equal(controlled.to.control, 'player');
  assert.equal(Influence.getControl('aryavarta'), 'player');

  global.WorldState.setInfluence('dandaka', -48, 'neutral');
  const hostile = Influence.applyAction('encounter_choice', 'nagaBargain_force');
  assert.equal(hostile.to.value, -53);
  assert.equal(hostile.to.control, 'enemy');

  global.WorldState.setInfluence('meru', 95, 'player');
  assert.equal(Influence.applyAction('zone_complete', 'meru').to.value, 100);
  global.WorldState.setInfluence('patala', -98, 'enemy');
  assert.equal(Influence.applyAction('encounter_choice', 'vasukiTribute_refuse').to.value, -100);
});

test('unknown actions do not mutate influence or consume transition IDs', () => {
  const { Influence, notices } = loadInfluence();

  assert.deepEqual(Influence.applyAction('zone_complete', 'unknown'), { changed: false });
  assert.deepEqual(Influence.applyAction('__proto__', 'unknown'), { changed: false });
  assert.deepEqual(Influence.getInfluence('unknown'), { value: 0, control: 'neutral' });
  assert.deepEqual(Influence.getHistory('unknown'), []);
  assert.equal(notices.length, 0);
  assert.equal(Object.keys(global.G.state.world.transitions).length, 0);
});
