// Keep the shared UI namespace visible to classic scripts that resolve it via
// globalThis as well as to later files' top-level `UI` binding.
globalThis.UI = globalThis.UI || {};

UI.updateButtons = function(buttons, dt) {
  if (!buttons) return;
  for (const b of buttons) {
    if (b.update) b.update(dt);
  }
};

UI.handleButtons = function(buttons, scrollY) {
  const tap = Input.peekTap();
  if (!tap) return false;
  const oy = scrollY || 0;
  for (const b of buttons) {
    if (b.visible === false || !b.contains) continue;
    if (!b.contains(tap.x, tap.y - oy)) continue;
    Input.getTap();
    b._pressed = true;
    b._pressTimer = 0.12;
    // Per-button cooldown: a queued tap landing on a button that already
    // fired within 120ms is absorbed with no FX and no re-fire.
    const now = performance.now();
    if (b._lastFire && now - b._lastFire < 120) return true;
    b._lastFire = now;
    if (b.enabled === false) {
      // Unavailable target: stone strikes the glass; nothing changes.
      // Guarded — a missing effect must never kill input.
      if (R.stoneHit) R.stoneHit(tap.x, tap.y);
      return true;
    }
    Audio.click();
    // Outcome convention: an explicit `false` from a handler marks the
    // action as rejected -> stone-on-glass; anything else counts as valid.
    const outcome = b.onClick ? b.onClick(b.data) : undefined;
    // FX calls are guarded: a missing effect must never kill the tap that
    // already fired (an undefined click-FX once froze the whole loop here).
    if (outcome === false) { if (R.stoneHit) R.stoneHit(tap.x, tap.y); }
    else if (R.validTick) R.validTick(tap.x, tap.y);
    return true;
  }
  return false;
};

/**
 * Base Button component using UI.Component + mixins.
 * Spring-scaled press feedback (0.97x) with zero per-frame allocation.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} text
 * @param {string} [color]
 * @param {string} [hoverColor]
 * @param {string} [textColor]
 * @returns {object}
 */
UI.Button = function(x, y, w, h, text, color, hoverColor, textColor) {
  const btn = UI.Component(x, y, w, h, {
    text: text || '',
    color: color || R.colors.btn,
    hoverColor: hoverColor || R.colors.btnHover,
    textColor: textColor || R.colors.white,
    enabled: true,
    visible: true,
    _hovered: false,
    _pressed: false,
    _pressTimer: 0,
    scrollY: 0,
    // Spring state for press scale (allocated once)
    _visualScale: 1,
    _scaleVel: 0,
    // Spring step function (recreated only when target changes)
    _pressSpringStep: R.spring({ ...R.springConfigs.buttonPress, target: 1 }),
    onClick: null,
    data: null
  });
  btn._pressSpringStep._target = 1;

  // Update hook: advances spring based on press/hover state
  btn._updateHook = function(dt, b) {
    if (b._pressTimer > 0) {
      b._pressTimer -= dt;
      if (b._pressTimer <= 0) {
        b._pressed = false;
        b._pressTimer = 0;
      }
    }

    // Determine if button is being held (touch or mouse)
    let held = false;
    const down = Input._touchCurrent || Input._touchStart || Input._pressPos;
    if (down && b.enabled && b.visible) {
      held = b.contains(down.x, down.y - b.scrollY);
    }
    const target = (b._pressed || held) ? 0.97 : 1;

    // Reduced motion: snap instantly
    if (R.reducedMotion && R.reducedMotion()) {
      b._visualScale = target;
      b._scaleVel = 0;
      return;
    }

    // Recreate step function only if target changed
    if (b._pressSpringStep._target !== target) {
      b._pressSpringStep = R.spring({ ...R.springConfigs.buttonPress, target: target });
      b._pressSpringStep._target = target;
    }

    const s = b._pressSpringStep(b._visualScale, b._scaleVel, dt);
    b._visualScale = s.value;
    b._scaleVel = s.velocity;
  };

  // Render hook: draws button with spring scale transform
  btn._renderHook = function(ctx, b) {
    // Null-safe: a missing context must never crash the render loop
    // (threat model T-047-01: Button render with null ctx).
    if (!ctx) return;
    // Held press-down state: mirror the live pointer position (touch OR
    // mouse) so touch users see the same feedback hover gives desktop.
    // Screen-space pointer y maps into build-space via this.scrollY.
    let held = false;
    const down = Input._touchCurrent || Input._touchStart || Input._pressPos;
    if (down && b.enabled && b.visible) {
      held = b.contains(down.x, down.y - b.scrollY);
    }
    const pressed = b._pressed || held;
    const col = pressed ? b.hoverColor : (b._hovered ? b.hoverColor : b.color);
    const oy = b.scrollY;
    // Spring-scaled press transform: scale about the button center.
    const cx = b.x + b.w / 2;
    const cy = b.y + oy + b.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(b._visualScale, b._visualScale);
    ctx.translate(-cx, -cy);

    R.roundRect(ctx, b.x, b.y + oy, b.w, b.h, R.radius.s, col);
    if (b.color === R.colors.btnGold || b.color === R.colors.orange) {
      ctx.strokeStyle = pressed ? R.colors.gold : R.colors.orangeLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const r = R.radius.s, x = b.x, y = b.y + oy, w = b.w, h = b.h;
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
    }
    if (!b.enabled) {
      ctx.globalAlpha = 0.5;
    }
    R.textCenter(ctx, b.text, cx, b.y + oy + b.h / 2 + 4, pressed ? R.colors.white : b.textColor, R.fonts.md);
    ctx.globalAlpha = 1;

    ctx.restore();
  };

  // Contains uses default rect check (radius-aware via mixin if needed)
  UI.mixinContains(btn, 's');

  return btn;
};

