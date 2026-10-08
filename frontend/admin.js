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
    configurarFormularioBeat();
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

function configurarFormularioBeat() {
    const form = document.querySelector(".admin-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const btnGuardar = document.getElementById("btnGuardarBeat");
        const usuario = obtenerUsuarioGuardado();

        if (!usuario || !usuario.token) {
            alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
            window.location.href = "login.html";
            return;
        }

        // IMPORTANTE: Usamos FormData para poder enviar archivos binarios
        const formData = new FormData();

        // Campos de texto
        formData.append("titulo", document.getElementById("beatTitulo").value.trim());
        formData.append("genero", document.getElementById("beatGenero").value);
        formData.append("bpm", document.getElementById("beatBpm").value);
        formData.append("tonalidad", document.getElementById("beatTonalidad").value.trim());
        formData.append("precio", document.getElementById("beatPrecio").value);
        formData.append("licencia", document.getElementById("beatLicencia").value);
        formData.append("youtube_url", document.getElementById("beatYoutube").value.trim());
        formData.append("estado", document.getElementById("beatEstado").value);
        formData.append("descripcion", document.getElementById("beatDescripcion").value.trim());

        // Archivos
        const miniaturaInput = document.getElementById("beatMiniatura");
        const audioInput = document.getElementById("beatAudio");

        if (miniaturaInput.files[0]) {
            formData.append("miniatura", miniaturaInput.files[0]);
        }

        if (audioInput.files[0]) {
            formData.append("audio_preview", audioInput.files[0]);
        }

        // Validación básica de campos obligatorios
        if (!formData.get("titulo") || !formData.get("genero") || !formData.get("precio")) {
            alert("Por favor, completa los campos obligatorios: Título, Género y Precio.");
            return;
        }

        try {
            // Deshabilitar botón para evitar múltiples envíos
            btnGuardar.disabled = true;
            btnGuardar.textContent = "Guardando... ⏳";

            const respuesta = await fetch("http://localhost:3002/api/beats", {
                method: "POST",
                headers: {
                    // NOTA: No ponemos 'Content-Type': 'application/json'
                    // El navegador pone automáticamente 'multipart/form-data' con el boundary correcto
                    "Authorization": `Bearer ${usuario.token}`
                },
                body: formData
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.mensaje || "Error desconocido al guardar el beat.");
            }

            alert("¡Beat creado correctamente con archivos! 💎");

            // Limpiar formulario
            form.reset();

        } catch (error) {
            console.error("Error al crear beat:", error);
            alert("Error: " + error.message);
        } finally {
            // Rehabilitar botón
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar Beat 💎";
        }
    });
}
