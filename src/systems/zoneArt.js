// Zone Art — 6 procedural backdrops for the zone exploration + combat scenes.
// Each backdrop: gradient sky → mid-ground silhouette → accent layer.
// Zone-specific hex values are allowed ONLY in this file.

const ZoneArt = (function() {
  const W = 400, H = 720;

  function makeCanvas() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    return c;
  }

  function drawSky(ctx, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawHills(ctx, color, yTop, yMid, yBot) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, yBot);
    ctx.lineTo(0, yMid);
    ctx.quadraticCurveTo(80, yTop, 160, yMid - 10);
    ctx.quadraticCurveTo(240, yTop + 20, 320, yMid);
    ctx.quadraticCurveTo(380, yTop + 10, W, yMid - 5);
    ctx.lineTo(W, yBot);
    ctx.closePath();
    ctx.fill();
  }

  function drawMountain(ctx, color, cx, peakY, baseY) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 120, baseY);
    ctx.lineTo(cx, peakY);
    ctx.lineTo(cx + 120, baseY);
    ctx.closePath();
    ctx.fill();
  }

  function drawTree(ctx, x, y, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, y - h * 0.3, 4, h * 0.3);
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - h * 0.4, y - h * 0.35);
    ctx.lineTo(x + h * 0.4, y - h * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  function drawPine(ctx, x, y, h, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i++) {
      const rowY = y - h * (i / 3);
      const rowH = h * 0.35;
      const rowW = h * 0.5 * (1 - i * 0.25);
      ctx.beginPath();
      ctx.moveTo(x, rowY - rowH);
      ctx.lineTo(x - rowW / 2, rowY);
      ctx.lineTo(x + rowW / 2, rowY);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawPillar(ctx, x, w, topY, botY, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, topY, w, botY - topY);
    ctx.fillRect(x - 4, topY - 6, w + 8, 8);
    ctx.fillRect(x - 4, botY, w + 8, 8);
  }

  function drawCloud(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.1, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSun(ctx, x, y, r, color, glow) {
    ctx.fillStyle = glow || 'rgba(232,160,48,0.15)';
    ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // ── Zone generators ─────────────────────────────────────────────────────────

  function aryavarta() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    drawSky(ctx, '#0e2a38', '#081418');
    drawSun(ctx, 320, 120, 32, 'rgba(232,160,48,0.9)', 'rgba(232,160,48,0.12)');
    drawHills(ctx, 'rgba(20,40,30,0.9)', 430, 500, 620);
    drawHills(ctx, 'rgba(15,30,25,0.95)', 480, 540, 680);
    for (let i = 0; i < 5; i++) drawTree(ctx, 40 + i * 80, 560 + (i % 2) * 20, 30 + (i % 3) * 8, 'rgba(20,50,40,0.8)');
    ctx.fillStyle = 'rgba(200,180,100,0.1)';
    for (let i = 0; i < 20; i++) {
      const px = (i * 67) % 400, py = 380 + (i * 43) % 300;
      ctx.fillRect(px, py, 1, 1);
    }
    return c;
  }

  function dandaka() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    drawSky(ctx, '#0a0818', '#050410');
    ctx.fillStyle = 'rgba(100,80,180,0.06)';
    ctx.fillRect(0, 200, W, 120);
    ctx.fillStyle = 'rgba(80,60,160,0.08)';
    ctx.fillRect(0, 350, W, 100);
    drawHills(ctx, 'rgba(8,12,25,0.95)', 450, 520, 650);
    for (let i = 0; i < 12; i++) {
      drawPine(ctx, 20 + i * 34, 600 + (i % 4) * 15, 70 + (i % 5) * 12, 'rgba(10,15,30,0.95)');
    }
    ctx.fillStyle = 'rgba(160,140,220,0.05)';
    for (let i = 0; i < 30; i++) {
      const px = (i * 41) % 400, py = 250 + (i * 37) % 350;
      ctx.fillRect(px, py, 1, 4 + (i % 3) * 2);
    }
    return c;
  }

  function meru() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    drawSky(ctx, '#1a1a4a', '#0a0818');
    ctx.strokeStyle = 'rgba(60,200,220,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 200 + i * 40);
      ctx.bezierCurveTo(100, 180 + i * 35, 300, 220 + i * 30, 400, 190 + i * 38);
      ctx.stroke();
    }
    drawMountain(ctx, 'rgba(20,25,60,0.9)', 200, 200, 600);
    drawMountain(ctx, 'rgba(15,20,50,0.95)', 100, 300, 620);
    drawMountain(ctx, 'rgba(15,20,50,0.95)', 310, 280, 620);
    ctx.fillStyle = 'rgba(200,220,255,0.6)';
    ctx.beginPath(); ctx.arc(200, 200, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,220,255,0.4)';
    ctx.beginPath(); ctx.arc(160, 240, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(260, 250, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(10,15,35,0.98)';
    ctx.fillRect(0, 620, W, 100);
    return c;
  }

  function patala() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    drawSky(ctx, '#1a0508', '#0a0305');
    ctx.fillStyle = 'rgba(180,60,20,0.08)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      drawPillar(ctx, 30 + i * 65, 24, 200, 560, 'rgba(60,15,10,0.9)');
    }
    ctx.strokeStyle = 'rgba(200,100,30,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.bezierCurveTo(100, 480, 200, 520, 300, 490);
    ctx.lineTo(400, 500);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,30,0.5)';
    for (let i = 0; i < 15; i++) {
      const px = (i * 53) % 400, py = 520 + (i * 29) % 180;
      ctx.beginPath(); ctx.arc(px, py, 1 + (i % 2), 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(10,5,5,0.98)';
    ctx.fillRect(0, 680, W, 40);
    return c;
  }

  function svarga() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    drawSky(ctx, '#1a2a5a', '#0a1025');
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      drawCloud(ctx, 40 + i * 50, 120 + (i % 4) * 60, 80, 30, 'rgba(200,220,255,0.12)');
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(200 - i * 30, 0);
      ctx.lineTo(200 + i * 30, 300);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(232,160,48,0.15)';
    ctx.beginPath(); ctx.ellipse(200, 520, 60, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,160,48,0.3)';
    ctx.beginPath(); ctx.ellipse(200, 518, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(10,15,40,0.95)';
    ctx.fillRect(0, 640, W, 80);
    return c;
  }

  function tapobhumi() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    drawSky(ctx, '#2a2010', '#100a05');
    drawSun(ctx, 100, 180, 24, 'rgba(220,180,80,0.6)', 'rgba(220,180,80,0.08)');
    ctx.fillStyle = 'rgba(160,120,60,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.quadraticCurveTo(100, 470, 200, 490);
    ctx.quadraticCurveTo(300, 470, 400, 500);
    ctx.lineTo(400, 720); ctx.lineTo(0, 720);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,90,40,0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 580);
    ctx.quadraticCurveTo(150, 550, 300, 580);
    ctx.quadraticCurveTo(380, 600, 400, 580);
    ctx.lineTo(400, 720); ctx.lineTo(0, 720);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(60,50,30,0.6)';
    ctx.fillRect(160, 380, 4, 140);
    ctx.fillRect(280, 400, 3, 120);
    ctx.fillStyle = 'rgba(200,180,100,0.08)';
    for (let i = 0; i < 25; i++) {
      const px = (i * 47) % 400, py = 300 + (i * 31) % 350;
      ctx.fillRect(px, py, 1, 1);
    }
    ctx.fillStyle = 'rgba(20,15,10,0.98)';
    ctx.fillRect(0, 680, W, 40);
    return c;
  }

  const PAINTERS = {
    aryavarta: aryavarta,
    dandaka:   dandaka,
    meru:      meru,
    patala:    patala,
    svarga:    svarga,
    tapobhumi: tapobhumi
  };

  function paintZone(zoneId) {
    const painter = PAINTERS[zoneId];
    if (painter) return painter();
    const c = makeCanvas();
    const ctx = c.getContext('2d');
    drawSky(ctx, '#1a1a30', '#0a0a1a');
    return c;
  }

  function registerAll() {
    if (typeof R === 'undefined' || !R.Backgrounds) return;
    for (const zoneId of Object.keys(PAINTERS)) {
      const id = zoneId;
      R.Backgrounds.registerSlot('zone:' + id, function(key) {
        return paintZone(id);
      });
    }
  }

  return { paintZone, registerAll };
})();