UI.BtnGold = function(x, y, w, h, text) {
  return UI.Button(x, y, w, h, text, R.colors.btnGold, R.colors.orangeLight, R.colors.white);
};

UI.BtnSmall = function(x, y, text) {
  return UI.Button(x, y, 60, 24, text);
};

UI.BtnWide = function(x, y, text) {
  return UI.Button(x, y, 160, 32, text);
};

// Canvas field with a native input overlay. Canvas owns the visual shell so
// fields keep the same immediate-mode styling as the rest of the game, while
// the native control provides reliable mobile keyboards, selection and IME
// behaviour. The overlay is positioned in logical game coordinates; the game
// container's scale transform then keeps it aligned with the canvas.
UI.Input = function(x, y, w, h, value, options) {
  const config = typeof options === 'boolean' ? { password: options } : (options || {});
  const field = UI.Component(x, y, Math.max(44, w || 200), Math.max(44, h || 44), {
    value: value == null ? '' : String(value),
    label: config.label || '',
    placeholder: config.placeholder || '',
    password: !!config.password,
    type: config.type || (config.password ? 'password' : 'text'),
    autocomplete: config.autocomplete || (config.password ? 'current-password' : 'off'),
    inputMode: config.inputMode || (config.type === 'tel' ? 'tel' : undefined),
    error: config.error || '',
    enabled: config.enabled !== false,
    visible: true,
    scrollY: 0,
    viewportTop: config.viewportTop || 0,
    viewportBottom: config.viewportBottom || (typeof G !== 'undefined' ? G.H : 720),
    _focused: false,
    _dom: null,
    _destroyed: false,
    onChange: config.onChange || null,
    onSubmit: config.onSubmit || null,
    onFocus: config.onFocus || null,
    onBlur: config.onBlur || null
  });

  field._updateHook = function(dt, f) {
    // No per-frame logic needed for input field
  };

  field._renderHook = function(ctx, f) {
    if (!f.visible) {
      f._syncDom();
      return;
    }

    const fieldY = f.y;
    const focused = f._focused;
    const hasError = !!f.error;
    R.roundRect(ctx, f.x, fieldY, f.w, f.h, R.radius.m, R.colors.surfaceElevated);
    ctx.strokeStyle = hasError ? R.colors.danger : (focused ? R.colors.borderFocus : R.colors.borderHairline);
    ctx.lineWidth = focused || hasError ? 2 : 1;
    ctx.strokeRect(f.x + 0.5, fieldY + 0.5, f.w - 1, f.h - 1);

    if (f.label) {
      R.text(ctx, f.label, f.x + 14, fieldY + 15, focused ? R.colors.accent : R.colors.textSecondary, R.fonts.xs);
    }
    if (!f.value && !focused && f.placeholder) {
      R.text(ctx, f.placeholder, f.x + 14, fieldY + f.h - 12, R.colors.textDim, R.fonts.md);
    }
    if (hasError) {
      R.textRight(ctx, f.error, f.x + f.w - 12, fieldY + f.h - 12, R.colors.danger, R.fonts.xs);
    }
    f._syncDom();
  };

  field._syncDom = function() {
    const el = this._dom;
    if (!el || this._destroyed) return;
    const container = document.getElementById('game-container');
    if (!container) return;

    const top = this.y - (this.scrollY || 0);
    const inViewport = this.visible && this.enabled &&
      top >= this.viewportTop && top + this.h <= this.viewportBottom;
    el.classList.toggle('is-hidden', !inViewport);
    el.setAttribute('aria-hidden', inViewport ? 'false' : 'true');
    if (!inViewport) return;

    el.style.left = this.x + 'px';
    el.style.top = top + 'px';
    el.style.width = this.w + 'px';
    el.style.height = this.h + 'px';
    if (el.value !== this.value && document.activeElement !== el) el.value = this.value;
    el.disabled = !this.enabled;
  };

  field.focus = function() {
    if (this._dom && this.enabled) this._dom.focus();
  };

  field.blur = function() {
    if (this._dom) this._dom.blur();
  };

  field.setValue = function(next) {
    this.value = next == null ? '' : String(next);
    if (this._dom && document.activeElement !== this._dom) this._dom.value = this.value;
  };

  field.setError = function(message) {
    this.error = message || '';
    if (this._dom) this._dom.setAttribute('aria-invalid', this.error ? 'true' : 'false');
  };

  field.destroy = function() {
    this._destroyed = true;
    if (this._dom) {
      this._dom.removeEventListener('input', this._onInput);
      this._dom.removeEventListener('change', this._onChange);
      this._dom.removeEventListener('focus', this._onFocus);
      this._dom.removeEventListener('blur', this._onBlur);
      this._dom.removeEventListener('keydown', this._onKeyDown);
      if (this._dom.parentNode) this._dom.parentNode.removeChild(this._dom);
    }
    this._dom = null;
  };

  if (typeof document !== 'undefined') {
    const container = document.getElementById('game-container');
    if (container) {
      const el = document.createElement('input');
      el.className = 'auth-input-overlay is-hidden';
      el.type = field.type;
      el.autocomplete = field.autocomplete;
      el.value = field.value;
      el.setAttribute('aria-label', field.label || field.placeholder || 'Text input');
      el.setAttribute('aria-invalid', field.error ? 'true' : 'false');
      el.spellcheck = false;
      if (field.inputMode) el.inputMode = field.inputMode;
      field._onInput = function() {
        field.value = el.value;
        if (field.onChange) field.onChange(field.value);
      };
      field._onChange = function() {
        if (field.value !== el.value) field._onInput();
      };
      field._onFocus = function() {
        field._focused = true;
        if (field.onFocus) field.onFocus(field);
      };
      field._onBlur = function() {
        field._focused = false;
        if (field.onBlur) field.onBlur(field);
      };
      field._onKeyDown = function(event) {
        if (event.key === 'Enter' && field.onSubmit) {
          event.preventDefault();
          field.onSubmit(field.value, event);
        }
      };
      el.addEventListener('input', field._onInput);
      el.addEventListener('change', field._onChange);
      el.addEventListener('focus', field._onFocus);
      el.addEventListener('blur', field._onBlur);
      el.addEventListener('keydown', field._onKeyDown);
      container.appendChild(el);
      field._dom = el;
      field._syncDom();
    }
  }

  UI.mixinContains(field, 'm');

  return field;
};

