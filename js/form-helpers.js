/**
 * form-helpers.js
 * Gestión centralizada de formularios: reset, estado válido/inválido y mensajes de feedback (Bootstrap).
 * Usar después de cargar configs.js (depende del DOM).
 */

//#region Redondeo y formato numérico (2 decimales)

/**
 * Redondea un valor (string o number) a 2 decimales. Para guardar en storage o usar en cálculos consistentes.
 * @param {string|number} value - Valor a redondear
 * @returns {number} Número redondeado a 2 decimales, o 0 si no es un número válido
 */
function roundTo2(value) {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

/**
 * Formatea un valor para mostrar al usuario (siempre 2 decimales).
 * @param {string|number} value - Valor a formatear
 * @returns {string} Cadena con 2 decimales, o "" si no es un número válido
 */
function formatTo2(value) {
  const n = Number(value);
  return Number.isNaN(n) ? "" : n.toFixed(2);
}

//#endregion

//#region Reset de formularios

/**
 * Resetea un formulario por ID (valores a su estado inicial).
 * Opcionalmente limpia el estado de validación de una lista de campos.
 * @param {string} formId - ID del elemento <form>
 * @param {{ clearValidationIds?: string[] }} [options] - Si se pasa clearValidationIds, se llama clearInputError(id) para cada id después del reset
 */
function resetForm(formId, options) {
  const form = document.getElementById(formId);
  if (!form || form.tagName !== "FORM") return;

  form.reset();

  const ids = options?.clearValidationIds;
  if (Array.isArray(ids)) {
    ids.forEach((id) => clearInputError(id));
  }
}

//#endregion

//#region Estado inválido (error)

/**
 * Obtiene el elemento de feedback (invalid o valid) para un input.
 * Busca por feedbackId si se indica; si no, el siguiente hermano con la clase indicada.
 * @param {HTMLElement} input
 * @param {'invalid'|'valid'} type
 * @param {string} [feedbackId]
 * @returns {HTMLElement|null}
 */
function getFeedbackElement(input, type, feedbackId) {
  if (feedbackId) {
    return document.getElementById(feedbackId);
  }
  const next = input?.nextElementSibling;
  const className = type === "invalid" ? "invalid-feedback" : "valid-feedback";
  return next && next.classList.contains(className) ? next : null;
}

/**
 * Marca un campo como inválido y muestra el mensaje de error.
 * @param {string} inputId - ID del input
 * @param {string} message - Mensaje a mostrar en el feedback
 * @param {string} [feedbackId] - ID del elemento de feedback (opcional). Si no se pasa, se usa el siguiente hermano con clase .invalid-feedback
 */
function setInputError(inputId, message, feedbackId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("is-valid");
  input.classList.add("is-invalid");

  const feedback = getFeedbackElement(input, "invalid", feedbackId);
  if (feedback) {
    feedback.textContent = message || "";
    // Si el feedback no es hermano del input (ej. compartido), mostrarlo
    if (feedbackId) {
      //feedback.style.display = "block";
      feedback.classList.add("d-block");
    }
  }
}

/**
 * Quita el estado de error de un campo y limpia el mensaje de feedback.
 * @param {string} inputId - ID del input
 * @param {string} [feedbackId] - ID del elemento de feedback (opcional). Si no se pasa, se usa el siguiente hermano con .invalid-feedback
 */
function clearInputError(inputId, feedbackId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("is-invalid");

  const feedback = getFeedbackElement(input, "invalid", feedbackId);
  if (feedback) {
    feedback.textContent = "";
    if (feedbackId) {
      //feedback.style.display = "";
      feedback.classList.remove("d-block");
    }
  }
}

//#endregion

//#region Estado válido

/**
 * Marca un campo como válido y opcionalmente muestra un mensaje en .valid-feedback.
 * @param {string} inputId - ID del input
 * @param {string} [message] - Mensaje opcional para .valid-feedback
 * @param {string} [feedbackId] - ID del elemento .valid-feedback (opcional)
 */
function setInputValid(inputId, message, feedbackId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("is-invalid");
  input.classList.add("is-valid");

  const feedback = getFeedbackElement(input, "valid", feedbackId);
  if (feedback && message !== undefined) {
    feedback.textContent = message;
    if (feedbackId) {
      //feedback.style.display = "block";
      feedback.classList.add("d-block");
    }
  }
}

/**
 * Quita el estado válido de un campo y limpia el .valid-feedback.
 * @param {string} inputId - ID del input
 * @param {string} [feedbackId] - ID del elemento .valid-feedback (opcional)
 */
function clearInputValid(inputId, feedbackId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove("is-valid");

  const feedback = getFeedbackElement(input, "valid", feedbackId);
  if (feedback) {
    feedback.textContent = "";
    if (feedbackId) {
      //feedback.style.display = "";
      feedback.classList.remove("d-block");
    }
  }
}

//#endregion

//#region Varios campos a la vez

/**
 * Limpia el estado de error de varios campos (cada uno con su .invalid-feedback hermano).
 * No usa feedbackId por campo; para feedback por ID usar clearInputError(id, feedbackId) en bucle.
 * @param {string[]} inputIds - Lista de IDs de inputs
 */
function clearInputErrors(inputIds) {
  if (!Array.isArray(inputIds)) return;
  inputIds.forEach((id) => clearInputError(id));
}

/**
 * Quita estado válido e inválido de un campo (deja el campo “neutro”).
 * @param {string} inputId - ID del input
 * @param {string} [invalidFeedbackId] - ID del .invalid-feedback si es por ID
 * @param {string} [validFeedbackId] - ID del .valid-feedback si es por ID
 */
function clearInputState(inputId, invalidFeedbackId, validFeedbackId) {
  clearInputError(inputId, invalidFeedbackId);
  clearInputValid(inputId, validFeedbackId);
}

/**
 * Establece el valor de un input
 * @param {string} inputId - ID del input
 * @param {string} value - Valor a setear en el input
 * @returns {void}
 */
function setInputValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.error(`Input con ID ${inputId} no encontrado`);
    return false;
  }

  input.value = value;
}

/**
 * Establece el valor de un input
 * @param {string} inputId - ID del input
 * @returns {string} Valor del input
 * @returns {void}
 */
function getInputValue(inputId) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.error(`Input con ID ${inputId} no encontrado`);
    return false;
  }

  return input.value.trim();
}


/**
 * Establece el valor de un input
 * @param {string} labelId - ID del label
 * @param {string} value - Valor a setear en el input
 * @returns {void}
 */
function setLabelText(labelId, value) {
  const label = document.getElementById(labelId);
  if (!label) {
    console.error(`Label con ID ${labelId} no encontrado`);
    return false;
  }

  label.textContent = value;
}