const express = require("express");
const router = express.Router();
const db = require("../database");
const verificarAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Middleware para manejar la subida de archivos en la ruta de creación y actualización
const uploadBeats = upload.fields([
    { name: 'miniatura', maxCount: 1 },
    { name: 'audio_preview', maxCount: 1 }
]);

// ======================================================
// OBTENER TODOS LOS BEATS
// Público
// ======================================================
router.get("/", (req, res) => {

    const sql = "SELECT * FROM beats";

    db.query(sql, (error, resultados) => {

        if (error) {
            console.error("Error al obtener beats:", error);

            return res.status(500).json({
                mensaje: "Error en el servidor."
            });
        }

        res.json(resultados);
    });
});

// ======================================================
// OBTENER UN BEAT POR ID
// Público
// ======================================================
router.get("/:id", (req, res) => {

    const { id } = req.params;

    const sql = "SELECT * FROM beats WHERE id = ?";

    db.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error("Error al obtener beat:", error);

            return res.status(500).json({
                mensaje: "Error en el servidor."
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Beat no encontrado."
            });
        }

        res.json(resultados[0]);
    });
});

// ======================================================
// CREAR UN NUEVO BEAT
// Solo administrador
// ======================================================
router.post("/", uploadBeats, verificarAdmin, (req, res) => {

    if (!req.body) {
        return res.status(500).json({
            mensaje: "Error procesando los datos del formulario."
        });
    }

    const {
        titulo,
        genero,
        bpm,
        tonalidad,
        precio,
        licencia,
        youtube_url,
        estado,
        descripcion
    } = req.body;

    if (!titulo || !genero || !precio) {
        return res.status(400).json({
            mensaje: "Título, género y precio son obligatorios."
        });
    }

    // Generar URLs para los archivos subidos
    let miniaturaUrl = null;
    let audioPreviewUrl = null;

    if (req.files && req.files['miniatura']) {
        const file = req.files['miniatura'][0];
        miniaturaUrl = `http://localhost:3002/uploads/covers/${file.filename}`;
    }

    if (req.files && req.files['audio_preview']) {
        const file = req.files['audio_preview'][0];
        audioPreviewUrl = `http://localhost:3002/uploads/previews/${file.filename}`;
    }

    const sql = `
        INSERT INTO beats
        (titulo, genero, bpm, tonalidad, precio, licencia, youtube_url, estado, descripcion, miniatura_url, audio_preview_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        titulo,
        genero,
        bpm,
        tonalidad,
        precio,
        licencia,
        youtube_url,
        estado || "borrador",
        descripcion || null,
        miniaturaUrl,
        audioPreviewUrl
    ];

    db.query(sql, valores, (error, resultado) => {

        if (error) {
            console.error("Error al crear beat:", error);

            return res.status(500).json({
                mensaje: "No se pudo crear el beat."
            });
        }

        res.status(201).json({
            mensaje: "Beat creado correctamente.",
            id: resultado.insertId
        });
    });
});

// ======================================================
// ACTUALIZAR UN BEAT
// Solo administrador
// ======================================================
router.put("/:id", uploadBeats, verificarAdmin, (req, res) => {

    const { id } = req.params;

    const {
        titulo,
        genero,
        bpm,
        tonalidad,
        precio,
        licencia,
        youtube_url,
        estado,
        descripcion
    } = req.body;

    // Generar URLs para los archivos subidos
    let miniaturaUrl = null;
    let audioPreviewUrl = null;

    if (req.files && req.files['miniatura']) {
        const file = req.files['miniatura'][0];
        miniaturaUrl = `http://localhost:3002/uploads/covers/${file.filename}`;
    }

    if (req.files && req.files['audio_preview']) {
        const file = req.files['audio_preview'][0];
        audioPreviewUrl = `http://localhost:3002/uploads/previews/${file.filename}`;
    }

    const sql = `
        UPDATE beats
        SET
            titulo = ?,
            genero = ?,
            bpm = ?,
            tonalidad = ?,
            precio = ?,
            licencia = ?,
            youtube_url = ?,
            estado = ?,
            descripcion = ?,
            miniatura_url = COALESCE(?, miniatura_url),
            audio_preview_url = COALESCE(?, audio_preview_url)
        WHERE id = ?
    `;

    const valores = [
        titulo,
        genero,
        bpm,
        tonalidad,
        precio,
        licencia,
        youtube_url,
        estado,
        descripcion,
        miniaturaUrl,
        audioPreviewUrl,
        id
    ];

    db.query(sql, valores, (error, resultado) => {

        if (error) {
            console.error("Error al actualizar beat:", error);

            return res.status(500).json({
                mensaje: "Error en el servidor."
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Beat no encontrado."
            });
        }

        res.json({
            mensaje: "Beat actualizado correctamente."
        });
    });
});

// ======================================================
// ELIMINAR UN BEAT
// Solo administrador
// ======================================================
router.delete("/:id", verificarAdmin, (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM beats WHERE id = ?";

    db.query(sql, valores, (error, resultado) => {

        if (error) {
            console.error("Error al eliminar beat:", error);

            return res.status(500).json({
                mensaje: "Error al eliminar beat."
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Error al eliminar el beat."
            });
        }

        res.json({
            mensaje: "Beat eliminado correctamente."
        });
    });
});

module.exports = router;
