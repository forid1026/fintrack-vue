/* FinTrack service worker: makes the app load offline.
 *
 * - Hashed build files (/assets/*)  -> cache-first (they never change)
 * - Page navigations               -> network-first, falls back to cached shell
 * - Other same-origin GET requests -> stale-while-revalidate
 *
 * User data lives in localStorage, never in these caches.
 * Bump CACHE_VERSION to force every client to drop old caches.
 */
const CACHE_VERSION = 'v1';
const CACHE = `fintrack-${CACHE_VERSION}`;
const BASE = new URL(self.registration.scope).pathname; // e.g. "/" or "/fintrack/"
const SHELL = [BASE, `${BASE}favicon.svg`, `${BASE}manifest.webmanifest`];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('fintrack-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function putInCache(request, response) {
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Page loads
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache(new Request(BASE), response))
        .catch(async () => (await caches.match(BASE)) || Response.error()),
    );
    return;
  }

  // Immutable hashed assets
  if (url.pathname.startsWith(`${BASE}assets/`)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => putInCache(request, response)),
      ),
    );
    return;
  }

  // Everything else
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => putInCache(request, response))
        .catch(() => cached);
      return cached || network;
    }),
  );
});
