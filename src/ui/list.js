UI.ScrollList = function(x, y, w, h, opts) {
  const o = opts || {};
  return {
    x, y, w, h,
    items: [],
    scrollY: 0,
    contentHeight: 0,
    itemHeight: o.itemHeight || 34,
    itemGap: o.itemGap || 4,
    padding: o.padding || 4,
    selectedIndex: -1,
    onClick: o.onClick || null,
    onRenderItem: o.onRenderItem || null,
    headerHeight: o.headerHeight || 0,
    bottomPadding: o.bottomPadding || 20,

    setItems: function(items) {
      this.items = items;
      this.contentHeight = items.length * (this.itemHeight + this.itemGap) + this.padding * 2 + this.bottomPadding;
      if (this.selectedIndex >= items.length) this.selectedIndex = -1;
    },

    handleInput: function() {
      const tap = Input.peekTap();
      if (!tap) return false;
      let yPos = this.y + this.padding - this.scrollY;
      for (let i = 0; i < this.items.length; i++) {
        const itemY = yPos;
        const itemH = this.itemHeight;
        if (tap.x >= this.x && tap.x <= this.x + this.w &&
            tap.y >= itemY && tap.y <= itemY + itemH &&
            tap.y >= this.y && tap.y <= this.y + this.h) {
          Input.getTap();
          this.selectedIndex = i;
          Audio.click();
          if (this.onClick) this.onClick(this.items[i], i);
          return true;
        }
        yPos += this.itemHeight + this.itemGap;
      }
      return false;
    },

    update: function() {
      const scrollDelta = Input.getScrollDelta();
      if (scrollDelta) {
        const maxScroll = Math.max(0, this.contentHeight - this.h);
        this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollY + scrollDelta * 0.8));
      }
    },

    render: function(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.w, this.h);
      ctx.clip();

      let yPos = this.y + this.padding - this.scrollY;
      const endY = this.y + this.h;

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const itemY = yPos;
        const itemH = this.itemHeight;

        if (itemY + itemH >= this.y && itemY <= endY) {
          const selected = i === this.selectedIndex;
          if (this.onRenderItem) {
            this.onRenderItem(ctx, item, i, this.x, itemY, this.w, itemH, selected);
          } else {
        R.roundRect(ctx, this.x, itemY, this.w, itemH, 3, selected ? R.colors.orange : R.colors.btn);
        R.textCenter(ctx, item.label || item.name || String(item), this.x + this.w / 2, itemY + itemH / 2 + 3, R.colors.text, R.fonts.sm);
          }
        }
        yPos += itemH + this.itemGap;
      }

      if (this.scrollY > 0) {
      R.textCenter(ctx, '\u25B2', this.x + this.w / 2, this.y + 6, 'rgba(232,160,48,0.5)', R.fonts.sm);
    }
    if (this.scrollY + this.h < this.contentHeight) {
      R.textCenter(ctx, '\u25BC', this.x + this.w / 2, this.y + this.h - 8, 'rgba(232,160,48,0.5)', R.fonts.sm);
      }

      ctx.restore();
    }
  };
};
