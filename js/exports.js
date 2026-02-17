/**
 * Módulo de exportación - App Contable
 * Funciones para exportar datos en diferentes formatos (JSON, CSV, etc.).
 */

// Claves de localStorage que forman el estado completo de la app
const APP_STATE_KEYS = [
  PAGE_PRODUCTS,
  PAGE_MOVEMENTS,
  PAGE_INVENTORY,
  PAGE_EXPENSES,
  PAGE_ACCOUNTING,
  "units",
  "expenseConcepts",
  "salaryPercentage"
];

// ==============================================
// Utilidades internas
// ==============================================

/**
 * Descarga un string como archivo en el navegador
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 * @param {string} mimeType - Tipo MIME (ej. "application/json", "text/csv")
 */
function downloadFile(content, filename, mimeType, addBom = false) {
  const blob = new Blob([addBom ? "\uFEFF" + content : content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================================
// Exportación JSON
// ==============================================

/**
 * Obtiene el estado completo de la app desde localStorage
 * @returns {Object}
 */
function getAppState() {
  const state = {};
  for (const key of APP_STATE_KEYS) {
    try {
      state[key] = getData(key);
    } catch (_) {
      state[key] = null;
    }
  }
  state._exportedAt = new Date().toISOString();
  state._appVersion = typeof APP_VERSION !== "undefined" ? APP_VERSION : "?";
  return state;
}

/**
 * Exporta el estado de la app en formato JSON
 * @param {Object} [options]
 * @param {boolean} [options.download=true] - Si true, descarga el archivo. Si false, devuelve el string.
 * @param {string} [options.filename] - Nombre del archivo (por defecto: app-state-YYYY-MM-DD.json)
 * @returns {string|void}
 */
function exportAppStateToJson(options = {}) {
  const { download = true, filename } = options;
  const state = getAppState();
  const json = JSON.stringify(state, null, 2);
  const name = filename || `app-state-${new Date().toISOString().slice(0, 10)}.json`;

  if (download) {
    downloadFile(json, name, "application/json");
  } else {
    return json;
  }
}

// ==============================================
// Exportación CSV
// ==============================================

/**
 * Convierte un array de objetos en string CSV
 * @param {Array<Object>} data - Array de objetos (ej. productos, gastos, movimientos)
 * @param {Object} [options]
 * @param {string[]} [options.columns] - Orden de columnas (keys del objeto). Si no se pasa, se usan todas las keys del primer objeto.
 * @param {Object} [options.headerMap] - Mapeo key -> cabecera legible (ej. { name: "Nombre", price: "Precio" })
 * @returns {string}
 */
function arrayToCsv(data, options = {}) {
  if (!data || data.length === 0) return "";

  const columns = options.columns || Object.keys(data[0]);
  const headerMap = options.headerMap || {};
  const headers = columns.map((col) => headerMap[col] ?? col);

  const escape = (val) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = [headers.join(",")];
  for (const obj of data) {
    rows.push(columns.map((col) => escape(obj[col])).join(","));
  }
  return rows.join("\n");
}

/**
 * Exporta un array de objetos a archivo CSV
 * @param {Array<Object>} data - Datos a exportar
 * @param {string} [filename] - Nombre del archivo (por defecto: export-YYYY-MM-DD.csv)
 * @param {Object} [options] - Opciones para arrayToCsv (columns, headerMap)
 */
function exportToCsv(data, filename, options = {}) {
  const name = filename || `export-${new Date().toISOString().slice(0, 10)}.csv`;
  const csv = arrayToCsv(data, options);
  downloadFile(csv, name, "text/csv;charset=utf-8", true);
}
