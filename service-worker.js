/**
 * Service Worker - App Contable (PWA)
 *
 * IMPORTANTE: Cuando subas una actualización a GitHub Pages, cambia CACHE_VERSION
 * (ej. 'v2', 'v3') para que los usuarios reciban la nueva versión sin borrar caché.
 * Los datos de la app (localStorage) no se pierden.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = "app-contable-" + CACHE_VERSION;

// Tipos de recurso que siempre deben intentar red primero (evitar caché vieja)
const NETWORK_FIRST_DESTINATIONS = ["document", "script", "stylesheet"];

self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name.startsWith("app-contable-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const dest = event.request.destination;
  const isNav = event.request.mode === "navigate";

  // Solo aplicamos a nuestra propia origen (no a CDNs externos)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Para HTML, JS y CSS: red primero, sin usar caché del navegador (siempre versión nueva)
  if (isNav || NETWORK_FIRST_DESTINATIONS.includes(dest)) {
    event.respondWith(
      fetch(event.request, { cache: "reload" })
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
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
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