UI.makeTooltip = function(ctx, text, x, y) {
  const lines = text.split('\n');
  const lineH = 16;
  const w = 200;
  const h = lines.length * lineH + 10;
  let tx = x - w / 2;
  let ty = y - h - 10;
  if (tx < 5) tx = 5;
  if (ty < 5) ty = 5;
  if (tx + w > G.W - 5) tx = G.W - w - 5;
  R.roundRect(ctx, tx, ty, w, h, 4, 'rgba(0,0,0,0.9)');
  R.roundRect(ctx, tx, ty, w, h, 4, 'rgba(232,160,48,0.3)');
  let ly = ty + 8;
  for (const line of lines) {
    R.textCenter(ctx, line, tx + w / 2, ly + lineH / 2, R.colors.orangeLight, R.fonts.sm);
    ly += lineH;
  }
};

// Persistent HUD – draws core resources on every scene
UI.HUD = function() {
  const margin = 12;
  const iconSize = 24;
  const font = R.fonts.lg;
  return {
    render: function(ctx) {
      const y = margin;
      let x = margin;
      // Gold
      R.textRight(ctx, '💰 ' + (G.state.gold || 0) + 'g', x + 80, y + iconSize / 2 + 4, R.colors.gold, font);
      // Prana
      R.textRight(ctx, '🔮 ' + Math.floor(G.state.prana || 0), x + 180, y + iconSize / 2 + 4, R.colors.blue, font);
      // Party average level
      const party = G.state.party || [];
      const avgLvl = party.length ? Math.floor(party.reduce((s,h)=>s+(h.level||1),0)/party.length) : 1;
      R.textRight(ctx, '⚔️ Lv' + avgLvl, x + 280, y + iconSize / 2 + 4, R.colors.text, font);
      // Cultivation base progress
      const prog = CultivationSystem.getRealmProgress();
      R.textRight(ctx, '🌀 ' + Math.floor(prog.current) + '/' + prog.needed, x + 380, y + iconSize / 2 + 4, R.colors.text, font);
    }
  };
};

