


//#region Constants
// IDs containers del layout
const ID_PAGES_CONTAINER = "pages-container";
const ID_MODALS_CONTAINER = "modals-container";

// IDs de elementos del navbar superior
const ID_PAGE_TITLE = "pageTitle";
const ID_MODULE_ICON = "moduleIcon";


//==============================================
//#region PAGES CONFIGS
//==============================================

// Nombres de las páginas / modulos 
const PAGE_HOME = "home";
const PAGE_SETTINGS = "settings";
const PAGE_PRODUCTS = "products";
const PAGE_MOVEMENTS = "movements";
const PAGE_INVENTORY = "inventory";
const PAGE_EXPENSES = "expenses";
const PAGE_ACCOUNTING = "accounting";


// Configuración de las páginas (centralizada)
/**
 * @description: Configuración de las páginas (centralizada)
 * @type {Object} PAGES_CONFIG
 * @property {string} title - Título de la página
 * @property {string} icon - Icono de la página
 * @property {string} navId - ID del elemento de navegación (navbar inferior)
 * @property {boolean} isModule - Indica si la página es un módulo
 * @info: isModule es false para las páginas compartidas y true para los módulos
 */
const PAGES_CONFIG = {
  // Páginas compartidas
  [PAGE_HOME]: {
    title: "Inicio",
    icon: "bi-house-door", // Icono de la página
    navId: "navHome", // ID del elemento de navegación (navbar inferior)
    isModule: false // Página compartida
  },
  // Módulos
  [PAGE_PRODUCTS]: {
    title: "Productos",
    icon: "bi-box",
    navId: "navProducts",
    isModule: true // Módulo
  },
  [PAGE_MOVEMENTS]: {
    title: "Movimientos",
    icon: "bi-arrow-repeat",
    navId: "navMovements",
    isModule: true // Módulo
  },
  [PAGE_EXPENSES]: {
    title: "Gastos",
    icon: "bi-cash-coin",
    navId: "navExpenses",
    isModule: true // Módulo
  },
  [PAGE_INVENTORY]: {
    title: "Inventario",
    icon: "bi-clipboard-data",
    navId: "navInventory",
    isModule: true // Módulo
  },
  [PAGE_ACCOUNTING]: {
    title: "Contabilidad",
    icon: "bi-calculator",
    navId: "navAccounting",
    isModule: true // Módulo
  },
  [PAGE_SETTINGS]: {
    title: "Ajustes",
    icon: "bi-gear",
    navId: "navSettings",
    isModule: false // Página compartida
  }
};

//#endregion



//==============================================
//#region MODALS CONFIGS
//==============================================

// Nombres de los modales compartidos
const MODAL_CONFIRM_DELETE = "confirm-delete";

// Nombres de los modales de los módulos
const MODAL_MOVEMENTS = "movements-modal";
const MODAL_PRODUCTS = "products-modal";
const MODAL_EXPENSES = "expenses-modal";
const MODAL_INVENTORY = "inventory-modal";
const MODAL_CASH_SALES = "cash-sales-modal";
const MODAL_TRANSFER_SALES = "transfer-sales-modal";

/**
 * @description: Configuración de los modales (centralizada)
 * @type {Object} MODALS_CONFIG
 * @property {string} titleAdd - Título del modal de adición
 * @property {string} titleEdit - Título del modal de edición
 * @info: titleAdd y titleEdit son iguales para los modales que no tienen edición
 * @property {string} icon - Icono del modal
 */
const MODALS_CONFIG = {
  // Modales compartidos
  [MODAL_CONFIRM_DELETE]: {
    titleAdd: "Confirmar eliminación",
    titleEdit: "Confirmar eliminación",
    icon: "bi-trash",
  },
  // Modales de los módulos
  [MODAL_PRODUCTS]: {
    titleAdd: "Nuevo producto",
    titleEdit: "Editar producto",
    icon: "bi-box",
  },
  [MODAL_MOVEMENTS]: {
    titleAdd: "Nuevo movimiento",
    titleEdit: "Editar movimiento",
    icon: "bi-arrow-repeat",
  },
  [MODAL_EXPENSES]: {
    titleAdd: "Nuevo gasto",
    titleEdit: "Editar gasto",
    icon: "bi-cash-coin",
  },
  [MODAL_INVENTORY]: {
    titleAdd: "Conteo de inventario",
    titleEdit: "Conteo de inventario",
    icon: "bi-clipboard-plus",
  },
  [MODAL_CASH_SALES]: {
    titleAdd: "Ventas en efectivo",
    titleEdit: "Ventas en efectivo",
    icon: "bi-cash",
  },
  [MODAL_TRANSFER_SALES]: {
    titleAdd: "Ventas por transferencia",
    titleEdit: "Ventas por transferencia",
    icon: "bi-credit-card",
  },
};

//#endregion
