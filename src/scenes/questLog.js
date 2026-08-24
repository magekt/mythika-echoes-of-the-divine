const questLogScene = Scene.create({
  name: 'questLog',
  data: {
    buttons: [],
    view: 'list',
    selectedQuest: null,
    selectedChain: null,
    scrollY: 0,
    contentHeight: 0,
    staticDraws: []
  },

  enter: function() {
    this.data.view = 'list';
    this.data.selectedQuest = null;
    QuestSystem.init();
    this.data.scrollY = 0;
    this.buildList();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.selectedQuest = null;
    this.data.selectedChain = null;
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

buildList: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    function txt(t, x, y, c, f) { SD.push({ text: [t, x, y, c, f] }); }
    function box(x, y, w, h, r, fill, stroke) { SD.push({ rect: [x, y, w, h, r, fill], stroke: stroke }); }
    let y = this.getContentTop();

    const zone = G.state.currentZone || 'aryavarta';
    const chains = QuestSystem.getQuestChains(zone);
    const activeChains = chains.filter(c => c.available && !c.chainProgress.completed);
    const completedChains = chains.filter(c => c.chainProgress.completed && !c.chainProgress.claimed);

    if (activeChains.length > 0) {
      txt('QUEST CHAINS', 18, y + 2, R.colors.orange, R.fonts.sm);
      y += 18;
      for (const chain of activeChains) {
        const prog = chain.chainProgress;
        const currentStep = chain.activeStep;
        const pct = Math.floor((prog.currentStep / chain.steps.length) * 100);

        // 86px tall card with 8px gap grid layout
        const btn = UI.Button(14, y, G.W - 28, 86, '', R.colors.panel);
        btn._chain = chain;
        btn._pct = pct;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.panel);
          ctx.strokeStyle = R.colors.orange;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
          R.text(ctx, this._chain.name, bx + 14, by + 18, R.colors.orange, R.fonts.md);
          R.text(ctx, 'Step ' + (this._chain.chainProgress.currentStep + 1) + '/' + this._chain.steps.length, bx + 14, by + 32, R.colors.textDim, R.fonts.sm);
          if (this._chain.activeStep) {
            R.text(ctx, this._chain.activeStep.name, bx + 14, by + 48, R.colors.gold, R.fonts.sm);
          }
          // Progress bar track
          R.roundRect(ctx, bx + 14, by + bh - 28, bw - 28, 8, 4, 'rgba(232,160,48,0.12)');
          R.roundRect(ctx, bx + 14, by + bh - 28, (bw - 28) * this._pct / 100, 8, 4, R.colors.orange);
          R.textCenter(ctx, this._pct + '%', bx + bw - 14, by + bh - 22, R.colors.white, R.fonts.xs);
          // Badge in top-right if chain has active steps not yet completed
          if (this._chain.chainProgress.currentStep < this._chain.steps.length - 1) {
            R.roundRect(ctx, bx + bw - 28, by + 8, 20, 14, 7, R.colors.red);
            R.textCenter(ctx, 'ONGOING', bx + bw - 22, by + 15, R.colors.white, R.fonts.xs);
          }
        };
        btn.onClick = function() {
          questLogScene.data.selectedChain = this._chain;
          questLogScene.data.view = 'chainDetail';
          questLogScene.data.scrollY = 0;
          questLogScene.buildChainDetail();
        };
        this.data.buttons.push(btn);
        y += 92; // card height + gap
      }
    }
    
    if (completedChains.length > 0) {
      y += 4;
      txt('CLAIM REWARDS:', 18, y + 2, R.colors.green, R.fonts.sm);
      y += 18;
      for (const chain of completedChains) {
        const btn = UI.BtnGold(14, y, G.W - 28, 38, 'Claim ' + chain.name + ' Reward');
        btn._chain = chain;
        btn.onClick = function() {
          QuestSystem.claimChain(this._chain.id);
          questLogScene.buildList();
        };
        this.data.buttons.push(btn);
        y += 46;
      }
    }

    const allQuests = getAllQuests();
    const activeQuests = allQuests.filter(q => {
      const prog = G.state.quests[q.id];
      return prog && !prog.completed;
    });
    const completedQuests = allQuests.filter(q => {
      const prog = G.state.quests[q.id];
      return prog && prog.completed && !prog.claimed;
    });

    if (activeQuests.length > 0) {
      y += 8;
      txt('SIDE QUESTS', 18, y + 2, R.colors.blueLight, R.fonts.sm);
      y += 18;
      for (const q of activeQuests) {
        const prog = G.state.quests[q.id];
        const pct = q.count > 0 ? Math.floor((prog.count || 0) / q.count * 100) : 0;
        // 86px tall card
        const btn = UI.Button(14, y, G.W - 28, 86, '', R.colors.panel);
        btn._q = q;
        btn._prog = prog;
        btn._pct = pct;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.panel);
          ctx.strokeStyle = 'rgba(138,138,160,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          // Difficulty indicator dot on left
          R.roundRect(ctx, bx, by + bh / 2 - 4, 4, 8, 0, R.colors.blueLight);
          R.text(ctx, this._q.name, bx + 14, by + 18, R.colors.blueLight, R.fonts.sm);
          R.text(ctx, this._prog.count + '/' + this._q.count, bx + 14, by + 34, R.colors.text, R.fonts.sm);
          // Progress bar at bottom
          R.roundRect(ctx, bx + 14, by + bh - 20, bw - 28, 8, 4, 'rgba(138,138,160,0.12)');
          R.roundRect(ctx, bx + 14, by + bh - 20, (bw - 28) * this._pct / 100, 8, 4, R.colors.blueLight);
          R.textCenter(ctx, this._pct + '%', bx + bw - 14, by + bh - 16, R.colors.white, R.fonts.xs);
        };
        btn.onClick = function() {
          questLogScene.data.selectedQuest = this._q;
          questLogScene.data.view = 'detail';
          questLogScene.data.scrollY = 0;
          questLogScene.buildDetail();
        };
        this.data.buttons.push(btn);
        y += 92; // card height + gap
      }
    }

    if (completedQuests.length > 0) {
      y += 4;
      txt('READY TO CLAIM:', 18, y + 2, R.colors.green, R.fonts.sm);
      y += 18;
      for (const q of completedQuests) {
        const btn = UI.BtnGold(14, y, G.W - 28, 38, 'Claim ' + q.name + ' Reward');
        btn._q = q;
        btn.onClick = function() {
          QuestSystem.claim(this._q.id);
          questLogScene.buildList();
        };
        this.data.buttons.push(btn);
        y += 46;
      }
    }

    if (activeQuests.length === 0 && completedQuests.length === 0 && activeChains.length === 0 && completedChains.length === 0) {
      y += 10;
      txt('No quests available.', 18, y, R.colors.textDim, R.fonts.sm);
      y += 20;
    }

    y += 8;
    this.data.buttons.push(Scene.backButton(y));
    y += 44;

    this.data.contentHeight = y;
  },

  buildDetail: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    function txt(t, x, y, c, f) { SD.push({ text: [t, x, y, c, f] }); }
    function box(x, y, w, h, r, fill, stroke) { SD.push({ rect: [x, y, w, h, r, fill], stroke: stroke }); }
    const q = this.data.selectedQuest;
    const prog = G.state.quests[q.id] || { count: 0 };
    let y = this.getContentTop();

    // Info card using PremiumShell: 86px height with double bezel
    const infoH = 86;
    const infoShell = UI.PremiumShell(10, y, G.W - 20, infoH, { outerR: 8 });
    infoShell.render(ctx);
    SD.push({ shell: infoShell });
    y += 30; // padding inside premium shell

    txt(q.name, 22, y, R.colors.gold, R.fonts.lg);
    y += 22;
    txt(q.desc, 22, y, R.colors.text, R.fonts.sm);
    y += 22;
    txt('Progress: ' + (prog.count || 0) + '/' + q.count, 22, y, R.colors.text, R.fonts.sm);
    y += 22;

    let rewardStr = 'Rewards: ';
    if (q.reward.gold) rewardStr += q.reward.gold + 'g ';
    if (q.reward.xp) rewardStr += q.reward.xp + 'XP ';
    if (q.reward.karma) rewardStr += q.reward.karma + 'Karma ';
    if (q.reward.df) rewardStr += q.reward.df + 'DF ';
    txt(rewardStr, 22, y, R.colors.gold, R.fonts.sm);
    y += 22;
    txt(prog.completed ? 'Complete!' : 'In progress', 22, y, prog.completed ? R.colors.green : R.colors.textDim, R.fonts.sm);
    y += 22;

    y += 10;

    if (prog.completed && !prog.claimed) {
      const claimBtn = UI.BtnGold(60, y, G.W - 120, 36, 'Claim Reward');
      claimBtn.onClick = function() {
        QuestSystem.claim(q.id);
        questLogScene.data.view = 'list';
        questLogScene.data.scrollY = 0;
        questLogScene.buildList();
      };
      this.data.buttons.push(claimBtn);
      y += 46;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 34, 'Back to Quests', R.colors.btnGold);
    back.onClick = function() {
      questLogScene.data.view = 'list';
      questLogScene.data.scrollY = 0;
      questLogScene.buildList();
    };
    this.data.buttons.push(back);
    y += 46;

    this.data.contentHeight = y;
  },

  buildChainDetail: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    function txt(t, x, y, c, f) { SD.push({ text: [t, x, y, c, f] }); }
    function box(x, y, w, h, r, fill, stroke) { SD.push({ rect: [x, y, w, h, r, fill], stroke: stroke }); }
    const chain = this.data.selectedChain;
    const prog = chain.chainProgress;
    let y = this.getContentTop();

    // Chain header card: 86px height with panel bg and orange accent
    const headerH = 86;
    const headerShell = UI.PremiumShell(10, y, G.W - 20, headerH, { outerR: 8 });
    headerShell.render(ctx);
    SD.push({ shell: headerShell });
    y += 30; // padding inside premium shell

    txt(chain.name, 22, y, R.colors.orange, R.fonts.lg);
    y += 32;
    txt(chain.desc, 22, y, R.colors.text, R.fonts.sm);
    y += 32;
    txt('Step ' + (prog.currentStep + 1) + ' of ' + chain.steps.length, 22, y, R.colors.textDim, R.fonts.sm);
    y += 32;

    // Steps grid: 86px tall cards with 8px gap
    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      const stepProg = G.state.quests[step.id] || { count: 0, completed: false };
      const isActive = i === prog.currentStep && !prog.completed;
      const isDone = stepProg.completed;

      const btn = UI.Button(14, y, G.W - 28, 86, '', isActive ? R.colors.panel : R.colors.surface);
      btn._step = step;
      btn._stepProg = stepProg;
      btn._isActive = isActive;
      btn._isDone = isDone;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 8, this.color);
        if (this._isActive) {
          ctx.strokeStyle = R.colors.gold;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
        }
        const icon = this._isDone ? '\u2713' : this._isActive ? '\u25B6' : '\u25CB';
        const col = this._isDone ? R.colors.green : this._isActive ? R.colors.gold : R.colors.textDim;
        R.text(ctx, icon + ' ' + this._step.name, bx + 14, by + 18, col, R.fonts.md);
        if (this._isActive) {
          R.text(ctx, this._stepProg.count + '/' + this._step.count, bx + 14, by + 36, R.colors.text, R.fonts.sm);
          const pct = this._step.count > 0 ? (this._stepProg.count || 0) / this._step.count * 100 : 0;
          // Progress bar below icon
          R.roundRect(ctx, bx + 14, by + bh - 28, bw - 28, 8, 4, 'rgba(232,160,48,0.12)');
          R.roundRect(ctx, bx + 14, by + bh - 28, (bw - 28) * pct / 100, 8, 4, R.colors.orange);
          R.textCenter(ctx, Math.floor(pct) + '%', bx + bw - 14, by + bh - 22, R.colors.white, R.fonts.xs);
        } else if (this._isDone) {
          R.text(ctx, 'Complete', bx + 14, by + 36, R.colors.green, R.fonts.sm);
        }
      };
      this.data.buttons.push(btn);
      y += 92; // card height + gap
    }

    if (chain.finalReward) {
      y += 10;
      txt('FINAL REWARD:', 22, y, R.colors.gold, R.fonts.sm);
      y += 22;
      let rewardStr = '';
      if (chain.finalReward.gold) rewardStr += chain.finalReward.gold + 'g ';
      if (chain.finalReward.xp) rewardStr += chain.finalReward.xp + 'XP ';
      if (chain.finalReward.karma) rewardStr += chain.finalReward.karma + 'Karma ';
      if (chain.finalReward.item) rewardStr += 'Equipment ';
      txt(rewardStr, 22, y, R.colors.gold, R.fonts.sm);
      y += 50;
    }

    if (prog.completed && !prog.claimed) {
      const claimBtn = UI.BtnGold(60, y, G.W - 120, 36, 'Claim Chain Reward');
      claimBtn.onClick = function() {
        QuestSystem.claimChain(chain.id);
        questLogScene.data.view = 'list';
        questLogScene.data.scrollY = 0;
        questLogScene.buildList();
      };
      this.data.buttons.push(claimBtn);
      y += 46;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 34, 'Back to Quests', R.colors.btnGold);
    back.onClick = function() {
      questLogScene.data.view = 'list';
      questLogScene.data.scrollY = 0;
      questLogScene.buildList();
    };
    this.data.buttons.push(back);
    y += 46;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 62, 'Quest Log', 22);
    R.textCenter(ctx, 'Zone: ' + (G.state.currentZone ? ((ZONES[G.state.currentZone] || {}).name || G.state.currentZone) : 'All'), G.W / 2, 46, R.colors.text, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    Scene.drawStatic(ctx, this.data.staticDraws);

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
