const router   = require('express').Router();
const Venta    = require('../models/Venta');
const Producto = require('../models/Producto');
const Cliente  = require('../models/Cliente');

// GET todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find().populate('cliente', 'nombre').sort({ createdAt: -1 });
    res.json({ ok: true, data: ventas });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET una venta
router.get('/:id', async (req, res) => {
  try {
    const v = await Venta.findById(req.params.id).populate('cliente');
    if (!v) return res.status(404).json({ ok: false, error: 'Venta no encontrada' });
    res.json({ ok: true, data: v });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST registrar venta (descuenta stock automáticamente)
router.post('/', async (req, res) => {
  const session = await Venta.startSession();
  session.startTransaction();
  try {
    const { items, tipoPago, cliente: clienteId, observacion } = req.body;
    if (!items || items.length === 0) throw new Error('La venta debe tener al menos un producto');

    let total = 0;
    const itemsCompletos = [];

    for (const item of items) {
      const prod = await Producto.findById(item.producto).session(session);
      if (!prod) throw new Error(`Producto ${item.producto} no existe`);
      if (prod.stock < item.cantidad) throw new Error(`Stock insuficiente para "${prod.nombre}"`);

      const subtotal = prod.precio * item.cantidad;
      total += subtotal;
      itemsCompletos.push({ producto: prod._id, nombre: prod.nombre, cantidad: item.cantidad, precioUnit: prod.precio, subtotal });

      prod.stock -= item.cantidad;
      await prod.save({ session });
    }

    // Si es crédito, actualizar deuda del cliente
    if (tipoPago === 'credito' && clienteId) {
      await Cliente.findByIdAndUpdate(clienteId, { $inc: { deuda: total } }, { session });
    }

    const venta = new Venta({ items: itemsCompletos, total, tipoPago, cliente: clienteId || null, observacion });
    await venta.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ ok: true, data: venta });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ ok: false, error: e.message });
  }
});

// DELETE anular venta
router.delete('/:id', async (req, res) => {
  try {
    const v = await Venta.findByIdAndDelete(req.params.id);
    if (!v) return res.status(404).json({ ok: false, error: 'Venta no encontrada' });
    res.json({ ok: true, mensaje: 'Venta eliminada' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
