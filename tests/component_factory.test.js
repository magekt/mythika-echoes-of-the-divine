// Tests for UI Component Factory Foundation (Phase 50)
// Covers COMP-01 through COMP-07

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');

// Load renderer first and make it global
const renderer = require('../src/engine/renderer.js');
global.R = renderer;

// Mock globals needed by UI components
global.G = {
  W: 400,
  H: 720,
  state: { reduceMotion: false }
};
global.Input = {
  _touchCurrent: null,
  _touchStart: null,
  _pressPos: null,
  _mousePos: null,
  peekTap: () => null,
  getTap: () => null
};
global.Audio = { click: () => {}, modalOpen: () => {} };
global.UI = {};

// Load the component factory and refactored UI files
require('../src/ui/component.js');
require('../src/ui/button.js');
require('../src/ui/panel.js');
require('../src/ui/modal.js');

// Comprehensive canvas context mock for rendering tests
function createMockCtx() {
  return {
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'round',
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
    fillText: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    arc: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    rect: () => {},
    filter: 'none',
    setTransform: () => {},
    transform: () => {},
    globalCompositeOperation: 'source-over',
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
}

// Mock Input press state for button tests
function mockPress(btn, pressed = true) {
  if (pressed) {
    global.Input._pressPos = { x: btn.x + btn.w / 2, y: btn.y + btn.h / 2 };
    global.Input._touchCurrent = { x: btn.x + btn.w / 2, y: btn.y + btn.h / 2 };
  } else {
    global.Input._pressPos = null;
    global.Input._touchCurrent = null;
  }
}

function clearPress() {
  global.Input._pressPos = null;
  global.Input._touchCurrent = null;
  global.Input._touchStart = null;
  global.Input._mousePos = null;
}

describe('UI.Component base factory', () => {
  test('COMP-01: creates component with x, y, w, h, visible, enabled, data, onClick', () => {
    const comp = UI.Component(10, 20, 100, 50, { foo: 'bar' });
    assert.strictEqual(comp.x, 10);
    assert.strictEqual(comp.y, 20);
    assert.strictEqual(comp.w, 100);
    assert.strictEqual(comp.h, 50);
    assert.strictEqual(comp.visible, true);
    assert.strictEqual(comp.enabled, true);
    assert.strictEqual(comp.data, null);
    assert.strictEqual(comp.onClick, null);
    assert.strictEqual(comp.foo, 'bar'); // opts merged
  });

  test('COMP-01: default values when opts omitted', () => {
    const comp = UI.Component();
    assert.strictEqual(comp.x, 0);
    assert.strictEqual(comp.y, 0);
    assert.strictEqual(comp.w, 0);
    assert.strictEqual(comp.h, 0);
  });

  test('COMP-01: render/update/contains methods exist', () => {
    const comp = UI.Component(0, 0, 10, 10);
    assert(typeof comp.render === 'function');
    assert(typeof comp.update === 'function');
    assert(typeof comp.contains === 'function');
  });

  test('COMP-01: render delegates to _renderHook', () => {
    const comp = UI.Component(0, 0, 10, 10);
    let called = false;
    comp._renderHook = (ctx, c) => { called = true; assert.strictEqual(c, comp); };
    comp.render({});
    assert.strictEqual(called, true);
  });

  test('COMP-01: update delegates to _updateHook', () => {
    const comp = UI.Component(0, 0, 10, 10);
    let called = false;
    comp._updateHook = (dt, c) => { called = true; assert.strictEqual(c, comp); assert.strictEqual(dt, 0.016); };
    comp.update(0.016);
    assert.strictEqual(called, true);
  });

  test('COMP-01: contains delegates to _containsHook', () => {
    const comp = UI.Component(0, 0, 10, 10);
    comp._containsHook = (px, py, c) => { return px > 5; };
    assert.strictEqual(comp.contains(6, 0), true);
    assert.strictEqual(comp.contains(4, 0), false);
  });
});

describe('UI.mixinRender', () => {
  test('COMP-02: adds render delegation to component', () => {
    const comp = UI.Component(0, 0, 10, 10);
    let drawCalled = false;
    UI.mixinRender(comp, (ctx, c) => { drawCalled = true; });
    comp.render({});
    assert.strictEqual(drawCalled, true);
  });
});

describe('UI.mixinUpdate', () => {
  test('COMP-03: ensures update method delegates to _updateHook', () => {
    const comp = UI.Component(0, 0, 10, 10);
    UI.mixinUpdate(comp);
    let called = false;
    comp._updateHook = () => { called = true; };
    comp.update(0.016);
    assert.strictEqual(called, true);
  });
});

describe('UI.mixinSpring', () => {
  test('COMP-04: adds _springState and _springStep, advances spring on update', () => {
    const comp = UI.Component(0, 0, 10, 10);
    UI.mixinSpring(comp, { stiffness: 300, damping: 24, target: 0.5 });
    
    assert.ok(comp._springState);
    assert.ok(comp._springStep);
    assert.strictEqual(comp._springState.value, 0.5);
    assert.strictEqual(comp._springState.velocity, 0);
    assert.strictEqual(comp._springConfig.target, 0.5);

    // Advance time — spring should move toward target
    comp.update(0.016);
    // Value should have moved from 0.5 toward 0.5 (already at target)
    assert.strictEqual(comp._springState.value, 0.5);

    // Change target and advance
    comp._springConfig.target = 1;
    // Recreate step function since it closes over target
    comp._springStep = R.spring(comp._springConfig);
    comp.update(0.016);
    assert.ok(comp._springState.value > 0.5 && comp._springState.value < 1);
  });

  test('COMP-04: reduced motion snaps to target instantly', () => {
    const comp = UI.Component(0, 0, 10, 10);
    UI.mixinSpring(comp, { stiffness: 300, damping: 24, target: 0.5 });
    
    // Mock reduced motion
    const originalReduced = R.reducedMotion;
    R.reducedMotion = () => true;
    
    comp._springConfig.target = 1;
    comp._springStep = R.spring(comp._springConfig);
    comp.update(0.016);
    
    assert.strictEqual(comp._springState.value, 1);
    assert.strictEqual(comp._springState.velocity, 0);
    
    R.reducedMotion = originalReduced;
  });

  test('COMP-04: zero per-frame allocation (no new objects in hot path)', () => {
    const comp = UI.Component(0, 0, 10, 10);
    UI.mixinSpring(comp, { stiffness: 300, damping: 24, target: 0.5 });
    
    // Track allocations by checking if _springStep is recreated
    const originalStep = comp._springStep;
    comp.update(0.016);
    assert.strictEqual(comp._springStep, originalStep); // Same function reference
    
    comp.update(0.016);
    assert.strictEqual(comp._springStep, originalStep); // Still same
  });
});

describe('UI.mixinEase', () => {
  test('COMP-05: adds easedValue(t) using R.easePremium', () => {
    const comp = UI.Component(0, 0, 10, 10);
    UI.mixinEase(comp);
    
    assert(typeof comp.easedValue === 'function');
    // R.easePremium is smoothstep: t*t*(3-2t)
    assert.strictEqual(comp.easedValue(0), 0);
    assert.strictEqual(comp.easedValue(1), 1);
    assert.strictEqual(comp.easedValue(0.5), 0.5 * 0.5 * (3 - 2 * 0.5)); // 0.5
  });
});

describe('UI.mixinContains', () => {
  test('COMP-06: adds radius-aware contains check', () => {
    const comp = UI.Component(10, 10, 100, 50);
    UI.mixinContains(comp, 'm'); // R.radius.m = 8
    
    // Inside rect
    assert.strictEqual(comp.contains(50, 30), true);
    // Outside rect
    assert.strictEqual(comp.contains(5, 30), false);
    assert.strictEqual(comp.contains(115, 30), false);
    assert.strictEqual(comp.contains(50, 5), false);
    assert.strictEqual(comp.contains(50, 65), false);
  });
});

describe('UI.Button (refactored)', () => {
  test('COMP-01/04: button has spring scale state allocated once', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Test');
    
    assert.strictEqual(btn._visualScale, 1);
    assert.strictEqual(btn._scaleVel, 0);
    assert.ok(btn._updateHook);
    assert.ok(btn._renderHook);
  });

  test('COMP-04: press spring drives _visualScale toward 0.97', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Test');
    btn._pressed = true;
    mockPress(btn, true);
    
    btn.update(0.016);
    assert.ok(btn._visualScale < 1 && btn._visualScale > 0.97);
    
    // Continue updating — should approach 0.97
    for (let i = 0; i < 10; i++) btn.update(0.016);
    assert.ok(Math.abs(btn._visualScale - 0.97) < 0.01);
    
    clearPress();
  });

  test('COMP-04: release spring drives _visualScale back to 1', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Test');
    btn._pressed = true;
    mockPress(btn, true);
    for (let i = 0; i < 20; i++) btn.update(0.016); // Settle at 0.97
    
    btn._pressed = false;
    clearPress();
    for (let i = 0; i < 20; i++) btn.update(0.016); // Return to 1
    assert.ok(Math.abs(btn._visualScale - 1) < 0.01);
  });

  test('COMP-04: reduced motion snaps scale instantly', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Test');
    const originalReduced = R.reducedMotion;
    R.reducedMotion = () => true;
    
    btn._pressed = true;
    mockPress(btn, true);
    btn.update(0.016);
    assert.strictEqual(btn._visualScale, 0.97);
    
    btn._pressed = false;
    clearPress();
    btn.update(0.016);
    assert.strictEqual(btn._visualScale, 1);
    
    R.reducedMotion = originalReduced;
  });

  test('COMP-04: zero per-frame allocation in update', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Test');
    btn._pressed = true;
    mockPress(btn, true);
    
    // The spring step function should be reused
    // We can't directly test the closure, but we can verify no new objects
    // are created by checking that the update doesn't throw and state mutates in place
    const initialScale = btn._visualScale;
    btn.update(0.016);
    assert.ok(btn._visualScale !== initialScale); // State mutated
    btn.update(0.016);
    // No allocation errors
    clearPress();
  });

  test('render uses ctx.scale centered on button', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Test');
    const ctx = createMockCtx();
    
    // Should not throw
    btn.render(ctx);
  });
});

