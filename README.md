# Sistema de Inventario de Equipos de Cómputo

Aplicación web para gestionar inventario de equipos de computo utilizando Node.js y MongoDB.

## Características

- Gestión de equipos (Laptops, Desktops, Servidores, etc.)
- API RESTful
- Interfaz web responsive
- Base de datos MongoDB

## Instalación

1. Clonar el repositorio
2. Usar Node.js >= 20.19.0
3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Copiar `.env.example` a `.env` y ajustar valores:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/inventario
   NODE_ENV=development
   ```

5. Iniciar MongoDB (asegurarse que esté corriendo)

6. Iniciar la aplicación:
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## API Endpoints

### Equipos
- `GET /api/equipos` - Obtener todos los equipos
- `GET /api/equipos/:id` - Obtener equipo por ID
- `POST /api/equipos` - Crear nuevo equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Eliminar equipo

## Estructura del Proyecto

```
inventario-computo/
├── server.js        # Servidor principal (Express + middlewares + rutas)
├── server-memory.js # Servidor de prueba con datos en memoria
├── models/          # Modelos de datos (Mongoose)
│   ├── Equipo.js    # Modelo de equipos
│   └── Historial.js # Modelo de historial de cambios
├── routes/          # Rutas de la app
│   ├── index.js     # Ruta principal (render de la vista)
│   ├── equipos-api.js   # API REST de equipos
│   ├── equipos-view.js  # Vistas de equipos (crear/editar)
│   └── historial.js     # API REST de historial
├── views/           # Vistas EJS
│   ├── index.ejs         # Vista principal con UI y modales
│   └── agregar-equipo.ejs # Formulario standalone de equipos
├── public/          # Archivos estáticos
│   ├── css/
│   │   ├── index.css  # Estilos específicos de la página principal
│   │   └── style.css  # Estilos base compartidos
│   └── js/
│       ├── index.js       # Lógica UI de la página principal
│       ├── equipo-form.js # Lógica del formulario de equipo
│       └── main.js        # Scripts generales
├── uploads/         # Archivos subidos
├── models/          # Modelos de datos (Mongoose)
├── routes/          # Rutas de la API
├── views/           # Vistas EJS
├── public/          # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── images/
├── .env             # Variables de entorno locales
├── .gitignore       # Archivos ignorados por Git
├── package.json     # Dependencias y scripts
└── package-lock.json # Lockfile de dependencias
```

## Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB + Mongoose
- EJS (Motor de plantillas)
- Bootstrap 5
