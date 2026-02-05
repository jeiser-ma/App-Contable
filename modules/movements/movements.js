// ===============================
// Movements - App Contable
// ===============================

//#region Constants
// IDs de botones
const BTN_ID_ADD_MOVEMENT = "btnAddMovement";
const BTN_ID_CONFIRM_MOVEMENT = "btnConfirmMovement";
const BTN_ID_CLEAR_SEARCH_MOVEMENT = "btnClearSearchMovement";
const BTN_ID_FILTER_IN = "filterIn";
const BTN_ID_FILTER_OUT = "filterOut";
const BTN_ID_CLEAR_FILTERS_MOVEMENTS = "btnClearFiltersMovements";

// IDs de otros elementos
const ID_SEARCH_MOVEMENT = "searchMovement";
const ID_MOVEMENTS_LIST = "movementsList";
const ID_MOVEMENT_CARD_TEMPLATE = "movementCardTemplate";
const ID_MOVEMENTS_COUNTER = "movementsCounter";
const ID_FILTER_DATE = "filterDate";
const ID_MOVEMENT_PRODUCT = "movementProduct";
const ID_MOVEMENT_QUANTITY = "movementQuantity";
const ID_MOVEMENT_DATE = "movementDate";
const ID_MOVEMENT_NOTE = "movementNote";
const ID_MOVEMENT_TITLE = "movementTitle";
const ID_MOVEMENT_ICON = "movementIcon";
const ID_MOVEMENT_TYPE_IN = "movementTypeIn";
const ID_MOVEMENT_TYPE_OUT = "movementTypeOut";
//#endregion

// Estado de la pantalla de movimientos (unificado)
const MOVEMENTS_STATE = {
  // Texto de búsqueda (para el input de búsqueda)
  searchText: "",
  // Fecha de filtrado (para el input de fecha)
  filterDate: null,
  // Campo por el que se ordena (date | quantity)
  orderBy: "date",
  // Dirección de ordenamiento (asc | desc)
  orderDir: "desc",
  // Tipo de movimiento filtrado (para los chips de filtro)
  chipFiltered: null, // "in" | "out" | null (todos)
  // ID del movimiento que se va a editar
  elementToEdit: null,
  // ID del movimiento que se va a eliminar
  elementToDelete: null,
  // Tipo de movimiento actual (para el modal)
  currentType: null, // "in" | "out" | null
};

// Exponer el estado globalmente para module-controls.js
window.MOVEMENTS_STATE = MOVEMENTS_STATE;

// ===============================
// Hook que llama el router
// ===============================

/**
 * Hook que se ejecuta cuando se carga la página de movimientos
 * Inicializa el modal, los controles de búsqueda y filtros,
 * y configura los event listeners de los botones
 * @returns {void}
 */
async function onMovementsPageLoaded() {
  console.log("onMovementsPageLoaded execution");

  // Cargar modal de movimientos
  console.log("Loading movement-modal");
  await loadModal(MODAL_MOVEMENTS, PAGE_MOVEMENTS);

  // Inicializar el modal después de cargarlo
  await initModalModule(MODAL_MOVEMENTS);

  // Configurar controles del módulo
  await setupMovementsControls();

  // Configurar botón de confirmar del modal
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_MOVEMENT);
  if (btnConfirm) {
    btnConfirm.onclick = saveMovementFromModal;
  }

  // Renderizar la lista de movimientos
  renderMovements();
}


/**
 * Configura los controles del módulo de movimientos
 * @returns {void}
 */
