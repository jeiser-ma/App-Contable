// ===============================
// Accounting - App Contable
// ===============================

//#region Constants
const ID_ACCOUNTING_DATE_FILTER = "accountingDateFilter";
const ID_ACCOUNTING_PRODUCTS_LIST = "accountingProductsList";
const ID_ACCOUNTING_EXPENSES_LIST = "accountingExpensesList";
const ID_BTN_TOTAL_AMOUNT = "btnTotalAmount";
const ID_BTN_TOTAL_EXPENSES = "btnTotalExpenses";
const ID_BTN_TOTAL_SALES = "btnTotalSales";
const ID_BTN_CLOSE_ACCOUNTING = "btnCloseAccounting";
const ID_CASH_SALES_AMOUNT = "cashSalesAmount";
const ID_TRANSFER_SALES_AMOUNT = "transferSalesAmount";
const ID_BTN_ADD_CASH_SALES = "btnAddCashSales";
const ID_BTN_ADD_TRANSFER_SALES = "btnAddTransferSales";
const ID_CLOSING_TOTAL_AMOUNT = "closingTotalAmount";
const ID_CLOSING_TOTAL_SALES = "closingTotalSales";
const ID_CLOSING_DIFFERENCE = "closingDifference";
const ID_SALARY_PERCENTAGE = "salaryPercentage";
const ID_NOMINAL_SALARY = "nominalSalary";
const ID_SALARY_DIFFERENCE = "salaryDifference";
const ID_REAL_SALARY = "realSalary";
const ID_ALERT_MISSING_INVENTORY = "alertMissingInventory";
const ID_ALERT_NO_EXPENSES = "alertNoExpenses";

// ids de template de productos
const ID_ACCOUNTING_PRODUCT_CARD_TEMPLATE = "accountingProductCardTemplate";
const CLASS_ACCOUNTING_PRODUCT_NAME = "accounting-product-name";
const CLASS_ACCOUNTING_PRODUCT_YESTERDAY_STOCK = "accounting-product-yesterday-stock";
const CLASS_ACCOUNTING_PRODUCT_YESTERDAY_ENTRIES = "accounting-product-yesterday-entries";
const CLASS_ACCOUNTING_PRODUCT_YESTERDAY_EXITS = "accounting-product-yesterday-exits";
const CLASS_ACCOUNTING_PRODUCT_TODAY_INVENTORY = "accounting-product-today-inventory";
const CLASS_ACCOUNTING_PRODUCT_EXITS = "accounting-product-exits";
const CLASS_ACCOUNTING_PRODUCT_INVENTORY = "accounting-product-inventory";
const CLASS_ACCOUNTING_PRODUCT_SALES = "accounting-product-sales";
const CLASS_ACCOUNTING_PRODUCT_UNIT_PRICE = "accounting-product-unit-price";
const CLASS_ACCOUNTING_PRODUCT_TOTAL_AMOUNT = "accounting-product-total-amount";

// ids de template de gastos
const ID_ACCOUNTING_EXPENSE_CARD_TEMPLATE = "accountingExpenseCardTemplate";
const CLASS_ACCOUNTING_EXPENSE_CONCEPT = "accounting-expense-concept";
const CLASS_ACCOUNTING_EXPENSE_AMOUNT = "accounting-expense-amount";

//#endregion


// Estado de la pantalla de inventario (unificado)
const ACCOUNTING_STATE = {
  // not tiene texto de búsqueda (para el input de búsqueda)
  searchText: "",
  // filtro por fecha
  filterDate: null,
  // no tiene campo por el que se ordena
  orderBy: null,
  // no tiene dirección de ordenamiento
  orderDir: null,
  // notiene chips de filtro
  chipFiltered: null,
  // notiene ID del inventario que se va a editar
  elementToEdit: null,
  // notiene ID del inventario que se va a eliminar
  elementToDelete: null,
  // notiene tipo de inventario actual
  currentType: null,
};

// Exponer el estado globalmente para module-controls.js
window.ACCOUNTING_STATE = ACCOUNTING_STATE;

let currentAccounting = null;

/**
 * Hook que se ejecuta cuando se carga la página de contabilidad
 * @returns {void}
 */