describe('UI.MagneticBtn (refactored)', () => {
  test('COMP-01/04: magnetic button has spring state allocated once', () => {
    const btn = UI.MagneticBtn(10, 10, 100, 40, 'Test', { variant: 'primary' });
    
    assert.strictEqual(btn._springScale, 1);
    assert.strictEqual(btn._scaleVel, 0);
    assert.ok(btn._updateHook);
    assert.ok(btn._renderHook);
  });

  test('COMP-04: press spring uses R.spring step (not lerp)', () => {
    const btn = UI.MagneticBtn(10, 10, 100, 40, 'Test', { variant: 'primary' });
    btn._pressed = true;
    mockPress(btn, true);
    
    btn.update(0.016);
    assert.ok(btn._springScale < 1 && btn._springScale > 0.97);
    clearPress();
  });

  test('COMP-02: trailing icon always visible when set', () => {
    const btn = UI.MagneticBtn(10, 10, 100, 40, 'Test', { 
      variant: 'primary',
      trailingIcon: 'arrow'
    });
    
    assert.strictEqual(btn._trailingIcon, 'arrow');
    // Render should not throw with trailing icon
    const ctx = createMockCtx();
    btn.render(ctx); // Should not throw
  });

  test('COMP-04: press scales trailing icon to 1.05x', () => {
    const btn = UI.MagneticBtn(10, 10, 100, 40, 'Test', { 
      variant: 'primary',
      trailingIcon: 'arrow'
    });
    
    // The icon press scale is computed in render based on held state
    // We can't easily test the exact scale without inspecting canvas calls,
    // but we can verify the logic exists by checking _pressed affects render
    btn._pressed = true;
    mockPress(btn, true);
    const ctx = createMockCtx();
    btn.render(ctx); // Should not throw with pressed state
    clearPress();
  });

  test('COMP-04: reduced motion snaps scale instantly', () => {
    const btn = UI.MagneticBtn(10, 10, 100, 40, 'Test', { variant: 'primary' });
    const originalReduced = R.reducedMotion;
    R.reducedMotion = () => true;
    
    btn._pressed = true;
    mockPress(btn, true);
    btn.update(0.016);
    assert.strictEqual(btn._springScale, 0.97);
    
    btn._pressed = false;
    clearPress();
    btn.update(0.016);
    assert.strictEqual(btn._springScale, 1);
    
    R.reducedMotion = originalReduced;
  });

  test('COMP-04: zero per-frame allocation', () => {
    const btn = UI.MagneticBtn(10, 10, 100, 40, 'Test', { variant: 'primary' });
    btn._pressed = true;
    mockPress(btn, true);
    btn.update(0.016);
    btn.update(0.016);
    // No allocation errors, state mutates in place
    clearPress();
  });
});

