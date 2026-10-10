'use strict';
// ============================================================
// INPUT — teclado, toque e gamepad, com detecção de dash (toque duplo)
// ============================================================
M.input = (function () {
  const ACTIONS = ['up', 'down', 'left', 'right', 'light', 'heavy', 'special', 'ginga', 'mandinga', 'taunt', 'throw'];
  const KEYMAP = {
    p1: { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], light: ['KeyJ'], heavy: ['KeyK'], special: ['KeyL'], ginga: ['Space', 'KeyI'], mandinga: ['KeyU'], taunt: ['KeyO'], throw: ['KeyH'] },
    p2: { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], light: ['Numpad1', 'Comma'], heavy: ['Numpad2', 'Period'], special: ['Numpad3', 'Slash'], ginga: ['Numpad0', 'ShiftRight'], mandinga: ['Numpad5', 'Quote'], taunt: ['Numpad4', 'Semicolon'], throw: ['Numpad6', 'BracketRight'] }
  };
  const DEFAULT_KEYS = JSON.parse(JSON.stringify(KEYMAP));
  let captureCb = null, padEdges = [];
  const PAUSE_KEYS = ['Escape', 'KeyP'];
  const keys = Object.create(null);
  let queue = [];
  let anyFlag = false, pauseFlag = false;
  const virtual = { p1: {}, p2: {} };
  let vQueue = [];
  const pads = { p1: null, p2: null };
  const players = { p1: mk(), p2: mk() };

  function mk() {
    const o = { held: {}, pressed: {}, dashLeft: false, dashRight: false, _tap: { left: { t: -1e9, rel: true }, right: { t: -1e9, rel: true } } };
    ACTIONS.forEach(a => { o.held[a] = false; o.pressed[a] = false; });
    return o;
  }

  window.addEventListener('keydown', e => {
    if (captureCb) { e.preventDefault(); e.stopImmediatePropagation(); const cb = captureCb; captureCb = null; cb(e.code); return; }
    if (e.repeat) return;
    if (!keys[e.code]) { keys[e.code] = true; queue.push(e.code); anyFlag = true; }
    if (PAUSE_KEYS.includes(e.code)) pauseFlag = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && M.state !== 'menu-text') e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; for (const p in virtual) virtual[p] = {}; });

  // ---- toque (controles virtuais) ----
  function bindTouch(root) {
    if (!root) return;
    root.querySelectorAll('[data-act]').forEach(el => {
      const act = el.dataset.act, p = el.dataset.p || 'p1';
      const down = e => { e.preventDefault(); if (!virtual[p][act]) { virtual[p][act] = true; vQueue.push({ p, act }); anyFlag = true; if (act === 'pause') pauseFlag = true; } el.classList.add('on'); };
      const up = e => { e.preventDefault(); virtual[p][act] = false; el.classList.remove('on'); };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
      el.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  // ---- gamepad ----
  function pollPads() {
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    let idx = 0;
    for (const pad of list) {
      if (!pad || !pad.connected) continue;
      const p = idx === 0 ? 'p1' : 'p2'; idx++;
      const b = i => !!(pad.buttons[i] && pad.buttons[i].pressed);
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      const cur = {
        left: ax < -0.5 || b(14), right: ax > 0.5 || b(15), up: ay < -0.5 || b(12), down: ay > 0.5 || b(13),
        light: b(2), heavy: b(3), special: b(1), ginga: b(0), mandinga: b(5) || b(7), taunt: b(4), throw: b(6), pause: b(9)
      };
      const prev = pads[p] || {};
      for (const a in cur) {
        if (cur[a] && !prev[a]) { if (a === 'pause') pauseFlag = true; else vQueue.push({ p, act: a }); anyFlag = true; if (p === 'p1' || !pads.p1) padEdges.push(a); }
      }
      pads[p] = cur;
      if (idx >= 2) break;
    }
    if (idx === 0) { pads.p1 = null; pads.p2 = null; } else if (idx === 1) pads.p2 = null;
  }

  // ---- consolidação por frame ----
  function update() {
    pollPads();
    const now = performance.now();
    for (const p of ['p1', 'p2']) {
      const o = players[p], map = KEYMAP[p], pad = pads[p] || {};
      o.dashLeft = o.dashRight = false;
      for (const a of ACTIONS) {
        const held = map[a].some(c => keys[c]) || !!virtual[p][a] || !!pad[a];
        const pressed = map[a].some(c => queue.includes(c)) || vQueue.some(v => v.p === p && v.act === a);
        o.held[a] = held; o.pressed[a] = pressed;
      }
      for (const d of ['left', 'right']) {
        const tap = o._tap[d];
        if (o.pressed[d]) {
          if (tap.rel && now - tap.t < 260) { if (d === 'left') o.dashLeft = true; else o.dashRight = true; tap.t = -1e9; }
          else tap.t = now;
          tap.rel = false;
        }
        if (!o.held[d]) tap.rel = true;
      }
    }
    queue = []; vQueue = [];
  }

  return {
    update, bindTouch,
    get: p => players[p],
    anyKey() { const f = anyFlag; anyFlag = false; return f; },
    pausePressed() { const f = pauseFlag; pauseFlag = false; return f; },
    clear() { queue = []; vQueue = []; anyFlag = false; pauseFlag = false; },
    isHeld: code => !!keys[code],
    // ---- remapeamento de teclas ----
    capture(cb) { captureCb = cb; },
    cancelCapture() { captureCb = null; },
    takePadEdges() { const e = padEdges; padEdges = []; return e; },
    applyKeys(saved) {
      if (!saved) return;
      for (const p of ['p1', 'p2']) for (const a of ACTIONS) if (saved[p] && Array.isArray(saved[p][a]) && saved[p][a].length) KEYMAP[p][a] = saved[p][a].slice();
    },
    setKey(p, action, code) {
      // se outra ação do mesmo jogador usa a tecla, troca as duas
      let swapped = null;
      for (const a of ACTIONS) if (a !== action && KEYMAP[p][a].includes(code)) { KEYMAP[p][a] = KEYMAP[p][a].filter(c => c !== code); if (!KEYMAP[p][a].length) KEYMAP[p][a] = [KEYMAP[p][action][0]]; swapped = a; }
      KEYMAP[p][action] = [code]; return swapped;
    },
    resetKeys() { for (const p of ['p1', 'p2']) for (const a of ACTIONS) KEYMAP[p][a] = DEFAULT_KEYS[p][a].slice(); },
    ACTIONS,
    hasPad: () => !!pads.p1,
    KEYMAP
  };
})();
