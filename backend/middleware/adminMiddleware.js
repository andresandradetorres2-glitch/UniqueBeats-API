const verificarToken = require("./authMiddleware");

function verificarAdmin(req, res, next) {

    verificarToken(req, res, () => {

        if (req.usuario.tipo !== "admin") {
            return res.status(403).json({
                mensaje: "Acceso denegado. Se requieren permisos de administrador."
            });
        }

        next();
    });
}

module.exports = verificarAdmin;