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
    let y = this.getContentTop();

    const sfxBtn = UI.Button(20, y, G.W - 40, 30, 'SFX: ' + (Audio.sfxOn ? 'ON' : 'OFF'));
    sfxBtn.onClick = function() { Audio.sfxOn = !Audio.sfxOn; settingsScene.buildButtons(); };
    this.data.buttons.push(sfxBtn);
    y += 36;

    const musicBtn = UI.Button(20, y, G.W - 40, 30, 'Music: ' + (Audio.musicOn ? 'ON' : 'OFF'));
    musicBtn.onClick = function() { Audio.musicOn = !Audio.musicOn; settingsScene.buildButtons(); };
    this.data.buttons.push(musicBtn);
    y += 36;

    // Accessibility: cycle UI text scale (persisted with the save).
    const scales = [1, 1.15, 1.3];
    const labels = ['Normal', 'Large', 'Largest'];
    const cur = scales.indexOf(G.state.uiFontScale || 1) === -1 ? 0 : scales.indexOf(G.state.uiFontScale || 1);
    const fontBtn = UI.Button(20, y, G.W - 40, 30, 'Text Size: ' + labels[cur]);
    fontBtn.onClick = function() {
      const next = scales[(cur + 1) % scales.length];
      G.state.uiFontScale = next;
      R.applyFontScale(next);
      Notify.show('Text size: ' + labels[(cur + 1) % labels.length], 2);
      settingsScene.buildButtons();
    };
    this.data.buttons.push(fontBtn);
    y += 36;

    // Accessibility: gate screen shake, death bursts, combo/level-up flashes
    // and enter animations. Persists with the save (whole-state clone).
    const rmBtn = UI.Button(20, y, G.W - 40, 30, 'Reduce Motion: ' + (G.state.reduceMotion ? 'ON' : 'OFF'));
    rmBtn.onClick = function() {
      G.state.reduceMotion = !G.state.reduceMotion;
      G.state.rmUserSet = true;
      Notify.show('Reduce motion ' + (G.state.reduceMotion ? 'on' : 'off'), 2);
      settingsScene.buildButtons();
    };
    this.data.buttons.push(rmBtn);
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

    const exportBtn = UI.Button(20, y, G.W - 40, 30, 'Export Save to File');
    exportBtn.onClick = function() {
      if (SaveSystem.exportFile()) { Notify.show('Save exported!', 2, R.colors.green); }
      else { Notify.show('Export failed!', 2, R.colors.red); }
    };
    this.data.buttons.push(exportBtn);
    y += 36;

    const importBtn = UI.Button(20, y, G.W - 40, 30, 'Import Save from File');
    importBtn.onClick = function() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = function() {
        SaveSystem.importFile(input.files && input.files[0], function(ok, msg) {
          Notify.show(msg, 3, ok ? R.colors.green : R.colors.red);
          if (ok) settingsScene.buildButtons();
        });
      };
      input.click();
    };
    this.data.buttons.push(importBtn);
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

    const updateBtn = UI.Button(20, y, G.W - 40, 30, 'Check for Game Updates');
    updateBtn.onClick = function() {
      Notify.show('Fetching updates...', 2);
      Promise.all([
        caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))),
        navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.update())))
      ]).then(function() {
        Notify.show('Updated! Reloading...', 1);
        setTimeout(function() { location.reload(); }, 800);
      }).catch(function() {
        Notify.show('Update check failed', 2, R.colors.red);
      });
    };
    this.data.buttons.push(updateBtn);
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

    this.data.buttons.push(Scene.backButton(y + 4, { fade: true }));
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
    Scene.drawHeader(ctx, 74, 'Settings', 22);
    R.textCenter(ctx, 'Ashram Level: ' + (G.state.ashramLevel || 1), G.W / 2, 46, R.colors.text, R.fonts.sm);
    R.textCenter(ctx, 'Play Time: ' + Math.floor((G.state.totalPlayTime || 0) / 60) + ' minutes', G.W / 2, 64, R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    UI.Modal.render(ctx);
  }
});
