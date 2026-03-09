const router  = require('express').Router();
const Cliente = require('../models/Cliente');

router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.json({ ok: true, data: clientes });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await Cliente.findById(req.params.id);
    if (!c) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, data: c });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const c = new Cliente(req.body);
    await c.save();
    res.status(201).json({ ok: true, data: c });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const c = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, data: c });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const c = await Cliente.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, mensaje: 'Cliente eliminado' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
