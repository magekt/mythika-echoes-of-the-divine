const R = {
  colors: {
    bg: '#0a0a1a', bg2: '#15152a', panel: '#1a1a30', panelLight: '#2a2a45',
    orange: '#e8a030', orangeLight: '#f0c060', orangeDark: '#b07020',
    blue: '#3080c8', blueLight: '#60a0e0', blueDark: '#1a4060',
    gold: '#e8a030', goldLight: '#f0c060', goldDark: '#b07020',
    red: '#c83030', green: '#30c830', white: '#e8e0d0',
    hp: '#c83030', mp: '#3080c8', exp: '#30c830',
    text: '#e8e0d0', textDim: '#8a8aa0', textDark: '#5a5a70',
    btn: '#1a2040', btnHover: '#252555', btnGold: '#e8a030', btnRed: '#a03030',
    highlight: '#e8a030',
    indian: { saffron: '#e8a030', crimson: '#c83030', gold: '#e8a030',
              peacock: '#2080a0', lotus: '#e8a0a0', sandal: '#d0b080' }
  },
  fonts: {
    xs: '8px monospace', sm: '10px monospace', md: '12px monospace', lg: '16px monospace', xl: '24px monospace'
  }
};

R.rect = function(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
};

R.roundRect = function(ctx, x, y, w, h, r, color) {
  if (w <= 0 || h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
};

R.text = function(ctx, str, x, y, color, font, align) {
  ctx.fillStyle = color || R.colors.text;
  ctx.font = font || R.fonts.md;
  ctx.textAlign = align || 'left';
  ctx.fillText(str, Math.floor(x), Math.floor(y));
  // Normalize post-state so direct fillText calls always start left-aligned.
  ctx.textAlign = 'left';
};

R.textCenter = function(ctx, str, x, y, color, font) {
  R.text(ctx, str, x, y, color, font, 'center');
};

R.pixelChar = function(ctx, ch, x, y, color, size) {
  const s = size || 4;
  const chars = {
    'A': [0xe0,0xa0,0xa0,0xe0,0x80,0x80], 'B': [0xc0,0xa0,0xc0,0xa0,0xa0,0xc0],
    'C': [0xe0,0x80,0x80,0x80,0x80,0xe0], 'D': [0xc0,0xa0,0xa0,0xa0,0xa0,0xc0],
    'E': [0xe0,0x80,0xe0,0x80,0x80,0xe0], 'F': [0xe0,0x80,0xe0,0x80,0x80,0x80],
    'G': [0xe0,0x80,0x80,0xa0,0xa0,0xe0], 'H': [0xa0,0xa0,0xe0,0xa0,0xa0,0xa0],
    'I': [0xe0,0x40,0x40,0x40,0x40,0xe0], 'J': [0x20,0x20,0x20,0x20,0xa0,0xe0],
    'K': [0xa0,0xa0,0xc0,0xe0,0xa0,0xa0], 'L': [0x80,0x80,0x80,0x80,0x80,0xe0],
    'M': [0x80,0xc0,0xe0,0xa0,0x80,0x80], 'N': [0x80,0xc0,0xe0,0xa0,0xa0,0x80],
    'O': [0xe0,0xa0,0xa0,0xa0,0xa0,0xe0], 'P': [0xe0,0xa0,0xe0,0x80,0x80,0x80],
    'Q': [0xe0,0xa0,0xa0,0xa0,0xc0,0x60], 'R': [0xe0,0xa0,0xe0,0xc0,0xa0,0xa0],
    'S': [0xe0,0x80,0xe0,0x20,0x20,0xe0], 'T': [0xe0,0x40,0x40,0x40,0x40,0x40],
    'U': [0xa0,0xa0,0xa0,0xa0,0xa0,0xe0], 'V': [0x80,0x80,0x80,0x80,0x80,0xe0],
    'W': [0x80,0x80,0xa0,0xe0,0xc0,0x80], 'X': [0xa0,0xa0,0x40,0x40,0xa0,0xa0],
    'Y': [0x80,0x80,0x40,0x40,0x20,0x20], 'Z': [0xe0,0x20,0x40,0x80,0x80,0xe0],
    '0': [0xe0,0xa0,0xe0,0xa0,0xa0,0xe0], '1': [0x40,0xc0,0x40,0x40,0x40,0xe0],
    '2': [0xe0,0x20,0x60,0xc0,0x80,0xe0], '3': [0xe0,0x20,0x60,0x20,0xa0,0xe0],
    '4': [0xa0,0xa0,0xe0,0x20,0x20,0x20], '5': [0xe0,0x80,0xe0,0x20,0x20,0xe0],
    '6': [0xe0,0x80,0xe0,0xa0,0xa0,0xe0], '7': [0xe0,0x20,0x40,0x80,0x80,0x80],
    '8': [0xe0,0xa0,0xe0,0xa0,0xa0,0xe0], '9': [0xe0,0xa0,0xe0,0x20,0xa0,0xe0],
    '.': [0x00,0x00,0x00,0x00,0x00,0x40], ':': [0x00,0x40,0x00,0x00,0x40,0x00],
    '!': [0x40,0x40,0x40,0x40,0x00,0x40], '?': [0xe0,0x20,0x40,0x40,0x00,0x40],
    ' ': [0x00,0x00,0x00,0x00,0x00,0x00], '-': [0x00,0x00,0xe0,0x00,0x00,0x00],
    '+': [0x00,0x40,0xe0,0x40,0x00,0x00], '/': [0x20,0x20,0x40,0x80,0x80,0x00],
    '*': [0x00,0xa0,0x40,0xa0,0x00,0x00], '=': [0x00,0xe0,0x00,0xe0,0x00,0x00],
    '\'': [0x40,0x40,0x00,0x00,0x00,0x00], ',': [0x00,0x00,0x00,0x00,0x40,0x80],
    '>': [0x80,0x40,0x20,0x40,0x80,0x00], '<': [0x20,0x40,0x80,0x40,0x20,0x00]
  };
  const c = ch.toUpperCase();
  if (!chars[c]) return;
  ctx.fillStyle = color || R.colors.text;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      if (chars[c][row] & (0x80 >> (col * 2 + 0)) || chars[c][row] & (0x40 >> (col * 2))) {
        ctx.fillRect(x + col * s, y + row * s, s, s);
      }
    }
  }
};

