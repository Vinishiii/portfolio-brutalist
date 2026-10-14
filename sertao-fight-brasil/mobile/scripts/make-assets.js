'use strict';
// Gera os arquivos-fonte de ícone e splash (mobile/assets/*.png) a partir da arte do próprio jogo.
// Uso:  NODE_PATH=$(npm root -g) node scripts/make-assets.js && npx capacitor-assets generate --android --ios
// (as imagens finais de cada tamanho já ficam commitadas dentro de android/ e ios/)
const fs = require('fs'); const path = require('path'); const http = require('http');
const pw = require('playwright'); const { stripAlpha } = require('../../tools/art/png.js');
const GAME = path.join(__dirname, '..', '..'), OUT = path.join(__dirname, '..', 'assets'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => { const f = path.join(GAME, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html')); fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); } }); });
(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await pw.chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME, args: ['--no-sandbox'] } : {});
  const page = await browser.newPage(); await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'load' }); await page.waitForTimeout(1800);
  for (const f of ['kit_page.js', 'comps.js']) await page.addScriptTag({ path: path.join(GAME, 'tools/art', f) });
  const draw = (fn, ...args) => page.evaluate(async ([src, args]) => { await KIT.ready(); const c = await (new (Object.getPrototypeOf(async function () { }).constructor)('KIT', 'M', 'args', src))(KIT, M, args); return c.toDataURL('image/png'); }, [fn, args]);
  const save = (name, url, flat) => { let b = Buffer.from(url.split(',')[1], 'base64'); if (flat) b = stripAlpha(b); fs.writeFileSync(path.join(OUT, name), b); console.log('  assets/' + name, Math.round(b.length / 1024) + 'KB'); };
  // ícone (iOS e Android antigo): quadrado cheio, sem alfa
  save('icon-only.png', await draw('return KIT.comp.icon(1024, { border: false });'), true);
  // ícone adaptativo do Android: frente (transparente, arte dentro dos 66% centrais) e fundo
  save('icon-foreground.png', await draw('return KIT.comp.icon(1024, { noBg: true, border: false, scale: 0.6 });'), false);
  save('icon-background.png', await draw('return KIT.comp.icon(1024, { bgOnly: true });'), true);
  // splash 2732x2732: fundo escuro do jogo com o logo no centro (miolo seguro para qualquer proporção)
  const splash = `const w = 2732, c = KIT.canvas(w, w), g = c.getContext('2d'); g.fillStyle = '#141210'; g.fillRect(0, 0, w, w);
    const r = g.createRadialGradient(w / 2, w / 2, 100, w / 2, w / 2, w * 0.55); r.addColorStop(0, '#3a1f48'); r.addColorStop(0.6, '#1c1322'); r.addColorStop(1, '#141210'); g.fillStyle = r; g.fillRect(0, 0, w, w);
    KIT.glow(g, w / 2, w / 2 + 120, 700, '#e8712b', 0.22); KIT.logo(g, w / 2, w / 2, 1200); return c;`;
  const u = await draw(splash); save('splash.png', u, true); save('splash-dark.png', u, true);
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