async function onAccountingPageLoaded() {
  console.log("onAccountingPageLoaded execution");

  // Cargar modales de agregar ventas
  // Cargar modal de ventas en efectivo
  await loadModal(MODAL_CASH_SALES, PAGE_ACCOUNTING);
  // Inicializar el modal de ventas en efectivo después de cargarlo
  initModalModule(MODAL_CASH_SALES);
  // Cargar modal de ventas en transferencia
  await loadModal(MODAL_TRANSFER_SALES, PAGE_ACCOUNTING);
  // Inicializar el modal después de cargarlo  
  initModalModule(MODAL_TRANSFER_SALES);

  // Configurar controles del módulo
  await setupAccountingControls();

  // Configurar eventos de botones
  document.getElementById(ID_BTN_ADD_CASH_SALES).onclick = () => openCashSalesModal();
  document.getElementById(ID_BTN_ADD_TRANSFER_SALES).onclick = () => openTransferSalesModal();
  document.getElementById(ID_BTN_CLOSE_ACCOUNTING).onclick = () => confirmCloseAccounting();

  // Renderizar la contabilidad
  await renderAccounting();
}



/**
 * Configura los controles del módulo de contabilidad
 * @returns {void}
 */
async function setupAccountingControls() {
  // Limpiar el contenido de los controles del módulo
  clearModuleControlsContent();

  // Mostrar los controles del módulo
  showModuleControls();

  // la contabilidad no tiene control de búsqueda
  //await loadModuleControl(CONTROL_SEARCH_INPUT);
  // Configurar el control de búsqueda
  //setupSearchInput(PAGE_ACCOUNTING, ACCOUNTING_STATE, renderAccounting);

  // la contabilidad no tiene botón de agregar
  //await loadModuleControl(CONTROL_BTN_ADD);
  // Configurar el botón de agregar
  //setupBtnAdd(openAddAccountingModal);

  // Cargar el control de filtro de fecha
  // El filtro de fecha ya se configura en setupDateFilter con la fecha de hoy
  await loadModuleControl(CONTROL_DATE_FILTER);
  // Configurar el filtro de fecha
  setupDateFilter(PAGE_ACCOUNTING, ACCOUNTING_STATE, renderAccounting);

  // la contabilidad no tiene campo de ordenamiento
  //await loadModuleControl(CONTROL_ORDER_BY);
  // Configurar el control de ordenamiento
  //setupOrderBy(PAGE_ACCOUNTING, ACCOUNTING_STATE, renderAccounting);

  // cargar el control de chips filter
  await loadModuleControl(CONTROL_CHIPS_FILTER);
  // Configurar el control de chips filter
  await setupChipsFilter(PAGE_ACCOUNTING, ACCOUNTING_STATE, renderAccounting);

  // Para los modulos con chips de fecha, inicializar el chip today por defecto al cargar la pagina
  //activateChip(PAGES_CONFIG[PAGE_ACCOUNTING].chips.find(chip => chip.value === "today").id, ACCOUNTING_STATE);
  linkDateAndChipsFilters(PAGE_ACCOUNTING, ACCOUNTING_STATE, CONTROL_DATE_FILTER);


  // la contabilidad no tiene control de contador de elementos
  //await loadModuleControl(CONTROL_LIST_COUNTER);
  // No es necesario configurarle comportamiento,
  // se actualizará automáticamente al renderizar la lista

  // cargar el control de limpiar filtros
  await loadModuleControl(CONTROL_BTN_CLEAR_FILTERS);
  // Configurar el control de limpiar filtros
  setupBtnClearFilters(PAGE_ACCOUNTING, ACCOUNTING_STATE, renderAccounting);
}



/**
 * Carga la contabilidad del día seleccionado
 * @returns {void}
 */
async function loadAccounting() {
  const allAccounting = getData(PAGE_ACCOUNTING) || [];


  // // Filtrar la contabilidad por fecha
  currentAccounting = allAccounting.find(a => a.date === ACCOUNTING_STATE.filterDate);

  if (!currentAccounting) {
    // Crear nueva contabilidad para el día
    currentAccounting = createNewAccounting(ACCOUNTING_STATE.filterDate);
    saveAccounting();
  }

  //renderAccounting();
}


/**
 * Renderiza la contabilidad
 * @returns {void}
 */
