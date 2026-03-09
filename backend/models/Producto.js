const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true, trim: true },
  categoria:   { type: String, required: true, trim: true },
  precio:      { type: Number, required: true, min: 0 },
  stock:       { type: Number, required: true, min: 0, default: 0 },
  stockMinimo: { type: Number, default: 5 },
  codigo:      { type: String, unique: true, sparse: true, trim: true },
  descripcion: { type: String, trim: true }
}, { timestamps: true });

// Campo virtual: alerta de stock bajo
productoSchema.virtual('alertaStock').get(function () {
  return this.stock <= this.stockMinimo;
});

productoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);