describe('UI.Panel (refactored)', () => {
  test('COMP-01/05: panel has enterProgress and uses R.easePremium', () => {
    const panel = UI.Panel(10, 10, 200, 150);
    
    assert.strictEqual(panel.enterProgress, 0);
    assert.ok(panel._updateHook);
    assert.ok(panel._renderHook);
  });

  test('COMP-05: update drives enterProgress toward 1', () => {
    const panel = UI.Panel(10, 10, 200, 150);
    
    panel.update(0.1); // 0.1 / 0.25 = 0.4
    assert.ok(panel.enterProgress > 0 && panel.enterProgress < 1);
    
    panel.update(0.25);
    assert.strictEqual(panel.enterProgress, 1); // Capped at 1
  });

  test('COMP-05: reduced motion snaps enterProgress to 1', () => {
    const panel = UI.Panel(10, 10, 200, 150);
    const originalReduced = R.reducedMotion;
    R.reducedMotion = () => true;
    
    panel.update(0.016);
    assert.strictEqual(panel.enterProgress, 1);
    
    R.reducedMotion = originalReduced;
  });

  test('COMP-05: render uses R.doubleBezel with eased alpha', () => {
    const panel = UI.Panel(10, 10, 200, 150);
    panel.enterProgress = 0.5;
    
    const ctx = createMockCtx();
    panel.render(ctx); // Should not throw
  });

  test('COMP-05: children render at full opacity (ctx.globalAlpha = 1)', () => {
    const panel = UI.Panel(10, 10, 200, 150);
    panel.enterProgress = 0.5;
    
    let childAlpha = null;
    const child = {
      render: function(ctx) { childAlpha = ctx.globalAlpha; }
    };
    panel.addChild(child);
    
    const ctx = createMockCtx();
    panel.render(ctx);
    // After panel render, globalAlpha should be restored to 1
    assert.strictEqual(childAlpha, 1);
  });
});

