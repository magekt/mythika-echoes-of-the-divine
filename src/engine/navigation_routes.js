/* Mythika navigation route registry (Phase 18).
 * Central registration keeps scene files untouched while giving every core
 * slice screen an explicit context/command contract. Scenes keep working
 * through legacy gScene() because Navigation.legacySceneMap resolves them.
 */
(function() {
  if (typeof Navigation === 'undefined' || !Navigation.register) return;

  var routes = {
    ashram: {
      scene: 'ashram',
      contextSchema: { partySummary: 'array', zoneStatus: 'object', realmProgress: 'object' },
      commandSchema: {
        startZone: 'ZoneAccess.enter',
        openParty: 'PartySystem.open',
        openEquipment: 'EquipmentSystem.open',
        openCultivation: 'CultivationSystem.open',
        openMap: 'MapHelpers.open',
        openSettings: 'SettingsSystem.open'
      }
    },
    travelMap: {
      scene: 'travelMap',
      contextSchema: { regionMap: 'object', worldEvents: 'array', landmarks: 'array', influence: 'object' },
      commandSchema: {
        enterZone: 'ZoneAccess.enter',
        openEvent: 'WorldEvents.open',
        openLandmark: 'Landmarks.open',
        returnToAshram: 'Navigation.go'
      }
    },
    zoneExploration: {
      scene: 'zoneExploration',
      contextSchema: { zoneDetail: 'object', journeys: 'array', encounters: 'array' },
      commandSchema: {
        startCombat: 'Combat.start',
        startJourney: 'JourneySystem.start',
        returnToMap: 'MapHelpers.open',
        openParty: 'PartySystem.open'
      }
    },
    combat: {
      scene: 'combatScene',
      contextSchema: { encounterSetup: 'object', partySurface: 'array', enemySurface: 'array' },
      commandSchema: {
        performAction: 'Combat.performAction',
        react: 'Combat.react',
        flee: 'Combat.flee',
        continueResult: 'Combat.continueResult'
      }
    },
    party: {
      scene: 'party',
      contextSchema: { partyDetail: 'object', heroSurface: 'object' },
      commandSchema: {
        equip: 'EquipmentSystem.equip',
        useItem: 'Economy.useItem',
        cultivate: 'CultivationSystem.addCultivationBase'
      }
    },
    equipment: {
      scene: 'equipment',
      contextSchema: { inventory: 'array', equipped: 'object', heroSurface: 'object' },
      commandSchema: {
        equip: 'EquipmentSystem.equip',
        unequip: 'EquipmentSystem.unequip',
        compare: 'EquipmentSystem.compare'
      }
    },
    cultivation: {
      scene: 'cultivationScene',
      contextSchema: { realmProgress: 'object', heroSurface: 'object', partySummary: 'array' },
      commandSchema: {
        meditate: 'CultivationSystem.meditate',
        breakthrough: 'CultivationSystem.breakthrough'
      }
    }
  };

  Object.keys(routes).forEach(function(routeId) {
    if (!Navigation.routeRegistry.has(routeId)) {
      Navigation.register(routeId, routes[routeId]);
    }
  });
})();
