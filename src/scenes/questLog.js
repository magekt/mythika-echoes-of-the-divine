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
    const allQuests = getAllQuests();

    const activeQuests = allQuests.filter(q => {
      const prog = G.state.quests[q.id];
      return prog && !prog.completed;
    });
    const completedQuests = allQuests.filter(q => {
      const prog = G.state.quests[q.id];
      return prog && prog.completed && !prog.claimed;
    });
    const doneQuests = allQuests.filter(q => {
      const prog = G.state.quests[q.id];
      return prog && prog.claimed;
    });

    if (activeQuests.length > 0) {
      y += 2;
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
          R.roundRect(ctx, bx, by, 4, bh, 0, R.colors.gold);
          R.text(ctx, this._q.name, bx + 14, by + 14, R.colors.gold, R.fonts.sm);
          R.text(ctx, this._prog.count + '/' + this._q.count, bx + 14, by + 30, R.colors.text, R.fonts.sm);
          R.roundRect(ctx, bx + bw - 80, by + 12, 66, 16, 3, 'rgba(138,138,160,0.12)');
          R.roundRect(ctx, bx + bw - 80, by + 12, 66 * this._pct / 100, 16, 3, R.colors.gold);
          R.textCenter(ctx, this._pct + '%', bx + bw - 47, by + 23, R.colors.white, R.fonts.xs);
        };
        btn.onClick = function() {
          const quest = this._q;
          questLogScene.data.selectedQuest = quest;
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
      R.text(G.ctx, 'Ready to Claim:', 18, y + 2, R.colors.green, R.fonts.sm);
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
          const quest = this._q;
          QuestSystem.claim(quest.id);
          questLogScene.buildList();
        };
        this.data.buttons.push(btn);
        y += 38;
      }
    }

    if (doneQuests.length > 0 && activeQuests.length === 0 && completedQuests.length === 0) {
      y += 10;
      R.text(G.ctx, 'All quests completed!', 18, y, R.colors.textDim, R.fonts.sm);
      y += 20;
      for (const q of doneQuests.slice(-5)) {
        R.text(G.ctx, '\u2713 ' + q.name, 22, y, R.colors.textDim, R.fonts.sm);
        y += 16;
      }
    }

    if (activeQuests.length === 0 && completedQuests.length === 0 && doneQuests.length === 0) {
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
