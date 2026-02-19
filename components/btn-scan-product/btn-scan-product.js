/**
 * Configura el botón de escanear código
 * @param {function} onScanFn - Función callback al hacer clic (ej. abre el scanner modal)
 * @returns {void}
 */
function setupBtnScanProduct(onScanFn) {
  const btnScan = document.getElementById(ID_CONTROL_BTN_SCAN_PRODUCT);
  if (btnScan) {
    btnScan.onclick = () => {
      if (onScanFn && typeof onScanFn === "function") {
        onScanFn();
      }
    };
  }
}
