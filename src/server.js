const express = require('express');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./middlewares/cors');
const apiRoutes = require('./routes/api');
const clientRoutes = require('./routes/client');

const app = express();
const PORT = 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser()); 
app.use(express.static('public'));
app.use(express.static('public'));
// Routes
app.use('/', clientRoutes);
app.use('/api', apiRoutes); // Prefix semua routes dengan /api

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
