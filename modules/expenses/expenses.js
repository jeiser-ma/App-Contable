//#region Constants
// IDs de botones y elementos
const BTN_ID_ADD_EXPENSE = "btnAddExpense";
const BTN_ID_CONFIRM_EXPENSE = "btnConfirmExpense";

const ID_EXPENSES_LIST = "expensesList";
const ID_EXPENSE_CARD_TEMPLATE = "expenseCardTemplate";

const ID_EXPENSE_CONCEPT = "expenseConcept";
const ID_EXPENSE_AMOUNT = "expenseAmount";
const ID_EXPENSE_DATE = "expenseDate";
const ID_EXPENSE_NOTE = "expenseNote";

const ID_EXPENSE_TITLE = "expenseTitle";
const ID_EXPENSE_ICON = "expenseIcon";
//#endregion

// Estado de la pantalla de gastos (unificado)
const EXPENSES_STATE = {
  searchText: "",
  filterDate: null,
  orderBy: "date",
  orderDir: "desc",
  expenseToEdit: null,
};

// Exponer el estado globalmente para module-controls.js
window.EXPENSES_STATE = EXPENSES_STATE;

/**
 * Hook que llama el router cuando se carga la página de gastos
 * @returns {void}
 */
async function onExpensesPageLoaded() {
  console.log("onExpensesPageLoaded execution");

  // Cargar modal de gastos
  console.log("Loading expense-modal");
  await loadModal(MODAL_EXPENSES, PAGE_EXPENSES);

  // Inicializar el modal después de cargarlo
  initModalModule(MODAL_EXPENSES);

  
  // Configurar controles del módulo (buscador, ordenamiento, fecha, botón agregar)
  await setupExpensesControls(); 

  // Configurar botón de confirmar del modal
  const btnConfirm = document.getElementById(BTN_ID_CONFIRM_EXPENSE);
  if (btnConfirm) {
    btnConfirm.onclick = saveExpenseFromModal;
  }

  // Renderizar la lista de gastos
  renderExpenses();
}


/**
 * Configura los controles del módulo de gastos
 * @param {string} pageName - Nombre de la página
 * @returns {void}
 */
async function setupExpensesControls() {
  // Limpiar el contenido de los controles del módulo
  clearModuleControlsContent();

  // Mostrar los controles del módulo
  showModuleControls();


  // Cargar el control de botón de agregar
  await loadModuleControl(CONTROL_BTN_ADD);
  // Configurar el botón de agregar
  setupBtnAdd(openAddExpenseModal);


  // Cargar el control de filtro de fecha
  await loadModuleControl(CONTROL_DATE_FILTER);
  // Configurar el filtro de fecha
  setupDateFilter(EXPENSES_STATE, renderExpenses);
  
  
  // Cargar el control de contador de elementos
  await loadModuleControl(CONTROL_LIST_COUNTER);
  // No es necesario configurarle comportamiento, 
  // se actualizará automáticamente al renderizar la lista
  
  
  
}



/**
 * Abre el formulario para nuevo gasto
 * @returns {void}
 */
function openAddExpenseModal() {
  EXPENSES_STATE.expenseToEdit = null;

  initModalModule(MODAL_EXPENSES);

  const title = document.getElementById(ID_EXPENSE_TITLE);
  const icon = document.getElementById(ID_EXPENSE_ICON);
  const conceptInput = document.getElementById(ID_EXPENSE_CONCEPT);
  const amountInput = document.getElementById(ID_EXPENSE_AMOUNT);
  const dateInput = document.getElementById(ID_EXPENSE_DATE);
  const noteInput = document.getElementById(ID_EXPENSE_NOTE);

  if (!title || !icon || !conceptInput || !amountInput || !dateInput) {
    console.error("No se encontraron los elementos del modal de gastos");
    return;
  }

  title.textContent = "Nuevo gasto";
  icon.className = "bi bi-cash-coin text-danger";

  // Cargar conceptos de gastos en el select
  loadExpenseConceptsIntoSelect();

  // Limpiar formulario
  conceptInput.value = "";
  amountInput.value = "";
  dateInput.value = new Date().toISOString().split("T")[0];
  if (noteInput) noteInput.value = "";

  clearExpenseErrors();

  showModalModules();
}

/**
 * Limpia los errores de validación del formulario de gastos
 * @returns {void}
 */
function clearExpenseErrors() {
  [ID_EXPENSE_CONCEPT, ID_EXPENSE_AMOUNT, ID_EXPENSE_DATE].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.classList.remove("is-invalid");
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
      feedback.textContent = "";
    }
  });
}

