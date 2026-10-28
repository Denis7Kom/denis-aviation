// Increase the cache version when changing the pre-cached app shell.
const CACHE_PREFIX = 'denis-aviation-';
const CACHE_NAME = `${CACHE_PREFIX}v10`;
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './style.css?v=button-spacing-76',
  './gallery-data.js?v=if-frame-35',
  './aircraft-renderer.js?v=bank-59',
  './app.js?v=request-access-75',
  './pwa.js?v=1',
  './assets/hero-night.png',
  './assets/if-refueling.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheKey) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheKey, response.clone());
      } catch (_) {
        // Quota or storage failures must not block an online response.
      }
    }
    return response;
  } catch (_) {
    return (await caches.match(cacheKey)) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return;

  if (request.mode === 'navigate') {
    if (url.pathname === scopePath || url.pathname === `${scopePath}index.html`) {
      event.respondWith(networkFirst(request, './index.html'));
    }
    return;
  }

  if (!['script', 'style', 'image', 'font', 'manifest'].includes(request.destination)) return;
  event.respondWith(networkFirst(request, request));
});
