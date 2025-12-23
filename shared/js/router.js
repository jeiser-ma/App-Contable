// ===============================
// Router - App Contable
// ===============================

//#region Constants
// IDs principales
const ID_APP = "app";

// IDs de título de página
const ID_PAGE_TITLE = "pageTitle";
const ID_MODULE_ICON = "moduleIcon";

// Nombres de páginas
const PAGE_HOME = "home";
const PAGE_PRODUCTS = "products";
const PAGE_MOVEMENTS = "movements";
const PAGE_INVENTORY = "inventory";
const PAGE_EXPENSES = "expenses";
const PAGE_SETTINGS = "settings";

// Configuración de páginas (centralizada)
const PAGES_CONFIG = {
  [PAGE_HOME]: {
    title: "Inicio",
    icon: "bi-house-door",
    navId: "navHome",
    isModule: false // Página compartida
  },
  [PAGE_PRODUCTS]: {
    title: "Productos",
    icon: "bi-box",
    navId: "navProducts",
    isModule: true // Módulo
  },
  [PAGE_MOVEMENTS]: {
    title: "Movimientos",
    icon: "bi-arrow-repeat",
    navId: "navMovements",
    isModule: true // Módulo
  },
  [PAGE_EXPENSES]: {
    title: "Gastos",
    icon: "bi-cash-coin",
    navId: "navExpenses",
    isModule: true // Módulo
  },
  [PAGE_INVENTORY]: {
    title: "Inventario",
    icon: "bi-clipboard-check",
    navId: "navInventory",
    isModule: true // Módulo
  },
  [PAGE_SETTINGS]: {
    title: "Ajustes",
    icon: "bi-gear",
    navId: "navSettings",
    isModule: false // Página compartida
  }
};
//#endregion

/**
 * Carga una página HTML y la inserta en el DOM
 * Busca primero en modules/{page}/ si es un módulo, sino en shared/pages/
 * @param {string} page - Nombre de la página a cargar
 * @returns {void}
 */
function loadPage(page) {
  const pageConfig = PAGES_CONFIG[page];
  const isModule = pageConfig?.isModule || false;
  
  // Determinar la ruta según si es módulo o página compartida
  const path = isModule 
    ? `modules/${page}/${page}.html`
    : `shared/pages/${page}.html`;
  
  fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${page} desde ${path}`);
      }
      return response.text();
    })
    .then((html) => {
      console.log("HTML cargado OK");
      const app = document.getElementById(ID_APP);
      if (!app) return;

      app.innerHTML = html;

      // Configuración de la navbar y el título de la página
      setActiveNav(page);
      setPageTitle(page);

      // Ocultar controles del módulo si no es un módulo
      const pageConfig = PAGES_CONFIG[page];
      if (!pageConfig || !pageConfig.isModule) {
        hideModuleControls();
      }

      // Hook por página (función que se ejecuta cuando se carga la página)
      // La función debe tener el nombre onPageNameLoaded
      // Por ejemplo: onProductsLoaded, onMovementsLoaded, onSettingsLoaded etc.
      // El nombre de la función se construye a partir del nombre de la página

      // Construimos el nombre de la función del hook a partir del nombre de la página
      const hookName = `on${
        page.charAt(0).toUpperCase() + page.slice(1)
      }PageLoaded`;
      
      console.log("Buscando hook:", hookName);
      // Buscamos la función del hook en el objeto window
      const hookFunction = window[hookName];
      if (hookFunction) {
        console.log("Ejecutando hook"+hookName);
        // Ejecutamos la función del hook
        hookFunction();
      } else {
        console.log("Hook NO existe la función: "+hookName);
      }
    })  
}

/**
 * Página inicial al entrar al layout
 * Carga el modal confirm-delete, el componente snackbar, la página inicial y la navbar inferior
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById(ID_APP)) {
    // cargamos el modal confirm-delete
    console.log("Loading confirm-delete")
    loadModal("confirm-delete");

    // Cargamos el componente snackbar para mostrar mensajes de error o éxito
    console.log("Loading component snackbar")
    loadComponent("snackbar");
    
    // Cargamos la página inicial
    console.log("Loading home page")
    loadPage(PAGE_INVENTORY); //poner el home

    // Iniciamos la navbar inferior para que se pueda navegar entre las páginas
    console.log("Iniciando bottom navbar")
    initBottomNav();
  
    // Activamos el botón de la página inicial
    console.log("Setting active vab buton HOME")
    setActiveNav(PAGE_HOME); // botón activo inicial
  }
});


/**
 * Inicializa la navbar inferior
 * @returns {void}
 */
function initBottomNav() {
  const home = document.getElementById(PAGES_CONFIG[PAGE_HOME].navId);
  const products = document.getElementById(PAGES_CONFIG[PAGE_PRODUCTS].navId);
  const movements = document.getElementById(PAGES_CONFIG[PAGE_MOVEMENTS].navId);
  const expenses = document.getElementById(PAGES_CONFIG[PAGE_EXPENSES].navId);
  const inventory = document.getElementById(PAGES_CONFIG[PAGE_INVENTORY].navId);
  const settings = document.getElementById(PAGES_CONFIG[PAGE_SETTINGS].navId);

  if (home) home.onclick = () => loadPage(PAGE_HOME);
  if (products) products.onclick = () => loadPage(PAGE_PRODUCTS);
  if (movements) movements.onclick = () => loadPage(PAGE_MOVEMENTS);
  if (expenses) expenses.onclick = () => loadPage(PAGE_EXPENSES);
  if (inventory) inventory.onclick = () => loadPage(PAGE_INVENTORY);
  if (settings) settings.onclick = () => loadPage(PAGE_SETTINGS);
}

/**
 * Establece el botón activo en la navbar inferior
 * @param {string} page - Nombre de la página a establecer como activa
 * @returns {void}
 */
function setActiveNav(page) {
  // Resetear todos los botones a estado inactivo
  Object.values(PAGES_CONFIG).forEach((config) => {
    const btn = document.getElementById(config.navId);
    if (btn) {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-link");
    }
  });

  // Activar el botón de la página actual
  const pageConfig = PAGES_CONFIG[page];
  if (pageConfig) {
    const activeBtn = document.getElementById(pageConfig.navId);
    if (activeBtn) {
      activeBtn.classList.remove("btn-link");
      activeBtn.classList.add("btn-primary");
    }
  }
}

/**
 * Establece el título y el icono de la página
 * @param {string} page - Nombre de la página a establecer como activa
 * @returns {void}
 */
function setPageTitle(page) {
  const title = document.getElementById(ID_PAGE_TITLE);
  const icon = document.getElementById(ID_MODULE_ICON);

  if (!title || !icon) return;

  const pageConfig = PAGES_CONFIG[page];
  if (!pageConfig) return;

  title.textContent = pageConfig.title;
  icon.className = `bi ${pageConfig.icon} fs-5 text-white`;
}
