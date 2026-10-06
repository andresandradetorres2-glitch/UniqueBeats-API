const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const beatsRoutes = require("./routes/beats");
const verificarToken = require("./middleware/authMiddleware");

const app = express();

// Permitir peticiones desde el frontend
app.use(cors());

// Permitir recibir datos en formato JSON
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas de beats
app.use("/api/beats", beatsRoutes);

// Ruta principal para comprobar que el servidor funciona
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de autenticación UniqueBeats funcionando."
    });
});

// Iniciar servidor
const PORT = 3002;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});