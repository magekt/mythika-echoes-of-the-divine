const debugScene = Scene.create({
  name: 'debug',
  data: {
    scrollY: 0,
    lines: [],
    buttons: [],
    copyStatus: ''
  },

  enter: function() {
    this.data.scrollY = 0;
    this.data.copyStatus = '';
    this.buildLines();
    this.buildButtons();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.lines = [];
    this.data.scrollY = 0;
  },

  buildLines: function() {
    this.data.lines = [];
    const s = G.state;

    this.data.lines.push('=== MYTHIKA DEBUG ===');
    this.data.lines.push('Scene: ' + s.scene);
    this.data.lines.push('FPS: ' + (G.dt > 0 ? Math.round(1 / G.dt) : 0));
    this.data.lines.push('Play Time: ' + Math.floor(s.totalPlayTime) + 's');
    this.data.lines.push('');

    this.data.lines.push('-- Player --');
    if (s.player) {
      this.data.lines.push('Name: ' + s.player.name);
      this.data.lines.push('Level: ' + s.player.level + ' XP: ' + s.player.xp);
      this.data.lines.push('HP: ' + s.player.hp + '/' + s.player.maxHp);
      this.data.lines.push('MP: ' + s.player.mp + '/' + s.player.maxMp);
      this.data.lines.push('STR:' + s.player.str + ' AGI:' + s.player.agi + ' MAG:' + s.player.mag + ' DEF:' + s.player.def);
      this.data.lines.push('Class: ' + (s.player.className || 'none') + ' Elite: ' + (s.player.eliteClassName || 'none'));
      this.data.lines.push('Weapon: ' + Scene.gearLabel(s.player.weaponEquipped) + ' Lv.' + s.player.weaponLvl);
      this.data.lines.push('Armor: ' + Scene.gearLabel(s.player.armorEquipped) + ' Lv.' + s.player.armorLvl);
      this.data.lines.push('Accessory: ' + Scene.gearLabel(s.player.accessoryEquipped) + ' Lv.' + s.player.accessoryLvl);
    } else {
      this.data.lines.push('(no player)');
    }
    this.data.lines.push('');

    this.data.lines.push('-- Economy --');
    this.data.lines.push('Gold: ' + s.gold);
    this.data.lines.push('Karma: ' + s.karma);
    this.data.lines.push('Divine Fragments: ' + s.divineFragments);
    this.data.lines.push('');

    this.data.lines.push('-- Cultivation --');
    this.data.lines.push('Realm: ' + s.realm + ' Stage: ' + s.realmStage);
    this.data.lines.push('Cultivation Base: ' + Math.floor(s.cultivationBase || 0));
    this.data.lines.push('Prana: ' + Math.floor(s.prana || 0));
    this.data.lines.push('');

    this.data.lines.push('-- Progress --');
    this.data.lines.push('Ashram Level: ' + (s.ashramLevel || 1));
    this.data.lines.push('Rebirth Count: ' + (s.rebirthCount || 0));
    this.data.lines.push('Tournament Wins: ' + (s.tournamentWins || 0));
    this.data.lines.push('Fish Caught: ' + (s.fishCaught || 0));
    this.data.lines.push('Party Size: ' + (s.party || []).length);
    this.data.lines.push('Inventory: ' + (s.inventory || []).length + ' items');
    this.data.lines.push('Spirit Beasts: ' + (s.spiritBeasts || []).length);
    this.data.lines.push('Active Beast: ' + (s.activeBeast || 'none'));
    this.data.lines.push('');

    this.data.lines.push('-- Zone Progress --');
    for (const [zid, pct] of Object.entries(s.zoneProgress || {})) {
      const z = ZONES[zid];
      this.data.lines.push((z ? z.name : zid) + ': ' + pct + '%');
    }
    this.data.lines.push('');

    this.data.lines.push('-- Perks --');
    for (const [pid, lvl] of Object.entries(s.perks || {})) {
      const p = PERKS.tier1[pid];
      this.data.lines.push((p ? p.name : pid) + ': Lv.' + lvl);
    }
    this.data.lines.push('');

    this.data.lines.push('-- Flags --');
    for (const [k, v] of Object.entries(s.flags || {})) {
      this.data.lines.push(k + ': ' + v);
    }
    this.data.lines.push('');

    this.data.lines.push('-- Audio --');
    this.data.lines.push('Enabled: ' + Audio.enabled + ' SFX: ' + Audio.sfxOn + ' Music: ' + Audio.musicOn);
  },

  buildButtons: function() {
    this.data.buttons = [];
    const copyBtn = UI.BtnGold(60, 78, 120, 24, 'Copy');
    copyBtn.onClick = function() {
      debugScene.copyToClipboard();
    };
    this.data.buttons.push(copyBtn);

    const scrollUp = UI.Button(200, 78, 30, 24, '^');
    scrollUp.onClick = function() { debugScene.data.scrollY = Math.max(0, debugScene.data.scrollY - 1); };
    this.data.buttons.push(scrollUp);

    const scrollDn = UI.Button(240, 78, 30, 24, 'v');
    scrollDn.onClick = function() { debugScene.data.scrollY = Math.min(debugScene.data.lines.length - 1, debugScene.data.scrollY + 1); };
    this.data.buttons.push(scrollDn);

    const back = UI.Button(290, 78, 70, 24, 'Back');
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
  },

  copyToClipboard: function() {
    const text = this.data.lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        debugScene.data.copyStatus = 'Copied!';
      }).catch(function() {
        debugScene.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy: function(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      this.data.copyStatus = 'Copied!';
    } catch (e) {
      this.data.copyStatus = 'Copy failed';
    }
    document.body.removeChild(ta);
  },

  update: function(dt) {
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons);
  },

  render: function(ctx) {
    R.textCenter(ctx, 'Debug Panel', G.W / 2, 30, R.colors.gold, R.fonts.lg);
    UI.HUD().render(ctx);
    R.textCenter(ctx, 'Tap \u2191/\u2193 to scroll, Copy to clipboard', G.W / 2, 55, R.colors.textDim, R.fonts.sm);

    if (this.data.copyStatus) {
      R.textCenter(ctx, this.data.copyStatus, G.W / 2, 114, R.colors.green, R.fonts.sm);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(10, 125, G.W - 20, G.H - 140);
    ctx.clip();

    const startLine = Math.max(0, this.data.scrollY);
    const maxVisible = Math.floor((G.H - 150) / 14);
    let ly = 130;
    for (let i = startLine; i < Math.min(startLine + maxVisible, this.data.lines.length); i++) {
      const line = this.data.lines[i];
      const isHeader = line.startsWith('--') || line.startsWith('===');
      R.text(ctx, line, 15, ly + 10, isHeader ? R.colors.gold : R.colors.text, R.fonts.sm);
      ly += 14;
    }

    ctx.restore();

    for (const b of this.data.buttons) b.render(ctx);
  }
});
