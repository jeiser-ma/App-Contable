/**
 * Service Worker - App Contable (PWA)
 *
 * La versión (y la caché) se toma de version.json.
 * Al publicar una actualización, cambia "version" en version.json (ej. "1.0.1")
 * para que los usuarios reciban la nueva versión. Los datos (localStorage) no se pierden.
 */

const CACHE_NAME_PREFIX = "app-contable-";

// Se rellena en install/activate al leer version.json
let CACHE_VERSION = "1.0.0";

function getAppVersion() {
  return fetch("version.json", { cache: "reload" })
    .then((r) => r.json())
    .then((data) => data.version || "1.0.0")
    .catch(() => "1.0.0");
}

function getCacheName() {
  return CACHE_NAME_PREFIX + CACHE_VERSION;
}

const NETWORK_FIRST_DESTINATIONS = ["document", "script", "stylesheet"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    getAppVersion()
      .then((ver) => { CACHE_VERSION = ver; })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    getAppVersion()
      .then((ver) => { CACHE_VERSION = ver; })
      .then(() =>
        caches.keys().then((names) => {
          return Promise.all(
            names
              .filter((name) => name.startsWith(CACHE_NAME_PREFIX) && name !== getCacheName())
              .map((name) => caches.delete(name))
          );
        })
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const dest = event.request.destination;
  const isNav = event.request.mode === "navigate";

  // Solo aplicamos a nuestra propia origen (no a CDNs externos)
  if (url.origin !== self.location.origin) return;

  // Para HTML, JS y CSS: red primero, sin usar caché del navegador (siempre versión nueva)
  if (isNav || NETWORK_FIRST_DESTINATIONS.includes(dest)) {
    event.respondWith(
      fetch(event.request, { cache: "reload" })
        .then((response) => {
          const clone = response.clone();
          caches.open(getCacheName()).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || fetch(event.request))
        )
    );
    return;
  }

  // Imágenes y demás: caché primero (para ahorrar datos), luego red
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(getCacheName()).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