// ============================================================================
// PREMIUM UI COMPONENTS (Double-Bezel, Magnetic Physics, Scroll Reveal, etc.)
// ============================================================================

// Double-Bezel Card Shell (PremiumShell)
UI.PremiumShell = function(x, y, w, h, opts = {}) {
  const outerR = opts.outerR || 32;
  const innerR = opts.innerR || (outerR - 6);
  const outerBg = opts.outerBg || 'rgba(0,0,0,0.05)';
  const outerBorder = opts.outerBorder || 'rgba(255,255,255,0.08)';
  const innerBg = opts.innerBg || R.colors.surface;
  const innerHighlight = opts.innerHighlight || 'rgba(255,255,255,0.12)';
  
  return {
    x, y, w, h,
    render: function(ctx) {
      // Outer shell
      R.roundRect(ctx, x, y, w, h, outerR, outerBg);
      ctx.strokeStyle = outerBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      // Inner core
      const ix = x + (outerR - innerR);
      const iy = y + (outerR - innerR);
      const iw = w - 2 * (outerR - innerR);
      const ih = h - 2 * (outerR - innerR);
      R.roundRect(ctx, ix, iy, iw, ih, innerR, innerBg);
      // Inner highlight (top edge)
      ctx.fillStyle = innerHighlight;
      R.roundRect(ctx, ix, iy, iw, 1, innerR, innerHighlight);
    },
    contentRect: function() {
      const pad = outerR - innerR + 8;
      return { x: x + pad, y: y + pad, w: w - 2*pad, h: h - 2*pad };
    }
  };
};

/**
 * Magnetic Button with Spring Physics — composed from UI.Component + mixins.
 * Variants: 'primary', 'secondary', 'ghost'.
 * Trailing icon always visible in nested circle; press scales icon to 1.05x.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} label
 * @param {object} [opts={}]
 * @returns {object}
 */
