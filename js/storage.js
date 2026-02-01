/**
 * Obtiene un dato del localStorage
 * @param {string} k - Clave del dato
 * @returns {Object} - Valor del dato
 */
function getData(k) {
  return JSON.parse(localStorage.getItem(k) || "[]");
}

/**
 * Guarda un dato en el localStorage
 * @param {string} k - Clave del dato
 * @param {Object} v - Valor del dato
 * @returns {void}
 */
function setData(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}

/**
 * Guarda un dato en el localStorage por su id
 * Si el dato ya existe, se actualiza, si no, se crea
 * @param {string} k - Clave del dato
 * @param {Object} v - Valor del dato
 * @returns {void}
 */
function setDataById(k, v) {
  if (!k || !v) return;

  const allData = getData(k) || [];
  const index = allData.findIndex(a => a.id === v.id);

  if (index >= 0) {
    allData[index] = v;
  } else {
    allData.push(v);
  }

  setData(k, allData);
}
