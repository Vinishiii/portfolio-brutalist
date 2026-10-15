'use strict';
// ============================================================
// TOUCH — alavanca de fliperama e painel de botões para celular.
//  • Alavanca giratória de 8 direções: a bola acompanha o dedo e a haste inclina de verdade; a leitura é analógica
//    (zona morta + histerese) e vira as mesmas quatro direções do teclado (esquerda, direita, cima = pular, baixo = agachar),
//    então diagonais, golpes direcionais, dash por toque duplo, super pulo e pulo na parede funcionam como no computador.
//  • Fixa (como no gabinete) ou flutuante (a base nasce onde o polegar toca); tamanho e lado ajustáveis nas opções.
//  • Tudo é só entrada: a simulação não sabe se o golpe veio do teclado, do controle ou da tela.
// ============================================================
M.touch = (function () {
  const T = { dir: { left: false, right: false, up: false, down: false } };
  let root, area, stick, cv, g, dpr = 1, size = 230;
  let pid = null, ox = 0, oy = 0;                 // dedo que segura a alavanca e o centro da base
  let vx = 0, vy = 0;                             // posição alvo da bola (−1…1 do curso)
  let cx = 0, cy = 0;                             // posição desenhada (mola)
  let raf = 0, visible = false, floating = false;
  const D8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // cima, cima-direita, …

  // ---------- leitura da alavanca ----------
  // Curso total = 0.27 do tamanho da base. Entra em ação com 34% do curso e só solta abaixo de 22% (evita tremida na borda).
  // Cima exige mais inclinação (>30° da horizontal) para andar não virar pulo sem querer; baixo e os lados são mais fáceis.
  function decode(x, y, cur) {
    const m = Math.hypot(x, y), any = cur.left || cur.right || cur.up || cur.down;
    if (m < (any ? 0.22 : 0.34)) return { left: false, right: false, up: false, down: false };
    const ax = Math.abs(x) / m, ay = Math.abs(y) / m;
    const hx = cur.left || cur.right ? 0.34 : 0.40, up = cur.up ? 0.42 : 0.50, dn = cur.down ? 0.34 : 0.40;
    return { left: x < 0 && ax >= hx, right: x > 0 && ax >= hx, up: y < 0 && ay >= up, down: y > 0 && ay >= dn };
  }
  function apply(next) {
    const cur = T.dir; let changed = false;
    for (const d of ['left', 'right', 'up', 'down']) {
      if (next[d] !== cur[d]) { changed = true; cur[d] = next[d]; if (!root.classList.contains('preview')) M.input.vSet('p1', d, next[d]); }
    }
    if (changed && (next.left || next.right || next.up || next.down) && M.native && M.native.haptic) M.native.haptic('light');
  }
  function geometry() { const r = stick.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, R: r.width * 0.27 }; }

  // ---------- eventos ----------
  function onDown(e) {
    if (pid !== null) return;
    e.preventDefault(); pid = e.pointerId;
    try { area.setPointerCapture(pid); } catch (err) { /* ignora */ }
    if (floating) {
      // a base nasce sob o polegar, sem sair da tela
      const r = stick.getBoundingClientRect(), half = r.width / 2, pad = 6;
      const x = Math.max(half + pad, Math.min(window.innerWidth - half - pad, e.clientX)), y = Math.max(half + pad, Math.min(window.innerHeight - half - pad, e.clientY));
      stick.style.left = (x - half) + 'px'; stick.style.top = (y - half) + 'px'; stick.style.right = stick.style.bottom = 'auto';
      stick.classList.add('float-on'); ox = x; oy = y;
    } else { const c = geometry(); ox = c.x; oy = c.y; }
    onMove(e);
  }
  function onMove(e) {
    if (e.pointerId !== pid) return;
    e.preventDefault();
    const R = stick.getBoundingClientRect().width * 0.27;
    let x = (e.clientX - ox) / R, y = (e.clientY - oy) / R; const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    vx = x; vy = y; apply(decode(x, y, T.dir)); kick();
  }
  function onUp(e) {
    if (e.pointerId !== pid) return;
    e.preventDefault(); pid = null; vx = vy = 0;
    try { area.releasePointerCapture(e.pointerId); } catch (err) { /* ignora */ }
    apply({ left: false, right: false, up: false, down: false });
    if (floating) { stick.classList.remove('float-on'); stick.style.left = stick.style.top = stick.style.right = stick.style.bottom = ''; }
    kick();
  }

  // ---------- desenho ----------
  const C = { ink: '#141210', paper: '#f3e6c8', yellow: '#f2b70c', red: '#c8371d' };
  function fitCanvas() {
    const r = stick.getBoundingClientRect(); size = Math.max(60, r.width || 230);
    dpr = Math.min(3, window.devicePixelRatio || 1);
    const px = Math.round(size * dpr); if (cv.width !== px) { cv.width = px; cv.height = px; }
  }
  function draw() {
    const S = cv.width / 230; g.setTransform(S, 0, 0, S, 0, 0); g.clearRect(0, 0, 230, 230);
    const c = 115, on = T.dir, act = on.left || on.right || on.up || on.down;
    // sombra e chapa
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(c, c + 6, 106, 0, 6.3); g.fill();
    let gr = g.createRadialGradient(c - 30, c - 36, 10, c, c, 108); gr.addColorStop(0, 'rgba(70,64,58,.92)'); gr.addColorStop(1, 'rgba(24,22,20,.92)');
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, 104, 0, 6.3); g.fill();
    g.lineWidth = 4; g.strokeStyle = 'rgba(243,230,200,.55)'; g.stroke();
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(c, c, 98, 0, 6.3); g.stroke();
    // parafusos
    g.fillStyle = 'rgba(243,230,200,.4)'; for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; g.beginPath(); g.arc(c + Math.cos(a) * 88, c + Math.sin(a) * 88, 3.2, 0, 6.3); g.fill(); }
    // portinhola octogonal (limite do curso) com as 8 direções
    const GR = 66;
    g.lineWidth = 7; g.strokeStyle = 'rgba(8,6,6,.85)'; g.beginPath();
    D8.forEach((d, i) => { const k = (i & 1) ? 0.7071 : 1; const x = c + d[0] * k * GR, y = c + d[1] * k * GR; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.stroke();
    g.lineWidth = 2; g.strokeStyle = act ? 'rgba(242,183,12,.85)' : 'rgba(243,230,200,.4)'; g.stroke();
    const sdx = (on.right ? 1 : 0) - (on.left ? 1 : 0), sdy = (on.down ? 1 : 0) - (on.up ? 1 : 0);   // a direção de 8 vias em uso
    D8.forEach(d => {
      const k = (d[0] && d[1]) ? 0.7071 : 1, x = c + d[0] * k * GR, y = c + d[1] * k * GR, isOn = act && d[0] === sdx && d[1] === sdy;
      g.fillStyle = isOn ? C.yellow : 'rgba(243,230,200,.55)'; g.beginPath(); g.arc(x, y, isOn ? 6 : 3.4, 0, 6.3); g.fill();
      if (isOn) { g.strokeStyle = 'rgba(255,240,170,.9)'; g.lineWidth = 2; g.stroke(); }
    });
    // setinhas de referência (esquerda, direita, cima, baixo) fora do octógono
    g.fillStyle = 'rgba(243,230,200,.5)';
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(d => {
      const x = c + d[0] * 90, y = c + d[1] * 90; g.save(); g.translate(x, y); g.rotate(Math.atan2(d[1], d[0])); g.beginPath(); g.moveTo(7, 0); g.lineTo(-4, -6); g.lineTo(-4, 6); g.closePath(); g.fill(); g.restore();
    });
    // fole de borracha no pivô
    gr = g.createRadialGradient(c - 6, c - 8, 2, c, c, 24); gr.addColorStop(0, '#3a342e'); gr.addColorStop(1, '#0c0a0a');
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, 24, 0, 6.3); g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(243,230,200,.25)'; g.stroke();

    // alavanca: a bola vai até o curso (com "ímã" para a direção de 8 vias quando ativa) e a haste inclina
    const trav = 56, tx = cx * trav, ty = cy * trav, mag = Math.hypot(cx, cy);
    const bx = c + tx, by = c + ty - 10 * (1 - Math.min(1, mag));   // parada, a bola fica um pouco acima do pivô
    // sombra projetada pela bola
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(bx - tx * 0.18 + 5, by + 24, 27, 15, 0, 0, 6.3); g.fill();
    // haste
    if (mag > 0.04) {
      const ang = Math.atan2(by - c, bx - c), len = Math.hypot(bx - c, by - c);
      g.save(); g.translate(c, c); g.rotate(ang);
      const sg = g.createLinearGradient(0, -7, 0, 7); sg.addColorStop(0, '#f7f7f7'); sg.addColorStop(0.45, '#aeb0b4'); sg.addColorStop(1, '#4e5054');
      g.fillStyle = sg; g.beginPath(); g.moveTo(0, -8); g.lineTo(len, -6); g.lineTo(len, 6); g.lineTo(0, 8); g.closePath(); g.fill();
      g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke(); g.restore();
    }
    // bola
    const sc = 1 + cy * 0.07, rb = 31 * sc;
    gr = g.createRadialGradient(bx - rb * 0.38, by - rb * 0.42, rb * 0.08, bx, by, rb);
    gr.addColorStop(0, '#ff8a6a'); gr.addColorStop(0.22, '#e8412a'); gr.addColorStop(0.7, '#a82212'); gr.addColorStop(1, '#5c0f08');
    g.fillStyle = gr; g.beginPath(); g.arc(bx, by, rb, 0, 6.3); g.fill();
    g.lineWidth = 3; g.strokeStyle = act ? 'rgba(255,225,120,.95)' : 'rgba(20,10,8,.8)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(bx - rb * 0.34, by - rb * 0.42, rb * 0.26, rb * 0.15, -0.6, 0, 6.3); g.fill();
  }
  // mola: a bola segue o dedo (com um "ímã" para a direção de 8 vias, como a portinhola do gabinete); solta, volta ao centro com um leve balanço
  let sx = 0, sy = 0;
  function step() {
    raf = 0; if (!visible) return;
    if (pid !== null) {
      const m = Math.min(1, Math.hypot(vx, vy)), dx = (T.dir.right ? 1 : 0) - (T.dir.left ? 1 : 0), dy = (T.dir.down ? 1 : 0) - (T.dir.up ? 1 : 0), dl = Math.hypot(dx, dy);
      const tx = dl ? vx * 0.5 + (dx / dl) * m * 0.5 : vx, ty = dl ? vy * 0.5 + (dy / dl) * m * 0.5 : vy;
      cx += (tx - cx) * 0.65; cy += (ty - cy) * 0.65; sx = sy = 0;
    } else { sx += -cx * 0.26; sy += -cy * 0.26; sx *= 0.72; sy *= 0.72; cx += sx; cy += sy; }
    draw();
    const moving = pid !== null || Math.abs(cx) > 0.004 || Math.abs(cy) > 0.004 || Math.abs(sx) > 0.004 || Math.abs(sy) > 0.004;
    if (moving) raf = requestAnimationFrame(step); else { cx = cy = sx = sy = 0; draw(); }
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(step); }

  // ---------- escala, lado e modo (opções) ----------
  const SIZES = { p: 0.86, m: 1, g: 1.2 };
  function layout() {
    if (!root) return;
    const s = M.store.data.settings, vw = window.innerWidth, vh = window.innerHeight;
    // o painel foi desenhado para 390 px de altura; cresce e encolhe com a tela sem engolir o meio
    // telas mais "quadradas" (16:9, tablets) não têm margem preta nas laterais: o painel encolhe para não cobrir os lutadores
    const aspect = vw / vh, asp = Math.max(0.78, Math.min(1, 0.78 + (aspect - 1.7) * 0.5));
    let k = Math.max(0.7, Math.min(1.3, vh / 390)) * asp * (SIZES[s.tsize] || 1);
    k = Math.min(k, Math.max(0.6, (vw - 150) / 506));
    root.style.setProperty('--k', k.toFixed(3));
    root.classList.toggle('rev', s.thand === 'right');
    floating = s.stick === 'float';
    root.classList.toggle('float', floating);
    if (visible) { fitCanvas(); kick(); draw(); }
  }

  T.init = function () {
    root = document.getElementById('touch'); area = document.getElementById('stickArea'); stick = document.getElementById('stick');
    if (!root || !area || !stick) return;
    cv = stick.querySelector('canvas'); g = cv.getContext('2d');
    area.addEventListener('pointerdown', onDown); area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerup', onUp); area.addEventListener('pointercancel', onUp); area.addEventListener('lostpointercapture', onUp);
    area.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('resize', () => setTimeout(layout, 30)); window.addEventListener('orientationchange', () => setTimeout(layout, 200));
    layout();
  };
  // chamado quando o painel aparece ou some
  T.sync = function (on) {
    visible = !!on; if (!root) return;
    layout();
    if (!visible) T.reset(); else { fitCanvas(); draw(); }
  };
  T.layout = layout;
  // solta tudo: alavanca no centro e nenhum botão preso (fim da luta, pausa, app em segundo plano)
  T.reset = function () {
    pid = null; vx = vy = 0;
    if (!root) return;
    for (const d of ['left', 'right', 'up', 'down']) T.dir[d] = false;
    if (floating && stick) { stick.classList.remove('float-on'); stick.style.left = stick.style.top = stick.style.right = stick.style.bottom = ''; }
    if (M.input && M.input.resetVirtual) M.input.resetVirtual();
    cx = cy = sx = sy = 0; if (visible && g) draw();
  };
  // para testes: estado da alavanca
  T.state = () => ({ x: vx, y: vy, dir: Object.assign({}, T.dir), floating });
  return T;
})();
