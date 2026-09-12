function authFitText(ctx, text, maxWidth, font) {
  const value = String(text || '');
  if (!ctx) return value;
  ctx.save();
  ctx.font = font;
  if (ctx.measureText(value).width <= maxWidth) {
    ctx.restore();
    return value;
  }
  let result = value;
  while (result.length > 1 && ctx.measureText(result + '\u2026').width > maxWidth) result = result.slice(0, -1);
  ctx.restore();
  return result + '\u2026';
}

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
    inputs: [],
    staticDraws: [],
    scrollY: 0,
    contentHeight: 0,
    signedInUser: null
  },

  enter: function() {
    this.destroyInputs();
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.inputs = [];
    this.data.scrollY = 0;
    this.data.signedInUser = Auth.user;
    this.data.phoneNumber = '';
    this.data.verificationId = '';
    this.data.code = '';
    this.buildButtons();
  },

  leave: function() {
    this.destroyInputs();
    this.data.buttons = [];
    this.data.inputs = [];
    this.data.staticDraws = [];
    this.data.signedInUser = null;
    this.data.scrollY = 0;
    this.data.contentHeight = 0;
  },

  destroyInputs: function() {
    for (const input of this.data.inputs || []) {
      if (input && input.destroy) input.destroy();
    }
    this.data.inputs = [];
  },

  getContentTop: function() { return 86; },
  getContentHeight: function() { return G.H - this.getContentTop(); },

  clampScroll: function() {
    const ch = this.data.contentHeight;
    const vh = this.getContentHeight();
    const maxScroll = Math.max(0, ch - vh);
    if (this.data.scrollY > maxScroll) this.data.scrollY = maxScroll;
    if (this.data.scrollY < 0) this.data.scrollY = 0;
  },

  buildButtons: function() {
    this.destroyInputs();
    this.data.buttons = [];
    this.data.staticDraws = [];
    this.data.scrollY = 0;
    const top = this.getContentTop();
    const contentW = G.W - 40;
    let y = top + 54;
    const scene = this;

    const addInput = function(value, options, onChange) {
      const input = UI.Input(20, y, contentW, 58, value, options);
      input.onChange = function(next) {
        onChange(next);
        input.setError('');
      };
      scene.data.inputs.push(input);
      y += 70;
      return input;
    };

    const modeBtn = UI.MagneticBtn(20, y, contentW, 48,
      this.data.mode === 'signin' ? 'Sign in' : 'Sign up', { variant: 'secondary' });
    modeBtn.onClick = function() {
      scene.data.mode = scene.data.mode === 'signin' ? 'signup' : 'signin';
      scene.data.email = '';
      scene.data.password = '';
      scene.buildButtons();
    };
    this.data.buttons.push(modeBtn);
    y += 60;

    // Canvas-only title keeps the content hierarchy quiet while the form
    // remains one double-bezel surface on both desktop and mobile.
    const emailInput = addInput(this.data.email, {
      label: 'Email address',
      placeholder: 'name@example.com',
      type: 'email',
      autocomplete: 'email',
      inputMode: 'email'
    }, function(next) { scene.data.email = next; });
    const passwordInput = addInput(this.data.password, {
      label: this.data.mode === 'signin' ? 'Password' : 'Create password',
      placeholder: this.data.mode === 'signin' ? 'Enter your password' : 'Use 6 or more characters',
      password: true,
      autocomplete: this.data.mode === 'signin' ? 'current-password' : 'new-password'
    }, function(next) { scene.data.password = next; });

    const submitEmail = async function() {
      const result = scene.data.mode === 'signin'
        ? await Auth.signInEmail(scene.data.email, scene.data.password)
        : await Auth.signUpEmail(scene.data.email, scene.data.password);
      // An auth promise can resolve after the player has navigated away.
      // Never rebuild a scene that is no longer mounted.
      if (G.currentScene !== scene) return;
      if (result.user) {
        Notify.show((scene.data.mode === 'signin' ? 'Signed in as: ' : 'Account created: ') + result.user.email, 2, R.colors.green);
        scene.data.signedInUser = Auth.user;
        scene.data.email = '';
        scene.data.password = '';
        scene.buildButtons();
      } else {
        Notify.show((scene.data.mode === 'signin' ? 'Sign in failed: ' : 'Sign up failed: ') + (result.error || 'unknown error'), 3, R.colors.red);
        passwordInput.setError('Check your details');
      }
    };
    emailInput.onSubmit = submitEmail;
    passwordInput.onSubmit = submitEmail;

    // --- PremiumShell form container is deferred until the measured content
    // height is known; it is rendered inside the clipped content pass below.
    const titleY = top + 28;
    this.data.staticDraws.push({
      textCenter: ['Cloud save', G.W / 2, titleY, R.colors.accent, R.fonts.displaySm]
    });

    const actionBtn = UI.MagneticBtn(20, y, contentW, 48,
      this.data.mode === 'signin' ? 'Sign in' : 'Create account', { trailingIcon: 'arrow-right' });
    actionBtn.onClick = submitEmail;
    this.data.buttons.push(actionBtn);
    y += 60;

    const googleBtn = UI.MagneticBtn(20, y, contentW, 48, 'Continue with Google', { variant: 'secondary' });
    googleBtn.onClick = async function() {
      const result = await Auth.signInGoogle();
      if (G.currentScene !== scene) return;
      if (result.user) {
        Notify.show('Signed in with Google: ' + result.user.email, 2, R.colors.green);
        scene.data.signedInUser = Auth.user;
        scene.buildButtons();
      } else {
        Notify.show('Google sign in failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
      }
    };
    this.data.buttons.push(googleBtn);
    y += 68;

    // --- Phone sign in ---
    const phoneInput = addInput(this.data.phoneNumber, {
      label: 'Phone number',
      placeholder: '+1 555 123 4567',
      type: 'tel',
      autocomplete: 'tel',
      inputMode: 'tel'
    }, function(next) { scene.data.phoneNumber = next; });

    const sendCodeBtn = UI.MagneticBtn(20, y, contentW, 48, 'Send verification code', { trailingIcon: 'arrow-right' });
    sendCodeBtn.onClick = async function() {
      const result = await Auth.signInPhone(scene.data.phoneNumber);
      if (G.currentScene !== scene) return;
      if (result.verificationId) {
        scene.data.verificationId = result.verificationId;
        Notify.show('Verification code sent to ' + scene.data.phoneNumber, 2, R.colors.green);
      } else {
        Notify.show('Failed to send verification code: ' + (result.error || 'unknown error'), 3, R.colors.red);
        phoneInput.setError('Enter a valid number');
      }
    };
    this.data.buttons.push(sendCodeBtn);
    y += 60;

    const codeInput = addInput(this.data.code, {
      label: 'Verification code',
      placeholder: '6-digit code',
      autocomplete: 'one-time-code',
      inputMode: 'numeric'
    }, function(next) { scene.data.code = next; });

    const verifyCodeBtn = UI.MagneticBtn(20, y, contentW, 48, 'Verify code', { trailingIcon: 'arrow-right' });
    verifyCodeBtn.onClick = async function() {
      const result = await Auth.verifyPhoneCode(scene.data.verificationId, scene.data.code);
      if (G.currentScene !== scene) return;
      if (result.user) {
        Notify.show('Signed in with phone: ' + result.user.phoneNumber, 2, R.colors.green);
        scene.data.signedInUser = Auth.user;
        scene.data.code = '';
        scene.buildButtons();
      } else {
        Notify.show('Verification failed: ' + (result.error || 'unknown error'), 3, R.colors.red);
        codeInput.setError('Code not accepted');
      }
    };
    codeInput.onSubmit = verifyCodeBtn.onClick;
    this.data.buttons.push(verifyCodeBtn);
    y += 68;

    const ghostBtn = UI.MagneticBtn(20, y, contentW, 48, 'Continue offline', { variant: 'ghost' });
    ghostBtn.onClick = function() {
      Auth.user = null;
      Notify.show('Playing in offline mode', 2, R.colors.textDim);
      gScene('ashram');
    };
    this.data.buttons.push(ghostBtn);
    y += 60;

    if (Auth.user) {
      const statusText = Auth.user.email || Auth.user.phoneNumber || Auth.user.uid;
      this.data.staticDraws.push({
        text: ['Signed in as: ' + authFitText(G.ctx, statusText, contentW - 24, R.fonts.sm), 32, y + 18, R.colors.textSecondary, R.fonts.sm]
      });
      y += 32;
    }

    const shell = UI.PremiumShell(14, top, G.W - 28, y - top + 24, { outerR: 12 });
    this.data.staticDraws.unshift(shell);
    this.data.contentHeight = y + 24;
    this.clampScroll();
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    Scene.scrollInput(this);
    UI.updateButtons(this.data.buttons, dt);
    UI.handleButtons(this.data.buttons, -this.data.scrollY);
    for (const input of this.data.inputs) {
      input.scrollY = this.data.scrollY;
      input.viewportTop = this.getContentTop();
      input.viewportBottom = this.getContentTop() + this.getContentHeight();
      input.update(dt);
    }
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 74, 'Authentication', 22);
    R.textCenter(ctx, 'Sign in or create an account for cloud save', G.W / 2, 50, R.colors.textSecondary, R.fonts.sm);

    const top = this.getContentTop();
    const contentH = this.getContentHeight();
    Scene.clipContent(ctx, this);

    for (const draw of this.data.staticDraws) {
      if (draw && draw.render) draw.render(ctx);
    }
    Scene.drawStatic(ctx, this.data.staticDraws);
    for (const input of this.data.inputs) {
      input.scrollY = this.data.scrollY;
      input.viewportTop = top;
      input.viewportBottom = top + contentH;
      input.render(ctx);
    }
    for (const b of Scene.cullButtons(this.data.buttons, this.data.scrollY + top, contentH)) b.render(ctx);

    ctx.restore();
    Scene.drawScrollbar(ctx, top, this.data.contentHeight, contentH, this.data.scrollY);
    UI.Modal.render(ctx);
  }
});
