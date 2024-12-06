// routes/apiRoutes.js
const express = require('express');
const dataController = require('../controllers/dataController');

const router = express.Router();

// Routes
router.get('/data', dataController.getAllData);               // Get all data
router.get('/data/:id', dataController.getDataById);          // Get data by ID
router.post('/data/add', dataController.addData);                 // Add new data
router.put('/data/:id/edit', dataController.editData);             // Edit data by ID
router.delete('/data/:id/delete', dataController.deleteData);        // Delete data by ID
module.exports = router;
