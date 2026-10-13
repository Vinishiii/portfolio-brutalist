'use strict';
// Lista de TODOS os arquivos do kit: caminho, dimensões exigidas pela loja, formato e a composição que o gera.
const GR = 452;
const idle = (id, x, y, f, s) => ({ id, x, y, facing: f, s, pose: null, proj: false });
const RAW = (n) => '/art-kit/_raw/' + n + '.png';

// elenco de destaque (coordenadas do mundo do jogo, 960x540)
const TEAM8 = [
  idle('bia', 300, GR - 16, 1, 1.0), idle('boto', 480, GR - 24, 1, 1.0), idle('iara', 665, GR - 16, -1, 1.0),
  idle('curupira', 385, GR + 16, 1, 1.1), idle('mula', 480, GR + 22, 1, 1.12), idle('cuca', 580, GR + 16, -1, 1.1),
  { id: 'zeca', x: 165, y: GR + 16, facing: 1, s: 1.32 }, { id: 'lobisomem', x: 805, y: GR + 16, facing: -1, s: 1.32 }
];
const RAYS = (y = 0.62, r = 0.75, a = 0.2) => ({ t: 'rays', x: 0.5, y, r, n: 22, alpha: a, color: '#ffe3a0' });

module.exports = () => {
  const L = [];
  const add = (file, w, h, comp, o, extra) => L.push(Object.assign({ file, w, h, comp, o: o || {}, fmt: file.endsWith('.jpg') ? 'jpg' : 'png', q: 0.95 }, extra || {}));

  // ============================================================ STEAM — loja (tamanhos atuais da Steamworks)
  const S = 'steam/store/';
  add(S + 'featured-key-art_1920x1080.png', 1920, 1080, 'scene', { stage: 'ladeira', cam: { zoom: 1.0, fx: 480, fy: 300, ay: 0.52 }, under: [RAYS()], fighters: TEAM8, bloom: 0.22, vig: 0.45, layers: [{ t: 'embers', n: 70, seed: 3, y0: 0.3, span: 0.6, size: 2.2 }, { t: 'logo', x: 0.5, y: 0.2, w: 0.5 }] });
  add(S + 'main-capsule_1232x706.png', 1232, 706, 'scene', { stage: 'ladeira', cam: { zoom: 1.0, fx: 480, fy: 300, ay: 0.52 }, under: [RAYS()], fighters: TEAM8, bloom: 0.22, vig: 0.45, layers: [{ t: 'embers', n: 40, seed: 3, y0: 0.3, span: 0.6, size: 1.6 }, { t: 'logo', x: 0.5, y: 0.2, w: 0.54 }] });
  add(S + 'header-capsule_920x430.png', 920, 430, 'scene', {
    stage: 'ladeira', cam: { zoom: 1.2, fx: 480, fy: 466, ay: 0.955 }, under: [RAYS(0.7)], bloom: 0.2, vig: 0.4,
    fighters: [{ id: 'zeca', x: 250, y: GR + 14, facing: 1, s: 1.12 }, idle('curupira', 385, GR + 14, 1, 1.0), idle('mula', 480, GR + 20, 1, 1.0), idle('cuca', 580, GR + 14, -1, 1.0), { id: 'lobisomem', x: 722, y: GR + 14, facing: -1, s: 1.12 }],
    layers: [{ t: 'logo', x: 0.5, y: 0.27, w: 0.52 }]
  });
  add(S + 'small-capsule_462x174.png', 462, 174, 'scene', { stage: 'ladeira', cam: { zoom: 1.7, fx: 480, fy: 235, ay: 0.5 }, crowd: false, under: [RAYS(0.5, 0.9, 0.22)], vig: 0.35, bloom: 0.15, layers: [{ t: 'logo', x: 0.5, y: 0.5, w: 0.78 }] });
  add(S + 'vertical-capsule_748x896.png', 748, 896, 'scene', {
    stage: 'ladeira', cam: { zoom: 1.0, fx: 480, fy: 270, ay: 0.5 }, under: [RAYS(0.62, 0.9, 0.22)], bloom: 0.2, vig: 0.45,
    fighters: [idle('mula', 485, GR - 20, 1, 0.98), { id: 'zeca', x: 345, y: GR + 14, facing: 1, s: 1.12 }, { id: 'lobisomem', x: 625, y: GR + 14, facing: -1, s: 1.12 }],
    layers: [{ t: 'embers', n: 40, seed: 5, y0: 0.35, span: 0.55, size: 2 }, { t: 'logo', x: 0.5, y: 0.19, w: 0.9 }]
  });

  // ============================================================ STEAM — biblioteca
  const B = 'steam/library/';
  add(B + 'library-capsule_600x900.png', 600, 900, 'scene', {
    stage: 'ladeira', cam: { zoom: 1.0, fx: 480, fy: 270, ay: 0.5 }, under: [RAYS(0.64, 0.9, 0.22)], bloom: 0.2, vig: 0.45,
    fighters: [idle('mula', 482, GR - 20, 1, 0.98), { id: 'zeca', x: 378, y: GR + 14, facing: 1, s: 1.05 }, { id: 'lobisomem', x: 585, y: GR + 14, facing: -1, s: 1.05 }],
    layers: [{ t: 'embers', n: 40, seed: 6, y0: 0.35, span: 0.55, size: 2 }, { t: 'logo', x: 0.5, y: 0.185, w: 0.9 }]
  });
  add(B + 'library-hero_3840x1240.png', 3840, 1240, 'scene', {
    stage: 'ladeira', cam: { zoom: 1.0, fx: 480, fy: 350, ay: 0.5 }, under: [{ t: 'rays', x: 0.62, y: 0.7, r: 0.7, n: 22, alpha: 0.18, color: '#ffe3a0' }], bloom: 0.2, vig: 0.4,
    fighters: [idle('bia', 300, GR - 16, 1, 1.0), idle('boto', 580, GR - 22, 1, 1.0), idle('iara', 800, GR - 16, -1, 1.0),
    { id: 'zeca', x: 395, y: GR + 14, facing: 1, s: 1.18 }, idle('curupira', 505, GR + 14, 1, 1.08), idle('mula', 648, GR + 18, 1, 1.1), idle('cuca', 735, GR + 14, -1, 1.08), { id: 'lobisomem', x: 885, y: GR + 14, facing: -1, s: 1.18 }],
    layers: [{ t: 'embers', n: 90, seed: 8, y0: 0.2, span: 0.65, size: 3.2 }]
  });
  add(B + 'library-logo_1280x720.png', 1280, 720, 'logoBox', {}, { alpha: true, sizeFree: true });


  // ============================================================ STEAM — capturas reais do jogo (1920x1080, sem retoque)
  const SS = ['d-en-fight-ladeira-combo', 'd-en-fight-galpao-code', 'd-en-select', 'd-en-fight-sertao-wolf', 'd-en-map', 'd-en-fight-terreiro', 'd-en-bracket', 'd-en-fight-parnaiba', 'd-en-progress', 'd-en-fight-porto'];
  SS.forEach((n, i) => add(`steam/screenshots/${String(i + 1).padStart(2, '0')}-${n.replace('d-en-', '')}_1920x1080.png`, 1920, 1080, 'raw', {}, { raw: RAW(n) }));

  // ============================================================ GOOGLE PLAY
  const G = 'google-play/';
  add(G + 'icon_512x512.png', 512, 512, 'iconSq', { border: false });
  add(G + 'feature-graphic_1024x500.png', 1024, 500, 'scene', {
    stage: 'ladeira', cam: { zoom: 1.2, fx: 480, fy: 466, ay: 0.955 }, under: [RAYS(0.7)], bloom: 0.2, vig: 0.4,
    fighters: [{ id: 'zeca', x: 250, y: GR + 14, facing: 1, s: 1.12 }, idle('curupira', 385, GR + 14, 1, 1.0), idle('mula', 480, GR + 20, 1, 1.0), idle('cuca', 580, GR + 14, -1, 1.0), { id: 'lobisomem', x: 722, y: GR + 14, facing: -1, s: 1.12 }],
    layers: [{ t: 'logo', x: 0.5, y: 0.27, w: 0.52 }]
  });
  // roteiro de manchetes das lojas móveis (texto só com recursos confirmados no jogo)
  const STORY = [
    { k: 'select', stage: 'ladeira', head: '20 FIGHTERS. 20 STYLES.', sub: 'From the backlands to the legends of Brazilian folklore.' },
    { k: 'fight-ladeira-combo', stage: 'rio', head: 'ONE BAR. THE CROWD DECIDES.', sub: 'Hit on the beat to pull the Energy to your side.' },
    { k: 'fight-galpao-code', stage: 'galpao', head: 'UNLEASH YOUR PEIA', sub: 'Every fighter has a signature super.' },
    { k: 'fight-sertao-wolf', stage: 'sertao', head: 'THROWS, COUNTERS, FINISHERS', sub: 'Perfect dodges, cancels and slow-motion finishers.' },
    { k: 'map', stage: 'beco', head: 'A STORY WITH THREE ENDINGS', sub: 'A night map, rivals and bonds — one ending is secret.' },
    { k: 'vscard', stage: 'ladeira', head: 'A CHALLENGE IN EVERY FIGHT', sub: 'Optional goals and S-to-C grades.' },
    { k: 'fight-terreiro', stage: 'terreiro', head: 'EVERY FIGHTER, A NEW STYLE', sub: 'Strings, follow-ups and a unique Peia each.' },
    { k: 'fight-parnaiba', stage: 'parnaiba', head: 'ZABUMBA, TRIANGLE & ACCORDION', sub: 'Live-synthesized music that shifts with the Energy.' }
  ];
  const panels = (dir, name, w, h, prefix, items, o) => items.forEach((it, i) => add(`${dir}${String(i + 1).padStart(2, '0')}-${it.k}_${w}x${h}.jpg`, w, h, 'panel2', Object.assign({ stage: it.stage, head: it.head, sub: it.sub }, o || {}), { raw: RAW(prefix + it.k) }));
  panels(G + 'phone/', 'phone', 1920, 1080, 'm-en-', STORY);
  const TAB = [STORY[0], STORY[1], STORY[2], STORY[3], STORY[4], { k: 'competitive', stage: 'galpao', head: 'RANKED & LOCAL TOURNAMENTS', sub: 'Ranked play against a CPU that adapts to you.' }];
  panels(G + 'tablet-7-and-10in/', 'tablet', 2560, 1600, 't-en-', TAB);

  // ============================================================ APPLE APP STORE
  const A = 'app-store/';
  add(A + 'app-icon_1024x1024.png', 1024, 1024, 'iconSq', { border: false });
  panels(A + 'iphone-6.3in_2622x1206/', 'iphone63', 2622, 1206, 'm-en-', STORY);
  panels(A + 'iphone-6.9in_2868x1320/', 'iphone69', 2868, 1320, 'l-en-', STORY);
  const IPAD = [STORY[0], STORY[1], STORY[2], STORY[3], STORY[4], STORY[5], { k: 'competitive', stage: 'galpao', head: 'RANKED & LOCAL TOURNAMENTS', sub: 'Ranked play against a CPU that adapts to you.' }, { k: 'progress', stage: 'rio', head: 'LEVEL UP. MASTER EVERY FIGHTER.', sub: 'Daily missions, titles and colors earned by playing.' }];
  panels(A + 'ipad-13in_2752x2064/', 'ipad', 2752, 2064, 't-en-', IPAD);

  // ============================================================ INSTAGRAM (PT-BR) — texto só com recursos confirmados
  const I = 'instagram/';
  const PT = { lang: 'pt' };
  add(I + 'perfil/avatar_1080x1080.png', 1080, 1080, 'iconSq', { round: false }, PT);
  add(I + 'perfil/avatar_320x320.png', 320, 320, 'iconSq', { round: false }, PT);
  const SLIDE = (n, rest) => I + rest.replace('{n}', String(n).padStart(2, '0'));
  // -- carrossel 1: os 20 lutadores (capa + 5 lâminas com 4 lutadores)
  add(I + 'carrossel-os-20-lutadores/01-capa_1080x1350.jpg', 1080, 1350, 'cover', { stage: 'ladeira', k: 2.6, ay: 0.74, logoY: 0.16, logoW: 0.8, big: '20 LUTADORES', bigY: 0.36, stamp: 'DESLIZE PARA CONHECER  →', stampY: 0.955, stampS: 0.026,
    lineup: [idle('bia', 400, GR - 16, 1, 1.0), idle('iara', 565, GR - 16, -1, 1.0), idle('boto', 480, GR - 26, 1, 1.0), { id: 'zeca', x: 380, y: GR + 22, facing: 1, s: 1.2 }, { id: 'lobisomem', x: 600, y: GR + 22, facing: -1, s: 1.2 }, idle('mula', 480, GR + 26, 1, 1.0)] }, PT);
  const ROW = [['zeca', 'bia', 'mare', 'tiao', 'ladeira'], ['bene', 'juvenal', 'vinicius', 'fulozinha', 'terreiro'], ['mula', 'papafigo', 'cuia', 'saci', 'estrada'], ['curupira', 'iara', 'boto', 'lobisomem', 'rio'], ['mapinguari', 'cuca', 'pisadeira', 'cinzas', 'beco']];
  ROW.forEach((r, i) => add(I + `carrossel-os-20-lutadores/${String(i + 2).padStart(2, '0')}-lutadores_1080x1350.jpg`, 1080, 1350, 'roster4', { ids: r.slice(0, 4), stage: r[4], page: `${i + 2}/6` }, PT));
  // -- carrossel 2: como funciona (capas reais do jogo)
  const HOW = [
    ['fight-ladeira-combo', 'ladeira', 'UMA BARRA SÓ: A TORCIDA DECIDE', 'Acerte golpes variados, esquive na hora certa e bata no compasso da zabumba para puxar a Energia para o seu lado.'],
    ['fight-galpao-code', 'galpao', 'A PEIA: O ESPECIAL DE CADA UM', 'Com 70% de Energia, solte a Peia do seu lutador.'],
    ['fight-sertao-wolf', 'sertao', 'GOLPES COM PESO', 'Sequências de três golpes, cancelamentos, agarrões e arremate em câmera lenta.'],
    ['map', 'beco', 'MODO HISTÓRIA: TRÊS FINAIS', 'Mapa da noite, laços com os rivais e chefe em duas fases. Um dos finais é secreto.'],
    ['bracket', 'galpao', 'RANQUEADA E TORNEIO LOCAL', 'Uma CPU que se ajusta ao seu nível e chaves para até 16 jogadores.'],
    ['progress', 'rio', 'SEMPRE UMA RAZÃO PARA MAIS UMA', 'Nível, maestria por lutador, missões e cores ganhas jogando. Sem caixa de sorte.']
  ];
  add(I + 'carrossel-como-funciona/01-capa_1080x1350.jpg', 1080, 1350, 'cover', { stage: 'rio', k: 2.6, ay: 0.74, logoY: 0.16, logoW: 0.8, big: 'COMO SE LUTA', bigY: 0.36, stamp: 'DESLIZE  →', stampY: 0.955, stampS: 0.026,
    lineup: [idle('mula', 480, GR - 22, 1, 1.0), { id: 'zeca', x: 350, y: GR + 24, facing: 1, s: 1.2 }, idle('iara', 612, GR + 24, -1, 1.15)] }, PT);
  HOW.forEach((h, i) => add(I + `carrossel-como-funciona/${String(i + 2).padStart(2, '0')}-${h[0]}_1080x1350.jpg`, 1080, 1350, 'shotSlide', { stage: h[1], kicker: `COMO FUNCIONA ${i + 1}/6`, head: h[2], sub: h[3] }, Object.assign({ raw: RAW('d-pt-' + h[0]) }, PT)));
  // -- carrossel 3: cenários
  const STG = [['ladeira', 'zeca', 'bia'], ['rio', 'boto', 'iara'], ['sertao', 'tiao', 'lobisomem'], ['terreiro', 'bene', 'cuca'], ['galpao', 'vinicius', 'mapinguari'], ['beco', 'papafigo', 'saci']];
  add(I + 'carrossel-cenarios/01-capa_1080x1350.jpg', 1080, 1350, 'cover', { stage: 'beco', k: 2.6, ay: 0.74, logoY: 0.16, logoW: 0.8, big: 'OS CENÁRIOS', bigY: 0.36, stamp: 'DESLIZE  →', stampY: 0.955, stampS: 0.026,
    lineup: [idle('saci', 480, GR - 22, 1, 1.0), idle('papafigo', 355, GR + 24, 1, 1.15), idle('pisadeira', 610, GR + 24, -1, 1.15)] }, PT);
  STG.forEach((st, i) => add(I + `carrossel-cenarios/${String(i + 2).padStart(2, '0')}-${st[0]}_1080x1350.jpg`, 1080, 1350, 'stageSlide', { stage: st[0], index: i + 1, k: 2.9, fighters: [{ id: st[1], x: 420, y: GR + 14, facing: 1, s: 1.15, pose: null, proj: false }, { id: st[2], x: 560, y: GR + 14, facing: -1, s: 1.15, pose: null, proj: false }] }, PT));
  // -- lutador do dia: 20 cartas
  const CARD_STAGE = { zeca: 'ladeira', bia: 'ladeira', mare: 'rio', tiao: 'sertao', bene: 'terreiro', juvenal: 'sertao', vinicius: 'galpao', fulozinha: 'mata', mula: 'estrada', papafigo: 'beco', cuia: 'estrada', saci: 'pantanal', curupira: 'mata', iara: 'parnaiba', boto: 'rio', lobisomem: 'sertao', mapinguari: 'mata', cuca: 'pantanal', pisadeira: 'beco', cinzas: 'cinzas' };
  const ORDER = ['zeca', 'bia', 'mare', 'tiao', 'bene', 'juvenal', 'vinicius', 'fulozinha', 'mula', 'papafigo', 'cuia', 'saci', 'curupira', 'iara', 'boto', 'lobisomem', 'mapinguari', 'cuca', 'pisadeira', 'cinzas'];
  ORDER.forEach((id, i) => add(I + `lutador-do-dia/${String(i + 1).padStart(2, '0')}-${id}_1080x1350.jpg`, 1080, 1350, 'card', { id, stage: CARD_STAGE[id], index: i + 1, total: 20 }, PT));
  // -- post de apresentação (feed único)
  add(I + 'feed/post-apresentacao_1080x1350.jpg', 1080, 1350, 'cover', { stage: 'ladeira', k: 2.6, ay: 0.74, logoY: 0.17, logoW: 0.86, big: 'A RINHA NUNCA PARA', bigY: 0.37, stamp: 'JOGO DE LUTA BRASILEIRO', stampY: 0.955, stampS: 0.028,
    lineup: [idle('bia', 400, GR - 16, 1, 1.0), idle('iara', 565, GR - 16, -1, 1.0), idle('boto', 480, GR - 26, 1, 1.0), { id: 'zeca', x: 380, y: GR + 22, facing: 1, s: 1.2 }, { id: 'lobisomem', x: 600, y: GR + 22, facing: -1, s: 1.2 }, idle('mula', 480, GR + 26, 1, 1.0)] }, PT);
  // -- reel / stories / destaques (1080x1920; mantenha o essencial fora de ~250 px no topo e na base)
  add(I + 'reels/capa-reel_1080x1920.jpg', 1080, 1920, 'cover', { stage: 'ladeira', k: 3.6, ay: 0.84, logoY: 0.3, logoW: 0.88, stamp: 'JOGO DE LUTA BRASILEIRO', stampY: 0.585, stampS: 0.022,
    lineup: [idle('mula', 480, GR - 26, 1, 0.95), { id: 'zeca', x: 400, y: GR + 22, facing: 1, s: 1.0 }, idle('iara', 566, GR + 22, -1, 1.0)] }, PT);
  const STO = [
    ['select', 'ladeira', 'QUEM VOCÊ ESCOLHE?', 'São 20 lutadores. Qual é o seu?'],
    ['map', 'beco', 'MODO HISTÓRIA', 'Uma noite em Vila Brasa. Três finais.'],
    ['fight-galpao-code', 'galpao', 'SOLTE A PEIA', 'O especial de cada lutador.'],
    ['week', 'rio', 'RINHA DA SEMANA', 'Três lutas seguidas com regras malucas.']
  ];
  STO.forEach((s2, i) => add(I + `stories/${String(i + 1).padStart(2, '0')}-${s2[0]}_1080x1920.jpg`, 1080, 1920, 'shotSlide', { stage: s2[1], head: s2[2], sub: s2[3], story: true, headY: 420, frameY: 760, logoY: 1500 }, Object.assign({ raw: RAW('d-pt-' + s2[0]) }, PT)));
  const HL = [['LUTADORES', { id: 'zeca', stage: 'ladeira' }], ['CENÁRIOS', { stageThumb: 'rio', stage: 'rio' }], ['HISTÓRIA', { id: 'cinzas', stage: 'cinzas' }], ['MODOS', { icon: true, stage: 'galpao' }], ['FOLCLORE', { id: 'mula', stage: 'estrada' }]];
  HL.forEach((h, i) => add(I + `destaques/${String(i + 1).padStart(2, '0')}-${h[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}_1080x1920.jpg`, 1080, 1920, 'highlight', Object.assign({ label: h[0] }, h[1]), PT));

  return L;
};