/**
 * Guarda un gasto desde el modal (crear o editar)
 * @returns {void}
 */
function saveExpenseFromModal() {
  const conceptInput = document.getElementById(ID_EXPENSE_CONCEPT);
  const amountInput = document.getElementById(ID_EXPENSE_AMOUNT);
  const dateInput = document.getElementById(ID_EXPENSE_DATE);
  const noteInput = document.getElementById(ID_EXPENSE_NOTE);

  if (!conceptInput || !amountInput || !dateInput) {
    console.error("No se encontraron los campos del formulario de gastos");
    return;
  }

  clearExpenseErrors();

  const concept = conceptInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const note = noteInput ? noteInput.value.trim() : "";

  if (!concept) {
    conceptInput.classList.add("is-invalid");
    const fb = conceptInput.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback")) {
      fb.textContent = "Seleccioná un concepto";
    }
    return;
  }

  if (!amount || amount <= 0) {
    amountInput.classList.add("is-invalid");
    const fb = amountInput.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback")) {
      fb.textContent = "Ingresá una cantidad válida";
    }
    return;
  }

  if (!date) {
    dateInput.classList.add("is-invalid");
    const fb = dateInput.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback")) {
      fb.textContent = "Seleccioná una fecha";
    }
    return;
  }

  const expenses = getData("expenses") || [];

  if (EXPENSES_STATE.expenseToEdit) {
    // Editar
    const idx = expenses.findIndex((e) => e.id === EXPENSES_STATE.expenseToEdit);
    if (idx === -1) return;

    expenses[idx] = {
      ...expenses[idx],
      concept,
      amount,
      date,
      note,
    };
  } else {
    // Crear
    const newExpense = {
      id: crypto.randomUUID(),
      concept,
      amount,
      date,
      note,
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
  }

  setData("expenses", expenses);
  hideModalModules();
  renderExpenses();
}

/**
 * Abre el modal para editar un gasto existente
 * @param {string} id - ID del gasto a editar
 * @returns {void}
 */
function openEditExpenseModal(id) {
  const expenses = getData("expenses") || [];
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;

  EXPENSES_STATE.expenseToEdit = id;

  initModalModule(MODAL_EXPENSES);

  const title = document.getElementById(ID_EXPENSE_TITLE);
  const icon = document.getElementById(ID_EXPENSE_ICON);
  const conceptInput = document.getElementById(ID_EXPENSE_CONCEPT);
  const amountInput = document.getElementById(ID_EXPENSE_AMOUNT);
  const dateInput = document.getElementById(ID_EXPENSE_DATE);
  const noteInput = document.getElementById(ID_EXPENSE_NOTE);

  if (!title || !icon || !conceptInput || !amountInput || !dateInput) {
    console.error("No se encontraron los elementos del modal de gastos");
    return;
  }

  title.textContent = "Editar gasto";
  icon.className = "bi bi-cash-coin text-danger";

  // Cargar conceptos de gastos en el select y seleccionar el del gasto
  loadExpenseConceptsIntoSelect();
  if (conceptInput && expense.concept) {
    conceptInput.value = expense.concept;
  }

  amountInput.value = expense.amount;
  dateInput.value = expense.date;
  if (noteInput) noteInput.value = expense.note || "";

  clearExpenseErrors();

  showModalModules();
}

/**
 * Carga los conceptos de gastos en el select del modal
 * @returns {void}
 */
function loadExpenseConceptsIntoSelect() {
  const select = document.getElementById(ID_EXPENSE_CONCEPT);
  if (!select) return;
  
  // Limpiar opciones existentes (excepto la primera)
  const firstOption = select.querySelector('option[value=""]');
  select.innerHTML = "";
  if (firstOption) {
    select.appendChild(firstOption);
  } else {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccioná un concepto...";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
  }
  
  // Obtener conceptos de gastos
  const concepts = getExpenseConcepts();
  
  // Agregar opciones
  concepts.forEach(concept => {
    const option = document.createElement("option");
    option.value = concept;
    option.textContent = concept;
    select.appendChild(option);
  });
}

/**
 * Abre el modal de confirmación para eliminar un gasto
 * @param {string} id - ID del gasto a eliminar
 * @returns {void}
 */
function openDeleteExpenseModal(id) {
  const expenses = getData("expenses") || [];
  const expense = expenses.find((e) => e.id === id);
  if (!expense) return;

  DELETE_STATE.type = "expense";
  DELETE_STATE.id = id;

  openConfirmDeleteModal("expense", id, expense.concept);
}

