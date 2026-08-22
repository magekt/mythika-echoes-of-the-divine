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
    if (b.enabled === false || b.visible === false || !b.contains) continue;
    if (b.contains(tap.x, tap.y - oy)) {
      Input.getTap();
      // Per-button cooldown: a queued tap landing on a button that already
      // fired within 120ms is absorbed without re-firing (stops double
      // Continue transitions and double purchases from tap backlogs).
      const now = performance.now();
      if (b._lastFire && now - b._lastFire < 120) {
        b._pressed = true;
        b._pressTimer = 0.12;
        return true;
      }
      b._lastFire = now;
      b._pressed = true;
      b._pressTimer = 0.12;
      Audio.click();
      if (b.onClick) b.onClick(b.data);
      return true;
    }
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
