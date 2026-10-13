/* Lifecycle safety guards (Phase 19, D-01/D-04).
 * Script-order safe: classic global `Lifecycle`, no dependencies.
 * Scene.create wraps enter/leave at call time (see src/engine/scene.js).
 * Only transitional error tracking touches G (G._lastLifecycleError);
 * no gameplay state mutations.
 */
(function (root) {
  'use strict';

  function ensureCtx(scene) {
    if (!scene) return { timers: [], listeners: [], caches: [] };
    scene.data = scene.data || {};
    if (!scene.data._lifecycle) scene.data._lifecycle = { timers: [], listeners: [], caches: [] };
    var c = scene.data._lifecycle;
    if (!Array.isArray(c.timers)) c.timers = [];
    if (!Array.isArray(c.listeners)) c.listeners = [];
    if (!Array.isArray(c.caches)) c.caches = [];
    return c;
  }

  function untrackTimer(ctx, id) {
    var i = ctx.timers.indexOf(id);
    if (i >= 0) ctx.timers.splice(i, 1);
  }

  function cleanupScene(scene) {
    if (!scene || !scene.data) return;
    var ctx = scene.data._lifecycle;
    if (ctx) {
      for (var i = 0; i < ctx.timers.length; i++) {
        try {
          if (typeof clearTimeout !== 'undefined') clearTimeout(ctx.timers[i]);
        } catch (e) {}
      }
      ctx.timers.length = 0;
      for (var j = 0; j < ctx.listeners.length; j++) {
        var l = ctx.listeners[j];
        try {
          if (l && l.target && typeof l.target.removeEventListener === 'function') {
            l.target.removeEventListener(l.event, l.handler);
          }
        } catch (e2) {}
      }
      ctx.listeners.length = 0;
      for (var k = 0; k < ctx.caches.length; k++) {
        try {
          var c = ctx.caches[k];
          if (c && typeof c.clear === 'function') c.clear();
          else if (c && typeof c === 'object') {
            for (var key in c) {
              if (Object.prototype.hasOwnProperty.call(c, key)) delete c[key];
            }
          }
        } catch (e3) {}
      }
      ctx.caches.length = 0;
    }
    // D-01 leave contract: clear controls, static draws, scroll, modal/effect refs, stale selections.
    scene.data.buttons = [];
    scene.data.staticDraws = [];
    scene.data.scrollY = 0;
    scene.data.modal = null;
    scene.data.modalRef = null;
    scene.data.effectRefs = null;
    scene.data.effects = null;
    scene.data.selected = null;
    scene.data.selectedHero = null;
    scene.data.staleSelection = null;
  }

  function failureRecovery(route, error) {
    try {
      if (typeof root.G !== 'undefined' && root.G) {
        root.G._lastLifecycleError = {
          route: route || '?',
          message: error && error.message ? error.message : String(error),
          at: Date.now()
        };
      }
    } catch (e) {}
    try {
      if (typeof root.Notify !== 'undefined' && root.Notify && typeof root.Notify.show === 'function') {
        var R_ = root.R || {};
        var colors = R_.colors || {};
        root.Notify.show('Recovered — returning to Ashram.', 2.5, colors.red || '#f66');
      }
    } catch (e2) {}
    try {
      if (typeof root.gScene === 'function') {
        var scenes = (root.G && root.G.scenes) || {};
        var fallback = scenes.ashram ? 'ashram' : (scenes.title ? 'title' : null);
        if (fallback && route !== fallback) root.gScene(fallback, true, { error: true, message: String((error && error.message) || error) });
      }
    } catch (e3) {}
  }

  var Lifecycle = {
    ensureCtx: ensureCtx,
    cleanupScene: cleanupScene,
    failureRecovery: failureRecovery,

    wrapEnter: function (scene, fn) {
      var f = typeof fn === 'function' ? fn : function () {};
      return function (opts) {
        try {
          return f.call(scene, opts);
        } catch (err) {
          try { cleanupScene(scene); } catch (e) {}
          failureRecovery(scene && scene.name, err);
          return undefined;
        }
      };
    },

    wrapLeave: function (scene, fn) {
      var f = typeof fn === 'function' ? fn : function () {};
      return function () {
        try {
          return f.call(scene);
        } catch (err) {
          try {
            if (root.console && console.error) console.error('[Mythika] leave error in ' + ((scene && scene.name) || '?'), err);
          } catch (e) {}
          return undefined;
        } finally {
          try { cleanupScene(scene); } catch (e2) {}
        }
      };
    },

    // trackTimer(scene, timerId) — primary form. Also accepts
    // trackTimer(fn, delay) as a bare setTimeout wrapper (untracked globally).
    trackTimer: function (a, b) {
      if (typeof a === 'function') {
        if (typeof setTimeout !== 'undefined') return setTimeout(a, b);
        return 0;
      }
      var ctx = ensureCtx(a);
      if (b !== undefined && ctx.timers.indexOf(b) < 0) ctx.timers.push(b);
      return b;
    },

    schedule: function (scene, fn, delay) {
      if (typeof setTimeout === 'undefined') return 0;
      var ctx = ensureCtx(scene);
      var id = setTimeout(function () {
        untrackTimer(ctx, id);
        fn();
      }, delay);
      ctx.timers.push(id);
      return id;
    },

    clearTimer: function (scene, id) {
      try { if (typeof clearTimeout !== 'undefined') clearTimeout(id); } catch (e) {}
      if (scene && scene.data && scene.data._lifecycle) untrackTimer(scene.data._lifecycle, id);
    },

    trackListener: function (scene, target, event, handler) {
      var ctx = ensureCtx(scene);
      if (target && typeof target.addEventListener === 'function' && handler) {
        target.addEventListener(event, handler);
        ctx.listeners.push({ target: target, event: event, handler: handler });
      } else {
        // Record intent even when the target is a stub (tests), so leak
        // assertions exercise the same bookkeeping path.
        ctx.listeners.push({ target: target, event: event, handler: handler });
      }
      return handler;
    },

    trackCache: function (scene, collection) {
      var ctx = ensureCtx(scene);
      if (collection && ctx.caches.indexOf(collection) < 0) ctx.caches.push(collection);
      return collection;
    },

    // Accepts a scene ({data}) or a bare data object. Returns
    // { clean: bool, issues: [] } — never throws.
    assertClean: function (sceneOrData) {
      var issues = [];
      try {
        var d = sceneOrData && sceneOrData.data ? sceneOrData.data : sceneOrData;
        if (!d) return { clean: true, issues: issues };
        if (Array.isArray(d.buttons) && d.buttons.length) issues.push('buttons:' + d.buttons.length);
        if (Array.isArray(d.staticDraws) && d.staticDraws.length) issues.push('staticDraws:' + d.staticDraws.length);
        if (d.scrollY) issues.push('scrollY:' + d.scrollY);
        if (d.modal || d.modalRef) issues.push('modal');
        if (d.effectRefs || d.effects) issues.push('effects');
        if (d.selected || d.selectedHero || d.staleSelection) issues.push('staleSelection');
        var lc = d._lifecycle;
        if (lc) {
          if (lc.timers && lc.timers.length) issues.push('timers:' + lc.timers.length);
          if (lc.listeners && lc.listeners.length) issues.push('listeners:' + lc.listeners.length);
          if (lc.caches && lc.caches.length) {
            var grown = 0;
            for (var i = 0; i < lc.caches.length; i++) {
              var c = lc.caches[i];
              var size = c && (typeof c.size === 'number' ? c.size : (typeof c.length === 'number' ? c.length : Object.keys(c || {}).length));
              if (size) grown++;
            }
            if (grown) issues.push('caches:' + grown);
          }
        }
      } catch (e) {
        issues.push('assert-threw');
      }
      return { clean: issues.length === 0, issues: issues };
    }
  };

  root.Lifecycle = Lifecycle;
  if (typeof module !== 'undefined' && module.exports) module.exports = Lifecycle;
})(typeof globalThis !== 'undefined' ? globalThis : this);
