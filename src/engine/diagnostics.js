// Phase 20-01: Bounded opt-in diagnostics. Disabled by default; read-only
// collectors; buffers cleared on disable; no console output of its own.
// Script-order contract: loaded after navigation.js (uses Navigation,
// Input, SaveSystem hooks when present) and before scenes.
const Diagnostics = (function() {
  const BOUNDS = { frame: 300, transition: 50, input: 200, persistence: 20 };
  const SCRIPT_GROUPS = ['engine', 'data', 'systems', 'ui', 'scenes', 'boot'];

  let _enabled = false;
  let _rafId = null;
  let _lastT = 0;
  let _hooksInstalled = false;
  let _keyListenerInstalled = false;

  function G_() {
    if (typeof G !== 'undefined' && G && G.state) return G;
    if (typeof window !== 'undefined' && window.G && window.G.state) return window.G;
    return null;
  }

  function ensureBuffers() {
    const g = G_();
    if (!g) return { frame: [], transition: [], input: [], persistence: [], invariants: {} };
    if (!g.state.diagnostics || typeof g.state.diagnostics !== 'object') {
      g.state.diagnostics = { frame: [], transition: [], input: [], persistence: [], invariants: {} };
    }
    const d = g.state.diagnostics;
    if (!Array.isArray(d.frame)) d.frame = [];
    if (!Array.isArray(d.transition)) d.transition = [];
    if (!Array.isArray(d.input)) d.input = [];
    if (!Array.isArray(d.persistence)) d.persistence = [];
    if (!d.invariants || typeof d.invariants !== 'object') d.invariants = {};
    return d;
  }

  function pushBounded(arr, item, max) {
    arr.push(item);
    while (arr.length > max) arr.shift();
  }

  function snapshotViewport() {
    try {
      const g = G_();
      const w = (g && g.W) || (typeof window !== 'undefined' && window.innerWidth) || 0;
      const h = (g && g.H) || (typeof window !== 'undefined' && window.innerHeight) || 0;
      let safeArea = { top: 0, bottom: 0, left: 0, right: 0 };
      if (typeof window !== 'undefined' && window.getComputedStyle) {
        const root = window.document && window.document.documentElement;
        if (root) {
          const cs = window.getComputedStyle(root);
          const pav = function(n) { return parseFloat(cs.getPropertyValue(n)) || 0; };
          safeArea = {
            top: pav('--sat', 0), bottom: 0, left: 0, right: 0
          };
        }
      }
      return { w: w, h: h, safeArea: safeArea };
    } catch (e) { return { w: 0, h: 0, safeArea: { top: 0, bottom: 0, left: 0, right: 0 } }; }
  }

  function recordFrame(sample) {
    if (!_enabled) return;
    const d = ensureBuffers();
    const s = sample || {};
    pushBounded(d.frame, {
      fps: typeof s.fps === 'number' ? s.fps : 0,
      frameMs: typeof s.frameMs === 'number' ? s.frameMs : 0,
      scriptGroups: Array.isArray(s.scriptGroups) ? s.scriptGroups.slice(0, SCRIPT_GROUPS.length) : [],
      timestamp: Date.now()
    }, BOUNDS.frame);
  }

  function recordTransition(entry) {
    if (!_enabled) return;
    const d = ensureBuffers();
    const e = entry || {};
    pushBounded(d.transition, {
      from: e.from != null ? String(e.from) : null,
      to: e.to != null ? String(e.to) : null,
      fadeMs: typeof e.fadeMs === 'number' ? e.fadeMs : 0,
      initMs: typeof e.initMs === 'number' ? e.initMs : 0,
      cleanupMs: typeof e.cleanupMs === 'number' ? e.cleanupMs : 0,
      timestamp: Date.now()
    }, BOUNDS.transition);
  }

  function recordInput(evt) {
    if (!_enabled) return;
    const d = ensureBuffers();
    const e = evt || {};
    const vp = snapshotViewport();
    pushBounded(d.input, {
      type: e.type != null ? String(e.type) : 'unknown',
      x: typeof e.x === 'number' ? e.x : null,
      y: typeof e.y === 'number' ? e.y : null,
      hitTarget: e.hitTarget != null ? String(e.hitTarget) : null,
      viewport: { w: vp.w, h: vp.h },
      safeArea: vp.safeArea,
      timestamp: Date.now()
    }, BOUNDS.input);
  }

  function recordPersistence(entry) {
    if (!_enabled) return;
    const d = ensureBuffers();
    const e = entry || {};
    pushBounded(d.persistence, {
      type: e.type != null ? String(e.type) : 'unknown',
      schemaVersion: e.schemaVersion != null ? e.schemaVersion : 1,
      migratedFields: Array.isArray(e.migratedFields) ? e.migratedFields.slice() : [],
      storageBytes: typeof e.storageBytes === 'number' ? e.storageBytes : 0,
      timestamp: Date.now()
    }, BOUNDS.persistence);
  }

  function frameLoop(now) {
    if (!_enabled) return;
    try {
      const t = typeof now === 'number' ? now : 0;
      const dt = _lastT ? Math.max(0, t - _lastT) : 16.7;
      _lastT = t;
      const fps = dt > 0 ? Math.min(240, 1000 / dt) : 0;
      let groups = [];
      try {
        if (typeof window !== 'undefined' && window.__mythikaProbeGroups) {
          groups = Object.keys(window.__mythikaProbeGroups);
        }
      } catch (e) {}
      recordFrame({ fps: Math.round(fps * 10) / 10, frameMs: Math.round(dt * 10) / 10, scriptGroups: groups });
    } catch (e) {}
    // Reduced motion: sampling continues (read-only numbers) but no animation is driven.
    const raf = (typeof requestAnimationFrame !== 'undefined')
      ? requestAnimationFrame
      : (typeof window !== 'undefined' && window.requestAnimationFrame) || null;
    if (raf) _rafId = raf(frameLoop);
    else _rafId = null;
  }

  function startFrameSampling() {
    stopFrameSampling();
    _lastT = 0;
    const raf = (typeof requestAnimationFrame !== 'undefined')
      ? requestAnimationFrame
      : (typeof window !== 'undefined' && window.requestAnimationFrame) || null;
    if (raf) _rafId = raf(frameLoop);
  }

  function stopFrameSampling() {
    const caf = (typeof cancelAnimationFrame !== 'undefined')
      ? cancelAnimationFrame
      : (typeof window !== 'undefined' && window.cancelAnimationFrame) || null;
    if (_rafId != null && caf) { try { caf(_rafId); } catch (e) {} }
    _rafId = null;
    _lastT = 0;
  }

  function navOf() {
    if (typeof Navigation !== 'undefined' && Navigation) return Navigation;
    if (typeof window !== 'undefined' && window.Navigation) return window.Navigation;
    return null;
  }

  function inputOf() {
    if (typeof Input !== 'undefined' && Input) return Input;
    if (typeof window !== 'undefined' && window.Input) return window.Input;
    return null;
  }

  function saveOf() {
    if (typeof SaveSystem !== 'undefined' && SaveSystem) return SaveSystem;
    if (typeof window !== 'undefined' && window.SaveSystem) return window.SaveSystem;
    return null;
  }

  function installHooks() {
    if (_hooksInstalled) return;
    _hooksInstalled = true;
    try {
      const nav = navOf();
      if (nav) {
        if (typeof nav.go === 'function' && !nav.go.__diagWrapped) {
          const origGo = nav.go;
          const wrappedGo = function(routeId, params) {
            const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            let ok = false;
            try { ok = origGo.apply(nav, arguments); } finally {
              const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
              try {
                const g = G_();
                const from = g ? g.state.scene : null;
                recordTransition({ from: from, to: routeId, fadeMs: 0, initMs: Math.round((t1 - t0) * 10) / 10, cleanupMs: 0 });
              } catch (e) {}
            }
            return ok;
          };
          wrappedGo.__diagWrapped = true;
          nav.go = wrappedGo;
        }
        if (typeof nav.transition === 'function' && !nav.transition.__diagWrapped) {
          const origT = nav.transition;
          const wrappedT = function(from, to, params) {
            const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            let ok = false;
            try { ok = origT.apply(nav, arguments); } finally {
              const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
              let rm = false;
              try {
                const R_ = (typeof R !== 'undefined') ? R : (typeof window !== 'undefined' ? window.R : null);
                rm = R_ && R_.reducedMotion ? !!R_.reducedMotion() : false;
              } catch (e) {}
              recordTransition({ from: from, to: to, fadeMs: rm ? 0 : 150, initMs: 0, cleanupMs: Math.round((t1 - t0) * 10) / 10 });
            }
            return ok;
          };
          wrappedT.__diagWrapped = true;
          nav.transition = wrappedT;
        }
      }
      const inp = inputOf();
      if (inp && typeof inp._pushTap === 'function' && !inp._pushTap.__diagWrapped) {
        const origPush = inp._pushTap;
        const wrappedPush = function(t) {
          let r;
          r = origPush.apply(inp, arguments);
          try {
            recordInput({ type: (t && t.t) || 'tap', x: t && t.x, y: t && t.y, hitTarget: (t && t.hitTarget) || null });
          } catch (e) {}
          return r;
        };
        wrappedPush.__diagWrapped = true;
        inp._pushTap = wrappedPush;
      }
      const sv = saveOf();
      if (sv) {
        if (typeof sv.save === 'function' && !sv.save.__diagWrapped) {
          const origSave = sv.save;
          const wrappedSave = function() {
            const before = Object.keys((G_() && G_().state) || {});
            const ok = origSave.apply(sv, arguments);
            try {
              let bytes = 0;
              try {
                const raw = (typeof localStorage !== 'undefined')
                  ? localStorage.getItem(sv.SAVE_KEY || 'mythika_save')
                  : ((typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem(sv.SAVE_KEY || 'mythika_save') : null);
                bytes = raw ? raw.length : 0;
              } catch (e) {}
              const after = Object.keys((G_() && G_().state) || {});
              const migrated = after.filter(function(k) { return before.indexOf(k) === -1; });
              recordPersistence({ type: 'save', schemaVersion: 1, migratedFields: migrated, storageBytes: bytes });
            } catch (e) {}
            return ok;
          };
          wrappedSave.__diagWrapped = true;
          sv.save = wrappedSave;
        }
        if (typeof sv.load === 'function' && !sv.load.__diagWrapped) {
          const origLoad = sv.load;
          const wrappedLoad = function() {
            const ok = origLoad.apply(sv, arguments);
            try {
              let bytes = 0;
              try {
                const raw = (typeof localStorage !== 'undefined')
                  ? localStorage.getItem(sv.SAVE_KEY || 'mythika_save')
                  : ((typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem(sv.SAVE_KEY || 'mythika_save') : null);
                bytes = raw ? raw.length : 0;
              } catch (e) {}
              recordPersistence({ type: 'load', schemaVersion: 1, migratedFields: [], storageBytes: bytes });
            } catch (e) {}
            return ok;
          };
          wrappedLoad.__diagWrapped = true;
          sv.load = wrappedLoad;
        }
      }
    } catch (e) {}
    installKeyListener();
  }

  function shouldOpenPanel(evt) {
    if (!evt) return false;
    const key = (evt.key || '').toLowerCase();
    return !!evt.shiftKey && (!!evt.ctrlKey || !!evt.metaKey) && key === 'd';
  }

  function openFromQuery(search) {
    const s = typeof search === 'string' ? search : (typeof window !== 'undefined' ? window.location.search : '');
    return /[?&]debug(?:&|$)/.test(s || '');
  }

  function installKeyListener() {
    if (_keyListenerInstalled) return;
    _keyListenerInstalled = true;
    try {
      const doc = (typeof document !== 'undefined') ? document : (typeof window !== 'undefined' ? window.document : null);
      if (doc && doc.addEventListener) {
        doc.addEventListener('keydown', function(e) {
          if (shouldOpenPanel(e) && _enabled) { try { panel.open('frame'); } catch (err) {} }
        });
      }
    } catch (e) {}
  }

  function runInvariants() {
    const checks = [];
    function check(name, status, detail) { checks.push({ name: name, status: status, detail: detail || '' }); }
    try {
      const R_ = (typeof R !== 'undefined') ? R : (typeof window !== 'undefined' ? window.R : null);
      const g = G_();
      // Canvas alignment: logical size present and DPR scaling sane.
      if (g && typeof g.W === 'number' && typeof g.H === 'number' && g.W > 0 && g.H > 0) {
        check('canvasAlign', 'pass', g.W + 'x' + g.H);
      } else {
        check('canvasAlign', 'warn', 'logical size unavailable');
      }
      // Color tokens present.
      if (R_ && R_.colors && R_.colors.gold && R_.colors.panel && R_.colors.text) {
        check('colorTokens', 'pass', 'gold/panel/text present');
      } else {
        check('colorTokens', 'warn', 'R.colors unavailable');
      }
      // Font scale sane.
      const fs = R_ && R_.fonts ? R_.fonts : null;
      if (fs && fs.sm && fs.md) check('fontScale', 'pass', 'sm/md present');
      else check('fontScale', 'warn', 'R.fonts unavailable');
      // Radius scale sane.
      if (R_ && R_.radius && typeof R_.radius.m === 'number') check('radiusScale', 'pass', 'm=' + R_.radius.m);
      else check('radiusScale', 'warn', 'R.radius unavailable');
      // Touch targets: scan current scene buttons when available.
      let minH = null;
      try {
        const cur = g && g.scenes && g.state ? g.scenes[g.state.scene] : null;
        const btns = cur && cur.data && Array.isArray(cur.data.buttons) ? cur.data.buttons : null;
        if (btns) {
          for (const b of btns) {
            if (b && typeof b.h === 'number') minH = (minH == null) ? b.h : Math.min(minH, b.h);
          }
        }
      } catch (e) {}
      if (minH == null) check('touchTargets', 'warn', 'no buttons to scan');
      else if (minH >= 38) check('touchTargets', 'pass', 'minH=' + minH);
      else check('touchTargets', 'fail', 'minH=' + minH + ' < 38');
    } catch (e) {
      check('error', 'fail', String((e && e.message) || e));
    }
    if (_enabled) {
      const d = ensureBuffers();
      d.invariants = { timestamp: Date.now(), checks: checks };
    }
    return checks;
  }

  function exportJSON() {
    const d = ensureBuffers();
    const serializable = {
      frame: d.frame.map(function(f) { return { fps: f.fps, frameMs: f.frameMs, scriptGroups: f.scriptGroups, timestamp: f.timestamp }; }),
      transition: d.transition.map(function(t) { return { from: t.from, to: t.to, fadeMs: t.fadeMs, initMs: t.initMs, cleanupMs: t.cleanupMs, timestamp: t.timestamp }; }),
      input: d.input.map(function(i) { return { type: i.type, x: i.x, y: i.y, hitTarget: i.hitTarget, viewport: i.viewport, safeArea: i.safeArea, timestamp: i.timestamp }; }),
      persistence: d.persistence.map(function(p) { return { type: p.type, schemaVersion: p.schemaVersion, migratedFields: p.migratedFields, storageBytes: p.storageBytes, timestamp: p.timestamp }; }),
      invariants: d.invariants || {}
    };
    return JSON.stringify(serializable);
  }

  function clearBuffers() {
    const g = G_();
    if (g && g.state.diagnostics) {
      g.state.diagnostics.frame = [];
      g.state.diagnostics.transition = [];
      g.state.diagnostics.input = [];
      g.state.diagnostics.persistence = [];
      g.state.diagnostics.invariants = {};
    }
    _lastT = 0;
  }

  function toggle(on) {
    _enabled = !!on;
    const g = G_();
    if (g) g.state.debugMode = _enabled;
    if (_enabled) {
      ensureBuffers();
      installHooks();
      startFrameSampling();
    } else {
      stopFrameSampling();
      clearBuffers();
      if (g) { try { delete g.state.diagnostics; } catch (e) { g.state.diagnostics = undefined; } }
      // No console output when disabled (and none when enabled either;
      // data is panel/export only so gameplay stays noise-free).
    }
    return _enabled;
  }

  function isEnabled() { return _enabled; }

  function resetForTests() {
    stopFrameSampling();
    _enabled = false;
    _hooksInstalled = false;
    _keyListenerInstalled = false;
    _rafId = null;
    _lastT = 0;
  }

  // Tabbed panel factory. Uses UI.PremiumShell + UI.Tabbar when available,
  // otherwise a minimal render/update/click/contains fallback.
  const panel = {
    _tab: 'frame',
    _tabs: ['frame', 'transition', 'input', 'persistence', 'invariants'],
    open: function(tab) {
      if (this._tabs.indexOf(tab) !== -1) this._tab = tab;
      this._open = true;
      return this._tab;
    },
    close: function() { this._open = false; },
    isOpen: function() { return !!this._open; },
    currentTab: function() { return this._tab; },
    rows: function() {
      const d = ensureBuffers();
      const t = this._tab;
      if (t === 'invariants') return (d.invariants && d.invariants.checks) || [];
      return d[t] || [];
    },
    render: function(ctx) {
      const mono = (typeof R !== 'undefined' && R.fonts && R.fonts.mono) ? R.fonts.mono : 'monospace';
      const out = { mono: mono, tab: this._tab };
      try {
        const UI_ = (typeof UI !== 'undefined') ? UI : (typeof window !== 'undefined' ? window.window && window.UI : null);
        if (UI_ && UI_.PremiumShell && UI_.Tabbar) {
          try { UI_.PremiumShell(ctx, 'Diagnostics', this._tab); } catch (err) {}
          return out;
        }
      } catch (e) {}
      if (!ctx || typeof ctx.fillText !== 'function') return out;
      try {
        ctx.save();
        ctx.font = '12px ' + mono;
        if (typeof R !== 'undefined' && R.colors && R.colors.text && ctx.fillStyle !== undefined) ctx.fillStyle = R.colors.text;
        ctx.fillText('Diagnostics [' + this._tab + ']', 16, 20);
        const rows = this.rows().slice(-10);
        for (let i = 0; i < rows.length; i++) {
          ctx.fillText(JSON.stringify(rows[i]).slice(0, 64), 16, 40 + i * 14);
        }
        ctx.restore();
      } catch (e) {}
      return out;
    },
    update: function() {},
    click: function(x, y) {
      // Tab hit-testing in fixed 5-slot header; returns selected tab or null.
      const w = (G_() && G_().W) || 400;
      const slot = Math.floor((x || 0) / (w / this._tabs.length));
      if (slot >= 0 && slot < this._tabs.length) { this._tab = this._tabs[slot]; return this._tab; }
      return null;
    },
    contains: function(x, y) { return !!this._open; }
  };

  return {
    BOUNDS: BOUNDS,
    SCRIPT_GROUPS: SCRIPT_GROUPS,
    collectors: {
      get frame() { return ensureBuffers().frame; },
      get transition() { return ensureBuffers().transition; },
      get input() { return ensureBuffers().input; },
      get persistence() { return ensureBuffers().persistence; },
      get invariants() { return ensureBuffers().invariants; }
    },
    toggle: toggle,
    isEnabled: isEnabled,
    recordFrame: recordFrame,
    recordTransition: recordTransition,
    recordInput: recordInput,
    recordPersistence: recordPersistence,
    runInvariants: runInvariants,
    exportJSON: exportJSON,
    clearBuffers: clearBuffers,
    shouldOpenPanel: shouldOpenPanel,
    openFromQuery: openFromQuery,
    installHooks: installHooks,
    panel: panel,
    resetForTests: resetForTests
  };
})();

if (typeof window !== 'undefined') window.Diagnostics = Diagnostics;
if (typeof module !== 'undefined' && module.exports) module.exports = Diagnostics;
