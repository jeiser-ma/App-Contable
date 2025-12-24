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

const MODAL_ID_CASH_SALES = "cashSalesModal";
const MODAL_ID_TRANSFER_SALES = "transferSalesModal";
//#endregion

let currentDate = null;
let currentAccounting = null;

/**
 * Hook que se ejecuta cuando se carga la página de contabilidad
 * @returns {void}
 */
async function onAccountingPageLoaded() {
  console.log("onAccountingPageLoaded execution");
  
  // Establecer fecha por defecto (hoy)
  const today = new Date().toISOString().split("T")[0];
  currentDate = today;
  
  const dateFilter = document.getElementById(ID_ACCOUNTING_DATE_FILTER);
  if (dateFilter) {
    dateFilter.value = today;
    dateFilter.onchange = () => {
      currentDate = dateFilter.value || today;
      loadAccounting();
    };
  }
  
  // Cargar modales de ventas
  await loadModal("cash-sales-modal");
  await loadModal("transfer-sales-modal");
  initModal(MODAL_ID_CASH_SALES);
  initModal(MODAL_ID_TRANSFER_SALES);
  
  // Configurar botones
  document.getElementById(ID_BTN_ADD_CASH_SALES).onclick = () => openCashSalesModal();
  document.getElementById(ID_BTN_ADD_TRANSFER_SALES).onclick = () => openTransferSalesModal();
  document.getElementById(ID_BTN_CLOSE_ACCOUNTING).onclick = confirmCloseAccounting;
  
  // Cargar contabilidad
  loadAccounting();
}

/**
 * Carga la contabilidad del día seleccionado
 * @returns {void}
 */
function loadAccounting() {
  const allAccounting = getData("accounting") || [];
  currentAccounting = allAccounting.find(a => a.date === currentDate);
  
  if (!currentAccounting) {
    // Crear nueva contabilidad para el día
    currentAccounting = createNewAccounting(currentDate);
  }
  
  renderAccounting();
}

/**
 * Crea una nueva contabilidad para una fecha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Object} Objeto de contabilidad
 */
function createNewAccounting(date) {
  const yesterday = getYesterday(date);
  const products = getData("products") || [];
  const movements = getData("movements") || [];
  const inventory = getData("inventory") || [];
  const expenses = getData("expenses") || [];
  
  // Obtener contabilidad de ayer
  const allAccounting = getData("accounting") || [];
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
 * Renderiza la contabilidad
 * @returns {void}
 */
function renderAccounting() {
  if (!currentAccounting) return;
  
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
function renderAccountingProducts() {
  const list = document.getElementById(ID_ACCOUNTING_PRODUCTS_LIST);
  if (!list || !currentAccounting) return;
  
  const products = getData("products") || [];
  list.innerHTML = "";
  
  currentAccounting.products.forEach(ap => {
    const product = products.find(p => p.id === ap.productId);
    if (!product) return;
    
    const card = document.createElement("div");
    card.className = "card shadow-sm";
    card.innerHTML = `
      <div class="card-body py-2 px-3">
        <div class="fw-semibold mb-2">${product.name}</div>
        <div class="d-flex flex-wrap gap-2 small text-muted">
          <span><i class="bi bi-box text-primary"></i> ${ap.yesterdayStock}</span>
          <span><i class="bi bi-plus-circle text-success"></i> +${ap.yesterdayEntries}</span>
          <span><i class="bi bi-dash-circle text-danger"></i> -${ap.yesterdayExits}</span>
          <span><i class="bi bi-plus-circle text-success"></i> ${ap.todayInventory !== null ? ap.todayInventory : '--'}</span>
          <span>VENTAS ${ap.sales !== null && ap.sales !== undefined ? ap.sales : '--'}</span>
          <span>PU $${ap.unitPrice.toFixed(2)}</span>
          <span>IMP $${ap.amount.toFixed(2)}</span>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

/**
 * Renderiza la lista de gastos
 * @returns {void}
 */
function renderAccountingExpenses() {
  const list = document.getElementById(ID_ACCOUNTING_EXPENSES_LIST);
  if (!list) return;
  
  const yesterday = getYesterday(currentDate);
  const expenses = getData("expenses") || [];
  const yesterdayExpenses = expenses.filter(e => e.date === yesterday);
  
  list.innerHTML = "";
  
  if (yesterdayExpenses.length === 0) {
    list.innerHTML = '<div class="text-center text-muted py-2">No hay gastos registrados</div>';
    return;
  }
  
  yesterdayExpenses.forEach(expense => {
    const card = document.createElement("div");
    card.className = "card shadow-sm";
    card.innerHTML = `
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-cash-coin text-danger"></i>
            <span class="fw-semibold">${expense.concept}</span>
          </div>
          <span class="text-danger fw-semibold">-$${expense.amount.toFixed(2)}</span>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
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
  
  // Total de ventas
  currentAccounting.totalSales = currentAccounting.cashSales + currentAccounting.transferSales;
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
  initModal(MODAL_ID_CASH_SALES);
  const input = document.getElementById("cashSalesInput");
  if (!input || !currentAccounting) return;
  
  input.value = currentAccounting.cashSales || 0;
  showModal();
}

/**
 * Abre el modal de ventas por transferencia
 * @returns {void}
 */
function openTransferSalesModal() {
  initModal(MODAL_ID_TRANSFER_SALES);
  const input = document.getElementById("transferSalesInput");
  if (!input || !currentAccounting) return;
  
  input.value = currentAccounting.transferSales || 0;
  showModal();
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
  hideModal();
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
  hideModal();
  renderAccounting();
}

/**
 * Guarda la contabilidad actual
 * @returns {void}
 */
function saveAccounting() {
  if (!currentAccounting) return;
  
  const allAccounting = getData("accounting") || [];
  const index = allAccounting.findIndex(a => a.id === currentAccounting.id);
  
  if (index >= 0) {
    allAccounting[index] = currentAccounting;
  } else {
    allAccounting.push(currentAccounting);
  }
  
  setData("accounting", allAccounting);
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

