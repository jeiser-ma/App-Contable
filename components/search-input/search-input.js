/**
 * Configura el control de búsqueda
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
function setupSearchInput(moduleName, renderFn) {
  console.log(`Setting up search input`);

  // obtener el estado del modulo
  let moduleState = getModuleState(moduleName);

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

