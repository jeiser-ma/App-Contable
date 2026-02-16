/**
 * Service Worker - App Contable (PWA)
 * La versión se obtiene de la URL con la que se registra (service-worker.js?v=X.X.X),
 * definida en js/configs.js → APP_VERSION. Solo hay que actualizar la versión allí.
 */

const CACHE_NAME_PREFIX = "app-contable-";

function getAppVersionFromScriptURL() {
  try {
    const url = new URL(self.registration.scriptURL);
    const v = url.searchParams.get("v");
    return v || "1.0.0";
  } catch (_) {
    return "1.0.0";
  }
}

function getCacheName() {
  return CACHE_NAME_PREFIX + getAppVersionFromScriptURL();
}

const NETWORK_FIRST_DESTINATIONS = ["document", "script", "stylesheet"];

// Recursos críticos para precachear: la app podrá abrir offline tras la primera visita online
const PRECACHE_URLS = [
  "index.html",
  "layout.html",
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
  "modules/accounting/accounting.html",
  "modules/accounting/accounting.js",
  "modules/products/products.html",
  "modules/products/products.js"
];

// Precacha URL por URL para que un fallo (ej. 404) no deje la caché vacía
function precacheAll(cache) {
  return Promise.all(
    PRECACHE_URLS.map((url) =>
      cache.add(url).catch(() => {})
    )
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(getCacheName())
      .then(precacheAll)
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
  const pathname = url.pathname;
  const dest = event.request.destination;
  const isNav = event.request.mode === "navigate";

  // Solo aplicamos a nuestra propia origen (no a CDNs externos)
  if (url.origin !== self.location.origin) return;

  // service-worker.js: siempre red, nunca caché (para que la app detecte actualizaciones)
  if (pathname.endsWith("service-worker.js")) {
    event.respondWith(
      fetch(event.request, { cache: "reload" })
    );
    return;
  }

  // Para HTML, JS y CSS: red primero; si falla (ej. sin internet), usar caché
  if (isNav || NETWORK_FIRST_DESTINATIONS.includes(dest)) {
    event.respondWith(
      fetch(event.request, { cache: "reload" })
        .then((response) => {
          const clone = response.clone();
          caches.open(getCacheName()).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // Sin conexión y sin caché para esta URL: para navegación, intentar servir index.html
            if (isNav) {
              const fallbackUrl = new URL("index.html", self.location.href).href;
              return caches.match(fallbackUrl);
            }
            return Promise.reject(new Error("offline"));
          })
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
