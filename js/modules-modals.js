//#region Constants


// Estado global para el modal activo
let modalActive = null;


//==============================================
//#region MODAL ACTIVO
//==============================================

/**
 * Inicializa el modalActive, creando un nuevo modal de tipo modalId
 * @param {string} modalId - ID del modal a inicializar
 * @returns {void}
 */
function initModalModule(modalId) {
  modalActive = null;
  const modalElem = document.getElementById(modalId);
  if (!modalElem) {
    console.warn("No se encontró el elemento "+modalId+" en el DOM");
    return;
  }
  
  modalActive = new bootstrap.Modal(modalElem);
  console.log(modalId+" modal inicializado correctamente");
}

/**
 * Muestra el modal activo
 * @returns {void}
 */
function showModalModules() {
  modalActive.show();
}

/**
 * Oculta el modal activo
 * @returns {void}
 */
function hideModalModules() {
  modalActive.hide();
}

/**
 * Cambia de estado (abierto/cerrado) del modal, si está cerrado lo abre y si está abierto lo cierra 
 * @returns {void}
 */
function toggleModalModules() {
  modalActive.toggle();
}
