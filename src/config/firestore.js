require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firestore
const firestore = new Firestore({
    projectId: process.env.projectId,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

module.exports = firestore;
