const VERSION = 'quarter-sheet-v7';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = ['/', '/index.html', '/demo/', '/privacy/', '/terms/', '/404.html', '/offline.html', '/manifest.webmanifest', '/icons/mark.svg', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(PRECACHE);
    const page = await fetch('/index.html');
    const html = await page.text();
    const builtAssets = [...html.matchAll(/(?:src|href|srcset)="(\/assets\/[^"?#\s]+)/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(RUNTIME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request, { ignoreVary: true });
      if (cached) return cached;
      const path = new URL(event.request.url).pathname;
      if (path === '/' || path === '/index.html' || path === '/demo' || path === '/demo/') return (await caches.match('/index.html')) || caches.match('/offline.html');
      if (!['/privacy', '/privacy/', '/terms', '/terms/'].includes(path)) {
        const notFound = await caches.match('/404.html');
        return notFound ? new Response(await notFound.blob(), { status: 404, headers: notFound.headers }) : caches.match('/offline.html');
      }
      return caches.match('/offline.html');
    }));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(RUNTIME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
