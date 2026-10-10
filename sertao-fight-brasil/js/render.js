'use strict';
// ============================================================
// RENDER — desenho dos lutadores (estilo xilogravura), projéteis
// e efeitos. Tudo procedural, sem imagens externas.
// ============================================================
M.render = (function () {
  const INK = M.C.ink;
  // Parâmetros da camada visual (preenchidos por paint.js). paint=false mantém a xilogravura original.
  const style = { paint: false, light: { x: 0, y: -1 }, key: '#ffb45a', rim: '#ffd890', fill: '#4a6fd8', dark: 0 };
  function mixHex(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = sh => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t); return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0'); }
  // contorno seletivo: tinta tingida pela cor do preenchimento em vez de preto puro
  const inkOf = (color, ink) => (style.paint && ink === INK && color && color[0] === '#' && color.length === 7) ? mixHex(color, INK, 0.72) : ink;
  const dir = a => { const r = M.rad(a); return [Math.sin(r), Math.cos(r)]; };
  const up = a => { const r = M.rad(a); return [Math.sin(r), -Math.cos(r)]; };

  function computeRig(pose, def) {
    const s = def.body.height;
    const L = { torso: 52 * s, neck: 19 * s, headR: 17 * s, upper: 33 * s, fore: 31 * s, thigh: 40 * s, shin: 38 * s };
    const hip = [pose.hx, -72 * s + pose.hy];
    const tu = up(pose.torso);
    const neck = [hip[0] + tu[0] * L.torso, hip[1] + tu[1] * L.torso];
    const hu = up(pose.torso + pose.head);
    const head = [neck[0] + hu[0] * L.neck, neck[1] + hu[1] * L.neck];
    const shN = [neck[0] + 3, neck[1] + 6 * s], shF = [neck[0] - 3, neck[1] + 9 * s];
    const limb = (o, a, e, l1, l2) => {
      const d1 = dir(a); const mid = [o[0] + d1[0] * l1, o[1] + d1[1] * l1];
      const d2 = dir(a + e); const end = [mid[0] + d2[0] * l2, mid[1] + d2[1] * l2];
      return [o, mid, end, a + e];
    };
    const na = limb(shN, pose.na[0], pose.na[1], L.upper, L.fore);
    const fa = limb(shF, pose.fa[0], pose.fa[1], L.upper, L.fore);
    const nl = limb([hip[0] + 2, hip[1]], pose.nl[0], -pose.nl[1], L.thigh, L.shin);
    const fl = limb([hip[0] - 2, hip[1]], pose.fl[0], -pose.fl[1], L.thigh, L.shin);
    // deslocamento para o ponto mais baixo encostar no chão (considerando rotação)
    const r = M.rad(pose.rot), cs = Math.cos(r), sn = Math.sin(r);
    const pts = [na[2], fa[2], nl[2], fl[2], [head[0], head[1] + L.headR], neck, hip];
    let maxY = -1e9;
    for (const p of pts) { const y = hip[1] + (p[0] - hip[0]) * sn + (p[1] - hip[1]) * cs; if (y > maxY) maxY = y; }
    return { L, hip, neck, head, hu, na, fa, nl, fl, shift: -maxY, rot: pose.rot, s };
  }

  function limbStroke(ctx, pts, w, color, ink) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
    if (style.paint && ink === INK) {
      // sombreamento cel em 3 tons orientado pela luz (key quente de um lado, fill fria do outro)
      const lx = style.light.x, ly = style.light.y;
      ctx.lineWidth = w + 4; ctx.strokeStyle = inkOf(color, ink); ctx.stroke();
      ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke();
      ctx.save(); ctx.globalAlpha = 0.28; ctx.translate(lx * -2.6, ly * -2.6); ctx.lineWidth = w * 0.45; ctx.strokeStyle = style.key; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.3; ctx.translate(lx * 2.8, ly * 2.8); ctx.lineWidth = w * 0.5; ctx.strokeStyle = style.fill; ctx.globalCompositeOperation = 'multiply'; ctx.stroke(); ctx.restore();
      return;
    }
    ctx.lineWidth = w + 6; ctx.strokeStyle = ink; ctx.stroke();
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke();
    ctx.save(); ctx.globalAlpha = 0.16; ctx.translate(2.5, 2.5); ctx.lineWidth = w * 0.4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  }
  function dot(ctx, p, r, color, ink) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = style.paint && ink === INK ? 2.5 : 3; ctx.strokeStyle = inkOf(color, ink); ctx.stroke(); if (style.paint && ink === INK) { ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = style.key; ctx.beginPath(); ctx.arc(p[0] - style.light.x * r * 0.35, p[1] - style.light.y * r * 0.35, r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }

  // Desenha o rig completo (ctx já transladado para os pés e com scale(facing,1))
  function shade(hex, k) {
    if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
    const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
    return '#' + ((f(r) << 16) | (f(g) << 8) | f(b)).toString(16).padStart(6, '0');
  }
  function drawRig(ctx, rig, def, o = {}) {
    const C = def.colors, s = rig.s, bw = def.body.build;
    const flash = o.flash, sil = o.silhouette;
    const col = c => (sil ? sil : flash ? '#ffffff' : c);
    const ink = sil ? sil : INK;
    const D = def.details || [];
    ctx.save();
    ctx.translate(o.offset ? o.offset[0] : 0, rig.shift + (o.offset ? o.offset[1] : 0));
    if (rig.rot) { ctx.translate(rig.hip[0], rig.hip[1]); ctx.rotate(M.rad(rig.rot)); ctx.translate(-rig.hip[0], -rig.hip[1]); }
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    const thick = o.thick || 0;
    if (o.glow && !sil) {
      const g = ctx.createRadialGradient(rig.hip[0], rig.hip[1] - 20, 10, rig.hip[0], rig.hip[1] - 20, 110);
      g.addColorStop(0, o.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rig.hip[0], rig.hip[1] - 20, 110, 0, Math.PI * 2); ctx.fill();
    }
    const fist = !!o.angry;
    // --- membros de trás ---
    limbStroke(ctx, rig.fa, 11 * s + thick, col(C.arms), ink); hand(ctx, rig.fa, 6.5 * s + thick * 0.5, col(C.skin), ink, fist);
    limbStroke(ctx, rig.fl, 14 * s * (bw > 1.1 ? 1.15 : 1) + thick, col(C.legs), ink); foot(ctx, rig.fl, col(C.shoes), ink, s);
    // --- tronco com ombros e cintura ---
    const H = rig.hip, N = rig.neck;
    const ux = N[0] - H[0], uy = N[1] - H[1], L = Math.hypot(ux, uy) || 1; const u = [ux / L, uy / L], p = [-u[1], u[0]];
    const sw = 18 * bw * s + thick * 0.6, hw = (def.belly ? 17.5 : 13) * bw * s + thick * 0.6;
    const P1 = [H[0] - p[0] * hw, H[1] - p[1] * hw], P2 = [N[0] - p[0] * sw, N[1] - p[1] * sw], P3 = [N[0] + p[0] * sw, N[1] + p[1] * sw], P4 = [H[0] + p[0] * hw, H[1] + p[1] * hw];
    const torsoPath = () => { ctx.beginPath(); ctx.moveTo(P1[0], P1[1]); ctx.quadraticCurveTo(P1[0] - p[0] * 4 + u[0] * L * 0.5, P1[1] - p[1] * 4 + u[1] * L * 0.5, P2[0], P2[1]); ctx.quadraticCurveTo(N[0] + u[0] * 6, N[1] + u[1] * 6, P3[0], P3[1]); ctx.quadraticCurveTo(P4[0] + p[0] * 4 + u[0] * L * 0.5, P4[1] + p[1] * 4 + u[1] * L * 0.5, P4[0], P4[1]); ctx.quadraticCurveTo(H[0] - u[0] * 8, H[1] - u[1] * 8, P1[0], P1[1]); ctx.closePath(); };
    if (def.prop === 'sack') drawSack(ctx, H, u, p, s, bw, col, ink, thick);
    torsoPath(); ctx.fillStyle = col(C.torso); ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = style.paint ? 3 : 4; ctx.strokeStyle = inkOf(C.torso, ink); ctx.stroke();
    if (style.paint && !sil && !flash) { ctx.save(); torsoPath(); ctx.clip(); const lg = ctx.createLinearGradient(H[0] - style.light.x * sw, H[1] - style.light.y * sw, H[0] + style.light.x * sw, H[1] + style.light.y * sw); lg.addColorStop(0, style.key); lg.addColorStop(0.5, 'rgba(0,0,0,0)'); lg.addColorStop(1, style.fill); ctx.globalAlpha = 0.28; ctx.fillStyle = lg; ctx.fillRect(H[0] - 80, H[1] - 120, 160, 160); ctx.restore(); }
    if (!sil && !flash) {
      // sombra lateral do tronco
      ctx.save(); torsoPath(); ctx.clip(); ctx.fillStyle = 'rgba(20,18,16,0.14)'; ctx.beginPath(); ctx.moveTo(P1[0], P1[1]); ctx.lineTo(P2[0], P2[1]); ctx.lineTo(P2[0] + p[0] * sw * 0.55, P2[1] + p[1] * sw * 0.55); ctx.lineTo(P1[0] + p[0] * hw * 0.5, P1[1] + p[1] * hw * 0.5); ctx.closePath(); ctx.fill(); ctx.restore();
      // gola / decote
      ctx.strokeStyle = shade(C.torso, 0.55); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(N[0] - p[0] * 8, N[1] - p[1] * 8 + 2); ctx.lineTo(N[0] - u[0] * 12, N[1] - u[1] * 12); ctx.lineTo(N[0] + p[0] * 8, N[1] + p[1] * 8 + 2); ctx.stroke();
      if (D.includes('vest')) {
        ctx.fillStyle = '#4a2a16'; ctx.beginPath(); ctx.moveTo(P1[0] + p[0] * 3, P1[1] + p[1] * 3); ctx.lineTo(P2[0] + p[0] * 5, P2[1] + p[1] * 5); ctx.lineTo(N[0] - u[0] * 14, N[1] - u[1] * 14); ctx.lineTo(H[0] - u[0] * 4, H[1] - u[1] * 4); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(P4[0] - p[0] * 3, P4[1] - p[1] * 3); ctx.lineTo(P3[0] - p[0] * 5, P3[1] - p[1] * 5); ctx.lineTo(N[0] - u[0] * 14, N[1] - u[1] * 14); ctx.lineTo(H[0] - u[0] * 4, H[1] - u[1] * 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      if (D.includes('tattoo')) {
        ctx.save(); ctx.strokeStyle = '#f2b70c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); for (let i = 0; i <= 6; i++) { const t = 0.15 + i * 0.12; ctx.lineTo(H[0] + ux * t + Math.sin(i * 1.8) * 9, H[1] + uy * t); } ctx.stroke(); ctx.restore();
      }
      if (D.includes('suspenders')) { ctx.strokeStyle = shade(C.accent, 0.8); ctx.lineWidth = 4; for (const k of [-0.45, 0.45]) { ctx.beginPath(); ctx.moveTo(H[0] + p[0] * hw * k, H[1] + p[1] * hw * k); ctx.lineTo(N[0] + p[0] * sw * k, N[1] + p[1] * sw * k); ctx.stroke(); } }
      // hachura de xilogravura
      ctx.save(); ctx.globalAlpha = 0.2; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      for (let i = 1; i <= 3; i++) { const t = i / 4; const px = H[0] + ux * t, py = H[1] + uy * t; ctx.beginPath(); ctx.moveTo(px - 12 * bw, py + 3); ctx.lineTo(px - 2, py - 2); ctx.stroke(); }
      ctx.restore();
      // cinto / faixa
      ctx.beginPath(); ctx.moveTo(P1[0], P1[1] - 3); ctx.lineTo(P4[0], P4[1] - 3); ctx.lineWidth = 8; ctx.strokeStyle = C.accent; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    }
    // ombros (deltoides)
    for (const sh of [rig.fa[0], rig.na[0]]) { ctx.beginPath(); ctx.arc(sh[0], sh[1], 8.5 * s, 0, Math.PI * 2); ctx.fillStyle = col(C.arms); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke(); }
    // --- cabeça ---
    const Hd = rig.head, R = rig.L.headR;
    if (!def.headless) { ctx.beginPath(); ctx.moveTo(N[0], N[1]); ctx.lineTo(Hd[0], Hd[1]); ctx.lineWidth = 12 * s; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 7 * s; ctx.strokeStyle = col(C.skin); ctx.stroke(); }
    if (def.headless) drawFireHead(ctx, rig, def, o, col, ink, thick, sil);
    else if (def.hair === 'gourd') drawGourd(ctx, rig, def, o, col, ink, thick, sil);
    else { dot(ctx, Hd, R + thick * 0.5, col(C.skin), ink); if (!sil) drawHead(ctx, rig, def, o, col, ink); }
    // --- membros da frente ---
    limbStroke(ctx, rig.nl, 14 * s * (bw > 1.1 ? 1.15 : 1) + thick, col(C.legs), ink); foot(ctx, rig.nl, col(C.shoes), ink, s);
    limbStroke(ctx, rig.na, 11 * s + thick, col(C.arms), ink); hand(ctx, rig.na, 6.5 * s + thick * 0.5, col(C.skin), ink, fist);
    if (!sil && !flash) drawDetails(ctx, rig, def, D);
    if (!sil) drawProp(ctx, rig, def, o, col, ink);
    ctx.restore();
  }
  function hand(ctx, arm, r, color, ink, fist) {
    const h = arm[2];
    if (fist) {
      const a = M.rad(arm[3]); const d = [Math.sin(a), Math.cos(a)];
      ctx.beginPath(); ctx.arc(h[0] + d[0] * 2, h[1] + d[1] * 2, r * 1.15, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
      ctx.lineWidth = 1.5; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(h[0] + d[0] * 2 + d[1] * i * 3.5 - d[0] * 1, h[1] + d[1] * 2 - d[0] * i * 3.5 - d[1] * 1); ctx.lineTo(h[0] + d[0] * 6 + d[1] * i * 3.5, h[1] + d[1] * 6 - d[0] * i * 3.5); ctx.stroke(); }
    } else {
      ctx.beginPath(); ctx.ellipse(h[0], h[1], r * 1.05, r * 0.85, M.rad(arm[3]) * -1, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
    }
  }
  // Detalhes de figurino por personagem
  function drawDetails(ctx, rig, def, D) {
    const C = def.colors, s = rig.s;
    const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    ctx.save(); ctx.lineCap = 'round';
    if (D.includes('necklace')) {
      ctx.fillStyle = C.accent; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(rig.neck[0] + i * 4, rig.neck[1] + 9 * s + Math.abs(i) * -1.5 + 3, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    }
    if (D.includes('kerchief')) { ctx.fillStyle = '#c8371d'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rig.neck[0] - 9, rig.neck[1] + 4); ctx.lineTo(rig.neck[0] + 9, rig.neck[1] + 4); ctx.lineTo(rig.neck[0] + 2, rig.neck[1] + 18); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (D.includes('sleeves')) {
      const cols = ['#2aa9b8', '#f2b70c', '#1f7a4d'];
      for (const arm of [rig.fa, rig.na]) for (let i = 0; i < 3; i++) { const p = mid(arm[0], arm[1], 0.25 + i * 0.25); ctx.beginPath(); ctx.arc(p[0], p[1], 7.5 * s, 0, Math.PI * 2); ctx.fillStyle = cols[i]; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); }
    }
    if (D.includes('paint')) {
      ctx.strokeStyle = '#c8371d'; ctx.lineWidth = 3;
      for (const arm of [rig.fa, rig.na]) for (let i = 0; i < 2; i++) { const p = mid(arm[0], arm[1], 0.35 + i * 0.25); ctx.beginPath(); ctx.moveTo(p[0] - 6, p[1]); ctx.lineTo(p[0] + 6, p[1]); ctx.stroke(); }
    }
    if (D.includes('tattoo')) {
      ctx.strokeStyle = '#e8712b'; ctx.lineWidth = 2.5;
      for (const arm of [rig.fa, rig.na]) { ctx.beginPath(); for (let i = 0; i <= 4; i++) { const p = mid(arm[0], arm[1], 0.15 + i * 0.18); ctx.lineTo(p[0] + Math.sin(i * 2) * 4, p[1]); } ctx.stroke(); }
    }
    if (D.includes('stripe')) {
      ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
      for (const leg of [rig.fl, rig.nl]) { const a = mid(leg[0], leg[1], 0.1), b = mid(leg[0], leg[1], 0.9); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
    if (D.includes('cuffs')) { for (const arm of [rig.fa, rig.na]) { const p = mid(arm[1], arm[2], 0.82); ctx.beginPath(); ctx.arc(p[0], p[1], 6.5 * s, 0, Math.PI * 2); ctx.fillStyle = shade(C.arms, 0.9); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); } }
    if (D.includes('watch')) { const p = mid(rig.fa[1], rig.fa[2], 0.85); ctx.beginPath(); ctx.arc(p[0], p[1], 6 * s, 0, Math.PI * 2); ctx.fillStyle = '#141210'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#8d8a84'; ctx.stroke(); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, Math.PI * 2); ctx.fill(); }
    if (D.includes('sneakers')) { for (const leg of [rig.fl, rig.nl]) { const a = M.rad(leg[3]); const f = leg[2]; const tx = f[0] + Math.cos(a) * 13 * s, ty = f[1] - Math.sin(a) * 13 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(f[0] - Math.cos(a) * 3, f[1] - 2); ctx.quadraticCurveTo(f[0] + Math.cos(a) * 5, f[1] - 5, tx - Math.cos(a) * 2, ty + 1); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff8e8'; ctx.stroke(); } }
    if (D.includes('leaves')) {
      const lf = ['#3f8d4a', '#6fb35a', '#2f6b3a'];
      for (const arm of [rig.fa, rig.na]) for (let i = 0; i < 3; i++) { const q = mid(arm[0], arm[1], 0.2 + i * 0.28); leaf(ctx, q[0], q[1], 13 * s, 1.1 + i * 0.9, lf[i], INK); }
      for (let i = -3; i <= 3; i++) leaf(ctx, rig.hip[0] + i * 5.5 * s, rig.hip[1] - 4, (24 + (i % 2 ? 0 : 8)) * s, Math.PI / 2 + i * 0.07, lf[Math.abs(i) % 3], INK);
    }
    if (D.includes('hooves')) {
      for (const leg of [rig.fl, rig.nl]) {
        const q = mid(leg[1], leg[2], 0.5); ctx.beginPath(); ctx.arc(q[0], q[1], 9.5 * s, 0, Math.PI * 2); ctx.fillStyle = '#2a1a12'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
        const a = M.rad(leg[3]), f = leg[2]; ctx.strokeStyle = '#d6d6dc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f[0] + Math.cos(a) * 8 * s, f[1] - Math.sin(a) * 8 * s, 6 * s, a + 0.6, a + Math.PI - 0.6); ctx.stroke();
      }
    }
    if (D.includes('shawl') || D.includes('coat')) {
      const coat = D.includes('coat'); const hx = rig.hip[0], hy = rig.hip[1];
      const wi = (coat ? 15 : 19) * s * def.body.build, drop = (coat ? 58 : 36) * s, flare = (coat ? 6 : 15) * s;
      const sway = style.paint ? Math.sin(now() * 0.004) * 3 : 0;
      ctx.beginPath(); ctx.moveTo(hx - wi, hy - 7); ctx.lineTo(hx + wi, hy - 7); ctx.lineTo(hx + wi + flare, hy + drop); ctx.lineTo(hx + wi * 0.2 + sway, hy + drop - 8); ctx.lineTo(hx - wi * 0.4 + sway, hy + drop + 3); ctx.lineTo(hx - wi - flare, hy + drop - 4); ctx.closePath();
      ctx.fillStyle = coat ? '#1a1a22' : shade(C.torso, 0.88); ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.strokeStyle = coat ? C.accent : C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx - wi - flare + 2, hy + drop - 4); ctx.lineTo(hx - wi * 0.4 + sway, hy + drop + 3); ctx.lineTo(hx + wi * 0.2 + sway, hy + drop - 8); ctx.lineTo(hx + wi + flare - 1, hy + drop); ctx.stroke();
      if (coat) {
        ctx.strokeStyle = '#8f1d1d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx + 1, hy - 6); ctx.lineTo(hx + 4 + sway, hy + drop - 6); ctx.stroke();
        // gola alta
        const nk = rig.neck; ctx.fillStyle = '#1a1a22'; ctx.lineWidth = 2.5; ctx.strokeStyle = INK;
        ctx.beginPath(); ctx.moveTo(nk[0] - 11, nk[1] + 6); ctx.lineTo(nk[0] - 6, nk[1] - 14); ctx.lineTo(nk[0] + 1, nk[1] + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(nk[0] + 11, nk[1] + 6); ctx.lineTo(nk[0] + 8, nk[1] - 12); ctx.lineTo(nk[0] - 1, nk[1] + 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    if (D.includes('rope')) {
      const nk = rig.neck, hp = rig.hip; const ux = nk[0] - hp[0], uy = nk[1] - hp[1], L2 = Math.hypot(ux, uy) || 1; const pp = [-uy / L2, ux / L2], bw2 = def.body.build;
      const a = [nk[0] - pp[0] * 17 * bw2, nk[1] - pp[1] * 17 * bw2 + 4], b = [hp[0] + pp[0] * 14 * bw2, hp[1] + pp[1] * 14 * bw2];
      ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.strokeStyle = '#b8935a'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = 'rgba(70,45,20,0.7)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const q = mid(a, b, i / 6); ctx.beginPath(); ctx.moveTo(q[0] - 2, q[1] - 3); ctx.lineTo(q[0] + 2, q[1] + 3); ctx.stroke(); }
      const f0 = mid(a, b, 0.8); ctx.fillStyle = C.accent; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f0[0] + 6, f0[1] + 8, 9, 4, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(f0[0] + 14, f0[1] + 11); ctx.lineTo(f0[0] + 20, f0[1] + 7); ctx.lineTo(f0[0] + 20, f0[1] + 15); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (D.includes('buckle')) { ctx.fillStyle = '#f2b70c'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.fillRect(rig.hip[0] - 5, rig.hip[1] - 9, 10, 10); ctx.strokeRect(rig.hip[0] - 5, rig.hip[1] - 9, 10, 10); }
    if (D.includes('boots')) { for (const leg of [rig.fl, rig.nl]) { const p = mid(leg[1], leg[2], 0.75); ctx.beginPath(); ctx.arc(p[0], p[1], 9 * s, 0, Math.PI * 2); ctx.fillStyle = '#3a2416'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } }
    ctx.restore();
  }
  function foot(ctx, leg, color, ink, s) {
    const a = M.rad(leg[3]); const f = leg[2];
    const tx = f[0] + Math.cos(a) * 15 * s, ty = f[1] - Math.sin(a) * 15 * s;
    const bx = f[0] - Math.cos(a) * 5 * s, by = f[1] + Math.sin(a) * 5 * s;
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty);
    ctx.lineWidth = 17; ctx.strokeStyle = ink; ctx.stroke();
    ctx.lineWidth = 11; ctx.strokeStyle = color; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,248,232,0.5)'; ctx.beginPath(); ctx.moveTo(bx + Math.sin(a) * 4, by + Math.cos(a) * 4); ctx.lineTo(tx + Math.sin(a) * 4, ty + Math.cos(a) * 4); ctx.stroke();
  }

  const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);
  // Cabeça-chama da Mula-sem-Cabeça
  function drawFireHead(ctx, rig, def, o, col, ink, thick, sil) {
    const N = rig.neck, hu = rig.hu, s = rig.s, C = def.colors;
    const ang = Math.atan2(hu[1], hu[0]) + Math.PI / 2;
    const t = now() * 0.012;
    ctx.save(); ctx.translate(N[0] + hu[0] * 3, N[1] + hu[1] * 3); ctx.rotate(ang);
    if (!sil) {
      const g = ctx.createRadialGradient(0, -26 * s, 4, 0, -26 * s, 62);
      g.addColorStop(0, 'rgba(120,200,255,0.55)'); g.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -26 * s, 62, 0, Math.PI * 2); ctx.fill();
    }
    const tongues = [[-9, 0.7, 12], [0, 1, 17], [9, 0.82, 13], [-4, 0.5, 10], [5, 0.58, 10]];
    const layer = (k, color, outline) => {
      ctx.fillStyle = col(color);
      for (let i = 0; i < tongues.length; i++) {
        const [x, hk, w] = tongues[i]; const h = (62 * hk * k + Math.sin(t + i * 1.9) * 5) * s; const hw = (w * k + thick * 0.7) / 2; const sx = Math.sin(t * 0.8 + i) * 4;
        ctx.beginPath(); ctx.moveTo(x - hw, 4); ctx.quadraticCurveTo(x - hw - 3, -h * 0.55, x + sx, -h - thick); ctx.quadraticCurveTo(x + hw + 3, -h * 0.5, x + hw, 4); ctx.closePath(); ctx.fill();
        if (outline) { ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke(); }
      }
    };
    layer(1, '#2a6fd8', true); layer(0.72, '#4aa3ff', false); layer(0.46, '#bfe9ff', false); layer(0.22, '#fff8e8', false);
    // gola do pescoço decepado
    ctx.fillStyle = col('#3a1a14'); ctx.beginPath(); ctx.ellipse(0, 3, 12 * s + thick * 0.4, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke();
    if (!sil && style.paint) { ctx.fillStyle = 'rgba(255,200,120,0.9)'; for (let i = 0; i < 4; i++) { const k = ((t * 0.5 + i * 0.27) % 1); ctx.beginPath(); ctx.arc(Math.sin(i * 2.4 + t) * 14, -20 - k * 52, 2.2 * (1 - k), 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore();
  }
  // Cuia: cabeça de cabaça com rosto entalhado
  function drawGourd(ctx, rig, def, o, col, ink, thick, sil) {
    const H = rig.head, R = rig.L.headR, hu = rig.hu, C = def.colors;
    const ang = Math.atan2(hu[1], hu[0]) + Math.PI / 2;
    ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(ang); ctx.lineJoin = 'round';
    const body = () => { ctx.beginPath(); ctx.ellipse(1, 3, R + 4 + thick * 0.5, R + 2 + thick * 0.5, 0, 0, Math.PI * 2); ctx.moveTo(-1 + R * 0.55 + thick * 0.4, -R - 3); ctx.ellipse(-1, -R - 4, R * 0.58 + thick * 0.4, R * 0.5 + thick * 0.4, 0, 0, Math.PI * 2); };
    body(); ctx.fillStyle = col(C.hair); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
    // cabinho
    ctx.beginPath(); ctx.moveTo(-1, -R * 1.75); ctx.quadraticCurveTo(3, -R * 2.05 - thick * 0.3, 8, -R * 2.0); ctx.lineWidth = 6 + thick * 0.6; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = col('#7a5a22'); ctx.stroke();
    if (!sil) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(1, 3, R + 4, R + 2, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = 'rgba(70,40,10,0.28)'; ctx.beginPath(); ctx.ellipse(-R * 0.7, 6, R * 0.8, R + 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,170,0.35)'; ctx.beginPath(); ctx.ellipse(R * 0.35, -R * 0.55, R * 0.5, R * 0.28, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(70,40,10,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-4, -R - 1); ctx.lineTo(-1, -6); ctx.lineTo(-5, 2); ctx.stroke();
      ctx.restore();
      // rosto entalhado
      const hole = (x, y, w, h) => { ctx.fillStyle = '#1b1208'; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = ink; ctx.stroke(); };
      if (o.hurt) { ctx.lineWidth = 2.6; ctx.strokeStyle = '#1b1208'; ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(11, 0); ctx.moveTo(11, -6); ctx.lineTo(4, 0); ctx.moveTo(-5, -5); ctx.lineTo(0, -1); ctx.moveTo(0, -5); ctx.lineTo(-5, -1); ctx.stroke(); }
      else {
        hole(8, -3, 4.6, 4.2); hole(-2, -3, 3, 3);
        ctx.fillStyle = C.accent; ctx.shadowColor = C.accent; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(9, -3, 1.9, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-1.4, -3, 1.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
      ctx.lineWidth = 3; ctx.strokeStyle = '#1b1208'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(3, o.angry ? -10 : -9); ctx.lineTo(13, o.angry ? -6.5 : -9.5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-5, o.angry ? -8 : -8.5); ctx.lineTo(1, o.angry ? -9 : -8.5); ctx.stroke();
      // nariz entalhado + sorriso de dentes
      ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(11, -1); ctx.lineTo(13.5, 3.5); ctx.lineTo(10.5, 3.5); ctx.stroke();
      if (o.shout) { ctx.fillStyle = '#1b1208'; ctx.beginPath(); ctx.ellipse(8, 9, 5, 5.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      else if (o.hurt) { ctx.beginPath(); ctx.ellipse(7, 9, 3.5, 2.6, 0, 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(1, 7); for (let i = 0; i < 6; i++) ctx.lineTo(1 + (i + 1) * 2.1, 7 + (i % 2 ? -1 : 2.2) + (o.angry ? 0 : 0.8)); ctx.stroke(); }
    }
    ctx.restore();
  }
  // Saco de estopa nas costas do Papa-Figo
  function drawSack(ctx, H, u, p, s, bw, col, ink, thick) {
    const k = now() * 0.004;
    const cx = H[0] + u[0] * 40 * s - p[0] * 26 * s * bw, cy = H[1] + u[1] * 40 * s - p[1] * 26 * s * bw;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.atan2(u[0], -u[1]) * 0.8 + Math.sin(k) * 0.05);
    const w = 22 * s + thick * 0.6, h = 34 * s + thick * 0.6;
    ctx.beginPath(); ctx.moveTo(-w * 0.5, -h * 0.9); ctx.quadraticCurveTo(-w * 1.2, -h * 0.1, -w * 0.9, h * 0.6); ctx.quadraticCurveTo(0, h * 1.05 + Math.sin(k * 2) * 2, w * 0.9, h * 0.6); ctx.quadraticCurveTo(w * 1.2, -h * 0.1, w * 0.5, -h * 0.9); ctx.quadraticCurveTo(0, -h * 0.7, -w * 0.5, -h * 0.9); ctx.closePath();
    ctx.fillStyle = col('#9a7a4a'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
    if (!thick) {
      ctx.strokeStyle = 'rgba(40,24,8,0.4)'; ctx.lineWidth = 1.4;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * w * 0.35, -h * 0.6); ctx.quadraticCurveTo(i * w * 0.5 + Math.sin(k + i) * 3, 0, i * w * 0.4, h * 0.8); ctx.stroke(); }
      // remendo e amarra
      ctx.fillStyle = '#6b3f22'; ctx.fillRect(-4, 2, 11, 9); ctx.strokeStyle = 'rgba(20,10,4,0.7)'; ctx.strokeRect(-4, 2, 11, 9);
      ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w * 0.6, -h * 0.82); ctx.lineTo(w * 0.6, -h * 0.82); ctx.stroke();
    }
    ctx.restore();
  }
  const leaf = (ctx, x, y, len, ang, fill, ink) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.38, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.38, 0, 0); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = ink; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(len * 0.8, 0); ctx.stroke(); ctx.restore(); };
  function drawHead(ctx, rig, def, o, col, ink) {
    const C = def.colors, H = rig.head, R = rig.L.headR, hu = rig.hu;
    const fwd = [-hu[1], hu[0]];
    const ang = Math.atan2(hu[1], hu[0]) + Math.PI / 2; // orientação da cabeça
    ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(ang);
    // rosto: orelha, olhos com branco e pupila, sobrancelhas, nariz, boca com expressão
    const angry = o.angry, happy = o.happy;
    ctx.fillStyle = col(C.skin); ctx.lineWidth = 2.5; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.ellipse(-R + 2, 1, 4, 5.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const eye = (ex, ey, w, h) => { ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.ellipse(ex, ey, w, h, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.8; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + 1.2, ey, h * 0.62, 0, Math.PI * 2); ctx.fill(); };
    if (o.hurt) { ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(5, -5); ctx.lineTo(10, -1); ctx.moveTo(10, -5); ctx.lineTo(5, -1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(0, -2); ctx.moveTo(0, -4); ctx.lineTo(-3, -2); ctx.stroke(); }
    else { eye(7.5, -3, 4.2, 3.4); eye(-2, -3, 2.6, 2.6); }
    ctx.lineWidth = 3; ctx.strokeStyle = col(C.hair === '#d8d2c4' ? '#8d8a84' : C.hair); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(3, angry ? -10 : -8.5); ctx.lineTo(12, angry ? -6.5 : -9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, angry ? -8 : -8.5); ctx.lineTo(0, angry ? -9 : -8.5); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(11, -1); ctx.lineTo(13.5, 3); ctx.lineTo(10.5, 3.5); ctx.stroke();
    ctx.lineWidth = 2.5;
    if (o.hurt) { ctx.beginPath(); ctx.ellipse(7, 8, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.stroke(); }
    else if (o.shout) { ctx.fillStyle = '#3a1a14'; ctx.beginPath(); ctx.ellipse(8, 8, 4.5, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff8e8'; ctx.fillRect(5, 4.5, 6, 2); }
    else if (angry) { ctx.beginPath(); ctx.moveTo(3, 8.5); ctx.lineTo(11, 7); ctx.stroke(); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(5, 8.2); ctx.lineTo(5.5, 10); ctx.moveTo(8, 7.7); ctx.lineTo(8.5, 9.5); ctx.stroke(); }
    else if (happy) { ctx.beginPath(); ctx.moveTo(2, 6); ctx.quadraticCurveTo(7, 12, 12, 5.5); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(4, 7.5); ctx.quadraticCurveTo(8, 9, 11.5, 6.5); ctx.stroke(); }
    const D = def.details || [];
    if (D.includes('glowEyes') && !o.hurt) { ctx.fillStyle = '#f2b70c'; ctx.shadowColor = '#f2b70c'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(7.5, -3, 4, 3.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-2, -3, 2.4, 2.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(8.5, -3, 1.6, 0, Math.PI * 2); ctx.fill(); }
    if (D.includes('redEyes') && !o.hurt) { ctx.fillStyle = '#ff3b2a'; ctx.shadowColor = '#ff3b2a'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(7.5, -3, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-2, -3, 2, 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#6b5440'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(4, 5); ctx.lineTo(10, 4); ctx.moveTo(-1, 3); ctx.lineTo(5, 2); ctx.stroke(); }
    if (D.includes('paint')) { ctx.strokeStyle = '#c8371d'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(3, 2); ctx.lineTo(12, 1); ctx.moveTo(3, 5); ctx.lineTo(12, 4); ctx.stroke(); }
    if (D.includes('scar')) { ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(13, 6); ctx.stroke(); }
    if (D.includes('earrings')) { ctx.fillStyle = C.accent; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; for (const sx of [-R + 2, R - 4]) { ctx.beginPath(); ctx.arc(sx, 8, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
    if (def.mustache) { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(2, 4); ctx.quadraticCurveTo(8, 1, 14, 4); ctx.stroke(); }
    if (def.beard === 'full') {
      // barba cheia fechada, da costeleta ao queixo, com bigode
      ctx.fillStyle = col(C.hair); ctx.beginPath(); ctx.moveTo(-R + 1, -2); ctx.quadraticCurveTo(-R - 2, R + 2, 0, R + 5); ctx.quadraticCurveTo(R + 3, R + 3, R + 1, 2);
      ctx.quadraticCurveTo(R - 3, 9, 3, 10); ctx.quadraticCurveTo(-6, 10, -R + 6, 4); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1, 3.5); ctx.quadraticCurveTo(7.5, 0.5, 13, 4); ctx.lineWidth = 4; ctx.strokeStyle = col(C.hair); ctx.stroke();
      ctx.fillStyle = col(C.hair); ctx.fillRect(-R + 1, -6, 5, 9);
    } else if (def.beard) { ctx.fillStyle = col(C.hair); ctx.beginPath(); ctx.moveTo(-8, 8); ctx.quadraticCurveTo(4, 30, 12, 8); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); }
    // cabelo / chapéu
    ctx.lineWidth = 3; ctx.strokeStyle = INK;
    switch (def.hair) {
      case 'short':
        ctx.fillStyle = col(C.hair); ctx.beginPath(); ctx.arc(0, 0, R + 1.5, Math.PI * 1.05, Math.PI * 2.05); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      case 'curly':
        ctx.fillStyle = col(C.hair);
        for (let i = 0; i < 9; i++) { const a = -Math.PI * 1.25 + i * (Math.PI * 1.5 / 8); const rr = i % 2 ? 9 : 7.5; ctx.beginPath(); ctx.arc(Math.cos(a) * (R + 1) - 2, Math.sin(a) * (R + 1), rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(-1, -2, R - 1, Math.PI * 1.1, Math.PI * 1.95); ctx.closePath(); ctx.fill();
        break;
      case 'braid':
        ctx.fillStyle = col(C.hair); ctx.beginPath(); ctx.arc(0, 0, R + 1.5, Math.PI * 1.0, Math.PI * 2.1); ctx.closePath(); ctx.fill(); ctx.stroke();
        const sw3 = style.paint ? Math.sin(performance.now() * 0.004) * 6 : 0; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-R + 2, 0); ctx.quadraticCurveTo(-R - 14 + sw3, 20, -R - 6 + sw3 * 1.4, 48);
        ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = col(C.hair); ctx.stroke();
        ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(-R - 6, 48, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(2, -1); ctx.lineTo(13, -1); ctx.stroke();
        break;
      case 'hat':
        ctx.fillStyle = col('#5a3a22'); ctx.beginPath(); ctx.ellipse(0, -R + 4, R * 1.65, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R + 3, -R + 4); ctx.lineTo(-R + 6, -R - 14); ctx.lineTo(R - 4, -R - 15); ctx.lineTo(R - 2, -R + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-R + 5, -R - 1); ctx.lineTo(R - 3, -R - 1); ctx.stroke();
        break;
      case 'flame':
        ctx.fillStyle = col('#e8712b');
        [[-10, -R + 2, -4, -R - 16], [-2, -R, 4, -R - 24], [7, -R + 2, 11, -R - 14]].forEach(f => { ctx.beginPath(); ctx.moveTo(f[0], f[1]); ctx.lineTo(f[2], f[3]); ctx.lineTo(f[0] + 9, f[1]); ctx.closePath(); ctx.fill(); ctx.stroke(); });
        ctx.fillStyle = col('#f2b70c'); ctx.beginPath(); ctx.moveTo(0, -R + 1); ctx.lineTo(4, -R - 12); ctx.lineTo(7, -R + 1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.lineTo(-2, 4); ctx.stroke();
        break;
      case 'crop': {
        // curto nas laterais, topo cheio penteado pro lado (como na foto)
        ctx.fillStyle = col(C.hair);
        ctx.beginPath(); ctx.arc(0, 0, R + 2, Math.PI * 0.98, Math.PI * 2.04); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R - 1, -3); ctx.quadraticCurveTo(-R - 4, -R - 10, -2, -R - 11); ctx.quadraticCurveTo(R - 1, -R - 12, R + 6, -R + 2); ctx.quadraticCurveTo(R - 4, -R + 3, R - 8, -R + 1); ctx.quadraticCurveTo(0, -R - 3, -R + 1, -R + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillRect(-R - 2, -4, 5, 10); ctx.strokeRect(-R - 2, -4, 5, 10);
        ctx.strokeStyle = shade(C.hair, 1.9); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-4, -R - 5); ctx.quadraticCurveTo(4, -R - 8, R - 2, -R - 3); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3;
        break;
      }
      case 'pompadour':
        ctx.fillStyle = col(C.hair);
        ctx.beginPath(); ctx.arc(0, 0, R + 1.5, Math.PI * 1.0, Math.PI * 2.0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R - 2, -4); ctx.quadraticCurveTo(-R - 8, -R - 18, 0, -R - 19); ctx.quadraticCurveTo(R + 4, -R - 18, R + 9, -R + 1); ctx.quadraticCurveTo(R - 2, -R + 4, R - 6, -R + 1); ctx.quadraticCurveTo(0, -R - 5, -R + 2, -R + 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R, -2); ctx.lineTo(-R, 6); ctx.lineWidth = 5; ctx.strokeStyle = col(C.hair); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = INK;
        break;
      case 'cap':
        ctx.fillStyle = col(C.hair); ctx.beginPath(); ctx.arc(0, 0, R + 1.5, Math.PI * 1.05, Math.PI * 2.05); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col(C.accent); ctx.beginPath(); ctx.arc(0, -2, R + 1, Math.PI * 1.08, Math.PI * 1.95); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(R - 4, -6); ctx.lineTo(R + 14, -3); ctx.lineTo(R - 2, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'long': {
        const sw = style.paint ? Math.sin(now() * 0.003) * 5 : 0;
        ctx.fillStyle = col(C.hair);
        ctx.beginPath(); ctx.moveTo(-R + 2, -6); ctx.quadraticCurveTo(-R - 18 + sw, 26, -R - 9 + sw * 1.6, 88); ctx.quadraticCurveTo(-R + 4 + sw * 1.2, 80, -R + 14, 78); ctx.quadraticCurveTo(-R + 6, 34, -2, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,110,100,0.45)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-R + 1 - i * 2, 4 + i * 6); ctx.quadraticCurveTo(-R - 8 + sw - i * 2, 40, -R - 3 + sw * 1.4 + i * 3, 80); ctx.stroke(); }
        ctx.strokeStyle = INK; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, R + 2, Math.PI * 0.95, Math.PI * 2.08); ctx.closePath(); ctx.fill(); ctx.stroke();
        // franja cobrindo o olho de trás
        ctx.beginPath(); ctx.moveTo(-10, -R); ctx.quadraticCurveTo(-13, 2, -7, 13); ctx.quadraticCurveTo(-1, 4, 3, -R + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        leaf(ctx, 1, -R - 1, 15, -1.2, col('#3f8d4a'), INK); leaf(ctx, 3, -R, 13, -0.3, col('#6fb35a'), INK);
        ctx.fillStyle = col('#c8371d'); ctx.beginPath(); ctx.arc(-6, -R + 1, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        break;
      }
      case 'fedora': {
        ctx.fillStyle = col('#15131a');
        ctx.beginPath(); ctx.ellipse(1, -R + 5, R * 1.95, 5.6, -0.06, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R + 3, -R + 5); ctx.quadraticCurveTo(-R + 2, -R - 16, -2, -R - 16); ctx.quadraticCurveTo(2, -R - 9, 6, -R - 16); ctx.quadraticCurveTo(R - 1, -R - 16, R - 1, -R + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col(C.accent); ctx.fillRect(-R + 3, -R - 3, 2 * R - 4, 6); ctx.strokeRect(-R + 3, -R - 3, 2 * R - 4, 6);
        ctx.fillStyle = 'rgba(8,6,10,0.5)'; ctx.beginPath(); ctx.ellipse(1, -R + 12, R * 1.0, 6, 0, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'straw':
        ctx.fillStyle = col('#d9c27a'); ctx.beginPath(); ctx.ellipse(0, -R + 5, R * 2.0, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R + 3, -R + 5); ctx.lineTo(-R + 5, -R - 9); ctx.lineTo(R - 5, -R - 9); ctx.lineTo(R - 3, -R + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#8d8a84'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-R + 4, -R - 2); ctx.lineTo(R - 4, -R - 2); ctx.stroke();
        break;
    }
    if (D.includes('glasses')) {
      // óculos azul-marinho retangulares: lente da frente, lente de trás, ponte e haste até a orelha
      ctx.lineWidth = 3; ctx.strokeStyle = '#1c3f8c'; ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(2, -8.5, 13, 10, 3) : ctx.rect(2, -8.5, 13, 10); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-8, -8.5, 8, 10, 3) : ctx.rect(-8, -8.5, 8, 10); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -4.5); ctx.lineTo(2, -4.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(-R + 2, -3); ctx.stroke();
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.moveTo(4, -6.5); ctx.lineTo(8, -6.5); ctx.stroke();
    }
    if (D.includes('headband')) {
      ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-R + 1, -7); ctx.lineTo(R - 1, -7); ctx.stroke();
      ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.stroke();
      const sw2 = style.paint ? Math.sin(performance.now() * 0.006) * 5 : 0; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-R + 1, -7); ctx.quadraticCurveTo(-R - 12 + sw2, -2, -R - 16 + sw2 * 1.5, 8 + Math.abs(sw2)); ctx.stroke();
    }
    ctx.restore();
  }
  function drawProp(ctx, rig, def, o, col, ink) {
    const C = def.colors;
    if (def.prop === 'umbrella') {
      const hand = rig.na[2], a = M.rad(rig.na[3]);
      const d = [Math.sin(a), Math.cos(a)];
      const tip = [hand[0] + d[0] * 36, hand[1] + d[1] * 36], base = [hand[0] - d[0] * 10, hand[1] - d[1] * 10];
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(tip[0], tip[1]);
      ctx.lineWidth = 8; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = col('#8b5a2b'); ctx.stroke();
      ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(Math.atan2(d[1], d[0]));
      if (o.umbrellaOpen) {
        const cols = ['#f2b70c', '#c7267a', '#2aa9b8', '#1f7a4d', '#c8371d', '#f2b70c'];
        const r = 40;
        for (let i = 0; i < 6; i++) { const a0 = Math.PI / 2 + i * Math.PI / 6, a1 = a0 + Math.PI / 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath(); ctx.fillStyle = col(cols[i]); ctx.fill(); }
        ctx.beginPath(); ctx.arc(0, 0, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.lineWidth = 4; ctx.strokeStyle = ink; ctx.stroke();
      } else {
        ctx.fillStyle = col('#c7267a'); ctx.beginPath(); ctx.moveTo(-14, -5); ctx.lineTo(10, 0); ctx.lineTo(-14, 5); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke();
      }
      ctx.restore();
    } else if (def.prop === 'sanfona') {
      const hand = rig.na[2], a = M.rad(rig.na[3]);
      const d = [Math.sin(a), Math.cos(a)];
      ctx.save(); ctx.translate(hand[0] + 4, hand[1] + 2); ctx.rotate(o.angry ? Math.atan2(d[1], d[0]) : -0.15);
      const open = 10 + (o.foleOpen || 0) * 10;
      ctx.lineWidth = 3; ctx.strokeStyle = ink;
      ctx.fillStyle = col('#c8371d'); ctx.fillRect(-open - 14, -16, 14, 32); ctx.strokeRect(-open - 14, -16, 14, 32);
      ctx.fillRect(open, -16, 14, 32); ctx.strokeRect(open, -16, 14, 32);
      ctx.fillStyle = col('#fff8e8'); for (let i = 0; i < 4; i++) ctx.fillRect(open + 3, -13 + i * 8, 8, 5);
      ctx.fillStyle = ink; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-open - 7, -8 + i * 8, 2.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); for (let i = 0; i <= 6; i++) { const x = -open + i * (open * 2 / 6); ctx.lineTo(x, i % 2 ? -12 : -16); } for (let i = 6; i >= 0; i--) { const x = -open + i * (open * 2 / 6); ctx.lineTo(x, i % 2 ? 12 : 16); } ctx.closePath(); ctx.fillStyle = col('#f2b70c'); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const x = -open + i * (open * 2 / 6); ctx.beginPath(); ctx.moveTo(x, i % 2 ? -12 : -16); ctx.lineTo(x, i % 2 ? 12 : 16); ctx.stroke(); }
      ctx.restore();
    } else if (def.prop === 'berimbau') {
      const hand = rig.na[2], a = M.rad(rig.na[3]);
      const d = [Math.sin(a), Math.cos(a)], n = [d[1], -d[0]];
      const base = [hand[0] - d[0] * 28, hand[1] - d[1] * 28], tip = [hand[0] + d[0] * 72, hand[1] + d[1] * 72];
      const cx = (base[0] + tip[0]) / 2 + n[0] * 22, cy = (base[1] + tip[1]) / 2 + n[1] * 22;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.quadraticCurveTo(cx, cy, tip[0], tip[1]);
      ctx.lineWidth = 9; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = col('#c9a060'); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(tip[0], tip[1]); ctx.lineWidth = 2; ctx.strokeStyle = '#fff8e8'; ctx.stroke();
      const g = [base[0] + d[0] * 14 + n[0] * 8, base[1] + d[1] * 14 + n[1] * 8];
      ctx.beginPath(); ctx.arc(g[0], g[1], 11, 0, Math.PI * 2); ctx.fillStyle = col('#c47a4a'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
      ctx.beginPath(); ctx.arc(g[0] + n[0] * 5, g[1] + n[1] * 5, 4, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill();
    } else if (def.prop === 'pipe') {
      const hand = rig.na[2], a = M.rad(rig.na[3]); const d = [Math.sin(a), Math.cos(a)]; const k = now() * 0.003;
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hand[0] - d[0] * 6, hand[1] - d[1] * 6); ctx.lineTo(hand[0] + d[0] * 18, hand[1] + d[1] * 18);
      ctx.lineWidth = 7; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 3.5; ctx.strokeStyle = col('#6b3f22'); ctx.stroke();
      const bowl = [hand[0] + d[0] * 20, hand[1] + d[1] * 20 - 5]; ctx.beginPath(); ctx.arc(bowl[0], bowl[1], 6.5, 0, Math.PI * 2); ctx.fillStyle = col('#3a2416'); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke();
      ctx.fillStyle = col('#e8712b'); ctx.beginPath(); ctx.arc(bowl[0], bowl[1] - 2, 2.6, 0, Math.PI * 2); ctx.fill();
      if (!o.silhouette) { ctx.globalAlpha = 0.55; ctx.fillStyle = '#cfc8b4'; for (let i = 0; i < 3; i++) { const kk = (k + i * 0.33) % 1; ctx.beginPath(); ctx.arc(bowl[0] + Math.sin(kk * 6 + i) * 6, bowl[1] - 8 - kk * 34, 4 + kk * 7, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
    } else if (def.prop === 'rod') {
      const hand = rig.na[2], a = M.rad(rig.na[3]); const d = [Math.sin(a), Math.cos(a)];
      const base = [hand[0] - d[0] * 22, hand[1] - d[1] * 22], tip = [hand[0] + d[0] * 92, hand[1] + d[1] * 92 - 10];
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.quadraticCurveTo((base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2 - 16, tip[0], tip[1]);
      ctx.lineWidth = 7; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 3.4; ctx.strokeStyle = col('#8b5a2b'); ctx.stroke();
      if (!o.silhouette) { const sw = Math.sin(now() * 0.004) * 4; ctx.strokeStyle = '#e9e4d4'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.quadraticCurveTo(tip[0] + sw, tip[1] + 22, tip[0] + 2, tip[1] + 44); ctx.stroke(); ctx.strokeStyle = '#8d8a84'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tip[0] + 2 + 2, tip[1] + 48, 4.5, -0.3, Math.PI * 1.2); ctx.stroke(); }
    } else if (def.prop === 'oar') {
      const hand = rig.na[2], a = M.rad(rig.na[3]);
      const d = [Math.sin(a), Math.cos(a)];
      const tip = [hand[0] + d[0] * 62, hand[1] + d[1] * 62], base = [hand[0] - d[0] * 26, hand[1] - d[1] * 26];
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(tip[0], tip[1]);
      ctx.lineWidth = 9; ctx.strokeStyle = ink; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = col('#8b5a2b'); ctx.stroke();
      ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(Math.atan2(d[1], d[0]));
      ctx.beginPath(); ctx.ellipse(8, 0, 20, 10, 0, 0, Math.PI * 2); ctx.fillStyle = col('#a86a32'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke();
      ctx.restore();
    }
  }

  // ---------- lutador em cena ----------
  function drawFighter(ctx, f, opts = {}) {
    const def = f.def;
    ctx.save();
    ctx.translate(f.x, f.y); ctx.scale(f.facing, 1);
    const sq = f.squash || 0; if (sq > 0.02) ctx.scale(1 + sq * 0.16, 1 - sq * 0.16);
    else if (!f.grounded && f.vy < -7) ctx.scale(0.95, 1.06);
    const rig = computeRig(f.pose, def);
    if (style.paint && !opts.silhouette) {
      // contorno seletivo: silhueta externa grossa; depois rim light deslocada para o lado da luz
      drawRig(ctx, rig, def, { silhouette: INK, thick: 7 });
      drawRig(ctx, rig, def, { silhouette: style.rim, offset: [-style.light.x * 3.2, -style.light.y * 3.2], alpha: 0.85 });
    }
    const o = Object.assign({
      flash: f.flash > 0, angry: f.state === 'attack', hurt: f.state === 'hitstun' || f.state === 'knockdown' || f.state === 'ko' || f.state === 'thrown',
      shout: f.state === 'taunt' || (f.move && f.move.pose === 'shout'), happy: f.state === 'win' || (f.state === 'idle' && f.hp > f.maxHp * 0.6 && !f.arretado),
      umbrellaOpen: !!(f.move && f.move.umbrellaOpen) || f.state === 'taunt' || f.state === 'win', foleOpen: f.state === 'attack' ? 1 : (f.ritmo > 0 ? (Math.sin(f.animT * 8) + 1) / 2 : 0.3),
      glow: def.prop === 'fire' ? 'rgba(232,113,43,0.28)' : (f.armorNow ? 'rgba(242,183,12,0.45)' : (f.superFlash > 0 ? 'rgba(255,255,255,0.5)' : (f.arretado ? 'rgba(200,55,29,0.3)' : null)))
    }, opts);
    drawRig(ctx, rig, def, o);
    ctx.restore();
    return rig;
  }
  function drawGhost(ctx, g, def) {
    ctx.save(); ctx.translate(g.x, g.y); ctx.scale(g.facing, 1);
    const rig = computeRig(g.pose, def);
    drawRig(ctx, rig, def, { silhouette: g.color, alpha: g.alpha });
    ctx.restore();
  }
  function drawShadow(ctx, f) {
    const h = Math.max(0, M.GROUND - f.y);
    const sc = M.clamp(1 - h / 400, 0.4, 1);
    ctx.save(); ctx.globalAlpha = 0.35 * sc; ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(f.x, M.GROUND + 4, 38 * sc * f.def.body.build, 8 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawPortrait(canvas, def, opts = {}) {
    const ctx = canvas.getContext('2d'); const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 - 6, h - 10); const hs = def.body.height, extra = def.headless ? 52 : (['fedora', 'hat', 'straw', 'flame', 'gourd', 'pompadour'].includes(def.hair) ? 34 : 16); const sc = opts.scale || Math.min(h / 190, (h - 16) / (160 * hs + extra)); ctx.scale(sc * (opts.facing || 1), sc);
    const pose = opts.pose || M.poses.idlePose(def.idle, opts.t || 0.6, def.idleOver);
    const rig = computeRig(pose, def);
    drawRig(ctx, rig, def, { umbrellaOpen: def.prop === 'umbrella', happy: true, glow: def.prop === 'fire' ? 'rgba(232,113,43,0.3)' : null, flash: opts.flash, silhouette: opts.silhouette });
    ctx.restore();
  }

  // ---------- projéteis ----------
  function drawProjectile(ctx, p) {
    const t = p.age;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.dir, 1);
    if (p.ex) { ctx.shadowColor = '#c7267a'; ctx.shadowBlur = 18; ctx.scale(1.25, 1.25); }
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
    switch (p.kind) {
      case 'wave': {
        ctx.fillStyle = '#2aa9b8'; ctx.beginPath(); ctx.moveTo(-30, 30); ctx.quadraticCurveTo(-20, -40, 30, -34); ctx.quadraticCurveTo(10, -10, 32, 20); ctx.quadraticCurveTo(0, 30, -30, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff8e8'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(14 + Math.sin(t * 0.4 + i) * 6, -30 + i * 9, 5 - i, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'ripple': {
        ctx.fillStyle = '#1c4e9c'; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-10, -30, 30, -4); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(18 + Math.sin(t * 0.5) * 4, -16, 4, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'rain': {
        ctx.fillStyle = '#2aa9b8';
        for (let i = 0; i < 5; i++) { const ox = (i - 2) * 9, oy = (i % 2) * 10 - 8; ctx.beginPath(); ctx.moveTo(ox, oy - 12); ctx.quadraticCurveTo(ox + 7, oy + 2, ox, oy + 8); ctx.quadraticCurveTo(ox - 7, oy + 2, ox, oy - 12); ctx.fill(); ctx.stroke(); }
        break;
      }
      case 'ember': {
        for (let i = 3; i >= 1; i--) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#e8712b'; ctx.beginPath(); ctx.arc(-i * 12, Math.sin(t * 0.8 + i) * 4, 16 - i * 3, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#e8712b'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f2b70c'; ctx.beginPath(); ctx.arc(3, -2, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(5, -4, 3.5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'bug': {
        const g = Math.floor(t / 3) % 3;
        ctx.fillStyle = '#c7267a'; ctx.fillRect(-16 + (g === 1 ? 6 : 0), -12, 32, 8);
        ctx.fillStyle = '#2aa9b8'; ctx.fillRect(-16 - (g === 2 ? 6 : 0), 4, 32, 8);
        ctx.fillStyle = '#141210'; ctx.fillRect(-14, -8, 28, 18); ctx.strokeStyle = INK; ctx.strokeRect(-14, -8, 28, 18);
        ctx.fillStyle = '#2aa9b8'; ctx.fillRect(-10, -4, 6, 6); ctx.fillRect(4, -4, 6, 6); ctx.fillRect(-6, 4, 12, 3);
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(18, -16); ctx.moveTo(-10, -8); ctx.lineTo(-18, -16); ctx.moveTo(-14, 2); ctx.lineTo(-22, 8); ctx.moveTo(14, 2); ctx.lineTo(22, 8); ctx.stroke();
        break;
      }
      case 'boomerang': {
        ctx.rotate(t * 0.5); const cols = ['#f2b70c', '#c7267a', '#2aa9b8', '#1f7a4d', '#c8371d', '#f2b70c'];
        for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 24, i * Math.PI / 3, (i + 1) * Math.PI / 3); ctx.closePath(); ctx.fillStyle = cols[i]; ctx.fill(); }
        ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineWidth = 4; ctx.stroke();
        break;
      }
      case 'net': {
        ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 10, -24); ctx.lineTo(i * 10 + Math.sin(t * 0.3) * 4, 24); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-32, i * 7); ctx.lineTo(32, i * 7 + Math.cos(t * 0.3) * 3); ctx.stroke(); }
        ctx.fillStyle = '#f2b70c'; for (const [x, y] of [[-30, -22], [30, -22], [-30, 22], [30, 22]]) { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke(); }
        break;
      }
      case 'tide': {
        ctx.fillStyle = '#1c4e9c'; ctx.beginPath(); ctx.moveTo(-32, 80); ctx.quadraticCurveTo(-30, -70, 22, -78); ctx.quadraticCurveTo(0, -30, 32, 80); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2aa9b8'; ctx.beginPath(); ctx.moveTo(-20, 80); ctx.quadraticCurveTo(-18, -40, 14, -60); ctx.quadraticCurveTo(4, -10, 22, 80); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff8e8'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(10 + Math.sin(t * 0.4 + i) * 8, -70 + i * 14, 6 - i * 0.6, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'snake': {
        for (let i = 5; i >= 0; i--) { const sx = -i * 12, sy = Math.sin(t * 0.4 + i) * 6; ctx.fillStyle = i % 2 ? '#e8712b' : '#c8371d'; ctx.beginPath(); ctx.arc(sx, sy, 14 - i * 1.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = '#f2b70c'; ctx.beginPath(); ctx.moveTo(8, -12); ctx.lineTo(30, 0); ctx.lineTo(8, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(14, -3, 2.5, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'ash': {
        ctx.fillStyle = '#8d8a84';
        for (let i = 0; i < 5; i++) { const a = t * 0.1 + i * 1.3; ctx.beginPath(); ctx.arc(Math.cos(a) * 16, Math.sin(a * 1.3) * 22, 16 + (i % 2) * 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = '#4a4744'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'pororoca': {
        const hgt = 185, w = 140;
        ctx.fillStyle = '#1c4e9c'; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + 10, -hgt * 0.9, w / 2 - 20, -hgt); ctx.quadraticCurveTo(w / 2 - 60, -hgt * 0.75, w / 2 - 40, -hgt * 0.55); ctx.quadraticCurveTo(w / 2 + 10, -hgt * 0.4, w / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2aa9b8'; ctx.beginPath(); ctx.moveTo(-w / 2 + 14, 0); ctx.quadraticCurveTo(-w / 2 + 20, -hgt * 0.7, w / 2 - 40, -hgt * 0.8); ctx.quadraticCurveTo(w / 2 - 50, -hgt * 0.4, w / 2 - 20, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff8e8'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(w / 2 - 30 - i * 14 + Math.sin(t * 0.5 + i) * 5, -hgt + 6 + i * 6, 9 - i * 0.8, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'whistle': {
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const r = 8 + i * 9 + (t % 6); ctx.globalAlpha = 0.95 - i * 0.22; ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(-6, 0, r, -0.9, 0.9); ctx.stroke(); ctx.lineWidth = 2.6; ctx.strokeStyle = i % 2 ? '#fff8e8' : '#2aa9b8'; ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#f2b70c'; M.star(ctx, -6, 0, 9, 4, 6); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
        break;
      }
      case 'leaf': {
        for (let i = 0; i < 3; i++) leaf(ctx, Math.cos(t * 0.35 + i * 2.1) * 10 - 6, Math.sin(t * 0.35 + i * 2.1) * 10, 22, t * 0.3 + i * 2.1, i % 2 ? '#6fb35a' : '#3f8d4a', INK);
        break;
      }
      case 'leafstorm': {
        const hh = p.h / 2; ctx.globalAlpha = 0.28; ctx.fillStyle = '#2f6b3a'; ctx.beginPath(); ctx.moveTo(-10, hh); ctx.quadraticCurveTo(-62, 0, -26, -hh); ctx.lineTo(26, -hh); ctx.quadraticCurveTo(66, 0, 10, hh); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        for (let i = 0; i < 16; i++) { const ph = (t * 0.07 + i / 16) % 1; const y = hh - ph * hh * 2, r = 22 + ph * 40; const a = t * 0.25 + i * 1.7; leaf(ctx, Math.cos(a) * r, y, 20, a + Math.PI / 2, i % 3 === 0 ? '#c9a33a' : i % 2 ? '#6fb35a' : '#3f8d4a', INK); }
        break;
      }
      case 'smoke': {
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 8; i++) { const a = t * 0.05 + i * 0.8; ctx.fillStyle = i % 2 ? '#cfc8b4' : '#a9a595'; ctx.beginPath(); ctx.arc(Math.cos(a) * 30, Math.sin(a * 1.2) * 22, 22 + (i % 3) * 6, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#7a7566'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'bluefire': {
        for (let i = 3; i >= 1; i--) { ctx.globalAlpha = 0.28; ctx.fillStyle = '#2a6fd8'; ctx.beginPath(); ctx.arc(-i * 13, Math.sin(t * 0.8 + i) * 4, 17 - i * 3, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#2a6fd8'; ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4aa3ff'; ctx.beginPath(); ctx.arc(3, -1, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#bfe9ff'; ctx.beginPath(); ctx.arc(5, -3, 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8712b'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-14 - i * 9, Math.sin(t * 0.7 + i * 2) * 8, 3 - i * 0.6, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'sack': {
        ctx.rotate(t * 0.12);
        ctx.fillStyle = '#9a7a4a'; ctx.beginPath(); ctx.moveTo(-12, -26); ctx.quadraticCurveTo(-34, -4, -26, 18); ctx.quadraticCurveTo(0, 36, 26, 18); ctx.quadraticCurveTo(34, -4, 12, -26); ctx.quadraticCurveTo(0, -20, -12, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -24); ctx.lineTo(14, -24); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,24,8,0.5)'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 9, -16); ctx.quadraticCurveTo(i * 13, 2, i * 10, 22); ctx.stroke(); }
        break;
      }
      case 'lullaby': {
        ctx.fillStyle = '#c7267a'; ctx.strokeStyle = INK;
        for (let i = 0; i < 3; i++) { const ox = Math.sin(t * 0.18 + i * 2) * 12 - 6 + i * 4, oy = -18 + i * 17 + Math.cos(t * 0.15 + i) * 5; ctx.beginPath(); ctx.ellipse(ox, oy + 7, 7, 5, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox + 5, oy + 5); ctx.lineTo(ox + 5, oy - 12); ctx.lineTo(ox + 13, oy - 8); ctx.lineWidth = 3; ctx.stroke(); }
        ctx.fillStyle = '#fff8e8'; ctx.font = `bold 20px ${M.FONT_DISPLAY || 'sans-serif'}`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeText('Z', 20, -20 + Math.sin(t * 0.2) * 3); ctx.fillText('Z', 20, -20 + Math.sin(t * 0.2) * 3); ctx.font = `bold 14px ${M.FONT_DISPLAY || 'sans-serif'}`; ctx.strokeText('z', 28, 4); ctx.fillText('z', 28, 4);
        break;
      }
      case 'hook': {
        const ox = (p.owner.x - p.x) * p.dir, oy = (p.owner.y - 96 - p.y);
        ctx.strokeStyle = '#e9e4d4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(ox * 0.5, oy * 0.5 + 14, ox, oy); ctx.stroke();
        ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-6, -16); ctx.lineTo(-6, 6); ctx.arc(2, 6, 8, Math.PI, Math.PI * 0.2, true); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#d6d6dc'; ctx.stroke();
        ctx.fillStyle = '#d6d6dc'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(16, -6); ctx.lineTo(13, 4); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
        break;
      }
      case 'gourd': {
        ctx.rotate(t * 0.22);
        ctx.fillStyle = '#c9993a'; ctx.beginPath(); ctx.ellipse(0, 4, 20, 17, 0, 0, Math.PI * 2); ctx.ellipse(0, -14, 11, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1b1208'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2aa9b8'; ctx.beginPath(); ctx.ellipse(0, 2, 10, 4, 0, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#fff8e8'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(Math.cos(t * 0.5 + i * 2) * 14, -22 + Math.sin(t * 0.5 + i * 2) * 8, 3, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'fish': {
        ctx.rotate(Math.sin(t * 0.4) * 0.35 + 0.5);
        ctx.fillStyle = '#2aa9b8'; ctx.beginPath(); ctx.ellipse(0, 0, 21, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-30, -9); ctx.lineTo(-30, 9); ctx.closePath(); ctx.fillStyle = '#f2b70c'; ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(11, -2, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(12, -2, 1.4, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'whirl': {
        const hh = p.h / 2;
        for (let i = 0; i < 7; i++) { const k = i / 6, y = -hh + k * hh * 2, r = 16 + k * 52; ctx.globalAlpha = 0.9; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(0, y, r, 9 + k * 6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = i % 2 ? '#2aa9b8' : '#1c4e9c'; ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff8e8'; for (let i = 0; i < 8; i++) { const a = t * 0.3 + i * 0.8, k = (i / 8 + t * 0.01) % 1; ctx.beginPath(); ctx.arc(Math.cos(a) * (14 + k * 50), -hh + k * hh * 2, 3.5, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'serpent': {
        const segs = 9;
        for (let i = segs - 1; i >= 0; i--) { const sx = -i * 18 + 40, sy = Math.sin(t * 0.25 + i * 0.7) * 24 - 90; const r = 26 - i * 1.6; ctx.fillStyle = i % 2 ? '#e8712b' : '#c8371d'; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#f2b70c'; ctx.beginPath(); ctx.arc(sx, sy - 6, r * 0.4, 0, Math.PI * 2); ctx.fill(); }
        const hy = Math.sin(t * 0.25) * 24 - 90;
        ctx.fillStyle = '#f2b70c'; ctx.beginPath(); ctx.moveTo(44, hy - 24); ctx.lineTo(80, hy - 6); ctx.lineTo(44, hy + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(56, hy - 10, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c8371d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(80, hy - 6); ctx.lineTo(96, hy - 12); ctx.moveTo(80, hy - 6); ctx.lineTo(96, hy); ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }
  function drawTrap(ctx, tr) {
    const t = tr.age; ctx.save(); ctx.translate(tr.x, M.GROUND);
    if (tr.mv.trap.wall) {
      const h = tr.h, w = tr.w; const a = tr.armed ? 0.55 + Math.sin(t * 0.3) * 0.15 : 0.25;
      ctx.globalAlpha = a; ctx.fillStyle = '#2aa9b8'; ctx.fillRect(-w / 2, -h, w, h);
      ctx.globalAlpha = 1; ctx.strokeStyle = '#e8712b'; ctx.lineWidth = 3; ctx.strokeRect(-w / 2, -h, w, h);
      ctx.strokeStyle = '#fff8e8'; ctx.lineWidth = 2; for (let y = -h + 10; y < 0; y += 22) { const sh = ((t * 2) % 22); ctx.beginPath(); ctx.moveTo(-w / 2 + 4, y + sh); ctx.lineTo(w / 2 - 4, y + sh); ctx.stroke(); }
      ctx.fillStyle = INK; ctx.font = `12px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.fillText('FIREWALL', 0, -h - 6);
      ctx.restore(); return;
    }
    const tk = tr.mv.trap.kind;
    if (tk === 'vine') {
      const a = tr.armed ? 1 : 0.55; ctx.globalAlpha = a; ctx.lineCap = 'round';
      for (let i = -3; i <= 3; i++) { const h = (22 + (i * i % 5) * 7) + Math.sin(t * 0.2 + i) * 4, x = i * 10; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + Math.sin(i * 2) * 12, -h * 0.6, x + Math.sin(i) * 14, -h); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = i % 2 ? '#3f8d4a' : '#2f6b3a'; ctx.stroke(); ctx.fillStyle = '#d9b34a'; ctx.beginPath(); ctx.moveTo(x + Math.sin(i) * 14 - 3, -h); ctx.lineTo(x + Math.sin(i) * 14, -h - 8); ctx.lineTo(x + Math.sin(i) * 14 + 3, -h); ctx.fill(); }
      ctx.restore(); return;
    }
    if (tk === 'horseshoe') {
      const fl2 = 1 + Math.sin(t * 0.5) * 0.12; ctx.globalAlpha = tr.armed ? 1 : 0.65;
      for (let i = 0; i < 3; i++) { const ox = (i - 1) * 18, h = (34 + (i % 2) * 16) * fl2; ctx.fillStyle = '#2a6fd8'; ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(ox - 11, 0); ctx.quadraticCurveTo(ox - 9, -h * 0.6, ox + Math.sin(t * 0.3 + i) * 5, -h); ctx.quadraticCurveTo(ox + 9, -h * 0.6, ox + 11, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.strokeStyle = '#d6d6dc'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -12, 17, Math.PI * 0.12, Math.PI * 0.88, true); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#bfe9ff'; ctx.beginPath(); ctx.ellipse(0, -8, 8, 13 * fl2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
    if (tk === 'puddle') {
      ctx.globalAlpha = tr.armed ? 0.95 : 0.6; ctx.fillStyle = '#1c4e9c'; ctx.beginPath(); ctx.ellipse(0, -4, 44, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      ctx.strokeStyle = '#2aa9b8'; ctx.lineWidth = 2.5; for (let i = 0; i < 3; i++) { const r = ((t * 0.6 + i * 14) % 42); ctx.globalAlpha = (1 - r / 42) * 0.9; ctx.beginPath(); ctx.ellipse(0, -4, r + 4, (r + 4) * 0.25, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff8e8'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-18 + i * 18, -9 - ((t * 0.5 + i * 7) % 12), 2.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore(); return;
    }
    const fl = 1 + Math.sin(t * 0.5) * 0.15;
    ctx.fillStyle = tr.armed ? '#2aa9b8' : '#e8712b'; ctx.lineWidth = 3; ctx.strokeStyle = INK;
    for (let i = 0; i < 3; i++) { const ox = (i - 1) * 18, h = (30 + (i % 2) * 14) * fl; ctx.beginPath(); ctx.moveTo(ox - 12, 0); ctx.quadraticCurveTo(ox - 10, -h * 0.6, ox + Math.sin(t * 0.3 + i) * 5, -h); ctx.quadraticCurveTo(ox + 10, -h * 0.6, ox + 12, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#f2b70c'; ctx.beginPath(); ctx.ellipse(0, -8, 10, 14 * fl, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------- efeitos ----------
  function drawFx(ctx, e) {
    const k = e.t / e.life;
    ctx.save();
    switch (e.type) {
      case 'star': {
        const r = e.r * (0.6 + 0.8 * M.easeOut(k)); ctx.globalAlpha = 1 - k * k; ctx.translate(e.x, e.y); ctx.rotate(e.rot || 0);
        M.star(ctx, 0, 0, r, r * 0.45, e.n || 8); ctx.fillStyle = e.color || '#fff8e8'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
        break;
      }
      case 'ring': {
        ctx.globalAlpha = 1 - k; ctx.lineWidth = 6 * (1 - k) + 2; ctx.strokeStyle = e.color || '#f2b70c';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * M.easeOut(k), 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case 'lines': {
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = e.color || INK; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) { const a = e.rot + i * Math.PI / 4; const r0 = e.r * (0.3 + k * 0.9), r1 = r0 + e.r * 0.5 * (1 - k); ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * r0, e.y + Math.sin(a) * r0); ctx.lineTo(e.x + Math.cos(a) * r1, e.y + Math.sin(a) * r1); ctx.stroke(); }
        break;
      }
      case 'arc': {
        ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = e.color || '#fff8e8'; ctx.lineWidth = 7 * (1 - k) + 2; ctx.lineCap = 'round';
        ctx.translate(e.x, e.y); ctx.scale(e.dir, 1);
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, e.r + i * 14, -1.4 + k * 1.2, 0.9 + k * 1.2); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = INK; }
        break;
      }
      case 'dust': {
        ctx.globalAlpha = (1 - k) * 0.6; ctx.fillStyle = e.color || '#d9c27a';
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(e.x + (i - 1.5) * 14 * (1 + k), e.y - k * 18 - (i % 2) * 6, 7 + k * 8, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case 'wave': {
        ctx.globalAlpha = (1 - k) * 0.7; ctx.strokeStyle = e.color || '#f2b70c'; ctx.lineWidth = 5;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(e.x, e.y, 30 + i * 25 + k * 70, -0.9, 0.9); ctx.stroke(); }
        break;
      }
      case 'flash': {
        ctx.globalAlpha = (1 - k) * (e.alpha || 0.8) * (M.store.data.settings.reduceFlash ? 0.2 : 1); ctx.fillStyle = e.color || '#fff8e8'; ctx.fillRect(-100, -100, M.W + 200, M.H + 200);
        break;
      }
      case 'text': {
        const sc = k < 0.15 ? M.easeBack(k / 0.15) : 1;
        ctx.globalAlpha = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
        ctx.translate(e.x, e.y - k * 30); ctx.scale(sc, sc); ctx.rotate(e.rot || 0);
        M.text(ctx, e.text, 0, 0, { size: e.size || 26, color: e.color || '#f2b70c' });
        break;
      }
    }
    ctx.restore();
  }
  function drawParticle(ctx, p) {
    const k = p.life / p.max;
    ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.5);
    ctx.translate(p.x, p.y);
    switch (p.type) {
      case 'confetti': ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size); break;
      case 'spark': ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size * k, 0, Math.PI * 2); ctx.fill(); break;
      case 'ember': ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(0, -p.size * 1.6 * k); ctx.quadraticCurveTo(p.size, 0, 0, p.size * k); ctx.quadraticCurveTo(-p.size, 0, 0, -p.size * 1.6 * k); ctx.fill(); break;
      case 'drop': ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2); ctx.fill(); break;
      case 'ash': ctx.fillStyle = p.color; ctx.globalAlpha *= 0.6; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); break;
    }
    ctx.restore();
  }

  return { style, computeRig, drawRig, drawFighter, drawGhost, drawShadow, drawPortrait, drawProjectile, drawTrap, drawFx, drawParticle };
})();
