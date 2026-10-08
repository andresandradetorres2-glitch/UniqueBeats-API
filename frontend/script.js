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
    // ENLACE ADMIN
    // ------------------------
    const adminPanelLink = document.getElementById('adminPanelLink');
    const accountLink = document.getElementById('accountLink');
    const usuarioGuardado = obtenerUsuarioGuardado();

    if (adminPanelLink && usuarioGuardado && usuarioGuardado.tipo === 'admin') {
        adminPanelLink.hidden = false;
    }

    if (accountLink && usuarioGuardado) {
        accountLink.textContent = 'Cerrar sesión';
        accountLink.href = '#';

        accountLink.addEventListener('click', (event) => {
            event.preventDefault();

            localStorage.removeItem('usuario');

            if (adminPanelLink) {
                adminPanelLink.hidden = true;
            }

            window.location.href = 'Index-UniqueBeats.html';
        });
    }


    // ------------------------
    // LOGIN (Lógica desactivada para evitar duplicidad con login.js)
    // ------------------------
    /*
    const loginForm = document.getElementById('loginForm');

    // Si no estamos en login.html, no hacemos nada
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        // ... lógica duplicada ...
    });
    */

});

function obtenerUsuarioGuardado() {
    const sesion = localStorage.getItem('usuario');

    if (!sesion) return null;

    try {
        return JSON.parse(sesion);
    } catch (error) {
        console.warn('Sesion local invalida. Se limpiara el acceso guardado.', error);
        localStorage.removeItem('usuario');
        return null;
    }
}
