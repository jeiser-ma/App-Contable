// ===============================
// Inventory - App Contable
// ===============================

//#region Constants
// IDs de botones
const BTN_ID_ADD_INVENTORY = "btnAddInventory";
const BTN_ID_CONFIRM_INVENTORY = "btnConfirmInventory";
const BTN_ID_CLEAR_SEARCH_INVENTORY = "btnClearSearchInventory";
const BTN_ID_FILTER_WAREHOUSE = "filterWarehouse";
const BTN_ID_FILTER_STORE = "filterStore";
const BTN_ID_CLEAR_FILTERS_INVENTORY = "btnClearFiltersInventory";  

// IDs de otros elementos
const ID_SEARCH_INVENTORY = "searchInventory";
const ID_INVENTORY_LIST = "inventoryList";
const ID_INVENTORY_CARD_TEMPLATE = "inventoryCardTemplate";
const ID_INVENTORY_COUNTER = "inventoryCounter";
const ID_INVENTORY_FILTER_DATE = "filterDate";
const ID_INVENTORY_PRODUCT = "inventoryProduct";
const ID_INVENTORY_QUANTITY = "inventoryQuantity";
const ID_INVENTORY_DATE = "inventoryDate";
const ID_INVENTORY_NOTE = "inventoryNote";
const ID_INVENTORY_TITLE = "inventoryTitle";
const ID_INVENTORY_ICON = "inventoryIcon";
const ID_LOCATION_WAREHOUSE = "locationWarehouse";
const ID_LOCATION_STORE = "locationStore";
const MODAL_ID_INVENTORY = "inventoryModal";
//#endregion

// Estado de la pantalla de inventario (unificado)
const INVENTORY_STATE = {
  searchText: "",
  filterLocation: null, // "WAREHOUSE" | "STORE" | null (todos)
  filterDate: null,
  orderBy: "date",
  orderDir: "desc",
};

// Exponer el estado globalmente para module-controls.js
window.INVENTORY_STATE = INVENTORY_STATE;

// Ubicación actual (para el modal)
let inventoryLocation = "WAREHOUSE"; // "WAREHOUSE" | "STORE"
let inventoryToEdit = null; // ID del conteo que se está editando
let inventoryToDelete = null; // ID del conteo que se va a eliminar

// ===============================
// Hook que llama el router
// ===============================

/**
 * Hook que se ejecuta cuando se carga la página de inventario
 * Inicializa el modal, los controles de búsqueda y filtros,
 * y configura los event listeners de los botones
 * @returns {void}
 */

async function onInventoryPageLoaded() {
  console.log("onInventoryPageLoaded execution");

  // Cargar modal de inventario
  console.log("Loading inventory-modal");
  await loadModal("inventory-modal", "inventory");
  
  // Inicializar el modal después de cargarlo
  initModal(MODAL_ID_INVENTORY);

  // Configurar controles del módulo
  setupModuleControls("inventory");

  // Configurar botón de confirmar del modal
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_INVENTORY);
  if (btnConfirm) {
    btnConfirm.onclick = saveInventoryFromModal;
  }

  // Configurar toggle de ubicación
  const locationWarehouse = document.getElementById(ID_LOCATION_WAREHOUSE);
  const locationStore = document.getElementById(ID_LOCATION_STORE);
  
  if (locationWarehouse) {
    locationWarehouse.onchange = () => {
      if (locationWarehouse.checked) {
        inventoryLocation = "WAREHOUSE";
        updateLocationUI();
      }
    };
  }

  if (locationStore) {
    locationStore.onchange = () => {
      if (locationStore.checked) {
        inventoryLocation = "STORE";
        updateLocationUI();
      }
    };
  }

  // Nota: renderInventory() se llama automáticamente al final de setupModuleControls()
}

/**
 * Actualiza la UI del modal según la ubicación seleccionada
 * @returns {void}
 */
