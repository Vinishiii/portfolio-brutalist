'use strict';
// ============================================================
// MODOS EXTRAS — modificadores e regras da rinha, paletas de cor, estatísticas,
// Maratona (sobrevivência) e Desafio do Dia.
// Tudo que é "regra" entra na partida por opções (mutators, hpFrac, pal); as telas ficam em ui2.js.
// ============================================================

// ---------- modificadores (valem para os dois lutadores) ----------
M.MUTATORS = [
  { id: 'dano', icon: '✸', name: 'Dano Dobrado', desc: 'Todo golpe machuca o dobro. Rinha curta e brava.', apply: m => { m.dmg *= 2; } },
  { id: 'curta', icon: '▽', name: 'Vida Curta', desc: 'Metade da vida pra todo mundo.', apply: m => { m.hp *= 0.5; } },
  { id: 'turbo', icon: '»', name: 'Turbo', desc: 'Todo mundo anda e corre 30% mais rápido.', apply: m => { m.speed *= 1.3; } },
  { id: 'lua', icon: '☾', name: 'Gravidade da Lua', desc: 'Pulos altos e longos; os combos no ar duram mais.', gravK: 0.62 },
  { id: 'folia', icon: '★', name: 'Torcida Eufórica', desc: 'A Energia enche duas vezes mais rápido: Peia pra todo lado.', apply: m => { m.axe *= 2; } },
  { id: 'sangue', icon: '♥', name: 'Sangue Quente', desc: 'Cada golpe que acerta devolve 25% do dano em vida.', apply: m => { m.leech = 0.25; } }
];
M.mutById = id => M.MUTATORS.find(m => m.id === id);

// ---------- regras salvas (Versus CPU e Versus 2P) ----------
M.rules = {
  ROUNDS: [1, 2, 3],
  TIMERS: [45, 60, 99, 0],
  get() {
    const r = Object.assign({ rounds: 2, timer: 99, mut: [] }, (M.store.data.settings.rules) || {});
    r.mut = (r.mut || []).filter(id => M.mutById(id));
    if (!this.ROUNDS.includes(r.rounds)) r.rounds = 2;
    if (!this.TIMERS.includes(r.timer)) r.timer = 99;
    return r;
  },
  set(r) { M.store.data.settings.rules = { rounds: r.rounds, timer: r.timer, mut: r.mut.slice() }; M.store.save(); },
  isDefault(r) { r = r || this.get(); return r.rounds === 2 && r.timer === 99 && r.mut.length === 0; },
  // opções de partida a partir das regras atuais
  forMatch() { const r = this.get(); return { rounds: r.rounds, timer: r.timer, mutators: r.mut.slice() }; }
};

