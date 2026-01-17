/**
 * Configura el botón de agregar
 * @param {object} moduleState - Estado del módulo
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
function setupDateFilter(moduleName, moduleState, renderFn) {
  console.log(`Setting up date filter`);

  // obtener elementos del DOM
  const dateFilter = document.getElementById(ID_CONTROL_DATE_FILTER);

  if (dateFilter) {
    console.log(`Date filter found`);

    // Establecer fecha de hoy por defecto
    const today = getToday();
    dateFilter.value = today;
    moduleState.filterDate = today;
    renderFn();

    // Configurar el listener de cambio de fecha
    dateFilter.onchange = () => {
      if (renderFn && typeof renderFn === "function") {
        moduleState.filterDate = dateFilter.value || null;
        console.log(`Date filter changed: ${moduleState.filterDate}`);
        if (moduleName === PAGE_ACCOUNTING) {
          clearChipsFilter(moduleName, moduleState);
        }
        renderFn();
      }
    };
  }
}

