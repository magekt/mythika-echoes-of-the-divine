// encounterScene — narrative encounter choice UI on Canvas.
// Shows prompt text, choice cards with consequence previews, result panel, and origin resume.
// Backing out before choosing leaves no markers/ledger writes (safe exit).

function encounterTextLines(ctx, text, maxWidth, font, maxLines) {
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

function encounterFitText(ctx, text, maxWidth, font) {
  return encounterTextLines(ctx, text, maxWidth, font, 1)[0];
}

const encounterScene = Scene.create({
  name: 'encounterScene',
  data: {
    buttons: [],
    scrollY: 0,
    contentHeight: 0,
    staticDraws: [],
    encounterId: null,
    bondEventId: null,
    origin: null,
    pendingZone: null,
    resolved: false,
    result: null
  },

  getContentTop: function() { return G.CONTENT_TOP; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  enter: function(opts) {
    opts = opts || {};
    this.data.encounterId = opts.encounterId || null;
    this.data.bondEventId = opts.bondEventId || null;
    this.data.origin = opts.origin || 'zoneExploration';
    this.data.pendingZone = opts.pendingZone || null;
    this.data.resolved = false;
    this.data.result = null;
    this.data.scrollY = 0;
    this.data.buttons = [];
    this.data.staticDraws = [];

    // Bond-scene path: resolve from BOND_EVENTS, render through shared builders.
    if (this.data.bondEventId) {
      const bondEntry = (typeof BOND_EVENTS !== 'undefined' && BOND_EVENTS) ? BOND_EVENTS[this.data.bondEventId] : null;
      if (!bondEntry) {
        Notify.show('The vision fades...', 2, R.colors.red);
        this._resume();
        return;
      }
      this.buildUI(bondEntry);
      return;
    }

    // Start the encounter — returns null if unknown or already seen
    const enc = EncounterSystem.start(this.data.encounterId);
    if (!enc) {
      Notify.show('The vision fades...', 2, R.colors.red);
      this._resume();
      return;
    }

    // If this is a travel origin, verify the pending zone is still accessible
    if (this.data.origin === 'travelMap' && this.data.pendingZone) {
      if (typeof ZoneAccess !== 'undefined' && !ZoneAccess.status(this.data.pendingZone).allowed) {
        Notify.show('The path ahead has closed.', 2, R.colors.warning);
        gScene('travelMap', true);
        return;
      }
    }

    this.buildUI(enc);
  },

  buildUI: function(enc) {
    const SD = [];
    this.data.staticDraws = SD;
    this.data.buttons = [];
    let y = this.getContentTop() + 12;

    // --- Header card with icon + name ---
    const headerShell = UI.PremiumShell(14, y, G.W - 28, 88, { outerR: 8 });
    SD.push({
      render: function(ctx) {
        headerShell.render(ctx);
        const c = headerShell.contentRect();
        R.text(ctx, enc.icon + '  ' + encounterFitText(ctx, enc.name, c.w - 24, R.fonts.md), c.x + 12, c.y + 18, R.colors.accent, R.fonts.md);
        const poolLabel = enc.bondEvent ? 'Bond Scene' : (enc.pool === 'travel' ? 'Storm-Path Encounter' : 'Forest Encounter');
        R.text(ctx, poolLabel, c.x + 12, c.y + 42, R.colors.textSecondary, R.fonts.sm);
      }
    });
    y += 92;

    // --- Prompt block ---
    const promptLines = encounterTextLines(G.ctx, enc.prompt, G.W - 64, R.fonts.sm, 6);
    const promptH = 44 + promptLines.length * 14;
    const promptShell = UI.PremiumShell(14, y, G.W - 28, promptH, { outerR: 8, innerBg: R.colors.surfaceElevated });
    SD.push({
      render: function(ctx) {
        promptShell.render(ctx);
        const c = promptShell.contentRect();
        for (let i = 0; i < promptLines.length; i++) {
          R.text(ctx, promptLines[i], c.x + 12, c.y + 22 + i * 14, R.colors.text, R.fonts.sm);
        }
      }
    });
    y += promptH + 12;

    // --- Choice cards (filtered by system-level flagsReq; bond entries render directly) ---
    const isBond = !!this.data.bondEventId;
    const choices = isBond ? (enc.choices || []) : EncounterSystem.getChoices(this.data.encounterId);
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const cardH = 68;
      const btn = UI.Button(14, y, G.W - 28, cardH, '', R.colors.surface, R.colors.surfaceElevated, R.colors.white);
      btn._choiceIdx = i; // index into FULL choices array (before filtering)
      btn._choice = choice;
      btn._encId = this.data.encounterId;
      btn._bondId = isBond ? this.data.bondEventId : null;
      btn._isBond = isBond;
      btn.render = function(ctx) {
        const shell = UI.PremiumShell(this.x, this.y, this.w, this.h, { outerR: 6 });
        shell.render(ctx);
        const c = shell.contentRect();
        // Choice text
        R.text(ctx, this._choice.text, c.x + 10, c.y + 18, R.colors.text, R.fonts.sm);
        // Preview / consequence
        if (this._choice.preview) {
          R.text(ctx, this._choice.preview, c.x + 10, c.y + 38, R.colors.textSecondary, R.fonts.sm);
        }
        // Accent bar on left edge
        R.roundRect(ctx, this.x + 2, this.y + 4, 3, this.h - 8, 2, R.colors.accent);
      };
      btn.onClick = function() {
        if (this._isBond && typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.completeBond === 'function') {
          const done = BondSystem.completeBond(this._bondId, this._choiceIdx);
          if (done && done.ok) {
            Audio.click();
            R.validTick(this.x + this.w / 2, this.y + this.h / 2);
            const granted = [];
            if (done.applied > 0) {
              let heroId = null;
              try {
                const entry = (typeof BOND_EVENTS !== 'undefined' && BOND_EVENTS) ? BOND_EVENTS[this._bondId] : null;
                heroId = entry ? entry.heroId : null;
              } catch (e) {}
              if (heroId) granted.push({ type: 'affinity', hero: heroId, amount: done.applied, tierUp: !!done.tierUp });
            }
            if (done.capped && typeof Notify !== 'undefined') {
              try { Notify.show('This memory is complete — no further bond to gain.', 3, R.colors.textSecondary); } catch (e) {}
            }
            if (done.tierUp) {
              try {
                const entry = (typeof BOND_EVENTS !== 'undefined' && BOND_EVENTS) ? BOND_EVENTS[this._bondId] : null;
                const heroId = entry ? entry.heroId : null;
                if (heroId && typeof BondSystem.bondAvailable === 'function') {
                  const next = BondSystem.bondAvailable(heroId);
                  if (next && typeof Notify !== 'undefined') {
                    let heroName = heroId;
                    try {
                      if (typeof HEROES !== 'undefined' && HEROES && HEROES[heroId] && HEROES[heroId].name) heroName = HEROES[heroId].name;
                    } catch (e) {}
                    Notify.show('A new bond scene awaits ' + heroName + '!', 3, R.colors.gold);
                  }
                }
              } catch (e) {}
            }
            const result = { id: this._bondId, choiceIdx: this._choiceIdx, text: this._choice ? this._choice.text : '', granted: granted, marker: this._choiceIdx, bond: true, capped: !!done.capped };
            encounterScene.data.resolved = true;
            encounterScene.data.result = result;
            encounterScene.buildResult(result);
          } else {
            R.stoneHit(this.x + this.w / 2, this.y + this.h / 2);
          }
          return;
        }
        const result = EncounterSystem.choose(this._encId, this._choiceIdx);
        if (result) {
          Audio.click();
          R.validTick(this.x + this.w / 2, this.y + this.h / 2);
          encounterScene.data.resolved = true;
          encounterScene.data.result = result;
          encounterScene.buildResult(result);
        } else {
          R.stoneHit(this.x + this.w / 2, this.y + this.h / 2);
        }
      };
      this.data.buttons.push(btn);
      y += cardH + 10;
    }

    // --- Leave button (safe exit — no side effects) ---
    const leaveBtn = UI.MagneticBtn(60, y + 6, G.W - 120, 44, 'Leave', { trailingIcon: 'arrow-left', variant: 'ghost' });
    leaveBtn.onClick = function() {
      encounterScene._resume();
    };
    this.data.buttons.push(leaveBtn);
    y += 50;

    this.data.contentHeight = y - this.getContentTop();
  },

  buildResult: function(result) {
    // Replace buttons and staticDraws with result panel
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.scrollY = 0;
    let y = this.getContentTop() + 12;

    // --- Result header ---
    const headerShell = UI.PremiumShell(14, y, G.W - 28, 88, { outerR: 8 });
    this.data.staticDraws.push({
      render: function(ctx) {
        headerShell.render(ctx);
        const c = headerShell.contentRect();
        R.text(ctx, 'Resolution', c.x + 12, c.y + 18, R.colors.success, R.fonts.md);
        R.text(ctx, result.text, c.x + 12, c.y + 42, R.colors.textSecondary, R.fonts.sm);
      }
    });
    y += 92;

    // --- Granted rewards list ---
    if (result.granted && result.granted.length > 0) {
      const itemH = 28;
      const rewardH = 32 + result.granted.length * itemH;
      const rewardShell = UI.PremiumShell(14, y, G.W - 28, rewardH, { outerR: 8, innerBg: R.colors.surfaceElevated });
      this.data.staticDraws.push({
        render: function(ctx) {
          rewardShell.render(ctx);
          const c = rewardShell.contentRect();
          R.text(ctx, 'Rewards:', c.x + 12, c.y + 18, R.colors.gold, R.fonts.sm);
          for (let i = 0; i < result.granted.length; i++) {
            const g = result.granted[i];
            let label = '';
            if (g.type === 'gold') label = (g.amount >= 0 ? '+' : '') + g.amount + ' Gold';
            else if (g.type === 'karma' || g.type === 'karmaBonus') label = (g.amount >= 0 ? '+' : '') + g.amount + ' Karma';
            else if (g.type === 'xp') label = '+' + g.amount + ' XP';
            else if (g.type === 'prana') label = '+' + g.amount + ' Prana';
            else if (g.type === 'divineFragments') label = '+' + g.amount + ' Divine Fragments';
            else if (g.type === 'item') label = g.name + ' x' + g.qty;
            else if (g.type === 'hp') label = '+' + g.amount + ' HP';
            else if (g.type === 'str') label = '+' + g.amount + ' STR';
            else if (g.type === 'agi') label = '+' + g.amount + ' AGI';
            else if (g.type === 'mag') label = '+' + g.amount + ' MAG';
            else if (g.type === 'def') label = '+' + g.amount + ' DEF';
            else if (g.type === 'affinity') {
              let heroName = g.hero;
              let tier = '';
              try {
                if (typeof HEROES !== 'undefined' && HEROES && HEROES[g.hero] && HEROES[g.hero].name) {
                  heroName = HEROES[g.hero].name;
                }
                if (typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.get === 'function') {
                  const info = BondSystem.get(g.hero);
                  if (info && info.tier) tier = info.tier;
                }
              } catch (e) {}
              label = heroName + ' +' + g.amount + ' bond' + (tier ? ' (' + tier + ')' : '');
            }
            else label = g.type + ': ' + JSON.stringify(g.amount);
            R.text(ctx, label, c.x + 12, c.y + 36 + i * itemH, R.colors.text, R.fonts.sm);
          }
        }
      });
      y += rewardH + 12;
    }

    // --- Tier-up unlock toast for encounter-choice gains (bond path toasts at click time) ---
    if (!result.bond && result.granted) {
      try {
        for (const g of result.granted) {
          if (g && g.type === 'affinity' && g.tierUp && typeof BondSystem !== 'undefined' && BondSystem && typeof BondSystem.bondAvailable === 'function') {
            const next = BondSystem.bondAvailable(g.hero);
            if (next && (next.indexOf('_crisis') !== -1 || next.indexOf('_oath') !== -1) && typeof Notify !== 'undefined') {
              let heroName = g.hero;
              try {
                if (typeof HEROES !== 'undefined' && HEROES && HEROES[g.hero] && HEROES[g.hero].name) heroName = HEROES[g.hero].name;
              } catch (e) {}
              Notify.show('A new bond scene awaits ' + heroName + '!', 3, R.colors.gold);
            }
          }
        }
      } catch (e) {}
    }

    // --- Continue button (returns to origin) ---
    const contBtn = UI.MagneticBtn(60, y + 6, G.W - 120, 48, 'Continue', { trailingIcon: 'arrow-right' });
    contBtn.onClick = function() {
      encounterScene._resume();
    };
    this.data.buttons.push(contBtn);
    y += 56;

    this.data.contentHeight = y - this.getContentTop();
  },

  _resume: function() {
    const origin = this.data.origin;
    if (origin === 'travelMap') {
      if (this.data.pendingZone) {
        if (typeof ZoneAccess !== 'undefined' && ZoneAccess.enter(this.data.pendingZone).allowed) {
          G.state.currentZone = this.data.pendingZone;
          gScene('zoneExploration', true);
        } else {
          gScene('travelMap', true);
        }
      } else {
        gScene('travelMap', true);
      }
    } else {
      // zoneExploration or default — resume exploration
      gScene('zoneExploration', true);
    }
  },

  leave: function() {
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.result = null;
    this.data.encounterId = null;
    this.data.bondEventId = null;
    this.data.resolved = false;
    this.data.scrollY = 0;
    this.data.contentHeight = 0;
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, G.CONTENT_TOP, 'Encounter', 22);
    const top = this.getContentTop();
    Scene.clipContent(ctx, this);
    // Draw static panels (prompt, result, etc.)
    for (const draw of this.data.staticDraws) {
      if (draw.render) draw.render(ctx);
    }
    // Draw choice/result buttons
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY + top, this.getContentHeight())) b.render(ctx);
    ctx.restore();
    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY, 18);
  }
});
