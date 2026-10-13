// Combat FX — element-keyed particle effects on damage events.
// Respects R.reducedMotion(): all FX are suppressed when reduced motion is on.

const CombatFX = (function() {
  // Circular buffer for active particle bursts
  const bursts = [];
  const MAX_BURSTS = 40;

  function spawnBurst(element, x, y) {
    if (R.reducedMotion()) return;
    if (bursts.length >= MAX_BURSTS) bursts.shift();
    const particles = [];
    const cx = x, cy = y;

    switch (element) {
      case 'fire':
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
          particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * (15 + Math.random() * 20),
            vy: Math.sin(a) * (15 + Math.random() * 20) - 20,
            life: 0.4 + Math.random() * 0.1,
            age: 0,
            size: 2.5 + Math.random() * 1.5,
            color: i % 2 ? '#ff6020' : '#ff9040'
          });
        }
        break;
      case 'ice':
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + Math.random() * 0.4;
          particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * (25 + Math.random() * 15),
            vy: Math.sin(a) * (25 + Math.random() * 15),
            life: 0.5 + Math.random() * 0.1,
            age: 0,
            size: 3 + Math.random() * 2,
            color: '#a0e0ff'
          });
        }
        break;
      case 'lightning':
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + Math.random() * 0.6;
          particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * (50 + Math.random() * 30),
            vy: Math.sin(a) * (50 + Math.random() * 30),
            life: 0.25 + Math.random() * 0.05,
            age: 0,
            size: 1.5 + Math.random() * 1,
            color: i % 2 ? '#ffff80' : '#ffffff'
          });
        }
        break;
      case 'dark':
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
          particles.push({
            x: cx + Math.cos(a) * 20, y: cy + Math.sin(a) * 20,
            vx: -Math.cos(a) * 15,
            vy: -Math.sin(a) * 15,
            life: 0.5 + Math.random() * 0.1,
            age: 0,
            size: 3 + Math.random() * 2,
            color: i % 2 ? '#4a2060' : '#8030a0'
          });
        }
        break;
      case 'holy':
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
          particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * (10 + Math.random() * 8),
            vy: Math.sin(a) * (10 + Math.random() * 8) - 30,
            life: 0.6 + Math.random() * 0.1,
            age: 0,
            size: 3 + Math.random() * 2,
            color: i % 3 === 0 ? '#ffd700' : (i % 3 === 1 ? '#fff8e0' : '#ffcc40')
          });
        }
        break;
      default:
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
          particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * 30,
            vy: Math.sin(a) * 30,
            life: 0.35,
            age: 0,
            size: 2.5,
            color: '#ff6020'
          });
        }
    }

    bursts.push({ element: element, particles: particles });
  }

  function update(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      let alive = false;
      for (const p of b.particles) {
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Slight gravity for fire/holy
        if (b.element === 'fire' || b.element === 'holy') p.vy += 80 * dt;
        if (p.age < p.life) alive = true;
      }
      if (!alive) bursts.splice(i, 1);
    }
  }

  function render(ctx) {
    for (const b of bursts) {
      for (const p of b.particles) {
        if (p.age >= p.life) continue;
        const alpha = Math.max(0, 1 - (p.age / p.life));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  return { spawn: spawnBurst, update: update, render: render };
})();
