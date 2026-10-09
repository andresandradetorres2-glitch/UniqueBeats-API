const express = require("express");
const router = express.Router();
const db = require("../database");
const verificarAdmin = require("../middleware/adminMiddleware");

// ======================================================
// RESUMEN DE ESTADÍSTICAS PARA EL DASHBOARD
// Solo administrador
// ======================================================
router.get("/summary", verificarAdmin, (req, res) => {
    // Consulta para contar beats publicados
    const sqlBeats = "SELECT COUNT(*) AS total FROM beats WHERE estado = 'Publicado'";
    // Consulta para contar usuarios totales
    const sqlUsers = "SELECT COUNT(*) AS total FROM usuarios";

    db.query(sqlBeats, (errBeats, resBeats) => {
        if (errBeats) {
            console.error("Error al contar beats:", errBeats);
            return res.status(500).json({ mensaje: "Error interno al contar beats." });
        }

        db.query(sqlUsers, (errUsers, resUsers) => {
            if (errUsers) {
                console.error("Error al contar usuarios:", errUsers);
                return res.status(500).json({ mensaje: "Error interno al contar usuarios." });
            }

            // Aseguramos que enviamos números simples
            const totalBeats = resBeats[0] ? resBeats[0].total : 0;
            const totalUsers = resUsers[0] ? resUsers[0].total : 0;

            return res.status(200).json({
                totalBeats: totalBeats,
                totalUsers: totalUsers
            });
        });
    });
});

module.exports = router;
