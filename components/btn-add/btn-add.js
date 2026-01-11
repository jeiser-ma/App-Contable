/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupBtnAdd(moduleName) {
  // 3. Configurar botón de acción (agregar) - solo si existe
  const actionButtonsContainer = document.getElementById("moduleActionButtons");
  if (actionButtonsContainer) {
    actionButtonsContainer.innerHTML = "";

    if (config.addButtonId && config.openModalFunction) {
      const button = document.createElement("button");
      button.id = config.addButtonId;
      button.innerHTML = '<i class="bi bi-plus fs-5"></i>';
      button.className =
        "btn btn-primary rounded-circle d-flex align-items-center justify-content-center";
      button.setAttribute("style", "width: 40px; height: 40px");
      button.setAttribute("title", config.addButtonTitle);
      button.onclick = () => {
        const openModalFn = window[config.openModalFunction];
        if (openModalFn && typeof openModalFn === "function") {
          openModalFn();
        }
      };
      actionButtonsContainer.appendChild(button);
    }
  }
}

function initBtnAdd(openModalFn) {
  const btnAdd = document.getElementById(ID_BTN_ADD);
  if (btnAdd) {
    btnAdd.onclick = () => {
      if (openModalFn && typeof openModalFn === "function") {
        openModalFn();
      }
    };
  }
}