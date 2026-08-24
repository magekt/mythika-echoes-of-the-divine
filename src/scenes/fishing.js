const BAIT_TIERS = [
  { id: 0, name: 'No Bait', cost: 0, fishReq: 0, rareBonus: 0, windowBonus: 0, desc: 'Basic' },
  { id: 1, name: 'Basic Bait', cost: 40, fishReq: 5, rareBonus: 0.06, windowBonus: 0.3, desc: '+6% rare, +0.3s' },
  { id: 2, name: 'Quality Bait', cost: 120, fishReq: 20, rareBonus: 0.12, windowBonus: 0.6, desc: '+12% rare, +0.6s' },
  { id: 3, name: 'Divine Bait', cost: 300, fishReq: 50, rareBonus: 0.20, windowBonus: 1.0, desc: '+20% rare, +1.0s' }
];

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
    this.data.streak = G.state.fishingStreak || 0;
    if (G.state.unlockedBaitTier == null) G.state.unlockedBaitTier = 0;
    if (G.state.selectedBaitTier == null) G.state.selectedBaitTier = 0;
    this.buildButtons();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    Audio.stopMusic();
  },

  buildButtons: function() {
    this.data.buttons = [];
    // Bait tier selector: personalizes rare chance + window
    let by = 200;
    for (let t = 0; t < BAIT_TIERS.length; t++) {
      const tier = BAIT_TIERS[t];
      const isUnlocked = (G.state.unlockedBaitTier || 0) >= t;
      const isSelected = (G.state.selectedBaitTier || 0) === t;
      const bx = 18 + t * 92;
      const btn = UI.Button(bx, by, 86, 30, '', isSelected ? R.colors.btnGold : (isUnlocked ? R.colors.btn : R.colors.panel));
      btn._tier = t;
      btn.render = function(ctx) {
        const bx=this.x, by=this.y, bw=this.w, bh=this.h;
        R.roundRect(ctx, bx, by, bw, bh, 6, this.color);
        if (isSelected) {
          ctx.strokeStyle = R.colors.gold;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx+0.5, by+0.5, bw-1, bh-1);
        }
        R.textCenter(ctx, tier.name.split(' ')[0], bx+bw/2, by+13, isSelected ? R.colors.white : (isUnlocked ? R.colors.text : R.colors.textDim), R.fonts.sm);
        const costStr = isUnlocked ? (isSelected ? 'Selected' : tier.desc) : tier.cost + 'g/' + tier.fishReq + ' fish';
        R.textCenter(ctx, costStr, bx+bw/2, by+24, isUnlocked ? R.colors.textDim : R.colors.red, R.fonts.xs);
      };
      btn.onClick = function() {
        const tierId = this._tier;
        const tierData = BAIT_TIERS[tierId];
        const unlocked = (G.state.unlockedBaitTier || 0) >= tierId;
        if (!unlocked) {
          if ((G.state.fishCaught || 0) < tierData.fishReq) { Notify.show('Need ' + tierData.fishReq + ' fish caught', 2, R.colors.red); return false; }
          if (!Economy.spendGoldOrNotify(tierData.cost)) return false;
          G.state.unlockedBaitTier = tierId;
          G.state.selectedBaitTier = tierId;
          Notify.show('Unlocked ' + tierData.name + '!', 2, R.colors.gold);
          fishingScene.buildButtons();
          return true;
        }
        G.state.selectedBaitTier = tierId;
        Notify.show('Selected ' + tierData.name, 1.5, R.colors.green);
        fishingScene.buildButtons();
      };
      this.data.buttons.push(btn);
    }
    by += 38;
    const cast = UI.BtnGold(G.W / 2 - 100, by, 200, 34, 'Cast Line');
    cast.onClick = function() {
      fishingScene.startFishing();
    };
    this.data.buttons.push(cast);
    by += 40;
    const back = UI.Button(G.W / 2 - 100, by, 200, 30, 'Back to Ashram');
    back.onClick = function() { gScene('ashram'); };
    this.data.buttons.push(back);
  },

  startFishing: function() {
    this.data.state = 'waiting';
    this.data.fishTimer = 2 + Math.random() * 4;
    this.data.fishPos = 0;
    this.data.fishSpeed = 0.5 + Math.random() * 2;
    this.data.fishPhase = Math.random() * Math.PI * 2;
    const bait = BAIT_TIERS[G.state.selectedBaitTier || 0] || BAIT_TIERS[0];
    const streakBonus = (this.data.streak >= 5 ? 0.05 : 0) + (this.data.streak >= 10 ? 0.05 : 0);
    this.data.isRareFish = Math.random() < (0.12 + bait.rareBonus + streakBonus);
    this.data.rareColor = this.data.isRareFish ? '#e8c880' : R.colors.red;
    // Better bait slightly slows the fish via calmer water bonus applied later
    this.data._baitWindowBonus = bait.windowBonus;
    this.data.buttons = [];
  },

  update: function(dt) {
    if (this.data.state === 'waiting') {
      this.data.fishTimer -= dt;
      this.data.fishPhase += dt * 2;
      this.data.fishPos += Math.sin(this.data.fishPhase) * 0.8;
      if (this.data.fishTimer <= 0) {
        this.data.state = 'catching';
        const baseWindow = this.data.isRareFish ? 1.8 : 2.5;
        this.data.catchWindow = baseWindow + (this.data._baitWindowBonus || 0);
        const baitSlow = 1 - ((this.data._baitWindowBonus || 0) * 0.12);
        this.data.fishSpeed = this.data.isRareFish ? (3 + Math.random() * 2) * baitSlow : (1 + Math.random() * 1.5) * baitSlow;
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
    const bait = BAIT_TIERS[G.state.selectedBaitTier || 0] || BAIT_TIERS[0];

    if (this.data.isRareFish) {
      if (diff < 25) {
        const bonus = 20 + Math.floor(Math.random() * 30);
        this.data.streak++;
        G.state.fishingStreak = this.data.streak;
        G.state.fishingBestStreak = Math.max(G.state.fishingBestStreak || 0, this.data.streak);
        const streakBonus = Math.floor(this.data.streak * 2);
        const baitBonus = Math.floor(bait.windowBonus * 5);
        G.state.fishCaught = (G.state.fishCaught || 0) + 1;
        Economy.addGold(bonus + streakBonus + baitBonus);
        Progression.addPartyXP(30 + baitBonus);
        AchievementSystem.check();
        Notify.show('RARE CATCH! +' + (bonus + streakBonus + baitBonus) + ' Gold!', 3, R.colors.goldLight);
        Audio.levelUp();
      } else {
        this.data.streak = 0;
        G.state.fishingStreak = 0;
        Notify.show('Rare fish escaped!', 2, R.colors.red);
        Audio.error();
      }
    } else {
      if (diff < 20) {
        this.data.streak++;
        G.state.fishingStreak = this.data.streak;
        G.state.fishingBestStreak = Math.max(G.state.fishingBestStreak || 0, this.data.streak);
        const streakBonus = Math.floor(this.data.streak * 2);
        const baitBonus = Math.floor(bait.windowBonus * 3);
        G.state.fishCaught = (G.state.fishCaught || 0) + 1;
        Economy.addGold(5 + Math.floor(Math.random() * 10) + streakBonus + baitBonus);
        Progression.addPartyXP(8 + this.data.streak * 2 + baitBonus);
        AchievementSystem.check();
        Notify.show('Caught a fish! +' + (5 + streakBonus + baitBonus + Math.floor(Math.random() * 10)) + ' Gold', 2);
        Audio.click();
      } else if (diff < 50) {
        Economy.addGold(3);
        Progression.addPartyXP(3);
        Notify.show('Almost got it! +3 Gold', 1.5);
        Audio.click();
      } else {
        this.data.streak = 0;
        G.state.fishingStreak = 0;
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
