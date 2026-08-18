const questLogScene = Scene.create({
  name: 'questLog',
  data: {
    buttons: [],
    view: 'list',
    selectedQuest: null,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.view = 'list';
    this.data.selectedQuest = null;
    QuestSystem.init();
    this.data.scrollY = 0;
    this.buildList();
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
    let y = this.getContentTop();
    
    const zone = G.state.currentZone || 'aryavarta';
    const chains = QuestSystem.getQuestChains(zone);
    const activeChains = chains.filter(c => c.available && !c.chainProgress.completed);
    const completedChains = chains.filter(c => c.chainProgress.completed && !c.chainProgress.claimed);
    
    if (activeChains.length > 0) {
      R.text(G.ctx, 'QUEST CHAINS', 18, y + 2, R.colors.orange, R.fonts.sm);
      y += 18;
      for (const chain of activeChains) {
        const prog = chain.chainProgress;
        const currentStep = chain.activeStep;
        const pct = Math.floor((prog.currentStep / chain.steps.length) * 100);
        
        const btn = UI.Button(14, y, G.W - 28, 52, '', R.colors.panel);
        btn._chain = chain;
        btn._pct = pct;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 6, R.colors.panel);
          ctx.strokeStyle = R.colors.orange;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
          R.text(ctx, this._chain.name, bx + 10, by + 14, R.colors.orange, R.fonts.md);
          R.text(ctx, 'Step ' + (this._chain.chainProgress.currentStep + 1) + '/' + this._chain.steps.length, bx + 10, by + 28, R.colors.textDim, R.fonts.sm);
          if (this._chain.activeStep) {
            R.text(ctx, this._chain.activeStep.name, bx + 10, by + 42, R.colors.gold, R.fonts.sm);
          }
          R.roundRect(ctx, bx + bw - 70, by + 10, 56, 14, 3, 'rgba(138,138,160,0.12)');
          R.roundRect(ctx, bx + bw - 70, by + 10, 56 * this._pct / 100, 14, 3, R.colors.orange);
          R.textCenter(ctx, this._pct + '%', bx + bw - 42, by + 21, R.colors.white, R.fonts.xs);
        };
        btn.onClick = function() {
          questLogScene.data.selectedChain = this._chain;
          questLogScene.data.view = 'chainDetail';
          questLogScene.data.scrollY = 0;
          questLogScene.buildChainDetail();
        };
        this.data.buttons.push(btn);
        y += 58;
      }
    }
    
    if (completedChains.length > 0) {
      y += 4;
      R.text(G.ctx, 'CLAIM REWARDS:', 18, y + 2, R.colors.green, R.fonts.sm);
      y += 18;
      for (const chain of completedChains) {
        const btn = UI.Button(14, y, G.W - 28, 36, '', R.colors.btnGold);
        btn._chain = chain;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 5, R.colors.btnGold);
          R.text(ctx, '\u2713 ' + this._chain.name + ' [CLAIM]', bx + 10, by + 22, R.colors.white, R.fonts.md);
        };
        btn.onClick = function() {
          QuestSystem.claimChain(this._chain.id);
          questLogScene.buildList();
        };
        this.data.buttons.push(btn);
        y += 42;
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
      R.text(G.ctx, 'SIDE QUESTS', 18, y + 2, R.colors.blueLight, R.fonts.sm);
      y += 18;
      for (const q of activeQuests) {
        const prog = G.state.quests[q.id];
        const pct = q.count > 0 ? Math.floor((prog.count || 0) / q.count * 100) : 0;
        const btn = UI.Button(14, y, G.W - 28, 40, '', R.colors.panel);
        btn._q = q;
        btn._prog = prog;
        btn._pct = pct;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 6, R.colors.panel);
          ctx.strokeStyle = 'rgba(138,138,160,0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
          R.roundRect(ctx, bx, by, 4, bh, 0, R.colors.blueLight);
          R.text(ctx, this._q.name, bx + 14, by + 14, R.colors.blueLight, R.fonts.sm);
          R.text(ctx, this._prog.count + '/' + this._q.count, bx + 14, by + 30, R.colors.text, R.fonts.sm);
          R.roundRect(ctx, bx + bw - 80, by + 12, 66, 16, 3, 'rgba(138,138,160,0.12)');
          R.roundRect(ctx, bx + bw - 80, by + 12, 66 * this._pct / 100, 16, 3, R.colors.blueLight);
          R.textCenter(ctx, this._pct + '%', bx + bw - 47, by + 23, R.colors.white, R.fonts.xs);
        };
        btn.onClick = function() {
          questLogScene.data.selectedQuest = this._q;
          questLogScene.data.view = 'detail';
          questLogScene.data.scrollY = 0;
          questLogScene.buildDetail();
        };
        this.data.buttons.push(btn);
        y += 46;
      }
    }

    if (completedQuests.length > 0) {
      y += 4;
      R.text(G.ctx, 'READY TO CLAIM:', 18, y + 2, R.colors.green, R.fonts.sm);
      y += 18;
      for (const q of completedQuests) {
        const btn = UI.Button(14, y, G.W - 28, 32, '', R.colors.btnGold);
        btn._q = q;
        btn.render = function(ctx) {
          const bx = this.x, by = this.y, bw = this.w, bh = this.h;
          R.roundRect(ctx, bx, by, bw, bh, 5, R.colors.btnGold);
          R.text(ctx, '\u2713 ' + this._q.name + ' [CLAIM]', bx + 14, by + 18, R.colors.white, R.fonts.sm);
        };
        btn.onClick = function() {
          QuestSystem.claim(this._q.id);
          questLogScene.buildList();
        };
        this.data.buttons.push(btn);
        y += 38;
      }
    }

    if (activeQuests.length === 0 && completedQuests.length === 0 && activeChains.length === 0 && completedChains.length === 0) {
      y += 10;
      R.text(G.ctx, 'No quests available.', 18, y, R.colors.textDim, R.fonts.sm);
      y += 20;
    }

    y += 8;
    const back = UI.Button(60, y, G.W - 120, 30, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  buildDetail: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const q = this.data.selectedQuest;
    const prog = G.state.quests[q.id] || { count: 0 };
    let y = this.getContentTop();

    const infoH = 90;
    R.roundRect(G.ctx, 10, y, G.W - 20, infoH, 6, R.colors.panel);
    let iy = y + 14;
    R.text(G.ctx, q.name, 22, iy, R.colors.gold, R.fonts.lg);
    R.text(G.ctx, q.desc, 22, iy + 22, R.colors.text, R.fonts.sm);
    R.text(G.ctx, 'Progress: ' + (prog.count || 0) + '/' + q.count, 22, iy + 40, R.colors.text, R.fonts.sm);

    let rewardStr = 'Rewards: ';
    if (q.reward.gold) rewardStr += q.reward.gold + 'g ';
    if (q.reward.xp) rewardStr += q.reward.xp + 'XP ';
    if (q.reward.karma) rewardStr += q.reward.karma + 'Karma ';
    if (q.reward.df) rewardStr += q.reward.df + 'DF ';
    R.text(G.ctx, rewardStr, 22, iy + 58, R.colors.gold, R.fonts.sm);
    R.text(G.ctx, this.data.view === 'detail' ? (prog.completed ? 'Complete!' : 'In progress') : '', 22, iy + 74, prog.completed ? R.colors.green : R.colors.textDim, R.fonts.sm);

    y += infoH + 10;

    if (prog.completed && !prog.claimed) {
      const claimBtn = UI.BtnGold(60, y, G.W - 120, 32, 'Claim Reward');
      claimBtn.onClick = function() {
        QuestSystem.claim(q.id);
        questLogScene.data.view = 'list';
        questLogScene.data.scrollY = 0;
        questLogScene.buildList();
      };
      this.data.buttons.push(claimBtn);
      y += 40;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 30, 'Back to Quests', R.colors.btnGold);
    back.onClick = function() {
      questLogScene.data.view = 'list';
      questLogScene.data.scrollY = 0;
      questLogScene.buildList();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  buildChainDetail: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    const chain = this.data.selectedChain;
    const prog = chain.chainProgress;
    let y = this.getContentTop();

    R.roundRect(G.ctx, 10, y, G.W - 20, 70, 6, R.colors.panel);
    ctx.strokeStyle = R.colors.orange;
    ctx.lineWidth = 2;
    ctx.strokeRect(11, y + 1, G.W - 22, 68);
    R.text(G.ctx, chain.name, 22, y + 18, R.colors.orange, R.fonts.lg);
    R.text(G.ctx, chain.desc, 22, y + 38, R.colors.text, R.fonts.sm);
    R.text(G.ctx, 'Step ' + (prog.currentStep + 1) + ' of ' + chain.steps.length, 22, y + 56, R.colors.textDim, R.fonts.sm);

    y += 78;

    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      const stepProg = G.state.quests[step.id] || { count: 0, completed: false };
      const isActive = i === prog.currentStep && !prog.completed;
      const isDone = stepProg.completed;
      
      const btn = UI.Button(14, y, G.W - 28, 44, '', isActive ? R.colors.panel : 'rgba(26,32,64,0.5)');
      btn._step = step;
      btn._stepProg = stepProg;
      btn._isActive = isActive;
      btn._isDone = isDone;
      btn.render = function(ctx) {
        const bx = this.x, by = this.y, bw = this.w, bh = this.h;
        R.roundRect(ctx, bx, by, bw, bh, 5, this.color);
        if (this._isActive) {
          ctx.strokeStyle = R.colors.gold;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
        }
        const icon = this._isDone ? '\u2713' : this._isActive ? '\u25B6' : '\u25CB';
        const col = this._isDone ? R.colors.green : this._isActive ? R.colors.gold : R.colors.textDim;
        R.text(ctx, icon + ' ' + this._step.name, bx + 10, by + 16, col, R.fonts.sm);
        if (this._isActive) {
          R.text(ctx, this._stepProg.count + '/' + this._step.count, bx + 10, by + 32, R.colors.text, R.fonts.sm);
          const pct = this._step.count > 0 ? (this._stepProg.count || 0) / this._step.count * 100 : 0;
          R.roundRect(ctx, bx + bw - 80, by + 24, 66, 14, 3, 'rgba(138,138,160,0.12)');
          R.roundRect(ctx, bx + bw - 80, by + 24, 66 * pct / 100, 14, 3, R.colors.gold);
          R.textCenter(ctx, Math.floor(pct) + '%', bx + bw - 47, by + 35, R.colors.white, R.fonts.xs);
        } else if (this._isDone) {
          R.text(ctx, 'Complete', bx + 10, by + 32, R.colors.green, R.fonts.sm);
        }
      };
      this.data.buttons.push(btn);
      y += 50;
    }

    if (chain.finalReward) {
      y += 8;
      R.roundRect(G.ctx, 14, y, G.W - 28, 50, 6, R.colors.panel);
      R.text(G.ctx, 'FINAL REWARD:', 22, y + 14, R.colors.gold, R.fonts.sm);
      let rewardStr = '';
      if (chain.finalReward.gold) rewardStr += chain.finalReward.gold + 'g ';
      if (chain.finalReward.xp) rewardStr += chain.finalReward.xp + 'XP ';
      if (chain.finalReward.karma) rewardStr += chain.finalReward.karma + 'Karma ';
      if (chain.finalReward.item) rewardStr += 'Equipment ';
      R.text(G.ctx, rewardStr, 22, y + 32, R.colors.gold, R.fonts.sm);
      y += 58;
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
      y += 44;
    }

    const back = UI.Button(60, y + 6, G.W - 120, 30, 'Back to Quests', R.colors.btnGold);
    back.onClick = function() {
      questLogScene.data.view = 'list';
      questLogScene.data.scrollY = 0;
      questLogScene.buildList();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  update: function(dt) {
    const sd = Input.getScrollDelta();
    if (sd) {
      this.data.scrollY += sd * 0.8;
      this.clampScroll();
    }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    R.roundRect(ctx, 10, 6, G.W - 20, 62, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 61);
    R.textCenter(ctx, 'Quest Log', G.W / 2, 22, R.colors.gold, R.fonts.lg);
    R.textCenter(ctx, 'Zone: ' + (G.state.currentZone ? ((ZONES[G.state.currentZone] || {}).name || G.state.currentZone) : 'All'), G.W / 2, 46, R.colors.text, R.fonts.sm);

    const top = this.getContentTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, this.getContentHeight());
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    for (const b of this.data.buttons) b.render(ctx);

    ctx.restore();

    if (this.data.contentHeight > this.getContentHeight()) {
      const vh = this.getContentHeight();
      const ratio = vh / this.data.contentHeight;
      const barH = Math.max(16, ratio * vh);
      const maxTrack = vh - barH;
      const scrollFrac = this.data.scrollY / Math.max(1, this.data.contentHeight - vh);
      const barY = top + scrollFrac * maxTrack;
      R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
    }
  }
});
