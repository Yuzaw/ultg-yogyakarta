// config/storage.js
require('dotenv').config(); // Memuat file .env

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Mengambil nilai kredensial dari variabel lingkungan
});

const bucketName = 'ultg-yogyakarta'; // Ganti dengan nama bucket Google Cloud Storage kamu
const bucket = storage.bucket(bucketName);

module.exports = bucket; // Export objek bucket
