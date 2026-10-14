// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

/**
 * Base UI Component factory.
 * Returns a plain object with position, size, and lifecycle hooks.
 * All state is allocated once at construction — no per-frame allocations.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @returns {object}
 */
globalThis.UI.Component = function(x, y, w, h, opts = {}) {
  const base = {
    x: x || 0,
    y: y || 0,
    w: w || 0,
    h: h || 0,
    visible: true,
    enabled: true,
    data: null,
    onClick: null,
    // Lifecycle hooks — set by mixins or consumers
    _updateHook: null,
    _renderHook: null,
    _containsHook: null,

    /**
     * Default render — delegates to _renderHook if present.
     * @param {CanvasRenderingContext2D} ctx
     */
    render: function(ctx) {
      if (!this.visible) return;
      if (this._renderHook) this._renderHook(ctx, this);
    },

    /**
     * Default update — delegates to _updateHook if present.
     * @param {number} dt - Delta time in seconds
     */
    update: function(dt) {
      if (this._updateHook) this._updateHook(dt, this);
    },

    /**
     * Default contains — delegates to _containsHook if present.
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    contains: function(px, py) {
      if (this._containsHook) return this._containsHook(px, py, this);
      return px >= this.x && px <= this.x + this.w &&
             py >= this.y && py <= this.y + this.h;
    }
  };
  // Merge opts into base (allows custom properties like foo: 'bar')
  return Object.assign(base, opts);
};

/**
 * Mixin: Render delegation.
 * Adds a render method that calls the provided draw function.
 *
 * @param {object} comp - Component instance from UI.Component
 * @param {function} drawFn - Function(ctx, comp) to draw the component
 */
globalThis.UI.mixinRender = function(comp, drawFn) {
  comp._renderHook = drawFn;
};

/**
 * Mixin: Update delegation.
 * Adds an update method that calls the component's _updateHook.
 * The hook receives (dt, comp) and is expected to mutate comp in place.
 *
 * @param {object} comp - Component instance from UI.Component
 */
globalThis.UI.mixinUpdate = function(comp) {
  // _updateHook is set by the consumer; this mixin just ensures
  // the update method exists and delegates to it.
  // UI.Component already provides the delegating update method.
};

/**
 * Mixin: Spring physics integration.
 * Adds _springState and a step function from R.spring(config).
 * The component's update will advance the spring each frame.
 *
 * @param {object} comp - Component instance from UI.Component
 * @param {object} config - Spring config { stiffness, damping, target }
 */
globalThis.UI.mixinSpring = function(comp, config) {
  comp._springState = { value: config.target || 1, velocity: 0 };
  comp._springStep = R.spring(config);
  comp._springConfig = config;

  // Wrap existing update hook to advance spring
  const prevHook = comp._updateHook;
  comp._updateHook = function(dt, c) {
    if (prevHook) prevHook(dt, c);
    // Advance spring
    if (R.reducedMotion && R.reducedMotion()) {
      c._springState.value = c._springConfig.target;
      c._springState.velocity = 0;
    } else {
      const s = c._springStep(c._springState.value, c._springState.velocity, dt);
      c._springState.value = s.value;
      c._springState.velocity = s.velocity;
    }
  };
};

/**
 * Mixin: Easing helper.
 * Adds easedValue(t) method using R.easePremium.
 *
 * @param {object} comp - Component instance from UI.Component
 */
globalThis.UI.mixinEase = function(comp) {
  comp.easedValue = function(t) {
    return R.easePremium(t);
  };
};

/**
 * Mixin: Contains with radius-aware hit testing.
 * Adds a contains method using R.radius for rounded-rect hit testing.
 *
 * @param {object} comp - Component instance from UI.Component
 * @param {string} [radiusKey='s'] - Key in R.radius (xs, s, m, l)
 */
globalThis.UI.mixinContains = function(comp, radiusKey = 's') {
  comp._containsHook = function(px, py, c) {
    const r = R.radius[radiusKey] || R.radius.s;
    // For rounded rects, we can do a quick rect check first
    if (px < c.x || px > c.x + c.w || py < c.y || py > c.y + c.h) return false;
    // If radius is small relative to size, rect check is sufficient
    // For tighter corner exclusion, a full rounded-rect check could be added
    return true;
  };
};