const Navigation = (function() {
  const routeRegistry = new Map();
  const transitionState = { from: null, to: null, params: null, timestamp: 0 };

  const legacySceneMap = {
    'ashram': 'ashram',
    'travelMap': 'travelMap',
    'travelMapScene': 'travelMap',
    'zoneExploration': 'zoneExploration',
    'zoneExplorationScene': 'zoneExploration',
    'combat': 'combat',
    'combatScene': 'combat',
    'party': 'party',
    'partyScene': 'party',
    'equipment': 'equipment',
    'equipmentScene': 'equipment',
    'cultivation': 'cultivation',
    'cultivationScene': 'cultivation',
    'settings': 'settings',
    'settingsScene': 'settings',
    'ashramScene': 'ashram',
    'title': 'title',
    'characterCreate': 'characterCreate',
    'welcome': 'welcome',
    'authScene': 'authScene',
    'bazaar': 'bazaar',
    'forge': 'forge',
    'alchemyScene': 'alchemyScene',
    'spiritBeast': 'spiritBeast',
    'punarjanma': 'punarjanma',
    'farm': 'farm',
    'fishing': 'fishing',
    'tournament': 'tournament',
    'trials': 'trials',
    'questLog': 'questLog',
    'achievements': 'achievements',
    'achievementsScene': 'achievements',
    'debug': 'debug',
    'journeyScene': 'journeyScene',
    'encounterScene': 'encounterScene'
  };

  function register(routeId, config) {
    if (!routeId || !config || !config.scene) return;
    routeRegistry.set(routeId, {
      scene: config.scene,
      contextSchema: config.contextSchema || {},
      commandSchema: config.commandSchema || {}
    });
  }

  function getContext(routeId) {
    const route = routeRegistry.get(routeId);
    if (!route) return null;
    
    const context = {};
    for (const [key, type] of Object.entries(route.contextSchema)) {
      context[key] = buildContextValue(key, type);
    }
    return context;
  }

  function buildContextValue(key, type) {
    switch (key) {
      case 'partySummary':
        return (G.state.party || []).map(h => ({
          id: h.id, name: h.name, level: h.level, role: h.role,
          hp: h.hp, maxHp: h.maxHp, mp: h.mp, maxMp: h.maxMp,
          weaponEquipped: h.weaponEquipped, armorEquipped: h.armorEquipped,
          accessoryEquipped: h.accessoryEquipped
        }));
      case 'zoneStatus':
        return {
          currentZone: G.state.currentZone,
          zoneProgress: G.state.zoneProgress || {},
          currentRealm: G.state.realm,
          realmStage: G.state.realmStage
        };
      case 'heroSurfaceModel':
        const hero = G.state.player || (G.state.party && G.state.party[0]);
        return hero ? UI.HeroSurface.getModel(hero, 'detail') : null;
      case 'regionMap':
        return MapHelpers.getRegionMap ? MapHelpers.getRegionMap() : null;
      case 'worldEvents':
        return MapHelpers.getWorldEventsSummary ? MapHelpers.getWorldEventsSummary() : [];
      case 'landmarks':
        return Landmarks.getAllSummary ? Landmarks.getAllSummary() : [];
      case 'influence':
        return Influence.getControlState ? Influence.getControlState() : {};
      case 'zoneDetail':
        const zoneId = G.state.currentZone;
        return zoneId ? ZONES[zoneId] : null;
      case 'journeys':
        return JourneySystem.getAvailable ? JourneySystem.getAvailable(zoneId) : [];
      case 'encounters':
        return EncounterSystem.getForZone ? EncounterSystem.getForZone(zoneId) : [];
      case 'encounterSetup':
        return {
          enemies: G.state.currentEnemies || [],
          party: G.state.party || [],
          isBossFight: !!G.state.isBossFight,
          returnToExploration: !!G.state.returnToExploration
        };
      case 'partySurface':
        return (G.state.party || []).map(h => UI.HeroSurface.getModel(h, 'combat'));
      case 'enemySurface':
        return (G.state.currentEnemies || []).map(e => ({
          id: e.id, name: e.name, hp: e.hp, maxHp: e.maxHp,
          sprite: e.sprite, attackType: e.attackType
        }));
      case 'partyDetail':
        const p = G.state.player || (G.state.party && G.state.party[0]);
        return p ? { hero: p, all: G.state.party } : null;
      case 'heroSurface':
        const hp = G.state.player || (G.state.party && G.state.party[0]);
        return hp ? UI.HeroSurface.getModel(hp, 'detail') : null;
      case 'inventory':
        return G.state.inventory || [];
      case 'equipped':
        const ph = G.state.player || (G.state.party && G.state.party[0]);
        return ph ? {
          weapon: ph.weaponEquipped, armor: ph.armorEquipped, accessory: ph.accessoryEquipped
        } : {};
      case 'realmProgress':
        return CultivationSystem.getRealmProgress ? CultivationSystem.getRealmProgress() : { current: 0, needed: 100 };
      default:
        return null;
    }
  }

  function getCommands(routeId) {
    const route = routeRegistry.get(routeId);
    if (!route) return {};
    
    const commands = {};
    for (const [key, systemCall] of Object.entries(route.commandSchema)) {
      commands[key] = createCommandWrapper(systemCall);
    }
    return commands;
  }

  function createCommandWrapper(systemCall) {
    return function(...args) {
      try {
        const parts = systemCall.split('.');
        let obj = window;
        for (const part of parts) {
          obj = obj[part];
          if (!obj) throw new Error('System not found: ' + systemCall);
        }
        if (typeof obj === 'function') {
          return obj.apply(null, args);
        }
        return obj;
      } catch (e) {
        console.error('[Navigation] Command failed:', systemCall, e);
        Notify.show('Action unavailable', 2, R.colors.red);
        return null;
      }
    };
  }

  function go(routeId, params) {
    const route = routeRegistry.get(routeId);
    if (!route) {
      console.warn('[Navigation] Invalid route:', routeId);
      Notify.show('Destination unavailable', 2, R.colors.red);
      gScene('ashram', true, { error: true, message: 'Invalid route: ' + routeId });
      return false;
    }

    const sceneName = route.scene;
    if (!G.scenes[sceneName]) {
      console.warn('[Navigation] Scene not found:', sceneName);
      Notify.show('Destination unavailable', 2, R.colors.red);
      gScene('ashram', true, { error: true, message: 'Scene not found: ' + sceneName });
      return false;
    }

    transitionState.from = G.state.scene;
    transitionState.to = routeId;
    transitionState.params = params || {};
    transitionState.timestamp = Date.now();
    G.state.transition = { ...transitionState };

    gScene(sceneName, true, params);
    return true;
  }

  function transition(from, to, params) {
    const fromRoute = routeRegistry.get(from);
    const toRoute = routeRegistry.get(to);
    
    if (!fromRoute || !toRoute) return false;

    const useReducedMotion = R.reducedMotion ? R.reducedMotion() : false;
    const fadeDuration = useReducedMotion ? 0 : 150;
    const totalBudget = 500;

    Fade.toScene(toRoute.scene, params);
    return true;
  }

  return {
    go,
    register,
    getContext,
    getCommands,
    transition,
    routeRegistry,
    legacySceneMap,
    transitionState
  };
})();

if (typeof window !== 'undefined') {
  window.Navigation = Navigation;
  // Legacy compatibility: gScene wrapper
  const originalGScene = window.gScene;
  window.gScene = function(name, fade, enterOptions) {
    const routeId = Navigation.legacySceneMap[name] || name;
    if (routeId !== name) {
      return Navigation.go(routeId, enterOptions);
    }
    return originalGScene ? originalGScene(name, fade, enterOptions) : Navigation.go(name, enterOptions);
  };
}