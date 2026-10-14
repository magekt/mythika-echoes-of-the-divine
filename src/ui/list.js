// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

/**
 * Scrollable list component using UI.Component + mixins.
 * All state allocated once at construction — zero per-frame allocations.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @returns {object}
 */
UI.ScrollList = function(x, y, w, h, opts) {
  const o = opts || {};
  const list = UI.Component(x, y, w, h, {
    items: [],
    scrollY: 0,
    contentHeight: 0,
    itemHeight: o.itemHeight || 34,
    itemGap: o.itemGap || 4,
    padding: o.padding || 4,
    selectedIndex: -1,
    onClick: o.onClick || null,
    onRenderItem: o.onRenderItem || null,
    getItemHeight: o.getItemHeight || null,
    headerHeight: o.headerHeight || 0,
    bottomPadding: o.bottomPadding || 20,
    itemHeights: [],
    _builtAt: 0,
    visible: true,
    enabled: true
  });

  list.setItems = function(items) {
    this.items = items;
    if (this.getItemHeight) {
      this.itemHeights = items.map((item, i) => this.getItemHeight(item, i));
      this.contentHeight = this.itemHeights.reduce((sum, ht) => sum + ht, 0) +
                           items.length * this.itemGap + this.padding * 2 + this.bottomPadding;
    } else {
      this.itemHeights = items.map(() => this.itemHeight);
      this.contentHeight = items.length * (this.itemHeight + this.itemGap) + this.padding * 2 + this.bottomPadding;
    }
    if (this.selectedIndex >= items.length) this.selectedIndex = -1;
    this._builtAt = performance.now();
  };

  // Update hook: handles scroll input
  list._updateHook = function(dt, l) {
    const scrollDelta = Input.getScrollDelta();
    if (scrollDelta) {
      const maxScroll = Math.max(0, l.contentHeight - l.h);
      l.scrollY = Math.max(0, Math.min(maxScroll, l.scrollY + scrollDelta * 0.8));
    }
  };

  // Render hook: draws visible items with rebuild crossfade
  list._renderHook = function(ctx, l) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(l.x, l.y, l.w, l.h);
    ctx.clip();

    let yPos = l.y + l.padding - l.scrollY;
    const endY = l.y + l.h;
    const bt = l._builtAt;
    const fade = (!bt || (G.state && G.state.reduceMotion)) ? 1 : Math.min(1, (performance.now() - bt) / 90);

    for (let i = 0; i < l.items.length; i++) {
      const item = l.items[i];
      const itemY = yPos;
      const itemH = l.itemHeights[i] || l.itemHeight;

      if (itemY + itemH >= l.y && itemY <= endY) {
        const selected = i === l.selectedIndex;
        ctx.save();
        ctx.globalAlpha = ctx.globalAlpha * fade;
        if (l.onRenderItem) {
          l.onRenderItem(ctx, item, i, l.x, itemY, l.w, itemH, selected);
        } else {
          R.roundRect(ctx, l.x, itemY, l.w, itemH, R.radius.xs, selected ? R.colors.orange : R.colors.btn);
          R.textCenter(ctx, item.label || item.name || String(item), l.x + l.w / 2, itemY + itemH / 2 + 3, R.colors.text, R.fonts.sm);
        }
        ctx.restore();
      }
      yPos += itemH + l.itemGap;
    }

    if (l.scrollY > 0) {
      R.textCenter(ctx, '\u25B2', l.x + l.w / 2, l.y + 6, 'rgba(232,160,48,0.5)', R.fonts.sm);
    }
    if (l.scrollY + l.h < l.contentHeight) {
      R.textCenter(ctx, '\u25BC', l.x + l.w / 2, l.y + l.h - 8, 'rgba(232,160,48,0.5)', R.fonts.sm);
    }

    ctx.restore();
  };

  // Input handling remains as a method (not in update hook) since it consumes taps
  list.handleInput = function() {
    const tap = Input.peekTap();
    if (!tap) return false;
    let yPos = this.y + this.padding - this.scrollY;
    for (let i = 0; i < this.items.length; i++) {
      const itemY = yPos;
      const itemH = this.itemHeights[i] || this.itemHeight;
      if (tap.x >= this.x && tap.x <= this.x + this.w &&
          tap.y >= itemY && tap.y <= itemY + itemH &&
          tap.y >= this.y && tap.y <= this.y + this.h) {
        Input.getTap();
        this.selectedIndex = i;
        const outcome = this.onClick ? this.onClick(this.items[i], i) : undefined;
        if (outcome === false) {
          R.stoneHit(tap.x, tap.y);
        } else {
          Audio.click();
          R.validTick(tap.x, tap.y);
        }
        return true;
      }
      yPos += itemH + this.itemGap;
    }
    return false;
  };

  // Contains for hit testing (uses default rect check)
  UI.mixinContains(list, 'xs');

  return list;
};