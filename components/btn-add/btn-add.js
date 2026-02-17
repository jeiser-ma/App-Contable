

/**
 * Configura el botón de agregar
 * @param {function} openModalFn - Función para abrir el modal
 * @returns {void}
 */
function setupBtnAdd(openModalFn) {
  const btnAdd = document.getElementById(ID_CONTROL_BTN_ADD);
  if (btnAdd) {
    btnAdd.onclick = () => {
      if (openModalFn && typeof openModalFn === "function") {
        openModalFn();
      }
    };
  }
}

