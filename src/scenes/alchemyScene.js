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
    const SD = this.data.staticDraws;
    const recipes = AlchemySystem.getLearnedRecipes();
    let y = this.getContentTop() + (Object.keys(HERB_GROWTH).length > 0 ? 34 : 0);

    if (recipes.length === 0) {
      y += 10;
      SD.push({ text: ['No recipes learned yet.', 20, y, R.colors.textDim, R.fonts.sm] });
      y += 18;
      SD.push({ text: ['Farm herbs and find recipes!', 20, y, R.colors.textDim, R.fonts.sm] });
      y += 30;
    } else {
      for (const recipe of recipes) {
        const canCraft = AlchemySystem.canCraft(recipe.id);
        const btn = UI.Button(14, y, G.W - 28, 34, '', canCraft ? R.colors.btnGold : R.colors.btn);
        btn._recipe = recipe;
        btn._canCraft = canCraft;
        btn.enabled = canCraft;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 5, this.color);
          if (!this._canCraft) ctx.globalAlpha = 0.5;
          R.roundRect(ctx, bx, by, 4, bh, 0, R.colors.gold);
          R.text(ctx, this._recipe.name, bx + 14, by + 13, R.colors.gold, R.fonts.sm);
          R.text(ctx, this._recipe.desc, bx + 14, by + 25, R.colors.textDim, R.fonts.sm);
          ctx.globalAlpha = 1;
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
        y += 42;
      }
    }

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
    Scene.drawHeader(ctx, 62, 'Alchemy Lab', 22);
    R.textCenter(ctx, 'Concoct magical elixirs', G.W / 2, 46, R.colors.textDim, R.fonts.sm);

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
