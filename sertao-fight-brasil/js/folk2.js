'use strict';
// ============================================================
// FOLCLORE 2 — oito lendas novas, para fechar o elenco em vinte lutadores:
//   Saci-Pererê, Curupira, Iara, Boto Cor-de-Rosa, Lobisomem, Mapinguari, Cuca e Pisadeira.
// Só dados (stats, golpes, sequências); o desenho de cada um está em js/folk2draw.js.
// js/fighters.js junta isto aos lutadores antigos antes de calcular quadros totais, alcance e cancelamentos.
// ============================================================
(function () {
  const mv = (o) => Object.assign({ type: 'mid', kb: 3, hitstun: 14, blockstun: 9, chip: 0 }, o);
  const D = {};

  // ---------------------------------------------------------------- SACI-PERERÊ — moleque ágil, redemoinho e sumiço
  D.saci = {
    id: 'saci', name: 'Saci-Pererê', short: 'Saci', alias: 'O Moleque do Redemoinho', origin: 'Matas de Minas Gerais', style: 'Peraltice de uma perna só',
    bio: 'Moleque de uma perna só, carapuça vermelha e cachimbo, que viaja dentro dos redemoinhos. Esconde objetos, azeda o leite, trança as crinas dos cavalos. Dizem que quem toma a carapuça dele ganha um desejo — mas ninguém nunca conseguiu.',
    quote: 'Pega, não pega! Hi-hi-hi!', winQuote: 'Cadê o seu chapéu agora?',
    colors: { skin: '#2c211b', torso: '#2c211b', arms: '#2c211b', legs: '#2c211b', shoes: '#2c211b', accent: '#d6261c', hair: '#d6261c' },
    hair: 'carapuca', prop: 'pipe', idle: 'bounce', idleOver: { na: [40, 100], fa: [30, 90], torso: 4 }, body: { height: 0.86, build: 0.78 }, details: ['oneLeg'],
    stats: { hp: 880, speed: 3.9, jumpV: -14.8, weight: 0.78, dashV: 11.5, airSpeed: 4.6, maxJumps: 2 },
    superName: 'Redemoinho Gigante', superDesc: 'Um tornado de poeira varre a rinha inteira e sacode o adversário.',
    ai: { zone: 0.35, air: 0.5, grab: 0, rush: 0.55, poke: 0.5 },
    moves: {
      L: mv({ id: 'L', name: 'Cutucão', startup: 3, active: 3, recovery: 8, dmg: 40, hitstun: 18, blockstun: 8, kb: 2, hitbox: { x: 20, y: 80, w: 58, h: 30 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Rasteira de moleque', startup: 4, active: 3, recovery: 9, dmg: 34, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 66, h: 28 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Pezada', startup: 4, active: 5, recovery: 7, dmg: 42, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 14, w: 62, h: 46 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Pulo da perna só', startup: 9, active: 5, recovery: 15, dmg: 94, hitstun: 20, blockstun: 11, kb: 5, hitbox: { x: 10, y: 40, w: 104, h: 100 }, pose: 'riseKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Peteleco rasteiro', startup: 8, active: 5, recovery: 17, dmg: 82, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: 24, y: 0, w: 96, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Quique no ar', startup: 7, active: 7, recovery: 9, dmg: 90, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: -6, y: 0, w: 92, h: 84 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
      fH: mv({ id: 'fH', name: 'Carreira de uma perna', startup: 9, active: 5, recovery: 15, dmg: 88, hitstun: 19, blockstun: 11, kb: 5, hitbox: { x: 20, y: 40, w: 72, h: 66 }, pose: 'lunge', move: [{ f: 2, t: 14, vx: 9.5 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Redemoinho', startup: 11, active: 1, recovery: 19, dmg: 44, hitstun: 16, blockstun: 10, kb: 2, chip: 6, pose: 'cast', projectile: { kind: 'whirlwind', vx: 5.2, vy: 0, w: 60, h: 92, y: 0, life: 90, hits: 2, hitInterval: 12 }, sfx: 'whooshH' }),
      dS: mv({ id: 'dS', name: 'Sumiço', startup: 8, active: 4, recovery: 16, dmg: 78, hitstun: 20, blockstun: 11, kb: 5, invuln: [0, 13], teleport: { behind: true, dist: 76 }, hitbox: { x: 10, y: 50, w: 90, h: 90 }, pose: 'jab', sfx: 'dodge' }),
      aS: mv({ id: 'aS', name: 'Redemoinho pra baixo', startup: 8, active: 1, recovery: 12, dmg: 52, type: 'high', air: true, hitstun: 15, kb: 3, chip: 5, pose: 'castLow', projectile: { kind: 'whirlwind', vx: 4.5, vy: 5.5, w: 50, h: 70, y: 20, life: 70 }, sfx: 'whoosh' }),
      dH: mv({ id: 'dH', name: 'Pulo-tesoura', startup: 6, active: 6, recovery: 13, dmg: 86, launch: 9, hitstun: 20, blockstun: 11, kb: 4, hitbox: { x: 10, y: 35, w: 96, h: 80 }, pose: 'airKick', move: [{ f: 0, t: 12, vx: 9 }], sfx: 'whooshH' }),
      bH: mv({ id: 'bH', name: 'Pega, não pega', startup: 3, active: 1, recovery: 12, dmg: 0, invuln: [0, 16], move: [{ f: 0, t: 14, vx: -9.5 }], pose: 'dodge', sfx: 'dodge' }),
      fS: mv({ id: 'fS', name: 'Esconder o chapéu', startup: 10, active: 4, recovery: 18, dmg: 30, hitstun: 16, blockstun: 9, kb: 2, drainAxe: 0.18, hitbox: { x: 16, y: 60, w: 90, h: 60 }, pose: 'lunge', sfx: 'taunt' }),
      M: mv({ id: 'M', name: 'Redemoinho Gigante', super: true, startup: 18, active: 1, recovery: 28, dmg: 62, hitstun: 22, blockstun: 15, kb: 1.5, chip: 14, launch: 12, invuln: [0, 18], pose: 'superCast', projectile: { kind: 'whirlwind', vx: 4.5, vy: 0, w: 170, h: 210, y: 0, life: 200, hits: 6, hitInterval: 8 }, sfx: 'super' })
    }
  };

  // ---------------------------------------------------------------- CURUPIRA — fogo na cabeça, pés virados, rastro enganoso
  D.curupira = {
    id: 'curupira', name: 'Curupira', alias: 'O Guardião de Pés Virados', origin: 'Floresta Amazônica', style: 'Fogo e rastro',
    bio: 'Menino de cabelo de fogo e pés virados para trás, que protege os bichos e a mata de caçadores e madeireiros. Quem segue o rastro dele acaba mais perdido do que começou. Respeita quem pede licença — e castiga quem não pede.',
    quote: 'Quem segue meu rastro se perde.', winQuote: 'A mata fica com quem a respeita.',
    colors: { skin: '#c68a5b', torso: '#c68a5b', arms: '#c68a5b', legs: '#c68a5b', shoes: '#c68a5b', accent: '#e8712b', hair: '#e8541b' },
    hair: 'curupiraFire', prop: null, idle: 'bounce', idleOver: { na: [38, 100], fa: [28, 86], torso: 5 }, body: { height: 0.82, build: 0.74 }, details: ['backfeet', 'leaves'], portraitExtra: 34,
    stats: { hp: 900, speed: 3.8, jumpV: -14.2, weight: 0.8, dashV: 11.5, airSpeed: 4.2, maxJumps: 2 },
    superName: 'Incêndio da Mata', superDesc: 'Uma corrida em chamas que queima tudo pelo caminho.',
    ai: { zone: 0.3, air: 0.4, grab: 0, rush: 0.65, poke: 0.5 },
    moves: {
      L: mv({ id: 'L', name: 'Soco de mato', startup: 3, active: 3, recovery: 8, dmg: 42, hitstun: 18, blockstun: 8, kb: 2, hitbox: { x: 20, y: 82, w: 58, h: 30 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Pisada pelo avesso', startup: 4, active: 3, recovery: 9, dmg: 34, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 66, h: 28 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Pé virado', startup: 4, active: 5, recovery: 7, dmg: 42, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 14, w: 62, h: 46 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Rabo de fogo', startup: 9, active: 5, recovery: 16, dmg: 92, hitstun: 20, blockstun: 11, kb: 5, hitbox: { x: 14, y: 62, w: 118, h: 80 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Rasteira de raiz', startup: 8, active: 5, recovery: 17, dmg: 82, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: 24, y: 0, w: 96, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Cambalhota de fogo', startup: 7, active: 7, recovery: 9, dmg: 88, type: 'high', air: true, burn: true, hitstun: 18, kb: 4, hitbox: { x: -6, y: 0, w: 92, h: 84 }, pose: 'airSpin', spin: [0, 360], sfx: 'fire', fx: 'arc' }),
      fH: mv({ id: 'fH', name: 'Carreira de trás pra frente', startup: 9, active: 5, recovery: 15, dmg: 90, hitstun: 19, blockstun: 11, kb: 5, hitbox: { x: 20, y: 40, w: 72, h: 66 }, pose: 'lunge', move: [{ f: 2, t: 14, vx: 9.5 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Bola de fogo', startup: 11, active: 1, recovery: 19, dmg: 70, burn: true, hitstun: 16, blockstun: 10, kb: 4, chip: 6, pose: 'cast', projectile: { kind: 'ember', vx: 8, vy: 0, w: 50, h: 50, y: 96, life: 70 }, sfx: 'fire' }),
      dS: mv({ id: 'dS', name: 'Pegadas ao contrário', startup: 12, active: 1, recovery: 18, dmg: 44, hitstun: 40, blockstun: 10, kb: 0, chip: 0, lag: 130, lagText: 'PERDIDO!', pose: 'trap', trap: { dist: 140, life: 230, w: 70, h: 40, kind: 'tracks' }, sfx: 'whooshH' }),
      aS: mv({ id: 'aS', name: 'Brasa do alto', startup: 8, active: 1, recovery: 12, dmg: 56, type: 'high', air: true, burn: true, hitstun: 15, kb: 3, chip: 5, pose: 'castLow', projectile: { kind: 'ember', vx: 5.5, vy: 5.5, w: 44, h: 44, y: 40, life: 70 }, sfx: 'fire' }),
      dH: mv({ id: 'dH', name: 'Cabeçada de fogo', startup: 8, active: 5, recovery: 15, dmg: 98, burn: true, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 20, y: 60, w: 84, h: 60 }, pose: 'headbutt', move: [{ f: 0, t: 12, vx: 9.5 }], sfx: 'fire' }),
      bH: mv({ id: 'bH', name: 'Corrida às avessas', startup: 3, active: 1, recovery: 12, dmg: 0, invuln: [0, 14], move: [{ f: 0, t: 14, vx: -9 }], pose: 'dodge', sfx: 'dodge' }),
      fS: mv({ id: 'fS', name: 'Sumiço na mata', startup: 12, active: 4, recovery: 12, dmg: 86, burn: true, hitstun: 20, blockstun: 11, kb: 6, invuln: [0, 13], teleport: { behind: true, dist: 80 }, hitbox: { x: 10, y: 60, w: 80, h: 80 }, pose: 'jab', sfx: 'dodge' }),
      M: mv({ id: 'M', name: 'Incêndio da Mata', super: true, startup: 14, active: 34, recovery: 22, dmg: 58, hits: 6, hitInterval: 6, launch: 13, burn: true, hitstun: 22, blockstun: 15, kb: 1.5, chip: 16, invuln: [0, 16], hitbox: { x: 0, y: 30, w: 130, h: 130 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 12 }, { f: 14, t: 48, vx: 2.5 }], sfx: 'super', fx: 'arc' })
    }
  };

  // ---------------------------------------------------------------- IARA — canto que encanta, abraço do rio, espelho d'água
  D.iara = {
    id: 'iara', name: 'Iara', alias: 'A Mãe d’Água', origin: 'Rio Negro, AM', style: 'Canto e correnteza',
    bio: 'Metade mulher, metade peixe, de cabelos tão escuros quanto o fundo do rio. O canto dela atrai pescadores para as águas profundas — e poucos voltam para contar. Dizem que foi uma jovem castigada pela inveja dos irmãos e salva pelo rio.',
    quote: 'Escute o rio chamar o seu nome.', winQuote: 'O rio sempre fica com o que é dele.',
    colors: { skin: '#c99870', torso: '#1f8a8a', arms: '#c99870', legs: '#2a9d8f', shoes: '#1d7a74', accent: '#f2d34a', hair: '#0f1f1a' },
    hair: 'iaraHair', prop: null, idle: 'sway', idleOver: { na: [38, 98], fa: [26, 84], torso: 4 }, body: { height: 1.0, build: 0.86 }, details: ['scales', 'tailfin'], portraitExtra: 24,
    stats: { hp: 940, speed: 2.9, jumpV: -12.6, weight: 0.95, dashV: 8.8, airSpeed: 2.8, maxJumps: 1 },
    superName: 'Canto da Sereia', superDesc: 'Um canto irresistível que puxa o oponente para o redemoinho.',
    ai: { zone: 0.6, air: 0.15, grab: 0.2, rush: 0.2, poke: 0.7 },
    moves: {
      L: mv({ id: 'L', name: 'Tapa d’água', startup: 4, active: 3, recovery: 9, dmg: 44, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 20, y: 90, w: 62, h: 32 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Cauda rasteira', startup: 5, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 76, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Mergulho curto', startup: 5, active: 5, recovery: 8, dmg: 46, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 18, w: 66, h: 48 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Rabanada de cauda', startup: 10, active: 5, recovery: 17, dmg: 102, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 14, y: 40, w: 120, h: 90 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Onda baixa', startup: 8, active: 5, recovery: 18, dmg: 86, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 112, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Cascata', startup: 8, active: 6, recovery: 11, dmg: 98, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -8, y: -10, w: 92, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
      fH: mv({ id: 'fH', name: 'Arrasto da correnteza', startup: 11, active: 5, recovery: 18, dmg: 98, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 20, y: 40, w: 100, h: 80 }, pose: 'charge', move: [{ f: 4, t: 14, vx: 5 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Canto', startup: 12, active: 1, recovery: 20, dmg: 60, hitstun: 16, blockstun: 10, kb: 3, chip: 5, lag: 110, lagText: 'ENCANTADO!', pose: 'cast', projectile: { kind: 'note', vx: 6, vy: 0, w: 52, h: 52, y: 90, life: 84 }, sfx: 'taunt' }),
      dS: mv({ id: 'dS', name: 'Abraço do rio', startup: 9, active: 5, recovery: 26, dmg: 140, steal: 0.4, throw: { range: 80, hold: 22, vx: 7, vy: 10, drain: 0.1 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
      aS: mv({ id: 'aS', name: 'Chuva de pérolas', startup: 8, active: 1, recovery: 12, dmg: 52, type: 'high', air: true, hitstun: 15, kb: 3, chip: 5, pose: 'castLow', projectile: { kind: 'rain', vx: 4.6, vy: 5.2, w: 50, h: 44, y: 30, life: 70 }, sfx: 'water' }),
      dH: mv({ id: 'dH', name: 'Onda que leva', startup: 8, active: 6, recovery: 15, dmg: 94, hitstun: 21, blockstun: 12, kb: 7, hitbox: { x: 10, y: 50, w: 100, h: 90 }, pose: 'charge', move: [{ f: 0, t: 13, vx: 7 }], sfx: 'water' }),
      bH: mv({ id: 'bH', name: 'Espelho d’água', startup: 4, active: 16, recovery: 14, dmg: 40, reflect: true, hitstun: 16, blockstun: 10, kb: 4, hitbox: { x: 20, y: 40, w: 90, h: 110 }, pose: 'shield', sfx: 'block' }),
      fS: mv({ id: 'fS', name: 'Beijo d’água', startup: 20, active: 1, recovery: 28, dmg: 0, heal: 50, pose: 'cast', sfx: 'patua' }),
      M: mv({ id: 'M', name: 'Canto da Sereia', super: true, startup: 22, active: 1, recovery: 28, dmg: 62, hitstun: 22, blockstun: 16, kb: 1, chip: 16, launch: 12, pull: 40, pullProj: true, invuln: [0, 22], pose: 'superCast', projectile: { kind: 'siren', vx: 3.4, vy: 0, w: 140, h: 180, y: 0, life: 200, hits: 5, hitInterval: 10 }, sfx: 'super' })
    }
  };

  // ---------------------------------------------------------------- BOTO COR-DE-ROSA — o galã da festa, encanto e dança
  D.boto = {
    id: 'boto', name: 'Boto Cor-de-Rosa', short: 'Boto', alias: 'O Dançarino da Festa', origin: 'Rio Amazonas, PA', style: 'Dança e encanto',
    bio: 'Nas noites de festa junina, o boto sai do rio vestido de branco e de chapéu — para esconder o buraco na cabeça. Dança melhor que qualquer um e some antes do amanhecer. Quem dança com ele não lembra do caminho de volta.',
    quote: 'Quem dança comigo não esquece.', winQuote: 'Foi um prazer. Agora o rio me chama.',
    colors: { skin: '#f0a0b0', torso: '#f7f4ec', arms: '#f7f4ec', legs: '#efece2', shoes: '#c9b48a', accent: '#ff5f93', hair: '#2a1d14' },
    hair: 'panama', prop: null, idle: 'ginga', idleOver: { na: [42, 104], fa: [32, 92], torso: 7 }, body: { height: 1.04, build: 0.95 }, details: ['whiteSuit'], portraitExtra: 28,
    stats: { hp: 1000, speed: 3.4, jumpV: -13.2, weight: 1.0, dashV: 10, airSpeed: 3.4, maxJumps: 1 },
    superName: 'Festa do Boto', superDesc: 'Uma dança arrebatadora, de giros e abraços, que não deixa ninguém sair.',
    ai: { zone: 0.35, air: 0.3, grab: 0.1, rush: 0.5, poke: 0.55 },
    moves: {
      L: mv({ id: 'L', name: 'Tapa de luva', startup: 4, active: 3, recovery: 8, dmg: 48, hitstun: 18, blockstun: 8, kb: 2.5, hitbox: { x: 20, y: 95, w: 60, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Sapateado baixo', startup: 5, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 70, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Passo no ar', startup: 5, active: 5, recovery: 8, dmg: 48, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 66, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Giro de salão', startup: 10, active: 5, recovery: 16, dmg: 106, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 70, w: 112, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Rasteira de dança', startup: 8, active: 4, recovery: 18, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 104, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Mergulho do boto', startup: 8, active: 6, recovery: 11, dmg: 100, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -8, y: -10, w: 92, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
      fH: mv({ id: 'fH', name: 'Abraço apertado', startup: 12, active: 4, recovery: 18, dmg: 108, hitstun: 21, blockstun: 12, kb: 7, armor: [1, 10], hitbox: { x: 10, y: 50, w: 96, h: 90 }, pose: 'charge', move: [{ f: 4, t: 14, vx: 5 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Coração', startup: 11, active: 1, recovery: 20, dmg: 52, hitstun: 16, blockstun: 10, kb: 3, chip: 4, lag: 140, lagText: 'APAIXONADO!', pose: 'cast', projectile: { kind: 'heart', vx: 6.5, vy: 0, w: 46, h: 46, y: 96, life: 80 }, sfx: 'projectile' }),
      dS: mv({ id: 'dS', name: 'Chapa d’água', startup: 13, active: 1, recovery: 20, dmg: 62, launch: 11, hitstun: 20, blockstun: 10, kb: 2, chip: 5, pose: 'trap', trap: { dist: 140, life: 210, w: 78, h: 54, kind: 'puddle' }, sfx: 'water' }),
      aS: mv({ id: 'aS', name: 'Mergulho de amor', startup: 7, active: 10, recovery: 10, dmg: 92, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 80, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
      dH: mv({ id: 'dH', name: 'Valsa', startup: 8, active: 5, recovery: 14, dmg: 98, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 50, w: 104, h: 90 }, pose: 'lunge', move: [{ f: 0, t: 12, vx: 8 }], sfx: 'whooshH' }),
      bH: mv({ id: 'bH', name: 'Some no rio', startup: 4, active: 1, recovery: 10, dmg: 0, invuln: [0, 12], teleport: { back: 130 }, pose: 'backdash', sfx: 'dodge' }),
      fS: mv({ id: 'fS', name: 'Conquista', startup: 8, active: 6, recovery: 14, dmg: 60, hitstun: 18, blockstun: 10, kb: 10, axe: 0.1, chip: 4, hitbox: { x: -10, y: 30, w: 150, h: 130 }, pose: 'shout', fx: 'wave', sfx: 'taunt' }),
      M: mv({ id: 'M', name: 'Festa do Boto', super: true, startup: 14, active: 36, recovery: 20, dmg: 60, hits: 6, hitInterval: 6, launch: 13, hitstun: 22, blockstun: 15, kb: 1.5, chip: 15, invuln: [0, 16], hitbox: { x: 0, y: 30, w: 140, h: 130 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 12 }, { f: 14, t: 50, vx: 2.5 }], sfx: 'super', fx: 'arc' })
    }
  };

  // ---------------------------------------------------------------- LOBISOMEM — garra rápida, bote, revide e fome da lua
  D.lobisomem = {
    id: 'lobisomem', name: 'Lobisomem', alias: 'O Sétimo Filho', origin: 'Sertão de Minas Gerais', style: 'Garra e lua cheia',
    bio: 'Sétimo filho homem seguido, amaldiçoado a virar lobo em noite de lua cheia, de quinta para sexta. Rosna, uiva e corre pelas encruzilhadas procurando o que comer. De dia é um homem bom; de noite, ninguém quer descobrir.',
    quote: 'Tá ouvindo o uivo? Já é tarde.', winQuote: 'A lua cheia nunca mente.',
    colors: { skin: '#6b5a4c', torso: '#5f4f43', arms: '#6b5a4c', legs: '#3a3a46', shoes: '#6b5a4c', accent: '#f2d34a', hair: '#4a3c32' },
    hair: 'none', head: 'wolf', prop: null, idle: 'bounce', idleOver: { torso: 12, na: [50, 100], fa: [40, 90], nl: [6, 4] }, body: { height: 1.12, build: 1.2 }, details: ['fur', 'claws', 'tail'], portraitExtra: 36,
    stats: { hp: 1040, speed: 3.7, jumpV: -13.4, weight: 1.1, dashV: 11, airSpeed: 3.4, maxJumps: 1 },
    superName: 'Noite de Lua Cheia', superDesc: 'A lua enche e o lobo avança numa sequência de garras sem fim.',
    ai: { zone: 0.05, air: 0.3, grab: 0.2, rush: 0.85, poke: 0.3 },
    moves: {
      L: mv({ id: 'L', name: 'Garra rápida', startup: 3, active: 3, recovery: 8, dmg: 52, hitstun: 18, blockstun: 8, kb: 2.5, hitbox: { x: 22, y: 92, w: 70, h: 38 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Pata baixa', startup: 5, active: 3, recovery: 9, dmg: 44, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 76, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Garra no ar', startup: 4, active: 5, recovery: 7, dmg: 52, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 16, w: 72, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Talho triplo', startup: 10, active: 9, recovery: 16, dmg: 40, hits: 3, hitInterval: 4, hitstun: 20, blockstun: 12, kb: 5, hitbox: { x: 10, y: 60, w: 112, h: 90 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Rasteira de lobo', startup: 8, active: 4, recovery: 18, dmg: 94, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 110, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Salto da lua', startup: 8, active: 7, recovery: 10, dmg: 108, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 4, hitbox: { x: -6, y: -4, w: 96, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
      fH: mv({ id: 'fH', name: 'Bote', startup: 11, active: 4, recovery: 17, dmg: 112, hitstun: 21, blockstun: 13, kb: 8, armor: [1, 11], hitbox: { x: 10, y: 50, w: 100, h: 90 }, pose: 'charge', move: [{ f: 4, t: 14, vx: 7 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Uivo', startup: 11, active: 1, recovery: 20, dmg: 62, hitstun: 16, blockstun: 10, kb: 4, chip: 6, lag: 90, lagText: 'ARREPIO!', pose: 'shout', projectile: { kind: 'howl', vx: 7, vy: 0, w: 70, h: 100, y: 40, life: 55 }, sfx: 'taunt' }),
      dS: mv({ id: 'dS', name: 'Mordida', startup: 8, active: 5, recovery: 24, dmg: 150, steal: 0.3, throw: { range: 78, hold: 22, vx: 8, vy: 11, drain: 0.2 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
      aS: mv({ id: 'aS', name: 'Mergulho de presas', startup: 7, active: 10, recovery: 10, dmg: 96, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 84, h: 62 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5.5, vy: 6 }], sfx: 'whooshH' }),
      dH: mv({ id: 'dH', name: 'Carreira de caça', startup: 7, active: 6, recovery: 14, dmg: 102, armor: [0, 8], hitstun: 21, blockstun: 12, kb: 8, hitbox: { x: 8, y: 30, w: 108, h: 100 }, pose: 'gallop', move: [{ f: 0, t: 13, vx: 10.5 }], sfx: 'whooshH' }),
      bH: mv({ id: 'bH', name: 'Postura de lobo', startup: 2, active: 22, recovery: 16, dmg: 0, counter: [2, 22], counterMove: 'bH2', pose: 'shield', sfx: 'armor' }),
      bH2: mv({ id: 'bH2', name: 'Dentada de revide', startup: 3, active: 5, recovery: 14, dmg: 126, launch: 10, hitstun: 24, blockstun: 12, kb: 7, hitbox: { x: 10, y: 60, w: 110, h: 90 }, pose: 'bite', sfx: 'whooshH' }),
      fS: mv({ id: 'fS', name: 'Fome da lua', startup: 16, active: 1, recovery: 24, dmg: 0, axe: 0.14, pose: 'shout', fx: 'wave', sfx: 'taunt' }),
      M: mv({ id: 'M', name: 'Noite de Lua Cheia', super: true, startup: 14, active: 36, recovery: 22, dmg: 56, hits: 7, hitInterval: 5, launch: 14, hitstun: 22, blockstun: 15, kb: 1.5, chip: 16, invuln: [0, 16], dark: true, hitbox: { x: 0, y: 20, w: 130, h: 130 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 13 }, { f: 14, t: 50, vx: 2.5 }], sfx: 'super', fx: 'arc' })
    }
  };

  // ---------------------------------------------------------------- MAPINGUARI — gigante lento, urro, fedor e barriga faminta
  D.mapinguari = {
    id: 'mapinguari', name: 'Mapinguari', alias: 'O Gigante Fedorento', origin: 'Seringal do Acre', style: 'Peso e urro',
    bio: 'Bicho da mata fechada: um gigante peludo de um olho só, cheiro de enxofre e uma boca enorme na barriga. Os seringueiros dizem que o urro dele arrepia e que bala nenhuma o atravessa. Quem foge, foge de costas.',
    quote: 'Sentiu o cheiro? Então já é meu.', winQuote: 'Mais um que não saiu da mata.',
    colors: { skin: '#8a4a30', torso: '#7a3d28', arms: '#7a3d28', legs: '#6a3322', shoes: '#3a2018', accent: '#c8371d', hair: '#5a2a1c' },
    hair: 'none', head: 'cyclops', prop: null, idle: 'stance', idleOver: { torso: 8, na: [40, 96], fa: [30, 86] }, body: { height: 1.22, build: 1.55 }, details: ['fur', 'bellymouth', 'claws'], portraitExtra: 30,
    stats: { hp: 1180, speed: 2.3, jumpV: -11.8, weight: 1.45, dashV: 7.8, airSpeed: 2.2, maxJumps: 1 },
    superName: 'Fúria da Mata', superDesc: 'O gigante perde a paciência: pancadas devastadoras num avanço lento e inexorável.',
    ai: { zone: 0.15, air: 0.05, grab: 0.6, rush: 0.45, poke: 0.35 },
    moves: {
      L: mv({ id: 'L', name: 'Patada', startup: 6, active: 3, recovery: 12, dmg: 62, hitstun: 19, blockstun: 10, kb: 4, hitbox: { x: 26, y: 92, w: 92, h: 48 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Pisão baixo', startup: 7, active: 3, recovery: 12, dmg: 54, type: 'low', crouch: true, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 20, y: 0, w: 96, h: 34 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Garra pesada', startup: 6, active: 5, recovery: 9, dmg: 62, type: 'high', air: true, hitstun: 15, kb: 4, hitbox: { x: 10, y: 14, w: 84, h: 56 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Pancada de gigante', startup: 13, active: 5, recovery: 20, dmg: 138, hitstun: 22, blockstun: 13, kb: 9, hitbox: { x: 20, y: 60, w: 130, h: 100 }, pose: 'overhead', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Rasteira de cauda', startup: 10, active: 5, recovery: 22, dmg: 112, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 5, hitbox: { x: 10, y: 0, w: 130, h: 34 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Queda da montanha', startup: 10, active: 6, recovery: 13, dmg: 126, type: 'high', air: true, knockdown: true, hitstun: 21, kb: 5, hitbox: { x: -10, y: -10, w: 110, h: 92 }, pose: 'slam', sfx: 'whooshH' }),
      fH: mv({ id: 'fH', name: 'Ombrada de bicho', startup: 14, active: 4, recovery: 20, dmg: 130, hitstun: 22, blockstun: 13, kb: 10, armor: [1, 14], hitbox: { x: 10, y: 50, w: 110, h: 110 }, pose: 'charge', move: [{ f: 5, t: 16, vx: 4.5 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Urro', startup: 14, active: 1, recovery: 22, dmg: 74, hitstun: 18, blockstun: 11, kb: 6, chip: 8, pose: 'shout', projectile: { kind: 'roar', vx: 5, vy: 0, w: 90, h: 110, y: 20, life: 70 }, sfx: 'taunt' }),
      dS: mv({ id: 'dS', name: 'Fedor', startup: 14, active: 1, recovery: 20, dmg: 40, hitstun: 44, blockstun: 10, kb: 0, chip: 0, lag: 140, lagText: 'FEDOR!', pose: 'trap', trap: { dist: 130, life: 240, w: 90, h: 70, kind: 'stink' }, sfx: 'whooshH' }),
      aS: mv({ id: 'aS', name: 'Salto de gigante', startup: 9, active: 11, recovery: 12, dmg: 118, type: 'high', air: true, knockdown: true, hitstun: 21, kb: 6, chip: 9, hitbox: { x: 10, y: 0, w: 96, h: 70 }, pose: 'dive', move: [{ f: 0, t: 18, vx: 4, vy: 6 }], sfx: 'whooshH' }),
      dH: mv({ id: 'dH', name: 'Atropelo', startup: 9, active: 6, recovery: 17, dmg: 120, armor: [0, 10], hitstun: 22, blockstun: 13, kb: 9, hitbox: { x: 8, y: 30, w: 118, h: 110 }, pose: 'charge', move: [{ f: 0, t: 14, vx: 7 }], sfx: 'whooshH' }),
      bH: mv({ id: 'bH', name: 'Bafo da barriga', startup: 3, active: 22, recovery: 18, dmg: 0, counter: [3, 24], counterMove: 'bH2', pose: 'shield', sfx: 'armor' }),
      bH2: mv({ id: 'bH2', name: 'Mordida da barriga', startup: 4, active: 5, recovery: 16, dmg: 140, steal: 0.4, launch: 9, hitstun: 24, blockstun: 13, kb: 6, hitbox: { x: 10, y: 40, w: 110, h: 100 }, pose: 'bite', sfx: 'whooshH' }),
      fS: mv({ id: 'fS', name: 'Barriga faminta', startup: 10, active: 5, recovery: 28, dmg: 160, steal: 0.5, throw: { range: 92, hold: 26, vx: 6, vy: 10, drain: 0.25 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
      M: mv({ id: 'M', name: 'Fúria da Mata', super: true, startup: 18, active: 36, recovery: 26, dmg: 70, hits: 5, hitInterval: 7, launch: 15, hitstun: 24, blockstun: 16, kb: 1.5, chip: 18, invuln: [0, 18], dark: true, hitbox: { x: 0, y: 10, w: 150, h: 150 }, pose: 'superRush', move: [{ f: 6, t: 16, vx: 10 }, { f: 16, t: 54, vx: 2.2 }], sfx: 'super', fx: 'arc' })
    }
  };

  // ---------------------------------------------------------------- CUCA — poções, caldeirão, feitiço de sapo
  D.cuca = {
    id: 'cuca', name: 'Cuca', alias: 'A Bruxa do Sítio', origin: 'Sítio do Picapau Amarelo, SP', style: 'Poção e feitiço',
    bio: 'Bruxa com cabeça de jacaré que vive de poções, caldeirões e feitiços — e de cantar cantiga de ninar pra criança que não dorme. Já virou muita gente em sapo. Quando perde, jura vingança. Quando ganha, ri alto.',
    quote: 'Dorme, neném, que a Cuca vem pegar!', winQuote: 'Hehehe! Mais um pro caldeirão.',
    colors: { skin: '#5f8f46', torso: '#6a2a8c', arms: '#5f8f46', legs: '#4a1f66', shoes: '#2a1a22', accent: '#c8e04a', hair: '#e8d98a' },
    hair: 'none', head: 'croc', prop: 'potion', idle: 'sway', idleOver: { torso: 8, na: [44, 100], fa: [30, 88] }, body: { height: 1.02, build: 0.92 }, details: ['robe'], portraitExtra: 46,
    stats: { hp: 920, speed: 2.9, jumpV: -12.6, weight: 0.9, dashV: 8.6, airSpeed: 2.8, maxJumps: 1 },
    superName: 'Caldeirão do Sítio', superDesc: 'Uma nuvem de poção fervente que queima e prende quem entra.',
    ai: { zone: 0.65, air: 0.2, grab: 0.1, rush: 0.25, poke: 0.65 },
    moves: {
      L: mv({ id: 'L', name: 'Varada', startup: 5, active: 3, recovery: 10, dmg: 46, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 24, y: 92, w: 78, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Chute de bota', startup: 6, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 18, y: 0, w: 78, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Joelhada de bruxa', startup: 5, active: 5, recovery: 8, dmg: 48, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 68, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Vassourada', startup: 11, active: 5, recovery: 18, dmg: 108, hitstun: 20, blockstun: 12, kb: 7, hitbox: { x: 22, y: 60, w: 130, h: 80 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Rasteira de saia', startup: 9, active: 4, recovery: 20, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 12, y: 0, w: 120, h: 28 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Mergulho de vassoura', startup: 8, active: 6, recovery: 11, dmg: 100, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -8, y: -10, w: 94, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
      fH: mv({ id: 'fH', name: 'Bote de jacaré', startup: 12, active: 4, recovery: 18, dmg: 110, hitstun: 21, blockstun: 12, kb: 6, hitbox: { x: 20, y: 70, w: 92, h: 70 }, pose: 'bite', move: [{ f: 5, t: 15, vx: 4 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Poção', startup: 11, active: 1, recovery: 20, dmg: 74, hitstun: 16, blockstun: 10, kb: 4, chip: 7, lag: 100, lagText: 'ENVENENADO!', pose: 'cast', projectile: { kind: 'potion', vx: 6.5, vy: -3.5, w: 52, h: 52, y: 100, life: 70, gravity: 0.12 }, sfx: 'projectile' }),
      dS: mv({ id: 'dS', name: 'Caldeirão', startup: 13, active: 1, recovery: 20, dmg: 66, burn: true, launch: 12, hitstun: 20, blockstun: 10, kb: 2, chip: 6, pose: 'trap', trap: { dist: 150, life: 220, w: 76, h: 62, kind: 'cauldron' }, sfx: 'fire' }),
      aS: mv({ id: 'aS', name: 'Chuva de poção', startup: 8, active: 1, recovery: 12, dmg: 56, type: 'high', air: true, hitstun: 15, kb: 3, chip: 5, pose: 'castLow', projectile: { kind: 'potion', vx: 4.5, vy: 5.5, w: 48, h: 48, y: 30, life: 70 }, sfx: 'whoosh' }),
      dH: mv({ id: 'dH', name: 'Voo de vassoura', startup: 8, active: 5, recovery: 14, dmg: 94, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 60, w: 104, h: 60 }, pose: 'lunge', move: [{ f: 0, t: 12, vx: 10 }], sfx: 'whooshH' }),
      bH: mv({ id: 'bH', name: 'Fumaça e sumiço', startup: 4, active: 1, recovery: 10, dmg: 0, invuln: [0, 12], teleport: { back: 140 }, pose: 'backdash', sfx: 'dodge' }),
      fS: mv({ id: 'fS', name: 'Vira sapo!', startup: 12, active: 1, recovery: 22, dmg: 20, hitstun: 14, blockstun: 8, kb: 1, chip: 0, lag: 160, lagText: 'VIROU SAPO!', pose: 'cast', projectile: { kind: 'spell', vx: 9, vy: 0, w: 40, h: 40, y: 100, life: 60 }, sfx: 'taunt' }),
      M: mv({ id: 'M', name: 'Caldeirão do Sítio', super: true, startup: 20, active: 1, recovery: 28, dmg: 62, burn: true, hitstun: 22, blockstun: 15, kb: 1.5, chip: 14, launch: 12, invuln: [0, 20], pose: 'superCast', projectile: { kind: 'brew', vx: 3.6, vy: 0, w: 160, h: 170, y: 0, life: 200, hits: 6, hitInterval: 8 }, sfx: 'super' })
    }
  };

  // ---------------------------------------------------------------- PISADEIRA — unhas longas, pesadelo e sufoco
  D.pisadeira = {
    id: 'pisadeira', name: 'Pisadeira', alias: 'A Velha do Telhado', origin: 'Telhados do interior de SP', style: 'Pesadelo e aperto',
    bio: 'Velha magra, de unhas compridas e olhos acesos, que pula nos telhados à noite e pisa no peito de quem dorme de barriga cheia. O sono vira pesadelo e o ar vira pedra. Só se livra quem acorda a tempo — e ninguém acorda.',
    quote: 'Dormiu de barriga cheia? Problema seu.', winQuote: 'Pode acordar. Já passou. Por enquanto.',
    colors: { skin: '#a7b3a0', torso: '#d8d2e0', arms: '#a7b3a0', legs: '#cfc8d8', shoes: '#a7b3a0', accent: '#f2d34a', hair: '#e9e6ee' },
    hair: 'wildWhite', prop: null, idle: 'stance', idleOver: { torso: 12, head: 6, na: [34, 98], fa: [24, 88] }, body: { height: 1.2, build: 0.7 }, details: ['gown', 'claws', 'glowEyes'], portraitExtra: 26,
    stats: { hp: 960, speed: 3.0, jumpV: -12.8, weight: 0.85, dashV: 9, airSpeed: 3.0, maxJumps: 1 },
    superName: 'Noite Sem Fim', superDesc: 'O quarto escurece e o peso cai sobre o peito: golpes que sugam a Energia.',
    ai: { zone: 0.3, air: 0.2, grab: 0.45, rush: 0.45, poke: 0.6 },
    moves: {
      L: mv({ id: 'L', name: 'Unha curta', startup: 4, active: 3, recovery: 9, dmg: 46, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 26, y: 96, w: 86, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
      cL: mv({ id: 'cL', name: 'Chute descalço', startup: 5, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 18, y: 0, w: 82, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
      aL: mv({ id: 'aL', name: 'Pisada leve', startup: 5, active: 5, recovery: 8, dmg: 48, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 18, w: 72, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
      H: mv({ id: 'H', name: 'Unhada longa', startup: 10, active: 4, recovery: 17, dmg: 104, drainAxe: 0.04, hitstun: 20, blockstun: 12, kb: 5, hitbox: { x: 22, y: 60, w: 140, h: 80 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
      cH: mv({ id: 'cH', name: 'Arranhão rasteiro', startup: 9, active: 4, recovery: 19, dmg: 88, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 14, y: 0, w: 136, h: 28 }, pose: 'sweep', sfx: 'whooshH' }),
      aH: mv({ id: 'aH', name: 'Pisão do telhado', startup: 8, active: 6, recovery: 11, dmg: 100, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -8, y: -10, w: 100, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
      fH: mv({ id: 'fH', name: 'Pisadeira', startup: 12, active: 4, recovery: 18, dmg: 108, hitstun: 21, blockstun: 12, kb: 6, armor: [1, 11], hitbox: { x: 20, y: 0, w: 96, h: 120 }, pose: 'slam', move: [{ f: 4, t: 14, vx: 4 }], sfx: 'whooshH' }),
      S: mv({ id: 'S', name: 'Pesadelo', startup: 12, active: 1, recovery: 22, dmg: 40, drainAxe: 0.06, hitstun: 16, blockstun: 10, kb: 2, chip: 4, lag: 150, lagText: 'PESADELO!', pose: 'cast', projectile: { kind: 'nightmare', vx: 3.8, vy: 0, w: 76, h: 76, y: 70, life: 100, hits: 2, hitInterval: 14 }, sfx: 'whooshH' }),
      dS: mv({ id: 'dS', name: 'Sufoco', startup: 9, active: 5, recovery: 26, dmg: 140, steal: 0.3, drainAxe: 0.2, throw: { range: 84, hold: 26, vx: 7, vy: 11, drain: 0.2 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
      aS: mv({ id: 'aS', name: 'Voo da coruja', startup: 7, active: 10, recovery: 10, dmg: 92, type: 'high', air: true, knockdown: true, drainAxe: 0.05, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 8, y: -4, w: 86, h: 64 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5.5, vy: 6 }], sfx: 'whooshH' }),
      dH: mv({ id: 'dH', name: 'Passo de sono', startup: 8, active: 5, recovery: 14, dmg: 92, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 20, y: 60, w: 120, h: 50 }, pose: 'lunge', move: [{ f: 0, t: 12, vx: 7 }], sfx: 'whooshH' }),
      bH: mv({ id: 'bH', name: 'Fuga pelo telhado', startup: 3, active: 1, recovery: 12, dmg: 0, invuln: [0, 15], move: [{ f: 0, t: 14, vx: -9.5 }], pose: 'dodge', sfx: 'dodge' }),
      fS: mv({ id: 'fS', name: 'Cochilo', startup: 14, active: 1, recovery: 24, dmg: 20, hitstun: 12, blockstun: 8, kb: 0.5, chip: 0, lag: 200, lagText: 'DORMINDO!', pose: 'cast', projectile: { kind: 'nightmare', vx: 2.6, vy: 0, w: 60, h: 60, y: 76, life: 120 }, sfx: 'taunt' }),
      M: mv({ id: 'M', name: 'Noite Sem Fim', super: true, startup: 14, active: 34, recovery: 22, dmg: 62, hits: 5, hitInterval: 7, launch: 13, drainAxe: 0.1, hitstun: 22, blockstun: 15, kb: 1.5, chip: 15, invuln: [0, 16], dark: true, hitbox: { x: 0, y: 20, w: 140, h: 140 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 11 }, { f: 14, t: 48, vx: 2.5 }], sfx: 'super', fx: 'arc' })
    }
  };

  // ---------------------------------------------------------------- sequências de três golpes (L > L2 > L3) e segundo golpe do especial
  const STRINGS = {
    saci: ['Cutucão duplo', 'jab', 'Peteleco final', 'spinKick'],
    curupira: ['Cabeçada de fogo', 'headbutt', 'Pisão ao contrário', 'spinKick'],
    iara: ['Mão d’água', 'jab', 'Cauda de sereia', 'swing'],
    boto: ['Giro de salão curto', 'swing', 'Mergulho do galã', 'upper'],
    lobisomem: ['Garra de volta', 'swing', 'Mordida da lua', 'headbutt'],
    mapinguari: ['Soco de bicho', 'jab', 'Pancada de gigante curta', 'overhead'],
    cuca: ['Varada da vassoura', 'swing', 'Bote de jacaré curto', 'headbutt'],
    pisadeira: ['Unhada comprida', 'swing', 'Pisão no peito', 'slam']
  };
  const FOLLOW = {
    saci: ['S', 'S2', { name: 'Pulo no redemoinho', startup: 6, active: 5, recovery: 15, dmg: 85, launch: 9, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: 10, y: 40, w: 100, h: 90 }, pose: 'riseKick', move: [{ f: 0, t: 10, vx: 5 }], sfx: 'whooshH' }, true],
    curupira: ['S', 'S2', { name: 'Chama que volta', startup: 7, active: 5, recovery: 16, dmg: 88, burn: true, launch: 9, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: -10, y: 40, w: 120, h: 100 }, pose: 'swing', sfx: 'fire', fx: 'fire' }, true],
    iara: ['S', 'S2', { name: 'Canto agudo', startup: 7, active: 5, recovery: 17, dmg: 80, launch: 9, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: -6, y: 30, w: 150, h: 130 }, pose: 'shout', fx: 'wave', sfx: 'taunt' }, true],
    boto: ['S', 'S2', { name: 'Beijo do boto', startup: 8, active: 5, recovery: 16, dmg: 80, steal: 0.3, hitstun: 20, blockstun: 11, kb: 4, hitbox: { x: 10, y: 60, w: 90, h: 70 }, pose: 'headbutt', sfx: 'whooshH' }, true],
    lobisomem: ['S', 'S2', { name: 'Salto sobre a presa', startup: 8, active: 6, recovery: 16, dmg: 100, knockdown: true, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 0, y: 20, w: 110, h: 100 }, pose: 'airKick', move: [{ f: 0, t: 12, vx: 8 }], sfx: 'whooshH' }, true],
    mapinguari: ['S', 'S2', { name: 'Segundo urro', startup: 10, active: 6, recovery: 20, dmg: 100, launch: 9, hitstun: 22, blockstun: 12, kb: 8, hitbox: { x: -10, y: 30, w: 150, h: 120 }, pose: 'shout', fx: 'wave', sfx: 'taunt' }, true],
    cuca: ['S', 'S2', { name: 'Respingo de caldeirão', startup: 8, active: 5, recovery: 17, dmg: 86, burn: true, launch: 9, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: 10, y: 40, w: 120, h: 100 }, pose: 'swing', sfx: 'fire' }, true],
    pisadeira: ['S', 'S2', { name: 'Unha no peito', startup: 7, active: 5, recovery: 16, dmg: 92, drainAxe: 0.06, hitstun: 20, blockstun: 12, kb: 5, hitbox: { x: 20, y: 60, w: 130, h: 70 }, pose: 'lunge', move: [{ f: 0, t: 10, vx: 6 }], sfx: 'whooshH' }, true]
  };
  M.FOLK2 = { defs: D, strings: STRINGS, follow: FOLLOW, order: ['saci', 'curupira', 'iara', 'boto', 'lobisomem', 'mapinguari', 'cuca', 'pisadeira'] };
})();