UI.MagneticBtn = function(x, y, w, h, label, opts = {}) {
  const variant = opts.variant || 'primary'; // 'primary', 'secondary', 'ghost'

  const btn = UI.Component(x, y, w, h, {
    label: label,
    _variant: variant,
    _trailingIcon: opts.trailingIcon || null,
    _leadingIcon: opts.leadingIcon || null,
    enabled: true,
    visible: true,
    _hovered: false,
    _pressed: false,
    _pressTimer: 0,
    scrollY: 0,
    onClick: null,
    data: null,
    // Spring state for body scale (allocated once)
    _springScale: 1,
    _scaleVel: 0,
    // Spring step functions (recreated only when target changes)
    _pressSpringStep: R.spring({ ...R.springConfigs.buttonPress, target: 1 }),
    _hoverSpringStep: R.spring({ stiffness: 120, damping: 22, target: 0 }),
    // Icon spring state (allocated once)
    _iconSpringX: 0,
    _iconSpringY: 0,
    _iconSpringVelX: 0,
    _iconSpringVelY: 0
  });
  btn._pressSpringStep._target = 1;
  btn._hoverSpringStep._target = 0;

  // Update hook: advances both press and icon springs
  btn._updateHook = function(dt, b) {
    // Press timer
    if (b._pressTimer > 0) {
      b._pressTimer -= dt;
      if (b._pressTimer <= 0) b._pressed = false;
    }

    const reduceMotion = R.reducedMotion && R.reducedMotion();

    // Press scale spring
    const down = Input._touchCurrent || Input._touchStart || Input._pressPos;
    const pressedOrHeld = !!(b._pressed || (down && b.enabled && b.visible && b.contains(down.x, down.y - (b.scrollY || 0))));
    const pressTarget = pressedOrHeld ? 0.97 : 1;

    if (reduceMotion) {
      b._springScale = pressTarget;
      b._scaleVel = 0;
    } else {
      if (b._pressSpringStep._target !== pressTarget) {
        b._pressSpringStep = R.spring({ ...R.springConfigs.buttonPress, target: pressTarget });
        b._pressSpringStep._target = pressTarget;
      }
      const s = b._pressSpringStep(b._springScale, b._scaleVel, dt);
      b._springScale = s.value;
      b._scaleVel = s.velocity;
    }

    // Magnetic icon physics (first-order lerp for icon offset, spring for press scale)
    const ptr = Input._touchCurrent || Input._mousePos;
    const isHovered = !reduceMotion && ptr && b.enabled && b.visible && b.contains(ptr.x, ptr.y - (b.scrollY || 0));
    b._hovered = isHovered;

    const hoverTarget = (isHovered && (b._trailingIcon || b._leadingIcon)) ? 1 : 0;

    if (reduceMotion) {
      b._iconSpringX = 0;
      b._iconSpringY = 0;
      b._iconSpringVelX = 0;
      b._iconSpringVelY = 0;
    } else {
      // First-order lerp for icon position (not a full spring — lightweight)
      b._iconSpringX += (isHovered ? 2 : 0 - b._iconSpringX) * Math.min(1, dt * 8);
      b._iconSpringY += (isHovered ? -1 : 0 - b._iconSpringY) * Math.min(1, dt * 8);
    }
  };

  // Render hook: draws variant-appropriate button with spring scale
  btn._renderHook = function(ctx, b) {
    // Null-safe: a missing context must never crash the render loop
    // (threat model T-047-01: Button render with null ctx).
    if (!ctx) return;
    const reduceMotion = R.reducedMotion && R.reducedMotion();
    const bx = b.x, by = b.y, bw = b.w, bh = b.h;

    ctx.save();
    // Scale about the button center
    ctx.translate(bx + bw/2, by + bh/2);
    ctx.scale(b._springScale, b._springScale);
    ctx.translate(-(bx + bw/2), -(by + bh/2));

    if (b._variant === 'primary') {
      // Primary: Gold background, white text
      R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.gold);
      if (b._pressed || b._hovered) {
        ctx.strokeStyle = R.colors.goldLight;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
      R.textCenter(ctx, b.label, bx + bw / 2, by + bh/2 + 4, R.colors.white, R.fonts.md);
    } else if (b._variant === 'secondary') {
      // Secondary: Surface background, gold border
      if (b.enabled) {
        R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
        R.textCenter(ctx, b.label, bx + bw / 2, by + bh/2 + 4, R.colors.textPrimary, R.fonts.md);
      } else {
        R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
        ctx.strokeStyle = R.colors.borderHairline;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        ctx.globalAlpha = 0.5;
        R.textCenter(ctx, b.label, bx + bw / 2, by + bh/2 + 4, R.colors.textDim, R.fonts.md);
        ctx.globalAlpha = 1;
      }
    } else if (b._variant === 'ghost') {
      // Ghost: No background, text only with hover underline
      if (b._hovered && !reduceMotion) {
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - 4);
        ctx.lineTo(bx + bw, by + bh - 4);
        ctx.stroke();
      }
      R.textCenter(ctx, b.label, bx + bw / 2, by + bh/2 + 4, b._hovered ? R.colors.gold : R.colors.textPrimary, R.fonts.md);
    }

    ctx.restore();

    // Trailing icon (BTN-02): always visible when set; nested circle with
    // diagonal translate + scale on press.
    if (b._trailingIcon) {
      const down = Input._touchCurrent || Input._touchStart || Input._pressPos;
      const held = !!(b._pressed || (down && b.enabled && b.visible && b.contains(down.x, down.y - (b.scrollY || 0))));

      const ix = bx + bw - 28 + b._iconSpringX;
      const iy = by + bh/2 - 12 + b._iconSpringY;
      const circleD = 24;
      const cx = ix;
      const cy = iy;

      ctx.save();
      ctx.translate(cx, cy);
      // Circle inherits button body scale from outer rendering; only add
      // icon-specific scale + diagonal translate here.
      const iconPressScale = held ? 1.05 : 1;
      const diag = held ? 1 : 0;
      ctx.translate(diag, diag);
      ctx.scale(iconPressScale, iconPressScale);

      const circleFill = b._variant === 'ghost' ? (R.colors.surfaceGlass || R.colors.surface) : R.colors.surface;
      const iconColor = b._variant === 'ghost' ? R.colors.gold : R.colors.white;
      // Circle
      if (R.roundRect) {
        // Use a rounded-rect for an arc-free nested enclosure.
        R.roundRect(ctx, -circleD/2, -circleD/2, circleD, circleD, 6, circleFill);
        ctx.strokeStyle = b._variant === 'ghost' ? R.colors.gold : R.colors.goldMuted;
        ctx.lineWidth = 1;
        ctx.strokeRect(-circleD/2 + 0.5, -circleD/2 + 0.5, circleD - 1, circleD - 1);
      } else if (ctx.arc) {
        ctx.beginPath();
        ctx.arc(0, 0, circleD/2, 0, Math.PI * 2);
        ctx.fillStyle = circleFill;
        ctx.fill();
      }

      // Arrow inside
      ctx.strokeStyle = iconColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4, 0); ctx.lineTo(4, 0);
      ctx.moveTo(0, -4); ctx.lineTo(4, 0);
      ctx.moveTo(0, 4); ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Leading icon for ghost variant
    if (b._leadingIcon && b._hovered && !reduceMotion) {
      const ix = bx + 20 + b._iconSpringX;
      const iy = by + bh/2 - 12 + b._iconSpringY;
      ctx.save();
      ctx.translate(ix, iy);
      ctx.strokeStyle = R.colors.gold;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4, 0); ctx.lineTo(-4, 0);
      ctx.moveTo(0, -4); ctx.lineTo(-4, 0);
      ctx.moveTo(0, 4); ctx.lineTo(-4, 0);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Contains with radius awareness
  UI.mixinContains(btn, 's');

  btn.setTrailingIcon = function(iconName) { this._trailingIcon = iconName; };
  btn.setLeadingIcon = function(iconName) { this._leadingIcon = iconName; };

  return btn;
};

