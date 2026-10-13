'use strict';
// Captura as telas REAIS do jogo (motor de verdade, sem retoque) que servem de base para o kit de arte.
// Uso:  cd sertao-fight-brasil && python3 -m http.server 8766 &   (outro terminal)
//       NODE_PATH=$(npm root -g) node tools/art/capture.js [filtro]
// Saída: art-kit/_raw/<alvo>-<nome>.png   (alvo: d = desktop 1920x1080 · m = iPhone 874x402@3 · l = iPhone grande 956x440@3 · t = iPad 1376x1032@2)
const pw = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..', '..'); const RAW = path.join(ROOT, 'art-kit', '_raw');
const URL = process.env.GAME_URL || 'http://localhost:8766/index.html';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FILTER = process.argv[2] || ''; const ONLY = process.env.ONLY || '';   // ONLY=fight | screen
fs.mkdirSync(RAW, { recursive: true });

const TARGETS = {
  d: { viewport: { width: 1920, height: 1080 }, dsf: 1, touch: false },
  m: { viewport: { width: 874, height: 402 }, dsf: 3, touch: true },   // 2622x1206  (iPhone Dynamic Island médio, horizontal)
  l: { viewport: { width: 956, height: 440 }, dsf: 3, touch: true },   // 2868x1320  (iPhone Dynamic Island grande, horizontal)
  t: { viewport: { width: 1376, height: 1032 }, dsf: 2, touch: true }  // 2752x2064  (iPad 13", horizontal)
};

// cenas de luta: o "caçador" avança a luta (determinística, por seed) até um momento bonito e congela o quadro
const FIGHTS = [
  { n: 'fight-ladeira-combo', a: 'zeca', b: 'iara', stage: 'ladeira', seed: 11, pred: 'combo', k: 4 },
  { n: 'fight-rio-fire', a: 'mula', b: 'curupira', stage: 'rio', seed: 23, pred: 'proj' },
  { n: 'fight-galpao-code', a: 'vinicius', b: 'mapinguari', stage: 'galpao', seed: 7, pred: 'super' },
  { n: 'fight-sertao-wolf', a: 'lobisomem', b: 'boto', stage: 'sertao', seed: 31, pred: 'combo', k: 3 },
  { n: 'fight-terreiro', a: 'bia', b: 'cuca', stage: 'terreiro', seed: 5, pred: 'combo', k: 3 },
  { n: 'fight-beco-saci', a: 'saci', b: 'papafigo', stage: 'beco', seed: 17, pred: 'proj' },
  { n: 'fight-parnaiba', a: 'iara', b: 'tiao', stage: 'parnaiba', seed: 3, pred: 'combo', k: 3 },
  { n: 'fight-estrada-mula', a: 'mula', b: 'cuia', stage: 'estrada', seed: 9, pred: 'super' },
  { n: 'fight-porto', a: 'mare', b: 'juvenal', stage: 'porto', seed: 14, pred: 'combo', k: 3 },
  { n: 'fight-pantanal', a: 'fulozinha', b: 'bene', stage: 'pantanal', seed: 21, pred: 'proj' }
];

const HUNT = `(o) => {
  M.ui.hide(); M.input.get = () => M.AI.blank(); M.audio.A.settings.sfx = false; M.audio.A.settings.music = false;
  let found = false, n = 0, m = null, attempt = 0;
  const base = () => { const [x, y] = m.fighters; const d = Math.abs(x.x - y.x); return m.phase === 'fight' && m.phaseT > 150 && m.fighters.every(f => !f.superFlash) && x.hp > x.maxHp * 0.25 && y.hp > y.maxHp * 0.25 && x.x > 190 && x.x < 770 && y.x > 190 && y.x < 770 && d > (o.dmin || 110) && d < (o.dmax || 430) && m.fighters.every(f => f.state !== 'ko') && m.stage.dark < 0.05 && m.fx.filter(e => e.type === 'text').length <= 2; };
  const preds = {
    combo: () => m.fighters.some(f => f.combo >= (o.k || 3)),
    super: () => m.fighters.some(f => f.move && f.move.super && f.state === 'attack' && f.mf > 26),
    proj: () => m.projectiles.length >= 1 && m.projectiles.some(p => p.x > 200 && p.x < 760) && Math.abs(m.fighters[0].x - m.fighters[1].x) > 240
  };
  for (; attempt < 14 && !found; attempt++) {
    m = new M.Match({ mode: 'versus', p1: { id: o.a, ctrl: 'cpu' }, p2: { id: o.b, ctrl: 'cpu' }, stage: o.stage, rounds: 2, timer: 99, difficulty: 'lendario', seed: (o.seed + attempt * 101) >>> 0, onEnd: () => {} });
    M.match = m; M.state = 'fight';
    for (n = 0; n < 7000; n++) { m.update(); if (m.done) break; if (n > 300 && base() && preds[o.pred]()) { found = true; break; } }
  }
  if (o.touch) { M.store.data.settings.speed = 0.0001; M.state = 'fight'; } else M.state = 'shot';   // no toque, os controles só aparecem no estado 'fight'
  return { found, n, attempt };
}`;

