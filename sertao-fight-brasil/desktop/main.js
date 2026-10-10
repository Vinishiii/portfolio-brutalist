'use strict';
// ============================================================
// Sertão Fight Brasil — casca desktop (Electron) para Steam.
// - Abre o jogo em tela cheia/janela, sem menus.
// - Steamworks (opcional): conquistas, overlay e idioma, via steamworks.js.
// - Save em arquivo (userData/save.json) para o Steam Auto-Cloud.
// Rode:  npm install && npm start     (STEAM_APP_ID=480 para teste)
// ============================================================
const { app, BrowserWindow, Menu, ipcMain, globalShortcut, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// pasta de dados em ASCII: o Electron, no Linux, ignora o nome com acento ("Sertão") e cairia em ~/.config solto
app.setPath('userData', path.join(app.getPath('appData'), 'SertaoFightBrasil'));
const gameDir = app.isPackaged ? path.join(process.resourcesPath, 'game') : path.join(__dirname, '..');
const savePath = () => path.join(app.getPath('userData'), 'save.json');
const APP_ID = parseInt(process.env.STEAM_APP_ID || '480', 10); // 480 = Spacewar (teste). Troque pelo AppID real.

let steam = null;
try {
  const sw = require('steamworks.js');
  steam = sw.init(APP_ID);
  sw.electronEnableSteamOverlay && sw.electronEnableSteamOverlay();
} catch (e) { steam = null; /* sem Steam: o jogo roda normalmente */ }

app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-frame-rate-limit'); // o jogo trava em 60 fps por conta própria
if (process.platform === 'linux') app.commandLine.appendSwitch('no-sandbox');

let win = null;
function steamLang() {
  // idioma escolhido nas propriedades do jogo na Steam: 'brazilian', 'english', 'spanish', 'latam'...
  try { const l = steam && steam.apps && steam.apps.currentGameLanguage ? steam.apps.currentGameLanguage() : null; if (l) return l; } catch (e) { /* ignora */ }
  return app.getLocale();
}
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 960, minHeight: 540, backgroundColor: '#141210', show: false,
    title: 'Sertão Fight Brasil', autoHideMenuBar: true, fullscreen: process.argv.includes('--fullscreen'),
    icon: path.join(gameDir, 'icons', 'icon-512.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false, nodeIntegration: false, backgroundThrottling: false, autoplayPolicy: 'no-user-gesture-required' }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(gameDir, 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.on('closed', () => { win = null; });
}

ipcMain.handle('steam:unlock', (_e, name) => { try { return steam ? steam.achievement.activate(name) : false; } catch (e) { return false; } });
ipcMain.handle('app:quit', () => app.quit());
ipcMain.on('save:read', e => { try { e.returnValue = fs.existsSync(savePath()) ? fs.readFileSync(savePath(), 'utf8') : ''; } catch (err) { e.returnValue = ''; } });
ipcMain.on('save:write', (_e, text) => { try { fs.mkdirSync(path.dirname(savePath()), { recursive: true }); fs.writeFileSync(savePath() + '.tmp', text); fs.renameSync(savePath() + '.tmp', savePath()); } catch (err) { /* ignora */ } });
ipcMain.on('meta:read', e => { e.returnValue = { locale: steamLang(), steam: !!steam, deck: !!process.env.SteamDeck, version: app.getVersion() }; });

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('F11', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
