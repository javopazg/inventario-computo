const express = require('express');
const router = express.Router();
const Equipo = require('../models/Equipo');

// Vista del formulario de agregar equipo
router.get('/nuevo', (req, res) => {
    res.render('agregar-equipo', { title: 'Agregar Nuevo Equipo', equipo: null });
});

// Vista del formulario de editar equipo
router.get('/editar/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        if (!equipo) return res.status(404).render('error', { message: 'Equipo no encontrado' });
        res.render('agregar-equipo', { title: 'Editar Equipo', equipo });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
});

// GET todos los equipos
router.get('/', async (req, res) => {
    try {
        const equipos = await Equipo.find();
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET un equipo por ID
router.get('/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
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
        const equipo = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
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