R.pixelText = function(ctx, str, x, y, color, size) {
  const s = size || 4;
  const spacing = s * 4;
  for (let i = 0; i < str.length; i++) {
    R.pixelChar(ctx, str[i], x + i * spacing, y, color, s);
  }
};

R.drawEnemy = function(ctx, name, x, y, size) {
  const s = size || 32;
  ctx.fillStyle = R.colors.textDim;
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';

  const bodies = {
    rakshasa: { color: '#c83030', eyes: '#e8c880', horns: true },
    wolf: { color: '#8a8070', eyes: '#30c830', horns: false },
    bandit: { color: '#5a3a28', eyes: '#e8e0d0', horns: false },
    spider: { color: '#5a3060', eyes: '#30c830', horns: false },
    wraith: { color: '#306080', eyes: '#30c8c8', horns: false },
    asura: { color: '#c86030', eyes: '#e8c880', horns: true },
    dragon: { color: '#30c830', eyes: '#e8c880', horns: true },
    default: { color: '#8a8070', eyes: '#e8c880', horns: false }
  };
  const b = bodies[name] || bodies.default;
  const cx = x, cy = y + s/2;
  const hs = s/2;

  ctx.fillStyle = b.color;
  ctx.fillRect(cx - hs, cy - hs, s, s);

  if (b.eyes) {
    ctx.fillStyle = b.eyes;
    ctx.fillRect(cx - 6, cy - 4, 4, 4);
    ctx.fillRect(cx + 2, cy - 4, 4, 4);
  }
  if (b.horns) {
    ctx.fillStyle = R.colors.textDark;
    ctx.fillRect(cx - 8, cy - hs - 4, 4, 8);
    ctx.fillRect(cx + 4, cy - hs - 4, 4, 8);
  }
  ctx.fillStyle = R.colors.textDim;
  ctx.fillRect(cx - 2, cy + 4, 4, 6);
  ctx.fillRect(cx - 6, cy + 4, 3, 4);
  ctx.fillRect(cx + 3, cy + 4, 3, 4);

  ctx.fillStyle = R.colors.text;
  ctx.font = R.fonts.sm;
  ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), cx, cy + hs + 12);
};

