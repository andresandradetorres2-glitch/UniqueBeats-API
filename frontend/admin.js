// ================================
// PANEL DE ADMINISTRADOR
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const usuario = obtenerUsuarioGuardado();

    if (!usuario || usuario.tipo !== "admin") {
        window.location.href = "login.html";
        return;
    }

    mostrarNombreAdmin(usuario);
});

function obtenerUsuarioGuardado() {
    const sesion = localStorage.getItem("usuario");

    if (!sesion) return null;

    try {
        return JSON.parse(sesion);
    } catch (error) {
        console.warn("Sesion local invalida. Se limpiara el acceso guardado.", error);
        localStorage.removeItem("usuario");
        return null;
    }
}

function mostrarNombreAdmin(usuario) {
    const adminName = document.getElementById("adminName");

    if (!adminName) return;

    adminName.textContent = usuario.usuario || usuario.nombre || "Administrador";
}
