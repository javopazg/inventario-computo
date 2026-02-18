const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : true;

app.use(cors({ origin: corsOrigins }));
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario')
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

// Rutas
app.use('/', require('./routes/index'));
app.get('/equipos', (req, res) => res.redirect('/'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Rutas de vistas para equipos
const equiposViewRouter = express.Router();
equiposViewRouter.get('/nuevo', (req, res) => {
    res.render('agregar-equipo', { title: 'Agregar Nuevo Equipo', equipo: null });
});
equiposViewRouter.get('/editar/:id', async (req, res) => {
    try {
        const Equipo = require('./models/Equipo');
        const equipo = await Equipo.findById(req.params.id);
        if (!equipo) return res.status(404).render('error', { message: 'Equipo no encontrado' });
        res.render('agregar-equipo', { title: 'Editar Equipo', equipo });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});
app.use('/equipos', equiposViewRouter);

// Rutas API
app.use('/api/equipos', require('./routes/equipos-api'));
app.use('/api/historial', require('./routes/historial'));

// 404
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
