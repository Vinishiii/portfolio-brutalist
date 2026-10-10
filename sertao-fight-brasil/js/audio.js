'use strict';
// ============================================================
// ÁUDIO — tudo sintetizado via Web Audio, sem arquivos externos.
// Cadeia: instrumentos/efeitos -> reverb procedural + compressor.
// Instrumentos: zabumba, triângulo, ganzá, sanfona (palhetas
// desafinadas), violão e baixo (Karplus-Strong), pífano (sopro).
// Efeitos em camadas (impacto = grave + corpo + estalo), vozes
// formantes, torcida com aplausos e panorâmica por posição.
// O áudio usa PRNG próprio: nunca consome Math.random do jogo.
// ============================================================
M.audio = (function () {
  const A = { ctx: null, ready: false, settings: { volume: 0.8, music: true, sfx: true } };
  let master, comp, musicBus, musicDip, sfxBus, crowdGain, crowdVoice, delay, noiseBuf, verbSend, verb;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // PRNG independente (não interfere na semente de Math.random usada pelo jogo)
  let rs = 0x9e3779b1;
  const rnd = () => { rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0; return rs / 4294967296; };
  const vary = (a, b) => a + rnd() * (b - a);
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (A.ctx) { resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const ctx = A.ctx = new C();
    master = ctx.createGain();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.22;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); musicDip = ctx.createGain(); musicBus.connect(musicDip); musicDip.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    // reverb procedural: cauda estéreo que escurece com o tempo
    verb = ctx.createConvolver(); verb.buffer = makeImpulse(1.9, 3.1);
    verbSend = ctx.createGain(); verbSend.gain.value = 1;
    const vOut = ctx.createGain(); vOut.gain.value = 0.42; verbSend.connect(verb); verb.connect(vOut); vOut.connect(master);
    const ms = ctx.createGain(); ms.gain.value = 0.2; musicBus.connect(ms); ms.connect(verbSend);
    const ss = ctx.createGain(); ss.gain.value = 0.09; sfxBus.connect(ss); ss.connect(verbSend);
    // eco curto (rinha em praça aberta)
    delay = ctx.createDelay(1); delay.delayTime.value = 0.19;
    const fb = ctx.createGain(); fb.gain.value = 0.25; const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 2400;
    delay.connect(dl); dl.connect(fb); fb.connect(delay);
    const dg = ctx.createGain(); dg.gain.value = 0.28; dl.connect(dg); dg.connect(master); dg.connect(verbSend);
    applySettings();
    startCrowd();
    music.start();
    A.ready = true;
  }
  function makeImpulse(sec, decay) {
    const ctx = A.ctx, sr = ctx.sampleRate, len = Math.floor(sr * sec), buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c); let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len; const env = Math.pow(1 - t, decay);
        const k = 0.15 + 0.8 * t; // filtro passa-baixa que fecha ao longo da cauda
        lp += (rnd() * 2 - 1 - lp) * (1 - k * 0.85);
        d[i] = lp * env * (i < sr * 0.012 ? i / (sr * 0.012) : 1);
      }
    }
    return buf;
  }
  function resume() { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); }
  function applySettings() {
    if (!A.ctx) return;
    master.gain.value = A.settings.volume;
    musicBus.gain.value = A.settings.music ? 0.72 : 0;
    sfxBus.gain.value = A.settings.sfx ? 1 : 0;
  }
  function now() { return A.ctx ? A.ctx.currentTime : performance.now() / 1000; }
  function getNoise() {
    if (!noiseBuf) {
      const len = A.ctx.sampleRate * 2; noiseBuf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = rnd() * 2 - 1;
    }
    return noiseBuf;
  }
  const curves = {};
  function driveCurve(k) {
    if (curves[k]) return curves[k];
    const n = 512, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
    return (curves[k] = c);
  }

  // saída comum: panorâmica, eco e envio extra de reverb
  function route(node, o) {
    const ctx = A.ctx; let n = node;
    if (o.drive) { const w = ctx.createWaveShaper(); w.curve = driveCurve(o.drive); w.oversample = '2x'; n.connect(w); n = w; }
    if (o.pan) { const p = ctx.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); n.connect(p); n = p; }
    n.connect(o.dest || sfxBus);
    if (o.echo) n.connect(delay);
    if (o.verb) { const s = ctx.createGain(); s.gain.value = o.verb; n.connect(s); s.connect(verbSend); }
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
    const g = ctx.createGain(); const a = o.attack || 0.003;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.3, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); route(g, o);
    src.start(t, rnd() * 1.5); src.stop(t + dur + 0.05);
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
    const g = ctx.createGain(); const a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.2, t + a);
    if (o.sustain) g.gain.setValueAtTime(o.vol || 0.2, t + dur - o.release);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); route(g, o);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // corda dedilhada: Karplus-Strong pré-calculado e guardado em cache
  const ksCache = new Map();
  function ksBuffer(freq, dur, bright, decay) {
    const key = Math.round(freq * 4) + '|' + dur + '|' + bright + '|' + decay;
    if (ksCache.has(key)) return ksCache.get(key);
    const ctx = A.ctx, sr = ctx.sampleRate, len = Math.floor(sr * dur), N = Math.max(2, Math.round(sr / freq));
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < N && i < len; i++) { prev += ((rnd() * 2 - 1) - prev) * bright; d[i] = prev; }
    for (let i = N; i < len; i++) d[i] = decay * 0.5 * (d[i - N] + d[i - N - 1 >= 0 ? i - N - 1 : i - N]);
    const fade = Math.floor(sr * 0.06); for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;
    if (ksCache.size > 160) ksCache.delete(ksCache.keys().next().value);
    ksCache.set(key, buf); return buf;
  }
  function pluck(when, freq, o = {}) {
    if (!A.ctx) return;
    const ctx = A.ctx, dur = o.dur || 0.9;
    const src = ctx.createBufferSource(); src.buffer = ksBuffer(freq, dur, o.bright || 0.55, o.decay || 0.996);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp || 3600; f.Q.value = 0.5;
    const g = ctx.createGain(); g.gain.value = (o.vol || 0.3);
    src.connect(f); f.connect(g); route(g, { dest: o.dest || musicBus, pan: o.pan, verb: o.verb });
    src.start(when); src.stop(when + dur + 0.05);
  }

  // voz sintetizada com dois formantes (grunhidos, gritos e a torcida)
  const VOWELS = { a: [800, 1250], o: [500, 900], e: [450, 2000], u: [330, 800], i: [300, 2300] };
  function formantVoice(o) {
    if (!A.ctx) return;
    const ctx = A.ctx, t = o.when || ctx.currentTime, dur = o.dur || 0.2, v = VOWELS[o.vowel || 'a'], fs = o.fscale || 1;
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(o.pitch, t); osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.pitchEnd || o.pitch * 0.8), t + dur);
    if (o.vib) { const l = ctx.createOscillator(); l.frequency.value = o.vib; const lg = ctx.createGain(); lg.gain.value = o.pitch * 0.025; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const sum = ctx.createGain(); sum.gain.value = 1;
    for (let k = 0; k < 2; k++) {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(v[k] * fs, t); if (o.vowelEnd) f.frequency.exponentialRampToValueAtTime(VOWELS[o.vowelEnd][k] * fs, t + dur);
      f.Q.value = k ? 6 : 4; const fg = ctx.createGain(); fg.gain.value = k ? 0.55 : 1; osc.connect(f); f.connect(fg); fg.connect(sum);
    }
    const g = ctx.createGain(); const a = o.attack || 0.012;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol || 0.2, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sum.connect(g); route(g, o);
    if (o.breath) noise({ when: t, dur: Math.min(dur, 0.12), type: 'bandpass', freq: 2400, Q: 0.7, vol: o.vol * 0.5, pan: o.pan, verb: o.verb });
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // ---------- torcida (ambiente contínuo + gritos e palmas) ----------
  let crowdLevel = 0, crowdTarget = 0;
  function startCrowd() {
    const ctx = A.ctx;
    const src = ctx.createBufferSource(); src.buffer = getNoise(); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 0.7;
    const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 1500;
    crowdGain = ctx.createGain(); crowdGain.gain.value = 0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.31; const lg = ctx.createGain(); lg.gain.value = 0.014;
    lfo.connect(lg); lg.connect(crowdGain.gain); lfo.start();
    src.connect(f); f.connect(f2); f2.connect(crowdGain); crowdGain.connect(sfxBus);
    src.start();
    // segunda camada: murmúrio grave com vogais ("ôôô")
    const s2 = ctx.createBufferSource(); s2.buffer = getNoise(); s2.loop = true;
    const b1 = ctx.createBiquadFilter(); b1.type = 'bandpass'; b1.frequency.value = 480; b1.Q.value = 5;
    const b2 = ctx.createBiquadFilter(); b2.type = 'bandpass'; b2.frequency.value = 1050; b2.Q.value = 5;
    crowdVoice = ctx.createGain(); crowdVoice.gain.value = 0;
    s2.connect(b1); s2.connect(b2); b1.connect(crowdVoice); b2.connect(crowdVoice); crowdVoice.connect(sfxBus); s2.start();
    setInterval(() => {
      crowdLevel += (crowdTarget - crowdLevel) * 0.08;
      if (crowdGain) { crowdGain.gain.setTargetAtTime(crowdLevel * 0.085, ctx.currentTime, 0.05); crowdVoice.gain.setTargetAtTime(crowdLevel * 0.05, ctx.currentTime, 0.1); }
    }, 50);
  }
  function crowd(level) { crowdTarget = clamp(level, 0, 1.5); }
  function clap(when, vol = 0.05, pan = 0) {
    for (let i = 0; i < 3; i++) noise({ when: when + i * vary(0.006, 0.014), dur: 0.05, type: 'bandpass', freq: vary(1300, 2100), Q: 1.4, vol: vol * vary(0.6, 1), pan: pan + vary(-0.4, 0.4), dest: sfxBus, verb: 0.2 });
  }
  function cheer(amount = 1) {
    if (!A.ctx) return;
    noise({ dur: 0.7 * amount, type: 'bandpass', freq: 800, freqEnd: 1200, Q: 0.7, vol: 0.16 * amount, attack: 0.07, verb: 0.3 });
    noise({ dur: 0.5 * amount, type: 'bandpass', freq: 2200, Q: 0.8, vol: 0.06 * amount, attack: 0.1 });
    const n = Math.round(4 + amount * 4);
    for (let i = 0; i < n; i++) {
      const female = rnd() < 0.45;
      formantVoice({ when: now() + rnd() * 0.25, pitch: female ? vary(250, 330) : vary(130, 190), pitchEnd: female ? vary(300, 420) : vary(160, 230), dur: vary(0.45, 0.9) * amount, vowel: rnd() < 0.5 ? 'o' : 'e', vowelEnd: 'a', fscale: female ? 1.15 : 1, vol: 0.022 * amount, attack: 0.08, vib: vary(5, 7), pan: vary(-0.8, 0.8), verb: 0.35 });
    }
    crowdTarget = Math.min(1.5, crowdTarget + 0.5 * amount);
    setTimeout(() => { crowdTarget = Math.max(0.3, crowdTarget - 0.5 * amount); }, 900);
    if (amount >= 0.8) for (let i = 0; i < 6; i++) clap(now() + 0.15 + i * 0.11, 0.035 * amount, 0);
  }

  // ---------- instrumentos ----------
  // zabumba: B = baixo (pele grave, maleta), b = agudo (baqueta fina), g = nota fantasma
  function zabumba(when, kind, vel = 1, pan = 0) {
    const d = musicBus;
    if (kind === 'B') {
      tone({ when, freq: 118, freqEnd: 52, dur: 0.3, vol: 0.62 * vel, type: 'sine', dest: d, pan });
      tone({ when, freq: 190, freqEnd: 80, dur: 0.1, vol: 0.2 * vel, type: 'sine', dest: d, pan });
      noise({ when, dur: 0.05, type: 'lowpass', freq: 520, vol: 0.28 * vel, dest: d, pan });
      noise({ when, dur: 0.22, type: 'bandpass', freq: 110, Q: 5, vol: 0.18 * vel, dest: d, pan });
    } else if (kind === 'b') {
      tone({ when, freq: 360, freqEnd: 230, dur: 0.08, vol: 0.2 * vel, type: 'triangle', dest: d, pan });
      noise({ when, dur: 0.05, type: 'highpass', freq: 3000, vol: 0.14 * vel, dest: d, pan });
      noise({ when, dur: 0.07, type: 'bandpass', freq: 1700, Q: 1.2, vol: 0.12 * vel, dest: d, pan });
    } else { // g
      tone({ when, freq: 300, freqEnd: 200, dur: 0.05, vol: 0.06 * vel, type: 'triangle', dest: d, pan });
      noise({ when, dur: 0.03, type: 'highpass', freq: 3000, vol: 0.05 * vel, dest: d, pan });
    }
  }
  function triangulo(when, open, vel = 1) {
    const d = musicBus, len = open ? 0.55 : 0.07;
    [[2640, 1], [3670, 0.55], [6380, 0.4], [8500, 0.22]].forEach(([f, a], i) => tone({ when, freq: f * vary(0.998, 1.002), dur: len * (1 - i * 0.12), vol: 0.028 * a * vel, type: 'sine', dest: d, pan: 0.35 }));
    noise({ when, dur: 0.02, type: 'highpass', freq: 7500, vol: 0.05 * vel, dest: d, pan: 0.35 });
  }
  function ganza(when, vel = 1) {
    noise({ when, dur: 0.04, type: 'bandpass', freq: 6200, Q: 1.1, vol: 0.05 * vel, dest: musicBus, pan: -0.4 });
    noise({ when: when + 0.012, dur: 0.03, type: 'bandpass', freq: 7600, Q: 1.2, vol: 0.03 * vel, dest: musicBus, pan: -0.4 });
  }
  // sanfona: palhetas desafinadas em coro (musette), fole e tremolo lento
  function sanfona(when, freqs, dur = 0.26, vol = 0.06, dest, o = {}) {
    if (!A.ctx) return;
    const ctx = A.ctx, d = dest || musicBus;
    freqs.forEach(freq => {
      const g = ctx.createGain(); const a = o.attack || 0.018;
      g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(vol, when + a);
      g.gain.setValueAtTime(vol * 0.9, when + Math.max(a, dur - 0.09)); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.bright || 2600; lp.Q.value = 0.6;
      const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1150; pk.gain.value = 5; pk.Q.value = 0.9;
      lp.connect(pk); pk.connect(g);
      [[-11, 'sawtooth', 0.34, 1], [0, 'square', 0.22, 1], [11, 'sawtooth', 0.34, 1], [3, 'sawtooth', 0.14, 2]].forEach(([dt, type, lv, mul]) => {
        const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = freq * mul; osc.detune.value = dt;
        const og = ctx.createGain(); og.gain.value = lv; osc.connect(og); og.connect(lp); osc.start(when); osc.stop(when + dur + 0.05);
      });
      if (dur > 0.3) { const l = ctx.createOscillator(); l.frequency.value = 5.1; const lg = ctx.createGain(); lg.gain.setValueAtTime(0, when); lg.gain.linearRampToValueAtTime(vol * 0.18, when + 0.35); l.connect(lg); lg.connect(g.gain); l.start(when); l.stop(when + dur + 0.05); }
      route(g, { dest: d, pan: o.pan || -0.15, verb: o.verb });
    });
    noise({ when, dur: 0.05, type: 'bandpass', freq: 900, Q: 0.6, vol: vol * 0.5, dest: d, attack: 0.012 });
  }
  // pífano / flauta de bambu: sopro, escorregada na entrada e vibrato tardio
  function pifano(when, freq, dur = 0.3, vol = 0.07, dest) {
    if (!A.ctx) return;
    const ctx = A.ctx, d = dest || musicBus;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(vol, when + 0.045); g.gain.setValueAtTime(vol * 0.85, when + Math.max(0.05, dur - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.setValueAtTime(freq * 0.965, when); o1.frequency.exponentialRampToValueAtTime(freq, when + 0.05);
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(freq * 2 * 0.965, when); o2.frequency.exponentialRampToValueAtTime(freq * 2, when + 0.05);
    const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2);
    const l = ctx.createOscillator(); l.frequency.value = 5.6; const lg = ctx.createGain(); lg.gain.setValueAtTime(0, when); lg.gain.linearRampToValueAtTime(freq * 0.012, when + Math.min(0.4, dur)); l.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    o1.connect(g); g2.connect(g); route(g, { dest: d, pan: 0.2, verb: 0.35 });
    noise({ when, dur: dur * 0.9, type: 'bandpass', freq: freq * 3, Q: 2.5, vol: vol * 0.55, dest: d, attack: 0.03, pan: 0.2 });
    o1.start(when); o2.start(when); l.start(when); o1.stop(when + dur + 0.05); o2.stop(when + dur + 0.05); l.stop(when + dur + 0.05);
  }
  function violao(when, midis, dir = 1, vel = 1) {
    const list = dir > 0 ? midis : midis.slice().reverse();
    list.forEach((m, i) => pluck(when + i * 0.014 * (0.7 + vel * 0.3), mtof(m), { dur: 0.7, vol: 0.075 * vel * vary(0.85, 1.05), bright: 0.5, decay: 0.994, lp: 3200, pan: -0.25, verb: 0.15 }));
  }
  function baixo(when, freq, dur = 0.4, vol = 0.2) {
    pluck(when, freq, { dur: Math.max(0.45, dur), vol: vol * 1.1, bright: 0.3, decay: 0.993, lp: 900, pan: 0.05 });
    tone({ when, freq, dur, vol: vol * 0.7, type: 'sine', dest: musicBus, attack: 0.008 });
  }
  function pad(when, freqs, dur = 1.8, vol = 0.03) { freqs.forEach(f => { for (const dt of [-6, 6]) tone({ when, freq: f, detune: dt, dur, vol, type: 'triangle', attack: 0.5, dest: musicBus, vibrato: 4.5, vibDepth: 3, filter: { type: 'lowpass', freq: 1800 } }); }); }
  function synthLead(when, freq, dur, vol) { tone({ when, freq, dur, vol: vol * 0.9, type: 'square', attack: 0.01, dest: musicBus, filter: { type: 'lowpass', freq: 3200, freqEnd: 900, Q: 4 }, echo: true }); tone({ when, freq: freq * 1.005, dur, vol: vol * 0.5, type: 'sawtooth', attack: 0.01, dest: musicBus, filter: { type: 'lowpass', freq: 2400, freqEnd: 700, Q: 3 } }); }

  // ---------- teoria: escalas, acordes e frases ----------
  const SCALES = { mix: [0, 2, 4, 5, 7, 9, 10], ion: [0, 2, 4, 5, 7, 9, 11], dor: [0, 2, 3, 5, 7, 9, 10], min: [0, 2, 3, 5, 7, 8, 10] };
  const PROG = {
    mix: [[0, 'M'], [-2, 'M'], [5, 'M'], [0, 'M']],
    ion: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M']],
    dor: [[0, 'm'], [5, 'M'], [0, 'm'], [-2, 'M']],
    min: [[0, 'm'], [-4, 'M'], [-2, 'M'], [0, 'm']]
  };
  const degMidi = (root, scale, n) => root + SCALES[scale][((n % 7) + 7) % 7] + 12 * Math.floor(n / 7);
  const triad = (rootMidi, q) => [rootMidi, rootMidi + (q === 'm' ? 3 : 4), rootMidi + 7];
  // frases de 4 compassos: [passo(0-63), grau, duração em semicolcheias]
  const PHR = {
    fightA: [[0, 4, 3], [3, 2, 1], [4, 4, 2], [6, 2, 2], [8, 0, 3], [11, 2, 1], [12, 4, 4], [16, 3, 3], [19, 1, 1], [20, 3, 2], [22, 1, 2], [24, 6, 3], [27, 5, 1], [28, 3, 4], [32, 2, 3], [35, 3, 1], [36, 4, 2], [38, 5, 2], [40, 7, 3], [43, 5, 1], [44, 4, 4], [48, 4, 2], [50, 2, 2], [52, 0, 2], [54, 2, 1], [55, 4, 1], [56, 2, 4], [60, 0, 4]],
    fightB: [[0, 7, 2], [2, 6, 1], [3, 7, 1], [4, 9, 4], [8, 7, 2], [10, 4, 2], [12, 5, 2], [14, 4, 2], [16, 6, 3], [19, 5, 1], [20, 3, 2], [22, 5, 2], [24, 3, 4], [28, 1, 2], [30, 3, 2], [32, 4, 2], [34, 5, 2], [36, 7, 2], [38, 9, 2], [40, 8, 3], [43, 7, 1], [44, 5, 4], [48, 7, 2], [50, 4, 2], [52, 2, 2], [54, 4, 2], [56, 0, 6], [62, 2, 2]],
    menu: [[0, 4, 8], [8, 2, 6], [16, 3, 8], [24, 1, 6], [32, 2, 8], [40, 4, 6], [48, 5, 6], [54, 4, 2], [56, 2, 8]],
    ending: [[0, 7, 10], [12, 6, 4], [16, 5, 10], [28, 4, 4], [32, 2, 10], [44, 3, 4], [48, 4, 8], [56, 0, 8]],
    boss: [[0, 4, 2], [2, 4, 2], [4, 6, 2], [6, 4, 2], [8, 3, 4], [12, 2, 2], [14, 3, 2], [16, 4, 2], [18, 4, 2], [20, 6, 2], [22, 7, 2], [24, 6, 4], [28, 4, 4], [32, 4, 2], [34, 4, 2], [36, 6, 2], [38, 4, 2], [40, 2, 4], [44, 3, 2], [46, 2, 2], [48, 0, 4], [52, 2, 2], [54, 3, 2], [56, 4, 8]]
  };
  const THEMES = {
    default: { root: 55, scale: 'mix', bpm: 104, lead: 'sanfona' },
    porto: { root: 55, scale: 'mix', bpm: 104, lead: 'sanfona' },
    ladeira: { root: 57, scale: 'ion', bpm: 114, lead: 'sanfona' },
    rio: { root: 50, scale: 'mix', bpm: 98, lead: 'pifano' },
    sertao: { root: 52, scale: 'mix', bpm: 108, lead: 'sanfona' },
    terreiro: { root: 55, scale: 'ion', bpm: 118, lead: 'sanfona' },
    pantanal: { root: 57, scale: 'dor', bpm: 96, lead: 'pifano' },
    galpao: { root: 48, scale: 'min', bpm: 118, lead: 'synth' },
    mata: { root: 50, scale: 'dor', bpm: 92, lead: 'pifano' },
    estrada: { root: 47, scale: 'min', bpm: 100, lead: 'sanfona', dark: true },
    beco: { root: 54, scale: 'min', bpm: 96, lead: 'sanfona', dark: true },
    parnaiba: { root: 52, scale: 'dor', bpm: 90, lead: 'pifano' },
    cinzas: { root: 48, scale: 'min', bpm: 112, lead: 'sanfona', dark: true }
  };

  // ---------- trilha: 64 passos = 4 compassos em semicolcheias ----------
  const _ = null;
  const ZAB = ['B', _, 'g', 'B', 'b', _, 'b', 'g', 'B', _, 'g', 'B', 'b', _, 'b', _];
  const ZAB_FILL = ['B', _, 'b', 'B', 'b', 'b', 'B', 'b', 'B', 'b', 'B', 'b', 'B', 'B', 'b', 'b'];
  const music = {
    mode: 'menu', theme: 'default', bpm: 100, step: 0, nextTime: 0, timer: null, loops: 0, intensity: 0, muted: false,
    start() {
      if (this.timer || !A.ctx) return;
      this.nextTime = A.ctx.currentTime + 0.05; this.step = 0;
      this.timer = setInterval(() => this.tick(), 30);
    },
    tick() {
      if (!A.ctx) return;
      while (this.nextTime < A.ctx.currentTime + 0.14) {
        if (this.step % 4 === 0) { this.beatWall = performance.now() + (this.nextTime - A.ctx.currentTime) * 1000; this.beatMs = 60000 / this.bpm; }
        if (!this.muted) { try { this.playStep(this.step, this.nextTime); } catch (e) { /* nunca derruba o loop */ } }
        this.nextTime += 60 / this.bpm / 4;
        this.step = (this.step + 1) % 64; if (this.step === 0) this.loops++;
      }
    },
    playStep(s, t) {
      const mode = this.mode; if (mode === 'none') return;
      const th = THEMES[this.theme] || THEMES.default;
      const bar = (s >> 4) & 3, b16 = s & 15, chord = PROG[th.scale][bar];
      const rootM = th.root + chord[0], tri = triad(rootM + 12, chord[1]);
      const hot = this.intensity > 0.35, hotter = this.intensity > 0.6;
      const human = () => rnd() * 0.006;
      const phrase = PHR[mode === 'menu' ? 'menu' : mode === 'ending' ? 'ending' : (mode === 'boss' || mode === 'boss2') ? 'boss' : (this.loops % 2 ? 'fightB' : 'fightA')];
      const dark = mode === 'boss' || mode === 'boss2' || th.dark;
      const vel = () => vary(0.85, 1.05);

      if (mode === 'menu' || mode === 'ending') {
        // Peça lenta e lírica: arpejo de violão, pad e melodia
        const slow = mode === 'ending';
        if (b16 % 2 === 0) { const arp = [tri[0] - 12, tri[1] - 12, tri[2] - 12, tri[1], tri[2], tri[1]]; const m = arp[(b16 / 2) % arp.length]; pluck(t, mtof(m + 12), { dur: 1.1, vol: 0.085, bright: 0.45, decay: 0.996, lp: 2800, pan: -0.2, verb: 0.3 }); }
        if (b16 === 0) { pad(t, [mtof(tri[0]), mtof(tri[1]), mtof(tri[2])], 16 * 60 / this.bpm / 4 * 1.05, slow ? 0.03 : 0.024); if (bar % 2 === 0) baixo(t, mtof(rootM - 12 + 12), 0.9, 0.12); }
        if (!slow && (b16 === 0 || b16 === 8)) zabumba(t, b16 === 0 ? 'B' : 'b', 0.55);
        if (!slow && b16 % 4 === 2) triangulo(t, false, 0.7);
        phrase.forEach(([st, deg, len]) => {
          if (st !== s) return; const f = mtof(degMidi(th.root + 12, th.scale, deg)); const d = len * 60 / this.bpm / 4;
          if (slow) pifano(t, f, d * 0.95, 0.075); else sanfona(t, [f], d * 0.98, 0.05, null, { attack: 0.05, bright: 1900, verb: 0.35 });
        });
        return;
      }

      // ----- luta: ritmo (zabumba, triângulo, ganzá) -----
      const bossHeavy = dark || mode === 'boss2';
      const zs = (bar === 3 && b16 >= 8 && (hot || bossHeavy)) ? ZAB_FILL[b16] : ZAB[b16];
      if (zs) zabumba(t + human(), zs, (zs === 'B' ? 1 : 0.9) * vel() * (bossHeavy ? 1.12 : 1));
      if (bossHeavy && b16 % 8 === 0) zabumba(t, 'B', 0.5);
      if (b16 % 2 === 0) triangulo(t + human(), b16 % 4 === 0, (b16 % 4 === 0 ? 1 : 0.65) * vel());
      else if (hot && b16 % 4 === 3) triangulo(t, false, 0.4);
      if (hot && b16 % 2 === 1) ganza(t + human(), b16 % 4 === 3 ? 1 : 0.6);

      // ----- harmonia: violão (rasgueado) e acordes de sanfona -----
      const strum = [0, 3, 6, 8, 11, 14];
      const si = strum.indexOf(b16);
      if (si >= 0) { const m = [tri[0] - 12, tri[1] - 12, tri[2] - 12, tri[0], tri[1]]; violao(t + human(), m, si % 2 === 0 ? 1 : -1, si === 0 ? 1.1 : si % 2 === 0 ? 0.85 : 0.65); }
      if (b16 === 4 || b16 === 12) sanfona(t, tri.map(m => mtof(m - (dark ? 12 : 0))), 0.2, 0.034, null, { attack: 0.012 });
      if (bossHeavy && b16 === 0 && bar % 2 === 0) pad(t, [mtof(rootM - 12), mtof(rootM - 5)], 16 * 60 / this.bpm / 4 * 2, 0.035);

      // ----- baixo -----
      const bt = [[0, 0], [6, 7], [8, 0], [12, 7], [14, -5]].find(x => x[0] === b16);
      if (bt && (this.intensity > 0.2 || bossHeavy)) { let bm = rootM - 12 + bt[1]; while (bm < 38) bm += 12; baixo(t, mtof(bm), 0.3, hotter || bossHeavy ? 0.22 : 0.15); }

      // ----- melodia (sanfona/pífano/sintetizador) e contracanto -----
      phrase.forEach(([st, deg, len]) => {
        if (st !== s) return; const m = degMidi(th.root + 12 + (th.lead === 'pifano' ? 12 : 0) - (dark ? 12 : 0), th.scale, deg); const f = mtof(m); const d = len * 60 / this.bpm / 4;
        if (th.lead === 'pifano') pifano(t, f, d * 0.92, 0.085);
        else if (th.lead === 'synth') synthLead(t, f, d, 0.05);
        else sanfona(t, [f], d * 0.95, 0.056, null, { verb: 0.2 });
        if (hotter && th.lead !== 'pifano') pifano(t + 0.012, f >= 700 ? f : f * 2, d * 0.7, 0.03);
      });
      if (hot && th.lead === 'pifano' && b16 % 4 === 0) sanfona(t, [mtof(tri[0]), mtof(tri[2])], 0.3, 0.032);
      if (hotter && this.loops % 2 === 1 && b16 % 8 === 6 && th.lead !== 'pifano') pifano(t, mtof(degMidi(th.root + 24, th.scale, (s * 3) % 7)), 0.22, 0.04);

      // torcida bate palma no 2 e 4
      if (crowdLevel > 0.55 && b16 % 8 === 4) clap(t, 0.028 + crowdLevel * 0.012);
      if (mode === 'boss2' && b16 === 0 && bar === 0) noise({ when: t, dur: 0.9, type: 'bandpass', freq: 400, freqEnd: 3000, Q: 1, vol: 0.06, dest: musicBus, attack: 0.5 });
      if (dark && b16 === 0 && bar === 0) tone({ when: t, freq: mtof(rootM - 24), dur: 3.2, vol: 0.06, type: 'sawtooth', attack: 0.8, dest: musicBus, filter: { type: 'lowpass', freq: 220, Q: 3 } });
    },
    setMode(mode, stage) {
      if (!['menu', 'fight', 'boss', 'boss2', 'ending', 'none'].includes(mode)) mode = 'none';
      let theme = this.theme;
      if (mode === 'fight' || mode === 'boss' || mode === 'boss2') theme = stage && THEMES[stage] ? stage : (mode === 'fight' ? this.theme : 'cinzas');
      else if (mode === 'menu' || mode === 'ending') theme = mode === 'menu' ? 'ladeira' : 'rio';
      if (this.mode === mode && this.theme === theme) return;
      const wasFight = ['fight', 'boss', 'boss2'].includes(this.mode), isFight = ['fight', 'boss', 'boss2'].includes(mode);
      this.mode = mode; this.theme = theme;
      let bpm = (THEMES[theme] || THEMES.default).bpm;
      if (mode === 'menu') bpm = 92; else if (mode === 'ending') bpm = 72; else if (mode === 'boss') bpm = Math.max(bpm, 112); else if (mode === 'boss2') bpm = 132;
      this.bpm = bpm;
      if (!(wasFight && isFight)) { this.step = 0; this.loops = 0; }
    },
    beat() {
      // Grade de batidas em relógio de parede: funciona mesmo sem áudio (ou mudo)
      const t0 = performance.now();
      const ms = this.beatMs || 60000 / this.bpm;
      if (!this.beatWall) this.beatWall = t0;
      const phase = (((t0 - this.beatWall) / ms) % 1 + 1) % 1;
      const dist = Math.min(phase, 1 - phase) * ms / 1000;
      return { phase, interval: ms / 1000, dist };
    },
    duck(sec = 1.2, to = 0) {
      if (!A.ctx) return;
      const g = musicBus.gain, t = A.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(to, t + 0.08);
      g.setValueAtTime(to, t + sec); g.linearRampToValueAtTime(A.settings.music ? 0.72 : 0, t + sec + 0.4);
    },
    // abaixa a música por um instante em golpes fortes (pra o impacto "respirar")
    dip(depth = 0.5, sec = 0.16) {
      if (!A.ctx) return;
      const g = musicDip.gain, t = A.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(1 - depth, t + 0.01); g.linearRampToValueAtTime(1, t + sec);
    },
    silence(sec) { this.muted = true; setTimeout(() => { this.muted = false; }, sec * 1000); }
  };

  // ---------- vozes dos lutadores ----------
  const VOICES = {
    zeca: { p: 135, f: 1 }, bia: { p: 235, f: 1.15 }, mare: { p: 215, f: 1.14 }, tiao: { p: 92, f: 0.9 }, bene: { p: 120, f: 0.98 }, juvenal: { p: 108, f: 0.94 },
    vinicius: { p: 122, f: 0.97 }, cinzas: { p: 98, f: 0.92 }, fulozinha: { p: 290, f: 1.2 }, mula: { p: 200, f: 1.1 }, papafigo: { p: 82, f: 0.88 }, cuia: { p: 112, f: 0.95 }
  };
  const voiceCd = {};
  function voice(kind, id, x) {
    if (!A.ctx || !A.settings.sfx) return;
    try { voiceInner(kind, id, x); } catch (e) { /* ignora */ }
  }
  function voiceInner(kind, id, x) {
    const key = id + kind; const t = A.ctx.currentTime; if (voiceCd[key] && t - voiceCd[key] < 0.14) return; voiceCd[key] = t;
    const v = VOICES[id] || { p: 120, f: 1 }, pan = panOf(x), j = vary(0.94, 1.07);
    const base = { fscale: v.f, pan, verb: 0.2, breath: true };
    if (kind === 'kiai') formantVoice(Object.assign({ pitch: v.p * 1.25 * j, pitchEnd: v.p * 1.05, dur: 0.17, vowel: 'a', vol: 0.12, attack: 0.01 }, base));
    else if (kind === 'hurt') formantVoice(Object.assign({ pitch: v.p * 1.5 * j, pitchEnd: v.p * 0.9, dur: 0.2, vowel: 'o', vowelEnd: 'a', vol: 0.15, attack: 0.008 }, base));
    else if (kind === 'hurtH') formantVoice(Object.assign({ pitch: v.p * 1.9 * j, pitchEnd: v.p * 0.8, dur: 0.38, vowel: 'a', vowelEnd: 'o', vol: 0.2, attack: 0.008, vib: 7 }, base));
    else if (kind === 'ko') formantVoice(Object.assign({ pitch: v.p * 1.7, pitchEnd: v.p * 0.55, dur: 0.85, vowel: 'a', vowelEnd: 'u', vol: 0.22, attack: 0.01, vib: 5.5, verb: 0.4 }, base));
    else if (kind === 'win') { formantVoice(Object.assign({ pitch: v.p * 1.4, pitchEnd: v.p * 1.9, dur: 0.5, vowel: 'o', vowelEnd: 'e', vol: 0.16, attack: 0.03, vib: 6, verb: 0.4 }, base)); }
    else if (kind === 'grunt') formantVoice(Object.assign({ pitch: v.p * 1.1 * j, pitchEnd: v.p * 0.8, dur: 0.12, vowel: 'u', vol: 0.1, attack: 0.01 }, base));
  }
  const panOf = x => (x == null ? 0 : clamp((x - 480) / 480 * 0.6, -0.6, 0.6));

  // ---------- efeitos sonoros (em camadas, com variação) ----------
  const SFX = {
    ui: () => { tone({ freq: 880, dur: 0.12, vol: 0.1, type: 'sine', attack: 0.003 }); tone({ freq: 1760, dur: 0.07, vol: 0.04, type: 'sine' }); tone({ when: now() + 0.05, freq: 1320, dur: 0.14, vol: 0.09, type: 'sine' }); },
    uiMove: () => { tone({ freq: vary(1050, 1150), freqEnd: 780, dur: 0.045, vol: 0.09, type: 'sine' }); noise({ dur: 0.012, type: 'highpass', freq: 3000, vol: 0.05 }); },
    uiBack: () => { tone({ freq: 700, freqEnd: 420, dur: 0.12, vol: 0.1, type: 'sine' }); tone({ freq: 350, dur: 0.09, vol: 0.05, type: 'triangle' }); },
    whoosh: p => noise({ dur: vary(0.12, 0.17), type: 'bandpass', freq: vary(900, 1300), freqEnd: vary(2600, 3400), Q: 0.9, vol: 0.2, attack: 0.04, pan: p }),
    whooshH: p => { noise({ dur: vary(0.2, 0.27), type: 'bandpass', freq: vary(500, 700), freqEnd: vary(1800, 2400), Q: 0.8, vol: 0.3, attack: 0.07, pan: p, verb: 0.15 }); noise({ dur: 0.18, type: 'lowpass', freq: 400, vol: 0.12, attack: 0.05, pan: p }); },
    hitL: p => {
      const k = vary(0.92, 1.1);
      tone({ freq: 190 * k, freqEnd: 70, dur: 0.1, vol: 0.5, type: 'sine', pan: p });
      noise({ dur: 0.075, type: 'lowpass', freq: 2400, freqEnd: 700, vol: 0.45, pan: p });
      noise({ dur: 0.022, type: 'highpass', freq: 3400, vol: 0.26, pan: p });
      tone({ freq: 1500 * k, freqEnd: 600, dur: 0.02, vol: 0.07, type: 'triangle', pan: p });
    },
    hitH: p => {
      const k = vary(0.92, 1.08);
      tone({ freq: 135 * k, freqEnd: 40, dur: 0.3, vol: 0.9, type: 'sine', pan: p, verb: 0.15 });
      noise({ dur: 0.17, type: 'lowpass', freq: 1500, freqEnd: 350, vol: 0.7, pan: p });
      noise({ dur: 0.05, type: 'bandpass', freq: 2800, Q: 1.2, vol: 0.45, pan: p });
      tone({ freq: 260 * k, freqEnd: 130, dur: 0.06, vol: 0.28, type: 'triangle', pan: p });
      zabumba(now(), 'B', 0.4, p); music.dip(0.35, 0.14);
    },
    hitS: p => {
      tone({ freq: 100, freqEnd: 28, dur: 0.55, vol: 1, type: 'sine', pan: p, echo: true, verb: 0.35 });
      noise({ dur: 0.3, type: 'lowpass', freq: 1100, freqEnd: 200, vol: 0.85, pan: p, echo: true, verb: 0.3 });
      noise({ dur: 0.08, type: 'bandpass', freq: 2400, Q: 1, vol: 0.55, pan: p });
      tone({ freq: 420, freqEnd: 110, dur: 0.12, vol: 0.35, type: 'sawtooth', drive: 6, pan: p });
      zabumba(now(), 'B', 0.9, p); music.dip(0.6, 0.3);
    },
    block: p => { tone({ freq: 1250, freqEnd: 820, dur: 0.05, vol: 0.22, type: 'sine', pan: p }); tone({ freq: 640, freqEnd: 440, dur: 0.07, vol: 0.2, type: 'triangle', pan: p }); noise({ dur: 0.045, type: 'bandpass', freq: 3200, Q: 2, vol: 0.2, pan: p }); noise({ dur: 0.08, type: 'lowpass', freq: 900, vol: 0.18, pan: p }); },
    ko: p => {
      tone({ freq: 95, freqEnd: 26, dur: 0.9, vol: 1, type: 'sine', echo: true, verb: 0.4, pan: p });
      noise({ dur: 0.5, type: 'lowpass', freq: 700, freqEnd: 150, vol: 0.6, echo: true, verb: 0.4 });
      noise({ dur: 0.07, type: 'bandpass', freq: 2600, Q: 1, vol: 0.5 });
      sanfona(now() + 0.55, [mtof(50), mtof(53), mtof(57)], 1.3, 0.06, sfxBus, { attack: 0.08, verb: 0.5 });
      music.dip(0.7, 1.2);
    },
    dodge: p => { noise({ dur: 0.15, type: 'bandpass', freq: 3000, freqEnd: 600, Q: 1.3, vol: 0.18, attack: 0.02, pan: p }); noise({ dur: 0.1, type: 'highpass', freq: 5000, vol: 0.06, pan: p }); },
    perfect: () => { [660, 990].forEach((f, i) => tone({ when: now() + i * 0.04, freq: f, dur: 0.5, vol: 0.14, type: 'sine', vibrato: 6, vibDepth: 6, echo: true, verb: 0.4 })); tone({ freq: 1320, dur: 0.7, vol: 0.06, type: 'triangle', verb: 0.5 }); triangulo(now(), true, 1.8); cheer(0.8); },
    super: () => {
      noise({ dur: 0.7, type: 'bandpass', freq: 400, freqEnd: 3200, Q: 1, vol: 0.28, attack: 0.5, verb: 0.3 });
      sanfona(now(), [mtof(57), mtof(61), mtof(64), mtof(69)], 0.75, 0.1, sfxBus, { attack: 0.03, verb: 0.35 });
      zabumba(now(), 'B', 1); zabumba(now() + 0.18, 'B', 1); zabumba(now() + 0.3, 'b', 1);
      tone({ freq: 60, freqEnd: 30, dur: 0.8, vol: 0.5, type: 'sine', verb: 0.3 }); music.dip(0.6, 0.5);
    },
    fire: p => { noise({ dur: 0.34, type: 'bandpass', freq: 700, freqEnd: 1100, Q: 0.7, vol: 0.28, attack: 0.04, pan: p, verb: 0.2 }); for (let i = 0; i < 5; i++) noise({ when: now() + rnd() * 0.3, dur: 0.012, type: 'highpass', freq: vary(3500, 7000), vol: 0.1, pan: p }); noise({ dur: 0.3, type: 'lowpass', freq: 280, vol: 0.18, pan: p }); },
    water: p => { noise({ dur: 0.38, type: 'bandpass', freq: 1700, freqEnd: 350, Q: 0.8, vol: 0.28, pan: p, verb: 0.3 }); for (let i = 0; i < 5; i++) tone({ when: now() + 0.03 + i * 0.045, freq: vary(500, 900), freqEnd: vary(1200, 1900), dur: 0.05, vol: 0.06, type: 'sine', pan: p }); tone({ freq: 300, freqEnd: 100, dur: 0.25, vol: 0.12, type: 'sine', pan: p }); },
    grab: p => { noise({ dur: 0.11, type: 'bandpass', freq: 500, Q: 0.6, vol: 0.38, pan: p }); noise({ dur: 0.06, type: 'highpass', freq: 2000, vol: 0.1, pan: p }); tone({ freq: 190, freqEnd: 110, dur: 0.1, vol: 0.2, type: 'triangle', pan: p }); },
    taunt: () => { sanfona(now(), [mtof(55), mtof(59), mtof(62)], 0.2, 0.08, sfxBus); sanfona(now() + 0.2, [mtof(57), mtof(61), mtof(64)], 0.3, 0.08, sfxBus, { verb: 0.3 }); },
    aboio: () => { formantVoice({ pitch: 300, pitchEnd: 230, dur: 1.1, vowel: 'o', vowelEnd: 'a', vol: 0.2, attack: 0.1, vib: 5.5, echo: true, verb: 0.5 }); formantVoice({ pitch: 600, pitchEnd: 460, dur: 1, vowel: 'o', vol: 0.05, attack: 0.12, vib: 5.5, verb: 0.5 }); },
    fogos: () => { noise({ dur: 0.45, type: 'bandpass', freq: 1500, freqEnd: 300, Q: 0.8, vol: 0.25, echo: true, verb: 0.5 }); tone({ freq: 2000, freqEnd: 400, dur: 0.3, vol: 0.05, type: 'sine' }); noise({ when: now() + 0.35, dur: 0.25, type: 'highpass', freq: 3000, vol: 0.12, verb: 0.5 }); },
    jump: p => { tone({ freq: 260, freqEnd: 520, dur: 0.09, vol: 0.07, type: 'sine', pan: p }); noise({ dur: 0.06, type: 'lowpass', freq: 600, vol: 0.12, pan: p }); },
    land: p => { tone({ freq: 110, freqEnd: 55, dur: 0.09, vol: 0.28, type: 'sine', pan: p }); noise({ dur: 0.07, type: 'lowpass', freq: 700, vol: 0.2, pan: p }); noise({ dur: 0.05, type: 'highpass', freq: 3000, vol: 0.05, pan: p }); },
    dash: p => { noise({ dur: 0.12, type: 'bandpass', freq: 1200, freqEnd: 300, vol: 0.14, attack: 0.02, pan: p }); noise({ dur: 0.06, type: 'lowpass', freq: 500, vol: 0.1, pan: p }); },
    projectile: p => { tone({ freq: 460, freqEnd: 170, dur: 0.2, vol: 0.13, type: 'sine', pan: p, verb: 0.2 }); noise({ dur: 0.18, type: 'bandpass', freq: 1300, freqEnd: 500, vol: 0.14, pan: p }); },
    burn: p => { noise({ dur: 0.12, type: 'bandpass', freq: 2200, vol: 0.12, pan: p }); noise({ dur: 0.1, type: 'lowpass', freq: 400, vol: 0.1, pan: p }); },
    axe: () => { triangulo(now(), true, 1.6); tone({ freq: 1568, dur: 0.25, vol: 0.05, type: 'sine', verb: 0.3 }); },
    counter: p => { tone({ freq: 1250, freqEnd: 300, dur: 0.14, vol: 0.18, type: 'triangle', pan: p }); noise({ dur: 0.05, type: 'bandpass', freq: 3000, Q: 2, vol: 0.2, pan: p }); },
    armor: p => { tone({ freq: 165, dur: 0.14, vol: 0.28, type: 'triangle', pan: p, filter: { type: 'lowpass', freq: 700 } }); tone({ freq: 880, freqEnd: 600, dur: 0.12, vol: 0.1, type: 'sine', pan: p }); noise({ dur: 0.09, type: 'highpass', freq: 2500, vol: 0.12, pan: p }); },
    roundStart: () => { [0, 0.11, 0.2, 0.27].forEach(d => zabumba(now() + d, 'b', 1)); zabumba(now() + 0.32, 'B', 1.1); triangulo(now() + 0.32, true, 2); cheer(1); },
    win: () => { [392, 440, 494, 587, 659, 784].forEach((f, i) => pifano(now() + i * 0.11, f, 0.34, 0.12, sfxBus)); sanfona(now() + 0.66, [mtof(55), mtof(59), mtof(62), mtof(67)], 0.95, 0.08, sfxBus, { verb: 0.4 }); zabumba(now() + 0.66, 'B', 1); triangulo(now() + 0.7, true, 2); cheer(1.4); },
    lose: () => { [330, 294, 262, 196].forEach((f, i) => { tone({ freq: f, dur: 0.5, vol: 0.1, type: 'triangle', when: now() + i * 0.24, echo: true, verb: 0.4 }); pluck(now() + i * 0.24, f / 2, { dest: sfxBus, dur: 0.9, vol: 0.14, verb: 0.3 }); }); },
    dark: () => { tone({ freq: 58, freqEnd: 28, dur: 2.4, vol: 0.55, type: 'sine', echo: true, verb: 0.5 }); noise({ dur: 1.8, type: 'lowpass', freq: 320, freqEnd: 90, vol: 0.32, attack: 0.4, verb: 0.5 }); },
    patua: () => { [523, 659, 784, 1047].forEach((f, i) => { tone({ freq: f, dur: 0.45, vol: 0.09, type: 'sine', when: now() + i * 0.07, echo: true, verb: 0.35 }); tone({ freq: f * 2.76, dur: 0.2, vol: 0.02, type: 'sine', when: now() + i * 0.07 }); }); },
    type: () => noise({ dur: 0.016, type: 'bandpass', freq: vary(1800, 3200), Q: 3, vol: 0.05 })
  };

  function play(name, x) {
    if (!A.ctx || !A.settings.sfx) return;
    const f = SFX[name];
    if (f) try { f(panOf(x)); } catch (e) { /* ignora */ }
  }

  return { A, init, resume, applySettings, play, voice, music, crowd, cheer, now, get ready() { return A.ready; } };
})();
