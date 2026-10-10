'use strict';
// ============================================================
// PLATAFORMA + CONQUISTAS
// M.platform  : ponte opcional com o app de desktop (Electron/Steam).
//               No navegador tudo é "no-op"; no desktop o preload expõe
//               window.steam = { unlock(apiName), setStat(name, v), quit() }.
// M.ach       : conquistas locais (salvas no progresso) + aviso na tela.
// ============================================================
M.platform = {
  get desktop() { return !!window.steam; },
  achievement(id) { try { if (window.steam && window.steam.unlock) window.steam.unlock('ACH_' + id.toUpperCase()); } catch (e) { /* ignora */ } },
  quit() { try { if (window.steam && window.steam.quit) window.steam.quit(); else window.close(); } catch (e) { /* ignora */ } }
};

M.ach = (function () {
  const LIST = [
    { id: 'first_win', icon: '★', name: 'Primeira Peia', desc: 'Vença sua primeira luta contra a CPU.' },
    { id: 'wins_10', icon: '✦', name: 'Pegando o Jeito', desc: 'Vença 10 lutas.' },
    { id: 'wins_100', icon: '♛', name: 'Rei da Rinha', desc: 'Vença 100 lutas.' },
    { id: 'flawless', icon: '◇', name: 'Sem um Arranhão', desc: 'Vença uma luta sem sofrer nenhum dano.' },
    { id: 'comeback', icon: '♥', name: 'Arretado de Verdade', desc: 'Vença com menos de 10% de vida.' },
    { id: 'combo10', icon: '⚡', name: 'Chuva de Golpes', desc: 'Acerte um combo de 10 golpes ou mais.' },
    { id: 'string3', icon: '❚', name: 'String Completa', desc: 'Acerte o terceiro golpe de uma string.' },
    { id: 'follow', icon: '↯', name: 'Sequência de Mestre', desc: 'Acerte o segundo golpe de um especial.' },
    { id: 'perfect5', icon: '◈', name: 'Dançarino', desc: 'Faça 5 esquivas perfeitas numa luta.' },
    { id: 'beat10', icon: '♪', name: 'No Compasso', desc: 'Acerte 10 golpes NO COMPASSO numa luta.' },
    { id: 'finisher', icon: '☄', name: 'Arremate Fatal', desc: 'Nocauteie com o arremate da Peia.' },
    { id: 'supers3', icon: '♨', name: 'Peia em Dobro', desc: 'Use a Peia 3 vezes numa luta.' },
    { id: 'counter3', icon: '⛨', name: 'Contra-Golpista', desc: 'Faça 3 contra-golpes numa luta.' },
    { id: 'corner3', icon: '▦', name: 'Encurralador', desc: 'Encurrale o oponente 3 vezes numa luta.' },
    { id: 'legendary', icon: '☠', name: 'Lendário', desc: 'Vença uma luta contra a CPU no nível Lendário.' },
    { id: 'roster', icon: '☰', name: 'Todos na Rinha', desc: 'Vença com todos os 12 lutadores.' },
    { id: 'story_done', icon: '🔥', name: 'Guardião da Brasa', desc: 'Termine a História.' },
    { id: 'true_ending', icon: '❂', name: 'A Brasa é de Todo Mundo', desc: 'Veja o final verdadeiro.' },
    { id: 'all_endings', icon: '❖', name: 'Três Caminhos', desc: 'Veja os três finais da História.' },
    { id: 'story_s', icon: 'S', name: 'Nota S', desc: 'Termine a História com nota geral S.' },
    { id: 'story_hard', icon: '⛧', name: 'Noite Difícil', desc: 'Termine a História no nível Lendário.' },
    { id: 'story_fast', icon: '⏱', name: 'Corrida de São João', desc: 'Termine a História em menos de 20 minutos.' },
    { id: 'bonds6', icon: '∞', name: 'Todos os Laços', desc: 'Faça laço com os seis adversários.' },
    { id: 'fama7', icon: '✪', name: 'Fama Total', desc: 'Cumpra os sete desafios da História.' },
    { id: 'legends_done', icon: '☾', name: 'A Noite Tem Guardião', desc: 'Termine as Lendas da Noite.' },
    { id: 'free_done', icon: '⚑', name: 'Rinha Inteira', desc: 'Vença a Rinha Livre completa.' }
  ];
  const byId = Object.fromEntries(LIST.map(a => [a.id, a]));
  const store = () => (M.store.data.progress.ach || (M.store.data.progress.ach = {}));
  const has = id => !!store()[id];
  const count = () => Object.keys(store()).filter(k => byId[k]).length;
  let queue = [], showing = false;

  function toast(a) {
    queue.push(a); if (!showing) next();
  }
  function next() {
    const a = queue.shift(); if (!a) { showing = false; return; }
    showing = true;
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `<div class="toast-ico">${a.icon}</div><div><b>${M.tr('CONQUISTA DESBLOQUEADA')}</b><span>${M.tr(a.name)}</span><small>${M.tr(a.desc)}</small></div>`;
    box.appendChild(el);
    if (M.audio && M.audio.play) M.audio.play('patua');
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); next(); }, 500); }, 3800);
  }
  function unlock(id) {
    if (!byId[id] || has(id)) return false;
    store()[id] = Date.now(); M.store.save(); M.platform.achievement(id); toast(byId[id]); return true;
  }

  // ---- eventos ----
  function matchEnd(r, o) {
    if (!r || !o || o.mode === 'training' || o.tutorial) return;
    const humanWon = r.winnerSide === 1 && o.p1 && o.p1.ctrl === 'human';
    if (!humanWon) return;
    const p = M.store.data.progress, st = r.stats.p1, taken = r.stats.p2.dmg;
    const vsCpu = o.p2 && o.p2.ctrl === 'cpu';
    if (vsCpu) {
      p.winsBy = p.winsBy || {}; p.winsBy[o.p1.id] = (p.winsBy[o.p1.id] || 0) + 1; p.totalWins = (p.totalWins || 0) + 1; M.store.save();
      unlock('first_win'); if (p.totalWins >= 10) unlock('wins_10'); if (p.totalWins >= 100) unlock('wins_100');
      if (Object.keys(p.winsBy).length >= M.ROSTER.length) unlock('roster');
      if (o.difficulty === 'lendario') unlock('legendary');
      if (taken === 0) unlock('flawless');
      if (r.winner.hp <= r.winner.maxHp * 0.1) unlock('comeback');
    }
    if ((st.maxCombo || 0) >= 10) unlock('combo10');
    if ((st.landed.L3 || 0) >= 1) unlock('string3');
    if ((st.landed.S2 || 0) + (st.landed.dS2 || 0) >= 1) unlock('follow');
    if (st.perfect >= 5) unlock('perfect5');
    if ((st.beats || 0) >= 10) unlock('beat10');
    if (st.finKO) unlock('finisher');
    if (st.supers >= 3) unlock('supers3');
    if ((st.counters || 0) >= 3) unlock('counter3');
    if ((st.cornered || 0) >= 3) unlock('corner3');
  }
  function storyEnd(S, endingId, grade) {
    unlock('story_done');
    const p = M.store.data.progress;
    if (endingId === 'dividir') unlock('true_ending');
    if (['acender', 'descansar', 'dividir'].every(e => p.endings.includes(e))) unlock('all_endings');
    if (grade === 'S') unlock('story_s');
    if (S.difficulty === 'lendario') unlock('story_hard');
    if (S.frames / 60 < 1200) unlock('story_fast');
    if (S.bonds.length >= 6) unlock('bonds6');
    if (S.fama >= 7) unlock('fama7');
  }
  return { LIST, byId, has, count, unlock, matchEnd, storyEnd, total: LIST.length };
})();
