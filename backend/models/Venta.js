const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema({
  producto:   { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombre:     { type: String, required: true },
  cantidad:   { type: Number, required: true, min: 1 },
  precioUnit: { type: Number, required: true },
  subtotal:   { type: Number, required: true }
}, { _id: false });

const ventaSchema = new mongoose.Schema({
  items:        { type: [itemVentaSchema], required: true },
  total:        { type: Number, required: true },
  cliente:      { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  tipoPago:     { type: String, enum: ['efectivo', 'credito'], default: 'efectivo' },
  observacion:  { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Venta', ventaSchema);
