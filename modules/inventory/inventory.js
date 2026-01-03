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
  await loadModal(MODAL_INVENTORY, PAGE_INVENTORY);
  
  // Inicializar el modal después de cargarlo
  initModalModule(MODAL_INVENTORY);

  // Configurar controles del módulo
  setupModuleControls(PAGE_INVENTORY);

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
  const date = INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];
  const allInventory = getData("inventory") || [];
  const existingInventory = allInventory.find(
    (inv) => inv.productId === productId && inv.date === date && inv.status === "CONFIRMED"
  );

  // Cargar valores existentes o limpiar campos
  if (existingInventory) {
    warehouseInput.value = existingInventory.warehouseQuantity !== null && existingInventory.warehouseQuantity !== undefined 
      ? existingInventory.warehouseQuantity 
      : "";
    storeInput.value = existingInventory.storeQuantity !== null && existingInventory.storeQuantity !== undefined 
      ? existingInventory.storeQuantity 
      : "";
  } else {
    warehouseInput.value = "";
    storeInput.value = "";
  }

  // Limpiar errores
  clearInputError(ID_LOCATION_WAREHOUSE_INPUT);
  clearInputError(ID_LOCATION_STORE_INPUT);

  showModalModules();
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

  const date = INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];

  // Limpiar errores previos
  clearInputError(ID_LOCATION_WAREHOUSE_INPUT);
  clearInputError(ID_LOCATION_STORE_INPUT);

  // Obtener valores (pueden estar vacíos)
  const warehouseValue = warehouseInput.value.trim();
  const storeValue = storeInput.value.trim();

  // Validar que al menos uno tenga valor
  if (!warehouseValue && !storeValue) {
    setInputError(ID_LOCATION_WAREHOUSE_INPUT, "Ingresá al menos una cantidad (almacén o tienda)");
    return;
  }

  // Convertir a números (si está vacío, se manejará después)
  let warehouseQuantity = warehouseValue === "" ? null : Number(warehouseValue);
  let storeQuantity = storeValue === "" ? null : Number(storeValue);

  // Validar que no sean negativos (solo si tienen valor)
  if (warehouseQuantity !== null && warehouseQuantity < 0) {
    setInputError(ID_LOCATION_WAREHOUSE_INPUT, "La cantidad no puede ser negativa");
    return;
  }

  if (storeQuantity !== null && storeQuantity < 0) {
    setInputError(ID_LOCATION_STORE_INPUT, "La cantidad no puede ser negativa");
    return;
  }

  // Validar que no tengan comas (solo números enteros o decimales con punto)
  if (warehouseValue.includes(",")) {
    setInputError(ID_LOCATION_WAREHOUSE_INPUT, "Usá punto (.) en lugar de coma para decimales");
    return;
  }

  if (storeValue.includes(",")) {
    setInputError(ID_LOCATION_STORE_INPUT, "Usá punto (.) en lugar de coma para decimales");
    return;
  }

  // Validar que sean números válidos
  if (warehouseValue !== "" && (isNaN(warehouseQuantity) || !isFinite(warehouseQuantity))) {
    setInputError(ID_LOCATION_WAREHOUSE_INPUT, "Ingresá un número válido");
    return;
  }

  if (storeValue !== "" && (isNaN(storeQuantity) || !isFinite(storeQuantity))) {
    setInputError(ID_LOCATION_STORE_INPUT, "Ingresá un número válido");
    return;
  }

  // Guardar conteo de inventario
  const inventory = getData("inventory") || [];
  
  // Verificar si ya existe un inventario para este producto en esta fecha
  const existingIndex = inventory.findIndex(
    (inv) => inv.productId === currentProductId && inv.date === date
  );

  // Si existe inventario previo, mantener los valores que no se están actualizando
  let finalWarehouseQuantity = warehouseQuantity;
  let finalStoreQuantity = storeQuantity;
  
  if (existingIndex >= 0) {
    const existing = inventory[existingIndex];
    // Si el campo está vacío, mantener el valor existente
    if (warehouseValue === "") {
      finalWarehouseQuantity = existing.warehouseQuantity !== null && existing.warehouseQuantity !== undefined 
        ? existing.warehouseQuantity 
        : null;
    } else {
      // Si tiene valor (incluso 0), usar ese valor
      finalWarehouseQuantity = warehouseQuantity;
    }
    if (storeValue === "") {
      finalStoreQuantity = existing.storeQuantity !== null && existing.storeQuantity !== undefined 
        ? existing.storeQuantity 
        : null;
    } else {
      // Si tiene valor (incluso 0), usar ese valor
      finalStoreQuantity = storeQuantity;
    }
  } else {
    // Si es nuevo y el campo está vacío, usar null
    if (warehouseValue === "") {
      finalWarehouseQuantity = null;
    }
    if (storeValue === "") {
      finalStoreQuantity = null;
    }
  }

  // Validar que la suma no supere el stock total del producto
  const products = getData("products") || [];
  const product = products.find((p) => p.id === currentProductId);
  if (product) {
    const productStock = product.quantity || 0;
    const totalWarehouse = finalWarehouseQuantity !== null ? finalWarehouseQuantity : 0;
    const totalStore = finalStoreQuantity !== null ? finalStoreQuantity : 0;
    const totalInventory = totalWarehouse + totalStore;
    
    if (totalInventory > productStock) {
      const errorMessage = `La suma (${totalInventory}) supera el stock disponible (${productStock})`;
      setInputError(ID_LOCATION_WAREHOUSE_INPUT, errorMessage);
      setInputError(ID_LOCATION_STORE_INPUT, errorMessage);
      return;
    }
  }

  const inventoryData = {
    id: existingIndex >= 0 ? inventory[existingIndex].id : crypto.randomUUID(),
    productId: currentProductId,
    warehouseQuantity: finalWarehouseQuantity,
    storeQuantity: finalStoreQuantity,
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
  hideModalModules();
  currentProductId = null;
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
      btnAdd.onclick = () => openInventoryModal(product.id);
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
      if (inv.warehouseQuantity !== null && inv.warehouseQuantity !== undefined) {
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
      btnAdd.onclick = () => openInventoryModal(inv.productId);
    }

    const btnDelete = node.querySelector(".btn-delete-inventory");
    if (btnDelete) {
      btnDelete.onclick = () => openDeleteInventoryModal(inv.id);
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
      // Deshabilitar botón de eliminar para productos con stock cero
      if (inv.isZeroStock || inv.id?.startsWith("zero-stock-")) {
        btnDelete.disabled = true;
        btnDelete.classList.add("opacity-50");
        btnDelete.setAttribute("title", "No se puede eliminar: producto sin stock");
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
  const date = INVENTORY_STATE.filterDate || new Date().toISOString().split("T")[0];
  const allProducts = getData("products") || [];
  const allInventory = getData("inventory") || [];

  // Filtrar productos por búsqueda
  const filteredProducts = filterProductsByName(allProducts);

  // Obtener inventarios del día seleccionado
  const dayInventory = allInventory.filter((inv) => inv.date === date && inv.status === "CONFIRMED");

  // Separar inventarios en parciales y completados
  const partialInventory = [];
  const completedInventory = [];
  
  dayInventory.forEach((inv) => {
    const hasWarehouse = inv.warehouseQuantity !== null && inv.warehouseQuantity !== undefined;
    const hasStore = inv.storeQuantity !== null && inv.storeQuantity !== undefined;
    
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
  
  // Crear inventarios virtuales para productos con stock cero
  zeroStockProducts.forEach((product) => {
    const virtualInventory = {
      id: `zero-stock-${product.id}`, // ID especial para identificar inventarios virtuales
      productId: product.id,
      warehouseQuantity: 0,
      storeQuantity: 0,
      date: date,
      status: "CONFIRMED",
      isZeroStock: true // Flag para identificar inventarios de stock cero
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
  updateModuleCounter(completed, total);

  // Mostrar mensaje "Todos los productos tienen inventario del día" solo si:
  // - No hay productos pendientes
  // - No hay productos parciales
  // - Todos los productos tienen inventario completo (ambos valores) o tienen stock cero
  const allProductsHaveCompleteInventory = pendingProducts.length === 0 && filteredPartialInventory.length === 0;
  
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
  
  const warehouseHasError = warehouseInput && warehouseInput.classList.contains("is-invalid");
  const storeHasError = storeInput && storeInput.classList.contains("is-invalid");
  
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
