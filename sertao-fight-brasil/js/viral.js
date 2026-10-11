'use strict';
// ============================================================
// VIRAL — o que faz a luta virar conteúdo, sem servidor nenhum:
//   • M.clip      clipe automático (últimos segundos do KO, da Peia ou do combo) em vídeo com som e marca do jogo;
//   • M.challenge link de desafio: a mesma luta (lutadores, cenário, regras, semente) + o seu placar, para o amigo tentar superar;
//   • M.card      cartão de resultado em PNG (vertical, pronto para story/WhatsApp).
// Tudo é cosmético/seguro: só lê o resultado da luta e desenha. Não mexe na simulação.
// ============================================================

// ---------------------------------------------------------------- clipes
M.clip = (function () {
  const SPAN = 12000, STAG = 6000, MIN_AGE = 2200;
  const TAIL = { ko: 2600, round: 1600, super: 3400, combo: 1400 };
  let cv = null, g2 = null, stream = null, mime = '', ext = 'webm', slots = [], timer = null, active = false, best = null, frameN = 0, support = null;

  function supported() {
    if (support !== null) return support;
    support = typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
    if (support) {
      const L = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=avc1', 'video/mp4'];
      mime = L.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || '';
      ext = /mp4/.test(mime) ? 'mp4' : 'webm';
      if (!mime) support = false;
    }
    return support;
  }
  const enabled = () => supported() && M.store.data.settings.clips !== false && !M.store.data.settings.broadcast;

  function setup() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.width = 960; cv.height = 540; g2 = cv.getContext('2d');
  }
  function source() {
    const P = M.paint && M.paint.P;
    return P && P.postCanvas && P.postCanvas.style.display !== 'none' && P.glOk ? P.postCanvas : document.getElementById('game');
  }
  function startSlot() {
    if (!active) return null;
    try {
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3000000, audioBitsPerSecond: 128000 });
      const s = { rec, chunks: [], t0: performance.now(), keep: null, stopping: false };
      rec.ondataavailable = e => { if (e.data && e.data.size) s.chunks.push(e.data); };
      rec.onstop = () => {
        slots = slots.filter(x => x !== s);
        if (s.keep && s.chunks.length) {
          const blob = new Blob(s.chunks, { type: mime.split(';')[0] });
          if (blob.size > 20000 && (!best || s.keep.score >= best.score)) { if (best && best.url) URL.revokeObjectURL(best.url); best = { blob, kind: s.keep.kind, score: s.keep.score, dur: (performance.now() - s.t0) / 1000, url: null }; }
        }
        if (active) startSlot();
      };
      rec.start(); slots.push(s); return s;
    } catch (e) { return null; }
  }
  function stopSlot(s) { if (s.stopping) return; s.stopping = true; try { if (s.rec.state !== 'inactive') s.rec.stop(); else s.rec.onstop(); } catch (e) { slots = slots.filter(x => x !== s); } }

  // começa a gravar (chamado no início de cada luta que vale clipe)
  function begin() {
    if (!enabled() || active) return false;
    try {
      setup();
      stream = cv.captureStream(30);
      try { const a = M.audio.capture && M.audio.capture(); if (a) for (const t of a.getAudioTracks()) stream.addTrack(t); } catch (e) { /* sem áudio no clipe */ }
      best = null; active = true; frameN = 0;
      startSlot();
      setTimeout(() => { if (active) startSlot(); }, STAG);
      timer = setInterval(() => { const now = performance.now(); for (const s of slots.slice()) if (!s.keep && !s.stopping && now - s.t0 > SPAN) stopSlot(s); }, 500);
      return true;
    } catch (e) { active = false; return false; }
  }
  // um quadro do jogo (a cada 2 quadros: 30 fps), com a marca no canto
  function frame() {
    if (!active || (++frameN & 1)) return;
    try {
      g2.drawImage(source(), 0, 0, 960, 540);
      if (M.logo) { g2.save(); g2.globalAlpha = 0.88; M.logo.draw(g2, 960 - 108, 515, 170, { glow: false }); g2.restore(); }
    } catch (e) { /* ignora */ }
  }
  // momento digno de clipe: escolhe a gravação mais antiga (que pega mais do lance) e a para depois do "rabo" do lance
  function mark(kind, score) {
    if (!active) return;
    const now = performance.now(); const cand = slots.filter(s => !s.keep && !s.stopping && now - s.t0 >= MIN_AGE).sort((a, b) => a.t0 - b.t0)[0] || slots.filter(s => !s.keep && !s.stopping && now - s.t0 >= 900).sort((a, b) => a.t0 - b.t0)[0];
    if (!cand) return;
    cand.keep = { kind, score };
    setTimeout(() => stopSlot(cand), TAIL[kind] || 1500);
  }
  // fim da luta: espera os clipes marcados fecharem e solta o resto
  function end() {
    if (!active) return;
    setTimeout(() => {
      active = false; clearInterval(timer);
      for (const s of slots.slice()) { if (!s.keep) s.keep = null; stopSlot(s); }
    }, 3600);
  }
  function abort() { active = false; clearInterval(timer); for (const s of slots.slice()) { s.keep = null; stopSlot(s); } }
  const pending = () => slots.some(s => s.keep);
  const get = () => best;
  const name = kind => `sertao-fight-brasil-${kind === 'ko' ? 'nocaute' : kind === 'super' ? 'peia' : kind === 'combo' ? 'combo' : 'luta'}-${new Date().toISOString().slice(0, 10)}.${ext}`;
  async function share(c) {
    if (!c) return false;
    const file = new File([c.blob], name(c.kind), { type: c.blob.type });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Sertão Fight Brasil', text: 'Olha esse lance no Sertão Fight Brasil!' }); return true; } } catch (e) { if (e && e.name === 'AbortError') return true; }
    return save(c);
  }
  function save(c) {
    if (!c) return false;
    if (!c.url) c.url = URL.createObjectURL(c.blob);
    const a = document.createElement('a'); a.href = c.url; a.download = name(c.kind); document.body.appendChild(a); a.click(); a.remove();
    return true;
  }
  return { supported, enabled, begin, frame, mark, end, abort, pending, get, share, save, name, get active() { return active; }, get ext() { return ext; } };
})();

