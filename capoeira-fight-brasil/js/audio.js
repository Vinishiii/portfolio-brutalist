'use strict';
// ============================================================
// ÁUDIO — tudo sintetizado via Web Audio (berimbau, atabaque,
// pandeiro, agogô, torcida e efeitos). Nenhum arquivo externo.
// ============================================================
M.audio = (function () {
  const A = { ctx: null, ready: false, settings: { volume: 0.8, music: true, sfx: true } };
  let master, musicBus, sfxBus, crowdGain, delay, noiseBuf;

  function init() {
    if (A.ctx) { resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const ctx = A.ctx = new C();
    master = ctx.createGain(); master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    delay = ctx.createDelay(1); delay.delayTime.value = 0.21;
    const fb = ctx.createGain(); fb.gain.value = 0.28; delay.connect(fb); fb.connect(delay);
    const dg = ctx.createGain(); dg.gain.value = 0.3; delay.connect(dg); dg.connect(master);
    applySettings();
    startCrowd();
    music.start();
    A.ready = true;
  }
  function resume() { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); }
  function applySettings() {
    if (!A.ctx) return;
    master.gain.value = A.settings.volume;
    musicBus.gain.value = A.settings.music ? 0.9 : 0;
    sfxBus.gain.value = A.settings.sfx ? 1 : 0;
  }
  function now() { return A.ctx ? A.ctx.currentTime : performance.now() / 1000; }
  function getNoise() {
    if (!noiseBuf) {
      const len = A.ctx.sampleRate * 2; noiseBuf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  // ---------- geradores básicos ----------
  function noise(o) {
    if (!A.ctx) return;
    const ctx = A.ctx, t = o.when || ctx.currentTime, dur = o.dur || 0.1;
    const src = ctx.createBufferSource(); src.buffer = getNoise();
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1000, t);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t + dur);
    f.Q.value = o.Q || 1;
    const g = ctx.createGain(); const a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.3, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus); if (o.echo) g.connect(delay);
    src.start(t); src.stop(t + dur + 0.05);
  }
  function tone(o) {
    if (!A.ctx) return;
    const ctx = A.ctx, t = o.when || ctx.currentTime, dur = o.dur || 0.2;
    const osc = ctx.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq || 440, t);
    if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.freqEnd), t + dur);
    if (o.detune) osc.detune.value = o.detune;
    let node = osc;
    if (o.filter) { const f = ctx.createBiquadFilter(); f.type = o.filter.type || 'lowpass'; f.frequency.setValueAtTime(o.filter.freq || 1000, t); if (o.filter.freqEnd) f.frequency.exponentialRampToValueAtTime(o.filter.freqEnd, t + dur); f.Q.value = o.filter.Q || 1; osc.connect(f); node = f; }
    if (o.vibrato) { const l = ctx.createOscillator(); l.frequency.value = o.vibrato; const lg = ctx.createGain(); lg.gain.value = o.vibDepth || 8; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const g = ctx.createGain(); const a = o.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.2, t + a);
    if (o.sustain) g.gain.setValueAtTime(o.vol || 0.2, t + dur - o.release);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(o.dest || sfxBus); if (o.echo) g.connect(delay);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // ---------- torcida (ambiente contínuo) ----------
  let crowdLevel = 0, crowdTarget = 0;
  function startCrowd() {
    const ctx = A.ctx;
    const src = ctx.createBufferSource(); src.buffer = getNoise(); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.6;
    const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 1400;
    crowdGain = ctx.createGain(); crowdGain.gain.value = 0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.35; const lg = ctx.createGain(); lg.gain.value = 0.012;
    lfo.connect(lg); lg.connect(crowdGain.gain); lfo.start();
    src.connect(f); f.connect(f2); f2.connect(crowdGain); crowdGain.connect(sfxBus);
    src.start();
    setInterval(() => { crowdLevel += (crowdTarget - crowdLevel) * 0.08; if (crowdGain) crowdGain.gain.setTargetAtTime(crowdLevel * 0.09, ctx.currentTime, 0.05); }, 50);
  }
  function crowd(level) { crowdTarget = M.clamp(level, 0, 1.5); }
  function cheer(amount = 1) {
    if (!A.ctx) return;
    noise({ dur: 0.7 * amount, type: 'bandpass', freq: 700, freqEnd: 1100, Q: 0.7, vol: 0.22 * amount, attack: 0.06 });
    noise({ dur: 0.5 * amount, type: 'bandpass', freq: 1800, Q: 0.8, vol: 0.08 * amount, attack: 0.1 });
    crowdTarget = Math.min(1.5, crowdTarget + 0.5 * amount);
    setTimeout(() => { crowdTarget = Math.max(0.3, crowdTarget - 0.5 * amount); }, 900);
  }

  // ---------- instrumentos ----------
  function berimbau(when, kind) {
    if (kind === 'B') { noise({ when, dur: 0.07, type: 'bandpass', freq: 2600, Q: 2.5, vol: 0.1, dest: musicBus }); tone({ when, freq: 196, dur: 0.1, vol: 0.07, type: 'triangle', dest: musicBus }); return; }
    const f = kind === 'L' ? 196 : 220;
    tone({ when, freq: f * 1.03, freqEnd: f, dur: 0.55, vol: 0.16, type: 'triangle', dest: musicBus, filter: { type: 'bandpass', freq: f * 2.2, Q: 2.5 } });
    tone({ when, freq: f * 2, dur: 0.3, vol: 0.05, type: 'sine', dest: musicBus });
    tone({ when, freq: f * 3.01, dur: 0.15, vol: 0.025, type: 'sine', dest: musicBus });
    noise({ when, dur: 0.035, type: 'highpass', freq: 3500, vol: 0.09, dest: musicBus });
  }
  function atabaque(when, kind) {
    if (kind === 'O') { tone({ when, freq: 150, freqEnd: 52, dur: 0.38, vol: 0.5, type: 'sine', dest: musicBus }); noise({ when, dur: 0.03, type: 'lowpass', freq: 900, vol: 0.18, dest: musicBus }); }
    else { tone({ when, freq: 320, freqEnd: 130, dur: 0.09, vol: 0.28, type: 'triangle', dest: musicBus }); noise({ when, dur: 0.05, type: 'bandpass', freq: 2000, Q: 1, vol: 0.22, dest: musicBus }); }
  }
  function pandeiro(when, accent) {
    noise({ when, dur: accent ? 0.1 : 0.05, type: 'highpass', freq: 6500, vol: accent ? 0.11 : 0.055, dest: musicBus });
    if (accent) tone({ when, freq: 190, freqEnd: 95, dur: 0.07, vol: 0.11, type: 'sine', dest: musicBus });
  }
  function agogo(when, hi) { tone({ when, freq: hi ? 1175 : 880, dur: 0.13, vol: 0.07, type: 'square', dest: musicBus, filter: { type: 'bandpass', freq: hi ? 2400 : 1800, Q: 5 } }); }
  function bass(when, freq, dur = 0.42) { tone({ when, freq, dur, vol: 0.17, type: 'sawtooth', dest: musicBus, filter: { type: 'lowpass', freq: 320, Q: 2 } }); }
  function stab(when, freqs, dur = 0.22) { freqs.forEach(f => tone({ when, freq: f, dur, vol: 0.055, type: 'sawtooth', dest: musicBus, filter: { type: 'lowpass', freq: 1800, freqEnd: 400 } })); }
  function pad(when, freqs, dur = 1.6) { freqs.forEach(f => tone({ when, freq: f, dur, vol: 0.035, type: 'triangle', attack: 0.4, dest: musicBus, vibrato: 5, vibDepth: 3 })); }

  // ---------- instrumentos nordestinos ----------
  function zabumba(when, kind) {
    if (kind === 'B') { tone({ when, freq: 95, freqEnd: 42, dur: 0.32, vol: 0.6, type: 'sine', dest: musicBus }); noise({ when, dur: 0.04, type: 'lowpass', freq: 700, vol: 0.22, dest: musicBus }); }
    else { noise({ when, dur: 0.05, type: 'highpass', freq: 2500, vol: 0.18, dest: musicBus }); tone({ when, freq: 420, freqEnd: 200, dur: 0.05, vol: 0.12, type: 'triangle', dest: musicBus }); }
  }
  function triangulo(when, open) {
    tone({ when, freq: 2640, dur: open ? 0.35 : 0.07, vol: 0.05, type: 'square', dest: musicBus, filter: { type: 'bandpass', freq: 5200, Q: 6 } });
    tone({ when, freq: 3960, dur: open ? 0.3 : 0.06, vol: 0.03, type: 'sine', dest: musicBus });
    noise({ when, dur: 0.03, type: 'highpass', freq: 7000, vol: 0.05, dest: musicBus });
  }
  function sanfona(when, freqs, dur = 0.26, vol = 0.06, dest) {
    freqs.forEach(f => { for (const dt of [-7, 7]) tone({ when, freq: f, detune: dt, dur, vol, type: 'sawtooth', attack: 0.02, dest: dest || musicBus, filter: { type: 'bandpass', freq: 1400, Q: 0.9 } }); });
  }
  function pifano(when, freq, dur = 0.3, vol = 0.07, dest) { tone({ when, freq, dur, vol, type: 'triangle', attack: 0.03, vibrato: 6, vibDepth: 6, dest: dest || musicBus }); tone({ when, freq: freq * 2, dur, vol: vol * 0.25, type: 'sine', dest: dest || musicBus }); }

  // ---------- padrões (32 passos = 2 compassos de 4/4 em semicolcheias; baião em 2/4 = 8 passos) ----------
  const _ = null;
  const PAT = {
    fight: {
      bpm: 104,
      zabumba: ['B', _, _, 'B', 'b', _, 'b', _, 'B', _, _, 'B', 'b', _, 'b', _, 'B', _, _, 'B', 'b', _, 'b', _, 'B', _, 'B', 'B', 'b', _, 'b', 'b'],
      triangulo: ['O', 'x', 'x', 'x', 'O', 'x', 'x', 'x', 'O', 'x', 'x', 'x', 'O', 'x', 'x', 'x', 'O', 'x', 'x', 'x', 'O', 'x', 'x', 'x', 'O', 'x', 'x', 'x', 'O', 'x', 'O', 'x'],
      sanfona: [[196, 247], _, [220], [247], _, _, [196, 247], _, [174.6, 220], _, [196], [220], _, _, [174.6, 220], _, [196, 247], _, [220], [247], _, _, [293.7, 349.2], _, [261.6, 329.6], _, [247], [220], _, _, [196, 247], _],
      pifano: [_, _, _, _, _, _, _, _, 392, _, 440, _, 392, _, _, _, _, _, _, _, _, _, _, _, 587.3, _, 523.3, _, 440, _, 392, _],
      bass: [98, _, _, 98, _, _, 98, _, 87.3, _, _, 87.3, _, _, 87.3, _, 98, _, _, 98, _, _, 98, _, 130.8, _, _, 123.5, _, _, 110, _],
      stab: []
    },
    menu: {
      bpm: 92,
      zabumba: ['B', _, _, 'B', _, _, 'b', _, 'B', _, _, 'B', _, _, 'b', _, 'B', _, _, 'B', _, _, 'b', _, 'B', _, _, 'B', 'b', _, 'b', _],
      triangulo: ['O', _, 'x', _, 'O', _, 'x', _, 'O', _, 'x', _, 'O', _, 'x', _, 'O', _, 'x', _, 'O', _, 'x', _, 'O', _, 'x', _, 'O', _, 'x', _],
      sanfona: [[196, 247, 293.7], _, _, _, _, _, _, _, [174.6, 220, 261.6], _, _, _, _, _, _, _, [196, 247, 293.7], _, _, _, _, _, _, _, [146.8, 174.6, 220], _, _, _, [164.8, 196, 246.9], _, _, _],
      pifano: [], bass: [], stab: [],
      pad: []
    },
    boss: { bpm: 114, inherit: 'fight' },
    boss2: { bpm: 128, inherit: 'fight', bassAlways: true, dark: true },
    ending: {
      bpm: 76,
      zabumba: ['B', _, _, _, _, _, _, _, _, _, _, _, 'b', _, _, _, 'B', _, _, 'B', _, _, _, _, _, _, _, _, 'b', _, _, _],
      triangulo: ['O', _, _, _, _, _, _, _, 'O', _, _, _, _, _, _, _, 'O', _, _, _, _, _, _, _, 'O', _, _, _, _, _, _, _],
      sanfona: [[130.8, 164.8, 196], _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, [110, 130.8, 164.8], _, _, _, _, _, _, _, [98, 123.5, 146.8], _, _, _, _, _, _, _],
      pifano: [_, _, _, _, 392, _, _, _, 440, _, _, _, 392, _, _, _, 329.6, _, _, _, _, _, _, _, 293.7, _, _, _, 261.6, _, _, _],
      bass: [], stab: [], pad: []
    },
    none: { bpm: 100 }
  };

  const music = {
    mode: 'menu', bpm: 100, step: 0, nextTime: 0, timer: null, gridStart: 0, intensity: 0, muted: false,
    start() {
      if (this.timer || !A.ctx) return;
      this.nextTime = A.ctx.currentTime + 0.05; this.gridStart = this.nextTime; this.step = 0;
      this.timer = setInterval(() => this.tick(), 30);
    },
    tick() {
      if (!A.ctx) return;
      while (this.nextTime < A.ctx.currentTime + 0.14) {
        if (this.step % 4 === 0) { this.beatWall = performance.now() + (this.nextTime - A.ctx.currentTime) * 1000; this.beatMs = 60000 / this.bpm; }
        if (!this.muted) this.playStep(this.step, this.nextTime);
        this.nextTime += 60 / this.bpm / 4;
        this.step = (this.step + 1) % 32;
      }
    },
    playStep(s, t) {
      let p = PAT[this.mode] || PAT.none;
      const base = p.inherit ? PAT[p.inherit] : p;
      const get = k => (base[k] || [])[s];
      const z = get('zabumba'); if (z) zabumba(t, z);
      const tr = get('triangulo'); if (tr) triangulo(t, tr === 'O');
      const hot = this.intensity > 0.35 || p.dark;
      const sf = get('sanfona'); if (sf) sanfona(t, p.dark ? sf.map(f => f * 0.5) : sf, this.mode === 'fight' || this.mode === 'boss' || p.dark ? 0.24 : 0.9, this.mode === 'menu' || this.mode === 'ending' ? 0.045 : 0.06);
      const pf = get('pifano'); if (pf && (hot || this.mode === 'ending')) pifano(t, pf, this.mode === 'ending' ? 0.7 : 0.25);
      const bs = get('bass'); if (bs && (this.intensity > 0.6 || p.bassAlways)) bass(t, p.dark ? bs * 0.5 : bs);
      const pa = get('pad'); if (pa) pad(t, pa);
      if (p.dark && s % 8 === 0) noise({ when: t, dur: 0.25, type: 'lowpass', freq: 200, vol: 0.12, dest: musicBus });
    },
    setMode(mode) {
      if (!PAT[mode]) mode = 'none';
      if (this.mode === mode) return;
      this.mode = mode;
      const bpm = PAT[mode].bpm || 100;
      if (bpm !== this.bpm) { this.bpm = bpm; this.gridStart = this.nextTime - (this.step % 4) * (60 / bpm / 4); }
    },
    beat() {
      // Grade de batidas em relógio de parede: funciona mesmo sem áudio (ou mudo)
      const now = performance.now();
      const ms = this.beatMs || 60000 / this.bpm;
      if (!this.beatWall) this.beatWall = now;
      const phase = (((now - this.beatWall) / ms) % 1 + 1) % 1;
      const dist = Math.min(phase, 1 - phase) * ms / 1000;
      return { phase, interval: ms / 1000, dist };
    },
    duck(sec = 1.2, to = 0) {
      if (!A.ctx) return;
      const g = musicBus.gain, t = A.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(to, t + 0.08);
      g.setValueAtTime(to, t + sec); g.linearRampToValueAtTime(A.settings.music ? 0.9 : 0, t + sec + 0.4);
    },
    silence(sec) { this.muted = true; setTimeout(() => { this.muted = false; }, sec * 1000); }
  };

  // ---------- efeitos sonoros ----------
  const SFX = {
    ui: () => tone({ freq: 880, freqEnd: 1320, dur: 0.07, vol: 0.12, type: 'square', filter: { type: 'lowpass', freq: 3000 } }),
    uiMove: () => tone({ freq: 520, dur: 0.045, vol: 0.08, type: 'square', filter: { type: 'lowpass', freq: 2500 } }),
    uiBack: () => tone({ freq: 600, freqEnd: 380, dur: 0.1, vol: 0.1, type: 'square', filter: { type: 'lowpass', freq: 2500 } }),
    whoosh: () => noise({ dur: 0.14, type: 'bandpass', freq: 1400, freqEnd: 400, Q: 1.2, vol: 0.22 }),
    whooshH: () => noise({ dur: 0.22, type: 'bandpass', freq: 900, freqEnd: 250, Q: 1, vol: 0.3 }),
    hitL: () => { noise({ dur: 0.08, type: 'lowpass', freq: 1800, vol: 0.45 }); tone({ freq: 170, freqEnd: 60, dur: 0.1, vol: 0.45, type: 'sine' }); },
    hitH: () => { noise({ dur: 0.15, type: 'lowpass', freq: 1200, vol: 0.65 }); tone({ freq: 125, freqEnd: 38, dur: 0.2, vol: 0.8, type: 'sine' }); tone({ freq: 240, dur: 0.03, vol: 0.3, type: 'square' }); zabumbaSfx(now(), false); },
    hitS: () => { noise({ dur: 0.25, type: 'lowpass', freq: 900, vol: 0.8, echo: true }); tone({ freq: 100, freqEnd: 30, dur: 0.35, vol: 1, type: 'sine', echo: true }); tone({ freq: 400, freqEnd: 120, dur: 0.08, vol: 0.3, type: 'sawtooth' }); },
    block: () => { tone({ freq: 950, freqEnd: 650, dur: 0.05, vol: 0.28, type: 'triangle' }); noise({ dur: 0.04, type: 'highpass', freq: 3000, vol: 0.18 }); },
    ko: () => { tone({ freq: 95, freqEnd: 28, dur: 0.7, vol: 1, type: 'sine', echo: true }); noise({ dur: 0.45, type: 'lowpass', freq: 650, vol: 0.6, echo: true }); sanfona(now() + 0.5, [146.8, 174.6, 220], 1.2, 0.07, sfxBus); },
    dodge: () => noise({ dur: 0.13, type: 'bandpass', freq: 2600, freqEnd: 700, Q: 1.5, vol: 0.18 }),
    perfect: () => { tone({ freq: 660, dur: 0.35, vol: 0.2, type: 'sine', vibrato: 7, vibDepth: 10, echo: true }); tone({ freq: 990, dur: 0.35, vol: 0.14, type: 'sine', vibrato: 7, vibDepth: 10, echo: true }); tone({ freq: 1320, dur: 0.5, vol: 0.08, type: 'triangle', echo: true }); cheer(0.8); },
    super: () => { sanfona(now(), [220, 277, 330, 440], 0.7, 0.12, sfxBus); zabumbaSfx(now(), true); zabumbaSfx(now() + 0.18, true); noise({ dur: 0.4, type: 'bandpass', freq: 600, freqEnd: 2000, vol: 0.25 }); },
    fire: () => { noise({ dur: 0.3, type: 'bandpass', freq: 800, Q: 0.7, vol: 0.3 }); noise({ dur: 0.12, type: 'highpass', freq: 4000, vol: 0.1 }); },
    water: () => { noise({ dur: 0.35, type: 'bandpass', freq: 1600, freqEnd: 300, Q: 0.8, vol: 0.3 }); tone({ freq: 320, freqEnd: 110, dur: 0.25, vol: 0.12, type: 'sine' }); },
    grab: () => { noise({ dur: 0.1, type: 'lowpass', freq: 900, vol: 0.4 }); tone({ freq: 200, freqEnd: 120, dur: 0.1, vol: 0.2, type: 'triangle' }); },
    taunt: () => { sanfona(now(), [196, 247, 293.7], 0.22, 0.09, sfxBus); sanfona(now() + 0.2, [220, 277, 330], 0.3, 0.09, sfxBus); },
    aboio: () => { tone({ freq: 330, freqEnd: 262, dur: 0.9, vol: 0.22, type: 'sawtooth', attack: 0.08, vibrato: 5.5, vibDepth: 12, filter: { type: 'bandpass', freq: 900, freqEnd: 600, Q: 2.5 }, echo: true }); tone({ freq: 660, freqEnd: 524, dur: 0.9, vol: 0.06, type: 'triangle', attack: 0.1, vibrato: 5.5, vibDepth: 10 }); },
    fogos: () => { noise({ dur: 0.35, type: 'bandpass', freq: 1200, freqEnd: 300, Q: 0.8, vol: 0.25, echo: true }); tone({ freq: 1800, freqEnd: 400, dur: 0.25, vol: 0.06, type: 'sine' }); },
    jump: () => tone({ freq: 280, freqEnd: 520, dur: 0.09, vol: 0.09, type: 'sine' }),
    land: () => noise({ dur: 0.06, type: 'lowpass', freq: 500, vol: 0.2 }),
    dash: () => noise({ dur: 0.1, type: 'bandpass', freq: 1000, freqEnd: 300, vol: 0.14 }),
    projectile: () => { tone({ freq: 420, freqEnd: 180, dur: 0.18, vol: 0.14, type: 'sine' }); noise({ dur: 0.15, type: 'bandpass', freq: 1200, freqEnd: 500, vol: 0.14 }); },
    burn: () => noise({ dur: 0.1, type: 'bandpass', freq: 2200, vol: 0.14 }),
    axe: () => { tone({ freq: 2640, dur: 0.3, vol: 0.09, type: 'square', filter: { type: 'bandpass', freq: 5200, Q: 6 } }); tone({ freq: 3960, dur: 0.25, vol: 0.05, type: 'sine' }); },
    counter: () => { tone({ freq: 1200, freqEnd: 300, dur: 0.12, vol: 0.2, type: 'square', filter: { type: 'lowpass', freq: 3000 } }); },
    armor: () => { tone({ freq: 150, dur: 0.12, vol: 0.3, type: 'square', filter: { type: 'lowpass', freq: 600 } }); noise({ dur: 0.08, type: 'highpass', freq: 2500, vol: 0.12 }); },
    roundStart: () => { [0, 0.11, 0.2, 0.27, 0.32].forEach((d, i) => zabumbaSfx(now() + d, i === 4)); tone({ freq: 2640, dur: 0.4, vol: 0.08, type: 'square', when: now() + 0.32, filter: { type: 'bandpass', freq: 5200, Q: 6 } }); cheer(1); },
    win: () => { [392, 440, 494, 587, 659, 784].forEach((f, i) => pifano(now() + i * 0.11, f, 0.32, 0.12, sfxBus)); sanfona(now() + 0.66, [196, 247, 293.7, 392], 0.9, 0.08, sfxBus); zabumbaSfx(now() + 0.66, true); cheer(1.4); },
    lose: () => { [330, 294, 262, 196].forEach((f, i) => tone({ freq: f, dur: 0.45, vol: 0.12, type: 'triangle', when: now() + i * 0.22, echo: true })); },
    dark: () => { tone({ freq: 60, freqEnd: 30, dur: 2.2, vol: 0.5, type: 'sine', echo: true }); noise({ dur: 1.6, type: 'lowpass', freq: 300, vol: 0.3, attack: 0.3 }); },
    patua: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.4, vol: 0.1, type: 'triangle', when: now() + i * 0.07, echo: true })); },
    type: () => tone({ freq: 1400 + Math.random() * 600, dur: 0.02, vol: 0.03, type: 'square' }),
  };
  function zabumbaSfx(when, big) { tone({ when, freq: big ? 95 : 160, freqEnd: big ? 40 : 70, dur: big ? 0.4 : 0.14, vol: big ? 0.6 : 0.3, type: 'sine' }); noise({ when, dur: 0.04, type: 'lowpass', freq: 800, vol: 0.2 }); }
  function atabaqueSfx(when, big) { tone({ when, freq: big ? 150 : 300, freqEnd: big ? 50 : 120, dur: big ? 0.4 : 0.1, vol: big ? 0.6 : 0.3, type: 'sine' }); noise({ when, dur: 0.04, type: 'lowpass', freq: 900, vol: 0.2 }); }

  function play(name) { if (!A.ctx || !A.settings.sfx) return; const f = SFX[name]; if (f) try { f(); } catch (e) { /* ignora */ } }

  return { A, init, resume, applySettings, play, music, crowd, cheer, now, get ready() { return A.ready; } };
})();
