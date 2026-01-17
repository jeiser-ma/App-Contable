/**
 * Crea y configura los chips de filtro para el módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
async function setupChipsFilter(moduleName, moduleState, renderFn) {
  // Obtener el elemento <template> del DOM
  const template = await getChipTemplate();
  console.log("chips filter template obtenido correctamente");

  // Obtener el contenedor de chips
  const container = document.getElementById(ID_CONTAINER_CHIPS_FILTER);
  console.log("container obtenido correctamente: ", container.id);
  if (!container) {
    console.error(
      `No se encontró el contenedor de chips con id: ${ID_CONTAINER_CHIPS_FILTER}`
    );
    return;
  }
  // Limpiar el contenedor de chips
  container.replaceChildren();

  // Obtener la lista de chips configurados para el módulo
  const chipList = PAGES_CONFIG[moduleName].chips;
  console.log("chipList obtenida correctamente: ", chipList.length + " chips");

  // Si no hay chips configurados, salir
  if (!chipList || chipList.length === 0) {
    console.warn(`No hay chips configurados para el módulo: ${moduleName}`);
    return;
  }

  // Crear los chips configurados para el módulo
  chipList.forEach(async (chipConfig) => {
    console.log("chipConfig obtenida correctamente: ", chipConfig.id);
    // Crear el chip desde el template
    const clonedTemplate = template.cloneNode(true);
    const chip = await createChipFromTemplate(clonedTemplate, chipConfig);
    console.log("chip creado correctamente: ", chip.id);
    if (!chip) {
      console.error(`No se pudo crear el chip con id: ${chipConfig.id}`);
      return;
    }

    // Configurar el handler del chip
    setupChipHandler(chip, moduleName, moduleState, renderFn);

    // Agregar el chip al contenedor de chips
    container.appendChild(chip);
  });

}

/**
 * Configura el handler del chip
 * @param {HTMLElement} chip - Chip a configurar
 * @param {string} moduleName - Nombre del módulo
 * @param {object} moduleState - Estado del módulo
 * @param {function} renderFn - Función para renderizar la lista
 * @returns {void}
 */
async function setupChipHandler(chip, moduleName, moduleState, renderFn) {
  // Configurar el handler del chip (onclick)
  chip.onclick = () => {
    if (renderFn && typeof renderFn === "function") {
      console.log(`Chip clicked: ${chip.id}, value: ${chip.value}`);

      // Obtener el valor actual del estado del módulo
      const currentValue = moduleState.chipFiltered;
      console.log("chipFiltered current value: ", currentValue);

      // Si el valor actual es igual al valor del chip, desactivar el filtro
      if (currentValue === chip.value) {
        // Desactivar el filtro
        console.log(`Deactivating filter: ${chip.value}`);
        moduleState.chipFiltered = null;
        chip.classList.remove("active");
      } else {
        // Activar el filtro
        activateChip(chip.id, moduleState);

        // Desactivar otros chips del mismo grupo
        console.log("chip list: ", PAGES_CONFIG[moduleName].chips);
        deactivateOtherChips(chip.id, moduleName);
      }

      // Enlazar el filtro de fecha con los chips de filtro (hoy | ayer)
      linkDateAndChipsFilters(moduleName, moduleState, CONTROL_CHIPS_FILTER);

      // Llamar a la función de render del módulo para actualizar la lista
      renderFn();
    }
  };
}



/**
 * Activa el chip que se pasa como parámetro
 * @param {string} chipID - ID del chip activo
 * @param {object} moduleState - Estado del módulo
 * @returns {void}
 */
async function activateChip(chipID, moduleState) {
  console.log(`Activating filter: ${chipID}`);

  const chip = document.getElementById(chipID);
  if (chip) {
    // Establecer el valor del filtro en el estado del módulo
    moduleState.chipFiltered = chip.value;
    // Agregar clase active al botón del chip
    chip.classList.add("active");
  }
}


