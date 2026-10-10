'use strict';
// ============================================================
// IA — intenções por situação, personalidade por lutador,
// dificuldade por perfil. Produz um "input" sintético por frame.
// ============================================================
M.AI = (function () {
  const PROFILES = {
    novato: { react: 0.06, think: 22, aggro: 0.38, block: 0.2, dodge: 0.03, combo: 0.15, mistake: 0.2, antiair: 0.1, superUse: 0.25 },
    brabo: { react: 0.42, think: 12, aggro: 0.55, block: 0.6, dodge: 0.25, combo: 0.6, mistake: 0.08, antiair: 0.55, superUse: 0.7 },
    lendario: { react: 0.82, think: 5, aggro: 0.78, block: 0.85, dodge: 0.5, combo: 0.95, mistake: 0.01, antiair: 0.85, superUse: 0.95 }
  };
  function make(difficulty, def, extra) {
    const p = Object.assign({}, PROFILES[difficulty] || PROFILES.brabo, extra || {});
    p.pers = def.ai;
    return { p, intent: 'wait', timer: 0, arg: null, seq: [], crouchBlock: false, started: false, tutorial: null, tutT: 0 };
  }
  function blank() {
    return { held: { up: false, down: false, left: false, right: false, light: false, heavy: false, special: false, ginga: false, mandinga: false, taunt: false, throw: false }, pressed: { up: false, down: false, left: false, right: false, light: false, heavy: false, special: false, ginga: false, mandinga: false, taunt: false, throw: false }, dashLeft: false, dashRight: false };
  }
  function set(ai, intent, timer, arg) { ai.intent = intent; ai.timer = timer; ai.arg = arg; ai.started = false; return intent; }
  function weighted(w) { let s = 0; for (const e of w) s += e[1]; let r = Math.random() * s; for (const e of w) { r -= e[1]; if (r <= 0) return e[0]; } return w[w.length - 1][0]; }

  function decide(f, opp, G, ai) {
    const p = ai.p, pers = p.pers;
    const dist = Math.abs(opp.x - f.x);
    const oppAttacking = opp.state === 'attack' && opp.move && !opp.move.projectile && opp.mf <= opp.move.startup + opp.move.active;
    const oppAir = !opp.grounded && opp.state !== 'hitstun';
    const oppDown = opp.state === 'knockdown' || opp.state === 'getup';
    const oppStunned = (opp.state === 'hitstun' || opp.state === 'blockstun') && opp.t > 4;
    const r = Math.random();
    const superReady = G.superReady(f);
    if (f.state === 'hitstun' && G.canEscape(f) && Math.random() < p.dodge * 1.5) return set(ai, 'escape', 4);
    if (f.state === 'knockdown' && f.t > 6 && f.t < 34 && Math.random() < p.dodge * 2) return set(ai, 'roll', 2);
    const proj = G.projectiles.find(pr => pr.owner !== f && Math.sign(pr.vx) === Math.sign(f.x - pr.x) && Math.abs(pr.x - f.x) < 280);
    if (oppAttacking && dist < opp.move.reach + 70 && r < p.react) {
      if (f.def.moves.bH && f.def.moves.bH.counter && f.actionable && Math.random() < 0.5) return set(ai, 'counter', 6);
      if (f.dodgeCd <= 0 && Math.random() < p.dodge) return set(ai, 'dodge', 14);
      return set(ai, 'block', 26, opp.move.type);
    }
    if (proj && r < p.react) { if (Math.random() < 0.4 && pers.air > 0.1) return set(ai, 'jumpIn', 36); return set(ai, 'block', 34, proj.mv.type); }
    if (oppAir && dist < 190 && opp.y < f.y - 30 && r < p.antiair) return set(ai, 'antiair', 12);
    if (superReady && Math.random() < p.superUse && (dist < 220 || oppStunned)) return set(ai, 'super', 20);
    if (oppStunned && dist < 150 && Math.random() < p.combo) return set(ai, 'combo', 36);
    if (oppDown) { if (dist > 220) return set(ai, 'approach', 20); if (Math.random() < 0.12 * (1 - p.aggro) && dist > 160) return set(ai, 'taunt', 60); return set(ai, 'wait', 16); }
    const w = [];
    if (dist > 340) { w.push(['approach', 0.5 + pers.rush * 0.6]); w.push(['dashIn', pers.rush * 0.5]); w.push(['projectile', pers.zone * 2.2]); w.push(['jumpIn', pers.air]); w.push(['wait', 0.12]); }
    else if (dist > 175) { w.push(['approach', 0.4 + pers.rush * 0.5]); w.push(['projectile', pers.zone]); w.push(['jumpIn', pers.air * 1.3]); w.push(['poke', pers.poke * 0.8]); w.push(['wait', 0.18]); w.push(['retreat', pers.zone * 0.8]); w.push(['dashIn', pers.rush * 0.6]); w.push(['trap', pers.zone * 0.6]); }
    else { w.push(['attack', 0.7 + pers.rush * 0.7 + p.aggro * 0.5]); w.push(['grab', pers.grab * 1.2 + (opp.held.back ? 0.5 : 0.15)]); w.push(['block', 0.35 * (1 - p.aggro)]); w.push(['retreat', 0.2 + pers.zone * 0.6]); w.push(['poke', pers.poke * 0.5]); w.push(['jumpIn', pers.air * 0.5]); }
    if (Math.random() < p.mistake) w.push(['wait', 1.2]);
    return set(ai, weighted(w), 18);
  }

  function chooseAttack(f, dist) {
    const mv = f.def.moves, w = [];
    const inR = m => m && m.hitbox && m.reach + 10 >= dist;
    if (inR(mv.L)) w.push(['L', 2]); if (inR(mv.cL)) w.push(['cL', 1.2]); if (inR(mv.H)) w.push(['H', 1.4]); if (inR(mv.cH)) w.push(['cH', 1]);
    if (mv.fH && (inR(mv.fH) || (mv.fH.move && dist < 200))) w.push(['fH', 0.9]);
    if (mv.S && mv.S.hitbox && (inR(mv.S) || (mv.S.move && dist < 230))) w.push(['S', 1.1]);
    if (mv.dS && mv.dS.hitbox && inR(mv.dS) && !mv.dS.axe) w.push(['dS', 0.5]);
    if (mv.dS && mv.dS.axe && dist < 150) w.push(['dS', 0.6]);
    if (mv.bH && mv.bH.hitbox && inR(mv.bH)) w.push(['bH', 0.7]);
    if (mv.bH && mv.bH.projectile && dist > 150) w.push(['bH', 0.8]);
    if (mv.bH && mv.bH.teleport && dist > 120) w.push(['bH', 0.3]);
    if (mv.fS && mv.fS.hitbox && (inR(mv.fS) || mv.fS.teleport)) w.push(['fS', mv.fS.teleport ? 0.5 : 0.8]);
    if (mv.fS && mv.fS.projectile && dist > 180) w.push(['fS', 0.6]);
    if (mv.fS && mv.fS.throw && dist < 260) w.push(['fS', 0.9]);
    if (mv.fS && mv.fS.trail && dist > 160) w.push(['fS', 0.5]);
    if (mv.fS && mv.fS.heal && f.hp < f.maxHp * 0.5 && dist > 260) w.push(['fS', 1.2]);
    if (!w.length) return dist < 220 ? 'fH' : 'L';
    return weighted(w);
  }
  function pressMove(inp, f, id) {
    const h = inp.held, pr = inp.pressed;
    const fwdDir = f.facing === 1 ? 'right' : 'left';
    if (id[0] === 'c') h.down = true;
    if (id === 'fH' || id === 'fS') h[fwdDir] = true;
    if (id === 'bH') h[fwdDir === 'right' ? 'left' : 'right'] = true;
    if (id === 'dS') h.down = true;
    const btn = id.endsWith('L') ? 'light' : id.endsWith('H') ? 'heavy' : id === 'M' ? 'mandinga' : 'special';
    pr[btn] = true; h[btn] = true;
  }

  function inputFor(f, opp, G, ai) {
    const inp = blank();
    if (!ai) return inp;
    if (ai.tutorial) return tutorialInput(f, opp, G, ai, inp);
    const h = inp.held, pr = inp.pressed;
    const fwd = opp.x > f.x ? 'right' : 'left', back = fwd === 'right' ? 'left' : 'right';
    const dist = Math.abs(opp.x - f.x);
    if (ai.timer <= 0) decide(f, opp, G, ai); else ai.timer--;
    const first = !ai.started; ai.started = true;
    switch (ai.intent) {
      case 'approach': h[fwd] = true; if (dist < 110) ai.timer = 0; break;
      case 'dashIn': if (first && f.actionable) { if (fwd === 'right') inp.dashRight = true; else inp.dashLeft = true; } h[fwd] = true; if (f.state === 'dash' && dist < 170 && f.def.moves.dH && Math.random() < ai.p.combo) { pr.heavy = true; ai.timer = 0; } else if (dist < 120) ai.timer = 0; break;
      case 'retreat': h[back] = true; if (Math.random() < 0.3) h.down = true; break;
      case 'wait': if (Math.random() < 0.5) h[back] = true; break;
      case 'block': if (first) ai.crouchBlock = ai.arg === 'low' || (ai.arg !== 'high' && Math.random() < 0.35); h[back] = true; if (ai.crouchBlock) h.down = true; break;
      case 'dodge': {
        const ready = !(opp.state === 'attack' && opp.move && opp.mf < opp.move.startup - 3);
        if (ready && f.actionable) { pr.ginga = true; if (Math.random() < 0.4) h[fwd] = true; ai.timer = 0; }
        else h[back] = true;
        break;
      }
      case 'jumpIn': {
        if (f.actionable && first) { pr.up = true; h[fwd] = true; }
        else if (!f.grounded) { h[fwd] = true; if (dist < 140 && f.airActs < 1 && opp.y > f.y) { if (Math.random() < 0.5) pr.heavy = true; else pr.light = true; } }
        else if (f.grounded && !first) ai.timer = 0;
        break;
      }
      case 'antiair': {
        if (f.actionable) { const mv = f.def.moves; if (mv.dS && mv.dS.launch && !mv.dS.throw) pressMove(inp, f, 'dS'); else pressMove(inp, f, 'cH'); ai.timer = 0; }
        break;
      }
      case 'poke': case 'attack': {
        if (f.actionable) { const id = chooseAttack(f, dist); pressMove(inp, f, id); if ((id === 'S' || id === 'dS') && G.axeSide(f) >= 0.5 && Math.random() < 0.35) pr.heavy = true; ai.seq = M.choice([['L', 'H', 'S'], ['L', 'L', 'L', 'S'], ['L', 'L', 'H', 'S'], ['cL', 'cH', 'S'], ['L', 'H']]); set(ai, 'combo', 30); ai.started = true; }
        else if (f.state === 'attack') { /* esperando */ } else h[fwd] = true;
        break;
      }
      case 'combo': {
        const stunned = opp.state === 'hitstun' || opp.state === 'blockstun' || opp.state === 'thrown';
        if (f.state === 'attack' && f.moveHit && f.move.launch && !f.move.super && f.grounded && Math.random() < ai.p.combo * 0.6) { pr.up = true; h[fwd] = true; ai.seq = ['aL', 'aH']; break; }
        if (!f.grounded && f.airActs < 1 && ai.seq.length && ai.seq[0][0] === 'a' && opp.state === 'hitstun' && dist < 130) { const id = ai.seq.shift(); pr[id === 'aL' ? 'light' : 'heavy'] = true; break; }
        if (f.state === 'attack' && (f.moveHit || f.move.followAny) && f.move.follow && f.mf > f.move.startup + f.move.active && Math.random() < ai.p.combo * 0.3) { pr.special = true; h.special = true; }
        else if (f.state === 'attack' && f.moveHit && f.move.cancel && G.superReady(f) && Math.random() < ai.p.superUse * 0.4) { pr.mandinga = true; }
        else if (f.state === 'attack' && (f.moveHit || f.moveBlocked) && f.move.cancel && ai.seq.length && Math.random() < ai.p.combo) { pressMove(inp, f, ai.seq.shift()); }
        else if (f.actionable) { if (stunned && dist < 160 && ai.seq.length && Math.random() < ai.p.combo) pressMove(inp, f, ai.seq.shift()); else if (!stunned) ai.timer = 0; else h[fwd] = true; }
        break;
      }
      case 'grab': {
        const mv = f.def.moves; const id = mv.S && mv.S.throw ? 'S' : (mv.dS && mv.dS.throw ? 'dS' : 'TH');
        if (dist < mv[id].throw.range - 6 && f.actionable) { if (id === 'TH') { pr.throw = true; h.throw = true; } else pressMove(inp, f, id); ai.timer = 0; } else h[fwd] = true;
        break;
      }
      case 'escape': { if (f.state === 'hitstun') pr.ginga = true; ai.timer = 0; break; }
      case 'counter': { if (f.actionable) pressMove(inp, f, 'bH'); ai.timer = 0; break; }
      case 'roll': { if (f.state === 'knockdown') { const away = Math.random() < 0.6; pr[(opp.x > f.x) === away ? 'left' : 'right'] = true; } ai.timer = 0; break; }
      case 'projectile': {
        const mine = G.projectiles.filter(p => p.owner === f).length;
        if (f.actionable && mine === 0 && G.axeSide(f) >= 0.6 && Math.random() < 0.3 && f.def.moves.S && f.def.moves.S.projectile) { pressMove(inp, f, 'S'); pr.heavy = true; set(ai, 'wait', 20); break; }
        const mv = f.def.moves;
        if (mv.S && mv.S.buff) { if (f.actionable && !(f.ritmo > 0) && dist > 200) { pressMove(inp, f, 'S'); set(ai, 'wait', 10); } else ai.timer = 0; break; }
        if (!(mv.S && mv.S.projectile)) { ai.timer = 0; break; }
        if (f.actionable && mine === 0) { const low = mv.dS && mv.dS.projectile && Math.random() < 0.35; pressMove(inp, f, low ? 'dS' : 'S'); set(ai, 'wait', 20); }
        break;
      }
      case 'trap': {
        const mv = f.def.moves;
        if (!(mv.dS && mv.dS.trap) || G.traps.some(t => t.owner === f)) { ai.timer = 0; break; }
        if (f.actionable) { pressMove(inp, f, 'dS'); set(ai, 'wait', 16); }
        break;
      }
      case 'super': {
        if (f.actionable || (f.state === 'attack' && f.moveHit && f.move.cancel)) { pr.mandinga = true; ai.timer = 0; }
        else if (f.state !== 'attack') h[fwd] = true;
        break;
      }
      case 'taunt': if (f.actionable && first) pr.taunt = true; if (f.state !== 'taunt' && !first) ai.timer = 0; break;
    }
    return inp;
  }

  // Comportamento do Mestre no treino
  function tutorialInput(f, opp, G, ai, inp) {
    const h = inp.held, pr = inp.pressed;
    const fwd = opp.x > f.x ? 'right' : 'left';
    const dist = Math.abs(opp.x - f.x);
    ai.tutT++;
    const mode = ai.tutorial;
    if (mode === 'passive') {
      if (dist > 260 && ai.tutT % 3 !== 0) h[fwd] = true;
      return inp;
    }
    if (mode === 'attack') {
      if (dist > 120) { h[fwd] = true; return inp; }
      if (f.actionable && ai.tutT % 70 === 0) { const id = M.choice(['L', 'H', 'cL', 'cH', 'fH']); pressMove(inp, f, id); }
      return inp;
    }
    if (mode === 'guard') {
      if (dist > 140) { h[fwd] = true; return inp; }
      h[opp.x > f.x ? 'left' : 'right'] = true; if (ai.tutT % 80 < 40) h.down = true;
      return inp;
    }
    if (mode === 'dummy') {
      if (dist > 120) { h[fwd] = true; return inp; }
      if (f.actionable && ai.tutT % 95 === 0) pressMove(inp, f, 'H');
      return inp;
    }
    return inp;
  }

  return { PROFILES, make, blank, inputFor };
})();
