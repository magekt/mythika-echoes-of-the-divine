// NarrativeEchoes — maps encounter choice flags to region-specific visual markers and descriptions.
// Read by the region map (Plan 02) to render echo markers on the world map.

const NarrativeEchoes = (function() {
  'use strict';

  /**
   * Returns all echo markers for a given region ID.
   * Only markers matching currently resolved encounter flags are returned.
   * @param {string} regionId
   * @returns {Array} array of { marker, label, desc, flagKey, value } objects
   */
  function getForRegion(regionId) {
    if (!regionId || !NARRATIVE_ECHOES) return [];
    const flags = G.state.flags || {};
    return NARRATIVE_ECHOES.filter(function(echo) {
      if (echo.region !== regionId) return false;
      var flagValue = flags[echo.flagKey];
      return typeof flagValue === 'string' && flagValue === echo.value;
    });
  }

  /**
   * Returns all echo markers that are currently active across every region.
   * @returns {Array} array of active { marker, label, desc, region, flagKey, value } objects
   */
  function getActive() {
    if (!NARRATIVE_ECHOES) return [];
    const flags = G.state.flags || {};
    return NARRATIVE_ECHOES.filter(function(echo) {
      var flagValue = flags[echo.flagKey];
      return typeof flagValue === 'string' && flagValue === echo.value;
    });
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