/**
 * Desactiva todos los chips excepto el que se pasa como parámetro
 * @param {string} activeChipID - ID del chip activo
 * @param {string} moduleName - Nombre del módulo
 * @returns {void}
 */
async function deactivateOtherChips(activeChipID, moduleName) {
  console.log("disableOtherChips called with activeChipID: ", activeChipID);
  PAGES_CONFIG[moduleName].chips.forEach((otherChip) => {

    if (otherChip.id !== activeChipID) {
      console.log("otherChip to deactivate: ", otherChip.id);

      const otherElement = document.getElementById(otherChip.id);
      if (otherElement) otherElement.classList.remove("active");
    }
  });
}



/**
 * Obtiene el template del chip y clona su contenido (el botón) como elemento DOM
 * @returns {HTMLElement|null} - Elemento DOM del botón clonado o null si no se encuentra
 */
async function getChipTemplate() {
  // Obtener el elemento <template> del DOM
  const templateElement = document.getElementById(
    ID_CONTROL_CHIPS_FILTER_TEMPLATE
  );
  if (!templateElement) {
    console.error(
      `No se encontró el template con id: ${ID_CONTROL_CHIPS_FILTER_TEMPLATE}`
    );
    return null;
  }

  // Clonar el contenido del template (el botón dentro del template)
  // template.content contiene un DocumentFragment con el contenido del template
  const clonedContent = templateElement.content.cloneNode(true);

  // Obtener el botón del contenido clonado usando querySelector
  const button = clonedContent.querySelector(
    `.${CLASS_CONTROL_CHIPS_FILTER_BUTTON}`
  );
  if (!button) {
    console.error(
      `No se encontró el botón con la clase: .${CLASS_CONTROL_CHIPS_FILTER_BUTTON}`
    );
    return null;
  }

  return button;
}

/**
 * Crea un nuevo chip basado en el template con las propiedades especificadas
 * @param {HTMLElement} chipTemplate - Template del chip
 * @param {object} chipConfig - Configuración del chip
 * @param {string} chipConfig.id - ID del botón
 * @param {string} chipConfig.label - Texto del label
 * @param {string} chipConfig.icon - Icono class del chip
 * @param {string} chipConfig.color - Clase de color del botón
 * @param {string} chipConfig.value - Valor del filtro del chip
 * @returns {HTMLElement} - Elemento DOM del chip configurado con las propiedades especificadas o null si hay error
 */
async function createChipFromTemplate(chipTemplate, chipConfig) {
  // Modificar propiedades del botón clonado
  // Configurar el id del botón
  chipTemplate.id = chipConfig.id;

  // Agregar clase adicional al botón para el estilo
  chipTemplate.classList.add(chipConfig.color);

  // Agregar el value del chip al botón
  chipTemplate.value = chipConfig.value;

  // Obtener el label usando querySelector con la clase (ya está dentro del botón clonado)
  const labelElem = chipTemplate.querySelector(
    `.${CLASS_CONTROL_CHIPS_FILTER_LABEL}`
  );
  if (!labelElem) {
    console.error(
      `No se encontró el label con clase .${CLASS_CONTROL_CHIPS_FILTER_LABEL} en el template`
    );
    return null;
  }
  // Configurar el label
  labelElem.textContent = chipConfig.label;

  // Obtener el icono usando querySelector con la clase (ya está dentro del botón clonado)
  const iconElem = chipTemplate.querySelector(
    `.${CLASS_CONTROL_CHIPS_FILTER_ICON}`
  );
  if (!iconElem) {
    console.error(
      `No se encontró el icono con clase .${CLASS_CONTROL_CHIPS_FILTER_ICON} en el template`
    );
    return null;
  }
  // Agregar la clase del icono al icono
  iconElem.classList.add(chipConfig.icon);

  // Devolver el botón clonado con las configuraciones aplicadas
  return chipTemplate;
}

