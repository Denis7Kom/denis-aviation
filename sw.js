// Increase the cache version when changing the pre-cached app shell.
const CACHE_PREFIX = 'denis-aviation-';
const CACHE_NAME = `${CACHE_PREFIX}v42`;
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './style.css?v=mobile-arrows-91',
  './site-guide.css?v=4',
  './site-guide.js?v=1',
  './assets/developer-portfolio-preview-v2.webp',
  './assets/infinite-flight-profile-preview.webp',
  './assets/aerial-portfolio-preview-v2.webp',
  './gallery-data.js?v=frames-36',
  './aircraft-renderer.js?v=bank-59',
  './app.js?v=guide-livery-83',
  './pwa.js?v=1',
  './request-status.js?v=2',
  './assets/hero-night-mobile.webp',
  './assets/hero-night.webp',
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

self.addEventListener('push', (event) => {
  let payload;
  try {
    payload = event.data?.json();
  } catch (_) {
    return;
  }
  const data = payload?.data || {};
  if (!['message', 'status', 'request'].includes(data.kind)) return;
  const title =
    data.language === 'it'
      ? 'Denis Aviation · Aggiornamento'
      : data.language === 'en'
        ? 'Denis Aviation · Update'
        : 'Denis Aviation · Обновление';
  const body =
    data.language === 'it'
      ? 'Apri le richieste per vedere le novità.'
      : data.language === 'en'
        ? 'Open requests to see what changed.'
        : 'Открой заявки, чтобы посмотреть изменения.';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: new URL('./assets/icons/icon-192.png', self.registration.scope).href,
      tag: `aviation-${data.requestId || 'requests'}`,
      data: { requestId: data.requestId || '' },
    }),
  );
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL('./requests.html', self.registration.scope);
  if (/^[A-Za-z0-9_-]{1,128}$/.test(event.notification.data?.requestId || ''))
    target.searchParams.set('request', event.notification.data.requestId);
  event.waitUntil(self.clients.openWindow(target.href));
});
