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

  leave: function() {
    this._heroMoment = null;
    this._emptyState = null;
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.selectedId = null;
    this.data.scrollY = 0;
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
        // Use EmptyState illustration
        if (!this._emptyState) {
          this._emptyState = Scene.EmptyState({
            type: 'journey',
            title: 'No Journeys Yet',
            hint: 'Level up, bond a beast, or breakthrough to unlock your first journey.',
            ctaLabel: 'View Progress',
            ctaAction: () => { /* could open a progress modal */ }
          });
        }
        // We'll render the empty state in render() instead
        y += 200; // Reserve space for empty state illustration
      }
      for (const j of avail) {
        const prog = j.progress;
        const isCompleted = prog.completed;
        const isActive = j.id === selId;
        const statusColor = isCompleted ? R.colors.green : (prog.nodeId ? R.colors.gold : R.colors.textDim);
        const statusText = isCompleted ? 'Completed' : (prog.nodeId ? 'In Progress' : 'Available');
        
        // Use PremiumShell for journey cards (86px height per design system)
        const shell = UI.PremiumShell(14, y, G.W-28, 86, { outerR: 8 });
        
        const btn = UI.Button(14, y, G.W-28, 86, '', 'transparent');
        btn._journeyId = j.id;
        btn._shell = shell;
        btn._journey = j;
        btn._isCompleted = isCompleted;
        btn._statusColor = statusColor;
        btn._statusText = statusText;
        btn.enabled = !isCompleted;
        btn.render = function(ctx) {
          this._shell.render(ctx);
          const content = this._shell.contentRect();
          
          // Accent bar
          const accentColor = this._isCompleted ? R.colors.success : (this._journey.progress.nodeId ? R.colors.gold : R.colors.textDim);
          R.roundRect(ctx, content.x, content.y, content.w, R.radius.s, R.radius.s, accentColor);
          
          // Icon and name
          R.text(ctx, this._journey.icon + '  ' + this._journey.name, content.x + 12, content.y + 16, R.colors.gold, R.fonts.md);
          // Description
          R.text(ctx, this._journey.desc, content.x + 12, content.y + 32, R.colors.textDim, R.fonts.sm);
          // Status
          R.text(ctx, this._statusText, content.x + content.w - 8, content.y + 16, this._statusColor, R.fonts.sm, 'right');
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
        y += 94;
      }
    } else {
      // Detail view for selected journey
      const node = JourneySystem.getCurrentNode(selId);
      // Header card with PremiumShell
      const headerShell = UI.PremiumShell(14, y, G.W-28, 86, { outerR: 8 });
      headerShell.render(ctx);
      const headerContent = headerShell.contentRect();
      R.text(ctx, sel.icon + '  ' + sel.name, headerContent.x + 12, headerContent.y + 16, R.colors.gold, R.fonts.md);
      R.text(ctx, sel.desc, headerContent.x + 12, headerContent.y + 36, R.colors.textDim, R.fonts.sm);
      y += 90;
      
      if (!node) {
        // Completed
        const completeShell = UI.PremiumShell(14, y, G.W-28, 86, { outerR: 8 });
        completeShell.render(ctx);
        const cc = completeShell.contentRect();
        R.textCenter(ctx, 'Journey Complete!', cc.x + cc.w/2, cc.y + 20, R.colors.green, R.fonts.md);
        R.textCenter(ctx, 'Rewards have been claimed.', cc.x + cc.w/2, cc.y + 40, R.colors.textDim, R.fonts.sm);
        y += 90;
      } else {
        // Prompt with PremiumShell
        const promptShell = UI.PremiumShell(14, y, G.W-28, 86, { outerR: 8 });
        promptShell.render(ctx);
        const pc = promptShell.contentRect();
        R.textCenter(ctx, node.prompt, pc.x + pc.w/2, pc.y + 20, R.colors.text, R.fonts.md);
        y += 70;
        
        for (let idx=0; idx<node.choices.length; idx++) {
          const ch = node.choices[idx];
          const btn = UI.MagneticBtn(14, y, G.W-28, 44, ch.text, { trailingIcon: 'arrow-right' });
          btn._journeyId = selId;
          btn._choiceIdx = idx;
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
          y += 50;
        }
        y += 8;
      }
      // Back to list
      const back = UI.MagneticBtn(60, y, G.W-120, 44, 'Back to Journeys', { trailingIcon: 'arrow-left' });
      back.onClick = function() {
        journeyScene.data.selectedId = null;
        journeyScene.buildUI();
      };
      this.data.buttons.push(back);
      y += 48;
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
