// ===============================
// Products - App Contable
// ===============================
let productModal;

let searchText = "";

const productFilters = {
  search: "",
  orderBy: "name",
  orderDir: "asc",
};

function initProductOrdering() {
  const orderBy = document.getElementById("orderBy");
  const orderDirBtn = document.getElementById("orderDir");

  if (!orderBy || !orderDirBtn) return;

  orderBy.onchange = () => {
    productFilters.orderBy = orderBy.value;
    renderProducts();
  };

  orderDirBtn.onclick = () => {
    productFilters.orderDir =
      productFilters.orderDir === "asc" ? "desc" : "asc";

    orderDirBtn.innerHTML =
      productFilters.orderDir === "asc"
        ? '<i class="bi bi-sort-alpha-down"></i>'
        : '<i class="bi bi-sort-alpha-up"></i>';

    renderProducts();
  };
}

function initProductSearch() {
  const input = document.getElementById("searchProduct");
  const btnClear = document.getElementById("btnClearSearch");

  if (!input || !btnClear) return;

  input.addEventListener("input", () => {
    searchText = input.value.toLowerCase();
    btnClear.classList.toggle("d-none", !searchText);
    renderProducts();
  });

  btnClear.onclick = () => {
    input.value = "";
    searchText = "";
    btnClear.classList.add("d-none");
    renderProducts();
    input.focus();
  };
}

// ===============================
// Render
// ===============================
function renderProducts() {
  const container = document.getElementById("productsList");
  const tpl = document.getElementById("productCardTemplate");
  if (!container || !tpl) return;

  const products = getData("products");

  // 🔍 Filtro por búsqueda
  let filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchText)
  );

  UpdateProductsCounter(filtered.length, products.length)

  // 🔃 ORDENAMIENTO (AÑADIDO, NO ROMPE NADA)
  filtered.sort((a, b) => {
    let v1 = a[productFilters.orderBy];
    let v2 = b[productFilters.orderBy];

    // Normalizar strings
    if (typeof v1 === "string") {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if (v1 < v2) return productFilters.orderDir === "asc" ? -1 : 1;
    if (v1 > v2) return productFilters.orderDir === "asc" ? 1 : -1;
    return 0;
  });

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-search"></i>
        <p class="mb-0">No se encontraron productos</p>
      </div>
    `;
    return;
  }

  // 🧱 Render intacto
  filtered.forEach((p) => {
    const node = tpl.content.cloneNode(true);

    node.querySelector(".product-name").textContent = p.name;
    node.querySelector(
      ".product-meta"
    ).textContent = `# ${p.quantity} • $ ${p.price} • UM ${p.um}`;

    node.querySelector(".btn-edit").onclick = () => editProduct(p.id);

    node.querySelector(".btn-delete").onclick = () => deleteProduct(p.id);

    container.appendChild(node);
  });
}

function UpdateProductsCounter(current, total) {
  const counter = document.getElementById("productsCounter");
  counter.textContent = `${current} de ${total} Productos`;
}

// ===============================
// Alta
// ===============================
function addProduct(product) {
  const products = getData("products");

  // nombre único
  if (products.some((p) => p.name === product.name)) {
    alert("Ya existe un producto con ese nombre");
    return;
  }

  products.push(product);
  setData("products", products);
  renderProducts();
}

function openAddProductModal() {
  document.getElementById("productModalTitle").innerText = "Nuevo producto";

  document.getElementById("productForm").reset();
  clearInputError("inputName");
  document.getElementById("productId").value = "";

  productModal.show();
}

// ===============================
// Baja
// ===============================
let productToDelete = null;

function deleteProduct(id) {
  productToDelete = id;

  const product = getData("products").find((p) => p.id === id);

  document.getElementById(
    "confirmDeleteText"
  ).textContent = `¿Desea eliminar "${product.name}"?`;

  new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
}

function confirmDelete() {
  const products = getData("products");
  const deleted = products.find((p) => p.id === productToDelete);

  // Guardamos estado undo
  undoData = deleted;
  undoType = "product";

  // Eliminamos
  const updated = products.filter((p) => p.id !== productToDelete);
  setData("products", updated);

  productToDelete = null;

  renderProducts();
  hideConfirmModal();
  showSnackbar("Producto eliminado");
}

/*function confirmDelete() {
  if (!productToDelete) return;

  let products = getData("products");
  products = products.filter(p => p.id !== productToDelete);
  setData("products", products);

  productToDelete = null;

  bootstrap.Modal
    .getInstance(
      document.getElementById("confirmDeleteModal")
    )
    .hide();

  renderProducts();
}*/

/*function deleteProduct(id) {
  if (!confirm("¿Eliminar producto?")) return;

  const products = getData("products").filter((p) => p.id !== id);

  setData("products", products);
  renderProducts();
}*/

// ===============================
// Edición (base)
// ===============================
function editProduct(id) {
  const products = getData("products");
  const product = products.find((p) => p.id === id);
  if (!product) return;

  document.getElementById("productModalTitle").innerText = "Editar producto";
  clearInputError("inputName");
  document.getElementById("productId").value = product.id;
  document.getElementById("inputName").value = product.name;
  document.getElementById("inputPrice").value = product.price;
  document.getElementById("inputUM").value = product.um;
  document.getElementById("inputQuantity").value = product.quantity;

  productModal.show();
}

function saveProductFromModal() {
  const id = document.getElementById("productId").value;
  const name = document.getElementById("inputName").value.trim();
  const price = Number(document.getElementById("inputPrice").value);
  const um = document.getElementById("inputUM").value.trim();
  const quantity = Number(document.getElementById("inputQuantity").value);

  let products = getData("products");

  clearInputError("inputName");

  // nombre obligatorio
  if (!name) {
    setInputError("inputName", "El nombre es obligatorio");
    return;
  }

  // nombre único
  if (products.some((p) => p.name === name && p.id !== id)) {
    setInputError("inputName", "Ya existe un producto con ese nombre");
    return;
  }

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
  productModal.hide();
  renderProducts();
}

// ===============================
// Hook que llama el router
// ===============================
function onProductsLoaded() {
  loadModal("confirm-delete");
  initProductSearch();
  initProductOrdering();
  renderProducts();

  const btnAdd = document.getElementById("btnAddProduct");
  if (btnAdd) {
    btnAdd.onclick = () => {
      // ejemplo simple
      const name = prompt("Nombre del producto");
      if (!name) return;

      addProduct({
        id: crypto.randomUUID(),
        name,
        price: 0,
        um: "",
        quantity: 0,
      });
    };
  }

  productModal = new bootstrap.Modal(document.getElementById("productModal"));

  document.getElementById("btnAddProduct").onclick = openAddProductModal;

  document.getElementById("btnSaveProduct").onclick = saveProductFromModal;
}

function setInputError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.add("is-invalid");

  const feedback = input.nextElementSibling;
  if (feedback) {
    feedback.innerText = message;
  }
}

function clearInputError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("is-invalid");

  const feedback = input.nextElementSibling;
  if (feedback) {
    feedback.innerText = "";
  }
}
