const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Datos en memoria para empezar
let equipos = [
    {
        _id: '1',
        numeroActivo: 'AG-001',
        tipoEquipo: 'Laptop',
        marca: 'Dell',
        modelo: 'Latitude 5420',
        cpu: 'Intel i5',
        ram: '8GB',
        disco: '256GB SSD',
        numeroSerie: 'DL001',
        anioCompra: 2022,
        estado: 'Usado',
        ubicacion: 'Oficina 1',
        usuarioAsignado: 'Juan Pérez'
    }
];


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Rutas API
app.get('/api/equipos', (req, res) => res.json(equipos));

// Rutas principales
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} en tu navegador`);
});