const SCREENS = {
  title: () => { M.ui.title(); },
  menu: () => { M.ui.menu(); },
  select: () => { M.ui.charselect({ players: 2, mode: 'cpu' }); },
  map: () => { M.ui.nightMap({ idx: 3, grades: { 1: 'S', 2: 'A' }, challenges: { 1: true }, patuas: ['vento'], licoes: ['l_passo'], bonds: ['bia', 'mare'], fama: 1, deaths: 0 }, () => { }); },
  vscard: () => { M.ui.versusCard({ p1: 'zeca', p2: 'bia', title: M.tr('PRIMEIRA RINHA — A LADEIRA'), stageName: M.tr('Ladeira do Forró'), difficulty: 'brabo', challenge: 'fast' }, () => { }); },
  dialogue: () => { M.ui.dialogue(M.STORY.fights[7].pre, M.STORY.fights[7].title, () => { }); },
  bracket: () => { M.store.data.tourney = null; const t = M.tourney.create({ name: 'COPA DA PRAÇA', fmt: 'de', bo: 3, shuffle: false, players: ['VINÍCIUS', 'ANA', 'BETO', 'CIDA', 'DAVI', 'EDU', 'FÁBIO', 'GABI'].map((n, i) => ({ n, cpu: i > 5 ? 'brabo' : null })) }); for (let i = 0; i < 6; i++) { const m = M.tourney.next(t); if (!m) break; M.tourney.report(t, m, i % 3 === 2 ? m.pb : m.pa, i % 3 === 2 ? [1, 2] : [2, 0], []); } M.ui4.bracket(); },
  competitive: () => { const c = M.comp.data(); c.tag = 'VINÍCIUS'; c.pr = 1340; c.games = 14; c.wins = 9; c.losses = 5; c.streak = 3; c.peak = 1380; M.ui3.hub(); },
  progress: () => { M.ui5.progress(); },
  mastery: () => { M.ui5.mastery(() => { }, 'iara'); },
  week: () => { M.ui5.week(); },
  king: () => { M.king.setup(); },
  framedata: () => { M.ui3.frameData(M.ROSTER.indexOf('saci')); }
};

(async () => {
  const browser = await pw.chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] } : {});
  const jobs = [];
  const want = (name, kind) => (!FILTER || name.includes(FILTER)) && (!ONLY || ONLY === kind);
  const CORE = ['fight-ladeira-combo', 'fight-galpao-code', 'fight-sertao-wolf', 'fight-terreiro', 'fight-parnaiba', 'fight-porto', 'fight-rio-fire', 'fight-pantanal'];
  const PLAN = {   // alvo+idioma -> [lutas (nomes) , telas]
    'd-en': [FIGHTS.map(f => f.n), Object.keys(SCREENS)],
    'd-pt': [CORE, Object.keys(SCREENS)],
    'm-en': [CORE.slice(0, 7), ['title', 'select', 'map', 'vscard']],
    'l-en': [CORE.slice(0, 7), ['title', 'select', 'map', 'vscard']],
    't-en': [CORE.slice(0, 7), ['title', 'select', 'map', 'vscard', 'progress', 'competitive']]
  };
  for (const key of Object.keys(PLAN)) {
    const [t, lang] = key.split('-'); const [fl, sl] = PLAN[key];
    for (const n of fl) { const f = FIGHTS.find(x => x.n === n), nm = `${t}-${lang}-${n}`; if (want(nm, 'fight')) jobs.push({ nm, t, lang, kind: 'fight', f }); }
    for (const s of sl) { const nm = `${t}-${lang}-${s}`; if (want(nm, 'screen')) jobs.push({ nm, t, lang, kind: 'screen', s }); }
  }
  // agrupa por (alvo, idioma) para reaproveitar o contexto
  const groups = {}; for (const j of jobs) (groups[j.t + j.lang] = groups[j.t + j.lang] || []).push(j);
  for (const key of Object.keys(groups)) {
    const list = groups[key], T = TARGETS[list[0].t], lang = list[0].lang;
    const ctx = await browser.newContext({ viewport: T.viewport, deviceScaleFactor: T.dsf, isMobile: T.touch, hasTouch: T.touch });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL + '?lang=' + lang, { waitUntil: 'load' }); await page.waitForTimeout(1800);
    await page.evaluate(() => { const p = M.store.data.progress; p.storyDone = true; p.cinzas = true; M.store.data.settings.clips = false; const fs = document.getElementById('fs'); if (fs) fs.style.display = 'none'; });
    for (const j of list) {
      try {
        if (j.kind === 'fight') { const r = await page.evaluate(`(${HUNT})(${JSON.stringify(Object.assign({}, j.f, { touch: T.touch }))})`); if (!r.found) console.log('   (sem momento ideal)', j.nm, r.n); await page.waitForTimeout(1200); }
        else { await page.evaluate(() => { M.match = null; M.state = 'menu'; M.store.data.settings.speed = 1; }); await page.evaluate(`(${SCREENS[j.s].toString()})()`); await page.waitForTimeout(j.s === 'dialogue' ? 5200 : j.s === 'select' || j.s === 'competitive' ? 1600 : 1100); }
        await page.screenshot({ path: path.join(RAW, j.nm + '.png') }); console.log('  ', j.nm);
      } catch (e) { console.log('  ERRO', j.nm, e.message.split('\n')[0]); }
    }
    if (errs.length) console.log('  erros de página:', errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
