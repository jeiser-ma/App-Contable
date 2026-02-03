// ===============================
// Inventory - App Contable
// ===============================

//#region Constants
const BTN_ID_CONFIRM_INVENTORY = "btnConfirmInventory";

const ID_PENDING_INVENTORY_LIST = "pendingInventoryList";
const ID_PARTIAL_INVENTORY_LIST = "partialInventoryList";
const ID_COMPLETED_INVENTORY_LIST = "completedInventoryList";
const ID_PENDING_CARD_TEMPLATE = "pendingInventoryCardTemplate";
const ID_PARTIAL_CARD_TEMPLATE = "partialInventoryCardTemplate";
const ID_COMPLETED_CARD_TEMPLATE = "completedInventoryCardTemplate";

const ID_INVENTORY_PRODUCT_LABEL = "inventoryProductLabel";
const ID_LOCATION_WAREHOUSE_INPUT = "locationWarehouseInput";
const ID_LOCATION_STORE_INPUT = "locationStoreInput";

//#endregion

// Estado de la pantalla de inventario (unificado)
const INVENTORY_STATE = {
  // Texto de búsqueda (para el input de búsqueda)
  searchText: "",
  // no tiene fecha de filtrado
  filterDate: null,
  // no tiene campo por el que se ordena
  orderBy: null,
  // no tiene dirección de ordenamiento
  orderDir: null,
  // Tipo de inventario filtrado (para los chips de filtro)
  chipFiltered: null, // "pending" | "partial" | "completed" | null (todos)
  // ID del inventario que se va a editar
  elementToEdit: null,
  // ID del inventario que se va a eliminar
  elementToDelete: null,
  // No tiene tipo de inventario actual
  currentType: null,
};

// Exponer el estado globalmente para module-controls.js
window.INVENTORY_STATE = INVENTORY_STATE;

// ===============================
// Hook que llama el router
// ===============================

/**
 * Hook que se ejecuta cuando se carga la página de inventario
 * Inicializa el modal, configura los controles y establece la fecha por defecto
 * @returns {void}
 */
async function onInventoryPageLoaded() {
  console.log("onInventoryPageLoaded execution");

  // Establecer fecha por defecto (hoy)
  const today = new Date().toISOString().split("T")[0];
  INVENTORY_STATE.filterDate = today;

  // Cargar modal de inventario
  console.log("Loading inventory-modal");
  await loadModal(MODAL_INVENTORY, PAGE_INVENTORY);

  // Inicializar el modal después de cargarlo
  initModalModule(MODAL_INVENTORY);

  // Configurar controles del módulo
  //setupModuleControls(PAGE_INVENTORY);

  // Configurar controles del módulo
  await setupInventoryControls();

  // Configurar botón de confirmar del modal
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_INVENTORY);
  if (btnConfirm) {
    btnConfirm.onclick = saveInventoryFromModal;
  }

  // Renderizar la lista de inventario
  renderInventory();
}

/**
 * Configura los controles del módulo de inventario
 * @returns {void}
 */
async function setupInventoryControls() {
  // Limpiar el contenido de los controles del módulo
  clearModuleControlsContent();

  // Mostrar los controles del módulo
  showModuleControls();

  // Cargar el control de búsqueda
  await loadModuleControl(CONTROL_SEARCH_INPUT);
  // Configurar el control de búsqueda
  setupSearchInput(PAGE_INVENTORY, INVENTORY_STATE, renderInventory);

  // El inventario no tiene botón de agregar
  //await loadModuleControl(CONTROL_BTN_ADD);
  // Configurar el botón de agregar
  //setupBtnAdd(openAddInventoryModal);

  // Cargar el control de filtro de fecha
  // El filtro de fecha ya se configura en setupDateFilter con la fecha de hoy
  await loadModuleControl(CONTROL_DATE_FILTER);
  // Configurar el filtro de fecha
  setupDateFilter(PAGE_INVENTORY, INVENTORY_STATE, renderInventory);

  // el inventario no tiene campo de ordenamiento
  //await loadModuleControl(CONTROL_ORDER_BY);
  // Configurar el control de ordenamiento
  //setupOrderBy(PAGE_INVENTORY, INVENTORY_STATE, renderInventory);

  // el inventario no tiene campo de chips filter
  //await loadModuleControl(CONTROL_CHIPS_FILTER);
  // Configurar el control de chips filter
  //setupChipsFilter(PAGE_INVENTORY, INVENTORY_STATE, renderInventory);

  // el inventario no tiene control de contador de elementos
  //await loadModuleControl(CONTROL_LIST_COUNTER);
  // No es necesario configurarle comportamiento,
  // se actualizará automáticamente al renderizar la lista

  // cargar el control de limpiar filtros
  await loadModuleControl(CONTROL_BTN_CLEAR_FILTERS);
  // Configurar el control de limpiar filtros
  setupBtnClearFilters(PAGE_INVENTORY, INVENTORY_STATE, renderInventory);
}

