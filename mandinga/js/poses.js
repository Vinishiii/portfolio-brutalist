'use strict';
// ============================================================
// POSES — rig esquelético. Ângulos em graus:
//  braços/pernas: 0 = apontando pra baixo, + = pra frente, 180 = pra cima.
//  na/fa = braço perto/longe [ombro, cotovelo]; nl/fl = perna [quadril, joelho].
//  torso: inclinação (+ = pra frente). rot: rotação do corpo inteiro.
// ============================================================
M.poses = (function () {
  const BASE = { hx: 0, hy: 0, rot: 0, torso: 6, head: 0, na: [55, 95], fa: [35, 80], nl: [18, 12], fl: [-18, 16] };
  const P = o => Object.assign({}, BASE, o);
  const KEYS = Object.keys(BASE);
  function blend(a, b, t) {
    const o = {};
    for (const k of KEYS) {
      const va = a[k], vb = b[k];
      if (Array.isArray(va)) o[k] = [va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t];
      else o[k] = va + (vb - va) * t;
    }
    return o;
  }
  const S = {
    idle: P({}),
    breatheB: P({ hy: 2, na: [52, 92], fa: [33, 78] }),
    gingaA: P({ hy: 3, torso: 12, na: [70, 110], fa: [20, 50], nl: [32, 22], fl: [-38, 14] }),
    gingaB: P({ hy: 3, torso: -4, na: [15, 55], fa: [75, 100], nl: [-32, 18], fl: [30, 26] }),
    bounceA: P({ hy: 0, na: [60, 100], fa: [40, 85] }),
    bounceB: P({ hy: 6, nl: [20, 22], fl: [-20, 26], na: [50, 90], fa: [30, 75] }),
    swayA: P({ torso: 12, hy: 2, na: [50, 100], fa: [40, 90], head: -6 }),
    swayB: P({ torso: -2, hy: 2, na: [60, 90], fa: [25, 70], head: 6 }),
    walkA: P({ nl: [28, 10], fl: [-22, 25], na: [45, 90], fa: [45, 85] }),
    walkB: P({ nl: [-22, 25], fl: [28, 10], na: [60, 100], fa: [30, 70] }),
    crouch: P({ hy: 36, torso: 18, na: [50, 95], fa: [30, 85], nl: [70, 125], fl: [58, 120] }),
    jump: P({ na: [120, 25], fa: [100, 35], nl: [45, 85], fl: [-12, 45], torso: 2 }),
    fall: P({ na: [85, 35], fa: [60, 45], nl: [22, 55], fl: [-22, 35], torso: 8 }),
    dash: P({ torso: 28, nl: [52, 8], fl: [-42, 22], na: [-30, 20], fa: [-20, 15], head: -10 }),
    backdash: P({ torso: -18, nl: [-30, 22], fl: [32, 12], na: [70, 110], fa: [60, 105] }),
    land: P({ hy: 14, torso: 14, na: [40, 80], fa: [30, 70], nl: [40, 60], fl: [-10, 50] }),
    hurtHi: P({ hx: -5, torso: -22, head: -22, na: [-35, -10], fa: [55, 20], nl: [12, 12], fl: [-20, 18] }),
    hurtLo: P({ hy: 10, torso: 26, head: 14, na: [20, 30], fa: [10, 25], nl: [35, 60], fl: [-10, 40] }),
    hurtAir: P({ rot: -28, torso: -28, head: -15, na: [-60, -20], fa: [-85, -15], nl: [30, 10], fl: [-15, 25] }),
    block: P({ torso: 4, na: [85, 105], fa: [75, 115], nl: [14, 12], fl: [-14, 16] }),
    blockC: P({ hy: 36, torso: 16, na: [80, 100], fa: [70, 110], nl: [70, 125], fl: [58, 120] }),
    down: P({ rot: -90, hy: 60, torso: -10, head: -20, na: [-40, -10], fa: [30, 20], nl: [8, 6], fl: [-6, 10] }),
    ko: P({ rot: -92, hy: 60, torso: -14, head: -30, na: [-80, -20], fa: [60, 30], nl: [14, 10], fl: [-10, 14] }),
    getup: P({ rot: -40, hy: 40, torso: 30, na: [-60, -20], fa: [70, 30], nl: [60, 100], fl: [20, 60] }),
    dodge: P({ hy: 14, torso: -32, head: -12, na: [30, 60], fa: [-25, 10], nl: [42, 12], fl: [-45, 14] }),
    dodgeF: P({ hy: 30, torso: 55, head: 5, na: [-35, 20], fa: [-30, 15], nl: [60, 30], fl: [-35, 40] }),
    taunt: P({ torso: -6, head: 12, na: [95, 70], fa: [95, 70] }),
    tauntB: P({ torso: -8, head: 16, na: [80, 40], fa: [80, 40], hy: 4 }),
    win: P({ torso: -6, na: [175, 5], fa: [170, 10], hy: -4 }),
    winB: P({ torso: -8, na: [165, -5], fa: [160, 0], hy: 2 }),
    intro: P({ torso: 2, na: [20, 20], fa: [15, 15], nl: [10, 6], fl: [-10, 8] }),
    throwHold: P({ torso: 22, na: [92, -5], fa: [88, -5], nl: [30, 10], fl: [-30, 18] }),
    thrown: P({ rot: 60, torso: -20, na: [-70, -20], fa: [100, 10], nl: [40, 20], fl: [-30, 30] }),
    // ---- ataques: [preparação, golpe] ----
    jab: [P({ torso: 4, na: [40, 110], fa: [35, 85] }), P({ torso: 18, na: [96, -4], fa: [25, 80], nl: [26, 8], fl: [-26, 22], head: 4 })],
    cKick: [P({ hy: 36, torso: 20, na: [50, 95], fa: [30, 85], nl: [60, 120], fl: [58, 120] }), P({ hy: 36, torso: 30, na: [-20, 20], fa: [40, 80], nl: [88, 0], fl: [60, 125] })],
    airKick: [P({ na: [110, 30], fa: [90, 40], nl: [30, 80], fl: [-10, 50] }), P({ torso: 12, na: [-30, 10], fa: [110, 20], nl: [62, 0], fl: [-25, 70] })],
    spinKick: [P({ torso: -12, hy: 8, na: [20, 60], fa: [-40, 10], nl: [20, 30], fl: [-30, 40] }), P({ torso: -30, hy: -4, head: -10, na: [-70, 0], fa: [150, 0], nl: [128, 0], fl: [-25, 30] })],
    sweep: [P({ hy: 34, torso: 35, na: [-30, 10], fa: [70, 20], nl: [60, 110], fl: [55, 120] }), P({ hy: 48, torso: 50, head: -15, na: [-60, 0], fa: [95, -10], nl: [92, 0], fl: [70, 130] })],
    airSpin: [P({ torso: 10, na: [100, 40], fa: [80, 30], nl: [30, 70], fl: [-20, 40] }), P({ torso: 30, na: [-80, 0], fa: [140, 0], nl: [120, 0], fl: [-40, 30] })],
    headbutt: [P({ torso: -15, head: -20, na: [-30, 20], fa: [-25, 20], nl: [10, 10], fl: [-20, 20] }), P({ torso: 52, head: 28, na: [-50, 25], fa: [-45, 20], nl: [55, 8], fl: [-45, 25] })],
    lunge: [P({ torso: -8, na: [20, 120], fa: [-30, 30], nl: [10, 10], fl: [-20, 20] }), P({ torso: 24, na: [98, 0], fa: [-40, 20], nl: [55, 8], fl: [-45, 25], head: 5 })],
    swing: [P({ torso: -15, na: [160, -30], fa: [130, -20], nl: [10, 10], fl: [-30, 20] }), P({ torso: 35, na: [70, -10], fa: [50, -5], nl: [55, 8], fl: [-45, 25], head: 10 })],
    overhead: [P({ torso: -20, na: [175, -20], fa: [60, 80], hy: -6 }), P({ torso: 40, na: [95, -20], fa: [30, 60], nl: [45, 10], fl: [-35, 25], head: 20 })],
    upper: [P({ hy: 20, torso: 30, na: [-20, 20], fa: [40, 80], nl: [50, 70], fl: [20, 50] }), P({ hy: -8, torso: -12, head: -8, na: [60, 110], fa: [-30, 20], nl: [20, 10], fl: [-25, 25] })],
    riseKick: [P({ hy: 14, torso: 16, na: [40, 80], fa: [30, 60], nl: [40, 60], fl: [-10, 30] }), P({ hy: -10, torso: -24, head: -10, na: [-50, 0], fa: [-60, 0], nl: [162, 0], fl: [-14, 30] })],
    dive: [P({ torso: 10, na: [120, 20], fa: [100, 20], nl: [20, 60], fl: [-10, 40] }), P({ torso: 38, head: 10, na: [-60, 10], fa: [-50, 10], nl: [102, 0], fl: [44, 0] })],
    cast: [P({ torso: -6, na: [-40, 30], fa: [40, 110], nl: [10, 10], fl: [-25, 20] }), P({ torso: 16, na: [92, -2], fa: [-30, 30], nl: [40, 8], fl: [-40, 22], head: 4 })],
    castLow: [P({ hy: 20, torso: 20, na: [20, 60], fa: [40, 110], nl: [40, 60], fl: [20, 50] }), P({ hy: 34, torso: 30, na: [60, -10], fa: [-30, 30], nl: [70, 125], fl: [58, 120] })],
    glide: [P({ na: [172, 0], fa: [60, 60], nl: [12, 22], fl: [-12, 22], torso: 0 }), P({ na: [172, 0], fa: [70, 60], nl: [25, 30], fl: [-18, 30], torso: 4 })],
    shield: [P({ torso: 4, na: [80, 40], fa: [40, 80] }), P({ torso: -4, na: [95, 0], fa: [20, 60], nl: [20, 10], fl: [-20, 20] })],
    shout: [P({ torso: -4, head: -10, na: [60, 110], fa: [-20, 10] }), P({ torso: -14, head: -24, na: [65, 120], fa: [-50, 0], hy: -4, nl: [20, 8], fl: [-25, 20] })],
    charge: [P({ torso: 10, head: 6, na: [70, 120], fa: [70, 120] }), P({ torso: 38, head: 14, na: [80, 100], fa: [75, 105], nl: [52, 8], fl: [-45, 22] })],
    tackle: [P({ torso: 20, na: [60, 60], fa: [50, 60] }), P({ torso: 62, head: 10, na: [100, -10], fa: [95, -10], nl: [60, 10], fl: [-50, 30] })],
    bite: [P({ torso: -12, head: -16, na: [-30, 20], fa: [-20, 20] }), P({ torso: 58, head: 34, na: [-55, 10], fa: [-50, 10], nl: [60, 8], fl: [-45, 25] })],
    trap: [P({ hy: 14, torso: 24, na: [40, 90], fa: [20, 60], nl: [45, 70], fl: [10, 40] }), P({ hy: 30, torso: 44, na: [70, -30], fa: [-20, 20], nl: [70, 120], fl: [50, 110] })],
    slam: [P({ torso: -10, na: [170, 0], fa: [165, 0], nl: [20, 60], fl: [-10, 40] }), P({ torso: 30, head: 12, na: [80, -20], fa: [75, -20], nl: [40, 30], fl: [-20, 40] })],
    grab: [P({ torso: 8, na: [60, 80], fa: [50, 70], nl: [20, 10], fl: [-20, 20] }), P({ torso: 26, na: [95, -5], fa: [90, -5], nl: [50, 8], fl: [-40, 22] })],
    superSpin: [P({ hy: 10, torso: -10, na: [-40, 0], fa: [-40, 0], nl: [20, 30], fl: [-20, 30] }), P({ torso: -20, na: [-90, 0], fa: [160, 0], nl: [120, 0], fl: [-30, 20] })],
    superRush: [P({ torso: -10, na: [30, 110], fa: [-40, 20] }), P({ torso: 30, na: [100, 0], fa: [-50, 20], nl: [55, 8], fl: [-45, 25] })],
    superCast: [P({ torso: -20, na: [150, 30], fa: [150, 30], hy: -4 }), P({ torso: 20, na: [90, 0], fa: [90, 0], nl: [40, 8], fl: [-40, 22] })]
  };

  // Pose de "parado" conforme o estilo do lutador
  function idlePose(style, t, over) {
    const s = Math.sin(t);
    const k = (s + 1) / 2;
    let pose;
    switch (style) {
      case 'ginga': pose = blend(S.gingaA, S.gingaB, M.easeInOut(k)); break;
      case 'bounce': pose = blend(S.bounceA, S.bounceB, Math.abs(Math.sin(t * 1.6))); break;
      case 'sway': pose = blend(S.swayA, S.swayB, M.easeInOut(k)); break;
      default: pose = blend(S.idle, S.breatheB, k);
    }
    if (over) { pose = Object.assign({}, pose); for (const key in over) pose[key] = Array.isArray(over[key]) ? [over[key][0] + (Array.isArray(pose[key]) ? (pose[key][0] - BASE[key][0]) : 0), over[key][1] + (Array.isArray(pose[key]) ? (pose[key][1] - BASE[key][1]) : 0)] : over[key] + (pose[key] - BASE[key]); }
    return pose;
  }
  function idleSpeed(style) { return style === 'ginga' ? 0.055 : style === 'bounce' ? 0.1 : style === 'sway' ? 0.035 : 0.04; }

  // Pose de um ataque conforme fase (0..1 em cada fase)
  function attackPose(name, phase, t, from) {
    const pair = S[name];
    if (!Array.isArray(pair)) return S.idle;
    const [wind, strike] = pair;
    if (phase === 'startup') {
      if (t < 0.45) return blend(from || S.idle, wind, M.easeOut(t / 0.45));
      return blend(wind, strike, M.easeIn((t - 0.45) / 0.55));
    }
    if (phase === 'active') return strike;
    return blend(strike, S.idle, M.easeInOut(t));
  }

  return { S, P, blend, idlePose, idleSpeed, attackPose };
})();
