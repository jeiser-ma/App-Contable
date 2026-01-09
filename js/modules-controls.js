// ===============================
// Module Controls - App Contable
// Controla la visibilidad y configuración de los controles del módulo
// ===============================

let currentModule = null;

// Configuración centralizada por módulo
const MODULES_CONFIG = {
  products: {
    searchPlaceholder: "Buscar producto...",
    hasSort: true,
    sortOptions: [
      { value: "name", label: "Nombre" },
      { value: "price", label: "Precio" },
      { value: "quantity", label: "Cantidad" },
    ],
    hasChips: true,
    hasDateFilter: false,
    counterLabel: "productos",
    stateName: "PRODUCTS_STATE",
    renderFunction: "renderProducts",
    openModalFunction: "openAddProductModal",
    addButtonId: "btnAddProduct",
    addButtonTitle: "Agregar producto",
    chips: [
      { id: "filterLowStock", label: "Stock bajo", icon: "bi-box", colorClass: "warning", filterKey: "filterStockStatus", filterValue: "low" },
      { id: "filterCriticalStock", label: "Stock crítico", icon: "bi-box", colorClass: "danger", filterKey: "filterStockStatus", filterValue: "critical" },
    ],
  },
  expenses: {
    searchPlaceholder: "Buscar gasto...",
    hasSort: true,
    sortOptions: [
      { value: "concept", label: "Concepto" },
      { value: "date", label: "Fecha" },
    ],
    hasChips: false,
    hasDateFilter: true,
    counterLabel: "gastos",
    stateName: "EXPENSES_STATE",
    renderFunction: "renderExpenses",
    openModalFunction: "openAddExpenseModal",
    addButtonId: "btnAddExpense",
    addButtonTitle: "Agregar gasto",
    chips: [],
  },
  movements: {
    searchPlaceholder: "Buscar producto...",
    hasSort: false,
    sortOptions: [],
    hasChips: true,
    hasDateFilter: true,
    counterLabel: "movimientos",
    stateName: "MOVEMENTS_STATE",
    renderFunction: "renderMovements",
    openModalFunction: "openAddMovementModal",
    addButtonId: "btnAddMovement",
    addButtonTitle: "Agregar movimiento",
    chips: [
      { id: "filterIn", label: "Entradas", icon: null, colorClass: "success", filterKey: "filterType", filterValue: "in" },
      { id: "filterOut", label: "Salidas", icon: null, colorClass: "danger", filterKey: "filterType", filterValue: "out" },
    ],
  },
  inventory: {
    searchPlaceholder: "Buscar producto...",
    hasSort: false,
    sortOptions: [],
    hasChips: false,
    hasDateFilter: true,
    counterLabel: "inventarios",
    stateName: "INVENTORY_STATE",
    renderFunction: "renderInventory",
    openModalFunction: null, // No hay botón de agregar, se abre desde las cards
    addButtonId: null,
    addButtonTitle: null,
    chips: [],
  },
};

/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupModuleControls(moduleName) {
  const config = MODULES_CONFIG[moduleName];
  if (!config) {
    console.error(`Configuración no encontrada para el módulo: ${moduleName}`);
    return;
  }

  currentModule = moduleName;
  
  // Verificar que el estado del módulo esté disponible
  const state = window[config.stateName];
  if (!state) {
    console.error(`Estado ${config.stateName} no encontrado para el módulo: ${moduleName}`);
    return;
  }
  
  const controls = document.getElementById(ID_MODULE_CONTROLS);
  if (!controls) return;

  // Mostrar controles
  controls.classList.remove("d-none");

  // Configurar controles
  // 1. Buscador
  setupSearchInput(moduleName);
  // 2. Botón de agregar
  setupBtnAdd(moduleName);
  // 3. Ordenamiento
  setupOrderBy(moduleName);
  // 4. Filtro de fecha
  setupDateFilter(moduleName);
  // 5. Filtros de chips
  setupChipsFilter(moduleName);
  // 6. Contador
  updateModuleCounterFromData();
  //setupListCounter(moduleName);
  // 7. Botón de limpiar filtros
  setupBtnClearFilters(moduleName);

  
  // 8. Renderizar inicialmente
  callModuleRender();
}