async function setupMovementsControls() {
  // Limpiar el contenido de los controles del módulo
  clearModuleControlsContent();

  // Mostrar los controles del módulo
  showModuleControls();

  // Cargar el control de búsqueda
  await loadModuleControl(CONTROL_SEARCH_INPUT);
  // Configurar el control de búsqueda
  setupSearchInput(PAGE_MOVEMENTS, MOVEMENTS_STATE, renderMovements);

  // Cargar el control de botón de agregar
  await loadModuleControl(CONTROL_BTN_ADD);
  // Configurar el botón de agregar
  setupBtnAdd(openAddMovementModal);

  // Cargar el control de filtro de fecha
  await loadModuleControl(CONTROL_DATE_FILTER);
  // Configurar el filtro de fecha
  setupDateFilter(PAGE_MOVEMENTS, MOVEMENTS_STATE, renderMovements);

  // cargar el control de ordenamiento
  await loadModuleControl(CONTROL_ORDER_BY);
  // Configurar el control de ordenamiento
  setupOrderBy(PAGE_MOVEMENTS, MOVEMENTS_STATE, renderMovements);

  // cargar el control de chips filter
  await loadModuleControl(CONTROL_CHIPS_FILTER);
  // Configurar el control de chips filter
  setupChipsFilter(PAGE_MOVEMENTS, MOVEMENTS_STATE, renderMovements);

  // Cargar el control de contador de elementos
  await loadModuleControl(CONTROL_LIST_COUNTER);
  // No es necesario configurarle comportamiento,
  // se actualizará automáticamente al renderizar la lista

  // cargar el control de limpiar filtros
  await loadModuleControl(CONTROL_BTN_CLEAR_FILTERS);
  // Configurar el control de limpiar filtros
  setupBtnClearFilters(PAGE_MOVEMENTS, MOVEMENTS_STATE, renderMovements);
}


/**
 * Abre el formulario para entrada (type=in) o salida (type=out)
 * @param {string} type - Tipo de movimiento ("in" | "out")
 * @returns {void}
 */
function openAddMovementModal() {
  MOVEMENTS_STATE.elementToEdit = null;
  MOVEMENTS_STATE.currentType = "in"; // Por defecto entrada

  // Asegurar que el modal esté inicializado
  initModalModule(MODAL_MOVEMENTS);

  const title = document.getElementById(ID_MOVEMENT_TITLE);
  const icon = document.getElementById(ID_MOVEMENT_ICON);
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_MOVEMENT);
  const dateInput = document.getElementById(ID_MOVEMENT_DATE);
  const productInput = document.getElementById(ID_MOVEMENT_PRODUCT);
  const typeIn = document.getElementById(ID_MOVEMENT_TYPE_IN);
  const typeOut = document.getElementById(ID_MOVEMENT_TYPE_OUT);

  if (!title || !icon || !btnConfirm || !dateInput || !productInput) {
    console.error("No se encontraron los elementos del modal");
    return;
  }

  // Reset del formulario
  resetMovementForm();

  // Configurar tipo por defecto (entrada)
  if (typeIn) {
    typeIn.checked = true;
  }
  if (typeOut) {
    typeOut.checked = false;
  }

  // Actualizar UI según tipo
  updateMovementTypeUI();

  // Configurar listeners para el toggle de tipo
  if (typeIn) {
    typeIn.onchange = () => {
      if (typeIn.checked) {
        MOVEMENTS_STATE.currentType = "in";
        updateMovementTypeUI();
      }
    };
  }

  if (typeOut) {
    typeOut.onchange = () => {
      if (typeOut.checked) {
        MOVEMENTS_STATE.currentType = "out";
        updateMovementTypeUI();
      }
    };
  }

  // Fecha por defecto = hoy
  dateInput.value = MOVEMENTS_STATE.filterDate || new Date().toISOString().split("T")[0];

  // Configurar autocomplete para el campo de producto
  initProductAutocomplete(productInput);

  // Mostrar el formulario después de hacer todos los ajustes
  showModalModules();
}

/**
 * Actualiza la UI del modal según el tipo de movimiento seleccionado
 * @returns {void}
 */
function updateMovementTypeUI() {
  const title = document.getElementById(ID_MOVEMENT_TITLE);
  const icon = document.getElementById(ID_MOVEMENT_ICON);
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_MOVEMENT);

  if (!title || !icon || !btnConfirm) return;

  if (MOVEMENTS_STATE.currentType === "in") {
    title.textContent = MOVEMENTS_STATE.elementToEdit
      ? "Editar entrada de producto"
      : "Entrada de producto";
    icon.className = "bi bi-arrow-right text-success";
    btnConfirm.className = "btn btn-success rounded-pill btn-sm";
  } else {
    title.textContent = MOVEMENTS_STATE.elementToEdit
      ? "Editar salida de producto"
      : "Salida de producto";
    icon.className = "bi bi-arrow-left text-danger";
    btnConfirm.className = "btn btn-danger rounded-pill btn-sm";
  }
}

