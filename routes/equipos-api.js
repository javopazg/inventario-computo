const express = require('express');
const router = express.Router();
const Equipo = require('../models/Equipo');

// GET todos los equipos
router.get('/', async (req, res) => {
    try {
        const equipos = await Equipo.find().populate('piezasAsociadas');
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET un equipo por ID
router.get('/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id).populate('piezasAsociadas');
        if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.json(equipo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST nuevo equipo
router.post('/', async (req, res) => {
    try {
        const equipo = new Equipo(req.body);
        const nuevoEquipo = await equipo.save();
        res.status(201).json(nuevoEquipo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT actualizar equipo
router.put('/:id', async (req, res) => {
    try {
        const equipoActual = await Equipo.findById(req.params.id);
        if (!equipoActual) return res.status(404).json({ message: 'Equipo no encontrado' });
        
        // Verificar si cambió el usuario asignado
        if (req.body.usuarioAsignado && req.body.usuarioAsignado !== equipoActual.usuarioAsignado) {
            const Historial = require('../models/Historial');
            
            // Crear registro en historial
            const historial = new Historial({
                equipoId: req.params.id,
                campoModificado: 'usuarioAsignado',
                valorAnterior: equipoActual.usuarioAsignado || 'Sin asignar',
                valorNuevo: req.body.usuarioAsignado,
                modificadoPor: 'Usuario del sistema'
            });
            
            await historial.save();
            
            // Actualizar el equipo para incluir este historial
            await Equipo.findByIdAndUpdate(
                req.params.id,
                { $push: { historialCambios: historial._id } }
            );
        }
        
        const equipo = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(equipo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE eliminar equipo
router.delete('/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findByIdAndDelete(req.params.id);
        if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.json({ message: 'Equipo eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;