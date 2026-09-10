const authScene = Scene.create({
  name: 'auth',
  data: {
    email: '',
    password: '',
    mode: 'signin', // 'signin', 'signup', 'account', 'changePassword'
    buttons: [],
    scrollY: 0,
    contentHeight: 0,
    signedInUser: null,
    showGoogleButton: false,
    googleButtonContainer: null,
    errorMessage: '',
    successMessage: ''
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.signedInUser = LocalAuth.user;
    this.data.errorMessage = '';
    this.data.successMessage = '';
    this.data.showGoogleButton = false;
    this.data.googleButtonContainer = null;
    this.buildButtons();
  },

  leave: function() {
    this.data.buttons = [];
    this.data.signedInUser = null;
    this.data.googleButtonContainer = null;
  },

  getContentTop: function() { return 74; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    let y = this.getContentTop();

    const isSignedIn = !!LocalAuth.user;

    // --- PremiumShell form container ---
    const formShell = UI.PremiumShell(20, y, G.W - 40, 500, { outerR: 12 });
    this.data.staticDraws.push({ shell: formShell });
    y += 36;

    // --- Title ---
    const titleBtn = UI.Button(20, y, G.W - 40, 40, isSignedIn ? 'My Account' : 'Mythika: Account', '');
    titleBtn._color = R.colors.gold;
    titleBtn.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.panel);
      R.textCenter(ctx, this._label || 'Mythika', this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.md);
    };
    this.data.buttons.push(titleBtn);
    y += 56;

    if (!isSignedIn) {
      this._buildAuthForm(y);
    } else {
      this._buildAccountView(y);
    }

    this.data.contentHeight = y;
  },

  _buildAuthForm: function(y) {
    // --- Mode toggle ---
    const modeBtn = UI.Button(20, y, G.W - 40, 36, this.data.mode === 'signin' ? 'Sign In' : 'Sign Up');
    modeBtn.onClick = function() {
      this.data.mode = this.data.mode === 'signin' ? 'signup' : 'signin';
      this.data.email = '';
      this.data.password = '';
      this.data.errorMessage = '';
      this.data.successMessage = '';
      this.buildButtons();
    }.bind(this);
    this.data.buttons.push(modeBtn);
    y += 44;

    // --- Email input ---
    const emailInput = UI.Input(20, y, G.W - 40, 32, this.data.email, false, 'Email');
    emailInput.onChange = function(val) {
      this.data.email = val;
    }.bind(this);
    this.data.buttons.push(emailInput);
    y += 44;

    // --- Password input ---
    const pwInput = UI.Input(20, y, G.W - 40, 32, this.data.password, true, 'Password');
    pwInput.onChange = function(val) {
      this.data.password = val;
    }.bind(this);
    this.data.buttons.push(pwInput);
    y += 52;

    // --- Error/Success message ---
    if (this.data.errorMessage) {
      const errBtn = UI.Button(20, y, G.W - 40, 28, this.data.errorMessage);
      errBtn._color = R.colors.red;
      errBtn.render = function(ctx) {
        R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
      };
      this.data.buttons.push(errBtn);
      y += 36;
    }
    if (this.data.successMessage) {
      const succBtn = UI.Button(20, y, G.W - 40, 28, this.data.successMessage);
      succBtn._color = R.colors.green;
      succBtn.render = function(ctx) {
        R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
      };
      this.data.buttons.push(succBtn);
      y += 36;
    }

    // --- Action button (BtnGold primary) ---
    const actionBtn = UI.BtnGold(20, y, G.W - 40, 38, this.data.mode === 'signin' ? 'Sign In' : 'Sign Up');
    actionBtn.onClick = async function() {
      this.data.errorMessage = '';
      this.data.successMessage = '';
      
      if (this.data.mode === 'signin') {
        const result = await LocalAuth.signInEmail(this.data.email, this.data.password);
        if (result.user) {
          Notify.show('Signed in as: ' + result.user.email, 2, R.colors.green);
          this.data.signedInUser = LocalAuth.user;
          this.data.mode = 'account';
          this.buildButtons();
        } else {
          this.data.errorMessage = result.error || 'Sign in failed';
          this.buildButtons();
        }
      } else {
        const result = await LocalAuth.signUpEmail(this.data.email, this.data.password);
        if (result.user) {
          Notify.show('Account created: ' + result.user.email, 2, R.colors.green);
          this.data.signedInUser = LocalAuth.user;
          this.data.mode = 'account';
          this.buildButtons();
        } else {
          this.data.errorMessage = result.error || 'Sign up failed';
          this.buildButtons();
        }
      }
    }.bind(this);
    this.data.buttons.push(actionBtn);
    y += 48;

    // --- Google Sign In button ---
    const googleBtn = UI.BtnGold(20, y, G.W - 40, 38, 'Sign in with Google');
    googleBtn.onClick = async function() {
      this.data.errorMessage = '';
      this.data.successMessage = '';
      const result = await LocalAuth.signInGoogle();
      
      if (result.needsButton) {
        // Show the Google button
        this.data.showGoogleButton = true;
        this.buildButtons();
        // Render button after UI rebuild
        setTimeout(() => {
          const container = document.getElementById('google-btn-container');
          if (container) LocalAuth.renderGoogleButton(container);
        }, 50);
      } else if (result.user) {
        Notify.show('Signed in with Google: ' + result.user.email, 2, R.colors.green);
        this.data.signedInUser = LocalAuth.user;
        this.data.mode = 'account';
        this.buildButtons();
      } else {
        this.data.errorMessage = result.error || 'Google sign in failed';
        this.buildButtons();
      }
    }.bind(this);
    this.data.buttons.push(googleBtn);
    y += 52;

    // --- Google Button Container (shown when One Tap not available) ---
    if (this.data.showGoogleButton) {
      const containerBtn = UI.Button(20, y, G.W - 40, 48, '');
      containerBtn._id = 'google-btn-container';
      containerBtn.render = function(ctx) {
        // Just a placeholder - Google renders its own button
      };
      this.data.buttons.push(containerBtn);
      y += 56;
    }

    // --- Continue without account (ghost button) ---
    const ghostBtn = UI.MagneticBtn(20, y, G.W - 40, 38, 'Continue without account (offline mode)', 'ghost');
    ghostBtn.onClick = function() {
      LocalAuth.user = null;
      LocalAuth._clearSession();
      Notify.show('Playing in offline mode', 2, R.colors.dimGrey);
      Scene.goTo('ashram');
    };
    this.data.buttons.push(ghostBtn);
    y += 48;
  },

  _buildAccountView: function(y) {
    const user = LocalAuth.user;
    const accounts = LocalAuth.getAccounts();
    const currentAccount = accounts[user.email];

    // --- User Info ---
    const infoShell = UI.PremiumShell(20, y, G.W - 40, 120, { outerR: 8 });
    this.data.staticDraws.push({ shell: infoShell });
    
    const infoBtn = UI.Button(30, y + 12, G.W - 60, 96, '');
    infoBtn.render = function(ctx) {
      // Avatar
      if (user.photoURL) {
        const img = new Image();
        img.src = user.photoURL;
        if (img.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(60, this.y + 48, 24, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, 36, this.y + 24, 48, 48);
          ctx.restore();
        }
      } else {
        R.roundRect(ctx, 36, this.y + 24, 48, 48, 24, R.colors.blue);
        R.textCenter(ctx, user.displayName ? user.displayName[0].toUpperCase() : '?', 60, this.y + 52, R.colors.bg, R.fonts.xl);
      }
      
      // Name & Email
      R.text(ctx, user.displayName || 'Unknown', 100, this.y + 32, R.colors.text, R.fonts.md);
      R.text(ctx, user.email, 100, this.y + 52, R.colors.textDim, R.fonts.sm);
      
      // Account type badge
      const isGoogle = currentAccount && currentAccount.googleId;
      const badgeText = isGoogle ? 'Google Account' : 'Email Account';
      const badgeColor = isGoogle ? R.colors.blue : R.colors.orange;
      R.roundRect(ctx, 100, this.y + 72, 120, 18, 9, badgeColor + '33');
      R.textCenter(ctx, badgeText, 160, this.y + 83, badgeColor, R.fonts.xs);
    };
    this.data.buttons.push(infoBtn);
    y += 132;

    // --- Display Name Edit ---
    const nameInput = UI.Input(20, y, G.W - 40, 32, user.displayName || '', false, 'Display Name');
    nameInput.onChange = function(val) {
      this.data.newDisplayName = val;
    }.bind(this);
    this.data.buttons.push(nameInput);
    y += 40;

    const saveNameBtn = UI.BtnGold(20, y, G.W - 40, 36, 'Save Name');
    saveNameBtn.onClick = function() {
      if (this.data.newDisplayName && this.data.newDisplayName !== user.displayName) {
        const result = LocalAuth.updateDisplayName(this.data.newDisplayName);
        if (result.success) {
          Notify.show('Name updated', 2, R.colors.green);
          this.data.signedInUser = LocalAuth.user;
          this.buildButtons();
        } else {
          Notify.show(result.error, 3, R.colors.red);
        }
      }
    }.bind(this);
    this.data.buttons.push(saveNameBtn);
    y += 44;

    // --- Change Password (only for email accounts) ---
    if (currentAccount && currentAccount.passwordHash) {
      const passTitle = UI.Button(20, y, G.W - 40, 28, 'Change Password');
      passTitle._color = R.colors.textDim;
      passTitle.render = function(ctx) {
        R.text(ctx, this._label, this.x, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
      };
      this.data.buttons.push(passTitle);
      y += 32;

      const curPassInput = UI.Input(20, y, G.W - 40, 32, '', true, 'Current Password');
      curPassInput.onChange = function(val) { this.data.currentPassword = val; }.bind(this);
      this.data.buttons.push(curPassInput);
      y += 40;

      const newPassInput = UI.Input(20, y, G.W - 40, 32, '', true, 'New Password (min 8 chars, upper, lower, number)');
      newPassInput.onChange = function(val) { this.data.newPassword = val; }.bind(this);
      this.data.buttons.push(newPassInput);
      y += 40;

      const changePassBtn = UI.BtnGold(20, y, G.W - 40, 36, 'Change Password');
      changePassBtn.onClick = async function() {
        if (!this.data.currentPassword || !this.data.newPassword) {
          Notify.show('Fill both fields', 2, R.colors.red);
          return;
        }
        const result = await LocalAuth.changePassword(this.data.currentPassword, this.data.newPassword);
        if (result.success) {
          Notify.show('Password changed', 2, R.colors.green);
          this.data.currentPassword = '';
          this.data.newPassword = '';
          this.buildButtons();
        } else {
          Notify.show(result.error, 3, R.colors.red);
        }
      }.bind(this);
      this.data.buttons.push(changePassBtn);
      y += 44;
    }

    // --- Account Switcher ---
    const otherAccounts = Object.keys(accounts).filter(e => e !== user.email);
    if (otherAccounts.length > 0) {
      const switchTitle = UI.Button(20, y, G.W - 40, 28, 'Switch Account');
      switchTitle._color = R.colors.textDim;
      switchTitle.render = function(ctx) {
        R.text(ctx, this._label, this.x, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
      };
      this.data.buttons.push(switchTitle);
      y += 32;

      for (const accEmail of otherAccounts) {
        const acc = accounts[accEmail];
        const isGoogle = acc.googleId;
        const btn = UI.Button(20, y, G.W - 40, 36, '');
        btn._acc = acc;
        btn.render = function(ctx) {
          R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.btn);
          ctx.strokeStyle = 'rgba(232,160,48,0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRoundRect(this.x, this.y, this.w, this.h, 6);
          R.text(ctx, this._acc.displayName || this._acc.email, this.x + 16, this.y + 12, R.colors.text, R.fonts.sm);
          R.text(ctx, this._acc.email, this.x + 16, this.y + 28, R.colors.textDim, R.fonts.xs);
          const badge = isGoogle ? 'Google' : 'Email';
          R.roundRect(ctx, this.x + this.w - 80, this.y + 8, 70, 20, 10, R.colors.blue + '33');
          R.textCenter(ctx, badge, this.x + this.w - 45, this.y + 18, R.colors.blue, R.fonts.xs);
        };
        btn.onClick = function() {
          if (this._acc.passwordHash) {
            // Need password - show modal
            UI.Modal.prompt('Switch to ' + this._acc.email, 'Enter password:', '', function(password) {
              if (password) {
                LocalAuth.switchAccount(this._acc.email, password).then(result => {
                  if (result.user) {
                    Notify.show('Switched account', 2, R.colors.green);
                    this.data.signedInUser = LocalAuth.user;
                    this.buildButtons();
                  } else {
                    Notify.show(result.error, 3, R.colors.red);
                  }
                });
              }
            }.bind(this));
          } else {
            // Google account - just switch
            LocalAuth.signInGoogle().then(result => {
              if (result.user) {
                Notify.show('Switched account', 2, R.colors.green);
                this.data.signedInUser = LocalAuth.user;
                this.buildButtons();
              }
            });
          }
        }.bind(this);
        this.data.buttons.push(btn);
        y += 42;
      }
    }

    // --- Export Account Data ---
    const exportBtn = UI.Button(20, y, G.W - 40, 36, 'Export Account Data (Backup)', R.colors.btn);
    exportBtn.onClick = function() {
      const result = LocalAuth.exportAccount();
      if (result.success) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mythika-account-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        Notify.show('Account data exported', 2, R.colors.green);
      }
    };
    this.data.buttons.push(exportBtn);
    y += 44;

    // --- Delete Account ---
    const deleteBtn = UI.Button(20, y, G.W - 40, 36, 'Delete Account', R.colors.btn);
    deleteBtn._color = R.colors.red;
    deleteBtn.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, 'rgba(200,50,50,0.1)');
      ctx.strokeStyle = 'rgba(200,50,50,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRoundRect(this.x, this.y, this.w, this.h, 6);
      R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
    };
    deleteBtn.onClick = function() {
      UI.Modal.confirm('Delete Account', 'This will permanently delete your account and all save data. Type "DELETE" to confirm:', function(input) {
        if (input === 'DELETE') {
          LocalAuth.deleteAccount(user.email).then(result => {
            if (result.success) {
              Notify.show('Account deleted', 2, R.colors.green);
              this.data.signedInUser = null;
              this.buildButtons();
            } else {
              Notify.show(result.error, 3, R.colors.red);
            }
          });
        } else if (input !== null) {
          Notify.show('Confirmation text must be exactly "DELETE"', 3, R.colors.red);
        }
      }.bind(this));
    }.bind(this);
    this.data.buttons.push(deleteBtn);
    y += 44;

    // --- Sign Out ---
    const signOutBtn = UI.Button(20, y, G.W - 40, 36, 'Sign Out', R.colors.btn);
    signOutBtn.onClick = function() {
      LocalAuth.signOut();
      Notify.show('Signed out', 2, R.colors.dimGrey);
      this.data.signedInUser = null;
      this.data.mode = 'signin';
      this.buildButtons();
    }.bind(this);
    this.data.buttons.push(signOutBtn);
    y += 44;

    // --- Continue Offline ---
    const offlineBtn = UI.MagneticBtn(20, y, G.W - 40, 38, 'Play Offline (keep signed in)', 'ghost');
    offlineBtn.onClick = function() {
      Notify.show('Playing in offline mode', 2, R.colors.dimGrey);
      Scene.goTo('ashram');
    };
    this.data.buttons.push(offlineBtn);
    y += 48;
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 74, LocalAuth.user ? 'My Account' : 'Account', 22);
    const subtitle = LocalAuth.user ? 
      'Manage your account and cloud saves' : 
      'Sign in with email or create a new account';
    R.textCenter(ctx, subtitle, G.W / 2, 50, R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    const contentH = this.getContentHeight();

    // Render PremiumShell and static draws BEFORE clip
    Scene.drawStatic(ctx, this.data.staticDraws);

    // Clip content area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, G.W, contentH);
    ctx.clip();
    ctx.translate(0, -this.data.scrollY);

    // Render visible buttons inside clip
    const vis = Scene.cullButtons(this.data.buttons, this.data.scrollY, contentH);
    for (const b of vis) b.render(ctx);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, contentH, this.data.scrollY);

    UI.Modal.render(ctx);
  }
});

// Add strokeRoundRect helper to CanvasRenderingContext2D prototype
if (!CanvasRenderingContext2D.prototype.strokeRoundRect) {
  CanvasRenderingContext2D.prototype.strokeRoundRect = function(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    this.stroke();
  };
}