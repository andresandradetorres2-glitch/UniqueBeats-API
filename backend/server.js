const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const beatsRoutes = require("./routes/beats");
const statsRoutes = require("./routes/stats");
const verificarToken = require("./middleware/authMiddleware");

const app = express();
console.log("CWD:", process.cwd());


// Permitir peticiones desde el frontend
app.use(cors());

// Permitir recibir datos en formato JSON
app.use(express.json());

// Servir archivos estáticos de la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de beats
app.use("/api/beats", beatsRoutes);

// Rutas de estadísticas
app.use("/api/stats", statsRoutes);

// Ruta principal para comprobar que el servidor funciona
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de autenticación UniqueBeats funcionando."
    });
});

// Iniciar servidor
const PORT = 3002;

app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    res.status(err.status || 500).json({
        mensaje: err.message || "Error interno del servidor",
        error: err
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});