'use strict';
// ============================================================
// UI 4 — Torneio Local: central, montagem, chaves, séries (escolha de lutador, banimento de cenário,
// jogos), simulação das CPUs, campeão e exportação. O motor de chaves está em tourney.js.
// ============================================================
M.ui4 = (function () {
  const U = M.ui, esc = U.esc, show = (h, o) => U.show(h, o), TN = M.tourney;
  const T = () => M.store.data.tourney;
  const nm = i => TN.name(T(), i);
  const fn = id => { const f = M.FIGHTERS[id]; return f ? (f.short || f.name) : id; };
  const CPU = { novato: 'CPU NOVATO', brabo: 'CPU BRABO', lendario: 'CPU LENDÁRIO' };
  const typeLbl = p => (p.cpu ? CPU[p.cpu] : 'HUMANO');
  const unlockedCinzas = () => M.store.data.progress.cinzas;
  const pool = () => M.ROSTER.filter(id => id !== 'cinzas' || unlockedCinzas());
  let draft = null, thumbs = {};

  // ---------- central ----------
  function hub(keep = 0) {
    const t = T(), pr = t ? TN.progress(t) : null;
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">TORNEIO LOCAL</div>
      <h2>${t ? esc(t.name) : 'TORNEIO LOCAL'}</h2>
      <p class="sub" data-notr>${t ? esc(M.tr(TN.fmtLabel(t))) + ' • ' + M.tr('MELHOR DE') + ' ' + t.bo + ' • ' + t.players.length + ' ' + M.tr('JOGADORES') + ' • ' + pr[0] + '/' + pr[1] : ''}</p>
      <p class="tiny">Chaves de eliminação simples ou dupla para 3 a 16 jogadores no mesmo aparelho, com séries melhor de 1, 3 ou 5, banimento de cenário e o vencedor mantendo o lutador. CPUs podem completar a chave.</p>
      <nav>
        ${t && !t.done ? '<button class="mi" data-go="cont">CONTINUAR TORNEIO</button>' : ''}
        ${t && t.done ? '<button class="mi" data-go="result">VER RESULTADO FINAL</button>' : ''}
        <button class="mi" data-go="new">NOVO TORNEIO</button>
        <button class="mi" data-go="rules">REGRAS DO TORNEIO</button>
        <button class="mi back" data-go="back">VOLTAR</button>
      </nav>
    </div></div>`, { onBack: () => M.ui3.hub(1), idx: keep, actions: { cont: () => bracket(), result: () => final(), new: () => { draft = null; setup(); }, rules: () => rulesInfo(), back: () => M.ui3.hub(1) } });
  }
  function rulesInfo() {
    show(`<div class="screen center"><div class="panel wide">
      <div class="stamp">REGRAS DO TORNEIO</div>
      <ul class="rules-list">
        <li><b>Série</b>: melhor de 1, 3 ou 5 jogos. Cada jogo é uma luta de 2 rodadas vencidas, 99 segundos, sem modificadores.</li>
        <li><b>Cenários</b>: seis cenários de leitura limpa. No jogo 1, os dois jogadores banem um cenário por vez (o de melhor semente começa) até sobrar um. Nos jogos seguintes, quem perdeu escolhe o cenário.</li>
        <li><b>Lutadores</b>: no jogo 1, cada um escolhe o seu. Depois, quem venceu mantém o lutador e quem perdeu pode trocar (opção ligada por padrão).</li>
        <li><b>Chaves</b>: eliminação simples, ou dupla com chave dos perdedores e grande final com reset. As CPUs da chave jogam entre si sozinhas.</li>
        <li><b>Vagas sobrando</b>: se faltar gente para fechar a chave, as melhores sementes avançam direto (bye).</li>
        <li><b>Replays</b>: cada jogo é gravado, e fica na lista de Replays para revisar ou compartilhar.</li>
        <li><b>Controles</b>: o jogador da esquerda usa WASD + J K L; o da direita, setas + Num1 Num2 Num3 (ou controles). Quando um humano enfrenta uma CPU, ele joga com o teclado da esquerda.</li>
      </ul>
      <nav><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack: () => hub(2), actions: { back: () => hub(2) } });
  }

  // ---------- montagem ----------
  function setup(keepIdx = 0) {
    if (!draft) draft = { name: 'TORNEIO DA RINHA', fmt: 'de', bo: 3, keep: true, shuffle: true, players: Array.from({ length: 4 }, (_, i) => ({ n: 'JOGADOR ' + (i + 1), cpu: null })) };
    const d = draft;
    const collect = () => { const n = document.getElementById('tName'); if (n) d.name = n.value; document.querySelectorAll('.ts-in').forEach(el => { const p = d.players[+el.dataset.i]; if (p) p.n = el.value; }); };
    const re = i => { collect(); setup(i); };
    const act = {
      fmt: () => { collect(); d.fmt = d.fmt === 'de' ? 'se' : 'de'; setup(0); },
      bo: () => { collect(); d.bo = d.bo === 1 ? 3 : d.bo === 3 ? 5 : 1; setup(1); },
      keep: () => { collect(); d.keep = !d.keep; setup(2); },
      seed: () => { collect(); d.shuffle = !d.shuffle; setup(3); },
      minus: () => { collect(); if (d.players.length > 3) d.players.pop(); setup(4); },
      plus: () => { collect(); if (d.players.length < 16) d.players.push({ n: 'JOGADOR ' + (d.players.length + 1), cpu: null }); setup(5); },
      go: () => { collect(); start(); }, back: () => hub(1)
    };
    d.players.forEach((p, i) => { act['p' + i] = () => { collect(); const L = [null, 'novato', 'brabo', 'lendario']; p.cpu = L[(L.indexOf(p.cpu) + 1) % 4]; if (p.cpu && /^JOGADOR \d+$/.test(p.n)) p.n = 'CPU ' + (i + 1); else if (!p.cpu && /^CPU \d+$/.test(p.n)) p.n = 'JOGADOR ' + (i + 1); setup(6 + i); }; });
    show(`<div class="screen center overlay"><div class="panel tsetup">
      <div class="stamp">NOVO TORNEIO</div>
      <label class="tname"><span>NOME</span><input id="tName" maxlength="28" value="${esc(d.name)}" autocomplete="off" spellcheck="false" data-notr></label>
      <div class="ts-opts">
        <button class="mi" data-go="fmt">FORMATO <b>${d.fmt === 'de' ? 'ELIMINAÇÃO DUPLA' : 'ELIMINAÇÃO SIMPLES'}</b></button>
        <button class="mi" data-go="bo">SÉRIE <b>MELHOR DE <span data-notr>${d.bo}</span></b></button>
        <button class="mi" data-go="keep">VENCEDOR MANTÉM O LUTADOR <b>${d.keep ? 'LIGADO' : 'DESLIGADO'}</b></button>
        <button class="mi" data-go="seed">CHAVES <b>${d.shuffle ? 'SORTEADAS' : 'NA ORDEM DA LISTA'}</b></button>
      </div>
      <div class="ts-count"><span>JOGADORES</span><button class="btn small" data-go="minus">−</button><b data-notr>${d.players.length}</b><button class="btn small" data-go="plus">+</button></div>
      <div class="ts-players">${d.players.map((p, i) => `<div class="ts-row"><i data-notr>${i + 1}</i><input class="ts-in" data-i="${i}" maxlength="12" value="${esc(p.n)}" autocomplete="off" spellcheck="false" data-notr><button class="mi ${p.cpu ? 'cpu' : ''}" data-go="p${i}">${typeLbl(p)}</button></div>`).join('')}</div>
      <nav class="rules-nav"><button class="mi" data-go="go">INICIAR TORNEIO</button><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack: () => hub(1), showBack: false, idx: keepIdx, actions: act });
  }
  function start() {
    const d = draft; const names = d.players.map(p => p.n.trim().toUpperCase());
    const fixed = d.players.map((p, i) => ({ n: names[i] || 'J' + (i + 1), cpu: p.cpu }));
    // nomes repetidos ganham um número
    const seen = {}; fixed.forEach(p => { seen[p.n] = (seen[p.n] || 0) + 1; if (seen[p.n] > 1) p.n = p.n.slice(0, 10) + ' ' + seen[p.n]; });
    TN.create({ name: d.name, fmt: d.fmt, bo: d.bo, keep: d.keep, shuffle: d.shuffle, players: fixed });
    draft = null; bracket();
  }

  // ---------- chaves ----------
  function bracket(msg) {
    const t = T(); if (!t) return hub();
    M.state = 'menu';
    if (t.done) { final(); return; }
    const nx = TN.next(t), pr = TN.progress(t), k = TN.log2(t.size);
    const box = m => {
      const cls = m.st === 'bye' ? 'bye' : m.st === 'done' ? 'done' : m.st === 'ready' ? 'ready' : 'wait';
      const isNext = nx && nx.id === m.id;
      const row = (idx, w, sc) => `<div class="bp ${w ? 'w' : ''}"><span data-notr>${esc(nm(idx))}</span><b data-notr>${m.st === 'done' ? sc : ''}</b></div>`;
      return `<div class="bm ${cls} ${isNext ? 'next' : ''}">${row(m.pa, m.st === 'done' && m.w === m.pa, m.sc[0])}${row(m.pb, m.st === 'done' && m.w === m.pb, m.sc[1])}</div>`;
    };
    const rounds = (br, count) => { let h = ''; for (let r = 1; r <= count; r++) { const ms = t.matches.filter(m => m.br === br && m.r === r); if (ms.length) h += `<div class="bcol"><h5 data-notr>${esc(M.tr(TN.roundLabel(t, ms[0])))}</h5><div class="bcells">${ms.map(box).join('')}</div></div>`; } return h; };
    const sec = (title, inner) => `<div class="bsec"><h4>${title}</h4><div class="bcols">${inner}</div></div>`;
    const G = t.matches.filter(m => m.br === 'G' && (m.st !== 'wait'));
    const lines = sec(t.fmt === 'de' ? 'CHAVE DOS VENCEDORES' : 'CHAVE', rounds('W', k))
      + (t.fmt === 'de' ? sec('CHAVE DOS PERDEDORES', rounds('L', 2 * (k - 1))) + (G.length ? sec('GRANDE FINAL', `<div class="bcol"><div class="bcells">${G.map(box).join('')}</div></div>`) : '') : '');
    const set = t.set;
    show(`<div class="screen center overlay"><div class="panel brk">
      <div class="brk-head"><div class="stamp" data-notr>${esc(t.name)}</div><span class="tiny" data-notr>${esc(M.tr(TN.fmtLabel(t)))} • ${M.tr('MELHOR DE')} ${t.bo} • ${pr[0]}/${pr[1]}</span></div>
      <div class="brk-scroll" id="brkScroll">${lines}</div>
      ${msg ? `<p class="unlock">${msg}</p>` : ''}
      <p class="brk-next" data-notr>${nx ? (set ? M.tr('EM ANDAMENTO') + ': ' : M.tr('PRÓXIMA') + ': ') + esc(nm(nx.pa)) + ' × ' + esc(nm(nx.pb)) + ' — ' + esc(M.tr(TN.roundLabel(t, nx))) : ''}</p>
      <nav class="brk-nav">
        <button class="mi" data-go="play">${set ? 'CONTINUAR SÉRIE' : 'JOGAR PRÓXIMA PARTIDA'}</button>
        <button class="mi" data-go="copy">COPIAR RESULTADOS</button>
        <button class="mi back" data-go="back">SAIR (FICA SALVO)</button>
      </nav>
    </div></div>`, { onBack: () => hub(0), showBack: false, actions: { play: () => playNext(), copy: () => copyText(), back: () => hub(0) } });
    const sc = document.getElementById('brkScroll'); const nxEl = sc && sc.querySelector('.bm.next'); if (nxEl) nxEl.scrollIntoView({ block: 'center', inline: 'center' });
  }
  async function copyText(btnSel) {
    const text = TN.exportText(T());
    try { await navigator.clipboard.writeText(text); } catch (e) { /* sem permissão: baixa o arquivo */ download('torneio.txt', text); }
    const b = document.querySelector(btnSel || '[data-go="copy"]'); if (b) b.firstChild.nodeValue = M.tr('COPIADO!') + ' ';
  }
  function download(nameF, text) {
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = nameF; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 600); } catch (e) { /* ignora */ }
  }

  // ---------- séries ----------
  function playNext() {
    const t = T(), m = TN.next(t); if (!m) return bracket();
    const A = t.players[m.pa], B = t.players[m.pb];
    if (t.set && t.set.m === m.id) return nextGame();
    t.set = null;
    if (A.cpu && B.cpu) return simulateSet(m);
    startSet(m);
  }
  function startSet(m) {
    const t = T(), pa = t.players[m.pa], pb = t.players[m.pb];
    const swap = !!(pa.cpu && !pb.cpu); // humano sempre no teclado da esquerda quando enfrenta CPU
    t.set = { m: m.id, a: m.pa, b: m.pb, L: swap ? m.pb : m.pa, R: swap ? m.pa : m.pb, wa: 0, wb: 0, g: 0, games: [], fighter: {}, lastWinner: null, lastLoser: null, stage: null };
    M.store.save();
    // apresentação
    const S = t.set;
    show(`<div class="screen center"><div class="panel brk-intro">
      <div class="stamp" data-notr>${esc(M.tr(TN.roundLabel(t, m)))}</div>
      <div class="intro-vs"><h2 data-notr>${esc(nm(S.L))}</h2><span class="vs-x">VS</span><h2 data-notr>${esc(nm(S.R))}</h2></div>
      <p class="sub" data-notr>${esc(M.tr('MELHOR DE'))} ${t.bo} • ${esc(M.tr('primeiro a vencer'))} ${TN.need(t)} ${esc(M.tr('jogos'))}</p>
      <p class="tiny" data-notr>${t.players[S.R].cpu ? M.tr('A CPU escolhe sozinha.') : M.tr('Esquerda: WASD + J K L • Direita: setas + Num1 Num2 Num3.')}</p>
      <nav><button class="mi" data-go="go">COMEÇAR</button><button class="mi back" data-go="back">VOLTAR ÀS CHAVES</button></nav>
    </div></div>`, { onBack: () => { t.set = null; bracket(); }, showBack: false, actions: { go: () => nextGame(), back: () => { t.set = null; bracket(); } } });
  }
  const need = () => TN.need(T());

  function nextGame() {
    const t = T(), S = t.set, pl = i => t.players[i];
    // lutadores
    const lock = {}; const botFor = (idx, prev) => { const keepIt = t.keep && prev && S.lastWinner === idx && S.fighter[idx]; return keepIt ? S.fighter[idx] : M.choice(pool()); };
    const humanR = !pl(S.R).cpu;
    if (t.keep && S.g > 0) { if (S.lastWinner === S.L) lock.p1 = S.fighter[S.L]; else if (S.lastWinner === S.R && humanR) lock.p2 = S.fighter[S.R]; }
    let botFighter = null; if (!humanR) botFighter = botFor(S.R, S.g > 0);
    const onPick = sel => {
      S.fighter[S.L] = sel.p1; S.fighter[S.R] = humanR ? sel.p2 : botFighter; S.pal = [sel.pal1 | 0, humanR ? sel.pal2 | 0 : 0]; M.store.save();
      pickStage(S);
    };
    U.charselect({ players: humanR ? 2 : 1, mode: 'tourney', names: [nm(S.L), nm(S.R)], lock, onPick, onCancel: () => { bracket(); } });
  }

  // ---------- cenário (banimento / escolha) ----------
  function thumb(id) {
    if (thumbs[id]) return thumbs[id];
    const c = document.createElement('canvas'); c.width = 176; c.height = 99; const g = c.getContext('2d');
    try { const st = new M.stages.Stage(id); M.paint.ensureStage(st); const bg = st.bgPaint || st.bg; g.drawImage(bg, 0, 0, 176, 99); } catch (e) { g.fillStyle = '#2a1f17'; g.fillRect(0, 0, 176, 99); }
    return (thumbs[id] = c.toDataURL('image/jpeg', 0.8));
  }
  function pickStage(S) {
    const t = T(), L = M.comp.STAGES.slice();
    const bySeed = (a, b) => t.seeds.indexOf(a) - t.seeds.indexOf(b);
    if (S.g === 0) {
      const first = [S.L, S.R].sort(bySeed)[0], second = first === S.L ? S.R : S.L; const order = [first, second, first, second, first];
      stageStep({ mode: 'strike', remaining: L, banned: [], order, step: 0, S });
    } else stageStep({ mode: 'pick', remaining: L, banned: [], order: [S.lastLoser], step: 0, S });
  }
  function stageStep(st) {
    const t = T(), actor = st.order[st.step], P = t.players[actor], bot = !!P.cpu;
    const done = id => { st.S.stage = id; M.store.save(); playGame(st.S); };
    const choose = id => {
      if (st.mode === 'pick') return done(id);
      st.banned.push(id); st.remaining = st.remaining.filter(x => x !== id); st.step++;
      if (st.remaining.length === 1) return done(st.remaining[0]);
      stageStep(st);
    };
    const all = M.comp.STAGES;
    show(`<div class="screen center"><div class="panel stage-strike">
      <div class="stamp">${st.mode === 'strike' ? 'BANIMENTO DE CENÁRIO' : 'ESCOLHA DO CENÁRIO'}</div>
      <h2 data-notr>${esc(P.n)}</h2>
      <p class="sub" data-notr>${st.mode === 'strike' ? esc(M.tr('bane um cenário')) + ' (' + st.remaining.length + ' ' + esc(M.tr('restantes')) + ')' : esc(M.tr('escolhe o cenário do próximo jogo'))}</p>
      <div class="st-grid">${all.map(id => `<button class="mi stc ${st.banned.includes(id) ? 'banned' : ''}" data-go="${id}" ${st.banned.includes(id) ? 'disabled' : ''}><img src="${thumb(id)}" alt=""><span>${esc(M.stages.DEFS[id].name)}</span>${st.banned.includes(id) ? '<u>✖</u>' : ''}</button>`).join('')}</div>
    </div></div>`, { onBack: () => bracket(), showBack: false, actions: Object.fromEntries(all.map(id => [id, () => { if (st.banned.includes(id) || bot) return; choose(id); }])) });
    if (bot) setTimeout(() => { if (document.querySelector('.stage-strike')) choose(M.choice(st.remaining)); }, 1100);
  }

  // ---------- jogo ----------
  function playGame(S) {
    const t = T(), m = TN.byId(t, S.m), Lp = t.players[S.L], Rp = t.players[S.R];
    const lbl = M.tr(TN.roundLabel(t, m)) + ' • ' + M.tr('JOGO') + ' ' + (S.g + 1) + ' • ' + M.tr('SÉRIE') + ' ' + (S.L === S.a ? S.wa : S.wb) + '–' + (S.L === S.a ? S.wb : S.wa);
    M.flow.startMatch({
      mode: 'tourney', label: lbl, tags: [Lp.n, Rp.n], keepReplay: t.keep,
      p1: { id: S.fighter[S.L], ctrl: 'human', pal: S.pal[0] }, p2: { id: S.fighter[S.R], ctrl: Rp.cpu ? 'cpu' : 'human', pal: S.pal[1] },
      stage: S.stage, rounds: 2, timer: 99, difficulty: Rp.cpu || 'brabo', onEnd: r => gameEnd(r)
    });
  }
  M.tourney.abortGame = () => { M.match = null; M.state = 'menu'; bracket('Jogo interrompido: ele será refeito quando você continuar a série.'); };
  function gameEnd(r) {
    const t = T(), S = t.set, m = TN.byId(t, S.m);
    const win = r.winnerSide === 1 ? S.L : S.R, lose = win === S.L ? S.R : S.L;
    S.g++; S.lastWinner = win; S.lastLoser = lose; if (win === S.a) S.wa++; else S.wb++;
    S.games.push({ fa: S.fighter[S.a], fb: S.fighter[S.b], st: S.stage, w: win, rid: r.replayId || null, sc: r.wins.slice() });
    M.state = 'results'; M.store.save();
    if (S.wa >= need() || S.wb >= need()) return finishSet(S, m, r);
    const h = r.replayId;
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">JOGO ${S.g}</div>
      <h2 data-notr>${esc(nm(win))}</h2>
      <p class="sub" data-notr>${esc(M.tr('vence o jogo'))} • ${esc(M.tr('SÉRIE'))}: <span data-notr>${esc(nm(S.a))} ${S.wa}–${S.wb} ${esc(nm(S.b))}</span></p>
      <p class="tiny" data-notr>${esc(M.tr('Placar de rodadas'))} <span data-notr>${r.wins[0]}–${r.wins[1]}</span> • ${esc(M.tr('Tempo'))} ${M.fmtTime(r.frames / 60)}</p>
      <nav>
        <button class="mi" data-go="next">PRÓXIMO JOGO</button>
        ${h ? '<button class="mi" data-go="rep">VER REPLAY</button>' : ''}
        <button class="mi" data-go="brk">VER CHAVES</button>
      </nav>
    </div></div>`, { actions: { next: () => nextGame(), rep: () => { const x = M.replay.get(h); if (x) { M.ach.unlock('replay_watch'); M.replay.start(x.rep, () => { M.match = null; M.state = 'results'; gameEnd2(S, win, r); }); } }, brk: () => bracket() } });
  }
  function gameEnd2(S, win, r) { // volta do replay para a tela do jogo (sem contar de novo)
    const h = r.replayId;
    show(`<div class="screen center"><div class="panel"><div class="stamp">JOGO ${S.g}</div><h2 data-notr>${esc(nm(win))}</h2>
      <nav><button class="mi" data-go="next">PRÓXIMO JOGO</button>${h ? '<button class="mi" data-go="rep">VER REPLAY</button>' : ''}<button class="mi" data-go="brk">VER CHAVES</button></nav></div></div>`,
      { actions: { next: () => nextGame(), rep: () => { const x = M.replay.get(h); if (x) M.replay.start(x.rep, () => { M.match = null; M.state = 'results'; gameEnd2(S, win, r); }); }, brk: () => bracket() } });
  }
  function finishSet(S, m, r) {
    const t = T(), winner = S.wa > S.wb ? S.a : S.b;
    TN.report(t, m, winner, [S.wa, S.wb], S.games); t.set = null; M.store.save();
    if (t.done) { M.ach.unlock('tourney_done'); if (!t.players[t.champion].cpu) M.ach.unlock('tourney_champ'); }
    show(`<div class="screen center"><div class="panel">
      <div class="stamp" data-notr>${esc(M.tr(TN.roundLabel(t, m)))}</div>
      <h2 data-notr>${esc(nm(winner))}</h2>
      <p class="sub" data-notr>${esc(M.tr('vence a série'))} <span data-notr>${S.wa}–${S.wb}</span></p>
      <p class="tiny" data-notr>${esc(nm(S.a))} × ${esc(nm(S.b))}</p>
      <nav><button class="mi" data-go="go">${t.done ? 'VER O CAMPEÃO' : 'VER AS CHAVES'}</button></nav>
    </div></div>`, { actions: { go: () => (t.done ? final() : bracket()) } });
  }

  // ---------- CPU contra CPU: simula as lutas de verdade, em fatias, sem travar a tela ----------
  function simulateSet(m) {
    const t = T(), A = t.players[m.pa], B = t.players[m.pb], games = []; let wa = 0, wb = 0, cancelled = false;
    const profile = lv => ({ extra: Object.assign({}, M.AI.PROFILES[lv]), mods: lv === 'novato' ? { dmg: 0.75, hp: 0.9 } : lv === 'lendario' ? { dmg: 1.1, hp: 1.05 } : {} });
    const pa = profile(A.cpu), pb = profile(B.cpu);
    const label = () => `<div class="screen center"><div class="panel"><div class="stamp">SIMULANDO</div><h2 data-notr>${esc(A.n)} × ${esc(B.n)}</h2><p class="sub" data-notr>${wa}–${wb}</p><div class="spinner"></div><p class="tiny">As CPUs estão brigando de verdade, só que mais rápido.</p></div></div>`;
    show(label(), {});
    const oneGame = () => {
      if (cancelled) return;
      const fa = M.choice(pool()), fb = M.choice(pool()), stage = M.choice(M.comp.STAGES); let res = null;
      const mt = new M.Match({ mode: 'tourney', record: false, p1: { id: fa, ctrl: 'cpu', mods: pa.mods, aiExtra: pa.extra }, p2: { id: fb, ctrl: 'cpu', mods: pb.mods, aiExtra: pb.extra, pal: fa === fb ? 1 : 0 }, stage, rounds: 2, timer: 99, difficulty: 'brabo', onEnd: r => { res = r; } });
      let guard = 0;
      const slice = () => {
        if (cancelled) return;
        for (let i = 0; i < 1500 && !res && guard < 40000; i++) { mt.update(); guard++; }
        if (!res && guard < 40000) { setTimeout(slice, 0); return; }
        const w1 = res ? res.winnerSide === 1 : (mt.p1.hp / mt.p1.maxHp >= mt.p2.hp / mt.p2.maxHp);
        if (w1) wa++; else wb++; games.push({ fa, fb, st: stage, w: w1 ? m.pa : m.pb });
        const lab = document.querySelector('.panel .sub'); if (lab) lab.textContent = wa + '–' + wb;
        if (wa >= need() || wb >= need()) { TN.report(t, m, wa > wb ? m.pa : m.pb, [wa, wb], games); M.store.save(); if (t.done) { M.ach.unlock('tourney_done'); } setTimeout(() => (t.done ? final() : bracket()), 500); }
        else setTimeout(oneGame, 30);
      };
      setTimeout(slice, 30);
    };
    oneGame();
  }

  // ---------- campeão ----------
  function final() {
    const t = T(); if (!t) return hub();
    M.state = 'menu'; M.audio.music.setMode('ending');
    const st = TN.standings(t), medal = ['🥇', '🥈', '🥉'];
    show(`<div class="screen center"><div class="panel champ">
      <div class="confetti" aria-hidden="true">${Array.from({ length: 26 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i % 9) * 0.35}s;background:${['#f2b70c', '#c8371d', '#1f7a4d', '#c7267a', '#2aa9b8'][i % 5]}"></i>`).join('')}</div>
      <div class="stamp">${esc(t.name)}</div>
      <p class="sub">CAMPEÃO</p>
      <h2 class="champ-name" data-notr>${esc(nm(t.champion))}</h2>
      <div class="podium">${st.slice(0, 8).map(s => `<div class="pod p${Math.min(s.place, 4)}"><b data-notr>${s.place}º</b><span data-notr>${esc(nm(s.i))}</span></div>`).join('')}</div>
      <nav class="rep-nav"><button class="mi" data-go="copy">COPIAR RESULTADOS</button><button class="mi" data-go="dl">BAIXAR .TXT</button><button class="mi" data-go="brk">VER CHAVES</button><button class="mi back" data-go="menu">MENU</button></nav>
    </div></div>`, { actions: { copy: () => copyText('[data-go="copy"]'), dl: () => download('torneio-' + t.id + '.txt', TN.exportText(t)), brk: () => bracketView(), menu: () => { M.audio.music.setMode('menu'); hub(0); } } });
    M.audio.play('super');
  }
  function bracketView() { const t = T(); const d = t.done; t.done = false; try { bracket(); } finally { t.done = d; } const b = document.querySelector('[data-go="play"]'); if (b) b.remove(); }

  return { hub, setup, bracket, final };
})();
