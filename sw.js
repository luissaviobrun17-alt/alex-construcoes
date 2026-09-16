const CACHE_NAME = 'alex-construcoes-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './logo.svg',
  './logo-print.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  // Ativação forçada imediata
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  // Limpa todos os caches antigos imediatamente
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Limpando cache legado:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First: Sempre busca a versão mais recente na rede!
self.addEventListener('fetch', (event) => {
  // Nunca intercepta chamadas de sincronização REST
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback para cache quando estiver offline no canteiro
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('./index.html');
        });
      })
  );
});
