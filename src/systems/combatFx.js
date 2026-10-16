// Combat FX — element-keyed particle effects on damage events.
// Delegates to R.elementBurst (Phase 55) — pre-allocated circular buffer,
// no per-frame object allocation. Respects R.reducedMotion().

const CombatFX = (function() {
  function spawn(element, x, y, crit) {
    if (typeof R !== 'undefined' && R.elementBurst) {
      R.elementBurst(x, y, element, crit);
    }
  }

  function update(dt) {
    if (typeof R !== 'undefined' && R.updateElementBursts) {
      R.updateElementBursts(dt);
    }
  }

  function render(ctx) {
    if (typeof R !== 'undefined' && R.renderElementBursts) {
      R.renderElementBursts(ctx);
    }
  }

  return { spawn: spawn, update: update, render: render };
})();