async function renderAccounting() {
  // Cargar la contabilidad si no existe
  if (!currentAccounting) {
    await loadAccounting();
  }

  // Validar inventario
  const missingInventory = validateInventory();
  const alertMissing = document.getElementById(ID_ALERT_MISSING_INVENTORY);
  if (alertMissing) {
    alertMissing.classList.toggle("d-none", !missingInventory);
  }

  // Validar gastos
  const noExpenses = currentAccounting.totalExpenses === 0;
  const alertNoExpenses = document.getElementById(ID_ALERT_NO_EXPENSES);
  if (alertNoExpenses) {
    alertNoExpenses.classList.toggle("d-none", !noExpenses);
  }

  // Renderizar productos
  renderAccountingProducts();

  // Renderizar gastos
  renderAccountingExpenses();

  // Actualizar totales
  updateTotals();

  // Actualizar cierre de caja
  updateClosing();

  // Actualizar cálculo de salario
  updateSalary();

  // Habilitar/deshabilitar botón de cerrar
  updateCloseButton();
}


/**
 * Crea una nueva contabilidad para una fecha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Object} Objeto de contabilidad
 */
function createNewAccounting(date) {
  const yesterday = getYesterday(date);
  const products = getData(PAGE_PRODUCTS) || [];
  const movements = getData(PAGE_MOVEMENTS) || [];
  const inventory = getData(PAGE_INVENTORY) || [];
  const expenses = getData(PAGE_EXPENSES) || [];

  // Obtener contabilidad de ayer
  const allAccounting = getData(PAGE_ACCOUNTING) || [];
  const yesterdayAccounting = allAccounting.find(a => a.date === yesterday && a.closed);

  const accountingProducts = products.map(product => {
    // Stock de ayer (de contabilidad cerrada de ayer o stock actual del producto)
    let yesterdayStock = product.quantity;
    if (yesterdayAccounting) {
      const yesterdayProduct = yesterdayAccounting.products.find(p => p.productId === product.id);
      if (yesterdayProduct) {
        yesterdayStock = yesterdayProduct.yesterdayStock + yesterdayProduct.yesterdayEntries - yesterdayProduct.yesterdayExits;
      }
    }

    // Entradas de ayer
    const yesterdayEntries = movements
      .filter(m => m.date === yesterday && m.type === "IN" && m.productId === product.id)
      .reduce((sum, m) => sum + m.quantity, 0);

    // Salidas de ayer
    const yesterdayExits = movements
      .filter(m => m.date === yesterday && m.type === "OUT" && m.productId === product.id)
      .reduce((sum, m) => sum + m.quantity, 0);

    // Inventario de hoy
    const todayInventory = inventory.find(inv => inv.date === date && inv.productId === product.id && inv.status === "CONFIRMED");
    let todayInventoryQty = null;
    if (todayInventory) {
      todayInventoryQty = (todayInventory.warehouseQuantity || 0) + (todayInventory.storeQuantity || 0);
    }

    // Ventas = stock ayer + entradas ayer - salidas ayer - inventario hoy
    const sales = todayInventoryQty !== null
      ? yesterdayStock + yesterdayEntries - yesterdayExits - todayInventoryQty
      : null; // null indica que falta inventario

    return {
      productId: product.id,
      yesterdayStock: yesterdayStock,
      yesterdayEntries: yesterdayEntries,
      yesterdayExits: yesterdayExits,
      todayInventory: todayInventoryQty,
      sales: sales !== null ? sales : 0,
      unitPrice: product.price || 0,
      amount: sales !== null ? (sales * (product.price || 0)) : 0
    };
  });

  // Gastos de ayer
  const yesterdayExpenses = expenses.filter(e => e.date === yesterday);
  const totalExpenses = yesterdayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    id: crypto.randomUUID(),
    date: date,
    products: accountingProducts,
    cashSales: 0,
    transferSales: 0,
    totalSales: 0,
    totalExpenses: totalExpenses,
    totalAmount: accountingProducts.reduce((sum, p) => sum + p.amount, 0),
    difference: 0,
    salaryPercentage: getSalaryPercentage(),
    nominalSalary: 0,
    realSalary: 0,
    closed: false,
    createdAt: new Date().toISOString(),
    closedAt: null
  };
}

/**
 * Obtiene la fecha de ayer en formato YYYY-MM-DD
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha de ayer
 */
function getYesterday(date) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}



/**
 * Valida que todos los productos tengan inventario
 * @returns {boolean} true si faltan productos sin inventario
 */
function validateInventory() {
  if (!currentAccounting) return false;

  return currentAccounting.products.some(p => {
    // Verificar si el inventario es null, undefined o si no hay inventario confirmado para hoy
    return p.todayInventory === null || p.todayInventory === undefined;
  });
}

/**
 * Renderiza la lista de productos de contabilidad
 * @returns {void}
 */