function updateLocationUI() {
  const title = document.getElementById(ID_INVENTORY_TITLE);
  const icon = document.getElementById(ID_INVENTORY_ICON);
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_INVENTORY);

  if (!title || !icon || !btnConfirm) return;

  if (inventoryLocation === "WAREHOUSE") {
    title.textContent = inventoryToEdit ? "Editar conteo - Almacén" : "Conteo de inventario - Almacén";
    icon.className = "bi bi-houses text-primary";
    btnConfirm.className = "btn btn-primary rounded-pill btn-sm";
  } else {
    title.textContent = inventoryToEdit ? "Editar conteo - Tienda" : "Conteo de inventario - Tienda";
    icon.className = "bi bi-shop text-success";
    btnConfirm.className = "btn btn-success rounded-pill btn-sm";
  }
}

/**
 * Abre el formulario para nuevo conteo de inventario
 * @returns {void}
 */
function openInventoryModal() {
  inventoryToEdit = null;
  inventoryLocation = "WAREHOUSE"; // Por defecto almacén

  // Asegurar que el modal esté inicializado
  initModal(MODAL_ID_INVENTORY);

  const dateInput = document.getElementById(ID_INVENTORY_DATE);
  const productInput = document.getElementById(ID_INVENTORY_PRODUCT);
  const locationWarehouse = document.getElementById(ID_LOCATION_WAREHOUSE);
  const locationStore = document.getElementById(ID_LOCATION_STORE);

  if (!dateInput || !productInput) {
    console.error("No se encontraron los elementos del modal");
    return;
  }

  // Reset del formulario
  resetInventoryForm();

  // Configurar ubicación por defecto
  if (locationWarehouse) {
    locationWarehouse.checked = true;
  }
  if (locationStore) {
    locationStore.checked = false;
  }

  // Fecha por defecto = hoy
  dateInput.value = new Date().toISOString().split("T")[0];

  // Configurar autocomplete para el campo de producto
  initProductAutocomplete(productInput);

  // Actualizar UI según ubicación
  updateLocationUI();

  // Mostrar el formulario después de hacer todos los ajustes
  showModal();
}

/** 
 * @description Limpia todos los campos del formulario
 * @returns {void}
 */
function resetInventoryForm() {
  const fields = [
    ID_INVENTORY_PRODUCT,
    ID_INVENTORY_QUANTITY,
    ID_INVENTORY_DATE,
    ID_INVENTORY_NOTE,
  ];

  fields.forEach((fieldId) => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.value = "";
      el.classList.remove("is-invalid");
    }
  });
}

// ===============================
// Búsqueda
// ===============================

/**
 * Inicializa los controles de búsqueda de inventario
 * Configura el event listener para el campo de búsqueda y el botón de limpiar
 * Actualiza INVENTORY_STATE y renderiza cuando cambia el texto
 * @returns {void}
 */
function initInventorySearch() {
  const searchInput = document.getElementById(ID_SEARCH_INVENTORY);
  const btnClear = document.getElementById(BTN_ID_CLEAR_SEARCH_INVENTORY);

  if (searchInput) {
    searchInput.oninput = () => {
      INVENTORY_STATE.searchText = searchInput.value.toLowerCase().trim();
      
      // Mostrar/ocultar botón de limpiar
      if (btnClear) {
        if (INVENTORY_STATE.searchText) {
          btnClear.classList.remove("d-none");
        } else {
          btnClear.classList.add("d-none");
        }
      }

      updateClearFiltersButton();
      renderInventory();
    };
  }

  if (btnClear) {
    btnClear.onclick = () => {
      if (searchInput) {
        searchInput.value = "";
        INVENTORY_STATE.searchText = "";
        btnClear.classList.add("d-none");
        updateClearFiltersButton();
        renderInventory();
      }
    };
  }
}

/**
 * Inicializa el botón de limpiar filtros
 * @returns {void}
 */