/**
 * Abre el modal para realizar inventario de un producto
 * @param {string} productId - ID del producto
 * @returns {void}
 */
function openAddInventoryModal(productId) {
  INVENTORY_STATE.elementToEdit = productId;

  const products = getData("products") || [];
  const product = products.find((p) => p.id === productId);

  if (!product) {
    console.error("Producto no encontrado");
    return;
  }

  initModalModule(MODAL_INVENTORY);

  const productLabel = document.getElementById(ID_INVENTORY_PRODUCT_LABEL);
  const productStock = document.getElementById("inventoryProductStock");
  const warehouseInput = document.getElementById(ID_LOCATION_WAREHOUSE_INPUT);
  const storeInput = document.getElementById(ID_LOCATION_STORE_INPUT);

  if (!productLabel || !warehouseInput || !storeInput) {
    console.error("No se encontraron los elementos del modal de inventario");
    return;
  }

  // Mostrar nombre del producto
  productLabel.textContent = product.name;

  // Mostrar stock del producto
  if (productStock) {
    productStock.textContent = product.quantity || 0;
  }

  // Obtener inventario existente para este producto en esta fecha (si existe)
  const date =
    INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];
  const allInventory = getData("inventory") || [];
  const existingInventory = allInventory.find(
    (inv) =>
      inv.productId === productId &&
      inv.date === date &&
      ["CONFIRMED", "CLOSED"].includes(inv.status)
  );

  // Cargar valores existentes o limpiar campos
  const isClosed = existingInventory?.status === "CLOSED";
  if (existingInventory) {
    warehouseInput.value =
      existingInventory.warehouseQuantity !== null &&
        existingInventory.warehouseQuantity !== undefined
        ? existingInventory.warehouseQuantity
        : "";
    storeInput.value =
      existingInventory.storeQuantity !== null &&
        existingInventory.storeQuantity !== undefined
        ? existingInventory.storeQuantity
        : "";
  } else {
    warehouseInput.value = "";
    storeInput.value = "";
  }

  // Inventarios cerrados (contabilidad cerrada): solo lectura, no permitir guardar
  if (isClosed) {
    warehouseInput.readOnly = true;
    storeInput.readOnly = true;
    const btnConfirm = document.getElementById(BTN_ID_CONFIRM_INVENTORY);
    if (btnConfirm) {
      btnConfirm.disabled = true;
      btnConfirm.setAttribute("title", "Contabilidad cerrada: no se puede editar");
    }
  } else {
    warehouseInput.readOnly = false;
    storeInput.readOnly = false;
    const btnConfirm = document.getElementById(BTN_ID_CONFIRM_INVENTORY);
    if (btnConfirm) {
      btnConfirm.disabled = false;
      btnConfirm.removeAttribute("title");
    }
  }

  // Limpiar errores
  clearInputError(ID_LOCATION_WAREHOUSE_INPUT);
  clearInputError(ID_LOCATION_STORE_INPUT);

  showModalModules();
}