async function renderAccountingProducts() {
  // Obtener el elemento <template> del DOM de la tarjeta de producto
  const template = document.getElementById(ID_ACCOUNTING_PRODUCT_CARD_TEMPLATE);

  // Obtener la lista de productos del DOM
  const list = document.getElementById(ID_ACCOUNTING_PRODUCTS_LIST);

  // Validar que existan la lista de productos, el template y la contabilidad
  if (!list || !template || !currentAccounting) return;

  // Obtener los productos
  const productsAll = getData(PAGE_PRODUCTS) || [];

  // Limpiar la lista
  list.replaceChildren();

  // Recorrer los productos
  currentAccounting.products.forEach(async accountingProd => {
    const product = productsAll.find(p => p.id === accountingProd.productId);
    if (!product) return;

    // crear una copia del template
    const clonedTemplate = template.content.cloneNode(true);

    // crear la tarjeta de producto
    const newProductCard = await createProductCardFromTemplate(clonedTemplate, product.name, accountingProd);

    if (!newProductCard) {
      console.error(`No se pudo crear el new product card con id: ${product.name}`);
      return;
    }

    list.appendChild(newProductCard);
    console.log("new product card creado correctamente: ", product.name);
  });
}

/**
 * Crea una nueva tarjeta de producto desde el template
 * @param {HTMLElement} clonedTemplate - Template de la tarjeta de producto
 * @param {string} productName - Nombre del producto
 * @param {Object} product - Producto a crear la tarjeta
 * @returns {HTMLElement} Tarjeta de producto creada
 */
async function createProductCardFromTemplate(clonedTemplate, productName, product) {
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_NAME).textContent = productName;
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_YESTERDAY_STOCK).textContent = product.yesterdayStock;
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_YESTERDAY_ENTRIES).textContent = product.yesterdayEntries;
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_YESTERDAY_EXITS).textContent = product.yesterdayExits;
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_TODAY_INVENTORY).textContent = !product.todayInventory ? 0 : product.todayInventory;
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_SALES).textContent = product.sales;

  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_UNIT_PRICE).textContent = product.unitPrice.toFixed(2);
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_PRODUCT_TOTAL_AMOUNT).textContent = product.amount.toFixed(2);
  return clonedTemplate;

}


/**
 * Renderiza la lista de gastos
 * @returns {void}
 */
function renderAccountingExpenses() {
  // Obtener el elemento <template> del DOM de la tarjeta de gasto
  const template = document.getElementById(ID_ACCOUNTING_EXPENSE_CARD_TEMPLATE);

  // Obtener la lista de gastos del DOM
  const list = document.getElementById(ID_ACCOUNTING_EXPENSES_LIST);

  // Validar que existan la lista de productos, el template y la contabilidad
  if (!list || !template) return;

  const yesterday = getYesterday(ACCOUNTING_STATE.filterDate);
  const expenses = getData(PAGE_EXPENSES) || [];
  const yesterdayExpenses = expenses.filter(e => e.date === yesterday);

  list.replaceChildren();

  /*if (yesterdayExpenses.length === 0) {
    list.innerHTML = `<div class="text-center text-muted py-2">No hay gastos registrados para ayer </br> ${yesterday}</div>`;
    return;
  }*/

  yesterdayExpenses.forEach(async expense => {

    // crear una copia del template
    const clonedTemplate = template.content.cloneNode(true);

    // crear la tarjeta de gasto
    const newExpenseCard = await createExpenseCardFromTemplate(clonedTemplate, expense);

    if (!newExpenseCard) {
      console.error(`No se pudo crear el new expense card con id: ${expense.concept}`);
      return;
    }

    // const card = document.createElement("div");
    // card.className = "card shadow-sm";
    // card.innerHTML = `
    //   <div class="card-body py-2 px-3">
    //     <div class="d-flex justify-content-between align-items-center">
    //       <div class="d-flex align-items-center gap-2">
    //         <i class="bi bi-cash-coin text-danger"></i>
    //         <span class="fw-semibold">${expense.concept}</span>
    //       </div>
    //       <span class="text-danger fw-semibold">-$${expense.amount.toFixed(2)}</span>
    //     </div>
    //   </div>
    // `;

    list.appendChild(newExpenseCard);
    console.log("new expense card creado correctamente: ", expense.concept);
  });
}



/**
 * Crea una nueva tarjeta de gasto desde el template
 * @param {HTMLElement} clonedTemplate - Template de la tarjeta de producto
 * @param {Object} expense - Gasto a crear la tarjeta
 * @returns {HTMLElement} Tarjeta de gasto creada
 */