R.drawHero = function(ctx, name, x, y, size) {
  const s = size || 32;
  const cx = x, cy = y + s/2;
  const hs = s/2;
  const colors = {
    arjuna: '#c8a050', bhima: '#c83030', karna: '#e8a030',
    hanuman: '#e8c880', draupadi: '#c8a0a0'
  };
  const c = colors[name] || R.colors.textDim;

  ctx.fillStyle = c;
  ctx.fillRect(cx - hs, cy - hs, s, s);

  ctx.fillStyle = R.colors.text;
  ctx.fillRect(cx - 3, cy - 4, 6, 4);
  ctx.fillStyle = R.colors.textDim;
  ctx.fillRect(cx - 2, cy + 4, 4, 8);
  ctx.fillRect(cx - 6, cy + 4, 3, 5);
  ctx.fillRect(cx + 3, cy + 4, 3, 5);

  ctx.fillStyle = R.colors.text;
  ctx.font = R.fonts.sm;
  ctx.textAlign = 'center';
  ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), cx, cy + hs + 12);
};

R.damageNumbers = [];
R.shakeX = 0;
R.shakeY = 0;
R.shakeTimer = 0;

R.damageNumber = function(ctx, x, y, value, color) {
  R.damageNumbers.push({
    x: x, y: y, value: value,
    color: color || R.colors.red,
    vy: -40, life: 1, maxLife: 1
  });
};

R.screenShake = function(intensity, duration) {
  R.shakeX = 0;
  R.shakeY = 0;
  R.shakeTimer = duration || 0.3;
  R.shakeIntensity = intensity || 4;
};

R.updateEffects = function(dt) {
  for (let i = R.damageNumbers.length - 1; i >= 0; i--) {
    const d = R.damageNumbers[i];
    d.y += d.vy * dt;
    d.life -= dt;
    if (d.life <= 0) R.damageNumbers.splice(i, 1);
  }
  if (R.shakeTimer > 0) {
    R.shakeTimer -= dt;
    R.shakeX = (Math.random() - 0.5) * R.shakeIntensity * 2 * (R.shakeTimer / 0.3);
    R.shakeY = (Math.random() - 0.5) * R.shakeIntensity * 2 * (R.shakeTimer / 0.3);
    if (R.shakeTimer <= 0) { R.shakeX = 0; R.shakeY = 0; }
  }
  if (R.comboFlash > 0) R.comboFlash -= dt;
};

R.renderEffects = function(ctx) {
  for (const d of R.damageNumbers) {
    const alpha = Math.max(0, d.life / d.maxLife);
    ctx.globalAlpha = alpha;
    R.textCenter(ctx, d.value.toString(), d.x + R.shakeX, d.y + R.shakeY, d.color, R.fonts.lg);
  }
  ctx.globalAlpha = 1;
  
  if (R.comboFlash > 0) {
    const alpha = R.comboFlash * 0.4;
    ctx.fillStyle = R.comboFlashColor;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.globalAlpha = 1;
  }
};

R.zoneBgColor = function(zoneId) {
  if (ZONES[zoneId]) return ZONES[zoneId].bgColor;
  return '#1a0a00';
};

R.drawEncounterTimer = function(ctx, x, y, remaining, total) {
  const pct = total > 0 ? Math.max(0, remaining / total) : 0;
  const w = 120, h = 16;
  R.roundRect(ctx, x - w / 2, y, w, h, 3, '#2a1510');
  const fillW = Math.floor(w * (1 - pct));
  if (fillW > 0) {
    R.roundRect(ctx, x - w / 2, y, fillW, h, 3, R.colors.gold);
  }
  const sandH = Math.floor(h * pct);
  if (sandH > 0) {
    R.roundRect(ctx, x - w / 2 + 2, y + h - sandH, fillW - 4, sandH - 1, 1, '#c8a050');
  }
  const top = R.pixelChar;
  R.textCenter(ctx, Math.ceil(remaining) + 's', x, y + h + 14, R.colors.textDim, R.fonts.sm);
};

R.drawCultivationAura = function(ctx, x, y, time) {
  const radius = 20 + Math.sin(time * 2) * 5;
  ctx.strokeStyle = 'rgba(200, 160, 80, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  const innerR = 8 + Math.sin(time * 3) * 3;
  ctx.strokeStyle = 'rgba(200, 160, 80, 0.5)';
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.stroke();

  R.pixelChar(ctx, 'O', x - 8, y - 12, R.colors.gold, 2);
  R.pixelChar(ctx, 'M', x + 12, y - 12, R.colors.gold, 2);
};

R.projectiles = [];

