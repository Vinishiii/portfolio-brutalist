'use strict';
// ============================================================
// LOGO — "SERTÃO FIGHT BRASIL" como letreiro de cordel, desenhado em canvas.
//   • letras em arco, gotas de calor (degradê amarelo→brasa), entalhes de xilogravura,
//     brilho de borda, volume em blocos (vermelho e tinta) e borda de adesivo;
//   • faixa verde inclinada com "FIGHT BRASIL" em amarelo e estrelas;
//   • M.logo.draw(g, cx, cy, largura)  — desenha em qualquer canvas (jogo e arte de loja);
//   • M.logo.mount(elemento, opções)   — canvas na interface, com brilho que passa e brasas.
// O bitmap é gerado uma vez e guardado; nada aqui toca em regras do jogo.
// ============================================================
M.logo = (function () {
  const FONT = M.FONT_DISPLAY;
  const WORD = 'SERTÃO', SUB = 'FIGHT BRASIL';
  const cache = {};

  const fontReady = () => { try { return !document.fonts || document.fonts.check('100px "Alfa Slab One"'); } catch (e) { return true; } };
  const loadFont = () => { try { return document.fonts ? document.fonts.load('100px "Alfa Slab One"') : Promise.resolve(); } catch (e) { return Promise.resolve(); } };

  function star(g, x, y, R, r, rot) {
    g.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, d = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    g.closePath();
  }

  // monta o bitmap do logo. res = fator de resolução (1 ≈ 120 px de corpo)
  function build(res, glow) {
    const S = 120 * res;
    const mc = document.createElement('canvas').getContext('2d');
    mc.font = `${S}px ${FONT}`;
    const n = WORD.length, trk = 0.03 * S;
    const adv = [...WORD].map(ch => mc.measureText(ch).width);
    const Wd = adv.reduce((a, b) => a + b, 0) + trk * (n - 1);
    const W = Math.ceil(Wd + S * 1.15), H = Math.ceil(S * 2.8);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.lineJoin = 'round'; g.lineCap = 'round'; g.miterLimit = 2;

    // posição de cada letra: arco suave, leve giro e as do meio um pouco maiores
    const mid = (n - 1) / 2, px = [], py = [], rot = [], sc = [];
    let x = -Wd / 2;
    for (let i = 0; i < n; i++) {
      const k = (i - mid) / mid;
      px.push(x + adv[i] / 2); py.push(k * k * 0.075 * S); rot.push((i - mid) * 0.032); sc.push(1 + 0.075 * (1 - Math.abs(k)));
      x += adv[i] + trk;
    }
    const eachLetter = (fn, dx = 0, dy = 0) => {
      for (let i = 0; i < n; i++) { g.save(); g.translate(dx, dy); g.translate(px[i], py[i]); g.rotate(rot[i]); g.scale(sc[i], sc[i]); fn(WORD[i], i); g.restore(); }
    };
    const setText = () => { g.font = `${S}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; };

    // faixa: medidas
    const fontSub = Math.min(0.47 * S, (Wd * 0.98 - 1.6 * S) / 7.4);
    const lsSub = 0.085 * fontSub;
    mc.font = `${fontSub}px ${FONT}`;
    const subAdv = [...SUB].map(ch => mc.measureText(ch).width + lsSub);
    const subW = subAdv.reduce((a, b) => a + b, 0) - lsSub;
    const Rw = Math.max(subW + 1.5 * S, Wd * 0.9), Rh = 0.56 * S, notch = 0.2 * S;
    const ribbonPath = (w, h, nn) => { g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2 - nn, 0); g.lineTo(w / 2, h / 2); g.lineTo(-w / 2, h / 2); g.lineTo(-w / 2 + nn, 0); g.closePath(); };
    const ribY = 0.3 * S, ribRot = -0.018, ribSkew = -0.15;
    const ribbon = fn => { g.save(); g.translate(0, ribY); g.rotate(ribRot); g.transform(1, 0, ribSkew, 1, 0, 0); fn(); g.restore(); };

    // coroa de chamas (a Brasa) que sobe por trás das letras do meio
    const fx = (px[2] + px[3]) / 2 + 0.02 * S, fBase = -0.62 * S;
    const FL = [[0, 1.08, 0.34], [-0.43, 0.64, 0.2], [0.41, 0.72, 0.21]];
    const flame = (cx, base, h, w) => {
      g.beginPath(); g.moveTo(cx - w, base);
      g.bezierCurveTo(cx - w * 1.3, base - h * 0.42, cx - w * 0.15, base - h * 0.5, cx + w * 0.08, base - h);
      g.bezierCurveTo(cx + w * 0.2, base - h * 0.58, cx + w * 1.35, base - h * 0.46, cx + w, base);
      g.closePath();
    };

    // ---- origem: centro horizontal e linha de base; giro geral para cima à direita ----
    g.translate(W / 2 - 0.1 * S, S * 1.8); g.rotate(-0.035);

    // 0) brilho de brasa atrás
    if (glow) {
      // elipse que chega a zero nas bordas do bitmap (sem corte visível)
      g.save(); g.setTransform(1, 0, 0, H / W, W / 2, H / 2);
      const rg = g.createRadialGradient(0, 0, W * 0.05, 0, 0, W / 2);
      rg.addColorStop(0, 'rgba(255,170,40,0.5)'); rg.addColorStop(0.55, 'rgba(232,60,20,0.2)'); rg.addColorStop(1, 'rgba(232,60,20,0)');
      g.fillStyle = rg; g.fillRect(-W / 2, -W / 2, W, W); g.restore();
    }

    // 1) borda de adesivo (tinta fina por fora, creme por dentro) ao redor de letras, volume e faixa
    const D = 9, stepX = 0.03 * S, stepY = 0.052 * S;
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 0.1 * S; g.shadowOffsetY = 0.07 * S;
    setText(); g.strokeStyle = '#141210'; g.lineWidth = 0.46 * S;
    for (const k of [0, 3, 6, D]) eachLetter(ch => g.strokeText(ch, 0, 0), k * stepX, k * stepY);
    ribbon(() => { ribbonPath(Rw, Rh, notch); g.lineWidth = 0.31 * S; g.strokeStyle = '#141210'; g.stroke(); });
    for (const [dx, hh, ww] of FL) { flame(fx + dx * S, fBase, hh * S, ww * S); g.lineWidth = 0.3 * S; g.stroke(); }
    g.restore();
    setText(); g.strokeStyle = '#f3e6c8'; g.lineWidth = 0.36 * S;
    for (const k of [0, 3, 6, D]) eachLetter(ch => g.strokeText(ch, 0, 0), k * stepX, k * stepY);
    ribbon(() => { ribbonPath(Rw, Rh, notch); g.lineWidth = 0.24 * S; g.strokeStyle = '#f3e6c8'; g.stroke(); });
    g.strokeStyle = '#f3e6c8'; for (const [dx, hh, ww] of FL) { flame(fx + dx * S, fBase, hh * S, ww * S); g.lineWidth = 0.24 * S; g.stroke(); }

    // 1b) chamas: contorno, vermelho, laranja, amarelo e miolo claro
    for (const [dx, hh, ww] of FL) {
      const cx = fx + dx * S;
      flame(cx, fBase, hh * S, ww * S); g.fillStyle = '#c8371d'; g.fill(); g.lineWidth = 0.07 * S; g.strokeStyle = '#141210'; g.stroke();
      flame(cx + 0.01 * S, fBase, hh * S * 0.8, ww * S * 0.72); g.fillStyle = '#f0661c'; g.fill();
      flame(cx + 0.02 * S, fBase, hh * S * 0.56, ww * S * 0.46); g.fillStyle = '#ffc928'; g.fill();
      flame(cx + 0.02 * S, fBase, hh * S * 0.3, ww * S * 0.24); g.fillStyle = '#fff7c9'; g.fill();
    }

    // 2) volume: camadas de trás para frente (tinta no fundo, vermelho perto da face)
    setText(); g.lineWidth = 0.12 * S;
    for (let k = D; k >= 1; k--) {
      const col = k > 5 ? '#141210' : k > 3 ? '#7a1d10' : '#c8371d';
      g.strokeStyle = col; g.fillStyle = col;
      eachLetter(ch => { g.strokeText(ch, 0, 0); g.fillText(ch, 0, 0); }, k * stepX, k * stepY);
    }

    // 3) face das letras: degradê de brasa + entalhes + brilhos, feito em canvas à parte por letra
    const rnd = M.seeded(20260);
    const faces = [...WORD].map(ch => {
      const T = Math.ceil(1.7 * S), t = document.createElement('canvas'); t.width = T; t.height = T;
      const q = t.getContext('2d'), bx = T / 2, by = 1.2 * S;
      q.font = `${S}px ${FONT}`; q.textAlign = 'center'; q.textBaseline = 'alphabetic'; q.lineJoin = 'round';
      const gr = q.createLinearGradient(0, by - 0.78 * S, 0, by + 0.03 * S);
      gr.addColorStop(0, '#fff7c9'); gr.addColorStop(0.3, '#ffd53a'); gr.addColorStop(0.64, '#f68b1e'); gr.addColorStop(1, '#d92f1b');
      q.fillStyle = gr; q.fillText(ch, bx, by);
      q.globalCompositeOperation = 'source-atop';
      // hachura diagonal que escurece para baixo
      const hg = q.createLinearGradient(0, by - 0.78 * S, 0, by + 0.03 * S);
      hg.addColorStop(0, 'rgba(20,18,16,0)'); hg.addColorStop(0.45, 'rgba(20,18,16,0.12)'); hg.addColorStop(1, 'rgba(20,18,16,0.46)');
      q.strokeStyle = hg; q.lineWidth = 0.013 * S;
      for (let o = -1.1 * S; o < 1.1 * S; o += 0.052 * S) { q.beginPath(); q.moveTo(bx + o - 0.32 * S, by + 0.1 * S); q.lineTo(bx + o + 0.32 * S, by - 0.9 * S); q.stroke(); }
      // talhos curtos, como goiva na madeira
      q.strokeStyle = 'rgba(20,18,16,0.28)'; q.lineWidth = 0.018 * S;
      for (let i = 0; i < 6; i++) { const cx = bx + (rnd() - 0.5) * 0.7 * S, cy = by - rnd() * 0.7 * S, a = -1.25 + rnd() * 0.5, L = (0.05 + rnd() * 0.07) * S; q.beginPath(); q.moveTo(cx, cy); q.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); q.stroke(); }
      // luz na borda de cima/esquerda e sombra na de baixo/direita
      q.lineWidth = 0.03 * S;
      q.save(); q.translate(0.034 * S, 0.038 * S); q.strokeStyle = 'rgba(255,252,230,0.5)'; q.strokeText(ch, bx, by); q.restore();
      q.save(); q.translate(-0.034 * S, -0.038 * S); q.strokeStyle = 'rgba(120,24,10,0.42)'; q.strokeText(ch, bx, by); q.restore();
      return { t, bx, by };
    });
    setText(); g.strokeStyle = '#141210'; g.lineWidth = 0.11 * S;
    eachLetter((ch, i) => { g.strokeText(ch, 0, 0); g.fillStyle = '#141210'; g.fillText(ch, 0, 0); const f = faces[i]; g.drawImage(f.t, -f.bx, -f.by); });
    // 4) faixa "FIGHT BRASIL"
    ribbon(() => {
      ribbonPath(Rw, Rh, notch);
      g.save(); g.translate(0.035 * S, 0.055 * S); ribbonPath(Rw, Rh, notch); g.fillStyle = '#141210'; g.fill(); g.restore();
      ribbonPath(Rw, Rh, notch);
      const rg = g.createLinearGradient(0, -Rh / 2, 0, Rh / 2);
      rg.addColorStop(0, '#34b56d'); rg.addColorStop(0.5, '#1f7a4d'); rg.addColorStop(1, '#0f4a2d');
      g.fillStyle = rg; g.fill();
      g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(-Rw, -Rh / 2, Rw * 2, Rh * 0.3); g.restore();
      g.lineWidth = 0.075 * S; g.strokeStyle = '#141210'; g.stroke();
      ribbonPath(Rw - 0.17 * S, Rh - 0.17 * S, notch * 0.85); g.lineWidth = 0.02 * S; g.strokeStyle = 'rgba(255,214,70,0.85)'; g.stroke();
      // texto
      g.font = `${fontSub}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const base = fontSub * 0.36;
      let tx = -subW / 2;
      const yg = g.createLinearGradient(0, -fontSub * 0.5, 0, base);
      yg.addColorStop(0, '#fff2a8'); yg.addColorStop(0.5, '#ffc928'); yg.addColorStop(1, '#f08a1c');
      for (let i = 0; i < SUB.length; i++) {
        const cx = tx + (subAdv[i] - lsSub) / 2; tx += subAdv[i];
        if (SUB[i] === ' ') continue;
        g.lineWidth = 0.17 * fontSub; g.strokeStyle = '#141210';
        g.fillStyle = '#141210'; g.strokeText(SUB[i], cx + 0.05 * fontSub, base + 0.07 * fontSub); g.fillText(SUB[i], cx + 0.05 * fontSub, base + 0.07 * fontSub);
        g.strokeText(SUB[i], cx, base); g.fillStyle = yg; g.fillText(SUB[i], cx, base);
      }
      // estrelas nas pontas
      for (const sx of [-1, 1]) { const xx = sx * (Rw / 2 - notch - 0.2 * S); star(g, xx, 0, 0.115 * S, 0.05 * S, -Math.PI / 2); g.fillStyle = '#ffd53a'; g.fill(); g.lineWidth = 0.035 * S; g.strokeStyle = '#141210'; g.stroke(); }
    });

    return { c, w: W, h: H, S, Wd };
  }

  function get(o = {}) {
    const res = o.res || 1.5, glow = !!o.glow, key = res + '|' + glow;
    if (cache[key]) return cache[key];
    const b = build(res, glow);
    if (fontReady()) cache[key] = b;
    return b;
  }

  // desenha centrado em (cx, cy), com a largura dada (em px do canvas de destino)
  function draw(g, cx, cy, w, o = {}) {
    const res = o.res || Math.max(1, Math.min(3, w / 520));
    const b = get({ res, glow: o.glow });
    const h = w * b.h / b.w;
    g.save(); if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    g.imageSmoothingQuality = 'high'; g.drawImage(b.c, cx - w / 2, cy - h / 2, w, h);
    g.restore();
    return h;
  }

  // canvas dentro de um elemento da interface; animate: brilho que passa + brasas subindo
  function mount(el, o = {}) {
    if (!el) return null;
    const width = o.width || 600;
    const cv = document.createElement('canvas'); cv.className = 'logo-art'; cv.setAttribute('aria-hidden', 'true');
    el.innerHTML = ''; el.appendChild(cv);
    const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || (M.store && M.store.data && M.store.data.settings.quality === 'low');
    const animate = !!o.animate && !reduced;
    let bmp = null, cw = 0, ch = 0, alive = true;
    const size = () => {
      bmp = get({ res: Math.min(3, Math.max(1.4, width / 300)), glow: !!o.glow });
      cw = Math.min(bmp.w, Math.round(width * 2)); ch = Math.round(cw * bmp.h / bmp.w);
      cv.width = cw; cv.height = ch; cv.style.width = width + 'px'; cv.style.height = Math.round(width * bmp.h / bmp.w) + 'px';
    };
    const paint = () => { const g = cv.getContext('2d'); g.clearRect(0, 0, cw, ch); g.imageSmoothingQuality = 'high'; g.drawImage(bmp.c, 0, 0, cw, ch); return g; };
    size(); paint();
    if (!fontReady()) loadFont().then(() => { if (alive && cv.isConnected !== false) { Object.keys(cache).forEach(k => delete cache[k]); size(); paint(); } });
    if (!animate) return { stop() { alive = false; } };

    const sparks = []; let last = 0, t0 = performance.now(), acc = 0;
    const COL = ['#ffd53a', '#f68b1e', '#fff7c9', '#ff5a2a'];
    function frame(now) {
      if (!alive || !cv.isConnected) { alive = false; return; }
      requestAnimationFrame(frame);
      if (now - last < 38) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const g = paint(), k = cw / 600;
      // brilho diagonal que atravessa as letras a cada ~5 s
      const ph = ((now - t0) % 5200) / 5200;
      if (ph < 0.2) {
        const bx = M.lerp(-0.25, 1.15, ph / 0.2) * cw;
        const gr = g.createLinearGradient(bx - 0.09 * cw, 0, bx + 0.09 * cw, 0.35 * ch);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr; g.fillRect(0, 0, cw, ch); g.restore();
      }
      // brasas subindo das letras
      acc += dt * 16;
      while (acc >= 1) { acc -= 1; sparks.push({ x: (0.14 + Math.random() * 0.72) * cw, y: (0.3 + Math.random() * 0.14) * ch, vx: (Math.random() - 0.5) * 22 * k, vy: -(26 + Math.random() * 46) * k, life: 0, max: 1.1 + Math.random() * 1.5, r: (1.1 + Math.random() * 2.4) * k, c: COL[(Math.random() * COL.length) | 0], ph: Math.random() * 6.28 }); }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life += dt; if (s.life >= s.max) { sparks.splice(i, 1); continue; }
        s.x += (s.vx + Math.sin(s.life * 5 + s.ph) * 12 * k) * dt; s.y += s.vy * dt;
        const a = 1 - s.life / s.max;
        g.globalAlpha = a * 0.28; g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, s.r * 2.4, 0, 6.2832); g.fill();
        g.globalAlpha = a; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.2832); g.fill();
      }
      g.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
    return { stop() { alive = false; } };
  }

  return { get, draw, mount, build };
})();