function initClearFilters() {
  const btnClearFilters = document.getElementById(BTN_ID_CLEAR_FILTERS_INVENTORY);
  if (!btnClearFilters) return;

  btnClearFilters.onclick = () => {
    // Limpiar búsqueda
    const searchInput = document.getElementById(ID_SEARCH_INVENTORY);
    const btnClearSearch = document.getElementById(BTN_ID_CLEAR_SEARCH_INVENTORY);
    if (searchInput) {
      searchInput.value = "";
      INVENTORY_STATE.searchText = "";
      if (btnClearSearch) btnClearSearch.classList.add("d-none");
    }

    // Limpiar filtros de ubicación
    INVENTORY_STATE.filterLocation = null;
    const filterWarehouse = document.getElementById(BTN_ID_FILTER_WAREHOUSE);
    const filterStore = document.getElementById(BTN_ID_FILTER_STORE);
    if (filterWarehouse) filterWarehouse.classList.remove("active");
    if (filterStore) filterStore.classList.remove("active");

    // Limpiar filtro de fecha
    INVENTORY_STATE.filterDate = null;
    const filterDate = document.getElementById(ID_INVENTORY_FILTER_DATE);
    if (filterDate) filterDate.value = "";

    updateClearFiltersButton();
    renderInventory();
  };

  updateClearFiltersButton();
}

/**
 * Actualiza la visibilidad del botón de limpiar filtros
 * @returns {void}
 */
function updateClearFiltersButton() {
  const btnClearFilters = document.getElementById(BTN_ID_CLEAR_FILTERS_INVENTORY);
  if (!btnClearFilters) return;

  const hasFilters = INVENTORY_STATE.searchText || 
                     INVENTORY_STATE.filterLocation || 
                     INVENTORY_STATE.filterDate;
  
  if (hasFilters) {
    btnClearFilters.classList.remove("d-none");
  } else {
    btnClearFilters.classList.add("d-none");
  }
}

// ===============================
// Filtros
// ===============================

/**
 * Inicializa los controles de filtrado de inventario
 * Configura los event listeners para los chips de ubicación y el filtro de fecha
 * Actualiza INVENTORY_STATE y renderiza cuando cambian los filtros
 * @returns {void}
 */
function initInventoryFilters() {
  const filterWarehouse = document.getElementById(BTN_ID_FILTER_WAREHOUSE);
  const filterStore = document.getElementById(BTN_ID_FILTER_STORE);
  const filterDate = document.getElementById(ID_INVENTORY_FILTER_DATE);

  if (filterWarehouse) {
    filterWarehouse.onclick = () => {
      if (INVENTORY_STATE.filterLocation === "WAREHOUSE") {
        INVENTORY_STATE.filterLocation = null;
        filterWarehouse.classList.remove("active");
      } else {
        INVENTORY_STATE.filterLocation = "WAREHOUSE";
        filterWarehouse.classList.add("active");
        if (filterStore) filterStore.classList.remove("active");
      }
      updateClearFiltersButton();
      renderInventory();
    };
  }

  if (filterStore) {
    filterStore.onclick = () => {
      if (INVENTORY_STATE.filterLocation === "STORE") {
        INVENTORY_STATE.filterLocation = null;
        filterStore.classList.remove("active");
      } else {
        INVENTORY_STATE.filterLocation = "STORE";
        filterStore.classList.add("active");
        if (filterWarehouse) filterWarehouse.classList.remove("active");
      }
      updateClearFiltersButton();
      renderInventory();
    };
  }

  if (filterDate) {
    filterDate.onchange = () => {
      INVENTORY_STATE.filterDate = filterDate.value || null;
      updateClearFiltersButton();
      renderInventory();
    };
  }
}

// ===============================
// Filtrado y Ordenamiento
// ===============================

/**
 * Filtra conteos de inventario usando los criterios de INVENTORY_STATE
 * @param {Array} inventoryCounts - Lista de conteos a filtrar
 * @returns {Array} Lista de conteos filtrados
 */
function filterInventory(inventoryCounts) {
  let filtered = [...inventoryCounts];

  // Filtro por texto de búsqueda (busca en nombre del producto)
  if (INVENTORY_STATE.searchText) {
    const products = getData("products");
    filtered = filtered.filter((inv) => {
      const product = products.find((p) => p.id === inv.productId);
      if (!product) return false;
      return product.name.toLowerCase().includes(INVENTORY_STATE.searchText);
    });
  }

  // Filtro por ubicación (WAREHOUSE/STORE)
  if (INVENTORY_STATE.filterLocation) {
    filtered = filtered.filter((inv) => inv.location === INVENTORY_STATE.filterLocation);
  }

  // Filtro por fecha
  if (INVENTORY_STATE.filterDate) {
    filtered = filtered.filter((inv) => inv.date === INVENTORY_STATE.filterDate);
  }

  return filtered;
}

