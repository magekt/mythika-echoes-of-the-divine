const Input = {
  touches: [],
  clicks: [],
  keys: {},
  _tapQueue: [],
  _lastTap: 0,

  _touchStart: null,
  _touchStartTime: 0,
  _touchCurrent: null,
  _lastTouchY: null,
  _swipeThreshold: 40,
  _longPressThreshold: 500,
  _lastSwipe: null,
  _longPressActive: false,
  _pressPos: null
};

function initInput() {
  const c = G.canvas;

  c.addEventListener('mousedown', e => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) * (G.W / r.width);
    const y = (e.clientY - r.top) * (G.H / r.height);
    Input._pressPos = { x, y };
    Input._touchStartTime = Date.now();
  });

  c.addEventListener('mouseup', e => {
    if (Input._pressPos) {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) * (G.W / r.width);
      const y = (e.clientY - r.top) * (G.H / r.height);
      const dx = x - Input._pressPos.x;
      const dy = y - Input._pressPos.y;
      if (Math.abs(dx) > Input._swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        Input._lastSwipe = dx > 0 ? 'right' : 'left';
      } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        Input.clicks.push({ x: Input._pressPos.x, y: Input._pressPos.y, t: 'click' });
      }
    }
    Input._pressPos = null;
    Input._longPressActive = false;
  });

  c.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const r = c.getBoundingClientRect();
    const x = (t.clientX - r.left) * (G.W / r.width);
    const y = (t.clientY - r.top) * (G.H / r.height);
    Input._touchStart = { x, y };
    Input._touchStartTime = Date.now();
    Input._touchCurrent = { x, y };
    Input._lastTouchY = y;
    Input._longPressActive = false;
  }, { passive: false });

  c.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const r = c.getBoundingClientRect();
    const x = (t.clientX - r.left) * (G.W / r.width);
    const y = (t.clientY - r.top) * (G.H / r.height);
    if (Input._lastTouchY !== null) {
      const dy = y - Input._lastTouchY;
      Input._scrollDelta = (Input._scrollDelta || 0) - dy * 1.2;
    }
    Input._touchCurrent = { x, y };
    Input._lastTouchY = y;
  }, { passive: false });

  c.addEventListener('touchend', e => {
    e.preventDefault();
    if (Input._touchStart && Input._touchCurrent) {
      const dx = Input._touchCurrent.x - Input._touchStart.x;
      const dy = Input._touchCurrent.y - Input._touchStart.y;
      if (Math.abs(dx) > Input._swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        Input._lastSwipe = dx > 0 ? 'right' : 'left';
      } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        Input.touches.push({ x: Input._touchStart.x, y: Input._touchStart.y, id: Date.now(), t: 'touch' });
      }
      // remove consumed touch id if any were queued with same identifier
      if (e.changedTouches && e.changedTouches[0]) {
        const id = e.changedTouches[0].identifier;
        Input.touches = Input.touches.filter(t => t.id !== id || t.t === 'touch');
        // keep the newly pushed tap; filter only removes stale with same id that were from touchstart (we no longer push there)
      }
    }
    Input._touchStart = null;
    Input._touchStartTime = 0;
    Input._touchCurrent = null;
    Input._lastTouchY = null;
    Input._longPressActive = false;
  }, { passive: false });

  c.addEventListener('touchcancel', e => {
    e.preventDefault();
    Input._touchStart = null;
    Input._touchStartTime = 0;
    Input._touchCurrent = null;
    Input._lastTouchY = null;
    Input._longPressActive = false;
  }, { passive: false });

  c.addEventListener('wheel', e => {
    Input._scrollDelta = (Input._scrollDelta || 0) + e.deltaY;
  });

  document.addEventListener('keydown', e => { Input.keys[e.key] = true; });
  document.addEventListener('keyup', e => { Input.keys[e.key] = false; });
}

Input.peekTap = function() {
  if (Input.clicks.length > 0) return Input.clicks[0];
  if (Input.touches.length > 0) return Input.touches[0];
  return null;
};

Input.getTap = function() {
  if (Input.clicks.length > 0) return Input.clicks.shift();
  if (Input.touches.length > 0) return Input.touches.shift();
  return null;
};

Input.getSwipe = function() {
  const s = this._lastSwipe;
  this._lastSwipe = null;
  if (s) this.touches = [];
  return s;
};

Input.getScrollDelta = function() {
  const d = this._scrollDelta || 0;
  this._scrollDelta = 0;
  return d;
};

Input.isLongPressing = function() {
  if (this._touchStart && this._touchCurrent) {
    const elapsed = Date.now() - this._touchStartTime;
    const dx = Math.abs(this._touchCurrent.x - this._touchStart.x);
    const dy = Math.abs(this._touchCurrent.y - this._touchStart.y);
    if (elapsed > this._longPressThreshold && dx < 10 && dy < 10) {
      this._longPressActive = true;
      return true;
    }
  } else if (this._pressPos) {
    const elapsed = Date.now() - this._touchStartTime;
    if (elapsed > this._longPressThreshold) {
      this._longPressActive = true;
      return true;
    }
  }
  return false;
};

Input.getLongPressPos = function() {
  if (!this._longPressActive) return null;
  return this._touchStart || this._pressPos;
};

Input.clear = function() {
  Input.clicks = [];
  Input.touches = [];
  Input._touchStart = null;
  Input._touchStartTime = 0;
  Input._touchCurrent = null;
  Input._lastTouchY = null;
  Input._lastSwipe = null;
  Input._longPressActive = false;
  Input._scrollDelta = 0;
};
