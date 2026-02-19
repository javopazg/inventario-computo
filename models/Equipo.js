const mongoose = require('mongoose');

const equipoSchema = new mongoose.Schema({
    numeroActivo: {
        type: String,
        required: true,
        unique: true
    },
    tipoEquipo: {
        type: String,
        required: true,
        enum: ['Laptop', 'PC']
    },
    marca: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    cpu: {
        type: String,
        required: true
    },
    ram: {
        type: String,
        required: true
    },
    disco: {
        type: String,
        required: true
    },
    numeroSerie: {
        type: String,
        required: true,
        unique: true
    },
    anioCompra: {
        type: Number,
        required: true
    },
    ubicacion: {
        type: String,
        required: true
    },
    usuarioAsignado: {
        type: String,
        required: true
    },
    claveAdministrador: String,
    claveRemota: String,
    tipoEscritorioRemoto: String,
    claveBIOS: String,
    comentario: String,
    estado: {
        type: String,
        enum: ['Disponible', 'En Uso', 'En reparación', 'De Baja'],
        default: 'En Uso'
    },
    historialCambios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Historial'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Equipo', equipoSchema);
