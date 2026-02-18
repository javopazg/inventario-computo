const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario')
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

// Rutas
app.use('/', require('./routes/index'));

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
app.use('/api/piezas', require('./routes/piezas'));
app.use('/api/historial', require('./routes/historial'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});