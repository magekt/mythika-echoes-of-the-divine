const authScene = Scene.create({
  name: 'auth',
  data: {
    email: '',
    password: '',
    mode: 'signin', // 'signin' or 'signup'
    phoneNumber: '',
    verificationId: '',
    code: '',
    buttons: [],
    scrollY: 0,
    contentHeight: 0,
    signedInUser: null
  },

  enter: function() {
    this.data.buttons = [];
    this.data.scrollY = 0;
    this.data.signedInUser = Auth.user;
    this.data.phoneNumber = '';
    this.data.verificationId = '';
    this.data.code = '';
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
    let y = this.getContentTop();

    // --- PremiumShell form container ---
    const formShell = UI.PremiumShell(20, y, G.W - 40, 500, { outerR: 12 });
    this.data.staticDraws.push({ shell: formShell });
    y += 36; // padding inside premium shell outer bezel

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
      this.data.mode = this.data.mode === 'signin' ? 'signup' : 'signin';
      this.data.email = '';
      this.data.password = '';
      this.buildButtons();
    }.bind(this);
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
      if (this.data.mode === 'signin') {
        const result = await Auth.signInEmail(this.data.email, this.data.password);
        if (result.user) {
          Notify.show('Signed in as: ' + result.user.email, 2, R.colors.green);
        } else {
          Notify.show('Sign in failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
        }
      } else {
        const result = await Auth.signUpEmail(this.data.email, this.data.password);
        if (result.user) {
          Notify.show('Account created: ' + result.user.email, 2, R.colors.green);
        } else {
          Notify.show('Sign up failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
        }
      }
      // Refresh scene
      this.data.signedInUser = Auth.user;
      this.data.email = '';
      this.data.password = '';
      this.buildButtons();
    }.bind(this);
    this.data.buttons.push(actionBtn);
    y += 48;

    // --- Google Sign In button ---
    const googleBtn = UI.BtnGold(20, y, G.W - 40, 38, 'Sign in with Google');
    googleBtn.onClick = async function() {
      const result = await Auth.signInGoogle();
      if (result.user) {
        Notify.show('Signed in with Google: ' + result.user.email, 2, R.colors.green);
      } else {
        Notify.show('Google sign in failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
      }
      this.data.signedInUser = Auth.user;
      this.buildButtons();
    }.bind(this);
    this.data.buttons.push(googleBtn);
    y += 52;

    // --- Phone Sign In section ---
    const phoneInput = UI.Input(20, y, G.W - 40, 32, this.data.phoneNumber);
    phoneInput.onChange = function(val) {
      this.data.phoneNumber = val;
    }.bind(this);
    this.data.buttons.push(phoneInput);
    y += 44;

    const sendCodeBtn = UI.BtnGold(20, y, G.W - 40, 38, 'Send Verification Code');
    sendCodeBtn.onClick = async function() {
      const result = await Auth.signInPhone(this.data.phoneNumber);
      if (result.verificationId) {
        this.data.verificationId = result.verificationId;
        Notify.show('Verification code sent to ' + this.data.phoneNumber, 2, R.colors.green);
      } else {
        Notify.show('Failed to send verification code: ' + (result.error || 'unknown error'), 3, R.colors.red);
      }
    }.bind(this);
    this.data.buttons.push(sendCodeBtn);
    y += 52;

    const codeInput = UI.Input(20, y, G.W - 40, 32, this.data.code);
    codeInput.onChange = function(val) {
      this.data.code = val;
    }.bind(this);
    this.data.buttons.push(codeInput);
    y += 44;

    const verifyCodeBtn = UI.BtnGold(20, y, G.W - 40, 38, 'Verify Code');
    verifyCodeBtn.onClick = async function() {
      const result = await Auth.verifyPhoneCode(this.data.verificationId, this.data.code);
      if (result.user) {
        Notify.show('Signed in with phone: ' + result.user.phoneNumber, 2, R.colors.green);
      } else {
        Notify.show('Verification failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
      }
      this.data.signedInUser = Auth.user;
      this.data.code = '';
      this.buildButtons();
    }.bind(this);
    this.data.buttons.push(verifyCodeBtn);
    y += 52;

    // --- Continue without account (ghost button) ---
    const ghostBtn = UI.MagneticBtn(20, y, G.W - 40, 38, 'Continue without account (offline mode)', 'ghost');
    ghostBtn.onClick = function() {
      Auth.user = null;
      Notify.show('Playing in offline mode', 2, R.colors.dimGrey);
      Scene.goTo('ashram');
    };
    this.data.buttons.push(ghostBtn);
    y += 48;

    // --- Status area ---
    if (Auth.user) {
      const statusText = Auth.user.email || Auth.user.phoneNumber || Auth.user.uid;
      const statusBtn = UI.Button(20, y, G.W - 40, 32, 'Signed in as: ' + statusText);
      statusBtn._color = R.colors.textDim;
      statusBtn.render = function(ctx) {
        R.textCenter(ctx, this._label, this.x + this.w / 2, this.y + this.h / 2 + 2, this._color, R.fonts.sm);
      };
      this.data.buttons.push(statusBtn);
      y += 44;
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