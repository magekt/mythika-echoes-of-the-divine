// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};
const ui = globalThis.UI;

// Toast queue - module-local array
let toastQueue = [];
const MAX_TOASTS = 3;
const TOAST_DURATION = 2.5;

// Inline hint dismissal persistence - bounded array in G.state
const MAX_DISMISSED = 50;

// Reduced motion helper
function reduceMotion() {
  return !!(G.state && G.state.reduceMotion) || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Safe state access
function getDismissed() {
  if (!G.state) return [];
  if (!G.state.guidanceDismissed) G.state.guidanceDismissed = [];
  return G.state.guidanceDismissed;
}

function addDismissed(key) {
  const dismissed = getDismissed();
  if (!dismissed.includes(key)) {
    dismissed.push(key);
    if (dismissed.length > MAX_DISMISSED) dismissed.shift();
  }
}

function isDismissed(key) {
  return getDismissed().includes(key);
}

// ============================================================================
// TOAST - Confirmation notifications that stack, respect reduced motion
// ============================================================================
function Toast(message, options) {
  const opts = options || {};
  const duration = opts.duration || TOAST_DURATION;
  const color = opts.color || R.colors.gold;
  const icon = opts.icon || '';
  const playSound = opts.sound !== false;

  if (toastQueue.length >= MAX_TOASTS) {
    toastQueue.shift();
  }

  const toast = {
    message: String(message || ''),
    timer: duration,
    age: 0,
    color: color,
    icon: icon,
    enterProgress: 0,
    // Scene that created this toast (LAY-05). Toast.clearScene drops every
    // toast regardless of tag — Feedback has no achievement concept, so all
    // of its toasts die with the scene.
    sceneTag: (typeof G !== 'undefined' && G.state && G.state.scene) || null
  };

  toastQueue.push(toast);

  if (playSound && Audio.click) {
    Audio.click();
  }

  return toast;
}

Toast.update = function(dt) {
  for (let i = toastQueue.length - 1; i >= 0; i--) {
    const t = toastQueue[i];
    t.timer -= dt;
    t.age += dt;
    if (t.timer <= 0) {
      toastQueue.splice(i, 1);
    }
  }
};

Toast.render = function(ctx) {
  const rm = reduceMotion();
  let ty = 470;
  const count = Math.min(toastQueue.length, MAX_TOASTS);

  for (let i = 0; i < count; i++) {
    const t = toastQueue[i];
    const enter = rm ? 1 : Math.min(1, t.age / 0.15);
    const alpha = Math.min(1, t.timer / 0.18) * enter;

    const lines = wrapText(ctx, t.message, 296);
    const h = lines.length > 1 ? 40 : 26;
    const y = ty - (rm ? 0 : (1 - enter) * 12);

    ctx.globalAlpha = alpha;
    R.roundRect(ctx, 40, y, 320, h, R.radius.s, 'rgba(0,0,0,0.85)');

    if (t.icon) {
      ctx.fillStyle = t.color;
      ctx.font = R.fonts.md;
      ctx.textAlign = 'left';
      ctx.fillText(t.icon, 50, y + h / 2 + 4);
      R.textCenter(ctx, lines[0], G.W / 2, y + 14, t.color, R.fonts.md);
      if (lines.length > 1) {
        R.textCenter(ctx, lines[1], G.W / 2, y + 28, t.color, R.fonts.md);
      }
    } else {
      if (lines.length > 1) {
        R.textCenter(ctx, lines[0], G.W / 2, y + 14, t.color, R.fonts.md);
        R.textCenter(ctx, lines[1], G.W / 2, y + 28, t.color, R.fonts.md);
      } else {
        R.textCenter(ctx, lines[0], G.W / 2, y + 17, t.color, R.fonts.md);
      }
    }

    ctx.globalAlpha = 1;
    ty += h + 6;
  }
};

Toast.clear = function() {
  toastQueue = [];
};

// Scene-scoped clearing (LAY-05): drops ALL Feedback toasts on transition.
// Invoked from the gScene/Fade.update choke points via clearSceneToasts.
Toast.clearScene = function() {
  toastQueue = [];
};

// ============================================================================
// INLINE HINT - Contextual hints with accent bar, dismissible, bounded persistence
// ============================================================================
globalThis.UI.InlineHint = function(id, message, options) {
  const opts = options || {};
  const x = opts.x || 20;
  const y = opts.y || 600;
  const w = opts.w || G.W - 40;
  const accentColor = opts.accentColor || R.colors.accent;
  const dismissKey = opts.dismissKey || ('hint_' + id);

  if (isDismissed(dismissKey)) {
    return null;
  }

  const hint = globalThis.UI.Component(x, y, w, 44, {
    id: id,
    message: String(message || ''),
    accentColor: accentColor,
    dismissKey: dismissKey,
    visible: true,
    _hovered: false,
    _pressed: false,
    _pressTimer: 0
  });

  hint._updateHook = function(dt, h) {
    if (h._pressTimer > 0) {
      h._pressTimer -= dt;
      if (h._pressTimer <= 0) {
        h._pressed = false;
        h._pressTimer = 0;
      }
    }
  };

  hint._renderHook = function(ctx, h) {
    if (!h.visible || isDismissed(h.dismissKey)) {
      h.visible = false;
      return;
    }

    const rm = reduceMotion();
    const isHovered = h._hovered || h._pressed;

    // Background
    R.roundRect(ctx, h.x, h.y, h.w, h.h, R.radius.s, R.colors.surfaceElevated);

    // Accent bar on left
    const barW = 4;
    ctx.fillStyle = h.accentColor;
    ctx.fillRect(h.x, h.y, barW, h.h);

    // Text
    R.text(ctx, h.message, h.x + 14, h.y + h.h / 2 + 4, R.colors.text, R.fonts.md);

    // Dismiss button (X)
    const btnX = h.x + h.w - 36;
    const btnY = h.y + 6;
    const btnSize = 24;
    const hover = h.contains(G.inputX || 0, G.inputY || 0);

    ctx.fillStyle = hover ? R.colors.borderFocus : R.colors.borderHairline;
    R.roundRect(ctx, btnX, btnY, btnSize, btnSize, R.radius.xs, 'rgba(255,255,255,0.05)');
    ctx.strokeStyle = hover ? R.colors.accent : R.colors.borderHairline;
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX + 0.5, btnY + 0.5, btnSize - 1, btnSize - 1);

    // X icon
    ctx.strokeStyle = hover ? R.colors.accent : R.colors.textDim;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(btnX + 8, btnY + 8);
    ctx.lineTo(btnX + btnSize - 8, btnY + btnSize - 8);
    ctx.moveTo(btnX + btnSize - 8, btnY + 8);
    ctx.lineTo(btnX + 8, btnY + btnSize - 8);
    ctx.stroke();
  };

  hint.handleTap = function(px, py) {
    const btnX = this.x + this.w - 36;
    const btnY = this.y + 6;
    const btnSize = 24;

    if (px >= btnX && px <= btnX + btnSize && py >= btnY && py <= btnY + btnSize) {
      addDismissed(this.dismissKey);
      this.visible = false;
      Audio.click();
      return true;
    }
    return false;
  };

  globalThis.UI.mixinContains(hint, 's');

  return hint;
};

