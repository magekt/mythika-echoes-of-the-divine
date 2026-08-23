const journeyScene = Scene.create({
  name: 'journeyScene',
  data: {
    buttons: [],
    selectedId: null,
    scrollY: 0,
    contentHeight: 0,
    staticDraws: []
  },

  enter: function() {
    this.data.scrollY = 0;
    JourneySystem.init();
    this.data.selectedId = JourneySystem.getActiveJourney() ? JourneySystem.getActiveJourney().id : null;
    // Auto-pick first available if nothing active
    if (!this.data.selectedId) {
      const avail = JourneySystem.getAvailable();
      const first = avail.find(j => j.status !== 'completed');
      if (first) this.data.selectedId = first.id;
    }
    this.buildUI();
  },

  getContentTop: function() { return 86; },
  getContentHeight: function() { return G.H - this.getContentTop() - 44; },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildUI: function() {
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.scrollY = 0;
    const SD = this.data.staticDraws;
    let y = this.getContentTop();
    const selId = this.data.selectedId;
    const sel = selId ? JOURNEYS[selId] : null;
    const progress = selId ? JourneySystem.getProgress(selId) : null;

    // Back to ashram header handled in render, add sub-nav here
    if (!sel) {
      y += 6;
      const avail = JourneySystem.getAvailable();
      if (avail.length === 0) {
        SD.push({ textCenter: ['No journeys yet.', G.W/2, y+20, R.colors.textDim, R.fonts.sm] });
        SD.push({ textCenter: ['Level up, bond a beast, or breakthrough to unlock.', G.W/2, y+38, R.colors.textDim, R.fonts.sm] });
        y += 64;
      }
      for (const j of avail) {
        const prog = j.progress;
        const isCompleted = prog.completed;
        const isActive = j.id === selId;
        const statusColor = isCompleted ? R.colors.green : (prog.nodeId ? R.colors.gold : R.colors.textDim);
        const statusText = isCompleted ? 'Completed' : (prog.nodeId ? 'In Progress' : 'Available');
        const btn = UI.Button(14, y, G.W-28, 56, '', isCompleted ? R.colors.panel : R.colors.btn);
        btn._journeyId = j.id;
        btn.enabled = !isCompleted;
        btn.render = function(ctx) {
          const bx=this.x, by=this.y, bw=this.w, bh=this.h;
          R.roundRect(ctx, bx, by, bw, bh, 8, this.color);
          ctx.strokeStyle = isCompleted ? 'rgba(48,200,48,0.25)' : 'rgba(232,160,48,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx+0.5, by+0.5, bw-1, bh-1);
          R.text(ctx, j.icon + '  ' + j.name, bx+12, by+16, R.colors.gold, R.fonts.md);
          R.text(ctx, j.desc, bx+12, by+32, R.colors.textDim, R.fonts.sm);
          R.text(ctx, statusText, bx+bw-8, by+16, statusColor, R.fonts.sm, 'right');
        };
        btn.onClick = function() {
          journeyScene.data.selectedId = this._journeyId;
          const j2 = JOURNEYS[this._journeyId];
          const p = JourneySystem.getProgress(this._journeyId);
          if (!p.nodeId && !p.completed) {
            JourneySystem.start(this._journeyId);
          }
          journeyScene.buildUI();
        };
        this.data.buttons.push(btn);
        y += 62;
      }
    } else {
      // Detail view for selected journey
      const node = JourneySystem.getCurrentNode(selId);
      // Header card
      SD.push({ text: [sel.icon + '  ' + sel.name, 18, y+8, R.colors.gold, R.fonts.md] });
      SD.push({ text: [sel.desc, 18, y+24, R.colors.textDim, R.fonts.sm] });
      y += 36;
      if (!node) {
        // Completed
        SD.push({ textCenter: ['Journey Complete!', G.W/2, y+20, R.colors.green, R.fonts.md] });
        SD.push({ textCenter: ['Rewards have been claimed.', G.W/2, y+38, R.colors.textDim, R.fonts.sm] });
        y += 56;
      } else {
        // Prompt
        // Wrap prompt manually into two lines via textCenter
        SD.push({ textCenter: [node.prompt, G.W/2, y+12, R.colors.text, R.fonts.md] });
        // Simple wrap: if prompt > 36 chars, split
        if (node.prompt.length > 38) {
          y += 28;
        } else {
          y += 22;
        }
        for (let idx=0; idx<node.choices.length; idx++) {
          const ch = node.choices[idx];
          const btn = UI.Button(14, y, G.W-28, 38, '', R.colors.btnGold);
          btn._journeyId = selId;
          btn._choiceIdx = idx;
          btn.render = function(ctx) {
            const bx=this.x, by=this.y, bw=this.w, bh=this.h;
            R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.btnGold);
            R.textCenter(ctx, ch.text, bx+bw/2, by+24, R.colors.white, R.fonts.md);
          };
          btn.onClick = function() {
            const jId = this._journeyId;
            const cIdx = this._choiceIdx;
            if (JourneySystem.choose(jId, cIdx)) {
              Audio.click();
              R.validTick(this.x + this.w/2, this.y + this.h/2);
              journeyScene.buildUI();
            } else {
              R.stoneHit(this.x + this.w/2, this.y + this.h/2);
            }
          };
          this.data.buttons.push(btn);
          y += 44;
        }
        y += 8;
      }
      // Back to list
      const back = UI.Button(60, y, G.W-120, 30, 'Back to Journeys', R.colors.btn);
      back.onClick = function() {
        journeyScene.data.selectedId = null;
        journeyScene.buildUI();
      };
      this.data.buttons.push(back);
      y += 40;
    }

    // Global back
    const back2 = Scene.backButton(y+6, { label: 'Back to Ashram', target: 'ashram', fade: true });
    this.data.buttons.push(back2);
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
    Scene.drawHeader(ctx, 74, 'Journeys', 22);
    const sub = this.data.selectedId ? (JOURNEYS[this.data.selectedId] ? JOURNEYS[this.data.selectedId].name : '') : 'Your paths, your choices';
    R.textCenter(ctx, sub, G.W/2, 46, R.colors.textDim, R.fonts.sm);
    if (G.state.journeys && G.state.journeys.active) {
      const activeName = JOURNEYS[G.state.journeys.active] ? JOURNEYS[G.state.journeys.active].name : G.state.journeys.active;
      R.textCenter(ctx, 'Active: ' + activeName, G.W/2, 62, R.colors.green, R.fonts.sm);
    }
    const top = this.getContentTop();
    Scene.clipContent(ctx, this);
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY, this.getContentHeight())) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);
    ctx.restore();
    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY, 18);
    UI.Modal.render(ctx);
  }
});
