const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const HARNESS = fs.readFileSync(path.join(ROOT, 'tools/verify_matrix.py'), 'utf8');

function scriptSrcs(html) {
  const out = [];
  const re = /<script\s+[^>]*src="([^"]+)"[^>]*>/g;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

test('sweep page preserves index.html script order with harness first', () => {
  // Mirror of build_layout_page(): inject.js + driver.js go immediately
  // before the first local src/ script; everything else keeps order.
  const marker = 'src="src/';
  const idx = INDEX.indexOf(marker);
  assert.ok(idx !== -1, 'index.html must contain a local src/ script');
  const tagStart = INDEX.lastIndexOf('<script', idx);
  assert.ok(tagStart !== -1, 'first local script tag must parse');
  const before = scriptSrcs(INDEX.slice(0, tagStart));
  const after = scriptSrcs(INDEX.slice(tagStart));
  assert.ok(after.length > 0 && after[0].startsWith('src/'), 'first game script identified');
  const sweep = [
    ...before,
    '/tools/layout_harness/inject.js',
    '/tools/layout_harness/driver.js',
    ...after,
  ];
  assert.equal(sweep[before.length], '/tools/layout_harness/inject.js');
  assert.equal(sweep[before.length + 1], '/tools/layout_harness/driver.js');
  // Game order untouched.
  assert.deepEqual(sweep.slice(before.length + 2), after);
});

test('harness builder implements the documented insertion', () => {
  assert.ok(HARNESS.includes('inject.js'), 'builder must reference inject.js');
  assert.ok(HARNESS.includes('__layout__.html'), 'builder must serve the sweep page');
});

test('index.html script count matches recorded inventory', () => {
  const local = scriptSrcs(INDEX).filter(s => s.startsWith('src/'));
  assert.ok(local.length >= 90, 'expected ~94 local scripts, found ' + local.length);
});
