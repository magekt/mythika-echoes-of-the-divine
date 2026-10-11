const Audio = {
  enabled: true,
  musicOn: true,
  sfxOn: true,
  mute: false,
  _ctx: null,
  _musicNodes: [],
  _musicInterval: null,
  _currentTrack: null,
  _pendingTrack: null,
  _ambientNodes: [],
  _ambientInterval: null,
  _ambientChordIndex: 0,
  _delayNode: null,
  _delayFeedback: null,
  _delayDryGain: null,
  _delayWetGain: null,
  musicVolume: function(v) {
    if (this._musicGain) this._musicGain.gain.value = (v || 0.7) * 0.04;
  }
};

// Load persisted audio preferences on boot
Audio.loadPrefs = function() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mythika_audio') : null;
    if (raw) {
      const p = JSON.parse(raw);
      if (p.mute !== undefined) Audio.mute = !!p.mute;
      if (p.musicOn !== undefined) Audio.musicOn = !!p.musicOn;
      if (p.sfxOn !== undefined) Audio.sfxOn = !!p.sfxOn;
    }
  } catch(e) {}
};

Audio.savePrefs = function() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('mythika_audio', JSON.stringify({
      mute: Audio.mute,
      musicOn: Audio.musicOn,
      sfxOn: Audio.sfxOn
    }));
  } catch(e) {}
};

// Master mute — silences everything regardless of individual toggles
Audio.toggleMute = function() {
  Audio.mute = !Audio.mute;
  if (Audio.mute) {
    Audio.musicOn = false;
    Audio.sfxOn = false;
  }
  Audio.savePrefs();
  if (Audio.mute) Audio.stopMusic();
};

Audio.toggleMusic = function() {
  if (Audio.mute) return;
  Audio.musicOn = !Audio.musicOn;
  Audio.savePrefs();
  if (!Audio.musicOn) Audio.stopMusic();
  else Audio.playMusic(Audio._currentTrack || 'title');
};

Audio.toggleSFX = function() {
  if (Audio.mute) return;
  Audio.sfxOn = !Audio.sfxOn;
  Audio.savePrefs();
};

