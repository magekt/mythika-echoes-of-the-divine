// Phase 045-01: PERF-04 ?probe group timing coverage (dependency-free, CommonJS).
// Extracts the __mythikaProbeGroup start/end timing pattern from index.html and
// tests it in isolation without importing index.html or any game global.
const test = require('node:test');
const assert = require('node:assert/strict');

// Probe timing logic under test. Mirrors index.html __mythikaProbeGroup but takes
// injected search/time sources so it can be tested headlessly. The ?probe gate uses
// the same regex as index.html: /[?&]probe(?:&|$)/ — probe must appear bare or at
// the end of the query string (e.g. "?probe" or "?x=1&probe"), not "?probe=1".
function makeProbeGroup(getSearch, now) {
  const groups = {};
  return function probeGroup(name, phase) {
    // Gated by ?probe in location.search
    if (!/[?&]probe(?:&|$)/.test(getSearch())) return;
    if (phase === 'start') {
      groups[name] = now();
      return undefined;
    } else if (groups[name] != null) {
      const duration = now() - groups[name];
      delete groups[name];
      return { name, duration };
    }
    return null;
  };
}

function makeClock(start) {
  let now = start;
  return {
    read: () => now,
    advance: (ms) => { now += ms; }
  };
}

// --- TESTS ---

test('probeStart then probeEnd records a positive duration', (t) => {
  const clock = makeClock(1000);
  const probe = makeProbeGroup(() => '?probe', clock.read);
  assert.equal(probe('engine', 'start'), undefined);
  clock.advance(42);
  const end = probe('engine', 'end');
  assert.ok(end, 'probeEnd should return a timing record');
  assert.equal(end.name, 'engine');
  assert.equal(end.duration, 42);
  assert.ok(end.duration > 0, 'duration must be positive');
});

test('probe is a no-op when ?probe is absent from location.search', (t) => {
  const clock = makeClock(1000);
  const probe = makeProbeGroup(() => '', clock.read);
  assert.equal(probe('engine', 'start'), undefined);
  clock.advance(42);
  assert.equal(probe('engine', 'end'), undefined, 'probeEnd with no search must be a no-op');
});

test('probe gate matches ?probe with other query params (?x=1&probe)', (t) => {
  const clock = makeClock(1000);
  const probe = makeProbeGroup(() => '?x=1&probe', clock.read);
  probe('engine', 'start');
  clock.advance(42);
  const end = probe('engine', 'end');
  assert.ok(end);
  assert.equal(end.duration, 42);
});

test('probe gate does NOT match ?probe=1 (probe must be bare or trailing)', (t) => {
  const clock = makeClock(1000);
  const probe = makeProbeGroup(() => '?probe=1', clock.read);
  assert.equal(probe('engine', 'start'), undefined);
  clock.advance(42);
  assert.equal(probe('engine', 'end'), undefined, '?probe=1 must be a no-op per index.html regex');
});

test('probeEnd without a matching probeStart returns null', (t) => {
  const clock = makeClock(1000);
  const probe = makeProbeGroup(() => '?probe', clock.read);
  assert.equal(probe('engine', 'end'), null);
});

test('independent groups track separate durations', (t) => {
  const clock = makeClock(1000);
  const probe = makeProbeGroup(() => '?probe', clock.read);
  probe('engine', 'start');
  clock.advance(10);
  probe('data', 'start');
  clock.advance(10);
  assert.equal(probe('engine', 'end').duration, 20);
  clock.advance(15);
  assert.equal(probe('data', 'end').duration, 25);
});
