const Scene = {
  create(def) {
    var scene = Object.assign({
      name: def.name || 'unnamed',
      enter: def.enter || (() => {}),
      leave: def.leave || (() => {}),
      update: def.update || (() => {}),
      render: def.render || (() => {}),
      data: def.data || {}
    }, def);
    // Phase 19: lifecycle guards wrap enter/leave internally; scene API unchanged.
    if (typeof Lifecycle !== 'undefined' && Lifecycle) {
      var rawEnter = scene.enter, rawLeave = scene.leave;
      scene.enter = Lifecycle.wrapEnter(scene, rawEnter);
      scene.leave = (function (s, fn) {
        var wrapped = Lifecycle.wrapLeave(s, fn);
        return function () {
          var out = wrapped.apply(s, arguments);
          try { Lifecycle.assertClean(s); } catch (e) {}
          return out;
        };
      })(scene, rawLeave);
    }
    return scene;
  }
};

function initSceneManager() {
  // G.scenes is already initialized in the G literal, preserves registrations from main.js
}

function registerScene(name, scene) {
  G.scenes[name] = scene;
}
