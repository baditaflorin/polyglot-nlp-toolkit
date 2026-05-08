import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const docsDir = resolve('..', 'docs');
const indexPath = resolve(docsDir, 'index.html');
const fallbackPath = resolve(docsDir, '404.html');
const manifestPath = resolve(docsDir, 'manifest.webmanifest');
const serviceWorkerPath = resolve(docsDir, 'sw.js');

await mkdir(dirname(fallbackPath), { recursive: true });
await copyFile(indexPath, fallbackPath);
await writeFile(
  manifestPath,
  JSON.stringify(
    {
      name: 'Polyglot NLP Toolkit',
      short_name: 'Polyglot NLP',
      start_url: '/polyglot-nlp-toolkit/',
      scope: '/polyglot-nlp-toolkit/',
      display: 'standalone',
      background_color: '#fbfbf8',
      theme_color: '#0f766e',
      icons: []
    },
    null,
    2
  ) + '\n'
);
await writeFile(
  serviceWorkerPath,
  `const CACHE_NAME = 'polyglot-nlp-toolkit-v1';
const BASE = '/polyglot-nlp-toolkit/';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([BASE])));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== location.origin) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(BASE)))
  );
});
`
);