function initAudio() {
  // Browsers block AudioContext creation before a user gesture. Do NOT create
  // it here; Audio.unlock() runs on the first pointer/key event instead.
  try {
    const unlock = function() {
      Audio.unlock();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('touchend', unlock);
    document.addEventListener('keydown', unlock);
  } catch(e) {
    Audio.enabled = false;
  }
}

// First user gesture: create the context (or resume the blocked one) and start
// whatever music was requested while locked.
Audio.unlock = function() {
  try {
    if (!Audio._ctx) {
      Audio._ctx = new (window.AudioContext || window.webkitAudioContext)();
      Audio._musicGain = Audio._ctx.createGain();
      Audio._musicGain.gain.value = 0.04;
      Audio._musicGain.connect(Audio._ctx.destination);
    }
    const startPending = function() {
      if (Audio._pendingTrack && Audio._ctx.state === 'running') {
        const trackId = Audio._pendingTrack;
        Audio._pendingTrack = null;
        Audio.playMusic(trackId);
      }
    };
    if (Audio._ctx.state === 'suspended') {
      const p = Audio._ctx.resume();
      if (p && p.then) p.then(startPending).catch(function() {});
    }
    startPending();
  } catch(e) {
    Audio.enabled = false;
  }
};

// True when the context exists AND is running — gates every node creation so a
// suspended context never spams "not allowed to start" warnings.
Audio.ready = function() {
  return !!(Audio.enabled && Audio._ctx && Audio._ctx.state === 'running');
};

Audio.beep = function(freq, duration, type) {
  if (!Audio.sfxOn || !Audio.ready()) return;
  if (R.reducedMotion && R.reducedMotion()) return;
  try {
    const osc = Audio._ctx.createOscillator();
    const gain = Audio._ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, Audio._ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(Audio._ctx.destination);
    osc.start();
    osc.stop(Audio._ctx.currentTime + duration);
  } catch(e) {}
};

Audio.click = function() {
  // UI clicks are the flood vector when players hammer a button; gate to
  // one click sound per 45ms so node creation stays bounded.
  const now = performance.now();
  if (now - (this._clickGate || 0) < 45) return;
  this._clickGate = now;
  Audio.beep(800, 0.05, 'square');
};

// Blocked/no-op feedback: a dull knock against glass. Paired with the
// stone-hits-glass visual so valid vs invalid is unmistakable by ear.
Audio.thud = function() { Audio.beep(120, 0.09, 'triangle'); };
Audio.menuSwoosh = function() { Audio.beep(400, 0.1, 'sine'); Audio.beep(600, 0.1, 'sine'); };
Audio.attack = function() { Audio.beep(200, 0.08, 'sawtooth'); };
Audio.crit = function() { 
  Audio.beep(300, 0.06, 'square'); 
  setTimeout(() => Audio.beep(500, 0.08, 'sawtooth'), 30); 
  setTimeout(() => Audio.beep(800, 0.12, 'square'), 60); 
};
Audio.skill = function() { 
  Audio.beep(400, 0.1, 'sine'); 
  setTimeout(() => Audio.beep(600, 0.1, 'sine'), 50); 
  setTimeout(() => Audio.beep(900, 0.15, 'sine'), 100); 
};
Audio.magic = function() { Audio.beep(600, 0.15, 'sine'); Audio.beep(900, 0.1, 'sine'); };
Audio.hit = function() { Audio.beep(150, 0.1, 'square'); };
Audio.heal = function() { Audio.beep(500, 0.1, 'sine'); Audio.beep(700, 0.15, 'sine'); };
Audio.dodge = function() { Audio.beep(1200, 0.05, 'sine'); };
Audio.shield = function() { Audio.beep(250, 0.08, 'square'); Audio.beep(350, 0.08, 'square'); };
Audio.levelUp = function() {
  Audio.beep(400, 0.1, 'sine'); setTimeout(() => Audio.beep(600, 0.1, 'sine'), 100);
  setTimeout(() => Audio.beep(800, 0.15, 'sine'), 200);
};
Audio.combo = function() {
  Audio.beep(300, 0.05, 'square'); setTimeout(() => Audio.beep(500, 0.05, 'square'), 50);
  setTimeout(() => Audio.beep(700, 0.05, 'square'), 100);
  setTimeout(() => Audio.beep(900, 0.1, 'square'), 150);
};
Audio.comboMilestone = function(level) {
  const base = 400 + level * 100;
  for (let i = 0; i < Math.min(level, 5); i++) {
    setTimeout(() => Audio.beep(base + i * 150, 0.08, 'square'), i * 40);
  }
};
Audio.error = function() { Audio.beep(200, 0.3, 'sawtooth'); };

Audio.TRACKS = {
  title: {
    notes: [262, 294, 330, 349, 392, 349, 330, 294, 262, 330, 392, 523, 392, 330, 294, 262],
    tempo: 0.3,
    type: 'sine'
  },
  ashram: {
    notes: [220, 247, 262, 294, 330, 294, 262, 247, 220, 262, 330, 392, 330, 262, 247, 220],
    tempo: 0.4,
    type: 'sine'
  },
  combat_aryavarta: {
    notes: [196, 220, 262, 294, 330, 294, 262, 220, 196, 262, 330, 392, 330, 262, 220, 196],
    tempo: 0.25,
    type: 'square'
  },
  combat_dandaka: {
    notes: [185, 196, 220, 262, 294, 262, 220, 196, 185, 220, 262, 330, 262, 220, 196, 185],
    tempo: 0.2,
    type: 'sawtooth'
  },
  combat_meru: {
    notes: [262, 330, 392, 440, 523, 440, 392, 330, 262, 392, 523, 659, 523, 392, 330, 262],
    tempo: 0.18,
    type: 'square'
  },
  combat_patala: {
    notes: [165, 185, 196, 220, 196, 185, 165, 147, 165, 196, 220, 262, 220, 196, 185, 165],
    tempo: 0.22,
    type: 'sawtooth'
  },
  combat_svarga: {
    notes: [294, 349, 392, 440, 523, 440, 392, 349, 294, 392, 523, 659, 784, 659, 523, 392],
    tempo: 0.16,
    type: 'sine'
  },
  fishing: {
    notes: [330, 294, 262, 294, 330, 330, 330, 262, 294, 262, 220, 262, 330, 392, 330, 294],
    tempo: 0.5,
    type: 'sine'
  }
};

Audio.playMusic = function(trackId) {
   this.stopMusic();
   if (!this.musicOn || this.mute) return;
   if (!this.ready()) {
    // Locked (pre-gesture): remember the request; Audio.unlock() starts it.
    this._pendingTrack = trackId;
    return;
  }
  const track = this.TRACKS[trackId];
  if (!track) return;
  this._currentTrack = trackId;
  let noteIndex = 0;
  const ctx = this._ctx;

  function playNote() {
    if (!Audio.ready() || !Audio.musicOn || Audio._currentTrack !== trackId) return;
    const freq = track.notes[noteIndex];
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.type = track.type;
    osc.frequency.value = freq;
    noteGain.gain.value = 0.04;
    noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + track.tempo * 0.9);
    osc.connect(noteGain);
    noteGain.connect(Audio._musicGain);
    osc.start();
    osc.stop(ctx.currentTime + track.tempo * 0.9);
    Audio._musicNodes.push({ osc, gain: noteGain });
    noteIndex = (noteIndex + 1) % track.notes.length;
  }

  playNote();
  this._musicInterval = setInterval(playNote, track.tempo * 1000);
};

