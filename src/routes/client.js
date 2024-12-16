const express = require('express');
const path = require('path');

const router = express.Router();

// pages route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/index.html'));
});
router.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/homepage.html'));
});
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/register.html'));
});
router.get('/in', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/in.html'));
});
router.get('/out', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/out.html'));
});
router.get('/visits', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/visits.html'));
});
router.get('/guests', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/guests.html'));
});

// styles route
router.get('/styles/styles', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/styles/styles.css'));
});

// scripts route

module.exports = router;
