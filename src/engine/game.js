const Notify = {
  queue: [],
  achievements: [],
  show: function(msg, duration, color) {
    if (this.queue.length >= 3) this.queue.shift();
    this.queue.push({ msg: msg || '', timer: duration || 2, color: color || R.colors.gold, age: 0 });
  },
  achievement: function(name, desc, icon) {
    this.achievements.push({ name, desc, icon, timer: 3.5, phase: 'in' });
    Audio.levelUp();
  },
  // Fold a message into at most two md-font lines that fit the 320px toast
  // (296px inner), ellipsizing the tail when it still overflows.
  wrap: function(ctx, msg) {
    ctx.font = R.fonts.md;
    const max = 296;
    const words = String(msg).split(/\s+/);
    const lines = [];
    let cur = '';
    let used = 0;
    for (; used < words.length; used++) {
      const test = cur ? cur + ' ' + words[used] : words[used];
      if (ctx.measureText(test).width <= max || !cur) {
        cur = test;
        continue;
      }
      if (lines.length === 1) break;
      lines.push(cur);
      cur = words[used];
    }
    if (cur && lines.length < 2) lines.push(cur);
    if (used < words.length && lines.length === 2) {
      let l2 = lines[1];
      while (l2.length > 1 && ctx.measureText(l2 + '\u2026').width > max) l2 = l2.slice(0, -1);
      lines[1] = l2.replace(/\s+\S*$/, '') + '\u2026';
    }
    return lines.length ? lines : [''];
  },
  update: function(dt) {
    for (let i = this.queue.length - 1; i >= 0; i--) {
      this.queue[i].timer -= dt;
      this.queue[i].age += dt;
      if (this.queue[i].timer <= 0) this.queue.splice(i, 1);
    }
    for (let i = this.achievements.length - 1; i >= 0; i--) {
      const a = this.achievements[i];
      a.timer -= dt;
      if (a.phase === 'in') {
        a.progress = Math.min(1, (a.progress || 0) + dt * 3);
        if (a.progress >= 1) a.phase = 'hold';
      } else if (a.timer < 0.5) {
        a.phase = 'out';
        a.progress = Math.max(0, a.timer * 2);
      }
      if (a.timer <= 0) this.achievements.splice(i, 1);
    }
  },
  render: function(ctx) {
    const reduceMotion = !!G.state.reduceMotion;
    let ty = 470;
    const count = Math.min(this.queue.length, 3);
    for (let i = 0; i < count; i++) {
      const n = this.queue[i];
      // Enter: slide down 12px + fade over 150ms so toasts land, not pop.
      // Exit: fade over the final 180ms only — leaving should be subtler
      // than arriving (the old timer*2 window kept them half-visible for
      // 500ms, outliving their welcome).
      const enter = reduceMotion ? 1 : Math.min(1, n.age / 0.15);
      const alpha = Math.min(1, n.timer / 0.18) * enter;
      const lines = Notify.wrap(ctx, n.msg);
      const h = lines.length > 1 ? 40 : 26;
      const y = ty - (reduceMotion ? 0 : (1 - enter) * 12);
      ctx.globalAlpha = alpha;
      R.roundRect(ctx, 40, y, 320, h, 4, 'rgba(0,0,0,0.8)');
      if (lines.length > 1) {
        R.textCenter(ctx, lines[0], G.W / 2, y + 14, n.color, R.fonts.md);
        R.textCenter(ctx, lines[1], G.W / 2, y + 28, n.color, R.fonts.md);
      } else {
        R.textCenter(ctx, lines[0], G.W / 2, y + 17, n.color, R.fonts.md);
      }
      ctx.globalAlpha = 1;
      ty += h + 6;
    }
    // Show at most the 2 newest banners, stacked so simultaneous unlocks stay readable.
    const visible = this.achievements.slice(-2);
    for (let ai = 0; ai < visible.length; ai++) {
      const a = visible[ai];
      const alpha = a.phase === 'out' ? (a.progress || 0) : Math.min(1, (a.progress || 0) * 2);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      const y = 140 + ai * 68;
      R.roundRect(ctx, 50, y, 300, 60, 8, 'rgba(10,10,26,0.95)');
      R.roundRect(ctx, 50, y, 300, 60, 8, 'rgba(232,160,48,0.3)');
      ctx.strokeStyle = R.colors.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const r = 8, x = 50, w = 300, h = 60;
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.stroke();
      R.textCenter(ctx, '\u2605 ACHIEVEMENT UNLOCKED \u2605', G.W / 2, y + 18, R.colors.gold, R.fonts.sm);
      R.textCenter(ctx, a.icon + ' ' + a.name, G.W / 2, y + 36, R.colors.white, R.fonts.md);
      R.textCenter(ctx, a.desc, G.W / 2, y + 52, R.colors.textDim, R.fonts.sm);
      ctx.globalAlpha = 1;
    }
  },
  clear: function() { this.queue = []; this.achievements = []; }
};

