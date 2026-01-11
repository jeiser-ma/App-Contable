
/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupListCounter(moduleName) {

}


/**
 * Actualiza el contador del módulo desde los datos
 * @returns {void}
 */
function updateModuleCounterFromData() {
    if (!currentModule) return;
    const config = MODULES_CONFIG[currentModule];
    if (!config) return;
    
    const counter = document.getElementById("moduleCounter");
    if (!counter) return;
  
    // Obtener datos según el módulo
    let data = [];
    if (currentModule === "products") {
      data = getData("products") || [];
    } else if (currentModule === "movements") {
      data = getData("movements") || [];
    } else if (currentModule === "inventory") {
      data = getData("inventory") || [];
    } else if (currentModule === "expenses") {
      data = getData("expenses") || [];
    }
  
    // Por ahora mostrar total, luego se actualizará con el render
    counter.textContent = `0 de ${data.length} ${config.counterLabel}`;
  }

  
/**
 * Actualiza el contador del módulo
 * @param {number} current - Cantidad actual
 * @param {number} total - Cantidad total
 * @returns {void}
 */
function updateListCounter(current, total) {
  if (!currentModule) return;
  const config = MODULES_CONFIG[currentModule];
  if (!config) return;
  
  const counter = document.getElementById("moduleCounter");
  if (counter) {
    counter.textContent = `${current} de ${total} ${config.counterLabel}`;
  }
}
