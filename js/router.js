// ===============================
// Router - App Contable
// ===============================


//==============================================
//#region loaders
//==============================================

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
    : `pages/${page}.html`;
  
  fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${page} desde ${path}`);
      }
      return response.text();
    })
    .then((html) => {
      console.log("HTML cargado OK");
      const pagesContainer = document.getElementById(ID_PAGES_CONTAINER);
      if (!pagesContainer) return;

      pagesContainer.innerHTML = html;

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
 * Carga un modal HTML y lo inserta en el body del documento
 * Busca primero en modules/{module}/modals/ si es un modal de módulo,
 * sino busca en shared/pages/modals/ para modales compartidos
 * @param {string} name - Nombre del modal a cargar (ej: "product-modal", "confirm-delete")
 * @param {string} module - Opcional: nombre del módulo si es un modal específico
 */
function loadModal(name, module = null) {
  // Determinar la ruta según si es modal de módulo o compartido
  let path;
  
  if (module) {
    // Modal específico de un módulo
    path = `modules/${module}/modals/${name}.html`;
  } else {
    // Modal compartido (confirm-delete, etc.)
    path = `components/${name}/${name}.html`;
  }
  
  return fetch(path)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`No se pudo cargar el modal ${name} desde ${path}`);
      }
      return r.text();
    })
    .then((html) => {
      document.getElementById(ID_MODALS_CONTAINER).insertAdjacentHTML("beforeend", html);
      console.log(`${name} loaded from ${path}`);
    })
    .catch((error) => {
      console.error(`Error cargando modal ${name}:`, error);
      throw error;
    });
}

/**
 * Carga un componente HTML y lo inserta en el body del documento
 * Los componentes siempre están en shared/pages/components/
 * @param {string} name - Nombre del componente a cargar
 */
function loadComponent(name) {
  return fetch(`components/${name}/${name}.html`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`No se pudo cargar el componente ${name}`);
      }
      return r.text();
    })
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
      console.log(`Component ${name} loaded`);
    })
    .catch((error) => {
      console.error(`Error cargando componente ${name}:`, error);
      throw error;
    });
}


//==============================================
//#region main
//==============================================

/**
 * Página inicial al entrar al layout
 * Carga el modal confirm-delete, el componente snackbar, la página inicial y la navbar inferior
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById(ID_PAGES_CONTAINER)) {
    // cargamos el modal confirm-delete
    console.log("Loading confirm-delete")
    loadModal(MODAL_CONFIRM_DELETE);

    // Cargamos el componente snackbar para mostrar mensajes de error o éxito
    console.log("Loading component snackbar")
    loadComponent("snackbar");
    
    // Cargamos la página inicial
    console.log("Loading home page")
    loadPage(PAGE_HOME); //poner el home

    // Iniciamos la navbar inferior para que se pueda navegar entre las páginas
    console.log("Iniciando bottom navbar")
    initBottomNav();
    
    // Iniciamos la navegación (menú contextual y botón adicionar)
    if (typeof initNavigation === "function") {
      initNavigation();
    }
  
    // Activamos el botón de la página inicial
    console.log("Setting active vab buton HOME")
    setActiveNav(PAGE_HOME); // botón activo inicial
  }
});


