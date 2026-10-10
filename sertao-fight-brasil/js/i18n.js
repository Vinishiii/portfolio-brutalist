'use strict';
// ============================================================
// I18N — português (base), inglês e espanhol.
// A fonte de verdade dos textos continua em português; cada texto
// é traduzido na hora de exibir: M.tr('texto'). A interface (DOM) é
// traduzida automaticamente por um observador; o canvas por M.text.
// Os pacotes ficam em js/lang/*.js como linhas [pt, en, es].
// ============================================================
M.i18n = (function () {
  const LANGS = [['pt', 'Português'], ['en', 'English'], ['es', 'Español']];
  const D = { en: new Map(), es: new Map() };
  const UP = { en: new Map(), es: new Map() };
  const PATS = [];
  const misses = new Set();
  let lang = 'pt';
  let observer = null;

  function add(rows) { for (const r of rows) { const es = r[2] === undefined ? r[1] : r[2]; D.en.set(r[0], r[1]); D.es.set(r[0], es); UP.en.set(r[0].toUpperCase(), r[1].toUpperCase()); UP.es.set(r[0].toUpperCase(), es.toUpperCase()); } }
  // padrão: expressão regular sobre o texto em português; en/es são strings com $1.. ou funções
  function pat(re, en, es) { PATS.push([re, { en, es: es === undefined ? en : es }]); }

  function detect() {
    const n = String((window.steam && window.steam.locale) || (navigator.languages && navigator.languages[0]) || navigator.language || 'pt').toLowerCase();
    return (n.startsWith('pt') || n.includes('brazil') || n.includes('portug')) ? 'pt' : (n.startsWith('es') || n.includes('span') || n.includes('latam')) ? 'es' : 'en';
  }
  function tr(s) {
    if (lang === 'pt' || typeof s !== 'string' || s.length === 0) return s;
    const dict = D[lang];
    let v = dict.get(s);
    if (v !== undefined) return v;
    const t = s.trim();
    if (!t) return s;
    if (t !== s) { v = dict.get(t); if (v !== undefined) return s.replace(t, () => v); }
    const up = UP[lang].get(t.toUpperCase());
    if (up !== undefined && t === t.toUpperCase()) return s.replace(t, () => up);
    for (const [re, o] of PATS) {
      const m = re.exec(t);
      if (m) { const r = o[lang]; const out = typeof r === 'function' ? r.apply(null, m.slice(1)) : t.replace(re, r); return t !== s ? s.replace(t, () => out) : out; }
    }
    if (/[A-Za-zÀ-ÿ]{3,}/.test(t) && !/^[\d\s.,:%+\-×x/'’"!?]*$/.test(t)) misses.add(t);
    return s;
  }

  // ---------- DOM ----------
  const SKIP = new Set(['SCRIPT', 'STYLE', 'CANVAS']);
  function xlateText(node) {
    const par = node.parentNode;
    if (par && par.closest && par.closest('[data-notr]')) return;
    const cur = node.nodeValue;
    const src = (node.__out !== undefined && node.__out === cur) ? node.__src : cur;
    const out = tr(src);
    node.__src = src; node.__out = out;
    if (out !== cur) node.nodeValue = out;
  }
  function xlateAttrs(el) {
    for (const a of ['title', 'aria-label', 'placeholder']) {
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      const k = '__a_' + a, cur = el.getAttribute(a);
      const src = (el[k] && el[k].out === cur) ? el[k].src : cur;
      const out = tr(src); el[k] = { src, out };
      if (out !== cur) el.setAttribute(a, out);
    }
  }
  function xlate(root) {
    if (!root) return;
    if (root.nodeType === 3) { xlateText(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.tagName)) return;
    xlateAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    let n = w.nextNode();
    while (n) {
      if (n.nodeType === 3) { if (!SKIP.has(n.parentNode && n.parentNode.tagName)) xlateText(n); } else xlateAttrs(n);
      n = w.nextNode();
    }
  }
  function startObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'characterData') { const n = m.target; if (n.__out === n.nodeValue) continue; xlateText(n); }
        else m.addedNodes.forEach(n => xlate(n));
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function meta() {
    document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es' }[lang];
    document.title = tr('SERTÃO FIGHT BRASIL — A Rinha Nunca Para');
    const d = document.querySelector('meta[name="description"]');
    if (d) { if (!d.__src) d.__src = d.getAttribute('content'); d.setAttribute('content', tr(d.__src)); }
  }
  function set(l, save) {
    if (!D[l] && l !== 'pt') l = 'pt';
    lang = l;
    xlate(document.body); meta();
    if (save && M.store && M.store.data) { M.store.data.settings.lang = l; M.store.save(); }
  }
  function init() { startObserver(); xlate(document.body); meta(); }
  function cycle() { const i = LANGS.findIndex(x => x[0] === lang); const nl = LANGS[(i + 1) % LANGS.length][0]; set(nl, true); return nl; }
  function name(l) { return (LANGS.find(x => x[0] === (l || lang)) || LANGS[0])[1]; }

  const api = { LANGS, add, pat, tr, set, init, cycle, detect, name, xlate, misses, get lang() { return lang; } };
  M.tr = tr; M.t = tr;
  return api;
})();
