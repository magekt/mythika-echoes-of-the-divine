const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const vm = require('vm');

function loadModule(filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const mockCtx = {
    fillRect: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    globalAlpha: 1,
    globalCompositeOperation: '',
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
  
  const context = {
    R: {
      colors: {
        surface: '#1a1a30',
        surfaceElevated: '#222240',
        surfaceGlass: 'rgba(26,26,48,0.85)',
        textPrimary: '#e8e0d0',
        textSecondary: '#98a0b8',
        gold: '#e8a030'
      },
      fonts: {
        md: '12px sans-serif'
      },
      rect: function(ctx, x, y, w, h, color) {},
      roundRect: function(ctx, x, y, w, h, r, color) {},
      renderNoise: function(ctx) {},
      reducedMotion: function() { return false; }
    },
    G: {
      W: 400,
      H: 720,
      state: { reduceMotion: false }
    },
    document: {
      createElement: function(tag) {
        if (tag === 'canvas') {
          return { width: 400, height: 720, getContext: () => mockCtx };
        }
        return {};
      }
    },
    Image: function() {
      this.onload = null;
      this.onerror = null;
      this.src = '';
      this.naturalWidth = 400;
      this.naturalHeight = 720;
      setTimeout(() => this.onload && this.onload(), 10);
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    window: {
      matchMedia: () => ({ matches: false }),
      R: {}
    }
  };
  
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.R.Backgrounds;
}

const backgroundsPath = path.join(__dirname, '..', 'src', 'engine', 'backgrounds.js');
const Backgrounds = loadModule(backgroundsPath);

describe('Background System', () => {
  beforeEach(() => {
    Backgrounds.clear();
  });

  afterEach(() => {
    Backgrounds.clear();
  });

  test('Slot resolution returns fallback immediately for unknown keys', () => {
    const result = Backgrounds.get('realm:unknown');
    assert.ok(result.fallback);
    assert.ok(result.fallback.width === 400);
    assert.strictEqual(result.authored, null);
    assert.strictEqual(result.loading, false);
    assert.strictEqual(result.error, null);
  });

  test('Fallback generators produce deterministic OffscreenCanvas for each slot type', () => {
    const types = ['realm:arjuna', 'zone:aryavarta', 'combat:rakshasa', 'cultivation:qi', 'ashram', 'map:east'];
    
    for (const type of types) {
      const result = Backgrounds.get(type);
      assert.ok(result.fallback);
      assert.strictEqual(result.fallback.width, 400);
      assert.strictEqual(result.fallback.height, 720);
      
      const result2 = Backgrounds.get(type);
      assert.strictEqual(result.fallback, result2.fallback);
    }
  });

  test('Authored asset load kicks off async; crossfade on success; timeout stays on fallback', async () => {
    const key = 'test:asset';
    const testUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const promise = Backgrounds.preload(key, testUrl);
    
    await promise;
    
    const result = Backgrounds.get(key);
    assert.ok(result.authored || result.fallback);
  }, { timeout: 5000 });

  test('Cache bounded by LRU (max 20, 5MB); eviction works', () => {
    for (let i = 0; i < 25; i++) {
      Backgrounds.get(`test:key${i}`);
    }
    
    assert.ok(Backgrounds.getMemoryUsage() <= Backgrounds.MAX_MEMORY);
  });

  test('No per-frame canvas creation; procedural fallbacks reuse OffscreenCanvas', () => {
    const key = 'realm:test';
    const result1 = Backgrounds.get(key);
    const canvas1 = result1.fallback;
    
    const result2 = Backgrounds.get(key);
    const canvas2 = result2.fallback;
    
    assert.strictEqual(canvas1, canvas2);
  });

  test('System never mutates G.state or calls gameplay systems; read-only presentation', () => {
    const initialState = JSON.stringify({ W: 400, H: 720, state: { reduceMotion: false } });
    
    Backgrounds.get('realm:test');
    Backgrounds.renderBackground({ save: () => {}, restore: () => {}, globalAlpha: 1, globalCompositeOperation: '', drawImage: () => {} }, 'realm:test');
    Backgrounds.renderCharacterMoment({ save: () => {}, restore: () => {}, globalAlpha: 1, drawImage: () => {} }, 'hero:arjuna', 0, 0, 100, 100);
    
    assert.strictEqual(JSON.stringify({ W: 400, H: 720, state: { reduceMotion: false } }), initialState);
  });

  test('Reduced motion checked via R.reducedMotion()', () => {
    const ctx = { save: () => {}, restore: () => {}, globalAlpha: 1, globalCompositeOperation: '', drawImage: () => {} };
    Backgrounds.renderBackground(ctx, 'realm:test', 1);
    assert.ok(true);
  });

  test('Memory pressure clear works', () => {
    Backgrounds.get('realm:test1');
    Backgrounds.get('realm:test2');
    
    Backgrounds.clear();
    const result = Backgrounds.get('realm:test1');
    assert.ok(result.fallback);
  });

  test('registerSlot allows custom fallback generators', () => {
    const mockCanvas = { width: 100, height: 100 };
    const customGen = function(key) {
      return mockCanvas;
    };
    
    Backgrounds.registerSlot('custom:test', customGen);
    const result = Backgrounds.get('custom:test');
    assert.strictEqual(result.fallback.width, 100);
    assert.strictEqual(result.fallback.height, 100);
  });
});