const Fade = {
  alpha: 0,
  target: 0,
  speed: 4,
  pendingScene: null,
  update: function(dt) {
    if (this.alpha !== this.target) {
      const dir = this.target > this.alpha ? 1 : -1;
      this.alpha += dir * this.speed * dt;
      if ((dir > 0 && this.alpha >= this.target) || (dir < 0 && this.alpha <= this.target)) {
        this.alpha = this.target;
        if (this.pendingScene) {
          const name = this.pendingScene;
          this.pendingScene = null;
          Input.clear();
          if (G.currentScene && G.currentScene.leave) G.currentScene.leave();
          G.currentScene = G.scenes[name];
          G.state.scene = name;
          if (G.currentScene.enter) G.currentScene.enter();
          this.target = 0;
        }
      }
    }
  },
  render: function(ctx) {
    if (this.alpha > 0) {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, G.W, G.H);
      ctx.globalAlpha = 1;
    }
  },
  toScene: function(name) {
    if (!name || !G.scenes[name]) return;
    if (this.pendingScene) return;
    this.pendingScene = name;
    this.target = 1;
  }
};

const G = {
  W: 400, H: 720,
  SCROLL_SPEED: 0.8,
  CONTENT_TOP: 116,
  canvas: null, ctx: null,
  state: {
    scene: 'title',
    player: null,
    party: [],
    inventory: [],
    gold: 0,
    karma: 0,
    divineFragments: 0,
    prana: 0,
    cultivationBase: 0,
    realm: 'manushya',
    realmStage: 1,
    rebirthCount: 0,
    ashramLevel: 1,
    perks: {},
    auras: [],
    equippedAuras: [],
    spiritBeasts: [],
    activeBeast: null,
    farmPlots: [],
    fishCaught: 0,
    alchemyRecipes: [],
    zoneProgress: {},
    tournamentWins: 0,
    totalPlayTime: 0,
    flags: {}
  },
  frameCount: 0,
  dt: 0,
  lastTime: 0,
  currentScene: null,
  scenes: {},
  systems: {},
  ui: {}
};

function fitGame() {
  const el = document.getElementById('game-container');
  if (!el) return;
  // Clamp so a zero-sized viewport (hidden iframe) can never scale the game to nothing.
  const scale = Math.max(0.2, Math.min(window.innerWidth / 404, window.innerHeight / 724, 1));
  el.style.transform = 'scale(' + scale + ')';
  el.style.transformOrigin = 'center center';
  // Landscape phones get a squeezed viewport; nudge the player upright (once).
  if (typeof Hints !== 'undefined' && window.innerHeight < 500 && window.innerWidth > window.innerHeight) {
    Hints.show('rotate', 'Rotate your device upright for the best experience.');
  }
}

function gInit() {
  G.canvas = document.getElementById('game-canvas');
  // Back the canvas at device resolution so text/edges stay crisp on phones
  // (DPR 2-3), while ALL game code keeps using 400x720 logical coordinates.
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  G.canvas.width = G.W * dpr;
  G.canvas.height = G.H * dpr;
  G.ctx = G.canvas.getContext('2d');
  G.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  G.dpr = dpr;
  initSceneManager();
  initInput();
  initAudio();
  G.lastTime = performance.now();
  // Perf probe: only active when loaded with ?probe (harness --fps mode).
  G._probe = /[?&]probe/.test(location.search);
  G._fpsT = G.lastTime;
  G._fpsN = 0;
  gLoop(performance.now());
  // Boot beacon: lets the verification harness (and devtools) confirm the
  // loop actually started on this device/DPR.
  console.log('[Mythika] booted dpr=' + G.dpr);
}

