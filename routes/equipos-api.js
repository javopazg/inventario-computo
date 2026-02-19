const express = require('express');
const { z } = require('zod');
const router = express.Router();
const Equipo = require('../models/Equipo');

const equipoSchema = z.object({
    numeroActivo: z.string().min(1),
    tipoEquipo: z.enum(['Laptop', 'PC']),
    marca: z.string().min(1),
    modelo: z.string().min(1),
    cpu: z.string().min(1),
    ram: z.string().min(1),
    disco: z.string().min(1),
    numeroSerie: z.string().min(1),
    anioCompra: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
    ubicacion: z.string().min(1),
    usuarioAsignado: z.string().min(1),
    claveAdministrador: z.string().optional().nullable(),
    claveRemota: z.string().optional().nullable(),
    tipoEscritorioRemoto: z.string().optional().nullable(),
    claveBIOS: z.string().optional().nullable(),
    comentario: z.string().optional().nullable(),
    estado: z.enum(['Nuevo', 'Usado', 'En reparación', 'Dado de baja']).optional()
});

const equipoUpdateSchema = equipoSchema.partial();

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
        const parsed = equipoSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.flatten() });
        }
        const equipo = new Equipo(parsed.data);
        const nuevoEquipo = await equipo.save();
        if (nuevoEquipo.usuarioAsignado) {
            const Historial = require('../models/Historial');
            const historial = new Historial({
                equipoId: nuevoEquipo._id,
                campoModificado: 'usuarioAsignado',
                valorAnterior: 'Sin asignar',
                valorNuevo: nuevoEquipo.usuarioAsignado,
                modificadoPor: 'Usuario del sistema'
            });
            await historial.save();
            await Equipo.findByIdAndUpdate(
                nuevoEquipo._id,
                { $push: { historialCambios: historial._id } }
            );
        }
        res.status(201).json(nuevoEquipo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT actualizar equipo
router.put('/:id', async (req, res) => {
    try {
        const parsed = equipoUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.flatten() });
        }
        const equipoActual = await Equipo.findById(req.params.id);
        if (!equipoActual) return res.status(404).json({ message: 'Equipo no encontrado' });
        
        // Verificar si cambió el usuario asignado
        if (parsed.data.usuarioAsignado && parsed.data.usuarioAsignado !== equipoActual.usuarioAsignado) {
            const Historial = require('../models/Historial');
            
            // Crear registro en historial
            const historial = new Historial({
                equipoId: req.params.id,
                campoModificado: 'usuarioAsignado',
                valorAnterior: equipoActual.usuarioAsignado || 'Sin asignar',
                valorNuevo: parsed.data.usuarioAsignado,
                modificadoPor: 'Usuario del sistema'
            });
            
            await historial.save();
            
            // Actualizar el equipo para incluir este historial
            await Equipo.findByIdAndUpdate(
                req.params.id,
                { $push: { historialCambios: historial._id } }
            );
        }
        
        const equipo = await Equipo.findByIdAndUpdate(
            req.params.id,
            parsed.data,
            { new: true, runValidators: true }
        );
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