// Scroll Reveal Stagger
UI.ScrollReveal = function() {
  const reduce = R.reducedMotion && R.reducedMotion();
  const elements = [];
  
  return {
    register: function(el, opts = {}) {
      if (reduce) { el._revealed = true; return; }
      const { delay = 0, y = 24, blur = 8, duration = 800 } = opts;
      el._revealState = { opacity: 0, y, blur, progress: 0 };
      el._revealOpts = { delay, duration };
      elements.push(el);
    },
    update: function(dt) {
      elements.forEach(el => {
        if (el._revealed) return;
        // Check if in viewport (canvas equivalent: check scrollY)
        const inView = el.y < G.H + 100 && el.y + el.h > -100;
        if (inView && !el._revealStarted) {
          el._revealStarted = true;
          setTimeout(() => {
            el._revealed = true;
          }, el._revealOpts.delay);
        }
        if (el._revealed) {
          el._revealState.progress = Math.min(1, el._revealState.progress + dt * 1000 / el._revealOpts.duration);
          const p = el._revealState.progress;
          const ease = 1 - Math.pow(1 - p, 3);
          el._revealState.opacity = ease;
          el._revealState.y = el._revealState.y * (1 - ease);
          el._revealState.blur = el._revealState.blur * (1 - ease);
        }
      });
    },
    apply: function(ctx, el) {
      if (!el._revealState) return;
      ctx.save();
      ctx.globalAlpha = el._revealState.opacity;
      ctx.translate(0, el._revealState.y);
      ctx.filter = `blur(${el._revealState.blur}px)`;
      // ... render element ...
      ctx.restore();
    }
  };
};

