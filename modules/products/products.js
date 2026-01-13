// ===============================
// Products - App Contable
// ===============================

//#region Constants
// IDs de botones
const BTN_ID_ADD_PRODUCT = "btnAddProduct";
const BTN_ID_SAVE_PRODUCT = "btnSaveProduct";
const BTN_ID_CLEAR_SEARCH = "btnClearSearch";
const BTN_ID_ORDER_DIR = "orderDir";
const BTN_ID_CLEAR_FILTERS_PRODUCTS = "btnClearFiltersProducts";  

// IDs de otros elementos
const ID_ORDER_BY = "orderBy";
const ID_SEARCH_PRODUCT = "searchProduct";
const ID_PRODUCTS_LIST = "productsList";
const ID_PRODUCT_CARD_TEMPLATE = "productCardTemplate";
const ID_PRODUCTS_COUNTER = "productsCounter";
const ID_PRODUCT_MODAL_TITLE = "productModalTitle";
const ID_PRODUCT_FORM = "productForm";
const ID_PRODUCT_ID = "productId";
const ID_INPUT_NAME = "inputName";
const ID_INPUT_PRICE = "inputPrice";
const ID_INPUT_UM = "inputUM";
const ID_INPUT_QUANTITY = "inputQuantity";
const ID_INPUT_LOW_STOCK_THRESHOLD = "inputLowStockThreshold";
const ID_INPUT_CRITICAL_STOCK_THRESHOLD = "inputCriticalStockThreshold";
//#endregion

let productModal;

// Estado de la pantalla de productos (unificado)
const PRODUCTS_STATE = {
  searchText: "",
  productToDelete: null,
  orderBy: "name",
  orderDir: "asc",
  filterStockStatus: null, // "low" | "critical" | null
};

// Exponer el estado globalmente para module-controls.js
window.PRODUCTS_STATE = PRODUCTS_STATE;

// ===============================
// Hook que llama el router
// ===============================

/**
 * Hook que se ejecuta cuando se carga la página de productos
 * Inicializa el modal, los controles de búsqueda y ordenamiento,
 * y configura los event listeners de los botones
 */
async function onProductsPageLoaded() {
  // Cargar modal de productos
  console.log("Loading product-modal");
  await loadModal(MODAL_PRODUCTS, PAGE_PRODUCTS);
  
  // Inicializar el modal después de cargarlo
  initModalModule(MODAL_PRODUCTS);

  // Configurar controles del módulo
  setupModuleControls(PAGE_PRODUCTS);

  // Configurar botón de guardar del modal
  document.getElementById(BTN_ID_SAVE_PRODUCT).onclick = saveProductFromModal;
  
  // Nota: renderProducts() se llama automáticamente al final de setupModuleControls()
}

/**
 * Abre el modal para agregar un nuevo producto
 * Resetea el formulario y configura el título del modal
 */
function openAddProductModal() {
  document.getElementById(ID_PRODUCT_MODAL_TITLE).innerText = "Nuevo producto";
  document.getElementById(ID_PRODUCT_FORM).reset();
  clearInputError(ID_INPUT_NAME);
  clearInputError(ID_INPUT_LOW_STOCK_THRESHOLD);
  clearInputError(ID_INPUT_CRITICAL_STOCK_THRESHOLD);
  document.getElementById(ID_PRODUCT_ID).value = "";
  
  // Cargar unidades de medida en el select
  loadUnitsIntoSelect();
  
  toggleModalModules();
}

/**
 * Abre el modal para editar un producto existente
 * Carga los datos del producto en el formulario y muestra el modal
 * @param {string} id - ID del producto a editar
 */
