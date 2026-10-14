'use strict';
// Gera o kit de arte de lançamento a partir do jogo real (art-kit/…).
// Uso:  cd sertao-fight-brasil && python3 -m http.server 8766 &
//       NODE_PATH=$(npm root -g) node tools/art/capture.js        (1x: capturas reais -> art-kit/_raw)
//       NODE_PATH=$(npm root -g) node tools/art/make_kit.js [filtro]
const pw = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..', '..'); const OUT = path.join(ROOT, 'art-kit');
const URL = process.env.GAME_URL || 'http://localhost:8766/index.html';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FILTER = process.argv[2] || '';
const manifest = require('./manifest.js');

// dimensões lidas do próprio arquivo (não confia no que foi pedido)
function dims(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), fmt: 'png', alpha: buf[25] === 6 || buf[25] === 4 };
  if (buf[0] === 0xff && buf[1] === 0xd8) { let i = 2; while (i < buf.length) { if (buf[i] !== 0xff) { i++; continue; } const m = buf[i + 1]; if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), fmt: 'jpg', alpha: false }; i += 2 + buf.readUInt16BE(i + 2); } }
  return null;
}


const { stripAlpha } = require('./png.js');   // PNG RGBA -> RGB de 24 bits (Google Play / App Store não aceitam alfa)

(async () => {
  const specs = manifest().filter(s => !FILTER || s.file.includes(FILTER));
  console.log(specs.length, 'arquivos');
  const browser = await pw.chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => console.log('  ERRO DE PÁGINA', e.message));
  page.on('console', m => { if (m.type() === 'error' && !/GL Driver|WebGL/.test(m.text())) console.log('  console:', m.text().slice(0, 200)); });
  await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(1800);
  await page.evaluate(() => { M.i18n.set('en'); });
  for (const f of ['kit_page.js', 'comps.js', 'comps2.js']) { const p = path.join(__dirname, f); if (fs.existsSync(p)) await page.addScriptTag({ path: p }); }
  const bad = [];
  for (const s of specs) {
    const t0 = Date.now();
    try {
      const r = await page.evaluate(async (spec) => { await KIT.ready(); const c = await KIT.build(spec); return { url: KIT.out(c, spec.fmt, spec.q), w: c.width, h: c.height }; }, s);
      let buf = Buffer.from(r.url.split(',')[1], 'base64'); if (s.fmt === 'png' && s.alpha !== true) buf = stripAlpha(buf); const file = path.join(OUT, s.file); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buf);
      const d = dims(buf); const sizeOk = d && (s.sizeFree ? ((d.w === s.w && d.h <= s.h) || (d.h === s.h && d.w <= s.w)) : (d.w === s.w && d.h === s.h)); const ok = sizeOk && d.fmt === s.fmt && (d.alpha === (s.alpha === true));
      if (!ok) bad.push(s.file);
      console.log(ok ? '  ok ' : '  !! ', s.file, d ? `${d.w}x${d.h} ${d.fmt}${d.alpha ? '+alpha' : ''}` : '?', Math.round(buf.length / 1024) + 'KB', (Date.now() - t0) + 'ms');
    } catch (e) { bad.push(s.file); console.log('  ERRO', s.file, e.message.split('\n')[0]); }
  }
  await browser.close();
  console.log(bad.length ? 'COM PROBLEMAS: ' + bad.join(', ') : 'tudo certo');
  if (bad.length) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
