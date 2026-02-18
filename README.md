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

4. Configurar variables de entorno en `.env`:
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
├── models/          # Modelos de datos (Mongoose)
├── routes/          # Rutas de la API
├── views/           # Vistas EJS
├── public/          # Archivos estáticos
│   ├── css/
│   ├── js/
│   └── images/
├── uploads/         # Archivos subidos
├── server.js        # Servidor principal
└── package.json
```

## Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB + Mongoose
- EJS (Motor de plantillas)
- Bootstrap 5
