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
        linkDateAndChipsFilters(moduleName, moduleState, CONTROL_DATE_FILTER);
        // if (moduleName === PAGE_ACCOUNTING) {
        //   clearChipsFilter(moduleName, moduleState);
        // }
        renderFn();
      }
    };
  }
}

/**
 * Enlaza el filtro de fecha con los chips de filtro (hoy | ayer)
 * @param {string} moduleName - Nombre del módulo
 * @param {object} moduleState - Estado del módulo
 * @param {string} controlName - Nombre del control que se activo
 * @returns {void}
 */
function linkDateAndChipsFilters(moduleName, moduleState, controlName) {

  console.warn("linkDateAndChipsFilters>>>>>: " + controlName + " " + moduleName);
  // Validar que sea un modulo con chips de fecha
  if (moduleName === PAGE_ACCOUNTING) {
    
    // obtener el estado del modulo
    // const moduleState = getModuleState(moduleName);
    // if (!moduleState) {
    //   console.error(`Module state not found for module: ${moduleName}`);
    //   return;
    // }

    // Si hay una fecha filtrada, activar el chip correspondiente
    if (controlName === CONTROL_DATE_FILTER && moduleState.filterDate) {
      // primero limpiar los chips filtrados
      clearChipsFilter(moduleName, moduleState);

      // Si la fecha es hoy, activar el chip de hoy
      if (moduleState.filterDate === getToday()) {
        activateChip(PAGES_CONFIG[moduleName].chips.find(chip => chip.value === "today").id, moduleState);
        // Si la fecha es ayer, activar el chip de ayer
      } else if (moduleState.filterDate === getYesterday(getToday())) {
        activateChip(PAGES_CONFIG[moduleName].chips.find(chip => chip.value === "yesterday").id, moduleState);
      }
    }
    
    // Si hay un chip filtrado, actualizar la fecha en el DOM segun la fecha de los chips
    if (controlName === CONTROL_CHIPS_FILTER && moduleState.chipFiltered) {

      // actualizar la fecha en el estado del modulo segun la fecha de los chips
      moduleState.filterDate = moduleState.chipFiltered === "today" ? getToday() : getYesterday(getToday());
      //console.log("moduleState.filterDate: " + moduleState.filterDate);
  
      // actualizar el campo de fecha en el DOM segun la fecha de los chips
      const dateFilter = document.getElementById(ID_CONTROL_DATE_FILTER);
      if (dateFilter) {
        dateFilter.value = moduleState.filterDate;
      }
    }

    
  }
}

