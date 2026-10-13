'use strict';
// ============================================================
// Composições de lojas móveis e Instagram (roda na página do jogo, depois de comps.js).
// Capturas e personagens são REAIS; aqui só entram enquadramento, luz e texto.
// ============================================================
(function () {
  const { W, H, GR } = KIT, C = KIT.comp;
  const INKC = '#141210', CREAM = '#fff8e8', YEL = '#f2b70c';
  const T = s => M.tr(s);

  // título que encolhe até caber (uma linha) ou quebra em duas
  function fitTitle(g, str, x, y, maxW, size, o = {}) {
    let s = size; while (s > size * 0.45 && KIT.measure(g, str, s) > maxW) s -= 2;
    if (KIT.measure(g, str, s) <= maxW) { KIT.title(g, str, x, y, s, o); return { lines: 1, size: s }; }
    let ls = size * 0.82, lines = KIT.wrap(g, str, ls, maxW); while (lines.length > 2 && ls > size * 0.4) { ls -= 2; lines = KIT.wrap(g, str, ls, maxW); }
    lines.forEach((ln, i) => KIT.title(g, ln, x, y + i * ls * 0.86, ls, o)); return { lines: lines.length, size: ls };
  }
  C.fitTitle = fitTitle;

  function backdrop(g, w, h, stage, o = {}) {
    const cam = KIT.camera(w, h, o.cam || { zoom: 1.2, fx: 480, fy: 300 });
    KIT.drawStage(g, cam, stage || 'ladeira', { crowd: false, t: 90 });
    g.fillStyle = `rgba(14,8,22,${o.dim ?? 0.46})`; g.fillRect(0, 0, w, h);
    KIT.glow(g, w * 0.7, h * 0.55, Math.max(w, h) * 0.6, o.glowColor || '#ff9a3c', 0.26);
    KIT.rays(g, w * (o.rayX ?? 0.7), h * 0.5, Math.max(w, h) * 0.9, { n: 20, alpha: 0.11, color: '#ffe3a0', rot: 0.1 });
    KIT.embers(g, w, h, o.embers ?? 36, o.seed || 4, ['#ffd890', '#ff9a3c', '#fff8e8'], Math.max(1, w / 1400));
    return cam;
  }

  // ---------- painel de loja móvel / tablet: captura real emoldurada + manchete ----------
  // o: { raw, stage, head, sub, band, logo:true }. A manchete é medida primeiro; a moldura ocupa o espaço que sobrar.
  C.panel2 = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    backdrop(g, w, h, o.stage, o); KIT.vignette(g, w, h, 0.45);
    const img = o.raw, ratio = img.width / img.height, m = h * 0.035, padX = w * 0.05;
    const logoW = o.logo === false ? 0 : w * (o.logoW ?? 0.17), maxW = w - padX * 2 - logoW - w * 0.02;
    // tamanho da manchete: o maior (até base) que cabe em no máximo 2 linhas e na altura reservada
    const base = h * (o.band ?? 0.24) * 0.5, maxH = h * (o.band ?? 0.24) * 0.62; let hs = base, lines = [o.head];
    for (; hs > base * 0.4; hs -= 2) { lines = KIT.wrap(g, o.head, hs, maxW); if (lines.length <= 2 && lines.length * hs * 0.9 <= maxH) break; }
    lines = KIT.wrap(g, o.head, hs, maxW);
    lines.forEach((ln, i) => KIT.title(g, ln, padX, m + hs * 0.85 + i * hs * 0.9, hs, { align: 'left', shadow: 0.06 }));
    let ty = m + hs * 0.85 + (lines.length - 1) * hs * 0.9;
    if (o.sub) { let ss = Math.min(hs * 0.36, h * 0.034); const sl = KIT.wrap(g, o.sub, ss, maxW, M.FONT_TEXT); sl.forEach((ln, i) => KIT.label(g, ln, padX + hs * 0.04, ty + ss * 1.5 + i * ss * 1.3, ss, { font: M.FONT_TEXT, align: 'left', sw: 0.22 })); ty += ss * 1.5 + (sl.length - 1) * ss * 1.3 + ss * 0.3; }
    if (o.logo !== false) KIT.logo(g, w - padX - logoW / 2, m + (ty - m) / 2 + hs * 0.05, logoW);
    const fy0 = ty + m * 0.9, availH = h - fy0 - m; let fh = availH, fw = fh * ratio; if (fw > w * 0.94) { fw = w * 0.94; fh = fw / ratio; }
    KIT.frame(g, img, (w - fw) / 2, fy0 + (availH - fh) / 2, fw, fh, { radius: fw * 0.014, border: Math.max(5, w * 0.0038) });
    KIT.grain(g, w, h, 0.03);
    return c;
  };

  // ---------- gráfico de destaque (Google Play 1024x500) ----------
  C.feature = (w, h, o) => C.scene(w, h, o);

  // ---------- carta do lutador (Instagram 1080x1350) ----------
  C.card = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d'); const id = o.id, def = M.FIGHTERS[id];
    const k0 = Math.max(w / W, h / H), zoom = (o.k || 3.4) / k0;
    const cam = KIT.camera(w, h, { zoom, fx: 480, fy: GR, ax: 0.5, ay: o.ground ?? 0.585 });
    const st = KIT.drawStage(g, cam, o.stage, { crowd: false, t: 100 });
    g.fillStyle = 'rgba(14,8,22,0.18)'; g.fillRect(0, 0, w, h);
    KIT.rays(g, w * 0.5, h * 0.5, h * 0.9, { n: 20, alpha: 0.14, color: '#ffe3a0' });
    const hero = KIT.HERO[id] || {};
    KIT.fighter(g, cam, id, { x: 480, y: GR, facing: 1, s: o.s || 1.12, pose: hero.pose, proj: hero.proj, glow: o.glow || '#ffd890' });
    KIT.vignette(g, w, h, 0.5); KIT.fade(g, w, h, 'bottom', 0.9, '10,6,14', 0.5); KIT.fade(g, w, h, 'top', 0.45, '10,6,14', 0.2);
    KIT.embers(g, w, h, 40, id.length * 7, ['#ffd890', '#ff9a3c', '#fff8e8'], 2.2, { y0: 0.2, span: 0.6 });
    const pad = w * 0.06;
    // topo
    KIT.stamp(g, `${T('LUTADOR')} ${String(o.index).padStart(2, '0')} / ${o.total}`, pad, h * 0.075, h * 0.03, { rot: -0.03 });
    KIT.logo(g, w - pad - w * 0.13, h * 0.058, w * 0.26);
    // nome + dados
    const nm = T(def.name); let y = h * 0.775;
    const r = fitTitle(g, nm.toUpperCase(), pad, y, w - pad * 2, h * 0.085, { align: 'left' }); y += (r.lines > 1 ? r.size * 0.86 : 0);
    y += h * 0.036; KIT.label(g, T(def.alias), pad, y, h * 0.03, { font: M.FONT_TEXT, fill: '#f2d34a', sw: 0.24 });
    y += h * 0.034; KIT.label(g, `${T(def.origin)}  •  ${T(def.style)}`, pad, y, h * 0.0235, { font: M.FONT_TEXT, fill: CREAM, sw: 0.24 });
    y += h * 0.046; const ql = KIT.wrap(g, '“' + T(def.quote) + '”', h * 0.026, w - pad * 2, M.FONT_TEXT);
    ql.slice(0, 2).forEach((ln, i) => KIT.label(g, ln, pad, y + i * h * 0.033, h * 0.026, { font: M.FONT_TEXT, fill: '#e8d9b8', sw: 0.2 }));
    // peia (super)
    KIT.stamp(g, `${T('PEIA')}: ${T(def.superName).toUpperCase()}`, pad, h * 0.964, h * 0.027, { rot: -0.015, fill: '#1f7a4d' });
    KIT.grain(g, w, h, 0.035);
    return c;
  };

  // ---------- grade de lutadores (carrossel "Os 20 lutadores"): 4 retratos oficiais do jogo por lâmina ----------
  C.roster4 = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    backdrop(g, w, h, o.stage, { dim: 0.52, cam: { zoom: 1.4, fx: 480, fy: 300 }, embers: 30 }); KIT.vignette(g, w, h, 0.45);
    const cw = 400, ch = 500, gap = 60, x0 = (w - (cw * 2 + gap)) / 2, y0 = h * 0.125, rowH = ch + 78;
    o.ids.forEach((id, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = x0 + col * (cw + gap), y = y0 + row * (rowH + 8), def = M.FIGHTERS[id];
      const p = KIT.canvas(cw, ch), pg = p.getContext('2d'), pt = KIT.canvas(cw, ch); const gr = pg.createLinearGradient(0, 0, 0, ch); gr.addColorStop(0, '#f2b70c'); gr.addColorStop(1, '#c8371d'); pg.fillStyle = gr; pg.fillRect(0, 0, cw, ch); M.render.drawPortrait(pt, def, {}); pg.drawImage(pt, 0, 0);   // mesmo fundo dos cartões da seleção
      KIT.frame(g, p, x, y, cw, ch, { radius: 14, border: 6 });
      const nm = T(def.short ? def.name : def.name).toUpperCase(); let sz = 38; while (sz > 22 && KIT.measure(g, nm, sz) > cw + 40) sz -= 1;
      KIT.label(g, nm, x + cw / 2, y + ch + 40, sz, { align: 'center' });
      let s2 = 23; const st = T(def.style); while (s2 > 15 && KIT.measure(g, st, s2, M.FONT_TEXT) > cw + 40) s2 -= 0.5;
      KIT.label(g, st, x + cw / 2, y + ch + 40 + sz * 0.8, s2, { font: M.FONT_TEXT, align: 'center', fill: '#f2d34a', sw: 0.24 });
    });
    KIT.stamp(g, o.head || T('OS 20 LUTADORES'), w * 0.06, h * 0.075, h * 0.032, { rot: -0.03 });
    KIT.logo(g, w - w * 0.06 - w * 0.11, h * 0.055, w * 0.22);
    if (o.page) KIT.label(g, o.page, w * 0.94, h * 0.972, h * 0.02, { font: M.FONT_TEXT, align: 'right', sw: 0.22 });
    KIT.grain(g, w, h, 0.03);
    return c;
  };

  // ---------- cenário (carrossel de cenários) ----------
  C.stageSlide = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    const k0 = Math.max(w / W, h / H), zoom = (o.k || 2.9) / k0;
    const cam = KIT.camera(w, h, { zoom, fx: 480, fy: 290, ax: 0.5, ay: 0.5 });
    const st = KIT.drawStage(g, cam, o.stage, { crowd: true, t: 100 });
    for (const f of o.fighters || []) KIT.fighter(g, cam, f.id, Object.assign({ pose: null, glow: '#ffd890' }, f));
    KIT.drawFront(g, cam, st);
    KIT.vignette(g, w, h, 0.5); KIT.fade(g, w, h, 'bottom', 0.85, '10,6,14', 0.34); KIT.fade(g, w, h, 'top', 0.55, '10,6,14', 0.2);
    KIT.stamp(g, `${T('CENÁRIO')} ${String(o.index).padStart(2, '0')}`, w * 0.06, h * 0.07, h * 0.03, { rot: -0.03 });
    KIT.logo(g, w - w * 0.06 - w * 0.13, h * 0.055, w * 0.26);
    const name = T(M.stages.DEFS[o.stage].name).toUpperCase(); fitTitle(g, name, w * 0.06, h * 0.915, w * 0.88, h * 0.075, { align: 'left' });
    if (o.sub) KIT.label(g, T(o.sub), w * 0.06 + 4, h * 0.955, h * 0.022, { font: M.FONT_TEXT, fill: '#f2d34a', sw: 0.22 });
    KIT.grain(g, w, h, 0.03);
    return c;
  };

  // ---------- slide de texto + captura real (carrossel "Como funciona" e stories) ----------
  C.shotSlide = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d'); backdrop(g, w, h, o.stage, { dim: 0.5, cam: o.cam || { zoom: 1.4, fx: 480, fy: 300 } });
    KIT.vignette(g, w, h, 0.5);
    const pad = w * 0.07, story = !!o.story; let y = o.headY ?? h * (story ? 0.2 : 0.085);
    if (o.kicker) { KIT.stamp(g, o.kicker, pad, y + h * 0.02, h * (story ? 0.02 : 0.024), { rot: -0.03 }); y += h * (story ? 0.06 : 0.07); }
    const hs = h * (story ? 0.05 : 0.058), lines = KIT.wrap(g, o.head, hs, w - pad * 2);
    lines.forEach((ln, i) => KIT.title(g, ln, pad, y + hs * 0.9 + i * hs * 0.95, hs, { align: 'left' })); y += lines.length * hs * 0.95 + hs * 0.35;
    if (o.sub) { const ss = h * (story ? 0.0225 : 0.027); const sl = KIT.wrap(g, o.sub, ss, w - pad * 2, M.FONT_TEXT); sl.forEach((ln, i) => KIT.label(g, ln, pad + 3, y + ss * 0.9 + i * ss * 1.3, ss, { font: M.FONT_TEXT, fill: '#f2d34a', sw: 0.22 })); y += sl.length * ss * 1.3 + ss * 0.9; }
    const img = o.raw, fw = w - pad * 2, fh = fw * img.height / img.width, fy = o.frameY ?? (y + h * 0.015);
    KIT.frame(g, img, pad, fy, fw, fh, { radius: fw * 0.016, border: Math.max(5, w * 0.005) });
    if (o.logo !== false) KIT.logo(g, w / 2, o.logoY ?? Math.min(h * 0.93, fy + fh + (h - fy - fh) / 2), w * (story ? 0.5 : 0.38));
    KIT.grain(g, w, h, 0.03);
    return c;
  };

  // ---------- capa (cover do carrossel / reel): logo + quatro lutadores + chamada ----------
  C.cover = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    const k0 = Math.max(w / W, h / H), zoom = (o.k || 2.5) / k0;
    const cam = KIT.camera(w, h, { zoom, fx: 480, fy: 400, ax: 0.5, ay: o.ay ?? 0.7 });
    const st = KIT.drawStage(g, cam, o.stage || 'ladeira', { crowd: true, t: 120 });
    KIT.rays(g, w * 0.5, h * 0.62, h * 0.8, { n: 22, alpha: 0.2, color: '#ffe3a0' });
    const idle = (id, x, y, f, s) => ({ id, x, y, facing: f, s, pose: null, proj: false });
    const L = o.lineup || [idle('bia', 410, GR - 14, 1, 1.0), idle('iara', 560, GR - 14, -1, 1.0), { id: 'zeca', x: 395, y: GR + 22, facing: 1, s: 1.18 }, { id: 'lobisomem', x: 585, y: GR + 22, facing: -1, s: 1.18 }, idle('mula', 480, GR - 24, 1, 1.0)];
    for (const f of L.slice().sort((a, b) => a.y - b.y)) KIT.fighter(g, cam, f.id, Object.assign({ pose: (KIT.HERO[f.id] || {}).pose, proj: (KIT.HERO[f.id] || {}).proj, glow: '#ffd890' }, f));
    KIT.vignette(g, w, h, 0.45); KIT.bloom(g, w, h, { alpha: 0.2 }); KIT.fade(g, w, h, 'top', 0.45, '10,6,14', 0.2);
    KIT.logo(g, w / 2, h * (o.logoY ?? 0.2), w * (o.logoW ?? 0.86));
    if (o.stamp) KIT.stamp(g, o.stamp, w / 2, h * (o.stampY ?? 0.9), h * (o.stampS ?? 0.03), { align: 'center', rot: -0.03 });
    if (o.big) { fitTitle(g, o.big, w / 2, h * (o.bigY ?? 0.5), w * 0.9, h * 0.15, { align: 'center' }); }
    KIT.embers(g, w, h, 50, 9, ['#ffd890', '#ff9a3c', '#fff8e8'], Math.max(1.4, w / 900), { y0: 0.2, span: 0.6 });
    KIT.grain(g, w, h, 0.03);
    return c;
  };

  // ---------- capa de destaque do Instagram (círculo) ----------
  C.highlight = (w, h, o) => {
    const c = KIT.canvas(w, h), g = c.getContext('2d');
    const cam = KIT.camera(w, h, { zoom: 1.6, fx: 480, fy: 300 }); KIT.drawStage(g, cam, o.stage || 'ladeira', { crowd: false, t: 100 }); g.fillStyle = 'rgba(14,8,22,0.4)'; g.fillRect(0, 0, w, h);
    const R = w * 0.3, cx = w / 2, cy = h / 2;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
    const bg = g.createLinearGradient(0, cy - R, 0, cy + R); bg.addColorStop(0, '#f2b70c'); bg.addColorStop(1, '#c8371d'); g.fillStyle = bg; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    if (o.id) { const p = KIT.canvas(380, 480); M.render.drawPortrait(p, M.FIGHTERS[o.id], {}); g.imageSmoothingQuality = 'high'; const s = (R * 2.15) / 480; g.drawImage(p, cx - 190 * s, cy - 240 * s, 380 * s, 480 * s); }
    else if (o.icon) { const ic = C.icon(1024); g.drawImage(ic, cx - R, cy - R, R * 2, R * 2); }
    else if (o.stageThumb) { const cam2 = KIT.camera(R * 2, R * 2, { zoom: 1.0, fx: 480, fy: 320 }); g.save(); g.translate(cx - R, cy - R); KIT.drawStage(g, cam2, o.stageThumb, { crowd: true, t: 100 }); g.restore(); }
    g.restore();
    g.strokeStyle = INKC; g.lineWidth = w * 0.014; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.strokeStyle = YEL; g.lineWidth = w * 0.006; g.beginPath(); g.arc(cx, cy, R + w * 0.01, 0, 7); g.stroke();
    KIT.title(g, o.label, cx, cy + R + h * 0.065, h * 0.035, { align: 'center' });
    return c;
  };
})();