/**
 * Guarda un inventario en almacenamiento (crear o actualizar por productId + date).
 * Función genérica usada desde el modal y para inventarios de stock cero.
 * @param {string} productId - ID del producto
 * @param {string} date - Fecha YYYY-MM-DD
 * @param {number|null} warehouseQuantity - Cantidad en almacén
 * @param {number|null} storeQuantity - Cantidad en tienda
 * @returns {Object|undefined} El inventario guardado o undefined si falla
 */
function saveInventory(productId, date, warehouseQuantity, storeQuantity) {
  const inventory = getData(PAGE_INVENTORY) || [];
  const existingIndex = inventory.findIndex(
    (inv) => inv.productId === productId && inv.date === date
  );

  let finalId = crypto.randomUUID();
  let finalCreatedAt = new Date().toISOString();
  if (existingIndex >= 0) {
    finalId = inventory[existingIndex].id;
    finalCreatedAt = inventory[existingIndex].createdAt;
  }

  const inventoryData = {
    id: finalId,
    productId,
    warehouseQuantity: warehouseQuantity ?? null,
    storeQuantity: storeQuantity ?? null,
    date,
    status: "CONFIRMED",
    createdAt: finalCreatedAt,
  };

  if (existingIndex >= 0) {
    inventory[existingIndex] = inventoryData;
  } else {
    inventory.push(inventoryData);
  }

  setData(PAGE_INVENTORY, inventory);
  return inventoryData;
}

/**
 * Valida y obtiene las cantidades finales de almacén/tienda desde el modal.
 * Resuelve vacíos usando valores existentes si es edición.
 * @returns {{ valid: boolean, date?: string, warehouseQuantity?: number|null, storeQuantity?: number|null, productId?: string }} Resultado de validación y valores
 */
function getValidatedInventoryValuesFromModal() {
  const warehouseInput = document.getElementById(ID_LOCATION_WAREHOUSE_INPUT);
  const storeInput = document.getElementById(ID_LOCATION_STORE_INPUT);

  if (!warehouseInput || !storeInput || !INVENTORY_STATE.elementToEdit) {
    console.error(
      "No se encontraron los campos del formulario o el producto actual"
    );
    return { valid: false };
  }

  const date = INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];

  // Limpiar errores previos
  clearInputError(ID_LOCATION_WAREHOUSE_INPUT);
  clearInputError(ID_LOCATION_STORE_INPUT);

  // Obtener valores (pueden estar vacíos)
  const warehouseValue = warehouseInput.value.trim();
  const storeValue = storeInput.value.trim();

  // Validar que al menos uno tenga valor
  if (!warehouseValue && !storeValue) {
    setInputError(
      ID_LOCATION_WAREHOUSE_INPUT,
      "Ingresá al menos una cantidad (almacén o tienda)"
    );
    return { valid: false };
  }

  // Convertir a números (si está vacío, se manejará después)
  let warehouseQuantity = warehouseValue === "" ? null : Number(warehouseValue);
  let storeQuantity = storeValue === "" ? null : Number(storeValue);

  // Validar que no sean negativos (solo si tienen valor)
  if (warehouseQuantity !== null && warehouseQuantity < 0) {
    setInputError(
      ID_LOCATION_WAREHOUSE_INPUT,
      "La cantidad no puede ser negativa"
    );
    return { valid: false };
  }

  if (storeQuantity !== null && storeQuantity < 0) {
    setInputError(ID_LOCATION_STORE_INPUT, "La cantidad no puede ser negativa");
    return { valid: false };
  }

  // Validar que no tengan comas (solo números enteros o decimales con punto)
  if (warehouseValue.includes(",")) {
    setInputError(
      ID_LOCATION_WAREHOUSE_INPUT,
      "Usá punto (.) en lugar de coma para decimales"
    );
    return { valid: false };
  }

  if (storeValue.includes(",")) {
    setInputError(
      ID_LOCATION_STORE_INPUT,
      "Usá punto (.) en lugar de coma para decimales"
    );
    return { valid: false };
  }

  // Validar que sean números válidos
  if (
    warehouseValue !== "" &&
    (isNaN(warehouseQuantity) || !isFinite(warehouseQuantity))
  ) {
    setInputError(ID_LOCATION_WAREHOUSE_INPUT, "Ingresá un número válido");
    return { valid: false };
  }

  if (storeValue !== "" && (isNaN(storeQuantity) || !isFinite(storeQuantity))) {
    setInputError(ID_LOCATION_STORE_INPUT, "Ingresá un número válido");
    return { valid: false };
  }


  // Validar que la suma no supere el stock total del producto
  const products = getData(PAGE_PRODUCTS) || [];
  const product = products.find((p) => p.id === INVENTORY_STATE.elementToEdit);
  if (product) {
    const productStock = product.quantity || 0;
    const totalInventory =
      (warehouseQuantity ?? 0) + (storeQuantity ?? 0);
    if (totalInventory > productStock) {
      const errorMessage = `La suma (${totalInventory}) supera el stock disponible (${productStock})`;
      setInputError(ID_LOCATION_WAREHOUSE_INPUT, errorMessage);
      setInputError(ID_LOCATION_STORE_INPUT, errorMessage);
      return { valid: false };
    }
  }

  return {
    valid: true,
    date,
    productId: INVENTORY_STATE.elementToEdit,
    warehouseQuantity: warehouseQuantity,
    storeQuantity: storeQuantity,
  };
}

