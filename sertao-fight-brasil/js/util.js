'use strict';
// ============================================================
// SERTÃO FIGHT BRASIL — utilitários globais
// ============================================================
const M = window.M = window.M || {};
M.W = 960; M.H = 540; M.GROUND = 452;
M.VERSION = '1.4';

M.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
M.lerp = (a, b, t) => a + (b - a) * t;
M.rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
M.randi = (a, b) => Math.floor(M.rand(a, b + 1));
M.choice = arr => arr[Math.floor(Math.random() * arr.length)];
M.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
M.easeOut = t => 1 - (1 - t) * (1 - t);
M.easeIn = t => t * t;
M.easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
M.easeBack = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
M.sign = v => (v < 0 ? -1 : 1);
M.rad = d => d * Math.PI / 180;
M.rects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
M.seeded = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
M.fmtTime = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

// Fontes
M.FONT_DISPLAY = "'Alfa Slab One', Impact, 'Arial Black', sans-serif";
M.FONT_TEXT = "'Special Elite', 'Courier New', monospace";

// Paleta (xilogravura + carnaval)
M.C = {
  paper: '#f3e6c8', ink: '#141210', red: '#c8371d', yellow: '#f2b70c', green: '#1f7a4d',
  blue: '#1c4e9c', magenta: '#c7267a', orange: '#e8712b', cyan: '#2aa9b8', white: '#fff8e8'
};

// Persistência
M.store = {
  key: 'sfb.save.v1',
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.data = {}; }
    const d = this.data;
    d.settings = Object.assign({ volume: 0.8, music: true, sfx: true, shake: true, hitboxes: false, difficulty: 'brabo', touch: 'auto', paint: true, post: true, lang: null, speed: 1, reduceFlash: false, quality: 'auto', keys: null }, d.settings || {});
    d.progress = Object.assign({ storyDone: false, endings: [], cinzas: false, bestTime: null, freeBest: null, wins: 0, legendsDone: false, bestGrade: null, bonds: {} }, d.progress || {});
    d.story = d.story || null;
    d.legends = d.legends || null;
    return d;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* sem storage */ } }
};

// Texto com contorno (estilo xilo) no canvas
M.text = (ctx, str, x, y, o = {}) => {
  str = M.tr ? M.tr(String(str)) : str;
  let size = o.size || 24; const font = o.font || M.FONT_DISPLAY;
  ctx.save();
  ctx.font = `${o.weight || ''} ${size}px ${font}`.trim();
  if (o.maxW) { const w = ctx.measureText(str).width; if (w > o.maxW) { size = Math.max(8, size * o.maxW / w); ctx.font = `${o.weight || ''} ${size}px ${font}`.trim(); } }
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
  if (o.stroke !== false) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = o.lw || Math.max(3, size * 0.18);
    ctx.strokeStyle = o.strokeColor || M.C.ink;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.color || M.C.paper;
  ctx.fillText(str, x, y);
  ctx.restore();
};

// Polígono de "estrela de impacto"
M.star = (ctx, x, y, rOut, rIn, n, rot = 0) => {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn, a = rot + i * Math.PI / n;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
};

// Textura de papel (grão) pré-renderizada
M.grain = (() => {
  let c = null;
  return () => {
    if (c) return c;
    c = document.createElement('canvas'); c.width = 480; c.height = 270;
    const g = c.getContext('2d'); const img = g.createImageData(480, 270); const d = img.data;
    for (let i = 0; i < d.length; i += 4) { const v = 200 + Math.random() * 55; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() * 40; }
    g.putImageData(img, 0, 0);
    return c;
  };
})();
