'use strict';
// ============================================================
// DADOS DE QUADROS — tabela de cada golpe (início, ativo, recuperação, dano, vantagem) calculada
// direto dos dados dos lutadores, e a leitura de vantagem ao vivo do Treino.
// Vantagem = tempo de estupor (acerto/defesa) − (quadros ativos restantes + recuperação), com o contato
// no primeiro quadro ativo; confirmada medindo o próprio motor (ver teste de calibragem).
// ============================================================
M.frameData = (function () {
  const ORDER = ['L', 'L2', 'L3', 'cL', 'aL', 'H', 'cH', 'aH', 'fH', 'bH', 'bH2', 'dH', 'S', 'S2', 'dS', 'dS2', 'fS', 'aS', 'TH', 'M'];
  const CMD = { L: 'J', L2: 'J,J', L3: 'J,J,J', cL: '↓+J', aL: 'AR+J', H: 'K', cH: '↓+K', aH: 'AR+K', fH: '→+K', bH: '←+K', dH: 'DASH+K', S: 'L', dS: '↓+L', fS: '→+L', aS: 'AR+L', TH: 'H', M: 'U' };
  const BTN = id => (/^[a-z]?S/.test(id) ? 'L' : /^[a-z]?H/.test(id) ? 'K' : 'J');
  const TYPE = { high: 'ALTO', mid: 'MÉDIO', low: 'BAIXO' };

  function cmdOf(f, id) {
    if (CMD[id]) return CMD[id];
    // golpe de sequência: comando do pai + o botão
    for (const k in f.moves) { const p = f.moves[k]; if (p.follow === id || p.chain === id || p.counterMove === id) return (CMD[k] || k) + ' ▸ ' + (p.counterMove === id ? '✦' : BTN(k)); }
    return id;
  }
  function adv(mv, kind) {
    const rest = (mv.active - 1) + mv.recovery;
    return (kind === 'hit' ? mv.hitstun : mv.blockstun) - rest;
  }
  function notes(mv) {
    const t = [];
    if (mv.super) t.push('PEIA');
    if (mv.air) t.push('NO AR');
    if (mv.throw) t.push('AGARRÃO');
    if (mv.armor) t.push('ARMADURA');
    if (mv.invuln) t.push('INVULNERÁVEL');
    if (mv.projectile) t.push('PROJÉTIL');
    if (mv.hits > 1) t.push('MULTIGOLPE');
    if (mv.teleport) t.push('TELEPORTE');
    if (mv.counter) t.push('CONTRA-GOLPE');
    if (mv.reflect) t.push('REFLETE');
    if (mv.glide) t.push('PLANA');
    if (mv.steal) t.push('ROUBA VIDA');
    if (mv.pull || mv.pullProj) t.push('PUXA');
    if (mv.burn) t.push('QUEIMA');
    if (mv.trap) t.push('ARMADILHA');
    if (mv.heal) t.push('CURA');
    if (mv.drainAxe) t.push('DRENA ENERGIA');
    if (mv.dark) t.push('ESCURECE');
    if (mv.buff) t.push('REFORÇO');
    if (mv.lag) t.push('TONTURA');
    return t;
  }
  function rows(id) {
    const f = M.FIGHTERS[id]; if (!f) return [];
    const keys = ORDER.filter(k => f.moves[k]).concat(Object.keys(f.moves).filter(k => !ORDER.includes(k)));
    return keys.map(k => {
      const mv = f.moves[k];
      const hits = mv.hits || 1, special = !!(mv.projectile || mv.counter || mv.super);
      let hit, block;
      if (special) { hit = block = null; }
      else { hit = mv.knockdown || mv.throw ? 'KD' : mv.launch ? 'LANÇA' : adv(mv, 'hit'); block = mv.throw ? null : adv(mv, 'block'); }
      return {
        id: k, cmd: cmdOf(f, k), name: mv.name, type: mv.throw ? '' : (TYPE[mv.type] || ''),
        startup: mv.startup, active: mv.active, recovery: mv.recovery, total: mv.startup + mv.active + mv.recovery,
        dmg: hits > 1 ? mv.dmg + '×' + hits : String(mv.dmg), chip: mv.chip || 0,
        hit, block, cancel: (mv.cancel || []).map(c => cmdOf(f, c)).join(' '), notes: notes(mv)
      };
    });
  }
  const fmt = v => (v === null ? '—' : typeof v === 'number' ? (v > 0 ? '+' + v : String(v)) : v);

  // ---- leitura ao vivo no Treino: mede quando cada lado volta a agir ----
  function watch(G, hf, other) {
    const st = G.advW;
    if (st) {
      const f = G.frame;
      if (hf.state === 'attack' && f - st.start > 2 && hf.mf < 3) { G.advW = null; } // atacou de novo: era sequência, não mede
      else {
        if (st.a < 0 && hf.neutral) st.a = f;
        if (st.b < 0 && other.neutral) st.b = f;
        const stuck = f - st.start > 200 || (other.state === 'ko');
        if ((st.a >= 0 && st.b >= 0) || stuck) {
          if (st.a >= 0 && st.b >= 0) G.tr.adv = { v: st.b - st.a, kind: st.kind, name: st.name, at: f };
          G.advW = null;
        }
      }
    }
    if (!G.advW) {
      const h = hf.stats.hits, bl = other.stats.blocks;
      const hitNow = h > (G.advSeen ? G.advSeen.h : h), blNow = bl > (G.advSeen ? G.advSeen.b : bl);
      if ((hitNow || blNow) && hf.move && hf.move.id) G.advW = { start: G.frame, a: -1, b: -1, kind: blNow ? 'block' : 'hit', name: hf.move.name };
    }
    G.advSeen = { h: hf.stats.hits, b: other.stats.blocks };
  }
  return { rows, fmt, cmdOf, watch, adv, ORDER };
})();
