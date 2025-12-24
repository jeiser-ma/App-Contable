// ===============================
// Inventory - App Contable
// ===============================

//#region Constants
const BTN_ID_CONFIRM_INVENTORY = "btnConfirmInventory";

const ID_PENDING_INVENTORY_LIST = "pendingInventoryList";
const ID_COMPLETED_INVENTORY_LIST = "completedInventoryList";
const ID_PENDING_CARD_TEMPLATE = "pendingInventoryCardTemplate";
const ID_COMPLETED_CARD_TEMPLATE = "completedInventoryCardTemplate";

const ID_INVENTORY_PRODUCT_LABEL = "inventoryProductLabel";
const ID_LOCATION_WAREHOUSE_INPUT = "locationWarehouseInput";
const ID_LOCATION_STORE_INPUT = "locationStoreInput";

const MODAL_ID_INVENTORY = "inventoryModal";
//#endregion

// Estado de la pantalla de inventario (unificado)
const INVENTORY_STATE = {
  searchText: "",
  filterDate: null, // Por defecto será la fecha de hoy
};

// Exponer el estado globalmente para module-controls.js
window.INVENTORY_STATE = INVENTORY_STATE;

// Producto actual para el modal
let currentProductId = null;

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
  await loadModal("inventory-modal", "inventory");
  
  // Inicializar el modal después de cargarlo
  initModal(MODAL_ID_INVENTORY);

  // Configurar controles del módulo
  setupModuleControls("inventory");

  // El filtro de fecha ya se configura en setupModuleControls con la fecha de hoy

  // Configurar botón de confirmar del modal
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_INVENTORY);
  if (btnConfirm) {
    btnConfirm.onclick = saveInventoryFromModal;
  }

  // Nota: renderInventory() se llama automáticamente al final de setupModuleControls()
}

/**
 * Abre el modal para realizar inventario de un producto
 * @param {string} productId - ID del producto
 * @returns {void}
 */
function openInventoryModal(productId) {
  currentProductId = productId;

  const products = getData("products") || [];
  const product = products.find((p) => p.id === productId);
  
  if (!product) {
    console.error("Producto no encontrado");
    return;
  }

  initModal(MODAL_ID_INVENTORY);

  const productLabel = document.getElementById(ID_INVENTORY_PRODUCT_LABEL);
  const warehouseInput = document.getElementById(ID_LOCATION_WAREHOUSE_INPUT);
  const storeInput = document.getElementById(ID_LOCATION_STORE_INPUT);

  if (!productLabel || !warehouseInput || !storeInput) {
    console.error("No se encontraron los elementos del modal de inventario");
    return;
  }

  // Mostrar nombre del producto
  productLabel.textContent = product.name;

  // Limpiar campos
  warehouseInput.value = "";
  storeInput.value = "";

  // Limpiar errores
  clearInputError(ID_LOCATION_WAREHOUSE_INPUT);
  clearInputError(ID_LOCATION_STORE_INPUT);

  showModal();
}

/**
 * Guarda el conteo de inventario desde el modal
 * Valida que ambas cantidades no estén vacías y guarda el conteo
 * @returns {void}
 */
function saveInventoryFromModal() {
  const warehouseInput = document.getElementById(ID_LOCATION_WAREHOUSE_INPUT);
  const storeInput = document.getElementById(ID_LOCATION_STORE_INPUT);

  if (!warehouseInput || !storeInput || !currentProductId) {
    console.error("No se encontraron los campos del formulario");
    return;
  }

  const warehouseQuantity = Number(warehouseInput.value);
  const storeQuantity = Number(storeInput.value);
  const date = INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];

  // Limpiar errores previos
  clearInputError(ID_LOCATION_WAREHOUSE_INPUT);
  clearInputError(ID_LOCATION_STORE_INPUT);

  // Validaciones
  if (!warehouseQuantity || warehouseQuantity < 0) {
    setInputError(ID_LOCATION_WAREHOUSE_INPUT, "Ingresá una cantidad válida para el almacén");
    return;
  }

  if (!storeQuantity || storeQuantity < 0) {
    setInputError(ID_LOCATION_STORE_INPUT, "Ingresá una cantidad válida para el área de ventas");
    return;
  }

  // Guardar conteo de inventario
  const inventory = getData("inventory") || [];
  
  // Verificar si ya existe un inventario para este producto en esta fecha
  const existingIndex = inventory.findIndex(
    (inv) => inv.productId === currentProductId && inv.date === date
  );

  const inventoryData = {
    id: existingIndex >= 0 ? inventory[existingIndex].id : crypto.randomUUID(),
    productId: currentProductId,
    warehouseQuantity: warehouseQuantity,
    storeQuantity: storeQuantity,
    date: date,
    status: "CONFIRMED",
    createdAt: existingIndex >= 0 ? inventory[existingIndex].createdAt : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Actualizar existente
    inventory[existingIndex] = inventoryData;
  } else {
    // Crear nuevo
    inventory.push(inventoryData);
  }

  setData("inventory", inventory);

  // Cerrar modal y actualizar vista
  hideModal();
  currentProductId = null;
  renderInventory();
}

