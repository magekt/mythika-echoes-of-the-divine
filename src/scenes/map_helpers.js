const MapHelpers = {
  // Returns ZONE_STATE.LOCKED | ZONE_STATE.AVAILABLE | ZONE_STATE.ACTIVE | ZONE_STATE.COMPLETED
  getStatus(zoneId) {
    if (typeof ZoneAccess === 'undefined' || !ZoneAccess.status) {
      return 'locked';
    }
    const statusObj = ZoneAccess.status(zoneId);
    if (!statusObj) return 'locked';

    if (statusObj.complete || (typeof statusObj.percentage === 'number' && statusObj.percentage >= 100)) {
      return 'completed';
    }
    if (statusObj.allowed) {
      const pct = typeof statusObj.percentage === 'number' ? statusObj.percentage : 0;
      return pct > 0 ? 'active' : 'available';
    }
    return 'locked';
  },

  // Returns a human-readable reason string for locked zones, null otherwise
  // e.g. "Requires: Aryavarta (78%)" or "Level 5 required"
  getLockReason(zoneId) {
    const status = this.getStatus(zoneId);
    if (status !== 'locked') return null;

    const zones = (typeof ZONES !== 'undefined') ? ZONES : null;
    const zone = zones ? zones[zoneId] : null;

    if (typeof ZoneAccess !== 'undefined' && ZoneAccess.status) {
      const statusObj = ZoneAccess.status(zoneId);
      if (statusObj) {
        if (!statusObj.prerequisiteMet && zone && zone.reqZone) {
          const reqZoneObj = zones ? zones[zone.reqZone] : null;
          const reqName = reqZoneObj ? reqZoneObj.name : zone.reqZone;
          const progress = (typeof G !== 'undefined' && G.state && G.state.zoneProgress)
            ? (Number(G.state.zoneProgress[zone.reqZone]) || 0)
            : 0;
          return `Requires: ${reqName} (${Math.floor(progress)}%)`;
        }
        if (!statusObj.levelMet && zone && zone.reqLevel) {
          return `Level ${zone.reqLevel} required`;
        }
      }
    }

    if (zone && zone.reqZone) {
      const reqZoneObj = zones ? zones[zone.reqZone] : null;
      const reqName = reqZoneObj ? reqZoneObj.name : zone.reqZone;
      return `Requires: ${reqName}`;
    }
    if (zone && zone.reqLevel) {
      return `Level ${zone.reqLevel} required`;
    }
    return 'Locked';
  },

  // Returns completion percentage (0-100, integer) for display
  getCompletion(zoneId) {
    if (typeof ZoneAccess === 'undefined' || !ZoneAccess.status) {
      return 0;
    }
    const statusObj = ZoneAccess.status(zoneId);
    if (!statusObj || typeof statusObj.percentage !== 'number') return 0;
    return Math.min(100, Math.max(0, Math.floor(statusObj.percentage)));
  },

  // Returns visual color for a status given standard palette / R tokens
  getStatusColor(status) {
    const rColors = (typeof R !== 'undefined' && R.colors) ? R.colors : {};
    switch (status) {
      case 'completed':
        return rColors.success || '#4cd964';
      case 'active':
        return rColors.accent || '#e8a030';
      case 'available':
        return rColors.primary || '#3897f0';
      case 'locked':
      default:
        return rColors.muted || '#7f8c8d';
    }
  },

  // Returns true if WorldState.getRegion(zoneId) exists and has non-zero influence value
  hasInfluence(zoneId) {
    if (typeof WorldState === 'undefined' || typeof WorldState.getRegion !== 'function') {
      return false;
    }
    const region = WorldState.getRegion(zoneId);
    return Boolean(region && typeof region.value === 'number' && region.value !== 0);
  },

  // Returns the current influence control state ('neutral'|'player'|'enemy'|'contested')
  getControlState(zoneId) {
    if (typeof WorldState === 'undefined' || typeof WorldState.getRegion !== 'function') {
      return 'neutral';
    }
    const region = WorldState.getRegion(zoneId);
    return (region && typeof region.control === 'string') ? region.control : 'neutral';
  }
};

if (typeof window !== 'undefined') {
  window.MapHelpers = MapHelpers;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MapHelpers };
}