// Fluid Island Nav Morph
UI.FluidNav = function() {
  const navItems = [
    { text: 'Map', scene: 'travelMap', icon: '▶' },
    { text: 'Party', scene: 'party', icon: '☺' },
    { text: 'Shop', scene: 'bazaar', icon: '⚙' },
    { text: 'Rest', scene: '', icon: '♪' },
    { text: 'More', scene: 'settings', icon: '≡' }
  ];
  
  let expanded = false;
  let hamburgerRotation = 0;
  const spring = { rotation: 0, targetRotation: 0, stagger: [] };
  
  return {
    toggle: function() {
      expanded = !expanded;
      spring.targetRotation = expanded ? 45 : 0;
      spring.stagger = navItems.map((_, i) => ({ progress: 0, delay: i * 100 }));
    },
    update: function(dt) {
      spring.rotation += (spring.targetRotation - spring.rotation) * Math.min(1, dt * 10);
      spring.stagger.forEach((s, i) => {
        if (expanded) {
          s.progress = Math.min(1, s.progress + dt * 1000 / 600);
        } else {
          s.progress = Math.max(0, s.progress - dt * 1000 / 300);
        }
      });
    },
    render: function(ctx) {
      if (!expanded) {
        // Floating pill
        const pillW = 280, pillH = 44;
        const x = G.W/2 - pillW/2, y = G.H - pillH - 12;
        // Glass pill
        R.roundRect(ctx, x, y, pillW, pillH, 22, 'rgba(26,26,48,0.9)');
        ctx.strokeStyle = 'rgba(232,160,48,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x+0.5, y+0.5, pillW-1, pillH-1);
        // Icons
        navItems.forEach((item, i) => {
          const ix = x + pillW/5 * i + pillW/10;
          R.textCenter(ctx, item.icon, ix, y + 28, R.colors.textDim, R.fonts.lg);
          R.textCenter(ctx, item.text, ix, y + 40, R.colors.textDim, R.fonts.xs);
        });
        // Hamburger
        const hx = x + pillW - 36, hy = y + 8;
        const lineW = 20, lineH = 2;
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        // Line 1
        ctx.save();
        ctx.translate(hx + lineW/2, hy + 6);
        ctx.rotate(spring.rotation * Math.PI/180);
        ctx.beginPath(); ctx.moveTo(-lineW/2, 0); ctx.lineTo(lineW/2, 0); ctx.stroke();
        ctx.restore();
        // Line 2
        ctx.save();
        ctx.translate(hx + lineW/2, hy + 14);
        ctx.rotate(-spring.rotation * Math.PI/180);
        ctx.beginPath(); ctx.moveTo(-lineW/2, 0); ctx.lineTo(lineW/2, 0); ctx.stroke();
        ctx.restore();
        // Line 3 (hidden when expanded)
        if (!expanded) {
          ctx.beginPath(); ctx.moveTo(hx, hy + 22); ctx.lineTo(hx + lineW, hy + 22); ctx.stroke();
        }
      } else {
        // Expanded overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, G.W, G.H);
        // Staggered links
        navItems.forEach((item, i) => {
          const s = spring.stagger[i];
          const y = G.H/2 - 60 + i * 50 + (1 - s.progress) * 30;
          const alpha = s.progress;
          ctx.globalAlpha = alpha;
          R.textCenter(ctx, item.icon + '  ' + item.text, G.W/2, y, R.colors.gold, R.fonts.lg);
        });
        ctx.globalAlpha = 1;
      }
    },
    handleTap: function(x, y) {
      if (!expanded) {
        if (x > G.W - 60 && y > G.H - 60) {
          this.toggle();
          return true;
        }
      } else {
        navItems.forEach((item, i) => {
          const y = G.H/2 - 60 + i * 50;
          if (Math.abs(y - y) < 30 && item.scene) {
            gScene(item.scene);
            this.toggle();
          }
        });
        return true;
      }
      return false;
    }
  };
};

