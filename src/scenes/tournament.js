const tournamentScene = Scene.create({
  name: 'tournament',
  data: {
    buttons: [],
    state: 'menu',
    staticDraws: [],
    opponent: null,
    log: [],
    playerHP: 0,
    enemyHP: 0,
    round: 0,
    wins: 0,
    scrollY: 0,
    contentHeight: 0
  },

  enter: function() {
    this.data.state = 'menu';
    this.data.log = [];
    this.data.opponent = null;
    this.data.round = 0;
    this.data.wins = G.state.tournamentWins || 0;
    this.data.scrollY = 0;
    this.buildMenu();
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

  buildMenu: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();
    const cost = 50 + (this.data.wins * 25);

    const canEnter = (G.state.gold || 0) >= cost;
    const btn = UI.Button(30, y, G.W - 60, 36, 'Enter Tournament (' + cost + 'g)', canEnter ? R.colors.btnGold : R.colors.btn);
    btn.enabled = canEnter;
    btn.onClick = function() {
      if (Economy.spendGold(cost)) {
        tournamentScene.startMatch();
      } else {
        tournamentScene.data.log = ['Not enough gold!'];
      }
    };
    this.data.buttons.push(btn);
    y += 44;

    SD.push({ text: ['Wins: ' + this.data.wins, 20, y + 4, R.colors.gold, R.fonts.sm] });
    SD.push({ text: ['Entry Fee: ' + cost + 'g', 20, y + 20, R.colors.textDim, R.fonts.sm] });
    y += 36;

    const back = UI.Button(60, y + 4, G.W - 120, 30, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true); };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  startMatch: function() {
    this.data.state = 'fighting';
    this.data.log = [];
    this.data.round++;
    const names = ['Veer', 'Agni', 'Vayu', 'Indra', 'Kali', 'Yama', 'Surya'];
    const name = names[Math.floor(Math.random() * names.length)];
    const lvl = 5 + this.data.wins * 3 + Math.floor(Math.random() * 5);
    this.data.opponent = {
      name: 'Champion ' + name,
      hp: 50 + lvl * 5, maxHp: 50 + lvl * 5,
      str: 5 + lvl, def: 3 + Math.floor(lvl * 0.5)
    };
    const hero = G.state.player;
    this.data.playerHP = hero.maxHp;
    this.data.enemyHP = this.data.opponent.maxHp;
    this.buildFightButtons();
  },

  buildFightButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    const atk = UI.BtnGold(30, y, G.W / 2 - 40, 30, 'Attack');
    atk.onClick = function() { tournamentScene.doRound('attack'); };
    this.data.buttons.push(atk);

    const special = UI.Button(G.W / 2 + 10, y, G.W / 2 - 40, 30, 'Special');
    special.onClick = function() { tournamentScene.doRound('special'); };
    this.data.buttons.push(special);
    y += 36;

    const heal = UI.Button(30, y, G.W / 2 - 40, 30, 'Heal');
    heal.onClick = function() { tournamentScene.doRound('heal'); };
    this.data.buttons.push(heal);

    const def = UI.Button(G.W / 2 + 10, y, G.W / 2 - 40, 30, 'Defend');
    def.onClick = function() { tournamentScene.doRound('defend'); };
    this.data.buttons.push(def);
    y += 44;

    if (this.data.log.length > 0) {
      for (const msg of this.data.log.slice(-5)) {
        SD.push({ text: [msg, 22, y + 2, R.colors.text, R.fonts.sm] });
        y += 16;
      }
      y += 10;
    }

    const back = UI.Button(60, y + 4, G.W - 120, 30, 'Forfeit', R.colors.btn);
    back.onClick = function() {
      tournamentScene.data.state = 'menu';
      tournamentScene.data.log = ['You fled the tournament...'];
      tournamentScene.data.scrollY = 0;
      tournamentScene.buildMenu();
    };
    this.data.buttons.push(back);
    y += 44;

    this.data.contentHeight = y;
  },

  buildResultButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    for (const msg of this.data.log.slice(-5)) {
      SD.push({ text: [msg, 22, y + 2, R.colors.text, R.fonts.sm] });
      y += 16;
    }
    y += 10;

    const btn = UI.BtnGold(60, y + 4, G.W - 120, 34, 'Back to Menu');
    btn.onClick = function() {
      tournamentScene.data.state = 'menu';
      tournamentScene.data.scrollY = 0;
      tournamentScene.buildMenu();
    };
    this.data.buttons.push(btn);
    y += 46;

    this.data.contentHeight = y;
  },

  doRound: function(action) {
    const hero = G.state.player;
    let pDmg = 0, eDmg = 0;
    let pDef = 0;

    if (action === 'attack') {
      pDmg = Math.max(1, hero.str + Math.floor(Math.random() * 10) - Math.floor(this.data.opponent.def * 0.5));
    } else if (action === 'special') {
      pDmg = Math.max(1, Math.floor((hero.str + hero.mag) * 1.2) + Math.floor(Math.random() * 15) - Math.floor(this.data.opponent.def * 0.3));
    } else if (action === 'heal') {
      const healAmt = Math.floor(hero.maxHp * 0.2);
      this.data.playerHP = Math.min(this.data.playerHP + healAmt, hero.maxHp);
      this.data.log.push('You healed for ' + healAmt + ' HP');
    } else if (action === 'defend') {
      pDef = Math.floor(hero.def * 1.5);
      this.data.log.push('You brace for impact');
    }

    this.data.enemyHP -= pDmg;
    if (this.data.enemyHP < 0) this.data.enemyHP = 0;
    if (pDmg > 0) this.data.log.push('You deal ' + pDmg + ' damage!');

    const eAtk = Math.max(1, this.data.opponent.str + Math.floor(Math.random() * 8) - Math.floor((hero.def + pDef) * 0.4));
    this.data.playerHP -= eAtk;
    if (this.data.playerHP < 0) this.data.playerHP = 0;
    this.data.log.push(this.data.opponent.name + ' deals ' + eAtk + ' damage');

    if (this.data.enemyHP <= 0) {
      this.data.log.push('Victory!');
      G.state.tournamentWins = (G.state.tournamentWins || 0) + 1;
      const reward = 100 + this.data.wins * 50;
      Economy.addGold(reward);
      Economy.addKarma(1);
      this.data.log.push('Reward: ' + reward + 'g, +1 Karma');
      this.data.state = 'result';
      this.buildResultButtons();
    } else if (this.data.playerHP <= 0) {
      this.data.log.push('You have been defeated...');
      this.data.state = 'result';
      this.buildResultButtons();
    } else {
      this.data.scrollY = 0;
      this.buildFightButtons();
    }
  },

  update: function(dt) {
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    R.roundRect(ctx, 10, 6, G.W - 20, 62, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 61);
    R.textCenter(ctx, 'Tournament', G.W / 2, 22, R.colors.gold, R.fonts.lg);
    R.textCenter(ctx, this.data.state === 'fighting' || this.data.state === 'result' ? 'Round ' + this.data.round : 'Test your might!', G.W / 2, 46, R.colors.text, R.fonts.sm);

    if (this.data.state === 'fighting' || this.data.state === 'result') {
      R.drawHero(ctx, G.state.player ? G.state.player.id : 'arjuna', 80, 82, 26);
      R.textCenter(ctx, G.state.player ? G.state.player.name : 'You', 80, 142, R.colors.text, R.fonts.sm);
      R.roundRect(ctx, 40, 148, 80, 6, 3, 'rgba(200,48,48,0.2)');
      const pHPct = G.state.player ? this.data.playerHP / G.state.player.maxHp : 1;
      R.roundRect(ctx, 40, 148, 80 * Math.max(0, pHPct), 6, 3, R.colors.hp);
      R.textCenter(ctx, Math.floor(this.data.playerHP) + '/' + (G.state.player ? G.state.player.maxHp : 100), 80, 162, R.colors.white, R.fonts.xs);

      R.drawEnemy(ctx, 'rakshasa', 320, 82, 26);
      R.textCenter(ctx, this.data.opponent ? this.data.opponent.name : '?', 320, 142, R.colors.red, R.fonts.sm);
      R.roundRect(ctx, 280, 148, 80, 6, 3, 'rgba(200,48,48,0.2)');
      const eHPct = this.data.opponent ? this.data.enemyHP / this.data.opponent.maxHp : 1;
      R.roundRect(ctx, 280, 148, 80 * Math.max(0, eHPct), 6, 3, R.colors.hp);
      R.textCenter(ctx, Math.floor(this.data.enemyHP) + '/' + (this.data.opponent ? this.data.opponent.maxHp : 100), 320, 162, R.colors.white, R.fonts.xs);
    } else {
      R.textCenter(ctx, 'Wins: ' + (G.state.tournamentWins || 0), G.W / 2, 88, R.colors.gold, R.fonts.sm);
      R.textCenter(ctx, 'Conquer all challengers!', G.W / 2, 106, R.colors.textDim, R.fonts.sm);
    }

    const top = this.getContentTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, this.getContentHeight());
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    for (const b of this.data.buttons) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);
  }
});