/**
 * Obtiene el estado del módulo actual
 * @param {string} key - Clave del estado
 * @returns {any}
 */
function getModuleState(key) {
  if (!currentModule) return null;
  const config = MODULES_CONFIG[currentModule];
  if (!config) return null;
  
  const state = window[config.stateName];
  return state ? state[key] : null;
}

/**
 * Actualiza el estado del módulo actual
 * @param {string} key - Clave del estado
 * @param {any} value - Valor a asignar
 * @returns {void}
 */
function updateModuleState(key, value) {
  if (!currentModule) {
    console.warn("updateModuleState: currentModule is null");
    return;
  }
  const config = MODULES_CONFIG[currentModule];
  if (!config) {
    console.warn(`updateModuleState: config not found for module ${currentModule}`);
    return;
  }
  
  const state = window[config.stateName];
  if (state) {
    const oldValue = state[key];
    state[key] = value;
    console.log(`updateModuleState: ${currentModule}.${key} = ${value} (was: ${oldValue})`, state);
  } else {
    console.error(`updateModuleState: state ${config.stateName} not found in window`);
  }
}

/**
 * Llama a la función de render del módulo actual
 * @returns {void}
 */
function callModuleRender() {
  if (!currentModule) {
    console.warn("callModuleRender: currentModule is null");
    return;
  }
  const config = MODULES_CONFIG[currentModule];
  if (!config) {
    console.warn(`callModuleRender: config not found for module ${currentModule}`);
    return;
  }
  
  const renderFn = window[config.renderFunction];
  if (renderFn && typeof renderFn === "function") {
    console.log(`callModuleRender: calling ${config.renderFunction} for ${currentModule}`);
    renderFn();
  } else {
    console.error(`callModuleRender: function ${config.renderFunction} not found or not a function`);
  }
}

/**
 * Actualiza el contador del módulo desde los datos
 * @returns {void}
 */
function updateModuleCounterFromData() {
  if (!currentModule) return;
  const config = MODULES_CONFIG[currentModule];
  if (!config) return;
  
  const counter = document.getElementById("moduleCounter");
  if (!counter) return;

  // Obtener datos según el módulo
  let data = [];
  if (currentModule === "products") {
    data = getData("products") || [];
  } else if (currentModule === "movements") {
    data = getData("movements") || [];
  } else if (currentModule === "inventory") {
    data = getData("inventory") || [];
  } else if (currentModule === "expenses") {
    data = getData("expenses") || [];
  }

  // Por ahora mostrar total, luego se actualizará con el render
  counter.textContent = `0 de ${data.length} ${config.counterLabel}`;
}

/**
 * Oculta los controles del módulo
 * @returns {void}
 */
function hideModuleControls() {
  const controls = document.getElementById(ID_MODULE_CONTROLS);
  if (controls) {
    controls.classList.add("d-none");
  }
  currentModule = null;
}

/**
 * Actualiza el contador del módulo
 * @param {number} current - Cantidad actual
 * @param {number} total - Cantidad total
 * @returns {void}
 */
function updateModuleCounter(current, total) {
  if (!currentModule) return;
  const config = MODULES_CONFIG[currentModule];
  if (!config) return;
  
  const counter = document.getElementById("moduleCounter");
  if (counter) {
    counter.textContent = `${current} de ${total} ${config.counterLabel}`;
  }
}

/**
 * Obtiene el valor del buscador
 * @returns {string}
 */
function getModuleSearchValue() {
  const searchInput = document.getElementById("moduleSearchInput");
  return searchInput ? searchInput.value.toLowerCase().trim() : "";
}

/**
 * Limpia el buscador
 * @returns {void}
 */
function clearModuleSearch() {
  const searchInput = document.getElementById("moduleSearchInput");
  const btnClearSearch = document.getElementById("moduleClearSearch");
  if (searchInput) {
    searchInput.value = "";
    updateModuleState("searchText", "");
    if (btnClearSearch) {
      btnClearSearch.classList.add("d-none");
    }
  }
}
