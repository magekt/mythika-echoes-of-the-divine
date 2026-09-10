const LocalAuth = {
  STORAGE_KEY: 'mythika_accounts',
  CURRENT_USER_KEY: 'mythika_current_user',
  ACCOUNT_VERSION: 2,
  user: null,
  _googleResolve: null,
  _gisInitialized: false,
  GOOGLE_CLIENT_ID: null,

  // Initialize and check for existing session
  init: function() {
    try {
      const saved = localStorage.getItem(this.CURRENT_USER_KEY);
      if (saved) {
        const userData = JSON.parse(saved);
        // Validate session isn't too old (30 days)
        if (userData.lastActivity && Date.now() - userData.lastActivity < 30 * 24 * 60 * 60 * 1000) {
          this.user = userData;
          this._updateLastActivity();
          console.log('[Mythika] Local auth restored:', userData.email);
          return true;
        } else {
          // Session expired
          this._clearSession();
        }
      }
    } catch (e) {
      console.warn('[Mythika] Local auth init failed:', e);
    }
    return false;
  },

  // Generate per-user salt
  _generateSalt: function() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },

  // Hash password with per-user salt using PBKDF2
  _hashPassword: async function(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const saltBuffer = encoder.encode(salt);
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBuffer, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Verify password against stored hash
  _verifyPassword: async function(password, salt, hash) {
    const computedHash = await this._hashPassword(password, salt);
    return computedHash === hash;
  },

  // Get all accounts from localStorage
  _getAccounts: function() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const accounts = raw ? JSON.parse(raw) : {};
      // Migrate old accounts if needed
      return this._migrateAccounts(accounts);
    } catch (e) {
      return {};
    }
  },

  // Migrate account schema versions
  _migrateAccounts: function(accounts) {
    let changed = false;
    for (const email of Object.keys(accounts)) {
      const acc = accounts[email];
      if (!acc.version) {
        // Version 1 -> 2: add salt field, update hash method
        if (acc.passwordHash && !acc.salt) {
          // Legacy hash (SHA-256 with static salt) - mark for rehash on next login
          acc.legacyHash = true;
          acc.salt = this._generateSalt();
        }
        acc.version = this.ACCOUNT_VERSION;
        changed = true;
      }
    }
    if (changed) this._saveAccounts(accounts);
    return accounts;
  },

  // Save accounts to localStorage
  _saveAccounts: function(accounts) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: this.STORAGE_KEY }));
  },

  // Save current user session
  _saveSession: function(user) {
    const session = {
      ...user,
      lastActivity: Date.now(),
      sessionId: crypto.randomUUID()
    };
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(session));
  },

  // Update last activity timestamp
  _updateLastActivity: function() {
    if (this.user) {
      this.user.lastActivity = Date.now();
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.user));
    }
  },

  // Clear current user session
  _clearSession: function() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  },

  // Listen for storage changes from other tabs
  _setupStorageListener: function() {
    if (this._storageListenerAdded) return;
    window.addEventListener('storage', (e) => {
      if (e.key === this.CURRENT_USER_KEY) {
        if (!e.newValue) {
          // Signed out in another tab
          this.user = null;
          console.log('[Mythika] Signed out from another tab');
        } else {
          // Signed in from another tab
          try {
            this.user = JSON.parse(e.newValue);
            console.log('[Mythika] Session updated from another tab:', this.user.email);
          } catch (_) {}
        }
      }
    });
    this._storageListenerAdded = true;
  },

  // Email/password sign up
  signUpEmail: async function(email, password) {
    this._setupStorageListener();
    
    if (!email || !password) return { error: 'Email and password required' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Invalid email format' };
    if (password.length < 8) return { error: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { error: 'Password must contain uppercase letter' };
    if (!/[a-z]/.test(password)) return { error: 'Password must contain lowercase letter' };
    if (!/[0-9]/.test(password)) return { error: 'Password must contain number' };

    const accounts = this._getAccounts();
    const normalizedEmail = email.toLowerCase().trim();

    if (accounts[normalizedEmail]) {
      return { error: 'Account already exists' };
    }

    const salt = this._generateSalt();
    const passwordHash = await this._hashPassword(password, salt);
    const user = {
      email: normalizedEmail,
      passwordHash: passwordHash,
      salt: salt,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      lastActivity: Date.now(),
      displayName: email.split('@')[0],
      photoURL: null,
      version: this.ACCOUNT_VERSION
    };

    accounts[normalizedEmail] = user;
    this._saveAccounts(accounts);
    this.user = { email: user.email, displayName: user.displayName, photoURL: user.photoURL, sessionId: crypto.randomUUID() };
    this._saveSession(this.user);

    return { user: this.user };
  },

  // Email/password sign in
  signInEmail: async function(email, password) {
    this._setupStorageListener();
    
    if (!email || !password) return { error: 'Email and password required' };

    const accounts = this._getAccounts();
    const normalizedEmail = email.toLowerCase().trim();
    const account = accounts[normalizedEmail];

    if (!account) {
      return { error: 'Account not found' };
    }

    let valid = false;
    if (account.legacyHash) {
      // Verify against legacy hash, then upgrade
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'mythika_salt_2024');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      valid = legacyHash === account.passwordHash;
      if (valid) {
        // Rehash with new method
        account.salt = this._generateSalt();
        account.passwordHash = await this._hashPassword(password, account.salt);
        account.legacyHash = false;
        account.version = this.ACCOUNT_VERSION;
      }
    } else {
      valid = await this._verifyPassword(password, account.salt, account.passwordHash);
    }

    if (!valid) {
      return { error: 'Invalid password' };
    }

    // Update last login
    account.lastLogin = Date.now();
    account.lastActivity = Date.now();
    this._saveAccounts(accounts);

    this.user = { email: account.email, displayName: account.displayName, photoURL: account.photoURL, sessionId: crypto.randomUUID() };
    this._saveSession(this.user);

    return { user: this.user };
  },

  // Change password (requires current password)
  changePassword: async function(currentPassword, newPassword) {
    if (!this.user) return { error: 'Not signed in' };
    if (newPassword.length < 8) return { error: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(newPassword)) return { error: 'Password must contain uppercase letter' };
    if (!/[a-z]/.test(newPassword)) return { error: 'Password must contain lowercase letter' };
    if (!/[0-9]/.test(newPassword)) return { error: 'Password must contain number' };

    const accounts = this._getAccounts();
    const account = accounts[this.user.email];
    if (!account) return { error: 'Account not found' };

    // Verify current password
    let valid = false;
    if (account.legacyHash) {
      const encoder = new TextEncoder();
      const data = encoder.encode(currentPassword + 'mythika_salt_2024');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      valid = legacyHash === account.passwordHash;
    } else {
      valid = await this._verifyPassword(currentPassword, account.salt, account.passwordHash);
    }

    if (!valid) return { error: 'Current password is incorrect' };

    // Set new password
    account.salt = this._generateSalt();
    account.passwordHash = await this._hashPassword(newPassword, account.salt);
    account.legacyHash = false;
    account.version = this.ACCOUNT_VERSION;
    this._saveAccounts(accounts);

    return { success: true };
  },

  // Update display name
  updateDisplayName: function(newName) {
    if (!this.user) return { error: 'Not signed in' };
    if (!newName || newName.trim().length < 2) return { error: 'Name too short' };
    if (newName.length > 20) return { error: 'Name too long (max 20 chars)' };

    const accounts = this._getAccounts();
    const account = accounts[this.user.email];
    if (!account) return { error: 'Account not found' };

    account.displayName = newName.trim();
    this._saveAccounts(accounts);
    this.user.displayName = account.displayName;
    this._saveSession(this.user);

    return { success: true, displayName: account.displayName };
  },

  // Google Sign-In using Google Identity Services
  signInGoogle: function() {
    return new Promise((resolve) => {
      this._setupStorageListener();
      
      if (typeof google === 'undefined' || !google.accounts) {
        resolve({ error: 'Google Sign-In not loaded. Add Google Identity Services script.' });
        return;
      }

      if (!this.GOOGLE_CLIENT_ID) {
        resolve({ error: 'Google Client ID not set. Call LocalAuth.setGoogleClientId() first.' });
        return;
      }

      if (!this._gisInitialized) {
        google.accounts.id.initialize({
          client_id: this.GOOGLE_CLIENT_ID,
          callback: this._handleGoogleCredential.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        this._gisInitialized = true;
      }

      // Use One Tap prompt
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap not available, user needs to click button
          // We'll resolve with a special code to show button
          this._googleResolve = resolve;
          resolve({ needsButton: true });
        }
      });
    });
  },

  // Render Google Sign-In button (call after signInGoogle returns needsButton)
  renderGoogleButton: function(containerElement) {
    if (typeof google === 'undefined' || !google.accounts) return false;
    google.accounts.id.renderButton(containerElement, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: containerElement.offsetWidth || 360
    });
    return true;
  },

  _handleGoogleCredential: function(response) {
    if (!response.credential) {
      this._resolveGoogle({ error: 'No credential received' });
      return;
    }

    try {
      // Decode JWT (header.payload.signature)
      const parts = response.credential.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      // Basic validation
      if (!payload.email || !payload.sub) throw new Error('Missing required claims');
      if (payload.aud !== this.GOOGLE_CLIENT_ID) {
        console.warn('[Mythika] Google token audience mismatch');
      }
      if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');

      const user = {
        email: payload.email.toLowerCase(),
        displayName: payload.name || payload.given_name || payload.email.split('@')[0],
        photoURL: payload.picture || null,
        googleId: payload.sub,
        emailVerified: payload.email_verified || false
      };

      // Save or update account
      const accounts = this._getAccounts();
      const normalizedEmail = user.email;

      if (!accounts[normalizedEmail]) {
        accounts[normalizedEmail] = {
          email: normalizedEmail,
          passwordHash: null,
          salt: null,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          lastActivity: Date.now(),
          displayName: user.displayName,
          photoURL: user.photoURL,
          googleId: user.googleId,
          emailVerified: user.emailVerified,
          version: this.ACCOUNT_VERSION
        };
      } else {
        accounts[normalizedEmail].lastLogin = Date.now();
        accounts[normalizedEmail].lastActivity = Date.now();
        accounts[normalizedEmail].displayName = user.displayName;
        accounts[normalizedEmail].photoURL = user.photoURL;
        accounts[normalizedEmail].googleId = user.googleId;
        accounts[normalizedEmail].emailVerified = user.emailVerified;
      }

      this._saveAccounts(accounts);
      this.user = { 
        email: user.email, 
        displayName: user.displayName, 
        photoURL: user.photoURL,
        googleId: user.googleId,
        sessionId: crypto.randomUUID()
      };
      this._saveSession(this.user);

      this._resolveGoogle({ user: this.user });
    } catch (e) {
      console.error('[Mythika] Google auth error:', e);
      this._resolveGoogle({ error: 'Failed to process Google sign-in: ' + e.message });
    }
  },

  _resolveGoogle: function(result) {
    if (this._googleResolve) {
      this._googleResolve(result);
      this._googleResolve = null;
    }
  },

  // Set Google Client ID (call before using Google Sign-In)
  setGoogleClientId: function(clientId) {
    this.GOOGLE_CLIENT_ID = clientId;
  },

  // Sign out
  signOut: function() {
    this.user = null;
    this._clearSession();
    return { success: true };
  },

  // Save game state to localStorage per user
  saveToLocal: function(gameState) {
    if (!this.user) return { error: 'Not signed in' };
    try {
      const key = 'mythika_save_' + this.user.email;
      const data = {
        state: JSON.parse(JSON.stringify(gameState)),
        version: 1,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Load game state from localStorage per user
  loadFromLocal: function() {
    if (!this.user) return { error: 'Not signed in' };
    try {
      const key = 'mythika_save_' + this.user.email;
      const raw = localStorage.getItem(key);
      if (!raw) return { data: null };
      const data = JSON.parse(raw);
      return { data: data.state };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Get all saved accounts (for account switching UI)
  getAccounts: function() {
    return this._getAccounts();
  },

  // Switch to another account (requires password for email accounts)
  switchAccount: async function(email, password) {
    if (!password) return { error: 'Password required to switch accounts' };
    return this.signInEmail(email, password);
  },

  // Delete account (requires password confirmation for email accounts)
  deleteAccount: async function(email, password) {
    const accounts = this._getAccounts();
    const normalizedEmail = email.toLowerCase().trim();
    const account = accounts[normalizedEmail];
    
    if (!account) return { error: 'Account not found' };

    // If it's a password account, verify password
    if (account.passwordHash && password) {
      let valid = false;
      if (account.legacyHash) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'mythika_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        valid = legacyHash === account.passwordHash;
      } else {
        valid = await this._verifyPassword(password, account.salt, account.passwordHash);
      }
      if (!valid) return { error: 'Incorrect password' };
    } else if (account.passwordHash && !password) {
      return { error: 'Password required to delete account' };
    }

    delete accounts[normalizedEmail];
    this._saveAccounts(accounts);
    localStorage.removeItem('mythika_save_' + normalizedEmail);
    
    if (this.user && this.user.email === normalizedEmail) {
      this.signOut();
    }
    return { success: true };
  },

  // Export account data (for backup)
  exportAccount: function() {
    if (!this.user) return { error: 'Not signed in' };
    const accounts = this._getAccounts();
    const account = accounts[this.user.email];
    if (!account) return { error: 'Account not found' };
    
    // Don't export password hash
    const { passwordHash, salt, legacyHash, ...safeAccount } = account;
    return { 
      success: true, 
      data: {
        account: safeAccount,
        save: localStorage.getItem('mythika_save_' + this.user.email)
      }
    };
  }
};

// Export for global use
window.LocalAuth = LocalAuth;