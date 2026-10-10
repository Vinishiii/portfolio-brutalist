'use strict';
// ============================================================
// PAINT — camada visual "pintura cinematográfica" (aditiva e desligável)
//  • fundos repintados com pinceladas (painterly environment)
//  • iluminação estilizada por cenário (key quente / fill fria / rim)
//  • contorno seletivo, sombreamento cel em 3 tons, rim light
//  • névoa volumétrica, perspectiva atmosférica, raios de luz
//  • smear frames, impact frames, VFX desenhados à mão (frame a frame)
//  • câmera dinâmica (enquadramento, parallax, letterbox)
//  • pós-processamento GLSL em WebGL (grade de cor, bloom, vinheta, grão, pincel)
// Nada aqui altera estado de jogo: só lê o Match e desenha.
// ============================================================
M.paint = (function () {
  const W = M.W, H = M.H, INK = M.C.ink;
  const P = { enabled: false, post: true, gl: null, glOk: false, impact: 0, impactAt: null, vz: 1, vx: W / 2, vy: H / 2, bgOffset: 0, t: 0, lastFxLen: 0, seenFx: new WeakSet() };
  const prevRig = new WeakMap();

  // ---------- perfis cinematográficos por cenário ----------
  const PROFILES = {
    porto:    { key: '#ffb45a', rim: '#ffd890', fill: '#4a6fd8', fog: '#1a2a5a', fogA: 0.42, haze: 0.22, rays: 0.35, warm: [1.06, 0.98, 0.90], cool: [0.88, 0.95, 1.12], sat: 1.08, con: 1.08, vig: 0.55, bloom: 0.45, grain: 0.05, ink: 0.35 },
    ladeira:  { key: '#ffcc66', rim: '#fff0b0', fill: '#c0509a', fog: '#e8a35b', fogA: 0.22, haze: 0.18, rays: 0.25, warm: [1.08, 1.0, 0.9], cool: [0.95, 0.92, 1.06], sat: 1.15, con: 1.06, vig: 0.45, bloom: 0.35, grain: 0.045, ink: 0.3 },
    rio:      { key: '#ffb070', rim: '#ffd0a0', fill: '#6a4aa8', fog: '#4a2a6a', fogA: 0.35, haze: 0.25, rays: 0.3, warm: [1.06, 0.97, 0.92], cool: [0.9, 0.9, 1.12], sat: 1.12, con: 1.07, vig: 0.5, bloom: 0.4, grain: 0.05, ink: 0.32 },
    sertao:   { key: '#ffe0a0', rim: '#fff8e0', fill: '#d08050', fog: '#f2c27a', fogA: 0.2, haze: 0.28, rays: 0.15, warm: [1.1, 1.02, 0.88], cool: [1.0, 0.95, 0.9], sat: 1.1, con: 1.08, vig: 0.42, bloom: 0.3, grain: 0.05, ink: 0.3 },
    terreiro: { key: '#ffc070', rim: '#ffe8b0', fill: '#a05030', fog: '#c47a4a', fogA: 0.2, haze: 0.16, rays: 0.3, warm: [1.08, 0.99, 0.88], cool: [0.95, 0.9, 0.95], sat: 1.1, con: 1.07, vig: 0.5, bloom: 0.35, grain: 0.045, ink: 0.32 },
    pantanal: { key: '#ffa040', rim: '#ffd080', fill: '#2a6aa0', fog: '#0f2a45', fogA: 0.45, haze: 0.3, rays: 0.4, warm: [1.05, 0.96, 0.9], cool: [0.85, 0.95, 1.15], sat: 1.1, con: 1.1, vig: 0.6, bloom: 0.5, grain: 0.055, ink: 0.35 },
    galpao:   { key: '#40c8d8', rim: '#c7267a', fill: '#2040a0', fog: '#101a33', fogA: 0.4, haze: 0.2, rays: 0.2, warm: [1.0, 0.98, 1.05], cool: [0.85, 0.95, 1.2], sat: 1.15, con: 1.12, vig: 0.6, bloom: 0.6, grain: 0.05, ink: 0.3 },
    mata:     { key: '#a8ffd0', rim: '#e0ffe8', fill: '#1a6a5a', fog: '#0a2a22', fogA: 0.5, haze: 0.3, rays: 0.45, warm: [0.96, 1.04, 0.94], cool: [0.82, 1.0, 1.1], sat: 1.12, con: 1.1, vig: 0.62, bloom: 0.55, grain: 0.055, ink: 0.34 },
    estrada:  { key: '#d0b8ff', rim: '#f0e0ff', fill: '#3a2a8a', fog: '#1a1038', fogA: 0.5, haze: 0.3, rays: 0.3, warm: [1.02, 0.94, 1.06], cool: [0.84, 0.88, 1.18], sat: 1.12, con: 1.12, vig: 0.65, bloom: 0.55, grain: 0.055, ink: 0.36 },
    beco:     { key: '#ffc070', rim: '#ffe0a0', fill: '#6a3a7a', fog: '#2a1a30', fogA: 0.42, haze: 0.26, rays: 0.28, warm: [1.08, 0.96, 0.9], cool: [0.88, 0.88, 1.08], sat: 1.05, con: 1.12, vig: 0.62, bloom: 0.45, grain: 0.06, ink: 0.4 },
    parnaiba: { key: '#b0f0e0', rim: '#e0fff4', fill: '#2a6a8a', fog: '#0f3038', fogA: 0.42, haze: 0.3, rays: 0.4, warm: [1.0, 1.02, 0.96], cool: [0.84, 1.0, 1.14], sat: 1.1, con: 1.08, vig: 0.58, bloom: 0.5, grain: 0.05, ink: 0.33 },
    cinzas:   { key: '#ff9040', rim: '#ffc080', fill: '#5a5a70', fog: '#4a4744', fogA: 0.5, haze: 0.35, rays: 0.25, warm: [1.04, 0.98, 0.94], cool: [0.9, 0.9, 0.98], sat: 0.85, con: 1.12, vig: 0.65, bloom: 0.4, grain: 0.07, ink: 0.4 }
  };
  const profileOf = st => PROFILES[st && st.id] || PROFILES.porto;

  // ---------- texturas procedurais (pincel e papel) ----------
  let brushTex = null, splats = null;
  function makeBrush() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
    const rnd = M.seeded(99);
    for (let i = 0; i < 900; i++) { const x = rnd() * 256, y = rnd() * 256, len = 10 + rnd() * 40, a = (rnd() - 0.5) * 0.5; const v = 100 + rnd() * 110; g.strokeStyle = `rgba(${v},${v},${v},0.35)`; g.lineWidth = 1 + rnd() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke(); }
    return c;
  }
  function makeSplats() {
    const arr = [];
    for (let k = 0; k < 4; k++) { const rnd = M.seeded(31 + k * 7); const pts = []; const n = 14; for (let i = 0; i < n; i++) pts.push(0.55 + rnd() * 0.6 + (i % 3 === 0 ? 0.35 : 0)); arr.push(pts); }
    return arr;
  }

  // ---------- fundo pintado (painterly environment) ----------
  function ensureStage(stage) {
    if (stage.bgPaint || !stage.bg) return;
    const src = stage.bg; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    const data = src.getContext('2d').getImageData(0, 0, W, H).data;
    const rnd = M.seeded(1234 + (stage.id || '').length);
    const prof = profileOf(stage);
    // pinceladas: amostra a cor local e deposita um dab elíptico orientado por um campo de ruído
    const lum = (x, y) => { x = M.clamp(x | 0, 0, W - 1); y = M.clamp(y | 0, 0, H - 1); const i = (y * W + x) * 4; return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; };
    for (let pass = 0; pass < 2; pass++) {
      const count = pass === 0 ? 2200 : 1600; const base = pass === 0 ? 10 : 5;
      for (let i = 0; i < count; i++) {
        const x = rnd() * W, y = rnd() * (M.GROUND + 60); const idx = ((y | 0) * W + (x | 0)) * 4;
        const r = data[idx], gg = data[idx + 1], b = data[idx + 2]; if (data[idx + 3] === 0) continue;
        // sensível a bordas: perto de contornos fortes a pincelada encolhe e clareia, preservando a leitura das formas
        const l0 = lum(x, y); const edge = Math.max(Math.abs(lum(x + 9, y) - l0), Math.abs(lum(x - 9, y) - l0), Math.abs(lum(x, y + 9) - l0), Math.abs(lum(x, y - 9) - l0));
        if (edge > 110) continue;
        const ek = edge > 45 ? 0.45 : 1;
        const ang = Math.sin(x * 0.012 + y * 0.02) * 0.9 + Math.cos(y * 0.015) * 0.6 + (rnd() - 0.5) * 0.6;
        const depth = M.clamp(y / M.GROUND, 0, 1); const size = base * (0.6 + depth * 0.8) * (0.7 + rnd() * 0.6) * ek;
        const jit = (rnd() - 0.5) * 18;
        g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = (0.3 + rnd() * 0.3) * ek;
        g.fillStyle = `rgb(${M.clamp(r + jit, 0, 255) | 0},${M.clamp(gg + jit, 0, 255) | 0},${M.clamp(b + jit * 0.8, 0, 255) | 0})`;
        g.beginPath(); g.ellipse(0, 0, size * 1.9, size * 0.55, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
    // perspectiva atmosférica: o fundo distante recebe a cor da névoa
    const fogG = g.createLinearGradient(0, 0, 0, M.GROUND); fogG.addColorStop(0, hexA(prof.fog, prof.haze)); fogG.addColorStop(0.75, hexA(prof.fog, prof.haze * 0.5)); fogG.addColorStop(1, hexA(prof.fog, 0));
    g.fillStyle = fogG; g.fillRect(0, 0, W, M.GROUND);
    // textura de pincel (overlay sutil)
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.35; const pat = g.createPattern(brushTex, 'repeat'); g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore();
    stage.bgPaint = c;
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

  // ---------- atmosfera: raios de luz, névoa volumétrica (chamado por Stage.drawBack) ----------
  function atmosphere(ctx, stage, G) {
    const prof = profileOf(stage); const t = P.t; const fp = stage.def.firePos;
    const level = stage.fireLevel * (G && G.fireScale !== undefined ? G.fireScale : 1);
    ctx.save();
    // raios (god rays) saindo da fogueira
    if (level > 0.05 && prof.rays > 0) {
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.28 + Math.sin(t * 0.004 + i) * 0.08; const len = 420 * level; const wdt = 0.09 + Math.sin(t * 0.01 + i * 1.7) * 0.03;
        const g = ctx.createLinearGradient(fp[0], fp[1] - 40, fp[0] + Math.cos(a) * len, fp[1] - 40 + Math.sin(a) * len);
        g.addColorStop(0, hexA(prof.key, prof.rays * (0.35 + 0.15 * Math.sin(t * 0.03 + i)))); g.addColorStop(1, hexA(prof.key, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fp[0], fp[1] - 40); ctx.lineTo(fp[0] + Math.cos(a - wdt) * len, fp[1] - 40 + Math.sin(a - wdt) * len); ctx.lineTo(fp[0] + Math.cos(a + wdt) * len, fp[1] - 40 + Math.sin(a + wdt) * len); ctx.closePath(); ctx.fill();
      }
    }
    // névoa em camadas, deslizando devagar (volumétrica barata)
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 3; i++) {
      const y0 = 250 + i * 70, hgt = 120; const drift = (t * (0.15 + i * 0.1)) % W;
      const g = ctx.createLinearGradient(0, y0, 0, y0 + hgt); g.addColorStop(0, hexA(prof.fog, 0)); g.addColorStop(0.5, hexA(prof.fog, prof.fogA * 0.35)); g.addColorStop(1, hexA(prof.fog, 0));
      ctx.fillStyle = g;
      for (let k = -1; k <= 1; k++) { const x = k * W + drift; ctx.beginPath(); ctx.moveTo(x, y0 + hgt); for (let s = 0; s <= 8; s++) ctx.lineTo(x + s * W / 8, y0 + Math.sin(s * 1.3 + i + t * 0.01) * 18 + 20); ctx.lineTo(x + W, y0 + hgt); ctx.closePath(); ctx.fill(); }
    }
    ctx.restore();
  }

  // ---------- VFX desenhados à mão (frame a frame) ----------
  function drawFx(ctx, e) {
    const k = e.t / e.life;
    switch (e.type) {
      case 'star': { // respingo de tinta: 4 quadros, cada um segurado por 2 frames
        const frame = Math.floor(e.t / 2) % splats.length; const pts = splats[frame]; const r = e.r * (0.7 + 0.7 * M.easeOut(k));
        ctx.save(); ctx.globalAlpha = 1 - k * k; ctx.translate(e.x, e.y); ctx.rotate((e.rot || 0) + frame * 0.3);
        ctx.beginPath(); for (let i = 0; i < pts.length; i++) { const a = i / pts.length * Math.PI * 2; const rr = r * pts[i]; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (i === 0) ctx.moveTo(px, py); else ctx.quadraticCurveTo(Math.cos(a - 0.2) * rr * 0.75, Math.sin(a - 0.2) * rr * 0.75, px, py); } ctx.closePath();
        ctx.fillStyle = e.color || '#fff8e8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.fillStyle = INK; for (let i = 0; i < 5; i++) { const a = i * 1.26 + frame; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25, 2 + (i % 2), 0, Math.PI * 2); ctx.fill(); }
        ctx.restore(); return true;
      }
      case 'lines': { // linhas de velocidade tremidas (mão livre)
        ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = e.color || INK; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
        for (let i = 0; i < 10; i++) { const a = e.rot + i * Math.PI / 5; const r0 = e.r * (0.3 + k * 0.9), r1 = r0 + e.r * 0.6 * (1 - k); ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * r0, e.y + Math.sin(a) * r0); ctx.quadraticCurveTo(e.x + Math.cos(a + 0.08) * (r0 + r1) / 2, e.y + Math.sin(a + 0.08) * (r0 + r1) / 2, e.x + Math.cos(a) * r1, e.y + Math.sin(a) * r1); ctx.stroke(); }
        ctx.restore(); return true;
      }
      case 'dust': { // fumaça com contorno
        ctx.save(); ctx.globalAlpha = (1 - k) * 0.7; const frame = Math.floor(e.t / 3);
        for (let i = 0; i < 4; i++) { const cx = e.x + (i - 1.5) * 16 * (1 + k), cy = e.y - k * 22 - (i % 2) * 7 - frame; const r = 8 + k * 10 + (i % 2) * 3; ctx.fillStyle = e.color || '#d9c27a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(20,18,16,0.45)'; ctx.stroke(); }
        ctx.restore(); return true;
      }
      case 'ring': { ctx.save(); ctx.globalAlpha = 1 - k; ctx.lineWidth = 7 * (1 - k) + 2; ctx.strokeStyle = e.color || '#f2b70c'; ctx.beginPath(); const r = e.r * M.easeOut(k); for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2; const rr = r * (1 + Math.sin(i * 2.3 + e.t) * 0.05); ctx.lineTo(e.x + Math.cos(a) * rr, e.y + Math.sin(a) * rr); } ctx.stroke(); ctx.restore(); return true; }
    }
    return false;
  }
  function drawParticle(ctx, p) {
    if (p.type === 'spark') { const k = p.life / p.max; ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5); ctx.strokeStyle = p.color; ctx.lineWidth = p.size * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5); ctx.stroke(); ctx.restore(); return true; }
    return false;
  }

  // ---------- smear frames ----------
  function smear(ctx, f, rig) {
    const prev = prevRig.get(f); const fast = f.state === 'attack' && f.move && f.mf > f.move.startup && f.mf <= f.move.startup + f.move.active && (f.move.dmg >= 90 || f.move.super || f.move.id === 'dH');
    const toWorld = p => [f.x + f.facing * p[0], f.y + rig.shift + p[1]];
    const cur = { na: toWorld(rig.na[2]), nl: toWorld(rig.nl[2]), fa: toWorld(rig.fa[2]) };
    if (fast && prev && !rig.rot) {
      const C = f.def.colors;
      for (const [key, color, w] of [['na', C.arms, 11], ['nl', C.legs, 14], ['fa', C.arms, 9]]) {
        const a = prev[key], b = cur[key]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d < 16 || d > 160) continue;
        ctx.save(); ctx.globalAlpha = 0.5; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const t0 = i / 3, t1 = (i + 1) / 3; ctx.lineWidth = w * (0.35 + t1 * 0.65); ctx.strokeStyle = i === 0 ? INK : color; ctx.beginPath(); ctx.moveTo(M.lerp(a[0], b[0], t0), M.lerp(a[1], b[1], t0)); ctx.lineTo(M.lerp(a[0], b[0], t1), M.lerp(a[1], b[1], t1)); ctx.stroke(); }
        ctx.restore();
      }
    }
    prevRig.set(f, cur);
  }

  // ---------- render da partida (substitui apenas a apresentação) ----------
  function renderMatch(G, ctx) {
    P.t++;
    const st = G.stage, prof = profileOf(st); ensureStage(st);
    // eventos visuais lidos do estado (impact frames)
    for (const e of G.fx) { if (!P.seenFx.has(e)) { P.seenFx.add(e); if (e.type === 'star' && e.r >= 42) { P.impact = 3; P.impactAt = [e.x, e.y]; } if (e.type === 'flash' && e.alpha >= 0.9 && !M.store.data.settings.reduceFlash) { P.impact = 4; } } }
    // câmera dinâmica (enquadramento entre os lutadores)
    const [a, b] = G.fighters; const mid = (a.x + b.x) / 2, dist = Math.abs(a.x - b.x);
    const tz = M.clamp(1.14 - dist / 1400, 1, 1.12), tx = M.clamp(mid, W / 2 - (W / 2) * (1 - 1 / tz), W / 2 + (W / 2) * (1 - 1 / tz)), ty = H / 2 + 14 * (tz - 1) / 0.12;
    P.vz += (tz - P.vz) * 0.05; P.vx += (tx - P.vx) * 0.06; P.vy += (ty - P.vy) * 0.06;
    const blend = M.clamp((G.cam.zoom - 1) / 0.1, 0, 1);
    const zoom = M.lerp(P.vz, G.cam.zoom, blend), cx = M.lerp(P.vx, G.cam.x, blend), cy = M.lerp(P.vy, G.cam.y, blend);
    P.bgOffset = (W / 2 - cx) * 0.28 * M.clamp((zoom - 1) / 0.12, 0, 1);
    ctx.save();
    const sx = (Math.random() - 0.5) * G.shakeAmt, sy = (Math.random() - 0.5) * G.shakeAmt;
    ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
    st.drawBack(ctx, G);
    for (const tr of G.traps) M.render.drawTrap(ctx, tr);
    for (const f of G.fighters) softShadow(ctx, f, prof);
    for (const g of G.ghosts) M.render.drawGhost(ctx, g, g.def);
    const order = G.fighters.slice().sort((x, y) => (x.state === 'attack' ? 1 : 0) - (y.state === 'attack' ? 1 : 0) || (x.state === 'ko' ? -1 : 0));
    const fp = st.def.firePos;
    const drawF = f => {
      // iluminação por lutador: key quente vindo da fogueira, fill fria do céu
      const lx = fp[0] - f.x, ly = (fp[1] - 60) - (f.y - 80); const L = Math.hypot(lx, ly) || 1;
      M.render.style.light = { x: lx / L * f.facing, y: ly / L }; M.render.style.key = prof.key; M.render.style.rim = prof.rim; M.render.style.fill = prof.fill; M.render.style.dark = st.dark;
      const rig = M.render.drawFighter(ctx, f); smear(ctx, f, rig);
    };
    if (G.banner && G.banner.t < 40) { ctx.save(); ctx.fillStyle = 'rgba(20,18,16,0.6)'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.restore(); for (const f of order) if (f !== G.banner.who) drawF(f); drawF(G.banner.who); }
    else for (const f of order) drawF(f);
    for (const pr of G.projectiles) M.render.drawProjectile(ctx, pr);
    for (const p of G.particles) if (!drawParticle(ctx, p)) M.render.drawParticle(ctx, p);
    for (const e of G.fx) if (e.type !== 'flash' && !drawFx(ctx, e)) M.render.drawFx(ctx, e);
    st.drawFront(ctx, G);
    // impact frame: silhuetas em alto contraste por 3-4 quadros
    if (P.impact > 0) {
      P.impact--; ctx.save(); ctx.fillStyle = P.impact % 2 ? '#fff8e8' : '#141210'; ctx.fillRect(-300, -300, W + 600, H + 600);
      const ink = P.impact % 2 ? '#141210' : '#fff8e8';
      for (const f of G.fighters) M.render.drawFighter(ctx, f, { silhouette: ink, glow: null });
      if (P.impactAt) { ctx.strokeStyle = ink; ctx.lineWidth = 3; for (let i = 0; i < 18; i++) { const an = i * Math.PI / 9 + P.t * 0.1; ctx.beginPath(); ctx.moveTo(P.impactAt[0] + Math.cos(an) * 40, P.impactAt[1] + Math.sin(an) * 40); ctx.lineTo(P.impactAt[0] + Math.cos(an) * 900, P.impactAt[1] + Math.sin(an) * 900); ctx.stroke(); } }
      ctx.restore();
    }
    st.drawDark(ctx, G.fighters);
    if (M.store.data.settings.hitboxes) G.drawBoxes(ctx);
    ctx.restore();
    for (const e of G.fx) if (e.type === 'flash') M.render.drawFx(ctx, e);
    // letterbox cinematográfico nas cenas de abertura / nocaute / fim
    const cine = G.phase === 'intro' || G.phase === 'ko' || G.phase === 'end' || (G.banner && G.banner.t < 50);
    P.bars = M.lerp(P.bars || 0, cine ? 1 : 0, 0.12);
    if (P.bars > 0.01) { ctx.fillStyle = '#0b0a0c'; const hgt = 46 * P.bars; ctx.fillRect(0, 0, W, hgt); ctx.fillRect(0, H - hgt, W, hgt); }
    G.drawHUD(ctx);
  }
  function softShadow(ctx, f, prof) {
    const h = Math.max(0, M.GROUND - f.y); const sc = M.clamp(1 - h / 400, 0.4, 1);
    ctx.save(); const g = ctx.createRadialGradient(f.x, M.GROUND + 4, 4, f.x, M.GROUND + 4, 60 * sc); g.addColorStop(0, 'rgba(20,18,16,0.5)'); g.addColorStop(1, 'rgba(20,18,16,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, M.GROUND + 4, 60 * sc * f.def.body.build, 12 * sc, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  // ---------- pós-processamento WebGL (GLSL) ----------
  const VS = 'attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const FS = `precision mediump float; varying vec2 v; uniform sampler2D tex; uniform float time, sat, con, vig, bloom, grain, fogA, dark, ink, brush; uniform vec3 warm, cool, fogCol; uniform vec2 px;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  void main(){
    vec2 uv = vec2(v.x, 1.0 - v.y);
    // pincelada procedural: micro-deslocamento das amostras ao longo de traços
    float n1 = noise(uv * vec2(60.0, 14.0) + time * 0.03) - 0.5, n2 = noise(uv * vec2(14.0, 60.0) - time * 0.02) - 0.5;
    uv += vec2(n1, n2) * 0.0022 * brush;
    vec3 c = texture2D(tex, uv).rgb;
    // bloom barato: 8 amostras, só nas altas luzes
    vec3 b = vec3(0.0);
    for (int i = 0; i < 8; i++) { float a = float(i) * 0.785; vec2 o = vec2(cos(a), sin(a)) * px * 7.0; b += max(texture2D(tex, uv + o).rgb - 0.62, 0.0); }
    c += b * 0.125 * bloom * 2.2;
    // tinta nas bordas (seletiva, por gradiente de luminância)
    float l0 = dot(c, vec3(0.299, 0.587, 0.114));
    float lx = dot(texture2D(tex, uv + vec2(px.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114)) - dot(texture2D(tex, uv - vec2(px.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float ly = dot(texture2D(tex, uv + vec2(0.0, px.y)).rgb, vec3(0.299, 0.587, 0.114)) - dot(texture2D(tex, uv - vec2(0.0, px.y)).rgb, vec3(0.299, 0.587, 0.114));
    float edge = clamp(length(vec2(lx, ly)) * 2.5, 0.0, 1.0);
    c *= 1.0 - edge * ink * 0.5;
    // grade de cor: saturação, contraste, split tone (sombras frias, luzes quentes)
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, sat);
    c = (c - 0.5) * con + 0.5;
    c *= mix(cool, warm, smoothstep(0.25, 0.8, l));
    // névoa de profundidade no alto do quadro
    c = mix(c, fogCol, fogA * 0.35 * (1.0 - smoothstep(0.0, 0.7, uv.y)));
    // vinheta e escuridão (fase 2 do chefe)
    float d = distance(uv, vec2(0.5, 0.52)); c *= 1.0 - vig * smoothstep(0.38, 0.95, d);
    c *= 1.0 - dark * 0.25;
    // grão de papel animado
    c += (hash(uv * vec2(960.0, 540.0) + fract(time)) - 0.5) * grain;
    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }`;
  function initGL(postCanvas, gameCanvas) {
    try {
      const gl = postCanvas.getContext('webgl', { premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: false }) || postCanvas.getContext('experimental-webgl');
      if (!gl) return false;
      const mk = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
      const prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      const U = {}; for (const n of ['time', 'sat', 'con', 'vig', 'bloom', 'grain', 'fogA', 'dark', 'ink', 'brush', 'warm', 'cool', 'fogCol', 'px', 'tex']) U[n] = gl.getUniformLocation(prog, n);
      gl.uniform2f(U.px, 1 / W, 1 / H); gl.uniform1i(U.tex, 0);
      P.gl = gl; P.U = U; P.glOk = true; P.gameCanvas = gameCanvas; P.postCanvas = postCanvas;
      return true;
    } catch (e) { console.warn('Pós-processamento WebGL indisponível:', e.message); P.glOk = false; return false; }
  }
  function post() {
    if (!P.glOk || !P.enabled || !P.post) return;
    const gl = P.gl, U = P.U; const st = (M.match && M.match.stage) || (M.ambientStage) || null; const prof = profileOf(st);
    const hex = h => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
    const fog = hex(prof.fog); const dark = st ? st.dark : 0;
    gl.bindTexture(gl.TEXTURE_2D, gl.getParameter(gl.TEXTURE_BINDING_2D));
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, P.gameCanvas);
    gl.uniform1f(U.time, (performance.now() % 100000) / 1000); gl.uniform1f(U.sat, prof.sat); gl.uniform1f(U.con, prof.con); gl.uniform1f(U.vig, prof.vig + dark * 0.2); gl.uniform1f(U.bloom, prof.bloom + dark * 0.3);
    gl.uniform1f(U.grain, prof.grain); gl.uniform1f(U.fogA, prof.fogA); gl.uniform1f(U.dark, dark); gl.uniform1f(U.ink, prof.ink); gl.uniform1f(U.brush, 0.55);
    gl.uniform3f(U.warm, ...prof.warm); gl.uniform3f(U.cool, ...prof.cool); gl.uniform3f(U.fogCol, ...fog);
    gl.viewport(0, 0, W, H); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ---------- ligação com o jogo ----------
  let origRender = null;
  function init(gameCanvas, postCanvas) {
    brushTex = makeBrush(); splats = makeSplats();
    origRender = M.Match.prototype.render;
    M.Match.prototype.render = function (ctx) { if (P.enabled) renderMatch(this, ctx); else origRender.call(this, ctx); };
    if (postCanvas) initGL(postCanvas, gameCanvas);
    apply();
  }
  function apply() {
    const s = M.store.data.settings; P.enabled = s.paint !== false; P.post = s.post !== false && s.quality !== 'low' && !P.autoLow;
    M.render.style.paint = P.enabled;
    const usePost = P.enabled && P.post && P.glOk;
    if (P.postCanvas) { P.postCanvas.style.display = usePost ? 'block' : 'none'; }
    if (P.gameCanvas) P.gameCanvas.style.opacity = usePost ? '0' : '1';
  }

  return { P, PROFILES, init, apply, post, atmosphere, ensureStage, drawFx, get enabled() { return P.enabled; }, get bgOffset() { return P.bgOffset; } };
})();