/**
 * Guarda el conteo de inventario desde el modal.
 * Valida entradas, resuelve valores y delega el guardado a saveInventory.
 * @returns {void}
 */
function saveInventoryFromModal() {
  const result = getValidatedInventoryValuesFromModal();
  if (!result.valid) return;

  // No permitir guardar si el inventario ya está cerrado (contabilidad cerrada)
  const inventory = getData(PAGE_INVENTORY) || [];
  const existing = inventory.find(
    (inv) =>
      inv.productId === result.productId &&
      inv.date === result.date
  );
  if (existing?.status === "CLOSED") {
    showSnackbar("No se puede editar: la contabilidad de esta fecha está cerrada");
    return;
  }

  saveInventory(result.productId, result.date, result.warehouseQuantity, result.storeQuantity);

  // Cerrar modal y actualizar vista
  hideModalModules();
  INVENTORY_STATE.elementToEdit = null;
  renderInventory();
}

/**
 * Elimina un conteo de inventario
 * @param {string} inventoryId - ID del conteo a eliminar
 * @returns {void}
 */
function openDeleteInventoryModal(inventoryId) {
  // No permitir eliminar inventarios virtuales de stock cero
  if (inventoryId?.startsWith("zero-stock-")) {
    return;
  }

  const inventory = getData("inventory") || [];
  const inv = inventory.find((i) => i.id === inventoryId);
  if (!inv) return;

  // No permitir eliminar inventarios cerrados (contabilidad cerrada)
  if (inv.status === "CLOSED") {
    showSnackbar("No se puede eliminar: la contabilidad de esta fecha está cerrada");
    return;
  }

  const products = getData("products") || [];
  const product = products.find((p) => p.id === inv.productId);
  const productName = product ? product.name : "Inventario";

  DELETE_STATE.type = "inventory";
  DELETE_STATE.id = inventoryId;

  openConfirmDeleteModal("inventory", inventoryId, productName);
}

/**
 * Confirma la eliminación de un conteo de inventario
 * @returns {void}
 */
function confirmDeleteInventory() {
  if (!DELETE_STATE.id) return;

  const inventory = getData("inventory") || [];
  const deleted = inventory.find((i) => i.id === DELETE_STATE.id);
  if (!deleted) return;

  // No permitir eliminar inventarios cerrados (contabilidad cerrada)
  if (deleted.status === "CLOSED") {
    showSnackbar("No se puede eliminar: la contabilidad de esta fecha está cerrada");
    return;
  }

  // Guardar estado para undo
  UNDO_STATE.data = deleted;
  UNDO_STATE.type = "inventory";

  const updated = inventory.filter((i) => i.id !== DELETE_STATE.id);
  setData("inventory", updated);

  DELETE_STATE.type = null;
  DELETE_STATE.id = null;

  hideConfirmModal();
  renderInventory();
  showSnackbar("Conteo de inventario eliminado");
}

