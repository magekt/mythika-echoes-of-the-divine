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

  getContentTop: function() { return G.CONTENT_TOP; },
  getContentHeight: function() { return G.H - this.getContentTop() - 44; },

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

    // --- Section Header (26px, panel bg, gold accent) ---
    const secHh = 26;
    const secHdr = UI.Button(14, y, G.W - 28, secHh, '', 'transparent');
    secHdr._label = 'Settings';
    secHdr._color = R.colors.gold;
    secHdr.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.panel);
      R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.sm);
    };
    this.data.buttons.push(secHdr);
    y += secHh + 8;

    // --- Audio Section ---
    // SFX toggle button - primary action, 38px minimum height
    const sfxBtn = UI.Button(20, y, G.W - 40, 38, 'SFX: ' + (Audio.sfxOn ? 'ON' : 'OFF'));
    sfxBtn.onClick = function() { Audio.sfxOn = !Audio.sfxOn; settingsScene.buildButtons(); };
    this.data.buttons.push(sfxBtn);
    y += 44;

    // Music toggle button
    const musicBtn = UI.Button(20, y, G.W - 40, 38, 'Music: ' + (Audio.musicOn ? 'ON' : 'OFF'));
    musicBtn.onClick = function() { Audio.musicOn = !Audio.musicOn; settingsScene.buildButtons(); };
    this.data.buttons.push(musicBtn);
    y += 44;

    // --- Accessibility Section ---
    // Text Size cycle button - primary action, 38px minimum height
    const scales = [1, 1.15, 1.3];
    const labels = ['Normal', 'Large', 'Largest'];
    const cur = scales.indexOf(G.state.uiFontScale || 1) === -1 ? 0 : scales.indexOf(G.state.uiFontScale || 1);
    const fontBtn = UI.Button(20, y, G.W - 40, 38, 'Text Size: ' + labels[cur]);
    fontBtn.onClick = function() {
      const next = scales[(cur + 1) % scales.length];
      G.state.uiFontScale = next;
      R.applyFontScale(next);
      Notify.show('Text size: ' + labels[(cur + 1) % labels.length], 2);
      settingsScene.buildButtons();
    };
    this.data.buttons.push(fontBtn);
    y += 44;

    // Reduce Motion toggle button
    const rmBtn = UI.Button(20, y, G.W - 40, 38, 'Reduce Motion: ' + (G.state.reduceMotion ? 'ON' : 'OFF'));
    rmBtn.onClick = function() {
      G.state.reduceMotion = !G.state.reduceMotion;
      G.state.rmUserSet = true;
      Notify.show('Reduce motion ' + (G.state.reduceMotion ? 'on' : 'off'), 2);
      settingsScene.buildButtons();
    };
    this.data.buttons.push(rmBtn);
    y += 44;

    // --- Account Section ---
    const hasSave = SaveSystem.hasSave();

    // Determine account status
    let accountText, accountBtn, signoutBtn;

    if (typeof Auth !== 'undefined' && Auth.user) {
      accountText = 'Signed in as: ' + Auth.user.email || Auth.user.uid;
      accountBtn = UI.Button(20, y, G.W - 40, 38, 'Save to Cloud');
      accountBtn.onClick = async function() {
        await SaveSystem.cloudSave();
        settingsScene.buildButtons();
      };
      signoutBtn = UI.Button(20, y + 44, G.W - 40, 38, 'Sign Out');
      signoutBtn.onClick = async function() {
        await Auth.signOut();
        Notify.show('Signed out', 2, R.colors.green);
        settingsScene.buildButtons();
      };
    } else {
      accountText = 'Not signed in — offline mode';
      accountBtn = UI.Button(20, y, G.W - 40, 38, 'Sign In / Sign Up');
      accountBtn.onClick = function() {
        Scene.goTo('auth');
      };
      signoutBtn = null;
    }

    // --- Save/Load Section ---
    // Save Game button - primary CTA, 38px minimum height
    const saveBtn = UI.Button(20, y, G.W - 40, 38, 'Save Game');
    saveBtn.onClick = function() {
      if (SaveSystem.save()) { Notify.show('Game saved!', 2); }
      else { Notify.show('Save failed!', 2); }
    };
    this.data.buttons.push(saveBtn);
    y += 44;

    // Load Game button
    const loadBtn = UI.Button(20, y, G.W - 40, 38, 'Load Game');
    loadBtn.onClick = function() {
      if (SaveSystem.load()) { Notify.show('Game loaded!', 2); }
      else { Notify.show('No save found!', 2); }
    };
    this.data.buttons.push(loadBtn);
    y += 44;

    // Export Save to File button
    const exportBtn = UI.Button(20, y, G.W - 40, 38, 'Export Save to File');
    exportBtn.onClick = function() {
      if (SaveSystem.exportFile()) { Notify.show('Save exported!', 2, R.colors.green); }
      else { Notify.show('Export failed!', 2, R.colors.red); }
    };
    this.data.buttons.push(exportBtn);
    y += 44;

    // Import Save from File button
    const importBtn = UI.Button(20, y, G.W - 40, 38, 'Import Save from File');
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
    y += 44;

    // Delete Save button
    const deleteBtn = UI.Button(20, y, G.W - 40, 38, 'Delete Save');
    deleteBtn.onClick = function() {
      UI.Modal.confirm('Delete Save', 'This cannot be undone!', function(confirmed) {
        if (confirmed) {
          if (SaveSystem.delete()) { Notify.show('Save deleted!', 2); }
          else { Notify.show('Nothing to delete!', 2); }
        }
      });
    };
    this.data.buttons.push(deleteBtn);
    y += 44;

    // --- Updates Section ---
    // Check for Game Updates button - primary action, 38px minimum height
    const updateBtn = UI.Button(20, y, G.W - 40, 38, 'Check for Game Updates');
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
    y += 44;

    // --- Save Info (optional) ---
    const info = SaveSystem.getSaveInfo();
    if (info) {
      SD.push({ text: ['Save Info:', 22, y + 2, R.colors.textDim, R.fonts.sm] });
      y += 16;
      SD.push({ text: ['Gold: ' + info.gold + '  Realm: ' + info.realm, 22, y + 2, R.colors.textDim, R.fonts.sm] });
      y += 16;
      SD.push({ text: ['Party: ' + info.partySize + '  Time: ' + Math.floor(info.playTime / 60) + 'm', 22, y + 2, R.colors.textDim, R.fonts.sm] });
      y += 20;
    }

    // --- Back button (primary action, 38px minimum) ---
    this.data.buttons.push(Scene.backButton(y + 4, { fade: true }));
    y += 52;

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