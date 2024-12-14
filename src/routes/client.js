const express = require('express');
const path = require('path');

const router = express.Router();

// Route utama untuk halaman frontend
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
router.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/homepage.html'));
});
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});
router.get('/in', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/in.html'));
});
router.get('/out', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/out.html'));
});
router.get('/visits', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/visits.html'));
});
router.get('/guests', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/guests.html'));
});

module.exports = router;
