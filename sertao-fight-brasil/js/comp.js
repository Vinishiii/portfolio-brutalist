'use strict';
// ============================================================
// COMPETITIVO — perfil do jogador (tag), ranqueada contra a CPU com pontos de rinha (PR),
// divisões, sequência, histórico e tabela de confrontos entre lutadores.
// A CPU da ranqueada ajusta a força ao PR do jogador (interpolando os perfis de IA do jogo).
// ============================================================
M.comp = (function () {
  const TIERS = [
    { id: 'bronze', name: 'BRONZE', c: '#b87333', c2: '#6b3a14' },
    { id: 'prata', name: 'PRATA', c: '#c9d0d6', c2: '#69727a' },
    { id: 'ouro', name: 'OURO', c: '#f6c61c', c2: '#a8730a' },
    { id: 'platina', name: 'PLATINA', c: '#62d8cf', c2: '#1d7f78' },
    { id: 'diamante', name: 'DIAMANTE', c: '#74b2ff', c2: '#2a5fb3' },
    { id: 'mestre', name: 'MESTRE', c: '#e03a96', c2: '#7a1457' },
    { id: 'lenda', name: 'LENDA DA BRASA', c: '#ff7a2a', c2: '#b02a10' }
  ];
  const START_PR = 450, PLACEMENTS = 5, DIV = ['III', 'II', 'I'];
  const STAGES = ['porto', 'ladeira', 'rio', 'sertao', 'terreiro', 'pantanal']; // cenários de torneio: leitura limpa
  let cur = null;

  const data = () => {
    const p = M.store.data.progress;
    if (!p.comp) p.comp = { tag: '', pr: START_PR, games: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, peak: START_PR, hist: [], vs: {} };
    return p.comp;
  };
  const tag = () => (data().tag || '').trim().slice(0, 12).toUpperCase() || 'JOGADOR';
  function rank(pr) {
    const sub = Math.floor(pr / 100), ti = Math.min(6, Math.floor(pr / 300)), div = ti < 6 ? DIV[Math.floor((pr % 300) / 100)] : '';
    const lo = ti < 6 ? sub * 100 : 1800 + Math.floor((pr - 1800) / 200) * 200, hi = ti < 6 ? lo + 100 : lo + 200;
    return { tier: TIERS[ti], ti, div, sub, name: TIERS[ti].name + (div ? ' ' + div : ''), lo, hi, pct: M.clamp((pr - lo) / (hi - lo), 0, 1), legend: ti === 6 };
  }
  const placing = () => data().games < PLACEMENTS;

  // força da CPU para um rating: interpola os perfis Novato → Brabo → Lendário
  function aiFor(r) {
    const P = M.AI.PROFILES, t = M.clamp(r / 2400, 0, 1.25);
    const mix = (a, b, k) => { const o = {}; for (const key of Object.keys(a)) o[key] = M.lerp(a[key], b[key], k); return o; };
    const p = t < 0.5 ? mix(P.novato, P.brabo, t / 0.5) : mix(P.brabo, P.lendario, Math.min(1, (t - 0.5) / 0.5));
    if (t > 1) { p.react = Math.min(0.95, p.react + (t - 1) * 0.4); p.think = Math.max(3, p.think - (t - 1) * 8); }
    const u = Math.min(1, t);
    return { extra: p, mods: { dmg: +(0.8 + 0.4 * u).toFixed(3), hp: +(0.9 + 0.2 * u).toFixed(3) } };
  }
  function oppRating(pr) { return Math.max(0, Math.round(pr + (Math.random() - 0.35) * 160)); }

  function play(fighterId, pal, prevOpp) {
    const d = data(), pool = M.ROSTER.filter(id => (id !== 'cinzas' || M.store.data.progress.cinzas) && id !== prevOpp);
    const opp = M.choice(pool), oR = oppRating(d.pr), ai = aiFor(oR), stage = M.choice(STAGES);
    cur = { p1: fighterId, p2: opp, pal, oR, prBefore: d.pr, rankBefore: rank(d.pr), stage, ai };
    const oPal = fighterId === opp ? 1 : 0;
    M.flow.startMatch({
      mode: 'ranked', label: 'RANQUEADA', p1: { id: fighterId, ctrl: 'human', pal: pal | 0 }, p2: { id: opp, ctrl: 'cpu', mods: ai.mods, aiExtra: ai.extra, pal: oPal },
      stage, rounds: 2, timer: 99, difficulty: 'brabo', tags: [tag(), 'CPU ' + M.tr(rank(oR).tier.name)], keepReplay: true, onEnd: r => end(r)
    });
  }
  function apply(win, r, forfeit) {
    const d = data(), c = cur, before = d.pr;
    const expected = 1 / (1 + Math.pow(10, (c.oR - d.pr) / 400)), K = d.games < PLACEMENTS ? 64 : 38;
    let delta = Math.round(K * ((win ? 1 : 0) - expected));
    let bonus = 0;
    if (win) { bonus = Math.min(8, Math.max(0, d.streak) * 2); if (r && r.stats && r.stats.p2.dmg === 0) bonus += 6; delta = Math.max(6, delta + bonus); }
    else delta = Math.min(forfeit ? -10 : -4, delta);
    d.pr = Math.max(0, d.pr + delta); delta = d.pr - before; d.peak = Math.max(d.peak, d.pr);
    d.games++; if (win) { d.wins++; d.streak = d.streak > 0 ? d.streak + 1 : 1; d.bestStreak = Math.max(d.bestStreak, d.streak); } else { d.losses++; d.streak = d.streak < 0 ? d.streak - 1 : -1; }
    const row = (d.vs[c.p1] = d.vs[c.p1] || {}), cell = (row[c.p2] = row[c.p2] || [0, 0]); cell[win ? 0 : 1]++;
    const h = { t: Date.now(), win, d: delta, p1: c.p1, p2: c.p2, o: c.oR, s: r ? r.wins.slice() : [0, 2], sec: r ? Math.round(r.frames / 60) : 0, rid: r && r.replayId || null, ff: !!forfeit };
    d.hist.unshift(h); if (d.hist.length > 40) d.hist.length = 40;
    M.store.save();
    M.ach.rankEvent(d, rank(d.pr), rank(before));
    return { win, delta, bonus, before, after: d.pr, rankBefore: rank(before), rankAfter: rank(d.pr), row: h, placement: d.games <= PLACEMENTS, games: d.games };
  }
  function end(r) {
    M.state = 'results';
    const win = r.winnerSide === 1, res = apply(win, r, false);
    M.ui3.rankedResult(Object.assign({ r, c: cur }, res));
  }
  // saiu no meio da luta: conta como derrota
  function forfeit() { if (!cur) return; const res = apply(false, null, true); M.match = null; M.state = 'results'; M.ui3.rankedResult(Object.assign({ r: null, c: cur }, res)); }

  // ---- emblema (escudo com a cor do nível) ----
  function emblem(g, cx, cy, S, rk, glow) {
    const T = rk.tier, w = S * 0.5, h = S * 0.62;
    g.save(); g.translate(cx, cy);
    if (glow) { const rg = g.createRadialGradient(0, 0, S * 0.1, 0, 0, S * 0.75); rg.addColorStop(0, T.c + 'aa'); rg.addColorStop(1, T.c + '00'); g.fillStyle = rg; g.fillRect(-S, -S, S * 2, S * 2); }
    const shield = k => { g.beginPath(); g.moveTo(0, -h * k); g.lineTo(w * k, -h * 0.62 * k); g.lineTo(w * 0.92 * k, h * 0.22 * k); g.quadraticCurveTo(w * 0.6 * k, h * 0.78 * k, 0, h * k); g.quadraticCurveTo(-w * 0.6 * k, h * 0.78 * k, -w * 0.92 * k, h * 0.22 * k); g.lineTo(-w * k, -h * 0.62 * k); g.closePath(); };
    g.lineJoin = 'round';
    shield(1.08); g.fillStyle = '#141210'; g.fill();
    shield(1); const gr = g.createLinearGradient(0, -h, 0, h); gr.addColorStop(0, T.c); gr.addColorStop(1, T.c2); g.fillStyle = gr; g.fill();
    shield(0.8); g.lineWidth = S * 0.025; g.strokeStyle = 'rgba(20,18,16,0.75)'; g.stroke();
    shield(0.74); const g2 = g.createLinearGradient(0, -h, 0, h); g2.addColorStop(0, 'rgba(255,255,255,0.35)'); g2.addColorStop(0.5, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.25)'); g.fillStyle = g2; g.fill();
    // coroa de chamas no centro (mesma família do logo)
    const base = h * 0.4;
    const fl = (cx, bh, bw, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx - bw, base); g.bezierCurveTo(cx - bw * 1.3, base - bh * 0.42, cx - bw * 0.15, base - bh * 0.5, cx + bw * 0.08, base - bh); g.bezierCurveTo(cx + bw * 0.2, base - bh * 0.58, cx + bw * 1.35, base - bh * 0.46, cx + bw, base); g.closePath(); g.fill(); };
    for (const [dx, k] of [[0, 1], [-w * 0.42, 0.58], [w * 0.4, 0.66]]) {
      fl(dx, h * 1.0 * k, w * 0.3 * (0.6 + 0.4 * k), '#141210'); fl(dx, h * 0.9 * k, w * 0.26 * (0.6 + 0.4 * k), '#c8371d'); fl(dx, h * 0.68 * k, w * 0.19 * (0.6 + 0.4 * k), '#f0661c'); fl(dx, h * 0.42 * k, w * 0.11 * (0.6 + 0.4 * k), '#ffd53a');
    }
    // estrelas da divisão
    const stars = rk.legend ? 5 : rk.div === 'I' ? 3 : rk.div === 'II' ? 2 : 1;
    for (let i = 0; i < stars; i++) { const sx = (i - (stars - 1) / 2) * S * 0.12, sy = -h * 0.74; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? S * 0.025 : S * 0.055; g.lineTo(sx + Math.cos(a) * d, sy + Math.sin(a) * d); } g.closePath(); g.fillStyle = '#fff3b0'; g.fill(); g.lineWidth = S * 0.012; g.strokeStyle = '#141210'; g.stroke(); }
    g.restore();
  }
  return { TIERS, STAGES, START_PR, PLACEMENTS, data, tag, rank, placing, aiFor, play, end, forfeit, emblem, get cur() { return cur; } };
})();
