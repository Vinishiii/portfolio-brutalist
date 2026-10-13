'use strict';
// Confere cada arquivo do kit contra o manifesto e contra as regras de cada loja.
// Uso: node tools/art/verify.js      (sai com código 1 se algo estiver fora da especificação)
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, '..', '..', 'art-kit');
const manifest = require('./manifest.js')();

function dims(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), fmt: 'png', alpha: buf[25] === 6 || buf[25] === 4 };
  if (buf[0] === 0xff && buf[1] === 0xd8) { let i = 2; while (i < buf.length) { if (buf[i] !== 0xff) { i++; continue; } const m = buf[i + 1]; if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), fmt: 'jpg', alpha: false }; i += 2 + buf.readUInt16BE(i + 2); } }
  return null;
}

const problems = [], rows = [];
const bad = (f, msg) => problems.push(`${f}: ${msg}`);
const counts = {};
for (const s of manifest) {
  const file = path.join(OUT, s.file);
  if (!fs.existsSync(file)) { bad(s.file, 'arquivo não existe'); continue; }
  const buf = fs.readFileSync(file), d = dims(buf), kb = buf.length / 1024;
  if (!d) { bad(s.file, 'formato ilegível'); continue; }
  const sizeOk = s.sizeFree ? ((d.w === s.w && d.h <= s.h) || (d.h === s.h && d.w <= s.w)) : (d.w === s.w && d.h === s.h);
  if (!sizeOk) bad(s.file, `dimensão ${d.w}x${d.h} ≠ ${s.w}x${s.h}`);
  if (d.fmt !== s.fmt) bad(s.file, `formato ${d.fmt} ≠ ${s.fmt}`);
  if (d.alpha !== (s.alpha === true)) bad(s.file, `canal alfa ${d.alpha} (esperado ${s.alpha === true})`);
  const top = s.file.split('/')[0];
  // ---- regras por loja ----
  if (s.file.startsWith('google-play/')) {
    if (/icon_512/.test(s.file) && (kb > 1024 || d.w !== 512 || d.h !== 512)) bad(s.file, 'ícone do Play: 512x512 e até 1 MB');
    if (/feature-graphic/.test(s.file) && (d.w !== 1024 || d.h !== 500 || d.alpha)) bad(s.file, 'gráfico de destaque: 1024x500 sem alfa');
    if (/phone|tablet/.test(s.file)) { const lo = Math.min(d.w, d.h), hi = Math.max(d.w, d.h); if (lo < 320 || hi > 3840 || hi > lo * 2) bad(s.file, 'screenshot do Play fora de 320–3840 px / proporção 2:1'); }
  }
  if (s.file.startsWith('app-store/')) {
    const OK = ['2622x1206', '2868x1320', '2752x2064', '1024x1024']; if (!OK.includes(`${d.w}x${d.h}`)) bad(s.file, 'tamanho não listado pela Apple');
    if (d.alpha) bad(s.file, 'a Apple não aceita canal alfa');
  }
  if (s.file.startsWith('steam/screenshots/') && (d.w < 1920 || d.h < 1080 || d.w * 9 !== d.h * 16)) bad(s.file, 'screenshot da Steam: mínimo 1920x1080, 16:9');
  if (s.file.startsWith('steam/library/library-hero') && d.fmt !== 'png') bad(s.file, 'hero deve ser PNG');
  if (s.file.startsWith('steam/library/library-logo') && !d.alpha) bad(s.file, 'logo da biblioteca precisa de fundo transparente');
  if (s.file.startsWith('instagram/') && !/avatar/.test(s.file) && !(d.w === 1080 && (d.h === 1350 || d.h === 1920))) bad(s.file, 'Instagram: 1080x1350 ou 1080x1920');
  const grp = s.file.split('/').slice(0, 2).join('/'); counts[grp] = (counts[grp] || 0) + 1;
  rows.push({ file: s.file, w: d.w, h: d.h, fmt: d.fmt, kb: Math.round(kb) });
}
// limites de quantidade por conjunto
for (const [g, n] of Object.entries(counts)) { if (/google-play\/(phone|tablet)/.test(g) && n > 8) bad(g, 'Play: no máximo 8 por tipo'); if (/app-store\/(iphone|ipad)/.test(g) && n > 10) bad(g, 'Apple: no máximo 10 por tamanho'); if (/steam\/screenshots/.test(g) && n > 20) bad(g, 'Steam: no máximo 20'); }
const total = rows.reduce((a, r) => a + r.kb, 0);
console.log(`${rows.length}/${manifest.length} arquivos conferidos • ${(total / 1024).toFixed(1)} MB`);
if (problems.length) { console.log('PROBLEMAS:'); problems.forEach(p => console.log(' -', p)); process.exit(1); }
console.log('tudo dentro da especificação');
