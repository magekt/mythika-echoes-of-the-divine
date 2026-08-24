const UI = {};

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
      R.stoneHit(tap.x, tap.y);
      return true;
    }
    Audio.click();
    // Outcome convention: an explicit `false` from a handler marks the
    // action as rejected -> stone-on-glass; anything else counts as valid.
    const outcome = b.onClick ? b.onClick(b.data) : undefined;
    if (outcome === false) R.stoneHit(tap.x, tap.y);
    else R.validTick(tap.x, tap.y);
    return true;
  }
  return false;
};

UI.Button = function(x, y, w, h, text, color, hoverColor, textColor) {
  return {
    x, y, w, h, text,
    color: color || R.colors.btn,
    hoverColor: hoverColor || R.colors.btnHover,
    textColor: textColor || R.colors.white,
    enabled: true,
    visible: true,
    _hovered: false,
    _pressed: false,
    onClick: null,
    data: null,
    scrollY: 0,

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
      if (!this.visible) return;
      // Held press-down state: mirror the live pointer position (touch OR
      // mouse) so touch users see the same feedback hover gives desktop.
      // Screen-space pointer y maps into build-space via this.scrollY.
      let held = false;
      const down = Input._touchCurrent || Input._touchStart || Input._pressPos;
      if (down && this.enabled && this.visible) {
        held = this.contains(down.x, down.y - this.scrollY);
      }
      const pressed = this._pressed || held;
      const col = pressed ? this.hoverColor : (this._hovered ? this.hoverColor : this.color);
      const oy = this.scrollY;
      const dx = pressed ? 1 : 0;
      const dy = pressed ? 1 : 0;
      const dw = pressed ? -2 : 0;
      const dh = pressed ? -2 : 0;
      R.roundRect(ctx, this.x + dx, this.y + oy + dy, this.w + dw, this.h + dh, R.radius.s, col);
      if (this.color === R.colors.btnGold || this.color === R.colors.orange) {
        ctx.strokeStyle = pressed ? R.colors.gold : R.colors.orangeLight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const r = R.radius.s, x = this.x + dx, y = this.y + oy + dy, w = this.w + dw, h = this.h + dh;
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
      if (!this.enabled) {
        ctx.globalAlpha = 0.5;
      }
      R.textCenter(ctx, this.text, this.x + dx + this.w / 2 + dw / 2, this.y + oy + dy + this.h / 2 + dh / 2 + 4, pressed ? R.colors.white : this.textColor, R.fonts.md);
      ctx.globalAlpha = 1;
    }
  };
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

// Magnetic Button with Spring Physics - Supports variants: primary, secondary, ghost
UI.MagneticBtn = function(x, y, w, h, label, opts = {}) {
  const variant = opts.variant || 'primary'; // 'primary', 'secondary', 'ghost'
  const baseBtn = UI.BtnGold(x, y, w, h, label);
  const spring = { scale: 1, targetScale: 1, iconX: 0, iconY: 0 };
  const stiffness = 120, damping = 22;
  
  baseBtn._trailingIcon = opts.trailingIcon || null;
  baseBtn._leadingIcon = opts.leadingIcon || null;
  baseBtn._variant = variant;
  baseBtn._iconSpringX = 0;
  baseBtn._iconSpringY = 0;
  baseBtn._springScale = 1;
  
  baseBtn.update = function(dt) {
    if (this._pressTimer > 0) {
      this._pressTimer -= dt;
      if (this._pressTimer <= 0) this._pressed = false;
    }
    // Spring to target
    spring.scale += (spring.targetScale - spring.scale) * Math.min(1, dt * stiffness / damping);
    if (Math.abs(spring.scale - spring.targetScale) < 0.001) spring.scale = spring.targetScale;
    this._springScale = spring.scale;
    
    // Magnetic icon physics
    const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
    if (this._hovered && (this._trailingIcon || this._leadingIcon) && !reduceMotion) {
      spring.iconX += (2 - spring.iconX) * Math.min(1, dt * 8);
      spring.iconY += (-1 - spring.iconY) * Math.min(1, dt * 8);
    } else {
      spring.iconX += (0 - spring.iconX) * Math.min(1, dt * 8);
      spring.iconY += (0 - spring.iconY) * Math.min(1, dt * 8);
    }
    this._iconSpringX = spring.iconX;
    this._iconSpringY = spring.iconY;
  };
  
  const originalRender = baseBtn.render;
  baseBtn.render = function(ctx) {
    const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
    const bx = this.x, by = this.y, bw = this.w, bh = this.h;
    
    ctx.save();
    ctx.translate(bx + bw/2, by + bh/2);
    ctx.scale(spring.scale, spring.scale);
    ctx.translate(-bw/2, -bh/2);
    
    if (variant === 'primary') {
      // Primary: Gold background, white text
      R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.gold);
      if (this._pressed || this._hovered) {
        ctx.strokeStyle = R.colors.goldLight;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
      R.textCenter(ctx, label, bx + bw / 2, by + bh/2 + 4, R.colors.white, R.fonts.md);
    } else if (variant === 'secondary') {
      // Secondary: Surface background, gold border
      if (this.enabled) {
        R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
        R.textCenter(ctx, label, bx + bw / 2, by + bh/2 + 4, R.colors.textPrimary, R.fonts.md);
      } else {
        R.roundRect(ctx, bx, by, bw, bh, 8, R.colors.surface);
        ctx.strokeStyle = R.colors.borderHairline;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        ctx.globalAlpha = 0.5;
        R.textCenter(ctx, label, bx + bw / 2, by + bh/2 + 4, R.colors.textDim, R.fonts.md);
        ctx.globalAlpha = 1;
      }
    } else if (variant === 'ghost') {
      // Ghost: No background, text only with hover underline
      if (this._hovered && !reduceMotion) {
        ctx.strokeStyle = R.colors.gold;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - 4);
        ctx.lineTo(bx + bw, by + bh - 4);
        ctx.stroke();
      }
      R.textCenter(ctx, label, bx + bw / 2, by + bh/2 + 4, this._hovered ? R.colors.gold : R.colors.textPrimary, R.fonts.md);
    }
    
    ctx.restore();
    
    // Trailing icon physics
    if (this._trailingIcon && this._hovered && !reduceMotion) {
      const ix = bx + bw - 28 + spring.iconX;
      const iy = by + bh/2 - 12 + spring.iconY;
      ctx.save();
      ctx.translate(ix, iy);
      ctx.scale(1.05, 1.05);
      const iconColor = variant === 'ghost' ? R.colors.gold : R.colors.white;
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
    if (this._leadingIcon && this._hovered && !reduceMotion) {
      const ix = bx + 20 + spring.iconX;
      const iy = by + bh/2 - 12 + spring.iconY;
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
  
  // Magnetic hover detection with reduced motion support
  const originalUpdate = baseBtn.update;
  baseBtn.update = function(dt) {
    originalUpdate.call(this, dt);
    const reduceMotion = R.reducedMotion ? R.reducedMotion() : false;
    const ptr = Input._touchCurrent || Input._mousePos;
    if (ptr && this.enabled && this.visible && !reduceMotion) {
      const inside = this.contains(ptr.x, ptr.y - (this.scrollY||0));
      this._hovered = inside;
      spring.targetScale = inside ? 0.98 : 1;
    } else {
      this._hovered = false;
      spring.targetScale = 1;
    }
  };
  
  baseBtn.setTrailingIcon = function(iconName) { this._trailingIcon = iconName; };
  baseBtn.setLeadingIcon = function(iconName) { this._leadingIcon = iconName; };
  return baseBtn;
};

// Scroll Reveal Stagger
UI.ScrollReveal = function() {
  const reduce = R.reducedMotion ? R.reducedMotion() : false;
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
    { text: 'More', scene: '_more', icon: '≡' }
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
  
  return {
    render: function(ctx) {
      const cx = G.W/2, cy = G.H/2 - 40;
      illustrations[type]?.(ctx, cx, cy);
      R.textCenter(ctx, title, cx, cy + 50, R.colors.gold, R.fonts.md);
      R.textCenter(ctx, hint, cx, cy + 70, R.colors.textDim, R.fonts.sm);
      if (ctaLabel) {
        const btn = UI.MagneticBtn(cx - 90, cy + 100, 180, 40, ctaLabel);
        btn.onClick = ctaAction;
        btn.render(ctx);
      }
    }
  };
};

// Fix disabled gold button contrast (WCAG AA)
const originalBtnRender = UI.Button.prototype.render;
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
