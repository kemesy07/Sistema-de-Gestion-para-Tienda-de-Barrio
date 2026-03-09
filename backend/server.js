const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));   // sirve el frontend desde el mismo proceso

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/productos',  require('./routes/productos'));
app.use('/api/ventas',     require('./routes/ventas'));
app.use('/api/clientes',   require('./routes/clientes'));

// ── Ruta raíz (health-check) ─────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    mensaje: 'API REST - Sistema de Gestión para Tienda de Barrio',
    version: '1.0.0',
    autor: 'Keidy Mercado Sierra',
    endpoints: [
      'GET/POST  /api/productos',
      'GET/PUT/DELETE /api/productos/:id',
      'GET/POST  /api/ventas',
      'GET/PUT/DELETE /api/ventas/:id',
      'GET/POST  /api/clientes',
      'GET/PUT/DELETE /api/clientes/:id'
    ]
  });
});

// ── Conexión MongoDB ─────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_barrio';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error conectando MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
