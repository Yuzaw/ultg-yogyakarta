const express = require('express');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./middlewares/cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser()); 

// Route utama untuk cek server
app.get('/', (req, res) => {
  res.send('Server Connected');
});

// Routes
app.use('/api', apiRoutes); // Prefix semua routes dengan /api

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
