'use strict';
// ============================================================
// META — a camada que dá motivo para "mais uma luta":
//   • XP por luta, nível do jogador (1–60) e maestria por lutador (1–10);
//   • missões do dia (3, sempre as mesmas no mesmo dia) e metas de cada lutador;
//   • recompensas GANHAS (títulos, molduras de retrato, cores alternativas), nunca compradas nem sorteadas;
//   • Rinha da Semana: três lutas com regras malucas que mudam toda segunda, com placar e estrelas.
// Só lê o resultado da luta: não mexe na simulação, então replays e balanceamento ficam intactos.
// Estado em M.store.data.progress.meta.
// ============================================================
M.meta = (function () {
  const pad = n => String(n).padStart(2, '0');
  const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => keyOf(new Date());
  const seedOf = key => { let h = 2166136261; for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return (h % 2147483646) + 1; };
  const fname = id => { const f = M.FIGHTERS[id]; return f ? (f.short || f.name) : id; };

  // ---------------------------------------------------------------- níveis
  const LV_MAX = 60, need = L => 80 + 22 * L;                 // XP para ir do nível L ao L+1
  const cumTo = L => { let s = 0; for (let i = 1; i < L; i++) s += need(i); return s; };
  function lvOf(xp) {
    let L = 1, rest = Math.max(0, xp | 0);
    while (L < LV_MAX && rest >= need(L)) { rest -= need(L); L++; }
    return { lv: L, into: L >= LV_MAX ? 0 : rest, need: L >= LV_MAX ? 0 : need(L), pct: L >= LV_MAX ? 1 : rest / need(L) };
  }
  const MAS = [0, 200, 500, 900, 1500, 2300, 3300, 4600, 6200, 8200]; // XP de maestria para o nível 1..10
  function masOf(xp) {
    let L = 1; while (L < MAS.length && xp >= MAS[L]) L++;
    const lo = MAS[L - 1], hi = MAS[L] === undefined ? null : MAS[L];
    return { lv: L, into: xp - lo, need: hi === null ? 0 : hi - lo, pct: hi === null ? 1 : (xp - lo) / (hi - lo), next: hi };
  }

  // ---------------------------------------------------------------- recompensas
  const TITLES = [
    { id: 't_novato', name: 'Novato da Rinha', lv: 1 }, { id: 't_cabra', name: 'Cabra Marcado', lv: 3 }, { id: 't_arretado', name: 'Arretado', lv: 6 },
    { id: 't_peste', name: 'Cabra da Peste', lv: 10 }, { id: 't_rei', name: 'Rei da Quebrada', lv: 15 }, { id: 't_lenda', name: 'Lenda do Sertão', lv: 25 }, { id: 't_brasa', name: 'Guardião da Brasa', lv: 40 },
    { id: 't_semana', name: 'Doido da Semana', how: 'Termine a Rinha da Semana.' }, { id: 't_dia7', name: 'Sempre Presente', how: 'Sequência de 7 dias no Desafio do Dia.' }
  ];
  const FRAMES = [
    { id: 'f0', name: 'Papel', lv: 1, c: '#f3e6c8' }, { id: 'f1', name: 'Bronze', lv: 2, c: '#c98a4b' }, { id: 'f2', name: 'Prata', lv: 5, c: '#d3d8de' }, { id: 'f3', name: 'Ouro', lv: 9, c: '#f2b70c' },
    { id: 'f4', name: 'Brasa', lv: 14, c: '#e8712b', fx: 'fire' }, { id: 'f5', name: 'Código', lv: 20, c: '#3dff7a', c2: '#b25cff', fx: 'code' }, { id: 'f6', name: 'Lenda', lv: 30, c: '#ff5ad1', fx: 'rainbow' }, { id: 'f7', name: 'Diamante', lv: 45, c: '#8be9ff', fx: 'shine' }
  ];
  const PAL_AT = [0, 2, 4]; // maestria necessária para a cor alternativa 0 (original), 1 (Folia) e 2 (Noite)
  const MASTER_TITLE_AT = 5;

  // ---------------------------------------------------------------- estado
  const root = () => M.store.data.progress;
  function data() {
    const p = root();
    if (!p.meta) {
      const m = p.meta = { xp: 0, fx: {}, g: {}, mis: null, equip: { title: 't_novato', frame: 'f0' }, got: {}, seeded: 0, week: { best: {}, stars: {}, runs: 0, done: 0 }, log: [] };
      // quem já jogou antes não começa do zero: o histórico vira XP
      const S = p.stats; let seed = 0;
      if (S && S.fighters) for (const id in S.fighters) { const f = S.fighters[id]; const x = (f.w || 0) * 70 + Math.max(0, (f.m || 0) - (f.w || 0)) * 30; if (x > 0) { m.fx[id] = x; seed += x; } }
      if (p.ach) seed += Object.keys(p.ach).length * 25;
      if (p.storyDone) seed += 400;
      m.xp = seed; m.seeded = seed;
    }
    const m = p.meta; m.fx = m.fx || {}; m.g = m.g || {}; m.equip = m.equip || { title: 't_novato', frame: 'f0' }; m.got = m.got || {}; m.week = m.week || { best: {}, stars: {}, runs: 0, done: 0 }; m.log = m.log || [];
    return m;
  }
  const level = () => lvOf(data().xp);
  const mastery = id => masOf(data().fx[id] || 0);

  // o que está liberado agora
  function unlocked(id) {
    const m = data(), L = level().lv;
    const t = TITLES.find(x => x.id === id); if (t) return t.lv ? L >= t.lv : !!m.got[id];
    const f = FRAMES.find(x => x.id === id); if (f) return L >= f.lv;
    if (id.startsWith('m_')) return !!m.got[id] || mastery(id.slice(2)).lv >= MASTER_TITLE_AT;
    return !!m.got[id];
  }
  const palUnlocked = (fid, k) => !k || mastery(fid).lv >= PAL_AT[k];
  const masterTitles = () => M.ROSTER.map(id => ({ id: 'm_' + id, name: 'Mestre ' + fname(id), how: `Maestria ${MASTER_TITLE_AT} com ${fname(id)}.`, fid: id }));
  const allTitles = () => TITLES.concat(masterTitles());
  function titleOf(id) { const t = allTitles().find(x => x.id === (id || data().equip.title)); return t && unlocked(t.id) ? t : TITLES[0]; }
  function frameOf(id) { const f = FRAMES.find(x => x.id === (id || data().equip.frame)); return f && unlocked(f.id) ? f : FRAMES[0]; }
  function equip(kind, id) { const m = data(); if (kind === 'title' && allTitles().some(t => t.id === id) && unlocked(id)) m.equip.title = id; else if (kind === 'frame' && FRAMES.some(f => f.id === id) && unlocked(id)) m.equip.frame = id; else return false; M.store.save(); return true; }
  function cycle(kind, d) {
    const L = (kind === 'title' ? allTitles() : FRAMES).filter(x => unlocked(x.id)); const cur = kind === 'title' ? titleOf().id : frameOf().id;
    const i = Math.max(0, L.findIndex(x => x.id === cur)); equip(kind, L[(i + d + L.length) % L.length].id);
  }
  // cor do anel do retrato no HUD (animada nas molduras especiais)
  function ring(frameN) {
    const f = frameOf(); const t = frameN || 0;
    if (f.fx === 'fire') return t % 8 < 4 ? '#e8712b' : '#f2b70c';
    if (f.fx === 'code') return t % 14 < 7 ? f.c : f.c2;
    if (f.fx === 'rainbow') return `hsl(${(t * 6) % 360},90%,62%)`;
    if (f.fx === 'shine') return t % 60 < 8 ? '#ffffff' : f.c;
    return f.c;
  }

  // ---------------------------------------------------------------- missões do dia
  const POOL = [
    { id: 'wins', ev: 'wins', kind: 'sum', n: [2, 3, 4], xp: 90, text: 'Vença {n} lutas' },
    { id: 'perfect', ev: 'perfect', kind: 'sum', n: [3, 5, 8], xp: 80, text: 'Faça {n} esquivas perfeitas' },
    { id: 'combo', ev: 'maxCombo', kind: 'max', n: [5, 7, 9], xp: 100, text: 'Acerte um combo de {n} golpes' },
    { id: 'supers', ev: 'supers', kind: 'sum', n: [2, 3], xp: 90, text: 'Use a Peia {n} vezes' },
    { id: 'beats', ev: 'beats', kind: 'sum', n: [6, 10, 15], xp: 80, text: 'Acerte {n} golpes no compasso' },
    { id: 'flawless', ev: 'flawless', kind: 'sum', n: [1], xp: 130, text: 'Vença uma luta sem sofrer dano' },
    { id: 'counters', ev: 'counters', kind: 'sum', n: [2, 4], xp: 80, text: 'Faça {n} contra-golpes' },
    { id: 'roster', ev: 'winners', kind: 'set', n: [2, 3], xp: 100, text: 'Vença com {n} lutadores diferentes' },
    { id: 'fin', ev: 'finKO', kind: 'sum', n: [1], xp: 110, text: 'Nocauteie com o arremate da Peia' },
    { id: 'blocks', ev: 'blocks', kind: 'sum', n: [8, 15], xp: 60, text: 'Defenda {n} golpes' },
    { id: 'matches', ev: 'matches', kind: 'sum', n: [3, 5], xp: 60, text: 'Jogue {n} lutas' },
    { id: 'dmg', ev: 'dmg', kind: 'sum', n: [1500, 2500], xp: 70, text: 'Cause {n} de dano' }
  ];
  function missions() {
    const m = data(), day = today();
    if (!m.mis || m.mis.day !== day) {
      const rnd = M.seeded(seedOf('mis-' + day)); rnd(); rnd();
      const picks = M.shuffle0(POOL.map(p => p.id), rnd).slice(0, 3);
      m.mis = { day, list: picks.map(id => { const p = POOL.find(x => x.id === id); return { id, n: p.n[Math.floor(rnd() * p.n.length)], p: 0, done: false, set: [] }; }), first: false };
      M.store.save();
    }
    return m.mis.list.map(x => { const d = POOL.find(p => p.id === x.id); return Object.assign({}, x, { text: d.text.replace('{n}', x.n), xp: d.xp }); });
  }
  const missionText = (id, n) => POOL.find(p => p.id === id).text.replace('{n}', n);
  // soma o que aconteceu na luta nas missões; devolve as que acabaram de fechar
  function trackMissions(ev) {
    missions(); const m = data(), out = [];
    for (const x of m.mis.list) {
      if (x.done) continue; const d = POOL.find(p => p.id === x.id);
      if (d.kind === 'sum') x.p += ev[d.ev] || 0;
      else if (d.kind === 'max') x.p = Math.max(x.p, ev[d.ev] || 0);
      else if (d.kind === 'set') { for (const w of ev.winners || []) if (!x.set.includes(w)) x.set.push(w); x.p = x.set.length; }
      if (x.p >= x.n) { x.done = true; x.p = x.n; out.push({ id: x.id, text: missionText(x.id, x.n), xp: d.xp }); }
    }
    return out;
  }

  // ---------------------------------------------------------------- metas de cada lutador
  const GOALS = [
    { id: 'win10', text: 'Vença 10 lutas', n: 10, get: g => g.win || 0 },
    { id: 'sup10', text: 'Use a Peia 10 vezes', n: 10, get: g => g.sup || 0 },
    { id: 'fl3', text: 'Vença 3 lutas sem sofrer dano', n: 3, get: g => g.fl || 0 },
    { id: 'c8', text: 'Acerte um combo de 8 golpes', n: 1, get: g => g.c8 || 0 },
    { id: 'lend', text: 'Vença no nível Lendário', n: 1, get: g => g.lend || 0 }
  ];
  const goalsOf = id => { const m = data(); const g = m.g[id] || (m.g[id] = { done: {} }); return GOALS.map(d => ({ id: d.id, text: d.text, n: d.n, p: Math.min(d.n, d.get(g)), done: !!g.done[d.id] })); };

  // ---------------------------------------------------------------- XP da luta
  const DIFF_K = { novato: 0.8, brabo: 1, lendario: 1.3 }, MODE_K = { ranked: 1.25, tourney: 1.15, week: 1.5, daily: 1.2, story: 1.1, king: 1 };
  function partsFor(r, o, side, both) {
    const st = r.stats['p' + side], op = r.stats['p' + (3 - side)], win = r.winnerSide === side, cfg = side === 1 ? o.p1 : o.p2, vsCpu = (side === 1 ? o.p2 : o.p1).ctrl === 'cpu';
    const P = [['Lutou', 30]];
    if (win) P.push(['Vitória', 50]);
    const dmg = Math.min(40, Math.floor((st.dmg || 0) / 50)); if (dmg) P.push(['Dano causado', dmg]);
    const cb = Math.min(30, (st.maxCombo || 0) * 3); if (cb) P.push(['Combos', cb]);
    const sk = Math.min(25, (st.perfect || 0) * 5) + Math.min(20, (st.beats || 0) * 2) + Math.min(24, (st.counters || 0) * 6) + Math.min(18, (st.supers || 0) * 6) + (st.finKO ? 20 : 0);
    if (sk) P.push(['Estilo', sk]);
    const flawless = win && !(op.dmg > 0); if (flawless) P.push(['Sem tomar dano', 40]);
    let sub = P.reduce((s, x) => s + x[1], 0), k = 1;
    if (vsCpu) k *= DIFF_K[o.difficulty] || 1;
    if ((o.mutators || []).length) k *= 1 + 0.08 * o.mutators.length;
    k *= MODE_K[o.mode] || 1;
    if (both) k *= 0.6;
    if (r.frames < 600) k = Math.min(k, 15 / Math.max(15, sub));
    const total = Math.max(1, Math.round(sub * k));
    return { parts: P, mult: Math.round(k * 100) / 100, total, flawless, win, st, id: cfg.id };
  }

  // chamado no fim de toda luta que conta (menos treino, tutorial e replays). Devolve o relatório para as telas.
  function award(r, o) {
    if (!r || !o || o.mode === 'training' || o.tutorial || o.replay || o.noXP) return null;
    const h1 = o.p1 && o.p1.ctrl === 'human', h2 = o.p2 && o.p2.ctrl === 'human';
    if (!h1 && !h2) return null;
    const m = data(), L0 = level(), sides = [h1 && 1, h2 && 2].filter(Boolean), both = sides.length === 2;
    const prim = partsFor(r, o, sides[0], both);
    const rep = { side: sides[0], parts: prim.parts.slice(), mult: prim.mult, base: prim.total, bonus: [], total: 0, win: prim.win, fid: prim.id, ups: [], missions: [], goals: [], rewards: [] };
    // bônus do dia
    const day = today(); missions();
    if (prim.win && !m.mis.first) { m.mis.first = true; rep.bonus.push(['Primeira vitória do dia', 80]); }
    // maestria (cada lutador humano) e metas
    const mast = [];
    for (const s of sides) {
      const pf = s === sides[0] ? prim : partsFor(r, o, s, both), id = pf.id, x0 = m.fx[id] || 0, M0 = masOf(x0);
      m.fx[id] = x0 + pf.total;
      const g = m.g[id] || (m.g[id] = { done: {} });
      if (pf.win) { g.win = (g.win || 0) + 1; if (pf.flawless) g.fl = (g.fl || 0) + 1; if (o.difficulty === 'lendario' && (s === 1 ? o.p2 : o.p1).ctrl === 'cpu') g.lend = (g.lend || 0) + 1; }
      g.sup = (g.sup || 0) + (pf.st.supers || 0); if ((pf.st.maxCombo || 0) >= 8) g.c8 = 1;
      for (const d of GOALS) if (!g.done[d.id] && d.get(g) >= d.n) { g.done[d.id] = 1; rep.goals.push({ id, text: d.text, xp: 150 }); m.fx[id] += 150; }
      const M1 = masOf(m.fx[id]);
      mast.push({ id, lv0: M0.lv, lv1: M1.lv, pct0: M0.pct, pct1: M1.pct, xp: pf.total });
      if (M1.lv > M0.lv) {
        for (let k = M0.lv + 1; k <= M1.lv; k++) {
          rep.ups.push({ type: 'mastery', id, lv: k });
          PAL_AT.forEach((at, pal) => { if (pal && at === k) rep.rewards.push({ type: 'cor', text: `${M.PAL_NAMES[pal]} (cor de ${fname(id)})` }); });
          if (k === MASTER_TITLE_AT) { m.got['m_' + id] = Date.now(); rep.rewards.push({ type: 'título', text: 'Mestre ' + fname(id) }); }
        }
      }
    }
    rep.mastery = mast[0]; rep.masteryAll = mast;
    // missões do dia (só o jogador principal conta)
    const st = prim.st;
    const ev = { matches: 1, wins: prim.win ? 1 : 0, perfect: st.perfect || 0, maxCombo: st.maxCombo || 0, supers: st.supers || 0, beats: st.beats || 0, flawless: prim.flawless ? 1 : 0, counters: st.counters || 0, winners: prim.win ? [prim.id] : [], finKO: st.finKO ? 1 : 0, blocks: st.blocks || 0, dmg: st.dmg || 0 };
    rep.missions = trackMissions(ev);
    const extra = rep.bonus.reduce((s, x) => s + x[1], 0) + rep.missions.reduce((s, x) => s + x.xp, 0) + rep.goals.reduce((s, x) => s + x.xp, 0);
    rep.total = prim.total + extra;
    m.xp += rep.total;
    const L1 = lvOf(m.xp);
    rep.lv0 = L0.lv; rep.lv1 = L1.lv; rep.pct0 = L0.pct; rep.pct1 = L1.pct; rep.xp1 = m.xp;
    for (let k = L0.lv + 1; k <= L1.lv; k++) {
      rep.ups.push({ type: 'level', lv: k });
      for (const t of TITLES) if (t.lv === k) rep.rewards.push({ type: 'título', text: t.name });
      for (const f of FRAMES) if (f.lv === k && k > 1) rep.rewards.push({ type: 'moldura', text: f.name });
    }
    m.log.unshift({ t: Date.now(), xp: rep.total, win: prim.win, fid: prim.id }); if (m.log.length > 12) m.log.length = 12;
    M.store.save();
    if (M.ach) { if (L1.lv >= 10) M.ach.unlock('lv10'); if (L1.lv >= 25) M.ach.unlock('lv25'); if (mast.some(x => x.lv1 >= 5)) M.ach.unlock('master5'); if (rep.missions.length) M.ach.unlock('mission1'); if (m.mis.list.every(x => x.done)) M.ach.unlock('missions3'); }
    return rep;
  }

  // ---------------------------------------------------------------- aviso rápido (para as telas que não têm painel de XP)
  function toast(rep) {
    if (!rep || rep.shown || (M.store.data.settings.broadcast)) return;
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'toast xp'; el.setAttribute('data-notr', '');
    const up = rep.ups.find(u => u.type === 'level');
    el.innerHTML = `<div class="toast-ico">${up ? '▲' : '+'}</div><div><b>${M.tr(up ? 'NÍVEL ' + up.lv : 'XP')}</b><span>+${rep.total} XP</span><small>${M.tr('Nível')} ${rep.lv1} • ${Math.round(rep.pct1 * 100)}%</small></div>`;
    box.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 500); }, up ? 4200 : 2600);
    for (const rw of rep.rewards) queueReward(rw);
  }
  let rq = [], rShowing = false;
  function queueReward(rw) { rq.push(rw); if (!rShowing) nextReward(); }
  function nextReward() {
    const rw = rq.shift(); if (!rw) { rShowing = false; return; }
    rShowing = true;
    let box = document.getElementById('toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'toast reward'; el.setAttribute('data-notr', '');
    el.innerHTML = `<div class="toast-ico">★</div><div><b>${M.tr('RECOMPENSA')}</b><span>${M.tr(rw.text)}</span><small>${M.tr(rw.type)}</small></div>`;
    box.appendChild(el); if (M.audio && M.audio.play) M.audio.play('patua');
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); nextReward(); }, 500); }, 3400);
  }

  // ---------------------------------------------------------------- Rinha da Semana
  const THEMES = [
    { id: 'lua', name: 'Semana da Lua Cheia', mut: ['lua', 'folia'], blurb: 'Pulos longos e Peia pra todo lado.' },
    { id: 'peso', name: 'Semana do Peso', mut: ['dano', 'curta'], blurb: 'Um golpe decide. Vida curta, dano dobrado.' },
    { id: 'turbo', name: 'Semana Turbinada', mut: ['turbo', 'folia'], blurb: 'Tudo rápido, e a Energia enche voando.' },
    { id: 'vampiro', name: 'Semana do Vampiro', mut: ['sangue', 'dano'], blurb: 'Quem acerta se cura, e o dano é dobrado.' },
    { id: 'pluma', name: 'Semana da Pluma', mut: ['lua', 'turbo'], blurb: 'Rápido e leve, quase voando.' },
    { id: 'frenesi', name: 'Semana do Frenesi', mut: ['turbo', 'dano', 'curta'], blurb: 'Depressa, forte e frágil. Pisque e perdeu.' },
    { id: 'festa', name: 'Semana da Festa', mut: ['folia', 'sangue'], blurb: 'Torcida em êxtase e golpes que curam.' },
    { id: 'gigante', name: 'Semana do Gigante', mut: ['dano', 'sangue', 'lua'], blurb: 'Dano dobrado, cura e pouca gravidade.' }
  ];
  function weekKey(d) { d = d || new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); const w = Math.ceil(((t - y0) / 86400000 + 1) / 7); return t.getUTCFullYear() + '-W' + pad(w); }
  const daysLeftInWeek = () => 8 - (new Date().getDay() || 7); // segunda=7 ... domingo=1
  function weekBuild(key) {
    key = key || weekKey();
    const rnd = M.seeded(seedOf('week-' + key)); rnd(); rnd();
    const theme = THEMES[Math.floor(rnd() * THEMES.length)];
    const unl = root().cinzas; const pool = M.ROSTER.filter(id => id !== 'cinzas' || unl);
    const opps = M.shuffle0(pool, rnd).slice(0, 3);
    const sts = M.stages.order.filter(s => s !== 'cinzas');
    return { key, theme, opps, stages: opps.map(o => (o === 'cinzas' ? 'cinzas' : sts[Math.floor(rnd() * sts.length)])), diffs: ['brabo', 'brabo', 'lendario'] };
  }
  const weekData = () => data().week;
  function weekStart(p1, pal) {
    const W = weekBuild(); const opps = W.opps.map((o, i) => (o === p1 ? (M.ROSTER.find(x => x !== p1 && !W.opps.includes(x) && (x !== 'cinzas' || root().cinzas)) || o) : o));
    const run = { W, p1, pal: pal | 0, i: 0, score: 0, won: 0, flawless: 0, fights: [], opps, frames: 0 };
    M.week.run = run; return run;
  }
  function weekMatchOpts(run) {
    const i = run.i, W = run.W;
    return { mode: 'week', p1: { id: run.p1, ctrl: 'human', pal: run.pal }, p2: { id: run.opps[i], ctrl: 'cpu', pal: run.opps[i] === run.p1 ? 1 : 0 }, stage: W.stages[i], rounds: 1, timer: 70, mutators: W.theme.mut.slice(), difficulty: W.diffs[i], boss: run.opps[i] === 'cinzas', label: 'SEMANA' };
  }
  function weekScoreFight(r) {
    const hp = r.winner.hp / r.winner.maxHp, sec = r.frames / 60, st = r.stats.p1;
    return Math.round(150 + hp * 150 + Math.max(0, 60 - sec) * 2 + (st.perfect || 0) * 15 + (st.maxCombo || 0) * 8 + (st.finKO ? 40 : 0));
  }
  // fecha a luta da semana; devolve { over, final?, pts }
  function weekEnd(r) {
    const run = M.week.run; run.frames += r.frames;
    const win = r.winnerSide === 1; const pts = win ? weekScoreFight(r) : 0;
    run.fights.push({ opp: run.opps[run.i], win, pts, frames: r.frames, hp: win ? r.winner.hp / r.winner.maxHp : 0 });
    if (win) { run.score += pts; run.won++; if (!(r.stats.p2.dmg > 0)) run.flawless++; }
    run.i++;
    const over = !win || run.i >= run.W.opps.length;
    if (!over) return { over: false, pts, win };
    // fim da corrida
    const full = run.won === run.W.opps.length;
    if (full) run.score += 200 + run.flawless * 50;
    const stars = run.won === 0 ? 0 : full ? (run.score >= 1500 ? 3 : 2) : 1;
    const wd = weekData(), key = run.W.key, prevBest = wd.best[key] || 0, prevStars = wd.stars[key] || 0;
    const newBest = run.score > prevBest; if (newBest) wd.best[key] = run.score; if (stars > prevStars) wd.stars[key] = stars;
    wd.runs++; let first = false; if (full && !wd.doneKeys) wd.doneKeys = {}; if (full && !wd.doneKeys[key]) { wd.doneKeys[key] = 1; wd.done++; first = true; }
    let bonusXp = 0; const m = data();
    if (full && first) { bonusXp += 200; m.got.t_semana = Date.now(); if (M.ach) M.ach.unlock('week1'); }
    if (stars === 3 && stars > prevStars) bonusXp += 100;
    if (bonusXp) { const L0 = lvOf(m.xp).lv; m.xp += bonusXp; const L1 = lvOf(m.xp).lv; run.levelUps = [L0, L1]; }
    M.store.save();
    run.result = { score: run.score, stars, full, newBest, first, bonusXp, best: wd.best[key], key };
    return { over: true, final: run.result, pts, win };
  }
  const weekWeeks = () => { const wd = weekData(); return Object.keys(wd.best).sort().slice(-8).map(k => ({ key: k, best: wd.best[k], stars: wd.stars[k] || 0 })); };

  return {
    LV_MAX, MAS, TITLES, FRAMES, PAL_AT, POOL, GOALS, THEMES, need, cumTo, lvOf, masOf, data, level, mastery, unlocked, palUnlocked, allTitles, titleOf, frameOf, equip, cycle, ring,
    missions, trackMissions, goalsOf, award, toast, queueReward, partsFor, today,
    week: { key: weekKey, build: weekBuild, start: weekStart, matchOpts: weekMatchOpts, end: weekEnd, data: weekData, weeks: weekWeeks, daysLeft: daysLeftInWeek, run: null }
  };
})();
M.week = M.meta.week;
