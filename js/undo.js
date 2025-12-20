let undoTimer = null;
let undoData = null;
let undoType = null;

function showSnackbar(text) {
  const bar = document.getElementById("snackbar");
  document.getElementById("snackbarText").textContent = text;

  bar.classList.remove("d-none");

  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    hideSnackbar();
    clearUndo();
  }, 5000);
}

function clearUndo() {
  undoData = null;
  undoType = null;
}

function hideSnackbar() {
  document.getElementById("snackbar").classList.add("d-none");
}

document.addEventListener("click", e => {
  if (e.target.id === "btnUndo") {
    undoDelete();
  }
});

function undoDelete() {
  if (!undoData || undoType !== "product") return;

  const products = getData("products");
  products.push(undoData);
  setData("products", products);

  renderProducts();
  hideSnackbar();
  clearUndo();
}
