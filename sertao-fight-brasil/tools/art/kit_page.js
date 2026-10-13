'use strict';
// ============================================================
// Biblioteca de composição do kit de arte — roda DENTRO da página do jogo (window.KIT).
// Usa o motor real: cenários pintados (em alta resolução), lutadores reais com a mesma rim light do jogo,
// projéteis e logo do jogo. Nada é redesenhado nem inventado: só enquadramento, luz e tipografia.
// ============================================================
(function () {
  const W = M.W, H = M.H, GR = M.GROUND, INK = '#141210';
  const KIT = window.KIT = { W, H, GR };
  const cache = {};

  KIT.ready = async () => {
    await document.fonts.load("40px 'Alfa Slab One'"); await document.fonts.load("20px 'Special Elite'"); await document.fonts.ready;
    await new Promise(r => setTimeout(r, 200));
  };

  // ---------------------------------------------------------------- cenário em alta resolução
  function brushTex() {
    if (cache.brush) return cache.brush;
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
    const rnd = M.seeded(99);
    for (let i = 0; i < 900; i++) { const x = rnd() * 256, y = rnd() * 256, len = 10 + rnd() * 40, a = (rnd() - 0.5) * 0.5; const v = 100 + rnd() * 110; g.strokeStyle = `rgba(${v},${v},${v},0.35)`; g.lineWidth = 1 + rnd() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke(); }
    return (cache.brush = c);
  }
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

  // Mesma pintura do jogo (M.paint.ensureStage), só que com a base vetorial renderizada em escala S: o resultado fica nítido em 4K.
  KIT.stage = (id, S) => {
    const key = id + '@' + S; if (cache[key]) return cache[key];
    const st = new M.stages.Stage(id);
    const ld = st.bg.getContext('2d').getImageData(0, 0, W, H).data;
    const c = document.createElement('canvas'); c.width = W * S; c.height = H * S; const g = c.getContext('2d');
    g.save(); g.scale(S, S); st.def.build(g, M.seeded(id.length * 7919 + 13)); g.restore();
    const rnd = M.seeded(1234 + id.length), prof = M.paint.PROFILES[id] || M.paint.PROFILES.porto;
    const lum = (x, y) => { x = M.clamp(x | 0, 0, W - 1); y = M.clamp(y | 0, 0, H - 1); const i = (y * W + x) * 4; return ld[i] * 0.299 + ld[i + 1] * 0.587 + ld[i + 2] * 0.114; };
    for (let pass = 0; pass < 2; pass++) {
      const count = pass === 0 ? 2200 : 1600, base = pass === 0 ? 10 : 5;
      for (let i = 0; i < count; i++) {
        const x = rnd() * W, y = rnd() * (GR + 60), idx = ((y | 0) * W + (x | 0)) * 4; const r = ld[idx], gg = ld[idx + 1], b = ld[idx + 2]; if (ld[idx + 3] === 0) continue;
        const l0 = lum(x, y); const edge = Math.max(Math.abs(lum(x + 9, y) - l0), Math.abs(lum(x - 9, y) - l0), Math.abs(lum(x, y + 9) - l0), Math.abs(lum(x, y - 9) - l0));
        if (edge > 110) continue; const ek = edge > 45 ? 0.45 : 1;
        const ang = Math.sin(x * 0.012 + y * 0.02) * 0.9 + Math.cos(y * 0.015) * 0.6 + (rnd() - 0.5) * 0.6;
        const depth = M.clamp(y / GR, 0, 1), size = base * (0.6 + depth * 0.8) * (0.7 + rnd() * 0.6) * ek, jit = (rnd() - 0.5) * 18;
        g.save(); g.translate(x * S, y * S); g.rotate(ang); g.globalAlpha = (0.3 + rnd() * 0.3) * ek;
        g.fillStyle = `rgb(${M.clamp(r + jit, 0, 255) | 0},${M.clamp(gg + jit, 0, 255) | 0},${M.clamp(b + jit * 0.8, 0, 255) | 0})`;
        g.beginPath(); g.ellipse(0, 0, size * 1.9 * S, size * 0.55 * S, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
    const fogG = g.createLinearGradient(0, 0, 0, GR * S); fogG.addColorStop(0, hexA(prof.fog, prof.haze)); fogG.addColorStop(0.75, hexA(prof.fog, prof.haze * 0.5)); fogG.addColorStop(1, hexA(prof.fog, 0));
    g.fillStyle = fogG; g.fillRect(0, 0, W * S, GR * S);
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.35; const pat = g.createPattern(brushTex(), 'repeat'); if (pat.setTransform) pat.setTransform(new DOMMatrix().scale(S)); g.fillStyle = pat; g.fillRect(0, 0, W * S, H * S); g.restore();
    st.bgPaint = c; st.__S = S;
    cache[key] = st; (cache.__keys = cache.__keys || []).push(key); while (cache.__keys.length > 3) delete cache[cache.__keys.shift()];   // memória: guarda só os 3 últimos
    return st;
  };

  // Câmera: define como o "mundo" lógico 960x540 do jogo cabe no canvas (w x h). zoom 1 = cobrir; fx,fy = ponto do mundo; ax,ay = onde ele cai no canvas.
  KIT.camera = (w, h, o = {}) => {
    const k = Math.max(w / W, h / H) * (o.zoom || 1);
    let tx = w * (o.ax ?? 0.5) - (o.fx ?? W / 2) * k, ty = h * (o.ay ?? 0.5) - (o.fy ?? H / 2) * k;
    if (!o.free) { tx = Math.min(0, Math.max(w - W * k, tx)); ty = Math.min(0, Math.max(h - H * k, ty)); }
    return { k, tx, ty, w, h, to: (x, y) => [tx + x * k, ty + y * k], apply: g => { g.translate(tx, ty); g.scale(k, k); } };
  };

  // Cenário completo (fundo pintado + dinâmicos + atmosfera + fogueira + torcida). crowd:false tira a torcida.
  KIT.drawStage = (g, cam, id, o = {}) => {
    const S = Math.min(5, Math.max(2, Math.ceil(cam.k)));
    const st = KIT.stage(id, S);
    const crowd = st.crowd; if (o.crowd === false) st.crowd = { back: [], front: [] };
    st.t = o.t ?? 140; st.fireLevel = o.fire ?? st.def.fireLevel ?? 1;
    const prevP = M.paint.P.t; M.paint.P.t = (o.t ?? 140) * 3;
    g.save(); cam.apply(g);
    const orig = g.drawImage; g.drawImage = function (img, ...a) { return img === st.bgPaint ? orig.call(this, img, 0, 0, W, H) : orig.call(this, img, ...a); };
    try { st.drawBack(g, { fireScale: 1, crowdExcite: o.excite ?? 0.35, axeSign: 0 }); } finally { delete g.drawImage; }
    g.restore(); M.paint.P.t = prevP; if (o.crowd === false) st.crowd = crowd;
    return st;
  };
  KIT.drawFront = (g, cam, st, o = {}) => {
    if (o.crowd === false) return;
    g.save(); cam.apply(g); try { st.drawFront(g, { crowdExcite: o.excite ?? 0.35 }); } catch (e) { } g.restore();
  };

  // ---------------------------------------------------------------- lutadores reais
  const POSE = (name, phase, t) => M.poses.attackPose(name, phase || 'active', t ?? 0.5, M.poses.S.idle);
  KIT.fighter = (g, cam, id, o = {}) => {
    const def = M.FIGHTERS[id]; const f = new M.Fighter(def, 1, 'dummy'); f.reset(o.x, o.facing || 1); f.state = 'idle';
    f.x = o.x; f.y = o.y ?? GR; f.facing = o.facing || 1;
    f.pose = o.pose ? POSE(o.pose, o.phase, o.t) : M.poses.idlePose(def.idle, o.it ?? 0.9, def.idleOver);
    if (o.pal) { f.pal = o.pal; }
    g.save(); cam.apply(g);
    if (o.glow) { // halo de contraluz atrás do lutador (separa do fundo, sem alterar o desenho)
      const hg = g.createRadialGradient(f.x, f.y - 80 * (o.s || 1), 6, f.x, f.y - 80 * (o.s || 1), 150 * (o.s || 1)); hg.addColorStop(0, hexA(o.glow, 0.42)); hg.addColorStop(1, hexA(o.glow, 0));
      g.globalCompositeOperation = 'screen'; g.fillStyle = hg; g.fillRect(f.x - 220, f.y - 300, 440, 340); g.globalCompositeOperation = 'source-over';
    }
    if (o.s && o.s !== 1) { g.translate(f.x, f.y); g.scale(o.s, o.s); g.translate(-f.x, -f.y); }
    if (o.shadow !== false) M.render.drawShadow(g, { x: f.x, y: f.y - 4, def, grounded: true });
    if (o.proj) { const p = Object.assign({ x: f.x + f.facing * 78, y: f.y - 100, dir: f.facing, age: 8, kind: def.moves.S && def.moves.S.projectile ? def.moves.S.projectile.kind : 'ember' }, o.proj === true ? {} : o.proj); if (o.proj !== 'after') try { M.render.drawProjectile(g, p); } catch (e) { } }
    M.render.drawFighter(g, f, {});
    g.restore();
    return f;
  };
  KIT.projectile = (g, cam, kind, x, y, dir, age = 8, ex = false) => { g.save(); cam.apply(g); try { M.render.drawProjectile(g, { kind, x, y, dir, age, ex }); } catch (e) { console.warn('proj', kind, e.message); } g.restore(); };
  KIT.fx = (g, cam, e) => { g.save(); cam.apply(g); try { M.render.drawFx(g, e); } catch (er) { console.warn('fx', er.message); } g.restore(); };

  // ---------------------------------------------------------------- luz e atmosfera
  KIT.rays = (g, cx, cy, R, o = {}) => { // raios de explosão atrás dos lutadores (estilo capa de cordel)
    const n = o.n || 18, a0 = o.rot || 0; g.save(); g.globalCompositeOperation = o.mode || 'screen';
    for (let i = 0; i < n; i++) { const a = a0 + (i / n) * Math.PI * 2, w = (Math.PI * 2 / n) * 0.42; const gr = g.createRadialGradient(cx, cy, R * 0.05, cx, cy, R); gr.addColorStop(0, hexA(o.color || '#ffd890', o.alpha ?? 0.3)); gr.addColorStop(1, hexA(o.color || '#ffd890', 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a - w / 2, a + w / 2); g.closePath(); g.fill(); }
    g.restore();
  };
  KIT.glow = (g, x, y, r, color, a = 0.5, mode = 'screen') => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA(color, a)); gr.addColorStop(1, hexA(color, 0)); g.save(); g.globalCompositeOperation = mode; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); };
  KIT.vignette = (g, w, h, a = 0.5, color = '10,6,14') => { const gr = g.createRadialGradient(w / 2, h * 0.52, Math.min(w, h) * 0.3, w / 2, h * 0.52, Math.hypot(w, h) * 0.62); gr.addColorStop(0, `rgba(${color},0)`); gr.addColorStop(1, `rgba(${color},${a})`); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
  KIT.fade = (g, w, h, edge, a = 0.6, color = '10,6,14', len = 0.45) => { const v = edge === 'top' || edge === 'bottom'; const gr = v ? g.createLinearGradient(0, edge === 'top' ? 0 : h, 0, edge === 'top' ? h * len : h * (1 - len)) : g.createLinearGradient(edge === 'left' ? 0 : w, 0, edge === 'left' ? w * len : w * (1 - len), 0); gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(1, `rgba(${color},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
  KIT.bloom = (g, w, h, o = {}) => { const t = document.createElement('canvas'); t.width = w; t.height = h; const tg = t.getContext('2d'); tg.filter = `brightness(${o.bright ?? 1.15}) blur(${Math.round((o.blur ?? 0.012) * Math.max(w, h))}px)`; tg.drawImage(g.canvas, 0, 0); g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = o.alpha ?? 0.22; g.drawImage(t, 0, 0); g.restore(); };
  KIT.grade = (g, w, h, o = {}) => { // tinta quente nos claros / fria nas sombras, bem sutil
    g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = o.alpha ?? 0.22; g.fillStyle = o.color || '#ff9a3c'; g.fillRect(0, 0, w, h); g.restore();
  };
  KIT.embers = (g, w, h, n, seed, colors, size = 1, o = {}) => { const r = M.seeded(seed || 7); g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < n; i++) { const x = r() * w, y = (o.y0 ?? 0.15) * h + r() * h * (o.span ?? 0.7), s = (0.6 + r() * 1.8) * size; g.fillStyle = colors[(r() * colors.length) | 0]; g.globalAlpha = 0.35 + r() * 0.55; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } g.restore(); };
  KIT.grain = (g, w, h, a = 0.05) => { const t = document.createElement('canvas'); t.width = 256; t.height = 256; const tg = t.getContext('2d'); const id = tg.createImageData(256, 256); const r = M.seeded(5); for (let i = 0; i < id.data.length; i += 4) { const v = 120 + r() * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } tg.putImageData(id, 0, 0); g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, w, h); g.restore(); };

  // ---------------------------------------------------------------- logo e tipografia
  KIT.logoCanvas = (res = 3) => { const key = 'logo' + res; if (cache[key]) return cache[key]; const b = M.logo.build(res, false); const c = b.c; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(c, -x0, -y0); return (cache[key] = o); };
  KIT.logo = (g, cx, cy, w, o = {}) => { const res = Math.min(4, Math.max(1.5, w / 380)); const c = KIT.logoCanvas(Math.round(res * 2) / 2); const h = w * c.height / c.width; g.save(); if (o.shadow !== false) { g.shadowColor = 'rgba(8,4,12,0.55)'; g.shadowBlur = w * 0.04; g.shadowOffsetY = w * 0.015; } g.imageSmoothingQuality = 'high'; g.drawImage(c, cx - w / 2, cy - h / 2, w, h); g.restore(); return h; };
  KIT.logoAspect = () => { const c = KIT.logoCanvas(3); return c.height / c.width; };

  const GRAD = (g, y0, y1) => { const t = g.createLinearGradient(0, y0, 0, y1); t.addColorStop(0, '#fff7c9'); t.addColorStop(0.35, '#ffd53a'); t.addColorStop(0.75, '#f68b1e'); t.addColorStop(1, '#d92f1b'); return t; };
  // Título no estilo do logo: gradiente quente, contorno de tinta e sombra dura.
  KIT.title = (g, str, x, y, size, o = {}) => {
    g.save(); g.font = `${size}px ${o.font || M.FONT_DISPLAY}`; g.textAlign = o.align || 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; if (o.spacing) g.letterSpacing = o.spacing + 'px';
    const sh = o.shadow ?? 0.07;
    if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; }
    g.fillStyle = g.strokeStyle = o.shadowColor || INK; g.lineWidth = size * 0.2; for (let k = 4; k >= 1; k--) { g.strokeText(str, x + k * size * sh * 0.35, y + k * size * sh * 0.5); g.fillText(str, x + k * size * sh * 0.35, y + k * size * sh * 0.5); }
    g.strokeStyle = INK; g.lineWidth = size * 0.2; g.strokeText(str, x, y);
    g.fillStyle = o.fill || GRAD(g, y - size * 0.8, y); g.fillText(str, x, y); g.restore();
  };
  // Texto simples com contorno de tinta (legendas, rótulos).
  KIT.label = (g, str, x, y, size, o = {}) => {
    g.save(); g.font = `${size}px ${o.font || M.FONT_DISPLAY}`; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic'; g.lineJoin = 'round'; if (o.spacing) g.letterSpacing = o.spacing + 'px';
    if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; }
    if (o.stroke !== false) { g.strokeStyle = o.strokeColor || INK; g.lineWidth = size * (o.sw ?? 0.2); g.strokeText(str, x, y); }
    g.fillStyle = o.fill || '#fff8e8'; g.fillText(str, x, y); g.restore();
  };
  KIT.measure = (g, str, size, font, spacing) => { g.save(); g.font = `${size}px ${font || M.FONT_DISPLAY}`; if (spacing) g.letterSpacing = spacing + 'px'; const w = g.measureText(str).width; g.restore(); return w; };
  // Quebra de linha por largura máxima.
  KIT.wrap = (g, str, size, maxW, font, spacing) => { const words = str.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (KIT.measure(g, t, size, font, spacing) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; };
  // Carimbo vermelho (como os títulos de tela do jogo).
  KIT.stamp = (g, str, x, y, size, o = {}) => {
    g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.035); g.font = `${size}px ${M.FONT_DISPLAY}`; if (o.spacing ?? 1) g.letterSpacing = (o.spacing ?? size * 0.05) + 'px'; const tw = g.measureText(str).width, pw = size * 0.55, ph = size * 0.3;
    const bw = tw + pw * 2, bh = size + ph * 1.2, bx = o.align === 'center' ? -bw / 2 : 0;
    g.fillStyle = INK; g.fillRect(bx + size * 0.08, -bh * 0.8 + size * 0.1, bw, bh); g.fillStyle = o.fill || '#c8371d'; g.fillRect(bx, -bh * 0.8, bw, bh); g.lineWidth = size * 0.07; g.strokeStyle = INK; g.strokeRect(bx, -bh * 0.8, bw, bh);
    g.fillStyle = o.color || '#fff8e8'; g.textBaseline = 'alphabetic'; g.fillText(str, bx + pw, 0); g.restore(); return { w: bw, h: bh };
  };

  // Imagem (captura real) com moldura de tinta e sombra.
  KIT.frame = (g, img, x, y, w, h, o = {}) => {
    const r = o.radius ?? Math.min(w, h) * 0.035, bw = o.border ?? Math.max(4, Math.min(w, h) * 0.012);
    g.save(); g.shadowColor = 'rgba(6,3,10,0.6)'; g.shadowBlur = Math.min(w, h) * 0.07; g.shadowOffsetY = Math.min(w, h) * 0.03; g.fillStyle = INK; g.beginPath(); g.roundRect(x - bw, y - bw, w + bw * 2, h + bw * 2, r + bw); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, w, h, r); g.clip(); g.imageSmoothingQuality = 'high';
    if (o.crop) g.drawImage(img, o.crop[0], o.crop[1], o.crop[2], o.crop[3], x, y, w, h); else g.drawImage(img, x, y, w, h); g.restore();
    g.save(); g.strokeStyle = o.rim || '#f2b70c'; g.lineWidth = Math.max(2, bw * 0.45); g.beginPath(); g.roundRect(x - bw * 0.2, y - bw * 0.2, w + bw * 0.4, h + bw * 0.4, r + bw * 0.2); g.stroke(); g.restore();
  };

  KIT.load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('img ' + src)); i.src = src; });
  KIT.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  KIT.out = (c, fmt, q) => c.toDataURL(fmt === 'jpg' ? 'image/jpeg' : 'image/png', q ?? 0.93);
  // Achata em fundo opaco (JPEG / PNG sem alfa)
  KIT.flat = (c, bg = '#141210') => { const o = KIT.canvas(c.width, c.height), g = o.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, o.width, o.height); g.drawImage(c, 0, 0); return o; };


  // Constrói um item do manifesto: spec = { comp, w, h, o, raw?, raws?, flat? }
  KIT.build = async (spec) => {
    M.i18n.set(spec.lang || 'en', false);
    const o = spec.o || {};
    if (spec.raw) o.raw = await KIT.load(spec.raw);
    if (spec.raws) o.raws = await Promise.all(spec.raws.map(KIT.load));
    if (!KIT.comp[spec.comp]) throw new Error('comp? ' + spec.comp);
    const c = KIT.comp[spec.comp](spec.w, spec.h, o);
    return spec.flat ? KIT.flat(c, spec.flat) : c;
  };

  // Nomes e poses de destaque (escolhidos a partir das poses reais de cada lutador)
  KIT.HERO = {
    zeca: { pose: 'spinKick' }, bia: { pose: 'lunge' }, mare: { pose: 'swing' }, tiao: { pose: 'headbutt' }, bene: { pose: 'play' },
    juvenal: { pose: 'cast', proj: true }, vinicius: { pose: 'cast', proj: true }, fulozinha: { pose: 'whistle' }, mula: { pose: 'cast', proj: true }, papafigo: { pose: 'overhead' },
    cuia: { pose: 'swing' }, saci: { pose: 'riseKick' }, curupira: { pose: 'cast', proj: true }, iara: { pose: 'cast', proj: true }, boto: { pose: 'spinKick' },
    lobisomem: { pose: 'swing' }, mapinguari: { pose: 'overhead' }, cuca: { pose: 'cast', proj: true }, pisadeira: { pose: 'swing' }, cinzas: { pose: 'spinKick' }
  };
  KIT.NAMES = {};
  for (const id of M.ROSTER) KIT.NAMES[id] = M.FIGHTERS[id].name;
})();
