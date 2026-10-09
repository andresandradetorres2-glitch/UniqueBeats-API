// ================================
// PANEL DE ADMINISTRADOR
// ================================

let editBeatId = null;

document.addEventListener("DOMContentLoaded", () => {
    const usuario = obtenerUsuarioGuardado();

    if (!usuario || usuario.tipo !== "admin") {
        window.location.href = "login.html";
        return;
    }

    mostrarNombreAdmin(usuario);
    configurarFormularioBeat();
    cargarBeatsAdmin();

    // Pequeño retraso para asegurar que el DOM esté totalmente renderizado
    setTimeout(() => {
        cargarEstadisticas();
    }, 100);

    // Configurar evento para el botón de cancelar edición
    const btnCancelar = document.getElementById("btnCancelarEdicion");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", cancelarEdicion);
    }
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

async function cargarEstadisticas() {
    const usuario = obtenerUsuarioGuardado();
    if (!usuario || !usuario.token) return;

    try {
        // Usamos la configuración más simple posible para evitar problemas de CORS pre-flight
        const respuesta = await fetch("http://localhost:3002/api/stats/summary", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + usuario.token
            }
        });

        if (!respuesta.ok) {
            console.error("Error HTTP:", respuesta.status);
            throw new Error(`Error ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        console.log("Datos recibidos:", datos);

        const elBeats = document.getElementById("stat-beats");
        const elUsers = document.getElementById("stat-users");

        if (elBeats) elBeats.textContent = datos.totalBeats || 0;
        if (elUsers) elUsers.textContent = datos.totalUsers || 0;

    } catch (error) {
        console.error("Error fatal en cargarEstadisticas:", error);
        const elBeats = document.getElementById("stat-beats");
        const elUsers = document.getElementById("stat-users");
        if (elBeats) elBeats.textContent = "Error";
        if (elUsers) elUsers.textContent = "Error";
    }
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

            let url = "http://localhost:3002/api/beats";
            let method = "POST";

            if (editBeatId) {
                url = `http://localhost:3002/api/beats/${editBeatId}`;
                method = "PUT";
            }

            const respuesta = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${usuario.token}`
                },
                body: formData
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.mensaje || "Error desconocido al guardar el beat.");
            }

            const mensajeExito = editBeatId
                ? "¡Beat actualizado correctamente! 💎"
                : "¡Beat creado correctamente con archivos! 💎";

            alert(mensajeExito);

            // Limpiar formulario y volver al modo creación
            form.reset();
            cancelarEdicion();
            cargarBeatsAdmin();

        } catch (error) {
            console.error("Error al crear beat:", error);
            alert("Error: " + error.message);
        } finally {
            // Rehabilitar botón
            btnGuardar.disabled = false;
            btnGuardar.textContent = editBeatId ? "Actualizar Beat 💎" : "Guardar Beat 💎";
        }
    });
}

async function cargarBeatsAdmin() {
    try {
        const respuesta = await fetch("http://localhost:3002/api/beats");

        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: No se pudieron cargar los beats.`);
        }

        const beats = await respuesta.json();
        const tableBody = document.getElementById("beatsTableBody");

        if (!tableBody) return;

        if (beats.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">No hay beats registrados.</td></tr>';
            return;
        }

        tableBody.innerHTML = beats.map(beat => `
            <tr>
                <td>${beat.titulo}</td>
                <td>${beat.genero}</td>
                <td>${beat.bpm || 'N/A'}</td>
                <td>$${beat.precio}</td>
                <td>
                    <span style="color: ${beat.estado === 'Publicado' ? '#00ff00' : '#ffcc00'}">
                        ${beat.estado || 'Borrador'}
                    </span>
                </td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarBeat(${beat.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarBeat(${beat.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Error en cargarBeatsAdmin:", error);
        const tableBody = document.getElementById("beatsTableBody");
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff4444;">Error al cargar los datos. Intente recargar la página.</td></tr>';
        }
    }
}

async function editarBeat(id) {
    try {
        editBeatId = id;
        const respuesta = await fetch(`http://localhost:3002/api/beats/${id}`);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la información del beat.");
        }

        const beat = await respuesta.json();

        // Poblar formulario
        document.getElementById("beatTitulo").value = beat.titulo || "";
        document.getElementById("beatGenero").value = beat.genero || "";
        document.getElementById("beatBpm").value = beat.bpm || "";
        document.getElementById("beatTonalidad").value = beat.tonalidad || "";
        document.getElementById("beatPrecio").value = beat.precio || "";
        document.getElementById("beatLicencia").value = beat.licencia || "Basica";
        document.getElementById("beatYoutube").value = beat.youtube_url || "";
        document.getElementById("beatEstado").value = beat.estado || "Borrador";
        document.getElementById("beatDescripcion").value = beat.descripcion || "";

        // Actualizar UI
        document.getElementById("formTitle").textContent = "Editar Beat 💎";
        document.getElementById("btnGuardarBeat").textContent = "Actualizar Beat 💎";
        document.getElementById("btnCancelarEdicion").style.display = "block";

        // Scroll al formulario
        document.getElementById("nuevo-beat").scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        console.error("Error al cargar beat para editar:", error);
        alert("Error: " + error.message);
    }
}

function cancelarEdicion() {
    editBeatId = null;

    // Resetear formulario
    const form = document.querySelector(".admin-form");
    if (form) form.reset();

    // Restaurar UI
    document.getElementById("formTitle").innerHTML = '<i class="fas fa-plus-circle"></i> Subir Nuevo Beat';
    document.getElementById("btnGuardarBeat").textContent = "Guardar Beat 💎";
    document.getElementById("btnCancelarEdicion").style.display = "none";
}

async function eliminarBeat(id) {
    try {
        const usuario = obtenerUsuarioGuardado();
        if (!usuario || !usuario.token) {
            alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
            window.location.href = "login.html";
            return;
        }

        // Obtener datos del beat para mostrar el nombre en la confirmación
        const respuestaInfo = await fetch(`http://localhost:3002/api/beats/${id}`);
        if (!respuestaInfo.ok) {
            throw new Error("No se pudo obtener la información del beat para confirmar la eliminación.");
        }
        const beat = await respuestaInfo.json();

        // Confirmación al administrador
        const confirmado = confirm(`¿Estás seguro de que deseas eliminar el beat "${beat.titulo}"? Esta acción no se puede deshacer.`);
        if (!confirmado) return;

        // Ejecutar eliminación
        const respuesta = await fetch(`http://localhost:3002/api/beats/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${usuario.token}`
            }
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || "Error al intentar eliminar el beat.");
        }

        alert("¡Beat eliminado correctamente! 🗑️");

        // Actualizar la tabla sin recargar la página
        cargarBeatsAdmin();

    } catch (error) {
        console.error("Error en eliminarBeat:", error);
        alert("Error: " + error.message);
    }
}