async function createExpenseCardFromTemplate(clonedTemplate, expense) {
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_EXPENSE_CONCEPT).textContent = expense.concept;
  clonedTemplate.querySelector("." + CLASS_ACCOUNTING_EXPENSE_AMOUNT).textContent = "-$ "+expense.amount.toFixed(2);
  return clonedTemplate;
}



/**
 * Actualiza los totales
 * @returns {void}
 */
function updateTotals() {
  if (!currentAccounting) return;

  // Total de importes
  currentAccounting.totalAmount = currentAccounting.products.reduce((sum, p) => sum + p.amount, 0);
  const btnTotalAmount = document.getElementById(ID_BTN_TOTAL_AMOUNT);
  if (btnTotalAmount) {
    btnTotalAmount.innerHTML = `<i class="bi bi-cash-stack"></i> Importe Total: $${currentAccounting.totalAmount.toFixed(2)}`;
  }

  // Total de gastos
  const btnTotalExpenses = document.getElementById(ID_BTN_TOTAL_EXPENSES);
  if (btnTotalExpenses) {
    btnTotalExpenses.innerHTML = `<i class="bi bi-cash-stack"></i> Total Gastos: $${currentAccounting.totalExpenses.toFixed(2)}`;
  }

  // Total de ventas (incluye ventas en efectivo + transferencia + gastos)
  currentAccounting.totalSales = currentAccounting.cashSales + currentAccounting.transferSales + currentAccounting.totalExpenses;
  const btnTotalSales = document.getElementById(ID_BTN_TOTAL_SALES);
  if (btnTotalSales) {
    btnTotalSales.innerHTML = `<i class="bi bi-cash-stack"></i> Total Ventas: $${currentAccounting.totalSales.toFixed(2)}`;
  }

  // Actualizar montos de ventas
  const cashAmount = document.getElementById(ID_CASH_SALES_AMOUNT);
  if (cashAmount) {
    cashAmount.textContent = `$${currentAccounting.cashSales.toFixed(2)}`;
  }

  const transferAmount = document.getElementById(ID_TRANSFER_SALES_AMOUNT);
  if (transferAmount) {
    transferAmount.textContent = `$${currentAccounting.transferSales.toFixed(2)}`;
  }
}

/**
 * Actualiza la sección de cierre de caja
 * @returns {void}
 */
function updateClosing() {
  if (!currentAccounting) return;

  const totalAmount = document.getElementById(ID_CLOSING_TOTAL_AMOUNT);
  const totalSales = document.getElementById(ID_CLOSING_TOTAL_SALES);
  const difference = document.getElementById(ID_CLOSING_DIFFERENCE);

  if (totalAmount) {
    totalAmount.textContent = `$${currentAccounting.totalAmount.toFixed(2)}`;
  }

  if (totalSales) {
    totalSales.textContent = `$${currentAccounting.totalSales.toFixed(2)}`;
  }

  if (difference) {
    currentAccounting.difference = currentAccounting.totalAmount - currentAccounting.totalSales;
    difference.textContent = `$${currentAccounting.difference.toFixed(2)}`;

    // Colorear según el valor
    difference.className = "fw-semibold";
    if (currentAccounting.difference === 0) {
      difference.classList.add("text-success");
    } else if (currentAccounting.difference < 0) {
      difference.classList.add("text-danger");
    } else {
      difference.classList.add("text-primary");
    }
  }
}

/**
 * Actualiza la sección de cálculo de salario
 * @returns {void}
 */
function updateSalary() {
  if (!currentAccounting) return;

  const percentage = document.getElementById(ID_SALARY_PERCENTAGE);
  const nominal = document.getElementById(ID_NOMINAL_SALARY);
  const salaryDiff = document.getElementById(ID_SALARY_DIFFERENCE);
  const real = document.getElementById(ID_REAL_SALARY);

  if (percentage) {
    percentage.textContent = `${currentAccounting.salaryPercentage}%`;
  }

  if (nominal) {
    currentAccounting.nominalSalary = (currentAccounting.totalAmount * currentAccounting.salaryPercentage) / 100;
    nominal.textContent = `$${currentAccounting.nominalSalary.toFixed(2)}`;
  }

  if (salaryDiff) {
    salaryDiff.textContent = `$${currentAccounting.difference.toFixed(2)}`;
    salaryDiff.className = "fw-semibold";
    if (currentAccounting.difference === 0) {
      salaryDiff.classList.add("text-success");
    } else if (currentAccounting.difference < 0) {
      salaryDiff.classList.add("text-danger");
    } else {
      salaryDiff.classList.add("text-primary");
    }
  }

  if (real) {
    currentAccounting.realSalary = currentAccounting.nominalSalary - currentAccounting.difference;
    real.textContent = `$${currentAccounting.realSalary.toFixed(2)}`;
  }
}

