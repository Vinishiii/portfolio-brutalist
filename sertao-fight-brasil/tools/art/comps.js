'use strict';
// ============================================================
// Composições do kit de arte (roda na página do jogo, depois de kit_page.js). Cada função devolve um canvas.
// Só entram elementos REAIS do jogo: cenários, lutadores, projéteis, logo e capturas de tela do próprio motor.
// ============================================================
(function () {
  const { W, H, GR } = KIT, C = KIT.comp = {};
  const px = (v, base) => (Math.abs(v) <= 1.5 && v !== 0 ? v * base : v);   // frações (<=1.5) viram pixels

  // ---------- camadas de texto / logo (coordenadas em fração do canvas) ----------
  function layer(g, w, h, L) {
    const X = L.x * w, Y = L.y * h;
    switch (L.t) {
      case 'logo': KIT.logo(g, X, Y, L.w * w, L); break;
      case 'title': KIT.title(g, L.text, X, Y, L.size * h, L); break;
      case 'label': KIT.label(g, L.text, X, Y, L.size * h, L); break;
      case 'stamp': KIT.stamp(g, L.text, X, Y, L.size * h, L); break;
      case 'fade': KIT.fade(g, w, h, L.edge, L.a, L.color, L.len); break;
      case 'glow': KIT.glow(g, X, Y, L.r * w, L.color, L.a, L.mode); break;
      case 'rays': KIT.rays(g, X, Y, L.r * w, L); break;
      case 'embers': KIT.embers(g, w, h, L.n, L.seed, L.colors || ['#ffd890', '#ff9a3c', '#fff8e8'], L.size || 1, L); break;
    }
  }
  C.layer = layer;

  // ---------- cena genérica: cenário real + lutadores reais + logo ----------
  C.scene = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    const cam = KIT.camera(w, h, o.cam || {});
    const st = KIT.drawStage(g, cam, o.stage || 'ladeira', { crowd: o.crowd !== false, t: o.t, excite: o.excite });
    for (const L of o.under || []) layer(g, w, h, L);
    const list = (o.fighters || []).slice().sort((a, b) => (a.y ?? GR) - (b.y ?? GR));
    for (const f of list) KIT.fighter(g, cam, f.id, Object.assign({ pose: (KIT.HERO[f.id] || {}).pose, proj: (KIT.HERO[f.id] || {}).proj, glow: o.glow === undefined ? '#ffd890' : o.glow }, f));
    if (o.front) KIT.drawFront(g, cam, st);
    if (o.vig !== 0) KIT.vignette(g, w, h, o.vig ?? 0.42);
    if (o.bloom !== 0) KIT.bloom(g, w, h, { alpha: o.bloom ?? 0.2 });
    for (const L of o.layers || []) layer(g, w, h, L);
    if (o.grain) KIT.grain(g, w, h, o.grain);
    return c;
  };

  // ---------- logo transparente ----------
  C.logoFit = (maxW, maxH) => { const src = KIT.logoCanvas(4); const k = Math.min(maxW / src.width, maxH / src.height); const o = KIT.canvas(Math.round(src.width * k), Math.round(src.height * k)); const g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, o.width, o.height); return o; };


  // captura real do jogo, sem retoque, na dimensão pedida
  C.raw = (w, h, o) => { const c = KIT.canvas(w, h), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(o.raw, 0, 0, w, h); return c; };
  // logo com fundo transparente, ajustado a uma caixa
  C.logoBox = (w, h) => C.logoFit(w, h);

  // ---------- ícone do aplicativo (mestre da casa: chama + SFB), em quadrado cheio ----------
  C.icon = (n, o = {}) => {
    const c = KIT.canvas(n, n), g = c.getContext('2d'), u = n / 100;
    const bg = g.createRadialGradient(50 * u, 62 * u, 4 * u, 50 * u, 56 * u, 70 * u); bg.addColorStop(0, '#5a2a6b'); bg.addColorStop(0.55, '#2a1830'); bg.addColorStop(1, '#141210'); g.fillStyle = bg;
    if (o.bgOnly) { g.fillRect(0, 0, n, n); return c; }
    if (!o.noBg) { if (o.round) { g.beginPath(); g.roundRect(0, 0, n, n, 20 * u); g.fill(); } else g.fillRect(0, 0, n, n); }
    g.save(); if (o.scale) { g.translate(n / 2, n / 2); g.scale(o.scale, o.scale); g.translate(-n / 2, -n / 2); }   // ícone adaptativo do Android: arte dentro da zona segura
    const fl = (cx, base, hh, ww, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx - ww, base); g.quadraticCurveTo(cx - ww * 1.1, base - hh * 0.5, cx + ww * 0.1, base - hh); g.quadraticCurveTo(cx + ww * 0.5, base - hh * 0.55, cx + ww, base); g.closePath(); g.fill(); };
    fl(50 * u, 62 * u, 54 * u, 25 * u, '#c8371d'); fl(50 * u, 62 * u, 44 * u, 19 * u, '#e8712b'); fl(50 * u, 62 * u, 31 * u, 12 * u, '#f2b70c'); fl(50 * u, 62 * u, 18 * u, 6.5 * u, '#fff8e8');
    g.save(); g.font = `${31 * u}px ${M.FONT_DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; const ty = 76 * u;
    g.strokeStyle = '#141210'; g.lineWidth = 13 * u; g.strokeText('SFB', 50 * u, ty); g.strokeStyle = '#f3e6c8'; g.lineWidth = 9.5 * u; g.strokeText('SFB', 50 * u, ty);
    for (let k = 6; k >= 1; k--) { g.strokeStyle = g.fillStyle = k > 3 ? '#141210' : '#c8371d'; g.lineWidth = 4.4 * u; g.strokeText('SFB', 50 * u + k * u * 0.7, ty + k * u * 1.1); g.fillText('SFB', 50 * u + k * u * 0.7, ty + k * u * 1.1); }
    g.strokeStyle = '#141210'; g.lineWidth = 4 * u; g.strokeText('SFB', 50 * u, ty);
    const tg = g.createLinearGradient(0, ty - 24 * u, 0, ty); tg.addColorStop(0, '#fff7c9'); tg.addColorStop(0.35, '#ffd53a'); tg.addColorStop(0.75, '#f68b1e'); tg.addColorStop(1, '#d92f1b'); g.fillStyle = tg; g.fillText('SFB', 50 * u, ty); g.restore();
    g.restore();
    if (o.border !== false) { g.strokeStyle = '#141210'; g.lineWidth = 3 * u; if (o.round) { g.beginPath(); g.roundRect(1.5 * u, 1.5 * u, n - 3 * u, n - 3 * u, 19 * u); g.stroke(); } }
    return c;
  };

  C.iconSq = (w, h, o) => C.icon(w, o);

  // ---------- painel de loja: captura REAL do jogo emoldurada sobre cenário real, com manchete ----------
  // o: { raw: <Image>, stage, head: 'MANCHETE', sub: 'linha menor', side: 'left'|'top', logo: bool, fighters: [...] }
  C.panel = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    const cam = KIT.camera(w, h, o.cam || { zoom: 1.15, fx: 480, fy: 300 });
    KIT.drawStage(g, cam, o.stage || 'ladeira', { crowd: false, t: 90 });
    g.fillStyle = 'rgba(14,8,22,0.42)'; g.fillRect(0, 0, w, h);
    KIT.glow(g, w * 0.7, h * 0.55, w * 0.6, o.glowColor || '#ff9a3c', 0.28);
    KIT.rays(g, w * (o.rayX ?? 0.72), h * 0.5, w * 0.9, { n: 20, alpha: 0.12, color: '#ffe3a0', rot: 0.1 });
    for (const f of o.fighters || []) KIT.fighter(g, KIT.camera(w, h, f.cam || { zoom: 1.0, fx: 480, fy: 300 }), f.id, Object.assign({ pose: KIT.HERO[f.id].pose, proj: KIT.HERO[f.id].proj, glow: '#ffd890' }, f));
    KIT.vignette(g, w, h, 0.5);
    const img = o.raw; const L = o.layout;
    // layout: retângulo da captura e posição da manchete (frações)
    const fw = L.fw * w, fh = fw * img.height / img.width, fx = L.fx * w, fy = L.fy * h;
    KIT.frame(g, img, fx, fy, fw, fh, { radius: fw * 0.012, border: Math.max(5, w * 0.004) });
    // manchete
    const hs = L.hs * h, hx = L.hx * w, hy = L.hy * h, maxW = (L.hw || 0.5) * w;
    const lines = KIT.wrap(g, o.head, hs, maxW, M.FONT_DISPLAY, 0);
    lines.forEach((ln, i) => KIT.title(g, ln, hx, hy + i * hs * 1.08, hs, { align: L.align || 'left', shadow: 0.06 }));
    if (o.sub) { const sy = hy + lines.length * hs * 1.08 + (L.subGap ?? 0.35) * hs; const sl = KIT.wrap(g, o.sub, L.ss * h, maxW, M.FONT_TEXT, 0); sl.forEach((ln, i) => KIT.label(g, ln, hx, sy + i * L.ss * h * 1.25, L.ss * h, { font: M.FONT_TEXT, align: L.align || 'left', sw: 0.22 })); }
    if (o.logo) KIT.logo(g, o.logo.x * w, o.logo.y * h, o.logo.w * w);
    return c;
  };
})();
