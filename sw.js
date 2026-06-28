const CACHE = "metrics-pwa-pages-v23";
const BASE = "/personal-metrics-pwa";
const API_BASE = "https://mumcofuervklloaotpih.supabase.co/functions/v1/metrics-pwa";
const ASSETS = [BASE + "/", BASE + "/index.html", BASE + "/manifest.webmanifest", BASE + "/icon.svg", BASE + "/apple-touch-icon.png", BASE + "/icon-192.png", BASE + "/icon-512.png", BASE + "/styles.css", BASE + "/app.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.href.startsWith(API_BASE)) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  if (url.origin === location.origin && url.pathname.startsWith(BASE)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(BASE + "/index.html"))));
  }
});
