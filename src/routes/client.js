const express = require('express');
const path = require('path');

const router = express.Router();

// Route utama untuk halaman frontend
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});
router.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/choice.html'));
});
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/daftar.html'));
});
router.get('/in', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/scanMasuk.html'));
});
router.get('/out', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/scanKeluar.html'));
});
router.get('/visits', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/listKunjungan.html'));
});
router.get('/guests', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/listTamu.html'));
});
router.get('/generate', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/generateRFID.html'));
});
router.get('/thanks', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/thanks.html'));
});

//
router.get('/navigation', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/components/navigation.html'));
});







// style for front-end
router.get('/style/main', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/styles/main.css'));
});

router.get('/style/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/styles/login.css'));
});





// function for front-end
router.get('/scripts/mainAPP', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/scripts/main.js'));
});
router.get('/scripts/APP', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/scripts/APP.js'));
});
router.get('/scripts/include', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/scripts/include.js'));
});

// 
router.get('/style', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/styles'));
});
module.exports = router;
