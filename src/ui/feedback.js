// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

globalThis.UI.Feedback = (function() {
  // Engine globals (R, G, Audio, Notify) are lexical `const` bindings from
  // ordered classic scripts — resolved at call time like every other file.
  // Do NOT snapshot globalThis here: `const` globals never attach to it.

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
      enterProgress: 0
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

  // ============================================================================
  // INLINE HINT - Contextual hints with accent bar, dismissible, bounded persistence
  // ============================================================================
  function InlineHint(id, message, options) {
    const opts = options || {};
    const x = opts.x || 20;
    const y = opts.y || 600;
    const w = opts.w || G.W - 40;
    const accentColor = opts.accentColor || R.colors.accent;
    const dismissKey = opts.dismissKey || ('hint_' + id);

    if (isDismissed(dismissKey)) {
      return null;
    }

    return {
      id: id,
      message: String(message || ''),
      x: x,
      y: y,
      w: w,
      h: 44,
      accentColor: accentColor,
      dismissKey: dismissKey,
      visible: true,
      _hovered: false,
      _pressed: false,
      _pressTimer: 0,

      contains: function(px, py) {
        return px >= this.x && px <= this.x + this.w &&
               py >= this.y && py <= this.y + this.h;
      },

      update: function(dt) {
        if (this._pressTimer > 0) {
          this._pressTimer -= dt;
          if (this._pressTimer <= 0) {
            this._pressed = false;
            this._pressTimer = 0;
          }
        }
      },

      render: function(ctx) {
        if (!this.visible || isDismissed(this.dismissKey)) {
          this.visible = false;
          return;
        }

        const rm = reduceMotion();
        const isHovered = this._hovered || this._pressed;

        // Background
        R.roundRect(ctx, this.x, this.y, this.w, this.h, R.radius.s, R.colors.surfaceElevated);

        // Accent bar on left
        const barW = 4;
        ctx.fillStyle = this.accentColor;
        ctx.fillRect(this.x, this.y, barW, this.h);

        // Text
        R.text(ctx, this.message, this.x + 14, this.y + this.h / 2 + 4, R.colors.text, R.fonts.md);

        // Dismiss button (X)
        const btnX = this.x + this.w - 36;
        const btnY = this.y + 6;
        const btnSize = 24;
        const hover = this.contains(G.inputX || 0, G.inputY || 0);

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
      },

      handleTap: function(px, py) {
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
      }
    };
  }

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

  function ContextualBadge(variant, tooltipText, options) {
    const opts = options || {};
    const x = opts.x || 0;
    const y = opts.y || 0;
    const size = opts.size || 24;
    const v = BADGE_VARIANTS[variant] || BADGE_VARIANTS.ready;

    let pulsePhase = 0;
    let tooltipVisible = false;
    let tooltipTimer = 0;
    const TOOLTIP_DELAY = 0.8;

    return {
      variant: variant,
      tooltipText: String(tooltipText || ''),
      x: x,
      y: y,
      size: size,
      color: v.color,
      icon: v.icon,
      pulse: v.pulse,
      visible: true,

      update: function(dt) {
        const rm = reduceMotion();
        if (this.pulse && !rm) {
          pulsePhase += dt * 3;
        }

        // Tooltip on long hover
        const ptr = (typeof Input !== 'undefined') ? (Input._touchCurrent || Input._mousePos) : null;
        const inside = ptr && this.contains(ptr.x, ptr.y);
        if (inside) {
          tooltipTimer += dt;
          if (tooltipTimer >= TOOLTIP_DELAY) {
            tooltipVisible = true;
          }
        } else {
          tooltipTimer = 0;
          tooltipVisible = false;
        }
      },

      contains: function(px, py) {
        return px >= this.x && px <= this.x + this.size &&
               py >= this.y && py <= this.y + this.size;
      },

      render: function(ctx) {
        if (!this.visible) return;

        const rm = reduceMotion();
        const pulseAlpha = this.pulse && !rm ? (0.5 + Math.sin(pulsePhase) * 0.3) : 1;

        // Badge circle
        ctx.globalAlpha = pulseAlpha;
        R.roundRect(ctx, this.x, this.y, this.size, this.size, this.size / 2, this.color);
        ctx.globalAlpha = 1;

        // Icon
        ctx.fillStyle = R.colors.white;
        ctx.font = '12px "Geist", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x + this.size / 2, this.y + this.size / 2 + 2);

        // Tooltip
        if (tooltipVisible && this.tooltipText) {
          const lines = this.tooltipText.split('\n');
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

          let tx = this.x + this.size / 2 - w / 2;
          let ty = this.y - h - 8;

          if (tx < 5) tx = 5;
          if (tx + w > G.W - 5) tx = G.W - w - 5;
          if (ty < 5) ty = this.y + this.size + 8;

          ctx.globalAlpha = 0.95;
          R.roundRect(ctx, tx, ty, w, h, R.radius.s, 'rgba(0,0,0,0.9)');
          ctx.globalAlpha = 1;

          let ly = ty + pad + lineH / 2;
          for (const line of lines) {
            R.textCenter(ctx, line, tx + w / 2, ly, R.colors.orangeLight, R.fonts.sm);
            ly += lineH;
          }
        }
      }
    };
  }

  // ============================================================================
  // BLOCKER TOOLTIP - Anchored tooltip explaining blockers with reason + requirement + action
  // ============================================================================
  function BlockerTooltip(triggerElement, content, options) {
    const opts = options || {};
    const offsetX = opts.offsetX || 10;
    const offsetY = opts.offsetY || -10;
    const maxWidth = opts.maxWidth || 280;

    let visible = false;
    let anchorX = 0;
    let anchorY = 0;

    return {
      triggerElement: triggerElement,
      content: content, // { reason, requirement, action }
      visible: false,
      _lastTap: 0,

      show: function(x, y) {
        anchorX = x;
        anchorY = y;
        this.visible = true;
      },

      hide: function() {
        this.visible = false;
      },

      toggle: function(x, y) {
        if (this.visible) {
          this.hide();
        } else {
          this.show(x, y);
        }
      },

      contains: function(px, py) {
        if (!this.visible) return false;
        const lines = this.getLines();
        const lineH = 16;
        const pad = 10;
        const w = Math.min(maxWidth, this.getMaxLineWidth(lines) + pad * 2);
        const h = lines.length * lineH + pad * 2;
        const tx = this.getTx(w);
        const ty = this.getTy(h);
        return px >= tx && px <= tx + w && py >= ty && py <= ty + h;
      },

      getLines: function() {
        const c = this.content;
        const lines = [];
        if (c.reason) lines.push('Blocked: ' + c.reason);
        if (c.requirement) lines.push('Requires: ' + c.requirement);
        if (c.action) lines.push('Action: ' + c.action);
        return lines;
      },

      getMaxLineWidth: function(lines) {
        if (typeof R === 'undefined' || !R.fonts) return maxWidth;
        let max = 0;
        const ctx = { measureText: function(s) { return { width: s.length * 6 }; } };
        for (const line of lines) {
          const mw = ctx.measureText(line).width;
          if (mw > max) max = mw;
        }
        return max;
      },

      getTx: function(w) {
        let tx = anchorX + offsetX;
        if (tx + w > G.W - 5) tx = G.W - w - 5;
        if (tx < 5) tx = 5;
        return tx;
      },

      getTy: function(h) {
        let ty = anchorY + offsetY - h;
        if (ty < 5) ty = anchorY + this.triggerElement?.h + 10 || anchorY + 40;
        return ty;
      },

      update: function(dt) {
        // Tap outside to dismiss
        if (this.visible) {
          const tap = (typeof Input !== 'undefined') ? Input.peekTap() : null;
          if (tap && !this.contains(tap.x, tap.y)) {
            const now = performance.now();
            if (now - this._lastTap > 100) {
              this.hide();
              this._lastTap = now;
            }
          }
        }
      },

      render: function(ctx) {
        if (!this.visible) return;

        const lines = this.getLines();
        const lineH = 16;
        const pad = 10;
        const w = Math.min(maxWidth, this.getMaxLineWidth(lines) + pad * 2);
        const h = lines.length * lineH + pad * 2;
        const tx = this.getTx(w);
        const ty = this.getTy(h);

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
      },

      handleKey: function(key) {
        if (key === 'Escape' || key === 'Esc') {
          this.hide();
          return true;
        }
        return false;
      }
    };
  }

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
  return {
    Toast: Toast,
    InlineHint: InlineHint,
    ContextualBadge: ContextualBadge,
    BlockerTooltip: BlockerTooltip,

    // Queue access for external render/update loops
    getToastQueue: function() { return toastQueue; },
    updateToasts: Toast.update,
    renderToasts: Toast.render,

    // Dismissal helpers
    isDismissed: isDismissed,
    addDismissed: addDismissed,
    getDismissedKeys: getDismissed
  };
})();