// ============================================================================
// CONTEXTUAL BADGE - Status indicators with variants, tooltip on hover/long-press
// ============================================================================
const BADGE_VARIANTS = {
  ready: { color: R.colors.success, icon: '★', pulse: true },
  blocked: { color: R.colors.danger, icon: '🔒', pulse: false },
  progress: { color: R.colors.info, icon: '⟳', pulse: true },
  new: { color: R.colors.warning, icon: '●', pulse: true },
  complete: { color: R.colors.success, icon: '✓', pulse: false }
};

globalThis.UI.ContextualBadge = function(variant, tooltipText, options) {
  const opts = options || {};
  const x = opts.x || 0;
  const y = opts.y || 0;
  const size = opts.size || 24;
  const v = BADGE_VARIANTS[variant] || BADGE_VARIANTS.ready;

  let pulsePhase = 0;
  let tooltipVisible = false;
  let tooltipTimer = 0;
  const TOOLTIP_DELAY = 0.8;

  const badge = globalThis.UI.Component(x, y, size, size, {
    variant: variant,
    tooltipText: String(tooltipText || ''),
    size: size,
    color: v.color,
    icon: v.icon,
    pulse: v.pulse,
    visible: true
  });

  badge._updateHook = function(dt, b) {
    const rm = reduceMotion();
    if (b.pulse && !rm) {
      pulsePhase += dt * 3;
    }

    // Tooltip on long hover
    const ptr = (typeof Input !== 'undefined') ? (Input._touchCurrent || Input._mousePos) : null;
    const inside = ptr && b.contains(ptr.x, ptr.y);
    if (inside) {
      tooltipTimer += dt;
      if (tooltipTimer >= TOOLTIP_DELAY) {
        tooltipVisible = true;
      }
    } else {
      tooltipTimer = 0;
      tooltipVisible = false;
    }
  };

  badge._renderHook = function(ctx, b) {
    if (!b.visible) return;

    const rm = reduceMotion();
    const pulseAlpha = b.pulse && !rm ? (0.5 + Math.sin(pulsePhase) * 0.3) : 1;

    // Badge circle
    ctx.globalAlpha = pulseAlpha;
    R.roundRect(ctx, b.x, b.y, b.size, b.size, b.size / 2, b.color);
    ctx.globalAlpha = 1;

    // Icon
    ctx.fillStyle = R.colors.white;
    ctx.font = '12px "Geist", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.icon, b.x + b.size / 2, b.y + b.size / 2 + 2);

    // Tooltip
    if (tooltipVisible && b.tooltipText) {
      const lines = b.tooltipText.split('\n');
      const lineH = 16;
      const pad = 8;
      const maxW = 180;
      let w = 0;
      ctx.font = R.fonts.sm;
      for (const line of lines) {
        const mw = ctx.measureText(line).width;
        if (mw > w) w = mw;
      }
      w = Math.min(w + pad * 2, maxW);
      const h = lines.length * lineH + pad * 2;

      let tx = b.x + b.size / 2 - w / 2;
      let ty = b.y - h - 8;

      if (tx < 5) tx = 5;
      if (tx + w > G.W - 5) tx = G.W - w - 5;
      if (ty < 5) ty = b.y + b.size + 8;

      ctx.globalAlpha = 0.95;
      R.roundRect(ctx, tx, ty, w, h, R.radius.s, 'rgba(0,0,0,0.9)');
      ctx.globalAlpha = 1;

      let ly = ty + pad + lineH / 2;
      for (const line of lines) {
        R.textCenter(ctx, line, tx + w / 2, ly, R.colors.orangeLight, R.fonts.sm);
        ly += lineH;
      }
    }
  };

  globalThis.UI.mixinContains(badge, 's');

  return badge;
};

