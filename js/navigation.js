// ===============================
// Navigation - App Contable
// Gestión de navegación y menú contextual
// ===============================

//#region Constants
//context menu ids
const ID_CONTEXT_MENU_PRODUCTS = "contextMenuProducts";
const ID_CONTEXT_MENU_MOVEMENTS = "contextMenuMovements";
const ID_CONTEXT_MENU_EXPENSES = "contextMenuExpenses";
const ID_CONTEXT_MENU_INVENTORY = "contextMenuInventory";
const ID_CONTEXT_MENU_SETTINGS = "contextMenuSettings";

//add button and floating cards ids
const ID_NAV_ADD = "navAdd";
const ID_FLOATING_CARDS = "floatingCards";
const ID_FLOATING_CARD_PRODUCT = "floatingCardProduct";
const ID_FLOATING_CARD_MOVEMENT = "floatingCardMovement";
const ID_FLOATING_CARD_EXPENSE = "floatingCardExpense";
const ID_FLOATING_CARD_INVENTORY = "floatingCardInventory";
//#endregion

/**
 * Inicializa la navegación (menú contextual y botón adicionar)
 * @returns {void}
 */
function initNavigation() {
  // Configurar menú contextual
  setupContextMenu();
  
  // Configurar botón adicionar y cards flotantes
  setupAddButton();
}



//==============================================
//#region context menu
//==============================================

/**
 * Configura el menú contextual de la navbar superior
 * @returns {void}
 */
function setupContextMenu() {
  const products = document.getElementById(ID_CONTEXT_MENU_PRODUCTS);
  const movements = document.getElementById(ID_CONTEXT_MENU_MOVEMENTS);
  const expenses = document.getElementById(ID_CONTEXT_MENU_EXPENSES);
  const inventory = document.getElementById(ID_CONTEXT_MENU_INVENTORY);
  const settings = document.getElementById(ID_CONTEXT_MENU_SETTINGS);
  
  if (products) {
    products.onclick = (e) => {
      e.preventDefault();
      closeContextMenu();
      if (typeof loadPage === "function") {
        loadPage("products");
      }
    };
  }
  
  if (movements) {
    movements.onclick = (e) => {
      e.preventDefault();
      closeContextMenu();
      if (typeof loadPage === "function") {
        loadPage("movements");
      }
    };
  }
  
  if (expenses) {
    expenses.onclick = (e) => {
      e.preventDefault();
      closeContextMenu();
      if (typeof loadPage === "function") {
        loadPage("expenses");
      }
    };
  }
  
  if (inventory) {
    inventory.onclick = (e) => {
      e.preventDefault();
      closeContextMenu();
      if (typeof loadPage === "function") {
        loadPage("inventory");
      }
    };
  }
  
  if (settings) {
    settings.onclick = (e) => {
      e.preventDefault();
      closeContextMenu();
      if (typeof loadPage === "function") {
        loadPage("settings");
      }
    };
  }
}

/**
 * Cierra el menú contextual
 * @returns {void}
 */
function closeContextMenu() {
  const dropdown = document.querySelector("#contextMenuButton");
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
 * Inicializa la navbar inferior
 * @returns {void}
 */
function initBottomNav() {
  const home = document.getElementById(PAGES_CONFIG[PAGE_HOME].navId);
  const accounting = document.getElementById(PAGES_CONFIG[PAGE_ACCOUNTING].navId);

  if (home) home.onclick = () => loadPage(PAGE_HOME);
  if (accounting) accounting.onclick = () => loadPage(PAGE_ACCOUNTING);
  
  // El botón "Adicionar" se configura en navigation.js
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



//==============================================
//#region add button and floating cards
//==============================================

/**
 * Configura el botón adicionar y las cards flotantes
 * @returns {void}
 */
function setupAddButton() {
  const navAdd = document.getElementById(ID_NAV_ADD);
  const floatingCards = document.getElementById(ID_FLOATING_CARDS);
  
  if (!navAdd || !floatingCards) return;
  
  // Toggle de cards flotantes
  navAdd.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFloatingCards();
  };
  
  // Cerrar cards al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!floatingCards.contains(e.target) && !navAdd.contains(e.target)) {
      hideFloatingCards();
    }
  });
  
  // Configurar acciones de las cards
  const cardProduct = document.getElementById(ID_FLOATING_CARD_PRODUCT);
  const cardMovement = document.getElementById(ID_FLOATING_CARD_MOVEMENT);
  const cardExpense = document.getElementById(ID_FLOATING_CARD_EXPENSE);
  const cardInventory = document.getElementById(ID_FLOATING_CARD_INVENTORY);
  
  if (cardProduct) {
    cardProduct.onclick = () => {
      hideFloatingCards();
      if (typeof loadPage === "function") {
        loadPage("products");
        // Esperar a que se cargue la página y luego abrir el modal
        setTimeout(() => {
          if (typeof openAddProductModal === "function") {
            openAddProductModal();
          }
        }, 300);
      }
    };
  }
  
  if (cardMovement) {
    cardMovement.onclick = () => {
      hideFloatingCards();
      if (typeof loadPage === "function") {
        loadPage("movements");
        // Esperar a que se cargue la página y luego abrir el modal
        setTimeout(() => {
          if (typeof openMovementModal === "function") {
            openMovementModal();
          }
        }, 300);
      }
    };
  }
  
  if (cardExpense) {
    cardExpense.onclick = () => {
      hideFloatingCards();
      if (typeof loadPage === "function") {
        loadPage("expenses");
        // Esperar a que se cargue la página y luego abrir el modal
        setTimeout(() => {
          // Buscar la función para abrir el modal de gastos
          if (typeof openExpenseModal === "function") {
            openExpenseModal();
          } else if (typeof window.openExpenseModal === "function") {
            window.openExpenseModal();
          } else {
            // Intentar abrir el modal directamente
            const btnAdd = document.getElementById("btnAddExpense");
            if (btnAdd) {
              btnAdd.click();
            }
          }
        }, 300);
      }
    };
  }
  
  if (cardInventory) {
    cardInventory.onclick = () => {
      hideFloatingCards();
      if (typeof loadPage === "function") {
        loadPage("inventory");
      }
    };
  }
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
  const title = document.getElementById(ID_PAGE_TITLE);
  const icon = document.getElementById(ID_MODULE_ICON);

  if (!title || !icon) return;

  const pageConfig = PAGES_CONFIG[page];
  if (!pageConfig) return;

  title.textContent = pageConfig.title;
  icon.className = `bi ${pageConfig.icon} fs-5 text-white`;
}