// ===============================
// Filtrado
// ===============================

/**
 * Filtra productos de inventario según el texto de búsqueda
 * @param {Array} products - Lista de productos a filtrar
 * @returns {Array} Lista de productos filtrados
 */
function filterInventoryProductsByName(products) {
  if (!INVENTORY_STATE.searchText) return products;

  return products.filter((p) =>
    p.name.toLowerCase().includes(INVENTORY_STATE.searchText.toLowerCase())
  );
}

// ===============================
// Render
// ===============================

/**
 * Renderiza la lista de productos pendientes
 * @param {Array} products - Lista de productos pendientes
 * @param {boolean} allComplete - Indica si todos los productos tienen inventario completo
 * @returns {void}
 */
function renderPendingInventoryList(products, allComplete = false) {
  const list = document.getElementById(ID_PENDING_INVENTORY_LIST);
  const template = document.getElementById(ID_PENDING_CARD_TEMPLATE);

  if (!list || !template) return;

  list.innerHTML = "";

  if (products.length === 0) {
    // Solo mostrar mensaje si todos los productos tienen inventario completo (ambos valores)
    if (allComplete) {
      list.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="bi bi-check-circle"></i>
          <p class="mb-0">Todos los productos tienen inventario del día</p>
        </div>
      `;
    }
    return;
  }

  products.forEach((product) => {
    const node = template.content.cloneNode(true);

    const productName = node.querySelector(".pending-product-name");
    if (productName) productName.textContent = product.name;

    const productStock = node.querySelector(".pending-product-stock");
    if (productStock) {
      productStock.textContent = product.quantity || 0;
    }

    const btnAdd = node.querySelector(".btn-add-inventory");
    if (btnAdd) {
      btnAdd.onclick = () => openAddInventoryModal(product.id);
    }

    list.appendChild(node);
  });
}

/**
 * Renderiza la lista de productos parciales
 * @param {Array} inventoryCounts - Lista de conteos de inventario parciales
 * @returns {void}
 */
function renderPartialInventoryList(inventoryCounts) {
  const list = document.getElementById(ID_PARTIAL_INVENTORY_LIST);
  const template = document.getElementById(ID_PARTIAL_CARD_TEMPLATE);
  const products = getData("products") || [];

  if (!list || !template) return;

  list.innerHTML = "";

  if (inventoryCounts.length === 0) {
    return; // No mostrar mensaje si no hay parciales
  }

  inventoryCounts.forEach((inv) => {
    const product = products.find((p) => p.id === inv.productId);
    if (!product) return;

    const node = template.content.cloneNode(true);

    const productName = node.querySelector(".partial-product-name");
    const warehouseQty = node.querySelector(".warehouse-qty");
    const storeQty = node.querySelector(".store-qty");

    if (productName) productName.textContent = product.name;

    const productStock = node.querySelector(".partial-product-stock");
    if (productStock) {
      productStock.textContent = product.quantity || 0;
    }

    // Mostrar valores, usar "--" si no está definido
    if (warehouseQty) {
      if (
        inv.warehouseQuantity !== null &&
        inv.warehouseQuantity !== undefined
      ) {
        warehouseQty.textContent = inv.warehouseQuantity;
      } else {
        warehouseQty.textContent = "--";
        warehouseQty.classList.add("text-muted");
      }
    }
    if (storeQty) {
      // El icono siempre mantiene el color verde, solo el texto cambia
      if (inv.storeQuantity !== null && inv.storeQuantity !== undefined) {
        storeQty.textContent = inv.storeQuantity;
      } else {
        storeQty.textContent = "--";
      }
      // El icono siempre es verde (text-success), el "--" indica que no tiene valor
      storeQty.classList.remove("text-muted");
      storeQty.classList.add("text-success");
    }

    const btnAdd = node.querySelector(".btn-add-inventory");
    if (btnAdd) {
      if (inv.status === "CLOSED") {
        btnAdd.disabled = true;
        //btnAdd.classList.add("opacity-50");
        btnAdd.setAttribute("title", "Contabilidad cerrada: no se puede editar");
        btnAdd.style.cursor = "not-allowed";
      } else {
        btnAdd.onclick = () => openAddInventoryModal(inv.productId);
      }
    }

    const btnDelete = node.querySelector(".btn-delete-inventory");
    if (btnDelete) {
      if (inv.status === "CLOSED") {
        btnDelete.disabled = true;
        //btnDelete.classList.add("opacity-50");
        btnDelete.setAttribute("title", "Contabilidad cerrada: no se puede eliminar");
        btnDelete.style.cursor = "not-allowed";
      } else {
        btnDelete.onclick = () => openDeleteInventoryModal(inv.id);
      }
    }

    list.appendChild(node);
  });
}

/**
 * Renderiza la lista de productos completados
 * @param {Array} inventoryCounts - Lista de conteos de inventario completados
 * @returns {void}
 */
function renderCompletedInventoryList(inventoryCounts) {
  const list = document.getElementById(ID_COMPLETED_INVENTORY_LIST);
  const template = document.getElementById(ID_COMPLETED_CARD_TEMPLATE);
  const products = getData("products") || [];

  if (!list || !template) return;

  list.innerHTML = "";

  if (inventoryCounts.length === 0) {
    list.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-clipboard-minus"></i>
        <p class="mb-0">No hay inventarios realizados para esta fecha</p>
      </div>
    `;
    return;
  }

  inventoryCounts.forEach((inv) => {
    const product = products.find((p) => p.id === inv.productId);
    if (!product) return;

    const node = template.content.cloneNode(true);

    const productName = node.querySelector(".completed-product-name");
    const productStock = node.querySelector(".completed-product-stock");
    const warehouseQty = node.querySelector(".warehouse-qty");
    const storeQty = node.querySelector(".store-qty");

    if (productName) productName.textContent = product.name;
    if (productStock) {
      productStock.textContent = product.quantity || 0;
    }
    if (warehouseQty) warehouseQty.textContent = inv.warehouseQuantity || 0;
    if (storeQty) storeQty.textContent = inv.storeQuantity || 0;

    const btnDelete = node.querySelector(".btn-delete-inventory");
    if (btnDelete) {
      // Deshabilitar para productos con stock cero o inventarios cerrados (contabilidad cerrada)
      if (inv.isZeroStock || inv.id?.startsWith("zero-stock-")) {
        btnDelete.disabled = true;
        //btnDelete.classList.add("opacity-50");
        btnDelete.setAttribute(
          "title",
          "No se puede eliminar: producto sin stock"
        );
        btnDelete.style.cursor = "not-allowed";
      } else if (inv.status === "CLOSED") {
        btnDelete.disabled = true;
        //btnDelete.classList.add("opacity-50");
        btnDelete.setAttribute(
          "title",
          "Contabilidad cerrada: no se puede eliminar"
        );
        btnDelete.style.cursor = "not-allowed";
      } else {
        btnDelete.onclick = () => openDeleteInventoryModal(inv.id);
      }
    }

    list.appendChild(node);
  });
}

/**
 * Función principal que renderiza el inventario
 * Separa productos en pendientes, parciales y completados según la fecha seleccionada
 * @returns {void}
 */
function renderInventory() {
  const date =
    INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];
  const allProducts = getData(PAGE_PRODUCTS) || [];
  const allInventory = getData(PAGE_INVENTORY) || [];

  // Filtrar productos por búsqueda
  const filteredProducts = filterInventoryProductsByName(allProducts);

  // Obtener inventarios del día seleccionado (CONFIRMED y CLOSED se muestran)
  const dayInventory = allInventory.filter(
    (inv) => inv.date === date && ["CONFIRMED", "CLOSED"].includes(inv.status)
  );

  // Separar inventarios en parciales y completados
  const partialInventory = [];
  const completedInventory = [];

  dayInventory.forEach((inv) => {
    const hasWarehouse =
      inv.warehouseQuantity !== null && inv.warehouseQuantity !== undefined;
    const hasStore =
      inv.storeQuantity !== null && inv.storeQuantity !== undefined;

    if (hasWarehouse && hasStore) {
      // Tiene ambos valores: completado
      completedInventory.push(inv);
    } else if (hasWarehouse || hasStore) {
      // Tiene al menos uno: parcial
      partialInventory.push(inv);
    }
  });

  // Obtener IDs de productos que tienen inventario (parcial o completo)
  const inventoryProductIds = new Set(dayInventory.map((inv) => inv.productId));

  // Productos con stock cero: se muestran automáticamente como completados con valores 0
  const zeroStockProducts = filteredProducts.filter((p) => {
    const stock = p.quantity || 0;
    return stock === 0 && !inventoryProductIds.has(p.id);
  });

  // Productos con stock cero: persistir inventario 0/0 y mostrarlos como completados
  zeroStockProducts.forEach((product) => {
    saveInventory(product.id, date, 0, 0);

    // Crear inventario virtual para productos con stock cero
    const virtualInventory = {
      id: `zero-stock-${product.id}`, // ID especial para identificar inventarios virtuales
      productId: product.id,
      warehouseQuantity: 0,
      storeQuantity: 0,
      date: date,
      status: "CONFIRMED",
      isZeroStock: true, // Flag para identificar inventarios de stock cero
    };
    completedInventory.push(virtualInventory);
    inventoryProductIds.add(product.id); // Agregar a la lista para que no aparezca en pendientes
  });

  // Productos pendientes: no tienen ningún inventario y no tienen stock cero
  const pendingProducts = filteredProducts.filter((p) => {
    const stock = p.quantity || 0;
    return !inventoryProductIds.has(p.id) && stock > 0;
  });

  // Filtrar inventarios parciales y completados por búsqueda
  const filteredPartialInventory = partialInventory.filter((inv) => {
    const product = filteredProducts.find((p) => p.id === inv.productId);
    return product !== undefined;
  });

  const filteredCompletedInventory = completedInventory.filter((inv) => {
    const product = filteredProducts.find((p) => p.id === inv.productId);
    return product !== undefined;
  });

  // Actualizar contador (solo completados)
  const total = allProducts.length;
  const completed = completedInventory.length;
  updateListCounter(completed, total, PAGE_INVENTORY);

  // Mostrar mensaje "Todos los productos tienen inventario del día" solo si:
  // - No hay productos pendientes
  // - No hay productos parciales
  // - Todos los productos tienen inventario completo (ambos valores) o tienen stock cero
  const allProductsHaveCompleteInventory =
    pendingProducts.length === 0 && filteredPartialInventory.length === 0;

  // Renderizar listas
  renderPendingInventoryList(pendingProducts, allProductsHaveCompleteInventory);
  renderPartialInventoryList(filteredPartialInventory);
  renderCompletedInventoryList(filteredCompletedInventory);
}

// Variable para almacenar el mensaje de error actual
let currentInventoryError = null;

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

  // Guardar el mensaje de error actual
  currentInventoryError = message;

  // Mostrar el mensaje en el feedback compartido
  const feedback = document.getElementById("inventoryErrorFeedback");
  if (feedback) {
    feedback.textContent = message;
    feedback.style.display = "block";
    feedback.classList.add("d-block");
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

  // Solo ocultar el feedback si ambos campos están limpios
  const warehouseInput = document.getElementById(ID_LOCATION_WAREHOUSE_INPUT);
  const storeInput = document.getElementById(ID_LOCATION_STORE_INPUT);

  const warehouseHasError =
    warehouseInput && warehouseInput.classList.contains("is-invalid");
  const storeHasError =
    storeInput && storeInput.classList.contains("is-invalid");

  if (!warehouseHasError && !storeHasError) {
    currentInventoryError = null;
    const feedback = document.getElementById("inventoryErrorFeedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.style.display = "none";
      feedback.classList.remove("d-block");
    }
  }
}
