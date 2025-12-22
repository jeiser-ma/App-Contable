// ===============================
// Products - App Contable
// ===============================

//#region Constants
// IDs de botones
const BTN_ID_ADD_PRODUCT = "btnAddProduct";
const BTN_ID_SAVE_PRODUCT = "btnSaveProduct";
const BTN_ID_CLEAR_SEARCH = "btnClearSearch";
const BTN_ID_ORDER_DIR = "orderDir";

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
//#endregion

let productModal;

// Estado de la pantalla de productos (unificado)
const PRODUCTS_STATE = {
  searchText: "",
  productToDelete: null,
  orderBy: "name",
  orderDir: "asc",
};

// ===============================
// Hook que llama el router
// ===============================

/**
 * Hook que se ejecuta cuando se carga la página de productos
 * Inicializa el modal, los controles de búsqueda y ordenamiento,
 * y configura los event listeners de los botones
 */
function onProductsPageLoaded() {
  // cargamos el modal de productos
  console.log("Loading product-modal");
  loadModal("product-modal", "products").then(() => {
    // Inicializar el modal después de cargarlo
    initModal(MODAL_ID_PRODUCT);

    initProductSearch();
    initProductOrdering();
    renderProducts();

    document.getElementById(BTN_ID_ADD_PRODUCT).onclick = openAddProductModal;
    document.getElementById(BTN_ID_SAVE_PRODUCT).onclick = saveProductFromModal;
  });
}

/**
 * Abre el modal para agregar un nuevo producto
 * Resetea el formulario y configura el título del modal
 */
function openAddProductModal() {
  document.getElementById(ID_PRODUCT_MODAL_TITLE).innerText = "Nuevo producto";
  document.getElementById(ID_PRODUCT_FORM).reset();
  clearInputError(ID_INPUT_NAME);
  document.getElementById(ID_PRODUCT_ID).value = "";
  toggleModal();
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
  document.getElementById(ID_PRODUCT_ID).value = product.id;
  document.getElementById(ID_INPUT_NAME).value = product.name;
  document.getElementById(ID_INPUT_PRICE).value = product.price;
  document.getElementById(ID_INPUT_UM).value = product.um;
  document.getElementById(ID_INPUT_QUANTITY).value = product.quantity;
  toggleModal();
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
    renderProducts();
  };

  orderDirBtn.onclick = () => {
    PRODUCTS_STATE.orderDir =
      PRODUCTS_STATE.orderDir === "asc" ? "desc" : "asc";

    orderDirBtn.innerHTML =
      PRODUCTS_STATE.orderDir === "asc"
        ? '<i class="bi bi-sort-alpha-down"></i>'
        : '<i class="bi bi-sort-alpha-up"></i>';

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
    renderProducts();
  });

  btnClear.onclick = () => {
    input.value = "";
    PRODUCTS_STATE.searchText = "";
    btnClear.classList.add("d-none");
    renderProducts();
    input.focus();
  };
}

// ===============================
// Filtrado y Ordenamiento
// ===============================

/**
 * Filtra productos usando el texto de búsqueda de PRODUCTS_STATE
 * @param {Array} products - Lista de productos a filtrar
 * @returns {Array} Lista de productos filtrados
 */
function filterProductsByName(products) {
  if (!PRODUCTS_STATE.searchText) return products;

  return products.filter((p) =>
    p.name.toLowerCase().includes(PRODUCTS_STATE.searchText.toLowerCase())
  );
}

/**
 * Ordena productos usando los criterios de PRODUCTS_STATE
 * @param {Array} products - Lista de productos a ordenar
 * @returns {Array} Lista de productos ordenados
 */
function sortProducts(products) {
  return [...products].sort((a, b) => {
    let v1 = a[PRODUCTS_STATE.orderBy];
    let v2 = b[PRODUCTS_STATE.orderBy];

    // Normalizar strings para comparación
    if (typeof v1 === "string") {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if (v1 < v2) return PRODUCTS_STATE.orderDir === "asc" ? -1 : 1;
    if (v1 > v2) return PRODUCTS_STATE.orderDir === "asc" ? 1 : -1;
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
    node.querySelector(
      ".product-meta"
    ).innerHTML = `<i class="bi bi-box"></i> ${p.quantity} 
      • <i class="bi bi-currency-dollar"></i> ${p.price} 
      • <i class="bi bi-calculator"></i> ${p.um}`;

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
  const allProducts = getData("products");

  // Primero filtrar, luego ordenar
  const filtered = filterProductsByName(allProducts);
  const sorted = sortProducts(filtered);

  UpdateProductsCounter(sorted.length, allProducts.length);
  renderProductsList(sorted);
}

/**
 * Actualiza el contador de productos en el DOM
 * @param {number} current - Cantidad de productos actual
 * @param {number} total - Cantidad total de productos
 * @returns {void}
 */
function UpdateProductsCounter(current, total) {
  const counter = document.getElementById(ID_PRODUCTS_COUNTER);
  counter.textContent = `${current} de ${total} Productos`;
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

  let products = getData("products");

  clearInputError(ID_INPUT_NAME);

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

  // Si hay un id de producto es una edición si no, es un alta de producto
  if (id) {
    // EDITAR
    products = products.map((p) =>
      p.id === id ? { ...p, name, price, um, quantity } : p
    );
  } else {
    // ALTA
    products.push({
      id: crypto.randomUUID(),
      name,
      price,
      um,
      quantity,
    });
  }

  setData("products", products);
  toggleModal();
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
