# UniqueBeats API

## Descripción

Servicio web desarrollado como parte de la evidencia GA7-220501096-AA5-EV01 del programa ADSO del SENA.

El proyecto implementa un servicio web para el registro y autenticación de usuarios mediante una API REST desarrollada con Node.js, Express y MySQL.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- MySQL
- bcryptjs

## Funcionalidades

### Registro de usuarios

Permite registrar nuevos usuarios proporcionando:

- Usuario
- Contraseña
- Tipo de usuario

La contraseña es almacenada de forma encriptada utilizando bcrypt.

### Inicio de sesión

Permite autenticar un usuario mediante su usuario y contraseña.

Cuando las credenciales son correctas, el servicio devuelve:

Autenticación satisfactoria.
Cuando las credenciales son incorrectas, devuelve:

Error en la autenticación.


#### Estructura del proyecto
UniqueBeats-API/
UniqueBeats-API/
│
├── backend/
│   ├── database.js
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── routes/
│       └── auth.js
│
├── frontend/
│   ├── Index-UniqueBeats.html
│   ├── login.html
│   ├── login.js
│   ├── register.html
│   ├── register.js
│   ├── script.js
│   └── styles.css
│
├── .gitignore
└── README.md

##### API

Registro
POST /api/auth/register

Ejemplo:

{
    "usuario": "usuario",
    "password": "123456",
    "tipo": "usuario"
}
Inicio de sesión
POST /api/auth/login

Ejemplo:

{
    "usuario": "usuario",
    "password": "123456"
}


###### Autor
Andrés Felipe Andrade Torres
