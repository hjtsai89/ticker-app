const CACHE_NAME = 'ticker-shell-v2';
const SHELL_FILES = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache the app shell; never cache live quote requests (those are cross-origin API calls).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return; // let API calls pass straight through
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
