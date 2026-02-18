const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    equipoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipo',
        required: true
    },
    campoModificado: {
        type: String,
        required: true,
        enum: ['usuarioAsignado']
    },
    valorAnterior: {
        type: String,
        required: true
    },
    valorNuevo: {
        type: String,
        required: true
    },
    fechaCambio: {
        type: Date,
        default: Date.now
    },
    modificadoPor: {
        type: String,
        default: 'Sistema'
    },
    motivoCambio: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Historial', historialSchema);