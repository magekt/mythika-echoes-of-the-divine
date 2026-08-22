UI.Modal = {};

UI.Modal.active = null;
UI.Modal.queue = [];

UI.Modal.show = function(opts) {
  // Canvas fillText ignores "\n" — fold multi-line bodies into wrapped lines.
  let body = opts.body || '';
  let lines = opts.lines || [];
  if (body.indexOf('\n') !== -1) {
    lines = body.split('\n').concat(lines);
    body = '';
  }
  const m = {
    title: opts.title || '',
    body: body,
    lines: lines,
    buttons: opts.buttons || [{ label: 'OK', primary: true }],
    onResult: opts.onResult || null,
    x: opts.x || 40,
    y: opts.y || 200,
    w: opts.w || 320,
    h: opts.h || 200,
    visible: true,
    _buttonList: [],
    _buildButtons: function() {
      this._buttonList = [];
      const bw = Math.min(140, (this.w - 40) / Math.max(1, this.buttons.length));
      const totalW = this.buttons.length * bw + (this.buttons.length - 1) * 10;
      let bx = this.x + (this.w - totalW) / 2;
      const by = this.y + this.h - 44;
      for (let i = 0; i < this.buttons.length; i++) {
        const btnDef = this.buttons[i];
        const btn = UI.Button(bx, by, bw, 32, btnDef.label, btnDef.primary ? R.colors.btnGold : R.colors.btn);
        btn._modalResult = btnDef.value !== undefined ? btnDef.value : i;
        btn.onClick = function() {
          UI.Modal.dismiss(btn._modalResult);
        };
        this._buttonList.push(btn);
        bx += bw + 10;
      }
    }
  };
  m._buildButtons();
  m._openedAt = performance.now();
  UI.Modal.queue.push(m);
  if (!UI.Modal.active) UI.Modal.active = UI.Modal.queue.shift();
  return m;
};

UI.Modal.dismiss = function(result) {
  if (UI.Modal.active) {
    const cb = UI.Modal.active.onResult;
    UI.Modal.active.visible = false;
    UI.Modal.active = null;
    if (cb) cb(result);
  }
  if (UI.Modal.queue.length > 0) {
    UI.Modal.active = UI.Modal.queue.shift();
    UI.Modal.active._openedAt = performance.now();
  }
};

UI.Modal.handleInput = function() {
  if (!UI.Modal.active || !UI.Modal.active.visible) return false;
  return UI.handleButtons(UI.Modal.active._buttonList);
};

UI.Modal.render = function(ctx) {
  const m = UI.Modal.active;
  if (!m || !m.visible) return;
  // Enter: fade + scale 0.96->1 over 120ms (easeOutCubic) so dialogs arrive,
  // not flash. Skipped under Reduce Motion.
  let e = 1;
  if (!G.state.reduceMotion && m._openedAt) {
    const t = Math.min(1, (performance.now() - m._openedAt) / 120);
    e = 1 - Math.pow(1 - t, 3);
  }
  ctx.save();
  ctx.globalAlpha = e;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, G.W, G.H);
  const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
  const s = 0.96 + 0.04 * e;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  R.roundRect(ctx, m.x, m.y, m.w, m.h, R.radius.m, R.colors.panel);
  ctx.strokeStyle = R.colors.orange;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const r = R.radius.m, x = m.x, y = m.y, w = m.w, h = m.h;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
  R.textCenter(ctx, m.title, x + w / 2, y + 28, R.colors.orange, R.fonts.md);
  if (m.body) {
    R.textCenter(ctx, m.body, x + w / 2, y + 56, R.colors.text, R.fonts.sm);
  }
  let ly = y + 56;
  for (const line of m.lines) {
    ly += 18;
    R.textCenter(ctx, line, x + w / 2, ly, R.colors.textDim, R.fonts.sm);
  }
  for (const b of m._buttonList) {
    b.render(ctx);
  }
  ctx.restore();
};

UI.Modal.confirm = function(title, body, onConfirm) {
  return UI.Modal.show({
    title: title,
    body: body,
    buttons: [
      { label: 'Cancel', value: false },
      { label: 'Confirm', value: true, primary: true }
    ],
    onResult: function(result) { if (onConfirm) onConfirm(result); }
  });
};

UI.Modal.alert = function(title, body) {
  return UI.Modal.show({
    title: title,
    body: body,
    buttons: [{ label: 'OK', value: true, primary: true }]
  });
};
