//#region Constants

const ID_EMPTY_STATE_TEMPLATE = "empty-state-template";
const CLASS_EMPTY_STATE_ICON = "empty-state-icon";
const CLASS_EMPTY_STATE_MESSAGE = "empty-state-message";
const CLASS_EMPTY_STATE_BTN_GOTO = "btn-goto";
const CLASS_EMPTY_STATE_BTN_GOTO_TEXT = "btn-goto-text";
const DEFAULT_ICON_CLASS = "bi-search";

//#endregion

/**
 * Crea un nodo DOM de placeholder para listas vacías.
 * Se clona la plantilla cargada con el componente y se parametrizan icono y mensaje.
 * @param {string} message - Mensaje a mostrar (ej: "No se encontraron movimientos")
 * @param {string} iconClass - Clase del icono Bootstrap Icons (ej: "bi-search", "bi-inbox")
 * @returns {DocumentFragment|null} Fragment listo para appendChild en el contenedor de la lista, o null si la plantilla no está cargada
 */
function createEmptyStatePlaceholder(message = "No hay datos para mostrar", iconClass = DEFAULT_ICON_CLASS, gotoText, gotoCallbackFn) {
  const template = document.getElementById(ID_EMPTY_STATE_TEMPLATE);
  if (!template?.content) {
    console.warn("empty-state: plantilla no cargada");
    return null;
  }

  const clone = template.content.cloneNode(true);
  const iconEl = clone.querySelector(`.${CLASS_EMPTY_STATE_ICON}`);
  const messageEl = clone.querySelector(`.${CLASS_EMPTY_STATE_MESSAGE}`);
  const gotoTextEl = clone.querySelector(`.${CLASS_EMPTY_STATE_BTN_GOTO_TEXT}`);
  const gotoEl = clone.querySelector(`.${CLASS_EMPTY_STATE_BTN_GOTO}`);

  if (iconEl) iconEl.classList.add(iconClass);
  if (messageEl) messageEl.textContent = message;
  if (gotoText && gotoEl && gotoTextEl) {
      gotoTextEl.textContent = gotoText;
      gotoEl.classList.remove("d-none");
    let callbackFn = typeof gotoCallbackFn === "function" ? gotoCallbackFn : () => {};
    gotoEl.onclick = callbackFn;
  }

  return clone;
}
