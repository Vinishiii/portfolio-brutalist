'use strict';
// ============================================================
// NATIVE — ponte opcional com o app de celular (Capacitor: Android e iOS).
// Sem o Capacitor (navegador, Steam/Electron) nada aqui muda o jogo; só o ciclo de pausa no toque vale em qualquer aparelho.
//   • salvamento duplo: localStorage + Preferences do sistema (o WebView do iOS pode apagar o localStorage);
//   • ciclo de vida: ao ir para segundo plano o jogo pausa a luta e suspende o áudio;
//   • botão voltar do Android; vibração leve nos golpes; compartilhar com a folha nativa do sistema.
// Usa window.Capacitor.Plugins (sem bundler): os plugins são registrados pelo projeto nativo.
// ============================================================
M.native = (function () {
  const C = window.Capacitor, active = !!(C && C.isNativePlatform && C.isNativePlatform());
  const P = (active && C.Plugins) || {};
  const touchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const N = { active, platform: active && C.getPlatform ? C.getPlatform() : 'web', P, webUrl: window.SFB_WEB_URL || '' };
  if (active) document.documentElement.classList.add('native', 'native-' + N.platform);

  // ---------- 1) salvamento duplo ----------
  if (active && P.Preferences) {
    const KEY = M.store.key, origSave = M.store.save.bind(M.store);
    M.store.save = function () { origSave(); try { P.Preferences.set({ key: KEY, value: JSON.stringify(this.data) }); } catch (e) { /* ignora */ } };
    let local = null; try { local = localStorage.getItem(KEY); } catch (e) { /* ignora */ }
    if (!local) {
      // o WebView perdeu o armazenamento web: restaura a cópia do sistema (antes do boot, ou recarrega uma vez se o boot já passou)
      P.Preferences.get({ key: KEY }).then(r => {
        if (!r || !r.value) return;
        try { localStorage.setItem(KEY, r.value); } catch (e) { return; }
        if (M.state !== 'boot' && !sessionStorage.getItem('sfb.restored')) { sessionStorage.setItem('sfb.restored', '1'); location.reload(); }
      }).catch(() => { });
    }
  }

  // ---------- 2) ciclo de vida: pausa e áudio ----------
  let wasPlaying = false;
  function hidden() {
    if (M.state === 'fight' && M.match) window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));   // abre a pausa (consumida no próximo quadro)
    try { const ctx = M.audio.A.ctx; if (ctx && ctx.state === 'running') { wasPlaying = true; ctx.suspend(); } } catch (e) { /* ignora */ }
  }
  function shown() {
    try { const ctx = M.audio.A.ctx; if (ctx && wasPlaying) { wasPlaying = false; ctx.resume(); } } catch (e) { /* ignora */ }
    try { M.input.clear(); } catch (e) { /* ignora */ }
  }
  if (active || touchDevice) document.addEventListener('visibilitychange', () => { if (document.hidden) hidden(); else shown(); });
  if (active && P.App) P.App.addListener('appStateChange', s => { if (s && s.isActive === false) hidden(); else shown(); });

  // ---------- 3) botão voltar (Android) ----------
  let lastBack = 0;
  if (active && P.App) P.App.addListener('backButton', () => {
    const ui = document.getElementById('ui'), before = ui ? ui.innerHTML.length + ui.innerHTML.slice(0, 120) : '';
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
    setTimeout(() => {   // a tela não mudou: estamos no menu inicial — dois toques seguidos fecham o app
      if (M.state === 'fight' || M.state === 'pause') return;
      const now = ui ? ui.innerHTML.length + ui.innerHTML.slice(0, 120) : '';
      if (now !== before) return;
      const t = Date.now();
      if (t - lastBack < 1800) { try { P.App.exitApp(); } catch (e) { /* ignora */ } return; }
      lastBack = t; try { if (M.ui5 && M.ui5.say) M.ui5.say('Toque em voltar de novo para sair', '↩'); } catch (e) { /* ignora */ }
    }, 160);
  });

  // ---------- 4) vibração ----------
  let lastHaptic = 0;
  N.haptic = kind => {
    if (!active || !P.Haptics || M.store.data.settings.haptics === false) return;
    const t = performance.now(); if (t - lastHaptic < 70) return; lastHaptic = t;   // golpes múltiplos não viram zumbido
    try { P.Haptics.impact({ style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' }); } catch (e) { /* ignora */ }
  };
  // botões de toque: toque curto
  if (active) document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.tbtn')) N.haptic('light'); }, true);

  // ---------- 5) compartilhar com a folha do sistema ----------
  // Grava o arquivo no cache do app e entrega o caminho ao Share; sem o plugin cai nos caminhos normais do navegador.
  N.shareFile = async function (blob, name, text) {
    if (!active || !P.Filesystem || !P.Share) return false;
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
      const f = await P.Filesystem.writeFile({ path: name, data: b64, directory: 'CACHE' });
      await P.Share.share({ title: 'Sertão Fight Brasil', text, url: f.uri, dialogTitle: 'Compartilhar' });
      return true;
    } catch (e) { return !!(e && /cancel/i.test(String(e.message || e))); }
  };
  N.shareText = async function (text, url) {
    if (!active || !P.Share) return false;
    try { await P.Share.share({ title: 'Sertão Fight Brasil', text, url: url || undefined, dialogTitle: 'Compartilhar' }); return true; } catch (e) { return !!(e && /cancel/i.test(String(e.message || e))); }
  };
  return N;
})();
