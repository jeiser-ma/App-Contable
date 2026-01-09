/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupDateFilter(moduleName) {
  // 5. Configurar filtro de fecha
  const dateFilter = document.getElementById("moduleFilterDate");
  if (dateFilter) {
    if (config.hasDateFilter) {
      dateFilter.classList.remove("d-none");

      // Para inventory, establecer fecha de hoy por defecto
      if (moduleName === "inventory") {
        const today = new Date().toISOString().split("T")[0];
        dateFilter.value = today;
        updateModuleState("filterDate", today);
      } else {
        dateFilter.value = "";
      }

      dateFilter.onchange = () => {
        console.log(`Date filter changed: ${dateFilter.value || null}`);
        updateModuleState("filterDate", dateFilter.value || null);
        callModuleRender();
      };
    } else {
      dateFilter.classList.add("d-none");
    }
  }
}
