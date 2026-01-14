


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
    isModule: true, // Módulo
    sortOptions: [
      { value: "name", label: "Producto" },
      { value: "date", label: "Fecha" },
      { value: "quantity", label: "Cantidad" },
    ],
    chips: [
      {
        id: "chip-filter-in",
        label: "Entradas",
        icon: "bi-arrow-right",
        color: "btn-outline-success",
        value: "in",
      },
      {
        id: "chip-filter-out",
        label: "Salidas",
        icon: "bi-arrow-left",
        color: "btn-outline-danger",
        value: "out",
      },
    ]
  },
  [PAGE_EXPENSES]: {
    title: "Gastos",
    icon: "bi-cash-coin",
    navId: null,
    isModule: true, // Módulo
    sortOptions: [
      { value: "name", label: "Producto" },
      { value: "concept", label: "Concepto" },
      { value: "date", label: "Fecha" },
      { value: "amount", label: "Monto" }
    ],
    chips: [
      /*{
        id: "chip-filter-salaries",
        label: "Sueldos",
        icon: "bi-cash-coin",
        color: "btn-outline-warning",
        value: "salaries",
      },
      {
        id: "chip-filter-dollars",
        label: "Dólares",
        icon: "bi-currency-dollar",
        color: "btn-outline-danger",
        value: "dollars",
      },*/
    ]
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


// Nombres de los componentes de los módulos 
//fila 1
const CONTROL_SEARCH_INPUT = "search-input";
const CONTROL_BTN_ADD = "btn-add";
//fila 2
const CONTROL_DATE_FILTER = "date-filter";
const CONTROL_ORDER_BY = "order-by";
//fila 3
const COTROL_CHIPS_FILTER = "chips-filter";
//fila 4
const CONTROL_LIST_COUNTER = "list-counter";
const CONTROL_BTN_CLEAR_FILTERS = "btn-clear-filters";

// IDs modules controls
// id del contenedor general de los controles de los módulos
const ID_MODULES_CONTROLS_CONTAINER = "modules-controls-container";
// ids de los contenedores de los diferentes controles
const ID_CONTAINER_SEARCH_INPUT_BTN_ADD = "container-searchInput-btnAdd";
const ID_CONTAINER_DATE_FILTER_ORDER_BY = "container-dateFilter-orderBy";
const ID_CONTAINER_CHIPS_FILTER = "container-chipsFilter";
const ID_CONTAINER_LIST_COUNTER_BTN_CLEAR_FILTERS = "container-listCounter-btnClearFilters";

// ids de los componentes específicos
// ids de los componentes de los search input
const ID_CONTROL_SEARCH_INPUT_CONTAINER = "control-search-input-container"; // contenedor del search input
const ID_CONTROL_SEARCH_INPUT = "control-search-input"; // input del search input
const ID_CONTROL_CLEAR_SEARCH = "control-clear-search"; // botón de limpiar el search input

// ids de los componentes de los btn add
const ID_CONTROL_BTN_ADD = "control-btn-add"; // botón de agregar

// ids de los componentes de la date filter
const ID_CONTROL_DATE_FILTER = "control-date-filter";

// ids de los componentes de los order by
const ID_CONTROL_ORDER_BY_CONTAINER = "control-order-by-container"; // contenedor del order by
const ID_CONTROL_ORDER_BY = "control-order-by"; // order by
const ID_CONTROL_ORDER_DIR = "control-order-dir"; // order dir
const ID_CONTROL_ORDER_DIR_ICON = "control-order-dir-icon"; // icono del order dir

// ids de los componentes de los chips filter
const ID_CONTROL_CHIPS_FILTER_TEMPLATE = "control-chips-filter-template"; // template del chip
const CLASS_CONTROL_CHIPS_FILTER_BUTTON = "chip-filter-button"; // botón del chip
const CLASS_CONTROL_CHIPS_FILTER_ICON = "chip-filter-icon"; // icono del chip
const CLASS_CONTROL_CHIPS_FILTER_LABEL = "chip-filter-label"; // label del chip


// ids de los componentes de los list counter
const ID_CONTROL_LIST_COUNTER = "control-list-counter"; // contador de elementos

// ids de los componentes de los btn clear filters
const ID_CONTROL_BTN_CLEAR_FILTERS = "control-btn-clear-filters"; // botón de limpiar filtros

/**
 * @description: Configuración de los componentes de los módulos (modules controls)
 * @type {Object} MODULES_CONTROLS_CONFIG
 * @property {string} containerId - ID del elemento HTML del contenedor
 * @property {string} componentName - Nombre del componente a cargar
 */
const MODULES_CONTROLS_CONFIG = {
  [CONTROL_SEARCH_INPUT]: {
    containerId: ID_CONTAINER_SEARCH_INPUT_BTN_ADD,
    componentName: CONTROL_SEARCH_INPUT
  },
  [CONTROL_BTN_ADD]: {
    containerId: ID_CONTAINER_SEARCH_INPUT_BTN_ADD,
    componentName: CONTROL_BTN_ADD
  },
  [CONTROL_DATE_FILTER]: {
    containerId: ID_CONTAINER_DATE_FILTER_ORDER_BY,
    componentName: CONTROL_DATE_FILTER
  },
  [CONTROL_ORDER_BY]: {
    containerId: ID_CONTAINER_DATE_FILTER_ORDER_BY,
    componentName: CONTROL_ORDER_BY
  },
  [COTROL_CHIPS_FILTER]: {
    containerId: ID_CONTAINER_CHIPS_FILTER,
    componentName: COTROL_CHIPS_FILTER
  },
  [CONTROL_LIST_COUNTER]: {
    containerId: ID_CONTAINER_LIST_COUNTER_BTN_CLEAR_FILTERS,
    componentName: CONTROL_LIST_COUNTER
  },
  [CONTROL_BTN_CLEAR_FILTERS]: {
    containerId: ID_CONTAINER_LIST_COUNTER_BTN_CLEAR_FILTERS,
    componentName: CONTROL_BTN_CLEAR_FILTERS
  }
};


//#endregion