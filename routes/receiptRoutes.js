// routes/receiptRoutes.js

const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

// Get all receipts
router.get('/', receiptController.getAllReceipts);
// Get one receipt by id
router.get('/:id', receiptController.getReceipt);
// Register one receipt
router.post('/', receiptController.startReceipt);
// Update receipt information
router.put('/:id', receiptController.updateReceipt);
// Update receipt status
router.put('/:id/status', receiptController.updateReceiptStatus);

// We export all modules to index.js
module.exports = router;