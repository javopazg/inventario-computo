const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const Equipo = require('../models/Equipo');

// GET historial de un equipo
router.get('/equipo/:equipoId', async (req, res) => {
    try {
        const historial = await Historial.find({ equipoId: req.params.equipoId })
            .sort({ fechaCambio: -1 })
            .populate('equipoId', 'numeroActivo marca modelo');
        
        res.json(historial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST crear nuevo registro de historial
router.post('/', async (req, res) => {
    try {
        const historial = new Historial(req.body);
        const nuevoHistorial = await historial.save();
        
        // Actualizar el equipo para incluir este historial
        await Equipo.findByIdAndUpdate(
            req.body.equipoId,
            { $push: { historialCambios: nuevoHistorial._id } }
        );
        
        res.status(201).json(nuevoHistorial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET todo el historial
router.get('/', async (req, res) => {
    try {
        const historial = await Historial.find()
            .sort({ fechaCambio: -1 })
            .populate('equipoId', 'numeroActivo marca modelo');
        res.json(historial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE eliminar historial
router.delete('/:id', async (req, res) => {
    try {
        const historial = await Historial.findByIdAndDelete(req.params.id);
        if (!historial) return res.status(404).json({ message: 'Historial no encontrado' });
        
        // Remover del historial del equipo
        await Equipo.findByIdAndUpdate(
            historial.equipoId,
            { $pull: { historialCambios: historial._id } }
        );
        
        res.json({ message: 'Historial eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;