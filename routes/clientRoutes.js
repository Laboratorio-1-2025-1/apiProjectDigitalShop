// routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Get all clients
router.get('/', clientController.getAllClient);
// Get one client by id
router.get('/:id', clientController.getClient);
// Register one client
router.post('/', clientController.addClient);
// Update client information
router.put('/:id', clientController.updateClient);
// Delete a client
router.delete('/:id', clientController.deleteClient);

// We export all modules to index.js
module.exports = router;