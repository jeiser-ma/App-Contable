function loadModal(name) {
  return fetch(`pages/modals/${name}.html`)
    .then((r) => r.text())
    .then((html) => {
      document.getElementById("modals").insertAdjacentHTML("beforeend", html);
    });
}

function loadComponent(name) {
  return fetch(`pages/components/${name}.html`)
    .then((r) => r.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
    });
}

document.getElementById("modals").addEventListener("click", (e) => {
  if (e.target.id === "btnConfirmDelete") {
    confirmDelete();
  }
});

function hideConfirmModal() {
  bootstrap.Modal.getInstance(
    document.getElementById("confirmDeleteModal")
  ).hide();
}
