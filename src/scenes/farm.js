const farmScene = Scene.create({
  name: 'farm',
  data: {
    buttons: [],
    staticDraws: [],
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    const prithviVal = Progression.perkValue('prithvi');
    const extraPlots = Math.min(3, Math.floor(prithviVal / 50));
    const maxPlots = 3 + extraPlots;
    if (!G.state.farmPlots || G.state.farmPlots.length === 0) {
      G.state.farmPlots = [];
      for (let i = 0; i < maxPlots; i++) {
        G.state.farmPlots.push({ herb: null, growTimer: 0, harvested: false });
      }
    } else if (G.state.farmPlots.length < maxPlots) {
      for (let i = G.state.farmPlots.length; i < maxPlots; i++) {
        G.state.farmPlots.push({ herb: null, growTimer: 0, harvested: false });
      }
    }
    this.data.scrollY = 0;
    this.buildButtons();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.scrollY = 0;
  },

  getContentTop: function() { return 74; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    let y = this.getContentTop();
    const plots = G.state.farmPlots || [];

    for (let i = 0; i < plots.length; i++) {
      const plot = plots[i];
      const isReady = plot.harvested;
      const hasHerb = !!plot.herb;
      const btn = UI.Button(14, y, G.W - 28, 42, '', isReady ? R.colors.green : (hasHerb ? R.colors.panel : R.colors.btn));
      btn._i = i;
      btn._plot = plot;
      btn._isReady = isReady;
      btn._hasHerb = hasHerb;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 6, this.color);
        ctx.strokeStyle = 'rgba(138,138,160,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        R.text(ctx, 'Plot ' + (this._i + 1), bx + 14, by + 16, this._isReady ? R.colors.gold : (this._hasHerb ? R.colors.text : R.colors.textDim), R.fonts.md);
        if (this._isReady) {
          R.text(ctx, '\u2713 ' + (this._plot.herb ? HERB_GROWTH[this._plot.herb].name : '') + ' READY!', bx + 14, by + 30, R.colors.green, R.fonts.sm);
          R.text(ctx, 'Harvest', bx + bw - 60, by + 16, R.colors.gold, R.fonts.sm);
        } else if (this._plot.herb) {
          const remaining = Math.max(0, Math.ceil(HERB_GROWTH[this._plot.herb].growTime - this._plot.growTimer));
          R.text(ctx, HERB_GROWTH[this._plot.herb].name + ' (' + remaining + 's)', bx + 14, by + 30, R.colors.textDim, R.fonts.sm);
          R.roundRect(ctx, bx + 14, by + bh - 4, bw - 28, 2, 1, 'rgba(138,138,160,0.15)');
          const frac = Math.min(1, this._plot.growTimer / Math.max(1, HERB_GROWTH[this._plot.herb].growTime));
          R.roundRect(ctx, bx + 14, by + bh - 4, (bw - 28) * frac, 2, 1, R.colors.green);
        } else {
          R.text(ctx, 'Empty \u2014 tap to plant', bx + 14, by + 30, R.colors.textDim, R.fonts.sm);
        }
      };
      btn.onClick = function() {
        const idx = this._i;
        const p = G.state.farmPlots[idx];
        if (p.harvested) {
          const herbId = p.herb;
          const herbName = herbId && HERB_GROWTH[herbId] ? HERB_GROWTH[herbId].name : herbId;
          p.herb = null;
          p.harvested = false;
          p.growTimer = 0;
          Economy.addItem({ name: herbName, type: 'herb', herbId: herbId, desc: herbName + ' herb' });
          Progression.addPartyXP(5);
          Notify.show('Harvested ' + herbName + '! +5 XP', 2);
          Hints.show('alchemy', 'Herbs go to your inventory \u2014 use them in the Alchemy Lab.');
          farmScene.buildButtons();
        } else if (!p.herb) {
          farmScene.showPlantMenu(idx);
        }
      };
      this.data.buttons.push(btn);
      y += 48;
    }

    this.data.buttons.push(Scene.backButton(y + 6));
    y += 44;

    this.data.contentHeight = y;
  },

  showPlantMenu: function(plotIdx) {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    SD.push({ text: ['Select herb to plant:', 18, y + 4, R.colors.gold, R.fonts.sm] });
    y += 20;

    for (const [hid, herb] of Object.entries(HERB_GROWTH)) {
      const canBuy = (G.state.gold || 0) >= herb.buyCost;
      const btn = UI.Button(14, y, G.W - 28, 32, '', canBuy ? R.colors.btnGold : R.colors.btn);
      btn._hid = hid;
      btn._herb = herb;
      btn._plotIdx = plotIdx;
      btn._canBuy = canBuy;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 5, this.color);
        if (!this._canBuy) ctx.globalAlpha = 0.5;
        R.text(ctx, this._herb.name + ' (' + this._herb.buyCost + 'g, ' + this._herb.growTime + 's)', bx + 12, by + 18, R.colors.text, R.fonts.sm);
        ctx.globalAlpha = 1;
      };
      btn.onClick = function() {
        const data = this;
        const cost = data._herb.buyCost;
        if (Economy.spendGoldOrNotify(cost)) {
          G.state.farmPlots[data._plotIdx].herb = data._hid;
          G.state.farmPlots[data._plotIdx].growTimer = 0;
          G.state.farmPlots[data._plotIdx].harvested = false;
          Notify.show('Planted ' + data._herb.name + '!', 2);
          farmScene.buildButtons();
        } else {
          // Rejected: not enough gold -> stone-on-glass feedback.
          return false;
        }
      };
      this.data.buttons.push(btn);
      y += 38;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 30, 'Cancel', R.colors.btnGold);
    back.onClick = function() { farmScene.buildButtons(); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    for (const plot of G.state.farmPlots || []) {
      if (plot.herb && !plot.harvested) {
        plot.growTimer += dt;
        const herbData = HERB_GROWTH[plot.herb];
        if (plot.growTimer >= herbData.growTime) {
          plot.harvested = true;
        }
      }
    }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 62, 'Herb Farm', 22);
    R.textCenter(ctx, 'Gold: ' + (G.state.gold || 0) + 'g', G.W / 2, 46, R.colors.gold, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