function openEditProductModal(id) {
  const products = getData("products");
  const product = products.find((p) => p.id === id);
  if (!product) return;

  document.getElementById(ID_PRODUCT_MODAL_TITLE).innerText = "Editar producto";
  clearInputError(ID_INPUT_NAME);
  clearInputError(ID_INPUT_LOW_STOCK_THRESHOLD);
  clearInputError(ID_INPUT_CRITICAL_STOCK_THRESHOLD);
  document.getElementById(ID_PRODUCT_ID).value = product.id;
  document.getElementById(ID_INPUT_NAME).value = product.name;
  document.getElementById(ID_INPUT_PRICE).value = product.price;
  document.getElementById(ID_INPUT_QUANTITY).value = product.quantity;
  document.getElementById(ID_INPUT_LOW_STOCK_THRESHOLD).value = product.lowStockThreshold || "";
  document.getElementById(ID_INPUT_CRITICAL_STOCK_THRESHOLD).value = product.criticalStockThreshold || "";
  
  // Cargar unidades de medida en el select y seleccionar la del producto
  loadUnitsIntoSelect();
  const umSelect = document.getElementById(ID_INPUT_UM);
  if (umSelect && product.um) {
    umSelect.value = product.um;
  }
  
  toggleModalModules();
}

/**
 * Carga las unidades de medida en el select del modal de productos
 * @returns {void}
 */
function loadUnitsIntoSelect() {
  const select = document.getElementById(ID_INPUT_UM);
  if (!select) return;
  
  // Limpiar opciones existentes (excepto la primera)
  const firstOption = select.querySelector('option[value=""]');
  select.innerHTML = "";
  if (firstOption) {
    select.appendChild(firstOption);
  } else {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccioná una unidad...";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
  }
  
  // Obtener unidades de medida
  const units = getUnits();
  
  // Agregar opciones
  units.forEach(unit => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit;
    select.appendChild(option);
  });
}

/**
 * Inicializa los controles de ordenamiento de productos
 * Configura los event listeners para el selector de campo y el botón de dirección
 * Actualiza PRODUCTS_STATE y renderiza los productos cuando cambian los criterios
 */
function initProductOrdering() {
  const orderBy = document.getElementById(ID_ORDER_BY);
  const orderDirBtn = document.getElementById(BTN_ID_ORDER_DIR);

  if (!orderBy || !orderDirBtn) return;

  orderBy.onchange = () => {
    PRODUCTS_STATE.orderBy = orderBy.value;
    updateClearFiltersButton();
    renderProducts();
  };

  orderDirBtn.onclick = () => {
    PRODUCTS_STATE.orderDir =
      PRODUCTS_STATE.orderDir === "asc" ? "desc" : "asc";

    orderDirBtn.innerHTML =
      PRODUCTS_STATE.orderDir === "asc"
        ? '<i class="bi bi-sort-alpha-down"></i>'
        : '<i class="bi bi-sort-alpha-up"></i>';

    updateClearFiltersButton();
    renderProducts();
  };
}

/**
 * Inicializa el buscador de productos
 * Configura los event listeners para el input de búsqueda y el botón de limpiar
 * Actualiza PRODUCTS_STATE.searchText y renderiza los productos al escribir
 */
function initProductSearch() {
  const input = document.getElementById(ID_SEARCH_PRODUCT);
  const btnClear = document.getElementById(BTN_ID_CLEAR_SEARCH);

  if (!input || !btnClear) return;

  input.addEventListener("input", () => {
    PRODUCTS_STATE.searchText = input.value.toLowerCase();
    btnClear.classList.toggle("d-none", !PRODUCTS_STATE.searchText);
    updateClearFiltersButton();
    renderProducts();
  });

  btnClear.onclick = () => {
    input.value = "";
    PRODUCTS_STATE.searchText = "";
    btnClear.classList.add("d-none");
    updateClearFiltersButton();
    renderProducts();
    input.focus();
  };
}

/**
 * Inicializa el botón de limpiar filtros
 * @returns {void}
 */
function initClearFilters() {
  const btnClearFilters = document.getElementById(BTN_ID_CLEAR_FILTERS_PRODUCTS);
  if (!btnClearFilters) return;

  btnClearFilters.onclick = () => {
    // Limpiar búsqueda
    const searchInput = document.getElementById(ID_SEARCH_PRODUCT);
    const btnClearSearch = document.getElementById(BTN_ID_CLEAR_SEARCH);
    if (searchInput) {
      searchInput.value = "";
      PRODUCTS_STATE.searchText = "";
      if (btnClearSearch) btnClearSearch.classList.add("d-none");
    }

    // Limpiar ordenamiento
    const orderBy = document.getElementById(ID_ORDER_BY);
    if (orderBy) {
      orderBy.value = "";
      PRODUCTS_STATE.orderBy = "name";
    }
    PRODUCTS_STATE.orderDir = "asc";
    const orderDirBtn = document.getElementById(BTN_ID_ORDER_DIR);
    if (orderDirBtn) {
      orderDirBtn.innerHTML = '<i class="bi bi-sort-alpha-down"></i>';
    }

    updateClearFiltersButton();
    renderProducts();
  };

  updateClearFiltersButton();
}

