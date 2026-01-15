/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @param {object} moduleState - Estado del módulo
 * @param {function} renderFn - Función de renderización de la lista de elementos
 * @returns {void}
 */
function setupBtnClearFilters(moduleName, moduleState, renderFn) {
  // 6. Configurar botón limpiar filtros (siempre visible, limpia todo)

  let config = PAGES_CONFIG[moduleName];
  if (!config) {
    console.error(`Config not found for module: ${moduleName}`);
  }

  // obtener elementos del DOM
  const btnClearFilters = document.getElementById(ID_CONTROL_BTN_CLEAR_FILTERS);
  if (btnClearFilters) {
    if (renderFn && typeof renderFn === "function") {
      // Configurar el listener del btn clear filters
      btnClearFilters.onclick = () => {
        console.log(`Clear filters clicked`);

        // Limpiar buscador
        const searchInput = document.getElementById(ID_CONTROL_SEARCH_INPUT);
        const btnClearSearch = document.getElementById(ID_CONTROL_CLEAR_SEARCH);
        if (searchInput && btnClearSearch) {
          console.log(
            `Search input and btn clear search found for module: ${moduleName}`
          );
          // Limpiar buscador
          searchInput.value = "";

          // Ocultar botón de limpiar buscador
          btnClearSearch.classList.add("d-none");

          // Actualizar estado del moduleState para el buscador
          moduleState.searchText = "";
        }

        // Limpiar ordenamiento (si existe)
        const orderBy = document.getElementById(ID_CONTROL_ORDER_BY);
        const orderDir = document.getElementById(ID_CONTROL_ORDER_DIR);
        const orderDirIcon = document.getElementById(ID_CONTROL_ORDER_DIR_ICON);
        if (orderBy && orderDir && orderDirIcon) {
          console.log(
            `Order by, order dir and order dir icon found for module: ${moduleName}`
          );
          // Limpiar ordenamiento
          orderBy.value = "";

          // Actualizar icono del ordenamiento
          orderDirIcon.classList.add("bi-sort-alpha-down");
          orderDirIcon.classList.remove("bi-sort-alpha-up");

          // Actualizar estado del moduleState para el ordenamiento
          moduleState.orderBy = config.sortOptions[0]?.value || "";
          moduleState.orderDir = "desc";
        } else {
          console.error(
            `Order by, order dir or order dir icon not found for module: ${moduleName}`
          );
        }

        // Limpiar filtro de fecha (si existe)
        const dateFilter = document.getElementById(ID_CONTROL_DATE_FILTER);
        if (dateFilter) {
          console.log(`Date filter found for module: ${moduleName}`);
          // Limpiar filtro de fecha
          // Establecer fecha de hoy por defecto
          const today = new Date().toISOString().split("T")[0];
          dateFilter.value = today;

          // Actualizar estado del moduleState para el filtro de fecha
          moduleState.filterDate = null;
        } else {
          console.error(`Date filter not found for module: ${moduleName}`);
        }

        // Limpiar chips (si existen)
        const chips = document.querySelectorAll(
          `.${CLASS_CONTROL_CHIPS_FILTER_BUTTON}`
        );
        console.log(`Chips encontrados: ${moduleName}`, chips);
        if (chips && chips.length > 0) {
          console.log(`Chips found for module: ${moduleName}`);
          // Limpiar chips
          chips.forEach((chip) => {
            if (chip) {
              // Remover clase active del chip
              chip.classList.remove("active");
            }
          });

          // Actualizar estado de los chips filtrados
          moduleState.chipFiltered = null;
        } else {
          console.warn(
            `No hay chips configurados para el módulo: ${moduleName}`
          );
        }

        // Llamar a la función de renderizado
        renderFn();
      };
    } else {
      console.error(`Render function not found for module: ${moduleName}`);
    }
  } else {
    console.error(`Btn clear filters not found for module: ${moduleName}`);
  }
}

//eliminar

/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
/*function setupBtnClearFilters(moduleName) {
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
*/
