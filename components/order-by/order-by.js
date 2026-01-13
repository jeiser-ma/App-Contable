/**
 * Configura el botón de agregar
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @param {object} moduleState - Estado del módulo
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
function setupOrderBy(moduleName, moduleState, renderFn) {
  console.log(`Setting up order by`);
  // obtener elementos del DOM
  //const sortContainer = document.getElementById(ID_CONTAINER_ORDER_BY_CONTAINER);
  const orderBy = document.getElementById(ID_CONTROL_ORDER_BY);
  const orderDir = document.getElementById(ID_CONTROL_ORDER_DIR);
  const orderDirIcon = document.getElementById(ID_CONTROL_ORDER_DIR_ICON);

  if (orderBy && orderDir && orderDirIcon) {
    console.log(`OrderBy, orderDir and orderDirIcon found`);

    // Limpiar opciones
    orderBy.innerHTML = '<option value="" disabled selected>Ordenar…</option>';

    // Agregar opciones
    let sortOptions = PAGES_CONFIG[moduleName].sortOptions || [];
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        orderBy.appendChild(option);
      });
    }

    // Configurar el listener de cambio de ordenamiento
    orderBy.onchange = () => {
      if (orderBy.value && renderFn && typeof renderFn === "function") {
        console.log(`Order by changed: ${orderBy.value}`);
        // actualizar el estado del módulo
        moduleState.orderBy = orderBy.value;
        // renderizar la lista
        renderFn();
      }
    };

    // Configurar el listener de cambio de dirección de ordenamiento
    orderDir.onclick = () => {
      if (renderFn && typeof renderFn === "function") {
        // actualizar el estado del módulo
        moduleState.orderDir = moduleState.orderDir === "asc" ? "desc" : "asc";
        console.log(`Order dir changed: ${moduleState.orderDir}`);

        // Actualizar icono
        orderDirIcon.classList.toggle(
          "bi-sort-alpha-down",
          moduleState.orderDir === "asc"
        );
        orderDirIcon.classList.toggle(
          "bi-sort-alpha-up",
          moduleState.orderDir === "desc"
        );

        // renderizar la lista
        renderFn();
      }
    };
  }
}

//ELIMINAR ESTA FUNCION LUEGO

/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupOrderBy111(moduleName) {
  // 2. Configurar ordenamiento
  const sortContainer = document.getElementById(
    ID_CONTAINER_ORDER_BY_CONTAINER
  );
  const orderBy = document.getElementById(ID_CONTROL_ORDER_BY);
  const orderDir = document.getElementById(ID_CONTROL_ORDER_DIR);

  if (config.hasSort && config.sortOptions.length > 0) {
    if (sortContainer) sortContainer.classList.remove("d-none");

    if (orderBy) {
      // Limpiar opciones
      orderBy.innerHTML =
        '<option value="" disabled selected>Ordenar…</option>';

      // Agregar opciones
      config.sortOptions.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        orderBy.appendChild(option);
      });

      // Establecer valor inicial del ordenamiento
      const initialState = getModuleState("orderBy");
      if (initialState && orderBy) {
        orderBy.value = initialState;
      }

      // Establecer dirección inicial
      const initialDir = getModuleState("orderDir");
      if (orderDir) {
        orderDir.innerHTML =
          initialDir === "desc"
            ? '<i class="bi bi-sort-alpha-up"></i>'
            : '<i class="bi bi-sort-alpha-down"></i>';
      }

      orderBy.onchange = () => {
        if (orderBy.value) {
          console.log(`Order by changed: ${orderBy.value}`);
          updateModuleState("orderBy", orderBy.value);
          callModuleRender();
        }
      };

      if (orderDir) {
        orderDir.onclick = () => {
          const currentDir = getModuleState("orderDir");
          const newDir = currentDir === "asc" ? "desc" : "asc";
          updateModuleState("orderDir", newDir);

          // Actualizar icono
          orderDir.innerHTML =
            newDir === "asc"
              ? '<i class="bi bi-sort-alpha-down"></i>'
              : '<i class="bi bi-sort-alpha-up"></i>';

          callModuleRender();
        };
      }
    }
  } else {
    if (sortContainer) sortContainer.classList.add("d-none");
  }
}