/**
 * Actualiza la visibilidad del botón de limpiar filtros
 * @returns {void}
 */
function updateClearFiltersButton() {
  const btnClearFilters = document.getElementById(BTN_ID_CLEAR_FILTERS_PRODUCTS);
  if (!btnClearFilters) return;

  const hasFilters = PRODUCTS_STATE.searchText || 
                     (PRODUCTS_STATE.orderBy !== "name" || PRODUCTS_STATE.orderDir !== "asc");
  
  if (hasFilters) {
    btnClearFilters.classList.remove("d-none");
  } else {
    btnClearFilters.classList.add("d-none");
  }
}

// ===============================
// Filtrado y Ordenamiento
// ===============================

/**
 * Filtra productos usando los criterios de PRODUCTS_STATE
 * @param {Array} products - Lista de productos a filtrar
 * @returns {Array} Lista de productos filtrados
 */
function filterProductsByName(products) {
  console.log("=== filterProductsByName INICIADO ===");
  console.log("Parámetro products:", products);
  
  if (!products || !Array.isArray(products)) {
    console.log("ERROR: products no es un array válido");
    return [];
  }
  
  // Asegurarse de usar el estado actualizado desde window
  const state = window.PRODUCTS_STATE || PRODUCTS_STATE;
  console.log("Estado obtenido:", state);
  
  if (!state) {
    console.error("PRODUCTS_STATE no está disponible");
    return products;
  }
  
  console.log("filterProductsByName - Estado recibido:", {
    searchText: state.searchText,
    filterStockStatus: state.filterStockStatus,
    searchTextType: typeof state.searchText,
    searchTextLength: state.searchText ? state.searchText.length : 0
  });
  
  let filtered = [...products];
  console.log(`filterProductsByName - Productos iniciales: ${filtered.length}`);

  // Filtro por texto de búsqueda
  const searchText = state.searchText ? String(state.searchText).trim() : "";
  console.log(`filterProductsByName - searchText procesado: "${searchText}" (length: ${searchText.length})`);
  
  if (searchText && searchText.length > 0) {
    console.log(`Filtrando por búsqueda: "${searchText}"`);
    const beforeCount = filtered.length;
    filtered = filtered.filter((p) => {
      if (!p || !p.name) return false;
      const matches = p.name.toLowerCase().includes(searchText.toLowerCase());
      return matches;
    });
    console.log(`Productos después de búsqueda: ${filtered.length} (antes: ${beforeCount})`);
  } else {
    console.log("No hay texto de búsqueda, saltando filtro de búsqueda");
  }

  // Filtro por estado de stock
  const stockStatus = state.filterStockStatus;
  console.log(`filterProductsByName - stockStatus: "${stockStatus}" (type: ${typeof stockStatus})`);
  
  if (stockStatus === "critical") {
    console.log("Filtrando por stock crítico");
    const beforeCount = filtered.length;
    filtered = filtered.filter((p) => {
      if (!p) return false;
      const threshold = p.criticalStockThreshold || 0;
      const matches = p.quantity !== undefined && p.quantity <= threshold;
      return matches;
    });
    console.log(`Productos después de filtro crítico: ${filtered.length} (antes: ${beforeCount})`);
  } else if (stockStatus === "low") {
    console.log("Filtrando por stock bajo");
    const beforeCount = filtered.length;
    filtered = filtered.filter((p) => {
      if (!p) return false;
      const lowThreshold = p.lowStockThreshold || 0;
      const criticalThreshold = p.criticalStockThreshold || 0;
      const matches = p.quantity !== undefined && 
             p.quantity <= lowThreshold && 
             p.quantity > criticalThreshold;
      return matches;
    });
    console.log(`Productos después de filtro bajo: ${filtered.length} (antes: ${beforeCount})`);
  } else {
    console.log(`No hay filtro de stock activo (stockStatus: ${stockStatus})`);
  }

  console.log(`filterProductsByName - Productos finales: ${filtered.length}`);
  return filtered;
}

