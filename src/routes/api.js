// routes/apiRoutes.js
const express = require('express');
const guestController = require('../controllers/guestController');
const authController = require('../controllers/authController');
const visitController = require('../controllers/visitController');
const authToken = require('../middlewares/authToken');
const upload = require('../middlewares/upload');
const convertJsonToCsv = require('../middlewares/csv');

const router = express.Router();

// Auth Routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Guest Routes
router.get('/guests', authToken, guestController.getAllGuest);
router.get('/guests/:id', authToken, guestController.getGuestById);
router.post('/guests/scan', authToken, upload.single('image'), guestController.scanKTP);
router.put('/guests/:id/update', authToken, guestController.updateGuestById);
router.put('/guests/:id/rfid', authToken, guestController.updateRFIDById);
router.delete('/guests/:id/delete', authToken, guestController.deleteGuest);
router.get('/download-guests', authToken, convertJsonToCsv, guestController.downloadGuests);

// Visit Routes
router.get('/visits', authToken, visitController.getAllVisits);
router.get('/visits/:id', authToken, visitController.getVisitByID);
router.post('/visits/in', authToken, visitController.scanRFID);
router.put('/visits/:id/in', authToken, visitController.addVisit);
router.put('/visits/out', authToken, visitController.editJamOut);
router.delete('/visits/:id/delete', authToken, visitController.deleteVisit);
router.get('/download-visits', authToken, convertJsonToCsv, visitController.downloadVisits);

module.exports = router;