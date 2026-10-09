// import dependency: map_layout.js is loaded before this scene by index.html.
const TAP_THRESHOLD = 15;
const GRID_SIZE = 100;
const GRID_PADDING = 8;
const REGION_H = 20;

const travelMapScene = Scene.create({
  name: 'travelMap',

  data: {
    buttons: [],
    selectedZone: null,
    scrollY: 0,
    contentHeight: 0,
    mapX: 0,
    mapY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    startMapX: 0,
    startMapY: 0,
    didDrag: false,
    selectedLandmark: null,
    selectedEvent: null,
    newlyDiscovered: [],
    backBtn: null,
    enterBtn: null,
    closeBtn: null,
    _eventResolveArea: null,
    _cachedMetrics: null,
    _cachedRects: null,
    _descCache: null,
    _gridCanvas: null,
    _gridCanvasKey: null,
    _bgAlpha: 0,
    _regionBgKeys: []
  },

  enter: function() {
    this.data.layout = (typeof Scene.responsive === 'function') ? Scene.responsive() : {};
    Hints.show('map', 'Tap a region to inspect it. Drag to pan.');
    this.resetState();
    this.buildButtons();
    this.checkLandmarkDiscoveries();
    this.data._bgAlpha = 0;
    // Register background slots for all map regions
    this.data._regionBgKeys = [];
    for (const entry of MapLayout.ENTRIES) {
      const region = (typeof MapHelpers.getRegion === 'function') ? MapHelpers.getRegion(entry.zoneId) : null;
      if (region) {
        const key = 'map:' + region.toLowerCase();
        R.Backgrounds.registerSlot(key);
        this.data._regionBgKeys.push({ zoneId: entry.zoneId, key: key });
      }
    }
  },

  leave: function() {
    this.resetState();
  },

  resetState: function() {
    this.data.buttons = [];
    this.data.selectedZone = null;
    this.data.scrollY = 0;
    this.data.contentHeight = 0;
    this.data.mapX = 0;
    this.data.mapY = 0;
    this.data.isDragging = false;
    this.data.startX = 0;
    this.data.startY = 0;
    this.data.startMapX = 0;
    this.data.startMapY = 0;
    this.data.didDrag = false;
    this.data.selectedLandmark = null;
    this.data.selectedEvent = null;
    this.data.newlyDiscovered = [];
    this.data.backBtn = null;
    this.data.enterBtn = null;
    this.data.closeBtn = null;
    this.data._eventResolveArea = null;
    this.data._cachedMetrics = null;
    this.data._cachedRects = null;
    this.data._descCache = null;
  },

  buildButtons: function() {
    const backBtn = UI.MagneticBtn(16, G.CONTENT_TOP + 8, 92, 40, '\u2190 Back', {
      variant: 'ghost'
    });
    backBtn.onClick = function() {
      Scene.navigate('ashram', { fade: true, enterOptions: { restoreScroll: true } });
    };

    const enterBtn = UI.MagneticBtn(110, G.H - 64, 180, 44, 'Enter Zone', {
      variant: 'primary'
    });
    enterBtn.visible = false;
    enterBtn.onClick = () => {
      if (this.data.selectedEvent) {
        const evt = this._findEventById(this.data.selectedEvent);
        if (evt && evt.status === 'active') {
          const result = WorldEvents.resolve(this.data.selectedEvent);
          if (result) {
            const reward = evt.resolveReward || {};
            const parts = [];
            if (reward.gold) parts.push('+' + reward.gold + 'g');
            if (reward.karma) parts.push('+' + reward.karma + ' karma');
            if (reward.divineFragments) parts.push('+' + reward.divineFragments + ' DF');
            Notify.show('Event resolved: ' + (parts.length ? parts.join(', ') : 'Rewards claimed'), 3, R.colors.gold);
            if (typeof UI !== 'undefined' && UI.Feedback) UI.Feedback.Toast('Event resolved: ' + (parts.length ? parts.join(', ') : 'Rewards claimed'), { color: R.colors.gold, icon: '✓' });
          }
          this.data.selectedEvent = null;
        }
        return true;
      }
      const zoneId = this.data.selectedZone;
      if (!zoneId || MapHelpers.getStatus(zoneId) === MapLayout.ZONE_STATE.LOCKED) {
        if (zoneId && typeof UI !== 'undefined' && UI.Feedback) UI.Feedback.Toast(MapHelpers.getLockReason(zoneId) || 'Zone locked.', { color: R.colors.danger, icon: '🔒' });
        return false;
      }
      G.state.currentZone = zoneId;
      Scene.navigate('zoneExploration', { fade: true });
      return true;
    };

    const closeBtn = UI.MagneticBtn(G.W - 58, G.H - 244, 42, 38, '\u00d7', {
      variant: 'ghost'
    });
    closeBtn.visible = false;
    closeBtn.onClick = () => {
      if (this.data.selectedEvent) {
        this.data.selectedEvent = null;
      } else if (this.data.selectedLandmark) {
        this.data.selectedLandmark = null;
      } else {
        this.selectZone(null);
      }
    };

    this.data.backBtn = backBtn;
    this.data.enterBtn = enterBtn;
    this.data.closeBtn = closeBtn;
    this.data.buttons = [backBtn, enterBtn, closeBtn];
  },

  checkLandmarkDiscoveries: function() {
    const progress = G.state.zoneProgress || {};
    const discovered = [];
    for (const zoneId of Object.keys(ZONES)) {
      if ((Number(progress[zoneId]) || 0) <= 0) continue;
      const newly = Landmarks.checkZone(zoneId);
      for (const landmarkId of newly) {
        discovered.push(landmarkId);
        if (!WorldState.markLandmarkNotified(landmarkId)) continue;
        const landmark = LANDMARKS[landmarkId];
        Notify.show('Discovered: ' + (landmark ? landmark.name : landmarkId), 3, R.colors.gold);
        if (typeof UI !== 'undefined' && UI.Feedback) UI.Feedback.Toast('Discovered: ' + (landmark ? landmark.name : landmarkId), { color: R.colors.gold, icon: '★' });
      }
    }
    this.data.newlyDiscovered = discovered;
  },

  getMapViewport: function() {
    return {
      x: 0,
      y: G.CONTENT_TOP + 56,
      w: G.W,
      h: G.H - G.CONTENT_TOP - 64
    };
  },

  getMapMetrics: function() {
    if (this.data._cachedMetrics) return this.data._cachedMetrics;
    const viewport = this.getMapViewport();
    const padding = GRID_PADDING;
    const scale = (G.W - padding * 2) / GRID_SIZE;
    return { viewport, padding, scale };
  },

  getRegionRect: function(entry) {
    if (this.data._cachedRects && this.data._cachedRects.has(entry.zoneId)) {
      return this.data._cachedRects.get(entry.zoneId);
    }
    const metrics = this.getMapMetrics();
    return {
      x: metrics.padding + entry.x * GRID_SIZE * metrics.scale + this.data.mapX,
      y: metrics.viewport.y + metrics.padding + entry.y * GRID_SIZE * metrics.scale + this.data.mapY,
      w: entry.w * GRID_SIZE * metrics.scale,
      h: entry.h * GRID_SIZE * metrics.scale
    };
  },

  _intersectsViewport: function(rect, viewport) {
    return rect.x + rect.w > viewport.x && rect.x < viewport.x + viewport.w &&
           rect.y + rect.h > viewport.y && rect.y < viewport.y + viewport.h;
  },

  getPointer: function() {
    if (Input._touchStart && Input._touchCurrent) return Input._touchCurrent;
    if (Input._pressPos) return Input._pressPos;
    return null;
  },

  isInMapArea: function(x, y) {
    const viewport = this.getMapViewport();
    const detailTop = this.data.selectedZone ? G.H - 252 : G.H;
    return x >= viewport.x && x <= viewport.x + viewport.w &&
      y >= viewport.y && y <= Math.min(viewport.y + viewport.h, detailTop);
  },

  clampPan: function() {
    const metrics = this.getMapMetrics();
    const entries = MapLayout.ENTRIES;
    if (!entries.length) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const entry of entries) {
      const left = metrics.padding + entry.x * GRID_SIZE * metrics.scale;
      const top = metrics.viewport.y + metrics.padding + entry.y * GRID_SIZE * metrics.scale;
      const right = left + entry.w * GRID_SIZE * metrics.scale;
      const bottom = top + Math.max(entry.h * GRID_SIZE, REGION_H) * metrics.scale;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    }

    const margin = 26;
    const detailTop = this.data.selectedZone ? G.H - 252 : G.H - 8;
    const minPanX = Math.min(0, G.W - margin - maxX);
    const maxPanX = Math.max(0, margin - minX);
    const minPanY = Math.min(0, detailTop - margin - maxY);
    const maxPanY = Math.max(0, metrics.viewport.y + margin - minY);
    this.data.mapX = Math.max(minPanX, Math.min(maxPanX, this.data.mapX));
    this.data.mapY = Math.max(minPanY, Math.min(maxPanY, this.data.mapY));
  },

  selectZone: function(zoneId) {
    this.data.selectedZone = zoneId;
    this.data.selectedLandmark = null;
    this.data.selectedEvent = null;
    const hasSelection = Boolean(zoneId);
    const unlocked = hasSelection && MapHelpers.getStatus(zoneId) !== MapLayout.ZONE_STATE.LOCKED;
    if (this.data.closeBtn) this.data.closeBtn.visible = hasSelection;
    if (this.data.enterBtn) {
      this.data.enterBtn.visible = Boolean(unlocked);
      this.data.enterBtn.enabled = Boolean(unlocked);
    }
    this.clampPan();
  },

  getLandmarkHitAreas: function(zoneId) {
    const entry = MapLayout.getEntry(zoneId);
    if (!entry) return [];
    const rect = this.getRegionRect(entry);
    const landmarks = Landmarks.getAll(zoneId);
    const discoveredIds = Landmarks.getDiscovered(zoneId);
    const gap = 24;
    const startX = rect.x + rect.w - 14 - Math.max(0, landmarks.length - 1) * gap;
    const centerY = rect.y + 19;
    const areas = [];

    for (let i = 0; i < landmarks.length; i++) {
      if (discoveredIds.indexOf(landmarks[i].id) === -1) continue;
      areas.push({
        landmarkId: landmarks[i].id,
        x: startX + i * gap - 11,
        y: centerY - 11,
        w: 22,
        h: 22
      });
    }
    return areas;
  },

  hitTestLandmark: function(x, y) {
    if (!this.data.selectedZone) return null;
    const areas = this.getLandmarkHitAreas(this.data.selectedZone);
    for (const area of areas) {
      if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
        return area.landmarkId;
      }
    }
    return null;
  },

  getEventHitAreas: function(zoneId) {
    const entry = MapLayout.getEntry(zoneId);
    if (!entry) return [];
    if (!MapHelpers.getWorldEvents) return [];
    const rect = this.getRegionRect(entry);
    const events = MapHelpers.getWorldEvents(zoneId);
    if (!events.length) return [];
    const baseX = rect.x + 10;
    const baseY = rect.y + rect.h - 14;
    const gap = 16;
    const areas = [];

    for (let i = 0; i < events.length; i++) {
      areas.push({
        eventId: events[i].id,
        x: baseX + i * gap - 7,
        y: baseY - 7,
        w: 14,
        h: 14
      });
    }
    return areas;
  },

  hitTestEvent: function(x, y) {
    if (!this.data.selectedZone) return null;
    const areas = this.getEventHitAreas(this.data.selectedZone);
    for (const area of areas) {
      if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
        return area.eventId;
      }
    }
    return null;
  },

  hitTestZone: function(x, y) {
    for (let i = MapLayout.ENTRIES.length - 1; i >= 0; i--) {
      const entry = MapLayout.ENTRIES[i];
      const rect = this.getRegionRect(entry);
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
        return entry.zoneId;
      }
    }
    return null;
  },

  handleTap: function(tap) {
    if (!tap || !this.isInMapArea(tap.x, tap.y)) return false;
    const eventId = this.hitTestEvent(tap.x, tap.y);
    if (eventId) {
      this.data.selectedEvent = eventId;
      this.data.selectedLandmark = null;
      if (this.data.closeBtn) this.data.closeBtn.visible = true;
      if (this.data.enterBtn) {
        this.data.enterBtn.visible = true;
        this.data.enterBtn.text = 'Resolve';
      }
      return true;
    }
    const landmarkId = this.hitTestLandmark(tap.x, tap.y);
    if (landmarkId) {
      this.data.selectedLandmark = landmarkId;
      this.data.selectedEvent = null;
      return true;
    }
    const zoneId = this.hitTestZone(tap.x, tap.y);
    this.selectZone(zoneId);
    this.data.selectedEvent = null;
    return true;
  },

  update: function(dt) {
    if (UI.Modal.active) {
      UI.Modal.handleInput();
      return;
    }

    UI.updateButtons(this.data.buttons, dt);
    if (UI.handleButtons(this.data.buttons)) return;

    const pointer = this.getPointer();
    if (pointer && !this.data.isDragging && this.isInMapArea(pointer.x, pointer.y)) {
      this.data.isDragging = true;
      this.data.startX = pointer.x;
      this.data.startY = pointer.y;
      this.data.startMapX = this.data.mapX;
      this.data.startMapY = this.data.mapY;
      this.data.didDrag = false;
    }

    if (pointer && this.data.isDragging) {
      const dx = pointer.x - this.data.startX;
      const dy = pointer.y - this.data.startY;
      if (Math.hypot(dx, dy) >= TAP_THRESHOLD) this.data.didDrag = true;
      if (this.data.didDrag) {
        this.data.mapX = this.data.startMapX + dx;
        this.data.mapY = this.data.startMapY + dy;
        this.clampPan();
        // A drag must never replay a queued zone tap after release.
        Input.getTap();
      }
    } else if (this.data.isDragging) {
      this.data.isDragging = false;
      this.data.didDrag = false;
    }

    const tap = Input.peekTap();
    if (tap) {
      Input.getTap();
      this.handleTap(tap);
    }
  },

  render: function(ctx) {
    // Render background first (behind everything)
    const bgAlpha = this.data._bgAlpha < 1 ? Math.min(1, this.data._bgAlpha + (G.dt || 0.016) * 2) : 1;
    this.data._bgAlpha = bgAlpha;
    
    // Render region backgrounds behind markers
    for (const entry of MapLayout.ENTRIES) {
      const region = (typeof MapHelpers.getRegion === 'function') ? MapHelpers.getRegion(entry.zoneId) : null;
      if (region) {
        const key = 'map:' + region.toLowerCase();
        const regionEntry = this.data._regionBgKeys.find(r => r.zoneId === entry.zoneId);
        if (regionEntry) {
          const rect = this.getRegionRect(entry);
          ctx.save();
          ctx.globalAlpha = bgAlpha;
          ctx.globalCompositeOperation = 'destination-over';
          const bg = R.Backgrounds.get(key);
          if (bg.fallback) {
            ctx.drawImage(bg.fallback, rect.x, rect.y, rect.w, rect.h);
          }
          ctx.restore();
        }
      }
    }

    ctx.fillStyle = R.colors.bg;
    ctx.fillRect(0, 0, G.W, G.H);
    // Compute and cache per-frame metrics and region rects once
    this.data._cachedMetrics = this.getMapMetrics();
    this.data._cachedRects = new Map();
    const m = this.data._cachedMetrics;
    for (const entry of MapLayout.ENTRIES) {
      this.data._cachedRects.set(entry.zoneId, {
        x: m.padding + entry.x * GRID_SIZE * m.scale + this.data.mapX,
        y: m.viewport.y + m.padding + entry.y * GRID_SIZE * m.scale + this.data.mapY,
        w: entry.w * GRID_SIZE * m.scale,
        h: entry.h * GRID_SIZE * m.scale
      });
    }
    this.renderHeader(ctx);
    this.renderMap(ctx);
    if (this.data.selectedEvent) this.renderEventDetail(ctx);
    else if (this.data.selectedLandmark) this.renderLandmarkDetail(ctx);
    else if (this.data.selectedZone) this.renderDetailPanel(ctx);
    for (const button of this.data.buttons) {
      if (button.visible !== false) button.render(ctx);
    }
  },

  renderHeader: function(ctx) {
    R.textCenter(ctx, 'REGION MAP', G.W / 2, G.CONTENT_TOP + 24, R.colors.textPrimary, R.fonts.lg);
    R.textCenter(ctx, 'Tap to inspect  \u2022  Drag to pan', G.W / 2, G.CONTENT_TOP + 44, R.colors.textSecondary, R.fonts.xs);
  },

  renderMap: function(ctx) {
    const metrics = this.getMapMetrics();
    const viewport = metrics.viewport;
    const detailTop = this.data.selectedZone ? G.H - 252 : G.H;

    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.w, Math.max(0, detailTop - viewport.y));
    ctx.clip();

    this.renderMapTexture(ctx, viewport);
    this.renderConnections(ctx);
    for (const entry of MapLayout.ENTRIES) {
      const rect = this.data._cachedRects ? this.data._cachedRects.get(entry.zoneId) : null;
      if (rect && !this._intersectsViewport(rect, viewport)) continue;
      this.renderRegion(ctx, entry);
    }
    ctx.restore();
  },

  _buildGridCanvas: function() {
    if (typeof document === 'undefined') return;
    const key = G.W + 'x' + G.H;
    if (this.data._gridCanvas && this.data._gridCanvasKey === key) return;
    const c = document.createElement('canvas');
    c.width = G.W + 48;
    c.height = G.H + 48;
    const gctx = c.getContext('2d');
    gctx.strokeStyle = R.colors.borderHairline;
    gctx.lineWidth = 1;
    for (let x = 0; x < c.width; x += 24) {
      gctx.beginPath();
      gctx.moveTo(x, 0);
      gctx.lineTo(x, c.height);
      gctx.stroke();
    }
    for (let y = 0; y < c.height; y += 24) {
      gctx.beginPath();
      gctx.moveTo(0, y);
      gctx.lineTo(c.width, y);
      gctx.stroke();
    }
    this.data._gridCanvas = c;
    this.data._gridCanvasKey = key;
  },

  renderMapTexture: function(ctx, viewport) {
    this._buildGridCanvas();
    const reduced = R.reducedMotion ? R.reducedMotion() : false;
    const drift = reduced ? 0 : (performance.now() / 7000) % 24;
    ctx.drawImage(this.data._gridCanvas, -24 + drift, viewport.y - 24);
  },

  renderConnections: function(ctx) {
    const viewport = this.data._cachedMetrics ? this.data._cachedMetrics.viewport : this.getMapViewport();
    ctx.save();
    ctx.strokeStyle = R.colors.borderFocus;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    for (const entry of MapLayout.ENTRIES) {
      const from = this.getRegionRect(entry);
      if (!this._intersectsViewport(from, viewport)) continue;
      for (const targetId of entry.connections || []) {
        const target = MapLayout.getEntry(targetId);
        if (!target) continue;
        const to = this.getRegionRect(target);
        if (!this._intersectsViewport(to, viewport)) continue;
        ctx.beginPath();
        ctx.moveTo(from.x + from.w / 2, from.y + from.h);
        ctx.lineTo(to.x + to.w / 2, to.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  renderRegion: function(ctx, entry) {
    const rect = this.getRegionRect(entry);
    const status = MapHelpers.getStatus(entry.zoneId);
    const completion = MapHelpers.getCompletion(entry.zoneId);
    const statusColor = MapHelpers.getStatusColor(status);
    const selected = this.data.selectedZone === entry.zoneId;
    const locked = status === MapLayout.ZONE_STATE.LOCKED;

    ctx.save();
    if (locked) ctx.globalAlpha = 0.58;
    R.roundRect(ctx, rect.x, rect.y, rect.w, rect.h, R.radius.l, entry.color);
    ctx.fillStyle = locked ? R.colors.overlayMedium : R.colors.overlayMuted;
    R.roundRect(ctx, rect.x, rect.y, rect.w, rect.h, R.radius.l, ctx.fillStyle);
    ctx.strokeStyle = selected ? R.colors.goldLight : statusColor;
    ctx.lineWidth = selected ? 3 : 2;
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);

    const icon = locked ? '\u25c7' : (status === MapLayout.ZONE_STATE.COMPLETED ? '\u2713' : '\u25cf');
    ctx.textAlign = 'left';
    ctx.font = R.fonts.sm;
    ctx.fillStyle = entry.textColor || R.colors.textPrimary;
    ctx.fillText(icon + ' ' + entry.name, rect.x + 10, rect.y + 19);
    ctx.font = R.fonts.xs;
    ctx.fillStyle = locked ? R.colors.textSecondary : statusColor;
    ctx.fillText(locked ? 'LOCKED' : status.toUpperCase() + '  ' + completion + '%', rect.x + 10, rect.y + rect.h - 10);

    if (!locked) {
      const barX = rect.x + 10;
      const barY = rect.y + rect.h - 6;
      const barW = rect.w - 20;
      R.roundRect(ctx, barX, barY, barW, 3, R.colors.overlayDark);
      if (completion > 0) R.roundRect(ctx, barX, barY, barW * completion / 100, 3, statusColor);
    }

    this.renderLandmarkIndicators(ctx, entry, rect, locked);
    this.renderEchoIndicators(ctx, entry, rect, locked);
    this.renderEventIndicators(ctx, entry, rect, locked);
    ctx.restore();
  },

  renderEchoIndicators: function(ctx, entry, rect, locked) {
    if (locked) return;
    const echoes = MapHelpers.getNarrativeEchoes(entry.zoneId);
    if (!echoes.length) return;
    const reduced = R.reducedMotion ? R.reducedMotion() : false;
    const baseX = rect.x + 10;
    const baseY = rect.y + rect.h - 28;
    const gap = 16;

    for (let i = 0; i < echoes.length; i++) {
      const echo = echoes[i];
      const color = echo.markerColor || R.colors.textDim;
      const cx = baseX + i * gap;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, baseY, 4, 0, Math.PI * 2);
      ctx.fill();
      if (reduced) continue;
      ctx.fillStyle = R.colors.textPrimary;
      ctx.font = R.fonts.xs;
      ctx.textAlign = 'left';
      ctx.fillText(echo.label, cx + 7, baseY + 3);
    }
  },

  renderEventIndicators: function(ctx, entry, rect, locked) {
    if (locked) return;
    if (!MapHelpers.getWorldEvents) return;
    const events = MapHelpers.getWorldEvents(entry.zoneId);
    if (!events.length) return;
    const reduced = R.reducedMotion ? R.reducedMotion() : false;
    const baseX = rect.x + 10;
    const baseY = rect.y + rect.h - 14;
    const gap = 16;

    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      const color = evt.markerColor || R.colors.accent;
      const cx = baseX + i * gap;
      const isExpiring = evt.remainingTime < 300;
      const drawColor = isExpiring ? R.colors.danger : color;
      const radius = reduced ? 5 : 5 + Math.sin(performance.now() / 400 + i) * 1.5;

      ctx.fillStyle = drawColor;
      ctx.beginPath();
      ctx.arc(cx, baseY, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isExpiring) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, baseY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  renderLandmarkIndicators: function(ctx, entry, rect, locked) {
    const landmarks = Landmarks.getAll(entry.zoneId);
    if (!landmarks.length) return;
    const discoveredIds = Landmarks.getDiscovered(entry.zoneId);
    const gap = 24;
    const startX = rect.x + rect.w - 14 - Math.max(0, landmarks.length - 1) * gap;
    const centerY = rect.y + 19;

    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      const discovered = discoveredIds.indexOf(landmark.id) !== -1;
      const fresh = this.data.newlyDiscovered.indexOf(landmark.id) !== -1;
      ctx.beginPath();
      ctx.fillStyle = discovered ? (fresh ? R.colors.goldLight : R.colors.gold) : R.colors.textDim;
      ctx.arc(startX + i * gap, centerY, discovered ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
      if (locked || !discovered) continue;
      ctx.fillStyle = R.colors.textPrimary;
      ctx.font = R.fonts.xs;
      ctx.textAlign = 'center';
      ctx.fillText(landmark.icon, startX + i * gap, centerY + 4);
    }
  },

  wrapText: function(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? line + ' ' + word : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  },

  renderLandmarkDetail: function(ctx) {
    const landmark = LANDMARKS[this.data.selectedLandmark];
    if (!landmark) return;
    const x = 12;
    const y = G.H - 252;
    const w = G.W - 24;
    const h = 244;

    // Cache wrapText results keyed by landmark ID
    const cacheKey = 'landmark_' + this.data.selectedLandmark;
    if (!this.data._descCache || this.data._descCache.key !== cacheKey) {
      this.data._descCache = {
        key: cacheKey,
        descLines: this.wrapText(ctx, landmark.description, w - 36).slice(0, 3),
        relevanceLines: this.wrapText(ctx, landmark.relevance, w - 36).slice(0, 2)
      };
    }

    R.roundRect(ctx, x, y, w, h, R.radius.l, R.colors.surfaceElevated);
    ctx.strokeStyle = R.colors.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = R.colors.goldLight;
    ctx.font = R.fonts.xl || R.fonts.lg;
    ctx.fillText(landmark.icon, x + 18, y + 36);
    ctx.fillStyle = R.colors.textPrimary;
    ctx.font = R.fonts.lg;
    ctx.fillText(landmark.name, x + 58, y + 32);

    ctx.font = R.fonts.sm;
    ctx.fillStyle = R.colors.textSecondary;
    const descriptionLines = this.data._descCache.descLines;
    for (let i = 0; i < descriptionLines.length; i++) {
      ctx.fillText(descriptionLines[i], x + 18, y + 70 + i * 18);
    }

    const relevanceY = y + 130;
    ctx.fillStyle = R.colors.gold;
    ctx.font = R.fonts.xs;
    ctx.fillText('REGIONAL RELEVANCE', x + 18, relevanceY);
    ctx.fillStyle = R.colors.textSecondary;
    ctx.font = R.fonts.sm;
    const relevanceLines = this.data._descCache.relevanceLines;
    for (let i = 0; i < relevanceLines.length; i++) {
      ctx.fillText(relevanceLines[i], x + 18, relevanceY + 20 + i * 18);
    }

    if (landmark.action && landmark.action.label) {
      ctx.fillStyle = R.colors.goldLight;
      ctx.font = R.fonts.xs;
      ctx.fillText(landmark.action.label, x + 18, y + h - 18);
    }
  },

  formatRemainingTime: function(seconds) {
    if (seconds < 0) seconds = 0;
    if (seconds < 60) return '< 1 min';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
  },

  _findEventById: function(eventId) {
    const events = this.data.selectedZone ? MapHelpers.getWorldEvents(this.data.selectedZone) : [];
    for (const evt of events) {
      if (evt.id === eventId) return evt;
    }
    return null;
  },

  renderEventDetail: function(ctx) {
    const evt = this._findEventById(this.data.selectedEvent);
    if (!evt) return;
    const x = 12;
    const y = G.H - 252;
    const w = G.W - 24;
    const h = 244;

    // Cache wrapText results keyed by event ID
    const cacheKey = 'event_' + this.data.selectedEvent;
    if (!this.data._descCache || this.data._descCache.key !== cacheKey) {
      this.data._descCache = {
        key: cacheKey,
        descLines: this.wrapText(ctx, evt.desc, w - 36).slice(0, 3)
      };
    }

    R.roundRect(ctx, x, y, w, h, R.radius.l, R.colors.surfaceElevated);
    ctx.strokeStyle = evt.markerColor || R.colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = evt.markerColor || R.colors.textPrimary;
    ctx.font = R.fonts.xl || R.fonts.lg;
    ctx.fillText(evt.icon || '\u2733\uFE0F', x + 18, y + 36);
    ctx.fillStyle = R.colors.textPrimary;
    ctx.font = R.fonts.lg;
    ctx.fillText(evt.label, x + 58, y + 32);

    ctx.font = R.fonts.sm;
    ctx.fillStyle = R.colors.textSecondary;
    const descriptionLines = this.data._descCache.descLines;
    for (let i = 0; i < descriptionLines.length; i++) {
      ctx.fillText(descriptionLines[i], x + 18, y + 70 + i * 18);
    }

    const timeY = y + 140;
    if (evt.status === 'expired') {
      ctx.fillStyle = R.colors.textSecondary;
      ctx.font = R.fonts.sm;
      ctx.fillText(evt.expiryLabel || 'Event expired', x + 18, timeY);
    } else {
      ctx.fillStyle = R.colors.accent;
      ctx.font = R.fonts.xs;
      ctx.fillText('REMAINING', x + 18, timeY);
      ctx.fillStyle = R.colors.textPrimary;
      ctx.font = R.fonts.sm;
      ctx.fillText(this.formatRemainingTime(evt.remainingTime), x + 18, timeY + 18);
    }

    if (evt.status === 'active') {
      const btnX = x + 18;
      const btnY = y + h - 50;
      const btnW = w - 36;
      const btnH = 36;

      R.roundRect(ctx, btnX, btnY, btnW, btnH, R.radius.m, R.colors.goldDark);
      ctx.fillStyle = R.colors.white;
      ctx.font = R.fonts.sm;
      ctx.textAlign = 'center';
      ctx.fillText(evt.resolveLabel || 'Resolve', btnX + btnW / 2, btnY + 22);
      ctx.textAlign = 'left';

      this.data._eventResolveArea = { x: btnX, y: btnY, w: btnW, h: btnH };
    } else {
      this.data._eventResolveArea = null;
    }
  },

  renderDetailPanel: function(ctx) {
    const zoneId = this.data.selectedZone;
    const zone = ZONES[zoneId];
    if (!zone) return;

    const status = MapHelpers.getStatus(zoneId);
    const completion = MapHelpers.getCompletion(zoneId);
    const statusColor = MapHelpers.getStatusColor(status);
    const lockReason = MapHelpers.getLockReason(zoneId);
    const region = MapHelpers.getControlState(zoneId);
    const x = 12;
    const y = G.H - 252;
    const w = G.W - 24;
    const h = 244;

    R.roundRect(ctx, x, y, w, h, R.radius.l, R.colors.surfaceElevated);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = R.colors.textPrimary;
    ctx.font = R.fonts.lg;
    ctx.fillText(zone.name, x + 18, y + 31);
    ctx.fillStyle = statusColor;
    ctx.font = R.fonts.sm;
    ctx.fillText(status.toUpperCase(), x + 18, y + 54);

    const description = zone.desc || 'A region waiting to be explored.';
    ctx.fillStyle = R.colors.textSecondary;
    ctx.font = R.fonts.sm;
    ctx.fillText(description.length > 54 ? description.slice(0, 51) + '\u2026' : description, x + 18, y + 79);

    R.roundRect(ctx, x + 18, y + 94, w - 36, 8, R.radius.s, R.colors.overlayDark);
    if (completion > 0) R.roundRect(ctx, x + 18, y + 94, (w - 36) * completion / 100, 8, R.radius.s, statusColor);
    ctx.fillStyle = R.colors.textSecondary;
    ctx.font = R.fonts.xs;
    ctx.fillText('Exploration ' + completion + '%', x + 18, y + 120);

    const echoes = MapHelpers.getNarrativeEchoes(zoneId);
    if (echoes.length && !lockReason) {
      const echo = echoes[0];
      ctx.fillStyle = echo.markerColor || R.colors.goldLight;
      ctx.font = R.fonts.sm;
      ctx.fillText(echo.label, x + 18, y + 145);
      ctx.fillStyle = R.colors.textSecondary;
      ctx.font = R.fonts.xs;
      ctx.fillText((echo.desc || '').length > 50 ? echo.desc.slice(0, 47) + '\u2026' : echo.desc, x + 18, y + 160);
    }

    if (lockReason) {
      ctx.fillStyle = R.colors.warning;
      ctx.font = R.fonts.sm;
      ctx.fillText(lockReason, x + 18, y + 148);
    } else {
      ctx.fillStyle = R.colors.textSecondary;
      ctx.font = R.fonts.sm;
      ctx.fillText('Level range ' + zone.minLvl + '\u2013' + zone.maxLvl, x + 18, y + 148);
    }

    if (region) {
      const control = region.control || 'neutral';
      ctx.fillStyle = R.colors.textSecondary;
      ctx.font = R.fonts.xs;
      ctx.fillText('Influence: ' + Math.floor(region.value || 0) + '  \u2022  ' + control.toUpperCase(), x + 18, y + 171);
    }
  }
});
