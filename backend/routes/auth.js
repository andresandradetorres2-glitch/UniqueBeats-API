const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Conexión con la base de datos
const db = require("../database");

// ======================================================
// REGISTRO DE USUARIOS
// ======================================================

router.post("/register", async (req, res) => {

    // Recibir los datos enviados desde el frontend
    const { usuario, password, tipo } = req.body;

    // Validar que los campos obligatorios estén completos
    if (!usuario || !password) {
        return res.status(400).json({
            mensaje: "El usuario y la contraseña son obligatorios."
        });
    }

    // Si no se especifica tipo, se crea como usuario normal
    const tipoUsuario = tipo || "usuario";

    try {

        // Verificar si el usuario ya existe
        const sqlBuscar = "SELECT * FROM usuarios WHERE usuario = ?";

        db.query(sqlBuscar, [usuario], async (error, resultados) => {

            if (error) {
                console.error("Error al buscar usuario:", error);

                return res.status(500).json({
                    mensaje: "Error en el servidor."
                });
            }

            // Si ya existe
            if (resultados.length > 0) {
                return res.status(409).json({
                    mensaje: "El usuario ya existe."
                });
            }

            // Encriptar la contraseña antes de guardarla
            const passwordEncriptada = await bcrypt.hash(password, 10);

            // Insertar nuevo usuario
            const sqlInsertar = `
                INSERT INTO usuarios (usuario, password, tipo)
                VALUES (?, ?, ?)
            `;

            db.query(
                sqlInsertar,
                [usuario, passwordEncriptada, tipoUsuario],
                (error) => {

                    if (error) {
                        console.error("Error al registrar usuario:", error);

                        return res.status(500).json({
                            mensaje: "No se pudo registrar el usuario."
                        });
                    }

                    res.status(201).json({
                        mensaje: "Usuario registrado correctamente."
                    });
                }
            );
        });

    } catch (error) {

        console.error("Error:", error);

        res.status(500).json({
            mensaje: "Error interno del servidor."
        });
    }
});


// ======================================================
// INICIO DE SESIÓN
// ======================================================

router.post("/login", (req, res) => {

    // Obtener usuario y contraseña enviados
    const { usuario, password } = req.body;

    // Verificar que ambos campos hayan sido enviados
    if (!usuario || !password) {
        return res.status(400).json({
            mensaje: "El usuario y la contraseña son obligatorios."
        });
    }

    // Buscar el usuario en la base de datos
    const sql = "SELECT * FROM usuarios WHERE usuario = ?";

    db.query(sql, [usuario], async (error, resultados) => {

        // Error en la consulta
        if (error) {

            console.error("Error en la consulta:", error);

            return res.status(500).json({
                mensaje: "Error en el servidor."
            });
        }

        // Usuario no encontrado
        if (resultados.length === 0) {

            return res.status(401).json({
                mensaje: "Error en la autenticación."
            });
        }

        // Obtener el usuario encontrado
        const usuarioEncontrado = resultados[0];

        // Comparar la contraseña ingresada con la contraseña
        // encriptada almacenada en la base de datos
        const passwordCorrecta = await bcrypt.compare(
            password,
            usuarioEncontrado.password
        );

        // Contraseña incorrecta
        if (!passwordCorrecta) {

            return res.status(401).json({
                mensaje: "Error en la autenticación."
            });
        }

        // ==================================================
        // AUTENTICACIÓN CORRECTA
        // ==================================================

        res.json({

            mensaje: "Autenticación satisfactoria.",

            usuario: usuarioEncontrado.usuario,

            tipo: usuarioEncontrado.tipo

        });

    });
});


// Exportar las rutas
module.exports = router;