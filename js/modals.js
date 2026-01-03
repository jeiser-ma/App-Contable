//#region Constants
const MODAL_ID = "modals";
const MODAL_ID_MOVEMENT = "movementModal";
const MODAL_ID_PRODUCT = "productModal";
const MODAL_ID_CONFIRM_DELETE = "confirmDeleteModal";

// Estado global para el modal activo
let modalActive = null;

// Estado global para el modal de confirmación de eliminación
const DELETE_STATE = {
  type: null, // Tipo de elemento a eliminar ("product" | "movement" | etc.)
  id: null,   // ID del elemento a eliminar
};

//==============================================
//#region LOADERS
//==============================================

/**
 * Carga un modal HTML y lo inserta en el body del documento
 * Busca primero en modules/{module}/modals/ si es un modal de módulo,
 * sino busca en shared/pages/modals/ para modales compartidos
 * @param {string} name - Nombre del modal a cargar (ej: "product-modal", "confirm-delete")
 * @param {string} module - Opcional: nombre del módulo si es un modal específico
 */
function loadModal(name, module = null) {
  // Determinar la ruta según si es modal de módulo o compartido
  let path;
  
  if (module) {
    // Modal específico de un módulo
    path = `modules/${module}/modals/${name}.html`;
  } else {
    // Modal compartido (confirm-delete, etc.)
    path = `components/modals/${name}.html`;
  }
  
  return fetch(path)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`No se pudo cargar el modal ${name} desde ${path}`);
      }
      return r.text();
    })
    .then((html) => {
      document.getElementById("modals").insertAdjacentHTML("beforeend", html);
      console.log(`${name} loaded from ${path}`);
    })
    .catch((error) => {
      console.error(`Error cargando modal ${name}:`, error);
      throw error;
    });
}

/**
 * Carga un componente HTML y lo inserta en el body del documento
 * Los componentes siempre están en shared/pages/components/
 * @param {string} name - Nombre del componente a cargar
 */
function loadComponent(name) {
  return fetch(`components/${name}/${name}.html`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`No se pudo cargar el componente ${name}`);
      }
      return r.text();
    })
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
      console.log(`Component ${name} loaded`);
    })
    .catch((error) => {
      console.error(`Error cargando componente ${name}:`, error);
      throw error;
    });
}


//==============================================
//#region MODAL ACTIVO
//==============================================

/**
 * Inicializa el modalActive, creando un nuevo modal de tipo modalId
 * @param {string} modalId - ID del modal a inicializar
 * @returns {void}
 */
function initModal(modalId) {
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
function showModal() {
  modalActive.show();
}

/**
 * Oculta el modal activo
 * @returns {void}
 */
function hideModal() {
  modalActive.hide();
}

/**
 * Cambia de estado (abierto/cerrado) del modal, si está cerrado lo abre y si está abierto lo cierra 
 * @returns {void}
 */
function toggleModal() {
  modalActive.toggle();
}

//==============================================
//#region MODAL DE CONFIRMACION DE ELIMINACION
//==============================================

/**
 * Event listener para el modal de confirmación de eliminación
 * Confirma la eliminación del elemento según su tipo cuando se hace clic en el botón de confirmación
 * @returns {void}
 */
document.getElementById("modals").addEventListener("click", (e) => {
  if (e.target.id === "btnConfirmDelete") {
    confirmDelete();
  }
});

/**
 * Función genérica que confirma la eliminación según el tipo de elemento
 * Llama a la función específica de confirmación según el tipo de elemento DELETE_STATE.type
 * @returns {void}
 */
function confirmDelete() {
  if (!DELETE_STATE.type || !DELETE_STATE.id) {
    console.warn("No hay elemento configurado para eliminar");
    return;
  }

  // Llama a la función específica según el tipo
  // Manejar casos especiales: "unit" -> "Unit", "concept" -> "Concept"
  let functionName = DELETE_STATE.type.charAt(0).toUpperCase() + DELETE_STATE.type.slice(1);
  const confirmFunction = window[`confirmDelete${functionName}`];
  
  if (confirmFunction && typeof confirmFunction === "function") {
    confirmFunction();
  } else {
    console.error(`No se encontró la función confirmDelete${functionName}`);
  }
}

/**
 * Abre el modal de confirmación de eliminación de forma genérica
 * @param {string} type - Tipo de elemento a eliminar ("product", "movement", etc.)
 * @param {string} id - ID del elemento a eliminar
 * @param {string} name - Nombre del elemento a mostrar en el mensaje
 */
function openConfirmDeleteModal(type, id, name) {
  DELETE_STATE.type = type;
  DELETE_STATE.id = id;

  document.getElementById("confirmDeleteText").textContent = `¿Desea eliminar "${name}"?`;

  new bootstrap.Modal(document.getElementById(MODAL_ID_CONFIRM_DELETE)).show();
}

/**
 * Oculta el modal de confirmación de eliminación
 * @returns {void}
 */
function hideConfirmModal() {
  const modal = bootstrap.Modal.getInstance(document.getElementById(MODAL_ID_CONFIRM_DELETE));
  if (modal) {
    modal.hide();
  }
}

