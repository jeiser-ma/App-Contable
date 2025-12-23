
// Estado de la pantalla de productos (unificado)
const UNDO_STATE = {
  data: null,
  type: null,
  buttonListener: null,
  timer: null
};

/**
 * Muestra el snackbar con el texto especificado
 * Activa el event listener del botón undo solo cuando el snackbar está visible
 * @param {string} text - Texto a mostrar en el snackbar
 * @returns {void}
 */
function showSnackbar(text) {
  const bar = document.getElementById("snackbar");
  const btnUndo = document.getElementById("btnUndo");
  
  if (!bar || !btnUndo) return;

  document.getElementById("snackbarText").textContent = text;
  bar.classList.remove("d-none");

  // Agregar event listener solo cuando el snackbar está visible
  if (!UNDO_STATE.buttonListener) {
    UNDO_STATE.buttonListener = () => undoDelete();
    btnUndo.addEventListener("click", UNDO_STATE.buttonListener);
  }

  clearTimeout(UNDO_STATE.timer);
  UNDO_STATE.timer = setTimeout(() => {
    hideSnackbar();
    clearUndoState();
  }, 5000);
}

/**
 * Limpia el estado de deshacer
 * @returns {void}
 */
function clearUndoState() {
  UNDO_STATE.data = null;
  UNDO_STATE.type = null;
}

/**
 * Oculta el snackbar y remueve el event listener del botón undo
 * @returns {void}
 */
function hideSnackbar() {
  const bar = document.getElementById("snackbar");
  const btnUndo = document.getElementById("btnUndo");
  
  if (bar) {
    bar.classList.add("d-none");
  }

  // Remover event listener cuando el snackbar se oculta
  if (btnUndo && UNDO_STATE.buttonListener) {
    btnUndo.removeEventListener("click", UNDO_STATE.buttonListener);
    UNDO_STATE.buttonListener = null;
  }
}

/**
 * Deshace la eliminación de un elemento
 * Restaura el elemento eliminado según su tipo
 * @returns {void}
 */
function undoDelete() {
  if (!UNDO_STATE.data || !UNDO_STATE.type) return;

  const data = getData(UNDO_STATE.type);
  data.push(UNDO_STATE.data);
  setData(UNDO_STATE.type, data);

  // Renderizar según el tipo
  if (UNDO_STATE.type === "products" && typeof renderProducts === "function") {
    renderProducts();
  } else if (UNDO_STATE.type === "movements" && typeof renderMovements === "function") {
    renderMovements();
  } else if (UNDO_STATE.type === "inventory" && typeof renderInventory === "function") {
    renderInventory();
  }

  hideSnackbar(); // Esta función ya remueve el listener
  clearUndoState();
}
