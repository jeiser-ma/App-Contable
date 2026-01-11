/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupSearchInput(moduleName) {
  // 1. Configurar buscador
  const searchInput = document.getElementById("moduleSearchInput");
  const btnClearSearch = document.getElementById("moduleClearSearch");

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
}


/**
 * Obtiene el valor del buscador
 * @returns {string}
 */
function getModuleSearchValue() {
  const searchInput = document.getElementById("moduleSearchInput");
  return searchInput ? searchInput.value.toLowerCase().trim() : "";
}

/**
 * Limpia el buscador
 * @returns {void}
 */
function clearModuleSearch() {
  const searchInput = document.getElementById("moduleSearchInput");
  const btnClearSearch = document.getElementById("moduleClearSearch");
  if (searchInput) {
    searchInput.value = "";
    updateModuleState("searchText", "");
    if (btnClearSearch) {
      btnClearSearch.classList.add("d-none");
    }
  }
}
