self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activo");
});

self.addEventListener("fetch", (event) => {
  // por ahora no interceptamos nada
});