/**
 * Confirma la eliminación de un gasto
 * @returns {void}
 */
function confirmDeleteExpense() {
  if (!DELETE_STATE.id) return;

  const expenses = getData("expenses") || [];
  const deleted = expenses.find((e) => e.id === DELETE_STATE.id);
  if (!deleted) return;

  // Guardar estado para undo
  UNDO_STATE.data = deleted;
  UNDO_STATE.type = "expenses";

  const updated = expenses.filter((e) => e.id !== DELETE_STATE.id);
  setData("expenses", updated);

  DELETE_STATE.type = null;
  DELETE_STATE.id = null;

  // Cerrar modal de confirmación reutilizable
  hideConfirmModal();
  renderExpenses();
  showSnackbar("Gasto eliminado");
}

// ===============================
// Filtrado y Ordenamiento
// ===============================

/**
 * Filtra gastos usando los criterios de EXPENSES_STATE
 * @param {Array} expenses - Lista de gastos a filtrar
 * @returns {Array} Lista de gastos filtrados
 */
function filterExpenses(expenses) {
  let filtered = [...expenses];

  // Filtro por texto de búsqueda (concepto)
  if (EXPENSES_STATE.searchText) {
    const text = EXPENSES_STATE.searchText.toLowerCase();
    filtered = filtered.filter((e) =>
      e.concept.toLowerCase().includes(text)
    );
  }

  // Filtro por fecha
  if (EXPENSES_STATE.filterDate) {
    filtered = filtered.filter((e) => e.date === EXPENSES_STATE.filterDate);
  }

  return filtered;
}

/**
 * Ordena gastos usando los criterios de EXPENSES_STATE
 * @param {Array} expenses - Lista de gastos a ordenar
 * @returns {Array} Lista de gastos ordenados
 */
function sortExpenses(expenses) {
  return [...expenses].sort((a, b) => {
    let v1 = a[EXPENSES_STATE.orderBy];
    let v2 = b[EXPENSES_STATE.orderBy];

    // Para fechas, comparar directamente
    if (EXPENSES_STATE.orderBy === "date") {
      if (v1 < v2) return EXPENSES_STATE.orderDir === "asc" ? -1 : 1;
      if (v1 > v2) return EXPENSES_STATE.orderDir === "asc" ? 1 : -1;
      return 0;
    }

    // Normalizar strings para comparación
    if (typeof v1 === "string") {
      v1 = v1.toLowerCase();
      v2 = v2.toLowerCase();
    }

    if (v1 < v2) return EXPENSES_STATE.orderDir === "asc" ? -1 : 1;
    if (v1 > v2) return EXPENSES_STATE.orderDir === "asc" ? 1 : -1;
    return 0;
  });
}

// ===============================
// Render
// ===============================

/**
 * Renderiza la lista de gastos en el DOM
 * @param {Array} expenses - Lista de gastos a renderizar
 * @returns {void}
 */
function renderExpensesList(expenses) {
  const list = document.getElementById(ID_EXPENSES_LIST);
  const template = document.getElementById(ID_EXPENSE_CARD_TEMPLATE);

  if (!list || !template) return;

  list.innerHTML = "";

  if (expenses.length === 0) {
    list.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-search"></i>
        <p class="mb-0">No se encontraron gastos</p>
      </div>
    `;
    return;
  }

  expenses.forEach((e) => {
    const node = template.content.cloneNode(true);

    const conceptEl = node.querySelector(".expense-concept");
    const metaEl = node.querySelector(".expense-meta");

    if (conceptEl) conceptEl.textContent = e.concept;

    const dateObj = new Date(e.date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (metaEl) {
      metaEl.innerHTML = `<i class="bi bi-calendar"></i> ${formattedDate} • <i class="bi bi-currency-dollar"></i> ${e.amount}`;
    }

    const btnEdit = node.querySelector(".btn-edit-expense");
    const btnDelete = node.querySelector(".btn-delete-expense");
    if (btnEdit) btnEdit.onclick = () => openEditExpenseModal(e.id);
    if (btnDelete) btnDelete.onclick = () => openDeleteExpenseModal(e.id);

    list.appendChild(node);
  });
}

/**
 * Función principal que renderiza los gastos
 * Filtra, ordena y renderiza usando EXPENSES_STATE
 * @returns {void}
 */
function renderExpenses() {
  const allExpenses = getData("expenses") || [];

  const filtered = filterExpenses(allExpenses);
  const sorted = sortExpenses(filtered);

  updateListCounter(sorted.length, allExpenses.length, PAGE_EXPENSES);
  renderExpensesList(sorted);
}


