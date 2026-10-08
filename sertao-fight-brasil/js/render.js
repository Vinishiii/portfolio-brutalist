'use strict';
// ============================================================
// RENDER — desenho dos lutadores (estilo xilogravura), projéteis
// e efeitos. Tudo procedural, sem imagens externas.
// ============================================================
M.render = (function () {
  const INK = M.C.ink;
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
    ctx.lineWidth = w + 6; ctx.strokeStyle = ink; ctx.stroke();
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke();
  }
  function dot(ctx, p, r, color, ink) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ink; ctx.stroke(); }

  // Desenha o rig completo (ctx já transladado para os pés e com scale(facing,1))
  function drawRig(ctx, rig, def, o = {}) {
    const C = def.colors, s = rig.s, bw = def.body.build;
    const flash = o.flash, sil = o.silhouette;
    const col = c => (sil ? sil : flash ? '#ffffff' : c);
    const ink = sil ? sil : INK;
    ctx.save();
    ctx.translate(0, rig.shift);
    if (rig.rot) { ctx.translate(rig.hip[0], rig.hip[1]); ctx.rotate(M.rad(rig.rot)); ctx.translate(-rig.hip[0], -rig.hip[1]); }
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    if (o.glow && !sil) {
      const g = ctx.createRadialGradient(rig.hip[0], rig.hip[1] - 20, 10, rig.hip[0], rig.hip[1] - 20, 110);
      g.addColorStop(0, o.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rig.hip[0], rig.hip[1] - 20, 110, 0, Math.PI * 2); ctx.fill();
    }
    // braço e perna de trás
    limbStroke(ctx, rig.fa, 10 * s, col(C.arms), ink); dot(ctx, rig.fa[2], 6.5 * s, col(C.skin), ink);
    limbStroke(ctx, rig.fl, 13 * s * (bw > 1.1 ? 1.15 : 1), col(C.legs), ink); foot(ctx, rig.fl, col(C.shoes), ink, s);
    // tronco
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rig.hip[0], rig.hip[1]); ctx.lineTo(rig.neck[0], rig.neck[1]);
    ctx.lineWidth = 30 * bw * s + 6; ctx.strokeStyle = ink; ctx.stroke();
    ctx.lineWidth = 30 * bw * s; ctx.strokeStyle = col(C.torso); ctx.stroke();
    const D = def.details || [];
    if (!sil && !flash && D.includes('vest')) {
      ctx.beginPath(); ctx.moveTo(rig.hip[0], rig.hip[1] - 6); ctx.lineTo(rig.neck[0], rig.neck[1] + 2);
      ctx.lineWidth = 18 * bw * s; ctx.strokeStyle = '#4a2a16'; ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(rig.hip[0] + 1, rig.hip[1] - 6); ctx.lineTo(rig.neck[0] + 1, rig.neck[1] + 2); ctx.stroke();
    }
    if (!sil && !flash && D.includes('tattoo')) {
      ctx.save(); ctx.strokeStyle = '#f2b70c'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      const dx = rig.neck[0] - rig.hip[0], dy = rig.neck[1] - rig.hip[1];
      ctx.beginPath(); for (let i = 0; i <= 6; i++) { const t = 0.15 + i * 0.12; ctx.lineTo(rig.hip[0] + dx * t + Math.sin(i * 1.8) * 9, rig.hip[1] + dy * t); } ctx.stroke();
      ctx.restore();
    }
    if (!sil && !flash) {
      // hachura de xilogravura
      ctx.save(); ctx.globalAlpha = 0.22; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      const dx = rig.neck[0] - rig.hip[0], dy = rig.neck[1] - rig.hip[1];
      for (let i = 1; i <= 3; i++) { const t = i / 4; const px = rig.hip[0] + dx * t, py = rig.hip[1] + dy * t; ctx.beginPath(); ctx.moveTo(px - 12 * bw, py + 3); ctx.lineTo(px - 2, py - 2); ctx.stroke(); }
      ctx.restore();
      // faixa/cinto
      ctx.beginPath(); ctx.moveTo(rig.hip[0] - 15 * bw * s, rig.hip[1] - 4); ctx.lineTo(rig.hip[0] + 15 * bw * s, rig.hip[1] - 4);
      ctx.lineWidth = 8; ctx.strokeStyle = C.accent; ctx.stroke();
    }
    // cabeça
    const H = rig.head, R = rig.L.headR;
    dot(ctx, H, R, col(C.skin), ink);
    if (!sil) drawHead(ctx, rig, def, o, col, ink);
    // perna e braço da frente
    limbStroke(ctx, rig.nl, 13 * s * (bw > 1.1 ? 1.15 : 1), col(C.legs), ink); foot(ctx, rig.nl, col(C.shoes), ink, s);
    limbStroke(ctx, rig.na, 10 * s, col(C.arms), ink); dot(ctx, rig.na[2], 6.5 * s, col(C.skin), ink);
    if (!sil && !flash) drawDetails(ctx, rig, def, D);
    if (!sil) drawProp(ctx, rig, def, o, col, ink);
    ctx.restore();
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
    if (D.includes('watch')) { const p = mid(rig.fa[1], rig.fa[2], 0.85); ctx.beginPath(); ctx.arc(p[0], p[1], 6 * s, 0, Math.PI * 2); ctx.fillStyle = '#141210'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#8d8a84'; ctx.stroke(); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, Math.PI * 2); ctx.fill(); }
    if (D.includes('sneakers')) { for (const leg of [rig.fl, rig.nl]) { const a = M.rad(leg[3]); const f = leg[2]; const tx = f[0] + Math.cos(a) * 13 * s, ty = f[1] - Math.sin(a) * 13 * s; ctx.beginPath(); ctx.moveTo(f[0] - Math.cos(a) * 2, f[1] + 4 + Math.sin(a) * 2); ctx.lineTo(tx, ty + 4); ctx.lineWidth = 3.5; ctx.strokeStyle = '#fff8e8'; ctx.stroke(); } }
    if (D.includes('buckle')) { ctx.fillStyle = '#f2b70c'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.fillRect(rig.hip[0] - 5, rig.hip[1] - 9, 10, 10); ctx.strokeRect(rig.hip[0] - 5, rig.hip[1] - 9, 10, 10); }
    if (D.includes('boots')) { for (const leg of [rig.fl, rig.nl]) { const p = mid(leg[1], leg[2], 0.75); ctx.beginPath(); ctx.arc(p[0], p[1], 9 * s, 0, Math.PI * 2); ctx.fillStyle = '#3a2416'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); } }
    ctx.restore();
  }
  function foot(ctx, leg, color, ink, s) {
    const a = M.rad(leg[3]); const f = leg[2];
    const tx = f[0] + Math.cos(a) * 13 * s, ty = f[1] - Math.sin(a) * 13 * s;
    ctx.beginPath(); ctx.moveTo(f[0], f[1]); ctx.lineTo(tx, ty);
    ctx.lineWidth = 16; ctx.strokeStyle = ink; ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = color; ctx.stroke();
  }
  function drawHead(ctx, rig, def, o, col, ink) {
    const C = def.colors, H = rig.head, R = rig.L.headR, hu = rig.hu;
    const fwd = [-hu[1], hu[0]];
    const ang = Math.atan2(hu[1], hu[0]) + Math.PI / 2; // orientação da cabeça
    ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(ang);
    // rosto
    const angry = o.angry;
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(7, -3, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(3, angry ? -9 : -8); ctx.lineTo(11, angry ? -6 : -8.5); ctx.stroke();
    if (o.hurt) { ctx.beginPath(); ctx.arc(8, 6, 3, 0, Math.PI * 2); ctx.stroke(); }
    else if (o.shout) { ctx.beginPath(); ctx.arc(9, 6, 4, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(5, 7); ctx.lineTo(11, 6); ctx.stroke(); }
    const D = def.details || [];
    if (D.includes('glowEyes')) { ctx.fillStyle = '#f2b70c'; ctx.shadowColor = '#f2b70c'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(7, -3, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(7.5, -3, 1.4, 0, Math.PI * 2); ctx.fill(); }
    if (D.includes('paint')) { ctx.strokeStyle = '#c8371d'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(3, 2); ctx.lineTo(12, 1); ctx.moveTo(3, 5); ctx.lineTo(12, 4); ctx.stroke(); }
    if (D.includes('scar')) { ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(13, 6); ctx.stroke(); }
    if (D.includes('earrings')) { ctx.fillStyle = C.accent; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; for (const sx of [-R + 2, R - 4]) { ctx.beginPath(); ctx.arc(sx, 8, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
    if (def.mustache) { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(2, 4); ctx.quadraticCurveTo(8, 1, 14, 4); ctx.stroke(); }
    if (def.beard) { ctx.fillStyle = col(C.hair); ctx.beginPath(); ctx.moveTo(-8, 8); ctx.quadraticCurveTo(4, 30, 12, 8); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke(); }
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
        ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-R + 2, 0); ctx.quadraticCurveTo(-R - 14, 20, -R - 6, 48);
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
      case 'straw':
        ctx.fillStyle = col('#d9c27a'); ctx.beginPath(); ctx.ellipse(0, -R + 5, R * 2.0, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-R + 3, -R + 5); ctx.lineTo(-R + 5, -R - 9); ctx.lineTo(R - 5, -R - 9); ctx.lineTo(R - 3, -R + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#8d8a84'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-R + 4, -R - 2); ctx.lineTo(R - 4, -R - 2); ctx.stroke();
        break;
    }
    if (D.includes('glasses')) {
      ctx.strokeStyle = '#1c4e9c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(1, -8, 13, 10, 3) : ctx.rect(1, -8, 13, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1, -4); ctx.lineTo(-R + 1, -5); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(2, -7, 11, 8);
    }
    if (D.includes('headband')) {
      ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-R + 1, -7); ctx.lineTo(R - 1, -7); ctx.stroke();
      ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-R + 1, -7); ctx.quadraticCurveTo(-R - 12, -2, -R - 16, 8); ctx.stroke();
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
    const rig = computeRig(f.pose, def);
    const o = Object.assign({
      flash: f.flash > 0, angry: f.state === 'attack', hurt: f.state === 'hitstun' || f.state === 'knockdown' || f.state === 'ko' || f.state === 'thrown',
      shout: f.state === 'taunt' || (f.move && f.move.pose === 'shout'),
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
    ctx.translate(w / 2 - 6, h - 10); const sc = opts.scale || h / 190; ctx.scale(sc * (opts.facing || 1), sc);
    const pose = opts.pose || M.poses.idlePose(def.idle, opts.t || 0.6, def.idleOver);
    const rig = computeRig(pose, def);
    drawRig(ctx, rig, def, { umbrellaOpen: def.prop === 'umbrella', glow: def.prop === 'fire' ? 'rgba(232,113,43,0.3)' : null, flash: opts.flash, silhouette: opts.silhouette });
    ctx.restore();
  }

  // ---------- projéteis ----------
  function drawProjectile(ctx, p) {
    const t = p.age;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.dir, 1);
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
        ctx.globalAlpha = (1 - k) * (e.alpha || 0.8); ctx.fillStyle = e.color || '#fff8e8'; ctx.fillRect(-100, -100, M.W + 200, M.H + 200);
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

  return { computeRig, drawRig, drawFighter, drawGhost, drawShadow, drawPortrait, drawProjectile, drawTrap, drawFx, drawParticle };
})();
