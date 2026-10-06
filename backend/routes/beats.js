const express = require("express");
const router = express.Router();
const db = require("../database");

// ======================================================
// OBTENER TODOS LOS BEATS
// ======================================================
router.get("/", (req, res) => {
    const sql = "SELECT * FROM beats";
    db.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al obtener beats:", error);
            return res.status(500).json({ mensaje: "Error en el servidor." });
        }
        res.json(resultados);
    });
});

// ======================================================
// OBTENER UN BEAT POR ID
// ======================================================
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM beats WHERE id = ?";
    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error("Error al obtener beat:", error);
            return res.status(500).json({ mensaje: "Error en el servidor." });
        }
        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: "Beat no encontrado." });
        }
        res.json(resultados[0]);
    });
});

// ======================================================
// CREAR UN NUEVO BEAT
// ======================================================
router.post("/", (req, res) => {
    const { titulo, genero, bpm, tonalidad, precio, licencia, youtube_url, estado } = req.body;

    if (!titulo || !genero || !precio) {
        return res.status(400).json({ mensaje: "Título, género y precio son obligatorios." });
    }

    const sql = `
        INSERT INTO beats (titulo, genero, bpm, tonalidad, precio, licencia, youtube_url, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [titulo, genero, bpm, tonalidad, precio, licencia, youtube_url, estado || 'Publicado'];

    db.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al crear beat:", error);
            return res.status(500).json({ mensaje: "No se pudo crear el beat." });
        }
        res.status(201).json({
            mensaje: "Beat creado correctamente.",
            id: resultado.insertId
        });
    });
});

// ======================================================
// ACTUALIZAR UN BEAT
// ======================================================
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { titulo, genero, bpm, tonalidad, precio, licencia, youtube_url, estado } = req.body;

    const sql = `
        UPDATE beats
        SET titulo = ?, genero = ?, bpm = ?, tonalidad = ?, precio = ?, licencia = ?, youtube_url = ?, estado = ?
        WHERE id = ?
    `;
    const valores = [titulo, genero, bpm, tonalidad, precio, licencia, youtube_url, estado, id];

    db.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al actualizar beat:", error);
            return res.status(500).json({ mensaje: "Error en el servidor." });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Beat no encontrado." });
        }
        res.json({ mensaje: "Beat actualizado correctamente." });
    });
});

// ======================================================
// ELIMINAR UN BEAT
// ======================================================
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM beats WHERE id = ?";

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al eliminar beat:", error);
            return res.status(500).json({ mensaje: "Error en el servidor." });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Beat no encontrado." });
        }
        res.json({ mensaje: "Beat eliminado correctamente." });
    });
});

module.exports = router;
