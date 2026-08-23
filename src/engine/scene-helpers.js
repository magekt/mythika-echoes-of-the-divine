// Scene helpers: shared implementations for patterns repeated across scenes.
//
// Conventions every scrollable scene follows:
//   data.staticDraws : array of draw entries built in build*(), rendered every frame
//                      by Scene.drawStatic() INSIDE the clip/translate (so they scroll
//                      with content and survive the per-frame clearRect).
//   clampScroll()    : clamps data.scrollY against data.contentHeight.
//   Modal guard      : `if (UI.Modal.active) { UI.Modal.handleInput(); return; }`
//                      at the very top of update().
(function() {

  // Render static draws recorded by a scene's build functions.
  // Entry shapes:
  //   { text:       [str, x, y, color, font] }
  //   { textCenter: [str, x, y, color, font] }
  //   { rect:  [x, y, w, h, radius, fill], stroke: [x, y, w, h, color], lw: 2 }
  Scene.drawStatic = function(ctx, draws) {
    for (const d of draws || []) {
      if (d.text) {
        R.text(ctx, d.text[0], d.text[1], d.text[2], d.text[3], d.text[4]);
      } else if (d.textCenter) {
        R.textCenter(ctx, d.textCenter[0], d.textCenter[1], d.textCenter[2], d.textCenter[3], d.textCenter[4]);
      } else if (d.rect) {
        R.roundRect(ctx, d.rect[0], d.rect[1], d.rect[2], d.rect[3], d.rect[4], d.rect[5]);
        if (d.stroke) {
          ctx.strokeStyle = d.stroke[4];
          ctx.lineWidth = d.lw || 2;
          ctx.strokeRect(d.stroke[0], d.stroke[1], d.stroke[2], d.stroke[3]);
        }
      }
    }
  };

  // Standard wheel/touch scroll handling for scenes with data.scrollY + clampScroll().
  Scene.scrollInput = function(scene) {
    const sd = Input.getScrollDelta();
    if (sd) {
      scene.data.scrollY += sd * G.SCROLL_SPEED;
      scene.clampScroll();
    }
  };

  // Right-edge scrollbar thumb for a scrolled content area.
  // minBar: minimum thumb height in px (default 16; ashram/characterCreate use 18).
  Scene.drawScrollbar = function(ctx, top, contentHeight, viewportH, scrollY, minBar) {
    if (!(contentHeight > viewportH)) return;
    const ratio = viewportH / contentHeight;
    const barH = Math.max(minBar || 16, ratio * viewportH);
    const maxTrack = viewportH - barH;
    const scrollFrac = scrollY / Math.max(1, contentHeight - viewportH);
    const barY = top + scrollFrac * maxTrack;
    R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
  };

  // Human-readable name for an equipped-gear slot that may hold an object,
  // a legacy string, or nothing.
  Scene.gearLabel = function(slot) {
    return (slot && slot.name) || slot || 'None';
  };

  // Viewport culling for long button lists: buttons store build-time y and are
  // rendered under translate(0, -scrollY), so a button is on-screen when its
  // span intersects [scrollY, scrollY + viewportH]. Keeps huge inventories cheap.
  Scene.cullButtons = function(buttons, scrollY, viewportH) {
    const visible = [];
    for (const b of buttons) {
      if (b.y + b.h >= scrollY && b.y <= scrollY + viewportH) visible.push(b);
    }
    return visible;
  };

  // Standard top panel: background + hairline border + centered gold title.
  // Scene-specific sub-lines stay in the scene's render().
  Scene.drawHeader = function(ctx, h, title, titleY) {
    R.roundRect(ctx, 10, 6, G.W - 20, h, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, h - 1);
    // Bezel depth: a 1px light catches the top inner edge and a 1px shade
    // seats the bottom one — machined-panel feel with zero blur cost.
    R.rect(ctx, 12, 7, G.W - 24, 1, 'rgba(255,255,255,0.06)');
    R.rect(ctx, 12, 5 + h, G.W - 24, 1, 'rgba(0,0,0,0.35)');
    if (title) R.textCenter(ctx, title, G.W / 2, titleY || 22, R.colors.gold, R.fonts.lg);
  };

  // save + clip to the scrollable content band + translate by -scrollY.
  // Caller MUST ctx.restore() after drawing its content.
  Scene.clipContent = function(ctx, scene) {
    const top = scene.getContentTop();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, scene.getContentHeight());
    ctx.clip();
    ctx.translate(0, -scene.data.scrollY);
  };

  // Standard bottom-of-list back button.
  // opts: { label: 'Back to Ashram', target: 'ashram', fade: false }
  Scene.backButton = function(y, opts) {
    const o = opts || {};
    const btn = UI.Button(60, y, G.W - 120, 30, o.label || 'Back to Ashram', R.colors.btnGold);
    btn.onClick = function() { gScene(o.target || 'ashram', !!o.fade); };
    return btn;
  };

  // ============================================================================
  // PREMIUM SCENE COMPONENTS
  // ============================================================================

  // Hero Moment - for key scenes (Ashram, Journey, Combat, CharacterCreate)
  Scene.HeroMoment = function(opts) {
    const { title, subtitle, ctaLabel, ctaAction, eyebrow, accent } = opts;
    return {
      render: function(ctx) {
        const cx = G.W/2;
        let y = 40;
        // Eyebrow (optional, max 1 per 3 sections)
        if (eyebrow) {
          R.roundRect(ctx, cx - 60, y, 120, 22, 11, 'rgba(232,160,48,0.15)');
          R.textCenter(ctx, eyebrow, cx, y + 15, accent || R.colors.accent, R.fonts.xs);
          y += 36;
        }
        // Display serif headline
        R.textCenter(ctx, title, cx, y, R.colors.textPrimary, R.fonts.display);
        y += 44;
        // Subtext (max 20 words)
        R.textCenter(ctx, subtitle, cx, y, 'rgba(232,224,208,0.7)', R.fonts.md);
        y += 36;
        // Primary CTA
        const btn = UI.MagneticBtn(cx - 100, y, 200, 48, ctaLabel);
        btn.onClick = ctaAction;
        btn.setTrailingIcon('arrow-right');
        btn.render(ctx);
      }
    };
  };

  // Scroll Reveal Stagger - for entry animations
  Scene.ScrollReveal = function() {
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
        ctx.restore();
      }
    };
  };

  // Fluid Island Nav Morph
  Scene.FluidNav = function() {
    const navItems = [
      { text: 'Map', scene: 'travelMap', icon: '▶' },
      { text: 'Party', scene: 'party', icon: '☺' },
      { text: 'Shop', scene: 'bazaar', icon: '⚙' },
      { text: 'Rest', scene: '', icon: '♪' },
      { text: 'More', scene: '_more', icon: '≡' }
    ];
    
    let expanded = false;
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
          const pillW = 280, pillH = 44;
          const x = G.W/2 - pillW/2, y = G.H - pillH - 12;
          R.roundRect(ctx, x, y, pillW, pillH, 22, 'rgba(26,26,48,0.9)');
          ctx.strokeStyle = 'rgba(232,160,48,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x+0.5, y+0.5, pillW-1, pillH-1);
          navItems.forEach((item, i) => {
            const ix = x + pillW/5 * i + pillW/10;
            R.textCenter(ctx, item.icon, ix, y + 28, R.colors.textDim, R.fonts.lg);
            R.textCenter(ctx, item.text, ix, y + 40, R.colors.textDim, R.fonts.xs);
          });
          const hx = x + pillW - 36, hy = y + 8;
          const lineW = 20;
          ctx.strokeStyle = R.colors.gold;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.save();
          ctx.translate(hx + lineW/2, hy + 6);
          ctx.rotate(spring.rotation * Math.PI/180);
          ctx.beginPath(); ctx.moveTo(-lineW/2, 0); ctx.lineTo(lineW/2, 0); ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.translate(hx + lineW/2, hy + 14);
          ctx.rotate(-spring.rotation * Math.PI/180);
          ctx.beginPath(); ctx.moveTo(-lineW/2, 0); ctx.lineTo(lineW/2, 0); ctx.stroke();
          ctx.restore();
          if (!expanded) {
            ctx.beginPath(); ctx.moveTo(hx, hy + 22); ctx.lineTo(hx + lineW, hy + 22); ctx.stroke();
          }
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.85)';
          ctx.fillRect(0, 0, G.W, G.H);
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
  Scene.EmptyState = function(opts) {
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

})();