R.fireProjectile = function(fromX, fromY, toX, toY, color, speed, type) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const dist = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
  R.projectiles.push({
    x: fromX, y: fromY,
    startX: fromX, startY: fromY,
    targetX: toX, targetY: toY,
    angle: angle, dist: dist,
    traveled: 0,
    speed: speed || 300,
    color: color || R.colors.gold,
    type: type || 'arrow',
    life: 1
  });
};

R.updateProjectiles = function(dt) {
  for (let i = R.projectiles.length - 1; i >= 0; i--) {
    const p = R.projectiles[i];
    const step = p.speed * dt;
    p.traveled += step;
    const t = Math.min(1, p.traveled / p.dist);
    p.x = p.startX + (p.targetX - p.startX) * t;
    p.y = p.startY + (p.targetY - p.startY) * t - Math.sin(t * Math.PI) * 20;
    p.life -= dt * 0.5;
    if (t >= 1 || p.life <= 0) {
      R.projectiles.splice(i, 1);
    }
  }
};

R.renderProjectiles = function(ctx) {
  for (const p of R.projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    if (p.type === 'arrow') {
      ctx.fillRect(-6, -1, 12, 2);
      ctx.fillRect(4, -3, 4, 6);
    } else if (p.type === 'spear') {
      ctx.fillRect(-8, -1, 16, 2);
      ctx.fillRect(6, -3, 2, 6);
    } else if (p.type === 'mace') {
      ctx.fillRect(-3, -3, 8, 6);
      ctx.fillRect(2, -5, 4, 10);
    } else {
      ctx.fillRect(-3, -3, 6, 6);
    }
    ctx.restore();
  }
};

R.levelUpFlash = 0;
R.levelUpParticles = [];
R.enlightenmentAura = 0;
R.comboFlash = 0;
R.comboFlashColor = '#e8a030';

R.triggerLevelUp = function() {
  R.levelUpFlash = 0.5;
  for (let i = 0; i < 20; i++) {
    R.levelUpParticles.push({
      x: G.W / 2 + (Math.random() - 0.5) * 200,
      y: G.H / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 100,
      vy: -50 - Math.random() * 100,
      life: 1,
      size: 2 + Math.random() * 4,
      color: Math.random() < 0.5 ? R.colors.gold : R.colors.goldLight
    });
  }
};

R.triggerComboFlash = function(level) {
  R.comboFlash = 0.3;
  if (level >= 5) R.comboFlashColor = '#c83030';
  else if (level >= 3) R.comboFlashColor = '#e8a030';
  else R.comboFlashColor = '#30c830';
  Audio.comboMilestone(level);
};

R.updateLevelUp = function(dt) {
  if (R.levelUpFlash > 0) R.levelUpFlash -= dt;
  for (let i = R.levelUpParticles.length - 1; i >= 0; i--) {
    const p = R.levelUpParticles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 100 * dt;
    p.life -= dt;
    if (p.life <= 0) R.levelUpParticles.splice(i, 1);
  }
};

R.renderLevelUp = function(ctx) {
  if (R.levelUpFlash > 0) {
    const alpha = Math.min(1, R.levelUpFlash * 4);
    ctx.fillStyle = 'rgba(200, 160, 80, ' + (alpha * 0.3) + ')';
    ctx.fillRect(0, 0, G.W, G.H);
  }
  for (const p of R.levelUpParticles) {
    const alpha = Math.max(0, p.life);
    ctx.globalAlpha = alpha;
    R.rect(ctx, p.x, p.y, p.size, p.size, p.color);
  }
  ctx.globalAlpha = 1;
};

