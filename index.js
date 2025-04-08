// index.js

// We import express 
const express = require('express');

// We import all routes modules we work with
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

// We setup express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse json from all requests
app.use(express.json());

// Api routes for all functions
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/receipt', receiptRoutes);

// Server start
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});