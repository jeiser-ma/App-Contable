// ===============================
// Navigation - App Contable
// Gestión de navegación: navbar inferior, menú contextual y botón adicionar
// ===============================


/**
 * Configura la navegación (navbar inferior, menú contextual y botón adicionar)
 * @returns {void}
 */
function setupNavigation() {  
    // Configurar la navbar inferior
    console.log("Iniciando bottom navbar");
    setupBottomNav();

    // Configurar el menú contextual
    console.log("Configurando menú contextual");
    setupContextMenu();

    // Configurar botón adicionar y cards flotantes
    console.log("Configurando botón adicionar y cards flotantes");
    setupFlotatingCards();
}





//==============================================
//#region context menu
//==============================================

/**
 * Configura el menú contextual de la navbar superior
 * @returns {void}
 */
function setupContextMenu() {
  // Configurar opciones del menú contextual usando la configuración centralizada
  CONTEXT_MENU_CONFIG.forEach((config) => {
    const menuItem = document.getElementById(config.menuId);
    if (menuItem) {
      menuItem.onclick = (e) => {
        e.preventDefault();
        closeContextMenu();
        if (typeof loadPage === "function") {
          loadPage(config.page);
        }
      };
    }
  });
}

/**
 * Cierra el menú contextual
 * @returns {void}
 */
function closeContextMenu() {
  const dropdown = document.getElementById(ID_BTN_CONTEXT_MENU); //dropdown del menú contextual
  if (dropdown) {
    const bsDropdown = bootstrap.Dropdown.getInstance(dropdown); 
    if (bsDropdown) {
      bsDropdown.hide();
    }
  }
}




//==============================================
//#region bottom navbar
//==============================================

/**
 * Configura la navbar inferior
 * @returns {void}
 */
function setupBottomNav() {
  // Configurar botones de la navbar inferior
  const btnHome = document.getElementById(ID_NAV_HOME);
  const btnAccounting = document.getElementById(ID_NAV_ACCOUNTING);
  const btnAdd = document.getElementById(ID_NAV_ADD);

  // Configurar botón de home
  if (btnHome) btnHome.onclick = () => loadPage(PAGE_HOME);

  // Configurar botón de contabilidad
  if (btnAccounting) btnAccounting.onclick = () => loadPage(PAGE_ACCOUNTING);

  // Configurar botón adicionar
  // Toggle de cards flotantes
  if (btnAdd) btnAdd.onclick = (e) => {
       e.preventDefault();
       e.stopPropagation();
      toggleFloatingCards();
    };
}

/**
 * Establece el botón activo en la navbar inferior
 * @param {string} page - Nombre de la página a establecer como activa
 * @returns {void}
 */
function setActiveNav(page) {
  // Resetear todos los botones a estado inactivo
  // Filtrar solo las páginas que tienen navId para evitar evaluaciones innecesarias
  Object.values(PAGES_CONFIG)
    .filter((config) => config.navId !== null && config.navId !== undefined)
    .forEach((config) => {
      const btn = document.getElementById(config.navId);
      if (btn) {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-link");
      }
    });

  // Activar el botón de la página actual
  const pageConfig = PAGES_CONFIG[page];
  if (pageConfig && pageConfig.navId) {
    const activeBtn = document.getElementById(pageConfig.navId);
    if (activeBtn) {
      activeBtn.classList.remove("btn-link");
      activeBtn.classList.add("btn-primary");
    }
  }
}





//==============================================
//#region add button and floating cards
//==============================================

/**
 * Configura las cards flotantes
 * Las cards flotantes se muestran cuando se hace clic en el botón adicionar
 * @returns {void}
 */
function setupFlotatingCards() {
  const floatingCards = document.getElementById(ID_FLOATING_CARDS);
  if (!floatingCards) return;

  // Cerrar cards al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!floatingCards.contains(e.target)) {
      hideFloatingCards();
    }
  });

  // Configurar acciones de las cards usando la configuración centralizada
  FLOATING_CARDS_CONFIG.forEach((config) => {
    const card = document.getElementById(config.cardId);
    if (card) {
      card.onclick = async () => {
        hideFloatingCards();
        await loadPage(config.page);
        
        // Abrir modal si la función está definida
        if (config.openModalFunction) {
          const openModal = window[config.openModalFunction];
          if (typeof openModal === "function") {
            openModal();
          } else {
            console.warn(`Función ${config.openModalFunction} no encontrada para ${config.page}`);
          }
        }
      };
    }
  });
}

/**
 * Muestra u oculta las cards flotantes
 * @returns {void}
 */
function toggleFloatingCards() {
  const floatingCards = document.getElementById(ID_FLOATING_CARDS);
  if (!floatingCards) return;

  if (floatingCards.classList.contains("d-none")) {
    showFloatingCards();
  } else {
    hideFloatingCards();
  }
}

/**
 * Muestra las cards flotantes
 * @returns {void}
 */
function showFloatingCards() {
  const floatingCards = document.getElementById(ID_FLOATING_CARDS);
  if (!floatingCards) return;

  floatingCards.classList.remove("d-none");
}

/**
 * Oculta las cards flotantes
 * @returns {void}
 */
function hideFloatingCards() {
  const floatingCards = document.getElementById(ID_FLOATING_CARDS);
  if (!floatingCards) return;

  floatingCards.classList.add("d-none");
}




//==============================================
//#region page title
//==============================================

/**
 * Establece el título y el icono de la página
 * @param {string} page - Nombre de la página a establecer como activa
 * @returns {void}
 */
function setPageTitle(page) {
  const pageTitle = document.getElementById(ID_PAGE_TITLE);
  const pageIcon = document.getElementById(ID_MODULE_ICON);

  if (!pageTitle || !pageIcon) return;

  const pageConfig = PAGES_CONFIG[page];
  if (!pageConfig) return;

  pageTitle.textContent = pageConfig.title;
  pageIcon.className = `bi ${pageConfig.icon} fs-5 text-white`;
}
