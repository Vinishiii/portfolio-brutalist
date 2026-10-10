'use strict';
// ============================================================
// LUTADORES — dados de cada personagem (stats, visual, golpes)
// Frames a 60fps. Hitbox: x = distância pra frente a partir do
// centro, y = altura da base a partir dos pés, w/h = tamanho.
// type: 'mid' (defende em pé ou agachado), 'low' (só agachado),
// 'high' (só em pé — overhead).
// ============================================================
(function () {
  const mv = (o) => Object.assign({ type: 'mid', kb: 3, hitstun: 14, blockstun: 9, chip: 0 }, o);

  M.FIGHTERS = {
    zeca: {
      id: 'zeca', name: 'Zeca Ventania', alias: 'O Vento da Ladeira', origin: 'Vila Brasa, sertão da BA', style: 'Peia de rua',
      bio: 'Cria da beira do açude, aprendeu a brigar antes de andar. Discípulo do Mestre Cinzas. Entra na Rinha do Fogo pela primeira vez — e tudo que ele quer é que a cidade continue dançando.',
      quote: 'A rinha escuta quem escuta a rinha.', winQuote: 'Ôxe, essa rinha é minha.',
      colors: { skin: '#b5744a', torso: '#f2c230', arms: '#b5744a', legs: '#f6efdc', shoes: '#141210', accent: '#1f7a4d', hair: '#141210' },
      hair: 'short', prop: null, idle: 'ginga', body: { height: 1.0, build: 0.95 }, details: ['headband', 'stripe', 'necklace'],
      stats: { hp: 1000, speed: 3.3, jumpV: -13.2, weight: 1.0, dashV: 10, airSpeed: 3.4, maxJumps: 1 },
      superName: 'Vendaval do Sertão', superDesc: 'Giro devastador que avança e levanta o oponente.',
      ai: { zone: 0.05, air: 0.3, grab: 0, rush: 0.6, poke: 0.4 },
      moves: {
        L: mv({ id: 'L', name: 'Tapa de galope', startup: 4, active: 3, recovery: 8, dmg: 50, hitstun: 18, blockstun: 8, kb: 2.5, hitbox: { x: 20, y: 95, w: 60, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pisão baixo', startup: 5, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 70, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Chapa voadora', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 66, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Coice de jumento', startup: 10, active: 5, recovery: 16, dmg: 110, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 70, w: 110, h: 80 }, pose: 'spinKick', spin: [0, 0], cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Rasteira de vaqueiro', startup: 8, active: 4, recovery: 18, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 100, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Voadora de poeira', startup: 7, active: 6, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 5, hitbox: { x: 0, y: 10, w: 90, h: 80 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Cabeçada', startup: 11, active: 4, recovery: 17, dmg: 100, type: 'high', hitstun: 18, blockstun: 12, kb: 5, hitbox: { x: 20, y: 90, w: 60, h: 50 }, pose: 'headbutt', move: [{ f: 4, t: 14, vx: 6 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Rodopio de poeira', startup: 9, active: 7, recovery: 16, dmg: 120, launch: 11, hitstun: 22, blockstun: 13, kb: 5, chip: 12, hitbox: { x: 0, y: 40, w: 100, h: 110 }, pose: 'superSpin', spin: [0, 360], move: [{ f: 2, t: 16, vx: 7.5 }], sfx: 'whooshH', fx: 'arc' }),
        dS: mv({ id: 'dS', name: 'Pulo do bode', startup: 5, active: 7, recovery: 20, dmg: 100, launch: 13, hitstun: 22, blockstun: 12, kb: 3, chip: 10, invuln: [0, 9], hitbox: { x: -10, y: 60, w: 80, h: 120 }, pose: 'riseKick', sfx: 'whooshH' }),
        aS: mv({ id: 'aS', name: 'Tesoura', startup: 6, active: 10, recovery: 10, dmg: 90, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 80, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
        dH: mv({ id: 'dH', name: 'Rabo de arraia corrido', startup: 7, active: 5, recovery: 14, dmg: 95, hitstun: 20, blockstun: 12, kb: 7, hitbox: { x: 10, y: 50, w: 110, h: 90 }, pose: 'spinKick', move: [{ f: 0, t: 10, vx: 6 }], sfx: 'whooshH', fx: 'arc' }),
        bH: mv({ id: 'bH', name: 'Negativa', startup: 6, active: 6, recovery: 14, dmg: 85, type: 'low', launch: 10, hitstun: 20, blockstun: 11, kb: 4, invuln: [0, 9], crouch: true, hitbox: { x: 10, y: 0, w: 95, h: 60 }, pose: 'negativa', sfx: 'whooshH' }),
        fS: mv({ id: 'fS', name: 'Rolê', startup: 10, active: 4, recovery: 12, dmg: 75, hitstun: 19, blockstun: 11, kb: 5, invuln: [0, 11], teleport: { behind: true, dist: 78 }, hitbox: { x: 10, y: 60, w: 76, h: 70 }, pose: 'jab', sfx: 'dodge' }),
        M: mv({ id: 'M', name: 'Vendaval do Sertão', super: true, startup: 14, active: 30, recovery: 22, dmg: 95, hits: 4, hitInterval: 7, launch: 14, hitstun: 24, blockstun: 16, kb: 1.5, chip: 20, invuln: [0, 16], hitbox: { x: -20, y: 20, w: 130, h: 140 }, pose: 'superSpin', spin: [0, 1080], move: [{ f: 14, t: 44, vx: 5 }], sfx: 'super', fx: 'arc' })
      }
    },

    bia: {
      id: 'bia', name: 'Bia Sombrinha', alias: 'A Dona da Ladeira', origin: 'Campina Grande, PB', style: 'Forró de combate',
      bio: 'Passista desde criança, transformou o passo do frevo em arte marcial. A sombrinha abre, fecha e corta. Ninguém pisa na ladeira dela sem pedir licença.',
      quote: 'Pisa certo ou cai, meu bem.', winQuote: 'Pisou errado, meu bem.',
      colors: { skin: '#8d5a3a', torso: '#c7267a', arms: '#8d5a3a', legs: '#2aa9b8', shoes: '#f2b70c', accent: '#f2b70c', hair: '#1a0f0a' },
      hair: 'curly', prop: 'umbrella', idle: 'bounce', body: { height: 0.92, build: 0.82 }, details: ['sleeves', 'earrings'],
      stats: { hp: 900, speed: 3.6, jumpV: -14.2, weight: 0.85, dashV: 11, airSpeed: 4.2, maxJumps: 2 },
      superName: 'Bloco da Madrugada', superDesc: 'Avança no passo e desfere uma chuva de sombrinhadas.',
      ai: { zone: 0.05, air: 0.6, grab: 0, rush: 0.7, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Toque de ponta', startup: 4, active: 3, recovery: 9, dmg: 45, hitstun: 18, blockstun: 8, kb: 2.5, hitbox: { x: 25, y: 90, w: 80, h: 30 }, pose: 'lunge', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pontinha', startup: 3, active: 3, recovery: 8, dmg: 36, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 66, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Beliscão', startup: 4, active: 5, recovery: 7, dmg: 45, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Tesoura de forró', startup: 8, active: 5, recovery: 15, dmg: 100, hitstun: 19, blockstun: 11, kb: 5, hitbox: { x: 10, y: 60, w: 100, h: 90 }, pose: 'spinKick', move: [{ f: 2, t: 9, vx: 4 }], cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Sombrinha aberta', startup: 6, active: 7, recovery: 16, dmg: 90, launch: 12, crouch: true, hitstun: 20, blockstun: 11, kb: 3, invuln: [2, 9], hitbox: { x: -20, y: 70, w: 90, h: 120 }, pose: 'upper', umbrellaOpen: true, sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Parafuso', startup: 7, active: 7, recovery: 9, dmg: 95, type: 'high', air: true, hitstun: 18, kb: 5, hitbox: { x: -10, y: 10, w: 100, h: 80 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Arrasta-pé', startup: 9, active: 7, recovery: 16, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 19, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 90, h: 36 }, pose: 'sweep', move: [{ f: 4, t: 14, vx: 7 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Passo de xaxado', startup: 7, active: 7, recovery: 14, dmg: 100, hitstun: 20, blockstun: 12, kb: 7, chip: 10, hitbox: { x: 20, y: 50, w: 90, h: 70 }, pose: 'airKick', move: [{ f: 2, t: 12, vx: 11 }], sfx: 'whooshH' }),
        dS: mv({ id: 'dS', name: 'Sombrinha pião', startup: 6, active: 20, recovery: 14, dmg: 35, hits: 3, hitInterval: 7, hitstun: 12, blockstun: 8, kb: 1.5, chip: 4, reflect: true, hitbox: { x: 0, y: 40, w: 100, h: 110 }, pose: 'shield', umbrellaOpen: true, sfx: 'whoosh', fx: 'arc' }),
        aS: mv({ id: 'aS', name: 'Paraquedas', startup: 5, active: 24, recovery: 6, dmg: 60, type: 'high', air: true, hitstun: 16, kb: 3, chip: 6, glide: true, hitbox: { x: -10, y: -10, w: 80, h: 70 }, pose: 'glide', umbrellaOpen: true, sfx: 'whoosh' }),
        dH: mv({ id: 'dH', name: 'Passo voador', startup: 6, active: 6, recovery: 12, dmg: 90, launch: 10, hitstun: 20, blockstun: 11, kb: 4, hitbox: { x: 10, y: 40, w: 100, h: 90 }, pose: 'airKick', move: [{ f: 0, t: 11, vx: 8 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Sombrinha bumerangue', startup: 9, active: 1, recovery: 18, dmg: 60, hitstun: 16, blockstun: 10, kb: 4, chip: 5, pose: 'cast', projectile: { kind: 'boomerang', vx: 8, vy: 0, w: 52, h: 42, y: 70, life: 84, hits: 2, hitInterval: 18 }, sfx: 'whoosh' }),
        fS: mv({ id: 'fS', name: 'Passo relâmpago', startup: 8, active: 4, recovery: 12, dmg: 80, hitstun: 19, blockstun: 11, kb: 6, invuln: [0, 9], teleport: { behind: true, dist: 84 }, hitbox: { x: 10, y: 50, w: 80, h: 80 }, pose: 'airKick', sfx: 'dash' }),
        M: mv({ id: 'M', name: 'Bloco da Madrugada', super: true, startup: 12, active: 34, recovery: 20, dmg: 52, hits: 8, hitInterval: 4, launch: 13, hitstun: 20, blockstun: 14, kb: 1, chip: 12, invuln: [0, 14], hitbox: { x: 0, y: 30, w: 120, h: 120 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 14 }, { f: 14, t: 46, vx: 2.5 }], sfx: 'super', fx: 'arc' })
      }
    },

    mare: {
      id: 'mare', name: 'Maré Bacuri', alias: 'A Correnteza', origin: 'Beira do Velho Chico, BA', style: 'Remo & rede',
      bio: 'Filha de pescadores do São Francisco. O remo é extensão do braço e o rio obedece quando ela chama. Lenta pra se mover, impossível de alcançar.',
      quote: 'O rio não tem pressa. Eu também não.', winQuote: 'O rio não tem pressa. Eu disse.',
      colors: { skin: '#9b6a44', torso: '#1f7a4d', arms: '#9b6a44', legs: '#1c4e9c', shoes: '#141210', accent: '#c8371d', hair: '#120c08' },
      hair: 'braid', prop: 'oar', idle: 'stance', idleOver: { na: [75, 15], fa: [25, 70], torso: 10 }, details: ['paint', 'necklace'], body: { height: 1.07, build: 0.9 },
      stats: { hp: 950, speed: 2.7, jumpV: -12.6, weight: 1.0, dashV: 8.5, airSpeed: 2.8, maxJumps: 1 },
      superName: 'Pororoca', superDesc: 'Invoca uma onda gigante que atravessa a rinha inteira.',
      ai: { zone: 0.65, air: 0.1, grab: 0, rush: 0.2, poke: 0.6 },
      moves: {
        L: mv({ id: 'L', name: 'Remada curta', startup: 6, active: 3, recovery: 11, dmg: 52, hitstun: 18, blockstun: 9, kb: 5, hitbox: { x: 34, y: 90, w: 112, h: 30 }, pose: 'lunge', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Remo baixo', startup: 6, active: 3, recovery: 11, dmg: 45, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 20, y: 0, w: 90, h: 30 }, pose: 'castLow', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Remada aérea', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 20, w: 90, h: 50 }, pose: 'lunge', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Remada', startup: 11, active: 4, recovery: 18, dmg: 115, hitstun: 20, blockstun: 13, kb: 8, hitbox: { x: 20, y: 60, w: 120, h: 90 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH' }),
        cH: mv({ id: 'cH', name: 'Remo rasteiro', startup: 9, active: 4, recovery: 20, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 125, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Mergulho', startup: 8, active: 5, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: 0, y: -10, w: 90, h: 90 }, pose: 'overhead', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Rede de arrasto', startup: 13, active: 3, recovery: 20, dmg: 100, type: 'high', hitstun: 30, blockstun: 12, kb: 1, hitbox: { x: 20, y: 70, w: 100, h: 90 }, pose: 'overhead', sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Onda do rio', startup: 12, active: 1, recovery: 22, dmg: 80, hitstun: 16, blockstun: 11, kb: 4, chip: 8, pose: 'cast', projectile: { kind: 'wave', vx: 7, vy: 0, w: 60, h: 70, y: 40, life: 95 }, sfx: 'water' }),
        dS: mv({ id: 'dS', name: 'Marola', startup: 14, active: 1, recovery: 24, dmg: 70, type: 'low', crouch: true, knockdown: true, hitstun: 18, blockstun: 10, kb: 3, chip: 7, pose: 'castLow', projectile: { kind: 'ripple', vx: 4.2, vy: 0, w: 60, h: 30, y: 0, life: 130 }, sfx: 'water' }),
        aS: mv({ id: 'aS', name: 'Chuva', startup: 10, active: 1, recovery: 14, dmg: 70, type: 'high', air: true, hitstun: 15, kb: 3, chip: 6, pose: 'castLow', projectile: { kind: 'rain', vx: 5, vy: 5.5, w: 46, h: 46, y: 30, life: 80 }, sfx: 'water' }),
        dH: mv({ id: 'dH', name: 'Remo de investida', startup: 8, active: 4, recovery: 16, dmg: 100, hitstun: 20, blockstun: 12, kb: 9, hitbox: { x: 20, y: 60, w: 130, h: 80 }, pose: 'lunge', move: [{ f: 0, t: 12, vx: 6 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Rede de pesca', startup: 12, active: 1, recovery: 22, dmg: 40, hitstun: 46, blockstun: 10, kb: 0, chip: 4, pose: 'overhead', projectile: { kind: 'net', vx: 5.5, vy: -3.5, w: 72, h: 52, y: 90, life: 90, gravity: 0.16 }, sfx: 'whooshH' }),
        fS: mv({ id: 'fS', name: 'Maré alta', startup: 14, active: 1, recovery: 24, dmg: 42, hitstun: 18, blockstun: 10, kb: 7, chip: 5, pose: 'superCast', projectile: { kind: 'tide', vx: 1.6, vy: 0, w: 64, h: 160, y: 0, life: 170, hits: 3, hitInterval: 22 }, sfx: 'water' }),
        M: mv({ id: 'M', name: 'Pororoca', super: true, startup: 22, active: 1, recovery: 28, dmg: 115, hitstun: 22, blockstun: 16, kb: 2, chip: 20, launch: 12, invuln: [0, 22], pose: 'superCast', projectile: { kind: 'pororoca', vx: 4.5, vy: 0, w: 140, h: 190, y: 0, life: 220, hits: 3, hitInterval: 10 }, sfx: 'super' })
      }
    },

    tiao: {
      id: 'tiao', name: 'Tião Sertão', alias: 'O Touro de Couro', origin: 'Serra do Vento, CE', style: 'Vaquejada de rua',
      bio: 'Vaqueiro de três gerações. Derruba boi no braço e gente no abraço. Não arreda, não corre e não desiste. Quando pega, não solta.',
      quote: 'Lá no sertão a gente não arreda. A gente agarra.', winQuote: 'Peguei e não larguei, cabra.',
      colors: { skin: '#8a5a3c', torso: '#6b3f22', arms: '#d9b382', legs: '#3a2a1e', shoes: '#141210', accent: '#c8371d', hair: '#2a1a10' },
      hair: 'hat', prop: null, idle: 'stance', idleOver: { na: [45, 115], fa: [35, 105], torso: 10 }, details: ['vest', 'buckle', 'boots'], body: { height: 1.12, build: 1.4 }, mustache: true,
      stats: { hp: 1150, speed: 2.5, jumpV: -11.6, weight: 1.35, dashV: 8, airSpeed: 2.4, maxJumps: 1 },
      superName: 'Vaquejada', superDesc: 'Arranca em disparada com armadura e derruba quem estiver na frente.',
      ai: { zone: 0, air: 0.15, grab: 0.5, rush: 0.7, poke: 0.3 },
      moves: {
        L: mv({ id: 'L', name: 'Soco de ferreiro', startup: 7, active: 3, recovery: 11, dmg: 68, armor: [1, 5], hitstun: 18, blockstun: 9, kb: 4.5, hitbox: { x: 20, y: 95, w: 70, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Bota baixa', startup: 6, active: 3, recovery: 11, dmg: 50, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2.5, hitbox: { x: 16, y: 0, w: 72, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Cotovelada', startup: 6, active: 5, recovery: 9, dmg: 60, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Chifrada', startup: 11, active: 4, recovery: 18, dmg: 130, hitstun: 21, blockstun: 13, kb: 7, hitbox: { x: 20, y: 80, w: 80, h: 60 }, pose: 'headbutt', move: [{ f: 4, t: 14, vx: 5 }], cancel: ['S'], sfx: 'whooshH' }),
        cH: mv({ id: 'cH', name: 'Pisão de bota', startup: 9, active: 4, recovery: 22, dmg: 100, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 100, h: 34 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Peso morto', startup: 9, active: 7, recovery: 12, dmg: 120, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 4, hitbox: { x: -10, y: -10, w: 90, h: 80 }, pose: 'slam', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Golpe de peito', startup: 14, active: 4, recovery: 20, dmg: 120, hitstun: 22, blockstun: 14, kb: 9, armor: [1, 14], hitbox: { x: 10, y: 60, w: 90, h: 90 }, pose: 'charge', move: [{ f: 6, t: 16, vx: 4 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Laço de boi', startup: 7, active: 5, recovery: 26, dmg: 180, throw: { range: 78, hold: 22, vx: 10, vy: 11 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
        dS: mv({ id: 'dS', name: 'Aboio', startup: 10, active: 8, recovery: 20, dmg: 60, hitstun: 16, blockstun: 10, kb: 10, chip: 5, axe: 0.08, hitbox: { x: -20, y: 40, w: 140, h: 120 }, pose: 'shout', sfx: 'taunt', fx: 'wave' }),
        aS: mv({ id: 'aS', name: 'Queda da serra', startup: 8, active: 10, recovery: 14, dmg: 110, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 10, hitbox: { x: 0, y: -10, w: 90, h: 80 }, pose: 'slam', move: [{ f: 0, t: 18, vx: 3, vy: 7 }], sfx: 'whooshH' }),
        dH: mv({ id: 'dH', name: 'Pisão de boi', startup: 9, active: 4, recovery: 16, dmg: 115, type: 'low', knockdown: true, crouch: true, hitstun: 20, blockstun: 12, kb: 5, hitbox: { x: 10, y: 0, w: 110, h: 34 }, pose: 'sweep', move: [{ f: 0, t: 12, vx: 5 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Peito de aço', startup: 2, active: 20, recovery: 16, dmg: 0, counter: [2, 22], counterMove: 'bH2', pose: 'charge', sfx: 'armor' }),
        bH2: mv({ id: 'bH2', name: 'Chifrada de resposta', startup: 3, active: 5, recovery: 14, dmg: 150, launch: 12, hitstun: 24, blockstun: 12, kb: 8, hitbox: { x: 10, y: 60, w: 100, h: 90 }, pose: 'headbutt', sfx: 'whooshH' }),
        fS: mv({ id: 'fS', name: 'Correria do boi', startup: 6, active: 20, recovery: 22, dmg: 160, throw: { range: 72, hold: 18, vx: 9, vy: 12 }, armor: [0, 22], move: [{ f: 0, t: 26, vx: 7 }], hitstun: 20, pose: 'tackle', sfx: 'grab' }),
        M: mv({ id: 'M', name: 'Vaquejada', super: true, startup: 10, active: 34, recovery: 26, dmg: 330, launch: 17, hitstun: 30, blockstun: 18, kb: 6, chip: 35, armor: [0, 44], hitbox: { x: 10, y: 30, w: 100, h: 120 }, pose: 'tackle', move: [{ f: 8, t: 44, vx: 9 }], sfx: 'super' })
      }
    },

    juvenal: {
      id: 'juvenal', name: 'Juvenal Boitatá', alias: 'O Guardião da Chama', origin: 'Caatinga de Canudos, BA', style: 'Fogo da caatinga',
      bio: 'Dizem que nasceu numa queimada da caatinga e o fogo ficou. Carrega a serpente de luz nas costas e é o único que sabe o que o Mestre pretende fazer com a Brasa.',
      quote: 'Eu sou o fogo que ele quer apagar.', winQuote: 'O fogo não pede licença.',
      colors: { skin: '#5a3a28', torso: '#c8371d', arms: '#5a3a28', legs: '#e8712b', shoes: '#141210', accent: '#f2b70c', hair: '#f2b70c' },
      hair: 'flame', prop: 'fire', idle: 'sway', body: { height: 1.05, build: 0.9 }, details: ['tattoo', 'glowEyes'],
      stats: { hp: 1000, speed: 2.9, jumpV: -12.8, weight: 1.0, dashV: 9, airSpeed: 3.0, maxJumps: 1 },
      superName: 'Boitatá Desperto', superDesc: 'A serpente de fogo atravessa a rinha queimando tudo.',
      ai: { zone: 0.45, air: 0.15, grab: 0, rush: 0.35, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Chama curta', startup: 5, active: 3, recovery: 10, dmg: 55, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 20, y: 95, w: 70, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Brasa baixa', startup: 6, active: 3, recovery: 11, dmg: 45, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 72, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Labareda aérea', startup: 5, active: 5, recovery: 8, dmg: 55, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Rabo de fogo', startup: 9, active: 5, recovery: 16, dmg: 100, burn: true, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 60, w: 110, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Labareda', startup: 7, active: 6, recovery: 18, dmg: 100, launch: 12, crouch: true, hitstun: 20, blockstun: 11, kb: 3, invuln: [2, 8], hitbox: { x: -10, y: 60, w: 80, h: 120 }, pose: 'upper', sfx: 'fire', fx: 'fire' }),
        aH: mv({ id: 'aH', name: 'Queda de brasa', startup: 8, active: 5, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: 0, y: -10, w: 90, h: 80 }, pose: 'overhead', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Bote', startup: 12, active: 4, recovery: 18, dmg: 110, type: 'high', hitstun: 20, blockstun: 12, kb: 5, burn: true, hitbox: { x: 20, y: 70, w: 80, h: 70 }, pose: 'bite', move: [{ f: 4, t: 14, vx: 8 }], sfx: 'fire' }),
        S: mv({ id: 'S', name: 'Cuspe de brasa', startup: 10, active: 1, recovery: 18, dmg: 75, hitstun: 15, blockstun: 10, kb: 4, chip: 7, burn: true, pose: 'cast', projectile: { kind: 'ember', vx: 9.5, vy: 0, w: 44, h: 44, y: 70, life: 48 }, sfx: 'fire' }),
        dS: mv({ id: 'dS', name: 'Fogo-fátuo', startup: 12, active: 1, recovery: 20, dmg: 60, launch: 11, hitstun: 20, blockstun: 10, kb: 2, chip: 5, pose: 'trap', trap: { dist: 170, life: 200, w: 70, h: 60 }, sfx: 'fire' }),
        aS: mv({ id: 'aS', name: 'Chuva de brasa', startup: 10, active: 1, recovery: 14, dmg: 70, type: 'high', air: true, hitstun: 15, kb: 3, chip: 6, burn: true, pose: 'castLow', projectile: { kind: 'ember', vx: 5, vy: 6, w: 40, h: 40, y: 30, life: 80 }, sfx: 'fire' }),
        dH: mv({ id: 'dH', name: 'Bote rasteiro', startup: 7, active: 5, recovery: 14, dmg: 95, burn: true, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 20, y: 40, w: 100, h: 80 }, pose: 'bite', move: [{ f: 0, t: 12, vx: 7 }], sfx: 'fire' }),
        bH: mv({ id: 'bH', name: 'Serpente de chão', startup: 11, active: 1, recovery: 20, dmg: 80, hitstun: 18, blockstun: 11, kb: 4, chip: 7, burn: true, pose: 'castLow', projectile: { kind: 'snake', vx: 6, vy: 0, w: 52, h: 40, y: 8, life: 95, rise: 22 }, sfx: 'fire' }),
        fS: mv({ id: 'fS', name: 'Rastro de brasa', startup: 4, active: 16, recovery: 14, dmg: 55, launch: 9, hitstun: 18, blockstun: 10, kb: 3, chip: 4, move: [{ f: 0, t: 20, vx: 9 }], trap: { dist: 0, life: 150, w: 52, h: 60 }, trail: { count: 3, spacing: 58 }, pose: 'dash', sfx: 'fire' }),
        M: mv({ id: 'M', name: 'Boitatá Desperto', super: true, startup: 24, active: 1, recovery: 30, dmg: 120, hitstun: 22, blockstun: 16, kb: 2, chip: 20, launch: 12, burn: true, invuln: [0, 24], pose: 'superCast', projectile: { kind: 'serpent', vx: 6, vy: 0, w: 150, h: 180, y: 0, life: 200, hits: 3, hitInterval: 9 }, sfx: 'super' })
      }
    },

    bene: {
      id: 'bene', name: 'Bené Sanfona', alias: 'O Forrozeiro da Rinha', origin: 'Caruaru, PE', style: 'Baião de combate',
      bio: 'Sanfoneiro e lutador de Caruaru. Foi o Mestre Cinzas quem lhe ensinou a lutar, e foi ele quem ensinou o Mestre a escutar. O fole marca o compasso da rinha — e quebra guarda. Todo golpe tem hora certa, e Bené sempre sabe qual é.',
      quote: 'Golpe fora do baião é só barulho.', winQuote: 'Isso é que é baião!',
      colors: { skin: '#6b4a30', torso: '#fff8e8', arms: '#6b4a30', legs: '#1c4e9c', shoes: '#fff8e8', accent: '#f2b70c', hair: '#141210' },
      hair: 'cap', prop: 'sanfona', idle: 'bounce', idleOver: { na: [38, 110], fa: [30, 105] }, body: { height: 1.02, build: 0.98 }, details: ['necklace', 'stripe', 'kerchief', 'suspenders'],
      stats: { hp: 1030, speed: 3.2, jumpV: -13, weight: 0.95, dashV: 9.8, airSpeed: 3.2, maxJumps: 1 },
      superName: 'Baião de Dois', superDesc: 'Acelera o fole: uma sequência em que todo golpe cai no compasso.',
      ai: { zone: 0.1, air: 0.25, grab: 0.1, rush: 0.65, poke: 0.6 },
      moves: {
        L: mv({ id: 'L', name: 'Tapa de fole', startup: 4, active: 8, recovery: 8, dmg: 32, hits: 2, hitInterval: 4, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 24, y: 85, w: 86, h: 36 }, pose: 'lunge', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pisada de forró', startup: 6, active: 3, recovery: 11, dmg: 42, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 20, y: 0, w: 95, h: 30 }, pose: 'castLow', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Chapa de frente', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Sanfonada', startup: 8, active: 4, recovery: 13, dmg: 108, hitstun: 20, blockstun: 12, kb: 7, hitbox: { x: 16, y: 60, w: 116, h: 90 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH' }),
        cH: mv({ id: 'cH', name: 'Rasteira de xaxado', startup: 8, active: 4, recovery: 19, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 125, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Queda de fole', startup: 8, active: 5, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: 0, y: -10, w: 100, h: 90 }, pose: 'overhead', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Baixo do fole', startup: 10, active: 3, recovery: 14, dmg: 100, type: 'high', hitstun: 28, blockstun: 12, kb: 2, hitbox: { x: 20, y: 70, w: 110, h: 90 }, pose: 'overhead', sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Toque de Baião', startup: 6, active: 1, recovery: 14, dmg: 0, pose: 'play', buff: 300, axe: 0.05, sfx: 'taunt' }),
        dS: mv({ id: 'dS', name: 'Meia-lua pulada', startup: 6, active: 7, recovery: 20, dmg: 100, launch: 12, hitstun: 22, blockstun: 12, kb: 3, chip: 10, invuln: [0, 8], hitbox: { x: -10, y: 60, w: 90, h: 120 }, pose: 'riseKick', sfx: 'whooshH' }),
        aS: mv({ id: 'aS', name: 'Tesoura', startup: 6, active: 10, recovery: 10, dmg: 90, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 90, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
        dH: mv({ id: 'dH', name: 'Arrasta-pé corrido', startup: 7, active: 6, recovery: 14, dmg: 90, type: 'low', knockdown: true, crouch: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 110, h: 34 }, pose: 'sweep', move: [{ f: 0, t: 13, vx: 8 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Acorde', startup: 8, active: 6, recovery: 14, dmg: 70, hitstun: 18, blockstun: 10, kb: 13, chip: 6, axe: 0.06, hitbox: { x: -10, y: 30, w: 150, h: 130 }, pose: 'play', fx: 'wave', sfx: 'taunt' }),
        fS: mv({ id: 'fS', name: 'Fole aberto', startup: 8, active: 24, recovery: 16, dmg: 30, hits: 4, hitInterval: 6, launch: 9, hitstun: 14, blockstun: 9, kb: 1.5, chip: 4, hitbox: { x: 10, y: 50, w: 100, h: 90 }, pose: 'swing', sfx: 'whooshH' }),
        M: mv({ id: 'M', name: 'Baião de Dois', super: true, startup: 14, active: 36, recovery: 20, dmg: 62, hits: 6, hitInterval: 6, launch: 13, hitstun: 22, blockstun: 15, kb: 1.5, chip: 15, onBeatAlways: true, invuln: [0, 16], hitbox: { x: 0, y: 30, w: 140, h: 130 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 12 }, { f: 14, t: 50, vx: 2.5 }], sfx: 'super', fx: 'arc' })
      }
    },

    vinicius: {
      id: 'vinicius', name: 'Vinícius Andrey', alias: 'O Dev da Vila', origin: 'Vila Brasa, sertão da BA', style: 'Sertão & código',
      bio: 'Programador de software, dados e IA. Entrou na rinha pra provar que lógica também briga. Lê o padrão do adversário como quem lê um log — e quando acha o bug, não perdoa.',
      quote: 'Funciona na minha máquina. E na rinha também.', winQuote: 'Compilou sem erro. Próximo.',
      colors: { skin: '#dcae8e', torso: '#f7f3ea', arms: '#f7f3ea', legs: '#b5702f', shoes: '#1f3a6e', accent: '#2aa9b8', hair: '#2a1d14' },
      hair: 'crop', prop: null, idle: 'stance', idleOver: { na: [50, 100], fa: [35, 90], torso: 6 }, beard: 'full', belly: true, body: { height: 1.0, build: 1.28 }, details: ['glasses', 'watch', 'sneakers', 'cuffs'],
      stats: { hp: 1050, speed: 3.0, jumpV: -12.8, weight: 1.1, dashV: 9.5, airSpeed: 3.0, maxJumps: 1 },
      superName: 'Deploy em Produção', superDesc: 'Sobe tudo de uma vez: sequência de golpes que não dá rollback.',
      ai: { zone: 0.3, air: 0.2, grab: 0.1, rush: 0.5, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Clique', startup: 3, active: 2, recovery: 8, dmg: 44, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 20, y: 95, w: 66, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Chute de ponteiro', startup: 5, active: 3, recovery: 10, dmg: 44, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 72, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Pisão', startup: 5, active: 5, recovery: 8, dmg: 52, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 68, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Refatoração', startup: 10, active: 5, recovery: 16, dmg: 112, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 70, w: 110, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Rasteira recursiva', startup: 8, active: 4, recovery: 18, dmg: 92, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 100, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Queda de servidor', startup: 8, active: 6, recovery: 10, dmg: 105, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -10, y: -10, w: 90, h: 80 }, pose: 'slam', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Deploy', startup: 12, active: 4, recovery: 19, dmg: 115, hitstun: 21, blockstun: 13, kb: 8, armor: [1, 12], hitbox: { x: 10, y: 60, w: 90, h: 90 }, pose: 'charge', move: [{ f: 5, t: 15, vx: 5 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Bug', startup: 11, active: 1, recovery: 20, dmg: 70, hitstun: 16, blockstun: 10, kb: 4, chip: 7, lag: 150, pose: 'cast', projectile: { kind: 'bug', vx: 6.5, vy: 0, w: 46, h: 46, y: 60, life: 90 }, sfx: 'projectile' }),
        dS: mv({ id: 'dS', name: 'Firewall', startup: 12, active: 1, recovery: 18, dmg: 55, launch: 10, hitstun: 20, blockstun: 10, kb: 3, chip: 5, pose: 'trap', trap: { dist: 110, life: 200, w: 40, h: 150, wall: true }, sfx: 'axe' }),
        aS: mv({ id: 'aS', name: 'Download', startup: 7, active: 10, recovery: 10, dmg: 95, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 80, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
        dH: mv({ id: 'dH', name: 'Push', startup: 8, active: 4, recovery: 15, dmg: 105, hitstun: 21, blockstun: 13, kb: 10, armor: [1, 8], hitbox: { x: 10, y: 50, w: 100, h: 90 }, pose: 'charge', move: [{ f: 0, t: 12, vx: 6 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Rollback', startup: 4, active: 1, recovery: 10, dmg: 0, invuln: [0, 12], teleport: { back: 150 }, pose: 'backdash', sfx: 'dodge' }),
        fS: mv({ id: 'fS', name: 'Hotfix', startup: 22, active: 1, recovery: 30, dmg: 0, heal: 70, pose: 'trap', sfx: 'patua' }),
        M: mv({ id: 'M', name: 'Deploy em Produção', super: true, startup: 14, active: 36, recovery: 22, dmg: 60, hits: 7, hitInterval: 5, launch: 14, hitstun: 22, blockstun: 15, kb: 1.5, chip: 16, invuln: [0, 16], hitbox: { x: 0, y: 30, w: 130, h: 130 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 13 }, { f: 14, t: 50, vx: 2.5 }], sfx: 'super', fx: 'arc' })
      }
    },

    fulozinha: {
      id: 'fulozinha', name: 'Comadre Fulozinha', short: 'Fulozinha', alias: 'A Guardiã da Mata', origin: 'Mata Branca, PI', style: 'Assobio da mata',
      bio: 'Pequena, de cabelo até o chão e pés que parecem virados pro lado errado. Protege a mata de quem entra sem pedir licença — e mata nenhuma entra na rinha sem ela assoviar primeiro. Gosta de fumo de rolo e detesta mentira.',
      quote: 'Entrou na minha mata? Deixa o fumo e vai embora.', winQuote: 'Passa de volta, e deixa o fumo.',
      colors: { skin: '#a8754f', torso: '#2f6b3a', arms: '#a8754f', legs: '#6b4a2a', shoes: '#a8754f', accent: '#d9b34a', hair: '#0f0c0a' },
      hair: 'long', prop: 'pipe', idle: 'sway', idleOver: { na: [40, 100], fa: [25, 85], torso: 4 }, body: { height: 0.84, build: 0.72 }, details: ['leaves', 'necklace'],
      stats: { hp: 880, speed: 3.9, jumpV: -14.6, weight: 0.78, dashV: 11.5, airSpeed: 4.4, maxJumps: 2 },
      superName: 'Mata Fechada', superDesc: 'A mata se fecha: um redemoinho de folhas cortantes varre a rinha.',
      ai: { zone: 0.3, air: 0.55, grab: 0, rush: 0.6, poke: 0.55 },
      moves: {
        L: mv({ id: 'L', name: 'Beliscão de cipó', startup: 3, active: 3, recovery: 8, dmg: 40, hitstun: 18, blockstun: 8, kb: 2, hitbox: { x: 20, y: 80, w: 58, h: 30 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Rasteira de raiz', startup: 4, active: 3, recovery: 9, dmg: 34, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 66, h: 28 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Pé de vento', startup: 4, active: 5, recovery: 7, dmg: 42, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 14, w: 62, h: 46 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Chicote de cabelo', startup: 9, active: 4, recovery: 16, dmg: 92, hitstun: 20, blockstun: 11, kb: 5, hitbox: { x: 18, y: 55, w: 135, h: 60 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Raiz que sobe', startup: 8, active: 5, recovery: 17, dmg: 82, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 11, kb: 3, hitbox: { x: 24, y: 0, w: 96, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Cambalhota da mata', startup: 7, active: 7, recovery: 9, dmg: 90, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: -6, y: 0, w: 92, h: 84 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Carreira de pé virado', startup: 9, active: 5, recovery: 15, dmg: 88, hitstun: 19, blockstun: 11, kb: 5, hitbox: { x: 20, y: 40, w: 72, h: 66 }, pose: 'lunge', move: [{ f: 2, t: 14, vx: 9.5 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Assobio', startup: 9, active: 1, recovery: 16, dmg: 66, hitstun: 16, blockstun: 10, kb: 4, chip: 6, pose: 'whistle', projectile: { kind: 'whistle', vx: 11, vy: 0, w: 46, h: 46, y: 72, life: 52 }, sfx: 'projectile' }),
        dS: mv({ id: 'dS', name: 'Armadilha de cipó', startup: 12, active: 1, recovery: 18, dmg: 36, hitstun: 54, blockstun: 10, kb: 0, chip: 0, pose: 'trap', trap: { dist: 150, life: 230, w: 70, h: 52, kind: 'vine' }, sfx: 'whooshH' }),
        aS: mv({ id: 'aS', name: 'Chuva de folhas', startup: 8, active: 1, recovery: 12, dmg: 52, type: 'high', air: true, hitstun: 15, kb: 3, chip: 5, pose: 'castLow', projectile: { kind: 'leaf', vx: 5.5, vy: 5, w: 48, h: 40, y: 30, life: 70 }, sfx: 'whoosh' }),
        dH: mv({ id: 'dH', name: 'Voadora de saci-pererê', startup: 6, active: 6, recovery: 13, dmg: 88, launch: 9, hitstun: 20, blockstun: 11, kb: 4, hitbox: { x: 10, y: 35, w: 96, h: 80 }, pose: 'airKick', move: [{ f: 0, t: 12, vx: 9 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Pés pra trás', startup: 6, active: 6, recovery: 15, dmg: 74, launch: 9, hitstun: 20, blockstun: 11, kb: 3, invuln: [0, 8], hitbox: { x: 0, y: 40, w: 100, h: 90 }, pose: 'riseKick', move: [{ f: 0, t: 14, vx: -6.5 }], sfx: 'dodge' }),
        fS: mv({ id: 'fS', name: 'Fumaça do cachimbo', startup: 11, active: 1, recovery: 20, dmg: 22, hitstun: 12, blockstun: 8, kb: 0.6, chip: 2, lag: 130, lagText: 'TONTO!', pose: 'cast', projectile: { kind: 'smoke', vx: 1.7, vy: 0, w: 120, h: 96, y: 8, life: 150, hits: 4, hitInterval: 14 }, sfx: 'whooshH' }),
        M: mv({ id: 'M', name: 'Mata Fechada', super: true, startup: 20, active: 1, recovery: 28, dmg: 66, hitstun: 22, blockstun: 15, kb: 1.5, chip: 14, launch: 12, invuln: [0, 20], pose: 'superCast', projectile: { kind: 'leafstorm', vx: 5.5, vy: 0, w: 150, h: 170, y: 0, life: 200, hits: 5, hitInterval: 8 }, sfx: 'super' })
      }
    },

    mula: {
      id: 'mula', name: 'Mula-sem-Cabeça', alias: 'Dona Zefa, a Galopeira', origin: 'Estrada de Quixeramobim, CE', style: 'Galope de fogo',
      bio: 'Toda quinta pra sexta, a estrada ouve o tilintar de ferraduras e vê uma chama no lugar da cabeça. A maldição pesou — e Dona Zefa aprendeu a galopar com ela. Não corre de ninguém: corre por cima.',
      quote: 'Quando a ferradura soar, já é tarde.', winQuote: 'Quinta pra sexta. Sempre.',
      colors: { skin: '#8a5a3a', torso: '#5a2a6b', arms: '#8a5a3a', legs: '#3a2a24', shoes: '#241812', accent: '#4aa3ff', hair: '#4aa3ff' },
      hair: 'fireneck', headless: true, prop: null, idle: 'bounce', idleOver: { torso: 12, nl: [8, 4] }, body: { height: 1.06, build: 1.18 }, details: ['hooves', 'shawl'],
      stats: { hp: 1020, speed: 3.3, jumpV: -12.6, weight: 1.15, dashV: 11.5, airSpeed: 2.8, maxJumps: 1 },
      superName: 'Madrugada de Sexta', superDesc: 'Escurece a noite e dispara num galope flamejante através da rinha.',
      ai: { zone: 0.05, air: 0.1, grab: 0, rush: 0.9, poke: 0.2 },
      moves: {
        L: mv({ id: 'L', name: 'Coice curto', startup: 4, active: 3, recovery: 9, dmg: 54, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 16, y: 40, w: 76, h: 40 }, pose: 'airKick', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pata baixa', startup: 5, active: 3, recovery: 10, dmg: 46, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 76, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Casco no ar', startup: 5, active: 5, recovery: 8, dmg: 56, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 14, w: 72, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Coice duplo', startup: 9, active: 9, recovery: 16, dmg: 62, hits: 2, hitInterval: 5, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 8, y: 40, w: 118, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Galope rasteiro', startup: 8, active: 4, recovery: 18, dmg: 96, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 112, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Pisada de casco', startup: 8, active: 6, recovery: 11, dmg: 110, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 4, hitbox: { x: -8, y: -10, w: 94, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Ombrada', startup: 12, active: 4, recovery: 18, dmg: 118, hitstun: 22, blockstun: 13, kb: 9, armor: [1, 12], hitbox: { x: 10, y: 50, w: 96, h: 90 }, pose: 'charge', move: [{ f: 5, t: 16, vx: 5 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Bafo de fogo azul', startup: 11, active: 1, recovery: 20, dmg: 78, burn: true, hitstun: 16, blockstun: 10, kb: 4, chip: 7, pose: 'cast', projectile: { kind: 'bluefire', vx: 8, vy: 0, w: 52, h: 52, y: 110, life: 70 }, sfx: 'fire' }),
        dS: mv({ id: 'dS', name: 'Ferradura em chamas', startup: 12, active: 1, recovery: 20, dmg: 64, launch: 12, hitstun: 20, blockstun: 10, kb: 2, chip: 6, pose: 'trap', trap: { dist: 150, life: 210, w: 72, h: 60, kind: 'horseshoe' }, sfx: 'fire' }),
        aS: mv({ id: 'aS', name: 'Cometa da estrada', startup: 8, active: 1, recovery: 12, dmg: 66, type: 'high', air: true, burn: true, hitstun: 15, kb: 3, chip: 6, pose: 'castLow', projectile: { kind: 'bluefire', vx: 6, vy: 6, w: 46, h: 46, y: 40, life: 70 }, sfx: 'fire' }),
        dH: mv({ id: 'dH', name: 'Disparada', startup: 7, active: 6, recovery: 15, dmg: 104, armor: [0, 8], hitstun: 21, blockstun: 12, kb: 8, hitbox: { x: 8, y: 30, w: 108, h: 100 }, pose: 'gallop', move: [{ f: 0, t: 13, vx: 10.5 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Empinada', startup: 5, active: 8, recovery: 20, dmg: 92, launch: 14, armor: [3, 12], hitstun: 24, blockstun: 13, kb: 2, hitbox: { x: -10, y: 50, w: 100, h: 130 }, pose: 'rear', sfx: 'whooshH' }),
        fS: mv({ id: 'fS', name: 'Atropelo', startup: 8, active: 22, recovery: 18, dmg: 40, hits: 3, hitInterval: 7, launch: 10, hitstun: 18, blockstun: 11, kb: 1.5, chip: 6, burn: true, hitbox: { x: 6, y: 20, w: 100, h: 120 }, pose: 'gallop', move: [{ f: 0, t: 30, vx: 8.5 }], sfx: 'fire' }),
        M: mv({ id: 'M', name: 'Madrugada de Sexta', super: true, startup: 14, active: 40, recovery: 22, dmg: 58, hits: 6, hitInterval: 6, launch: 14, hitstun: 22, blockstun: 15, kb: 1.5, chip: 16, burn: true, dark: true, invuln: [0, 16], hitbox: { x: -10, y: 10, w: 140, h: 150 }, pose: 'gallop', move: [{ f: 6, t: 20, vx: 14 }, { f: 20, t: 54, vx: 4 }], sfx: 'super', fx: 'arc' })
      }
    },

    papafigo: {
      id: 'papafigo', name: 'Seu Papa-Figo', short: 'Papa-Figo', alias: 'O Homem do Saco', origin: 'Beco da Matriz, Recife, PE', style: 'Saco & navalha',
      bio: 'Alto, magro, de casaco comprido mesmo no calor do sertão. Dizem que anda pelas ruas depois do Ângelus e que ninguém nunca viu o rosto dele inteiro. O saco nas costas nunca está vazio — e o que cabe nele sempre dá pra encher de novo.',
      quote: 'Fique quietinho. Vai doer só um pouquinho.', winQuote: 'Obrigado pela refeição.',
      colors: { skin: '#c9a483', torso: '#1a1a22', arms: '#1a1a22', legs: '#26242a', shoes: '#0f0e0d', accent: '#8f1d1d', hair: '#141210' },
      hair: 'fedora', prop: 'sack', idle: 'stance', idleOver: { torso: 14, head: 6, na: [30, 95], fa: [20, 85] }, body: { height: 1.18, build: 0.72 }, details: ['coat', 'redEyes', 'cuffs'],
      stats: { hp: 960, speed: 2.8, jumpV: -12.4, weight: 0.9, dashV: 8.5, airSpeed: 2.6, maxJumps: 1 },
      superName: 'Ceia Maldita', superDesc: 'Uma sequência sombria que suga a vida do oponente a cada golpe.',
      ai: { zone: 0.35, air: 0.1, grab: 0.55, rush: 0.4, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Tapa de luva', startup: 5, active: 3, recovery: 10, dmg: 46, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 26, y: 100, w: 82, h: 32 }, pose: 'lunge', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Chute de sapato', startup: 6, active: 3, recovery: 11, dmg: 40, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 18, y: 0, w: 82, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Pisada de corvo', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 18, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Navalhada', startup: 9, active: 4, recovery: 17, dmg: 100, steal: 0.25, hitstun: 20, blockstun: 12, kb: 5, hitbox: { x: 20, y: 60, w: 125, h: 80 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Bengala rasteira', startup: 9, active: 4, recovery: 19, dmg: 88, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 14, y: 0, w: 130, h: 28 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Mergulho da capa', startup: 8, active: 6, recovery: 11, dmg: 98, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -8, y: -10, w: 100, h: 84 }, pose: 'overhead', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Estocada', startup: 12, active: 4, recovery: 18, dmg: 104, steal: 0.2, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 20, y: 70, w: 138, h: 40 }, pose: 'lunge', move: [{ f: 4, t: 14, vx: 5 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Saco no ar', startup: 12, active: 1, recovery: 22, dmg: 56, steal: 0.6, hitstun: 38, blockstun: 10, kb: 0, chip: 4, pose: 'overhead', projectile: { kind: 'sack', vx: 6, vy: -5.2, w: 64, h: 64, y: 100, life: 80, gravity: 0.22 }, sfx: 'whooshH' }),
        dS: mv({ id: 'dS', name: 'Pra dentro do saco', startup: 9, active: 5, recovery: 26, dmg: 150, steal: 0.5, throw: { range: 82, hold: 24, vx: 8, vy: 11, drain: 0.1 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
        aS: mv({ id: 'aS', name: 'Voo do corvo', startup: 7, active: 10, recovery: 10, dmg: 90, type: 'high', air: true, knockdown: true, steal: 0.2, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 8, y: -4, w: 86, h: 64 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5.5, vy: 6 }], sfx: 'whooshH' }),
        dH: mv({ id: 'dH', name: 'Passo de sombra', startup: 8, active: 5, recovery: 14, dmg: 96, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 20, y: 60, w: 118, h: 50 }, pose: 'lunge', move: [{ f: 0, t: 12, vx: 7.5 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Capa negra', startup: 2, active: 22, recovery: 16, dmg: 0, counter: [2, 24], counterMove: 'bH2', pose: 'cloak', sfx: 'armor' }),
        bH2: mv({ id: 'bH2', name: 'Sangria', startup: 3, active: 5, recovery: 14, dmg: 130, steal: 0.5, launch: 11, hitstun: 24, blockstun: 12, kb: 7, hitbox: { x: 10, y: 60, w: 110, h: 90 }, pose: 'swing', sfx: 'whooshH' }),
        fS: mv({ id: 'fS', name: 'Cantiga de ninar', startup: 14, active: 1, recovery: 22, dmg: 24, hitstun: 50, blockstun: 8, kb: 0, chip: 0, lagText: 'SONOLENTO!', lag: 90, pose: 'cast', projectile: { kind: 'lullaby', vx: 3.6, vy: 0, w: 70, h: 70, y: 78, life: 110 }, sfx: 'taunt' }),
        M: mv({ id: 'M', name: 'Ceia Maldita', super: true, startup: 14, active: 34, recovery: 22, dmg: 64, hits: 5, hitInterval: 7, launch: 13, steal: 0.5, hitstun: 22, blockstun: 15, kb: 1.5, chip: 14, invuln: [0, 16], dark: true, hitbox: { x: 0, y: 20, w: 130, h: 140 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 11 }, { f: 14, t: 48, vx: 2.5 }], sfx: 'super', fx: 'arc' })
      }
    },

    cuia: {
      id: 'cuia', name: 'Cabeça de Cuia', alias: 'O Pescador Amaldiçoado', origin: 'Rio Parnaíba, PI', style: 'Anzol & tarrafa',
      bio: 'Pescador do Parnaíba que carrega uma cuia no lugar da cabeça — castigo antigo que o rio nunca explicou. Cada vez que lança o anzol, fisga mais um pedaço do que perdeu. Diz que é só lenda. A cuia ri.',
      quote: 'O rio devolve tudo. Menos o que eu perdi.', winQuote: 'Hoje o rio me deu uma boa pesca.',
      colors: { skin: '#8a6a46', torso: '#d8c9a0', arms: '#8a6a46', legs: '#4a5a6a', shoes: '#8a6a46', accent: '#2aa9b8', hair: '#c9993a' },
      hair: 'gourd', prop: 'rod', idle: 'sway', idleOver: { torso: 8, na: [45, 105], fa: [30, 90] }, body: { height: 1.05, build: 0.92 }, details: ['rope', 'cuffs'],
      stats: { hp: 1000, speed: 3.0, jumpV: -12.8, weight: 1.0, dashV: 9.5, airSpeed: 3.0, maxJumps: 1 },
      superName: 'Maldição do Parnaíba', superDesc: 'Um redemoinho que suga o oponente e o mantém girando no rio.',
      ai: { zone: 0.55, air: 0.2, grab: 0, rush: 0.3, poke: 0.7 },
      moves: {
        L: mv({ id: 'L', name: 'Tapa de tarrafa', startup: 5, active: 3, recovery: 10, dmg: 48, hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: 22, y: 92, w: 76, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pé na lama', startup: 6, active: 3, recovery: 10, dmg: 42, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 18, y: 0, w: 78, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Joelhada de pescador', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 68, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Varada', startup: 11, active: 4, recovery: 18, dmg: 108, hitstun: 20, blockstun: 12, kb: 7, hitbox: { x: 22, y: 60, w: 128, h: 80 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH' }),
        cH: mv({ id: 'cH', name: 'Anzol rasteiro', startup: 9, active: 4, recovery: 20, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 12, y: 0, w: 132, h: 28 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Mergulho de cuia', startup: 8, active: 6, recovery: 11, dmg: 104, type: 'high', air: true, knockdown: true, hitstun: 19, kb: 4, hitbox: { x: -8, y: -10, w: 94, h: 84 }, pose: 'slam', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Cuiada', startup: 12, active: 4, recovery: 18, dmg: 112, type: 'high', hitstun: 21, blockstun: 13, kb: 6, hitbox: { x: 20, y: 90, w: 70, h: 56 }, pose: 'headbutt', move: [{ f: 5, t: 15, vx: 6 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: "Cuiada d'água", startup: 11, active: 1, recovery: 20, dmg: 74, hitstun: 16, blockstun: 10, kb: 4, chip: 7, pose: 'cast', projectile: { kind: 'gourd', vx: 7.5, vy: -3, w: 52, h: 46, y: 96, life: 62, gravity: 0.1 }, sfx: 'water' }),
        dS: mv({ id: 'dS', name: 'Poça do Parnaíba', startup: 13, active: 1, recovery: 20, dmg: 66, launch: 12, hitstun: 20, blockstun: 10, kb: 2, chip: 6, pose: 'trap', trap: { dist: 150, life: 220, w: 78, h: 54, kind: 'puddle' }, sfx: 'water' }),
        aS: mv({ id: 'aS', name: 'Chuva de peixes', startup: 8, active: 1, recovery: 12, dmg: 58, type: 'high', air: true, hitstun: 15, kb: 3, chip: 5, pose: 'castLow', projectile: { kind: 'fish', vx: 4.8, vy: 5.5, w: 48, h: 26, y: 30, life: 70 }, sfx: 'water' }),
        dH: mv({ id: 'dH', name: 'Arrastão', startup: 8, active: 6, recovery: 15, dmg: 92, type: 'low', knockdown: true, crouch: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 124, h: 32 }, pose: 'sweep', move: [{ f: 0, t: 13, vx: 7.5 }], sfx: 'whooshH' }),
        bH: mv({ id: 'bH', name: 'Mergulho no rio', startup: 3, active: 1, recovery: 12, dmg: 0, invuln: [0, 16], move: [{ f: 0, t: 14, vx: -9.5 }], pose: 'dodge', sfx: 'dodge' }),
        fS: mv({ id: 'fS', name: 'Fisgada', startup: 12, active: 1, recovery: 22, dmg: 34, hitstun: 26, blockstun: 10, kb: 0, chip: 3, pull: 70, pose: 'cast', projectile: { kind: 'hook', vx: 13, vy: 0, w: 40, h: 34, y: 94, life: 54 }, sfx: 'whooshH' }),
        M: mv({ id: 'M', name: 'Maldição do Parnaíba', super: true, startup: 22, active: 1, recovery: 28, dmg: 66, hitstun: 22, blockstun: 16, kb: 1, chip: 18, launch: 12, pull: 40, pullProj: true, invuln: [0, 22], pose: 'superCast', projectile: { kind: 'whirl', vx: 3.2, vy: 0, w: 130, h: 180, y: 0, life: 210, hits: 5, hitInterval: 10 }, sfx: 'super' })
      }
    },

    cinzas: {
      id: 'cinzas', name: 'Mestre Cinzas', alias: 'O Último da Rinha Velha', origin: 'Vila Brasa, sertão da BA', style: 'Peia antiga',
      bio: 'Mestre de Zeca e guardião da Rinha do Fogo há trinta anos. Perdeu a esposa, Rosa, num incêndio durante uma rinha. Desde então acredita que toda festa cobra um preço — e decidiu encerrar a conta.',
      quote: 'Toda festa cobra um preço.', winQuote: 'Toda festa cobra um preço.',
      colors: { skin: '#7a4f36', torso: '#e9e2d2', arms: '#7a4f36', legs: '#cfc6b2', shoes: '#141210', accent: '#8d8a84', hair: '#d8d2c4' },
      hair: 'straw', prop: 'ash', idle: 'ginga', idleOver: { torso: 16, head: -8 }, details: ['scar', 'necklace'], beard: true, body: { height: 0.98, build: 0.86 },
      stats: { hp: 1050, speed: 3.1, jumpV: -13, weight: 1.0, dashV: 10, airSpeed: 3.2, maxJumps: 1 },
      superName: 'Apagar a Brasa', superDesc: 'Escurece a rinha e desfere a sequência que encerrou trinta anos de festa.',
      ai: { zone: 0.3, air: 0.3, grab: 0.3, rush: 0.5, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Tapa de cinza', startup: 4, active: 3, recovery: 8, dmg: 55, hitstun: 18, blockstun: 8, kb: 2.5, hitbox: { x: 20, y: 95, w: 64, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pisão', startup: 5, active: 3, recovery: 10, dmg: 45, type: 'low', crouch: true, hitstun: 17, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 70, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Chapa', startup: 5, active: 5, recovery: 8, dmg: 55, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 66, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Coice de cinzas', startup: 9, active: 5, recovery: 15, dmg: 115, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 70, w: 110, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Rasteira velha', startup: 7, active: 4, recovery: 17, dmg: 95, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 105, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Voadora de cinzas', startup: 7, active: 6, recovery: 10, dmg: 105, type: 'high', air: true, hitstun: 18, kb: 5, hitbox: { x: 0, y: 10, w: 90, h: 80 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Cabeçada', startup: 10, active: 4, recovery: 16, dmg: 105, type: 'high', hitstun: 18, blockstun: 12, kb: 5, hitbox: { x: 20, y: 90, w: 60, h: 50 }, pose: 'headbutt', move: [{ f: 4, t: 13, vx: 6 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Sopro de cinza', startup: 11, active: 1, recovery: 20, dmg: 90, hitstun: 17, blockstun: 11, kb: 4, chip: 9, pose: 'cast', projectile: { kind: 'ash', vx: 5.5, vy: 0, w: 70, h: 80, y: 40, life: 110 }, sfx: 'whooshH' }),
        dS: mv({ id: 'dS', name: 'Chamada', startup: 8, active: 5, recovery: 24, dmg: 150, throw: { range: 76, hold: 26, vx: 8, vy: 12, drain: 0.3 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
        aS: mv({ id: 'aS', name: 'Tesoura', startup: 6, active: 10, recovery: 10, dmg: 95, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 80, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
        dH: mv({ id: 'dH', name: 'Vassourada', startup: 7, active: 5, recovery: 14, dmg: 100, hitstun: 20, blockstun: 12, kb: 7, hitbox: { x: 10, y: 50, w: 110, h: 90 }, pose: 'spinKick', move: [{ f: 0, t: 10, vx: 6 }], sfx: 'whooshH', fx: 'arc' }),
        bH: mv({ id: 'bH', name: 'Sopro negro', startup: 11, active: 1, recovery: 20, dmg: 70, hitstun: 17, blockstun: 11, kb: 4, chip: 7, drainAxe: 0.15, pose: 'cast', projectile: { kind: 'ash', vx: 6, vy: 0, w: 70, h: 80, y: 40, life: 95 }, sfx: 'whooshH' }),
        fS: mv({ id: 'fS', name: 'Sombra', startup: 12, active: 4, recovery: 12, dmg: 90, hitstun: 20, blockstun: 11, kb: 6, invuln: [0, 13], teleport: { behind: true, dist: 80 }, hitbox: { x: 10, y: 60, w: 80, h: 80 }, pose: 'jab', sfx: 'dodge' }),
        M: mv({ id: 'M', name: 'Apagar a Brasa', super: true, startup: 14, active: 32, recovery: 22, dmg: 80, hits: 5, hitInterval: 6, launch: 14, hitstun: 24, blockstun: 16, kb: 1.5, chip: 18, invuln: [0, 16], dark: true, hitbox: { x: -10, y: 20, w: 130, h: 140 }, pose: 'superRush', move: [{ f: 6, t: 14, vx: 12 }, { f: 14, t: 46, vx: 3 }], sfx: 'super', fx: 'arc' })
      }
    }
  };

  // ============================================================
  // DINÂMICA DE COMBATE — strings de três golpes, golpes de
  // sequência dos especiais, cancelamentos e deslocamento.
  // ============================================================
  // [nome do 2º golpe, pose, nome do 3º golpe, pose, deslocamento de hitbox do 3º]
  const STRINGS = {
    zeca: ['Cotovelada de açude', 'lunge', 'Rabo de arraia curto', 'spinKick'],
    bia: ['Giro de sombrinha', 'swing', 'Frevo final', 'spinKick'],
    mare: ['Cabo do remo', 'lunge', 'Remada de popa', 'swing'],
    tiao: ['Gancho de vaqueiro', 'upper', 'Marrada de touro', 'headbutt'],
    bene: ['Fole de volta', 'swing', 'Estouro de fole', 'overhead'],
    juvenal: ['Chama dupla', 'jab', 'Labareda final', 'spinKick'],
    vinicius: ['Duplo clique', 'jab', 'Commit', 'lunge'],
    cinzas: ['Palma de cinza', 'lunge', 'Fim da brasa', 'spinKick'],
    fulozinha: ['Beliscão duplo', 'jab', 'Chicote de cabelo curto', 'swing'],
    mula: ['Coice de volta', 'airKick', 'Ombrada de arranque', 'charge'],
    papafigo: ['Navalha curta', 'lunge', 'Estocada final', 'swing'],
    cuia: ['Cotovelo de anzol', 'jab', 'Cabeçada de cuia', 'headbutt']
  };
  // [golpe-base, id do golpe seguinte, dados, vale mesmo sem acertar]
  const FOLLOW = {
    zeca: ['S', 'S2', { name: 'Chute de arremate', startup: 6, active: 5, recovery: 16, dmg: 110, knockdown: true, hitstun: 20, blockstun: 12, kb: 8, hitbox: { x: 10, y: 50, w: 110, h: 90 }, pose: 'spinKick', move: [{ f: 0, t: 10, vx: 4 }], sfx: 'whooshH', fx: 'arc' }, false],
    bia: ['S', 'S2', { name: 'Frevo de sombrinha', startup: 5, active: 6, recovery: 16, dmg: 95, launch: 11, hitstun: 21, blockstun: 12, kb: 3, hitbox: { x: -10, y: 60, w: 90, h: 120 }, pose: 'upper', umbrellaOpen: true, sfx: 'whooshH' }, false],
    mare: ['S', 'S2', { name: 'Remada sobre a onda', startup: 7, active: 4, recovery: 16, dmg: 95, hitstun: 20, blockstun: 12, kb: 9, hitbox: { x: 20, y: 50, w: 135, h: 90 }, pose: 'swing', sfx: 'whooshH' }, true],
    tiao: ['dS', 'dS2', { name: 'Boiada', startup: 7, active: 8, recovery: 18, dmg: 105, launch: 9, hitstun: 22, blockstun: 13, kb: 6, armor: [0, 10], hitbox: { x: 10, y: 30, w: 100, h: 110 }, pose: 'tackle', move: [{ f: 0, t: 14, vx: 7 }], sfx: 'whooshH' }, true],
    bene: ['S', 'S2', { name: 'Estouro de fole', startup: 7, active: 5, recovery: 17, dmg: 85, hitstun: 19, blockstun: 11, kb: 12, hitbox: { x: -10, y: 30, w: 150, h: 130 }, pose: 'play', fx: 'wave', sfx: 'taunt' }, true],
    juvenal: ['S', 'S2', { name: 'Explosão de brasa', startup: 7, active: 6, recovery: 18, dmg: 90, burn: true, launch: 10, hitstun: 21, blockstun: 12, kb: 3, hitbox: { x: -20, y: 20, w: 120, h: 130 }, pose: 'upper', sfx: 'fire', fx: 'fire' }, true],
    vinicius: ['S', 'S2', { name: 'Debug', startup: 6, active: 4, recovery: 14, dmg: 95, launch: 8, hitstun: 20, blockstun: 11, kb: 4, hitbox: { x: 10, y: 40, w: 100, h: 90 }, pose: 'airKick', sfx: 'whooshH' }, true],
    cinzas: ['S', 'S2', { name: 'Passo de cinza', startup: 6, active: 5, recovery: 15, dmg: 100, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 50, w: 110, h: 90 }, pose: 'lunge', move: [{ f: 0, t: 10, vx: 9 }], sfx: 'whooshH' }, true],
    fulozinha: ['S', 'S2', { name: 'Chicote rasteiro', startup: 7, active: 5, recovery: 15, dmg: 80, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 11, kb: 4, hitbox: { x: 20, y: 0, w: 130, h: 30 }, pose: 'sweep', sfx: 'whooshH' }, true],
    mula: ['S', 'S2', { name: 'Coice flamejante', startup: 6, active: 5, recovery: 16, dmg: 100, burn: true, launch: 10, hitstun: 21, blockstun: 12, kb: 4, hitbox: { x: 10, y: 40, w: 100, h: 90 }, pose: 'spinKick', sfx: 'fire', fx: 'arc' }, true],
    papafigo: ['S', 'S2', { name: 'Navalha rápida', startup: 5, active: 4, recovery: 14, dmg: 85, steal: 0.3, hitstun: 19, blockstun: 11, kb: 5, hitbox: { x: 20, y: 60, w: 130, h: 60 }, pose: 'swing', sfx: 'whooshH' }, true],
    cuia: ['S', 'S2', { name: 'Sacudida do anzol', startup: 7, active: 4, recovery: 16, dmg: 100, hitstun: 20, blockstun: 12, kb: 9, hitbox: { x: 20, y: 60, w: 140, h: 80 }, pose: 'swing', sfx: 'whooshH' }, true]
  };
  for (const id in M.FIGHTERS) {
    const mvs = M.FIGHTERS[id].moves;
    // deslocamento nos golpes básicos: o corpo acompanha o soco/chute
    for (const [k, d] of [['L', 1.2], ['H', 1.9], ['cH', 1.1], ['cL', 0.5]]) if (mvs[k] && !mvs[k].move && mvs[k].drift === undefined) mvs[k].drift = d;
    // cancelamentos padrão (também valem na defesa)
    if (mvs.L && !mvs.L.cancel) mvs.L.cancel = ['L', 'H', 'S'];
    if (mvs.cL && !mvs.cL.cancel) mvs.cL.cancel = ['H', 'S'];
    for (const k of ['H', 'cH', 'fH']) if (mvs[k] && !mvs[k].cancel) mvs[k].cancel = ['S'];
    for (const k of ['S', 'dS', 'fS']) if (mvs[k] && !mvs[k].cancel) mvs[k].cancel = [];
    // string de três golpes: L > L2 > L3 (finalizador cancelável em especial)
    const st = STRINGS[id], L = mvs.L;
    if (st && L) {
      const hb = L.hitbox, base = { type: 'mid', kb: 3, hitstun: 18, blockstun: 9, chip: 0, sfx: 'whoosh' };
      mvs.L2 = Object.assign({}, base, { id: 'L2', name: st[0], startup: Math.max(3, L.startup - 1), active: 3, recovery: 9, dmg: Math.round(L.dmg * 1.2), hitstun: 18, blockstun: 9, kb: 3, hitbox: { x: hb.x + 4, y: Math.max(20, hb.y - 8), w: hb.w + 8, h: hb.h + 6 }, pose: st[1], drift: 1.5, chain: 'L3', cancel: ['L', 'H', 'S'] });
      mvs.L3 = Object.assign({}, base, { id: 'L3', name: st[2], startup: L.startup + 1, active: 4, recovery: 15, dmg: Math.round(L.dmg * 2.1), hitstun: 22, blockstun: 12, kb: 6.5, knockdown: true, hitbox: { x: hb.x + 6, y: Math.max(30, hb.y - 24), w: hb.w + 26, h: 76 }, pose: st[3], move: [{ f: 1, t: 8, vx: 3 }], cancel: ['S'], sfx: 'whooshH', fx: 'arc' });
      L.chain = 'L2';
    }
    // segundo golpe do especial (aperte o especial de novo)
    const fo = FOLLOW[id];
    if (fo && mvs[fo[0]]) { mvs[fo[1]] = mv(Object.assign({ id: fo[1] }, fo[2])); mvs[fo[0]].follow = fo[1]; if (fo[3]) mvs[fo[0]].followAny = true; }
  }

  M.ROSTER = ['zeca', 'bia', 'mare', 'tiao', 'bene', 'juvenal', 'vinicius', 'fulozinha', 'mula', 'papafigo', 'cuia', 'cinzas'];
  for (const id in M.FIGHTERS) {
    const f = M.FIGHTERS[id];
    // agarrão universal (J + K juntos ou tecla H)
    if (!f.moves.TH) f.moves.TH = mv({ id: 'TH', name: 'Agarrão', startup: 4, active: 4, recovery: 22, dmg: 120, throw: { range: 78, hold: 18, vx: 7, vy: 9 }, hitstun: 20, pose: 'grab', sfx: 'grab' });
    for (const k in f.moves) { const m = f.moves[k]; m.total = m.startup + m.active + m.recovery; m.reach = m.hitbox ? m.hitbox.x + m.hitbox.w : (m.throw ? m.throw.range : 0); }
  }
})();
