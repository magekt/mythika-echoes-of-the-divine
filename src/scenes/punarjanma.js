const RebirthAccess = {
  status: function() {
    const lvl = G.state.player ? G.state.player.level : 0;
    const karma = G.state.karma || 0;
    const levelOk = lvl >= 30;
    const karmaOk = karma >= 10;
    return {
      allowed: levelOk && karmaOk,
      levelOk: levelOk,
      karmaOk: karmaOk,
      level: lvl,
      karma: karma,
      reason: !levelOk ? 'Requires Level 30+' : (!karmaOk ? 'Requires 10 Punya Karma' : '')
    };
  },
  enter: function() {
    const s = this.status();
    if (!s.allowed) return s;
    if ((G.state.karma || 0) < 10) {
      return { allowed: false, reason: 'Insufficient Punya Karma', levelOk: s.levelOk, karmaOk: false, level: s.level, karma: G.state.karma || 0 };
    }
    return { ...s, allowed: true };
  }
};

const punarjanmaScene = Scene.create({
  name: 'punarjanma',
  data: {
    buttons: [],
    staticDraws: [],
    rebirthShell: null,
    benefitShell: null,
    consequenceShell: null,
    selectedPerk: null,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.selectedPerk = null;
    this.data.scrollY = 0;
    this.buildButtons();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.rebirthShell = null;
    this.data.benefitShell = null;
    this.data.consequenceShell = null;
    this.data.selectedPerk = null;
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

    const rebirthStatus = RebirthAccess.status();
    const canRebirth = rebirthStatus.allowed;
    const panelX = 20;
    const panelW = G.W - 40;
    const shellOpts = {
      outerR: 12,
      innerR: 8,
      outerBg: R.colors.surfaceElevated,
      outerBorder: R.colors.borderHairline,
      innerBg: R.colors.panel,
      innerHighlight: R.colors.subtleWhite
    };

    // Before the commit action, make the current state and the trade-off
    // scannable in one pass. These panels are visual only; all rebirth rules
    // remain in performRebirth().
    const summaryH = 136;
    this.data.rebirthShell = UI.PremiumShell(panelX, y, panelW, summaryH, shellOpts);
    SD.push({ textCenter: ['Rebirth Preview', G.W / 2, y + 24, R.colors.gold, R.fonts.lg] });
    SD.push({ text: ['Current state', panelX + 14, y + 50, R.colors.accent, R.fonts.sm] });
    SD.push({ text: ['Cycle ' + (G.state.rebirthCount || 0) + '  •  Party Lv.' + (G.state.player ? G.state.player.level : 0), panelX + 14, y + 68, R.colors.textPrimary, R.fonts.md] });
    SD.push({ text: ['Commit cost: 10 Punya Karma', panelX + 14, y + 91, R.colors.textSecondary, R.fonts.sm] });
    SD.push({ text: [canRebirth ? 'Ready for the next Samsara crossing' : rebirthStatus.reason || 'Reach Level 30 and hold 10 Punya Karma to begin', panelX + 14, y + 113, canRebirth ? R.colors.green : R.colors.textDim, R.fonts.sm] });
    y += summaryH + 10;

    const benefitH = 88;
    this.data.benefitShell = UI.PremiumShell(panelX, y, panelW, benefitH, shellOpts);
    SD.push({ text: ['What you gain', panelX + 14, y + 22, R.colors.green, R.fonts.md] });
    SD.push({ text: ['+ Permanent stat bonuses after each crossing', panelX + 18, y + 48, R.colors.textPrimary, R.fonts.sm] });
    SD.push({ text: ['+ Gold and Karma rewards when you return', panelX + 18, y + 66, R.colors.textPrimary, R.fonts.sm] });
    y += benefitH + 10;

    const consequenceH = 112;
    this.data.consequenceShell = UI.PremiumShell(panelX, y, panelW, consequenceH, shellOpts);
    SD.push({ text: ['What resets', panelX + 14, y + 22, R.colors.danger, R.fonts.md] });
    SD.push({ text: ['• Party progression returns to Level 1', panelX + 18, y + 48, R.colors.textPrimary, R.fonts.sm] });
    SD.push({ text: ['• Party XP returns to 0; 10 Karma is spent', panelX + 18, y + 66, R.colors.textPrimary, R.fonts.sm] });
    SD.push({ text: ['This choice cannot be undone.', panelX + 18, y + 92, R.colors.danger, R.fonts.sm] });
    y += consequenceH + 10;

    SD.push({ text: ['Requirements', panelX + 2, y + 2, R.colors.accent, R.fonts.sm] });
    y += 16;

    // Requirements display
    const lvlOk = G.state.player ? G.state.player.level >= 30 : false;
    const karmaOk = (G.state.karma || 0) >= 10;
    const reqColor = lvlOk ? R.colors.green : R.colors.red;
    const reqColor2 = karmaOk ? R.colors.green : R.colors.red;
    SD.push({ text: ['Level 30+  ' + (lvlOk ? '\u2713 Ready' : '\u2717 Not yet') + '  (' + (G.state.player ? G.state.player.level : 0) + ')', 22, y + 2, reqColor, R.fonts.sm] });
    y += 16;
    SD.push({ text: ['10 Punya Karma  ' + (karmaOk ? '\u2713 Ready' : '\u2717 Not yet') + '  (' + (G.state.karma || 0) + ')', 22, y + 2, reqColor2, R.fonts.sm] });
    y += 18;
    SD.push({ text: ['Samsara Crossings: ' + (G.state.rebirthCount || 0), 22, y + 2, R.colors.gold, R.fonts.sm] });
    y += 24;

    const btnY = y + 2;
    const btn = UI.BtnGold(panelX, btnY, panelW, 48, 'Seek Moksha (Liberation)');
    btn.enabled = canRebirth;
    btn.onClick = function() {
      UI.Modal.confirm('Confirm Rebirth',
        'Party and XP reset to Level 1.\n10 Punya Karma is spent.\nPermanent bonuses remain.',
        function(confirmed) {
          if (confirmed) punarjanmaScene.performRebirth();
        },
        { buttonHeight: 48, h: 224 });
    };
    this.data.buttons.push(btn);
    y = btnY + 60;

    if (Object.keys(PERKS.tier1).length > 0) {
      SD.push({ text: ['\u2501  Siddhis (Spiritual Powers)  \u2501', 22, y + 2, R.colors.gold, R.fonts.sm] });
      y += 18;

      const buildPerkRow = (pid, perk) => {
        const curLvl = G.state.perks[pid] || 0;
        const maxLvl = perk.maxLvl;
        const nextCost = getPerkCost(pid, curLvl + 1);
        const available = isPerkAvailable(pid);
        const canBuy = available && nextCost > 0 && (G.state.karma || 0) >= nextCost && curLvl < maxLvl;

        // 86px tall perk card
        const btn = UI.Button(14, y, G.W - 28, 86, '', canBuy ? R.colors.btnGold : R.colors.btn);
        btn._pid = pid;
        btn._perk = perk;
        btn._curLvl = curLvl;
        btn._nextCost = nextCost;
        btn._canBuy = canBuy;
        btn.enabled = canBuy;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 8, this.color);
          if (!this._canBuy) ctx.globalAlpha = 0.5;
          R.roundRect(ctx, bx, by, 4, bh, 0, R.colors.gold);
          R.text(ctx, this._perk.name + ' Lv.' + this._curLvl + '/' + this._perk.maxLvl, bx + 14, by + 18, R.colors.gold, R.fonts.md);
          const costStr = this._nextCost > 0 ? this._nextCost + ' Karma' : 'MAX';
          R.text(ctx, costStr, bx + 14, by + 50, this._canBuy ? R.colors.gold : R.colors.textDim, R.fonts.sm);
          ctx.globalAlpha = 1;
        };
        btn.onClick = function() {
          const d = this;
          const cost = getPerkCost(d._pid, d._curLvl + 1);
          if (cost > 0 && Economy.spendKarma(cost)) {
            G.state.perks[d._pid] = (G.state.perks[d._pid] || 0) + 1;
            punarjanmaScene.buildButtons();
            Audio.levelUp();
          }
        };
        this.data.buttons.push(btn);
        y += 92; // card height + gap

        if (!available) {
          SD.push({ text: ['Requires one Samsara crossing (rebirth)', 30, y + 2, R.colors.red, R.fonts.sm] });
          y += 16;
          return;
        }
        const val = getPerkValue(pid, curLvl);
        if (val > 0) {
          SD.push({ text: [perk.desc.replace('%', val + ''), 30, y + 2, R.colors.textDim, R.fonts.sm] });
          y += 16;
        }
      };

      for (const [pid, perk] of Object.entries(PERKS.tier1)) buildPerkRow(pid, perk);

      // Tier II — awakened by rebirth
      if (Object.keys(PERKS.tier2).length > 0) {
        y += 6;
        const unlocked = (G.state.rebirthCount || 0) >= 1;
        SD.push({ text: ['\u2501  Siddhis Tier II' + (unlocked ? '' : ' (sealed)') + '  \u2501', 22, y + 2, unlocked ? R.colors.gold : R.colors.textDim, R.fonts.sm] });
        y += 18;
        for (const [pid, perk] of Object.entries(PERKS.tier2)) buildPerkRow(pid, perk);
      }
    }

    y += 8;
    this.data.buttons.push(Scene.backButton(y + 4, { label: 'Return to Ashram' }));
    y += 44;

    this.data.contentHeight = y;
  },

  performRebirth: function() {
    const gate = RebirthAccess.enter();
    if (!gate.allowed) {
      Notify.show(gate.reason, 2, R.colors.red);
      return;
    }
    Economy.spendKarma(10);
    G.state.rebirthCount = (G.state.rebirthCount || 0) + 1;
    for (const h of G.state.party) {
      h.level = 1;
      h.xp = 0;
      const base = HEROES[h.id];
      const ojasMul = 1 + Progression.perkValue('ojas') / 100;
      const prajnaMul = 1 + Progression.perkValue('prajna') / 100;
      h.maxHp = Math.floor((base.hp + (G.state.rebirthCount * 5)) * ojasMul);
      h.hp = h.maxHp;
      h.maxMp = base.mp + (G.state.rebirthCount * 3);
      h.mp = h.maxMp;
      h.str = base.str + G.state.rebirthCount;
      h.agi = base.agi + G.state.rebirthCount;
      h.mag = Math.floor((base.mag + G.state.rebirthCount) * prajnaMul);
      h.def = base.def + G.state.rebirthCount;
    }
    G.state.gold += 100 * G.state.rebirthCount + Progression.perkValue('vasana') * 50;
    Economy.addKarma(G.state.rebirthCount * 5 + Progression.perkValue('samskara'));
    AchievementSystem.check();
    Notify.show('Samsara transcended! Atman purified through ' + G.state.rebirthCount + ' cycles', 3, R.colors.gold);
    Audio.levelUp();
    gScene('ashram');
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 74, 'Punarjanma', 22);
    R.textCenter(ctx, 'Cycle of Samsara', G.W / 2, 46, R.colors.textDim, R.fonts.sm);
    R.textCenter(ctx, 'Punya Karma: ' + (G.state.karma || 0), G.W / 2, 64, R.colors.blue, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    if (this.data.rebirthShell) this.data.rebirthShell.render(ctx);
    if (this.data.benefitShell) this.data.benefitShell.render(ctx);
    if (this.data.consequenceShell) this.data.consequenceShell.render(ctx);
    for (const b of this.data.buttons) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    UI.Modal.render(ctx);
  }
});
