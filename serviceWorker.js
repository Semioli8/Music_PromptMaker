// Basic service worker for offline cache (GitHub Pages friendly)

const CACHE_NAME = "music-prompt-maker-v1";
const BASE_PATH = "/Music_PromptMaker/";

// Bunlar cache'e alınacak temel dosyalar
const ASSETS = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "manifest.json",
];

// Install: dosyaları cache'e ekle
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: eski cache'leri temizle
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: önce cache, yoksa network
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Sadece GET isteklerinde cache kullan
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Başarılı response'ları cache'e ekle
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // Network yoksa ana sayfayı döndür
          return caches.match(BASE_PATH + "index.html");
        });
    })
  );
});
