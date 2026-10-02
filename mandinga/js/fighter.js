'use strict';
// ============================================================
// FIGHTER — máquina de estados, física, golpes, defesa, ginga
// ============================================================
M.Fighter = class Fighter {
  constructor(def, side, ctrl) {
    this.def = def; this.side = side; this.ctrl = ctrl; // 'human' | 'cpu' | 'dummy'
    this.mods = { hp: 1, dmg: 1, speed: 1, dodgeCd: 1, beat: 1, axe: 1, chip: 1, beatDmg: 1, regen: 0 };
    this.patuas = []; this.ai = null; this.pose = M.poses.S.intro;
    this.reset(300, 1);
  }
  applyMods() { this.maxHp = Math.round(this.def.stats.hp * this.mods.hp); }
  reset(x, facing) {
    this.applyMods();
    this.hp = this.maxHp; this.dmgTrail = this.hp;
    this.x = x; this.y = M.GROUND; this.vx = 0; this.vy = 0; this.facing = facing;
    this.state = 'intro'; this.t = 0; this.move = null; this.mf = 0; this.grounded = true;
    this.crouching = false; this.hitstop = 0; this.flash = 0; this.combo = 0; this.comboDmg = 0; this.comboShow = 0;
    this.invuln = 0; this.dodgeCd = 0; this.burn = 0; this.jumps = 0; this.airActs = 0;
    this.buf = {}; this.recent = []; this.animT = Math.random() * 6;
    this.held = { fwd: false, back: false, down: false, up: false };
    this.launched = false; this.kdPending = false; this.hurtKind = 'hi'; this.extraRec = 0;
    this.superFlash = 0; this.armorNow = false; this.throwing = null; this.threw = false; this.throwT = 0;
    this.forwardDodge = false; this.poseFrom = M.poses.S.idle; this.moveHit = false; this.spawned = false;
    this.hitIds = new Set(); this.hitCount = 0; this.lastHitFrame = -99; this.dodgedBy = null;
    this.stats = this.stats || { hits: 0, blocks: 0, perfect: 0, supers: 0, taunts: 0, jumps: 0, landed: {}, dmg: 0 };
    this.updatePose();
  }
  get neutral() { return this.state === 'idle' || this.state === 'walk' || this.state === 'crouch' || this.state === 'land'; }
  get actionable() { return this.neutral && this.grounded && !(this.state === 'land' && this.t > 0); }

  hurtbox() {
    const h = this.def.body.height; let top = 150 * h, w = 58 * (this.def.body.build > 1.1 ? 1.15 : 1);
    if (this.crouching || this.state === 'crouch') top = 96 * h;
    if (this.state === 'knockdown' || this.state === 'ko' || this.state === 'getup') { top = 42; w = 90; }
    else if (!this.grounded) top = 130 * h;
    return { x: this.x - w / 2, y: this.y - top, w, h: top };
  }
  activeHitbox() {
    if (this.state !== 'attack' || !this.move || !this.move.hitbox || this.throwing) return null;
    const mv = this.move, f = this.mf;
    if (f <= mv.startup || f > mv.startup + mv.active) return null;
    const hb = mv.hitbox; const x = this.facing === 1 ? this.x + hb.x : this.x - hb.x - hb.w;
    return { x, y: this.y - hb.y - hb.h, w: hb.w, h: hb.h };
  }
  canHitAgain(target) {
    const mv = this.move;
    if (mv.hits && mv.hits > 1) return this.hitCount < mv.hits && this.mf - this.lastHitFrame >= mv.hitInterval;
    return !this.hitIds.has(target);
  }
  canBlock(mv) {
    if (!this.grounded || !this.held.back) return false;
    if (!(this.state === 'idle' || this.state === 'walk' || this.state === 'crouch' || this.state === 'blockstun' || this.state === 'land')) return false;
    if (mv.type === 'low' && !this.held.down) return false;
    if (mv.type === 'high' && this.held.down) return false;
    return true;
  }

  // ---------------- atualização por frame ----------------
  update(inp, opp, G) {
    this.animT += M.poses.idleSpeed(this.def.idle);
    if (this.flash > 0) this.flash--;
    if (this.superFlash > 0) this.superFlash--;
    if (this.comboShow > 0) this.comboShow--;
    const B = ['light', 'heavy', 'special', 'ginga', 'mandinga', 'taunt', 'up'];
    for (const a of B) if (inp.pressed[a]) this.buf[a] = 8;
    if (this.hitstop > 0) { this.hitstop--; return; }
    for (const a of B) if (this.buf[a] > 0) this.buf[a]--;
    const h = this.held;
    h.fwd = this.facing === 1 ? inp.held.right : inp.held.left;
    h.back = this.facing === 1 ? inp.held.left : inp.held.right;
    h.down = inp.held.down; h.up = inp.held.up;
    const dashF = this.facing === 1 ? inp.dashRight : inp.dashLeft;
    const dashB = this.facing === 1 ? inp.dashLeft : inp.dashRight;
    if (this.invuln > 0) this.invuln--;
    if (this.dodgeCd > 0) this.dodgeCd--;
    this.armorNow = false;
    if (this.burn > 0) { this.burn--; if (this.burn % 30 === 0 && this.hp > 1) { this.hp = Math.max(1, this.hp - 10); G.burnTick(this); } }

    switch (this.state) {
      case 'intro': case 'ko': case 'win': this.t++; if (this.grounded) this.vx = 0; break;
      case 'idle': case 'walk': case 'crouch': case 'land': {
        if (this.state === 'land' && this.t > 0) { this.t--; this.vx = 0; break; }
        this.facing = opp.x >= this.x ? 1 : -1;
        h.fwd = this.facing === 1 ? inp.held.right : inp.held.left;
        h.back = this.facing === 1 ? inp.held.left : inp.held.right;
        this.crouching = false;
        if (this.tryAct(G, dashF, dashB, false)) break;
        if (h.down) { this.state = 'crouch'; this.crouching = true; this.vx = 0; }
        else if (h.fwd) { this.state = 'walk'; this.vx = this.def.stats.speed * this.mods.speed * this.facing; }
        else if (h.back) { this.state = 'walk'; this.vx = -this.def.stats.speed * 0.82 * this.mods.speed * this.facing; }
        else { this.state = 'idle'; this.vx = 0; }
        break;
      }
      case 'jump': {
        this.t++;
        if (this.airActs < 1) {
          if (this.buf.special > 0 && this.def.moves.aS) { this.buf.special = 0; this.startMove('aS', G); break; }
          if (this.buf.heavy > 0) { this.buf.heavy = 0; this.startMove('aH', G); break; }
          if (this.buf.light > 0) { this.buf.light = 0; this.startMove('aL', G); break; }
        }
        if (this.buf.up > 0 && this.jumps < this.def.stats.maxJumps && this.t > 6) {
          this.buf.up = 0; this.jumps++; this.vy = this.def.stats.jumpV * 0.9;
          this.vx = (h.fwd ? 1 : h.back ? -1 : 0) * this.def.stats.airSpeed * this.facing;
          G.fx.push({ type: 'dust', x: this.x, y: this.y - 10, t: 0, life: 16, color: '#fff8e8' }); M.audio.play('jump');
        }
        break;
      }
      case 'dash': {
        this.t++; this.vx *= 0.93;
        if (this.t >= 5 && this.tryAct(G, false, false, true)) break;
        if (this.t >= 15) { this.state = 'idle'; this.vx = 0; }
        break;
      }
      case 'backdash': { this.t++; this.vx *= 0.9; if (this.t >= 16) { this.state = 'idle'; this.vx = 0; } break; }
      case 'attack': this.updateAttack(G, opp); break;
      case 'dodge': {
        this.t++; this.vx *= 0.9;
        if (this.t >= 18) { this.state = 'idle'; this.vx = 0; this.invuln = 0; }
        break;
      }
      case 'taunt': {
        this.t++; this.vx = 0;
        if (this.t >= 55) { this.state = 'idle'; G.tauntDone(this); }
        break;
      }
      case 'hitstun': {
        if (this.grounded) {
          this.vx *= 0.86; this.t--;
          if (this.t <= 0) { if (this.kdPending) this.knockdown(G, false); else { this.state = this.crouching ? 'crouch' : 'idle'; } }
        }
        break;
      }
      case 'blockstun': { this.vx *= 0.8; this.t--; if (this.t <= 0) this.state = this.crouching ? 'crouch' : 'idle'; break; }
      case 'knockdown': { this.vx *= 0.8; this.t--; if (this.t <= 0) { this.state = 'getup'; this.t = 18; this.invuln = 26; } break; }
      case 'getup': { this.vx = 0; this.t--; if (this.t <= 0) this.state = 'idle'; break; }
      case 'thrown': { this.t++; break; }
    }
    this.physics(G);
    this.updatePose();
  }

  tryAct(G, dashF, dashB, fromDash) {
    const h = this.held, mv = this.def.moves;
    if (this.buf.mandinga > 0 && G.superReady(this)) { this.buf.mandinga = 0; return this.startMove('M', G); }
    if (this.buf.special > 0) { this.buf.special = 0; return this.startMove(h.down && mv.dS ? 'dS' : 'S', G); }
    if (this.buf.heavy > 0) { this.buf.heavy = 0; return this.startMove(h.down ? 'cH' : (h.fwd && mv.fH ? 'fH' : 'H'), G); }
    if (this.buf.light > 0) { this.buf.light = 0; return this.startMove(h.down ? 'cL' : 'L', G); }
    if (this.buf.ginga > 0 && this.dodgeCd <= 0) { this.buf.ginga = 0; this.startDodge(G, h.fwd); return true; }
    if (this.buf.up > 0 && !h.down) { this.buf.up = 0; this.jump(G); return true; }
    if (fromDash) return false;
    if (this.buf.taunt > 0) { this.buf.taunt = 0; this.state = 'taunt'; this.t = 0; this.vx = 0; this.stats.taunts++; M.audio.play('taunt'); return true; }
    if (dashF) { this.state = 'dash'; this.t = 0; this.vx = this.def.stats.dashV * this.mods.speed * this.facing; G.dust(this); M.audio.play('dash'); return true; }
    if (dashB) { this.state = 'backdash'; this.t = 0; this.vx = -this.def.stats.dashV * 0.8 * this.mods.speed * this.facing; this.invuln = 7; G.dust(this); M.audio.play('dash'); return true; }
    return false;
  }
  jump(G) {
    this.state = 'jump'; this.t = 0; this.grounded = false; this.jumps = 1; this.airActs = 0; this.crouching = false;
    this.vy = this.def.stats.jumpV;
    this.vx = (this.held.fwd ? 1 : this.held.back ? -1 : 0) * this.def.stats.airSpeed * this.mods.speed * this.facing;
    this.stats.jumps++; G.dust(this); M.audio.play('jump');
  }
  startDodge(G, forward) {
    this.state = 'dodge'; this.t = 0; this.forwardDodge = !!forward; this.invuln = 13; this.crouching = false;
    this.dodgeCd = Math.round(45 * this.mods.dodgeCd);
    this.vx = (forward ? 8.5 : -5.5) * this.facing;
    M.audio.play('dodge'); G.dust(this);
  }
  startMove(id, G) {
    const mv = this.def.moves[id]; if (!mv) return false;
    if (mv.air && this.grounded) return false;
    if (!mv.air && !this.grounded) return false;
    this.state = 'attack'; this.move = mv; this.mf = 0; this.t = 0; this.hitIds = new Set(); this.hitCount = 0; this.lastHitFrame = -99;
    this.moveHit = false; this.spawned = false; this.extraRec = 0; this.dodgedBy = null; this.throwing = null; this.threw = false; this.throwT = 0;
    if (this.grounded) this.vx = 0;
    this.crouching = !!mv.crouch; this.poseFrom = this.pose;
    if (!this.grounded) this.airActs++;
    if (mv.super) { this.stats.supers++; G.superStart(this, mv); }
    else if (mv.sfx) M.audio.play(mv.sfx);
    return true;
  }
  updateAttack(G, opp) {
    const mv = this.move;
    if (!this.throwing) this.mf++;
    const f = this.mf;
    if (mv.invuln && f >= mv.invuln[0] && f <= mv.invuln[1]) this.invuln = Math.max(this.invuln, 1);
    this.armorNow = !!(mv.armor && f >= mv.armor[0] && f <= mv.armor[1]);
    if (mv.move) for (const m of mv.move) if (f >= m.f && f < m.t) { this.x += (m.vx || 0) * this.facing; if (m.vy !== undefined && !this.grounded) this.vy = m.vy; }
    if (mv.glide && !this.grounded) { this.vy = Math.min(this.vy, 1.4); this.x += this.def.stats.airSpeed * 0.9 * this.facing * (this.held.fwd ? 1 : this.held.back ? -0.6 : 0.45); }
    if (this.grounded && !mv.move) this.vx = 0;
    if (f === mv.startup + 1 && !this.spawned) {
      this.spawned = true;
      if (mv.projectile) G.spawnProjectile(this, mv);
      if (mv.trap) G.spawnTrap(this, mv);
      if (mv.fx === 'wave') G.fx.push({ type: 'wave', x: this.x, y: this.y - 80, t: 0, life: 30, color: '#f2b70c' });
      if (mv.fx === 'arc') G.fx.push({ type: 'arc', x: this.x + this.facing * 30, y: this.y - 80, r: 50, dir: this.facing, t: 0, life: 14, color: this.def.colors.accent });
      if (mv.axe) G.gainAxe(this, mv.axe, 'ABOIO!');
    }
    if (mv.throw) {
      if (this.throwing) this.updateThrow(G, opp);
      else if (f > mv.startup && f <= mv.startup + mv.active) G.tryThrow(this, opp, mv);
    }
    if (this.moveHit && mv.cancel && f >= mv.startup + 1 && f <= mv.startup + mv.active + 5 && this.grounded) {
      const h = this.held, mvs = this.def.moves;
      let next = null;
      if (this.buf.mandinga > 0 && G.superReady(this)) next = 'M';
      else if (this.buf.special > 0 && mv.cancel.includes('S')) next = h.down && mvs.dS ? 'dS' : 'S';
      else if (this.buf.heavy > 0 && mv.cancel.includes('H')) next = h.down ? 'cH' : (h.fwd && mvs.fH ? 'fH' : 'H');
      else if (this.buf.light > 0 && mv.cancel.includes('L')) next = h.down ? 'cL' : 'L';
      if (next) { this.buf.special = this.buf.heavy = this.buf.light = this.buf.mandinga = 0; this.startMove(next, G); return; }
    }
    if (f >= mv.total + this.extraRec) {
      this.move = null; this.throwing = null;
      if (this.grounded) { this.state = 'idle'; this.crouching = false; } else this.state = 'jump';
    }
  }
  updateThrow(G, opp) {
    const th = this.move.throw; this.throwT++;
    opp.x = this.x + this.facing * 46; opp.y = this.y - 28 + Math.sin(this.throwT * 0.3) * 3; opp.facing = -this.facing;
    opp.grounded = false; opp.vx = 0; opp.vy = 0; opp.state = 'thrown';
    if (this.throwT >= th.hold) {
      opp.state = 'hitstun'; opp.t = 60; opp.launched = true; opp.hurtKind = 'hi'; opp.kdPending = false;
      opp.vx = th.vx * this.facing; opp.vy = -th.vy;
      G.throwRelease(this, opp, this.move);
      this.throwing = null;
    }
  }
  physics(G) {
    this.x += this.vx;
    if (!this.grounded) {
      this.vy += 0.72; this.y += this.vy;
      if (this.y >= M.GROUND) { this.y = M.GROUND; this.grounded = true; this.vy = 0; this.onLand(G); }
    }
    const minX = 42, maxX = M.W - 42;
    if (this.x < minX) { this.x = minX; if (this.vx < 0) this.vx = 0; }
    if (this.x > maxX) { this.x = maxX; if (this.vx > 0) this.vx = 0; }
  }
  onLand(G) {
    G.dust(this);
    switch (this.state) {
      case 'jump': this.state = 'land'; this.t = 3; this.vx = 0; M.audio.play('land'); break;
      case 'attack': this.move = null; this.throwing = null; this.state = 'land'; this.t = 5; this.vx = 0; this.crouching = false; M.audio.play('land'); break;
      case 'hitstun': case 'thrown': this.knockdown(G, true); break;
      case 'ko': this.vx = 0; G.shake(5); M.audio.play('hitL'); break;
      case 'dodge': break;
      default: this.vx = 0;
    }
    this.launched = false; this.jumps = 0; this.airActs = 0; this.juggle = 0;
  }
  knockdown(G, hard) {
    this.state = 'knockdown'; this.t = hard ? 42 : 36; this.vx *= 0.4; this.crouching = false; this.kdPending = false; this.move = null;
    if (hard) { G.shake(4); G.fx.push({ type: 'dust', x: this.x, y: this.y, t: 0, life: 20 }); M.audio.play('hitL'); }
  }

  // ---------------- pose ----------------
  updatePose() {
    const S = M.poses.S, P = M.poses;
    let pose;
    switch (this.state) {
      case 'idle': pose = P.idlePose(this.def.idle, this.animT, this.def.idleOver); if (this.held.back) pose = P.blend(pose, S.block, 0.5); break;
      case 'walk': { const fwd = (this.vx * this.facing) > 0; this.walkT = (this.walkT || 0) + (fwd ? 0.3 : 0.24); const k = (Math.sin(this.walkT) + 1) / 2; pose = P.blend(S.walkA, S.walkB, k); if (!fwd) pose = P.blend(pose, S.block, 0.4); break; }
      case 'crouch': pose = this.held.back ? S.blockC : S.crouch; break;
      case 'land': pose = S.land; break;
      case 'jump': pose = this.vy < 0 ? S.jump : P.blend(S.jump, S.fall, M.clamp(this.vy / 9, 0, 1)); break;
      case 'dash': pose = S.dash; break;
      case 'backdash': pose = S.backdash; break;
      case 'dodge': pose = this.forwardDodge ? S.dodgeF : S.dodge; if (this.t > 13) pose = P.blend(pose, S.idle, (this.t - 13) / 5); break;
      case 'taunt': pose = P.blend(S.taunt, S.tauntB, (Math.sin(this.t * 0.4) + 1) / 2); break;
      case 'win': pose = P.blend(S.win, S.winB, (Math.sin(this.t * 0.15) + 1) / 2); break;
      case 'intro': pose = P.blend(S.intro, P.idlePose(this.def.idle, this.animT, this.def.idleOver), M.clamp((this.t - 30) / 30, 0, 1)); break;
      case 'hitstun': pose = !this.grounded ? S.hurtAir : (this.hurtKind === 'lo' || this.crouching ? S.hurtLo : S.hurtHi); break;
      case 'blockstun': pose = this.crouching ? S.blockC : S.block; break;
      case 'knockdown': pose = S.down; break;
      case 'ko': pose = this.grounded ? S.ko : S.hurtAir; break;
      case 'getup': pose = P.blend(S.getup, S.idle, M.easeInOut(1 - this.t / 18)); break;
      case 'thrown': pose = S.thrown; break;
      case 'attack': {
        const mv = this.move, f = this.mf;
        let phase, t;
        if (f <= mv.startup) { phase = 'startup'; t = f / mv.startup; }
        else if (f <= mv.startup + mv.active) { phase = 'active'; t = (f - mv.startup) / mv.active; }
        else { phase = 'recovery'; t = M.clamp((f - mv.startup - mv.active) / (mv.recovery + this.extraRec), 0, 1); }
        pose = P.attackPose(mv.pose, phase, t, this.poseFrom);
        if (this.throwing) pose = S.throwHold;
        if (mv.spin && mv.spin[1] !== mv.spin[0]) { const k = M.clamp(f / (mv.startup + mv.active), 0, 1); pose = Object.assign({}, pose, { rot: M.lerp(mv.spin[0], mv.spin[1], k) }); }
        if (phase === 'recovery' && !this.grounded) pose = P.blend(pose, S.fall, t);
        break;
      }
      default: pose = S.idle;
    }
    this.pose = pose;
  }
};
