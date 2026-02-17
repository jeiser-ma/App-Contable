/**
 * Componente Badge - App Contable
 * Badge reutilizable con texto, color y opción de botón cerrar con callback.
 */

const ID_BADGE_TEMPLATE = "badge-template";
const CLASS_BADGE_CONTAINER = "badge-container";
const CLASS_BADGE_LABEL = "badge-label";
const CLASS_BADGE_CLOSE_BTN = "badge-close-btn";

/**
 * Obtiene el template del badge y clona su contenido
 * @returns {DocumentFragment|null} Contenido clonado del template o null
 */
function getBadgeTemplate() {
  const template = document.getElementById(ID_BADGE_TEMPLATE);
  if (!template) {
    console.warn(`Badge: no se encontró el template con id "${ID_BADGE_TEMPLATE}". ¿Está cargado el componente badge?`);
    return null;
  }
  return template.content.cloneNode(true);
}

/**
 * Crea un badge a partir del template
 * @param {Object} options
 * @param {string} options.text - Texto a mostrar en el badge
 * @param {string} [options.colorClass="bg-primary"] - Clase de color Bootstrap (ej. bg-primary, bg-secondary, bg-success)
 * @param {boolean} [options.showCloseButton=true] - Si se muestra el botón de cerrar
 * @param {function} [options.onClose] - Callback al hacer clic en cerrar (opcional)
 * @returns {HTMLElement|null} Elemento del badge o null si no hay template
 */
function createBadge(options) {
  const { text = "", colorClass = "bg-primary", showCloseButton = true, btnCloseWhite = true, onClose } = options ?? {};
  const fragment = getBadgeTemplate();
  if (!fragment) return null;

  const badge = fragment.querySelector(`.${CLASS_BADGE_CONTAINER}`);
  if (!badge) return null;

  const label = badge.querySelector(`.${CLASS_BADGE_LABEL}`);
  const closeBtn = badge.querySelector(`.${CLASS_BADGE_CLOSE_BTN}`);

  if (label) label.textContent = text;
  colorClass.split(/\s+/).filter(Boolean).forEach((c) => badge.classList.add(c));

  if (closeBtn) {
    if (!showCloseButton) {
      closeBtn.remove();
    } else if (typeof onClose === "function") {
      if (!btnCloseWhite) closeBtn.classList.remove("btn-close-white");
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        onClose();
      });
    }
  }

  return badge;
}
