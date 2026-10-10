#!/usr/bin/env python3
"""Empacota a versão web (itch.io / hospedagem estática) e gera o service worker offline.

Uso:  python3 tools/build_web.py            ->  dist/sertao-fight-brasil-web.zip
O zip tem index.html na raiz: envie direto ao itch.io (tipo "HTML") ou a qualquer hospedagem.
"""
import os, re, sys, zipfile, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INCLUDE_DIRS = ['css', 'js', 'fonts', 'icons']
INCLUDE_FILES = ['index.html', 'manifest.webmanifest']

def collect():
    files = list(INCLUDE_FILES)
    for d in INCLUDE_DIRS:
        for base, _, names in os.walk(os.path.join(ROOT, d)):
            for n in sorted(names):
                if n.startswith('.') or n.endswith('.txt') and d == 'fonts':
                    continue
                files.append(os.path.relpath(os.path.join(base, n), ROOT).replace(os.sep, '/'))
    return sorted(set(files))

def version():
    s = open(os.path.join(ROOT, 'js', 'util.js'), encoding='utf-8').read()
    m = re.search(r"M\.VERSION = '([^']+)'", s)
    return m.group(1) if m else '0'

def write_sw(files):
    h = hashlib.sha1()
    for f in files:
        h.update(open(os.path.join(ROOT, f), 'rb').read())
    cache = 'sfb-%s-%s' % (version(), h.hexdigest()[:8])
    body = """'use strict';
// Gerado por tools/build_web.py — não edite à mão. Cache offline do jogo.
const CACHE = '%s';
const FILES = %s;
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
""" % (cache, '[' + ', '.join("'./%s'" % f for f in files) + ']')
    open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(body)
    return cache

def main():
    files = collect()
    cache = write_sw(files)
    files.append('sw.js')
    out_dir = os.path.join(ROOT, 'dist'); os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, 'sertao-fight-brasil-web.zip')
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in files:
            z.write(os.path.join(ROOT, f), f)
    total = sum(os.path.getsize(os.path.join(ROOT, f)) for f in files)
    print('service worker:', cache)
    print('%d arquivos, %.1f KB sem compactar -> %s (%.1f KB)' % (len(files), total / 1024, os.path.relpath(out, ROOT), os.path.getsize(out) / 1024))

if __name__ == '__main__':
    sys.exit(main())
