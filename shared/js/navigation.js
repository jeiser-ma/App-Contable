// ===============================
// Navigation - App Contable
// Gestión de navegación y menú contextual
// ===============================

//#region Constants
const ID_CONTEXT_MENU_PRODUCTS = "contextMenuProducts";
const ID_CONTEXT_MENU_MOVEMENTS = "contextMenuMovements";
const ID_CONTEXT_MENU_EXPENSES = "contextMenuExpenses";
const ID_CONTEXT_MENU_INVENTORY = "contextMenuInventory";
const ID_CONTEXT_MENU_SETTINGS = "contextMenuSettings";
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

