const Audio = {
  enabled: true,
  musicOn: true,
  sfxOn: true,
  _ctx: null,
  _musicNodes: [],
  _musicInterval: null,
  _currentTrack: null,
  _musicGain: null,
  musicVolume: function(v) {
    if (this._musicGain) this._musicGain.gain.value = (v || 0.7) * 0.04;
  }
};

function initAudio() {
  try {
    Audio._ctx = new (window.AudioContext || window.webkitAudioContext)();
    Audio._musicGain = Audio._ctx.createGain();
    Audio._musicGain.gain.value = 0.04;
    Audio._musicGain.connect(Audio._ctx.destination);
  } catch(e) {
    Audio.enabled = false;
  }
}

Audio.beep = function(freq, duration, type) {
  if (!Audio.enabled || !Audio.sfxOn || !Audio._ctx) return;
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

Audio.click = function() { Audio.beep(800, 0.05, 'square'); };
Audio.menuSwoosh = function() { Audio.beep(400, 0.1, 'sine'); Audio.beep(600, 0.1, 'sine'); };
Audio.attack = function() { Audio.beep(200, 0.08, 'sawtooth'); };
Audio.magic = function() { Audio.beep(600, 0.15, 'sine'); Audio.beep(900, 0.1, 'sine'); };
Audio.hit = function() { Audio.beep(150, 0.1, 'square'); };
Audio.heal = function() { Audio.beep(500, 0.1, 'sine'); Audio.beep(700, 0.15, 'sine'); };
Audio.levelUp = function() {
  Audio.beep(400, 0.1, 'sine'); setTimeout(() => Audio.beep(600, 0.1, 'sine'), 100);
  setTimeout(() => Audio.beep(800, 0.15, 'sine'), 200);
};
Audio.combo = function() {
  Audio.beep(300, 0.05, 'square'); setTimeout(() => Audio.beep(500, 0.05, 'square'), 50);
  setTimeout(() => Audio.beep(700, 0.05, 'square'), 100);
  setTimeout(() => Audio.beep(900, 0.1, 'square'), 150);
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
  if (!this.enabled || !this.musicOn || !this._ctx) return;
  const track = this.TRACKS[trackId];
  if (!track) return;
  this._currentTrack = trackId;
  let noteIndex = 0;
  const ctx = this._ctx;

  function playNote() {
    if (!Audio.musicOn || Audio._currentTrack !== trackId) return;
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
