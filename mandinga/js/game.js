'use strict';
// ============================================================
// MATCH — uma luta completa: rodadas, Axé, colisões, projéteis,
// arremessos, chefe, tutorial, câmera e HUD.
// ============================================================
M.TUTORIAL = [
  { text: 'Use A / D (ou ← →) para andar. Chegue perto do Mestre.', check: G => Math.abs(G.p1.x - G.p2.x) < 170, mestre: 'passive' },
  { text: 'W = pular. Pule duas vezes. (Segure pra frente pra pular por cima dele.)', check: G => G.p1.stats.jumps >= 2, mestre: 'passive' },
  { text: 'J = golpe leve. Acerte o Mestre 3 vezes. Dica: J, J, K vira uma sequência!', check: G => G.p1.stats.hits >= 3, mestre: 'passive' },
  { text: 'K = golpe forte. Agachado (S + K) é a RASTEIRA, que derruba. Acerte uma.', check: G => (G.p1.stats.landed.cH || 0) >= 1, mestre: 'passive' },
  { text: 'L = especial. S + L é o MACACO (anti-aéreo). Acerte 2 especiais.', check: G => ((G.p1.stats.landed.S || 0) + (G.p1.stats.landed.dS || 0) + (G.p1.stats.landed.aS || 0)) >= 2, mestre: 'passive' },
  { text: 'Segure PRA TRÁS para DEFENDER. Agache para bloquear golpes baixos. Defenda 3 golpes.', check: G => G.tut.blocks >= 3, mestre: 'attack' },
  { text: 'ESPAÇO = GINGA (esquiva). Esquive NO MOMENTO do golpe: ESQUIVA PERFEITA.', check: G => G.tut.perfect >= 1, mestre: 'attack' },
  { text: 'A barra de AXÉ é o público. Golpes variados, esquivas e acertos NO COMPASSO do berimbau enchem seu lado. Chegue a 70%.', check: G => G.axe >= 0.7, mestre: 'dummy' },
  { text: 'U = MANDINGA! Solte sua técnica máxima.', check: G => G.p1.stats.supers >= 1, mestre: 'passive' },
  { text: '"Chega por hoje, menino. A roda escuta quem escuta a roda." — Mestre Cinzas', check: G => G.tutT > 220, mestre: 'passive', final: true }
];