/**
 * Ordena conteos de inventario usando los criterios de INVENTORY_STATE
 * @param {Array} inventoryCounts - Lista de conteos a ordenar
 * @returns {Array} Lista de conteos ordenados
 */
function sortInventory(inventoryCounts) {
  return [...inventoryCounts].sort((a, b) => {
    let v1 = a[INVENTORY_STATE.orderBy];
    let v2 = b[INVENTORY_STATE.orderBy];

    // Para fechas, comparar directamente
    if (INVENTORY_STATE.orderBy === "date") {
      if (v1 < v2) return INVENTORY_STATE.orderDir === "asc" ? -1 : 1;
      if (v1 > v2) return INVENTORY_STATE.orderDir === "asc" ? 1 : -1;
      return 0;
    }

    // Normalizar strings para comparación
    if (typeof v1 === "string") {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if (v1 < v2) return INVENTORY_STATE.orderDir === "asc" ? -1 : 1;
    if (v1 > v2) return INVENTORY_STATE.orderDir === "asc" ? 1 : -1;
    return 0;
  });
}

// ===============================
// Render
// ===============================

/**
 * Renderiza la lista de conteos de inventario en el DOM
 * @param {Array} inventoryCounts - Lista de conteos a renderizar
 * @returns {void}
 */
function renderInventoryList(inventoryCounts) {
  const inventoryList = document.getElementById(ID_INVENTORY_LIST);
  const inventoryTemplate = document.getElementById(ID_INVENTORY_CARD_TEMPLATE);
  const products = getData("products");

  if (!inventoryList || !inventoryTemplate) return;

  inventoryList.innerHTML = "";

  if (inventoryCounts.length === 0) {
    inventoryList.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-search"></i>
        <p class="mb-0">No se encontraron conteos</p>
      </div>
    `;
    return;
  }

  inventoryCounts.forEach((inv) => {
    const product = products.find((p) => p.id === inv.productId);
    if (!product) return; // Si no existe el producto, no mostrar el conteo

    const node = inventoryTemplate.content.cloneNode(true);
    const card = node.querySelector(".card");
    const iconDiv = node.querySelector(".inventory-icon");
    const iconI = node.querySelector(".inventory-icon-i");
    const productName = node.querySelector(".inventory-product");
    const meta = node.querySelector(".inventory-meta");

    // Configurar icono según ubicación (WAREHOUSE = edificio azul, STORE = tienda verde)
    if (inv.location === "WAREHOUSE") {
      iconDiv.classList.add("bg-primary");
      iconI.className = "bi bi-houses text-white";
    } else {
      iconDiv.classList.add("bg-success");
      iconI.className = "bi bi-shop text-white";
    }

    // Configurar contenido
    productName.textContent = product.name;
    
    // Formatear fecha: "19/12/2025" desde "2025-12-19"
    const dateObj = new Date(inv.date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Mostrar cantidad con icono de caja y fecha
    meta.innerHTML = `<i class="bi bi-box"></i> ${inv.quantity} • <i class="bi bi-calendar"></i> ${formattedDate}`;

    // Configurar botones de acción
    node.querySelector(".btn-edit-inventory").onclick = () => openEditInventoryModal(inv.id);
    node.querySelector(".btn-delete-inventory").onclick = () => openDeleteInventoryModal(inv.id);

    inventoryList.appendChild(node);
  });
}

/**
 * Función principal que renderiza los conteos de inventario
 * Filtra, ordena y renderiza usando INVENTORY_STATE
 * @returns {void}
 */
function renderInventory() {
  const allInventory = getData("inventory") || [];

  // Primero filtrar, luego ordenar
  const filtered = filterInventory(allInventory);
  const sorted = sortInventory(filtered);

  updateModuleCounter(sorted.length, allInventory.length);
  renderInventoryList(sorted);
}

// Función removida - ahora se usa updateModuleCounter() de components.js

// ===============================
// Guardado
// ===============================

/**
 * Guarda el conteo de inventario desde el modal
 * Valida los campos y guarda el conteo (NO afecta el stock del producto)
 * @returns {void}
 */
function saveInventoryFromModal() {
  const productInput = document.getElementById(ID_INVENTORY_PRODUCT);
  const quantityInput = document.getElementById(ID_INVENTORY_QUANTITY);
  const dateInput = document.getElementById(ID_INVENTORY_DATE);
  const noteInput = document.getElementById(ID_INVENTORY_NOTE);
  const locationWarehouse = document.getElementById(ID_LOCATION_WAREHOUSE);
  const locationStore = document.getElementById(ID_LOCATION_STORE);

  if (!productInput || !quantityInput || !dateInput) {
    console.error("No se encontraron los campos del formulario");
    return;
  }

  // Obtener ubicación seleccionada
  if (locationWarehouse && locationWarehouse.checked) {
    inventoryLocation = "WAREHOUSE";
  } else if (locationStore && locationStore.checked) {
    inventoryLocation = "STORE";
  }

  const productName = productInput.value.trim();
  const quantity = Number(quantityInput.value);
  const date = dateInput.value;
  const note = noteInput ? noteInput.value.trim() : "";

  // Limpiar errores previos
  clearInputError(ID_INVENTORY_PRODUCT);
  clearInputError(ID_INVENTORY_QUANTITY);
  clearInputError(ID_INVENTORY_DATE);

  // Validaciones
  if (!productName) {
    setInputError(ID_INVENTORY_PRODUCT, "Seleccioná un producto");
    return;
  }

  const products = getData("products");
  const product = products.find(
    (p) => p.name.toLowerCase() === productName.toLowerCase()
  );

  if (!product) {
    setInputError(ID_INVENTORY_PRODUCT, "El producto no existe");
    return;
  }

  if (!quantity || quantity < 0) {
    setInputError(ID_INVENTORY_QUANTITY, "Ingresá una cantidad válida");
    return;
  }

  if (!date) {
    setInputError(ID_INVENTORY_DATE, "Seleccioná una fecha");
    return;
  }

  // Guardar conteo de inventario
  const inventory = getData("inventory") || [];
  
  if (inventoryToEdit) {
    // EDITAR: Actualizar conteo existente
    const updatedInventory = inventory.map((inv) =>
      inv.id === inventoryToEdit
        ? {
            ...inv,
            productId: product.id,
            location: inventoryLocation,
            quantity: quantity,
            date: date,
            note: note || "",
          }
        : inv
    );
    setData("inventory", updatedInventory);
    inventoryToEdit = null;
  } else {
    // NUEVO: Crear nuevo conteo
    const newInventory = {
      id: crypto.randomUUID(),
      productId: product.id,
      location: inventoryLocation,
      quantity: quantity,
      date: date,
      note: note || "",
      createdAt: new Date().toISOString(),
    };

    inventory.push(newInventory);
    setData("inventory", inventory);
  }

  // NOTA: El inventario NO afecta el stock del producto (solo es un conteo)

  // Cerrar modal y actualizar vista
  hideModal();
  inventoryLocation = "WAREHOUSE"; // Reset a valor por defecto
  renderInventory();
}

/**
 * Establece un error en el input
 * @param {string} inputId - ID del input
 * @param {string} message - Mensaje de error
 * @returns {void}
 */
function setInputError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.add("is-invalid");

  const feedback = input.nextElementSibling;
  if (feedback && feedback.classList.contains("invalid-feedback")) {
    feedback.innerText = message;
  }
}

/**
 * Limpia el error en el input
 * @param {string} inputId - ID del input
 * @returns {void}
 */
function clearInputError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("is-invalid");

  const feedback = input.nextElementSibling;
  if (feedback && feedback.classList.contains("invalid-feedback")) {
    feedback.innerText = "";
  }
}

/**
 * Inicializa el autocomplete para el campo de producto
 * Crea un datalist con todos los productos disponibles
 * @param {HTMLElement} input - Elemento input del producto
 * @returns {void}
 */
function initProductAutocomplete(input) {
  const products = getData("products");
  
  // Crear o actualizar el datalist
  let datalist = document.getElementById("productsDatalist");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "productsDatalist";
    document.body.appendChild(datalist);
  }

  // Limpiar opciones previas
  datalist.innerHTML = "";

  // Agregar opciones para cada producto
  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.name;
    datalist.appendChild(option);
  });

  // Asignar el datalist al input
  input.setAttribute("list", "productsDatalist");
}

// ===============================
// Editar y Eliminar
// ===============================

/**
 * Abre el modal para editar un conteo de inventario existente
 * @param {string} id - ID del conteo a editar
 * @returns {void}
 */
function openEditInventoryModal(id) {
  const inventory = getData("inventory") || [];
  const inventoryCount = inventory.find((inv) => inv.id === id);
  if (!inventoryCount) return;

  const products = getData("products");
  const product = products.find((p) => p.id === inventoryCount.productId);
  if (!product) return;

  inventoryToEdit = id;
  inventoryLocation = inventoryCount.location;

  // Abrir modal con los datos del conteo
  initModal(MODAL_ID_INVENTORY);

  const productInput = document.getElementById(ID_INVENTORY_PRODUCT);
  const quantityInput = document.getElementById(ID_INVENTORY_QUANTITY);
  const dateInput = document.getElementById(ID_INVENTORY_DATE);
  const noteInput = document.getElementById(ID_INVENTORY_NOTE);
  const locationWarehouse = document.getElementById(ID_LOCATION_WAREHOUSE);
  const locationStore = document.getElementById(ID_LOCATION_STORE);

  if (!productInput || !quantityInput || !dateInput) {
    console.error("No se encontraron los elementos del modal");
    return;
  }

  // Configurar ubicación
  if (locationWarehouse) {
    locationWarehouse.checked = inventoryLocation === "WAREHOUSE";
  }
  if (locationStore) {
    locationStore.checked = inventoryLocation === "STORE";
  }

  // Actualizar UI según ubicación
  updateLocationUI();

  // Llenar campos con datos del conteo
  productInput.value = product.name;
  quantityInput.value = inventoryCount.quantity;
  dateInput.value = inventoryCount.date;
  if (noteInput) {
    noteInput.value = inventoryCount.note || "";
  }

  // Limpiar errores
  clearInputError(ID_INVENTORY_PRODUCT);
  clearInputError(ID_INVENTORY_QUANTITY);
  clearInputError(ID_INVENTORY_DATE);

  // Configurar autocomplete
  initProductAutocomplete(productInput);

  // Mostrar modal
  showModal();
}

/**
 * Abre el modal de confirmación para eliminar un conteo de inventario
 * @param {string} id - ID del conteo a eliminar
 * @returns {void}
 */
function openDeleteInventoryModal(id) {
  const inventory = getData("inventory") || [];
  const inventoryCount = inventory.find((inv) => inv.id === id);
  if (!inventoryCount) return;

  const products = getData("products");
  const product = products.find((p) => p.id === inventoryCount.productId);
  const productName = product ? product.name : "Producto desconocido";

  inventoryToDelete = id;
  openConfirmDeleteModal("inventory", id, productName);
}

/**
 * Confirma la eliminación de un conteo de inventario
 * Elimina el conteo de la lista (NO afecta el stock del producto)
 * @returns {void}
 */
function confirmDeleteInventory() {
  if (!inventoryToDelete) {
    console.warn("No hay conteo configurado para eliminar");
    return;
  }

  const inventory = getData("inventory") || [];
  const inventoryCount = inventory.find((inv) => inv.id === inventoryToDelete);
  
  if (!inventoryCount) {
    console.warn("No se encontró el conteo a eliminar");
    return;
  }

  // Eliminar el conteo
  const updatedInventory = inventory.filter((inv) => inv.id !== inventoryToDelete);
  setData("inventory", updatedInventory);

  // NOTA: El inventario NO afecta el stock del producto (solo es un conteo)

  // Mostrar snackbar de undo
  showSnackbar("Conteo de inventario eliminado");
  
  // Guardar datos para undo
  UNDO_STATE.data = inventoryCount;
  UNDO_STATE.type = "inventory";

  // Limpiar estado
  inventoryToDelete = null;

  // Cerrar modal de confirmación
  hideConfirmModal();

  // Actualizar vista
  renderInventory();
}

