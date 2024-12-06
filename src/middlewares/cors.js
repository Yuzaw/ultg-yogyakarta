// middleware/corsMiddleware.js
const cors = require('cors');

const corsOptions = {
  origin: '*', // Ganti dengan URL frontend Anda untuk keamanan
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