Audio.stopMusic = function() {
  if (this._musicInterval) {
    clearInterval(this._musicInterval);
    this._musicInterval = null;
  }
  for (const n of this._musicNodes) {
    try { n.osc.stop(); } catch(e) {}
  }
  this._musicNodes = [];
  this._currentTrack = null;
};

// ── Ambient drone + delay-wash system (Phase 41 — AUD-01/02/03) ──────────

Audio.playAmbient = function(trackId) {
  this.stopAmbient();
  if (!this.musicOn || this.mute) return;
  if (!this.ready()) {
    this._pendingTrack = trackId;
    return;
  }
  const ctx = this._ctx;
  const ambientDefs = {
    title: {
      chords: [
        [261.63, 311.13, 392.00, 523.25],
        [293.66, 349.23, 440.00, 587.33],
        [246.94, 293.66, 392.00, 493.88],
        [329.63, 392.00, 493.88, 659.25]
      ],
      chordMs: 6000,
      cutoff: 600,
      feedback: 0.65,
      detuneCents: 6
    },
    ashram: {
      chords: [
        [293.66, 349.23, 440.00, 587.33],
        [349.23, 415.30, 493.88, 659.25],
        [392.00, 440.00, 523.25, 659.25],
        [329.63, 392.00, 493.88, 659.25]
      ],
      chordMs: 7000,
      cutoff: 800,
      feedback: 0.60,
      detuneCents: 5
    },
    combat_dark: {
      chords: [
        [110.00, 130.81, 146.83, 185.00],
        [130.81, 155.56, 185.00, 220.00],
        [146.83, 164.81, 185.00, 233.08],
        [110.00, 138.59, 174.61, 207.65]
      ],
      chordMs: 4000,
      cutoff: 400,
      feedback: 0.70,
      detuneCents: 12
    },
    combat_boss: {
      chords: [
        [82.41, 98.00, 110.00, 130.81],
        [98.00, 116.54, 130.81, 155.56],
        [110.00, 130.81, 146.83, 174.61],
        [87.31, 103.83, 116.54, 138.59]
      ],
      chordMs: 3500,
      cutoff: 350,
      feedback: 0.75,
      detuneCents: 14
    }
  };
  const def = ambientDefs[trackId];
  if (!def) return;
  this._currentTrack = trackId;
  this._ambientChordIndex = 0;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.5;
  masterGain.connect(this._musicGain);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = def.cutoff;
  filter.Q.value = 1.2;
  filter.connect(masterGain);

  const delay = ctx.createDelay(2.0);
  delay.delayTime.value = 0.7;
  const feedback = ctx.createGain();
  feedback.gain.value = def.feedback;
  const delayDry = ctx.createGain();
  delayDry.gain.value = 0.4;
  const delayWet = ctx.createGain();
  delayWet.gain.value = 0.35;
  delay.connect(feedback);
  feedback.connect(delay);
  delayDry.connect(delay);
  delayWet.connect(delay);
  filter.connect(delayDry);
  delay.connect(masterGain);
  filter.connect(delayWet);

  this._delayNode = delay;
  this._delayFeedback = feedback;
  this._delayDryGain = delayDry;
  this._delayWetGain = delayWet;

  const chordLayer = [];
  const startChord = def.chords[0];
  for (let i = 0; i < startChord.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = startChord[i];
    osc.detune.value = (Math.random() * 2 - 1) * def.detuneCents;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2.0);
    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    chordLayer.push({ osc, gain, freq: startChord[i] });
  }
  this._ambientNodes = [masterGain, filter, delay, feedback, delayDry, delayWet];
  this._ambientChordOscs = chordLayer;

  this._ambientInterval = setInterval(function() {
    if (!Audio.ready() || !Audio.musicOn || Audio.mute) return;
    Audio._ambientChordIndex = (Audio._ambientChordIndex + 1) % def.chords.length;
    const nextChord = def.chords[Audio._ambientChordIndex];
    const oscs = Audio._ambientChordOscs;
    for (let i = 0; i < oscs.length; i++) {
      const osc = oscs[i];
      const target = nextChord[i];
      if (osc.freq !== target) {
        osc.osc.frequency.linearRampToValueAtTime(target, ctx.currentTime + 3.0);
        osc.freq = target;
      }
    }
  }, def.chordMs);
};

