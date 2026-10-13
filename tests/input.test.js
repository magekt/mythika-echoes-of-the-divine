// SPDX-License-Identifier: MIT
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'src/engine/input.js');

function loadInput() {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed (though input.js doesn't seem to use G directly except in initInput)
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  return vm.runInContext('Input', ctx);
}

test('getSwipe returns null when !Input._ready', () => {
  const Input = loadInput();
  // _ready is false by default in the module
  assert.strictEqual(Input.getSwipe(), null);
});

test('getScrollDelta returns 0 when !Input._ready', () => {
  const Input = loadInput();
  // _ready is false by default in the module
  assert.strictEqual(Input.getScrollDelta(), 0);
});

test('isLongPressing returns false when !Input._ready', () => {
  const Input = loadInput();
  // _ready is false by default in the module
  assert.strictEqual(Input.isLongPressing(), false);
});

test('getLongPressPos returns null when !Input._ready', () => {
  const Input = loadInput();
  // _ready is false by default in the module
  assert.strictEqual(Input.getLongPressPos(), null);
});

test('clear() resets _lastTapAt to -Infinity', () => {
  const Input = loadInput();
  Input._lastTapAt = performance.now();
  Input.clear();
  assert.equal(Input._lastTapAt, -Infinity);
});

test('getSwipe returns actual swipe value when Input._ready is true', () => {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  const Input = vm.runInContext('Input', ctx);
  
  Input._ready = true;
  Input._lastSwipe = 'right';
  assert.strictEqual(Input.getSwipe(), 'right');
  // Second call should return null and clear _lastSwipe
  assert.strictEqual(Input.getSwipe(), null);
});

test('getScrollDelta returns actual delta when Input._ready is true', () => {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  const Input = vm.runInContext('Input', ctx);
  
  Input._ready = true;
  Input._scrollDelta = 5;
  assert.strictEqual(Input.getScrollDelta(), 5);
  // Second call should return 0 and clear _scrollDelta
  assert.strictEqual(Input.getScrollDelta(), 0);
});

test('isLongPressing returns true when conditions are met and Input._ready is true', () => {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  const Input = vm.runInContext('Input', ctx);
  
  Input._ready = true;
  Input._touchStart = { x: 100, y: 100 };
  Input._touchCurrent = { x: 100, y: 100 };
  Input._touchStartTime = Date.now() - 600; // 600ms ago, longer than 500ms threshold
  
  assert.strictEqual(Input.isLongPressing(), true);
});

test('isLongPressing returns false when conditions are not met and Input._ready is true', () => {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  const Input = vm.runInContext('Input', ctx);
  
  Input._ready = true;
  Input._touchStart = { x: 100, y: 100 };
  Input._touchCurrent = { x: 110, y: 100 }; // Moved too much (>10px)
  Input._touchStartTime = Date.now() - 600;
  
  assert.strictEqual(Input.isLongPressing(), false);
});

test('getLongPressPos returns position when long pressing and Input._ready is true', () => {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  const Input = vm.runInContext('Input', ctx);
  
  Input._ready = true;
  Input._touchStart = { x: 100, y: 100 };
  Input._touchCurrent = { x: 100, y: 100 };
  Input._touchStartTime = Date.now() - 600;
  Input._longPressActive = true;
  
  const pos = Input.getLongPressPos();
  assert.deepStrictEqual(pos, { x: 100, y: 100 });
});

test('getLongPressPos returns null when not long pressing and Input._ready is true', () => {
  const ctx = vm.createContext({ 
    console, 
    Object, 
    Array, 
    String, 
    Number, 
    Math, 
    Date, 
    RegExp, 
    JSON,
    performance: { now: () => Date.now() }
  });
  
  // Mock G if needed
  ctx.G = { 
    canvas: { 
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1, height: 1 }) 
    } 
  };
  
  vm.runInContext(fs.readFileSync(INPUT_PATH, 'utf8'), ctx, { filename: 'input.js' });
  const Input = vm.runInContext('Input', ctx);
  
  Input._ready = true;
  Input._longPressActive = false;
  assert.strictEqual(Input.getLongPressPos(), null);
});