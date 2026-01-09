/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupOrderBy(moduleName) {
  // 2. Configurar ordenamiento
  const sortContainer = document.getElementById("moduleSortContainer");
  const orderBy = document.getElementById("moduleOrderBy");
  const orderDir = document.getElementById("moduleOrderDir");

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
