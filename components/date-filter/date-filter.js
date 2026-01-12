/**
 * Configura el botón de agregar
 * @param {object} moduleState - Estado del módulo
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
function setupDateFilter(moduleState, renderFn) {
  console.log(`Setting up date filter`);
  const dateFilter = document.getElementById(ID_CONTROL_DATE_FILTER);
  if (dateFilter) {
    console.log(`Date filter found`);

    // Establecer fecha de hoy por defecto
    const today = new Date().toISOString().split("T")[0];
    dateFilter.value = today;
    moduleState.filterDate = today;
    renderFn();

    // Configurar el listener de cambio de fecha
    dateFilter.onchange = () => {
      if (renderFn && typeof renderFn === "function") {
        moduleState.filterDate = dateFilter.value || null;
        console.log(`Date filter changed: ${moduleState.filterDate}`);
        renderFn();
      }
    };
  }
}

///ELIMINAR ESTA FUNCION LUEGO

/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupDateFilter111(moduleName) {
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
