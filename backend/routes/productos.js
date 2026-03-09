const router  = require('express').Router();
const Producto = require('../models/Producto');

// GET todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.json({ ok: true, data: productos });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET un producto
router.get('/:id', async (req, res) => {
  try {
    const p = await Producto.findById(req.params.id);
    if (!p) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    res.json({ ok: true, data: p });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST crear producto
router.post('/', async (req, res) => {
  try {
    const p = new Producto(req.body);
    await p.save();
    res.status(201).json({ ok: true, data: p });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const p = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    res.json({ ok: true, data: p });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const p = await Producto.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    res.json({ ok: true, mensaje: 'Producto eliminado' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
