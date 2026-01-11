


//#region Constants
// IDs containers del layout
const ID_PAGES_CONTAINER = "pages-container";
const ID_MODALS_CONTAINER = "modals-container";
const ID_COMPONENTS_CONTAINER = "components-container";


// IDs de elementos del navbar superior
const ID_PAGE_TITLE = "pageTitle";
const ID_MODULE_ICON = "moduleIcon";
const ID_BTN_LOGOUT = "btnLogout";
const ID_BTN_CONTEXT_MENU = "btnContextMenu";


// IDs de elementos del navbar inferior
const ID_NAV_HOME = "navHome";
const ID_NAV_ADD = "navAdd";
const ID_NAV_ACCOUNTING = "navAccounting";

//#endregion


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
 * @property {string|null} navId - ID del elemento de navegación (navbar inferior) o null si no tiene navegación
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
    navId: null,
    isModule: true // Módulo
  },
  [PAGE_MOVEMENTS]: {
    title: "Movimientos",
    icon: "bi-arrow-repeat",
    navId: null,
    isModule: true // Módulo
  },
  [PAGE_EXPENSES]: {
    title: "Gastos",
    icon: "bi-cash-coin",
    navId: null,
    isModule: true // Módulo
  },
  [PAGE_INVENTORY]: {
    title: "Inventario",
    icon: "bi-clipboard-data",
    navId: null,
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
    navId: null,
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




//==============================================
//#region FLOATING CARDS CONFIGS
//==============================================

//floating cards ids
const ID_FLOATING_CARDS = "floatingCards";
const ID_FLOATING_CARD_PRODUCT = "floatingCardProduct";
const ID_FLOATING_CARD_MOVEMENT = "floatingCardMovement";
const ID_FLOATING_CARD_EXPENSE = "floatingCardExpense";
const ID_FLOATING_CARD_INVENTORY = "floatingCardInventory";

/**
 * Configuración de las cards flotantes
 * @type {Array<Object>} FLOATING_CARDS_CONFIG
 * @property {string} cardId - ID del elemento HTML de la card
 * @property {string} page - Nombre de la página a cargar
 * @property {string|null} openModalFunction - Nombre de la función para abrir el modal (null si no tiene modal)
 */
const FLOATING_CARDS_CONFIG = [
  {
    cardId: ID_FLOATING_CARD_PRODUCT,
    page: PAGE_PRODUCTS,
    openModalFunction: "openAddProductModal"
  },
  {
    cardId: ID_FLOATING_CARD_MOVEMENT,
    page: PAGE_MOVEMENTS,
    openModalFunction: "openAddMovementModal"
  },
  {
    cardId: ID_FLOATING_CARD_EXPENSE,
    page: PAGE_EXPENSES,
    openModalFunction: "openAddExpenseModal"
  },
  {
    cardId: ID_FLOATING_CARD_INVENTORY,
    page: PAGE_INVENTORY,
    openModalFunction: null // Inventory no abre modal al hacer clic en la card
  }
];

//#endregion





//==============================================
//#region CONTEXT MENU CONFIGS
//==============================================  

//context menu options ids
const ID_CONTEXT_MENU_PRODUCTS = "contextMenuProducts";
const ID_CONTEXT_MENU_MOVEMENTS = "contextMenuMovements";
const ID_CONTEXT_MENU_EXPENSES = "contextMenuExpenses";
const ID_CONTEXT_MENU_INVENTORY = "contextMenuInventory";
const ID_CONTEXT_MENU_SETTINGS = "contextMenuSettings";

/**
 * Configuración del menú contextual
 * @type {Array<Object>} CONTEXT_MENU_CONFIG
 * @property {string} menuId - ID del elemento HTML del menú
 * @property {string} page - Nombre de la página a cargar
 */
const CONTEXT_MENU_CONFIG = [
  {
    menuId: ID_CONTEXT_MENU_PRODUCTS,
    page: PAGE_PRODUCTS
  },
  {
    menuId: ID_CONTEXT_MENU_MOVEMENTS,
    page: PAGE_MOVEMENTS
  },
  {
    menuId: ID_CONTEXT_MENU_EXPENSES,
    page: PAGE_EXPENSES
  },
  {
    menuId: ID_CONTEXT_MENU_INVENTORY,
    page: PAGE_INVENTORY
  },
  {
    menuId: ID_CONTEXT_MENU_SETTINGS,
    page: PAGE_SETTINGS
  }
];

//#endregion






//==============================================
//#region MODULES CONTROLS CONFIGS
//==============================================  

// IDs modules controls
const ID_MODULE_CONTROLS = "moduleControls";
const ID_CONTAINER_SEARCH_INPUT_BTN_ADD = "container-searchInput-btnAdd";
const ID_CONTAINER_DATE_FILTER_ORDER_BY = "container-dateFilter-orderBy";
const ID_CONTAINER_CHIPS_FILTER = "container-chipsFilter";
const ID_CONTAINER_LIST_COUNTER_BTN_CLEAR_FILTERS = "container-listCounter-btnClearFilters";

const ID_CONTAINER_SEARCH_INPUT = "container-searchInput";
const ID_CONTAINER_BTN_ADD = "container-btnAdd";

const ID_CONTAINER_DATE_FILTER = "container-dateFilter";
const ID_CONTAINER_ORDER_BY = "container-orderBy";
const ID_CONTAINER_ORDER_DIR = "container-orderDir";
const ID_CONTAINER_FILTER_DATE = "container-filterDate";
const ID_CONTAINER_FILTER_TYPE = "container-filterType";
const ID_CONTAINER_FILTER_PRODUCT = "container-filterProduct";
const ID_CONTAINER_FILTER_QUANTITY = "container-filterQuantity";

//#endregion