/**
 * Elimina un conteo de inventario
 * @param {string} inventoryId - ID del conteo a eliminar
 * @returns {void}
 */
function openDeleteInventoryModal(inventoryId) {
  const inventory = getData("inventory") || [];
  const inv = inventory.find((i) => i.id === inventoryId);
  if (!inv) return;

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
 * Filtra productos según el texto de búsqueda
 * @param {Array} products - Lista de productos a filtrar
 * @returns {Array} Lista de productos filtrados
 */
function filterProductsByName(products) {
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
 * @returns {void}
 */
function renderPendingInventoryList(products) {
  const list = document.getElementById(ID_PENDING_INVENTORY_LIST);
  const template = document.getElementById(ID_PENDING_CARD_TEMPLATE);

  if (!list || !template) return;

  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-check-circle"></i>
        <p class="mb-0">Todos los productos tienen inventario del día</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const node = template.content.cloneNode(true);

    const productName = node.querySelector(".pending-product-name");
    if (productName) productName.textContent = product.name;

    const btnAdd = node.querySelector(".btn-add-inventory");
    if (btnAdd) {
      btnAdd.onclick = () => openInventoryModal(product.id);
    }

    list.appendChild(node);
  });
}

/**
 * Renderiza la lista de productos realizados
 * @param {Array} inventoryCounts - Lista de conteos de inventario realizados
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
    const warehouseQty = node.querySelector(".warehouse-qty");
    const storeQty = node.querySelector(".store-qty");

    if (productName) productName.textContent = product.name;
    if (warehouseQty) warehouseQty.textContent = inv.warehouseQuantity || 0;
    if (storeQty) storeQty.textContent = inv.storeQuantity || 0;

    const btnDelete = node.querySelector(".btn-delete-inventory");
    if (btnDelete) {
      btnDelete.onclick = () => openDeleteInventoryModal(inv.id);
    }

    list.appendChild(node);
  });
}

/**
 * Función principal que renderiza el inventario
 * Separa productos en pendientes y realizados según la fecha seleccionada
 * @returns {void}
 */
function renderInventory() {
  const date = INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];
  const allProducts = getData("products") || [];
  const allInventory = getData("inventory") || [];

  // Filtrar productos por búsqueda
  const filteredProducts = filterProductsByName(allProducts);

  // Obtener inventarios del día seleccionado
  const dayInventory = allInventory.filter((inv) => inv.date === date && inv.status === "CONFIRMED");

  // Separar productos en pendientes y realizados
  const completedProductIds = new Set(dayInventory.map((inv) => inv.productId));
  const pendingProducts = filteredProducts.filter((p) => !completedProductIds.has(p.id));
  const completedInventory = dayInventory.filter((inv) => {
    const product = filteredProducts.find((p) => p.id === inv.productId);
    return product !== undefined; // Solo mostrar si el producto pasa el filtro de búsqueda
  });

  // Actualizar contador
  const total = allProducts.length;
  const completed = completedProductIds.size;
  updateModuleCounter(completed, total);

  // Renderizar listas
  renderPendingInventoryList(pendingProducts);
  renderCompletedInventoryList(completedInventory);
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

  const feedback = input.parentElement?.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.textContent = message;
    feedback.style.display = "block";
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

  const feedback = input.parentElement?.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.textContent = "";
    feedback.style.display = "none";
  }
}