/**
 * Ordena productos usando los criterios de PRODUCTS_STATE
 * @param {Array} products - Lista de productos a ordenar
 * @returns {Array} Lista de productos ordenados
 */
function sortProducts(products) {
  // Asegurarse de usar el estado actualizado desde window
  const state = window.PRODUCTS_STATE || PRODUCTS_STATE;
  if (!state) return products;
  
  return [...products].sort((a, b) => {
    let v1 = a[state.orderBy];
    let v2 = b[state.orderBy];

    // Normalizar strings para comparación
    if (typeof v1 === "string") {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if (v1 < v2) return state.orderDir === "asc" ? -1 : 1;
    if (v1 > v2) return state.orderDir === "asc" ? 1 : -1;
    return 0;
  });
}

// ===============================
// Render
// ===============================

/**
 * Renderiza la lista de productos en el DOM
 * @param {Array} products - Lista de productos a renderizar
 * @returns {void}
 */
function renderProductsList(products) {
  const prodList = document.getElementById(ID_PRODUCTS_LIST);
  const prodTemplate = document.getElementById(ID_PRODUCT_CARD_TEMPLATE);

  if (!prodList || !prodTemplate) return;

  prodList.innerHTML = "";

  if (products.length === 0) {
    prodList.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-search"></i>
        <p class="mb-0">No se encontraron productos</p>
      </div>
    `;
    return;
  }

  products.forEach((p) => {
    const node = prodTemplate.content.cloneNode(true);

    node.querySelector(".product-name").textContent = p.name;
    
    // Determinar color y icono según el stock
    const criticalThreshold = p.criticalStockThreshold || 0;
    const lowThreshold = p.lowStockThreshold || 0;
    let quantityColor = "";
    let quantityIcon = "bi-boxes";
    
    if (p.quantity <= criticalThreshold) {
      quantityColor = "text-danger";
      quantityIcon = "bi-exclamation-triangle-fill";
    } else if (p.quantity <= lowThreshold) {
      quantityColor = "text-warning";
      quantityIcon = "bi-exclamation-triangle-fill";
    }
    
    const metaEl = node.querySelector(".product-meta");
    if (metaEl) {
      metaEl.innerHTML = `<i class="bi ${quantityIcon} ${quantityColor}"></i> <span class="${quantityColor}">${p.quantity}</span> 
      • <i class="bi bi-currency-dollar"></i> ${p.price} 
      • <i class="bi bi-beaker small"></i> ${p.um}`;
    }

    node.querySelector(".btn-edit").onclick = () => openEditProductModal(p.id);
    node.querySelector(".btn-delete").onclick = () =>
      openDeleteProductModal(p.id);

    prodList.appendChild(node);
  });
}

/**
 * Función principal que renderiza los productos
 * Filtra, ordena y renderiza usando PRODUCTS_STATE
 * @returns {void}
 */
function renderProducts() {
  console.log("renderProducts() llamado");
  const allProducts = getData("products") || [];
  console.log(`Total de productos: ${allProducts.length}`);

  // Verificar que PRODUCTS_STATE esté disponible
  const state = window.PRODUCTS_STATE || PRODUCTS_STATE;
  if (!state) {
    console.error("PRODUCTS_STATE no está disponible");
    return;
  }
  
  console.log("Estado actual:", {
    searchText: state.searchText,
    filterStockStatus: state.filterStockStatus,
    orderBy: state.orderBy,
    orderDir: state.orderDir
  });

  // Primero filtrar, luego ordenar
  console.log("Llamando a filterProductsByName()...");
  console.log("Tipo de filterProductsByName:", typeof filterProductsByName);
  console.log("filterProductsByName es función?", typeof filterProductsByName === "function");
  console.log("filterProductsByName.toString():", filterProductsByName.toString().substring(0, 200));
  
  let filtered;
  try {
    console.log("ANTES de llamar filterProductsByName");
    filtered = filterProductsByName(allProducts);
    console.log("DESPUÉS de llamar filterProductsByName");
    console.log(`Productos filtrados: ${filtered.length}`);
  } catch (error) {
    console.error("ERROR en filterProductsByName:", error);
    console.error("Stack trace:", error.stack);
    return;
  }
  
  console.log("Llamando a sortProducts()...");
  const sorted = sortProducts(filtered);
  console.log(`Productos ordenados: ${sorted.length}`);

  updateListCounter(sorted.length, allProducts.length, PAGE_PRODUCTS);
  renderProductsList(sorted);
  console.log("renderProducts() completado");
}


/**
 * Guarda el producto desde el modal
 * @returns {void}
 */
function saveProductFromModal() {
  const id = document.getElementById(ID_PRODUCT_ID).value;
  const name = document.getElementById(ID_INPUT_NAME).value.trim();
  const price = Number(document.getElementById(ID_INPUT_PRICE).value);
  const um = document.getElementById(ID_INPUT_UM).value.trim();
  const quantity = Number(document.getElementById(ID_INPUT_QUANTITY).value);
  const lowStockThreshold = Number(document.getElementById(ID_INPUT_LOW_STOCK_THRESHOLD).value);
  const criticalStockThreshold = Number(document.getElementById(ID_INPUT_CRITICAL_STOCK_THRESHOLD).value);

  let products = getData("products");

  clearInputError(ID_INPUT_NAME);
  clearInputError(ID_INPUT_LOW_STOCK_THRESHOLD);
  clearInputError(ID_INPUT_CRITICAL_STOCK_THRESHOLD);

  // nombre obligatorio
  if (!name) {
    setInputError(ID_INPUT_NAME, "El nombre es obligatorio");
    return;
  }

  // nombre único
  if (
    products.some(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== id
    )
  ) {
    setInputError(ID_INPUT_NAME, "Ya existe un producto con ese nombre");
    return;
  }

  // Umbrales obligatorios
  if (!lowStockThreshold || lowStockThreshold < 0) {
    setInputError(ID_INPUT_LOW_STOCK_THRESHOLD, "El umbral de stock bajo es obligatorio");
    return;
  }

  if (!criticalStockThreshold || criticalStockThreshold < 0) {
    setInputError(ID_INPUT_CRITICAL_STOCK_THRESHOLD, "El umbral de stock crítico es obligatorio");
    return;
  }

  // Si hay un id de producto es una edición si no, es un alta de producto
  if (id) {
    // EDITAR
    products = products.map((p) =>
      p.id === id ? { ...p, name, price, um, quantity, lowStockThreshold, criticalStockThreshold } : p
    );
  } else {
    // ALTA
    products.push({
      id: crypto.randomUUID(),
      name,
      price,
      um,
      quantity,
      lowStockThreshold,
      criticalStockThreshold,
    });
  }

  setData("products", products);
  toggleModalModules();
  renderProducts();
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
  if (feedback) {
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
  if (feedback) {
    feedback.innerText = "";
  }
}

// ===============================
// Baja
// ===============================

/**
 * Abre el modal para eliminar un producto
 * @param {string} id - ID del producto a eliminar
 * @returns {void}
 */
function openDeleteProductModal(id) {
  PRODUCTS_STATE.productToDelete = id;

  const product = getData("products").find((p) => p.id === id);
  if (!product) return;

  openConfirmDeleteModal("product", id, product.name);
}

/**
 * Confirma la eliminación de un producto
 * Elimina el producto de la lista y renderiza los productos
 * @returns {void}
 */
function confirmDeleteProduct() {
  if (!PRODUCTS_STATE.productToDelete) return;

  const products = getData("products");
  const deleted = products.find((p) => p.id === PRODUCTS_STATE.productToDelete);

  // Guardamos estado undo
  UNDO_STATE.data = deleted;
  UNDO_STATE.type = "products"; // Nombre de la colección en storage

  // Eliminamos
  const updated = products.filter(
    (p) => p.id !== PRODUCTS_STATE.productToDelete
  );
  setData("products", updated);

  PRODUCTS_STATE.productToDelete = null;
  DELETE_STATE.type = null;
  DELETE_STATE.id = null;

  hideConfirmModal();
  renderProducts();
  showSnackbar("Producto eliminado");
}
