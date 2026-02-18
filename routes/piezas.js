const express = require('express');
const router = express.Router();
const Pieza = require('../models/Pieza');

// GET todas las piezas
router.get('/', async (req, res) => {
    try {
        const piezas = await Pieza.find().populate('equipoAsociado');
        res.json(piezas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET una pieza por ID
router.get('/:id', async (req, res) => {
    try {
        const pieza = await Pieza.findById(req.params.id).populate('equipoAsociado');
        if (!pieza) return res.status(404).json({ message: 'Pieza no encontrada' });
        res.json(pieza);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST nueva pieza
router.post('/', async (req, res) => {
    try {
        const pieza = new Pieza(req.body);
        const nuevaPieza = await pieza.save();
        res.status(201).json(nuevaPieza);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT actualizar pieza
router.put('/:id', async (req, res) => {
    try {
        const pieza = await Pieza.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pieza) return res.status(404).json({ message: 'Pieza no encontrada' });
        res.json(pieza);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE eliminar pieza
router.delete('/:id', async (req, res) => {
    try {
        const pieza = await Pieza.findByIdAndDelete(req.params.id);
        if (!pieza) return res.status(404).json({ message: 'Pieza no encontrada' });
        res.json({ message: 'Pieza eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;