const CACHE_NAME = 'boutik-pro-v2';
const assetsToCache = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Enstalasyon Service Worker la
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Aktivasyon ak netwayaj ansyen vèsyon yo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Rekipere fichye yo menm san entènèt
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
