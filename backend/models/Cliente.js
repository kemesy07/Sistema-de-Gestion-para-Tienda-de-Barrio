const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre:    { type: String, required: true, trim: true },
  telefono:  { type: String, trim: true },
  direccion: { type: String, trim: true },
  deuda:     { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
