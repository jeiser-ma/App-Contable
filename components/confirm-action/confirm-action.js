//#region Constants

const ID_CONFIRM_ACTION_MODAL = "confirm-action";
const ID_CONFIRM_ACTION_TITLE = "confirmActionTitle";
const ID_CONFIRM_ACTION_TEXT = "confirmActionText";
const ID_BTN_CONFIRM_ACTION = "btnConfirmAction";

/** Clases Bootstrap válidas para el botón de confirmar (ej. btn-primary, btn-danger) */
const CONFIRM_BUTTON_CLASSES = ["btn-primary", "btn-danger", "btn-warning", "btn-success"];

// Estado: callback a ejecutar al confirmar
let confirmCallbackFn = null;

//==============================================
//#region MODAL DE CONFIRMACIÓN DE ACCIÓN
//==============================================

document.getElementById(ID_MODALS_CONTAINER).addEventListener("click", (e) => {
  if (e.target.id === ID_BTN_CONFIRM_ACTION) {
    onConfirmAction();
  }
});

/**
 * Ejecuta el callback de confirmación y cierra el modal
 * @returns {void}
 */
function onConfirmAction() {
  if (typeof confirmCallbackFn === "function") {
    confirmCallbackFn();
    confirmCallbackFn = null;
  }
  hideConfirmActionModal();
}

/**
 * Abre el modal de confirmación de acción (genérico).
 * @param {Object} options
 * @param {string} options.title - Título del modal
 * @param {string} options.message - Mensaje o pregunta a mostrar
 * @param {string} [options.confirmText="Confirmar"] - Texto del botón de confirmar
 * @param {string} [options.confirmButtonClass="btn-primary"] - Clase del botón (ej. "btn-primary", "btn-danger")
 * @param {function} options.callbackFn - Función a ejecutar al hacer clic en confirmar
 */
function openConfirmActionModal(options) {  
  const {
    title = "Confirmar acción",
    message = "",
    confirmText = "Confirmar",
    confirmButtonClass = "btn-primary",
    callbackFn,
  } = options || {};

  confirmCallbackFn = typeof callbackFn === "function" ? callbackFn : null;

  const titleEl = document.getElementById(ID_CONFIRM_ACTION_TITLE);
  const textEl = document.getElementById(ID_CONFIRM_ACTION_TEXT);
  const btnEl = document.getElementById(ID_BTN_CONFIRM_ACTION);

  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = message;
  if (btnEl) {
    btnEl.textContent = confirmText;
    CONFIRM_BUTTON_CLASSES.forEach((c) => btnEl.classList.remove(c));
    btnEl.classList.add(confirmButtonClass.startsWith("btn-") ? confirmButtonClass : "btn-primary");
  }

  new bootstrap.Modal(document.getElementById(ID_CONFIRM_ACTION_MODAL)).show();
}

/**
 * Cierra el modal de confirmación de acción
 * @returns {void}
 */
function hideConfirmActionModal() {
  const modalEl = document.getElementById(ID_CONFIRM_ACTION_MODAL);
  if (!modalEl) return;
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) {
    modal.hide();
  }
}
