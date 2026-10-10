// NarrativeEchoes — maps encounter choice flags to region-specific visual markers and descriptions.
// Read by the region map (Plan 02) to render echo markers on the world map.

const NarrativeEchoes = (function() {
  'use strict';

  /**
   * Returns all echo markers for a given region ID.
   * Only markers matching currently resolved encounter flags are returned.
   * Each result carries a `companion` witness string (or null) naming the
   * oath-bound companion for the region — derived at read time via
   * LivingZones (Phase 28, ZON-02); source entries are never mutated.
   * @param {string} regionId
   * @returns {Array} array of { marker, label, desc, flagKey, value, companion } objects
   */
  function getForRegion(regionId) {
    if (!regionId || !NARRATIVE_ECHOES) return [];
    const flags = G.state.flags || {};
    return NARRATIVE_ECHOES.filter(function(echo) {
      if (echo.region !== regionId) return false;
      var flagValue = flags[echo.flagKey];
      return typeof flagValue === 'string' && flagValue === echo.value;
    }).map(withWitness);
  }

  /**
   * Returns all echo markers that are currently active across every region.
   * @returns {Array} array of active { marker, label, desc, region, flagKey, value, companion } objects
   */
  function getActive() {
    if (!NARRATIVE_ECHOES) return [];
    const flags = G.state.flags || {};
    return NARRATIVE_ECHOES.filter(function(echo) {
      var flagValue = flags[echo.flagKey];
      return typeof flagValue === 'string' && flagValue === echo.value;
    }).map(withWitness);
  }

  /**
   * Shallow-copy an echo with its oath-companion witness (null when none).
   * Never mutates the NARRATIVE_ECHOES source entry.
   */
  function withWitness(echo) {
    var witness = null;
    try {
      if (typeof LivingZones !== 'undefined' && LivingZones && typeof LivingZones.echoWitness === 'function') {
        witness = LivingZones.echoWitness(echo.region);
      } else if (typeof globalThis !== 'undefined' && globalThis.LivingZones && typeof globalThis.LivingZones.echoWitness === 'function') {
        witness = globalThis.LivingZones.echoWitness(echo.region);
      }
      if (typeof witness !== 'string') witness = null;
    } catch (e) {
      witness = null;
    }
    return {
      marker: echo.marker,
      label: echo.label,
      desc: echo.desc,
      region: echo.region,
      flagKey: echo.flagKey,
      value: echo.value,
      markerColor: echo.markerColor,
      companion: witness
    };
  }

  /**
   * Returns true if the given encounter has been resolved (flag is set).
   * @param {string} encounterId
   * @returns {boolean}
   */
  function isEchoed(encounterId) {
    if (!encounterId) return false;
    var flags = G.state.flags || {};
    return typeof flags['enc_' + encounterId] === 'string';
  }

  return {
    getForRegion: getForRegion,
    getActive: getActive,
    isEchoed: isEchoed
  };
})();
