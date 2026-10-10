'use strict';
// Gerado por tools/build_web.py — não edite à mão. Cache offline do jogo.
const CACHE = 'sfb-1.5-82fbdaa6';
const FILES = ['./css/style.css', './fonts/AlfaSlabOne-Regular.ttf', './fonts/SpecialElite-Regular.ttf', './icons/favicon.png', './icons/icon-192.png', './icons/icon-256.png', './icons/icon-512.png', './icons/icon-64.png', './index.html', './js/achievements.js', './js/ai.js', './js/audio.js', './js/fighter.js', './js/fighters.js', './js/game.js', './js/i18n.js', './js/input.js', './js/lang/fighters.js', './js/lang/story.js', './js/lang/ui.js', './js/logo.js', './js/main.js', './js/paint.js', './js/poses.js', './js/render.js', './js/stages.js', './js/story.js', './js/ui.js', './js/util.js', './manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
