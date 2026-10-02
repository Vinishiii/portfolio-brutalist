'use strict';
// ============================================================
// CENÁRIOS — fundos procedurais pré-renderizados + camadas vivas
// (torcida, fogueira, água, confete, cinzas, vagalumes)
// ============================================================
M.stages = (function () {
  const INK = M.C.ink, W = M.W, H = M.H, G = M.GROUND;

  function sky(ctx, c0, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, G); g.addColorStop(0, c0); g.addColorStop(c2 ? 0.55 : 1, c1); if (c2) g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function stars(ctx, rnd, n, alpha = 1) {
    ctx.fillStyle = `rgba(255,248,232,${alpha})`;
    for (let i = 0; i < n; i++) { const x = rnd() * W, y = rnd() * 260, r = rnd() * 1.6 + 0.4; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  }
  function moon(ctx, x, y, r, color = '#fff2c4') {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(20,18,16,0.12)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.25, 0, Math.PI * 2); ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.18, 0, Math.PI * 2); ctx.fill();
  }
  function ground(ctx, color, line, detail) {
    ctx.fillStyle = color; ctx.fillRect(0, G, W, H - G);
    ctx.strokeStyle = line; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, G); ctx.lineTo(W, G); ctx.stroke();
    if (detail) detail(ctx);
  }
  function house(ctx, x, y, w, h, color, roof) {
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + w + 6, y); ctx.lineTo(x + w, y - 18); ctx.lineTo(x, y - 18); ctx.closePath(); ctx.fill(); ctx.stroke();
    const cols = Math.max(1, Math.floor(w / 34));
    for (let i = 0; i < cols; i++) { const wx = x + 10 + i * (w - 20) / cols + 2; ctx.fillStyle = '#141210'; ctx.fillRect(wx, y + 14, 14, 22); ctx.fillStyle = 'rgba(242,183,12,0.75)'; ctx.fillRect(wx + 2, y + 16, 10, 18); }
  }
  function palm(ctx, x, y, h, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - h * 0.6, x + 4, y - h); ctx.stroke();
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5; ctx.beginPath(); ctx.moveTo(x + 4, y - h); ctx.quadraticCurveTo(x + 4 + Math.cos(a) * 40, y - h + Math.sin(a) * 40 - 10, x + 4 + Math.cos(a) * 60, y - h + Math.sin(a) * 60 + 20); ctx.quadraticCurveTo(x + 4 + Math.cos(a) * 30, y - h + Math.sin(a) * 30 + 6, x + 4, y - h); ctx.fill(); }
  }
  function cactus(ctx, x, y, h, color) {
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.fillStyle = color;
    const r = (cx, cy, w, hh) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx, cy, w, hh, 8) : ctx.rect(cx, cy, w, hh); ctx.fill(); ctx.stroke(); };
    r(x - 9, y - h, 18, h); r(x - 30, y - h * 0.6, 14, h * 0.35); r(x + 16, y - h * 0.75, 14, h * 0.4);
    ctx.fillRect(x - 30, y - h * 0.6 + 8, 30, 10); ctx.fillRect(x, y - h * 0.75 + 8, 30, 10);
  }

  // ---------- torcida ----------
  function makeCrowd(rnd, palette) {
    const arr = [];
    for (let i = 0; i < 34; i++) {
      const x = 20 + i * (W - 40) / 33 + (rnd() - 0.5) * 14;
      const d = Math.abs(x - W / 2) / (W / 2);
      arr.push({ x, y: 436 - (1 - d) * 10, h: 44 + rnd() * 26, w: 22 + rnd() * 10, phase: rnd() * Math.PI * 2, flag: rnd() < 0.3 ? M.choice(['#f2b70c', '#c8371d', '#1f7a4d', '#c7267a', '#2aa9b8']) : null, hat: rnd() < 0.35, color: palette[Math.floor(rnd() * palette.length)], jump: rnd() * 0.5 + 0.5 });
    }
    const front = [];
    for (let i = 0; i < 7; i++) front.push({ x: 40 + i * 150 + rnd() * 60, r: 26 + rnd() * 10, phase: rnd() * 6, color: palette[0] });
    return { back: arr, front };
  }
  function drawCrowd(ctx, crowd, st, beat, excite, side) {
    const bounce = Math.pow(Math.max(0, Math.sin(beat * Math.PI)), 2);
    for (const p of crowd.back) {
      const fav = side === 0 ? 1 : (p.x < W / 2 ? (side > 0 ? 1 : 0.4) : (side < 0 ? 1 : 0.4));
      const jy = -(bounce * 3 + excite * 14 * p.jump * fav * Math.abs(Math.sin(st * 0.012 + p.phase)));
      const y = p.y + jy;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(p.x - p.w / 2, y - p.h, p.w, p.h, 8) : ctx.rect(p.x - p.w / 2, y - p.h, p.w, p.h); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, y - p.h - 9, 10, 0, Math.PI * 2); ctx.fill();
      if (p.hat) { ctx.fillRect(p.x - 14, y - p.h - 18, 28, 4); ctx.fillRect(p.x - 8, y - p.h - 28, 16, 10); }
      const arms = excite * fav > 0.35 || (p.flag && excite > 0.1);
      ctx.strokeStyle = p.color; ctx.lineWidth = 5; ctx.lineCap = 'round';
      if (arms) {
        const sw = Math.sin(st * 0.08 + p.phase) * 6;
        ctx.beginPath(); ctx.moveTo(p.x - p.w / 2 + 2, y - p.h + 10); ctx.lineTo(p.x - p.w / 2 - 10 + sw, y - p.h - 24); ctx.moveTo(p.x + p.w / 2 - 2, y - p.h + 10); ctx.lineTo(p.x + p.w / 2 + 10 + sw, y - p.h - 24); ctx.stroke();
        if (p.flag) { ctx.fillStyle = p.flag; ctx.beginPath(); ctx.moveTo(p.x + p.w / 2 + 10 + sw, y - p.h - 24); ctx.lineTo(p.x + p.w / 2 + 34 + sw, y - p.h - 34); ctx.lineTo(p.x + p.w / 2 + 12 + sw, y - p.h - 44); ctx.closePath(); ctx.fill(); }
      } else if (p.flag) {
        ctx.beginPath(); ctx.moveTo(p.x + p.w / 2 - 2, y - p.h + 12); ctx.lineTo(p.x + p.w / 2 + 6, y - p.h - 8); ctx.stroke();
        ctx.fillStyle = p.flag; ctx.beginPath(); ctx.moveTo(p.x + p.w / 2 + 6, y - p.h - 8); ctx.lineTo(p.x + p.w / 2 + 26, y - p.h - 14); ctx.lineTo(p.x + p.w / 2 + 8, y - p.h - 24); ctx.closePath(); ctx.fill();
      }
    }
  }
  function drawFront(ctx, crowd, st, beat, excite) {
    const bounce = Math.pow(Math.max(0, Math.sin(beat * Math.PI)), 2);
    ctx.fillStyle = 'rgba(20,18,16,0.92)';
    for (const p of crowd.front) {
      const y = H + 10 - (bounce * 4 + excite * 10 * Math.abs(Math.sin(st * 0.015 + p.phase)));
      ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(p.x - p.r - 10, y + p.r * 0.4, p.r * 2 + 20, 60);
    }
  }

  // ---------- fogueira / Brasa ----------
  function drawFire(ctx, x, y, level, st, dark) {
    if (level <= 0.01) return;
    const h = 90 * level, w = 44 * Math.sqrt(level);
    const flame = (c, scale, off) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - w * scale, y);
      ctx.quadraticCurveTo(x - w * scale * 0.9, y - h * scale * 0.5, x + Math.sin(st * 0.09 + off) * 10 * scale, y - h * scale);
      ctx.quadraticCurveTo(x + w * scale * 0.9, y - h * scale * 0.5, x + w * scale, y); ctx.closePath(); ctx.fill();
    };
    ctx.save();
    const glow = ctx.createRadialGradient(x, y - h * 0.3, 10, x, y - h * 0.3, 160 * level + 40);
    glow.addColorStop(0, `rgba(242,183,12,${dark ? 0.5 : 0.35})`); glow.addColorStop(1, 'rgba(242,183,12,0)');
    ctx.fillStyle = glow; ctx.fillRect(x - 220, y - 220, 440, 260);
    flame('#c8371d', 1.0, 0); flame('#e8712b', 0.78, 2); flame('#f2b70c', 0.5, 4); flame('#fff8e8', 0.22, 6);
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.ellipse(x, y + 4, 40, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---------- definição dos cenários ----------
  const DEFS = {
    porto: {
      name: 'Cais de Porto Brabo', sub: 'A noite começa no cais', palette: ['#1d1a2a', '#241f33', '#2a2440'], music: 'fight', firePos: [480, 400],
      build(ctx, rnd) {
        sky(ctx, '#0a1430', '#1c4e9c', '#2a3f7a'); stars(ctx, rnd, 90); moon(ctx, 790, 90, 44);
        // mar
        ctx.fillStyle = '#10244f'; ctx.fillRect(0, 300, W, 150);
        // navios e guindastes
        ctx.fillStyle = '#0c1226';
        ctx.fillRect(120, 250, 220, 50); ctx.beginPath(); ctx.moveTo(100, 300); ctx.lineTo(120, 250); ctx.lineTo(340, 250); ctx.lineTo(370, 300); ctx.closePath(); ctx.fill();
        ctx.fillRect(200, 210, 60, 40); ctx.fillRect(230, 190, 14, 24);
        ctx.strokeStyle = '#0c1226'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(620, 300); ctx.lineTo(620, 150); ctx.lineTo(760, 190); ctx.moveTo(620, 180); ctx.lineTo(560, 300); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(760, 190); ctx.lineTo(760, 260); ctx.stroke(); ctx.fillRect(748, 260, 24, 18);
        ctx.strokeStyle = '#0c1226'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(860, 300); ctx.lineTo(860, 170); ctx.lineTo(940, 200); ctx.stroke();
        // cais
        ctx.fillStyle = '#4a3828'; ctx.fillRect(0, 410, W, 50);
        ctx.strokeStyle = '#2d2117'; ctx.lineWidth = 3; for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.moveTo(i * 42, 410); ctx.lineTo(i * 42 + 12, 460); ctx.stroke(); }
        ground(ctx, '#5a4634', INK, c => { c.strokeStyle = '#3d2e21'; c.lineWidth = 2; for (let i = 0; i < 30; i++) { c.beginPath(); c.moveTo(i * 34, G); c.lineTo(i * 34 + 10, H); c.stroke(); } });
      },
      dyn(ctx, st) {
        // reflexos
        ctx.save(); ctx.globalAlpha = 0.5;
        for (let i = 0; i < 14; i++) { const y = 320 + i * 9; const w = 40 + Math.sin(st * 0.02 + i) * 25; ctx.fillStyle = i % 3 === 0 ? '#f2b70c' : '#2aa9b8'; ctx.fillRect(760 + Math.sin(st * 0.03 + i * 0.7) * 30 - w / 2, y, w, 2); }
        ctx.restore();
        // luzes penduradas
        ctx.strokeStyle = '#141210'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(480, 130, W, 60); ctx.stroke();
        for (let i = 0; i < 16; i++) { const t = (i + 0.5) / 16; const x = t * W, y = 60 + (1 - Math.pow(2 * t - 1, 2)) * 35 * 2 * 0.5 + 8; const on = Math.sin(st * 0.05 + i) > -0.6; ctx.fillStyle = on ? '#f2b70c' : '#6b5a2a'; ctx.beginPath(); ctx.arc(x, y + 8, 5, 0, Math.PI * 2); ctx.fill(); }
      }
    },
    ladeira: {
      name: 'Ladeira do Frevo', sub: 'Fim de tarde em Recife', palette: ['#3a2a1e', '#4a3328', '#2e2a3a'], music: 'fight', firePos: [480, 400], confetti: true,
      build(ctx, rnd) {
        sky(ctx, '#f2b70c', '#e8712b', '#c7267a');
        ctx.fillStyle = '#f7d774'; ctx.beginPath(); ctx.arc(170, 160, 60, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
        const cols = ['#2aa9b8', '#f2c230', '#c7267a', '#1f7a4d', '#e8712b', '#1c4e9c', '#c8371d'];
        let x = -20;
        while (x < W) { const w = 90 + rnd() * 70, h = 120 + rnd() * 80; house(ctx, x, 410 - h, w, h, cols[Math.floor(rnd() * cols.length)], '#8a3a22'); x += w + 6; }
        // igreja
        ctx.fillStyle = '#fff8e8'; ctx.fillRect(420, 200, 120, 210); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(420, 200, 120, 210);
        ctx.fillRect(455, 150, 50, 50); ctx.strokeRect(455, 150, 50, 50); ctx.beginPath(); ctx.moveTo(450, 150); ctx.lineTo(480, 110); ctx.lineTo(510, 150); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#141210'; ctx.fillRect(468, 165, 24, 30); ctx.beginPath(); ctx.arc(480, 300, 22, Math.PI, 0); ctx.lineTo(502, 410); ctx.lineTo(458, 410); ctx.closePath(); ctx.fill();
        ground(ctx, '#7a6a5a', INK, c => { c.strokeStyle = '#5b4d40'; c.lineWidth = 2; for (let i = 0; i < 50; i++) { c.beginPath(); c.arc(i * 24 + 12, G + 16 + (i % 2) * 22, 11, 0, Math.PI * 2); c.stroke(); } });
      },
      dyn(ctx, st) { bandeirinhas(ctx, st, 50, 2); }
    },
    rio: {
      name: 'Beira do Tocanduva', sub: 'O rio não tem pressa', palette: ['#1a2a24', '#1f2f2a', '#142420'], music: 'fight', firePos: [480, 400], fireflies: true, dustColor: '#e8c58a',
      build(ctx, rnd) {
        sky(ctx, '#2a1a4a', '#c7267a', '#e8712b');
        ctx.fillStyle = '#1f3a2e'; ctx.beginPath(); ctx.moveTo(0, 290); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 270 + Math.sin(x * 0.02) * 20 + rnd() * 10); ctx.lineTo(W, 330); ctx.lineTo(0, 330); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 9; i++) palm(ctx, 40 + i * 110 + rnd() * 40, 320, 90 + rnd() * 70, '#122a20');
        ctx.fillStyle = '#1c4e9c'; ctx.fillRect(0, 320, W, 110);
        ctx.fillStyle = '#4a3020'; ctx.beginPath(); ctx.moveTo(600, 400); ctx.quadraticCurveTo(640, 420, 700, 400); ctx.lineTo(690, 390); ctx.lineTo(610, 390); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
        ground(ctx, '#b58b5a', INK, c => { c.fillStyle = '#9a7246'; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(rnd() * W, G + 10 + rnd() * 70, 10 + rnd() * 16, 3, 0, 0, Math.PI * 2); c.fill(); } });
      },
      dyn(ctx, st) {
        ctx.save(); ctx.globalAlpha = 0.45;
        for (let i = 0; i < 20; i++) { const y = 330 + i * 5; const x = (i * 97 + st * 0.6) % W; ctx.fillStyle = i % 4 === 0 ? '#e8712b' : '#2aa9b8'; ctx.fillRect(x, y, 30 + Math.sin(st * 0.03 + i) * 16, 2); }
        ctx.restore();
      }
    },
    sertao: {
      name: 'Serra do Vento', sub: 'Meio-dia no sertão', palette: ['#4a2a1a', '#5a3322', '#3e2416'], music: 'fight', firePos: [480, 400], dust: true, dustColor: '#d98a5a',
      build(ctx, rnd) {
        sky(ctx, '#f7e7b8', '#f2c27a', '#e8a35b');
        ctx.fillStyle = '#fff2c4'; ctx.beginPath(); ctx.arc(480, 120, 70, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = '#c47a4a'; ctx.beginPath(); ctx.moveTo(0, 330); ctx.quadraticCurveTo(200, 230, 380, 320); ctx.quadraticCurveTo(600, 240, 760, 310); ctx.quadraticCurveTo(880, 260, W, 320); ctx.lineTo(W, 360); ctx.lineTo(0, 360); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff8e8'; ctx.fillRect(700, 300, 70, 70); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(700, 300, 70, 70); ctx.beginPath(); ctx.moveTo(695, 300); ctx.lineTo(735, 270); ctx.lineTo(775, 300); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(728, 335, 14, 35); ctx.fillRect(733, 258, 4, 14); ctx.fillRect(728, 262, 14, 4);
        for (let i = 0; i < 7; i++) cactus(ctx, 60 + i * 140 + rnd() * 50, 400, 70 + rnd() * 60, '#2f7a4d');
        ground(ctx, '#a0522d', INK, c => { c.strokeStyle = '#7a3a1e'; c.lineWidth = 2; for (let i = 0; i < 24; i++) { c.beginPath(); c.moveTo(rnd() * W, G + rnd() * 80); c.lineTo(rnd() * W, G + rnd() * 80); c.stroke(); } });
      },
      dyn(ctx, st) {
        ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#f7e7b8';
        for (let i = 0; i < 5; i++) { const x = ((st * (1 + i * 0.3)) + i * 200) % (W + 100) - 50; ctx.beginPath(); ctx.ellipse(x, 380 + i * 12, 60, 8, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        // urubus
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { const x = ((st * 0.4) + i * 300) % (W + 60) - 30, y = 80 + i * 30 + Math.sin(st * 0.02 + i) * 10; const f = Math.sin(st * 0.1 + i) * 4; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x, y + f); ctx.lineTo(x + 10, y); ctx.stroke(); }
      }
    },
    pantanal: {
      name: 'Pantanal de Taquari', sub: 'Onde a serpente de fogo dorme', palette: ['#0f1a26', '#14202e', '#0c1620'], music: 'fight', firePos: [480, 400], boitata: true, dustColor: '#4a6a3a',
      build(ctx, rnd) {
        sky(ctx, '#050a1a', '#0f1f45', '#1a3560'); stars(ctx, rnd, 140); moon(ctx, 180, 110, 60, '#e9e2d2');
        ctx.fillStyle = '#0a1420'; for (let i = 0; i < 6; i++) { const x = 80 + i * 170 + rnd() * 40, h = 120 + rnd() * 90; ctx.fillRect(x - 5, 330 - h, 10, h); ctx.beginPath(); ctx.moveTo(x, 330 - h); ctx.lineTo(x - 40, 330 - h - 30); ctx.moveTo(x, 330 - h + 20); ctx.lineTo(x + 36, 330 - h - 12); ctx.moveTo(x, 330 - h + 40); ctx.lineTo(x - 30, 330 - h + 10); ctx.strokeStyle = '#0a1420'; ctx.lineWidth = 6; ctx.stroke(); }
        ctx.fillStyle = '#12304a'; ctx.fillRect(0, 330, W, 100);
        ctx.fillStyle = '#1f5a3a'; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.ellipse(rnd() * W, 350 + rnd() * 70, 18 + rnd() * 14, 6, 0, 0, Math.PI * 2); ctx.fill(); }
        ground(ctx, '#2e4a2a', INK, c => { c.strokeStyle = '#1d3a1c'; c.lineWidth = 3; for (let i = 0; i < 60; i++) { const x = rnd() * W, y = G + rnd() * 80; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y - 14); c.stroke(); } });
      },
      dyn(ctx, st) {
        ctx.save();
        for (let i = 0; i < 3; i++) { ctx.strokeStyle = i === 1 ? '#2aa9b8' : '#f2b70c'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5; ctx.beginPath(); for (let k = 0; k < 12; k++) { const x = ((st * (1.2 + i * 0.4)) + i * 320 + k * 14) % (W + 200) - 100, y = 300 - i * 60 + Math.sin(st * 0.05 + k * 0.6 + i) * 18; if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
        ctx.globalAlpha = 0.9; ctx.fillStyle = '#f2b70c';
        for (let i = 0; i < 18; i++) { const x = (i * 53 + Math.sin(st * 0.01 + i) * 40 + W) % W, y = 240 + (i * 37) % 180 + Math.cos(st * 0.013 + i) * 20; if (Math.sin(st * 0.06 + i * 2) > 0.3) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); } }
        ctx.restore();
      }
    },
    cinzas: {
      name: 'Praça das Cinzas', sub: 'Onde a Brasa vai morrer', palette: ['#2a2724', '#33302c', '#1f1d1a'], music: 'boss', firePos: [480, 400], ash: true, fireLevel: 0.4, dustColor: '#8d8a84',
      build(ctx, rnd) {
        sky(ctx, '#2b2a2e', '#5a564f', '#8d8a84');
        ctx.fillStyle = '#4a4744';
        let x = -10; while (x < W) { const w = 70 + rnd() * 90, h = 60 + rnd() * 120; ctx.fillRect(x, 410 - h, w, h); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(x, 410 - h, w, h); ctx.fillStyle = '#2e2c2a'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 10 + k * 22, 420 - h, 12, 18); ctx.fillStyle = '#4a4744'; x += w + 8; }
        // arquibancada quebrada e bandeirinhas caídas
        ctx.strokeStyle = '#141210'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 90); ctx.quadraticCurveTo(300, 200, 420, 100); ctx.stroke();
        for (let i = 0; i < 8; i++) { const t = i / 8; const px = t * 420, py = 90 + Math.sin(t * Math.PI) * 60; ctx.fillStyle = '#5a564f'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 14, py + 22); ctx.lineTo(px + 28, py); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = '#5a4634'; ctx.beginPath(); ctx.moveTo(700, 410); ctx.lineTo(760, 330); ctx.lineTo(900, 410); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
        ground(ctx, '#55514b', INK, c => { c.fillStyle = '#3b3833'; for (let i = 0; i < 30; i++) { c.beginPath(); c.ellipse(rnd() * W, G + 10 + rnd() * 70, 14 + rnd() * 20, 4, 0, 0, Math.PI * 2); c.fill(); } });
      },
      dyn() { }
    }
  };

  function bandeirinhas(ctx, st, y, rows) {
    const cols = ['#f2b70c', '#c8371d', '#1f7a4d', '#c7267a', '#2aa9b8', '#fff8e8'];
    for (let r = 0; r < rows; r++) {
      const yy = y + r * 40, sag = 40 + r * 10;
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, yy); ctx.quadraticCurveTo(W / 2, yy + sag * 2, W, yy); ctx.stroke();
      for (let i = 0; i < 18; i++) { const t = (i + 0.5) / 18; const px = t * W, py = yy + 4 * t * (1 - t) * sag + Math.sin(st * 0.05 + i + r) * 2; ctx.fillStyle = cols[(i + r) % cols.length]; ctx.beginPath(); ctx.moveTo(px - 11, py); ctx.lineTo(px, py + 20); ctx.lineTo(px + 11, py); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    }
  }

  // ---------- instância de cenário ----------
  class Stage {
    constructor(id) {
      this.id = id; this.def = DEFS[id] || DEFS.porto;
      const rnd = M.seeded(id.length * 7919 + 13);
      this.bg = document.createElement('canvas'); this.bg.width = W; this.bg.height = H;
      this.def.build(this.bg.getContext('2d'), rnd);
      this.crowd = makeCrowd(rnd, this.def.palette);
      this.parts = [];
      this.fireLevel = this.def.fireLevel !== undefined ? this.def.fireLevel : 1;
      this.dark = 0; this.t = 0;
      this.darkCanvas = null;
    }
    update(G) {
      this.t++;
      const d = this.def;
      if (d.confetti && this.t % 6 === 0) this.parts.push({ x: Math.random() * W, y: -10, vx: Math.random() - 0.5, vy: 1 + Math.random(), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, color: M.choice(['#f2b70c', '#c7267a', '#2aa9b8', '#1f7a4d', '#fff8e8']), life: 400 });
      if (d.ash && this.t % 4 === 0) this.parts.push({ x: Math.random() * W, y: -10, vx: Math.sin(this.t * 0.01) * 0.5, vy: 0.6 + Math.random() * 0.8, rot: 0, vr: 0, color: 'rgba(200,196,190,0.6)', life: 600, ash: true });
      if (this.fireLevel > 0.05 && this.t % 3 === 0) this.parts.push({ x: d.firePos[0] + (Math.random() - 0.5) * 30, y: d.firePos[1] - 40, vx: (Math.random() - 0.5) * 0.8, vy: -1.5 - Math.random() * 2, rot: 0, vr: 0, color: Math.random() < 0.5 ? '#f2b70c' : '#e8712b', life: 50 + Math.random() * 40, spark: true });
      for (let i = this.parts.length - 1; i >= 0; i--) { const p = this.parts[i]; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--; if (p.life <= 0 || p.y > H + 20) this.parts.splice(i, 1); }
    }
    drawBack(ctx, G) {
      const d = this.def;
      ctx.drawImage(this.bg, 0, 0);
      d.dyn(ctx, this.t);
      drawFire(ctx, d.firePos[0], d.firePos[1], this.fireLevel * (G ? G.fireScale : 1), this.t, this.dark > 0.5);
      const beat = M.audio.music.beat().phase;
      drawCrowd(ctx, this.crowd, this.t, beat, G ? G.crowdExcite : 0.1, G ? G.axeSign : 0);
      // cinzas e confetes atrás dos lutadores
      for (const p of this.parts) {
        if (p.spark) { ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, p.life / 30); ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
        else if (p.ash) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); }
      }
      // sombra da roda no chão
      ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W / 2, G ? 470 : 470, 430, 26, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    drawFront(ctx, G) {
      for (const p of this.parts) {
        if (p.spark || p.ash) continue;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-5, -3, 10, 6); ctx.restore();
      }
      const beat = M.audio.music.beat().phase;
      drawFront(ctx, this.crowd, this.t, beat, G ? G.crowdExcite : 0.1);
    }
    drawDark(ctx, fighters) {
      if (this.dark <= 0.01) return;
      if (!this.darkCanvas) { this.darkCanvas = document.createElement('canvas'); this.darkCanvas.width = W; this.darkCanvas.height = H; }
      const c = this.darkCanvas.getContext('2d');
      c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
      c.fillStyle = `rgba(5,4,8,${0.86 * this.dark})`; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r) => { const g = c.createRadialGradient(x, y, r * 0.2, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
      for (const f of fighters) hole(f.x, f.y - 70, 150);
      const fp = this.def.firePos; hole(fp[0], fp[1] - 30, 70 + Math.sin(this.t * 0.1) * 10);
      ctx.drawImage(this.darkCanvas, 0, 0);
    }
  }

  return { DEFS, Stage, bandeirinhas, drawFire, order: ['porto', 'ladeira', 'rio', 'sertao', 'pantanal', 'cinzas'] };
})();
