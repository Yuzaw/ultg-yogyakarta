// routes/apiRoutes.js
const express = require('express');
const guestController = require('../controllers/guestController');
const authController = require('../controllers/authController');
const visitController = require('../controllers/visitController');
const authToken = require('../middlewares/authToken');
const upload = require('../middlewares/upload');

const router = express.Router();

// Auth Routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Guest Routes
router.get('/guests', authToken, guestController.getAllGuest);
router.get('/guests/:nik', authToken, guestController.getGuestByNIK);
router.post('/guests/scan', authToken, upload.single('image'), guestController.scanKTP);
router.put('/guests/:id', authToken, guestController.updateGuestById);
router.put('/guests/:nik/rfid', authToken, guestController.updateRFIDByNIK);
router.delete('/guests/:nik/delete', authToken, guestController.deleteGuest);

// Visit Routes
router.get('/visits', authToken, visitController.getAllVisits);
router.get('/visits/nik/:nik', authToken, visitController.getVisitByNIK);
router.post('/visits/scan', authToken, visitController.scanRFID);
router.put('/visits/:id/add', authToken, visitController.addVisit);
router.put('/visits/out', authToken, visitController.editJamOut);
router.delete('/visits/:id/delete', authToken, visitController.deleteVisit);

module.exports = router;