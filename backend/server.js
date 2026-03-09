const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas',    require('./routes/ventas'));
app.use('/api/clientes',  require('./routes/clientes'));

app.get('/api', (req, res) => {
  res.json({ mensaje: 'API REST - Tienda de Barrio', version: '1.0.0' });
});

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tienda_barrio';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Error MongoDB:', err.message));
});
