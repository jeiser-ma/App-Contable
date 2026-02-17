
// ===============================
// Auth - App Contable
// ===============================

// Inicializa credenciales por defecto (solo la primera vez)
function initCredentials() {
  if (!localStorage.getItem("credentials")) {
    localStorage.setItem(
      "credentials",
      JSON.stringify({
        user: "admin",
        pass: "admin"
      })
    );
  }
}

// Login
function login() {
  const userInput = document.getElementById("inputUser");
  const passInput = document.getElementById("inputPass");

  if (!userInput || !passInput) return;

  const user = userInput.value.trim();
  const pass = passInput.value.trim();

  const credentials = JSON.parse(localStorage.getItem("credentials"));

  if (user === credentials.user && pass === credentials.pass) {
    localStorage.setItem("logged", "1");
    window.location.href = "layout.html";
  } else {
    alert("Usuario o contraseña incorrectos");
  }
}

// Logout
function logout() {
  localStorage.removeItem("logged");
  window.location.href = "index.html";
}

// Protección de páginas (layout)
function protectApp() {
  const logged = localStorage.getItem("logged");
  if (!logged) {
    window.location.href = "index.html";
  }
}

// ===============================
// Inicialización
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  initCredentials();

  // Si existe el formulario de login, asociar evento
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
  }

  // Si estamos en layout.html, proteger acceso
  if (window.location.pathname.includes("layout.html")) {
    protectApp();
  }

  const btn = document.getElementById(ID_BTN_LOGOUT);
  if (btn) {
    btn.onclick = logout;
  }

  // Service Worker (PWA): solo en producción. En localhost (Live Server) no se registra para poder ver cambios sin borrar caché
  const isLocal = /localhost|127\.0\.0\.1/i.test(window.location.hostname);
  if ("serviceWorker" in navigator) {
    if (isLocal) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    } else {
      const ver = typeof APP_VERSION !== "undefined" ? APP_VERSION : "1.0.0";
      navigator.serviceWorker.register("service-worker.js?v=" + ver);
    }
  }

});


