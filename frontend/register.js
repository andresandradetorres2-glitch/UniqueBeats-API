// ================================
// REGISTRO DE USUARIO
// ================================

document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");

    if (!registerForm) return;

    registerForm.addEventListener("submit", async (event) => {

        // Evitar que el formulario recargue la página
        event.preventDefault();

        // Obtener los valores del formulario
        const usuario = document.getElementById("usuario").value;
        const password = document.getElementById("password").value;
        const tipo = document.getElementById("tipo").value;

        try {

            // Enviar los datos al backend
            const respuesta = await fetch("http://localhost:3002/api/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    usuario: usuario,
                    password: password,
                    tipo: tipo
                })
            });

            // Convertir la respuesta del servidor a JSON
            const datos = await respuesta.json();

            // Mostrar mensaje al usuario
            alert(datos.mensaje);

            // Si el registro fue exitoso
            if (respuesta.ok) {

                // Limpiar formulario
                registerForm.reset();

                // Ir al login
                window.location.href = "login.html";
            }

        } catch (error) {

            console.error("Error:", error);

            alert("No se pudo conectar con el servidor.");
        }

    });

});