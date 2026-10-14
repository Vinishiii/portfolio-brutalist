'use strict';
// Copia o jogo web (sem Electron, loja, kit de arte, ferramentas nem service worker) para mobile/www.
const fs = require('fs'); const path = require('path');
const SRC = path.join(__dirname, '..', '..'), DST = path.join(__dirname, '..', 'www');
const INCLUDE = ['index.html', 'manifest.webmanifest', 'css', 'js', 'fonts', 'icons'];
fs.rmSync(DST, { recursive: true, force: true }); fs.mkdirSync(DST, { recursive: true });
let n = 0;
const copy = (rel) => {
  const from = path.join(SRC, rel), to = path.join(DST, rel), st = fs.statSync(from);
  if (st.isDirectory()) { fs.mkdirSync(to, { recursive: true }); for (const f of fs.readdirSync(from)) copy(path.join(rel, f)); }
  else { fs.copyFileSync(from, to); n++; }
};
INCLUDE.forEach(copy);
// endereço público da versão web (links de desafio): defina SFB_WEB_URL para embuti-lo no app
if (process.env.SFB_WEB_URL) {
  const f = path.join(DST, 'index.html'); let h = fs.readFileSync(f, 'utf8');
  h = h.replace('<script src="js/util.js">', `<script>window.SFB_WEB_URL=${JSON.stringify(process.env.SFB_WEB_URL)};</script>\n<script src="js/util.js">`); fs.writeFileSync(f, h);
}
console.log('www:', n, 'arquivos');
