'use strict';
// ============================================================
// REPLAY — grava as entradas de cada luta (dos dois lados) e reproduz igualzinho.
// A simulação é determinística: cada luta tem sua semente (M.rng32), a IA tem a dela e o compasso
// da música é contado em quadros (com pontos de sincronia gravados). Então, com a mesma versão do jogo,
// semente + opções + entradas = exatamente a mesma luta.
// Os replays ficam no próprio aparelho e podem ser exportados/importados como um código de texto.
// ============================================================
M.replay = (function () {
  const ACTIONS = ['up', 'down', 'left', 'right', 'light', 'heavy', 'special', 'ginga', 'mandinga', 'taunt', 'throw'];
  const KEY = 'sfb.replays.v1', MAX = 20, FORMAT = 1;
  const SPEEDS = [0.25, 0.5, 1, 2, 4, 8];
  const ctl = { si: 2, paused: false, acc: 0 };

  // ---- entradas <-> máscara de 24 bits (11 seguradas, 11 apertadas, 2 de dash) ----
  function mask(inp) {
    let m = 0;
    for (let i = 0; i < 11; i++) { if (inp.held[ACTIONS[i]]) m |= 1 << i; if (inp.pressed[ACTIONS[i]]) m |= 1 << (11 + i); }
    if (inp.dashLeft) m |= 1 << 22; if (inp.dashRight) m |= 1 << 23;
    return m;
  }
  function decode(m) {
    const inp = M.AI.blank();
    for (let i = 0; i < 11; i++) { if (m & (1 << i)) inp.held[ACTIONS[i]] = true; if (m & (1 << (11 + i))) inp.pressed[ACTIONS[i]] = true; }
    inp.dashLeft = !!(m & (1 << 22)); inp.dashRight = !!(m & (1 << 23));
    return inp;
  }

  // ---- gravação (chamada por quadro de luta) ----
  function record(match, ia, ib) {
    const r = match.rec, a = mask(ia), b = mask(ib), last = r.runs[r.runs.length - 1];
    if (last && last[0] === a && last[1] === b) last[2]++; else r.runs.push([a, b, 1]);
    r.n++;
  }
  // ---- reprodução: entrega as entradas do próximo quadro ----
  function next(match) {
    const runs = match.o.replay.runs;
    if (match.rIdx >= runs.length) return [M.AI.blank(), M.AI.blank()];
    const run = runs[match.rIdx];
    const out = [decode(run[0]), decode(run[1])];
    if (++match.rRun >= run[2]) { match.rIdx++; match.rRun = 0; }
    match.rPos = (match.rPos || 0) + 1;
    return out;
  }
  // ---- empacota a luta que acabou ----
  function pack(match) {
    const o = match.o, pick = c => { const x = { id: c.id, ctrl: c.ctrl, pal: c.pal | 0 }; if (c.patuas && c.patuas.length) x.patuas = c.patuas.slice(); if (c.mods) x.mods = Object.assign({}, c.mods); if (c.hpFrac) x.hpFrac = c.hpFrac; return x; };
    const oo = { mode: o.mode, p1: pick(o.p1), p2: pick(o.p2), stage: o.stage, rounds: o.rounds, timer: o.timer, difficulty: o.difficulty };
    if (o.mutators && o.mutators.length) oo.mutators = o.mutators.slice();
    if (o.boss) oo.boss = true; if (o.startAxe) oo.startAxe = o.startAxe; if (o.survival) oo.survival = o.survival; if (o.tags) oo.tags = o.tags.slice(); if (o.daily) oo.daily = o.daily; if (o.label) oo.label = o.label;
    const w = match.roundWinner;
    return { fmt: FORMAT, ver: M.VERSION, date: Date.now(), seed: match.seed, aiSeed: match.aiSeed, o: oo, runs: match.rec.runs.map(r => r.slice()), beat: match.rec.beat.map(e => e.slice()), frames: match.rec.n, res: { winnerSide: w ? w.side : 0, wins: match.wins.slice(), frames: match.totalFrames } };
  }

  // ---- guardados no aparelho ----
  function list() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function put(arr) {
    for (;;) { try { localStorage.setItem(KEY, JSON.stringify(arr)); return true; } catch (e) { if (arr.length <= 1) return false; arr.pop(); } }
  }
  function keep(rep, meta) {
    if (!rep) return null;
    const arr = list(); const id = Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
    arr.unshift({ id, fav: false, meta: meta || {}, rep });
    // mantém os favoritos e os mais novos
    while (arr.length > MAX) { let i = arr.length - 1; while (i >= 0 && arr[i].fav) i--; if (i < 0) break; arr.splice(i, 1); }
    put(arr); return id;
  }
  function get(id) { return list().find(x => x.id === id) || null; }
  function remove(id) { put(list().filter(x => x.id !== id)); }
  function favorite(id) { const arr = list(); const x = arr.find(y => y.id === id); if (x) { x.fav = !x.fav; put(arr); } return x && x.fav; }

  // ---- código de texto (exportar/importar) ----
  const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; };
  async function pipe(bytes, stream) { const rs = new Response(new Blob([bytes]).stream().pipeThrough(stream)); return new Uint8Array(await rs.arrayBuffer()); }
  async function encode(rep) {
    const raw = new TextEncoder().encode(JSON.stringify(rep));
    if (typeof CompressionStream !== 'undefined') { try { return 'SFB1:' + b64(await pipe(raw, new CompressionStream('deflate'))); } catch (e) { /* cai para sem compressão */ } }
    return 'SFB0:' + b64(raw);
  }
  async function parse(code) {
    code = String(code || '').trim().replace(/\s+/g, '');
    const m = /^SFB([01]):([A-Za-z0-9_-]+)$/.exec(code); if (!m) throw new Error('code');
    let bytes = unb64(m[2]);
    if (m[1] === '1') bytes = await pipe(bytes, new DecompressionStream('deflate'));
    const rep = JSON.parse(new TextDecoder().decode(bytes));
    if (!rep || rep.fmt !== FORMAT || !Array.isArray(rep.runs) || !rep.o || !rep.o.p1 || !rep.o.p2 || !M.FIGHTERS[rep.o.p1.id] || !M.FIGHTERS[rep.o.p2.id]) throw new Error('data');
    return rep;
  }

  // ---- reprodução na tela ----
  const fname = id => { const f = M.FIGHTERS[id]; return f ? (f.short || f.name) : id; };
  const label = rep => `${fname(rep.o.p1.id)} × ${fname(rep.o.p2.id)}`;
  function start(rep, onEnd) {
    ctl.si = 2; ctl.paused = false; ctl.acc = 0;
    const o = Object.assign({}, rep.o, { replay: rep, record: false, onEnd: r => { M.state = 'results'; if (onEnd) onEnd(r); } });
    M.ui.hide(); M.state = 'fight'; M.input.clear();
    M.match = new M.Match(o);
    M.flow.updateTouch();
  }
  // chamada pelo laço principal no lugar de match.update() quando é replay
  function tick(match) {
    const P = [M.input.get('p1'), M.input.get('p2')], any = a => P.some(p => p.pressed[a]); // qualquer um dos dois controles
    if (any('left') && ctl.si > 0) ctl.si--;
    if (any('right') && ctl.si < SPEEDS.length - 1) ctl.si++;
    if (any('light') || any('ginga')) ctl.paused = !ctl.paused;
    if (ctl.paused) return;
    // rede de segurança: se as entradas acabaram e a luta não terminou (replay de luta interrompida), encerra
    if (match.rIdx >= match.o.replay.runs.length && match.phase === 'fight' && ++match.rTail > 240 && !match.done) { match.done = true; match.o.onEnd(null); return; }
    ctl.acc += SPEEDS[ctl.si];
    let n = 0;
    while (ctl.acc >= 1 && n < 12) { match.update(); ctl.acc -= 1; n++; if (match.done) break; }
  }
  function hud(ctx, match) {
    const rep = match.o.replay, total = rep.frames || 1, pos = Math.min(1, (match.rPos || 0) / total), sp = SPEEDS[ctl.si];
    ctx.save(); ctx.fillStyle = 'rgba(20,18,16,0.8)'; ctx.fillRect(12, 486, 214, 46); ctx.restore();
    M.text(ctx, (ctl.paused ? 'II PAUSADO' : '▶ REPLAY') + '  ' + (sp === 1 ? '1×' : sp + '×'), 119, 497, { size: 13, color: M.C.yellow, lw: 2 });
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(22, 509, 194, 6); ctx.fillStyle = M.C.red; ctx.fillRect(22, 509, 194 * pos, 6);
    M.text(ctx, '← → velocidade • J pausa • ESC menu', 119, 523, { size: 9, color: M.C.paper, stroke: false });
  }
  return { ACTIONS, SPEEDS, mask, decode, record, next, pack, list, keep, get, remove, favorite, encode, parse, start, tick, hud, label, ctl };
})();
