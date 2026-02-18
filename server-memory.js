const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Datos en memoria para empezar
let equipos = [
    {
        _id: '1',
        tipoEquipo: 'Laptop',
        marca: 'Dell',
        modelo: 'Latitude 5420',
        numeroSerie: 'DL001',
        procesador: 'Intel i5',
        memoriaRAM: '8GB',
        almacenamiento: '256GB SSD',
        estado: 'Usado',
        ubicacion: 'Oficina 1',
        responsable: 'Juan Pérez'
    }
];

let piezas = [
    {
        _id: '1',
        nombrePieza: 'Memoria RAM DDR4',
        tipoPieza: 'Memoria RAM',
        marca: 'Corsair',
        modelo: 'Vengeance LPX',
        especificaciones: '8GB 3200MHz',
        estado: 'Nuevo',
        cantidad: 5,
        ubicacion: 'Almacén'
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
app.get('/api/piezas', (req, res) => res.json(piezas));

// Rutas principales
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} en tu navegador`);
});