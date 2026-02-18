/**
 * Componente Scanner - App Contable
 * Escáner de códigos de barras y QR reutilizable (cámara o archivo).
 * Requiere components/scanner/html5-qrcode.min.js cargado antes.
 * Se carga con loadComponent("scanner") y se usa con openScannerModal({ onSuccess }).
 */

const ID_SCANNER_MODAL = "scannerModal";
const ID_SCANNER_CONTAINER = "scanner-container";

let scannerInstance = null;
let isScanning = false;
let scannerModalBootstrap = null;

/**
 * Comprueba si la librería html5-qrcode está cargada
 * @returns {boolean}
 */
function isScannerLibraryAvailable() {
  return typeof Html5Qrcode !== "undefined";
}

/**
 * Inicia el escaneo con la cámara en el contenedor indicado.
 * @param {string} containerId - ID del elemento donde se mostrará la cámara
 * @param {Object} options - onSuccess, onError, fps, qrboxSize
 * @returns {Promise<void>}
 */
function startScan(containerId, options) {
  const { onSuccess, onError, fps = 10, qrboxSize = 250 } = options || {};

  if (!isScannerLibraryAvailable()) {
    return Promise.reject(new Error("Scanner: cargar la librería html5-qrcode antes de usar el scanner."));
  }

  const container = document.getElementById(containerId);
  if (!container) {
    return Promise.reject(new Error("Scanner: no se encontró el contenedor con id \"" + containerId + "\"."));
  }

  if (isScanning && scannerInstance) {
    return stopScan().then(() => startScan(containerId, options));
  }

  scannerInstance = new Html5Qrcode(containerId);
  const config = {
    fps,
    qrbox: { width: qrboxSize, height: qrboxSize },
    aspectRatio: 1
  };
  const cameraConfig = { facingMode: "environment" };

  return scannerInstance
    .start(cameraConfig, config, (decodedText) => {
      if (typeof onSuccess === "function") onSuccess(decodedText);
    }, (errorMessage) => {
      if (typeof onError === "function") onError(errorMessage);
    })
    .then(() => {
      isScanning = true;
    })
    .catch((err) => {
      scannerInstance = null;
      isScanning = false;
      throw err;
    });
}

/**
 * Detiene el escaneo y libera la cámara.
 * @returns {Promise<void>}
 */
function stopScan() {
  if (!scannerInstance || !isScanning) {
    return Promise.resolve();
  }
  return scannerInstance
    .stop()
    .then(() => {
      scannerInstance.clear();
      scannerInstance = null;
      isScanning = false;
    })
    .catch(() => {
      scannerInstance = null;
      isScanning = false;
    });
}

/**
 * Indica si el scanner está activo (cámara encendida).
 * @returns {boolean}
 */
function getIsScanning() {
  return isScanning;
}

/**
 * Escanea un código desde un archivo de imagen.
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>}
 */
function scanFromFile(file) {
  if (!isScannerLibraryAvailable()) {
    return Promise.reject(new Error("Scanner: cargar la librería html5-qrcode antes de usar el scanner."));
  }
  if (!file || !(file instanceof File)) {
    return Promise.reject(new Error("Scanner: se requiere un archivo de imagen (File)."));
  }
  const tempId = "scanner-temp-file-" + Date.now();
  const tempDiv = document.createElement("div");
  tempDiv.id = tempId;
  tempDiv.style.display = "none";
  document.body.appendChild(tempDiv);
  const tempScanner = new Html5Qrcode(tempId);
  return tempScanner
    .scanFile(file, false)
    .then((decodedText) => {
      tempScanner.clear();
      document.getElementById(tempId)?.remove();
      return decodedText;
    })
    .catch((err) => {
      tempDiv.remove();
      throw err;
    });
}

/**
 * Abre el modal del escáner, inicia la cámara y al leer un código ejecuta onSuccess y cierra el modal.
 * Para usar desde cualquier módulo (ej. productos).
 * @param {Object} options
 * @param {function(string): void} options.onSuccess - Callback con el texto del código leído
 * @param {function(string): void} [options.onError] - Callback cuando falla el escaneo (opcional)
 * @param {number} [options.fps=10]
 * @param {number} [options.qrboxSize=250]
 */
function openScannerModal(options) {
  const modalEl = document.getElementById(ID_SCANNER_MODAL);
  if (!modalEl) {
    console.warn("Scanner: modal no encontrado. ¿Está cargado el componente scanner?");
    if (options.onError) options.onError("Modal del escáner no disponible.");
    return;
  }

  if (!scannerModalBootstrap) {
    scannerModalBootstrap = new bootstrap.Modal(modalEl, { backdrop: "static" });
  }

  modalEl.addEventListener("hidden.bs.modal", function onHidden() {
    modalEl.removeEventListener("hidden.bs.modal", onHidden);
    if (typeof stopScan === "function") stopScan();
  }, { once: true });

  scannerModalBootstrap.show();

  startScan(ID_SCANNER_CONTAINER, {
    onSuccess: (decodedText) => {
      if (typeof stopScan === "function") stopScan();
      scannerModalBootstrap.hide();
      if (typeof options.onSuccess === "function") options.onSuccess(decodedText);
    },
    onError: options.onError || (() => {}),
    fps: options.fps ?? 10,
    qrboxSize: options.qrboxSize ?? 250
  }).catch((err) => {
    scannerModalBootstrap.hide();
    if (typeof options.onError === "function") options.onError(err.message);
    else alert(err.message || "No se pudo acceder a la cámara.");
  });
}
