// ===============================
// Home Dashboard - App Contable
// ===============================

/**
 * Hook que llama el router cuando se carga la página de inicio
 * Calcula y muestra todas las métricas del dashboard
 * @returns {void}
 */
function onHomePageLoaded() {
  console.log("onHomePageLoaded execution");
  updateDashboard();
}

/**
 * Actualiza todas las métricas del dashboard
 * @returns {void}
 */
function updateDashboard() {
  // Obtener datos
  const products = getData("products") || [];
  const movements = getData("movements") || [];
  const expenses = getData("expenses") || [];
  const inventory = getData("inventory") || [];

  // 1. Total de productos
  const totalProducts = products.length;
  updateMetric("totalProducts", totalProducts);

  // 2. Productos con stock bajo
  const lowStockCount = products.filter((p) => {
    const lowThreshold = p.lowStockThreshold || 0;
    const criticalThreshold = p.criticalStockThreshold || 0;
    return p.quantity <= lowThreshold && p.quantity > criticalThreshold;
  }).length;
  updateMetric("lowStockProducts", lowStockCount);

  // 3. Productos con stock crítico
  const criticalStockCount = products.filter((p) => {
    const criticalThreshold = p.criticalStockThreshold || 0;
    return p.quantity <= criticalThreshold;
  }).length;
  updateMetric("criticalStockProducts", criticalStockCount);

  // 4. Total de movimientos
  const totalMovements = movements.length;
  updateMetric("totalMovements", totalMovements);

  // 5. Total de gastos (suma de todos los gastos)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  updateMetric("totalExpenses", formatCurrency(totalExpenses));

  // 6. Gastos del mes actual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyExpenses = expenses
    .filter((e) => {
      if (!e.date) return false;
      const expenseDate = new Date(e.date + "T00:00:00");
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  updateMetric("monthlyExpenses", formatCurrency(monthlyExpenses));

  // 7. Valor total del inventario (suma de precio * cantidad de todos los productos)
  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
    0
  );
  updateMetric("inventoryValue", formatCurrency(inventoryValue));

  // 8. Movimientos del mes actual
  const monthlyMovements = movements.filter((m) => {
    if (!m.date) return false;
    const movementDate = new Date(m.date + "T00:00:00");
    return (
      movementDate.getMonth() === currentMonth &&
      movementDate.getFullYear() === currentYear
    );
  }).length;
  updateMetric("monthlyMovements", monthlyMovements);

  // 9. Últimos movimientos (últimos 5)
  const recentMovements = movements
    .sort((a, b) => {
      const dateA = new Date(a.date + "T00:00:00");
      const dateB = new Date(b.date + "T00:00:00");
      return dateB - dateA;
    })
    .slice(0, 5);
  updateMetric("recentMovementsCount", recentMovements.length);

  // 10. Últimos gastos (últimos 5)
  const recentExpenses = expenses
    .sort((a, b) => {
      const dateA = new Date(a.date + "T00:00:00");
      const dateB = new Date(b.date + "T00:00:00");
      return dateB - dateA;
    })
    .slice(0, 5);
  updateMetric("recentExpensesCount", recentExpenses.length);
}

/**
 * Actualiza el valor de una métrica en el DOM
 * @param {string} id - ID del elemento
 * @param {string|number} value - Valor a mostrar
 * @returns {void}
 */
function updateMetric(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada como moneda
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

