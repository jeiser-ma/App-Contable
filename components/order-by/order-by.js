/**
 * Configura el botón de agregar
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
function setupOrderBy(moduleName, renderFn) {
  console.log(`Setting up order by`);
  // obtener elementos del DOM
  //const sortContainer = document.getElementById(ID_CONTAINER_ORDER_BY_CONTAINER);
  const orderBy = document.getElementById(ID_CONTROL_ORDER_BY);
  const orderDir = document.getElementById(ID_CONTROL_ORDER_DIR);
  const orderDirIcon = document.getElementById(ID_CONTROL_ORDER_DIR_ICON);

  let moduleState = getModuleState(moduleName);


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

