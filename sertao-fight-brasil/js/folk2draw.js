'use strict';
// ============================================================
// FOLCLORE 2 — desenho das oito lendas novas (Saci, Curupira, Iara, Boto, Lobisomem, Mapinguari, Cuca, Pisadeira):
// cabeças próprias (lobo, ciclope, jacaré), cabelos e chapéus, roupas, caudas e garras, mais os projéteis e armadilhas novos.
// Registra tudo nos ganchos de M.render.ext (ver render.js). Só desenho: nada aqui mexe na simulação.
// ============================================================
(function () {
  const R = M.render, ext = R.ext, INK = M.C.ink, shade = R.shade;
  const T = () => (typeof performance !== 'undefined' ? performance.now() : 0);
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const frame = (ctx, rig) => { const H = rig.head, hu = rig.hu; ctx.translate(H[0], H[1]); ctx.rotate(Math.atan2(hu[1], hu[0]) + Math.PI / 2); };
  const stroke = (ctx, w) => { ctx.lineWidth = w || 2.4; ctx.strokeStyle = INK; ctx.stroke(); };
  const fillStroke = (ctx, fill, w) => { ctx.fillStyle = fill; ctx.fill(); stroke(ctx, w); };
  // contorno e silhueta: sil preenche tudo com uma cor só (contorno grosso, luz de borda e fantasmas)
  const silDraw = (ctx, sil, thick, s, paths) => { ctx.fillStyle = ctx.strokeStyle = sil; ctx.lineWidth = (Math.max(0, thick) + 3) / s; for (const p of paths) { p(ctx); ctx.fill(); ctx.stroke(); } };
  const eyeX = (ctx, x, y, r) => { ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); };

  // ================================================================ CABEÇAS
  // ---- lobo (Lobisomem): focinho, orelhas, presas e olhos de lua
  const wolfPaths = open => ({
    ears: c => { c.beginPath(); c.moveTo(-10, -9); c.lineTo(-15, -30); c.lineTo(0, -14); c.closePath(); c.moveTo(1, -13); c.lineTo(5, -31); c.lineTo(13, -9); c.closePath(); },
    skull: c => { c.beginPath(); c.ellipse(-1, -1, 15.5, 15, 0, 0, Math.PI * 2); },
    snout: c => { c.beginPath(); c.moveTo(4, -8); c.lineTo(24, -3); c.quadraticCurveTo(31, -1, 31, 3); c.lineTo(26, 5.5); c.lineTo(5, 8); c.closePath(); },
    jaw: c => { c.save(); c.translate(5, 6); c.rotate(open * 0.045); c.beginPath(); c.moveTo(0, 0); c.lineTo(21, 1); c.lineTo(19, 7); c.lineTo(1, 8); c.closePath(); c.restore(); }
  });
  ext.heads.wolf = function (ctx, rig, def, o, col, ink, thick, sil) {
    const C = def.colors, s = rig.s, open = o.shout ? 9 : o.angry ? 5 : o.happy ? 3 : 0;
    ctx.save(); frame(ctx, rig); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const P = wolfPaths(open);
    // pescoço grosso de pelo, para a cabeça não "flutuar"
    if (sil) { silDraw(ctx, sil, thick, s, [P.ears, P.skull, P.jaw, P.snout]); ctx.restore(); return; }
    const fur = col(C.skin), dk = col(shade(C.skin, 0.6)), lt = col(shade(C.skin, 1.28));
    P.ears(ctx); fillStroke(ctx, fur, 2.4);
    ctx.fillStyle = col('#d98a8a'); ctx.beginPath(); ctx.moveTo(-10, -13); ctx.lineTo(-13, -25); ctx.lineTo(-3, -14); ctx.closePath(); ctx.moveTo(3, -16); ctx.lineTo(5, -26); ctx.lineTo(10, -13); ctx.closePath(); ctx.fill();
    if (open > 0) { P.jaw(ctx); fillStroke(ctx, dk, 2.4); ctx.fillStyle = '#5a1620'; ctx.beginPath(); ctx.moveTo(8, 6.5); ctx.lineTo(26, 6); ctx.lineTo(24, 4 + open * 0.55); ctx.lineTo(8, 5 + open * 0.55); ctx.closePath(); ctx.fill(); }
    P.skull(ctx); fillStroke(ctx, fur, 2.6);
    ctx.save(); P.skull(ctx); ctx.clip(); const g = ctx.createLinearGradient(-14, -16, 10, 14); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = g; ctx.fillRect(-20, -20, 40, 40); ctx.restore();
    // tufos de pelo na bochecha e na testa
    ctx.fillStyle = fur; for (const [x, y, h] of [[-8, 12, 7], [-3, 14, 6], [-13, 6, 6], [4, -15, 6], [-4, -16, 6]]) { ctx.beginPath(); ctx.moveTo(x - 3.5, y); ctx.lineTo(x, y + h); ctx.lineTo(x + 3.5, y); ctx.closePath(); fillStroke(ctx, fur, 1.8); }
    P.snout(ctx); fillStroke(ctx, lt, 2.6);
    ctx.fillStyle = '#16100e'; ctx.beginPath(); ctx.ellipse(29.5, 2.2, 3.3, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    // presas
    ctx.fillStyle = '#fff8e8'; ctx.strokeStyle = INK; ctx.lineWidth = 1.4; for (const [x, h] of [[22, 6.5], [15, 5.5], [9, 4.5]]) { ctx.beginPath(); ctx.moveTo(x - 2.2, 5.8 - (22 - x) * 0.1); ctx.lineTo(x, 5.8 + h - (22 - x) * 0.1); ctx.lineTo(x + 2.2, 5.8 - (22 - x) * 0.1); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (open > 0) { ctx.beginPath(); ctx.moveTo(22, 8 + open * 0.5); ctx.lineTo(23.5, 4 + open * 0.5); ctx.lineTo(25, 8 + open * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    // olhos de lua
    if (o.hurt) { eyeX(ctx, 12, -6, 3); eyeX(ctx, 2, -7, 2.4); }
    else {
      ctx.shadowColor = C.accent; ctx.shadowBlur = 8; ctx.fillStyle = col(C.accent); ctx.beginPath(); ctx.ellipse(12, -6, 4.6, o.angry ? 2.6 : 3.6, o.angry ? 0.25 : 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(2.5, -7.4, 3.2, o.angry ? 2 : 2.8, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(12, -6, 4.6, o.angry ? 2.6 : 3.6, o.angry ? 0.25 : 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(12.8, -6, 1.2, o.angry ? 2.2 : 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(3, -7.4, 0.9, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(6, o.angry ? -12.5 : -11.5); ctx.lineTo(17, o.angry ? -7 : -10.5); ctx.moveTo(-3, o.angry ? -13 : -12); ctx.lineTo(5, o.angry ? -10 : -12); ctx.stroke();
    ctx.restore();
  };

  // ---- ciclope (Mapinguari): crina desgrenhada, um olho enorme, tromba, presas
  const cycPaths = open => ({
    mane: c => { c.beginPath(); for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.55 + i * (Math.PI * 1.45 / 14), r = (i % 2 ? 23 : 28); c.lineTo(-1 + Math.cos(a) * r, -2 + Math.sin(a) * r * 0.95); } c.closePath(); },
    skull: c => { c.beginPath(); c.ellipse(0, 0, 20, 19, 0, 0, Math.PI * 2); },
    snout: c => { c.beginPath(); c.ellipse(15, 6, 10, 8, 0.1, 0, Math.PI * 2); },
    jaw: c => { c.beginPath(); c.moveTo(5, 11 + open * 0.2); c.quadraticCurveTo(15, 16 + open, 25, 11 + open * 0.2); c.lineTo(24, 14 + open); c.quadraticCurveTo(14, 21 + open, 6, 15 + open); c.closePath(); }
  });
  ext.heads.cyclops = function (ctx, rig, def, o, col, ink, thick, sil) {
    const C = def.colors, s = rig.s, open = o.shout ? 9 : o.angry ? 5 : o.happy ? 2 : 0;
    ctx.save(); frame(ctx, rig); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const P = cycPaths(open);
    if (sil) { silDraw(ctx, sil, thick, s, [P.mane, P.skull, P.jaw]); ctx.restore(); return; }
    const fur = col(C.skin), dk = col(C.hair), lt = col(shade(C.skin, 1.25));
    P.mane(ctx); fillStroke(ctx, dk, 2.6);
    P.skull(ctx); fillStroke(ctx, fur, 2.8);
    ctx.save(); P.skull(ctx); ctx.clip(); const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 24); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.34)'); ctx.fillStyle = g; ctx.fillRect(-24, -24, 48, 48); ctx.restore();
    // boca e presas
    if (open > 0) { ctx.fillStyle = '#3a0f14'; ctx.beginPath(); ctx.moveTo(6, 11); ctx.quadraticCurveTo(15, 12, 26, 11); ctx.lineTo(25, 13 + open); ctx.quadraticCurveTo(14, 18 + open, 6, 14 + open); ctx.closePath(); ctx.fill(); stroke(ctx, 2); }
    P.snout(ctx); fillStroke(ctx, lt, 2.6);
    ctx.fillStyle = '#2a1410'; ctx.beginPath(); ctx.ellipse(18, 4, 2.2, 3, 0, 0, Math.PI * 2); ctx.ellipse(13, 6, 1.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    P.jaw(ctx); fillStroke(ctx, shade(C.skin, 0.8), 2.4);
    ctx.fillStyle = '#fff8e8'; for (const [x, dx] of [[8, -1], [22, 1]]) { ctx.beginPath(); ctx.moveTo(x - 2.4, 12 + open * 0.3); ctx.lineTo(x + dx * 1.5, 1 + open * 0.2); ctx.lineTo(x + 2.4, 12 + open * 0.3); ctx.closePath(); fillStroke(ctx, '#fff8e8', 1.6); }
    // o olho único
    ctx.fillStyle = col('#fff8e8'); ctx.beginPath(); ctx.ellipse(6, -4, 9.5, o.hurt ? 1.5 : (o.angry ? 6 : 8), 0, 0, Math.PI * 2); fillStroke(ctx, col('#fff8e8'), 2.4);
    if (!o.hurt) { ctx.save(); ctx.beginPath(); ctx.ellipse(6, -4, 9.5, o.angry ? 6 : 8, 0, 0, Math.PI * 2); ctx.clip(); ctx.shadowColor = C.accent; ctx.shadowBlur = 8; ctx.fillStyle = col(C.accent); ctx.beginPath(); ctx.arc(8, -4, 5.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(8.8, -4, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(6.6, -6, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.strokeStyle = dk; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-5, o.angry ? -10 : -13); ctx.quadraticCurveTo(6, o.angry ? -12 : -16, 17, o.angry ? -7 : -12); ctx.stroke();
    // orelha
    ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(-15, 0, 4.4, 6, 0.2, 0, Math.PI * 2); fillStroke(ctx, fur, 2.2);
    ctx.restore();
  };

  // ---- jacaré com chapéu de bruxa (Cuca)
  const crocPaths = open => ({
    skull: c => { c.beginPath(); c.ellipse(-2, -2, 14.5, 13, 0, 0, Math.PI * 2); },
    snout: c => { c.beginPath(); c.moveTo(2, -10); c.lineTo(26, -6); c.quadraticCurveTo(34, -4, 34, 0); c.lineTo(30, 3); c.lineTo(4, 5); c.closePath(); },
    jaw: c => { c.save(); c.translate(4, 4.5); c.rotate(open * 0.05); c.beginPath(); c.moveTo(0, 0); c.lineTo(27, -1); c.lineTo(26, 5); c.lineTo(2, 8); c.closePath(); c.restore(); },
    hat: c => { c.beginPath(); c.ellipse(0, -11, 21, 5, -0.05, 0, Math.PI * 2); c.moveTo(-10, -12); c.lineTo(-5, -40); c.lineTo(9, -34); c.lineTo(10, -12); c.closePath(); }
  });
  ext.heads.croc = function (ctx, rig, def, o, col, ink, thick, sil) {
    const C = def.colors, s = rig.s, open = o.shout ? 11 : o.angry ? 6 : o.happy ? 4 : 1.5;
    ctx.save(); frame(ctx, rig); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const P = crocPaths(open);
    if (sil) { silDraw(ctx, sil, thick, s, [P.hat, P.skull, P.snout, P.jaw]); ctx.restore(); return; }
    const gr = col(C.skin), dk = col(shade(C.skin, 0.65)), lt = col(shade(C.skin, 1.2)), hair = col(C.hair);
    // mechas loiras por baixo do chapéu
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.quadraticCurveTo(-20, 4, -16, 22); ctx.moveTo(-6, -9); ctx.quadraticCurveTo(-14, 6, -9, 24); ctx.stroke();
    ctx.strokeStyle = hair; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.quadraticCurveTo(-20, 4, -16, 22); ctx.moveTo(-6, -9); ctx.quadraticCurveTo(-14, 6, -9, 24); ctx.stroke();
    P.skull(ctx); fillStroke(ctx, gr, 2.6);
    ctx.save(); P.skull(ctx); ctx.clip(); const g = ctx.createLinearGradient(-12, -14, 10, 10); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.3)'); ctx.fillStyle = g; ctx.fillRect(-20, -20, 40, 40); ctx.restore();
    // mandíbula e dentes
    P.jaw(ctx); fillStroke(ctx, dk, 2.4);
    ctx.fillStyle = '#4a1620'; ctx.beginPath(); ctx.moveTo(6, 3 + open * 0.2); ctx.lineTo(30, 2 + open * 0.2); ctx.lineTo(28, 3 + open * 0.8); ctx.lineTo(7, 5 + open * 0.9); ctx.closePath(); ctx.fill();
    P.snout(ctx); fillStroke(ctx, gr, 2.6);
    ctx.fillStyle = lt; ctx.beginPath(); ctx.moveTo(6, -8); ctx.lineTo(26, -5); ctx.quadraticCurveTo(31, -4, 32, -1); ctx.lineTo(6, -3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff8e8'; ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { const x = 8 + i * 4; ctx.beginPath(); ctx.moveTo(x - 1.6, 4.6 - i * 0.12); ctx.lineTo(x, 4.6 + 4 - i * 0.12); ctx.lineTo(x + 1.6, 4.6 - i * 0.12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    for (let i = 0; i < 4; i++) { const x = 10 + i * 5; ctx.beginPath(); ctx.moveTo(x - 1.5, 4.6 + open * 0.6 + 2); ctx.lineTo(x, 4.6 + open * 0.6 - 2); ctx.lineTo(x + 1.5, 4.6 + open * 0.6 + 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(31, -2.4, 1.2, 0, Math.PI * 2); ctx.arc(26, -3.2, 1, 0, Math.PI * 2); ctx.fill();
    // olho de jacaré (saltado) e verrugas
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(8, -8, 6.5, 5.5, 0, 0, Math.PI * 2); fillStroke(ctx, gr, 2.4);
    if (o.hurt) eyeX(ctx, 8, -8, 2.6);
    else { ctx.fillStyle = col(C.accent); ctx.beginPath(); ctx.ellipse(8, -8, 4.4, o.angry ? 2.2 : 3.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(8.6, -8, 1.1, o.angry ? 2 : 3.2, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = dk; for (const [x, y] of [[-6, -9], [-1, -11], [-9, -2], [15, -5]]) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    // chapéu pontudo de bruxa, com fita e estrela
    P.hat(ctx); fillStroke(ctx, col('#3b1d5a'), 2.8);
    ctx.fillStyle = col(C.accent); ctx.beginPath(); ctx.moveTo(-10.4, -17); ctx.lineTo(10.2, -17); ctx.lineTo(10, -12.5); ctx.lineTo(-10.6, -13); ctx.closePath(); fillStroke(ctx, col(C.accent), 2);
    ctx.fillStyle = col('#f2d34a'); M.star(ctx, 1, -26, 3.6, 1.6, 5); ctx.fill();
    ctx.restore();
  };

  // ================================================================ CABELOS E CHAPÉUS (rosto comum, desenhado pelo jogo)
  ext.hair.carapuca = function (ctx, def, R_, col) {
    const C = def.colors; ctx.fillStyle = col(C.hair); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    // gorro vermelho caído para trás, com a ponta balançando
    const sw = Math.sin(T() * 0.006) * 4;
    ctx.beginPath(); ctx.moveTo(-R_ - 1, -2); ctx.quadraticCurveTo(-R_ - 3, -R_ - 8, 0, -R_ - 9); ctx.quadraticCurveTo(R_ + 3, -R_ - 6, R_ + 1, -3);
    ctx.quadraticCurveTo(R_ - 4, -R_ + 2, -2, -R_ + 1); ctx.quadraticCurveTo(-R_ + 1, -R_ + 4, -R_ - 1, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -R_ - 7); ctx.quadraticCurveTo(-R_ - 14, -R_ - 8 + sw, -R_ - 24 + sw, -R_ + 6 + sw * 1.4); ctx.quadraticCurveTo(-R_ - 14, -R_ + 1, -R_ + 2, -R_ + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col(shade(C.hair, 1.35)); ctx.beginPath(); ctx.arc(-R_ - 24 + sw, -R_ + 6 + sw * 1.4, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, -R_ - 6); ctx.quadraticCurveTo(6, -R_ - 6, R_ - 4, -R_ + 2); ctx.stroke();
  };
  ext.hair.curupiraFire = function (ctx, def, R_, col) {
    const t = T() * 0.012; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 2.6;
    const tongues = [[-12, 0.7, 12, -1], [-5, 1, 15, -0.4], [2, 1.2, 17, 0.1], [9, 0.9, 14, 0.5], [14, 0.55, 11, 0.9], [-16, 0.45, 9, -1.3]];
    const layer = (k, color) => { ctx.fillStyle = col(color); for (let i = 0; i < tongues.length; i++) { const [x, hk, w, lean] = tongues[i], h = (28 * hk * k + Math.sin(t + i * 1.7) * 3.5), hw = (w * k) / 2, sx = Math.sin(t * 0.8 + i) * 3 + lean * 6 * k;
      ctx.beginPath(); ctx.moveTo(x - hw, -R_ + 3); ctx.quadraticCurveTo(x - hw * 0.8 + sx * 0.4, -R_ - h * 0.5, x + sx, -R_ - h); ctx.quadraticCurveTo(x + hw * 0.8 + sx * 0.4, -R_ - h * 0.45, x + hw, -R_ + 3); ctx.closePath(); ctx.fill(); if (k === 1) ctx.stroke(); } };
    layer(1, def.colors.hair); layer(0.66, '#f2a21e'); layer(0.34, '#ffe27a');
    ctx.fillStyle = col(def.colors.hair); ctx.beginPath(); ctx.arc(0, 0, R_ + 1.5, Math.PI * 1.12, Math.PI * 1.88); ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  ext.hair.iaraHair = function (ctx, def, R_, col) {
    const C = def.colors, sw = Math.sin(T() * 0.003) * 5; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.fillStyle = col(C.hair);
    ctx.beginPath(); ctx.moveTo(-R_ + 2, -6); ctx.quadraticCurveTo(-R_ - 20 + sw, 30, -R_ - 12 + sw * 1.6, 96); ctx.quadraticCurveTo(-R_ + 2 + sw * 1.2, 88, -R_ + 15, 84); ctx.quadraticCurveTo(-R_ + 8, 40, -2, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,200,190,0.45)'; ctx.lineWidth = 1.6; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-R_ + 1 - i * 2, 4 + i * 6); ctx.quadraticCurveTo(-R_ - 8 + sw - i * 2, 44, -R_ - 4 + sw * 1.4 + i * 3, 86); ctx.stroke(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.fillStyle = col(C.hair);
    ctx.beginPath(); ctx.arc(0, 0, R_ + 2, Math.PI * 1.1, Math.PI * 1.9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -R_); ctx.quadraticCurveTo(-13, 2, -7, 13); ctx.quadraticCurveTo(-1, 4, 3, -R_ + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    // concha e pérola
    ctx.fillStyle = col(C.accent); ctx.beginPath(); ctx.moveTo(-1, -R_ + 1); for (let i = 0; i <= 4; i++) { const a = Math.PI + i * Math.PI / 4; ctx.lineTo(3 + Math.cos(a) * 6, -R_ + 1 + Math.sin(a) * 6 * -0.9 + 2); } ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(3, -R_ + 5, 1.8, 0, Math.PI * 2); ctx.fill();
  };
  ext.hair.panama = function (ctx, def, R_, col) {
    const C = def.colors; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillStyle = col('#2a1d14'); ctx.beginPath(); ctx.arc(0, 0, R_ + 1.5, Math.PI * 1.12, Math.PI * 1.88); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col('#f7f4ec'); ctx.beginPath(); ctx.ellipse(1, -R_ + 5, R_ * 1.9, 6, -0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-R_ + 3, -R_ + 5); ctx.quadraticCurveTo(-R_ + 2, -R_ - 14, -2, -R_ - 15); ctx.quadraticCurveTo(R_ - 2, -R_ - 14, R_ - 2, -R_ + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col(C.accent); ctx.fillRect(-R_ + 3, -R_ - 3, 2 * R_ - 5, 6); ctx.strokeRect(-R_ + 3, -R_ - 3, 2 * R_ - 5, 6);
    ctx.fillStyle = 'rgba(40,20,20,0.18)'; ctx.beginPath(); ctx.ellipse(1, -R_ + 12, R_ * 1.0, 5, 0, 0, Math.PI * 2); ctx.fill();
  };
  ext.hair.wildWhite = function (ctx, def, R_, col) {
    const C = def.colors, sw = Math.sin(T() * 0.004) * 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 6.4; ctx.beginPath();
    for (let i = 0; i < 11; i++) { const a = Math.PI * 1.0 + i * (Math.PI * 1.25 / 10), r0 = R_ - 2, r1 = R_ + 14 + hash(i) * 14; ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.quadraticCurveTo(Math.cos(a + 0.2) * (r0 + r1) * 0.55 + sw * (i < 5 ? 1 : 0.4), Math.sin(a + 0.2) * (r0 + r1) * 0.55, Math.cos(a - 0.1) * r1 + sw, Math.sin(a - 0.1) * r1 + (i < 3 ? 22 + hash(i) * 20 : 0)); }
    ctx.stroke(); ctx.strokeStyle = col(C.hair); ctx.lineWidth = 3.4; ctx.stroke();
    ctx.fillStyle = col(C.hair); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R_ + 1.5, Math.PI * 1.1, Math.PI * 1.9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(30,30,50,0.4)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-R_ + 4, -2); ctx.lineTo(R_ - 2, -2); ctx.stroke();
  };

  // ================================================================ ADEREÇOS
  ext.prop.potion = function (ctx, rig, def, o, col, ink) {
    const hand = rig.na[2], a = M.rad(rig.na[3]), d = [Math.sin(a), Math.cos(a)];
    ctx.save(); ctx.translate(hand[0] + d[0] * 12, hand[1] + d[1] * 12); ctx.rotate(Math.atan2(d[1], d[0]) - Math.PI / 2);
    ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = ink;
    ctx.fillStyle = col('#a8f060'); ctx.beginPath(); ctx.arc(0, 4, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col('#d4e0c8'); ctx.beginPath(); ctx.rect(-3.5, -12, 7, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col('#8a5a3a'); ctx.beginPath(); ctx.rect(-4.5, -16, 9, 5); ctx.fill(); ctx.stroke();
    if (!o.silhouette) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(-4, 1, 2.4, 0, Math.PI * 2); ctx.fill(); const k = (T() * 0.004) % 1; ctx.fillStyle = 'rgba(190,255,120,0.8)'; ctx.beginPath(); ctx.arc(3, -2 - k * 8, 2 - k, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };

  // ================================================================ ROUPAS E DETALHES (desenhados sobre o corpo)
  const limbs = rig => [rig.fa, rig.na, rig.fl, rig.nl];
  ext.details.fur = function (ctx, rig, def, s) {
    ctx.strokeStyle = shade(def.colors.skin, 0.55); ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    let n = 0;
    for (const L of limbs(rig)) for (let seg = 0; seg < 2; seg++) {
      const a = L[seg], b = L[seg + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, px = -dy / len, py = dx / len;
      for (let i = 0; i < 6; i++) { n++; const t = 0.1 + i * 0.16, side = (i + seg) % 2 ? 1 : -1, x = a[0] + dx * t, y = a[1] + dy * t, w = 5 * s * (def.id === 'mapinguari' ? 1.4 : 1);
        ctx.beginPath(); ctx.moveTo(x + px * side * w * 0.7, y + py * side * w * 0.7); ctx.lineTo(x + px * side * w * 1.5 + dx / len * 3, y + py * side * w * 1.5 + dy / len * 3); ctx.stroke(); }
    }
    // pelo no peito
    const N = rig.neck, H = rig.hip; ctx.strokeStyle = shade(def.colors.skin, 0.6); for (let i = 0; i < 7; i++) { const t = 0.15 + i * 0.1, x = H[0] + (N[0] - H[0]) * t, y = H[1] + (N[1] - H[1]) * t; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 3, y + 3); ctx.stroke(); }
  };
  ext.details.claws = function (ctx, rig, def, s) {
    const long = def.id === 'pisadeira', color = long ? def.colors.accent : '#efe9dc', len = (long ? 17 : def.id === 'mapinguari' ? 12 : 9) * s;
    for (const arm of [rig.fa, rig.na]) {
      const h = arm[2], a = M.rad(arm[3]), d = [Math.sin(a), Math.cos(a)], n = [d[1], -d[0]];
      for (let i = -1; i <= 1; i++) { const bx = h[0] + d[0] * 5 + n[0] * i * 4, by = h[1] + d[1] * 5 + n[1] * i * 4; ctx.beginPath(); ctx.moveTo(bx - n[0] * 1.8, by - n[1] * 1.8); ctx.lineTo(bx + d[0] * len + n[0] * i * 1.5, by + d[1] * len + n[1] * i * 1.5); ctx.lineTo(bx + n[0] * 1.8, by + n[1] * 1.8); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke(); }
    }
  };
  ext.back.tail = function (ctx, rig, def, s) {
    const H = rig.hip, sw = Math.sin(T() * 0.005) * 6; ctx.lineCap = 'round';
    const a = [H[0] - 8, H[1] - 6], b = [H[0] - 34, H[1] + 6 + sw * 0.4], c = [H[0] - 54, H[1] - 14 + sw];
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]);
    ctx.lineWidth = 20 * s; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 15 * s; ctx.strokeStyle = def.colors.skin; ctx.stroke();
    ctx.lineWidth = 7 * s; ctx.strokeStyle = shade(def.colors.skin, 1.3); ctx.beginPath(); ctx.moveTo(c[0] + 14, c[1] + 4); ctx.lineTo(c[0], c[1]); ctx.stroke();
  };
  ext.details.bellymouth = function (ctx, rig, def, s) {
    const H = rig.hip, N = rig.neck, t = 0.42, cx = H[0] + (N[0] - H[0]) * t + 6, cy = H[1] + (N[1] - H[1]) * t, ang = Math.atan2(N[1] - H[1], N[0] - H[0]) + Math.PI / 2;
    const open = 3 + (Math.sin(T() * 0.006) + 1) * 1.6;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.beginPath(); ctx.ellipse(0, 0, 13 * s, (6 + open) * s, 0, 0, Math.PI * 2); ctx.fillStyle = '#3a0f14'; ctx.fill(); stroke(ctx, 2.6);
    ctx.fillStyle = '#fff8e8'; for (let i = -2; i <= 2; i++) { for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(i * 4.6 - 2, sgn * (5.4 + open) * s * 0.4); ctx.lineTo(i * 4.6, sgn * (1.4) * s); ctx.lineTo(i * 4.6 + 2, sgn * (5.4 + open) * s * 0.4); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); } }
    ctx.fillStyle = '#c8371d'; ctx.beginPath(); ctx.ellipse(0, 0.5, 6 * s, 1.6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  ext.details.scales = function (ctx, rig, def, s) {
    ctx.strokeStyle = 'rgba(10,50,48,0.7)'; ctx.lineWidth = 1.4;
    for (const L of [rig.fl, rig.nl]) for (let seg = 0; seg < 2; seg++) {
      const a = L[seg], b = L[seg + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx);
      for (let i = 0; i < 5; i++) for (let j = -1; j <= 1; j += 2) { const t = 0.12 + i * 0.18, x = a[0] + dx * t + (-dy / len) * j * 2.6, y = a[1] + dy * t + (dx / len) * j * 2.6; ctx.beginPath(); ctx.arc(x, y, 3.2 * s, ang - 0.5, ang + 0.5 + Math.PI); ctx.stroke(); }
    }
  };
  ext.details.tailfin = function (ctx, rig, def, s) {
    ctx.lineJoin = 'round';
    for (const L of [rig.fl, rig.nl]) {
      const f = L[2], a = M.rad(L[3]), bx = f[0] - Math.cos(a) * 4 * s, by = f[1] + Math.sin(a) * 4 * s, d = [Math.cos(a), -Math.sin(a)], n = [Math.sin(a), Math.cos(a)];
      const sway = Math.sin(T() * 0.006) * 3;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + d[0] * 10 + n[0] * 14, by + d[1] * 10 + n[1] * 14 + sway, bx + d[0] * 26 + n[0] * 18, by + d[1] * 26 + n[1] * 18 + sway);
      ctx.quadraticCurveTo(bx + d[0] * 22, by + d[1] * 22 + sway, bx + d[0] * 26 - n[0] * 16, by + d[1] * 26 - n[1] * 16 - sway); ctx.quadraticCurveTo(bx + d[0] * 10 - n[0] * 12, by + d[1] * 10 - n[1] * 12, bx, by); ctx.closePath();
      ctx.fillStyle = def.colors.shoes; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx + d[0] * 6, by + d[1] * 6); ctx.lineTo(bx + d[0] * 24 + n[0] * 12, by + d[1] * 24 + n[1] * 12 + sway); ctx.moveTo(bx + d[0] * 6, by + d[1] * 6); ctx.lineTo(bx + d[0] * 24 - n[0] * 10, by + d[1] * 24 - n[1] * 10 - sway); ctx.stroke();
    }
  };
  ext.details.whiteSuit = function (ctx, rig, def, s) {
    const N = rig.neck, H = rig.hip, u = [N[0] - H[0], N[1] - H[1]], l = Math.hypot(u[0], u[1]) || 1, ux = u[0] / l, uy = u[1] / l, px = -uy, py = ux;
    const at = (t, k) => [H[0] + u[0] * t + px * k, H[1] + u[1] * t + py * k];
    // lapelas em V, gravata rosa e lenço no bolso
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(20,18,16,0.55)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); let p0 = at(0.97, 7), p1 = at(0.55, 3); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); p0 = at(0.97, -2); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    ctx.fillStyle = def.colors.accent; ctx.beginPath(); p0 = at(0.96, 3); p1 = at(0.8, 1); const p2 = at(0.6, 3.4), p3 = at(0.8, 5.4); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p1[0], p1[1]); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    const sq = at(0.74, 14); ctx.beginPath(); ctx.moveTo(sq[0], sq[1]); ctx.lineTo(sq[0] + ux * 5 - px * 3, sq[1] + uy * 5 - py * 3); ctx.lineTo(sq[0] + ux * 5 + px * 3, sq[1] + uy * 5 + py * 3); ctx.closePath(); ctx.fillStyle = def.colors.accent; ctx.fill(); stroke(ctx, 1.4);
    ctx.fillStyle = '#c9b48a'; for (let i = 0; i < 2; i++) { const b = at(0.3 + i * 0.16, 0.5); ctx.beginPath(); ctx.arc(b[0], b[1], 1.6, 0, Math.PI * 2); ctx.fill(); }
  };
  // vestido longo da Cuca (bruxa) e camisola rasgada da Pisadeira
  function skirt(ctx, rig, def, s, o) {
    const H = rig.hip, sway = Math.sin(T() * 0.004) * 3, wi = o.w * s * def.body.build, drop = o.drop * s;
    ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(H[0] - wi * 0.8, H[1] - 8); ctx.lineTo(H[0] + wi * 0.8, H[1] - 8);
    const n = o.teeth; for (let i = 0; i <= n; i++) { const x = H[0] + wi * (1.1 - i * 2.2 / n) + sway * (i / n), y = H[1] + drop + (i % 2 ? (o.ragged ? 10 * hash(i + 3) + 4 : 8) : (o.ragged ? -4 : 0)); ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fillStyle = o.color; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.strokeStyle = o.trim; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= n; i++) { const x = H[0] + wi * (1.1 - i * 2.2 / n) + sway * (i / n), y = H[1] + drop + (i % 2 ? (o.ragged ? 10 * hash(i + 3) + 4 : 8) : (o.ragged ? -4 : 0)) - 2; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.6; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(H[0] - wi * 0.5 + i * wi * 0.3, H[1] - 4); ctx.lineTo(H[0] - wi * 0.7 + i * wi * 0.4 + sway * 0.5, H[1] + drop - 6); ctx.stroke(); }
  }
  ext.details.robe = function (ctx, rig, def, s) { skirt(ctx, rig, def, s, { w: 21, drop: 58, teeth: 8, color: def.colors.legs, trim: def.colors.accent }); };
  ext.details.gown = function (ctx, rig, def, s) { skirt(ctx, rig, def, s, { w: 17, drop: 70, teeth: 9, ragged: true, color: 'rgba(216,210,224,0.96)', trim: 'rgba(150,140,170,0.9)' }); };

  // ================================================================ PROJÉTEIS
  const ring = (ctx, r, w, color) => { ctx.lineWidth = w + 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke(); };
  ext.proj.whirlwind = function (ctx, p, t) {
    const w = p.w, h = p.h, n = 7;
    for (let i = n - 1; i >= 0; i--) { const k = i / (n - 1), y = h / 2 - k * h, rx = w * (0.2 + k * 0.32), ph = t * 0.35 + i * 0.9; ctx.beginPath(); ctx.ellipse(Math.sin(ph) * 3, y, rx, rx * 0.28, 0, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? '#d9b97a' : '#b88e55'; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.fillStyle = '#6fb35a'; for (let i = 0; i < 4; i++) { const a = t * 0.3 + i * 1.6, k = (i / 4 + t * 0.012) % 1, y = h / 2 - k * h, r = w * (0.25 + k * 0.4); ctx.save(); ctx.translate(Math.cos(a) * r, y + Math.sin(a) * 4); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 6, 2.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore(); }
  };
  ext.proj.note = function (ctx, p, t) {
    for (let i = 0; i < 3; i++) { const r = 10 + ((t * 0.7 + i * 12) % 36); ctx.globalAlpha = 1 - r / 46; ctx.beginPath(); ctx.arc(-14, 0, r, -0.9, 0.9); ring(ctx, r > 0 ? 3 : 2, 3, i % 2 ? '#8be9ff' : '#2aa9b8'); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#2aa9b8'; ctx.strokeStyle = INK;
    for (let i = 0; i < 3; i++) { const ox = Math.sin(t * 0.2 + i * 2) * 5 + i * 8 - 8, oy = -16 + i * 16 + Math.cos(t * 0.17 + i) * 4; ctx.beginPath(); ctx.ellipse(ox, oy + 7, 7, 5, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.4; ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox + 5, oy + 5); ctx.lineTo(ox + 5, oy - 13); ctx.lineTo(ox + 13, oy - 9); ctx.lineWidth = 3; ctx.stroke(); }
  };
  const heart = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.moveTo(x, y + r * 0.9); ctx.bezierCurveTo(x - r * 1.5, y - r * 0.2, x - r * 0.8, y - r * 1.3, x, y - r * 0.4); ctx.bezierCurveTo(x + r * 0.8, y - r * 1.3, x + r * 1.5, y - r * 0.2, x, y + r * 0.9); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = INK; ctx.stroke(); };
  ext.proj.heart = function (ctx, p, t) {
    for (let i = 3; i >= 1; i--) { ctx.globalAlpha = 0.3; heart(ctx, -i * 14, Math.sin(t * 0.4 + i) * 4, 8 - i, '#ff9bbd'); }
    ctx.globalAlpha = 1; const pu = 1 + Math.sin(t * 0.5) * 0.1; heart(ctx, 0, 0, 15 * pu, '#ff5f93'); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-6, -6, 3.4, 2, -0.6, 0, Math.PI * 2); ctx.fill();
  };
  ext.proj.howl = function (ctx, p, t) {
    for (let i = 0; i < 3; i++) { const r = 14 + i * 13 + ((t * 0.8) % 13); ctx.globalAlpha = 1 - (i * 0.25 + ((t * 0.8) % 13) / 60); ctx.beginPath(); ctx.arc(-18, 0, r, -0.85, 0.85); ring(ctx, r, 4, i % 2 ? '#f2d34a' : '#fff8e8'); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#f2d34a'; ctx.beginPath(); ctx.arc(-18, -26, 3, 0, Math.PI * 2); ctx.fill();
  };
  ext.proj.roar = function (ctx, p, t) {
    for (let i = 0; i < 3; i++) { const r = 16 + i * 15 + ((t * 0.9) % 15); ctx.globalAlpha = 1 - (i * 0.22 + ((t * 0.9) % 15) / 70); ctx.beginPath(); ctx.arc(-24, 0, r, -1.05, 1.05); ring(ctx, r, 6, i % 2 ? '#8a4a30' : '#c8b86a'); }
    ctx.globalAlpha = 1; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, -14); ctx.lineTo(20, -10); ctx.lineTo(14, -2); ctx.lineTo(24, 4); ctx.stroke();
  };
  ext.proj.potion = function (ctx, p, t) {
    ctx.rotate(t * 0.22); ctx.lineJoin = 'round';
    ctx.fillStyle = '#a8f060'; ctx.beginPath(); ctx.arc(0, 4, 12, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#d4e0c8'; ctx.beginPath(); ctx.rect(-4, -13, 8, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#8a5a3a'; ctx.beginPath(); ctx.rect(-5, -17, 10, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(-5, 1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(-t * 0.22); ctx.fillStyle = 'rgba(168,240,96,0.7)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-14 - i * 9, Math.sin(t * 0.5 + i * 2) * 8, 4 - i * 0.7, 0, Math.PI * 2); ctx.fill(); }
  };
  ext.proj.spell = function (ctx, p, t) {
    ctx.shadowColor = '#7dff6a'; ctx.shadowBlur = 12; ctx.rotate(t * 0.25); M.star(ctx, 0, 0, 20, 9, 5); ctx.fillStyle = '#7dff6a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.rotate(-t * 0.25); ctx.fillStyle = '#e9ffd8'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c8e04a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-18 - i * 8, Math.sin(t * 0.6 + i * 2) * 6, 3 - i * 0.6, 0, Math.PI * 2); ctx.fill(); }
  };
  ext.proj.nightmare = function (ctx, p, t) {
    const w = p.w, h = p.h; ctx.globalAlpha = 0.92;
    for (let i = 0; i < 7; i++) { const a = t * 0.06 + i * 0.9, r = w * 0.3 + (i % 3) * 5; ctx.fillStyle = i % 2 ? '#3b2a5c' : '#2a1d44'; ctx.beginPath(); ctx.arc(Math.cos(a) * w * 0.22, Math.sin(a * 1.3) * h * 0.2, r, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#1a1226'; ctx.beginPath(); ctx.arc(0, 0, w * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2d34a'; ctx.shadowColor = '#f2d34a'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(4, -4, 5, 3, 0.3, 0, Math.PI * 2); ctx.ellipse(-8, -3, 4, 2.6, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#e9e6ee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(-3, 11); ctx.lineTo(0, 8); ctx.lineTo(3, 11); ctx.lineTo(6, 8); ctx.stroke();
  };
  ext.proj.siren = function (ctx, p, t) {
    const hh = p.h / 2;
    for (let i = 0; i < 6; i++) { const k = i / 5, y = -hh + k * hh * 2, r = 20 + k * 54 + Math.sin(t * 0.2 + i) * 4; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(0, y, r, 8 + k * 7, 0, 0, Math.PI * 2); ring(ctx, r, 3, i % 2 ? '#2aa9b8' : '#8be9ff'); }
    ctx.globalAlpha = 1; ctx.font = `bold 20px ${M.FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = INK;
    for (let i = 0; i < 5; i++) { const a = t * 0.12 + i * 1.26, k = (i / 5 + t * 0.008) % 1, y = -hh + k * hh * 2, r = 30 + k * 50, ch = i % 2 ? '♪' : '♫'; ctx.strokeText(ch, Math.cos(a) * r, y); ctx.fillStyle = '#f2d34a'; ctx.fillText(ch, Math.cos(a) * r, y); }
  };
  ext.proj.brew = function (ctx, p, t) {
    const hh = p.h / 2;
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#6a2a8c'; ctx.beginPath(); ctx.ellipse(0, 0, p.w * 0.5, hh, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    for (let i = 0; i < 14; i++) { const ph = (t * 0.05 + i / 14) % 1, y = hh - ph * hh * 2, a = i * 2.3 + t * 0.1, r = 8 + hash(i) * 12, x = Math.cos(a) * p.w * 0.3 * (0.4 + ph * 0.6); ctx.fillStyle = i % 3 ? '#a8f060' : '#7a4cb0'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#e9ffd8'; ctx.font = `bold 22px ${M.FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText('☠', Math.sin(t * 0.1) * 12, -hh * 0.3); ctx.fillText('☠', Math.sin(t * 0.1) * 12, -hh * 0.3);
  };

  // ================================================================ ARMADILHAS
  ext.trap.tracks = function (ctx, tr) {
    const t = tr.age, a = tr.armed ? 1 : 0.5, fl = 0.75 + Math.sin(t * 0.3) * 0.25; ctx.globalAlpha = a;
    for (let i = -2; i <= 2; i++) { const x = i * 14, y = -4 - (i % 2) * 3; ctx.fillStyle = `rgba(232,113,43,${0.6 * fl})`; ctx.beginPath(); ctx.ellipse(x, y, 7, 4, 0.1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(255,214,120,${0.8 * fl})`; ctx.beginPath(); ctx.ellipse(x - 5, y, 3, 2.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(x, y, 7, 4, 0.1, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < 4; i++) { const k = ((t * 0.04 + i / 4) % 1); ctx.fillStyle = `rgba(255,${160 + i * 20},60,${1 - k})`; ctx.beginPath(); ctx.arc(-20 + i * 13, -8 - k * 22, 3 - k * 2, 0, Math.PI * 2); ctx.fill(); }
  };
  ext.trap.cauldron = function (ctx, tr) {
    const t = tr.age, a = tr.armed ? 1 : 0.55; ctx.globalAlpha = a; ctx.lineJoin = 'round';
    for (let i = -1; i <= 1; i++) { const h = 12 + Math.sin(t * 0.4 + i * 2) * 4; ctx.fillStyle = i % 2 ? '#f2b70c' : '#e8712b'; ctx.beginPath(); ctx.moveTo(i * 14 - 6, 0); ctx.quadraticCurveTo(i * 14, -h, i * 14 + 6, 0); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#26222c'; ctx.beginPath(); ctx.moveTo(-26, -14); ctx.quadraticCurveTo(-32, -44, 0, -46); ctx.quadraticCurveTo(32, -44, 26, -14); ctx.quadraticCurveTo(0, -4, -26, -14); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = '#a8f060'; ctx.beginPath(); ctx.ellipse(0, -45, 22, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 3; i++) { const k = ((t * 0.05 + i / 3) % 1); ctx.fillStyle = `rgba(190,255,120,${1 - k})`; ctx.beginPath(); ctx.arc(-10 + i * 10 + Math.sin(t * 0.2 + i) * 3, -48 - k * 26, 4 - k * 2.4, 0, Math.PI * 2); ctx.fill(); }
  };
  ext.trap.stink = function (ctx, tr) {
    const t = tr.age, a = tr.armed ? 0.9 : 0.5; ctx.globalAlpha = a;
    for (let i = 0; i < 7; i++) { const x = (i - 3) * 13 + Math.sin(t * 0.08 + i) * 5, y = -14 - (i % 3) * 14 - Math.abs(Math.sin(t * 0.06 + i)) * 8, r = 17 + (i % 2) * 6; ctx.fillStyle = i % 2 ? '#8aa83a' : '#a8bf4a'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.strokeStyle = '#5a7a1a'; ctx.lineWidth = 2.4; for (let i = 0; i < 3; i++) { const x = (i - 1) * 24; ctx.beginPath(); ctx.moveTo(x, -50); ctx.quadraticCurveTo(x + 8, -60 - Math.sin(t * 0.2 + i) * 4, x, -70); ctx.quadraticCurveTo(x - 8, -78, x + 2, -88); ctx.stroke(); }
    ctx.fillStyle = INK; for (let i = 0; i < 3; i++) { const a2 = t * 0.12 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a2) * 34, -40 + Math.sin(a2 * 1.4) * 14, 2, 0, Math.PI * 2); ctx.fill(); }
  };
})();
