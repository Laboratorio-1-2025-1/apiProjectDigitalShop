// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders
router.get('/', orderController.getAllOrders);
// Get one order by id
router.get('/:id', orderController.getOrder);
// Register one order
router.post('/', orderController.startOrder);
// Update order information
router.put('/:id', orderController.updateOrder);

// We export all modules to index.js
module.exports = router;