'use strict';
// ============================================================
// UI 2 — telas dos recursos extras: regras da rinha, Maratona, Desafio do Dia,
// estatísticas, jukebox e menu Extras. Usa as funções de M.ui (show, portrait...).
// ============================================================
M.ui2 = (function () {
  const U = M.ui, esc = U.esc;
  const onoff = v => (v ? 'LIGADO' : 'DESLIGADO');

  // ---------- REGRAS DA RINHA ----------
  function rules(o, idx = 0) {
    const R = M.rules.get();
    const timeLbl = t => (t ? t + ' s' : 'SEM LIMITE');
    const act = {
      rounds: () => { const L = M.rules.ROUNDS; R.rounds = L[(L.indexOf(R.rounds) + 1) % L.length]; save(0); },
      timer: () => { const L = M.rules.TIMERS; R.timer = L[(L.indexOf(R.timer) + 1) % L.length]; save(1); },
      clear: () => { R.rounds = 2; R.timer = 99; R.mut = []; save(0); },
      back: o.onBack
    };
    const save = i => { M.rules.set(R); rules(o, i); };
    M.MUTATORS.forEach((m, k) => { act['m_' + m.id] = () => { const at = R.mut.indexOf(m.id); if (at >= 0) R.mut.splice(at, 1); else R.mut.push(m.id); save(2 + k); }; });
    const help = { rounds: 'Quantas rodadas é preciso vencer para ganhar a luta.', timer: 'Tempo de cada rodada. Acabou o tempo, vence quem tem mais vida.', clear: 'Volta ao normal: 2 rodadas, 99 segundos e nenhum modificador.', back: 'As regras ficam salvas para as próximas lutas.' };
    show(`<div class="screen center overlay"><div class="panel rules">
      <div class="stamp">REGRAS DA RINHA</div>
      <div class="rules-top">
        <button class="mi" data-go="rounds">RODADAS PARA VENCER <b data-notr>${R.rounds}</b></button>
        <button class="mi" data-go="timer">TEMPO DA RODADA <b>${esc(timeLbl(R.timer))}</b></button>
      </div>
      <h4>MODIFICADORES</h4>
      <div class="mut-grid">${M.MUTATORS.map(m => `<button class="mi mut ${R.mut.includes(m.id) ? 'on' : ''}" data-go="m_${m.id}"><i data-notr>${m.icon}</i><span>${esc(m.name)}</span><b>${onoff(R.mut.includes(m.id))}</b></button>`).join('')}</div>
      <p class="mut-desc" id="mutDesc"></p>
      <nav class="rules-nav"><button class="mi" data-go="clear">LIMPAR TUDO</button><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, {
      onBack: o.onBack, showBack: false, idx, actions: act,
      onFocus: el => { const k = el.dataset.go, d = document.getElementById('mutDesc'); if (!d) return; const m = k && k.startsWith('m_') ? M.mutById(k.slice(2)) : null; d.textContent = m ? m.desc : (help[k] || ''); }
    });
  }
  const show = (html, o) => U.show(html, o);

  // ---------- MARATONA ----------
  function survivalIntro(run, onGo) {
    const boss = run.wave % 10 === 0, o = M.survival.matchOpts(run);
    U.versusCard({
      p1: run.p1, p2: run.opp, pal1: run.pal, pal2: o.p2.pal, title: 'ONDA ' + run.wave + (boss ? ' — CHEFE' : ''), stageName: boss ? M.stages.DEFS.cinzas.name : '', difficulty: o.difficulty,
      note: `<b>PONTOS</b> ${run.score} • <b>VIDA</b> ${Math.round(run.hpFrac * 100)}%`
    }, onGo);
  }
  function survivalBreak(run, onNext) {
    const L = run.last, bestW = Math.max(run.startBest.wave, run.wave);
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">ONDA ${run.wave} VENCIDA</div>
      <h2>+${L.pts} PONTOS</h2>
      <p class="sub">Total ${run.score} • Recorde de onda ${bestW}</p>
      <div class="stats"><span>Tempo ${M.fmtTime(L.sec)}</span><span>Vida ${Math.round(L.hpPct * 100)}% ▸ ${Math.round(run.hpFrac * 100)}%</span><span>Garrafadas ${run.patuas.length}</span></div>
      <p class="tiny">Um respiro de 30% de vida entre as ondas. Cada três ondas, uma garrafada.</p>
      <nav><button class="mi" data-go="next">PRÓXIMA ONDA</button><button class="mi" data-go="quit">PARAR POR AQUI</button></nav>
    </div></div>`, { actions: { next: onNext, quit: () => M.survival.quit() } });
  }
  function survivalEnd(o) {
    const run = o.run, S = o.best;
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${o.defeat ? 'CAIU NA MARATONA' : 'FIM DA MARATONA'}</div>
      <h2>${o.reached} ${o.reached === 1 ? 'ONDA' : 'ONDAS'}</h2>
      <p class="sub">${esc(M.FIGHTERS[run.p1].name)} • ${run.score} pontos</p>
      <div class="stats"><span>Tempo ${M.fmtTime(run.frames / 60)}</span><span>Maior combo ${run.maxCombo}</span><span>Esquivas perfeitas ${run.perfect}</span></div>
      ${o.newWave || o.newScore ? `<p class="unlock">${o.newWave ? '✦ NOVO RECORDE DE ONDAS<br>' : ''}${o.newScore ? '✦ NOVO RECORDE DE PONTOS' : ''}</p>` : ''}
      <p class="tiny">Recordes: onda ${S.bestWave} • ${S.bestScore} pontos • Maratonas jogadas <span data-notr>${S.runs}</span></p>
      <nav><button class="mi" data-go="again">DE NOVO</button><button class="mi" data-go="change">TROCAR LUTADOR</button><button class="mi" data-go="menu">MENU</button></nav>
    </div></div>`, { actions: { again: () => M.survival.start(run.p1, run.pal), change: () => { M.match = null; U.charselect({ players: 1, mode: 'survival' }); }, menu: () => U.menu() } });
  }

  // ---------- DESAFIO DO DIA ----------
  const dateLabel = key => { const [y, m, d] = key.split('-').map(Number); try { const t = new Date(y, m - 1, d).toLocaleDateString(M.i18n.lang === 'pt' ? 'pt-BR' : M.i18n.lang === 'es' ? 'es' : 'en', { weekday: 'long', day: 'numeric', month: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1); } catch (e) { return key; } };
  const starsHtml = n => '<span class="stars" data-notr>' + '★'.repeat(n) + '☆'.repeat(2 - n) + '</span>';
  function daily() {
    const ch = M.daily.current(), done = M.daily.done(ch.key), A = M.FIGHTERS[ch.p1], B = M.FIGHTERS[ch.p2], D = M.daily.data();
    show(`<div class="screen center"><div class="panel wide daily">
      <div class="stamp">DESAFIO DO DIA</div>
      <p class="sub" data-notr>${esc(dateLabel(ch.key))}</p>
      <div class="daily-vs">
        <div class="daily-side"><div class="vs-port" id="dA"></div><h3>${esc(A.name)}</h3><span class="tiny">VOCÊ</span></div>
        <span class="vs-x">VS</span>
        <div class="daily-side"><div class="vs-port" id="dB"></div><h3>${esc(B.name)}</h3><span class="tiny">CPU • ${esc(U.diffLabel(ch.difficulty))}</span></div>
      </div>
      <div class="daily-rules">
        ${ch.mut.map(id => { const m = M.mutById(id); return `<div class="daily-mut"><i data-notr>${m.icon}</i><b>${esc(m.name)}</b><span>${esc(m.desc)}</span></div>`; }).join('')}
        <div class="daily-mut goal"><i data-notr>✧</i><b>OBJETIVO BÔNUS</b><span>${esc(ch.goal.text)}</span></div>
      </div>
      <div class="stats"><span>Sequência <b data-notr>${M.daily.streak()}</b></span><span>Melhor sequência <b data-notr>${D.best || 0}</b></span><span>Hoje ${done ? starsHtml(done.stars) : 'ainda não'}</span></div>
      <nav><button class="mi" data-go="go">${done ? 'JOGAR DE NOVO' : 'LUTAR!'}</button><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack: U.menu, showBack: false, actions: { go: () => M.flow.startDaily(), back: U.menu } });
    document.getElementById('dA').appendChild(U.portrait(ch.p1, 130, 165, { facing: 1 }));
    document.getElementById('dB').appendChild(U.portrait(ch.p2, 130, 165, { facing: -1 }));
  }
  function dailyResult(o) {
    const { r, ch, res } = o;
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${res.won ? 'DESAFIO CUMPRIDO' : 'NÃO FOI DESSA VEZ'}</div>
      <h2>${res.won ? esc(r.winner.def.name.toUpperCase()) : esc(r.winner.def.name.toUpperCase()) + ' VENCEU'}</h2>
      ${res.won ? `<p class="sub">${starsHtml(res.bonus ? 2 : 1)}</p>` : ''}
      <div class="stats"><span>${res.bonus ? '✔' : '✘'} ${esc(ch.goal.text)}</span></div>
      ${res.won ? `<p class="unlock">${res.first ? '✦ Sequência: ' : 'Sequência: '}<span data-notr>${res.streak}</span> ${res.streak === 1 ? 'dia' : 'dias'}</p>` : '<p class="tiny">O desafio é o mesmo o dia todo. Treine e volte!</p>'}
      <nav><button class="mi" data-go="again">${res.won ? 'JOGAR DE NOVO' : 'TENTAR DE NOVO'}</button><button class="mi" data-go="menu">MENU</button></nav>
    </div></div>`, { actions: { again: () => M.flow.startDaily(), menu: U.menu } });
  }

  // ---------- ESTATÍSTICAS ----------
  function stats() {
    const S = M.stats.data(), P = M.store.data.progress, sv = P.surv || { bestWave: 0, bestScore: 0, runs: 0 }, D = P.daily || { best: 0 };
    const hrs = S.frames / 60 / 3600, pt = hrs >= 1 ? hrs.toFixed(1).replace(/\.0$/, '') + ' h' : Math.round(S.frames / 3600) + ' min';
    const cell = (label, val) => `<div class="stat-cell"><span>${label}</span><b data-notr>${val}</b></div>`;
    const fav = M.stats.favorite();
    const rows = M.ROSTER.map(id => ({ id, m: (S.fighters[id] || {}).m || 0, w: (S.fighters[id] || {}).w || 0 })).sort((a, b) => b.m - a.m || b.w - a.w);
    const max = Math.max(1, ...rows.map(r => r.m));
    show(`<div class="screen center overlay"><div class="panel stats-panel">
      <div class="stamp">ESTATÍSTICAS</div>
      <div class="stat-grid">
        <div class="stat-col"><h4>GERAL</h4>
          ${cell('Tempo jogado', pt)}${cell('Lutas', S.matches)}${cell('Vitórias', S.wins)}${cell('Derrotas', S.losses)}${cell('Aproveitamento', S.wins + S.losses ? Math.round(S.wins / (S.wins + S.losses) * 100) + '%' : '—')}
          <h4>MODOS</h4>
          ${cell('Melhor história', P.bestTime ? M.fmtTime(P.bestTime) + (P.bestGrade ? ' • ' + P.bestGrade : '') : '—')}${cell('Maratona', sv.bestWave ? sv.bestWave + ' • ' + sv.bestScore : '—')}${cell('Desafio do Dia', D.best ? D.best : '—')}${cell('Conquistas', M.ach.count() + '/' + M.ach.total)}
        </div>
        <div class="stat-col"><h4>COMBATE</h4>
          ${cell('Golpes certeiros', S.hits)}${cell('Dano causado', S.dmg)}${cell('Maior combo', S.maxCombo)}${cell('Esquivas perfeitas', S.perfect)}${cell('Peias', S.supers)}${cell('Arremates', S.finishers)}${cell('Contra-golpes', S.counters)}${cell('Defesas', S.blocks)}
        </div>
        <div class="stat-col wide"><h4>LUTADORES${fav ? ' • FAVORITO: ' : ''}${fav ? `<span class="fav" data-notr>${esc(M.FIGHTERS[fav].short || M.FIGHTERS[fav].name)}</span>` : ''}</h4>
          ${rows.map(r => `<div class="bar-row"><span data-notr>${esc(M.FIGHTERS[r.id].short || M.FIGHTERS[r.id].name)}</span><div class="bar"><i style="width:${Math.round(r.m / max * 100)}%"></i><u style="width:${Math.round(r.w / max * 100)}%"></u></div><em data-notr>${r.w}/${r.m}</em></div>`).join('')}
          <p class="tiny">vitórias / lutas por lutador (só os que você controlou)</p>
        </div>
      </div>
      <nav><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack: extras, showBack: false, actions: { back: extras } });
  }

  // ---------- JUKEBOX ----------
  const ENERGY = [['CALMA', 0.1], ['ANIMADA', 0.5], ['NO ÁPICE', 0.95]];
  function tracks() {
    const T = [['menu', 'Menu principal', 'menu', null], ['ending', 'Final da História', 'ending', null]];
    for (const id of M.stages.order) T.push(['f_' + id, M.stages.DEFS[id].name, 'fight', id]);
    T.push(['boss', 'Chefe: Mestre Cinzas', 'boss', 'cinzas'], ['boss2', 'Chefe: fase final', 'boss2', 'cinzas']);
    return T;
  }
  let juke = { cur: 'menu', en: 1, timer: null };
  function playTrack(t) {
    M.audio.init(); M.audio.music.setMode(t[2], t[3] || undefined);
    juke.cur = t[0];
    if (juke.timer) clearTimeout(juke.timer);
    juke.timer = setTimeout(() => { // conta como "ouvida" depois de alguns segundos
      const h = (M.store.data.progress.juke = M.store.data.progress.juke || {}); h[t[0]] = 1; M.store.save();
      if (tracks().every(x => h[x[0]])) M.ach.unlock('jukebox');
    }, 6000);
  }
  function jukebox(keep = 0) {
    const T = tracks(), heard = (M.store.data.progress.juke || {});
    show(`<div class="screen center overlay"><div class="panel juke">
      <div class="stamp">JUKEBOX</div>
      <div class="juke-now"><div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><small>TOCANDO</small><b id="jNow"></b></div>
        <button class="mi tog" data-go="energy">ENERGIA <b>${ENERGY[juke.en][0]}</b></button></div>
      <div class="juke-list">${T.map(t => `<button class="mi trk ${t[0] === juke.cur ? 'on' : ''}" data-go="${t[0]}"><span>${esc(t[1])}</span><i data-notr>${heard[t[0]] ? '♪' : ''}</i></button>`).join('')}</div>
      <p class="tiny">${T.filter(t => heard[t[0]]).length}/${T.length} faixas ouvidas</p>
      <nav><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, {
      onBack: () => { M.audio.music.setMode('menu'); extras(); }, showBack: false,
      idx: keep,
      actions: Object.assign({ energy: () => { juke.en = (juke.en + 1) % ENERGY.length; jukebox(0); M.audio.music.intensity = ENERGY[juke.en][1]; }, back: () => { M.audio.music.setMode('menu'); extras(); } },
        Object.fromEntries(T.map((t, i) => [t[0], () => { playTrack(t); jukebox(i + 1); }]))),
      onFocus: () => { }
    });
    const cur = T.find(t => t[0] === juke.cur); const n = document.getElementById('jNow'); if (n) n.textContent = cur ? cur[1] : '';
    M.audio.music.intensity = ENERGY[juke.en][1];
  }
  // a música precisa continuar com a intensidade escolhida enquanto a tela está aberta
  setInterval(() => { if (M.state === 'menu' && document.querySelector('.juke')) M.audio.music.intensity = ENERGY[juke.en][1]; }, 400);

  // ---------- EXTRAS ----------
  function extras() {
    M.state = 'menu'; M.audio.music.setMode('menu');
    show(`<div class="screen center"><div class="panel">
      <h2>EXTRAS</h2>
      <nav>
        <button class="mi" data-go="stats">ESTATÍSTICAS <small>seu histórico de rinha</small></button>
        <button class="mi" data-go="juke">JUKEBOX <small>as músicas de cada cenário</small></button>
        <button class="mi back" data-go="back">VOLTAR</button>
      </nav>
    </div></div>`, { onBack: U.menu, showBack: false, actions: { stats, juke: () => jukebox(), back: U.menu } });
  }

  return { rules, survivalIntro, survivalBreak, survivalEnd, daily, dailyResult, stats, jukebox, extras };
})();