// ============================================================================
// BLOCKER TOOLTIP - Anchored tooltip explaining blockers with reason + requirement + action
// ============================================================================
globalThis.UI.BlockerTooltip = function(triggerElement, content, options) {
  const opts = options || {};
  const offsetX = opts.offsetX || 10;
  const offsetY = opts.offsetY || -10;
  const maxWidth = opts.maxWidth || 280;

  let visible = false;
  let anchorX = 0;
  let anchorY = 0;

  const tooltip = globalThis.UI.Component(0, 0, 1, 1, {
    triggerElement: triggerElement,
    content: content, // { reason, requirement, action }
    visible: false,
    _lastTap: 0,
    _computedW: 0,
    _computedH: 0,
    _computedX: 0,
    _computedY: 0
  });

  tooltip.show = function(x, y) {
    anchorX = x;
    anchorY = y;
    this.visible = true;
  };

  tooltip.hide = function() {
    this.visible = false;
  };

  tooltip.toggle = function(x, y) {
    if (this.visible) {
      this.hide();
    } else {
      this.show(x, y);
    }
  };

  tooltip.getLines = function() {
    const c = this.content;
    const lines = [];
    if (c.reason) lines.push('Blocked: ' + c.reason);
    if (c.requirement) lines.push('Requires: ' + c.requirement);
    if (c.action) lines.push('Action: ' + c.action);
    return lines;
  };

  tooltip.getMaxLineWidth = function(lines) {
    if (typeof R === 'undefined' || !R.fonts) return maxWidth;
    let max = 0;
    const ctx = { measureText: function(s) { return { width: s.length * 6 }; } };
    for (const line of lines) {
      const mw = ctx.measureText(line).width;
      if (mw > max) max = mw;
    }
    return max;
  };

  tooltip.getTx = function(w) {
    let tx = anchorX + offsetX;
    if (tx + w > G.W - 5) tx = G.W - w - 5;
    if (tx < 5) tx = 5;
    return tx;
  };

  tooltip.getTy = function(h) {
    let ty = anchorY + offsetY - h;
    if (ty < 5) ty = anchorY + (this.triggerElement?.h || 0) + 10 || anchorY + 40;
    return ty;
  };

  tooltip._updateHook = function(dt, t) {
    // Tap outside to dismiss
    if (t.visible) {
      const tap = (typeof Input !== 'undefined') ? Input.peekTap() : null;
      if (tap && !t.contains(tap.x, tap.y)) {
        const now = performance.now();
        if (now - t._lastTap > 100) {
          t.hide();
          t._lastTap = now;
        }
      }
    }
  };

  tooltip._renderHook = function(ctx, t) {
    if (!t.visible) return;

    const lines = t.getLines();
    const lineH = 16;
    const pad = 10;
    const w = Math.min(maxWidth, t.getMaxLineWidth(lines) + pad * 2);
    const h = lines.length * lineH + pad * 2;
    const tx = t.getTx(w);
    const ty = t.getTy(h);

    // Cache for contains
    t._computedW = w;
    t._computedH = h;
    t._computedX = tx;
    t._computedY = ty;

    // Background
    R.roundRect(ctx, tx, ty, w, h, R.radius.s, 'rgba(0,0,0,0.95)');
    // Gold border
    ctx.strokeStyle = R.colors.gold;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx + 0.5, ty + 0.5, w - 1, h - 1);

    // Content
    let ly = ty + pad + lineH / 2;
    for (const line of lines) {
      R.text(ctx, line, tx + pad, ly, R.colors.orangeLight, R.fonts.sm);
      ly += lineH;
    }

    // Arrow pointing to trigger
    const arrowSize = 8;
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath();
    const cx = anchorX;
    const cy = anchorY;
    if (ty + h <= anchorY) {
      // Arrow down (tooltip above trigger)
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - arrowSize, cy - arrowSize);
      ctx.lineTo(cx + arrowSize, cy - arrowSize);
    } else {
      // Arrow up (tooltip below trigger)
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - arrowSize, cy + arrowSize);
      ctx.lineTo(cx + arrowSize, cy + arrowSize);
    }
    ctx.fill();
  };

  tooltip.contains = function(px, py) {
    if (!this.visible) return false;
    return px >= this._computedX && px <= this._computedX + this._computedW &&
           py >= this._computedY && py <= this._computedY + this._computedH;
  };

  tooltip.handleKey = function(key) {
    if (key === 'Escape' || key === 'Esc') {
      this.hide();
      return true;
    }
    return false;
  };

  return tooltip;
};

// ============================================================================
// HELPER: Text wrapping for toasts
// ============================================================================
function wrapText(ctx, text, maxWidth) {
  if (!ctx || !ctx.measureText) return [String(text || '')];
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const test = cur ? cur + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width <= maxWidth || !cur) {
      cur = test;
    } else {
      lines.push(cur);
      cur = words[i];
      if (lines.length >= 2) break;
    }
  }
  if (cur && lines.length < 2) lines.push(cur);
  return lines.length ? lines : [''];
}

// ============================================================================
// PUBLIC API
// ============================================================================
globalThis.UI.Feedback = {
  Toast: Toast,
  InlineHint: globalThis.UI.InlineHint,
  ContextualBadge: globalThis.UI.ContextualBadge,
  BlockerTooltip: globalThis.UI.BlockerTooltip,

  // Queue access for external render/update loops
  getToastQueue: function() { return toastQueue; },
  updateToasts: Toast.update,
  renderToasts: Toast.render,
  // Scene-transition clearing (LAY-05), called by clearSceneToasts in game.js
  clearSceneToasts: Toast.clearScene,

  // Dismissal helpers
  isDismissed: isDismissed,
  addDismissed: addDismissed,
  getDismissedKeys: getDismissed
};