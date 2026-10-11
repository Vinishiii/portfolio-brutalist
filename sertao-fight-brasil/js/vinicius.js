'use strict';
// ============================================================
// VINÍCIUS ANDREY — visual "de gente de verdade" + códigos flutuando nos especiais.
//   • rosto desenhado com anatomia: crânio e mandíbula, nariz com perfil, olhos com íris e pálpebra,
//     sobrancelhas, orelha, barba cheia com textura, bigode, lábios e óculos de acetato;
//   • jaqueta de couro preta aberta sobre camiseta branca (gola, lapela, zíper, barra, punhos), jeans escuro, tênis branco;
//   • FX de código: dígitos/hex verdes e roxos que sobem, balançam e piscam (partículas 'code' + chuva de código no super).
// Só desenho e partículas: nada aqui mexe na simulação (replays e placar continuam idênticos).
// ============================================================
(function () {
  const R = M.render, ext = R.ext, INK = M.C.ink, shade = R.shade, inkOf = R.inkOf;
  const GREEN = '#3dff7a', PURPLE = '#b25cff', GREEN_L = '#a6ffc4', PURPLE_L = '#dcb6ff';
  // sorteio só de enfeite: usa o Math.random nativo (durante a luta o Math.random é o da semente da partida; mexer nele mudaria a simulação e os replays)
  const rnd = M.crand;
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

  // ---------------------------------------------------------------- formas da cabeça (coordenadas locais, +x = frente, R≈17)
  function skullPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-15.5, 2);
    ctx.bezierCurveTo(-18.5, -10, -10, -20.5, 1, -20);        // nuca → topo
    ctx.bezierCurveTo(10.5, -19.5, 16.5, -14, 17, -7);        // topo → testa
    ctx.bezierCurveTo(17.2, -5.5, 18, -4, 18.6, -2.5);        // arcada → raiz do nariz
    ctx.bezierCurveTo(19.5, -0.5, 22.8, 3, 22.6, 5.2);        // ponte → ponta do nariz
    ctx.bezierCurveTo(22.4, 6.6, 20, 7, 18.4, 6.7);           // base do nariz
    ctx.bezierCurveTo(17.6, 7.4, 18.4, 8.3, 17.8, 9.2);       // lábio superior
    ctx.bezierCurveTo(17.2, 10.2, 18.2, 11.4, 17.3, 12.6);    // lábio inferior
    ctx.bezierCurveTo(16.6, 14, 17.4, 15.6, 15.6, 18);        // queixo
    ctx.bezierCurveTo(12.5, 21.6, 4, 22.6, -3.5, 20.5);       // base da mandíbula
    ctx.bezierCurveTo(-10.5, 18.5, -15, 11, -15.5, 2);        // ângulo da mandíbula → nuca
    ctx.closePath();
  }
  function beardPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-3.4, -3.2);                                    // costeleta, na frente da orelha
    ctx.bezierCurveTo(-1, 1, 3, 3.2, 7, 4.4);                  // linha da bochecha
    ctx.bezierCurveTo(9.5, 5.2, 11, 6.2, 11.6, 7.2);           // encontra o bigode
    ctx.lineTo(17.6, 9.4);                                     // boca (os lábios são pintados por cima)
    ctx.bezierCurveTo(18.2, 11.4, 18.8, 13.5, 18.2, 16.2);     // barba do queixo, frente
    ctx.bezierCurveTo(18, 20, 14.5, 24.6, 8, 25.4);            // ponta da barba
    ctx.bezierCurveTo(1, 26.4, -8, 23.2, -12.6, 15.5);         // sob a mandíbula
    ctx.bezierCurveTo(-14.2, 11.6, -13.6, 9, -11.2, 8.8);      // sobe atrás, abaixo do lóbulo da orelha
    ctx.bezierCurveTo(-8.8, 9.6, -6, 8.6, -4.8, 6);            // passa por baixo da orelha
    ctx.bezierCurveTo(-3.8, 3.6, -3.4, 0.4, -3.4, -3.2);       // sobe na frente da orelha
    ctx.closePath();
  }
  function hairPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-15.2, 4.5);
    ctx.bezierCurveTo(-19, -7, -12, -22, 0, -22.2);            // nuca → coroa
    ctx.bezierCurveTo(9, -22.6, 17.4, -18.4, 18, -12);         // coroa → quina da testa
    ctx.bezierCurveTo(18, -11, 17.2, -10.6, 16.4, -11.4);
    ctx.bezierCurveTo(13.4, -14.6, 9, -16.2, 4.6, -15.6);      // franja penteada pro lado
    ctx.bezierCurveTo(0.6, -15, -1.8, -11.4, -2.6, -7);        // têmpora
    ctx.lineTo(-3.2, -3.4);                                    // costeleta
    ctx.bezierCurveTo(-4.4, -2.4, -6.2, -2.6, -7.4, -3.4);     // sobre a orelha
    ctx.bezierCurveTo(-9.4, -4.2, -11.4, -3.4, -12.4, -1);
    ctx.bezierCurveTo(-13.4, 1.6, -14.2, 4.5, -15.2, 4.5);
    ctx.closePath();
  }

  // ---------------------------------------------------------------- olhos, sobrancelhas, boca
  function eyePaths(cx, cy, w, h, lowUp) {
    return {
      up: p => { p.moveTo(cx - w / 2, cy + 0.5); p.quadraticCurveTo(cx - w * 0.04, cy - h * 1.3, cx + w / 2, cy - 0.2); },
      lo: p => { p.quadraticCurveTo(cx + w * 0.1, cy + h * 0.9 - lowUp, cx - w / 2, cy + 0.5); }
    };
  }
  function eye(ctx, cx, cy, w, h, st, skin) {
    const lid = st.hurt ? 1 : st.angry ? 0.36 : st.shout ? 0.28 : st.happy ? 0.2 : 0.1;
    if (st.hurt) {
      // olho espremido de dor: pálpebra curva + vincos
      ctx.strokeStyle = '#1b120d'; ctx.lineWidth = 1.9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - w / 2, cy - 0.4); ctx.quadraticCurveTo(cx, cy + h * 0.95, cx + w / 2, cy - 0.8); ctx.stroke();
      ctx.lineWidth = 0.9; ctx.strokeStyle = shade(skin, 0.55);
      ctx.beginPath(); ctx.moveTo(cx - w / 2 - 0.5, cy - 1.6); ctx.lineTo(cx - w / 2 - 3, cy - 3); ctx.moveTo(cx - w / 2 - 0.4, cy + 0.6); ctx.lineTo(cx - w / 2 - 3, cy + 1.6); ctx.stroke();
      return;
    }
    const hh = h * (1 - lid * 0.75), lowUp = st.happy ? 1.3 : 0;
    const E = eyePaths(cx, cy, w, hh, lowUp);
    const path = new Path2D(); E.up(path); E.lo(path); path.closePath();
    ctx.fillStyle = '#eee5d6'; ctx.fill(path);
    ctx.save(); ctx.clip(path);
    const ir = Math.min(hh * 0.82, w * 0.34), ix = cx + w * 0.15, iy = cy - 0.1 + lid * 0.4;
    ctx.fillStyle = '#4a2a16'; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1c0f08'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = '#0b0705'; ctx.beginPath(); ctx.arc(ix + 0.2, iy, ir * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ix - ir * 0.32, iy - ir * 0.38, Math.max(0.55, ir * 0.22), 0, Math.PI * 2); ctx.fill();
    const sh = ctx.createLinearGradient(0, cy - hh * 1.2, 0, cy + hh * 0.3); sh.addColorStop(0, 'rgba(25,10,6,0.55)'); sh.addColorStop(0.55, 'rgba(25,10,6,0)'); ctx.fillStyle = sh; ctx.fillRect(cx - w, cy - hh * 1.5, w * 2, hh * 2);
    ctx.restore();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // pálpebra de cima grossa (cílios) + canto de trás
    ctx.strokeStyle = '#1b120d'; ctx.lineWidth = st.angry ? 2.3 : 1.9;
    ctx.beginPath(); E.up(ctx); ctx.stroke();
    ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(cx - w / 2, cy + 0.5); ctx.lineTo(cx - w / 2 - 1.5, cy - 0.5); ctx.stroke();
    // pálpebra de baixo suave e vinco acima do olho
    ctx.strokeStyle = shade(skin, 0.62); ctx.lineWidth = 0.8; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(cx - w / 2 + 0.6, cy + 0.9); ctx.quadraticCurveTo(cx + w * 0.1, cy + hh * 0.9 + 0.6 - lowUp, cx + w / 2 - 0.4, cy + 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - w / 2 + 0.4, cy - hh * 0.9 - 0.9 + lid * 1.4); ctx.quadraticCurveTo(cx, cy - hh * 1.9 - 0.7 + lid * 1.6, cx + w / 2 + 0.2, cy - hh * 0.8 - 0.6 + lid * 1.4); ctx.stroke();
    ctx.globalAlpha = 1;
    // olheira leve
    ctx.fillStyle = 'rgba(70,30,30,0.1)'; ctx.beginPath(); ctx.ellipse(cx + 0.4, cy + hh * 1.5 + 0.6, w * 0.5, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  }
  function brow(ctx, x0, y0, x1, y1, th, arch, color) {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - arch;
    ctx.beginPath(); ctx.moveTo(x0, y0 + th * 0.2);
    ctx.quadraticCurveTo(mx, my - th * 0.2, x1, y1);
    ctx.lineTo(x1 + 0.2, y1 + th * 0.55);
    ctx.quadraticCurveTo(mx, my + th * 0.95, x0, y0 + th * 0.95);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  function mouth(ctx, st, skin, hair) {
    const cx = 13.4, cy = 10.9;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (st.shout) {
      ctx.fillStyle = '#2a0d0a'; ctx.beginPath(); ctx.moveTo(8.6, 9.6); ctx.quadraticCurveTo(13.4, 8.4, 18, 9.2); ctx.quadraticCurveTo(19, 14.6, 13.8, 15.6); ctx.quadraticCurveTo(8.4, 14.2, 8.6, 9.6); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#f2ecdf'; ctx.fillRect(8, 9, 11, 2.7); ctx.fillStyle = '#b3514a'; ctx.beginPath(); ctx.ellipse(13.6, 15.2, 4.2, 2.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#7a3a2e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8.6, 9.6); ctx.quadraticCurveTo(13.4, 8.4, 18, 9.2); ctx.stroke();
    } else if (st.hurt) {
      ctx.fillStyle = '#2a0d0a'; ctx.beginPath(); ctx.moveTo(9.4, 11); ctx.quadraticCurveTo(13.4, 9.8, 17.6, 10.4); ctx.quadraticCurveTo(16.4, 13.8, 12.6, 13.4); ctx.quadraticCurveTo(10, 13, 9.4, 11); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#f2ecdf'; ctx.fillRect(9, 10, 9, 1.9); ctx.restore();
      ctx.strokeStyle = '#6e3326'; ctx.lineWidth = 1; ctx.stroke();
    } else if (st.angry) {
      ctx.fillStyle = '#efe8da'; rr(ctx, 9.8, 9.7, 8, 2.5, 1); ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,30,0.55)'; ctx.lineWidth = 0.6; for (let x = 11.4; x < 17.6; x += 1.7) { ctx.beginPath(); ctx.moveTo(x, 9.8); ctx.lineTo(x, 12.1); ctx.stroke(); }
      ctx.strokeStyle = '#6a2e22'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(9.4, 9.6); ctx.quadraticCurveTo(13.8, 9.2, 18.2, 10); ctx.moveTo(9.6, 12.4); ctx.quadraticCurveTo(14, 12.9, 18, 12.1); ctx.stroke();
    } else if (st.happy) {
      ctx.fillStyle = '#f4eee2'; ctx.beginPath(); ctx.moveTo(9.2, 10); ctx.quadraticCurveTo(13.4, 14.2, 17.8, 9.8); ctx.quadraticCurveTo(13.6, 10.9, 9.2, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6a2e22'; ctx.lineWidth = 1.1; ctx.stroke();
      ctx.strokeStyle = '#9d5a48'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(10.2, 11.6); ctx.quadraticCurveTo(13.5, 14.4, 16.8, 11.2); ctx.stroke();
    } else {
      // boca fechada, relaxada: linha da boca + lábio de baixo
      ctx.strokeStyle = '#a15f4d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10.4, 12); ctx.quadraticCurveTo(13.8, 13, 17.2, 11.7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,220,200,0.35)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(11.6, 12); ctx.quadraticCurveTo(14, 12.7, 16.4, 11.8); ctx.stroke();
      ctx.strokeStyle = '#3a1a12'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(9.8, 10.6); ctx.quadraticCurveTo(13.8, 11.4, 18, 10.2); ctx.stroke();
    }
  }

  // ---------------------------------------------------------------- cabeça completa
  // O rosto é caro (barba com 70 fios, cabelo, gradientes): pinta uma vez por expressão num sprite 3× e só carimba a cada quadro.
  const SPR = {}, PX = 3, X0 = -23, Y0 = -28, SW = 50, SH = 57;
  function headSprite(def, o) {
    const L = R.style.light, key = [+!!o.hurt, +!!o.angry, +!!o.shout, +!!o.happy, +!!R.style.paint, L.x.toFixed(2), L.y.toFixed(2), def.colors.skin, def.colors.hair].join('|');
    let e = SPR[key]; if (e) return e;
    const c = document.createElement('canvas'); c.width = Math.ceil(SW * PX); c.height = Math.ceil(SH * PX);
    const g = c.getContext('2d'); g.scale(PX, PX); g.translate(-X0, -Y0); g.lineJoin = 'round'; g.lineCap = 'round';
    paintHead(g, def, o);
    return (SPR[key] = { c, w: SW, h: SH });
  }
  ext.realHead = function (ctx, rig, def, o, col, ink, thick, sil) {
    const C = def.colors, H = rig.head, s = rig.s, hu = rig.hu, k = 0.92 * s;
    const ang = Math.atan2(hu[1], hu[0]) + Math.PI / 2;
    ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(ang); ctx.scale(k, k); ctx.translate(0, -2.5); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (sil) {
      // só a silhueta (contorno grosso, rim light, fantasmas): crânio + barba + cabelo
      ctx.fillStyle = sil; ctx.strokeStyle = sil; ctx.lineWidth = (Math.max(0, thick) + 3) / k;
      for (const f of [skullPath, beardPath, hairPath]) { f(ctx); ctx.fill(); ctx.stroke(); }
      ctx.restore(); return;
    }
    if (o.flash) {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 2.2;
      for (const f of [skullPath, beardPath, hairPath]) { f(ctx); ctx.fill(); ctx.stroke(); }
      ctx.restore(); return;
    }
    const e = headSprite(def, o); ctx.drawImage(e.c, X0, Y0, e.w, e.h);
    ctx.restore();
  };
  function paintHead(ctx, def, st) {
    const C = def.colors, skin = C.skin, hairC = C.hair, D = def.details || [];
    const col = c => c;
    const outline = inkOf(C.skin, INK);
    // 1) pele com luz e sombra
    skullPath(ctx); ctx.fillStyle = skin; ctx.fill();
    ctx.save(); skullPath(ctx); ctx.clip();
    let g = ctx.createLinearGradient(-14, -20, 14, 22); g.addColorStop(0, 'rgba(255,226,190,0.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(90,34,14,0.3)'); ctx.fillStyle = g; ctx.fillRect(-24, -26, 52, 56);
    g = ctx.createLinearGradient(-17, 0, 3, 0); g.addColorStop(0, 'rgba(50,22,12,0.4)'); g.addColorStop(1, 'rgba(50,22,12,0)'); ctx.fillStyle = g; ctx.fillRect(-24, -26, 30, 56);
    g = ctx.createRadialGradient(9, 3.5, 0.5, 9, 3.5, 10); g.addColorStop(0, 'rgba(222,112,86,0.34)'); g.addColorStop(1, 'rgba(214,106,88,0)'); ctx.fillStyle = g; ctx.fillRect(-2, -8, 24, 24);
    g = ctx.createRadialGradient(7, -13, 0.5, 7, -13, 9); g.addColorStop(0, 'rgba(255,236,206,0.2)'); g.addColorStop(1, 'rgba(255,236,206,0)'); ctx.fillStyle = g; ctx.fillRect(-4, -24, 24, 22);
    if (R.style.paint) { g = ctx.createLinearGradient(-R.style.light.x * 16, -R.style.light.y * 16, R.style.light.x * 16, R.style.light.y * 16); g.addColorStop(0, R.style.key); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, R.style.fill); ctx.globalAlpha = 0.09; ctx.fillStyle = g; ctx.fillRect(-24, -26, 52, 56); ctx.globalAlpha = 1; }
    ctx.restore();
    skullPath(ctx); ctx.lineWidth = 2.2; ctx.strokeStyle = outline; ctx.stroke();

    // 3) barba cheia (textura de fios); a rala sobe pela bochecha em duas camadas translúcidas
    ctx.save(); skullPath(ctx); ctx.clip();
    for (const [dy, al] of [[-3.6, 0.16], [-1.9, 0.2]]) { ctx.save(); ctx.translate(0, dy); beardPath(ctx); ctx.globalAlpha = al; ctx.fillStyle = hairC; ctx.fill(); ctx.restore(); }
    ctx.restore();
    ctx.save(); beardPath(ctx); ctx.fillStyle = hairC; ctx.fill(); ctx.clip();
    const bl = shade(C.hair, 2.3), bd = shade(C.hair, 0.55);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 74; i++) {
      const x = -14 + hash(i * 3) * 34, y = -2 + hash(i * 3 + 1) * 29, len = 2 + hash(i * 3 + 2) * 3.2, a = 1.15 + (hash(i + 9) - 0.5) * 1.0;
      ctx.strokeStyle = i % 3 === 0 ? bl : bd; ctx.globalAlpha = i % 3 === 0 ? 0.3 : 0.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len * 0.6, y + Math.sin(a) * len); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    g = ctx.createLinearGradient(0, 2, 0, 12); g.addColorStop(0, 'rgba(60,40,30,0.5)'); g.addColorStop(1, 'rgba(60,40,30,0)'); ctx.fillStyle = g; ctx.fillRect(-16, 0, 36, 14);
    ctx.restore();
    ctx.lineWidth = 1.5; ctx.strokeStyle = inkOf(C.hair, INK); beardPath(ctx); ctx.stroke();
    // orelha (por cima da pele, fora da barba)
    ctx.fillStyle = shade(skin, 0.94); ctx.beginPath(); ctx.ellipse(-8, 2.6, 3.7, 5.7, -0.12, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = outline; ctx.stroke();
    ctx.strokeStyle = shade(skin, 0.58); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(-8.3, 2.8, 2.1, -1.1, 2.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-7.4, 3.2); ctx.lineTo(-6.6, 5.6); ctx.stroke();

    // 4) nariz: ponte, asa, narina e sombra
    ctx.strokeStyle = 'rgba(255,238,220,0.32)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(19.4, -1.6); ctx.quadraticCurveTo(21.2, 1.2, 21.6, 3.6); ctx.stroke();
    ctx.strokeStyle = shade(skin, 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(17.2, 3); ctx.quadraticCurveTo(16.2, 5.6, 18.2, 6.4); ctx.stroke();
    ctx.fillStyle = 'rgba(40,16,10,0.75)'; ctx.beginPath(); ctx.ellipse(19.8, 5.7, 1.5, 0.8, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shade(skin, 0.5); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(18.6, 6.9); ctx.quadraticCurveTo(20.6, 7.2, 22, 6); ctx.stroke();
    ctx.fillStyle = 'rgba(70,28,18,0.12)'; ctx.beginPath(); ctx.moveTo(18.5, -2); ctx.quadraticCurveTo(15.5, 2, 17.2, 6.4); ctx.lineTo(13, 6.2); ctx.quadraticCurveTo(14.5, 0, 16.5, -3); ctx.closePath(); ctx.fill();

    // 5) boca por cima da barba + bigode
    mouth(ctx, st, skin, hairC);
    ctx.fillStyle = hairC; ctx.beginPath(); ctx.moveTo(10.4, 7.4); ctx.quadraticCurveTo(14.2, 5.2, 18.6, 6.6); ctx.quadraticCurveTo(19.6, 8.4, 17.6, 9.4); ctx.quadraticCurveTo(14, 8.2, 10.6, 9.8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = inkOf(C.hair, INK); ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = shade(C.hair, 2.2); ctx.globalAlpha = 0.3; ctx.lineWidth = 0.7; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(11.4 + i * 1.2, 7.6 + i * 0.1); ctx.lineTo(12.4 + i * 1.3, 9.2); ctx.stroke(); } ctx.globalAlpha = 1;

    // 6) sobrancelhas grossas
    const bc = col(C.hair);
    if (st.angry) { brow(ctx, 6.4, -11.6, 16.8, -7.4, 2.6, 0.2, bc); brow(ctx, -3.2, -10.6, 4.6, -8.4, 2.3, 0, bc); }
    else if (st.hurt) { brow(ctx, 6, -9.6, 16.4, -11.2, 2.5, 1.2, bc); brow(ctx, -3, -8.8, 4.4, -10.4, 2.2, 0.8, bc); }
    else if (st.happy) { brow(ctx, 6.4, -11.2, 16.6, -9.6, 2.5, 1.5, bc); brow(ctx, -3, -10.4, 4.4, -10.6, 2.2, 1, bc); }
    else { brow(ctx, 6.4, -10.6, 16.6, -9, 2.6, 1.2, bc); brow(ctx, -3, -9.8, 4.4, -10, 2.3, 0.9, bc); }

    // 7) olhos (por baixo da armação)
    eye(ctx, 10.8, -3.7, 7.8, 4.2, st, skin);
    eye(ctx, 0.5, -3.7, 5.4, 3.8, st, skin);

    // 8) cabelo: massa escura, fios e brilho
    hairPath(ctx); ctx.fillStyle = hairC; ctx.fill();
    ctx.save(); hairPath(ctx); ctx.clip();
    const hl = shade(C.hair, 2.1), hd = shade(C.hair, 0.5);
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 22; i++) {
      const t = i / 21, x0 = lerp(16, -9, t), y0 = lerp(-13.4, -4, t * t), x1 = lerp(10, -15, t), y1 = lerp(-22, -9, t);
      ctx.strokeStyle = i % 2 ? hl : hd; ctx.globalAlpha = i % 2 ? 0.34 : 0.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(lerp(x0, x1, 0.55) + 3, lerp(y0, y1, 0.5) - 1.5 - hash(i) * 2, x1, y1); ctx.stroke();
    }
    ctx.globalAlpha = 0.34; ctx.strokeStyle = '#a89684'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-6, -19.4); ctx.quadraticCurveTo(4, -22.2, 13, -17.4); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.strokeStyle = shade(C.hair, 1.4); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(15.4, -12.4); ctx.quadraticCurveTo(9, -16, 3.2, -14.8); ctx.stroke();
    ctx.globalAlpha = 1; ctx.restore();
    ctx.lineWidth = 1.7; ctx.strokeStyle = inkOf(C.hair, INK); hairPath(ctx); ctx.stroke();

    // 9) óculos de acetato (armação azul-marinho fina, lentes com reflexo)
    if (D.includes('glasses')) {
      const frame = '#14224a';
      ctx.lineWidth = 1.15; ctx.strokeStyle = frame;
      for (const L of [[5.4, -9, 11, 9.4, 2.8], [-3.4, -9, 8, 9.4, 2.6]]) {
        rr(ctx, L[0], L[1], L[2], L[3], L[4]); ctx.fillStyle = 'rgba(190,222,255,0.14)'; ctx.fill(); ctx.stroke();
        ctx.save(); rr(ctx, L[0], L[1], L[2], L[3], L[4]); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(L[0] + 2.2, L[1] + L[3]); ctx.lineTo(L[0] + 5.2, L[1]); ctx.stroke(); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(L[0] + 4.6, L[1] + L[3]); ctx.lineTo(L[0] + 6.4, L[1] + 3); ctx.stroke(); ctx.restore();
      }
      ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(5.6, -9); ctx.lineTo(16.2, -9); ctx.moveTo(-3.2, -9); ctx.lineTo(4.4, -9); ctx.stroke();
      ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(4.6, -5.6); ctx.quadraticCurveTo(5, -6.6, 5.4, -5.6); ctx.stroke();
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3.4, -6); ctx.lineTo(-10.6, -5); ctx.lineTo(-11.2, -3); ctx.stroke();
    }
  }

  // ---------------------------------------------------------------- figurino: jaqueta, jeans, tênis
  const LEATHER_SHEEN = 'rgba(206,210,222,';
  const kit = {};
  kit.jacket = function (ctx, g, def) {
    const { H, N, u, p, L, sw, hw, s } = g, C = def.colors;
    const pt = (a, b) => { const w = hw + (sw - hw) * a; return [H[0] + u[0] * L * a + p[0] * w * b, H[1] + u[1] * L * a + p[1] * w * b]; };
    const poly = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };
    const leather = C.torso, tee = '#ece8df';
    ctx.save(); g.clip(); ctx.clip(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // a luz pintada do jogo tinge o preto de azul: escurece de volta para o couro continuar preto (só o brilho fica azulado)
    const lum = (parseInt(leather.slice(1, 3), 16) * 0.3 + parseInt(leather.slice(3, 5), 16) * 0.59 + parseInt(leather.slice(5, 7), 16) * 0.11);
    ctx.fillStyle = lum < 35 ? 'rgba(5,5,8,0.66)' : 'rgba(5,5,8,0.14)'; ctx.fillRect(H[0] - 90, H[1] - 130, 180, 190);
    // brilho de couro: faixas diagonais que correm pelas costas e pelo ombro
    let gr = ctx.createLinearGradient(pt(0.9, -0.9)[0], pt(0.9, -0.9)[1], pt(0.1, 0.1)[0], pt(0.1, 0.1)[1]);
    gr.addColorStop(0, LEATHER_SHEEN + '0.34)'); gr.addColorStop(0.7, LEATHER_SHEEN + '0)');
    poly([pt(0.96, -1.05), pt(0.96, -0.5), pt(0.12, -0.05), pt(0.12, -0.6)]); ctx.fillStyle = gr; ctx.fill();
    ctx.strokeStyle = LEATHER_SHEEN + '0.2)'; ctx.lineWidth = 1.6; ctx.beginPath(); const a0 = pt(0.84, -0.2), a1 = pt(0.3, 0.12); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
    // dobras e costura das costas
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.5;
    for (const [a, b, c, d] of [[0.7, -0.95, 0.52, -0.4], [0.42, -0.95, 0.3, -0.5], [0.2, -0.9, 0.16, -0.5]]) { const q0 = pt(a, b), q1 = pt(c, d); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.quadraticCurveTo(lerp(q0[0], q1[0], 0.4) + p[0] * 2, lerp(q0[1], q1[1], 0.4) + p[1] * 2, q1[0], q1[1]); ctx.stroke(); }
    ctx.setLineDash([2.2, 2.2]); ctx.strokeStyle = 'rgba(190,200,220,0.28)'; ctx.lineWidth = 0.9; const s0 = pt(0.86, -0.5), s1 = pt(0.1, -0.45); ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke(); ctx.setLineDash([]);

    // camiseta branca entre as duas abas da jaqueta (com a barriga)
    poly([pt(0.97, 0.3), pt(0.99, 0.84), pt(0.02, 0.9), pt(0.0, 0.34)]);
    gr = ctx.createLinearGradient(pt(0.5, 0.3)[0], pt(0.5, 0.3)[1], pt(0.5, 0.9)[0], pt(0.5, 0.9)[1]); gr.addColorStop(0, 'rgba(0,0,0,0.34)'); gr.addColorStop(0.35, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = tee; ctx.fill(); ctx.fillStyle = gr; ctx.fill();
    // gola redonda e estampa </>
    const nc = pt(0.98, 0.6); ctx.strokeStyle = shade(tee, 0.62); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(pt(0.99, 0.36)[0], pt(0.99, 0.36)[1]); ctx.quadraticCurveTo(nc[0] - u[0] * 8, nc[1] - u[1] * 8, pt(0.99, 0.84)[0], pt(0.99, 0.84)[1]); ctx.stroke();
    ctx.save(); const tc = pt(0.6, 0.58); ctx.translate(tc[0], tc[1]); ctx.rotate(Math.atan2(u[1], u[0]) + Math.PI / 2); ctx.font = `bold ${7.4 * s}px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = PURPLE; ctx.fillText('</', -1.6, 0.3); ctx.fillStyle = '#17c75a'; ctx.fillText('>', 4.6, 0.3); ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { const q0 = pt(0.12 + i * 0.14, 0.4), q1 = pt(0.1 + i * 0.14, 0.82); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); }

    // aba do outro lado (mais ao fundo), na frente do corpo
    poly([pt(0.96, 0.84), pt(0.98, 1.08), pt(0.0, 1.1), pt(0.02, 0.88)]); ctx.fillStyle = shade(leather, 1.5); ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    // aba da frente: borda grossa de couro com os dentes do zíper
    const e0 = pt(0.97, 0.3), e1 = pt(0.5, 0.2), e2 = pt(0.02, 0.36);
    ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.quadraticCurveTo(e1[0], e1[1], e2[0], e2[1]); ctx.lineWidth = 7.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = shade(leather, 1.55); ctx.stroke();
    ctx.lineWidth = 1.3; ctx.strokeStyle = LEATHER_SHEEN + '0.42)'; ctx.beginPath(); ctx.moveTo(e0[0] - p[0] * 0.5, e0[1] - p[1] * 0.5); ctx.quadraticCurveTo(e1[0] - p[0] * 0.5, e1[1] - p[1] * 0.5, e2[0], e2[1]); ctx.stroke();
    ctx.strokeStyle = '#cfd4dc'; ctx.lineWidth = 1.2;
    for (let i = 0; i <= 15; i++) { const t = i / 15, x = (1 - t) * (1 - t) * e0[0] + 2 * (1 - t) * t * e1[0] + t * t * e2[0], y = (1 - t) * (1 - t) * e0[1] + 2 * (1 - t) * t * e1[1] + t * t * e2[1]; ctx.beginPath(); ctx.moveTo(x + p[0] * 2.8, y + p[1] * 2.8); ctx.lineTo(x + p[0] * 5.4, y + p[1] * 5.4); ctx.stroke(); }
    // zíper diagonal do bolso do peito
    const z0 = pt(0.74, -0.02), z1 = pt(0.54, -0.52); ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(z0[0], z0[1]); ctx.lineTo(z1[0], z1[1]); ctx.stroke(); ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 1.6; ctx.setLineDash([1.4, 1.2]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#e8ecf2'; ctx.beginPath(); ctx.arc(z1[0], z1[1], 1.5, 0, Math.PI * 2); ctx.fill();
    // barra canelada
    for (const [b0, b1] of [[-1.08, 0.38], [0.84, 1.1]]) {
      poly([pt(0.11, b0), pt(0.11, b1), pt(-0.01, b1), pt(-0.01, b0)]); ctx.fillStyle = shade(leather, 1.28); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.9; const n = Math.round((b1 - b0) * 11); for (let i = 1; i < n; i++) { const b = lerp(b0, b1, i / n), q0 = pt(0.11, b), q1 = pt(-0.01, b); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); }
    }
    ctx.restore();

    // gola alta de couro (atrás do pescoço) e lapela virada (na frente)
    const nb = (a, b) => [N[0] + u[0] * a + p[0] * b, N[1] + u[1] * a + p[1] * b];
    ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
    const back = [nb(-5, -sw * 0.62), nb(15, -sw * 0.34), nb(12, -2), nb(-3, 1)];
    poly(back); ctx.fillStyle = shade(leather, 1.18); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = LEATHER_SHEEN + '0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(back[1][0], back[1][1]); ctx.lineTo(back[2][0], back[2][1]); ctx.stroke();
    const lap = [nb(-4, sw * 0.12), nb(9, sw * 0.4), nb(-7, sw * 0.9), pt(0.66, 0.5), pt(0.93, 0.3)];
    poly(lap); ctx.fillStyle = shade(leather, 1.45); ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.strokeStyle = LEATHER_SHEEN + '0.5)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(lap[1][0], lap[1][1]); ctx.lineTo(lap[2][0], lap[2][1]); ctx.stroke();
    ctx.fillStyle = '#d9dde4'; ctx.beginPath(); ctx.arc(lap[3][0] - p[0] * 2, lap[3][1] - p[1] * 2, 1.7, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke();
  };
  kit.sleeve = function (ctx, arm, s, def, near) {
    const C = def.colors, mid = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // brilho no antebraço e no braço (lado da luz), dobras no cotovelo
    ctx.strokeStyle = LEATHER_SHEEN + '0.26)'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); const a = mid(arm[0], arm[1], 0.18), b = mid(arm[0], arm[1], 0.78); ctx.moveTo(a[0] + 1.6, a[1] - 2.4); ctx.lineTo(b[0] + 1.6, b[1] - 2.4); ctx.stroke();
    const e = arm[1]; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1.4; for (const d of [-3.4, 0, 3.4]) { ctx.beginPath(); ctx.moveTo(e[0] - 5, e[1] + d - 2); ctx.quadraticCurveTo(e[0], e[1] + d + 1, e[0] + 5, e[1] + d - 2); ctx.stroke(); }
    // ombreira com botão de pressão
    if (near) { const sh = arm[0], d = [arm[1][0] - sh[0], arm[1][1] - sh[1]], l = Math.hypot(d[0], d[1]) || 1, ux = d[0] / l, uy = d[1] / l; ctx.save(); ctx.translate(sh[0] + ux * 8, sh[1] + uy * 8); ctx.rotate(Math.atan2(uy, ux)); rr(ctx, -4.5, -6.4 * s, 9, 12.8 * s, 2.4); ctx.fillStyle = shade(C.arms, 1.5); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#d9dde4'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    // punho de couro com zíper
    const c0 = mid(arm[1], arm[2], 0.74), c1 = mid(arm[1], arm[2], 0.9);
    ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.lineWidth = 13.4 * s; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 10.6 * s; ctx.strokeStyle = shade(C.arms, 1.7); ctx.stroke();
    const cm = mid(c0, c1, 0.5); ctx.lineWidth = 1.1; ctx.strokeStyle = '#d4d8df'; ctx.beginPath(); ctx.moveTo(c0[0] + 1.5, c0[1] - 2.2); ctx.lineTo(c1[0] + 1.5, c1[1] - 2.2); ctx.stroke();
    ctx.fillStyle = '#e8ecf2'; ctx.beginPath(); ctx.arc(cm[0] + 1.5, cm[1] - 2.2, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  kit.jeans = function (ctx, leg, s, def, near) {
    const mid = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    ctx.save(); ctx.lineCap = 'round';
    // desbotado no joelho e na coxa, costura laranja
    const k = leg[1]; ctx.fillStyle = 'rgba(150,176,222,0.12)'; ctx.beginPath(); ctx.ellipse(k[0] + 2, k[1], 3.6 * s, 8 * s, M.rad(leg[3]) * -0.5, 0, Math.PI * 2); ctx.fill();
    const t0 = mid(leg[0], leg[1], 0.2), t1 = mid(leg[0], leg[1], 0.86);
    ctx.strokeStyle = 'rgba(150,176,222,0.14)'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(t0[0] + 2.4, t0[1]); ctx.lineTo(t1[0] + 2.4, t1[1]); ctx.stroke();
    ctx.setLineDash([2.2, 2]); ctx.strokeStyle = 'rgba(214,150,70,0.7)'; ctx.lineWidth = 0.9; const a = mid(leg[0], leg[1], 0.1), b = mid(leg[1], leg[2], 0.86);
    ctx.beginPath(); ctx.moveTo(a[0] + 5.6 * s, a[1]); ctx.lineTo(leg[1][0] + 5.8 * s, leg[1][1]); ctx.lineTo(b[0] + 5.4 * s, b[1]); ctx.stroke(); ctx.setLineDash([]);
    // barra dobrada
    const c0 = mid(leg[1], leg[2], 0.74), c1 = mid(leg[1], leg[2], 0.93);
    ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.lineWidth = 17.6 * s; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 14.6 * s; ctx.strokeStyle = shade(def.colors.legs, 1.5); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(214,150,70,0.65)'; ctx.beginPath(); ctx.moveTo(c0[0] + 4, c0[1]); ctx.lineTo(c1[0] + 4, c1[1]); ctx.stroke();
    ctx.restore();
  };
  kit.sneaker = function (ctx, leg, s, def) {
    const a = M.rad(leg[3]), f = leg[2], ca = Math.cos(a), sa = Math.sin(a);
    const tx = f[0] + ca * 15 * s, ty = f[1] - sa * 15 * s, bx = f[0] - ca * 5 * s, by = f[1] + sa * 5 * s;
    ctx.save(); ctx.lineCap = 'round';
    // sola de borracha e frisos
    ctx.strokeStyle = '#bdb7a8'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(bx + sa * 4.8, by + ca * 4.8); ctx.lineTo(tx + sa * 4.8, ty + ca * 4.8); ctx.stroke();
    ctx.strokeStyle = PURPLE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx + sa * 3, by + ca * 3); ctx.lineTo(lerp(bx, tx, 0.42) + sa * 3, lerp(by, ty, 0.42) + ca * 3); ctx.stroke();
    ctx.strokeStyle = GREEN; ctx.beginPath(); ctx.moveTo(lerp(bx, tx, 0.5) + sa * 3, lerp(by, ty, 0.5) + ca * 3); ctx.lineTo(lerp(bx, tx, 0.8) + sa * 3, lerp(by, ty, 0.8) + ca * 3); ctx.stroke();
    // cadarço e biqueira
    ctx.strokeStyle = 'rgba(40,40,50,0.55)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const t = 0.28 + i * 0.16, x = lerp(bx, tx, t), y = lerp(by, ty, t); ctx.beginPath(); ctx.moveTo(x - sa * 3.4, y - ca * 3.4); ctx.lineTo(x + sa * 1.6, y + ca * 1.6); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(lerp(bx, tx, 0.72) - sa * 2, lerp(by, ty, 0.72) - ca * 2); ctx.lineTo(tx - sa * 1.5, ty - ca * 1.5); ctx.stroke();
    ctx.restore();
  };
  ext.kit = kit;

  // ---------------------------------------------------------------- códigos flutuando (partículas e efeitos)
  const TOK = ['0', '1', '0', '1', '1', '0', '2', '3', '4', '5', '6', '7', '8', '9', '01', '10', '101', '0x1F', '0xFF', '0xA7', '0x00', '404', '200', '1010', '0110', '{}', '</>', '=>', '&&', '++', ';'];
  const pick = n => TOK[Math.floor(hash(n) * TOK.length)];
  ext.particle = function (ctx, p) {
    if (p.type !== 'code') return;
    const age = p.max - p.life, fade = Math.min(1, age / 5 + 0.15);
    ctx.globalAlpha = Math.min(1, (p.life / p.max) * 1.7) * fade * (hash(Math.floor(age / 3) + p.seed) > 0.93 ? 0.35 : 1);
    ctx.translate(Math.sin(p.ph + age * 0.16) * (p.wob || 0), 0);
    const sz = p.size * (age < 6 ? 0.55 + age * 0.075 : 1);
    ctx.font = `bold ${sz}px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const ch = p.glitch && age % 9 < 2 ? pick(p.seed + Math.floor(age / 9)) : p.ch;
    // brilho barato (contorno largo e fraco na cor do código), contorno escuro e miolo; sem shadowBlur, que pesa em quantidade
    const a0 = ctx.globalAlpha;
    ctx.globalAlpha = a0 * 0.24; ctx.lineWidth = sz * 0.55; ctx.strokeStyle = p.color; ctx.strokeText(ch, 0, 0);
    ctx.globalAlpha = a0 * 0.9; ctx.lineWidth = Math.max(2, sz * 0.2); ctx.strokeStyle = 'rgba(10,5,24,0.85)'; ctx.strokeText(ch, 0, 0);
    ctx.globalAlpha = a0; ctx.fillStyle = p.color; ctx.fillText(ch, 0, 0);
  };
  // chuva de código em tela cheia (super): colunas de dígitos caindo, verde e roxo
  ext.fx = function (ctx, e, k) {
    if (e.type === 'coderain') {
      const cols = 22, W = M.W, H = M.H, n = 7, sz = 17;
      ctx.font = `bold ${sz}px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const env = k < 0.12 ? k / 0.12 : k > 0.7 ? (1 - k) / 0.3 : 1;
      for (let c = 0; c < cols; c++) {
        const x = (c + 0.5) * (W / cols) + (hash(c) - 0.5) * 14, sp = 3.2 + hash(c + 40) * 3.4, off = hash(c + 80) * H * 1.5;
        const head = ((e.t * sp + off) % (H + n * sz)) - sz;
        const green = c % 2 === 0;
        for (let i = 0; i < n; i++) {
          const y = head - i * (sz + 2); if (y < -sz || y > H + sz) continue;
          const a = (1 - i / n) * 0.7 * env; if (a <= 0.02) continue;
          ctx.globalAlpha = a; ctx.fillStyle = i === 0 ? (green ? '#eafff0' : '#f6ebff') : (green ? GREEN : PURPLE);
          ctx.fillText(TOK[Math.floor(hash(c * 31 + i * 7 + Math.floor(e.t / (4 + (c % 3)))) * 14)], x, y);
        }
      }
    } else if (e.type === 'codering') {
      // anel de dígitos que se abre ao redor do Vinícius
      const rad = e.r * M.easeOut(k), n = 16;
      ctx.font = `bold ${15 - k * 5}px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const a = e.rot + i / n * Math.PI * 2 + k * 1.2, x = e.x + Math.cos(a) * rad, y = e.y + Math.sin(a) * rad * 0.55;
        ctx.globalAlpha = (1 - k) * 0.95; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,5,24,0.8)'; const ch = i % 3 ? String(i & 1) : pick(i + e.seed);
        ctx.strokeText(ch, x, y); ctx.fillStyle = i % 2 ? PURPLE : GREEN; ctx.fillText(ch, x, y);
      }
    }
  };
  // linhas de código rolando dentro do Firewall
  ext.firewall = function (ctx, tr, w, h, armed) {
    const t = tr.age;
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h, w, h); ctx.clip();
    const g = ctx.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, 'rgba(178,92,255,0.5)'); g.addColorStop(1, 'rgba(61,255,122,0.5)');
    ctx.globalAlpha = armed ? 0.55 + Math.sin(t * 0.3) * 0.12 : 0.25; ctx.fillStyle = g; ctx.fillRect(-w / 2, -h, w, h);
    ctx.globalAlpha = armed ? 0.95 : 0.5; ctx.font = `bold 12px ${M.FONT_TEXT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let r = 0; r < 9; r++) for (let c = 0; c < 2; c++) {
      const y = ((r * 18 + t * 1.6 * (c ? 1 : 0.7)) % (h + 18)) - h + 6;
      ctx.fillStyle = (r + c) % 2 ? GREEN : PURPLE; ctx.fillText(TOK[Math.floor(hash(r * 5 + c + Math.floor(t / 7 + r)) * 14)], -w / 4 + c * w / 2, y - 6);
    }
    ctx.restore();
    ctx.globalAlpha = 1; ctx.lineWidth = 2.5; ctx.strokeStyle = PURPLE; ctx.strokeRect(-w / 2, -h, w, h); ctx.strokeStyle = GREEN; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t; ctx.strokeRect(-w / 2, -h, w, h); ctx.setLineDash([]);
  };

  // ---------------------------------------------------------------- geração (Match): chamado pelos golpes com `code`
  const Match = M.Match.prototype;
  const col2 = () => (rnd() < 0.5 ? (rnd() < 0.8 ? GREEN : GREEN_L) : (rnd() < 0.8 ? PURPLE : PURPLE_L));
  // um dígito: vx/vy em px por quadro (sobe devagar e balança)
  Match.codeDigit = function (x, y, o = {}) {
    if (this.particles.length > 300) return; // teto de partículas (efeito de luxo, nunca pesa o jogo)
    const seed = Math.floor(rnd() * 9999);
    const life = o.life || 38 + Math.floor(rnd() * 26);
    this.particles.push({ type: 'code', x, y, vx: o.vx !== undefined ? o.vx : (rnd() - 0.5) * 0.6, vy: o.vy !== undefined ? o.vy : -0.7 - rnd() * 1.1, g: o.g || 0, life, max: life, size: o.size || (13 + rnd() * 7), color: o.color || col2(), ch: o.ch || pick(seed), seed, ph: rnd() * 6, wob: o.wob !== undefined ? o.wob : 2 + rnd() * 3, glitch: rnd() < 0.35, rot: 0 });
  };
  Match.codeBurst = function (x, y, n, spread, up) {
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, v = (0.6 + rnd()) * (spread || 3); this.codeDigit(x + Math.cos(a) * 6, y + Math.sin(a) * 6, { vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8 - (up || 0.8), g: -0.01, life: 34 + Math.floor(rnd() * 20) }); }
  };
  // colunas subindo ao redor do corpo (aura de especial)
  Match.codeAura = function (f, n, spread) {
    for (let i = 0; i < n; i++) this.codeDigit(f.x + (rnd() - 0.5) * (spread || 70), f.y - 10 - rnd() * 150, { vy: -0.9 - rnd() * 1.2 });
  };
  // chamado a cada quadro de um golpe com `code` (cosmético): mv.code = 'cast' | 'wall' | 'dive' | 'heal' | 'back' | 'dash' | 'super'
  Match.codeFx = function (f, mv, fr) {
    const kind = mv.code, fw = f.facing, hx = f.x + fw * 42, hy = f.y - 100;
    switch (kind) {
      case 'cast':
        if (fr <= mv.startup && fr % 2 === 0) this.codeDigit(hx + (rnd() - 0.5) * 24, hy + (rnd() - 0.5) * 26, { vx: fw * 0.5, vy: -0.5 - rnd() * 0.6 });
        if (fr === mv.startup + 1) this.codeBurst(hx + fw * 10, hy, 14, 3.2, 0.4);
        break;
      case 'wall':
        if (fr === mv.startup + 1) { const x = M.clamp(f.x + fw * (mv.trap ? mv.trap.dist : 110), 60, M.W - 60); for (let i = 0; i < 18; i++) this.codeDigit(x + (rnd() - 0.5) * 36, M.GROUND - rnd() * 40, { vy: -1.2 - rnd() * 2.2 }); this.fx.push({ type: 'codering', x, y: M.GROUND - 8, r: 70, rot: 0, seed: 3, t: 0, life: 22 }); }
        else if (fr < mv.startup && fr % 3 === 0) this.codeDigit(f.x + fw * 24 + (rnd() - 0.5) * 30, f.y - 30 - rnd() * 60);
        break;
      case 'dive':
        if (this.frame % 2 === 0) this.codeDigit(f.x - fw * 12 + (rnd() - 0.5) * 24, f.y - 40 - rnd() * 60, { vy: -0.3 - rnd() * 0.5, vx: -fw * 0.6 });
        break;
      case 'dash':
        if (fr >= 2 && fr <= mv.startup + mv.active + 4) { this.codeDigit(f.x - fw * 20 + (rnd() - 0.5) * 20, f.y - 30 - rnd() * 100, { vx: -fw * (0.5 + rnd()), vy: -0.2 - rnd() * 0.4 }); if (fr % 2) this.codeDigit(f.x - fw * 30, f.y - 20 - rnd() * 90, { vx: -fw * 1.1, vy: -0.5 }); }
        if (fr === mv.startup + 1) this.codeBurst(f.x + fw * 40, f.y - 90, 8, 3, 0.5);
        break;
      case 'heal':
        if (fr % 3 === 0) this.codeAura(f, 2, 70);
        if (fr === mv.startup + 1) { this.codeBurst(f.x, f.y - 90, 14, 2.6, 1.2); this.fx.push({ type: 'codering', x: f.x, y: f.y - 70, r: 62, rot: 0, seed: 7, t: 0, life: 28 }); }
        break;
      case 'back':
        if (fr === mv.startup + 1) { this.codeBurst(f.x, f.y - 90, 14, 3, 0.6); this.fx.push({ type: 'codering', x: f.x, y: f.y - 80, r: 56, rot: 1, seed: 11, t: 0, life: 20 }); }
        break;
      case 'super':
        if (fr <= mv.startup + mv.active) this.codeAura(f, fr < mv.startup ? 3 : 2, 90);
        if (fr === 1) { this.codeBurst(f.x, f.y - 90, 24, 4.2, 1.2); this.fx.push({ type: 'codering', x: f.x, y: f.y - 80, r: 120, rot: 0, seed: 1, t: 0, life: 34 }); this.fx.push({ type: 'coderain', t: 0, life: 110 }); }
        if (fr > mv.startup && fr % 3 === 0) this.codeBurst(f.x + fw * 40, f.y - 90, 4, 3.4, 0.4);
        break;
    }
  };
})();
