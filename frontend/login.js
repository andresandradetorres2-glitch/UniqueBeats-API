// ================================
// INICIO DE SESIÓN
// ================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {

        // Evitar que el formulario recargue la página
        event.preventDefault();

        // Obtener datos del formulario
        const usuario = document.getElementById("usuario").value;
        const password = document.getElementById("password").value;

        try {

            // Enviar datos al backend
            const respuesta = await fetch(
                "http://localhost:3002/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        usuario: usuario,
                        password: password
                    })
                }
            );

            // Convertir respuesta a JSON
            const datos = await respuesta.json();
            console.log("Respuesta del servidor login:", datos); // Debug para verificar el token en consola

            // Si las credenciales son incorrectas
            if (!respuesta.ok) {
                alert(datos.mensaje);
                return;
            }

            if (!datos.token) {
                console.error("El servidor no devolvió un token JWT.");
                alert("Error crítico: El servidor no proporcionó un token de acceso.");
                return;
            }

            // Login correcto
            alert(`Bienvenido, ${datos.usuario}`);

            // Guardar información del usuario y el token para consistencia
            const datosSesion = {
                usuario: datos.usuario,
                nombre: datos.usuario,
                tipo: datos.tipo,
                token: datos.token
            };

            localStorage.setItem("usuario", JSON.stringify(datosSesion));
            console.log("Sesión guardada en localStorage:", datosSesion);

            // Redirigir a la página principal
            window.location.href = "Index-UniqueBeats.html";

        } catch (error) {

            console.error("Error:", error);

            alert("No se pudo conectar con el servidor.");
        }
    });
});