/**
 * @description Limpia todos los campos del formulario
 * @returns {void}
 * @example
 * resetMovementForm();
 * // Limpia todos los campos del formulario
 * // campos: movementProduct, movementQuantity, movementDate, movementNote
 * // el.value = ""; // Limpia el valor del campo
 * // el.classList.remove("is-invalid"); // Elimina la clase is-invalid del campo
 */
function resetMovementForm() {
  const fields = [
    ID_MOVEMENT_PRODUCT,
    ID_MOVEMENT_QUANTITY,
    ID_MOVEMENT_DATE,
    ID_MOVEMENT_NOTE,
  ];

  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = "";
      el.classList.remove("is-invalid");
    }
  });

  // Limpiar estado de edición
  MOVEMENTS_STATE.elementToEdit = null;
}

/**
 * Inicializa el buscador de movimientos
 * Configura los event listeners para el input de búsqueda y el botón de limpiar
 * @returns {void}
 */
function initMovementSearch() {
  const input = document.getElementById(ID_SEARCH_MOVEMENT);
  const btnClear = document.getElementById(BTN_ID_CLEAR_SEARCH_MOVEMENT);

  if (!input || !btnClear) return;

  input.addEventListener("input", () => {
    MOVEMENTS_STATE.searchText = input.value.toLowerCase();
    btnClear.classList.toggle("d-none", !MOVEMENTS_STATE.searchText);
    updateClearFiltersButton();
    renderMovements();
  });

  btnClear.onclick = () => {
    input.value = "";
    MOVEMENTS_STATE.searchText = "";
    btnClear.classList.add("d-none");
    updateClearFiltersButton();
    renderMovements();
    input.focus();
  };
}

/**
 * Inicializa los filtros de movimientos (tipo y fecha)
 * Configura los event listeners para los botones de filtro y el input de fecha
 * @returns {void}
 */
function initMovementFilters() {
  const filterIn = document.getElementById(BTN_ID_FILTER_IN);
  const filterOut = document.getElementById(BTN_ID_FILTER_OUT);
  const filterDate = document.getElementById(ID_FILTER_DATE);

  if (filterIn) {
    filterIn.onclick = () => {
      if (MOVEMENTS_STATE.chipFiltered === "in") {
        MOVEMENTS_STATE.chipFiltered = null;
        filterIn.classList.remove("active");
      } else {
        MOVEMENTS_STATE.chipFiltered = "in";
        filterIn.classList.add("active");
        if (filterOut) filterOut.classList.remove("active");
      }
      updateClearFiltersButton();
      renderMovements();
    };
  }

  if (filterOut) {
    filterOut.onclick = () => {
      if (MOVEMENTS_STATE.chipFiltered === "out") {
        MOVEMENTS_STATE.chipFiltered = null;
        filterOut.classList.remove("active");
      } else {
        MOVEMENTS_STATE.chipFiltered = "out";
        filterOut.classList.add("active");
        if (filterIn) filterIn.classList.remove("active");
      }
      updateClearFiltersButton();
      renderMovements();
    };
  }

  if (filterDate) {
    filterDate.onchange = () => {
      MOVEMENTS_STATE.filterDate = filterDate.value || null;
      updateClearFiltersButton();
      renderMovements();
    };
  }
}

// ===============================
// Filtrado y Ordenamiento
// ===============================

/**
 * Filtra movimientos usando los criterios de MOVEMENTS_STATE
 * @param {Array} movements - Lista de movimientos a filtrar
 * @returns {Array} Lista de movimientos filtrados
 */
function filterMovements(movements) {
  let filtered = [...movements];

  // Filtro por texto de búsqueda (busca en nombre del producto)
  if (MOVEMENTS_STATE.searchText) {
    const products = getData(PAGE_PRODUCTS);
    filtered = filtered.filter((m) => {
      const product = products.find((p) => p.id === m.productId);
      if (!product) return false;
      return product.name.toLowerCase().includes(MOVEMENTS_STATE.searchText.toLowerCase());
    });
  }

  // Filtro por tipo (in/out)
  if (MOVEMENTS_STATE.chipFiltered) {
    filtered = filtered.filter(
      (m) => m.type === MOVEMENTS_STATE.chipFiltered.toUpperCase()
    );
  }

  // Filtro por fecha
  if (MOVEMENTS_STATE.filterDate) {
    filtered = filtered.filter((m) => m.date === MOVEMENTS_STATE.filterDate);
  }

  return filtered;
}

