// routes/apiRoutes.js
const express = require('express');
const guestController = require('../controllers/guestController');
const authController = require('../controllers/authController');
const visitController = require('../controllers/visitController');
const authToken = require('../middlewares/authToken');

const router = express.Router();

// Auth Routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Guest Routes
router.get('/guest', authToken, guestController.getAllGuest);
router.get('/guest/:nik', authToken, guestController.getGuestByNIK);
router.post('/guest/add', authToken, guestController.addGuest);
router.put('/guest/:nik/rfid', authToken, guestController.updateRFIDByNIK);
router.delete('/guest/:nik/delete', authToken, guestController.deleteGuest);

// Visit Routes
router.get('/visit', authToken, visitController.getAllVisits);
router.get('/visit/nik/:nik', authToken, visitController.getVisitByNIK);
router.post('/visit/scan', authToken, visitController.scanRFID);
router.put('/visit/:id/add', authToken, visitController.addVisit);
router.delete('/visit/:id/delete', authToken, visitController.deleteVisit);

module.exports = router;