// ---------- paletas alternativas ----------
// A paleta 0 é o lutador original; 1 e 2 giram o matiz das roupas (pele, cabelo e sapato ficam).
M.PAL_COUNT = 3;
M.palette = (function () {
  const cache = {};
  const hex = h => { h = String(h).trim(); if (/^#([0-9a-f]{3})$/i.test(h)) h = '#' + h.slice(1).split('').map(c => c + c).join(''); const m = /^#([0-9a-f]{6})$/i.exec(h); return m ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)] : null; };
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function hsl2hex(h, s, l) {
    h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    const to = v => Math.round((v + m) * 255).toString(16).padStart(2, '0'); return '#' + to(r) + to(g) + to(b);
  }
  const SHIFT = [0, 150, -105];
  function shift(col, idx) {
    const c = hex(col); if (!c) return col;
    const [h, s, l] = rgb2hsl(c[0], c[1], c[2]);
    if (s < 0.08) return idx === 1 ? hsl2hex(205, 0.55, M.clamp(1 - l * 0.9, 0.12, 0.88)) : hsl2hex(35, 0.6, M.clamp(1 - l * 0.9, 0.12, 0.88)); // cinzas e brancos viram cor
    return hsl2hex(h + SHIFT[idx], M.clamp(s * 1.05, 0, 1), l);
  }
  function make(def, idx) {
    idx = ((idx | 0) % M.PAL_COUNT + M.PAL_COUNT) % M.PAL_COUNT;
    if (!idx) return def;
    const key = def.id + ':' + idx; if (cache[key]) return cache[key];
    const keep = new Set(['skin', 'hair', 'shoes']), skin = def.colors.skin;
    const col = {};
    for (const k of Object.keys(def.colors)) { const v = def.colors[k]; col[k] = (keep.has(k) || v === skin) ? v : shift(v, idx); }
    const d = Object.create(def); d.colors = col; d.pid = key; d.palIdx = idx;
    return (cache[key] = d);
  }
  return make;
})();
M.PAL_NAMES = ['Original', 'Folia', 'Noite'];

// ---------- estatísticas ----------
M.stats = {
  data() {
    const p = M.store.data.progress;
    if (!p.stats) p.stats = { matches: 0, wins: 0, losses: 0, frames: 0, hits: 0, dmg: 0, maxCombo: 0, perfect: 0, supers: 0, counters: 0, finishers: 0, beats: 0, blocks: 0, fighters: {} };
    return p.stats;
  },
  // chamado a cada quadro de luta (barato): só soma e salva de tempos em tempos
  tick() { const s = this.data(); s.frames++; if (s.frames % 3600 === 0) M.store.save(); },
  record(r, o) {
    if (!r || !o || o.tutorial || o.mode === 'training') return;
    const s = this.data(); s.matches++;
    const p1h = o.p1 && o.p1.ctrl === 'human', p2h = o.p2 && o.p2.ctrl === 'human';
    const win1 = r.winnerSide === 1;
    if (p1h && !p2h) { if (win1) s.wins++; else s.losses++; }
    for (const [side, h, cfg] of [[1, p1h, o.p1], [2, p2h, o.p2]]) {
      if (!h) continue;
      const st = r.stats['p' + side], fs = s.fighters[cfg.id] || (s.fighters[cfg.id] = { m: 0, w: 0 });
      fs.m++; if (r.winnerSide === side) fs.w++;
      s.hits += st.hits || 0; s.dmg += st.dmg || 0; s.maxCombo = Math.max(s.maxCombo, st.maxCombo || 0);
      s.perfect += st.perfect || 0; s.supers += st.supers || 0; s.counters += st.counters || 0; s.beats += st.beats || 0; s.blocks += st.blocks || 0;
      if (st.finKO) s.finishers++;
    }
    M.store.save();
  },
  favorite() { const f = this.data().fighters; let best = null; for (const id in f) if (!best || f[id].m > f[best].m) best = id; return best; }
};

// ---------- Maratona (sobrevivência) ----------
M.survival = {
  run: null,
  // dificuldade da CPU pela onda, a partir do nível escolhido nas opções
  tier(wave) {
    const base = M.store.data.settings.difficulty;
    const cut = base === 'novato' ? [6, 14] : base === 'brabo' ? [0, 8] : [0, 0];
    return wave <= cut[0] ? 'novato' : wave <= cut[1] ? 'brabo' : 'lendario';
  },
  pickOpp(run) {
    const unlocked = M.store.data.progress.cinzas;
    if (run.wave % 10 === 0) return 'cinzas';
    const pool = M.ROSTER.filter(id => id !== run.p1 && id !== 'cinzas' && !run.recent.includes(id));
    const id = M.choice(pool.length ? pool : M.ROSTER.filter(i => i !== run.p1 && i !== 'cinzas'));
    return id;
  },
  start(p1, pal) {
    const sv = M.store.data.progress.surv || {};
    this.run = { p1, pal: pal || 0, wave: 0, score: 0, hpFrac: 1, patuas: [], recent: [], frames: 0, perfect: 0, maxCombo: 0, startBest: { wave: sv.bestWave || 0, score: sv.bestScore || 0 } };
    this.next();
  },
  matchOpts(run) {
    const wave = run.wave, boss = wave % 10 === 0;
    const opp = run.opp;
    const k = Math.min(wave - 1, 24);
    return {
      mode: 'survival', p1: { id: run.p1, ctrl: 'human', patuas: run.patuas.slice(), hpFrac: run.hpFrac, pal: run.pal }, p2: { id: opp, ctrl: 'cpu', mods: { dmg: 1 + 0.03 * k, hp: 1 + 0.05 * k }, pal: M.survival.oppPal(run.p1, opp) },
      stage: boss ? 'cinzas' : M.choice(M.stages.order.filter(s => s !== 'cinzas')), rounds: 1, timer: boss ? 99 : 70, difficulty: this.tier(wave), boss, survival: { wave }
    };
  },
  oppPal(p1, opp) { return p1 === opp ? 1 : 0; },
  next() {
    const run = this.run; run.wave++;
    run.opp = this.pickOpp(run); run.recent.push(run.opp); if (run.recent.length > 3) run.recent.shift();
    M.ui2.survivalIntro(run, () => this.fight());
  },
  fight() {
    const run = this.run, o = this.matchOpts(run);
    o.onEnd = r => this.end(r);
    M.flow.startMatch(o);
  },
  end(r) {
    const run = this.run; run.frames += r.frames;
    const st = r.stats.p1; run.perfect += st.perfect || 0; run.maxCombo = Math.max(run.maxCombo, st.maxCombo || 0);
    if (r.winnerSide !== 1) { this.finishRun(run.wave - 1, true); return; }
    // vitória: pontos e um pouco de vida de volta
    const wave = run.wave, hpPct = r.winner.hp / r.winner.maxHp, sec = r.frames / 60;
    const pts = 100 + wave * 25 + Math.round(hpPct * 100) + Math.max(0, Math.round(60 - sec)) * 2 + (st.perfect || 0) * 10 + (st.maxCombo || 0) * 5;
    run.score += pts; run.last = { pts, hpPct, sec };
    run.hpFrac = Math.min(1, hpPct + 0.3);
    this.achievements(wave);
    M.state = 'results';
    const proceed = () => this.next();
    if (wave % 3 === 0) {
      const opts = M.shuffle(M.PATUAS.filter(pt => !run.patuas.includes(pt.id))).slice(0, 2);
      if (opts.length) { M.ui2.survivalBreak(run, () => M.ui.patua(opts, pt => { run.patuas.push(pt.id); proceed(); })); return; }
    }
    M.ui2.survivalBreak(run, proceed);
  },
  quit() { this.finishRun(this.run.wave, false); },
  // fecha a maratona: grava os recordes e mostra o resumo
  finishRun(reached, defeat) {
    const run = this.run, p = M.store.data.progress;
    const s = p.surv = p.surv || { bestWave: 0, bestScore: 0, runs: 0 };
    s.runs++;
    const newWave = reached > run.startBest.wave, newScore = run.score > run.startBest.score;
    s.bestWave = Math.max(s.bestWave, reached); s.bestScore = Math.max(s.bestScore, run.score);
    M.store.save(); this.achievements(reached);
    M.state = 'results'; M.ui2.survivalEnd({ run, reached, newWave, newScore, best: s, defeat });
  },
  achievements(wave) { if (wave >= 5) M.ach.unlock('surv5'); if (wave >= 10) M.ach.unlock('surv10'); if (wave >= 20) M.ach.unlock('surv20'); }
};

// ---------- Desafio do Dia ----------
M.daily = (function () {
  const GOALS = [
    { id: 'noDmg', text: 'Vença sem sofrer nenhum dano.', ok: (r) => r.stats.p2.dmg === 0 },
    { id: 'combo', text: 'Acerte um combo de 6 golpes ou mais.', ok: (r) => (r.stats.p1.maxCombo || 0) >= 6 },
    { id: 'fast', text: 'Vença em menos de 45 segundos.', ok: (r) => r.frames / 60 < 45 },
    { id: 'perfect', text: 'Faça 3 esquivas perfeitas.', ok: (r) => (r.stats.p1.perfect || 0) >= 3 },
    { id: 'finisher', text: 'Nocauteie com o arremate da Peia.', ok: (r) => !!r.stats.p1.finKO }
  ];
  const pad = n => String(n).padStart(2, '0');
  const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => keyOf(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return keyOf(d); };
  const seedOf = key => { let h = 2166136261; for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return (h % 2147483646) + 1; };
  function build(key) {
    const rnd = M.seeded(seedOf(key)); rnd(); rnd();
    const unlocked = M.store.data.progress.cinzas;
    const pool = M.ROSTER.filter(id => id !== 'cinzas' || unlocked);
    const p1 = pool[Math.floor(rnd() * pool.length)];
    let p2 = p1; while (p2 === p1) p2 = pool[Math.floor(rnd() * pool.length)];
    const sts = M.stages.order.filter(s => s !== 'cinzas');
    const stage = p2 === 'cinzas' ? 'cinzas' : sts[Math.floor(rnd() * sts.length)];
    const mut = M.shuffle0(M.MUTATORS.map(m => m.id), rnd).slice(0, rnd() < 0.55 ? 1 : 2);
    const difficulty = ['brabo', 'brabo', 'lendario'][Math.floor(rnd() * 3)];
    const goal = GOALS[Math.floor(rnd() * GOALS.length)];
    return { key, p1, p2, stage, mut, difficulty, goal };
  }
  const data = () => { const p = M.store.data.progress; return p.daily || (p.daily = { done: {}, streak: 0, best: 0, last: null }); };
  return {
    GOALS, today, yesterday, build, data,
    current() { return build(today()); },
    done(key) { return data().done[key] || null; },
    streak() { const d = data(); return (d.last === today() || d.last === yesterday()) ? d.streak : 0; },
    // chamado no fim da partida do desafio
    finish(ch, r) {
      const d = data(); const won = r.winnerSide === 1;
      const bonus = won && ch.goal.ok(r);
      let first = false;
      if (won) {
        const prev = d.done[ch.key];
        if (!prev) { first = true; d.streak = (d.last === yesterday()) ? d.streak + 1 : 1; d.last = ch.key; d.best = Math.max(d.best, d.streak); d.done[ch.key] = { stars: bonus ? 2 : 1 }; }
        else if (bonus && prev.stars < 2) prev.stars = 2;
        M.ach.unlock('daily1'); if (d.streak >= 3) M.ach.unlock('daily3'); if (bonus) M.ach.unlock('daily_star');
        // guarda só os últimos 60 dias
        const keys = Object.keys(d.done).sort(); while (keys.length > 60) delete d.done[keys.shift()];
      }
      M.store.save();
      return { won, bonus, first, streak: this.streak() };
    }
  };
})();
// embaralha com gerador próprio (o Desafio do Dia precisa dar o mesmo resultado no mesmo dia)
M.shuffle0 = (arr, rnd) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
