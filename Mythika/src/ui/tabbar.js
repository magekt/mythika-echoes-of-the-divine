UI.TabBar = function(x, y, w, h, opts) {
  const o = opts || {};
  const tabs = [];
  let activeIndex = 0;

  return {
    x, y, w, h,
    tabs: tabs,
    activeIndex: activeIndex,
    onChange: o.onChange || null,

    setTabs: function(labels) {
      this.tabs.length = 0;
      for (const label of labels) {
        this.tabs.push({ label: label });
      }
      if (this.activeIndex >= this.tabs.length) this.activeIndex = 0;
    },

    getActive: function() {
      return this.tabs[this.activeIndex] || null;
    },

    getActiveIndex: function() {
      return this.activeIndex;
    },

    setActive: function(idx) {
      if (idx >= 0 && idx < this.tabs.length && idx !== this.activeIndex) {
        this.activeIndex = idx;
        if (this.onChange) this.onChange(idx);
      }
    },

    handleInput: function() {
      const tap = Input.peekTap();
      if (!tap) return false;
      const tabW = this.w / Math.max(1, this.tabs.length);
      for (let i = 0; i < this.tabs.length; i++) {
        const tx = this.x + i * tabW;
        if (tap.x >= tx && tap.x <= tx + tabW &&
            tap.y >= this.y && tap.y <= this.y + this.h) {
          Input.getTap();
          this.setActive(i);
          return true;
        }
      }
      return false;
    },

    render: function(ctx) {
      if (this.tabs.length === 0) return;
      const tabW = this.w / this.tabs.length;
      for (let i = 0; i < this.tabs.length; i++) {
        const tx = this.x + i * tabW;
        const active = i === this.activeIndex;
        R.roundRect(ctx, tx + 2, this.y, tabW - 4, this.h, 4, active ? R.colors.orange : R.colors.btn);
        if (active) {
          ctx.fillStyle = R.colors.orangeLight;
          ctx.fillRect(tx + 4, this.y + this.h - 3, tabW - 8, 3);
        }
        R.textCenter(ctx, this.tabs[i].label, tx + tabW / 2, this.y + this.h / 2 + 4, active ? R.colors.white : R.colors.textDim, R.fonts.sm);
      }
    }
  };
};
