const PRECACHE = [
  "/en",
  "/pl",
  "/ru",
  "/en/learn",
  "/pl/learn",
  "/ru/learn",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("sygnal-v2").then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== "sygnal-v2").map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const dest = event.request.destination;
          if (dest !== "script" && dest !== "document") {
            caches.open("sygnal-v2").then((cache) => cache.put(event.request, copy));
          }
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/en")),
      ),
  );
});
