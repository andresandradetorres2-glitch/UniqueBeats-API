// ========================
// SCRIPT: Menú Responsive
// ========================
document.addEventListener('DOMContentLoaded', () => {

    // ------------------------
    // MENÚ RESPONSIVE
    // ------------------------
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {

        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');

            hamburgerBtn.setAttribute(
                'aria-expanded',
                String(isOpen)
            );
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-links a').forEach(link => {

            link.addEventListener('click', () => {

                navMenu.classList.remove('active');

                hamburgerBtn.setAttribute(
                    'aria-expanded',
                    'false'
                );
            });

        });
    }


    // ------------------------
    // LOGIN
    // ------------------------
    const loginForm = document.getElementById('loginForm');

    // Si no estamos en login.html, no hacemos nada
    if (!loginForm) return;


    loginForm.addEventListener('submit', async (event) => {

        // Evita que el formulario recargue la página
        event.preventDefault();


        // Obtener datos
        const usuario = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value;


        // Validación básica
        if (!usuario || !password) {

            alert('Por favor, completa todos los campos.');

            return;
        }


        try {

            // Enviar información al backend
            const response = await fetch(
                'http://localhost:3002/api/auth/login',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        usuario: usuario,
                        password: password
                    })
                }
            );


            // Convertir respuesta a JSON
            const data = await response.json();


            // ------------------------
            // LOGIN CORRECTO
            // ------------------------
            if (response.ok) {

                alert(`Bienvenido, ${data.usuario}`);

                console.log('Usuario autenticado:', data);


                // Guardamos los datos de sesión
                localStorage.setItem(
                    'usuario',
                    JSON.stringify(data)
                );


                // Por ahora regresamos al inicio
                window.location.href = 'Index-UniqueBeats.html';

            }

            // ------------------------
            // LOGIN INCORRECTO
            // ------------------------
            else {

                alert(
                    data.mensaje || 'Usuario o contraseña incorrectos.'
                );

            }


        } catch (error) {

            console.error('Error:', error);

            alert(
                'No se pudo conectar con el servidor.'
            );

        }

    });

});