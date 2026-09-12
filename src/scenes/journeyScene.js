// Canvas text does not wrap by itself. Keep narrative copy inside its shell
// rather than allowing long prompts to paint over the next panel.
function journeyTextLines(ctx, text, maxWidth, font, maxLines) {
  const lines = [];
  const words = String(text || '').split(/\s+/).filter(Boolean);
  ctx.save();
  ctx.font = font;
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const next = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    if (lines.length >= maxLines) {
      line = '';
      break;
    }
    line = words[i];
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && lines.join(' ').split(/\s+/).length < words.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(last + '\u2026').width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = last.replace(/\s+\S*$/, '') + '\u2026';
  }
  ctx.restore();
  return lines.length ? lines : [''];
}

function journeyFitText(ctx, text, maxWidth, font) {
  return journeyTextLines(ctx, text, maxWidth, font, 1)[0];
}

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
        const statusColor = isCompleted ? R.colors.success : (prog.nodeId ? R.colors.accent : R.colors.textDim);
        const statusText = isCompleted ? 'Completed' : (prog.nodeId ? 'In Progress' : 'Available');
        
        // A single readable column gives the narrative room on narrow screens.
        const cardH = 96;
        const shell = UI.PremiumShell(14, y, G.W-28, cardH, { outerR: 8 });
        
        const btn = UI.Button(14, y, G.W-28, cardH, '', R.colors.surface);
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
          const accentColor = this._isCompleted ? R.colors.success : (this._journey.progress.nodeId ? R.colors.accent : R.colors.textDim);
          R.roundRect(ctx, content.x, content.y, content.w, R.radius.s, R.radius.s, accentColor);
          
          // Keep the status column clear of the title on compact devices.
          const statusW = 76;
          const titleW = Math.max(100, content.w - statusW - 16);
          R.text(ctx, this._journey.icon + '  ' + journeyFitText(ctx, this._journey.name, titleW, R.fonts.md), content.x + 12, content.y + 18, R.colors.accent, R.fonts.md);
          R.textRight(ctx, this._statusText, content.x + content.w - 10, content.y + 18, this._statusColor, R.fonts.sm);
          const descLines = journeyTextLines(ctx, this._journey.desc, content.w - 24, R.fonts.sm, 2);
          for (let li = 0; li < descLines.length; li++) {
            R.text(ctx, descLines[li], content.x + 12, content.y + 40 + li * 14, R.colors.textSecondary, R.fonts.sm);
          }
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
        y += cardH + 10;
      }
    } else {
      // Detail view for selected journey
      const node = JourneySystem.getCurrentNode(selId);
      // Header card with PremiumShell
      const headerShell = UI.PremiumShell(14, y, G.W-28, 96, { outerR: 8 });
      SD.push({
        render: function(ctx) {
          headerShell.render(ctx);
          const headerContent = headerShell.contentRect();
          R.text(ctx, sel.icon + '  ' + journeyFitText(ctx, sel.name, headerContent.w - 24, R.fonts.md), headerContent.x + 12, headerContent.y + 18, R.colors.accent, R.fonts.md);
          const descLines = journeyTextLines(ctx, sel.desc, headerContent.w - 24, R.fonts.sm, 2);
          for (let li = 0; li < descLines.length; li++) {
            R.text(ctx, descLines[li], headerContent.x + 12, headerContent.y + 42 + li * 14, R.colors.textSecondary, R.fonts.sm);
          }
        }
      });
      y += 100;
      
      if (!node) {
        // Completed
        const completeShell = UI.PremiumShell(14, y, G.W-28, 86, { outerR: 8 });
        SD.push({
          render: function(ctx) {
            completeShell.render(ctx);
            const cc = completeShell.contentRect();
            R.textCenter(ctx, 'Journey Complete!', cc.x + cc.w/2, cc.y + 20, R.colors.success, R.fonts.md);
            R.textCenter(ctx, 'Rewards have been claimed.', cc.x + cc.w/2, cc.y + 40, R.colors.textDim, R.fonts.sm);
          }
        });
        y += 90;
      } else {
        // Derive the frame height from the copy so the narrative never
        // collides with its border or the choices below it.
        const promptLines = journeyTextLines(G.ctx, node.prompt, G.W - 64, R.fonts.md, 3);
        const promptH = Math.max(92, 42 + promptLines.length * 16);
        const promptShell = UI.PremiumShell(14, y, G.W-28, promptH, { outerR: 8 });
        SD.push({
          render: function(ctx) {
            promptShell.render(ctx);
            const pc = promptShell.contentRect();
            const lines = journeyTextLines(ctx, node.prompt, pc.w - 12, R.fonts.md, 3);
            const startY = pc.y + Math.max(18, (pc.h - (lines.length - 1) * 16) / 2);
            for (let li = 0; li < lines.length; li++) {
              R.textCenter(ctx, lines[li], pc.x + pc.w / 2, startY + li * 16, R.colors.textPrimary, R.fonts.md);
            }
          }
        });
        y += promptH + 10;
        
        for (let idx=0; idx<node.choices.length; idx++) {
          const ch = node.choices[idx];
          const btn = UI.MagneticBtn(14, y, G.W-28, 48, journeyFitText(G.ctx, ch.text, G.W - 82, R.fonts.md), { trailingIcon: 'arrow-right' });
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
          y += 56;
        }
        y += 8;
      }
      // Back to list
      const back = UI.MagneticBtn(60, y, G.W-120, 48, 'Back to Journeys', { trailingIcon: 'arrow-left' });
      back.onClick = function() {
        journeyScene.data.selectedId = null;
        journeyScene.buildUI();
      };
      this.data.buttons.push(back);
      y += 52;
    }

    // Global back
    // Keep bottom navigation as a full-size magnetic target. The shared
    // Scene.backButton predates the 44px touch-target standard.
    const back2 = UI.MagneticBtn(60, y + 6, G.W - 120, 48, 'Back to Ashram', {
      trailingIcon: 'arrow-left',
      variant: 'ghost'
    });
    back2.onClick = function() { gScene('ashram', true, { restoreScroll: true }); };
    this.data.buttons.push(back2);
    y += 54;
    this.data.contentHeight = y - this.getContentTop();
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
    R.textCenter(ctx, sub, G.W/2, 46, R.colors.textSecondary, R.fonts.sm);
    if (G.state.journeys && G.state.journeys.active) {
      const activeName = JOURNEYS[G.state.journeys.active] ? JOURNEYS[G.state.journeys.active].name : G.state.journeys.active;
      R.textCenter(ctx, 'Active: ' + activeName, G.W/2, 62, R.colors.success, R.fonts.sm);
    }
    const top = this.getContentTop();
    Scene.clipContent(ctx, this);
    Scene.drawStatic(ctx, this.data.staticDraws);
    // Build-time card data is replayed only while a live Canvas context exists.
    for (const draw of this.data.staticDraws) {
      if (draw.render) draw.render(ctx);
    }
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY + top, this.getContentHeight())) b.render(ctx);
    ctx.restore();
    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY, 18);
    UI.Modal.render(ctx);
  }
});
