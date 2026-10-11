'use strict';
// ============================================================
// UI 5 — telas do que dá motivo para voltar e para compartilhar:
//   painel de XP e botões de compartilhar no resultado, Progresso (nível, missões, título e moldura), Maestria por lutador,
//   desafio por link (receber e superar), e a Rinha da Semana.
// ============================================================
M.ui5 = (function () {
  const U = M.ui, esc = U.esc, T = s => M.tr(s);
  const show = (html, o) => U.show(html, o);
  const fn = id => (M.FIGHTERS[id].short || M.FIGHTERS[id].name);

  // aviso curto no canto (usa a mesma pilha das conquistas)
  function say(text, icon) {
    let box = document.getElementById('toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div'); el.className = 'toast say'; el.setAttribute('data-notr', '');
    el.innerHTML = `<div class="toast-ico">${icon || '✔'}</div><div><span>${esc(T(text))}</span></div>`;
    box.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 500); }, 2600);
  }
  const bar = (pct, cls) => `<div class="xp-bar ${cls || ''}"><i style="width:${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%"></i></div>`;
  const lvName = n => T('NÍVEL') + ' ' + n;

  // ---------------------------------------------------------------- painel de XP (resultado)
  function xpPanel(rep) {
    const mast = rep.mastery, f = M.FIGHTERS[rep.fid];
    const parts = rep.parts.map(p => `<span>${esc(T(p[0]))} <b>+${p[1]}</b></span>`).concat(rep.bonus.map(p => `<span class="b">${esc(T(p[0]))} <b>+${p[1]}</b></span>`));
    if (rep.mult !== 1) parts.push(`<span class="m">${esc(T('Multiplicador'))} <b>×${rep.mult}</b></span>`);
    const ev = [];
    for (const m of rep.missions) ev.push(`<li class="ok">✔ ${esc(T('Missão'))}: ${esc(T(m.text))} <b>+${m.xp}</b></li>`);
    for (const g of rep.goals) ev.push(`<li class="ok">✔ ${esc(T('Meta de'))} ${esc(fn(g.id))}: ${esc(T(g.text))} <b>+${g.xp}</b></li>`);
    for (const u of rep.ups) ev.push(u.type === 'level' ? `<li class="up">▲ ${esc(lvName(u.lv))}!</li>` : `<li class="up">▲ ${esc(T('Maestria'))} ${esc(fn(u.id))} ${u.lv}!</li>`);
    for (const rw of rep.rewards) ev.push(`<li class="rw">★ ${esc(T('Recompensa'))}: ${esc(T(rw.text))} <small>${esc(T(rw.type))}</small></li>`);
    return `<div class="xp" data-notr>
      <div class="xp-top"><b class="xp-num" id="xpNum">+0 XP</b><span>${esc(lvName(rep.lv1))}</span></div>
      ${bar(rep.pct0, 'big').replace('<i ', '<i id="xpFill" ')}
      <div class="xp-parts">${parts.join('')}</div>
      <div class="xp-m"><span>${esc(T('Maestria'))} ${esc(fn(rep.fid))} <b>${mast.lv1}</b></span>${bar(mast.pct0).replace('<i ', '<i id="xpMas" ')}</div>
      ${ev.length ? `<ul class="xp-ev">${ev.join('')}</ul>` : ''}
    </div>`;
  }
  function animateXp(rep) {
    const num = document.getElementById('xpNum'), fill = document.getElementById('xpFill'), mas = document.getElementById('xpMas'); if (!num || !fill) return;
    const t0 = performance.now(), DUR = 800;
    const tick = now => { const k = Math.min(1, (now - t0) / DUR); if (!document.getElementById('xpNum')) return; num.textContent = '+' + Math.round(rep.total * (1 - Math.pow(1 - k, 3))) + ' XP'; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const set = (el, p) => { if (el) el.style.width = Math.round(Math.max(0, Math.min(1, p)) * 100) + '%'; };
    setTimeout(() => {
      if (rep.lv1 > rep.lv0) { set(fill, 1); setTimeout(() => { fill.style.transition = 'none'; set(fill, 0); void fill.offsetWidth; fill.style.transition = ''; set(fill, rep.pct1); if (M.audio) M.audio.play('patua'); }, 900); }
      else set(fill, rep.pct1);
      const m = rep.mastery; if (m.lv1 > m.lv0) { set(mas, 1); setTimeout(() => { if (!mas) return; mas.style.transition = 'none'; set(mas, 0); void mas.offsetWidth; mas.style.transition = ''; set(mas, m.pct1); }, 900); } else set(mas, m.pct1);
    }, 250);
    if (rep.ups.length && M.audio) M.audio.play('perfect');
    for (const rw of rep.rewards) M.meta.queueReward(rw);
  }

  // blocos que entram na tela de resultado: painel de XP e botões de compartilhar. Devolve { html, actions, after }.
  function resultExtras(o) {
    const r = o.result, opts = r.opts, rep = r.meta, acts = {}; let html = '';
    if (rep) { rep.shown = true; html += xpPanel(rep); }
    const btns = [];
    const hasClip = M.clip && M.clip.supported() && (M.clip.get() || M.clip.pending() || M.clip.active);
    if (hasClip) btns.push(['clip', '🎬 ' + T('CLIPE'), 'clipBtn']);
    if (opts) btns.push(['card', '🖼 ' + T('CARTÃO'), 'cardBtn']);
    const ch = opts && !o.noChallenge ? M.challenge.fromMatch(r, opts) : null;
    if (ch) btns.push(['chal', '⚔ ' + T('DESAFIAR UM AMIGO'), 'chalBtn']);
    if (btns.length) html += `<div class="share-row" data-notr>${btns.map(b => `<button class="mi small" id="${b[2]}" data-go="${b[0]}">${esc(b[1])}</button>`).join('')}</div>`;
    acts.clip = async () => { const c = M.clip.get(); if (!c) { say('O clipe ainda está fechando. Tente de novo em instantes.', '🎬'); return; } const ok = await M.clip.share(c); if (ok) { say('Clipe pronto!', '🎬'); if (M.ach) M.ach.unlock('clip1'); } };
    acts.card = async () => { try { const card = M.card.make(M.card.fromResult(r, opts)); const how = await M.card.share(card, T('Olha meu resultado no Sertão Fight Brasil!')); say(how === 'saved' ? 'Cartão salvo!' : 'Cartão pronto!', '🖼'); if (M.ach) M.ach.unlock('card1'); } catch (e) { say('Não consegui gerar o cartão.', '✖'); } };
    acts.chal = async () => { await shareChallenge(ch, r.replay); };
    const after = () => {
      if (rep) animateXp(rep);
      if (hasClip && !M.clip.get()) { const iv = setInterval(() => { const b = document.getElementById('clipBtn'); if (!b) { clearInterval(iv); return; } if (M.clip.get()) { b.classList.add('glow'); clearInterval(iv); } }, 400); }
    };
    return { html, actions: acts, after: rep ? after : (hasClip ? after : null) };
  }
  async function shareChallenge(c, replay) {
    if (!c) return;
    let code = null; try { if (replay) code = await M.replay.encode(replay); } catch (e) { code = null; }
    const url = M.challenge.link(c, code);
    const text = T('Duvido você superar meu placar no Sertão Fight Brasil!') + ' ' + (c.tag ? c.tag + ' • ' : '') + c.sc + ' ' + T('pontos');
    const ok = await M.challenge.share(text, url);
    say(ok ? (navigator.share ? 'Desafio enviado!' : 'Link copiado! Cole no zap.') : 'Não deu pra copiar o link.', '⚔'); if (ok && M.ach) M.ach.unlock('challenge1');
  }

  // ---------------------------------------------------------------- Progresso
  function progress(onBack) {
    const D = M.meta.data(), L = M.meta.level(), tt = M.meta.titleOf(), fr = M.meta.frameOf(), mis = M.meta.missions();
    const back = onBack || U.menu;
    const wk = M.week.build(), wd = M.week.data(), wbest = wd.best[wk.key] || 0, wst = wd.stars[wk.key] || 0;
    const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
    const next = (() => { const R = []; for (const t of M.meta.TITLES) if (t.lv && t.lv > L.lv) R.push([t.lv, 'título', t.name]); for (const f of M.meta.FRAMES) if (f.lv > L.lv) R.push([f.lv, 'moldura', f.name]); R.sort((a, b) => a[0] - b[0]); return R[0]; })();
    show(`<div class="screen center overlay"><div class="panel wide prog">
      <div class="stamp">PROGRESSO</div>
      <div class="prog-top">
        <div class="prog-lv"><small>${esc(T('NÍVEL'))}</small><b data-notr>${L.lv}</b></div>
        <div class="prog-xp">
          ${bar(L.pct, 'big')}
          <p class="tiny" data-notr>${L.lv >= M.meta.LV_MAX ? esc(T('Nível máximo!')) : L.into + ' / ' + L.need + ' XP ' + esc(T('para o nível')) + ' ' + (L.lv + 1)}${next ? ' • ' + esc(T('Próxima recompensa')) + ': ' + esc(T(next[2])) + ' (' + esc(T('nível')) + ' ' + next[0] + ')' : ''}</p>
          ${D.seeded ? `<p class="tiny" data-notr>${esc(T('Seu histórico antigo virou'))} ${D.seeded} XP.</p>` : ''}
        </div>
        <div class="prog-eq">
          <button class="mi" data-go="title"><small>${esc(T('TÍTULO'))}</small> <b data-notr>${esc(T(tt.name))}</b> ▸</button>
          <button class="mi" data-go="frame"><small>${esc(T('MOLDURA'))}</small> <b data-notr style="color:${fr.c}">${esc(T(fr.name))}</b> ▸</button>
        </div>
      </div>
      <h4>${esc(T('MISSÕES DO DIA'))}</h4>
      <div class="mis">${mis.map(m => `<div class="mis-card ${m.done ? 'done' : ''}"><span data-notr>${esc(T(m.text.replace(String(m.n), '{n}')).replace('{n}', m.n))}</span>${bar(m.p / m.n)}<em data-notr>${m.done ? '✔ ' : m.p + '/' + m.n + ' • '}+${m.xp} XP</em></div>`).join('')}</div>
      <div class="prog-week"><div><b>${esc(T('RINHA DA SEMANA'))}</b><span data-notr>${esc(T(wk.theme.name))} • ${wbest ? esc(T('Melhor')) + ' ' + wbest + ' ' + stars(wst) : esc(T('ainda não jogada'))}</span></div><button class="mi small" data-go="week">${esc(T('JOGAR'))}</button></div>
      <nav class="rules-nav"><button class="mi" data-go="mastery">${esc(T('MAESTRIA POR LUTADOR'))}</button><button class="mi" data-go="ach">${esc(T('CONQUISTAS'))}</button><button class="mi back" data-go="back">${esc(T('VOLTAR'))}</button></nav>
    </div></div>`, { onBack: back, showBack: false, actions: {
      title: () => { M.meta.cycle('title', 1); progress(back); }, frame: () => { M.meta.cycle('frame', 1); progress(back); },
      mastery: () => mastery(() => progress(back)), ach: () => U.achievements(() => progress(back)), week: () => week(() => progress(back)), back
    } });
  }

  // ---------------------------------------------------------------- Maestria por lutador
  function mastery(onBack, pick) {
    const roster = M.ROSTER; pick = pick || roster[0];
    const goals = M.meta.goalsOf(pick), mi = M.meta.mastery(pick), F = M.FIGHTERS[pick];
    const palLine = [1, 2].map(k => `${M.PAL_NAMES[k]}: ${M.meta.palUnlocked(pick, k) ? '✔' : '🔒 ' + T('maestria') + ' ' + M.meta.PAL_AT[k]}`).join(' • ');
    show(`<div class="screen center overlay"><div class="panel wide mastery">
      <div class="stamp">MAESTRIA</div>
      <div class="ms-grid">${roster.map(id => { const m = M.meta.mastery(id); const lock = id === 'cinzas' && !M.store.data.progress.cinzas; return `<button class="mi ms ${id === pick ? 'on' : ''}" data-go="p_${id}"><span data-notr>${lock ? '???' : esc(fn(id))}</span><b data-notr>${m.lv}</b></button>`; }).join('')}</div>
      <div class="ms-detail">
        <div class="ms-port" id="msPort"></div>
        <div class="ms-info" data-notr>
          <h3>${esc(F.name)}</h3>
          <p class="sub">${esc(T('Maestria'))} <b>${mi.lv}</b>${mi.next ? ' • ' + (mi.into) + ' / ' + mi.need + ' XP' : ' • ' + esc(T('máxima'))}</p>
          ${bar(mi.pct)}
          <p class="tiny">${esc(palLine)}</p>
          <p class="tiny">${esc(T('Título'))}: ${esc(T('Mestre'))} ${esc(fn(pick))} ${mi.lv >= M.meta.MAS.length ? '' : '(' + esc(T('maestria')) + ' 5)'}</p>
          <ul class="goals">${goals.map(g => `<li class="${g.done ? 'ok' : ''}">${g.done ? '✔' : '○'} ${esc(T(g.text))} <em>${g.p}/${g.n}</em></li>`).join('')}</ul>
        </div>
      </div>
      <nav class="rules-nav"><button class="mi back" data-go="back">${esc(T('VOLTAR'))}</button></nav>
    </div></div>`, { onBack, showBack: false, idx: roster.indexOf(pick), actions: Object.assign({ back: onBack }, Object.fromEntries(roster.map(id => ['p_' + id, () => mastery(onBack, id)]))) });
    const port = document.getElementById('msPort'); if (port) port.appendChild(U.portrait(pick, 110, 140, { silhouette: pick === 'cinzas' && !M.store.data.progress.cinzas ? '#141210' : null }));
  }

  // ---------------------------------------------------------------- desafio recebido por link
  function challengeIntro(c) {
    const A = M.FIGHTERS[c.a.id], B = M.FIGHTERS[c.b.id], stageName = M.stages.DEFS[c.s].name;
    const who = c.tag || T('UM AMIGO');
    show(`<div class="screen center"><div class="panel wide daily chal">
      <div class="stamp">${esc(T('DESAFIO RECEBIDO'))}</div>
      <h2 data-notr>${esc(who)} ${esc(T('te desafiou!'))}</h2>
      <p class="sub" data-notr>${c.w ? esc(T('Venceu com')) : esc(T('Tentou com'))} ${esc(A.name)} ${esc(T('contra'))} ${esc(B.name)} • ${esc(stageName)}</p>
      <div class="daily-vs">
        <div class="daily-side"><div class="vs-port" id="cA"></div><h3 data-notr>${esc(A.name)}</h3><span class="tiny">${esc(T('VOCÊ'))}</span></div>
        <span class="vs-x">VS</span>
        <div class="daily-side"><div class="vs-port" id="cB"></div><h3 data-notr>${esc(B.name)}</h3><span class="tiny" data-notr>CPU • ${esc(U.diffLabel(c.d))}</span></div>
      </div>
      ${c.m.length ? `<div class="daily-rules">${c.m.map(id => { const m = M.mutById(id); return `<div class="daily-mut"><i data-notr>${m.icon}</i><b>${esc(m.name)}</b><span>${esc(m.desc)}</span></div>`; }).join('')}</div>` : ''}
      <div class="stats" data-notr><span>${esc(T('Placar a bater'))} <b>${c.sc}</b></span><span>${esc(T('Combo'))} <b>${c.cb}</b></span><span>${esc(T('Tempo'))} <b>${M.fmtTime(c.tm)}</b></span>${c.lv ? `<span>${esc(T('Nível'))} <b>${c.lv}</b></span>` : ''}</div>
      <nav><button class="mi" data-go="go">${esc(T('ACEITAR O DESAFIO'))}</button>${c.replay ? `<button class="mi" data-go="watch">${esc(T('VER A LUTA DELE(A)'))}</button>` : ''}<button class="mi back" data-go="back">${esc(T('AGORA NÃO'))}</button></nav>
    </div></div>`, { onBack: U.menu, showBack: false, actions: { go: () => startChallenge(c), back: U.menu,
      watch: async () => { try { const rep = await M.replay.parse(c.replay); M.replay.start(rep, () => challengeIntro(c)); } catch (e) { say('O replay do desafio não abriu.', '✖'); } } } });
    document.getElementById('cA').appendChild(U.portrait(c.a.id, 130, 165, { facing: 1, pal: c.a.pal }));
    document.getElementById('cB').appendChild(U.portrait(c.b.id, 130, 165, { facing: -1, pal: c.b.pal }));
  }
  function startChallenge(c) {
    const o = M.challenge.matchOpts(c); o.onEnd = r => challengeResult(r, c);
    M.flow.startMatch(o);
  }
  function challengeResult(r, c) {
    M.state = 'results';
    const o = r.opts, mine = M.challenge.score(r, o, 1), won = r.winnerSide === 1;
    const beat = won && (!c.w || mine > c.sc), tie = won && c.w && mine === c.sc;
    const X = resultExtras({ result: r, noChallenge: true });
    const back = M.challenge.fromMatch(r, o); const who = c.tag || T('seu amigo');
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${esc(T(beat ? 'DESAFIO SUPERADO!' : tie ? 'EMPATE DE PLACAR' : won ? 'VENCEU, MAS NÃO SUPEROU' : 'NÃO FOI DESSA VEZ'))}</div>
      <h2 data-notr>${mine} × ${c.sc}</h2>
      <p class="sub" data-notr>${esc(T('Seu placar'))} × ${esc(who)}</p>
      <div class="stats" data-notr><span>${esc(T('Combo'))} <b>${r.stats.p1.maxCombo || 0}</b> (${c.cb})</span><span>${esc(T('Tempo'))} <b>${M.fmtTime(r.frames / 60)}</b> (${M.fmtTime(c.tm)})</span></div>
      ${X.html}
      <nav><button class="mi" data-go="again">${esc(T('TENTAR DE NOVO'))}</button>${back ? `<button class="mi" data-go="back">${esc(T('DESAFIAR DE VOLTA'))}</button>` : ''}<button class="mi" data-go="menu">${esc(T('MENU'))}</button></nav>
    </div></div>`, { actions: Object.assign({ again: () => startChallenge(c), back: () => shareChallenge(back, r.replay), menu: U.menu }, X.actions) });
    if (X.after) X.after();
    if (beat && M.ach) M.ach.unlock('chal_beat');
  }
  // chamado quando o jogo abre com #c=... na barra de endereço
  function checkHash() {
    const c = M.challenge.fromHash(); if (!c) return false;
    M.challenge.clearHash(); M.pendingChallenge = c; return true;
  }

  // ---------------------------------------------------------------- Rinha da Semana
  const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  function week(onBack) {
    const W = M.week.build(), wd = M.week.data(), best = wd.best[W.key] || 0, st = wd.stars[W.key] || 0, back = onBack || U.menu, days = M.week.daysLeft();
    const hist = M.week.weeks().filter(h => h.key !== W.key).slice(-4);
    show(`<div class="screen center"><div class="panel wide daily week">
      <div class="stamp">${esc(T('RINHA DA SEMANA'))}</div>
      <h2 data-notr>${esc(T(W.theme.name))}</h2>
      <p class="sub" data-notr>${esc(T(W.theme.blurb))} • ${days} ${esc(T(days === 1 ? 'dia restante' : 'dias restantes'))}</p>
      <div class="daily-rules">${W.theme.mut.map(id => { const m = M.mutById(id); return `<div class="daily-mut"><i data-notr>${m.icon}</i><b>${esc(m.name)}</b><span>${esc(m.desc)}</span></div>`; }).join('')}</div>
      <div class="wk-opps" data-notr>${W.opps.map((o, i) => `<div class="wk-opp"><div class="vs-port" id="wo${i}"></div><span>${esc(fn(o))}</span><em>${esc(U.diffLabel(W.diffs[i]))}</em></div>`).join('')}</div>
      <div class="stats" data-notr><span>${esc(T('Melhor'))} <b>${best || '—'}</b></span><span>${esc(T('Estrelas'))} <b>${stars(st)}</b></span><span>${esc(T('Semanas concluídas'))} <b>${wd.done || 0}</b></span></div>
      ${hist.length ? `<p class="tiny" data-notr>${esc(T('Semanas anteriores'))}: ${hist.map(h => h.key.slice(-3) + ' ' + h.best + ' ' + stars(h.stars)).join(' • ')}</p>` : ''}
      <p class="tiny">${esc(T('Três lutas seguidas com as regras da semana. Perdeu uma, acabou. Vale XP em dobro e meia.'))}</p>
      <nav><button class="mi" data-go="go">${esc(T('ESCOLHER LUTADOR'))}</button><button class="mi back" data-go="back">${esc(T('VOLTAR'))}</button></nav>
    </div></div>`, { onBack: back, showBack: false, actions: { go: () => U.charselect({ players: 1, mode: 'week', onCancel: () => week(back) }), back } });
    W.opps.forEach((o, i) => { const el = document.getElementById('wo' + i); if (el) el.appendChild(U.portrait(o, 84, 106, { facing: -1, silhouette: o === 'cinzas' && !M.store.data.progress.cinzas ? '#141210' : null })); });
  }
  function weekBegin(p1, pal) { M.week.start(p1, pal); weekFight(); }
  function weekFight() {
    const run = M.week.run, o = M.week.matchOpts(run), i = run.i;
    U.versusCard({ p1: run.p1, p2: run.opps[i], pal1: run.pal, pal2: o.p2.pal, title: T('RINHA DA SEMANA') + ' ' + (i + 1) + '/' + run.W.opps.length, stageName: M.stages.DEFS[run.W.stages[i]].name, difficulty: o.difficulty, note: `<b>${esc(T('PLACAR'))}</b> ${run.score} • ${esc(T(run.W.theme.name))}` }, () => {
      o.onEnd = r => weekAfter(r);
      M.flow.startMatch(o);
    });
  }
  function weekAfter(r) {
    M.state = 'results';
    const res = M.week.end(r), run = M.week.run;
    if (!res.over) {
      show(`<div class="screen center"><div class="panel">
        <div class="stamp">${esc(T('LUTA'))} ${run.i} ${esc(T('VENCIDA'))}</div>
        <h2 data-notr>+${res.pts} ${esc(T('PONTOS'))}</h2>
        <p class="sub" data-notr>${esc(T('Placar'))} ${run.score} • ${esc(T('Próximo'))}: ${esc(fn(run.opps[run.i]))}</p>
        ${r.meta ? `<div class="stats" data-notr><span>+${r.meta.total} XP</span><span>${esc(lvName(r.meta.lv1))}</span></div>` : ''}
        <nav><button class="mi" data-go="next">${esc(T('PRÓXIMA LUTA'))}</button></nav>
      </div></div>`, { actions: { next: () => weekFight() } });
      if (r.meta) r.meta.shown = true;
      return;
    }
    const F = res.final, X = r.meta;
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${esc(T(F.full ? 'SEMANA COMPLETA!' : 'FIM DA LINHA'))}</div>
      <h2 data-notr>${F.score} ${esc(T('PONTOS'))}</h2>
      <p class="sub" data-notr>${stars(F.stars)} ${F.newBest ? '• ' + esc(T('NOVO RECORDE DA SEMANA')) : '• ' + esc(T('Melhor')) + ' ' + F.best}</p>
      <div class="stats" data-notr>${run.fights.map(f => `<span>${esc(fn(f.opp))} ${f.win ? '✔ ' + f.pts : '✘'}</span>`).join('')}</div>
      ${F.first ? `<p class="unlock" data-notr>✦ ${esc(T('Título liberado'))}: ${esc(T('Doido da Semana'))}</p>` : ''}
      ${F.bonusXp ? `<p class="unlock" data-notr>✦ +${F.bonusXp} XP ${esc(T('de bônus da semana'))}</p>` : ''}
      <div class="share-row" data-notr><button class="mi small" data-go="card">🖼 ${esc(T('CARTÃO'))}</button><button class="mi small" data-go="chal">⚔ ${esc(T('DESAFIAR UM AMIGO'))}</button></div>
      <nav><button class="mi" data-go="again">${esc(T('JOGAR DE NOVO'))}</button><button class="mi" data-go="menu">${esc(T('MENU'))}</button></nav>
    </div></div>`, { actions: {
      again: () => week(), menu: U.menu,
      card: async () => { try { const how = await M.card.share(M.card.make({ stage: run.W.stages[0], a: { id: run.p1, pal: run.pal }, b: null, pose: F.full ? 'spinKick' : null, head: F.full ? 'SEMANA COMPLETA!' : 'FIM DA LINHA', sub: T(run.W.theme.name), accent: F.full ? '#1f7a4d' : '#c8371d', tag: (M.comp && M.comp.data().tag) || '', title: T(M.meta.titleOf().name), level: M.meta.level().lv, rows: [['PLACAR', F.score], ['ESTRELAS', stars(F.stars)], ['LUTAS', run.won + '/' + run.W.opps.length]] }), T('Terminei a Rinha da Semana!')); say(how === 'saved' ? 'Cartão salvo!' : 'Cartão pronto!', '🖼'); } catch (e) { say('Não consegui gerar o cartão.', '✖'); } },
      chal: () => { const c = { v: 1, tag: (M.comp && M.comp.data().tag) || '', a: { id: run.p1, pal: run.pal }, b: { id: run.opps[0], pal: 0 }, s: run.W.stages[0], d: run.W.diffs[0], r: 1, t: 70, m: run.W.theme.mut.slice(), sd: (Date.now() & 0xffffff) >>> 0, w: run.won ? 1 : 0, hp: 0, tm: Math.round(run.frames / 60 / Math.max(1, run.fights.length)), cb: 0, sc: run.fights[0] ? run.fights[0].pts : 0, lv: M.meta.level().lv }; shareChallenge(c, null); }
    } });
    if (X) X.shown = true;
    if (X) setTimeout(() => M.meta.toast(Object.assign({}, X, { shown: false })), 600);
  }

  return { say, resultExtras, progress, mastery, challengeIntro, challengeResult, startChallenge, checkHash, week, weekBegin, weekFight, shareChallenge, xpPanel };
})();
