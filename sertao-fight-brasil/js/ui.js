'use strict';
// ============================================================
// UI — telas em DOM (menus, seleção, diálogos, garrafadas, finais)
// ============================================================
M.ui = (function () {
  let root, current = null, items = [], idx = 0, typing = null;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const KEYS_CONFIRM = ['Enter', 'Space', 'KeyJ', 'Numpad1', 'Comma', 'NumpadEnter'];
  const KEYS_BACK = ['Escape', 'KeyK', 'Backspace', 'Numpad2', 'Period'];

  function init() {
    root = document.getElementById('ui');
    window.addEventListener('keydown', e => {
      if (!current) return;
      if (current.onKey && current.onKey(e) === true) { e.preventDefault(); return; }
      if (!items.length) return;
      if (['ArrowUp', 'KeyW', 'ArrowLeft', 'KeyA'].includes(e.code)) { move(-1); e.preventDefault(); }
      else if (['ArrowDown', 'KeyS', 'ArrowRight', 'KeyD'].includes(e.code)) { move(1); e.preventDefault(); }
      else if (KEYS_CONFIRM.includes(e.code)) { if (items[idx]) { items[idx].click(); } e.preventDefault(); }
      else if (KEYS_BACK.includes(e.code)) { if (current.onBack) { M.audio.play('uiBack'); current.onBack(); } e.preventDefault(); }
    });
  }
  function move(d) { if (!items.length) return; idx = (idx + d + items.length) % items.length; focus(); M.audio.play('uiMove'); }
  function focus() { items.forEach((el, i) => el.classList.toggle('sel', i === idx)); }
  function show(html, o = {}) {
    stopTyping();
    root.innerHTML = html; root.classList.add('active');
    current = o; items = Array.from(root.querySelectorAll('.mi')); idx = o.idx || 0; focus();
    items.forEach((el, i) => { el.addEventListener('mouseenter', () => { idx = i; focus(); }); el.addEventListener('click', () => M.audio.play('ui')); });
    root.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => { const fn = o.actions && o.actions[el.dataset.go]; if (fn) fn(el); }));
    if (o.onBack && o.showBack !== false) {
      const b = document.createElement('button'); b.className = 'btn backbtn'; b.innerHTML = '&#9666; ' + (o.backLabel || 'VOLTAR');
      b.addEventListener('click', () => { M.audio.play('uiBack'); o.onBack(); });
      root.firstElementChild ? root.firstElementChild.appendChild(b) : root.appendChild(b);
    }
    return root;
  }
  function hide() { stopTyping(); root.innerHTML = ''; root.classList.remove('active'); current = null; items = []; }
  function stopTyping() { if (typing) { clearInterval(typing); typing = null; } }
  function typeInto(el, text, speed, done) {
    stopTyping(); let i = 0; el.innerHTML = '';
    const safe = esc(text).replace(/\n/g, '<br>');
    const chunks = safe.split(/(<br>)/);
    const flat = []; for (const c of chunks) { if (c === '<br>') flat.push('<br>'); else for (const ch of c) flat.push(ch); }
    typing = setInterval(() => {
      if (i >= flat.length) { stopTyping(); if (done) done(); return; }
      el.innerHTML += flat[i++]; if (i % 3 === 0 && flat[i - 1] !== ' ') M.audio.play('type');
    }, speed);
    return () => { stopTyping(); el.innerHTML = safe; if (done) done(); };
  }
  function portrait(id, w = 140, h = 180, opts) { const c = document.createElement('canvas'); c.width = w; c.height = h; M.render.drawPortrait(c, M.FIGHTERS[id], opts); return c; }
  function diffLabel(d) { return { novato: 'Novato', brabo: 'Brabo', lendario: 'Lendário' }[d] || d; }

  // ---------- TÍTULO ----------
  function title() {
    show(`<div class="screen title">
      <div class="logo"><span class="logo-top">A RINHA NUNCA PARA</span><h1>SERTÃO<br><em>FIGHT BRASIL</em></h1><span class="logo-sub">UM JOGO DE LUTA EM XILOGRAVURA</span></div>
      <p class="blink">PRESSIONE QUALQUER TECLA • TOQUE NA TELA</p>
      <p class="tiny">v${M.VERSION} • teclado, toque ou controle</p>
    </div>`, { onKey: () => { M.audio.init(); menu(); return true; } });
    root.querySelector('.screen').addEventListener('pointerdown', () => { M.audio.init(); menu(); });
  }

  // ---------- MENU ----------
  function menu() {
    M.state = 'menu'; M.match = null; M.audio.music.setMode('menu');
    const d = M.store.data; const cont = d.story && d.story.idx > 0 && d.story.idx < M.STORY.fights.length;
    const free = d.progress.storyDone;
    show(`<div class="screen menu">
      <div class="menu-left"><div class="logo small"><h1>SERTÃO <em>FIGHT BRASIL</em></h1><span class="logo-sub">A RINHA NUNCA PARA</span></div>
        <nav>
          ${cont ? `<button class="mi" data-go="cont">CONTINUAR HISTÓRIA <small>luta ${d.story.idx + 1}/${M.STORY.fights.length}</small></button>` : ''}
          <button class="mi" data-go="story">${cont ? 'NOVA ' : ''}HISTÓRIA <small>a Rinha do Fogo, com Zeca Ventania</small></button>
          <button class="mi" data-go="versus">VERSUS <small>2 jogadores no mesmo teclado</small></button>
          <button class="mi" data-go="training">TREINO <small>pratique golpes e combos</small></button>
          <button class="mi ${free ? '' : 'locked'}" data-go="free">RINHA LIVRE <small>${free ? 'enfrente toda a rinha com qualquer lutador' : 'vença a História para liberar'}</small></button>
          <button class="mi" data-go="howto">COMO JOGAR</button>
          <button class="mi" data-go="options">OPÇÕES</button>
          <button class="mi" data-go="credits">CRÉDITOS</button>
        </nav></div>
      <div class="menu-right"><div class="stamp">${free ? 'GUARDIÃO DA BRASA' : 'VILA BRASA, SERTÃO'}</div>
        <p class="pitch">Quem tem <b>Energia</b> manda na rinha.<br>O público é a barra de poder — e ele escolhe quem merece a Peia.</p>
        ${d.progress.bestTime ? `<p class="tiny">Melhor História: ${M.fmtTime(d.progress.bestTime)} • Finais vistos: ${d.progress.endings.length}/2</p>` : ''}
      </div>
    </div>`, {
      actions: {
        cont: () => M.flow.continueStory(), story: () => storyStart(), versus: () => charselect({ players: 2, mode: 'versus' }),
        training: () => charselect({ players: 1, mode: 'training' }), free: () => { if (free) charselect({ players: 1, mode: 'free' }); else M.audio.play('uiBack'); },
        howto: () => howto(menu), options: () => options(menu), credits: () => credits()
      }
    });
  }
  function storyStart() {
    const cur = M.store.data.settings.difficulty;
    show(`<div class="screen center"><div class="panel">
      <h2>A RINHA DO FOGO</h2>
      <p>Oito rinhas numa noite. Entre cada vitória você escolhe um <b>garrafada</b>. Caiu? Levanta e tenta de novo.</p>
      <p class="label">Escolha a dificuldade</p>
      <div class="row">
        <button class="mi diff ${cur === 'novato' ? 'sel' : ''}" data-go="novato">NOVATO<small>a rinha vai com calma</small></button>
        <button class="mi diff ${cur === 'brabo' ? 'sel' : ''}" data-go="brabo">BRABO<small>luta de verdade</small></button>
        <button class="mi diff ${cur === 'lendario' ? 'sel' : ''}" data-go="lendario">LENDÁRIO<small>a rinha não perdoa</small></button>
      </div>
      <button class="mi back" data-go="back">VOLTAR</button>
    </div></div>`, {
      idx: ['novato', 'brabo', 'lendario'].indexOf(cur), onBack: menu,
      actions: { novato: () => M.flow.newStory('novato'), brabo: () => M.flow.newStory('brabo'), lendario: () => M.flow.newStory('lendario'), back: menu }
    });
  }

  // ---------- CORDEL ----------
  function cordel(pages, title, onDone, opts = {}) {
    let page = 0; let finish = null;
    show(`<div class="screen center cordel-screen"><div class="cordel">
      <div class="cordel-title">${esc(title)}</div>
      <div class="cordel-text" id="cordelText"></div>
      <div class="cordel-foot"><span id="cordelPg"></span><button class="mi" data-go="next">CONTINUAR ▸</button>${opts.skip !== false ? '<button class="btn ghost" data-go="skip">pular</button>' : ''}</div>
    </div></div>`, { actions: { next: () => next(), skip: () => onDone() }, onKey: e => { if (KEYS_CONFIRM.includes(e.code)) { next(); return true; } return false; } });
    function render() { document.getElementById('cordelPg').textContent = `${page + 1} / ${pages.length}`; finish = typeInto(document.getElementById('cordelText'), pages[page], 28, () => { finish = null; }); }
    function next() { if (finish) { finish(); return; } page++; if (page >= pages.length) { onDone(); return; } render(); }
    render();
  }

  // ---------- DIÁLOGO ----------
  function dialogue(lines, title, onDone) {
    let i = 0, finish = null;
    show(`<div class="screen dialog-screen">
      <div class="dialog-title">${esc(title || '')}</div>
      <div class="dialog"><div class="dialog-port" id="dPort"></div><div class="dialog-body"><div class="dialog-name" id="dName"></div><div class="dialog-text" id="dText"></div><div class="dialog-hint">ENTER / TOQUE ▸ <button class="btn ghost" data-go="skip">pular</button></div></div></div>
    </div>`, { actions: { skip: () => onDone() }, onKey: e => { if (KEYS_CONFIRM.includes(e.code)) { next(); return true; } return false; } });
    root.querySelector('.dialog').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; next(); });
    function render() {
      const L = lines[i]; const sp = M.SPEAKERS[L.who] || { name: L.who, color: '#fff' };
      const port = document.getElementById('dPort'); port.innerHTML = '';
      if (M.FIGHTERS[L.who]) port.appendChild(portrait(L.who, 130, 160, { facing: L.who === 'zeca' ? 1 : -1 })); else port.innerHTML = '<div class="pandeiro">♪</div>';
      const nm = document.getElementById('dName'); nm.textContent = sp.name; nm.style.color = sp.color;
      finish = typeInto(document.getElementById('dText'), L.text, 22, () => { finish = null; });
    }
    function next() { if (finish) { finish(); return; } i++; if (i >= lines.length) { onDone(); return; } render(); }
    render();
  }

  // ---------- GARRAFADA ----------
  function patua(options, onPick) {
    show(`<div class="screen center"><div class="panel wide">
      <h2>ESCOLHA UM GARRAFADA</h2><p>A rinha te deu uma lembrança. Escolha uma — ela vale até o fim da noite.</p>
      <div class="cards">${options.map(p => `<button class="mi card" data-go="${p.id}"><div class="card-icon">${p.icon}</div><div class="card-name">${esc(p.name)}</div><div class="card-desc">${esc(p.desc)}</div></button>`).join('')}</div>
    </div></div>`, { actions: Object.fromEntries(options.map(p => [p.id, () => { M.audio.play('patua'); onPick(p); }])) });
  }

  // ---------- ESCOLHA FINAL ----------
  function choice(data, onPick) {
    show(`<div class="screen center"><div class="panel wide dark">
      <h2>${esc(data.title)}</h2><p>${esc(data.text)}</p>
      <div class="cards">${data.options.map(o => `<button class="mi card" data-go="${o.id}"><div class="card-name">${esc(o.label)}</div><div class="card-desc">${esc(o.desc)}</div></button>`).join('')}</div>
    </div></div>`, { actions: Object.fromEntries(data.options.map(o => [o.id, () => onPick(o.id)])) });
  }

  // ---------- RESULTADOS ----------
  function results(o) {
    const r = o.result; const w = r.winner;
    const st = r.stats.p1;
    show(`<div class="screen center"><div class="panel">
      <div class="stamp">${o.defeat ? 'CAIU NA RINHA' : 'VENCEU A RINHA'}</div>
      <h2>${esc(w.def.name.toUpperCase())}</h2>
      <p class="sub">${esc(w.def.alias)} • ${r.wins[0]} × ${r.wins[1]}</p>
      <div class="stats"><span>Tempo ${M.fmtTime(r.frames / 60)}</span><span>Golpes P1 ${st.hits}</span><span>Esquivas perfeitas ${st.perfect}</span><span>No compasso ${r.beatHits}</span></div>
      <nav>${o.buttons.map(b => `<button class="mi" data-go="${b.id}">${esc(b.label)}</button>`).join('')}</nav>
    </div></div>`, { actions: Object.fromEntries(o.buttons.map(b => [b.id, b.fn])) });
  }

  // ---------- FINAL ----------
  function ending(id, stats, onDone) {
    const E = M.STORY.endings[id];
    cordel(E.cordel, E.title, () => {
      show(`<div class="screen center"><div class="panel">
        <div class="stamp">FIM</div><h2>${esc(E.title.replace('FINAL: ', ''))}</h2>
        <div class="stats"><span>Tempo total ${M.fmtTime(stats.frames / 60)}</span><span>Garrafadas ${stats.patuas.length}</span><span>Quedas ${stats.deaths}</span><span>Dificuldade ${diffLabel(stats.difficulty)}</span></div>
        <p class="unlock">✦ MESTRE CINZAS liberado no Versus e no Treino<br>✦ RINHA LIVRE liberada</p>
        <p class="tiny">Existe outro final. A Brasa ainda tem uma escolha pra você.</p>
        <nav><button class="mi" data-go="credits">CRÉDITOS</button><button class="mi" data-go="menu">VOLTAR AO MENU</button></nav>
      </div></div>`, { actions: { credits: () => credits(), menu: () => onDone() } });
    }, { skip: false });
  }

  // ---------- SELEÇÃO DE LUTADOR ----------
  function charselect(o) {
    M.state = 'charselect';
    const unlocked = M.store.data.progress.cinzas;
    const roster = M.ROSTER;
    const sel = { p1: 0, p2: 1, stage: 0, step: 1 };
    const stages = ['aleatorio'].concat(M.stages.order);
    const modeName = { versus: 'VERSUS', training: 'TREINO', free: 'RINHA LIVRE' }[o.mode];
    show(`<div class="screen cs">
      <div class="cs-head"><span class="stamp">${modeName}</span><span id="csTurn" class="cs-turn"></span><button class="btn ghost" data-go="back">◂ voltar</button></div>
      <div class="cs-main">
        <div class="cs-info" id="csInfo1"></div>
        <div class="cs-grid" id="csGrid">${roster.map((id, i) => `<div class="cs-card ${id === 'cinzas' && !unlocked ? 'locked' : ''}" data-i="${i}"><div class="cs-port"></div><div class="cs-name">${id === 'cinzas' && !unlocked ? '???' : esc(M.FIGHTERS[id].name)}</div></div>`).join('')}</div>
        <div class="cs-info right" id="csInfo2"></div>
      </div>
      <div class="cs-foot">
        <div class="cs-stage"><span>CENÁRIO</span><button class="btn small" data-go="stPrev">◂</button><b id="csStage"></b><button class="btn small" data-go="stNext">▸</button></div>
        ${o.mode !== 'versus' ? `<div class="cs-stage"><span>DIFICULDADE</span><button class="btn small" data-go="dfPrev">◂</button><b id="csDiff"></b><button class="btn small" data-go="dfNext">▸</button></div>` : ''}
        <div class="cs-hint">P1: WASD + J confirma • K volta${o.players === 2 ? ' • P2: setas + Num1 ou vírgula' : ''}</div>
        <button class="btn primary" data-go="go" id="csGo">LUTAR!</button>
      </div>
    </div>`, {
      showBack: false, onBack: () => { if (sel.step === 2) { sel.step = 1; refresh(); } else menu(); },
      actions: { back: () => menu(), stPrev: () => { sel.stage = (sel.stage + stages.length - 1) % stages.length; refresh(); }, stNext: () => { sel.stage = (sel.stage + 1) % stages.length; refresh(); }, dfPrev: () => cycleDiff(-1), dfNext: () => cycleDiff(1), go: () => go() },
      onKey: e => {
        const c = e.code;
        const who = (o.players === 2 && sel.step === 2) ? 'p2' : 'p1';
        const isP1 = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'Enter', 'Space'].includes(c);
        const isP2 = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Numpad1', 'Comma', 'Numpad2', 'Period'].includes(c);
        if (!isP1 && !isP2 && c !== 'Escape') return false;
        if (c === 'Escape') { if (sel.step === 2) { sel.step = 1; refresh(); } else menu(); return true; }
        const key = who === 'p2' ? sel.p2 : sel.p1;
        let n = key;
        const N = roster.length, COLS = 4;
        if (['KeyA', 'ArrowLeft'].includes(c)) n = (key + N - 1) % N;
        else if (['KeyD', 'ArrowRight'].includes(c)) n = (key + 1) % N;
        else if (['KeyW', 'ArrowUp'].includes(c)) n = (key + N - COLS + N) % N;
        else if (['KeyS', 'ArrowDown'].includes(c)) n = (key + COLS) % N;
        else if (['KeyJ', 'Enter', 'Space', 'Numpad1', 'Comma'].includes(c)) { confirm(); return true; }
        else if (['KeyK', 'Numpad2', 'Period'].includes(c)) { if (sel.step === 2) { sel.step = 1; refresh(); } else menu(); return true; }
        if (n !== key) { if (who === 'p2') sel.p2 = n; else sel.p1 = n; M.audio.play('uiMove'); refresh(); }
        return true;
      }
    });
    const grid = document.getElementById('csGrid');
    grid.querySelectorAll('.cs-card').forEach((el, i) => { el.querySelector('.cs-port').appendChild(portrait(roster[i], 120, 150, { silhouette: roster[i] === 'cinzas' && !unlocked ? '#141210' : null })); el.addEventListener('click', () => { if (sel.step === 2 && o.players === 2) sel.p2 = i; else sel.p1 = i; refresh(); confirm(); }); });
    function cycleDiff(d) { const L = ['novato', 'brabo', 'lendario']; const s = M.store.data.settings; s.difficulty = L[(L.indexOf(s.difficulty) + d + 3) % 3]; M.store.save(); refresh(); }
    function info(el, i, label) {
      const id = roster[i], f = M.FIGHTERS[id]; const locked = id === 'cinzas' && !unlocked;
      el.innerHTML = locked ? `<div class="cs-label">${label}</div><h3>???</h3><p>Vença a História para liberar.</p>` : `<div class="cs-label">${label}</div><h3>${esc(f.name)}</h3><p class="alias">${esc(f.alias)} • ${esc(f.origin)}</p><p class="style">${esc(f.style)}</p><p>${esc(f.bio)}</p><p class="super"><b>PEIA:</b> ${esc(f.superName)} — ${esc(f.superDesc)}</p>`;
    }
    function refresh() {
      grid.querySelectorAll('.cs-card').forEach((el, i) => { el.classList.toggle('c1', i === sel.p1); el.classList.toggle('c2', o.players === 2 && i === sel.p2 && sel.step === 2 || (o.players === 2 && sel.step === 3 && i === sel.p2)); });
      info(document.getElementById('csInfo1'), sel.p1, 'JOGADOR 1');
      const i2 = document.getElementById('csInfo2');
      if (o.players === 2) info(i2, sel.p2, sel.step >= 2 ? 'JOGADOR 2' : 'JOGADOR 2 (aguardando)'); else i2.innerHTML = `<div class="cs-label">${o.mode === 'free' ? 'A RINHA INTEIRA' : 'BONECO / CPU'}</div><p>${o.mode === 'free' ? 'Você enfrenta os outros cinco em ordem aleatória e o Mestre por último. Garrafada a cada vitória.' : 'No treino, o oponente começa parado. Pause (ESC) para mudar o comportamento do boneco.'}</p>`;
      document.getElementById('csTurn').textContent = o.players === 2 ? (sel.step === 1 ? 'JOGADOR 1 ESCOLHE' : sel.step === 2 ? 'JOGADOR 2 ESCOLHE' : 'PRONTO!') : '';
      document.getElementById('csStage').textContent = stages[sel.stage] === 'aleatorio' ? 'Aleatório' : M.stages.DEFS[stages[sel.stage]].name;
      const dEl = document.getElementById('csDiff'); if (dEl) dEl.textContent = diffLabel(M.store.data.settings.difficulty);
    }
    function confirm() {
      const cur = (o.players === 2 && sel.step === 2) ? sel.p2 : sel.p1;
      if (roster[cur] === 'cinzas' && !unlocked) { M.audio.play('uiBack'); return; }
      M.audio.play('ui');
      if (o.players === 2 && sel.step === 1) { sel.step = 2; refresh(); return; }
      go();
    }
    function go() {
      if (o.players === 2 && sel.step === 1) { sel.step = 2; refresh(); return; }
      const stage = stages[sel.stage] === 'aleatorio' ? M.choice(M.stages.order) : stages[sel.stage];
      let p2 = roster[sel.p2];
      if (o.players === 1) { const pool = roster.filter(id => id !== roster[sel.p1] && (id !== 'cinzas' || unlocked)); p2 = M.choice(pool); }
      M.flow.startFromSelect({ mode: o.mode, p1: roster[sel.p1], p2, stage });
    }
    refresh();
  }

  // ---------- PAUSA ----------
  function pause(opts) {
    M.state = 'pause';
    const tr = opts.training;
    const dummies = [['stand', 'Parado'], ['block', 'Defende'], ['jump', 'Pula'], ['cpu', 'CPU']];
    show(`<div class="screen center overlay"><div class="panel">
      <div class="stamp">PAUSA</div>
      <nav>
        <button class="mi" data-go="resume">CONTINUAR</button>
        ${tr ? `<button class="mi" data-go="dummy">BONECO: <b id="dummyLbl">${dummies.find(d => d[0] === M.match.dummyMode)[1]}</b></button>` : ''}
        <button class="mi" data-go="restart">REINICIAR LUTA</button>
        <button class="mi" data-go="options">OPÇÕES</button>
        <button class="mi" data-go="quit">SAIR PRO MENU</button>
      </nav>
      <p class="tiny">P1: WASD • J leve • K forte • L especial • H agarrão • ESPAÇO arreda • U peia • O provoca</p>
    </div></div>`, {
      onBack: opts.resume, backLabel: 'CONTINUAR',
      actions: {
        resume: opts.resume, restart: opts.restart, quit: opts.quit, options: () => options(() => pause(opts)),
        dummy: () => { const i = dummies.findIndex(d => d[0] === M.match.dummyMode); M.match.dummyMode = dummies[(i + 1) % dummies.length][0]; document.getElementById('dummyLbl').textContent = dummies[(i + 1) % dummies.length][1]; }
      }
    });
  }

  // ---------- OPÇÕES ----------
  function options(onBack) {
    const s = M.store.data.settings;
    const tog = (k, label) => `<button class="mi tog" data-go="${k}">${label} <b>${s[k] ? 'LIGADO' : 'DESLIGADO'}</b></button>`;
    show(`<div class="screen center overlay"><div class="panel compact">
      <div class="stamp">OPÇÕES</div>
      <label class="slider">VOLUME <input type="range" min="0" max="1" step="0.05" value="${s.volume}" id="vol"></label>
      <nav>
        ${tog('music', 'MÚSICA')}${tog('sfx', 'EFEITOS')}${tog('shake', 'TREMOR DE TELA')}${tog('hitboxes', 'MOSTRAR HITBOXES')}
        <button class="mi" data-go="touch">CONTROLES DE TOQUE <b>${{ auto: 'AUTO', on: 'SEMPRE', off: 'NUNCA' }[s.touch]}</b></button>
        <button class="mi" data-go="diff">DIFICULDADE (CPU) <b>${diffLabel(s.difficulty).toUpperCase()}</b></button>
        <button class="mi" data-go="reset">APAGAR PROGRESSO</button>
        <button class="mi back" data-go="back">VOLTAR</button>
      </nav>
    </div></div>`, {
      onBack, idx: 0,
      actions: {
        music: () => { s.music = !s.music; save(); }, sfx: () => { s.sfx = !s.sfx; save(); }, shake: () => { s.shake = !s.shake; save(); }, hitboxes: () => { s.hitboxes = !s.hitboxes; save(); },
        touch: () => { s.touch = { auto: 'on', on: 'off', off: 'auto' }[s.touch]; save(); M.flow.updateTouch(); },
        diff: () => { const L = ['novato', 'brabo', 'lendario']; s.difficulty = L[(L.indexOf(s.difficulty) + 1) % 3]; save(); },
        reset: () => { if (confirm('Apagar todo o progresso salvo?')) { localStorage.removeItem(M.store.key); M.store.load(); save(); } },
        back: onBack
      }
    });
    function save() { M.store.save(); M.audio.A.settings.volume = s.volume; M.audio.A.settings.music = s.music; M.audio.A.settings.sfx = s.sfx; M.audio.applySettings(); const i = idx; options(onBack); idx = i; focus(); }
    document.getElementById('vol').addEventListener('input', e => { s.volume = parseFloat(e.target.value); M.store.save(); M.audio.A.settings.volume = s.volume; M.audio.applySettings(); });
    document.getElementById('vol').addEventListener('change', () => M.audio.play('ui'));
  }

  // ---------- COMO JOGAR ----------
  function howto(onBack) {
    show(`<div class="screen center"><div class="panel wide howto">
      <div class="stamp">COMO JOGAR</div>
      <div class="cols">
        <div><h3>CONTROLES</h3>
          <table><tr><th></th><th>P1</th><th>P2</th></tr>
          <tr><td>Mover / pular / agachar</td><td>W A S D</td><td>Setas</td></tr>
          <tr><td>Golpe leve</td><td>J</td><td>Num 1 / ,</td></tr>
          <tr><td>Golpe forte</td><td>K</td><td>Num 2 / .</td></tr>
          <tr><td>Especial</td><td>L</td><td>Num 3 / /</td></tr>
          <tr><td>Arreda (esquiva)</td><td>ESPAÇO</td><td>Num 0 / Shift dir.</td></tr>
          <tr><td>Peia (super)</td><td>U</td><td>Num 5 / '</td></tr>
          <tr><td>Provocar</td><td>O</td><td>Num 4 / ;</td></tr>
          <tr><td>Agarrão</td><td>H (ou J+K)</td><td>Num 6 / ]</td></tr>
          <tr><td>Dash</td><td colspan="2">toque duplo ← ou →</td></tr>
          <tr><td>Golpe corrido</td><td colspan="2">Dash + forte</td></tr>
          <tr><td>Pausa</td><td colspan="2">ESC</td></tr></table>
          <p class="tiny">Controle (gamepad) também funciona: analógico/d-pad, X leve, Y forte, B especial, A arreda, RB peia, LB provocar, LT agarrão, Start pausa.</p>
        </div>
        <div><h3>A RINHA</h3>
          <p><b>ENERGIA</b> é uma barra só, no meio: o público. Cada golpe, esquiva e provocação puxa a barra pro seu lado. Com 70% ela libera sua <b>PEIA</b>.</p>
          <p><b>VARIAÇÃO</b>: repetir o mesmo golpe cansa a rinha e rende pouca Energia. Misture.</p>
          <p><b>NO COMPASSO</b>: acerte junto com a batida da zabumba (o círculo pulsa) para Energia em dobro.</p>
          <p><b>ARREDA</b>: esquiva com invencibilidade. Esquive no instante do golpe = <b>ESQUIVA PERFEITA</b>, tempo lento, muita Energia e um <b>CONTRA-ATAQUE</b> garantido no próximo golpe. Segurando pra frente, a arreda atravessa o oponente.</p>
          <p><b>DEFESA</b>: segure pra trás. Golpes baixos pedem agachar; golpes altos pedem ficar em pé. Agarrões ignoram defesa.</p>
          <p><b>PROVOCAR</b> dá Energia — se ninguém te bater antes. Risco e recompensa.</p>
          <p><b>AGARRÃO</b> (H ou J+K): ignora defesa. <b>ESCAPAR</b>: em um combo de 3+ golpes, aperte ARREDA gastando 30% de Energia.</p>
          <p><b>PEIA BRABA</b>: com a barra em 100%, a Peia causa 30% a mais. Soltar aos 70% ou esperar?</p>
          <p><b>SEQUÊNCIAS</b>: leve ▸ leve ▸ forte ▸ especial ▸ peia, se os golpes acertarem. Lançou o oponente pro alto? Aperte PULAR na hora (<b>PULO-CANCEL</b>) e continue no ar.</p>
        </div>
      </div>
      <nav><button class="mi back" data-go="back">VOLTAR</button></nav>
    </div></div>`, { onBack, actions: { back: onBack } });
  }
  function credits() {
    show(`<div class="screen center"><div class="panel"><div class="stamp">CRÉDITOS</div><p class="credits">${esc(M.STORY.credits).replace(/\n/g, '<br>')}</p><nav><button class="mi back" data-go="back">VOLTAR</button></nav></div></div>`, { onBack: menu, actions: { back: menu } });
  }

  return { init, show, hide, title, menu, storyStart, cordel, dialogue, patua, choice, results, ending, charselect, pause, options, howto, credits, portrait };
})();
