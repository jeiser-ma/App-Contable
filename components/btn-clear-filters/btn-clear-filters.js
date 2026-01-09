/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupBtnClearFilters(moduleName) {
  // 6. Configurar botón limpiar filtros (siempre visible, limpia todo)
  const btnClearFilters = document.getElementById("moduleClearFilters");
  if (btnClearFilters) {
    btnClearFilters.onclick = () => {
      // Limpiar buscador
      if (searchInput) {
        searchInput.value = "";
        updateModuleState("searchText", "");
        if (btnClearSearch) btnClearSearch.classList.add("d-none");
      }

      // Limpiar ordenamiento (si existe)
      if (config.hasSort && orderBy) {
        orderBy.value = "";
        updateModuleState("orderBy", config.sortOptions[0]?.value || "name");
        updateModuleState("orderDir", "asc");
        if (orderDir) {
          orderDir.innerHTML = '<i class="bi bi-sort-alpha-down"></i>';
        }
      }

      // Limpiar chips (si existen)
      if (config.hasChips) {
        config.chips.forEach((chip) => {
          updateModuleState(chip.filterKey, null);
          const chipElement = document.getElementById(chip.id);
          if (chipElement) {
            chipElement.classList.remove("active");
          }
        });
      } else {
        // Si no hay chips, asegurarse de que todos estén ocultos
        [
          filterIn,
          filterOut,
          filterWarehouse,
          filterStore,
          filterLowStock,
          filterCriticalStock,
        ].forEach((chip) => {
          if (chip) {
            chip.classList.add("d-none");
            chip.classList.remove("active");
          }
        });
      }

      // Limpiar filtro de fecha (si existe)
      if (config.hasDateFilter && dateFilter) {
        dateFilter.value = "";
        updateModuleState("filterDate", null);
      }

      callModuleRender();
    };
  }
}