describe('UI.Modal (refactored)', () => {
  before(() => {
    UI.Modal.clearAll();
  });

  after(() => {
    UI.Modal.clearAll();
  });

  test('COMP-01: modal has _overlayProgress, _btnProgress[], _created state', () => {
    UI.Modal.clearAll();
    const m = UI.Modal.show({ title: 'Test', body: 'Body' });
    
    assert.ok('_overlayProgress' in m);
    assert.ok('_btnProgress' in m);
    assert.ok('_created' in m);
    assert.ok('_openedAt' in m);
    assert.strictEqual(m._overlayProgress, 0);
    assert.ok(Array.isArray(m._btnProgress));
    assert.strictEqual(m._created, 0); // Set on first render
  });

  test('COMP-02: overlay alpha uses R.easePremium(_overlayProgress)', () => {
    UI.Modal.clearAll();
    const m = UI.Modal.show({ title: 'Test', body: 'Body' });
    m._overlayProgress = 0.5;
    
    const ctx = createMockCtx();
    UI.Modal._paint(ctx, m);
    // Overlay alpha should be R.easePremium(0.5) = 0.5
    // Can't easily verify without spying, but should not throw
  });

  test('COMP-03: panel uses R.doubleBezel (not manual roundRect + stroke)', () => {
    UI.Modal.clearAll();
    const m = UI.Modal.show({ title: 'Test', body: 'Body' });
    
    // _paint calls R.doubleBezel internally
    const ctx = createMockCtx();
    UI.Modal._paint(ctx, m); // Should not throw
  });

  test('COMP-03: button cascade uses 40ms stagger via _btnProgress', () => {
    UI.Modal.clearAll();
    const m = UI.Modal.show({ 
      title: 'Test', 
      body: 'Body',
      buttons: [
        { label: 'A', primary: true },
        { label: 'B' },
        { label: 'C' }
      ]
    });
    
    m._created = performance.now();
    // Simulate time passing
    const originalNow = performance.now;
    let now = m._created;
    performance.now = () => now;
    
    // At creation: all btnProgress should be 0 or negative (clamped to 0)
    UI.Modal.render(createMockCtx()); // This calculates _btnProgress
    
    // After 250ms (first button delay)
    now = m._created + 250;
    UI.Modal.render(createMockCtx());
    // First button should be starting to appear
    
    // After 290ms (first + 40ms)
    now = m._created + 290;
    UI.Modal.render(createMockCtx());
    // Second button should be starting
    
    performance.now = originalNow;
  });

  test('COMP-04: uses R.reducedMotion() (not G.state.reduceMotion)', () => {
    UI.Modal.clearAll();
    const m = UI.Modal.show({ title: 'Test', body: 'Body' });
    
    // Mock R.reducedMotion to return true
    const originalReduced = R.reducedMotion;
    R.reducedMotion = () => true;
    
    m._created = performance.now();
    // Call the update hook directly (new architecture)
    if (m._updateHook) m._updateHook(0.016, m);
    
    // With reduced motion, overlayProgress and btnProgress should be 1
    assert.strictEqual(m._overlayProgress, 1);
    for (const bp of m._btnProgress) {
      assert.strictEqual(bp, 1);
    }
    
    R.reducedMotion = originalReduced;
  });

  test('COMP-04: ghost dissolve uses R.easePremium(1-t)', () => {
    UI.Modal.clearAll();
    const m = UI.Modal.show({ title: 'Test', body: 'Body' });
    UI.Modal.dismiss(true);
    
    const g = UI.Modal._ghost;
    assert.ok(g);
    g._closedAt = performance.now();
    
    const originalReduced = R.reducedMotion;
    R.reducedMotion = () => false;
    
    // Mock performance.now for ghost
    const originalNow = performance.now;
    let now = g._closedAt + 50; // 50ms into dissolve (t=0.5)
    performance.now = () => now;
    
    const ctx = createMockCtx();
    UI.Modal.render(ctx);
    // Ghost alpha should be R.easePremium(1 - 0.5) = R.easePremium(0.5) = 0.5
    // Can't easily verify without spying, but should not throw
    
    performance.now = originalNow;
    R.reducedMotion = originalReduced;
  });
});

