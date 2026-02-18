# Sistema de Inventario de Equipos de Cómputo

Aplicación web para gestionar inventario de equipos y piezas de computo utilizando Node.js y MongoDB.

## Características

- Gestión de equipos (Laptops, Desktops, Servidores, etc.)
- Gestión de piezas y componentes
- API RESTful
- Interfaz web responsive
- Base de datos MongoDB

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno en `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/inventario
   JWT_SECRET=clave_secreta_para_jwt
   NODE_ENV=development
   ```

4. Iniciar MongoDB (asegurarse que esté corriendo)

5. Iniciar la aplicación:
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

### Piezas
- `GET /api/piezas` - Obtener todas las piezas
- `GET /api/piezas/:id` - Obtener pieza por ID
- `POST /api/piezas` - Crear nueva pieza
- `PUT /api/piezas/:id` - Actualizar pieza
- `DELETE /api/piezas/:id` - Eliminar pieza

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
- JWT (Autenticación)