R.renderEnlightenmentAura = function(ctx, dt) {
  if (G.state.enlightenmentTimer > 0 && G.state.enlightenmentBuff) {
    R.enlightenmentAura += dt * 2;
    const pulse = 0.3 + Math.sin(R.enlightenmentAura) * 0.15;
    const buff = G.state.enlightenmentBuff;
    const color = buff >= 1.0 ? 'rgba(200, 180, 80,' : 'rgba(180, 100, 60,';
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < 3; i++) {
      const radius = 180 + i * 40 + Math.sin(R.enlightenmentAura + i) * 20;
      const alpha = pulse * (0.1 - i * 0.03);
      ctx.fillStyle = color + alpha + ')';
      ctx.beginPath();
      ctx.arc(G.W / 2, G.H / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
};

R.drawZoneBackground = function(ctx, zoneId) {
  if (!zoneId) return;
  const zone = ZONES[zoneId];
  if (!zone) return;

  const bg = zone.bgColor || '#1a0a00';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, G.W, G.H);

  ctx.fillStyle = R.colors.bg;
  if (zoneId === 'aryavarta') {
    ctx.fillStyle = '#0a1a20';
    for (let i = 0; i < 5; i++) {
      const tx = 30 + i * 80 + Math.sin(i * 2.3) * 15;
      const th = 40 + Math.sin(i * 1.7) * 15;
      ctx.fillRect(tx, 300 - th, 10, th);
      ctx.fillRect(tx - 12, 300 - th + 10, 14, 6);
    }
    ctx.fillStyle = '#0a2a30';
    ctx.fillRect(0, 300, G.W, 20);
  } else if (zoneId === 'dandaka') {
    ctx.fillStyle = '#0a0a1a';
    for (let i = 0; i < 6; i++) {
      const tx = 20 + i * 70 + Math.sin(i * 1.3) * 10;
      const th = 50 + Math.sin(i * 2.1) * 10;
      ctx.fillRect(tx, 310 - th, 8, th);
      ctx.fillStyle = '#15152a';
      ctx.fillRect(tx - 4, 310 - th + 15, 14, 5);
      ctx.fillStyle = '#0a0a1a';
    }
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 310, G.W, 15);
  } else if (zoneId === 'meru') {
    ctx.fillStyle = '#1a1a3a';
    for (let i = 0; i < 3; i++) {
      const mx = 80 + i * 130;
      ctx.beginPath();
      ctx.moveTo(mx - 40, 320);
      ctx.lineTo(mx, 250 - i * 10);
      ctx.lineTo(mx + 40, 320);
      ctx.fill();
    }
    ctx.fillStyle = '#25254a';
    for (let i = 0; i < 2; i++) {
      const mx = 130 + i * 130;
      ctx.beginPath();
      ctx.moveTo(mx - 25, 320);
      ctx.lineTo(mx, 270 - i * 5);
      ctx.lineTo(mx + 25, 320);
      ctx.fill();
    }
    ctx.fillStyle = '#1a1a30';
    ctx.fillRect(0, 315, G.W, 15);
  } else if (zoneId === 'patala') {
    ctx.fillStyle = '#1a0a10';
    for (let i = 0; i < 8; i++) {
      const sx = 20 + i * 50 + Math.sin(i * 1.1) * 8;
      const sy = 280 + Math.sin(i * 0.7) * 20;
      ctx.fillStyle = '#2a1020';
      ctx.fillRect(sx, sy, 6, 40);
      ctx.fillStyle = R.colors.orange;
      ctx.fillRect(sx + 1, sy - 4, 4, 6);
    }
    ctx.fillStyle = '#1a0510';
    ctx.fillRect(0, 320, G.W, 10);
  } else if (zoneId === 'svarga') {
    ctx.fillStyle = '#0a0a2a';
    for (let i = 0; i < 6; i++) {
      const cx = 40 + i * 70;
      const cy = 260 + Math.sin(i * 1.5) * 15;
      ctx.fillStyle = R.colors.orangeLight;
      ctx.fillRect(cx, cy, 8, 8);
      ctx.fillRect(cx + 2, cy - 6, 4, 6);
      ctx.fillStyle = R.colors.orange;
      ctx.fillRect(cx + 8, cy + 2, 6, 4);
      ctx.fillRect(cx - 6, cy + 2, 6, 4);
    }
    ctx.fillStyle = '#101040';
    ctx.fillRect(0, 0, G.W, 20);
    ctx.fillStyle = R.colors.orangeLight;
    for (let i = 0; i < 8; i++) {
      const sx = 20 + i * 50;
      R.rect(ctx, sx, 5 + Math.sin(i * 0.8) * 2, 3, 3, R.colors.orangeLight);
    }
  }
};

R.drawFishingBobber = function(ctx, x, y, phase, isRare) {
  const bobX = x + Math.sin(phase) * 15;
  const bobY = y + Math.cos(phase * 0.7) * 3;

  ctx.strokeStyle = '#5a5040';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 50);
  ctx.lineTo(bobX, bobY);
  ctx.stroke();

  const rippleR = 10 + Math.sin(phase * 2) * 3;
  ctx.strokeStyle = isRare ? 'rgba(232, 200, 128, 0.4)' : 'rgba(48, 128, 200, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(bobX, bobY, rippleR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = isRare ? '#e8c880' : '#c83030';
  ctx.fillRect(bobX - 3, bobY - 3, 6, 6);
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(bobX - 1, bobY - 1, 2, 2);
};