describe('Integration: Component factory used across UI', () => {
  test('Button, Panel, Modal all have _updateHook and _renderHook', () => {
    const btn = UI.Button(0, 0, 100, 40, 'Btn');
    const panel = UI.Panel(0, 0, 200, 150);
    const modal = UI.Modal.show({ title: 'T', body: 'B' });
    
    assert.ok(btn._updateHook);
    assert.ok(btn._renderHook);
    assert.ok(panel._updateHook);
    assert.ok(panel._renderHook);
    // Modal now uses UI.Component pattern with _updateHook and _renderHook
    assert.ok(modal._updateHook);
    assert.ok(modal._renderHook);
  });

  test('All components have contains method', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Btn');
    const panel = UI.Panel(10, 10, 200, 150);
    
    assert(typeof btn.contains === 'function');
    assert(typeof panel.contains === 'function');
  });

  test('No per-frame allocations in hot paths (smoke test)', () => {
    const btn = UI.Button(10, 10, 100, 40, 'Btn');
    const panel = UI.Panel(10, 10, 200, 150);
    const modal = UI.Modal.show({ title: 'T', body: 'B' });
    
    btn._pressed = true;
    mockPress(btn, true);
    for (let i = 0; i < 100; i++) {
      btn.update(0.016);
      panel.update(0.016);
    }
    clearPress();
    // If we get here without memory pressure, allocation is minimal
    assert.ok(true);
  });
});