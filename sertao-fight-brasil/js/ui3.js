'use strict';
// ============================================================
// UI 3 — telas do Competitivo: central, ranqueada, histórico, confrontos, replays e dados de quadros.
// ============================================================
M.ui3 = (function () {
  const U = M.ui, esc = U.esc, show = (h, o) => U.show(h, o);
  const nm = id => { const f = M.FIGHTERS[id]; return f ? (f.short || f.name) : id; };
  const loc = () => (M.i18n.lang === 'pt' ? 'pt-BR' : M.i18n.lang === 'es' ? 'es' : 'en');
  const fmtDate = t => { try { return new Date(t).toLocaleDateString(loc(), { day: '2-digit', month: 'short' }) + ' ' + new Date(t).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  const AB = { zeca: 'Zeca', bia: 'Bia', mare: 'Maré', tiao: 'Tião', bene: 'Bené', juvenal: 'Juv.', vinicius: 'Vinic.', fulozinha: 'Fulo', mula: 'Mula', papafigo: 'Papa', cuia: 'Cuia', cinzas: 'Cinz.' };
  const sign = n => (n > 0 ? '+' + n : String(n));
  const emblemCanvas = (rk, w, h, S) => { const c = document.createElement('canvas'); c.width = w; c.height = h; M.comp.emblem(c.getContext('2d'), w / 2, h / 2, S, rk, true); return c; };

  // ---------- central ----------
  function hub(keep = 0) {
    const d = M.comp.data(), rk = M.comp.rank(d.pr), pl = M.comp.placing();
    const wr = d.wins + d.losses ? Math.round(d.wins / (d.wins + d.losses) * 100) + '%' : '—';
    const rankLine = pl ? 'COLOCAÇÃO ' + d.games + '/' + M.comp.PLACEMENTS : rk.name;
    show(`<div class="screen center overlay"><div class="panel comp-hub">
      <div class="stamp">COMPETITIVO</div>
      <div class="comp-top">
        <div class="comp-emblem" id="cEmb"></div>
        <div class="comp-info">
          <h2 data-notr><span id="rkName"></span></h2>
          <div class="pr-bar"><i style="width:${Math.round(rk.pct * 100)}%"></i></div>
          <p class="tiny" data-notr>PR ${d.pr}${rk.legend ? '' : ' / ' + rk.hi}</p>
          <label class="tag-edit"><span>TAG</span><input id="tagIn" maxlength="12" value="${esc(d.tag || '')}" placeholder="JOGADOR" autocomplete="off" spellcheck="false" data-notr></label>
          <div class="stats"><span>Vitórias <b data-notr>${d.wins}</b></span><span>Derrotas <b data-notr>${d.losses}</b></span><span>Aproveitamento <b data-notr>${wr}</b></span><span>Sequência <b data-notr>${d.streak > 0 ? '+' + d.streak : d.streak}</b></span><span>Melhor PR <b data-notr>${d.peak}</b></span></div>
        </div>
      </div>
      <nav class="comp-nav">
        <button class="mi" data-go="ranked">JOGAR RANQUEADA</button>
        <button class="mi" data-go="tourney">TORNEIO LOCAL</button>
        <button class="mi" data-go="replays">REPLAYS</button>
        <button class="mi" data-go="fd">DADOS DE QUADROS</button>
        <button class="mi" data-go="hist">HISTÓRICO</button>
        <button class="mi" data-go="vs">CONFRONTOS</button>
      </nav>
      <button class="mi back" data-go="back">VOLTAR</button>
    </div></div>`, {
      onBack: U.menu, showBack: false, idx: keep,
      actions: {
        ranked: () => U.charselect({ players: 1, mode: 'ranked' }), tourney: () => M.ui4.hub(), replays: () => replays(), fd: () => frameData(), hist: () => history(), vs: () => matchups(), back: U.menu
      }
    });
    const rn = document.getElementById('rkName'); rn.textContent = M.tr(pl ? 'COLOCAÇÃO' : rk.tier.name) + (pl ? ' ' + d.games + '/' + M.comp.PLACEMENTS : (rk.div ? ' ' + rk.div : ''));
    rn.style.color = pl ? '' : rk.tier.c2; rn.setAttribute('data-notr', '');
    document.getElementById('cEmb').appendChild(emblemCanvas(rk, 160, 180, 125));
    const inp = document.getElementById('tagIn');
    const saveTag = () => { d.tag = inp.value.replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, 12); M.store.save(); };
    inp.addEventListener('change', saveTag); inp.addEventListener('blur', saveTag);
  }

  // ---------- resultado da ranqueada ----------
  function rankedResult(o) {
    const c = o.c, d = M.comp.data(), a = o.rankAfter, b = o.rankBefore;
    const up = a.sub > b.sub, down = a.sub < b.sub, newTier = a.ti > b.ti, pl = M.comp.placing();
    const title = o.r ? (o.win ? 'VITÓRIA RANQUEADA' : 'DERROTA') : 'DESISTÊNCIA';
    show(`<div class="screen center"><div class="panel comp-res">
      <div class="stamp">${title}</div>
      <div class="res-row">
        <div class="comp-emblem" id="rEmb"></div>
        <div>
          <h2 class="delta ${o.delta >= 0 ? 'up' : 'down'}" data-notr>${sign(o.delta)} PR</h2>
          <p class="sub" data-notr><span id="rkA"></span></p>
          <div class="pr-bar"><i id="prFill" style="width:${Math.round(b.pct * 100)}%"></i></div>
          <p class="tiny" data-notr>PR ${o.before} ▸ ${o.after}${o.bonus ? ' • bônus +' + o.bonus : ''}</p>
        </div>
      </div>
      ${newTier && up ? '<p class="unlock">✦ SUBIU DE NÍVEL!</p>' : up ? '<p class="unlock">✦ SUBIU DE DIVISÃO!</p>' : down ? '<p class="tiny">Você caiu de divisão. Volta com tudo!</p>' : ''}
      ${pl ? `<p class="tiny" data-notr>${M.tr('Colocação')} ${d.games}/${M.comp.PLACEMENTS}${M.tr(': a CPU está medindo o seu nível.')}</p>` : ''}
      <div class="stats"><span data-notr>${esc(nm(c.p1))} × ${esc(nm(c.p2))}</span>${o.r ? `<span>Placar <b data-notr>${o.r.wins[0]}–${o.r.wins[1]}</b></span><span>Tempo ${M.fmtTime(o.r.frames / 60)}</span>` : ''}<span>CPU <b data-notr>${esc(M.tr(M.comp.rank(c.oR).tier.name))}</b></span><span>Sequência <b data-notr>${d.streak > 0 ? '+' + d.streak : d.streak}</b></span></div>
      <nav>
        <button class="mi" data-go="again">OUTRA PARTIDA</button>
        ${o.r && o.r.replayId ? '<button class="mi" data-go="replay">VER REPLAY</button>' : ''}
        <button class="mi" data-go="change">TROCAR LUTADOR</button>
        <button class="mi" data-go="hub">CENTRAL COMPETITIVA</button>
      </nav>
    </div></div>`, { actions: { again: () => M.comp.play(c.p1, c.pal, c.p2), replay: () => { const x = M.replay.get(o.r.replayId); if (x) M.replay.start(x.rep, r => rankedAfterReplay(o)); }, change: () => { M.match = null; U.charselect({ players: 1, mode: 'ranked' }); }, hub: () => { M.match = null; hub(); } } });
    document.getElementById('rEmb').appendChild(emblemCanvas(a, 140, 160, 112));
    const ra = document.getElementById('rkA'); ra.textContent = M.tr(pl ? 'COLOCAÇÃO' : a.tier.name) + (pl ? ' ' + d.games + '/' + M.comp.PLACEMENTS : (a.div ? ' ' + a.div : ''));
    requestAnimationFrame(() => requestAnimationFrame(() => { const f = document.getElementById('prFill'); if (f) f.style.width = Math.round(a.pct * 100) + '%'; }));
    if (up || down) M.audio.play(up ? 'patua' : 'uiBack');
  }
  function rankedAfterReplay(o) { M.match = null; M.state = 'results'; rankedResult(o); }

  // ---------- histórico ----------
  function history() {
    const d = M.comp.data();
    show(`<div class="screen center overlay"><div class="panel hist">
      <div class="stamp">HISTÓRICO</div>
      ${d.hist.length ? `<div class="hist-list">${d.hist.map((h, i) => `<button class="mi hrow ${h.win ? 'w' : 'l'}" data-go="h${i}"><b data-notr>${h.win ? 'V' : 'D'}</b><span data-notr>${esc(nm(h.p1))} × ${esc(nm(h.p2))}</span><em data-notr>${h.s[0]}–${h.s[1]}</em><span class="d ${h.d >= 0 ? 'up' : 'down'}" data-notr>${sign(h.d)}</span><small data-notr>${fmtDate(h.t)}</small></button>`).join('')}</div>` : '<p>Nenhuma partida ranqueada ainda. Entre na rinha!</p>'}
      <nav><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, {
      onBack: () => hub(4), showBack: false,
      actions: Object.assign({ back: () => hub(4) }, Object.fromEntries(d.hist.map((h, i) => ['h' + i, () => { if (h.rid) { const x = M.replay.get(h.rid); if (x) { M.replay.start(x.rep, () => { M.match = null; history(); }); return; } } M.audio.play('uiBack'); }])))
    });
  }

  // ---------- confrontos (tabela lutador × lutador) ----------
  function matchups() {
    const d = M.comp.data(), ids = M.ROSTER.filter(id => id !== 'cinzas' || M.store.data.progress.cinzas);
    const cell = (a, b) => { const c = (d.vs[a] || {})[b]; if (!c) return '<td class="mx e"></td>'; const w = c[0], l = c[1], k = w > l ? 'w' : w < l ? 'l' : 'd'; return `<td class="mx ${k}" title="${w}–${l}" data-notr>${w}–${l}</td>`; };
    show(`<div class="screen center overlay"><div class="panel matrix">
      <div class="stamp">CONFRONTOS</div>
      <p class="tiny">Vitórias–derrotas na ranqueada: seu lutador (linhas) contra o adversário (colunas).</p>
      <div class="mx-wrap"><table class="mxt"><thead><tr><th></th>${ids.map(id => `<th><span data-notr>${esc(AB[id] || nm(id))}</span></th>`).join('')}</tr></thead>
      <tbody>${ids.map(a => `<tr><th data-notr>${esc(nm(a))}</th>${ids.map(b => cell(a, b)).join('')}</tr>`).join('')}</tbody></table></div>
      <nav><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack: () => hub(5), showBack: false, actions: { back: () => hub(5) } });
  }

  // ---------- replays ----------
  function replays(keep = 0, msg) {
    const L = M.replay.list();
    show(`<div class="screen center overlay"><div class="panel rep">
      <div class="stamp">REPLAYS</div>
      ${msg ? `<p class="unlock">${msg}</p>` : ''}
      ${L.length ? `<div class="rep-list">${L.map((x, i) => `<button class="mi rrow" data-go="r${i}"><i data-notr>${x.fav ? '★' : ''}</i><span data-notr>${esc(M.replay.label(x.rep))}</span><em>${esc(x.rep.o.label || (x.rep.o.mode === 'daily' ? 'DESAFIO DO DIA' : x.rep.o.mode === 'tourney' ? 'TORNEIO' : x.rep.o.mode === 'ranked' ? 'RANQUEADA' : 'VERSUS'))}</em><small data-notr>${fmtDate(x.rep.date)} • ${M.fmtTime(x.rep.res.frames / 60)}</small></button>`).join('')}</div>` : '<p>Nenhum replay guardado. As lutas de Versus, da Ranqueada, do Desafio do Dia e do Torneio são gravadas sozinhas.</p>'}
      <nav class="rep-nav"><button class="mi" data-go="import">IMPORTAR CÓDIGO</button><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, {
      onBack: () => hub(2), showBack: false, idx: keep,
      actions: Object.assign({ import: () => importCode(), back: () => hub(2) }, Object.fromEntries(L.map((x, i) => ['r' + i, () => replayMenu(x.id, i)])))
    });
  }
  function replayMenu(id, idx) {
    const x = M.replay.get(id); if (!x) return replays();
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">REPLAY</div><h2 data-notr>${esc(M.replay.label(x.rep))}</h2>
      <p class="sub" data-notr>${fmtDate(x.rep.date)} • ${M.fmtTime(x.rep.res.frames / 60)} • ${x.rep.res.wins[0]}–${x.rep.res.wins[1]}</p>
      <nav>
        <button class="mi" data-go="watch">ASSISTIR</button>
        <button class="mi" data-go="fav">${x.fav ? 'TIRAR DOS FAVORITOS' : 'FAVORITAR'}</button>
        <button class="mi" data-go="code">COPIAR CÓDIGO</button>
        <button class="mi" data-go="del">APAGAR</button>
        <button class="mi back" data-go="back">VOLTAR</button>
      </nav>
    </div></div>`, {
      onBack: () => replays(idx), actions: {
        watch: () => { M.ach.unlock('replay_watch'); M.replay.start(x.rep, () => { M.match = null; M.state = 'results'; replayMenu(id, idx); }); },
        fav: () => { M.replay.favorite(id); replayMenu(id, idx); },
        code: async () => { const code = await M.replay.encode(x.rep); codeBox(code, () => replayMenu(id, idx)); },
        del: () => { M.replay.remove(id); replays(0); }, back: () => replays(idx)
      }
    });
  }
  function codeBox(code, back) {
    show(`<div class="screen center"><div class="panel wide">
      <div class="stamp">CÓDIGO DO REPLAY</div>
      <p class="tiny" data-notr>${M.tr('Copie e mande para quem quiser: o código contém a luta inteira')} (${(code.length / 1024).toFixed(1)} KB).</p>
      <textarea id="codeTa" class="codeta" readonly spellcheck="false" data-notr>${esc(code)}</textarea>
      <nav><button class="mi" data-go="copy">COPIAR</button><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack: back, showBack: false, actions: { copy: async () => { const ta = document.getElementById('codeTa'); ta.select(); try { await navigator.clipboard.writeText(code); } catch (e) { document.execCommand && document.execCommand('copy'); } ta.blur(); const b = root().querySelector('[data-go="copy"]'); if (b) b.firstChild.nodeValue = M.tr('COPIADO!'); }, back } });
    M.ach.unlock('replay_share');
  }
  const root = () => document.getElementById('ui');
  function importCode() {
    show(`<div class="screen center"><div class="panel wide">
      <div class="stamp">IMPORTAR REPLAY</div>
      <p class="tiny">Cole aqui o código que você recebeu (começa com SFB).</p>
      <textarea id="codeTa" class="codeta" spellcheck="false" placeholder="SFB1:..." data-notr></textarea>
      <p class="tiny" id="impMsg"></p>
      <nav><button class="mi" data-go="ok">IMPORTAR E ASSISTIR</button><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, {
      onBack: () => replays(), showBack: false, actions: {
        ok: async () => {
          const ta = document.getElementById('codeTa'), msg = document.getElementById('impMsg');
          try { const rep = await M.replay.parse(ta.value); const id = M.replay.keep(rep, { imported: true }); M.ach.unlock('replay_watch'); M.replay.start(rep, () => { M.match = null; M.state = 'results'; replays(0); }); }
          catch (e) { msg.textContent = 'Código inválido ou de outra versão do jogo.'; msg.style.color = '#c8371d'; }
        }, back: () => replays()
      }
    });
    setTimeout(() => { const ta = document.getElementById('codeTa'); if (ta) ta.focus(); }, 50);
  }

  // ---------- dados de quadros ----------
  function frameData(i = 0) {
    const ids = M.ROSTER.filter(id => id !== 'cinzas' || M.store.data.progress.cinzas); i = (i + ids.length) % ids.length;
    const id = ids[i], f = M.FIGHTERS[id], rows = M.frameData.rows(id), S = f.stats, fm = M.frameData.fmt;
    M.ach.unlock('framedata');
    const cls = v => (typeof v === 'number' ? (v > 0 ? 'pos' : v < 0 ? 'neg' : '') : '');
    show(`<div class="screen center overlay"><div class="panel fd">
      <div class="fd-head"><button class="btn small" data-go="prev">◂</button><div><div class="stamp">DADOS DE QUADROS</div><h2 data-notr>${esc(f.name)}</h2></div><button class="btn small" data-go="next">▸</button></div>
      <div class="stats"><span>Vida <b data-notr>${S.hp}</b></span><span>Velocidade <b data-notr>${S.speed}</b></span><span>Dash <b data-notr>${S.dashV}</b></span><span>Pulos <b data-notr>${S.maxJumps}</b></span><span>Peso <b data-notr>${S.weight}</b></span></div>
      <div class="fd-scroll" id="fdScroll"><table class="fdt"><thead><tr><th>CMD</th><th class="l">GOLPE</th><th>TIPO</th><th>INÍCIO</th><th>ATIVO</th><th>RECUP.</th><th>TOTAL</th><th>DANO</th><th>ACERTO</th><th>DEFESA</th><th class="l">NOTAS</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td class="cmd" data-notr>${esc(r.cmd)}</td><td class="l">${esc(r.name)}</td><td>${r.type ? esc(r.type) : ''}</td><td data-notr>${r.startup}</td><td data-notr>${r.active}</td><td data-notr>${r.recovery}</td><td data-notr>${r.total}</td><td data-notr>${esc(r.dmg)}</td><td class="${cls(r.hit)}">${esc(fm(r.hit))}</td><td class="${cls(r.block)}" data-notr>${esc(fm(r.block))}</td><td class="l n">${r.notes.map(esc).join(' • ')}${r.cancel ? ` <i data-notr>▸ ${esc(r.cancel)}</i>` : ''}</td></tr>`).join('')}</tbody></table></div>
      <p class="tiny">Vantagem = quadros que você age antes do rival (positivo) ou depois (negativo). KD = derruba. ▸ = golpes para cancelar. Contato no primeiro quadro ativo.</p>
      <nav class="rep-nav"><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, {
      onBack: () => hub(3), showBack: false,
      onKey: e => { const sc = document.getElementById('fdScroll'); if (['ArrowLeft', 'KeyA'].includes(e.code)) { frameData(i - 1); return true; } if (['ArrowRight', 'KeyD'].includes(e.code)) { frameData(i + 1); return true; } if (['ArrowUp', 'KeyW'].includes(e.code) && sc) { sc.scrollTop -= 60; return true; } if (['ArrowDown', 'KeyS'].includes(e.code) && sc) { sc.scrollTop += 60; return true; } return false; },
      actions: { prev: () => frameData(i - 1), next: () => frameData(i + 1), back: () => hub(3) }
    });
  }

  return { hub, rankedResult, history, matchups, replays, frameData };
})();
