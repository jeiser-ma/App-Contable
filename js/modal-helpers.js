/**
 * Establece el título e icono del header de un modal según su configuración y el modo (add/edit).
 * Usa MODALS_CONFIG: titleAdd, titleEdit, icon, titleId, iconId, iconExtraClass.
 * @param {string} modalName - Nombre del modal (clave en MODALS_CONFIG: ej. MODAL_PRODUCTS, "products-modal")
 * @param {boolean} [editMode=false] - true = modo edición (titleEdit), false = modo alta (titleAdd)
 */
function setModalHeader(modalName, editMode = false) {
  const config = MODALS_CONFIG?.[modalName];
  if (!config) return;

  const title = editMode ? config.titleEdit : config.titleAdd;
  const iconClass = config.icon.startsWith("bi-") ? config.icon : `bi-${config.icon}`;
  const iconFullClass = `bi ${iconClass} ${config.iconExtraClass ? config.iconExtraClass : ""}`;

  if (config.titleId) {
    const titleEl = document.getElementById(config.titleId);
    if (titleEl) titleEl.textContent = title ?? "";
  }

  if (config.iconId) {
    const iconEl = document.getElementById(config.iconId);
    if (iconEl) iconEl.className = iconFullClass;
  }
}
