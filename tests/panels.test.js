// Phase 48 — Panels & Modals nested-shell primitives.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

// ---- Minimal DOM/canvas stand-ins so UI.Panel / UI.Modal load in Node. ----
function mockCanvas2d() {
  const calls = { doubleBezel: 0, roundRect: 0, fillRect: 0, strokeRect: 0 };
  function record(method) {
    return function () {
      if (method === 'doubleBezel') calls.doubleBezel++;
      else if (method === 'roundRect') calls.roundRect++;
      else if (method === 'fillRect') calls.fillRect++;
      else if (method === 'strokeRect') calls.strokeRect++;
    };
  }
  const noop = record('_noop');
  return {
    calls,
    globalAlpha: 1,
    save: noop,
    restore: noop,
    fillRect: record('fillRect'),
    strokeRect: record('strokeRect'),
    roundRect: record('roundRect'),
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    fill: noop,
    stroke: noop,
    fillText: noop,
    drawImage: noop,
    setTransform: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
  };
}

function loadUI() {
  global.UI = {};
  global.G = { state: { reduceMotion: false } };
  global.performance = { now: () => 0 };
  // Stub the Phase 46 / 47 renderer primitives the UI depends on.
  global.R = {
    colors: {
      panel: '#1a1a30', panelLight: '#2a2a45', orange: '#e8a030',
      text: '#e8e0d0', textDim: '#98a0b8', btn: '#1a2040', btnGold: '#e8a030',
      surface: '#1a1a30', surfaceElevated: '#222240', hairline: 'rgba(255,255,255,0.08)',
      overlay: 'rgba(0,0,0,0.6)', insetHighlight: 'rgba(255,255,255,0.10)',
    },
    fonts: { lg: '20px sans-serif', md: '16px sans-serif', sm: '12px sans-serif' },
    radius: { s: 2, m: 6, l: 12 },
    screenW: () => 400,
    screenH: () => 720,
    easePremium: (t) => {
      if (typeof t !== 'number' || Number.isNaN(t)) t = 0;
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    },
    reducedMotion: () => global.__RM === true,
    textCenter() {},
    roundRect() {},
    strokeRoundRect() {},
    doubleBezel(ctx) {
      // doubleBezel draws via the engine's R.roundRect/strokeRoundRect, which
      // use ctx.beginPath / fill / stroke — so assert the ctx actually drew.
      if (!ctx) return;
      ctx.fillRect(0, 0, 1, 1); // shell fill proxy
      ctx.fillRect(0, 0, 1, 1); // inner core fill proxy
    },
    rect() {},
    springConfigs: {
      buttonPress: { stiffness: 300, damping: 24, target: 0.97 },
      iconPress: { stiffness: 300, damping: 24, target: 1.05 },
      panelEnter: { stiffness: 300, damping: 24, target: 1 },
      modalOverlay: { stiffness: 300, damping: 24, target: 1 },
      modalButton: { stiffness: 300, damping: 24, target: 1, delay: 40 },
      revealStagger: { stiffness: 300, damping: 24, target: 1, delay: 40 },
      sceneEnter: { stiffness: 300, damping: 24, target: 1, duration: 400 }
    },
    spring(config) {
      config = config || {};
      var stiffness = config.stiffness !== undefined ? config.stiffness : 170;
      var damping = config.damping !== undefined ? config.damping : 26;
      var target = config.target !== undefined ? config.target : 1;
      return function(current, velocity, dt) {
        var force = stiffness * (target - current) - damping * velocity;
        velocity += force * dt;
        var value = current + velocity * dt;
        return { value: value, velocity: velocity };
      };
    }
  };
  global.UI.Button = function (x, y, w, h, label) {
    return { x, y, w, h, label, _modalResult: 0,
      render() { /* noop for modal tests */ } };
  };
  global.UI.handleButtons = function () { return false; };

  require('/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/src/ui/component.js');
  require('/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/src/ui/panel.js');
  require('/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/src/ui/modal.js');
}

test.before(() => loadUI());

test('Panel.render draws through R.doubleBezel', () => {
  const ctx = mockCanvas2d();
  const panel = global.UI.Panel(10, 10, 100, 100);
  panel.enterProgress = 1; // fully entered → alpha 1
  panel.render(ctx);
  // doubleBezel internally paints shell + core (fillRect proxies).
  assert.ok(ctx.calls.fillRect >= 2, 'doubleBezel should paint at least shell + core');
});

test('Panel.update reaches enterProgress=1 immediately under reduced motion', () => {
  global.__RM = true;
  const panel = global.UI.Panel(0, 0, 50, 50);
  panel.update(0.001); // any dt
  assert.equal(panel.enterProgress, 1);
  global.__RM = false;
});

test('Modal._overlayProgress increases over time (non-reduced)', () => {
  global.__RM = false;
  let now = 1000;
  global.performance.now = () => now;
  const m = global.UI.Modal.show({ title: 'T', body: 'B', buttons: [{ label: 'OK', primary: true }] });
  assert.equal(m._created, 0); // not yet rendered

  const ctx = mockCanvas2d();

  // First update + render sets _created = now → progress is exactly 0 at frame start.
  now = m._created || now;
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);
  assert.ok(m._created > 0, '_created should be set on first render');
  assert.equal(m._overlayProgress, 0, 'progress is 0 on the frame that opens the ramp');

  // Next frame 100ms later: mid-ramp.
  now = m._created + 100;
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);
  assert.ok(m._overlayProgress > 0 && m._overlayProgress < 1, 'overlay should be mid-ramp');

  // 300ms > 250ms ramp window: complete.
  now = m._created + 300;
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);
  assert.equal(m._overlayProgress, 1, 'overlay should complete after 250ms');
  global.UI.Modal.clearAll();
});

test('Modal._overlayProgress is immediately 1 under reduced motion', () => {
  global.__RM = true;
  let now = 5000;
  global.performance.now = () => now;
  const m = global.UI.Modal.show({ title: 'T', body: 'B', buttons: [{ label: 'OK', primary: true }] });
  const ctx = mockCanvas2d();
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);
  assert.equal(m._overlayProgress, 1, 'reduced motion → overlay instant');
  global.UI.Modal.clearAll();
  global.__RM = false;
});

test('Modal button cascade: button[0] entered before button[1]', () => {
  global.__RM = false;
  let now = 2000;
  global.performance.now = () => now;
  const m = global.UI.Modal.show({ title: 'T', body: 'B', buttons: [
    { label: 'A' }, { label: 'B' }, { label: 'C', primary: true },
  ] });
  const ctx = mockCanvas2d();

  // Update + render one frame to establish _created (progress all 0 at frame start).
  now = m._created || now;
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);

  // button[0] window: starts at 250ms, ramps 400ms → complete at 650ms.
  // button[1] window: starts at 290ms, ramps 400ms → complete at 690ms.
  // At t = 620ms: button[0] is (620-250)/400 = 0.925 < 1, button[1] is (620-290)/400 = 0.825 < 1.
  // Choose t so button[0] is fully in but button[1] is not.
  // t = 650ms → button[0]=1.0, button[1]=0.925 < 1. Good.
  now = m._created + 650;
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);
  assert.equal(m._btnProgress[0], 1, 'button[0] fully entered');
  assert.ok(m._btnProgress[1] < 1, 'button[1] started later → still ramping');

  // Far enough out that the whole cascade has finished.
  now = m._created + 3000;
  m._updateHook(0.016, m);
  global.UI.Modal.render(ctx);
  assert.equal(m._btnProgress[2], 1, 'button[2] fully entered by end of cascade');
  global.UI.Modal.clearAll();
});