// Empty State Illustrations
UI.EmptyState = function(opts) {
  const { type, title, hint, ctaLabel, ctaAction } = opts;
  const illustrations = {
    journey: function(ctx, cx, cy) {
      ctx.strokeStyle = 'rgba(232,160,48,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 20); ctx.lineTo(cx + 15, cy - 20);
      ctx.moveTo(cx - 10, cy - 30); ctx.lineTo(cx + 10, cy - 30);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(232,160,48,0.3)';
      ctx.beginPath();
      ctx.moveTo(cx + 25, cy - 40); ctx.lineTo(cx + 40, cy - 55);
      ctx.stroke();
    },
    beast: function(ctx, cx, cy) {
      ctx.fillStyle = 'rgba(232,160,48,0.3)';
      ctx.beginPath(); ctx.arc(cx, cy - 10, 8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 10, cy - 20, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 10, cy - 20, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 5, cy - 30, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 5, cy - 30, 4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(232,160,48,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.arc(cx, cy, 20 + i * 10, 0, Math.PI * 1.5);
      }
      ctx.stroke();
    },
    recipe: function(ctx, cx, cy) {
      ctx.strokeStyle = 'rgba(232,160,48,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 20); ctx.lineTo(cx - 12, cy - 20);
      ctx.lineTo(cx + 12, cy - 20); ctx.lineTo(cx + 12, cy + 20);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy - 25, 6, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(48,200,48,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 35, 6, 12, -0.3, 0, Math.PI*2); ctx.fill();
    }
  };

  // REV-04: construct the CTA ONCE at factory time. cx/cy derive from
  // G.W/G.H (stable at init) and type is fixed, so the button instance is
  // reusable — render() only drives update(dt) + render(ctx), no allocation.
  const cx = G.W/2, cy = G.H/2 - 40;
  const ctaBtn = ctaLabel ? UI.MagneticBtn(cx - 90, cy + 100, 180, 40, ctaLabel) : null;
  if (ctaBtn) {
    ctaBtn.onClick = ctaAction;
  }

  const emptyState = UI.Component(cx - 150, cy - 100, 300, 250, {
    type: type,
    title: title,
    hint: hint,
    ctaBtn: ctaBtn,
    visible: true
  });

  emptyState._updateHook = function(dt, es) {
    if (es.ctaBtn && es.ctaBtn.update) es.ctaBtn.update(dt);
  };

  emptyState._renderHook = function(ctx, es) {
    illustrations[es.type]?.(ctx, cx, cy);
    R.textCenter(ctx, es.title, cx, cy + 50, R.colors.gold, R.fonts.md);
    R.textCenter(ctx, es.hint, cx, cy + 70, R.colors.textDim, R.fonts.sm);
    if (es.ctaBtn) es.ctaBtn.render(ctx);
  };

  return emptyState;
};

// Fix disabled gold button contrast (WCAG AA)
const originalBtnRender = UI.Button.prototype && UI.Button.prototype.render;
if (originalBtnRender) {
  UI.Button.prototype.render = function(ctx) {
    if (!this.enabled && this.color === R.colors.btnGold) {
      ctx.globalAlpha = 0.6;
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.btnGold);
      R.textCenter(ctx, this.text, this.x + this.w/2, this.y + this.h/2 + 4, R.colors.textDark, R.fonts.md);
      ctx.globalAlpha = 1;
      return;
    }
    originalBtnRender.call(this, ctx);
  };
}