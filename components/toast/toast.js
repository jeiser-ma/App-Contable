//#region Constants

const ID_TOAST_CONTAINER = "toast-container";
const ID_TOAST = "toast";
const ID_TOAST_MESSAGE = "toastMessage";
const ID_TOAST_CLOSE = "toastClose";

const DEFAULT_DURATION_SECONDS = 3;

const TOAST_COLORS = { DARK: "dark", PRIMARY: "primary", DANGER: "danger", WARNING: "warning", SUCCESS: "success" };

/** Colores con fondo oscuro: texto blanco y botón X blanco */
const DARK_BG_COLORS = ["dark", "primary", "danger", "success", "secondary", "info"];
/** Clases Bootstrap válidas para fondo (sin prefijo bg-) */
const VALID_BG_COLORS = ["dark", "primary", "danger", "secondary", "warning", "success", "info"];

let toastTimer = null;

//#endregion

/**
 * Aplica las clases de color al toast y al botón cerrar
 * @param {string} color - Nombre del color (dark, primary, danger, etc.)
 * @param {HTMLElement} toastEl - Elemento del toast
 * @param {HTMLElement} closeBtn - Botón de cerrar
 */
function applyToastColors(color, toastEl, closeBtn) {
  if (!toastEl || !closeBtn) return;

  /** Remueve las clases de color de fondo de los colores válidos */
  Object.values(TOAST_COLORS).forEach((c) => {
    toastEl.classList.remove(`bg-${c}`, `bg-${c}-subtle`);
  });
  /** Agrega la clase de color de fondo al toast */
  toastEl.classList.add(`bg-${color}`);
  /** Agrega la clase de opacidad al toast */
  toastEl.classList.add("bg-opacity-75");

  /** Si el color de fondo es claro, agrega la clase de texto dark al toast */
  if (color === TOAST_COLORS.WARNING) {
    /** Agrega la clase de texto blanco al toast */
    toastEl.classList.remove("text-white");
    toastEl.classList.add("text-dark");
    closeBtn.classList.remove("btn-close-white");
  } else {
    toastEl.classList.remove("text-dark");
    toastEl.classList.add("text-white");
    closeBtn.classList.add("btn-close-white");
  }
}

/**
 * Muestra una notificación tipo toast en la parte superior de la pantalla.
 * @param {Object} options
 * @param {string} options.message - Mensaje a mostrar
 * @param {string} [options.color="dark"] - Color de fondo: dark, primary, danger, secondary, warning, success, info
 * @param {number} [options.durationSeconds=3] - Segundos hasta ocultar automáticamente (0 = no ocultar)
 */
function showToast(message, color = TOAST_COLORS.DARK, time = DEFAULT_DURATION_SECONDS) {
  const container = document.getElementById(ID_TOAST_CONTAINER);
  const toastEl = document.getElementById(ID_TOAST);
  const messageEl = document.getElementById(ID_TOAST_MESSAGE);
  const closeBtn = document.getElementById(ID_TOAST_CLOSE);

  if (!container || !toastEl || !messageEl) return;

  // const message = options?.message ?? "";
  // const color = options?.color ?? TOAST_COLORS.DARK;
  // const durationSeconds = options?.durationSeconds ?? DEFAULT_DURATION_SECONDS;

  messageEl.textContent = message;
  applyToastColors(color, toastEl, closeBtn);

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  container.classList.remove("d-none");

  if (time > 0) {
    toastTimer = setTimeout(() => {
      hideToast();
      toastTimer = null;
    }, time * 1000);
  }
}

/**
 * Oculta el toast
 */
function hideToast() {
  const container = document.getElementById(ID_TOAST_CONTAINER);
  if (container) {
    container.classList.add("d-none");
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

// Delegación: el toast se carga después en components-container
document.getElementById(ID_COMPONENTS_CONTAINER)?.addEventListener("click", (e) => {
  if (e.target.id === ID_TOAST_CLOSE) {
    hideToast();
  }
});
