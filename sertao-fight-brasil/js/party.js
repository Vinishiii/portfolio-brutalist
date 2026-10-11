'use strict';
// ============================================================
// QUEM GANHA FICA — o modo de festa: 2 a 8 pessoas no mesmo teclado/controle, uma fila de desafiantes.
// Quem vence continua no trono (e mantém o lutador); quem perde vai para o fim da fila. Mostra a sequência de vitórias de cada um.
// Usa a luta de sempre (versus 2P) com as regras salvas; só organiza a fila e o placar.
// ============================================================
M.king = (function () {
  const U = M.ui, esc = U.esc, T = s => M.tr(s);
  const show = (html, o) => U.show(html, o);
  let draft = null, S = null;

  // ---------- montagem da fila ----------
  function setup(keepIdx = 0) {
    if (!draft) draft = { n: 4, names: ['JOGADOR 1', 'JOGADOR 2', 'JOGADOR 3', 'JOGADOR 4', 'JOGADOR 5', 'JOGADOR 6', 'JOGADOR 7', 'JOGADOR 8'], keep: true };
    const d = draft;
    const collect = () => document.querySelectorAll('.ts-in').forEach(el => { d.names[+el.dataset.i] = el.value; });
    const act = {
      minus: () => { collect(); if (d.n > 2) d.n--; setup(0); }, plus: () => { collect(); if (d.n < 8) d.n++; setup(1); },
      keep: () => { collect(); d.keep = !d.keep; setup(2); },
      go: () => { collect(); start(); }, back: () => U.menu()
    };
    show(`<div class="screen center overlay"><div class="panel tsetup">
      <div class="stamp">${esc(T('QUEM GANHA FICA'))}</div>
      <p class="tiny">${esc(T('Quem vence continua no trono; quem perde volta pro fim da fila. Todo mundo no mesmo teclado ou controle.'))}</p>
      <div class="ts-count"><span>${esc(T('JOGADORES'))}</span><button class="btn small" data-go="minus">−</button><b data-notr>${d.n}</b><button class="btn small" data-go="plus">+</button></div>
      <div class="ts-opts"><button class="mi" data-go="keep">${esc(T('REI MANTÉM O LUTADOR'))} <b>${esc(T(d.keep ? 'LIGADO' : 'DESLIGADO'))}</b></button></div>
      <div class="ts-players">${Array.from({ length: d.n }, (_, i) => `<div class="ts-row king-row"><i data-notr>${i + 1}</i><input class="ts-in" data-i="${i}" maxlength="12" value="${esc(d.names[i])}" autocomplete="off" spellcheck="false" data-notr></div>`).join('')}</div>
      <nav class="rules-nav"><button class="mi" data-go="go">${esc(T('COMEÇAR'))}</button><button class="mi back" data-go="back">${esc(T('VOLTAR'))}</button></nav>
    </div></div>`, { onBack: () => U.menu(), showBack: false, idx: keepIdx, actions: act });
  }
  function start() {
    const d = draft, names = d.names.slice(0, d.n).map((n, i) => (n.trim() || 'JOGADOR ' + (i + 1)).toUpperCase().slice(0, 12));
    S = { players: names.map(n => ({ n, streak: 0, best: 0, wins: 0, losses: 0 })), king: 0, queue: names.map((_, i) => i).slice(1), keep: d.keep, fighter: {}, pal: {}, games: 0, last: null };
    queueScreen();
  }
  const P = i => S.players[i];

  // ---------- tela da fila ----------
  function queueScreen() {
    M.state = 'menu'; M.match = null; M.audio.music.setMode('menu');
    const k = S.king, ch = S.queue[0], kp = P(k);
    show(`<div class="screen center"><div class="panel wide king">
      <div class="stamp">${esc(T('QUEM GANHA FICA'))}</div>
      <div class="king-vs">
        <div class="king-side"><small>${esc(T('NO TRONO'))}${kp.streak ? ' • ' + kp.streak + ' ' + esc(T(kp.streak === 1 ? 'vitória seguida' : 'vitórias seguidas')) : ''}</small><h2 data-notr>👑 ${esc(kp.n)}</h2></div>
        <span class="vs-x">VS</span>
        <div class="king-side"><small>${esc(T('DESAFIANTE'))}</small><h2 data-notr>${esc(P(ch).n)}</h2></div>
      </div>
      <div class="king-queue" data-notr><span>${esc(T('Na fila'))}:</span> ${S.queue.map((q, i) => `<b class="${i === 0 ? 'on' : ''}">${esc(P(q).n)}</b>`).join(' ')}</div>
      <div class="king-board" data-notr>${S.players.map((p, i) => ({ p, i })).sort((a, b) => b.p.wins - a.p.wins || b.p.best - a.p.best).map(({ p, i }) => `<div class="kb-row ${i === k ? 'k' : ''}"><span>${i === k ? '👑 ' : ''}${esc(p.n)}</span><em>V ${p.wins} • D ${p.losses}</em><u>${esc(T('melhor sequência'))} ${p.best}</u></div>`).join('')}</div>
      <nav><button class="mi" data-go="go">${esc(T('ESCOLHER LUTADORES E LUTAR'))}</button><button class="mi" data-go="end">${esc(T('ENCERRAR'))}</button></nav>
    </div></div>`, { onBack: endScreen, showBack: false, actions: { go: () => pick(), end: endScreen } });
  }
  function pick() {
    const k = S.king, ch = S.queue[0], lock = {};
    if (S.keep && S.fighter[k] && P(k).streak > 0) lock.p1 = S.fighter[k];
    U.charselect({
      players: 2, mode: 'tourney', names: [P(k).n, P(ch).n], lock,
      onPick: sel => { S.fighter[k] = sel.p1; S.fighter[ch] = sel.p2; S.pal[k] = sel.pal1 | 0; S.pal[ch] = sel.pal2 | 0; fight(); },
      onCancel: () => queueScreen()
    });
  }
  function fight() {
    const k = S.king, ch = S.queue[0], R = M.rules.forMatch();
    const stage = M.choice(M.stages.order.filter(s => s !== 'cinzas'));
    M.flow.startMatch({ mode: 'versus', p1: { id: S.fighter[k], ctrl: 'human', pal: S.pal[k] | 0 }, p2: { id: S.fighter[ch], ctrl: 'human', pal: S.pal[ch] | 0 }, stage, rounds: R.rounds, timer: R.timer, mutators: R.mutators, tags: [P(k).n, P(ch).n], label: 'REI', onEnd: r => result(r) });
  }
  function result(r) {
    M.state = 'results';
    const k = S.king, ch = S.queue[0], kingWon = r.winnerSide === 1, w = kingWon ? k : ch, l = kingWon ? ch : k;
    P(w).wins++; P(l).losses++; P(w).streak++; P(w).best = Math.max(P(w).best, P(w).streak); P(l).streak = 0; S.games++;
    S.queue.shift();
    if (kingWon) S.queue.push(l); else { S.king = ch; S.queue.push(k); }
    const streak = P(w).streak;
    if (M.ach) { M.ach.unlock('king_first'); if (streak >= 3) M.ach.unlock('king3'); if (streak >= 5) M.ach.unlock('king5'); }
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${esc(T('FICA NO TRONO'))}</div>
      <h2 data-notr>👑 ${esc(P(w).n)}</h2>
      <p class="sub" data-notr>${streak} ${esc(T(streak === 1 ? 'vitória seguida' : 'vitórias seguidas'))} • ${esc(P(l).n)} ${esc(T('vai pro fim da fila'))}</p>
      <div class="stats" data-notr><span>${esc(T('Próximo desafiante'))}: <b>${esc(P(S.queue[0]).n)}</b></span><span>${esc(T('Lutas'))} <b>${S.games}</b></span></div>
      <nav><button class="mi" data-go="next">${esc(T('PRÓXIMA LUTA'))}</button><button class="mi" data-go="rematch">${esc(T('REVANCHE'))}</button><button class="mi" data-go="end">${esc(T('ENCERRAR'))}</button></nav>
    </div></div>`, { actions: { next: queueScreen, rematch: () => { S.queue = [l].concat(S.queue.filter(q => q !== l)); queueScreen(); }, end: endScreen } });
  }
  function endScreen() {
    if (!S) return U.menu();
    const rank = S.players.map((p, i) => ({ p, i })).sort((a, b) => b.p.wins - a.p.wins || b.p.best - a.p.best);
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${esc(T('FIM DA FESTA'))}</div>
      <h2 data-notr>👑 ${esc(rank[0].p.n)}</h2>
      <div class="king-board" data-notr>${rank.map(({ p }, n) => `<div class="kb-row ${n === 0 ? 'k' : ''}"><span>${n + 1}º ${esc(p.n)}</span><em>V ${p.wins} • D ${p.losses}</em><u>${esc(T('melhor sequência'))} ${p.best}</u></div>`).join('')}</div>
      <nav><button class="mi" data-go="again">${esc(T('NOVA FESTA'))}</button><button class="mi" data-go="menu">${esc(T('MENU'))}</button></nav>
    </div></div>`, { actions: { again: () => { S = null; setup(); }, menu: () => { S = null; U.menu(); } } });
  }
  return { setup, get state() { return S; } };
})();