/**
 * Ordena movimientos usando los criterios de MOVEMENTS_STATE
 * @param {Array} movements - Lista de movimientos a ordenar
 * @returns {Array} Lista de movimientos ordenados
 */
function sortMovements(movements) {
  return [...movements].sort((a, b) => {
      v1 = a[MOVEMENTS_STATE.orderBy];
      v2 = b[MOVEMENTS_STATE.orderBy];

    // Para fechas, comparar directamente
    if (MOVEMENTS_STATE.orderBy === "date") {
      if (v1 < v2) return MOVEMENTS_STATE.orderDir === "asc" ? -1 : 1;
      if (v1 > v2) return MOVEMENTS_STATE.orderDir === "asc" ? 1 : -1;
      return 0;
    }

    // Para productos, obtener el nombre del producto
    /*if (MOVEMENTS_STATE.orderBy === "name") {
      const products = getData(PAGE_PRODUCTS);
      const product1 = products.find((p) => p.id === a.productId);
      const product2 = products.find((p) => p.id === b.productId);
      if (!product1 || !product2) return 0;
      //const comparison = product1.name.localeCompare(product2.name);
      //return MOVEMENTS_STATE.orderDir === "asc" ? comparison : -comparison;
      v1 = product1.name;
      console.log("v1: ", v1);
      v2 = product2.name;
      console.log("v2: ", v2);
    } */

    // Normalizar strings para comparación
    if (typeof v1 === "string") {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if (v1 < v2) return MOVEMENTS_STATE.orderDir === "asc" ? -1 : 1;
    if (v1 > v2) return MOVEMENTS_STATE.orderDir === "asc" ? 1 : -1;
    return 0;
  });
}

// ===============================
// Render
// ===============================

/**
 * Renderiza la lista de movimientos en el DOM
 * @param {Array} movements - Lista de movimientos a renderizar
 * @returns {void}
 */
function renderMovementsList(movements) {
  // Obtener los elementos del DOM
  const movementsList = document.getElementById(ID_MOVEMENTS_LIST);
  const movementTemplate = document.getElementById(ID_MOVEMENT_CARD_TEMPLATE);
  // Obtener los productos
  const products = getData(PAGE_PRODUCTS);

  if (!movementsList || !movementTemplate) return;

  // Limpiar la lista de movimientos
  movementsList.replaceChildren();

  if (movements.length === 0) {
    const placeholder = createEmptyStatePlaceholder("No se encontraron movimientos");
    if (placeholder) movementsList.appendChild(placeholder);
    return;
  }

  // Recorrer la lista de movimientos
  movements.forEach((m) => {
    // Obtener el producto
    const product = products.find((p) => p.id === m.productId);
    if (!product) {
      console.error("No se encontró el producto: ", m.productId);
      return; // Si no existe el producto, no mostrar el movimiento
    }

    // Clonar el template del movimiento
    const node = movementTemplate.content.cloneNode(true);
    const card = node.querySelector(".card");
    const iconDiv = node.querySelector(".movement-icon");
    const iconI = node.querySelector(".movement-icon-i");
    const productName = node.querySelector(".movement-product");
    const meta = node.querySelector(".movement-meta");

    // Configurar icono según tipo (IN = + verde, OUT = - rojo)
    if (m.type === "IN") {
      iconDiv.classList.add("bg-success");
      iconI.className = "bi bi-plu bi-arrow-right text-white";
    } else {
      iconDiv.classList.add("bg-danger");
      iconI.className = "bi bi-das bi-arrow-left text-white";
    }

    // Configurar contenido
    productName.textContent = product.name;

    // Formatear fecha: "19/12/2025" desde "2025-12-19"
    const dateObj = new Date(m.date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Mostrar cantidad con icono de caja (similar a productos)
    meta.innerHTML = `<i class="bi bi-calendar"></i> ${formattedDate} • <i class="bi bi-boxes"></i> ${m.quantity} `;

    // Configurar botones de acción
    node.querySelector(".btn-edit-movement").onclick = () =>
      openEditMovementModal(m.id);
    node.querySelector(".btn-delete-movement").onclick = () =>
      openDeleteMovementModal(m.id);

    movementsList.appendChild(node);
  });
}

/**
 * Función principal que renderiza los movimientos
 * Filtra, ordena y renderiza usando MOVEMENTS_STATE
 * @returns {void}
 */
function renderMovements() {
  const allMovements = getData(PAGE_MOVEMENTS) || [];

  // Primero filtrar, luego ordenar
  const filtered = filterMovements(allMovements);
  console.log("filtrados: ", filtered);

  const sorted = sortMovements(filtered);
  console.log("ordenados: ", sorted);

  updateListCounter(sorted.length, allMovements.length, PAGE_MOVEMENTS);
  renderMovementsList(sorted);
}

// ===============================
// Guardado
// ===============================

/**
 * Guarda el movimiento desde el modal
 * Valida los campos, actualiza el stock del producto y guarda el movimiento
 * @returns {void}
 */
function saveMovementFromModal() {
  const productInput = document.getElementById(ID_MOVEMENT_PRODUCT);
  const quantityInput = document.getElementById(ID_MOVEMENT_QUANTITY);
  const dateInput = document.getElementById(ID_MOVEMENT_DATE);
  const noteInput = document.getElementById(ID_MOVEMENT_NOTE);
  const typeIn = document.getElementById(ID_MOVEMENT_TYPE_IN);
  const typeOut = document.getElementById(ID_MOVEMENT_TYPE_OUT);

  if (!productInput || !quantityInput || !dateInput) {
    console.error("No se encontraron los campos del formulario");
    return;
  }

  // Obtener tipo de movimiento del selector
  if (typeIn && typeIn.checked) {
    MOVEMENTS_STATE.currentType = "in";
  } else if (typeOut && typeOut.checked) {
    MOVEMENTS_STATE.currentType = "out";
  } else {
    console.error("No se ha seleccionado el tipo de movimiento");
    return;
  }

  const productName = productInput.value.trim();
  const quantity = Number(quantityInput.value);
  const date = dateInput.value;
  const note = noteInput ? noteInput.value.trim() : "";

  // Limpiar errores previos
  clearInputError(ID_MOVEMENT_PRODUCT);
  clearInputError(ID_MOVEMENT_QUANTITY);
  clearInputError(ID_MOVEMENT_DATE);

  // Validaciones
  if (!productName) {
    setInputError(ID_MOVEMENT_PRODUCT, "Seleccioná un producto");
    return;
  }

  const products = getData(PAGE_PRODUCTS);
  const product = products.find(
    (p) => p.name.toLowerCase() === productName.toLowerCase()
  );

  if (!product) {
    setInputError(ID_MOVEMENT_PRODUCT, "El producto no existe");
    return;
  }

  if (!quantity || quantity <= 0) {
    setInputError(ID_MOVEMENT_QUANTITY, "Ingresá una cantidad válida");
    return;
  }

  // Validar stock para salidas (solo si es nuevo movimiento o si cambió la cantidad/producto)
  if (MOVEMENTS_STATE.currentType === "out") {
    let availableStock = product.quantity;

    // Si estamos editando, considerar el stock que se revertirá
    if (MOVEMENTS_STATE.elementToEdit) {
      const movements = getData(PAGE_MOVEMENTS) || [];
      const existingMovement = movements.find(
        (m) => m.id === MOVEMENTS_STATE.elementToEdit
      );
      if (existingMovement && existingMovement.productId === product.id) {
        // Si es el mismo producto, el stock disponible incluye la cantidad que se revertirá
        if (existingMovement.type === "IN") {
          availableStock -= existingMovement.quantity; // Ya estaba sumado
        } else {
          availableStock += existingMovement.quantity; // Se revertirá la resta
        }
      } else if (
        existingMovement &&
        existingMovement.productId !== product.id
      ) {
        // Si cambió el producto, no hay efecto de reversión en el nuevo producto
        // El stock disponible es el actual
      }
    }

    if (availableStock < quantity) {
      setInputError(
        ID_MOVEMENT_QUANTITY,
        `Stock insuficiente. Disponible: ${availableStock}`
      );
      return;
    }
  }

  if (!date) {
    setInputError(ID_MOVEMENT_DATE, "Seleccioná una fecha");
    return;
  }

  // Guardar movimiento
  const movements = getData(PAGE_MOVEMENTS) || [];

  if (MOVEMENTS_STATE.elementToEdit) {
    // EDITAR: Buscar el movimiento existente para revertir su efecto en el stock
    const existingMovement = movements.find(
      (m) => m.id === MOVEMENTS_STATE.elementToEdit
    );
    if (existingMovement) {
      // Revertir el efecto del movimiento anterior en el producto anterior
      const oldProductId = existingMovement.productId;
      const isSameProduct = oldProductId === product.id;

      const updatedProducts = products.map((p) => {
        // Revertir efecto en el producto anterior
        if (p.id === oldProductId) {
          if (existingMovement.type === "IN") {
            return { ...p, quantity: p.quantity - existingMovement.quantity };
          } else {
            return { ...p, quantity: p.quantity + existingMovement.quantity };
          }
        }
        return p;
      });

      // Aplicar el nuevo efecto en el producto (puede ser el mismo o diferente)
      const finalProducts = updatedProducts.map((p) => {
        if (p.id === product.id) {
          if (MOVEMENTS_STATE.currentType === "in") {
            return { ...p, quantity: p.quantity + quantity };
          } else {
            return { ...p, quantity: p.quantity - quantity };
          }
        }
        return p;
      });
      setData(PAGE_PRODUCTS, finalProducts);
    }

    // Actualizar el movimiento
    const updatedMovements = movements.map((m) =>
      m.id === MOVEMENTS_STATE.elementToEdit
        ? {
            ...m,
            productId: product.id,
            type: MOVEMENTS_STATE.currentType.toUpperCase(),
            quantity: quantity,
            date: date,
            note: note || "",
          }
        : m
    );
    setData(PAGE_MOVEMENTS, updatedMovements);

    MOVEMENTS_STATE.elementToEdit = null;
  } else {
    // NUEVO: Crear nuevo movimiento
    const newMovement = {
      id: crypto.randomUUID(),
      productId: product.id,
      type: MOVEMENTS_STATE.currentType.toUpperCase(),
      quantity: quantity,
      date: date,
      note: note || "",
      createdAt: new Date().toISOString(),
    };

    movements.push(newMovement);
    setData(PAGE_MOVEMENTS, movements);

    // Actualizar stock del producto
    const updatedProducts = products.map((p) => {
      if (p.id === product.id) {
        if (MOVEMENTS_STATE.currentType === "in") {
          return { ...p, quantity: p.quantity + quantity };
        } else {
          return { ...p, quantity: p.quantity - quantity };
        }
      }
      return p;
    });
    setData(PAGE_PRODUCTS, updatedProducts);
  }

  // Cerrar modal y actualizar vista
  hideModalModules();
  MOVEMENTS_STATE.currentType = null;
  renderMovements();
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
  const products = getData(PAGE_PRODUCTS);

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
 * Abre el modal para editar un movimiento existente
 * @param {string} id - ID del movimiento a editar
 * @returns {void}
 */
function openEditMovementModal(id) {
  const movements = getData(PAGE_MOVEMENTS) || [];
  const movement = movements.find((m) => m.id === id);
  if (!movement) return;

  const products = getData(PAGE_PRODUCTS);
  const product = products.find((p) => p.id === movement.productId);
  if (!product) return;

  MOVEMENTS_STATE.elementToEdit = id;
  MOVEMENTS_STATE.currentType = movement.type.toLowerCase();

  // Abrir modal con los datos del movimiento
  initModalModule(MODAL_MOVEMENTS);

  const title = document.getElementById(ID_MOVEMENT_TITLE);
  const icon = document.getElementById(ID_MOVEMENT_ICON);
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_MOVEMENT);
  const productInput = document.getElementById(ID_MOVEMENT_PRODUCT);
  const quantityInput = document.getElementById(ID_MOVEMENT_QUANTITY);
  const dateInput = document.getElementById(ID_MOVEMENT_DATE);
  const noteInput = document.getElementById(ID_MOVEMENT_NOTE);
  const typeIn = document.getElementById(ID_MOVEMENT_TYPE_IN);
  const typeOut = document.getElementById(ID_MOVEMENT_TYPE_OUT);

  if (
    !title ||
    !icon ||
    !btnConfirm ||
    !productInput ||
    !quantityInput ||
    !dateInput
  ) {
    console.error("No se encontraron los elementos del modal");
    return;
  }

  // Configurar tipo en el selector
  if (typeIn && typeOut) {
    if (movement.type === "IN") {
      typeIn.checked = true;
      typeOut.checked = false;
    } else {
      typeIn.checked = false;
      typeOut.checked = true;
    }
  }

  // Configurar listeners para el toggle de tipo
  if (typeIn) {
    typeIn.onchange = () => {
      if (typeIn.checked) {
        MOVEMENTS_STATE.currentType = "in";
        updateMovementTypeUI();
      }
    };
  }

  if (typeOut) {
    typeOut.onchange = () => {
      if (typeOut.checked) {
        MOVEMENTS_STATE.currentType = "out";
        updateMovementTypeUI();
      }
    };
  }

  // Actualizar UI según tipo
  updateMovementTypeUI();

  // Llenar campos con datos del movimiento
  productInput.value = product.name;
  quantityInput.value = movement.quantity;
  dateInput.value = movement.date;
  if (noteInput) {
    noteInput.value = movement.note || "";
  }

  // Limpiar errores
  clearInputError(ID_MOVEMENT_PRODUCT);
  clearInputError(ID_MOVEMENT_QUANTITY);
  clearInputError(ID_MOVEMENT_DATE);

  // Configurar autocomplete
  initProductAutocomplete(productInput);

  // Mostrar modal
  showModalModules();
}

/**
 * Abre el modal para eliminar un movimiento
 * @param {string} id - ID del movimiento a eliminar
 * @returns {void}
 */
function openDeleteMovementModal(id) {
  MOVEMENTS_STATE.elementToDelete = id;

  const movements = getData(PAGE_MOVEMENTS) || [];
  const movement = movements.find((m) => m.id === id);
  if (!movement) return;

  const products = getData(PAGE_PRODUCTS);
  const product = products.find((p) => p.id === movement.productId);
  if (!product) return;

  const movementTypeText = movement.type === "IN" ? "entrada" : "salida";
  openConfirmDeleteModal(
    "movement",
    id,
    `${movementTypeText} de ${product.name}`
  );
}

/**
 * Confirma la eliminación de un movimiento
 * Elimina el movimiento y revierte el efecto en el stock del producto
 * @returns {void}
 */
function confirmDeleteMovement() {
  if (!MOVEMENTS_STATE.elementToDelete) return;

  const movements = getData(PAGE_MOVEMENTS) || [];
  const movement = movements.find(
    (m) => m.id === MOVEMENTS_STATE.elementToDelete
  );
  if (!movement) return;

  const products = getData(PAGE_PRODUCTS);

  // Guardar estado undo
  UNDO_STATE.data = movement;
  UNDO_STATE.type = PAGE_MOVEMENTS;

  // Revertir el efecto en el stock del producto
  const updatedProducts = products.map((p) => {
    if (p.id === movement.productId) {
      if (movement.type === "IN") {
        // Si era entrada, restar la cantidad
        return { ...p, quantity: p.quantity - movement.quantity };
      } else {
        // Si era salida, sumar la cantidad
        return { ...p, quantity: p.quantity + movement.quantity };
      }
    }
    return p;
  });
  setData(PAGE_PRODUCTS, updatedProducts);

  // Eliminar el movimiento
  const updatedMovements = movements.filter(
    (m) => m.id !== MOVEMENTS_STATE.elementToDelete
  );
  setData(PAGE_MOVEMENTS, updatedMovements);

  MOVEMENTS_STATE.elementToDelete = null;
  DELETE_STATE.type = null;
  DELETE_STATE.id = null;

  hideConfirmModal();
  renderMovements();
  showSnackbar("Movimiento eliminado");
}