// ---------------------------------------------------------------- desafio por link
M.challenge = (function () {
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  // placar: vitória pesa mais; vida que sobra, rapidez, combo, esquivas e arremate somam; quem perde ainda ganha um pouco por lutar bem
  function score(r, o, side) {
    side = side || 1; const me = r.stats['p' + side], op = r.stats['p' + (3 - side)], win = r.winnerSide === side, sec = r.frames / 60;
    if (!win) return Math.max(0, Math.round((me.dmg || 0) / 6 + (me.maxCombo || 0) * 6 + (me.perfect || 0) * 8));
    const hp = r.winner.hp / r.winner.maxHp;
    return Math.max(0, Math.round(1000 + hp * 500 + Math.max(0, 90 - sec) * 6 + (me.maxCombo || 0) * 20 + (me.perfect || 0) * 15 + (me.beats || 0) * 5 + (me.finKO ? 100 : 0) - (op.dmg || 0) / 10));
  }
  // monta o desafio a partir de uma luta contra a CPU que acabou de terminar
  function fromMatch(r, o) {
    if (!r || !o || !o.p1 || o.p1.ctrl !== 'human' || o.p2.ctrl !== 'cpu' || o.tutorial) return null;
    const st = r.stats.p1, win = r.winnerSide === 1;
    return {
      v: 1, tag: (M.comp && M.comp.data && M.comp.data().tag) || '', a: { id: o.p1.id, pal: o.p1.pal | 0 }, b: { id: o.p2.id, pal: o.p2.pal | 0 }, s: o.stage, d: o.difficulty || 'brabo', r: o.rounds || 2, t: o.timer === undefined ? 99 : o.timer,
      m: (o.mutators || []).slice(), sd: r.seed >>> 0, w: win ? 1 : 0, hp: Math.round(win ? r.winner.hp / r.winner.maxHp * 100 : 0), tm: Math.round(r.frames / 60), cb: st.maxCombo || 0, sc: score(r, o, 1), lv: M.meta ? M.meta.level().lv : 0
    };
  }
  const encode = c => 'C1' + b64(JSON.stringify(c));
  function decode(str) {
    try {
      if (!str || str.slice(0, 2) !== 'C1') return null;
      const c = JSON.parse(unb64(str.slice(2)));
      if (!c || c.v !== 1 || !M.FIGHTERS[c.a && c.a.id] || !M.FIGHTERS[c.b && c.b.id] || typeof c.sd !== 'number') return null;
      c.tag = String(c.tag || '').slice(0, 14).toUpperCase(); c.s = M.stages.order.includes(c.s) ? c.s : M.choice(M.stages.order);
      c.d = ['novato', 'brabo', 'lendario'].includes(c.d) ? c.d : 'brabo'; c.r = [1, 2, 3].includes(c.r) ? c.r : 2; c.t = [0, 45, 60, 99].includes(c.t) ? c.t : 99;
      c.m = (c.m || []).filter(id => M.mutById(id)).slice(0, 4); c.a.pal = ((c.a.pal | 0) % M.PAL_COUNT + M.PAL_COUNT) % M.PAL_COUNT; c.b.pal = ((c.b.pal | 0) % M.PAL_COUNT + M.PAL_COUNT) % M.PAL_COUNT;
      return c;
    } catch (e) { return null; }
  }
  const base = () => location.origin && location.origin !== 'null' ? location.origin + location.pathname : 'https://sertao-fight-brasil.example/';
  const link = (c, replayCode) => base() + '#c=' + encode(c) + (replayCode && replayCode.length <= 4200 ? '&r=' + replayCode : '');
  function fromHash() {
    const h = (location.hash || '').replace(/^#/, ''); if (!h) return null;
    const P = {}; for (const part of h.split('&')) { const i = part.indexOf('='); if (i > 0) P[part.slice(0, i)] = part.slice(i + 1); }
    const c = P.c && decode(P.c); if (!c) return null;
    c.replay = P.r || null; return c;
  }
  const clearHash = () => { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignora */ } };
  // as opções de partida do desafio (iguais para quem criou e quem aceitou)
  function matchOpts(c) {
    return { mode: 'versus', p1: { id: c.a.id, ctrl: 'human', pal: c.a.pal }, p2: { id: c.b.id, ctrl: 'cpu', pal: c.b.pal }, stage: c.s, rounds: c.r, timer: c.t, mutators: c.m.slice(), difficulty: c.d, seed: c.sd >>> 0, label: 'DESAFIO' };
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
  }
  async function share(text, url) {
    try { if (navigator.share) { await navigator.share({ title: 'Sertão Fight Brasil', text, url }); return true; } } catch (e) { if (e && e.name === 'AbortError') return true; }
    return copy(text + ' ' + url);
  }
  return { score, fromMatch, encode, decode, link, fromHash, clearHash, matchOpts, copy, share, base };
})();