/**
 * Actualiza el estado del botón de cerrar contabilidad
 * @returns {void}
 */
function updateCloseButton() {
  const btn = document.getElementById(ID_BTN_CLOSE_ACCOUNTING);
  if (!btn) return;

  const canClose = !validateInventory() &&
    currentAccounting.cashSales > 0 &&
    currentAccounting.transferSales > 0 &&
    !currentAccounting.closed;

  btn.disabled = !canClose;
}

/**
 * Abre el modal de ventas en efectivo
 * @returns {void}
 */
function openCashSalesModal() {
  initModalModule(MODAL_CASH_SALES);
  const input = document.getElementById("cashSalesInput");
  if (!input || !currentAccounting) return;

  input.value = currentAccounting.cashSales || 0;
  showModalModules();
}

/**
 * Abre el modal de ventas por transferencia
 * @returns {void}
 */
function openTransferSalesModal() {
  initModalModule(MODAL_TRANSFER_SALES);
  const input = document.getElementById("transferSalesInput");
  if (!input || !currentAccounting) return;

  input.value = currentAccounting.transferSales || 0;
  showModalModules();
}

/**
 * Guarda las ventas en efectivo
 * @returns {void}
 */
function saveCashSales() {
  const input = document.getElementById("cashSalesInput");
  if (!input || !currentAccounting) return;

  const amount = parseFloat(input.value) || 0;
  if (amount < 0) {
    showSnackbar("La cantidad no puede ser negativa");
    return;
  }

  currentAccounting.cashSales = amount;
  saveAccounting();
  hideModalModules();
  renderAccounting();
}

/**
 * Guarda las ventas por transferencia
 * @returns {void}
 */
function saveTransferSales() {
  const input = document.getElementById("transferSalesInput");
  if (!input || !currentAccounting) return;

  const amount = parseFloat(input.value) || 0;
  if (amount < 0) {
    showSnackbar("La cantidad no puede ser negativa");
    return;
  }

  currentAccounting.transferSales = amount;
  saveAccounting();
  hideModalModules();
  renderAccounting();
}

/**
 * Guarda la contabilidad actual
 * @returns {void}
 */
function saveAccounting() {
  if (!currentAccounting) return;

  const allAccounting = getData(PAGE_ACCOUNTING) || [];
  const index = allAccounting.findIndex(a => a.id === currentAccounting.id);

  if (index >= 0) {
    allAccounting[index] = currentAccounting;
  } else {
    allAccounting.push(currentAccounting);
  }

  setData(PAGE_ACCOUNTING, allAccounting);
}

/**
 * Confirma el cierre de contabilidad
 * @returns {void}
 */
function confirmCloseAccounting() {
  if (!currentAccounting) return;

  if (validateInventory()) {
    showSnackbar("No se puede cerrar: faltan productos sin inventario");
    return;
  }

  if (currentAccounting.cashSales === 0 || currentAccounting.transferSales === 0) {
    showSnackbar("No se puede cerrar: faltan ventas en efectivo o transferencia");
    return;
  }

  if (currentAccounting.closed) {
    showSnackbar("Esta contabilidad ya está cerrada");
    return;
  }

  // Pedir confirmación
  if (confirm("¿Estás seguro de cerrar la contabilidad? Esta acción no se puede deshacer.")) {
    closeAccounting();
  }
}

/**
 * Cierra la contabilidad
 * @returns {void}
 */
function closeAccounting() {
  if (!currentAccounting) return;

  currentAccounting.closed = true;
  currentAccounting.closedAt = new Date().toISOString();

  saveAccounting();
  renderAccounting();
  showSnackbar("Contabilidad cerrada correctamente");
}

/**
 * Navega al módulo de inventario
 * @returns {void}
 */
function goToInventory() {
  if (typeof loadPage === "function") {
    loadPage("inventory");
  }
}

/**
 * Navega al módulo de gastos
 * @returns {void}
 */
function goToExpenses() {
  if (typeof loadPage === "function") {
    loadPage("expenses");
  }
}

