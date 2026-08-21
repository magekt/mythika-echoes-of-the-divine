const settingsScene = Scene.create({
  name: 'settings',
  data: {
    buttons: [],
    scrollY: 0,
    staticDraws: [],
    contentHeight: 0
  },

  enter: function() {
    this.data.scrollY = 0;
    this.buildButtons();
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
    let y = this.getContentTop();

    const sfxBtn = UI.Button(20, y, G.W - 40, 30, 'SFX: ' + (Audio.sfxOn ? 'ON' : 'OFF'));
    sfxBtn.onClick = function() { Audio.sfxOn = !Audio.sfxOn; settingsScene.buildButtons(); };
    this.data.buttons.push(sfxBtn);
    y += 36;

    const musicBtn = UI.Button(20, y, G.W - 40, 30, 'Music: ' + (Audio.musicOn ? 'ON' : 'OFF'));
    musicBtn.onClick = function() { Audio.musicOn = !Audio.musicOn; settingsScene.buildButtons(); };
    this.data.buttons.push(musicBtn);
    y += 36;

    const saveBtn = UI.BtnGold(20, y, G.W - 40, 30, 'Save Game');
    saveBtn.onClick = function() {
      if (SaveSystem.save()) { Notify.show('Game saved!', 2); }
      else { Notify.show('Save failed!', 2); }
    };
    this.data.buttons.push(saveBtn);
    y += 36;

    const loadBtn = UI.Button(20, y, G.W - 40, 30, 'Load Game');
    loadBtn.onClick = function() {
      if (SaveSystem.load()) { Notify.show('Game loaded!', 2); }
      else { Notify.show('No save found!', 2); }
    };
    this.data.buttons.push(loadBtn);
    y += 36;

    const deleteBtn = UI.Button(20, y, G.W - 40, 30, 'Delete Save');
    deleteBtn.onClick = function() {
      UI.Modal.confirm('Delete Save', 'This cannot be undone!', function(confirmed) {
        if (confirmed) {
          if (SaveSystem.delete()) { Notify.show('Save deleted!', 2); }
          else { Notify.show('Nothing to delete!', 2); }
        }
      });
    };
    this.data.buttons.push(deleteBtn);
    y += 40;

    const info = SaveSystem.getSaveInfo();
    if (info) {
      SD.push({ text: ['Save Info:', 22, y + 2, R.colors.textDim, R.fonts.sm] });
      y += 16;
      SD.push({ text: ['Gold: ' + info.gold + '  Realm: ' + info.realm, 22, y + 2, R.colors.textDim, R.fonts.sm] });
      y += 16;
      SD.push({ text: ['Party: ' + info.partySize + '  Time: ' + Math.floor(info.playTime / 60) + 'm', 22, y + 2, R.colors.textDim, R.fonts.sm] });
      y += 20;
    }

    const back = UI.Button(60, y + 4, G.W - 120, 30, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    R.roundRect(ctx, 10, 6, G.W - 20, 74, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 73);
    R.textCenter(ctx, 'Settings', G.W / 2, 22, R.colors.gold, R.fonts.lg);
    R.textCenter(ctx, 'Ashram Level: ' + (G.state.ashramLevel || 1), G.W / 2, 46, R.colors.text, R.fonts.sm);
    R.textCenter(ctx, 'Play Time: ' + Math.floor((G.state.totalPlayTime || 0) / 60) + ' minutes', G.W / 2, 64, R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, this.getContentHeight());
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    for (const b of this.data.buttons) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    UI.Modal.render(ctx);
  }
});