// ---------------------------------------------------------------- cartão de resultado (PNG vertical 1080×1350)
M.card = (function () {
  const W = 1080, H = 1350;
  function stageBg(g, id) {
    try { const st = new M.stages.Stage(id); M.paint.ensureStage(st); const bg = st.bgPaint || st.bg; const s = Math.max(W / 960, H / 540); g.drawImage(bg, (W - 960 * s) / 2 + 40, (H - 540 * s) / 2, 960 * s, 540 * s); }
    catch (e) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1830'); gr.addColorStop(1, '#141210'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  }
  function fighter(g, id, pal, x, y, k, facing, pose) {
    const f = new M.Fighter(M.palette(M.FIGHTERS[id], pal | 0), 1, 'dummy'); f.reset(x, facing); f.state = 'idle'; f.x = 0; f.y = 0; f.facing = facing;
    f.pose = pose || M.poses.idlePose(f.def.idle, 0.9, f.def.idleOver);
    g.save(); g.translate(x, y); g.scale(k, k); M.render.drawShadow(g, { x: 0, y: -4, def: f.def, grounded: true }); M.render.drawFighter(g, f, {}); g.restore();
  }
  const stroke = (g, txt, x, y, size, color, align) => M.text(g, txt, x, y, { size, color, align: align || 'center', lw: Math.max(5, size * 0.16) });
  // o: { stage, a:{id,pal}, b:{id,pal}|null, head, sub, title, tag, level, rows:[[rótulo, valor]], foot, accent }
  function make(o) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    stageBg(g, o.stage || 'ladeira');
    let sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(10,6,16,0.55)'); sh.addColorStop(0.32, 'rgba(10,6,16,0.05)'); sh.addColorStop(0.62, 'rgba(10,6,16,0.1)'); sh.addColorStop(1, 'rgba(8,5,12,0.92)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    try { M.logo.draw(g, W / 2, 128, 760, { glow: false }); } catch (e) { stroke(g, 'SERTÃO FIGHT BRASIL', W / 2, 120, 64, '#f2b70c'); }
    // lutadores
    if (o.b) { fighter(g, o.b.id, o.b.pal, W * 0.76, 900, 2.6, -1); }
    fighter(g, o.a.id, o.a.pal, o.b ? W * 0.28 : W * 0.5, 905, o.b ? 2.7 : 3.4, 1, o.pose ? M.poses.attackPose(o.pose, 'active', 0.5, M.poses.S.idle) : null);
    // faixa de manchete
    g.save(); g.translate(W / 2, 330); g.rotate(-0.045);
    g.fillStyle = o.accent || '#c8371d'; g.fillRect(-W, -62, W * 2, 124); g.lineWidth = 8; g.strokeStyle = M.C.ink; g.strokeRect(-W, -62, W * 2, 124);
    stroke(g, o.head || 'VITÓRIA!', 0, -8, 82, M.C.paper);
    if (o.sub) stroke(g, o.sub, 0, 42, 30, '#ffe9a8');
    g.restore();
    // quem é
    const nm = (o.tag ? o.tag : M.FIGHTERS[o.a.id].name).toUpperCase();
    stroke(g, nm, W / 2, 940, 64, M.C.yellow);
    if (o.title) stroke(g, o.title, W / 2, 996, 30, '#f3e6c8');
    // números
    const rows = (o.rows || []).slice(0, 4), cw = (W - 120) / Math.max(1, rows.length);
    rows.forEach((r, i) => {
      const x = 60 + cw * (i + 0.5);
      g.fillStyle = 'rgba(20,18,16,0.82)'; g.fillRect(x - cw / 2 + 8, 1040, cw - 16, 150); g.lineWidth = 5; g.strokeStyle = M.C.paper; g.strokeRect(x - cw / 2 + 8, 1040, cw - 16, 150);
      stroke(g, String(r[1]), x, 1100, 56, M.C.yellow); stroke(g, r[0], x, 1158, 24, '#d9ccaa');
    });
    // rodapé
    g.fillStyle = 'rgba(20,18,16,0.9)'; g.fillRect(0, 1230, W, 120);
    stroke(g, o.foot || 'Jogue de graça no navegador', W / 2, 1268, 34, M.C.paper);
    g.font = `22px ${M.FONT_TEXT}`; g.fillStyle = '#b8b2a4'; g.textAlign = 'center'; g.fillText(M.challenge.base().replace(/^https?:\/\//, ''), W / 2, 1318);
    if (o.level) stroke(g, 'NV ' + o.level, 120, 1268, 30, '#8be9ff');
    return c;
  }
  const toBlob = c => new Promise(res => c.toBlob(b => res(b), 'image/png'));
  async function share(c, text) {
    const blob = await toBlob(c), file = new File([blob], 'sertao-fight-brasil.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Sertão Fight Brasil', text }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'shared'; }
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sertao-fight-brasil.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
  }
  async function copy(c) { try { const blob = await toBlob(c); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); return true; } catch (e) { return false; } }
  // dados do cartão a partir de uma luta contra a CPU/versus
  function fromResult(r, o, rep) {
    const win = r.winnerSide === 1, st = r.stats.p1, meta = M.meta;
    const A = o.p1, B = o.p2;
    return {
      stage: o.stage, a: { id: A.id, pal: A.pal | 0 }, b: { id: B.id, pal: B.pal | 0 }, pose: win ? 'spinKick' : null,
      head: win ? 'VITÓRIA!' : 'FOI QUASE!', sub: M.FIGHTERS[A.id].name + ' x ' + M.FIGHTERS[B.id].name, accent: win ? '#1f7a4d' : '#c8371d',
      tag: (M.comp && M.comp.data && M.comp.data().tag) || '', title: meta ? M.tr(meta.titleOf().name) : '', level: meta ? meta.level().lv : 0,
      rows: [['COMBO', st.maxCombo || 0], ['DANO', st.dmg || 0], ['TEMPO', M.fmtTime(r.frames / 60)], ['PLACAR', M.challenge.score(r, o, 1)]]
    };
  }
  return { make, share, copy, fromResult, toBlob };
})();
