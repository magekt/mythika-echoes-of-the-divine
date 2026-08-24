const Auth = {
  user: null,

  // Initialize Firebase and listen for auth state
  init: function() {
    // Check if firebase is available (loaded via CDN in index.html)
    if (typeof firebase === 'undefined') {
      console.log('[Mythika] Firebase not loaded — running in offline mode');
      return;
    }
    
    // Initialize Firebase app
    firebase.initializeApp(FIREBASE_CONFIG);
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(function(user) {
      Auth.user = user;
      if (user) {
        console.log('[Mythika] Signed in as:', user.email || user.uid);
        // Auto-load save after auth
        Auth.loadAfterAuth();
      } else {
        console.log('[Mythika] Signed out — running in offline mode');
      }
    });
  },

  // Email/password sign up
  signUp: async function(email, password) {
    if (!firebase) return { error: 'Firebase not available' };
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
      return { user: cred.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Email/password sign in
  signIn: async function(email, password) {
    if (!firebase) return { error: 'Firebase not available' };
    try {
      const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { user: cred.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Sign out
  signOut: async function() {
    if (!firebase) return;
    await firebase.auth().signOut();
    Auth.user = null;
  },

  // Save game state to Firestore
  saveToCloud: async function(gameState) {
    if (!firebase || !Auth.user) return { error: 'Not signed in' };
    try {
      const db = firebase.firestore();
      await db.collection(SAVE_COLLECTION).doc(Auth.user.uid).set({
        state: gameState,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        version: 1
      });
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Load game state from Firestore
  loadFromCloud: async function() {
    if (!firebase || !Auth.user) return { error: 'Not signed in' };
    try {
      const db = firebase.firestore();
      const doc = await db.collection(SAVE_COLLECTION).doc(Auth.user.uid).get();
      if (doc.exists) {
        return { data: doc.data().state };
      }
      return { data: null };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Load save after auth state changes
  loadAfterAuth: async function() {
    const result = await Auth.loadFromCloud();
    if (result.data) {
      // Merge cloud save with local state
      // Cloud save takes precedence for cross-device sync
      Object.assign(G.state, result.data);
      console.log('[Mythika] Cloud save loaded');
    }
  }
};