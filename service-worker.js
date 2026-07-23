const CACHE_NAME = "qa-work-english-test1-v58";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=58",
  "./script.js?v=58",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.headers.has("range")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html").then((fallback) => fallback || offlinePage());
          }
          return caches.match(event.request).then((fallback) => fallback || offlinePage());
        });
    })
  );
});

function offlinePage() {
  return new Response("页面暂时无法加载，请联网后刷新。", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
