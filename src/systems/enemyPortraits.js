// Enemy Portraits — 60x60 canvas-drawn silhouettes for 20 highest-frequency
// enemies. Caches offscreen canvases in an LRU (max 20 entries).
//
// Shape mapping: each enemy gets a distinctive head shape drawn into a 60x60
// local coordinate space. Gold rim light on the left edge; body filled dark.

const EnemyPortrait = (function() {
  const SIZE = 60;
  const cache = new Map();
  const order = [];
  const MAX = 20;

  function makeCanvas() {
    const c = document.createElement('canvas');
    c.width = SIZE; c.height = SIZE;
    return c;
  }

  function getCached(enemyId) {
    if (cache.has(enemyId)) {
      const idx = order.indexOf(enemyId);
      if (idx !== -1) order.splice(idx, 1);
      order.push(enemyId);
      return cache.get(enemyId);
    }
    return null;
  }

  function putCached(enemyId, canvas) {
    if (cache.size >= MAX) {
      const evict = order.shift();
      if (evict) cache.delete(evict);
    }
    cache.set(enemyId, canvas);
    order.push(enemyId);
  }

  function paint(enemyId, ctx) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();

    const GOLD = 'rgba(232,160,48,0.6)';
    const BODY = 'rgba(20,16,30,0.95)';
    const DARK = 'rgba(12,10,20,0.9)';

    function head(cx, cy, rx, ry, shape) {
      ctx.fillStyle = BODY;
      ctx.beginPath();
      if (shape === 'hood') {
        ctx.moveTo(cx - rx, cy + ry);
        ctx.quadraticCurveTo(cx - rx, cy - ry * 0.4, cx, cy - ry);
        ctx.quadraticCurveTo(cx + rx, cy - ry * 0.4, cx + rx, cy + ry);
      } else {
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function shoulder() {
      ctx.fillStyle = DARK;
      ctx.beginPath();
      ctx.ellipse(30, 52, 24, 10, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    function horn(cx, cy, side) {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + side * 8, cy - 18);
      ctx.quadraticCurveTo(cx + side * 18, cy - 30, cx + side * 14, cy - 38);
      ctx.stroke();
    }

    function rimLight() {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(22, 30, 18, Math.PI * 0.7, Math.PI * 1.3);
      ctx.stroke();
    }

    switch (enemyId) {
      case 'bandit':
        head(30, 28, 12, 16, 'hood'); shoulder(); rimLight();
        break;
      case 'wolf':
        head(30, 30, 14, 11);
        ctx.fillStyle = BODY;
        ctx.beginPath(); ctx.moveTo(18, 32); ctx.lineTo(6, 36); ctx.lineTo(18, 38); ctx.closePath(); ctx.fill();
        shoulder(); rimLight();
        break;
      case 'giantSpider':
        head(30, 28, 16, 10);
        ctx.fillStyle = DARK;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(30 + (i - 1.5) * 6, 38);
          ctx.lineTo(30 + (i - 1.5) * 8, 54);
          ctx.lineTo(30 + (i - 1.5) * 8 + 2, 54);
          ctx.lineTo(30 + (i - 1.5) * 6, 38);
          ctx.fill();
        }
        shoulder();
        break;
      case 'rakshasa':
        head(30, 28, 13, 16); shoulder();
        horn(30, 28, -1); horn(30, 28, 1);
        break;
      case 'wildBoar':
        head(30, 30, 14, 12);
        ctx.fillStyle = DARK;
        ctx.beginPath(); ctx.ellipse(30, 42, 8, 4, 0, 0, Math.PI); ctx.fill();
        shoulder();
        break;
      case 'snake':
        head(30, 30, 9, 12);
        ctx.strokeStyle = BODY; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(30, 42); ctx.bezierCurveTo(20, 50, 40, 52, 30, 58); ctx.stroke();
        break;
      case 'wraith':
        ctx.fillStyle = 'rgba(140,160,220,0.15)';
        ctx.beginPath(); ctx.ellipse(30, 30, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(100,120,200,0.25)';
        ctx.beginPath(); ctx.ellipse(30, 34, 10, 14, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'darkElf':
        head(30, 28, 12, 15); shoulder();
        ctx.fillStyle = BODY;
        ctx.beginPath(); ctx.moveTo(18, 22); ctx.lineTo(10, 10); ctx.lineTo(20, 18); ctx.fill();
        ctx.beginPath(); ctx.moveTo(42, 22); ctx.lineTo(50, 10); ctx.lineTo(40, 18); ctx.fill();
        break;
      case 'shadowMage':
        head(30, 30, 12, 14); shoulder();
        ctx.fillStyle = DARK;
        ctx.beginPath(); ctx.moveTo(22, 16); ctx.lineTo(30, 4); ctx.lineTo(38, 16); ctx.closePath(); ctx.fill();
        break;
      case 'treant':
        head(30, 28, 13, 15);
        ctx.strokeStyle = DARK; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(30, 13); ctx.lineTo(26, 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30, 13); ctx.lineTo(34, 4); ctx.stroke();
        ctx.fillStyle = DARK;
        ctx.fillRect(26, 40, 8, 16);
        break;
      case 'naga':
        head(30, 26, 11, 13);
        ctx.strokeStyle = BODY; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(30, 38); ctx.bezierCurveTo(16, 46, 44, 48, 30, 58); ctx.stroke();
        break;
      case 'asuraWarrior':
        head(30, 28, 14, 16); shoulder();
        horn(30, 28, -1); horn(30, 28, 1);
        ctx.fillStyle = GOLD; ctx.fillRect(28, 44, 4, 6);
        break;
      case 'orc':
        head(30, 28, 14, 15); shoulder();
        ctx.fillStyle = 'rgba(232,160,48,0.5)';
        ctx.beginPath(); ctx.moveTo(22, 36); ctx.lineTo(18, 48); ctx.lineTo(24, 42); ctx.fill();
        ctx.beginPath(); ctx.moveTo(38, 36); ctx.lineTo(42, 48); ctx.lineTo(36, 42); ctx.fill();
        break;
      case 'iceElemental':
        ctx.fillStyle = 'rgba(120,200,255,0.12)';
        ctx.beginPath(); ctx.moveTo(30, 6); ctx.lineTo(44, 44); ctx.lineTo(16, 44); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(180,230,255,0.25)';
        ctx.beginPath(); ctx.moveTo(30, 12); ctx.lineTo(40, 42); ctx.lineTo(20, 42); ctx.closePath(); ctx.fill();
        break;
      case 'fireElemental':
        ctx.fillStyle = 'rgba(200,60,20,0.2)';
        ctx.beginPath(); ctx.ellipse(30, 34, 18, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,140,40,0.3)';
        ctx.beginPath(); ctx.ellipse(30, 38, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,100,0.4)';
        ctx.beginPath(); ctx.ellipse(30, 42, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
        break;
      case 'asura':
        head(30, 26, 13, 16); shoulder();
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.moveTo(18, 14); ctx.lineTo(30, 6); ctx.lineTo(42, 14); ctx.closePath(); ctx.fill();
        break;
      case 'hellHound':
        head(30, 30, 13, 10);
        ctx.fillStyle = DARK;
        ctx.beginPath(); ctx.ellipse(30, 42, 7, 3, 0, 0, Math.PI); ctx.fill();
        ctx.fillStyle = BODY;
        ctx.beginPath(); ctx.moveTo(18, 34); ctx.lineTo(6, 44); ctx.lineTo(18, 38); ctx.fill();
        ctx.beginPath(); ctx.moveTo(42, 34); ctx.lineTo(54, 44); ctx.lineTo(42, 38); ctx.fill();
        shoulder();
        break;
      case 'indra':
        head(30, 26, 12, 16); shoulder();
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.ellipse(30, 10, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(30, 10, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(100,180,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(30, 30, 26, 0, Math.PI * 2); ctx.stroke();
        break;
      case 'dragonEmerald':
        head(30, 28, 12, 14);
        ctx.fillStyle = BODY;
        ctx.beginPath(); ctx.moveTo(30, 42); ctx.lineTo(22, 54); ctx.lineTo(38, 54); ctx.closePath(); ctx.fill();
        horn(30, 26, -1); horn(30, 26, 1);
        shoulder();
        break;
      case 'kaliya':
        ctx.strokeStyle = BODY; ctx.lineWidth = 7;
        for (let ring = 0; ring < 3; ring++) {
          ctx.beginPath();
          ctx.arc(30, 32 - ring * 6, 16 + ring * 5, Math.PI * 0.1, Math.PI * 0.9);
          ctx.stroke();
        }
        head(30, 18, 8, 6);
        break;
      default:
        head(30, 28, 13, 16); shoulder(); rimLight();
        break;
    }
    ctx.restore();
  }

  function getCanvas(enemyId) {
    const cached = getCached(enemyId);
    if (cached) return cached;
    const c = makeCanvas();
    paint(enemyId, c.getContext('2d'));
    putCached(enemyId, c);
    return c;
  }

  function render(ctx, x, y, w, h, enemyId) {
    const canvas = getCanvas(enemyId);
    ctx.drawImage(canvas, x, y, w, h);
  }

  return { render, getCanvas, SIZE };
})();