M.Match = class Match {
  constructor(o) {
    this.o = o;
    const W = M.W;
    this.p1 = new M.Fighter(M.FIGHTERS[o.p1.id], 1, o.p1.ctrl);
    this.p2 = new M.Fighter(M.FIGHTERS[o.p2.id], 2, o.p2.ctrl);
    for (const [f, cfg] of [[this.p1, o.p1], [this.p2, o.p2]]) {
      if (cfg.mods) Object.assign(f.mods, cfg.mods);
      if (cfg.patuas) { f.patuas = cfg.patuas.slice(); for (const id of f.patuas) { const pt = M.PATUAS.find(p => p.id === id); if (pt) pt.apply(f.mods); } }
      f.applyMods();
      if (f.ctrl === 'cpu') f.ai = M.AI.make(o.difficulty || 'brabo', f.def, cfg.aiExtra);
    }
    this.fighters = [this.p1, this.p2];
    this.stage = new M.stages.Stage(o.stage || 'porto');
    this.mode = o.mode || 'versus'; this.tutorial = !!o.tutorial; this.boss = !!o.boss;
    this.winsNeeded = o.rounds || 2; this.timerOn = o.timer !== 0 && !this.tutorial && this.mode !== 'training';
    this.timeStart = o.timer || 99;
    this.projectiles = []; this.traps = []; this.particles = []; this.fx = []; this.ghosts = [];
    this.axe = 0; this.readyShown = [false, false];
    this.wins = [0, 0]; this.round = 0; this.frame = 0; this.phase = 'intro'; this.phaseT = 0;
    this.slow = 0; this.slowAcc = 0; this.shakeAmt = 0; this.cam = { zoom: 1, x: W / 2, y: M.H / 2 }; this.camTarget = null; this.camT = 0;
    this.crowdExcite = 0.2; this.fireScale = 1; this.banner = null; this.bigText = null; this.freeze = 0;
    this.phase2 = false; this.phase2T = 0; this.tut = { blocks: 0, perfect: 0, step: 0 }; this.tutT = 0; this.dummyMode = o.dummy || 'stand';
    this.beatHits = 0; this.totalFrames = 0; this.result = null; this.done = false; this.lastShake = 0;
    this.stageDarkTarget = 0;
    if (this.boss) this.fireScale = 0.4;
    this.startRound();
  }
  get axeSign() { return this.axe > 0.15 ? 1 : this.axe < -0.15 ? -1 : 0; }
  axeSide(f) { return f.side === 1 ? this.axe : -this.axe; }
  superReady(f) { return this.axeSide(f) >= 0.7; }
  other(f) { return f === this.p1 ? this.p2 : this.p1; }

  startRound() {
    this.round++;
    this.p1.reset(320, 1); this.p2.reset(640, -1);
    this.p1.stats = this.p1.stats; // mantém estatísticas acumuladas
    this.projectiles = []; this.traps = []; this.ghosts = []; this.axe *= 0.5; this.readyShown = [false, false];
    this.timeF = this.timeStart * 60; this.phase = 'intro'; this.phaseT = 0; this.banner = null; this.freeze = 0;
    this.camTarget = null; this.cam.zoom = 1; this.cam.x = M.W / 2; this.cam.y = M.H / 2;
    for (const f of this.fighters) if (f.mods.regen && this.round > 1) f.hp = Math.min(f.maxHp, f.hp + f.maxHp * f.mods.regen);
    for (const f of this.fighters) if (f.ai) { f.ai.timer = 0; f.ai.intent = 'wait'; }
    M.audio.music.setMode(this.phase2 ? 'boss2' : this.boss ? 'boss' : 'fight');
    M.audio.crowd(0.5);
    if (this.tutorial) { this.p2.ai = M.AI.make('novato', this.p2.def); this.p2.ai.tutorial = 'passive'; }
  }

  // ---------------- entrada ----------------
  inputFor(f, opp) {
    if (this.phase !== 'fight' || this.freeze > 0) return M.AI.blank();
    if (f.ctrl === 'human') return M.input.get(f.side === 1 ? 'p1' : 'p2');
    if (f.ctrl === 'cpu') return M.AI.inputFor(f, opp, this, f.ai);
    const inp = M.AI.blank();
    if (this.dummyMode === 'block') {
      const threat = (opp.state === 'attack' && opp.move) || this.projectiles.some(p => p.owner === opp && Math.abs(p.x - f.x) < 200);
      if (threat) { inp.held[f.facing === 1 ? 'left' : 'right'] = true; const mv = opp.move; inp.held.down = !!(mv && mv.type === 'low') || (!mv && this.frame % 60 < 30) || (mv && mv.type === 'mid' && this.frame % 60 < 30); if (mv && mv.type === 'high') inp.held.down = false; }
    }
    else if (this.dummyMode === 'cpu') { if (!f.ai) f.ai = M.AI.make(this.o.difficulty || 'brabo', f.def); return M.AI.inputFor(f, opp, this, f.ai); }
    else if (this.dummyMode === 'jump') { if (this.frame % 70 === 0) inp.pressed.up = true; }
    return inp;
  }

  // ---------------- atualização ----------------
  update() {
    this.frame++; this.totalFrames++;
    this.phaseT++;
    this.updateCosmetics();
    if (this.slow > 0) { this.slow--; this.slowAcc = (this.slowAcc + 1) % 3; if (this.slowAcc !== 0) return; }
    this.stage.update(this);
    if (this.freeze > 0) { this.freeze--; return; }
    switch (this.phase) {
      case 'intro': this.updateIntro(); break;
      case 'fight': this.updateFight(); break;
      case 'ko': this.updateKO(); break;
      case 'end': this.updateEnd(); break;
    }
  }
  updateCosmetics() {
    this.shakeAmt *= 0.86; if (this.shakeAmt < 0.3) this.shakeAmt = 0;
    for (let i = this.fx.length - 1; i >= 0; i--) { const e = this.fx[i]; e.t++; if (e.t >= e.life) this.fx.splice(i, 1); }
    for (let i = this.particles.length - 1; i >= 0; i--) { const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.vx *= 0.98; p.rot += p.vr || 0; p.life--; if (p.life <= 0) this.particles.splice(i, 1); }
    for (let i = this.ghosts.length - 1; i >= 0; i--) { const g = this.ghosts[i]; g.alpha -= 0.03; if (g.alpha <= 0) this.ghosts.splice(i, 1); }
    this.crowdExcite = Math.max(0.1, this.crowdExcite - 0.004);
    // câmera
    const tgt = this.camTarget || { zoom: 1, x: M.W / 2, y: M.H / 2 };
    const z = this.cam.zoom + (tgt.zoom - this.cam.zoom) * 0.08;
    this.cam.zoom = z;
    this.cam.x += (M.clamp(tgt.x, M.W / (2 * z), M.W - M.W / (2 * z)) - this.cam.x) * 0.08;
    this.cam.y += (M.clamp(tgt.y, M.H / (2 * z), M.H - M.H / (2 * z)) - this.cam.y) * 0.08;
    if (this.camT > 0) { this.camT--; if (this.camT === 0) this.camTarget = null; }
    this.stage.dark += (this.stageDarkTarget - this.stage.dark) * 0.04;
    if (this.banner) { this.banner.t++; if (this.banner.t > this.banner.life) this.banner = null; }
    if (this.bigText) { this.bigText.t++; if (this.bigText.t > this.bigText.life) this.bigText = null; }
    for (const f of this.fighters) { f.dmgTrail += (f.hp - f.dmgTrail) * (f.dmgTrail > f.hp ? 0.04 : 0.5); }
    M.audio.music.intensity = Math.min(1, Math.abs(this.axe) + this.crowdExcite * 0.3);
  }
  updateIntro() {
    const t = this.phaseT;
    for (const f of this.fighters) { f.t = t; f.animT += 0.05; f.updatePose(); }
    if (t === 1) { this.bigText = { text: this.tutorial ? 'TREINO' : (this.round === 1 ? 'PRIMEIRA RODA' : (this.wins[0] === this.winsNeeded - 1 && this.wins[1] === this.winsNeeded - 1) ? 'RODA FINAL' : 'RODA ' + this.round), t: 0, life: 70, size: 44, color: M.C.paper }; }
    if (t === 75) { this.bigText = { text: 'RODA!', t: 0, life: 40, size: 72, color: M.C.yellow }; M.audio.play('roundStart'); }
    if (t === 112) { this.bigText = { text: 'VAI!', t: 0, life: 36, size: 80, color: M.C.red }; this.phase = 'fight'; this.phaseT = 0; for (const f of this.fighters) f.state = 'idle'; M.input.clear(); }
  }
  updateFight() {
    const [a, b] = this.fighters;
    const ia = this.inputFor(a, b), ib = this.inputFor(b, a);
    a.update(ia, b, this); b.update(ib, a, this);
    this.separate(a, b);
    this.resolveHits(a, b); this.resolveHits(b, a);
    this.updateProjectiles(); this.updateTraps();
    for (const [x, y] of [[a, b], [b, a]]) {
      if ((y.neutral || y.state === 'jump' || y.state === 'getup' || y.state === 'dodge') && x.combo > 0) { if (x.combo >= 2) x.comboShow = 70; x.combo = 0; x.comboDmg = 0; }
      // rastro
      if (x.state === 'dash' || x.state === 'dodge' || (x.move && x.move.super) || (x.move && x.move.move && x.state === 'attack')) { if (this.frame % 2 === 0) this.ghosts.push({ pose: x.pose, x: x.x, y: x.y, facing: x.facing, alpha: 0.32, color: x.def.colors.accent, def: x.def }); }
      // partículas de identidade
      if (x.def.prop === 'fire' && this.frame % 4 === 0) this.particles.push({ x: x.x + (Math.random() - 0.5) * 40, y: x.y - 60 - Math.random() * 80, vx: (Math.random() - 0.5) * 0.6, vy: -1.2 - Math.random(), life: 30, max: 30, size: 4, color: Math.random() < 0.5 ? '#f2b70c' : '#e8712b', type: 'ember', rot: 0 });
      if (x.def.prop === 'ash' && this.frame % 6 === 0) this.particles.push({ x: x.x + (Math.random() - 0.5) * 50, y: x.y - 100 - Math.random() * 50, vx: (Math.random() - 0.5) * 0.4, vy: 0.4 + Math.random() * 0.5, life: 50, max: 50, size: 3, color: '#8d8a84', type: 'ash', rot: 0 });
      if (x.burn > 0 && this.frame % 5 === 0) this.particles.push({ x: x.x + (Math.random() - 0.5) * 40, y: x.y - 40 - Math.random() * 90, vx: 0, vy: -1.5, life: 24, max: 24, size: 5, color: '#e8712b', type: 'ember', rot: 0 });
    }
    this.axe -= Math.sign(this.axe) * 0.00022;
    if (this.timerOn) { this.timeF--; if (this.timeF <= 0) this.timeOver(); }
    if (this.tutorial) this.updateTutorial();
    if (this.mode === 'training') { for (const f of this.fighters) if (f.neutral && f.hp < f.maxHp && this.frame % 2 === 0 && this.other(f).neutral) f.hp = Math.min(f.maxHp, f.hp + 6); }
    if (this.boss && !this.phase2 && this.p2.hp <= this.p2.maxHp * 0.5) this.startPhase2();
    if (this.phase2) { this.phase2T++; if (this.phase2T === 100) M.audio.music.setMode('boss2'); }
  }
  updateKO() {
    const [a, b] = this.fighters;
    const blank = M.AI.blank();
    a.update(blank, b, this); b.update(blank, a, this);
    this.updateProjectiles();
    const t = this.phaseT;
    if (t === 24) this.bigText = { text: 'CAIU!', t: 0, life: 80, size: 84, color: M.C.red };
    if (t === 130) {
      const w = this.roundWinner;
      if (this.wins[w.side - 1] >= this.winsNeeded) { this.phase = 'end'; this.phaseT = 0; w.state = 'win'; w.t = 0; this.bigText = { text: 'VENCEU A RODA', t: 0, life: 150, size: 54, color: M.C.yellow }; M.audio.play('win'); this.camTarget = { zoom: 1.15, x: w.x, y: w.y - 80 }; this.camT = 400; M.audio.music.setMode(this.mode === 'story' && w === this.p1 ? 'ending' : 'menu'); }
      else { this.startRound(); }
    }
  }
  updateEnd() {
    const [a, b] = this.fighters;
    const blank = M.AI.blank();
    a.update(blank, b, this); b.update(blank, a, this);
    if (this.phaseT === 150 && !this.done) { this.done = true; this.finish(); }
  }
  finish() {
    const w = this.roundWinner;
    this.result = { winner: w, loser: this.other(w), winnerSide: w.side, frames: this.totalFrames, wins: this.wins.slice(), stats: { p1: this.p1.stats, p2: this.p2.stats }, beatHits: this.beatHits };
    if (this.o.onEnd) this.o.onEnd(this.result);
  }
  timeOver() {
    const [a, b] = this.fighters;
    const pa = a.hp / a.maxHp, pb = b.hp / b.maxHp;
    let loser = pa > pb ? b : pb > pa ? a : (this.axe >= 0 ? b : a);
    this.bigText = { text: 'ACABOU O TEMPO', t: 0, life: 60, size: 40, color: M.C.paper };
    this.ko(loser, true);
  }

  separate(a, b) {
    if (a.state === 'dodge' || b.state === 'dodge' || a.state === 'thrown' || b.state === 'thrown' || a.throwing || b.throwing) return;
    if (a.state === 'ko' || b.state === 'ko') return;
    const dx = b.x - a.x, minD = 52;
    const vertical = Math.abs(a.y - b.y) < 120;
    if (Math.abs(dx) < minD && vertical) {
      const push = (minD - Math.abs(dx)) / 2; const s = dx >= 0 ? 1 : -1;
      const aFixed = a.x <= 42 || a.x >= M.W - 42, bFixed = b.x <= 42 || b.x >= M.W - 42;
      if (aFixed && !bFixed) b.x += push * 2 * s; else if (bFixed && !aFixed) a.x -= push * 2 * s; else { a.x -= push * s; b.x += push * s; }
      a.x = M.clamp(a.x, 42, M.W - 42); b.x = M.clamp(b.x, 42, M.W - 42);
    }
  }

  // ---------------- colisões ----------------
  resolveHits(att, def) {
    const hb = att.activeHitbox(); if (!hb) return;
    if (!att.canHitAgain(def)) return;
    if (!M.rects(hb, def.hurtbox())) return;
    if (def.state === 'dodge' && def.invuln > 0) { if (att.dodgedBy !== def) { att.dodgedBy = def; this.perfectDodge(def, att); } return; }
    if (def.invuln > 0 || def.state === 'thrown' || def.state === 'ko' || def.state === 'knockdown' || def.state === 'getup') return;
    this.hit(att, def, att.move, hb, null);
  }
  hit(att, def, mv, hb, src) {
    if (!src) { att.hitIds.add(def); att.hitCount++; att.lastHitFrame = att.mf; }
    const hx = M.clamp(def.x + (att.x < def.x ? -16 : 16), hb.x, hb.x + hb.w), hy = M.clamp(def.y - 95, hb.y, hb.y + hb.h);
    const facing = src ? src.dir : att.facing;
    if (def.canBlock(mv)) {
      def.state = 'blockstun'; def.t = mv.blockstun; def.crouching = def.held.down; def.move = null;
      def.vx = -mv.kb * 0.6 * facing / def.def.stats.weight;
      if (!src && att.grounded && (def.x <= 44 || def.x >= M.W - 44)) att.vx = -mv.kb * 0.5 * facing;
      const chip = Math.round((mv.chip || 0) * def.mods.chip);
      if (chip > 0) def.hp = Math.max(mv.super ? 0 : 1, def.hp - chip);
      def.stats.blocks++;
      this.fx.push({ type: 'star', x: hx, y: hy, r: 16, t: 0, life: 10, n: 6, color: '#2aa9b8' });
      this.spark(hx, hy, 5, '#2aa9b8');
      M.audio.play('block'); def.hitstop = 3; if (!src) att.hitstop = 3;
      this.gainAxe(att, 0.012);
      if (this.tutorial && def.side === 1) this.tut.blocks++;
      if (def.hp <= 0) this.ko(def);
      return;
    }
    const counter = (def.state === 'attack' && def.mf <= def.move.startup) || def.state === 'taunt';
    const armor = def.armorNow && !mv.super && !src;
    let dmg = mv.dmg * att.mods.dmg;
    const beat = M.audio.music.beat(); const onBeat = beat.dist < 0.075 * att.mods.beat;
    if (onBeat) dmg *= att.mods.beatDmg;
    if (counter) dmg *= 1.25;
    if (!mv.super) dmg *= Math.max(0.4, 1 - 0.1 * att.combo);
    if (this.axeSide(att) > 0.5) dmg *= 1.1;
    dmg = Math.round(dmg);
    if (this.tutorial) dmg = Math.min(dmg, 25);
    def.hp -= dmg; if (this.tutorial) def.hp = Math.max(def.hp, 1);
    att.stats.dmg += dmg; att.stats.hits++; att.stats.landed[mv.id] = (att.stats.landed[mv.id] || 0) + 1;
    def.flash = 5; att.moveHit = true;
    const heavy = mv.dmg >= 90 || mv.super;
    if (!armor) {
      def.state = 'hitstun'; def.t = mv.hitstun; def.move = null; def.throwing = null;
      def.crouching = def.crouching && mv.type !== 'high';
      def.hurtKind = (hb.y + hb.h > def.y - 50) ? 'lo' : 'hi';
      const isLast = src ? (!src.hits || src.hitCount >= src.hits) : (!mv.hits || att.hitCount >= mv.hits);
      def.vx = (isLast ? mv.kb : Math.min(mv.kb, 1)) * facing / def.def.stats.weight;
      if (!isLast) def.t = Math.max(def.t, (mv.hitInterval || 6) + 6);
      if ((mv.launch && isLast) || !def.grounded) {
        if (!def.grounded) def.juggle = (def.juggle || 0) + 1; else def.juggle = 0;
        const v = def.juggle >= 3 ? 2.5 : (isLast ? (mv.launch || 7) : 3);
        def.grounded = false; def.vy = -v / Math.sqrt(def.def.stats.weight); def.launched = true; def.t = 60; def.crouching = false;
      }
      if (mv.knockdown) def.kdPending = true;
      att.combo++; att.comboDmg += dmg; att.comboShow = 70;
    } else { this.popup('ARMADURA!', def.x, def.y - 190, M.C.yellow); M.audio.play('armor'); }
    const stop = mv.super ? 9 : heavy ? 7 : 4;
    def.hitstop = stop; if (!src) att.hitstop = stop;
    this.shake(mv.super ? 10 : heavy ? 6 : 2.5);
    this.fx.push({ type: 'star', x: hx, y: hy, r: heavy ? 42 : 26, t: 0, life: heavy ? 14 : 10, n: heavy ? 10 : 7, rot: Math.random() * Math.PI, color: counter ? M.C.red : '#fff8e8' });
    if (heavy) this.fx.push({ type: 'lines', x: hx, y: hy, r: 60, t: 0, life: 12, rot: Math.random() * Math.PI });
    this.confetti(hx, hy, heavy ? 14 : 6);
    if (mv.fx === 'fire' || mv.burn) this.embers(hx, hy, 8);
    if (src && (src.kind === 'wave' || src.kind === 'ripple' || src.kind === 'rain' || src.kind === 'pororoca')) this.drops(hx, hy, 10);
    M.audio.play(mv.super ? 'hitS' : heavy ? 'hitH' : 'hitL');
    if (mv.burn) { def.burn = 150; this.popup('QUEIMANDO!', def.x, def.y - 200, M.C.orange, 20); }
    let gain = 0.035 + dmg / 1000 * 0.3;
    const same = att.recent.filter(id => id === mv.id).length; gain *= 1 / (1 + same * 0.8);
    if (same >= 2 && !mv.super) this.popup('REPETIDO...', att.x, att.y - 200, '#8d8a84', 16);
    if (onBeat) { gain *= 1.8; this.popup('NO COMPASSO!', hx, hy - 50, M.C.yellow, 24); this.fx.push({ type: 'ring', x: hx, y: hy, r: 70, t: 0, life: 18, color: M.C.yellow }); M.audio.play('axe'); this.beatHits++; }
    if (counter) { gain += 0.04; this.popup('CONTRA-GOLPE!', hx, hy - 80, M.C.red, 22); M.audio.play('counter'); }
    if (att.def.id === 'cinzas' && this.boss && this.phase2) gain += 0.06;
    this.gainAxe(att, gain);
    att.recent.push(mv.id); if (att.recent.length > 4) att.recent.shift();
    this.crowdExcite = Math.min(1.5, this.crowdExcite + dmg / 250);
    if (att.combo >= 3 && att.combo % 2 === 1) M.audio.cheer(0.4);
    if (mv.super && src === null && att.hitCount === (mv.hits || 1)) { this.camTarget = { zoom: 1.2, x: def.x, y: def.y - 80 }; this.camT = 30; }
    if (def.hp <= 0) this.ko(def);
  }
  perfectDodge(def, att) {
    def.stats.perfect++; def.dodgeCd = 0; def.invuln = Math.max(def.invuln, 16);
    this.slow = 26; this.slowAcc = 0;
    if (att.state === 'attack' && att.move) att.extraRec += 10;
    this.popup('ESQUIVA PERFEITA!', def.x, def.y - 205, M.C.yellow, 28);
    this.fx.push({ type: 'ring', x: def.x, y: def.y - 80, r: 120, t: 0, life: 24, color: '#fff8e8' });
    this.fx.push({ type: 'flash', t: 0, life: 8, color: '#fff8e8', alpha: 0.35 });
    M.audio.play('perfect'); this.gainAxe(def, 0.22); this.crowdExcite = Math.min(1.5, this.crowdExcite + 0.6);
    if (this.tutorial && def.side === 1) this.tut.perfect++;
  }
  gainAxe(f, amt, label) {
    const sign = f.side === 1 ? 1 : -1;
    this.axe = M.clamp(this.axe + sign * amt * f.mods.axe * (this.tutorial ? 1.8 : 1), -1, 1);
    if (label) this.popup(label, f.x, f.y - 210, M.C.yellow, 22);
    const i = f.side - 1;
    if (this.superReady(f) && !this.readyShown[i]) { this.readyShown[i] = true; this.popup('MANDINGA PRONTA!', f.x, f.y - 230, M.C.magenta, 26); M.audio.play('patua'); M.audio.cheer(0.6); }
    if (!this.superReady(f)) this.readyShown[i] = false;
  }
  tauntDone(f) {
    const opp = this.other(f);
    if (opp.state === 'taunt' || (opp.stats.lastTaunt && this.frame - opp.stats.lastTaunt < 70)) { this.gainAxe(f, 0.12, 'A RODA RIU!'); this.gainAxe(opp, 0.12); this.confetti(M.W / 2, 200, 40); M.audio.cheer(1); }
    else this.gainAxe(f, 0.14, 'AXÉ!');
    f.stats.lastTaunt = this.frame;
    M.audio.cheer(0.5); this.crowdExcite = Math.min(1.5, this.crowdExcite + 0.4);
  }
  burnTick(f) { this.popup('-10', f.x, f.y - 170, M.C.orange, 16); M.audio.play('burn'); if (f.hp <= 0) this.ko(f); }

  tryThrow(att, def, mv) {
    if (att.throwing || att.threw) return;
    if (Math.abs(def.x - att.x) > mv.throw.range) return;
    if (!def.grounded || def.invuln > 0) return;
    if (['knockdown', 'getup', 'thrown', 'ko', 'hitstun', 'dodge', 'jump', 'taunt'].includes(def.state) && def.state !== 'taunt') return;
    att.throwing = def; att.throwT = 0; att.threw = true; att.moveHit = true;
    def.state = 'thrown'; def.move = null; def.throwing = null; def.t = 0; def.crouching = false;
    M.audio.play('grab'); this.fx.push({ type: 'star', x: def.x, y: def.y - 100, r: 22, t: 0, life: 10, n: 6, color: M.C.yellow });
    att.hitstop = def.hitstop = 4;
    if (mv.throw.drain) this.gainAxe(att, mv.throw.drain, 'ROUBOU O AXÉ!');
  }
  throwRelease(att, def, mv) {
    const dmg = Math.round(mv.dmg * att.mods.dmg * (this.tutorial ? 0.15 : 1));
    def.hp -= dmg; if (this.tutorial) def.hp = Math.max(1, def.hp);
    att.stats.dmg += dmg; att.stats.hits++; att.stats.landed[mv.id] = (att.stats.landed[mv.id] || 0) + 1;
    att.combo = 1; att.comboDmg = dmg; att.comboShow = 70; def.flash = 5;
    this.shake(7); this.fx.push({ type: 'star', x: def.x, y: def.y - 60, r: 40, t: 0, life: 14, n: 10, color: '#fff8e8' }); this.confetti(def.x, def.y - 60, 12); M.audio.play('hitH');
    const same = att.recent.includes(mv.id);
    this.gainAxe(att, same ? 0.06 : 0.11); att.recent.push(mv.id); if (att.recent.length > 4) att.recent.shift();
    this.crowdExcite = Math.min(1.5, this.crowdExcite + 0.4);
    if (def.hp <= 0) this.ko(def);
  }
  superStart(f, mv) {
    this.freeze = 26; this.banner = { text: mv.name, who: f, t: 0, life: 75 };
    f.superFlash = 60; f.invuln = Math.max(f.invuln, 26);
    this.fx.push({ type: 'flash', t: 0, life: 10, color: '#fff8e8', alpha: 0.7 });
    M.audio.play('super'); M.audio.cheer(0.8);
    this.axe = f.side === 1 ? Math.min(this.axe, 0) : Math.max(this.axe, 0);
    this.axe = 0;
    this.shake(6); this.camTarget = { zoom: 1.14, x: f.x, y: f.y - 80 }; this.camT = 50;
    this.crowdExcite = 1.2;
    if (mv.dark && !this.phase2) { this.stageDarkTarget = 1; setTimeout(() => { if (!this.phase2) this.stageDarkTarget = 0; }, 2600); }
  }
  spawnProjectile(f, mv) {
    const p = mv.projectile;
    this.projectiles.push({ owner: f, mv, kind: p.kind, x: f.x + f.facing * 50, y: f.y - p.y - p.h / 2, vx: p.vx * f.facing, vy: p.vy || 0, w: p.w, h: p.h, dir: f.facing, life: p.life, age: 0, hits: p.hits || 1, hitCount: 0, lastHit: -99, interval: p.hitInterval || 0, dead: false, dodged: false });
    M.audio.play('projectile');
    if (p.kind === 'ember') this.embers(f.x + f.facing * 50, f.y - p.y, 6);
  }
  updateProjectiles() {
    for (const pr of this.projectiles) {
      pr.age++; pr.x += pr.vx; pr.y += pr.vy; pr.life--;
      if (pr.vy > 0 && pr.y + pr.h / 2 >= M.GROUND) { pr.dead = true; if (pr.kind === 'rain') this.drops(pr.x, M.GROUND, 8); else this.embers(pr.x, M.GROUND - 10, 6); }
      if (pr.life <= 0 || pr.x < -120 || pr.x > M.W + 120) pr.dead = true;
      if (pr.dead) continue;
      const box = { x: pr.x - pr.w / 2, y: pr.y - pr.h / 2, w: pr.w, h: pr.h };
      const def = this.other(pr.owner);
      const dh = def.activeHitbox();
      if (def.state === 'attack' && def.move && def.move.reflect && dh && M.rects(box, dh)) {
        pr.owner = def; pr.vx = -pr.vx; pr.dir = -pr.dir; pr.hitCount = 0; pr.life += 40; pr.dodged = false;
        this.popup('REFLETIU!', pr.x, pr.y - 40, M.C.magenta, 22); M.audio.play('block'); this.gainAxe(def, 0.08); continue;
      }
      if (pr.hitCount < pr.hits && pr.age - pr.lastHit >= pr.interval && M.rects(box, def.hurtbox())) {
        if (def.state === 'dodge' && def.invuln > 0) { if (!pr.dodged) { pr.dodged = true; this.perfectDodge(def, pr.owner); } }
        else if (def.invuln <= 0 && !['knockdown', 'getup', 'thrown', 'ko'].includes(def.state)) {
          pr.hitCount++; pr.lastHit = pr.age; this.hit(pr.owner, def, pr.mv, box, pr);
          if (pr.hitCount >= pr.hits) pr.dead = true;
        }
      }
    }
    for (let i = 0; i < this.projectiles.length; i++) for (let j = i + 1; j < this.projectiles.length; j++) {
      const a = this.projectiles[i], b = this.projectiles[j];
      if (a.dead || b.dead || a.owner === b.owner) continue;
      if (M.rects({ x: a.x - a.w / 2, y: a.y - a.h / 2, w: a.w, h: a.h }, { x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h })) {
        if (!a.mv.super) a.dead = true; if (!b.mv.super) b.dead = true;
        this.fx.push({ type: 'star', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: 30, t: 0, life: 12, n: 8, color: '#fff8e8' }); M.audio.play('block'); this.spark((a.x + b.x) / 2, (a.y + b.y) / 2, 10, '#fff8e8');
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }
  spawnTrap(f, mv) {
    this.traps = this.traps.filter(t => t.owner !== f);
    this.traps.push({ owner: f, mv, x: M.clamp(f.x + f.facing * mv.trap.dist, 60, M.W - 60), life: mv.trap.life, age: 0, armed: false, w: mv.trap.w, h: mv.trap.h });
    M.audio.play('fire');
  }
  updateTraps() {
    for (const tr of this.traps) {
      tr.age++; tr.life--; if (tr.age > 18) tr.armed = true;
      const box = { x: tr.x - tr.w / 2, y: M.GROUND - tr.h, w: tr.w, h: tr.h };
      const def = this.other(tr.owner);
      if (tr.armed && tr.life > 0 && def.invuln <= 0 && def.grounded && !['knockdown', 'getup', 'thrown', 'ko', 'dodge'].includes(def.state) && M.rects(box, def.hurtbox())) {
        tr.life = 0; this.hit(tr.owner, def, tr.mv, box, { dir: def.x >= tr.x ? 1 : -1, kind: 'trap' }); this.embers(tr.x, M.GROUND - 30, 14); M.audio.play('fire');
      }
    }
    this.traps = this.traps.filter(t => t.life > 0);
  }
  ko(loser, timeout) {
    if (this.phase !== 'fight') return;
    if (this.tutorial) { loser.hp = Math.max(1, loser.hp); return; }
    const winner = this.other(loser);
    if (!timeout) loser.hp = 0;
    this.phase = 'ko'; this.phaseT = 0;
    loser.state = 'ko'; loser.t = 0; loser.move = null; loser.throwing = null; loser.flash = 6; loser.burn = 0;
    if (!timeout) { if (loser.grounded) { loser.grounded = false; loser.vy = -9; } loser.vx = (loser.x < winner.x ? -1 : 1) * 7; }
    winner.hitstop = 0; winner.throwing = null; if (winner.state === 'attack' && winner.move && winner.move.throw) { winner.state = 'idle'; winner.move = null; }
    this.slow = 70; this.slowAcc = 0; this.shake(14);
    M.audio.play('ko'); M.audio.music.duck(1.6);
    this.fx.push({ type: 'flash', t: 0, life: 10, color: '#fff8e8', alpha: 0.9 });
    this.camTarget = { zoom: 1.3, x: loser.x, y: loser.y - 80 }; this.camT = 120;
    this.crowdExcite = 1.5; M.audio.cheer(1.5);
    this.wins[winner.side - 1]++; this.roundWinner = winner;
    this.projectiles = []; this.traps = [];
  }
  startPhase2() {
    this.phase2 = true; this.phase2T = 0;
    const b = this.p2;
    this.freeze = 60;
    this.bigText = { text: '"APAGA, BRASA. APAGA."', t: 0, life: 140, size: 34, color: '#8d8a84' };
    M.audio.music.silence(1.7); M.audio.play('dark'); M.audio.crowd(0.05);
    this.stageDarkTarget = 1; this.fireScale = 0.12; this.stage.fireLevel = 0.5;
    if (b.ai) { b.ai.p.react += 0.25; b.ai.p.aggro += 0.2; b.ai.p.dodge += 0.15; b.ai.p.think = Math.max(5, b.ai.p.think - 4); }
    b.mods.speed *= 1.2; b.mods.dmg *= 1.1;
    this.shake(10); this.fx.push({ type: 'flash', t: 0, life: 14, color: '#050408', alpha: 0.9 });
    this.projectiles = []; this.traps = [];
  }

  // ---------------- tutorial ----------------
  updateTutorial() {
    this.tutT++;
    this.p2.hp = Math.min(this.p2.maxHp, this.p2.hp + 4);
    if (this.frame % 2 === 0) this.p1.hp = Math.min(this.p1.maxHp, this.p1.hp + 2);
    const step = M.TUTORIAL[this.tut.step]; if (!step) return;
    this.p2.ai.tutorial = step.mestre;
    if (step.check(this)) {
      if (step.final) { this.tutorialEnd(); return; }
      this.tut.step++; this.tutT = 0; M.audio.play('patua'); this.fx.push({ type: 'ring', x: M.W / 2, y: 470, r: 80, t: 0, life: 20, color: M.C.yellow });
      if (M.TUTORIAL[this.tut.step] && M.TUTORIAL[this.tut.step].final) this.p2.ai.tutorial = 'passive';
    }
  }
  tutorialEnd() {
    this.phase = 'end'; this.phaseT = 0; this.roundWinner = this.p1; this.wins[0] = this.winsNeeded;
    this.p1.state = 'win'; this.p1.t = 0; this.p2.state = 'idle';
    this.bigText = { text: 'TREINO COMPLETO', t: 0, life: 150, size: 50, color: M.C.yellow }; M.audio.play('win'); M.audio.cheer(1);
  }

  // ---------------- utilitários de efeito ----------------
  shake(a) { if (M.store.data.settings.shake) this.shakeAmt = Math.max(this.shakeAmt, a); }
  popup(text, x, y, color, size) { this.fx.push({ type: 'text', text, x, y, t: 0, life: 55, color, size: size || 22, rot: (Math.random() - 0.5) * 0.15 }); }
  dust(f) { if (f.grounded) this.fx.push({ type: 'dust', x: f.x, y: f.y, t: 0, life: 16, color: this.stage.def.dustColor || '#d9c27a' }); }
  confetti(x, y, n) { const cols = ['#f2b70c', '#c7267a', '#2aa9b8', '#1f7a4d', '#c8371d', '#fff8e8']; for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 7 - 1, g: 0.25, life: 40 + Math.random() * 25, max: 60, size: 3 + Math.random() * 3, color: M.choice(cols), type: 'confetti', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4 }); }
  spark(x, y, n, color) { for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, g: 0.1, life: 14 + Math.random() * 10, max: 24, size: 3 + Math.random() * 2, color, type: 'spark', rot: 0 }); }
  embers(x, y, n) { for (let i = 0; i < n; i++) this.particles.push({ x: x + (Math.random() - 0.5) * 20, y, vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 3, g: -0.02, life: 25 + Math.random() * 20, max: 45, size: 4 + Math.random() * 3, color: Math.random() < 0.5 ? '#f2b70c' : '#e8712b', type: 'ember', rot: 0 }); }
  drops(x, y, n) { for (let i = 0; i < n; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 7, vy: -Math.random() * 6, g: 0.3, life: 25 + Math.random() * 15, max: 40, size: 3 + Math.random() * 2, color: Math.random() < 0.5 ? '#2aa9b8' : '#fff8e8', type: 'drop', rot: 0 }); }

  // ---------------- render ----------------
  render(ctx) {
    const W = M.W, H = M.H;
    ctx.save();
    const sx = (Math.random() - 0.5) * this.shakeAmt, sy = (Math.random() - 0.5) * this.shakeAmt;
    ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(this.cam.zoom, this.cam.zoom); ctx.translate(-this.cam.x, -this.cam.y);
    this.stage.drawBack(ctx, this);
    for (const tr of this.traps) M.render.drawTrap(ctx, tr);
    for (const f of this.fighters) M.render.drawShadow(ctx, f);
    for (const g of this.ghosts) M.render.drawGhost(ctx, g, g.def);
    const order = this.fighters.slice().sort((a, b) => (a.state === 'attack' ? 1 : 0) - (b.state === 'attack' ? 1 : 0) || (a.state === 'ko' ? -1 : 0));
    if (this.banner && this.banner.t < 40) { ctx.save(); ctx.fillStyle = 'rgba(20,18,16,0.55)'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.restore(); const who = this.banner.who; for (const f of order) if (f !== who) M.render.drawFighter(ctx, f); M.render.drawFighter(ctx, who); }
    else for (const f of order) M.render.drawFighter(ctx, f);
    for (const pr of this.projectiles) M.render.drawProjectile(ctx, pr);
    for (const p of this.particles) M.render.drawParticle(ctx, p);
    for (const e of this.fx) if (e.type !== 'flash') M.render.drawFx(ctx, e);
    this.stage.drawFront(ctx, this);
    this.stage.drawDark(ctx, this.fighters);
    if (M.store.data.settings.hitboxes) this.drawBoxes(ctx);
    ctx.restore();
    for (const e of this.fx) if (e.type === 'flash') M.render.drawFx(ctx, e);
    ctx.globalAlpha = 0.07; ctx.drawImage(M.grain(), 0, 0, W, H); ctx.globalAlpha = 1;
    this.drawHUD(ctx);
  }
  drawBoxes(ctx) {
    ctx.lineWidth = 2;
    for (const f of this.fighters) { const hb = f.hurtbox(); ctx.strokeStyle = 'rgba(42,169,184,0.9)'; ctx.strokeRect(hb.x, hb.y, hb.w, hb.h); const ab = f.activeHitbox(); if (ab) { ctx.strokeStyle = 'rgba(200,55,29,0.9)'; ctx.strokeRect(ab.x, ab.y, ab.w, ab.h); } }
    for (const p of this.projectiles) { ctx.strokeStyle = 'rgba(200,55,29,0.9)'; ctx.strokeRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h); }
  }
  drawHUD(ctx) {
    const W = M.W, C = M.C;
    const bw = 380, bh = 22, y = 26;
    const bar = (f, right) => {
      const x0 = right ? W - 40 - bw : 40;
      ctx.fillStyle = C.ink; ctx.fillRect(x0 - 4, y - 4, bw + 8, bh + 8);
      ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x0, y, bw, bh);
      const pct = M.clamp(f.hp / f.maxHp, 0, 1), trail = M.clamp(f.dmgTrail / f.maxHp, 0, 1);
      const w1 = bw * pct, w2 = bw * trail;
      ctx.fillStyle = C.red; ctx.fillRect(right ? x0 + bw - w2 : x0, y, w2, bh);
      ctx.fillStyle = pct > 0.5 ? C.green : pct > 0.25 ? C.yellow : C.orange; ctx.fillRect(right ? x0 + bw - w1 : x0, y, w1, bh);
      ctx.fillStyle = 'rgba(255,248,232,0.25)'; ctx.fillRect(right ? x0 + bw - w1 : x0, y, w1, 6);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; for (let i = 1; i < 10; i++) { const px = x0 + bw * i / 10; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + bh); ctx.stroke(); }
      M.text(ctx, f.def.name.toUpperCase(), right ? x0 + bw : x0, y + bh + 16, { size: 17, align: right ? 'right' : 'left', color: C.paper, lw: 3 });
      if (f.ctrl === 'cpu') M.text(ctx, 'CPU', right ? x0 : x0 + bw, y + bh + 16, { size: 12, align: right ? 'left' : 'right', color: '#8d8a84', lw: 2 });
      for (let i = 0; i < Math.min(3, this.winsNeeded); i++) { const sx = right ? x0 + bw - 14 - i * 26 : x0 + 14 + i * 26; M.star(ctx, sx, y + bh + 40, 9, 4, 5, -Math.PI / 2); ctx.fillStyle = i < this.wins[f.side - 1] ? C.yellow : '#3a2a1e'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke(); }
      if (f.burn > 0 && this.frame % 20 < 14) M.text(ctx, 'QUEIMANDO', right ? x0 : x0 + bw, y + bh + 40, { size: 12, align: right ? 'left' : 'right', color: C.orange, lw: 2.5 });
    };
    bar(this.p1, false); bar(this.p2, true);
    // relógio
    ctx.beginPath(); ctx.arc(W / 2, 40, 30, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
    const secs = Math.ceil(this.timeF / 60);
    M.text(ctx, this.timerOn ? String(secs) : '∞', W / 2, 42, { size: this.timerOn ? 28 : 34, color: this.timerOn && secs <= 10 ? C.red : C.ink, stroke: false });
    // AXÉ
    const ax0 = W / 2 - 240, ay = 494, aw = 480, ah = 18;
    ctx.fillStyle = C.ink; ctx.fillRect(ax0 - 4, ay - 4, aw + 8, ah + 8);
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(ax0, ay, aw, ah);
    const beat = M.audio.music.beat(); const pulse = Math.pow(1 - beat.phase, 3);
    const half = aw / 2, fill = Math.abs(this.axe) * half;
    const fx = this.axe >= 0 ? W / 2 - fill : W / 2;
    const ready = Math.abs(this.axe) >= 0.7;
    ctx.fillStyle = ready ? (this.frame % 10 < 5 ? C.magenta : C.yellow) : C.yellow; ctx.fillRect(fx, ay, fill, ah);
    ctx.fillStyle = `rgba(255,248,232,${0.15 + pulse * 0.3})`; ctx.fillRect(fx, ay, fill, 6);
    ctx.strokeStyle = C.paper; ctx.lineWidth = 2; for (const k of [-0.7, 0.7]) { const px = W / 2 + k * half; ctx.beginPath(); ctx.moveTo(px, ay - 4); ctx.lineTo(px, ay + ah + 4); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(W / 2, ay + ah / 2, 12 + pulse * 6, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, ay + ah / 2, 5, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
    M.text(ctx, 'AXÉ', W / 2, ay - 16, { size: 15, color: C.paper, lw: 3 });
    const favName = this.axe > 0.15 ? this.p1.def.name : this.axe < -0.15 ? this.p2.def.name : null;
    if (favName) M.text(ctx, 'A RODA TÁ COM ' + favName.toUpperCase(), this.axe > 0 ? ax0 + 6 : ax0 + aw - 6, ay - 16, { size: 12, align: this.axe > 0 ? 'left' : 'right', color: C.yellow, lw: 2.5 });
    for (const f of this.fighters) if (this.superReady(f) && this.frame % 30 < 20) { const keyHint = f.ctrl === 'human' ? (f.side === 1 ? ' (U)' : ' (Num5)') : ''; M.text(ctx, 'MANDINGA PRONTA' + keyHint, f.side === 1 ? ax0 - 10 : ax0 + aw + 10, ay + 9, { size: 15, align: f.side === 1 ? 'right' : 'left', color: C.magenta, lw: 3 }); }
    // combo
    for (const f of this.fighters) if (f.comboShow > 0 && (f.combo >= 2 || (f.combo === 0 && f.comboShow > 0 && f.comboDmgShown))) { }
    for (const f of this.fighters) {
      if (f.combo >= 2) { f.lastComboN = f.combo; f.lastComboDmg = f.comboDmg; }
      if (f.comboShow > 0 && f.lastComboN >= 2) {
        const k = f.comboShow / 70; const x = f.side === 1 ? 60 : W - 60; const al = f.side === 1 ? 'left' : 'right';
        const words = ['', '', 'BONITO!', 'MASSA!', 'LAPADA!', 'QUE É ISSO!', 'ARRETADO!', 'MANDINGA PURA!'];
        M.text(ctx, f.lastComboN + ' GOLPES', x, 120, { size: 30, align: al, color: C.yellow, alpha: Math.min(1, k * 3) });
        M.text(ctx, words[Math.min(words.length - 1, f.lastComboN)] + '  ' + f.lastComboDmg, x, 148, { size: 16, align: al, color: C.paper, alpha: Math.min(1, k * 3) });
      } else if (f.comboShow <= 0) f.lastComboN = 0;
    }
    // ginga cooldown (P1 humano)
    for (const f of this.fighters) if (f.ctrl === 'human') { const x = f.side === 1 ? 40 : W - 40; const al = f.side === 1 ? 'left' : 'right'; const ok = f.dodgeCd <= 0; M.text(ctx, ok ? 'GINGA ◆' : 'GINGA ◇', x, 108, { size: 12, align: al, color: ok ? C.cyan : '#8d8a84', lw: 2.5 }); }
    // banner de mandinga
    if (this.banner) {
      const b = this.banner, k = b.t / b.life; const f = b.who;
      const slide = k < 0.15 ? M.easeOut(k / 0.15) : k > 0.8 ? 1 - M.easeIn((k - 0.8) / 0.2) : 1;
      ctx.save(); ctx.globalAlpha = slide;
      ctx.translate(W / 2, 230); ctx.rotate(-0.06);
      ctx.fillStyle = f.def.colors.accent; ctx.fillRect(-700, -46, 1400, 92);
      ctx.fillStyle = C.ink; ctx.fillRect(-700, -52, 1400, 6); ctx.fillRect(-700, 46, 1400, 6);
      M.text(ctx, b.text.toUpperCase(), (1 - slide) * (f.side === 1 ? -300 : 300), 2, { size: 46, color: C.paper });
      M.text(ctx, f.def.name.toUpperCase() + ' — MANDINGA', 0, 72, { size: 16, color: C.yellow });
      ctx.restore();
    }
    if (this.bigText && !(this.banner && this.phase === 'fight')) {
      const b = this.bigText, k = b.t / b.life; const sc = k < 0.12 ? M.easeBack(k / 0.12) : 1; const al = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
      ctx.save(); ctx.translate(W / 2, 250); ctx.scale(sc, sc); M.text(ctx, b.text, 0, 0, { size: b.size, color: b.color, alpha: al }); ctx.restore();
      if (this.phase === 'end' && this.roundWinner) M.text(ctx, this.tutorial ? 'Zeca Ventania está pronto.' : this.roundWinner.def.name.toUpperCase(), W / 2, 300, { size: 24, color: C.paper, alpha: al });
    }
    if (this.tutorial && this.phase === 'fight') {
      const step = M.TUTORIAL[this.tut.step];
      if (step) {
        ctx.fillStyle = C.paper; ctx.fillRect(130, 400, W - 260, 64); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.strokeRect(130, 400, W - 260, 64);
        M.text(ctx, `TREINO ${Math.min(this.tut.step + 1, 9)}/9`, 142, 414, { size: 13, align: 'left', color: C.red, stroke: false });
        wrapText(ctx, step.text, W / 2, 440, W - 300, 17, C.ink);
      }
    }
    if (this.mode === 'training' && this.phase === 'fight') M.text(ctx, 'TREINO LIVRE — ESC: boneco e opções', W / 2, 92, { size: 13, color: C.paper, lw: 2.5 });
    if (this.phase === 'fight' && this.frame < 240 && this.mode !== 'training' && !this.tutorial && this.p1.ctrl === 'human') { }
  }
};
function wrapText(ctx, text, x, y, maxW, size, color) {
  ctx.font = `${size}px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * (size + 4)));
}
M.wrapText = wrapText;
