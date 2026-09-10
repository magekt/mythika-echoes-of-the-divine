const Auth = {
  user: null,
  app: null,
  auth: null,
  db: null,
  recaptchaVerifier: null,

  // Initialize Firebase — called from the module script in index.html
  init: function(firebaseApp, firebaseAuth, firebaseDb) {
    this.app = firebaseApp;
    this.auth = firebaseAuth;
    this.db = firebaseDb;

    // Listen for auth state changes
    const self = this;
    onAuthStateChanged(this.auth, function(user) {
      self.user = user;
      if (user) {
        console.log('[Mythika] Signed in:', user.email || user.phoneNumber || user.uid);
        self.loadAfterAuth();
      } else {
        console.log('[Mythika] Signed out');
      }
    });
  },

  // Email/password sign up
  signUpEmail: async function(email, password) {
    if (!this.auth) return { error: 'Auth not initialized' };
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      return { user: cred.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Email/password sign in
  signInEmail: async function(email, password) {
    if (!this.auth) return { error: 'Auth not initialized' };
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      return { user: cred.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Google sign in
  signInGoogle: async function() {
    if (!this.auth) return { error: 'Auth not initialized' };
    try {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      return { user: result.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Phone sign in — init recaptcha first, then verify phone
  initRecaptcha: function(elementId) {
    if (!this.auth) return { error: 'Auth not initialized' };
    if (typeof RecaptchaVerifier === 'undefined') {
      return { error: 'RecaptchaVerifier not loaded' };
    }
    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, elementId, {
      'size': 'invisible',
      'callback': function(response) {
        // reCAPTCHA solved, proceed with phone sign in
      },
      'expired-callback': function() {
        // User expired, ask to solve again
      }
    });
    return { success: true };
  },

  signInPhone: async function(phoneNumber) {
    if (!this.auth || !this.recaptchaVerifier) return { error: 'Recaptcha not initialized' };
    try {
      const result = await signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier);
      return { verificationId: result.verificationId };
    } catch (e) {
      return { error: e.message };
    }
  },

  verifyPhoneCode: async function(verificationId, code) {
    if (!this.auth) return { error: 'Auth not initialized' };
    try {
      // PhoneAuthProvider is available globally from the Firebase CDN
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const result = await signInWithCredential(this.auth, credential);
      return { user: result.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Sign out
  signOut: async function() {
    if (!this.auth) return;
    try {
      await signOut(this.auth);
      this.user = null;
      console.log('[Mythika] Signed out');
    } catch (e) {
      console.warn('[Mythika] Sign out failed:', e.message);
    }
  },

  // Save game state to Firestore
  saveToCloud: async function(gameState) {
    if (!this.auth || !this.db || !this.user) return { error: 'Not signed in' };
    try {
      const saveData = {
        state: gameState,
        updatedAt: serverTimestamp(),
        version: 1
      };
      await setDoc(doc(this.db, 'game_saves', this.user.uid), saveData);
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Load game state from Firestore
  loadFromCloud: async function() {
    if (!this.auth || !this.db || !this.user) return { error: 'Not signed in' };
    try {
      const docSnap = await getDoc(doc(this.db, 'game_saves', this.user.uid));
      if (docSnap.exists()) {
        return { data: docSnap.data().state };
      }
      return { data: null };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Load after auth state changes
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