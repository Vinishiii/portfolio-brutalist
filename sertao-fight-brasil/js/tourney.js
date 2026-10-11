'use strict';
// ============================================================
// TORNEIO LOCAL — motor de chaves (eliminação simples e dupla, com byes), séries MD1/MD3/MD5,
// resultados, classificação final e exportação em texto. O fluxo de telas fica em ui4.js.
// Estado em M.store.data.tourney (retoma depois de fechar o jogo).
// ============================================================
M.tourney = (function () {
  const BYE = -1;
  const log2 = n => Math.round(Math.log2(n));
  const st = () => M.store.data.tourney;
  const save = () => M.store.save();

  // ordem padrão de sementes numa chave de tamanho potência de 2: [1, N, ...] para os melhores só se cruzarem tarde
  function seedOrder(n) { let a = [1, 2]; while (a.length < n) { const m = a.length * 2 + 1; const b = []; for (const s of a) b.push(s, m - s); a = b; } return a; }

  // ---------- construção da chave ----------
  function build(T) {
    const N = T.size, k = log2(N), M_ = []; let idc = 0;
    const mk = (br, r, i, a, b) => { const m = { id: br + r + '-' + i, br, r, i, a, b, pa: null, pb: null, w: null, l: null, st: 'wait', sc: [0, 0], games: [] }; M_.push(m); return m; };
    const src = { seed: s => ({ t: 's', s }), w: m => ({ t: 'w', m }), l: m => ({ t: 'l', m }) };
    const ord = seedOrder(N);
    const W = [], L = [];
    // primeira rodada da chave dos vencedores
    for (let r = 1; r <= k; r++) {
      W[r] = [];
      const cnt = N / Math.pow(2, r);
      for (let i = 0; i < cnt; i++) {
        const a = r === 1 ? src.seed(ord[2 * i]) : src.w(W[r - 1][2 * i].id), b = r === 1 ? src.seed(ord[2 * i + 1]) : src.w(W[r - 1][2 * i + 1].id);
        W[r][i] = mk('W', r, i, a, b);
      }
      if (T.fmt === 'de') {
        // rodadas da chave dos perdedores que dependem dos perdedores desta rodada
        const mkL = (rr, cnt2, fn) => { L[rr] = []; for (let i = 0; i < cnt2; i++) { const [a, b] = fn(i); L[rr][i] = mk('L', rr, i, a, b); } };
        if (r === 1) mkL(1, N / 4, i => [src.l(W[1][2 * i].id), src.l(W[1][2 * i + 1].id)]);
        else {
          const j = r - 1, even = 2 * j, odd = 2 * j + 1;
          mkL(even, N / Math.pow(2, j + 1), i => [src.w(L[even - 1][i].id), src.l(W[r][i].id)]);
          if (even < 2 * (k - 1)) mkL(odd, N / Math.pow(2, j + 2), i => [src.w(L[even][2 * i].id), src.w(L[even][2 * i + 1].id)]);
        }
      }
    }
    if (T.fmt === 'de') {
      const wf = W[k][0], lf = L[2 * (k - 1)][0];
      const g1 = mk('G', 1, 0, src.w(wf.id), src.w(lf.id));
      const g2 = mk('G', 2, 0, null, null); g2.reset = true; g2.of = g1.id;
    }
    T.matches = M_;
  }
  const byId = (T, id) => T.matches.find(m => m.id === id);

  // ---------- resolução (propaga vencedores/perdedores e byes) ----------
  function token(T, s) {
    if (!s) return null;
    if (s.t === 's') { const p = T.seeds[s.s - 1]; return p === undefined ? BYE : p; }
    const m = byId(T, s.m); if (m.st !== 'done' && m.st !== 'bye') return null;
    return s.t === 'w' ? m.w : m.l;
  }
  function resolve(T) {
    let ch = true, guard = 0;
    while (ch && guard++ < 200) {
      ch = false;
      for (const m of T.matches) {
        if (m.st === 'done' || m.st === 'bye') continue;
        if (m.reset) continue;
        const a = token(T, m.a), b = token(T, m.b);
        if (a !== m.pa || b !== m.pb) { m.pa = a; m.pb = b; ch = true; }
        if (a === null || b === null) continue;
        if (a === BYE || b === BYE) { m.w = a === BYE ? b : a; m.l = BYE; m.st = 'bye'; ch = true; }
        else if (m.st !== 'ready') { m.st = 'ready'; ch = true; }
      }
    }
    // campeão (final do mapa): sem reset, a grande final decide; no SE, a final dos vencedores
    const fin = finalMatch(T);
    if (fin && fin.st === 'done') {
      if (T.fmt === 'de' && fin.br === 'G' && fin.r === 1) {
        const g2 = byId(T, 'G2-0');
        const lbSide = fin.w === fin.pb; // quem veio da chave dos perdedores ganhou: precisa de reset
        if (lbSide && g2.st !== 'done') { g2.pa = fin.pa; g2.pb = fin.pb; g2.st = 'ready'; }
        else if (!lbSide) { g2.st = 'bye'; g2.w = fin.w; g2.l = fin.l; }
      }
    }
    const last = T.fmt === 'de' ? byId(T, 'G2-0') : T.matches.filter(m => m.br === 'W').slice(-1)[0];
    if (last && (last.st === 'done' || last.st === 'bye') && last.w !== null && last.w !== BYE) { T.done = true; T.champion = last.w; }
  }
  function finalMatch(T) { return T.fmt === 'de' ? byId(T, 'G1-0') : T.matches.filter(m => m.br === 'W').slice(-1)[0]; }

  // ordem de jogo: a lista já é gerada na ordem em que as rodadas fazem sentido
  function playOrder(T) {
    const W = T.matches.filter(m => m.br === 'W'), L = T.matches.filter(m => m.br === 'L'), G = T.matches.filter(m => m.br === 'G');
    if (T.fmt !== 'de') return W;
    const out = []; const k = log2(T.size);
    const lr = rr => L.filter(m => m.r === rr);
    out.push(...W.filter(m => m.r === 1), ...lr(1));
    for (let r = 2; r <= k; r++) { out.push(...W.filter(m => m.r === r), ...lr(2 * (r - 1))); if (2 * (r - 1) + 1 <= 2 * (k - 1)) out.push(...lr(2 * (r - 1) + 1)); }
    return out.concat(G);
  }
  const ready = T => playOrder(T).filter(m => m.st === 'ready');
  const next = T => ready(T)[0] || null;

  // ---------- resultado de uma série ----------
  function report(T, m, winnerIdx, sc, games) {
    m.w = winnerIdx; m.l = winnerIdx === m.pa ? m.pb : m.pa; m.sc = sc.slice(); m.games = games || m.games; m.st = 'done';
    resolve(T); T.t = Date.now(); save();
  }

  // ---------- nomes, rodadas e rótulos ----------
  const name = (T, i) => (i === BYE ? '—' : i === null || i === undefined ? '?' : T.players[i].n);
  function roundLabel(T, m) {
    const k = log2(T.size);
    if (m.br === 'G') return m.r === 1 ? 'GRANDE FINAL' : 'GRANDE FINAL (RESET)';
    if (m.br === 'W') { const left = k - m.r; return T.fmt === 'de' ? (left === 0 ? 'FINAL DOS VENCEDORES' : left === 1 ? 'SEMI DOS VENCEDORES' : 'VENCEDORES R' + m.r) : (left === 0 ? 'FINAL' : left === 1 ? 'SEMIFINAL' : left === 2 ? 'QUARTAS' : 'RODADA ' + m.r); }
    const last = 2 * (k - 1); return m.r === last ? 'FINAL DOS PERDEDORES' : m.r === last - 1 ? 'SEMI DOS PERDEDORES' : 'PERDEDORES R' + m.r;
  }
  const need = T => (T.bo + 1) / 2;
  const fmtLabel = T => (T.fmt === 'de' ? 'ELIMINAÇÃO DUPLA' : 'ELIMINAÇÃO SIMPLES');

  // ---------- classificação final ----------
  // campeão, vice e depois quem caiu em cada rodada, do fim para o começo (quem cai na mesma rodada empata na posição)
  function standings(T) {
    if (!T.done) return [];
    const res = []; let pos;
    const group = list => { for (const i of list) res.push({ i, place: pos }); pos += list.length; };
    const final = finalMatch(T);
    if (T.fmt === 'de') {
      const g2 = byId(T, 'G2-0'), gf = g2.st === 'done' ? g2 : final;
      res.push({ i: gf.w, place: 1 }, { i: gf.l, place: 2 }); pos = 3;
      const L = T.matches.filter(m => m.br === 'L' && m.st === 'done' && m.l !== BYE), rounds = [...new Set(L.map(m => m.r))].sort((a, b) => b - a);
      for (const r of rounds) group(L.filter(m => m.r === r).map(m => m.l));
    } else {
      res.push({ i: final.w, place: 1 }, { i: final.l, place: 2 }); pos = 3;
      const W = T.matches.filter(m => m.br === 'W' && m.st === 'done' && m.l !== BYE && m !== final), rounds = [...new Set(W.map(m => m.r))].sort((a, b) => b - a);
      for (const r of rounds) group(W.filter(m => m.r === r).map(m => m.l));
    }
    return res;
  }

  // ---------- criação ----------
  function create(o) {
    const players = o.players.map((p, i) => ({ n: (p.n || 'J' + (i + 1)).trim().slice(0, 12).toUpperCase() || 'J' + (i + 1), cpu: p.cpu || null }));
    let order = players.map((_, i) => i); if (o.shuffle) order = M.shuffle(order);
    const size = Math.max(4, Math.pow(2, Math.ceil(Math.log2(players.length))));
    const T = { id: Date.now().toString(36), name: (o.name || 'TORNEIO DA RINHA').trim().slice(0, 28), created: Date.now(), fmt: o.fmt === 'de' ? 'de' : 'se', bo: [1, 3, 5].includes(o.bo) ? o.bo : 3, keep: o.keep !== false, players, seeds: order, size, matches: [], done: false, champion: null, set: null };
    build(T); resolve(T); M.store.data.tourney = T; save(); return T;
  }
  function progress(T) { const real = T.matches.filter(m => m.st !== 'bye' && !(m.reset && m.st === 'wait')); return [real.filter(m => m.st === 'done').length, real.length]; }

  // ---------- exportação em texto ----------
  function exportText(T) {
    const F = id => (M.FIGHTERS[id] ? (M.FIGHTERS[id].short || M.FIGHTERS[id].name) : id);
    const L = [];
    L.push('SERTÃO FIGHT BRASIL — ' + T.name, new Date(T.created).toLocaleDateString(M.i18n.lang === 'pt' ? 'pt-BR' : M.i18n.lang) + ' • ' + M.tr(fmtLabel(T)) + ' • ' + M.tr('MELHOR DE') + ' ' + T.bo + ' • ' + T.players.length + ' ' + M.tr('JOGADORES'), '');
    if (T.done) { L.push(M.tr('CAMPEÃO') + ': ' + name(T, T.champion), ''); for (const s of standings(T)) L.push(s.place + 'º  ' + name(T, s.i)); L.push(''); }
    L.push(M.tr('PARTIDAS'));
    for (const m of T.matches) { if (m.st !== 'done') continue; L.push(`${roundLabel(T, m)}: ${name(T, m.pa)} ${m.sc[0]}–${m.sc[1]} ${name(T, m.pb)}${m.games.length ? '  (' + m.games.map(g => F(g.fa) + ' x ' + F(g.fb)).join(', ') + ')' : ''}`); }
    return L.join('\n');
  }
  return { BYE, seedOrder, create, build, resolve, report, ready, next, byId, name, roundLabel, need, fmtLabel, standings, progress, exportText, playOrder, log2, get cur() { return st() || null; } };
})();
