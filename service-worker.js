/**
 * Service Worker - App Contable (PWA)
 *
 * IMPORTANTE: Al publicar, actualizar en dos sitios el mismo número de versión:
 * 1. version.json → "version": "1.0.1"
 * 2. Aquí abajo → APP_VERSION = "1.0.1"
 * Así el navegador detecta el cambio y actualiza la PWA sin tener que borrar caché.
 */

const CACHE_NAME_PREFIX = "app-contable-";

// Debe coincidir con version.json; al cambiar, el archivo SW cambia y la PWA se actualiza
const APP_VERSION = "1.0.4";

function getCacheName() {
  return CACHE_NAME_PREFIX + APP_VERSION;
}

const NETWORK_FIRST_DESTINATIONS = ["document", "script", "stylesheet"];

// Recursos críticos para precachear: la app podrá abrir offline tras la primera visita online
const PRECACHE_URLS = [
  "index.html",
  "layout.html",
  "version.json",
  "manifest.json",
  "css/bootstrap.min.css",
  "css/bootstrap-icons.min.css",
  "css/styles.css",
  "js/bootstrap.bundle.min.js",
  "js/configs.js",
  "js/auth.js",
  "js/storage.js",
  "js/modal-helpers.js",
  "js/form-helpers.js",
  "js/router.js",
  "js/modules-controls.js",
  "js/modules-modals.js",
  "js/navigation.js",
  "js/home.js",
  "js/settings.js",
  "pages/home.html",
  "pages/settings.html",
  "pages/accounting.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(getCacheName())
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => {
        return Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_NAME_PREFIX) && name !== getCacheName())
            .map((name) => caches.delete(name))
        );
      })
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
