/**
 * Configura el control de búsqueda
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @param {object} moduleState - Estado del módulo
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
function setupSearchInput(moduleName, moduleState, renderFn) {
  console.log(`Setting up search input`);
  // obtener elementos del DOM
  const searchInput = document.getElementById(ID_CONTROL_SEARCH_INPUT);
  const btnClearSearch = document.getElementById(ID_CONTROL_CLEAR_SEARCH);

  let config = PAGES_CONFIG[moduleName];
  if (!config) {
    console.error(`Config not found for module: ${moduleName}`);
  }

  if (searchInput && btnClearSearch) {
    console.log(`Search input and btnClearSearch found`);

    if (renderFn && typeof renderFn === "function") {
      console.log(`Render function found`);

      // Limpiar el search input
      searchInput.placeholder = `Buscar ${config.title}...`;
      searchInput.value = "";

      // Configurar el listener de cambio de search input
      searchInput.oninput = () => {
        const value = searchInput.value.toLowerCase().trim();
        console.log(`Search input changed: "${value}"`);
        btnClearSearch.classList.toggle("d-none", !value);
        moduleState.searchText = value;
        renderFn();
      };

      // Configurar el listener del btn clear search
      btnClearSearch.onclick = () => {
        console.log(`Clear search clicked`);
        searchInput.value = "";
        btnClearSearch.classList.add("d-none");
        moduleState.searchText = "";
        renderFn();
      };
    } else {
      console.error("Render function not found!");
    }
  } else {
    console.error("searchInput or btnClearSearch not found!");
  }
}







// ===============================
//eliminar

/**
 * Obtiene el valor del buscador
 * @returns {string}
 */
/*function getModuleSearchValue() {
  const searchInput = document.getElementById(ID_CONTROL_SEARCH_INPUT);
  return searchInput ? searchInput.value.toLowerCase().trim() : "";
}*/

/**
 * Limpia el buscador
 * @returns {void}
 */
/*function clearModuleSearch() {
  const searchInput = document.getElementById(ID_CONTROL_SEARCH_INPUT);
  const btnClearSearch = document.getElementById(ID_CONTROL_CLEAR_SEARCH);
  if (searchInput) {
    searchInput.value = "";
    updateModuleState("searchText", "");
    if (btnClearSearch) {
      btnClearSearch.classList.add("d-none");
    }
  }
}*/


/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
/*function setupSearchInput(moduleName) {
  // 1. Configurar buscador
  const searchInput = document.getElementById(ID_CONTROL_SEARCH_INPUT);
  const btnClearSearch = document.getElementById(ID_CONTROL_CLEAR_SEARCH);

  if (searchInput) {
    searchInput.placeholder = config.searchPlaceholder;
    searchInput.value = "";

    // Remover listeners previos
    searchInput.oninput = null;
    searchInput.removeEventListener("input", searchInput._moduleInputHandler);

    // Crear nuevo handler
    const inputHandler = () => {
      const value = searchInput.value.toLowerCase().trim();
      console.log(`Search input changed: "${value}"`);
      if (btnClearSearch) {
        btnClearSearch.classList.toggle("d-none", !value);
      }
      updateModuleState("searchText", value);
      callModuleRender();
    };

    searchInput._moduleInputHandler = inputHandler;
    searchInput.oninput = inputHandler;

    if (btnClearSearch) {
      btnClearSearch.onclick = null;
      btnClearSearch.removeEventListener(
        "click",
        btnClearSearch._moduleClickHandler
      );

      const clearHandler = () => {
        console.log("Clear search clicked");
        searchInput.value = "";
        btnClearSearch.classList.add("d-none");
        updateModuleState("searchText", "");
        callModuleRender();
      };

      btnClearSearch._moduleClickHandler = clearHandler;
      btnClearSearch.onclick = clearHandler;
    }
  } else {
    console.error("moduleSearchInput not found!");
  }
}*/
