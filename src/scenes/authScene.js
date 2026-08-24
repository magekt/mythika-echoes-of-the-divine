const authScene = Scene.create({
  name: 'auth',
  data: {
    email: '',
    password: '',
    mode: 'signin', // 'signin' or 'signup'
    showSignup: false,
    buttons: [],
    scrollY: 0,
    contentHeight: 0,
    signedInUser: null
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.signedInUser = Auth.user;
    this.buildButtons();
  },

  leave: function() {
    this.data.buttons = [];
    this.data.signedInUser = null;
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
    const SD = this.data.staticDraws;
    let y = this.getContentTop();

    // --- PremiumShell form container ---
    const formH = y + 300; // estimated height, will be adjusted
    const formShell = UI.PremiumShell(20, y, G.W - 40, formH, { outerR: 12 });
    formShell.render(ctx);
    SD.push({ shell: formShell });
    y += 24; // padding inside premium shell outer bezel

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

    // --- Action button (BtnGold primary) ---
    const actionBtn = UI.BtnGold(20, y, G.W - 40, 38, this.data.mode === 'signin' ? 'Sign In' : 'Sign Up');
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
            Notify.show('Sign up failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
          }
        }
      }
      // Refresh scene
      this.data.signedInUser = Auth.user;
      settingsScene.buildButtons();
    }.bind(this);
    this.data.buttons.push(actionBtn);
    y += 48;

    // --- Continue without account (ghost button / MagneticBtn ghost variant) ---
    const ghostBtn = UI.MagneticBtn(20, y, G.W - 40, 38, 'Continue without account (offline mode)', 'ghost');
    ghostBtn.onClick = function() {
      Auth.user = null;
      Notify.show('Playing in offline mode', 2, R.colors.dimGrey);
      Scene.goTo('ashram');
    };
    this.data.buttons.push(ghostBtn);
    y += 48;

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