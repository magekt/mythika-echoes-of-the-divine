const Auth = {
  user: null,
  app: null,
  auth: null,
  db: null,

  // Offline stub — Firebase removed in v13.0. All auth is offline/localStorage.
  init: function() {
    this.user = null;
    this.app = null;
    this.auth = null;
    this.db = null;
  },

  signUpEmail: async function() { return { error: 'Offline mode — Firebase removed' }; },
  signInEmail: async function() { return { error: 'Offline mode — Firebase removed' }; },
  signInGoogle: async function() { return { error: 'Offline mode — Firebase removed' }; },
  initRecaptcha: function() { return { error: 'Offline mode — Firebase removed' }; },
  signInPhone: async function() { return { error: 'Offline mode — Firebase removed' }; },
  verifyPhoneCode: async function() { return { error: 'Offline mode — Firebase removed' }; },
  signOut: async function() {
    this.user = null;
    console.log('[Mythika] Signed out (offline)');
  },
  saveToCloud: async function() { return { error: 'Offline mode — Firebase removed' }; },
  loadFromCloud: async function() { return { data: null }; },
  loadAfterAuth: async function() {}
};
