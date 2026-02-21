# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack inventory management system for computer equipment using Node.js, Express, MongoDB, and Bootstrap 5. The application tracks laptops/PCs with automatic user assignment history logging.

## Development Commands

```bash
# Development with auto-reload
npm run dev

# Production mode
npm start

# Quick mode (in-memory, no MongoDB required)
npm run quick

# Check service status (if using systemd)
sudo systemctl status inventario
sudo journalctl -u inventario -f
```

## Required Environment Variables

Create `.env` file (see `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventario
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Architecture

### MVC Pattern
- **Models**: `/models/` - Mongoose schemas (Equipo, Historial)
- **Views**: `/views/` - EJS templates
- **Routes**: `/routes/` - API and view routes (controllers are inline here)

### Middleware Stack (server.js order matters)
1. CORS - Configured via CORS_ORIGIN env var
2. Helmet - CSP allows Kaspersky antivirus scripts
3. Rate Limiting - 300 requests per 15 minutes
4. Body Parsers - JSON and URL-encoded (1MB limit)
5. Mongo Sanitize - NoSQL injection protection
6. Static Files - `/public` and `/node_modules` (as `/vendor`)

### API Structure
- `/api/equipos` - CRUD operations for equipment
- `/api/historial` - History tracking (read-only from UI, auto-created on user changes)
- `/equipos` - View routes (redirects to `/` for main view)

## Critical Implementation Details

### Automatic History Tracking
When `usuarioAsignado` changes on an Equipo:
1. A new Historial record is automatically created
2. The record captures: equipoId, valorAnterior, valorNuevo, fechaCambio
3. If estado becomes "Disponible", current user is archived to history
4. Frontend displays history in dedicated modal with timeline

**Important**: Do not manually call POST `/api/historial` from frontend. History is created server-side in PUT `/api/equipos/:id` route handler.

### Data Validation
- **Backend**: Zod schemas in `/routes/equipos-api.js`
- **Frontend**: HTML5 validation + `escapeHtml()` function in `public/js/index.js`
- All user inputs must be validated on both sides

### Frontend State Management
Client-side logic in `public/js/index.js` (~975 lines):
- Uses AbortController to cancel duplicate requests
- Debounced search (250ms) in `debounce()` function
- Client-side pagination (10 items per page)
- Combined filtering by estado + usuarioAsignado
- Modal reuse: same modal switches between view/edit modes

### Security Considerations
- Never commit `.env` file
- CSP configured to allow Bootstrap CDN and Kaspersky antivirus
- All MongoDB queries are sanitized via express-mongo-sanitize
- Passwords/credentials use type="password" with toggle visibility

## Database Schema

### Equipo Model
```javascript
{
  numeroActivo: String (unique, required),
  tipoEquipo: Enum['Laptop', 'PC'],
  marca, modelo, cpu, ram, disco: String (required),
  numeroSerie: String (unique, required),
  anioCompra: Number,
  ubicacion, usuarioAsignado: String (required),
  // Credentials
  claveAdministrador, claveRemota, claveBIOS: String,
  tipoEscritorioRemoto: String,
  // State
  estado: Enum['Disponible', 'En Uso', 'En reparación', 'De Baja'],
  comentario: String,
  historialCambios: [ObjectId] (ref: Historial)
}
```

### Historial Model
```javascript
{
  equipoId: ObjectId (ref: Equipo),
  campoModificado: Enum['usuarioAsignado'],
  valorAnterior, valorNuevo: String (required),
  fechaCambio: Date (default: now),
  modificadoPor: String (default: 'Sistema'),
  motivoCambio: String
}
```

## Frontend Architecture

### Main UI Components (index.ejs + index.js)
- **Dashboard Stats**: Total equipos, laptops, PCs, en uso
- **Filter Chips**: Active filters displayed as removable badges
- **Equipment Table**: Sortable, paginated, with action dropdowns
- **Modals**:
  - Info Modal: Tabs for Datos/Usuarios/Credenciales/Comentarios
  - History Modal: Timeline view of user assignments

### CSS Custom Properties
Design tokens defined in `public/css/style.css`:
- `--avatar-primary`: #1e40af (blue)
- `--avatar-secondary`: #06b6d4 (cyan)
- `--avatar-accent`: #f59e0b (amber)
- Additional state colors for success/danger/warning

## Common Tasks

### Adding New Fields to Equipo
1. Update schema in `models/Equipo.js`
2. Add Zod validation in `routes/equipos-api.js`
3. Update frontend form in `views/index.ejs` (modal tabs)
4. Update display logic in `public/js/index.js` (populateInfoModal)

### Extending History Tracking
Currently only tracks `usuarioAsignado`. To track other fields:
1. Modify `campoModificado` enum in `models/Historial.js`
2. Update PUT route logic in `routes/equipos-api.js` to detect changes
3. Add display logic in frontend history modal

### Deployment
See `/docs/DEPLOY.md` for:
- Systemd service configuration
- Nginx reverse proxy setup
- HTTPS with Certbot or mkcert (LAN)
- MongoDB installation

## Known Limitations
- No authentication system (assumes internal/LAN deployment)
- Client-side pagination only (may not scale to 10,000+ items)
- History tracking limited to user assignment changes
- Hard deletes (no soft delete/archival system)
