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
      id: 'zeca', name: 'Zeca Ventania', alias: 'O Vento da Ladeira', origin: 'Porto Brabo, BA', style: 'Capoeira de rua',
      bio: 'Cria do cais, aprendeu a gingar antes de andar. Discípulo do Mestre Cinzas. Entra na Roda do Fogo pela primeira vez — e tudo que ele quer é que a cidade continue dançando.',
      quote: 'A roda escuta quem escuta a roda.',
      colors: { skin: '#b5744a', torso: '#f2c230', arms: '#b5744a', legs: '#f6efdc', shoes: '#141210', accent: '#1f7a4d', hair: '#141210' },
      hair: 'short', prop: null, idle: 'ginga', body: { height: 1.0, build: 0.95 },
      stats: { hp: 1000, speed: 3.3, jumpV: -13.2, weight: 1.0, dashV: 10, airSpeed: 3.4, maxJumps: 1 },
      superName: 'Vendaval da Ladeira', superDesc: 'Giro devastador que avança e levanta o oponente.',
      ai: { zone: 0.05, air: 0.3, grab: 0, rush: 0.6, poke: 0.4 },
      moves: {
        L: mv({ id: 'L', name: 'Galopante', startup: 4, active: 3, recovery: 8, dmg: 50, hitstun: 13, blockstun: 8, kb: 2.5, hitbox: { x: 20, y: 95, w: 60, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pisão baixo', startup: 5, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 13, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 70, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Chapa voadora', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 66, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Meia-lua de compasso', startup: 10, active: 5, recovery: 16, dmg: 110, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 70, w: 110, h: 80 }, pose: 'spinKick', spin: [0, 0], cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Rasteira', startup: 8, active: 4, recovery: 18, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 100, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Armada voadora', startup: 7, active: 6, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 5, hitbox: { x: 0, y: 10, w: 90, h: 80 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Cabeçada', startup: 11, active: 4, recovery: 17, dmg: 100, type: 'high', hitstun: 18, blockstun: 12, kb: 5, hitbox: { x: 20, y: 90, w: 60, h: 50 }, pose: 'headbutt', move: [{ f: 4, t: 14, vx: 6 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Aú Batido', startup: 9, active: 7, recovery: 16, dmg: 120, launch: 11, hitstun: 22, blockstun: 13, kb: 5, chip: 12, hitbox: { x: 0, y: 40, w: 100, h: 110 }, pose: 'superSpin', spin: [0, 360], move: [{ f: 2, t: 16, vx: 7.5 }], sfx: 'whooshH', fx: 'arc' }),
        dS: mv({ id: 'dS', name: 'Macaco', startup: 5, active: 7, recovery: 20, dmg: 100, launch: 13, hitstun: 22, blockstun: 12, kb: 3, chip: 10, invuln: [0, 9], hitbox: { x: -10, y: 60, w: 80, h: 120 }, pose: 'riseKick', sfx: 'whooshH' }),
        aS: mv({ id: 'aS', name: 'Tesoura voadora', startup: 6, active: 10, recovery: 10, dmg: 90, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 80, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
        M: mv({ id: 'M', name: 'Vendaval da Ladeira', super: true, startup: 14, active: 30, recovery: 22, dmg: 95, hits: 4, hitInterval: 7, launch: 14, hitstun: 24, blockstun: 16, kb: 1.5, chip: 20, invuln: [0, 16], hitbox: { x: -20, y: 20, w: 130, h: 140 }, pose: 'superSpin', spin: [0, 1080], move: [{ f: 14, t: 44, vx: 5 }], sfx: 'super', fx: 'arc' })
      }
    },

    bia: {
      id: 'bia', name: 'Bia Sombrinha', alias: 'A Dona da Ladeira', origin: 'Recife, PE', style: 'Frevo de combate',
      bio: 'Passista desde criança, transformou o passo do frevo em arte marcial. A sombrinha abre, fecha e corta. Ninguém pisa na ladeira dela sem pedir licença.',
      quote: 'Pisa certo ou cai, meu bem.',
      colors: { skin: '#8d5a3a', torso: '#c7267a', arms: '#8d5a3a', legs: '#2aa9b8', shoes: '#f2b70c', accent: '#f2b70c', hair: '#1a0f0a' },
      hair: 'curly', prop: 'umbrella', idle: 'bounce', body: { height: 0.94, build: 0.85 },
      stats: { hp: 900, speed: 3.6, jumpV: -14.2, weight: 0.85, dashV: 11, airSpeed: 4.2, maxJumps: 2 },
      superName: 'Bloco da Madrugada', superDesc: 'Avança no passo e desfere uma chuva de sombrinhadas.',
      ai: { zone: 0.05, air: 0.6, grab: 0, rush: 0.7, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Toque de ponta', startup: 4, active: 3, recovery: 9, dmg: 45, hitstun: 13, blockstun: 8, kb: 2.5, hitbox: { x: 25, y: 90, w: 80, h: 30 }, pose: 'lunge', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pontinha', startup: 5, active: 3, recovery: 10, dmg: 40, type: 'low', crouch: true, hitstun: 12, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 66, h: 30 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Beliscão', startup: 4, active: 5, recovery: 7, dmg: 45, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Tesoura de frevo', startup: 8, active: 5, recovery: 15, dmg: 100, hitstun: 19, blockstun: 11, kb: 5, hitbox: { x: 10, y: 60, w: 100, h: 90 }, pose: 'spinKick', move: [{ f: 2, t: 9, vx: 4 }], cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Sombrinha aberta', startup: 6, active: 7, recovery: 16, dmg: 90, launch: 12, crouch: true, hitstun: 20, blockstun: 11, kb: 3, invuln: [2, 9], hitbox: { x: -20, y: 70, w: 90, h: 120 }, pose: 'upper', umbrellaOpen: true, sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Parafuso', startup: 7, active: 7, recovery: 9, dmg: 95, type: 'high', air: true, hitstun: 18, kb: 5, hitbox: { x: -10, y: 10, w: 100, h: 80 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Dobradiça', startup: 9, active: 7, recovery: 16, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 19, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 90, h: 36 }, pose: 'sweep', move: [{ f: 4, t: 14, vx: 7 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Passo de pontapé', startup: 7, active: 7, recovery: 14, dmg: 100, hitstun: 20, blockstun: 12, kb: 7, chip: 10, hitbox: { x: 20, y: 50, w: 90, h: 70 }, pose: 'airKick', move: [{ f: 2, t: 12, vx: 11 }], sfx: 'whooshH' }),
        dS: mv({ id: 'dS', name: 'Sombrinha pião', startup: 6, active: 20, recovery: 14, dmg: 35, hits: 3, hitInterval: 7, hitstun: 12, blockstun: 8, kb: 1.5, chip: 4, reflect: true, hitbox: { x: 0, y: 40, w: 100, h: 110 }, pose: 'shield', umbrellaOpen: true, sfx: 'whoosh', fx: 'arc' }),
        aS: mv({ id: 'aS', name: 'Paraquedas', startup: 5, active: 24, recovery: 6, dmg: 60, type: 'high', air: true, hitstun: 16, kb: 3, chip: 6, glide: true, hitbox: { x: -10, y: -10, w: 80, h: 70 }, pose: 'glide', umbrellaOpen: true, sfx: 'whoosh' }),
        M: mv({ id: 'M', name: 'Bloco da Madrugada', super: true, startup: 12, active: 34, recovery: 20, dmg: 52, hits: 8, hitInterval: 4, launch: 13, hitstun: 20, blockstun: 14, kb: 1, chip: 12, invuln: [0, 14], hitbox: { x: 0, y: 30, w: 120, h: 120 }, pose: 'superRush', move: [{ f: 4, t: 14, vx: 14 }, { f: 14, t: 46, vx: 2.5 }], sfx: 'super', fx: 'arc' })
      }
    },

    mare: {
      id: 'mare', name: 'Maré Bacuri', alias: 'A Correnteza', origin: 'Beira do Rio Tocanduva, PA', style: 'Remo & rede',
      bio: 'Filha de pescadores. O remo é extensão do braço e o rio obedece quando ela chama. Lenta pra se mover, impossível de alcançar.',
      quote: 'O rio não tem pressa. Eu também não.',
      colors: { skin: '#9b6a44', torso: '#1f7a4d', arms: '#9b6a44', legs: '#1c4e9c', shoes: '#141210', accent: '#c8371d', hair: '#120c08' },
      hair: 'braid', prop: 'oar', idle: 'stance', idleOver: { na: [75, 15], fa: [25, 70], torso: 10 }, body: { height: 1.02, build: 0.95 },
      stats: { hp: 950, speed: 2.7, jumpV: -12.6, weight: 1.0, dashV: 8.5, airSpeed: 2.8, maxJumps: 1 },
      superName: 'Pororoca', superDesc: 'Invoca uma onda gigante que atravessa a roda inteira.',
      ai: { zone: 0.65, air: 0.1, grab: 0, rush: 0.2, poke: 0.6 },
      moves: {
        L: mv({ id: 'L', name: 'Remada curta', startup: 5, active: 3, recovery: 10, dmg: 50, hitstun: 13, blockstun: 9, kb: 3, hitbox: { x: 30, y: 90, w: 95, h: 30 }, pose: 'lunge', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Remo baixo', startup: 6, active: 3, recovery: 11, dmg: 45, type: 'low', crouch: true, hitstun: 12, blockstun: 8, kb: 2, hitbox: { x: 20, y: 0, w: 90, h: 30 }, pose: 'castLow', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Remada aérea', startup: 5, active: 5, recovery: 8, dmg: 50, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 20, w: 90, h: 50 }, pose: 'lunge', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Remada', startup: 11, active: 4, recovery: 18, dmg: 115, hitstun: 20, blockstun: 13, kb: 8, hitbox: { x: 20, y: 60, w: 120, h: 90 }, pose: 'swing', cancel: ['S'], sfx: 'whooshH' }),
        cH: mv({ id: 'cH', name: 'Remo rasteiro', startup: 9, active: 4, recovery: 20, dmg: 90, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 125, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Mergulho', startup: 8, active: 5, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: 0, y: -10, w: 90, h: 90 }, pose: 'overhead', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Rede de arrasto', startup: 13, active: 3, recovery: 20, dmg: 100, type: 'high', hitstun: 30, blockstun: 12, kb: 1, hitbox: { x: 20, y: 70, w: 100, h: 90 }, pose: 'overhead', sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Onda do rio', startup: 12, active: 1, recovery: 22, dmg: 80, hitstun: 16, blockstun: 11, kb: 4, chip: 8, pose: 'cast', projectile: { kind: 'wave', vx: 7, vy: 0, w: 60, h: 70, y: 40, life: 95 }, sfx: 'water' }),
        dS: mv({ id: 'dS', name: 'Marola', startup: 14, active: 1, recovery: 24, dmg: 70, type: 'low', crouch: true, knockdown: true, hitstun: 18, blockstun: 10, kb: 3, chip: 7, pose: 'castLow', projectile: { kind: 'ripple', vx: 4.2, vy: 0, w: 60, h: 30, y: 0, life: 130 }, sfx: 'water' }),
        aS: mv({ id: 'aS', name: 'Chuva', startup: 10, active: 1, recovery: 14, dmg: 70, type: 'high', air: true, hitstun: 15, kb: 3, chip: 6, pose: 'castLow', projectile: { kind: 'rain', vx: 5, vy: 5.5, w: 46, h: 46, y: 30, life: 80 }, sfx: 'water' }),
        M: mv({ id: 'M', name: 'Pororoca', super: true, startup: 22, active: 1, recovery: 28, dmg: 115, hitstun: 22, blockstun: 16, kb: 2, chip: 20, launch: 12, invuln: [0, 22], pose: 'superCast', projectile: { kind: 'pororoca', vx: 4.5, vy: 0, w: 140, h: 190, y: 0, life: 220, hits: 3, hitInterval: 10 }, sfx: 'super' })
      }
    },

    tiao: {
      id: 'tiao', name: 'Tião Sertão', alias: 'O Touro de Couro', origin: 'Serra do Vento, CE', style: 'Vaquejada de rua',
      bio: 'Vaqueiro de três gerações. Derruba boi no braço e gente no abraço. Não ginga, não corre e não desiste. Quando pega, não solta.',
      quote: 'Lá no sertão a gente não ginga. A gente agarra.',
      colors: { skin: '#8a5a3c', torso: '#6b3f22', arms: '#d9b382', legs: '#3a2a1e', shoes: '#141210', accent: '#c8371d', hair: '#2a1a10' },
      hair: 'hat', prop: null, idle: 'stance', idleOver: { na: [45, 115], fa: [35, 105], torso: 10 }, body: { height: 1.08, build: 1.28 }, mustache: true,
      stats: { hp: 1150, speed: 2.5, jumpV: -11.6, weight: 1.35, dashV: 8, airSpeed: 2.4, maxJumps: 1 },
      superName: 'Vaquejada', superDesc: 'Arranca em disparada com armadura e derruba quem estiver na frente.',
      ai: { zone: 0, air: 0.15, grab: 0.5, rush: 0.7, poke: 0.3 },
      moves: {
        L: mv({ id: 'L', name: 'Soco de ferreiro', startup: 6, active: 3, recovery: 10, dmg: 60, hitstun: 14, blockstun: 9, kb: 3.5, hitbox: { x: 20, y: 95, w: 70, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Bota baixa', startup: 6, active: 3, recovery: 11, dmg: 50, type: 'low', crouch: true, hitstun: 13, blockstun: 8, kb: 2.5, hitbox: { x: 16, y: 0, w: 72, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Cotovelada', startup: 6, active: 5, recovery: 9, dmg: 60, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Chifrada', startup: 11, active: 4, recovery: 18, dmg: 130, hitstun: 21, blockstun: 13, kb: 7, hitbox: { x: 20, y: 80, w: 80, h: 60 }, pose: 'headbutt', move: [{ f: 4, t: 14, vx: 5 }], cancel: ['S'], sfx: 'whooshH' }),
        cH: mv({ id: 'cH', name: 'Pisão de bota', startup: 9, active: 4, recovery: 22, dmg: 100, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 100, h: 34 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Peso morto', startup: 9, active: 7, recovery: 12, dmg: 120, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 4, hitbox: { x: -10, y: -10, w: 90, h: 80 }, pose: 'slam', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Golpe de peito', startup: 14, active: 4, recovery: 20, dmg: 120, hitstun: 22, blockstun: 14, kb: 9, armor: [1, 14], hitbox: { x: 10, y: 60, w: 90, h: 90 }, pose: 'charge', move: [{ f: 6, t: 16, vx: 4 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Laço de boi', startup: 7, active: 5, recovery: 26, dmg: 180, throw: { range: 78, hold: 22, vx: 10, vy: 11 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
        dS: mv({ id: 'dS', name: 'Aboio', startup: 10, active: 8, recovery: 20, dmg: 60, hitstun: 16, blockstun: 10, kb: 10, chip: 5, axe: 0.08, hitbox: { x: -20, y: 40, w: 140, h: 120 }, pose: 'shout', sfx: 'taunt', fx: 'wave' }),
        aS: mv({ id: 'aS', name: 'Queda da serra', startup: 8, active: 10, recovery: 14, dmg: 110, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 10, hitbox: { x: 0, y: -10, w: 90, h: 80 }, pose: 'slam', move: [{ f: 0, t: 18, vx: 3, vy: 7 }], sfx: 'whooshH' }),
        M: mv({ id: 'M', name: 'Vaquejada', super: true, startup: 10, active: 34, recovery: 26, dmg: 330, launch: 17, hitstun: 30, blockstun: 18, kb: 6, chip: 35, armor: [0, 44], hitbox: { x: 10, y: 30, w: 100, h: 120 }, pose: 'tackle', move: [{ f: 8, t: 44, vx: 9 }], sfx: 'super' })
      }
    },

    juvenal: {
      id: 'juvenal', name: 'Juvenal Boitatá', alias: 'O Guardião da Chama', origin: 'Pantanal de Taquari, MS', style: 'Fogo do mato',
      bio: 'Dizem que nasceu numa queimada e o fogo ficou. Carrega a serpente de luz nas costas e é o único que sabe o que o Mestre pretende fazer com a Brasa.',
      quote: 'Eu sou o fogo que ele quer apagar.',
      colors: { skin: '#5a3a28', torso: '#c8371d', arms: '#5a3a28', legs: '#e8712b', shoes: '#141210', accent: '#f2b70c', hair: '#f2b70c' },
      hair: 'flame', prop: 'fire', idle: 'sway', body: { height: 1.04, build: 1.0 },
      stats: { hp: 1000, speed: 2.9, jumpV: -12.8, weight: 1.0, dashV: 9, airSpeed: 3.0, maxJumps: 1 },
      superName: 'Boitatá Desperto', superDesc: 'A serpente de fogo atravessa a roda queimando tudo.',
      ai: { zone: 0.45, air: 0.15, grab: 0, rush: 0.35, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Chama curta', startup: 5, active: 3, recovery: 10, dmg: 55, hitstun: 13, blockstun: 9, kb: 3, hitbox: { x: 20, y: 95, w: 70, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Brasa baixa', startup: 6, active: 3, recovery: 11, dmg: 45, type: 'low', crouch: true, hitstun: 12, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 72, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Labareda aérea', startup: 5, active: 5, recovery: 8, dmg: 55, type: 'high', air: true, hitstun: 13, kb: 3, hitbox: { x: 10, y: 20, w: 70, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Rabo de fogo', startup: 9, active: 5, recovery: 16, dmg: 110, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 60, w: 110, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Labareda', startup: 7, active: 6, recovery: 18, dmg: 100, launch: 12, crouch: true, hitstun: 20, blockstun: 11, kb: 3, invuln: [2, 8], hitbox: { x: -10, y: 60, w: 80, h: 120 }, pose: 'upper', sfx: 'fire', fx: 'fire' }),
        aH: mv({ id: 'aH', name: 'Queda de brasa', startup: 8, active: 5, recovery: 10, dmg: 100, type: 'high', air: true, hitstun: 18, kb: 4, hitbox: { x: 0, y: -10, w: 90, h: 80 }, pose: 'overhead', sfx: 'whooshH' }),
        fH: mv({ id: 'fH', name: 'Bote', startup: 12, active: 4, recovery: 18, dmg: 110, type: 'high', hitstun: 20, blockstun: 12, kb: 5, burn: true, hitbox: { x: 20, y: 70, w: 80, h: 70 }, pose: 'bite', move: [{ f: 4, t: 14, vx: 8 }], sfx: 'fire' }),
        S: mv({ id: 'S', name: 'Cuspe de brasa', startup: 10, active: 1, recovery: 18, dmg: 75, hitstun: 15, blockstun: 10, kb: 4, chip: 7, burn: true, pose: 'cast', projectile: { kind: 'ember', vx: 9.5, vy: 0, w: 44, h: 44, y: 70, life: 48 }, sfx: 'fire' }),
        dS: mv({ id: 'dS', name: 'Fogo-fátuo', startup: 12, active: 1, recovery: 20, dmg: 60, launch: 11, hitstun: 20, blockstun: 10, kb: 2, chip: 5, pose: 'trap', trap: { dist: 170, life: 200, w: 70, h: 60 }, sfx: 'fire' }),
        aS: mv({ id: 'aS', name: 'Chuva de brasa', startup: 10, active: 1, recovery: 14, dmg: 70, type: 'high', air: true, hitstun: 15, kb: 3, chip: 6, burn: true, pose: 'castLow', projectile: { kind: 'ember', vx: 5, vy: 6, w: 40, h: 40, y: 30, life: 80 }, sfx: 'fire' }),
        M: mv({ id: 'M', name: 'Boitatá Desperto', super: true, startup: 24, active: 1, recovery: 30, dmg: 120, hitstun: 22, blockstun: 16, kb: 2, chip: 20, launch: 12, burn: true, invuln: [0, 24], pose: 'superCast', projectile: { kind: 'serpent', vx: 6, vy: 0, w: 150, h: 180, y: 0, life: 200, hits: 3, hitInterval: 9 }, sfx: 'super' })
      }
    },

    cinzas: {
      id: 'cinzas', name: 'Mestre Cinzas', alias: 'O Último da Roda Velha', origin: 'Porto Brabo, BA', style: 'Capoeira antiga',
      bio: 'Mestre de Zeca e guardião da Roda do Fogo há trinta anos. Perdeu a esposa, Rosa, num incêndio durante uma roda. Desde então acredita que toda festa cobra um preço — e decidiu encerrar a conta.',
      quote: 'Toda festa cobra um preço.',
      colors: { skin: '#7a4f36', torso: '#e9e2d2', arms: '#7a4f36', legs: '#cfc6b2', shoes: '#141210', accent: '#8d8a84', hair: '#d8d2c4' },
      hair: 'straw', prop: 'ash', idle: 'ginga', idleOver: { torso: 16, head: -8 }, beard: true, body: { height: 1.0, build: 0.9 },
      stats: { hp: 1050, speed: 3.1, jumpV: -13, weight: 1.0, dashV: 10, airSpeed: 3.2, maxJumps: 1 },
      superName: 'Apagar a Brasa', superDesc: 'Escurece a roda e desfere a sequência que encerrou trinta anos de festa.',
      ai: { zone: 0.3, air: 0.3, grab: 0.3, rush: 0.5, poke: 0.5 },
      moves: {
        L: mv({ id: 'L', name: 'Tapa de cinza', startup: 4, active: 3, recovery: 8, dmg: 55, hitstun: 13, blockstun: 8, kb: 2.5, hitbox: { x: 20, y: 95, w: 64, h: 34 }, pose: 'jab', cancel: ['L', 'H', 'S'], sfx: 'whoosh' }),
        cL: mv({ id: 'cL', name: 'Pisão', startup: 5, active: 3, recovery: 10, dmg: 45, type: 'low', crouch: true, hitstun: 13, blockstun: 8, kb: 2, hitbox: { x: 16, y: 0, w: 70, h: 32 }, pose: 'cKick', cancel: ['H', 'S'], sfx: 'whoosh' }),
        aL: mv({ id: 'aL', name: 'Chapa', startup: 5, active: 5, recovery: 8, dmg: 55, type: 'high', air: true, hitstun: 14, kb: 3, hitbox: { x: 10, y: 20, w: 66, h: 50 }, pose: 'airKick', sfx: 'whoosh' }),
        H: mv({ id: 'H', name: 'Meia-lua de cinzas', startup: 9, active: 5, recovery: 15, dmg: 115, hitstun: 20, blockstun: 12, kb: 6, hitbox: { x: 10, y: 70, w: 110, h: 80 }, pose: 'spinKick', cancel: ['S'], sfx: 'whooshH', fx: 'arc' }),
        cH: mv({ id: 'cH', name: 'Rasteira velha', startup: 7, active: 4, recovery: 17, dmg: 95, type: 'low', crouch: true, knockdown: true, hitstun: 20, blockstun: 12, kb: 4, hitbox: { x: 10, y: 0, w: 105, h: 30 }, pose: 'sweep', sfx: 'whooshH' }),
        aH: mv({ id: 'aH', name: 'Armada', startup: 7, active: 6, recovery: 10, dmg: 105, type: 'high', air: true, hitstun: 18, kb: 5, hitbox: { x: 0, y: 10, w: 90, h: 80 }, pose: 'airSpin', spin: [0, 360], sfx: 'whooshH', fx: 'arc' }),
        fH: mv({ id: 'fH', name: 'Cabeçada', startup: 10, active: 4, recovery: 16, dmg: 105, type: 'high', hitstun: 18, blockstun: 12, kb: 5, hitbox: { x: 20, y: 90, w: 60, h: 50 }, pose: 'headbutt', move: [{ f: 4, t: 13, vx: 6 }], sfx: 'whooshH' }),
        S: mv({ id: 'S', name: 'Sopro de cinza', startup: 11, active: 1, recovery: 20, dmg: 90, hitstun: 17, blockstun: 11, kb: 4, chip: 9, pose: 'cast', projectile: { kind: 'ash', vx: 5.5, vy: 0, w: 70, h: 80, y: 40, life: 110 }, sfx: 'whooshH' }),
        dS: mv({ id: 'dS', name: 'Chamada', startup: 8, active: 5, recovery: 24, dmg: 150, throw: { range: 76, hold: 26, vx: 8, vy: 12, drain: 0.3 }, hitstun: 20, pose: 'grab', sfx: 'grab' }),
        aS: mv({ id: 'aS', name: 'Tesoura', startup: 6, active: 10, recovery: 10, dmg: 95, type: 'high', air: true, knockdown: true, hitstun: 20, kb: 5, chip: 8, hitbox: { x: 10, y: 0, w: 80, h: 60 }, pose: 'dive', move: [{ f: 0, t: 16, vx: 5, vy: 6 }], sfx: 'whooshH' }),
        M: mv({ id: 'M', name: 'Apagar a Brasa', super: true, startup: 14, active: 32, recovery: 22, dmg: 80, hits: 5, hitInterval: 6, launch: 14, hitstun: 24, blockstun: 16, kb: 1.5, chip: 18, invuln: [0, 16], dark: true, hitbox: { x: -10, y: 20, w: 130, h: 140 }, pose: 'superRush', move: [{ f: 6, t: 14, vx: 12 }, { f: 14, t: 46, vx: 3 }], sfx: 'super', fx: 'arc' })
      }
    }
  };

  M.ROSTER = ['zeca', 'bia', 'mare', 'tiao', 'juvenal', 'cinzas'];
  for (const id in M.FIGHTERS) {
    const f = M.FIGHTERS[id];
    for (const k in f.moves) { const m = f.moves[k]; m.total = m.startup + m.active + m.recovery; m.reach = m.hitbox ? m.hitbox.x + m.hitbox.w : (m.throw ? m.throw.range : 0); }
  }
})();
