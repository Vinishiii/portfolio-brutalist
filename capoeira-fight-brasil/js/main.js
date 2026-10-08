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
    const a = ambient;
    a.st.drawBack(ctx, a);
    for (const f of a.fs) { M.render.drawShadow(ctx, f); M.render.drawFighter(ctx, f, { umbrellaOpen: true }); }
    a.st.drawFront(ctx, a);
    ctx.globalAlpha = 0.07; ctx.drawImage(M.grain(), 0, 0, M.W, M.H); ctx.globalAlpha = 1;
    if (M.state === 'charselect' || M.state === 'menu') { ctx.fillStyle = 'rgba(20,18,16,0.45)'; ctx.fillRect(0, 0, M.W, M.H); }
  }

  // ---------- loop ----------
  let last = performance.now(), acc = 0; const STEP = 1000 / 60;
  function frame(now) {
    acc += Math.min(120, now - last); last = now;
    let n = 0;
    while (acc >= STEP && n < 4) { tick(); acc -= STEP; n++; }
    if (acc >= STEP) acc = 0;
    render();
    requestAnimationFrame(frame);
  }
  function tick() {
    M.input.update();
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
      M.ui.hide(); M.state = 'fight'; M.input.clear();
      M.match = new M.Match(o);
      flow.updateTouch();
    },
    startFromSelect(sel) {
      const diff = M.store.data.settings.difficulty;
      if (sel.mode === 'versus') {
        flow.startMatch({ mode: 'versus', p1: { id: sel.p1, ctrl: 'human' }, p2: { id: sel.p2, ctrl: 'human' }, stage: sel.stage, rounds: 2, timer: 99, onEnd: r => flow.versusEnd(r, sel) });
      } else if (sel.mode === 'training') {
        flow.startMatch({ mode: 'training', p1: { id: sel.p1, ctrl: 'human' }, p2: { id: sel.p2, ctrl: 'dummy' }, stage: sel.stage, rounds: 99, timer: 0, difficulty: diff, dummy: 'stand', onEnd: () => M.ui.menu() });
      } else if (sel.mode === 'free') {
        flow.free = { p1: sel.p1, order: M.shuffle(M.ROSTER.filter(id => id !== sel.p1 && id !== 'cinzas')).concat(['cinzas']), idx: 0, patuas: [], frames: 0, deaths: 0, difficulty: diff };
        flow.freeFight();
      }
    },
    versusEnd(r, sel) {
      M.state = 'results';
      M.ui.results({ result: r, buttons: [{ id: 'again', label: 'REVANCHE', fn: () => flow.startFromSelect(sel) }, { id: 'change', label: 'TROCAR LUTADORES', fn: () => { M.match = null; M.ui.charselect({ players: 2, mode: 'versus' }); } }, { id: 'menu', label: 'MENU', fn: () => M.ui.menu() }] });
    },
    // ---- roda livre ----
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
        const p = M.store.data.progress; if (!p.freeBest || F.frames < p.freeBest) p.freeBest = F.frames; p.wins++; M.store.save();
        M.ui.results({ result: r, buttons: [{ id: 'menu', label: `VENCEU A RODA INTEIRA! (${M.fmtTime(F.frames / 60)}) — MENU`, fn: () => M.ui.menu() }] });
        return;
      }
      const opts = M.shuffle(M.PATUAS.filter(p => !F.patuas.includes(p.id))).slice(0, 2);
      if (opts.length) M.ui.patua(opts, p => { F.patuas.push(p.id); flow.freeFight(); }); else flow.freeFight();
    },
    // ---- história ----
    newStory(diff) {
      M.store.data.settings.difficulty = diff; M.store.save();
      flow.story = { idx: 0, patuas: [], difficulty: diff, frames: 0, deaths: 0 };
      flow.saveStory();
      M.match = null;
      M.ui.cordel(M.STORY.intro, 'A RODA DO FOGO', () => flow.storyFight());
    },
    continueStory() {
      const s = M.store.data.story; if (!s) return flow.newStory('brabo');
      flow.story = { idx: s.idx, patuas: s.patuas || [], difficulty: s.difficulty || 'brabo', frames: s.frames || 0, deaths: s.deaths || 0 };
      flow.storyFight();
    },
    saveStory() { const s = flow.story; M.store.data.story = { idx: s.idx, patuas: s.patuas, difficulty: s.difficulty, frames: s.frames, deaths: s.deaths }; M.store.save(); },
    storyFight() {
      const S = flow.story; const F = M.STORY.fights[S.idx];
      if (!F) return flow.storyChoice();
      M.match = null; ambient = makeAmbient(F.stage, ['zeca', F.opp]);
      M.state = 'story';
      M.ui.dialogue(F.pre, F.title, () => {
        flow.startMatch({ mode: 'story', p1: { id: 'zeca', ctrl: 'human', patuas: S.patuas }, p2: { id: F.opp, ctrl: 'cpu' }, stage: F.stage, rounds: F.tutorial ? 1 : 2, timer: 99, difficulty: S.difficulty, tutorial: !!F.tutorial, boss: !!F.boss, onEnd: r => flow.storyEnd(r) });
      });
    },
    storyEnd(r) {
      const S = flow.story; const F = M.STORY.fights[S.idx]; S.frames += r.frames; M.state = 'results';
      if (r.winnerSide !== 1) {
        S.deaths++; flow.saveStory();
        M.ui.results({ result: r, defeat: true, buttons: [{ id: 'retry', label: 'LEVANTAR E TENTAR DE NOVO', fn: () => flow.storyFight() }, { id: 'menu', label: 'VOLTAR AO MENU', fn: () => M.ui.menu() }] });
        return;
      }
      const after = () => {
        S.idx++; flow.saveStory();
        if (F.patua) {
          const opts = M.shuffle(M.PATUAS.filter(p => !S.patuas.includes(p.id))).slice(0, 2);
          M.ui.patua(opts, p => { S.patuas.push(p.id); flow.saveStory(); flow.storyFight(); });
        } else flow.storyFight();
      };
      M.ui.dialogue(F.post, F.title, after);
    },
    storyChoice() {
      M.ui.choice(M.STORY.choice, id => flow.storyEnding(id));
    },
    storyEnding(id) {
      const S = flow.story; const p = M.store.data.progress;
      p.storyDone = true; p.cinzas = true; if (!p.endings.includes(id)) p.endings.push(id);
      if (!p.bestTime || S.frames / 60 < p.bestTime) p.bestTime = Math.round(S.frames / 60);
      p.wins++; M.store.data.story = null; M.store.save();
      M.audio.music.setMode('ending');
      ambient = makeAmbient(id === 'acender' ? 'ladeira' : 'cinzas', ['zeca', 'cinzas']);
      if (id === 'acender') ambient.crowdExcite = 1.2;
      M.ui.ending(id, { frames: S.frames, patuas: S.patuas, deaths: S.deaths, difficulty: S.difficulty }, () => M.ui.menu());
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
    const s = M.store.data.settings; M.audio.A.settings.volume = s.volume; M.audio.A.settings.music = s.music; M.audio.A.settings.sfx = s.sfx;
    M.ui.init();
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
    M.ui.title();
    requestAnimationFrame(frame);
  }
  const ready = document.fonts && document.fonts.load ? Promise.all([document.fonts.load("20px 'Alfa Slab One'"), document.fonts.load("20px 'Special Elite'")]).catch(() => { }) : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(boot);
})();