function gLoop(time) {
  G.dt = Math.min((time - G.lastTime) / 1000, 0.05);
  G.lastTime = time;
  G.frameCount++;
  G.state.totalPlayTime += G.dt;
  Notify.update(G.dt);
  R.updateEffects(G.dt);
  R.updateProjectiles(G.dt);
  R.updateLevelUp(G.dt);
  if (G.state.enlightenmentTimer > 0) {
    G.state.enlightenmentTimer -= G.dt;
    if (G.state.enlightenmentTimer <= 0) {
      G.state.enlightenmentBuff = null;
      G.state.enlightenmentTimer = 0;
      G.state.xpBuff = null;
    }
  }
  Fade.update(G.dt);
  if (UI.Modal.active) UI.updateButtons(UI.Modal.active._buttonList, G.dt);
  if (G.currentScene && G.currentScene.update) G.currentScene.update(G.dt);
  G.ctx.clearRect(0, 0, G.W, G.H);
  G.ctx.save();
  G.ctx.translate(R.shakeX, R.shakeY);
  drawBackground();
  if (G.currentScene && G.currentScene.render) G.currentScene.render(G.ctx);
  G.ctx.restore();
  R.renderProjectiles(G.ctx);
  R.renderEffects(G.ctx);
  R.renderLevelUp(G.ctx);
  R.renderEnlightenmentAura(G.ctx, G.dt);
  if (G.state.enlightenmentTimer > 0) {
    const mins = Math.floor(G.state.enlightenmentTimer / 60);
    const secs = Math.floor(G.state.enlightenmentTimer % 60);
    const timeStr = 'ENLIGHTENED ' + mins + ':' + (secs < 10 ? '0' : '') + secs;
    R.roundRect(G.ctx, G.W - 140, 4, 136, 18, 4, 'rgba(232,160,48,0.85)');
    R.textCenter(G.ctx, timeStr, G.W - 72, 16, '#0a0a1a', R.fonts.sm);
  }
  Fade.render(G.ctx);
  Notify.render(G.ctx);
  // First frame is on screen: drop the CSS boot splash.
  if (G.frameCount === 1) {
    const el = document.getElementById('game-container');
    if (el) el.classList.remove('loading');
  }
  if (G._probe && time - G._fpsT >= 5000) {
    console.log('[Mythika] fps=' + Math.round((G.frameCount - G._fpsN) * 1000 / (time - G._fpsT)));
    G._fpsT = time;
    G._fpsN = G.frameCount;
  }
  requestAnimationFrame(gLoop);
}

function drawBackground() {
  const ctx = G.ctx;
  let bgColor = R.colors.bg;
  let bgColor2 = R.colors.bg2;
  if (G.state.scene === 'combatScene' && G.state.currentZone) {
    bgColor = R.zoneBgColor(G.state.currentZone);
    bgColor2 = bgColor;
  }
  const grad = ctx.createLinearGradient(0, 0, 0, G.H);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(0.5, bgColor2);
  grad.addColorStop(1, bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, G.W, G.H);
}

function gScene(name, fade) {
  if (!G.scenes[name]) return;
  Input.clear();
  if (fade && G.currentScene) {
    Fade.toScene(name);
  } else {
    if (G.currentScene && G.currentScene.leave) G.currentScene.leave();
    G.currentScene = G.scenes[name];
    G.state.scene = name;
    if (G.currentScene.enter) G.currentScene.enter();
  }
}

// Boot ownership lives in main.js bootGame(): it fires immediately on script
// parse and re-enters via this load safety-net (idempotent via G._booted).
window.addEventListener('resize', fitGame);
window.addEventListener('orientationchange', fitGame);
