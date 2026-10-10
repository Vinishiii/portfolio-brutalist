'use strict';
// ============================================================
// MAIN — boot, loop fixo a 60fps, fluxo de modos e história
// ============================================================
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  M.state = 'boot'; M.match = null;
  let ambient = null;

  // ---------- cena ambiente (menus) ----------
  function makeAmbient(stageId, ids) {
    const st = new M.stages.Stage(stageId || 'porto');
    const fs = (ids || ['zeca', 'cinzas']).map((id, i) => { const f = new M.Fighter(M.FIGHTERS[id], i + 1, 'dummy'); f.reset(i === 0 ? 330 : 630, i === 0 ? 1 : -1); f.state = 'idle'; return f; });
    return { st, fs, t: 0, crowdExcite: 0.25, axeSign: 0, fireScale: 1 };
  }
  function updateAmbient() {
    const a = ambient; a.t++;
    a.st.update(a);
    for (const f of a.fs) { f.animT += M.poses.idleSpeed(f.def.idle); f.updatePose(); }
  }
  function renderAmbient() {
    const a = ambient; M.ambientStage = a.st;
    a.st.drawBack(ctx, a);
    for (const f of a.fs) { M.render.drawShadow(ctx, f); M.render.drawFighter(ctx, f, { umbrellaOpen: true }); }
    a.st.drawFront(ctx, a);
    ctx.globalAlpha = 0.07; ctx.drawImage(M.grain(), 0, 0, M.W, M.H); ctx.globalAlpha = 1;
    if (M.state === 'charselect' || M.state === 'menu') { ctx.fillStyle = 'rgba(20,18,16,0.45)'; ctx.fillRect(0, 0, M.W, M.H); }
  }

  // ---------- loop ----------
  let last = performance.now(), acc = 0; const STEP = 1000 / 60;
  // qualidade automática: se a média de quadros passar de ~24ms por 3s, desliga o pós-processamento (e depois a pintura)
  const perf = { sum: 0, n: 0, level: 0 };
  function watchPerf(dt) {
    const s = M.store.data.settings; if (s.quality !== 'auto' && s.quality !== undefined) return;
    if (M.state !== 'fight') { perf.sum = 0; perf.n = 0; return; }
    perf.sum += Math.min(dt, 200); perf.n++;
    if (perf.n >= 180) {
      const avg = perf.sum / perf.n; perf.sum = 0; perf.n = 0;
      if (avg > 24 && perf.level < 2) {
        perf.level++;
        if (perf.level === 1) { M.paint.P.autoLow = true; M.paint.apply(); } else { M.paint.P.enabled = false; M.render.style.paint = false; if (M.paint.P.postCanvas) M.paint.P.postCanvas.style.display = 'none'; if (M.paint.P.gameCanvas) M.paint.P.gameCanvas.style.opacity = '1'; }
      }
    }
  }
  function frame(now) {
    const speed = M.store.data.settings.speed || 1;
    watchPerf(now - last);
    acc += Math.min(120, now - last) * speed; last = now;
    let n = 0;
    while (acc >= STEP && n < 4) { tick(); acc -= STEP; n++; }
    if (acc >= STEP) acc = 0;
    render();
    requestAnimationFrame(frame);
  }
  const PAD_KEY = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', ginga: 'Enter', light: 'Enter', special: 'Escape', heavy: 'Escape', mandinga: 'Enter', taunt: 'Enter', throw: 'Enter' };
  function tick() {
    M.input.update();
    if (M.state !== 'fight') for (const a of M.input.takePadEdges()) { const code = PAD_KEY[a]; if (code) { window.dispatchEvent(new KeyboardEvent('keydown', { code })); window.dispatchEvent(new KeyboardEvent('keyup', { code })); } }
    else M.input.takePadEdges();
    if (M.state === 'fight' && M.match) {
      if (M.input.pausePressed()) { openPause(); return; }
      M.match.update();
    } else {
      M.input.pausePressed();
      if (ambient && !M.match) updateAmbient();
    }
  }
  function render() {
    if (M.match) M.match.render(ctx);
    else if (ambient) renderAmbient();
    M.paint.post();
  }

  // ---------- pausa ----------
  function openPause() {
    const m = M.match;
    M.ui.pause({
      training: m.mode === 'training',
      resume: () => { M.ui.hide(); M.state = 'fight'; M.input.clear(); },
      restart: () => { M.ui.hide(); const o = m.o; M.match = new M.Match(o); M.state = 'fight'; },
      quit: () => { M.match = null; M.ui.menu(); }
    });
  }

  // ---------- fluxo ----------
  const flow = M.flow = {
    story: null,
    startMatch(o) {
      const done = o.onEnd; o.onEnd = r => { try { M.ach.matchEnd(r, o); } catch (e) { /* ignora */ } if (done) done(r); };
      M.ui.hide(); M.state = 'fight'; M.input.clear();
      M.match = new M.Match(o);
      flow.updateTouch();
    },
    startFromSelect(sel) {
      const diff = M.store.data.settings.difficulty;
      if (sel.mode === 'cpu') {
        flow.startMatch({ mode: 'versus', p1: { id: sel.p1, ctrl: 'human' }, p2: { id: sel.p2, ctrl: 'cpu' }, stage: sel.stage, rounds: 2, timer: 99, difficulty: diff, onEnd: r => flow.versusEnd(r, sel) });
      } else if (sel.mode === 'versus') {
        flow.startMatch({ mode: 'versus', p1: { id: sel.p1, ctrl: 'human' }, p2: { id: sel.p2, ctrl: 'human' }, stage: sel.stage, rounds: 2, timer: 99, onEnd: r => flow.versusEnd(r, sel) });
      } else if (sel.mode === 'training') {
        flow.startMatch({ mode: 'training', p1: { id: sel.p1, ctrl: 'human' }, p2: { id: sel.p2, ctrl: 'dummy' }, stage: sel.stage, rounds: 99, timer: 0, difficulty: diff, dummy: 'stand', onEnd: () => M.ui.menu() });
      } else if (sel.mode === 'free') {
        flow.free = { p1: sel.p1, order: M.shuffle(M.ROSTER.filter(id => id !== sel.p1 && id !== 'cinzas')).slice(0, 7).concat(['cinzas']), idx: 0, patuas: [], frames: 0, deaths: 0, difficulty: diff };
        flow.freeFight();
      }
    },
    versusEnd(r, sel) {
      M.state = 'results';
      M.ui.results({ result: r, buttons: [{ id: 'again', label: 'REVANCHE', fn: () => flow.startFromSelect(sel) }, { id: 'change', label: 'TROCAR LUTADORES', fn: () => { M.match = null; M.ui.charselect({ players: 2, mode: sel.mode }); } }, { id: 'menu', label: 'MENU', fn: () => M.ui.menu() }] });
    },
    // ---- rinha livre ----
    freeFight() {
      const F = flow.free; const opp = F.order[F.idx];
      const stage = opp === 'cinzas' ? 'cinzas' : M.choice(M.stages.order.filter(s => s !== 'cinzas'));
      flow.startMatch({ mode: 'free', p1: { id: F.p1, ctrl: 'human', patuas: F.patuas }, p2: { id: opp, ctrl: 'cpu' }, stage, rounds: 2, timer: 99, difficulty: F.difficulty, boss: opp === 'cinzas', onEnd: r => flow.freeEnd(r) });
    },
    freeEnd(r) {
      const F = flow.free; F.frames += r.frames; M.state = 'results';
      if (r.winnerSide !== 1) { F.deaths++; M.ui.results({ result: r, defeat: true, buttons: [{ id: 'retry', label: 'TENTAR DE NOVO', fn: () => flow.freeFight() }, { id: 'menu', label: 'DESISTIR', fn: () => M.ui.menu() }] }); return; }
      F.idx++;
      if (F.idx >= F.order.length) {
        const p = M.store.data.progress; if (!p.freeBest || F.frames < p.freeBest) p.freeBest = F.frames; p.wins++; M.store.save(); M.ach.unlock('free_done');
        M.ui.results({ result: r, buttons: [{ id: 'menu', label: `VENCEU A RINHA INTEIRA! (${M.fmtTime(F.frames / 60)}) — MENU`, fn: () => M.ui.menu() }] });
        return;
      }
      const opts = M.shuffle(M.PATUAS.filter(p => !F.patuas.includes(p.id))).slice(0, 2);
      if (opts.length) M.ui.patua(opts, p => { F.patuas.push(p.id); flow.freeFight(); }); else flow.freeFight();
    },
    // ---- história ----
    newStory(diff) {
      M.store.data.settings.difficulty = diff; M.store.save();
      flow.story = { idx: 0, patuas: [], licoes: [], bonds: [], grades: {}, challenges: {}, fama: 0, bless: null, difficulty: diff, frames: 0, deaths: 0, fightDeaths: {} };
      flow.saveStory();
      M.match = null;
      M.ui.cordel(M.STORY.intro, 'A RINHA DO FOGO', () => flow.storyFight());
    },
    continueStory() {
      const s = M.store.data.story; if (!s) return flow.newStory('brabo');
      flow.story = { idx: s.idx, patuas: s.patuas || [], licoes: s.licoes || [], bonds: s.bonds || [], grades: s.grades || {}, challenges: s.challenges || {}, fama: s.fama || 0, bless: s.bless || null, difficulty: s.difficulty || 'brabo', frames: s.frames || 0, deaths: s.deaths || 0, fightDeaths: s.fightDeaths || {} };
      flow.storyFight();
    },
    saveStory() { const s = flow.story; M.store.data.story = { idx: s.idx, patuas: s.patuas, licoes: s.licoes, bonds: s.bonds, grades: s.grades, challenges: s.challenges, fama: s.fama, bless: s.bless, difficulty: s.difficulty, frames: s.frames, deaths: s.deaths, fightDeaths: s.fightDeaths || {} }; M.store.save(); },
    storyFight() {
      const S = flow.story; const F = M.STORY.fights[S.idx];
      if (!F) return flow.storyChoice();
      M.match = null; ambient = makeAmbient(F.stage, ['zeca', F.opp]);
      M.state = 'story';
      S.fightDeaths = S.fightDeaths || {};
      const retry = S.fightDeaths[S.idx] > 0;
      const begin = () => {
        let pre = (retry && F.retry) ? [{ who: F.opp, text: F.retry }].concat(F.pre.slice(1)) : F.pre.slice();
        if (F.preBond && S.bonds.length >= 4) { const extra = F.preBond.filter(l => !l.needBonds || S.bonds.length >= l.needBonds); pre = pre.slice(0, -1).concat(extra, pre.slice(-1)); }
        M.ui.dialogue(pre, F.title, () => {
          M.ui.versusCard({ p1: 'zeca', p2: F.opp, title: F.title, stageName: M.stages.DEFS[F.stage].name, difficulty: S.difficulty, challenge: F.challenge, best: M.store.data.progress.fightBest && M.store.data.progress.fightBest[S.idx] }, () => {
            const mods = S.patuas.concat(S.licoes, S.bless ? [S.bless] : []);
            const bl = S.bless && M.modById(S.bless);
            flow.startMatch({ mode: 'story', p1: { id: 'zeca', ctrl: 'human', patuas: mods }, p2: { id: F.opp, ctrl: 'cpu' }, stage: F.stage, rounds: F.tutorial ? 1 : 2, timer: 99, difficulty: S.difficulty, tutorial: !!F.tutorial, boss: !!F.boss, startAxe: bl && bl.startAxe ? bl.startAxe * 2 : 0, onEnd: r => flow.storyEnd(r) });
          });
        });
      };
      if (retry) begin(); else M.ui.nightMap(S, begin);
    },
    storyEnd(r) {
      const S = flow.story; const F = M.STORY.fights[S.idx]; S.frames += r.frames; M.state = 'results';
      if (r.winnerSide !== 1) {
        S.deaths++; S.fightDeaths = S.fightDeaths || {}; S.fightDeaths[S.idx] = (S.fightDeaths[S.idx] || 0) + 1; flow.saveStory();
        M.ui.results({ result: r, defeat: true, buttons: [{ id: 'retry', label: 'LEVANTAR E TENTAR DE NOVO', fn: () => flow.storyFight() }, { id: 'menu', label: 'VOLTAR AO MENU', fn: () => M.ui.menu() }] });
        return;
      }
      const prog = M.store.data.progress; prog.fightBest = prog.fightBest || {};
      const retries = S.fightDeaths[S.idx] || 0;
      const done = !!(F.challenge && M.CHALLENGES[F.challenge].check(r));
      const grade = F.tutorial ? null : M.gradeFight(r, done, retries);
      let newBest = false;
      if (grade) {
        S.grades[S.idx] = grade; S.challenges[S.idx] = done; if (done) S.fama++;
        const prev = prog.fightBest[S.idx]; if (!prev || M.GRADE_VAL[grade] > M.GRADE_VAL[prev]) { prog.fightBest[S.idx] = grade; newBest = !!prev; }
        M.store.save();
      }
      S.bless = null;
      const lines = F.post.concat(F.bond ? [{ who: F.opp, text: F.bond.prompt, key: 'bond', choice: F.bond.options.map(o => ({ id: o.id, label: o.label })) }] : []);
      const onChoice = (key, id) => {
        const opt = F.bond.options.find(o => o.id === id); const les = M.modById(opt.lesson);
        S.licoes.push(opt.lesson); if (opt.bond && !S.bonds.includes(F.opp)) S.bonds.push(F.opp);
        flow.saveStory();
        return opt.reply.concat([{ who: 'narrador', text: `${opt.bond ? 'Laço feito! ' : ''}Lição aprendida: ${les.name} — ${les.desc}` }]);
      };
      const after = () => {
        const inter = M.STORY.interludes[S.idx]; const camp = M.STORY.camps[S.idx];
        const finishedIdx = S.idx;
        S.idx++; flow.saveStory();
        const patuaStep = () => {
          if (F.patua) {
            const opts = M.shuffle(M.PATUAS.filter(p => !S.patuas.includes(p.id))).slice(0, done ? 3 : 2);
            M.ui.patua(opts, p => { S.patuas.push(p.id); flow.saveStory(); flow.storyFight(); });
          } else flow.storyFight();
        };
        const campStep = () => {
          if (!camp) return patuaStep();
          M.ui.camp(camp, M.BENCAOS, b => { S.bless = b.id; flow.saveStory(); patuaStep(); });
        };
        if (inter) M.ui.cordel(inter.pages, inter.title, campStep); else campStep();
        void finishedIdx;
      };
      const dlg = () => M.ui.dialogue(lines, F.title, after, onChoice);
      if (grade) M.ui.fightReport({ result: r, grade, challenge: F.challenge, done, newBest, title: F.title }, dlg); else dlg();
    },
    storyChoice() {
      const S = flow.story; const p = M.store.data.progress; const both = p.endings.includes('acender') && p.endings.includes('descansar');
      const bonded = S.bonds.length >= 4;
      const data = Object.assign({}, M.STORY.choice, { options: M.STORY.choice.options.filter(o => !o.secret || both || bonded) });
      if (both) data.text += ' Desta vez, há um terceiro caminho.';
      else if (bonded) data.text += ' ' + M.STORY.bondsEndingText;
      M.ui.choice(data, id => flow.storyEnding(id));
    },
    storyEnding(id) {
      const S = flow.story; const p = M.store.data.progress;
      p.storyDone = true; p.cinzas = true; if (!p.endings.includes(id)) p.endings.push(id);
      if (!p.bestTime || S.frames / 60 < p.bestTime) p.bestTime = Math.round(S.frames / 60);
      const grade = M.overallGrade(S.grades);
      if (!p.bestGrade || M.GRADE_VAL[grade] > M.GRADE_VAL[p.bestGrade]) p.bestGrade = grade;
      p.bonds = p.bonds || {}; for (const b of S.bonds) p.bonds[b] = true;
      p.wins++; M.store.data.story = null; M.store.save();
      M.ach.storyEnd(S, id, grade);
      M.audio.music.setMode('ending');
      ambient = makeAmbient(id === 'acender' ? 'ladeira' : 'cinzas', ['zeca', 'cinzas']);
      if (id === 'acender') ambient.crowdExcite = 1.2;
      M.ui.ending(id, { frames: S.frames, patuas: S.patuas, deaths: S.deaths, difficulty: S.difficulty, grade, fama: S.fama, bonds: S.bonds.length, bondText: S.bonds.length >= 4 ? M.STORY.bondsEndingText : '' }, () => M.ui.menu());
    },
    // ---- lendas da noite (segundo arco) ----
    legends: null,
    newLegends(diff) {
      M.store.data.settings.difficulty = diff; M.store.save();
      flow.legends = { idx: 0, patuas: [], difficulty: diff, frames: 0, deaths: 0, fightDeaths: {} };
      flow.saveLegends(); M.match = null;
      M.audio.music.setMode('menu');
      M.ui.cordel(M.LEGENDS.intro, 'LENDAS DA NOITE', () => flow.legendsFight());
    },
    continueLegends() {
      const s = M.store.data.legends; if (!s) return flow.newLegends('brabo');
      flow.legends = { idx: s.idx, patuas: s.patuas || [], difficulty: s.difficulty || 'brabo', frames: s.frames || 0, deaths: s.deaths || 0, fightDeaths: s.fightDeaths || {} };
      flow.legendsFight();
    },
    saveLegends() { const s = flow.legends; M.store.data.legends = { idx: s.idx, patuas: s.patuas, difficulty: s.difficulty, frames: s.frames, deaths: s.deaths, fightDeaths: s.fightDeaths || {} }; M.store.save(); },
    legendsFight() {
      const S = flow.legends; const F = M.LEGENDS.fights[S.idx];
      if (!F) return flow.legendsEnding();
      M.match = null; ambient = makeAmbient(F.stage, ['zeca', F.opp]);
      M.state = 'story';
      const pre = (S.fightDeaths[S.idx] > 0 && F.retry) ? [{ who: F.opp, text: F.retry }].concat(F.pre.slice(1)) : F.pre;
      M.ui.dialogue(pre, F.title, () => {
        M.ui.versusCard({ p1: 'zeca', p2: F.opp, title: F.title, stageName: M.stages.DEFS[F.stage].name, difficulty: S.difficulty }, () => {
          flow.startMatch({ mode: 'story', p1: { id: 'zeca', ctrl: 'human', patuas: S.patuas }, p2: { id: F.opp, ctrl: 'cpu' }, stage: F.stage, rounds: 2, timer: 99, difficulty: S.difficulty, onEnd: r => flow.legendsEnd(r) });
        });
      });
    },
    legendsEnd(r) {
      const S = flow.legends; const F = M.LEGENDS.fights[S.idx]; S.frames += r.frames; M.state = 'results';
      if (r.winnerSide !== 1) {
        S.deaths++; S.fightDeaths[S.idx] = (S.fightDeaths[S.idx] || 0) + 1; flow.saveLegends();
        M.ui.results({ result: r, defeat: true, buttons: [{ id: 'retry', label: 'LEVANTAR E TENTAR DE NOVO', fn: () => flow.legendsFight() }, { id: 'menu', label: 'VOLTAR AO MENU', fn: () => M.ui.menu() }] });
        return;
      }
      M.ui.dialogue(F.post, F.title, () => {
        const inter = M.LEGENDS.interludes[S.idx];
        S.idx++; flow.saveLegends();
        const next = () => {
          if (F.patua && S.idx < M.LEGENDS.fights.length) {
            const opts = M.shuffle(M.PATUAS.filter(p => !S.patuas.includes(p.id))).slice(0, 2);
            M.ui.patua(opts, p => { S.patuas.push(p.id); flow.saveLegends(); flow.legendsFight(); });
          } else flow.legendsFight();
        };
        if (inter) M.ui.cordel(inter.pages, inter.title, next); else next();
      });
    },
    legendsEnding() {
      const S = flow.legends; const p = M.store.data.progress;
      p.legendsDone = true; M.ach.unlock('legends_done'); p.wins++; M.store.data.legends = null; M.store.save();
      M.audio.music.setMode('ending');
      ambient = makeAmbient('mata', ['zeca', 'fulozinha']);
      M.ui.ending('lendas', { frames: S.frames, patuas: S.patuas, deaths: S.deaths, difficulty: S.difficulty }, () => M.ui.menu());
    },
    // ---- toque ----
    updateTouch() {
      const s = M.store.data.settings.touch;
      const hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      const el = document.getElementById('touch');
      const on = s === 'on' || (s === 'auto' && hasTouch);
      el.classList.toggle('show', on && M.state === 'fight');
      document.body.classList.toggle('touch-on', on);
    }
  };

  // ---------- redimensionamento ----------
  function resize() {
    const stage = document.getElementById('stage');
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / M.W, vh / M.H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    document.getElementById('rotate').classList.toggle('show', vh > vw && (('ontouchstart' in window) || navigator.maxTouchPoints > 0));
  }
  window.addEventListener('resize', resize);

  // ---------- boot ----------
  function boot() {
    M.store.load();
    if (!M.store.data.settings.lang) { M.store.data.settings.lang = M.i18n.detect(); M.store.save(); }
    // ?lang=en|es|pt força o idioma só nesta sessão (útil para testar traduções)
    const qLang = (new URLSearchParams(location.search).get('lang') || '').slice(0, 2).toLowerCase();
    M.i18n.set(M.i18n.LANGS.some(x => x[0] === qLang) ? qLang : M.store.data.settings.lang);
    M.input.applyKeys(M.store.data.settings.keys);
    const s = M.store.data.settings; M.audio.A.settings.volume = s.volume; M.audio.A.settings.music = s.music; M.audio.A.settings.sfx = s.sfx;
    M.ui.init();
    M.paint.init(canvas, document.getElementById('post'));
    M.input.bindTouch(document.getElementById('touch'));
    resize();
    ambient = makeAmbient('porto', ['zeca', 'cinzas']);
    const unlock = () => { M.audio.init(); M.audio.resume(); };
    window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
    document.getElementById('fs').addEventListener('click', () => { const d = document.documentElement; if (!document.fullscreenElement) (d.requestFullscreen || d.webkitRequestFullscreen).call(d); else document.exitFullscreen(); });
    const origState = Object.getOwnPropertyDescriptor(M, 'state');
    let st = 'title';
    Object.defineProperty(M, 'state', { get: () => st, set: v => { st = v; flow.updateTouch(); } });
    void origState;
    M.i18n.init();
    M.ui.title();
    requestAnimationFrame(frame);
  }
  const ready = document.fonts && document.fonts.load ? Promise.all([document.fonts.load("20px 'Alfa Slab One'"), document.fonts.load("20px 'Special Elite'")]).catch(() => { }) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(boot);
})();
