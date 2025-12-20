// ===============================
// Router - App Contable
// ===============================

function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${page}`);
      }
      return response.text();
    })
    .then(html => {
      console.log("HTML cargado OK");
      const app = document.getElementById("app");
      if (!app) return;

      app.innerHTML = html;

      setActiveNav(page);
      setPageTitle(page);

      // Hook por página
      const hookName = `on${page.charAt(0).toUpperCase() + page.slice(1)}Loaded`;

      console.log("Buscando hook:", hookName);

      if (window[hookName]) {
        console.log("Ejecutando hook");
        window[hookName]();
      } else {
        console.log("Hook NO existe");
      } 
    })
    .catch(err => {
      console.error(err);
      const app = document.getElementById("app");
      if (app) {
        app.innerHTML =
          "<p class='text-danger'>Error cargando la página</p>";
      }
    });
}


// Página inicial al entrar al layout
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("app")) {
    loadModal("product-modal");
    loadComponent("snackbar");
    loadPage("products"); //poner el home
    initBottomNav();
    setActiveNav("home"); // botón activo inicial
  }
});


function loadModal(name) {
  fetch(`pages/${name}.html`)
    .then(r => r.text())
    .then(html => {
      document.getElementById("modals").innerHTML += html;
    });
}


function initBottomNav() {
  const home = document.getElementById("navHome");
  const products = document.getElementById("navProducts");
  const settings = document.getElementById("navSettings");

  if (home) home.onclick = () => loadPage("home");
  if (products) products.onclick = () => loadPage("products");
  if (settings) settings.onclick = () => loadPage("settings");
}

function setActiveNav(page) {
  const map = {
    home: "navHome",
    products: "navProducts",
    settings: "navSettings"
  };

  Object.values(map).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-link");
    }
  });

  const activeId = map[page];
  if (activeId) {
    const activeBtn = document.getElementById(activeId);
    activeBtn.classList.remove("btn-link");
    activeBtn.classList.add("btn-primary");
  }
}

function setPageTitle(page) {
  const title = document.getElementById("pageTitle");
  if (!title) return;

  const map = {
    home: '<i class="bi bi-house"></i> Inicio',
    products: '<i class="bi bi-box"></i> Productos',
    settings: '<i class="bi bi-gear"></i> Ajustes'
  };

  title.innerHTML = map[page] || "App Contable";
}
