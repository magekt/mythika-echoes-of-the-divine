const fishingScene = Scene.create({
  name: 'fishing',
  data: {
    buttons: [],
    state: 'idle',
    fishTimer: 0,
    catchWindow: 0,
    fishPos: 0,
    barWidth: 200,
    fishCaught: 0,
    streak: 0,
    fishSpeed: 1,
    fishPhase: 0,
    isRareFish: false,
    rareColor: '#e8a030'
  },

  enter: function() {
    Audio.playMusic('fishing');
    this.data.state = 'idle';
    this.data.fishCaught = G.state.fishCaught || 0;
    this.data.streak = 0;
    this.buildButtons();
  },

  buildButtons: function() {
    this.data.buttons = [];
    const cast = UI.BtnGold(G.W / 2 - 100, 260, 200, 34, 'Cast Line');
    cast.onClick = function() {
      fishingScene.startFishing();
    };
    this.data.buttons.push(cast);

    const back = UI.Button(G.W / 2 - 100, 300, 200, 30, 'Back to Ashram');
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
  },

  startFishing: function() {
    this.data.state = 'waiting';
    this.data.fishTimer = 2 + Math.random() * 4;
    this.data.fishPos = 0;
    this.data.fishSpeed = 0.5 + Math.random() * 2;
    this.data.fishPhase = Math.random() * Math.PI * 2;
    this.data.isRareFish = Math.random() < 0.12;
    this.data.rareColor = this.data.isRareFish ? '#e8c880' : R.colors.red;
    this.data.buttons = [];
  },

  update: function(dt) {
    if (this.data.state === 'waiting') {
      this.data.fishTimer -= dt;
      this.data.fishPhase += dt * 2;
      this.data.fishPos += Math.sin(this.data.fishPhase) * 0.8;
      if (this.data.fishTimer <= 0) {
        this.data.state = 'catching';
        this.data.catchWindow = this.data.isRareFish ? 1.8 : 2.5;
        this.data.fishSpeed = this.data.isRareFish ? 3 + Math.random() * 2 : 1 + Math.random() * 1.5;
        this.data.fishPos = 10 + Math.random() * (this.data.barWidth - 30);
        this.buildCatchButtons();
      }
    } else if (this.data.state === 'catching') {
      this.data.catchWindow -= dt;
      this.data.fishPhase += dt * this.data.fishSpeed;
      this.data.fishPos += Math.sin(this.data.fishPhase) * (this.data.isRareFish ? 5 : 2.5);
      this.data.fishPos += (Math.random() - 0.5) * (this.data.isRareFish ? 4 : 1.5);
      this.data.fishPos = Math.max(5, Math.min(this.data.barWidth - 25, this.data.fishPos));
      if (this.data.catchWindow <= 0) {
        this.data.state = 'idle';
        this.data.streak = 0;
        Notify.show('Fish got away! Streak lost.', 2, R.colors.red);
        this.buildButtons();
      }
    }

    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons);
  },

  buildCatchButtons: function() {
    this.data.buttons = [];
    const reel = UI.BtnGold(G.W / 2 - 100, 380, 200, 34, 'REEL IN!');
    reel.onClick = function() {
      fishingScene.checkCatch();
    };
    this.data.buttons.push(reel);
  },

  checkCatch: function() {
    const targetX = this.data.barWidth / 2 - 10;
    const diff = Math.abs(this.data.fishPos - targetX);

    if (this.data.isRareFish) {
      if (diff < 25) {
        const bonus = 20 + Math.floor(Math.random() * 30);
        this.data.streak++;
        const streakBonus = Math.floor(this.data.streak * 2);
        G.state.fishCaught = (G.state.fishCaught || 0) + 1;
        Economy.addGold(bonus + streakBonus);
        Progression.addPartyXP(30);
        AchievementSystem.check();
        Notify.show('RARE CATCH! +' + (bonus + streakBonus) + ' Gold!', 3, R.colors.goldLight);
        Audio.levelUp();
      } else {
        this.data.streak = 0;
        Notify.show('Rare fish escaped!', 2, R.colors.red);
        Audio.error();
      }
    } else {
      if (diff < 20) {
        this.data.streak++;
        const streakBonus = Math.floor(this.data.streak * 2);
        G.state.fishCaught = (G.state.fishCaught || 0) + 1;
        Economy.addGold(5 + Math.floor(Math.random() * 10) + streakBonus);
        Progression.addPartyXP(8 + this.data.streak * 2);
        AchievementSystem.check();
        Notify.show('Caught a fish! +' + (5 + streakBonus + Math.floor(Math.random() * 10)) + ' Gold', 2);
        Audio.click();
      } else if (diff < 50) {
        Economy.addGold(3);
        Progression.addPartyXP(3);
        Notify.show('Almost got it! +3 Gold', 1.5);
        Audio.click();
      } else {
        this.data.streak = 0;
        Notify.show('Missed!', 1.5);
      }
    }
    this.data.state = 'idle';
    this.buildButtons();
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 72, 'Fishing', 24);
    R.textCenter(ctx, 'Fish Caught: ' + (G.state.fishCaught || 0) + '  |  Gold: ' + (G.state.gold || 0) + 'g', G.W / 2, 50, R.colors.text, R.fonts.sm);

    ctx.fillStyle = '#1a2a3a';
    R.roundRect(ctx, 60, 100, 280, 130, 8, ctx.fillStyle);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    R.roundRect(ctx, 60, 100, 280, 130, 8, 'transparent');
    ctx.strokeRect(60.5, 100.5, 279, 129);
    R.textCenter(ctx, '\u2248 Water \u2248', G.W / 2, 165, 'rgba(48,128,200,0.4)', R.fonts.sm);

    if (this.data.state === 'waiting') {
      R.drawFishingBobber(ctx, G.W / 2, 240, G.state.totalPlayTime * 2, false);
      R.textCenter(ctx, 'Waiting for a bite...', G.W / 2, 275, R.colors.textDim, R.fonts.sm);
    } else if (this.data.state === 'catching') {
      const timeLeft = this.data.catchWindow;
      if (this.data.isRareFish) {
        ctx.fillStyle = 'rgba(232,200,128,0.1)';
        R.roundRect(ctx, 50, 280, 300, 20, 4, ctx.fillStyle);
        R.textCenter(ctx, '\u2605 RARE FISH! \u2605', G.W / 2, 294, R.colors.goldLight, R.fonts.md);
      } else {
        R.textCenter(ctx, 'Time: ' + timeLeft.toFixed(1) + 's', G.W / 2, 288, R.colors.gold, R.fonts.sm);
      }
      const barX = G.W / 2 - this.data.barWidth / 2;
      R.roundRect(ctx, barX, 308, this.data.barWidth, 18, 4, '#2a1510');
      ctx.fillStyle = 'rgba(232,160,48,0.2)';
      R.roundRect(ctx, barX + this.data.barWidth / 2 - 12, 306, 24, 22, 4, ctx.fillStyle);
      ctx.strokeStyle = R.colors.gold;
      ctx.lineWidth = 1;
      R.roundRect(ctx, barX + this.data.barWidth / 2 - 12, 306, 24, 22, 4, 'transparent');
      ctx.strokeRect(barX + this.data.barWidth / 2 - 11.5, 306.5, 23, 21);
      R.roundRect(ctx, barX + this.data.fishPos, 310, 14, 14, 3, this.data.rareColor);
      R.textCenter(ctx, 'Position fish in the gold zone!', G.W / 2, 345, R.colors.textDim, R.fonts.sm);
    }

    if (this.data.streak > 1) {
      R.textCenter(ctx, 'Streak: ' + this.data.streak + 'x!', G.W / 2, 430, R.colors.goldLight, R.fonts.sm);
    }

    for (const b of this.data.buttons) b.render(ctx);
  }
});
