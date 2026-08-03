const Scene = {
  create(def) {
    return Object.assign({
      name: def.name || 'unnamed',
      enter: def.enter || (() => {}),
      leave: def.leave || (() => {}),
      update: def.update || (() => {}),
      render: def.render || (() => {}),
      data: def.data || {}
    }, def);
  }
};

function initSceneManager() {
  // G.scenes is already initialized in the G literal, preserves registrations from main.js
}

function registerScene(name, scene) {
  G.scenes[name] = scene;
}
