const CACHE = "metrics-pwa-pages-v1";
const BASE = "/personal-metrics-pwa";
const API_BASE = "https://mumcofuervklloaotpih.supabase.co/functions/v1/metrics-pwa";
const ASSETS = [BASE + "/", BASE + "/manifest.webmanifest", BASE + "/icon.svg"];
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) { return caches.delete(key); })); }));
  self.clients.claim();
});
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.href.indexOf(API_BASE + "/api/") === 0) return;
  if (url.pathname.indexOf(BASE) !== 0) return;
  event.respondWith(fetch(event.request).then(function (response) {
    var copy = response.clone();
    caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
    return response;
  }).catch(function () {
    return caches.match(event.request).then(function (cached) { return cached || caches.match(BASE + "/"); });
  }));
});