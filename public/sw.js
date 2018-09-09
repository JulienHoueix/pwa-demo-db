var serviceWorkerVersion = 1;

self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ' + serviceWorkerVersion, event);
  event.waitUntil(
    caches.open('appshell-cache')
      .then(function (cache) {
        console.log('[Service Worker] Caching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/idb.js',
          '/src/js/app.js',
          '/src/css/app.css',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
        ]);
      })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ' + serviceWorkerVersion, event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[Service Worker] Intercepting fetch event with serviceWorker ' + serviceWorkerVersion, event.request.url);
  event.respondWith(
    // We could use caches.match(event.request) to search in all caches
    caches.open('appshell-cache')
      .then(function (cache) {
        return cache.match(event.request)
          .then(function (response) {
            if (response) {
              console.log('[Service Worker] Returning response from cache');
              return response;
            } else {
              console.log('[Service Worker] Fetching URL');
              return fetch(event.request);
            }
          })
      })
  );
});
