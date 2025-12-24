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
    openModalFunction: "openExpenseModal",
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
    openModalFunction: "openMovementModal",
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
  
  const controls = document.getElementById("moduleControls");
  if (!controls) return;

  // Mostrar controles
  controls.classList.remove("d-none");

  // 1. Configurar buscador
  const searchInput = document.getElementById("moduleSearchInput");
  const btnClearSearch = document.getElementById("moduleClearSearch");
  
  if (searchInput) {
    searchInput.placeholder = config.searchPlaceholder;
    searchInput.value = "";
    
    // Remover listeners previos
    searchInput.oninput = null;
    searchInput.removeEventListener("input", searchInput._moduleInputHandler);
    
    // Crear nuevo handler
    const inputHandler = () => {
      const value = searchInput.value.toLowerCase().trim();
      console.log(`Search input changed: "${value}"`);
      if (btnClearSearch) {
        btnClearSearch.classList.toggle("d-none", !value);
      }
      updateModuleState("searchText", value);
      callModuleRender();
    };
    
    searchInput._moduleInputHandler = inputHandler;
    searchInput.oninput = inputHandler;

    if (btnClearSearch) {
      btnClearSearch.onclick = null;
      btnClearSearch.removeEventListener("click", btnClearSearch._moduleClickHandler);
      
      const clearHandler = () => {
        console.log("Clear search clicked");
        searchInput.value = "";
        btnClearSearch.classList.add("d-none");
        updateModuleState("searchText", "");
        callModuleRender();
      };
      
      btnClearSearch._moduleClickHandler = clearHandler;
      btnClearSearch.onclick = clearHandler;
    }
  } else {
    console.error("moduleSearchInput not found!");
  }

  // 2. Configurar ordenamiento
  const sortContainer = document.getElementById("moduleSortContainer");
  const orderBy = document.getElementById("moduleOrderBy");
  const orderDir = document.getElementById("moduleOrderDir");
  
  if (config.hasSort && config.sortOptions.length > 0) {
    if (sortContainer) sortContainer.classList.remove("d-none");
    
    if (orderBy) {
      // Limpiar opciones
      orderBy.innerHTML = '<option value="" disabled selected>Ordenar…</option>';
      
      // Agregar opciones
      config.sortOptions.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        orderBy.appendChild(option);
      });

      // Establecer valor inicial del ordenamiento
      const initialState = getModuleState("orderBy");
      if (initialState && orderBy) {
        orderBy.value = initialState;
      }
      
      // Establecer dirección inicial
      const initialDir = getModuleState("orderDir");
      if (orderDir) {
        orderDir.innerHTML = (initialDir === "desc")
          ? '<i class="bi bi-sort-alpha-up"></i>'
          : '<i class="bi bi-sort-alpha-down"></i>';
      }

      orderBy.onchange = () => {
        if (orderBy.value) {
          console.log(`Order by changed: ${orderBy.value}`);
          updateModuleState("orderBy", orderBy.value);
          callModuleRender();
        }
      };

      if (orderDir) {
        orderDir.onclick = () => {
          const currentDir = getModuleState("orderDir");
          const newDir = currentDir === "asc" ? "desc" : "asc";
          updateModuleState("orderDir", newDir);
          
          // Actualizar icono
          orderDir.innerHTML = newDir === "asc"
            ? '<i class="bi bi-sort-alpha-down"></i>'
            : '<i class="bi bi-sort-alpha-up"></i>';
          
          callModuleRender();
        };
      }
    }
  } else {
    if (sortContainer) sortContainer.classList.add("d-none");
  }

  // 3. Configurar botón de acción (agregar) - solo si existe
  const actionButtonsContainer = document.getElementById("moduleActionButtons");
  if (actionButtonsContainer) {
    actionButtonsContainer.innerHTML = "";
    
    if (config.addButtonId && config.openModalFunction) {
      const button = document.createElement("button");
      button.id = config.addButtonId;
      button.innerHTML = '<i class="bi bi-plus fs-5"></i>';
      button.className = "btn btn-primary rounded-circle d-flex align-items-center justify-content-center";
      button.setAttribute("style", "width: 40px; height: 40px");
      button.setAttribute("title", config.addButtonTitle);
      button.onclick = () => {
        const openModalFn = window[config.openModalFunction];
        if (openModalFn && typeof openModalFn === "function") {
          openModalFn();
        }
      };
      actionButtonsContainer.appendChild(button);
    }
  }

  // 4. Configurar chips de filtro (fijos en el layout, solo mostrar/ocultar)
  // Ocultar todos los chips primero
  const filterIn = document.getElementById("filterIn");
  const filterOut = document.getElementById("filterOut");
  const filterWarehouse = document.getElementById("filterWarehouse");
  const filterStore = document.getElementById("filterStore");
  const filterLowStock = document.getElementById("filterLowStock");
  const filterCriticalStock = document.getElementById("filterCriticalStock");
  
  if (filterIn) filterIn.classList.add("d-none");
  if (filterOut) filterOut.classList.add("d-none");
  if (filterWarehouse) filterWarehouse.classList.add("d-none");
  if (filterStore) filterStore.classList.add("d-none");
  if (filterLowStock) filterLowStock.classList.add("d-none");
  if (filterCriticalStock) filterCriticalStock.classList.add("d-none");
  
  // Remover clases active de todos los chips
  [filterIn, filterOut, filterWarehouse, filterStore, filterLowStock, filterCriticalStock].forEach(chip => {
    if (chip) chip.classList.remove("active");
  });
  
  // Configurar chips según el módulo
  if (config.hasChips && config.chips.length > 0) {
    config.chips.forEach(chip => {
      const chipElement = document.getElementById(chip.id);
      if (chipElement) {
        // Mostrar el chip
        chipElement.classList.remove("d-none");
        
        // Configurar onclick
        chipElement.onclick = null;
        chipElement.removeEventListener("click", chipElement._moduleChipHandler);
        
        const chipHandler = () => {
          console.log(`Chip clicked: ${chip.id}, filterKey: ${chip.filterKey}, filterValue: ${chip.filterValue}`);
          const currentValue = getModuleState(chip.filterKey);
          console.log(`Current value: ${currentValue}`);
          
          if (currentValue === chip.filterValue) {
            // Desactivar filtro
            console.log("Deactivating filter");
            updateModuleState(chip.filterKey, null);
            chipElement.classList.remove("active");
          } else {
            // Activar este filtro y desactivar otros del mismo grupo
            console.log("Activating filter");
            updateModuleState(chip.filterKey, chip.filterValue);
            chipElement.classList.add("active");
            
            // Desactivar otros chips del mismo grupo
            config.chips.forEach(otherChip => {
              if (otherChip.id !== chip.id && otherChip.filterKey === chip.filterKey) {
                const otherElement = document.getElementById(otherChip.id);
                if (otherElement) otherElement.classList.remove("active");
              }
            });
          }
          
          callModuleRender();
        };
        
        chipElement._moduleChipHandler = chipHandler;
        chipElement.onclick = chipHandler;
      }
    });
  }

  // 5. Configurar filtro de fecha
  const dateFilter = document.getElementById("moduleFilterDate");
  if (dateFilter) {
    if (config.hasDateFilter) {
      dateFilter.classList.remove("d-none");
      
      // Para inventory, establecer fecha de hoy por defecto
      if (moduleName === "inventory") {
        const today = new Date().toISOString().split("T")[0];
        dateFilter.value = today;
        updateModuleState("filterDate", today);
      } else {
        dateFilter.value = "";
      }
      
      dateFilter.onchange = () => {
        console.log(`Date filter changed: ${dateFilter.value || null}`);
        updateModuleState("filterDate", dateFilter.value || null);
        callModuleRender();
      };
    } else {
      dateFilter.classList.add("d-none");
    }
  }

  // 6. Configurar botón limpiar filtros (siempre visible, limpia todo)
  const btnClearFilters = document.getElementById("moduleClearFilters");
  if (btnClearFilters) {
    btnClearFilters.onclick = () => {
      // Limpiar buscador
      if (searchInput) {
        searchInput.value = "";
        updateModuleState("searchText", "");
        if (btnClearSearch) btnClearSearch.classList.add("d-none");
      }

      // Limpiar ordenamiento (si existe)
      if (config.hasSort && orderBy) {
        orderBy.value = "";
        updateModuleState("orderBy", config.sortOptions[0]?.value || "name");
        updateModuleState("orderDir", "asc");
        if (orderDir) {
          orderDir.innerHTML = '<i class="bi bi-sort-alpha-down"></i>';
        }
      }

      // Limpiar chips (si existen)
      if (config.hasChips) {
        config.chips.forEach(chip => {
          updateModuleState(chip.filterKey, null);
          const chipElement = document.getElementById(chip.id);
          if (chipElement) {
            chipElement.classList.remove("active");
          }
        });
      } else {
        // Si no hay chips, asegurarse de que todos estén ocultos
        [filterIn, filterOut, filterWarehouse, filterStore, filterLowStock, filterCriticalStock].forEach(chip => {
          if (chip) {
            chip.classList.add("d-none");
            chip.classList.remove("active");
          }
        });
      }

      // Limpiar filtro de fecha (si existe)
      if (config.hasDateFilter && dateFilter) {
        dateFilter.value = "";
        updateModuleState("filterDate", null);
      }

      callModuleRender();
    };
  }

  // 7. Actualizar contador inicial
  updateModuleCounterFromData();
  
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
  const controls = document.getElementById("moduleControls");
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
