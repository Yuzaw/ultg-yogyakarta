// config/storage.js
require('dotenv').config(); // Memuat file .env

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.bucketName;
const bucket = storage.bucket(bucketName);

module.exports = bucket; // Export objek bucket
