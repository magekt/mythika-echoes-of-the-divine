// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

/**
 * Tab bar component using UI.Component + mixins.
 * All state allocated once at construction.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @returns {object}
 */
UI.TabBar = function(x, y, w, h, opts) {
  const o = opts || {};
  const tabbar = UI.Component(x, y, w, h, {
    tabs: [],
    activeIndex: 0,
    onChange: o.onChange || null,
    visible: true,
    enabled: true
  });

  tabbar.setTabs = function(labels) {
    this.tabs.length = 0;
    for (const label of labels) {
      this.tabs.push({ label: label });
    }
    if (this.activeIndex >= this.tabs.length) this.activeIndex = 0;
  };

  tabbar.getActive = function() {
    return this.tabs[this.activeIndex] || null;
  };

  tabbar.getActiveIndex = function() {
    return this.activeIndex;
  };

  tabbar.setActive = function(idx) {
    if (idx >= 0 && idx < this.tabs.length && idx !== this.activeIndex) {
      this.activeIndex = idx;
      if (this.onChange) this.onChange(idx);
    }
  };

  // Update hook: no-op (static tabs)
  tabbar._updateHook = function(dt, tb) {
    // Could add animations here later
  };

  // Render hook: draws tabs with active indicator
  tabbar._renderHook = function(ctx, tb) {
    if (tb.tabs.length === 0) return;
    const tabW = tb.w / tb.tabs.length;
    for (let i = 0; i < tb.tabs.length; i++) {
      const tx = tb.x + i * tabW;
      const active = i === tb.activeIndex;
      R.roundRect(ctx, tx + 2, tb.y, tabW - 4, tb.h, 4, active ? R.colors.orange : R.colors.btn);
      if (active) {
        ctx.fillStyle = R.colors.orangeLight;
        ctx.fillRect(tx + 4, tb.y + tb.h - 3, tabW - 8, 3);
      }
      R.textCenter(ctx, tb.tabs[i].label, tx + tabW / 2, tb.y + tb.h / 2 + 4, active ? R.colors.white : R.colors.textDim, R.fonts.sm);
    }
  };

  // Input handling remains as a method (consumes taps)
  tabbar.handleInput = function() {
    const tap = Input.peekTap();
    if (!tap) return false;
    const tabW = this.w / Math.max(1, this.tabs.length);
    for (let i = 0; i < this.tabs.length; i++) {
      const tx = this.x + i * tabW;
      if (tap.x >= tx && tap.x <= tx + tabW &&
          tap.y >= this.y && tap.y <= this.y + this.h) {
        Input.getTap();
        if (i === this.activeIndex) {
          // No-op: the tab is already showing. Stone-on-glass.
          R.stoneHit(tap.x, tap.y);
          return true;
        }
        this.setActive(i);
        R.validTick(tap.x, tap.y);
        return true;
      }
    }
    return false;
  };

  UI.mixinContains(tabbar, 's');

  return tabbar;
};