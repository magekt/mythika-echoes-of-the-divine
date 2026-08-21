// Hints: one-time onboarding toasts. Each hint fires once per save, then is
// remembered in G.state.flags (hint_<id>) and never shown again.
const Hints = {
  seen: function(id) {
    return !!(G.state.flags && G.state.flags['hint_' + id]);
  },
  show: function(id, msg) {
    if (!G.state.flags) G.state.flags = {};
    if (G.state.flags['hint_' + id]) return;
    G.state.flags['hint_' + id] = true;
    Notify.show(msg, 4, R.colors.blueLight);
  }
};
