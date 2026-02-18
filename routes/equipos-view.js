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

module.exports = router;