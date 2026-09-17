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
    newlyDiscovered: [],
    backBtn: null,
    enterBtn: null,
    closeBtn: null
  },

  enter: function() {
    Hints.show('map', 'Tap a region to inspect it. Drag to pan.');
    this.resetState();
    this.buildButtons();
    this.checkLandmarkDiscoveries();
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
    this.data.newlyDiscovered = [];
    this.data.backBtn = null;
    this.data.enterBtn = null;
    this.data.closeBtn = null;
  },

  buildButtons: function() {
    const backBtn = UI.MagneticBtn(16, G.CONTENT_TOP + 8, 92, 40, '\u2190 Back', {
      variant: 'ghost'
    });
    backBtn.onClick = function() {
      gScene.pop();
    };

    const enterBtn = UI.MagneticBtn(110, G.H - 64, 180, 44, 'Enter Zone', {
      variant: 'primary'
    });
    enterBtn.visible = false;
    enterBtn.onClick = () => {
      const zoneId = this.data.selectedZone;
      if (!zoneId || MapHelpers.getStatus(zoneId) === MapLayout.ZONE_STATE.LOCKED) {
        return false;
      }
      G.state.currentZone = zoneId;
      gScene.push('zoneExploration');
      return true;
    };

    const closeBtn = UI.MagneticBtn(G.W - 58, G.H - 244, 42, 38, '\u00d7', {
      variant: 'ghost'
    });
    closeBtn.visible = false;
    closeBtn.onClick = () => {
      if (this.data.selectedLandmark) {
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
    const viewport = this.getMapViewport();
    const padding = GRID_PADDING;
    const scale = (G.W - padding * 2) / GRID_SIZE;
    return { viewport, padding, scale };
  },

  getRegionRect: function(entry) {
    const metrics = this.getMapMetrics();
    return {
      x: metrics.padding + entry.x * GRID_SIZE * metrics.scale + this.data.mapX,
      y: metrics.viewport.y + metrics.padding + entry.y * GRID_SIZE * metrics.scale + this.data.mapY,
      w: entry.w * GRID_SIZE * metrics.scale,
      h: entry.h * GRID_SIZE * metrics.scale
    };
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
    const landmarkId = this.hitTestLandmark(tap.x, tap.y);
    if (landmarkId) {
      this.data.selectedLandmark = landmarkId;
      return true;
    }
    const zoneId = this.hitTestZone(tap.x, tap.y);
    this.selectZone(zoneId);
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
    ctx.fillStyle = R.colors.bg;
    ctx.fillRect(0, 0, G.W, G.H);
    this.renderHeader(ctx);
    this.renderMap(ctx);
    if (this.data.selectedLandmark) this.renderLandmarkDetail(ctx);
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
    for (const entry of MapLayout.ENTRIES) this.renderRegion(ctx, entry);
    ctx.restore();
  },

  renderMapTexture: function(ctx, viewport) {
    const reduced = R.reducedMotion ? R.reducedMotion() : false;
    const drift = reduced ? 0 : (performance.now() / 7000) % 24;
    ctx.strokeStyle = R.colors.borderHairline;
    ctx.lineWidth = 1;
    for (let x = -24 + drift; x < viewport.w + 24; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, viewport.y);
      ctx.lineTo(x, G.H);
      ctx.stroke();
    }
    for (let y = viewport.y - 24 + drift; y < G.H + 24; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(G.W, y);
      ctx.stroke();
    }
  },

  renderConnections: function(ctx) {
    ctx.save();
    ctx.strokeStyle = R.colors.borderFocus;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]);
    for (const entry of MapLayout.ENTRIES) {
      const from = this.getRegionRect(entry);
      for (const targetId of entry.connections || []) {
        const target = MapLayout.getEntry(targetId);
        if (!target) continue;
        const to = this.getRegionRect(target);
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
    ctx.restore();
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
    const descriptionLines = this.wrapText(ctx, landmark.description, w - 36).slice(0, 3);
    for (let i = 0; i < descriptionLines.length; i++) {
      ctx.fillText(descriptionLines[i], x + 18, y + 70 + i * 18);
    }

    const relevanceY = y + 130;
    ctx.fillStyle = R.colors.gold;
    ctx.font = R.fonts.xs;
    ctx.fillText('REGIONAL RELEVANCE', x + 18, relevanceY);
    ctx.fillStyle = R.colors.textSecondary;
    ctx.font = R.fonts.sm;
    const relevanceLines = this.wrapText(ctx, landmark.relevance, w - 36).slice(0, 2);
    for (let i = 0; i < relevanceLines.length; i++) {
      ctx.fillText(relevanceLines[i], x + 18, relevanceY + 20 + i * 18);
    }

    if (landmark.action && landmark.action.label) {
      ctx.fillStyle = R.colors.goldLight;
      ctx.font = R.fonts.xs;
      ctx.fillText(landmark.action.label, x + 18, y + h - 18);
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