Audio.stopAmbient = function() {
  if (this._ambientInterval) {
    clearInterval(this._ambientInterval);
    this._ambientInterval = null;
  }
  const oscs = this._ambientChordOscs || [];
  const c = this._ctx;
  for (const o of oscs) {
    try {
      o.gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.0);
      setTimeout(function() { try { o.osc.stop(); } catch(e) {} }, 1100);
    } catch(e) {}
  }
  this._ambientChordOscs = null;
  for (const n of this._ambientNodes) {
    try { n.disconnect(); } catch(e) {}
  }
  this._ambientNodes = [];
  this._delayNode = null;
  this._delayFeedback = null;
  this._delayDryGain = null;
  this._delayWetGain = null;
};

Audio.stopAll = function() {
  this.stopMusic();
  this.stopAmbient();
};

Audio.cleanup = function() {
  this.stopAll();
  this._pendingTrack = null;
  if (this._ctx && this._ctx.state !== 'closed') {
    this._ctx.suspend().catch(function() {});
  }
};

// Pagehide listener to suspend audio when page is hidden/backgrounded
document.addEventListener('pagehide', function() {
  Audio.cleanup();
});

// ── UI SFX (Phase 40 — AUD-04) ────────────────────────────────────────────

 Audio.toast = function() {
   if (!Audio.ready() || !Audio.sfxOn || Audio.mute) return;
   if (R.reducedMotion && R.reducedMotion()) return;
  try {
    const ctx = Audio._ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch(e) {}
};

 Audio.modalOpen = function() {
   if (!Audio.ready() || !Audio.sfxOn || Audio.mute) return;
   if (R.reducedMotion && R.reducedMotion()) return;
  try {
    const ctx = Audio._ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch(e) {}
};

 Audio.btnTap = function() {
   if (!Audio.ready() || !Audio.sfxOn || Audio.mute) return;
   if (R.reducedMotion && R.reducedMotion()) return;
  try {
    const ctx = Audio._ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch(e) {}
};
