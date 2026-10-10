'use strict';
// Gera ícones, arte de loja (Steam/itch) e capturas de tela direto do jogo.
// Uso:  cd sertao-fight-brasil && python3 -m http.server 8765 &   (em outro terminal)
//       NODE_PATH=$(npm root -g) node tools/make_assets.js
// Requer playwright (chromium). Saída: icons/*.png e store/*.png
const pw = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'); const URL = process.env.GAME_URL || 'http://localhost:8765/index.html';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const save = (rel, dataUrl) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('  ', rel); };

(async () => {
  const browser = await pw.chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(2000);
  await page.evaluate(() => { M.i18n.set('en'); });

  // ---- funções de arte dentro da página ----
  await page.evaluate(() => {
    const mkF = (id, x, facing, pose, extra) => { const f = new M.Fighter(M.FIGHTERS[id], 1, 'dummy'); f.reset(x, facing); f.state = 'idle'; f.x = x; f.y = 470; f.facing = facing; f.pose = pose || M.poses.idlePose(f.def.idle, 0.9, f.def.idleOver); if (extra) Object.assign(f, extra); return f; };
    const strike = (name) => M.poses.attackPose(name, 'active', 0.5, M.poses.S.idle);
    window.__art = (w, h, o) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
      const st = new M.stages.Stage(o.stage || 'ladeira'); M.paint.ensureStage(st); const bg = st.bgPaint || st.bg;
      const s = Math.max(w / 960, h / 540); g.drawImage(bg, (w - 960 * s) / 2, (h - 540 * s) / 2 + (o.bgShift || 0) * s, 960 * s, 540 * s);
      const sh = g.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(20,10,30,0.15)'); sh.addColorStop(0.55, 'rgba(20,10,30,0)'); sh.addColorStop(1, 'rgba(10,6,12,0.7)'); g.fillStyle = sh; g.fillRect(0, 0, w, h);
      const k = (o.fighterScale || 1) * h / 540;
      for (const fd of o.fighters || []) { const f = mkF(fd.id, 0, fd.facing, fd.pose ? strike(fd.pose) : null); g.save(); g.translate(fd.x * w, fd.y * h); g.scale(k * (fd.s || 1), k * (fd.s || 1)); f.x = 0; f.y = 0; M.render.drawShadow(g, { x: 0, y: -4, def: f.def, grounded: true }); M.render.drawFighter(g, f, {}); g.restore(); }
      if (o.logo) { const L = o.logo; M.logo.draw(g, L.x * w, L.y * h, L.w * w, { glow: false }); }
      return c.toDataURL('image/png');
    };
    window.__icon = (n) => {
      const c = document.createElement('canvas'); c.width = n; c.height = n; const g = c.getContext('2d'); const u = n / 100;
      const bg = g.createRadialGradient(50 * u, 62 * u, 4 * u, 50 * u, 56 * u, 70 * u); bg.addColorStop(0, '#5a2a6b'); bg.addColorStop(0.55, '#2a1830'); bg.addColorStop(1, '#141210'); g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, n, n, 20 * u); g.fill();
      const fl = (cx, base, hh, ww, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx - ww, base); g.quadraticCurveTo(cx - ww * 1.1, base - hh * 0.5, cx + ww * 0.1, base - hh); g.quadraticCurveTo(cx + ww * 0.5, base - hh * 0.55, cx + ww, base); g.closePath(); g.fill(); };
      fl(50 * u, 62 * u, 54 * u, 25 * u, '#c8371d'); fl(50 * u, 62 * u, 44 * u, 19 * u, '#e8712b'); fl(50 * u, 62 * u, 31 * u, 12 * u, '#f2b70c'); fl(50 * u, 62 * u, 18 * u, 6.5 * u, '#fff8e8');
      g.save(); g.font = `${31 * u}px ${M.FONT_DISPLAY}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
      const ty = 76 * u;
      g.strokeStyle = '#141210'; g.lineWidth = 13 * u; g.strokeText('SFB', 50 * u, ty); g.strokeStyle = '#f3e6c8'; g.lineWidth = 9.5 * u; g.strokeText('SFB', 50 * u, ty);
      for (let k = 6; k >= 1; k--) { g.strokeStyle = g.fillStyle = k > 3 ? '#141210' : '#c8371d'; g.lineWidth = 4.4 * u; g.strokeText('SFB', 50 * u + k * u * 0.7, ty + k * u * 1.1); g.fillText('SFB', 50 * u + k * u * 0.7, ty + k * u * 1.1); }
      g.strokeStyle = '#141210'; g.lineWidth = 4 * u; g.strokeText('SFB', 50 * u, ty);
      const tg = g.createLinearGradient(0, ty - 24 * u, 0, ty); tg.addColorStop(0, '#fff7c9'); tg.addColorStop(0.35, '#ffd53a'); tg.addColorStop(0.75, '#f68b1e'); tg.addColorStop(1, '#d92f1b'); g.fillStyle = tg; g.fillText('SFB', 50 * u, ty);
      g.restore();
      g.strokeStyle = '#141210'; g.lineWidth = 3 * u; g.beginPath(); g.roundRect(1.5 * u, 1.5 * u, n - 3 * u, n - 3 * u, 19 * u); g.stroke();
      return c.toDataURL('image/png');
    };
  });

  console.log('ícones'); for (const n of [64, 192, 256, 512]) save(`icons/icon-${n}.png`, await page.evaluate(n => window.__icon(n), n));
  save('icons/favicon.png', await page.evaluate(() => window.__icon(48)));

  console.log('arte de loja');
  const key = (extra) => Object.assign({ stage: 'ladeira', fighters: [{ id: 'zeca', x: 0.2, y: 0.9, facing: 1, pose: 'spinKick', s: 1.25 }, { id: 'bia', x: 0.42, y: 0.93, facing: 1, s: 1.05 }, { id: 'cinzas', x: 0.8, y: 0.9, facing: -1, pose: 'lunge', s: 1.25 }, { id: 'mula', x: 0.62, y: 0.93, facing: -1, s: 1.1 }], logo: { x: 0.5, y: 0.2, size: 0.17, tag: 'THE BRAWL NEVER STOPS' } }, extra || {});
  const store = [
    ['store/steam-header-460x215.png', 460, 215, { logo: { x: 0.5, y: 0.33, w: 0.62 }, fighters: [{ id: 'zeca', x: 0.14, y: 1.0, facing: 1, pose: 'spinKick', s: 0.8 }, { id: 'cinzas', x: 0.86, y: 1.0, facing: -1, pose: 'lunge', s: 0.8 }] }],
    ['store/steam-capsule-616x353.png', 616, 353, { logo: { x: 0.5, y: 0.31, w: 0.58 }, fighters: [{ id: 'zeca', x: 0.17, y: 0.99, facing: 1, pose: 'spinKick', s: 1.0 }, { id: 'bia', x: 0.4, y: 1.0, facing: 1, s: 0.85 }, { id: 'mula', x: 0.62, y: 1.0, facing: -1, s: 0.9 }, { id: 'cinzas', x: 0.84, y: 0.99, facing: -1, pose: 'lunge', s: 1.0 }] }],
    ['store/steam-capsule-small-231x87.png', 231, 87, { logo: { x: 0.5, y: 0.5, w: 0.78 }, fighters: [] }],
    ['store/steam-capsule-vertical-374x448.png', 374, 448, { logo: { x: 0.5, y: 0.2, w: 0.92 }, bgShift: 0, fighters: [{ id: 'zeca', x: 0.27, y: 0.97, facing: 1, pose: 'spinKick', s: 1.15 }, { id: 'cinzas', x: 0.73, y: 0.97, facing: -1, pose: 'lunge', s: 1.15 }] }],
    ['store/steam-library-capsule-600x900.png', 600, 900, { logo: { x: 0.5, y: 0.17, w: 0.9 }, fighters: [{ id: 'zeca', x: 0.28, y: 0.95, facing: 1, pose: 'spinKick', s: 1.25 }, { id: 'cinzas', x: 0.74, y: 0.93, facing: -1, pose: 'lunge', s: 1.25 }, { id: 'mula', x: 0.5, y: 0.97, facing: -1, s: 1.0 }] }],
    ['store/steam-library-hero-3840x1240.png', 3840, 1240, { logo: null, fighterScale: 1.0, fighters: [{ id: 'zeca', x: 0.08, y: 0.98, facing: 1, pose: 'spinKick', s: 1.3 }, { id: 'bia', x: 0.24, y: 0.99, facing: 1, s: 1.1 }, { id: 'mula', x: 0.4, y: 0.99, facing: 1, s: 1.15 }, { id: 'papafigo', x: 0.58, y: 0.99, facing: -1, s: 1.1 }, { id: 'cuia', x: 0.74, y: 0.99, facing: -1, s: 1.1 }, { id: 'cinzas', x: 0.92, y: 0.98, facing: -1, pose: 'lunge', s: 1.3 }] }],
    ['store/key-art-1920x1080.png', 1920, 1080, {}],
    ['store/itch-cover-630x500.png', 630, 500, { logo: { x: 0.5, y: 0.26, w: 0.88 }, fighters: [{ id: 'zeca', x: 0.25, y: 0.97, facing: 1, pose: 'spinKick', s: 1.1 }, { id: 'cinzas', x: 0.75, y: 0.97, facing: -1, pose: 'lunge', s: 1.1 }] }]
  ];
  for (const [file, w, h, o] of store) save(file, await page.evaluate(([w, h, o]) => window.__art(w, h, o), [w, h, Object.assign(key(), o)]));
  // logo com fundo transparente (Steam library logo)
  save('store/steam-library-logo-1280x720.png', await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 1280; c.height = 720; const g = c.getContext('2d'); M.logo.draw(g, 640, 360, 1240, { glow: false }); return c.toDataURL('image/png'); }));

  console.log('capturas de tela (1920x1080)');
  const snap = async (name, setup, wait = 900) => { await page.evaluate(setup); await page.waitForTimeout(wait); await page.screenshot({ path: path.join(ROOT, 'store', name) }); console.log('   store/' + name); };
  const fightSetup = (a, b, stage, frames, fn) => `(() => { M.ui.hide(); const blank = () => M.AI.blank(); M.input.get = () => blank(); const m = new M.Match({ mode: 'versus', p1: { id: '${a}', ctrl: 'cpu' }, p2: { id: '${b}', ctrl: 'cpu' }, stage: '${stage}', rounds: 2, timer: 99, difficulty: 'lendario', onEnd: () => {} }); M.match = m; M.state = 'fight'; for (let i = 0; i < ${frames}; i++) m.update(); const good = () => { const [x, y] = m.fighters; return m.phase === 'fight' && x.x > 280 && x.x < 680 && y.x > 280 && y.x < 680 && Math.max(x.combo, y.combo) >= 3; }; for (let i = 0; i < 4000 && !good(); i++) m.update(); M.state = 'shot'; ${fn || ''} })()`;
  await page.evaluate(() => { const p = M.store.data.progress; p.storyDone = true; p.cinzas = true; M.store.save(); });
  await snap('screenshot-1-title.png', () => { M.ui.title(); });
  await snap('screenshot-2-select.png', () => { M.ui.charselect({ players: 2, mode: 'cpu' }); }, 1200);
  await snap('screenshot-3-fight-zeca-bia.png', fightSetup('zeca', 'bia', 'ladeira', 520), 1200);
  await snap('screenshot-4-fight-mula-cuia.png', fightSetup('mula', 'cuia', 'estrada', 700), 1200);
  await snap('screenshot-5-fight-juvenal-bene.png', fightSetup('juvenal', 'bene', 'pantanal', 600), 1200);
  await snap('screenshot-6-story-vs.png', () => { M.ui.versusCard({ p1: 'zeca', p2: 'bia', title: 'FIRST BRAWL — THE HILL', stageName: M.tr('Ladeira do Forró'), difficulty: 'brabo', challenge: 'fast' }, () => { }); }, 1400);
  await snap('screenshot-7-map.png', () => { M.ui.nightMap({ idx: 3, grades: { 1: 'S', 2: 'A' }, challenges: { 1: true }, patuas: ['vento'], licoes: ['l_passo'], bonds: ['bia', 'mare'], fama: 1, deaths: 0 }, () => { }); }, 1200);
  await snap('screenshot-8-dialogue.png', () => { M.ui.dialogue(M.STORY.fights[7].pre, M.STORY.fights[7].title, () => { }); }, 2500);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
