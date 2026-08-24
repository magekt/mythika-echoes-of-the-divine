const authScene = Scene.create({
  name: 'auth',
  data: {
    email: '',
    password: '',
    mode: 'signin', // 'signin' or 'signup'
    showSignup: false,
    buttons: [],
    scrollY: 0,
    staticDraws: [],
    contentHeight: 0,
    signedInUser: null
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    this.data.signedInUser = Auth.user;
    this.buildButtons();
  },

  leave: function() {
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.scrollY = 0;
  },

  buildButtons: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.staticDraws = [];
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    // --- Title ---
    const titleBtn = UI.Button(20, y, G.W - 40, 40, 'Mythika: Cloud Save', '');
    titleBtn._color = R.colors.gold;
    titleBtn.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, R.colors.panel);
      R.textCenter(ctx, this._label || 'Mythika', this.x + this.w / 2, this.y + this.h / 2 + 4, this._color, R.fonts.md);
    };
    this.data.buttons.push(titleBtn);
    y += 56;

    // --- Mode toggle ---
    const modeBtn = UI.Button(20, y, G.W - 40, 36, this.data.mode === 'signin' ? 'Sign In' : 'Sign Up');
    modeBtn.onClick = function() {
      Auth.init();
      Auth[Auth.user ? 'signOut' : 'signIn'] ? null : null;
      this.data.mode = this.data.mode === 'signin' ? 'signup' : 'signin';
      settingsScene.buildButtons();
    };
    this.data.buttons.push(modeBtn);
    y += 44;

    // --- Email input ---
    const emailInput = UI.Input(20, y, G.W - 40, 32, this.data.email);
    emailInput.onChange = function(val) {
      this.data.email = val;
    }.bind(this);
    this.data.buttons.push(emailInput);
    y += 44;

    // --- Password input ---
    const pwInput = UI.Input(20, y, G.W - 40, 32, this.data.password, true);
    pwInput.onChange = function(val) {
      this.data.password = val;
    }.bind(this);
    this.data.buttons.push(pwInput);
    y += 52;

    // --- Action button ---
    const actionBtn = UI.Button(20, y, G.W - 40, 38, this.data.mode === 'signin' ? 'Sign In' : 'Sign Up');
    actionBtn.onClick = async function() {
      if (Auth.user) {
        Auth.signOut();
        Notify.show('Signed out', 2, R.colors.green);
      } else {
        if (this.data.mode === 'signin') {
          const result = await Auth.signIn(this.data.email, this.data.password);
          if (result.user) {
            Notify.show('Signed in as: ' + result.user.email, 2, R.colors.green);
          } else {
            Notify.show('Sign in failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
          }
        } else {
          const result = await Auth.signUp(this.data.email, this.data.password);
          if (result.user) {
            Notify.show('Account created: ' + result.user.email, 2, R.colors.green);
          } else {
            Notify.signup ? Notify.show('Sign up failed: ' + (result.error || 'unknown error'), 3, R.colors.red) : Notify.show('Sign up failed', 3, R.colors.red);
          }
        }
      }
      // Refresh scene
      this.data.signedInUser = Auth.user;
      settingsScene.buildButtons();
    }.bind(this);
    this.data.buttons.push(actionBtn);
    y += 48;

    // --- Continue without account ---
    const ghostBtn = UI.Button(20, y, G.W - 40, 34, 'Continue without account (offline mode)');
    ghostBtn._color = R.colors.textDim;
    ghostBtn.render = function(ctx) {
      R.roundRect(ctx, this.x, this.y, this.w, this.h, 6, 'rgba(255,255,255,0.1)');
      R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
    };
    ghostBtn.onClick = function() {
      Auth.user = null;
      Notify.show('Playing in offline mode', 2, R.colors.dimGrey);
      Scene.goTo('ashram');
    };
    this.data.buttons.push(ghostBtn);
    y += 44;

    // --- Already have account link ---
    if (!Auth.user) {
      const linkBtn = UI.Button(20, y, G.W - 40, 32, 'Forgot password?');
      linkBtn._color = R.colors.textDim;
      linkBtn.render = function(ctx) {
        R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
      };
      linkBtn.onClick = function() {
        Notify.show('Password reset link sent to your email', 2, R.colors.blue);
      };
      this.data.buttons.push(linkBtn);
      y += 40;
    }

    this.data.contentHeight = y;
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 74, 'Authentication', 22);
    R.textCenter(ctx, 'Sign in with email or create a new account', G.W / 2, 50, R.colors.textDim, R.fonts.sm);

    const top = this.getContentTop();
    Scene.clipContent(ctx, this);

    for (const b of this.data.buttons) b.render(ctx);
    Scene.drawStatic(ctx, this.data.staticDraws);

    ctx.restore();

    Scene.drawScrollbar(ctx, top, this.data.contentHeight, this.getContentHeight(), this.data.scrollY);

    UI.Modal.render(ctx);
  }
});