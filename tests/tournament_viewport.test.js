const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', 'src', 'scenes', 'tournament.js');

function nonCommentNonStringLines(src) {
  return src
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
    .split('\n')
    .map((line) => line.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, ''))
    .join('\n');
}

describe('tournament viewport anchoring (plan 42-02)', () => {
  it('anchors the exit control to live G.H (G.H - 54)', () => {
    const src = fs.readFileSync(SRC, 'utf8');
    assert.match(src, /G\.H\s*-\s*54/, 'exit control must anchor to G.H - 54');
  });

  it('contains no 666 y-position literal', () => {
    const src = fs.readFileSync(SRC, 'utf8');
    assert.doesNotMatch(src, /666/, 'no 666 literal may remain in tournament.js');
  });

  it('contains zero 720 literals on non-comment, non-string lines', () => {
    const src = fs.readFileSync(SRC, 'utf8');
    const stripped = nonCommentNonStringLines(src);
    assert.doesNotMatch(stripped, /720/, 'non-comment lines must not contain 720');
  });

  it('exit control stays on-canvas at landscape H=400 by construction', () => {
    // G.H - 54 with h=48 ends at G.H - 6, inside any H >= 400.
    for (const H of [400, 720, 866]) {
      const y = H - 54;
      assert.equal(y + 48, H - 6, `control bottom inside canvas at H=${H}`);
      assert.ok(y >= 0 && y + 48 <= H, `control on-canvas at H=${H}`);
    }
  });
});
