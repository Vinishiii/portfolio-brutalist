'use strict';
// Ponte segura entre o jogo e o app de desktop. O jogo procura por window.steam.
const { contextBridge, ipcRenderer } = require('electron');
const meta = ipcRenderer.sendSync('meta:read');
contextBridge.exposeInMainWorld('steam', {
  unlock: name => ipcRenderer.invoke('steam:unlock', name),
  quit: () => ipcRenderer.invoke('app:quit'),
  loadSave: () => ipcRenderer.sendSync('save:read'),
  writeSave: text => ipcRenderer.send('save:write', text),
  locale: meta.locale, onSteam: meta.steam, deck: meta.deck, version: meta.version
});
