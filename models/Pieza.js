const mongoose = require('mongoose');

const piezaSchema = new mongoose.Schema({
    nombrePieza: {
        type: String,
        required: true
    },
    tipoPieza: {
        type: String,
        required: true,
        enum: ['Procesador', 'Memoria RAM', 'Disco Duro', 'Tarjeta Madre', 'Tarjeta Gráfica', 'Fuente de Poder', 'Otro']
    },
    marca: String,
    modelo: String,
    numeroSerie: String,
    especificaciones: String,
    estado: {
        type: String,
        enum: ['Nuevo', 'Usado', 'Defectuoso'],
        default: 'Usado'
    },
    cantidad: {
        type: Number,
        default: 1
    },
    ubicacion: String,
    proveedor: String,
    costo: Number,
    fechaCompra: {
        type: Date,
        default: Date.now
    },
    equipoAsociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipo'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pieza', piezaSchema);