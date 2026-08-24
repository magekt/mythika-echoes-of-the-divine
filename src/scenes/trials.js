const trialsScene = Scene.create({
  name: 'trials',
  data: {
    buttons: [],
    state: 'menu',
    wave: 0,
    best: 0,
    playerHP: 0,
    enemy: null,
    log: [],
    runGold: 0,
    runKarma: 0
  },

  enter: function() {
    this.data.best = G.state.trialBest || 0;
    // Endgame gate: the Trials open only after Svarga's boss has fallen.
    if (!(G.state.flags && G.state.flags.boss_svarga)) {
      this.data.state = 'locked';
    } else if (this.data.state !== 'fighting') {
      this.data.state = 'menu';
    }
    this.data.buttons = [];
    if (this.data.state === 'locked') this.buildLocked();
    else if (this.data.state === 'menu') this.buildMenu();
    else if (this.data.state === 'result') this.buildResult();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.log = [];
    this.data.enemy = null;
    this.data.duel = null;
    this.data.duelHero = null;
    this.data.scrollY = 0;
  },

  buildLocked: function() {
    this.data.buttons.push(Scene.backButton(G.H - 80, { fade: true }));
  },

  buildMenu: function() {
    this.data.buttons = [];
    const canStart = !!G.state.player;
    // 86px tall begin trial button with PremiumShell
    const beginShell = UI.PremiumShell(60, 120, G.W - 120, 44, { outerR: 8 });
    beginShell.render(ctx);
    this.data.staticDraws.push({ shell: beginShell });
    let y = 168; // after premium shell

    const btn = UI.BtnGold(60, y, G.W - 120, 38, 'Begin Trial \u2014 Wave 1');
    btn.enabled = canStart && !!G.state.flags && G.state.flags.boss_svarga;
    btn.onClick = function() { trialsScene.startRun(); };
    this.data.buttons.push(btn);
    this.data.buttons.push(Scene.backButton(G.H - 80, { fade: true }));
  },

  startRun: function() {
    const hero = G.state.player;
    if (!hero) return;
    this.data.state = 'fighting';
    this.data.wave = 0;
    this.data.log = ['The Trial begins. Steel your spirit.'];
    this.data.runGold = 0;
    this.data.runKarma = 0;
    // The duel engine owns HP/log once a foe exists; hero snapshot scales with the run.
    this.data.duelHero = { str: hero.str, mag: hero.mag, def: hero.def, maxHp: hero.maxHp };
    this.nextWave();
  },

  nextWave: function() {
    this.data.wave++;
    const zones = ['aryavarta', 'dandaka', 'meru', 'patala', 'svarga'];
    const zoneId = zones[Math.min(4, Math.floor((this.data.wave - 1) / 5))];
    const hero = G.state.player;
    const e = getZoneEnemy(zoneId, hero.level + this.data.wave * 2);
    // Wave scaling stacks on top of zone-tier scaling.
    const mult = 1 + (this.data.wave - 1) * 0.12;
    e.maxHp = Math.floor(e.maxHp * mult);
    e.hp = e.maxHp;
    e.str = Math.floor(e.str * mult);
    e.mag = Math.floor(e.mag * mult);
    e.def = Math.floor(e.def * (1 + (this.data.wave - 1) * 0.05));
    this.data.enemy = e;

    // Escalating mutators, announced the wave they first apply.
    const w = this.data.wave;
    if (w === 10) this.data.log.push('Mutator unlocked: foes REGENERATE each turn!');
    if (w === 15) this.data.log.push('Mutator unlocked: foes are ENRAGED (+20% damage)!');
    if (w === 20) this.data.log.push('Mutator unlocked: THORNS punish your strikes!');

    // Fresh duel state each wave; the snapshot hero keeps run-start stats.
    this.data.duel = Duel.create(this.data.duelHero, e);
    // Carry playerHP across waves so respite heals matter.
    this.data.duel.playerHP = this.data.playerHP;
    this.data.log.push('Wave ' + w + ': ' + e.name + ' emerges!');
    this.buildFightButtons();
  },

  buildFightButtons: function() {
    this.data.buttons = [];
    let y = 196;
    // Attack - primary action, BtnGold, 38px minimum touch target
    const atk = UI.BtnGold(30, y, G.W / 2 - 40, 38, 'Attack');
    atk.onClick = function() { trialsScene.doRound('attack'); };
    this.data.buttons.push(atk);
    // Special - secondary action
    const special = UI.Button(G.W / 2 + 10, y, G.W / 2 - 40, 38, 'Special');
    special.onClick = function() { trialsScene.doRound('special'); };
    this.data.buttons.push(special);
    y += 46;
    // Heal - secondary action
    const heal = UI.Button(30, y, G.W / 2 - 40, 38, 'Heal');
    heal.onClick = function() { trialsScene.doRound('heal'); };
    this.data.buttons.push(heal);
    // Defend - secondary action
    const def = UI.Button(G.W / 2 + 10, y, G.W / 2 - 40, 38, 'Defend');
    def.onClick = function() { trialsScene.doRound('defend'); };
    this.data.buttons.push(def);
    y += 50;
    // Retreat - secondary action, 38px tall
    const flee = UI.Button(60, y, G.W - 120, 38, 'Retreat (keep rewards)', R.colors.btn);
    flee.onClick = function() { trialsScene.endRun('You retreat from the Trial.'); };
    this.data.buttons.push(flee);
  },

  doRound: function(action) {
    const duel = this.data.duel;
    if (!duel) return;

    // Mutator options for the current wave.
    const w = this.data.wave;
    const result = Duel.round(duel, action, {
      healPct: 0.15,
      regen: w >= 10 ? 0.05 : 0,
      enrage: w >= 15 ? 0.2 : 0,
      thorns: w >= 20 ? 0.10 : 0
    });
    this.data.playerHP = Math.max(0, duel.playerHP);
    for (const msg of duel.log.splice(0)) this.data.log.push(msg);

    if (result === 'win') {
      this.waveCleared();
      return;
    }
    if (result === 'lose') {
      const cause = /Thorns/.test(this.data.log[this.data.log.length - 1] || '') ? 'Thorns claim you' : 'You fall';
      this.endRun(cause + ' at wave ' + w + '...');
      return;
    }
    this.buildFightButtons();
  },

  waveCleared: function() {
    const wave = this.data.wave;
    const gold = 25 + wave * 15;
    Economy.addGold(gold);
    this.data.runGold += gold;
    this.data.log.push('Wave ' + wave + ' cleared! +' + gold + 'g');
    if (wave % 3 === 0) {
      Economy.addKarma(1);
      this.data.runKarma++;
      this.data.log.push('+1 Punya Karma');
    }
    Progression.addPartyXP(10 + wave * 5);

    // Brief respite: recover 20% HP before the next wave.
    const hero = G.state.player;
    this.data.playerHP = Math.min(this.data.playerHP + Math.floor(hero.maxHp * 0.2), hero.maxHp);

    if (wave > (G.state.trialBest || 0)) G.state.trialBest = wave;
    AchievementSystem.check();

    // Milestone chest: a guaranteed equipment drop every 5 waves.
    if (wave % 5 === 0) {
      const hero2 = G.state.player;
      let drops = [];
      for (let tries = 0; tries < 10 && drops.length === 0; tries++) {
        drops = generateLoot(G.state.currentZone || 'aryavarta', hero2.level);
      }
      if (drops.length > 0) {
        if (!G.state.inventory) G.state.inventory = [];
        for (const it of drops) {
          G.state.inventory.push(it);
          this.data.log.push('Milestone chest: ' + it.name + ' (' + it.rarityName + ')');
        }
      } else {
        this.data.log.push('Milestone chest was empty...');
      }
    }

    this.nextWave();
  },

  endRun: function(message) {
    this.data.state = 'result';
    if (this.data.wave > (G.state.trialBest || 0)) G.state.trialBest = this.data.wave;
    this.data.best = G.state.trialBest || 0;
    this.data.log.push(message);
    AchievementSystem.check();
    SaveSystem.save();
    this.buildResult();
  },

  buildResult: function() {
    this.data.buttons = [];
    const btn = UI.BtnGold(60, G.H - 140, G.W - 120, 38, 'Back to Trials Menu');
    btn.onClick = function() {
      trialsScene.data.state = 'menu';
      trialsScene.enter();
    };
    this.data.buttons.push(btn);
    this.data.buttons.push(Scene.backButton(G.H - 90, { fade: true }));
  },

  update: function(dt) {},

  render: function(ctx) {
    Scene.drawHeader(ctx, 62, 'Endless Trials');
    const st = this.data.state;

    if (st === 'locked') {
      R.textCenter(ctx, '\u26A0 The Trials are sealed.', G.W / 2, 120, R.colors.red, R.fonts.md);
      R.textCenter(ctx, 'Defeat the boss of Svarga', G.W / 2, 150, R.colors.text, R.fonts.sm);
      R.textCenter(ctx, 'to prove yourself worthy.', G.W / 2, 166, R.colors.text, R.fonts.sm);
      R.textCenter(ctx, 'Best Wave: ' + this.data.best, G.W / 2, 200, R.colors.gold, R.fonts.sm);
    } else if (st === 'menu') {
      R.textCenter(ctx, 'Best Wave: ' + this.data.best, G.W / 2, 92, R.colors.gold, R.fonts.md);
      R.textCenter(ctx, 'Endless waves across all five realms.', G.W / 2, 180, R.colors.textDim, R.fonts.sm);
      R.textCenter(ctx, 'Rewards: Gold every wave, Karma every 3rd,', G.W / 2, 198, R.colors.textDim, R.fonts.sm);
      R.textCenter(ctx, 'XP always. Foes grow stronger each wave.', G.W / 2, 214, R.colors.textDim, R.fonts.sm);
    } else {
      // fighting / result share the arena layout
      const hero = G.state.player;
      R.drawHero(ctx, hero.id, 80, 82, 26);
      R.textCenter(ctx, hero.name, 80, 142, R.colors.text, R.fonts.sm);
      // Ghost trail (same pattern as combatScene): eases toward current HP.
      const php = Math.min(1, Math.max(0, this.data.playerHP / hero.maxHp));
      if (typeof this.data._ghostPHP !== 'number' || php > this.data._ghostPHP) this.data._ghostPHP = php;
      this.data._ghostPHP += (php - this.data._ghostPHP) * Math.min(1, G.dt * 6);
      R.roundRect(ctx, 40, 148, 80, 6, 3, 'rgba(200,48,48,0.2)');
      if (this.data._ghostPHP > 0) R.roundRect(ctx, 40, 148, 80 * this.data._ghostPHP, 6, 3, R.colors.white);
      R.roundRect(ctx, 40, 148, 80 * php, 6, 3, R.colors.hp);
      R.textCenter(ctx, Math.floor(this.data.playerHP) + '/' + hero.maxHp, 80, 162, R.colors.white, R.fonts.xs);

      const foe = this.data.enemy;
      if (foe) {
        R.drawEnemy(ctx, foe.id, 320, 82, 26);
        R.textCenter(ctx, foe.name, 320, 142, R.colors.red, R.fonts.sm);
        if (typeof foe._ghostHp !== 'number' || foe.hp > foe._ghostHp) foe._ghostHp = foe.hp;
        foe._ghostHp += (foe.hp - foe._ghostHp) * Math.min(1, G.dt * 6);
        R.roundRect(ctx, 280, 148, 80, 6, 3, 'rgba(200,48,48,0.2)');
        const fgw = 80 * Math.min(1, Math.max(0, foe._ghostHp / foe.maxHp));
        if (fgw > 0) R.roundRect(ctx, 280, 148, fgw, 6, 3, R.colors.white);
        R.roundRect(ctx, 280, 148, 80 * Math.min(1, Math.max(0, foe.hp / foe.maxHp)), 6, 3, R.colors.hp);
        R.textCenter(ctx, Math.floor(foe.hp) + '/' + foe.maxHp, 320, 162, R.colors.white, R.fonts.xs);
      }
      R.textCenter(ctx, 'Wave ' + this.data.wave + '   |   Best: ' + this.data.best +
        '   |   +' + this.data.runGold + 'g' + (this.data.runKarma ? ' +' + this.data.runKarma + 'K' : ''),
        G.W / 2, 182, R.colors.gold, R.fonts.xs);

      // Last few log lines above the bottom buttons (clear of the Retreat button)
      let ly = st === 'result' ? 300 : 312;
      for (const msg of this.data.log.slice(-4)) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        R.roundRect(ctx, 14, ly - 1, G.W - 28, 16, 3, ctx.fillStyle);
        R.textCenter(ctx, msg, G.W / 2, ly + 11, R.colors.text, R.fonts.sm);
        ly += 18;
      }
    }

    for (const b of this.data.buttons) b.render(ctx);
    UI.HUD().render(ctx);
  }
});
