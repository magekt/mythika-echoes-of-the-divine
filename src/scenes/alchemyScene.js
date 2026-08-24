const alchemyScene = Scene.create({
  name: 'alchemyScene',
  data: {
    buttons: [],
    scrollY: 0,
    contentHeight: 0,
    staticDraws: []
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.buildButtons();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.scrollY = 0;
  },

  getContentTop: function() { return 86; },
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
    const SD = this.data.staticDraws;
    const recipes = AlchemySystem.getLearnedRecipes();
    
    // Section header: 26px height, panel bg, accent color label
    const sectionHdr = UI.Button(this.getContentTop() - 14, 0, G.W - 28, 26, '', 'transparent');
    sectionHdr._label = 'ALCHEMY';
    sectionHdr._color = R.colors.gold;
    sectionHdr.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.panel);
      R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.sm);
    };
    this.data.buttons.push(sectionHdr);

    let y = this.getContentTop(); // offset below fixed header

    if (recipes.length === 0) {
      y += 10;
      SD.push({ text: ['No recipes learned yet.', 20, y, R.colors.textDim, R.fonts.sm] });
      y += 18;
      SD.push({ text: ['Farm herbs and find recipes!', 20, y, R.colors.textDim, R.fonts.sm] });
      y += 30;
    } else {
      // 3-column grid: 14px margin, 8px gap, 86px cards
      const gridCols = 3;
      const gridGap = 8;
      const mx = 14;
      const cw = (G.W - mx * 2 - gridGap * (gridCols - 1)) / gridCols;
      const ch = 86; // card height per design system

      let idx = 0;
      for (const recipe of recipes) {
        const canCraft = AlchemySystem.canCraft(recipe.id);
        const c = idx % gridCols;
        const r = Math.floor(idx / gridCols);
        const bx = mx + c * (cw + gridGap);
        const by = y + r * (ch + gridGap);

        const btn = UI.Button(bx, by, cw, ch, '', canCraft ? R.colors.btnGold : R.colors.panel);
        btn._recipe = recipe;
        btn._canCraft = canCraft;
        btn.enabled = canCraft;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          const col = this._canCraft ? R.colors.btnGold : R.colors.surface;
          R.roundRect(ctx, bx, by, bw, bh, R.radius.m, col);
          ctx.strokeStyle = 'rgba(232,160,48,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          R.textCenter(ctx, this._recipe.name, bx + bw / 2, by + 28, this._canCraft ? R.colors.gold : R.colors.textDim, R.fonts.md);
          R.textCenter(ctx, this._recipe.desc, bx + bw / 2, by + bh - 12, R.colors.textDim, R.fonts.sm);
          // Crafting cost badge
          if (this._canCraft) {
            R.roundRect(ctx, bx + bw - 18, by + 6, 14, 12, 6, R.colors.red);
            R.textCenter(ctx, '✓', bx + bw - 12, by + 12, R.colors.white, R.fonts.xs);
          }
        };
        btn.onClick = function() {
          const data = this._recipe;
          if (AlchemySystem.craft(data.id)) {
            Notify.show('Crafted ' + data.name + '!', 2);
            Audio.heal();
            alchemyScene.buildButtons();
          } else {
            Notify.show('Crafting failed!', 2);
            Audio.error();
          }
        };
        this.data.buttons.push(btn);
        idx++;
      }
      // Calculate total height for grid
      const rows = Math.ceil(recipes.length / gridCols);
      y += rows * (ch + gridGap) + 20;
    }

    // Craft button - BtnGold 38px+ primary action
    const craftBtn = UI.Button(14, y, G.W - 28, 38, 'Brew Elixir', R.colors.btnGold);
    craftBtn.onClick = function() {
      // Find first craftable recipe and craft it
      const recipes = AlchemySystem.getLearnedRecipes();
      for (const recipe of recipes) {
        if (AlchemySystem.canCraft(recipe.id)) {
          if (AlchemySystem.craft(recipe.id)) {
            Notify.show('Crafted ' + recipe.name + '!', 2);
            Audio.heal();
            alchemyScene.buildButtons();
          } else {
            Notify.show('Crafting failed!', 2);
            Audio.error();
          }
          break;
        }
      }
    };
    this.data.buttons.push(craftBtn);
    y += 44;

    // Back button
    this.data.buttons.push(Scene.backButton(y + 6));
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    // Section header bar - 26px height, panel bg, accent color label
    R.roundRect(ctx, 10, 0, G.W - 20, 26, 6, R.colors.panel);
    R.textCenter(ctx, 'Alchemy Lab', G.W / 2, 4, R.colors.gold, R.fonts.sm);
    R.textCenter(ctx, 'Concoct magical elixirs', G.W / 2, 20, R.colors.textDim, R.fonts.sm);

    // Resources row above clip
    R.textCenter(ctx, 'Concoct magical elixirs', G.W / 2, 46, R.colors.textDim, R.fonts.sm);

    // Herb display row
    ctx.fillStyle = R.colors.panel;
    R.roundRect(ctx, 10, 74, G.W - 20, 28, 6, ctx.fillStyle);
    let hx = 20;
    for (const [hid, herb] of Object.entries(HERB_GROWTH)) {
      const count = AlchemySystem.getHerbCount(hid);
      R.text(ctx, herb.name + ': ' + count, hx, 92, R.colors.text, R.fonts.sm);
      hx += 90;
    }

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});