// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProduct);
// Get one product by id
router.get('/:id', productController.getProduct);
// Register one product
router.post('/', productController.addProduct);
// Update product information
router.put('/:id', productController.updateProduct);
// Delete a product
router.delete('/:id', productController.deleteProduct);

// We export all modules to index.js
module.exports = router;