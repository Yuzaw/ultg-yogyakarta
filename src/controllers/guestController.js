const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const firestore = require('../config/firestore'); // Import Firestore instance

const guestCollection = firestore.collection('guests'); // Nama koleksi Firestore

// Get all guests
exports.getAllGuest = async (req, res) => {
  try {
    const snapshot = await guestCollection.get();
    const guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ message: 'All guests retrieved successfully!', guests });
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ message: 'Failed to retrieve guests', error: error.message });
  }
};

// Get guest by NIK
exports.getGuestByNIK = async (req, res) => {
  const { nik } = req.params;

  try {
    const snapshot = await guestCollection.where('nik', '==', nik).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    const guest = snapshot.docs[0].data();
    res.json({ message: 'Guest retrieved successfully!', guest });
  } catch (error) {
    console.error('Error fetching guest by NIK:', error);
    res.status(500).json({ message: 'Failed to retrieve guest', error: error.message });
  }
};

// Scan KTP
exports.scanKTP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }

    const imagePath = req.file.path;

    // Proses OCR menggunakan Tesseract.js
    const { data: { text } } = await Tesseract.recognize(imagePath, 'ind', {
      logger: (info) => console.log(info),
    });

    console.log('Extracted OCR Text:', JSON.stringify(text, null, 2));

    // Regex untuk menangkap NIK
    const nikMatch = text.match(/(?:NIK|Nik|nik)[^0-9]*([\d\s]{16,})/i); 
    let nik = nikMatch ? nikMatch[1].replace(/\s+/g, '') : null;

    // Regex untuk menangkap Nama
    const namaMatch = text.match(/Nama(?:\s*:\s*|\s+)(.+)/i);
    const nama = namaMatch ? namaMatch[1].trim() : null;

    console.log('Extracted NIK (before cleaning):', nikMatch ? nikMatch[1] : 'not found');
    console.log('Cleaned NIK:', nik);
    console.log('Extracted Name:', nama);

    // Cek apakah NIK sudah ada di Firestore
    const existingSnapshot = await guestCollection.where('nik', '==', nik).get();
    if (!existingSnapshot.empty) {
      return res.status(400).json({
        message: 'NIK already registered!',
        guest: existingSnapshot.docs[0].data(),
      });
    }

    // Jika NIK belum terdaftar, buat data tamu baru
    const newGuest = {
      nik,
      nama,
      instansi: 'Unknown', // Default value for instansi
      rfid_uid: null, // Set RFID UID awal ke null
    };

    // Tambahkan tamu baru ke Firestore
    const newDoc = await guestCollection.add(newGuest);

    // Hapus file yang telah diproses
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.status(200).json({
      message: 'KTP scanned and guest added successfully!',
      extractedText: text,
      extractedData: {
        nik: nik || 'NIK not found',
        nama: nama || 'Name not found',
      },
      newGuest: { id: newDoc.id, ...newGuest },
    });
  } catch (error) {
    console.error(error);

    // Hapus file jika terjadi kesalahan
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({ message: 'An error occurred while scanning KTP.', error: error.message });
  }
};

// Update guest by ID
exports.updateGuestById = async (req, res) => {
  const { id } = req.params;
  const { nik, nama, instansi } = req.body;

  try {
    const guestRef = guestCollection.doc(id);
    const guestSnapshot = await guestRef.get();

    if (!guestSnapshot.exists) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    // Validasi untuk memastikan NIK unik
    if (nik && nik !== guestSnapshot.data().nik) {
      const nikSnapshot = await guestCollection.where('nik', '==', nik).get();
      if (!nikSnapshot.empty) {
        return res.status(400).json({ message: 'NIK already registered to another guest!' });
      }
    }

    // Perbarui data tamu
    const updatedGuest = {
      ...guestSnapshot.data(),
      nik: nik || guestSnapshot.data().nik,
      nama: nama || guestSnapshot.data().nama,
      instansi: instansi || guestSnapshot.data().instansi,
    };

    await guestRef.set(updatedGuest);

    res.json({
      message: 'Guest updated successfully!',
      updatedGuest,
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ message: 'Failed to update guest', error: error.message });
  }
};

// Update RFID by NIK
exports.updateRFIDByNIK = async (req, res) => {
  const { nik } = req.params;
  const { rfid_uid } = req.body;

  try {
    const snapshot = await guestCollection.where('nik', '==', nik).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    const guestRef = snapshot.docs[0].ref;
    const guestData = snapshot.docs[0].data();

    const updatedGuest = { ...guestData, rfid_uid };
    await guestRef.set(updatedGuest);

    res.json({
      message: 'RFID UID updated successfully!',
      updatedGuest,
    });
  } catch (error) {
    console.error('Error updating RFID:', error);
    res.status(500).json({ message: 'Failed to update RFID', error: error.message });
  }
};

// Delete guest
exports.deleteGuest = async (req, res) => {
  const { nik } = req.params;

  try {
    const snapshot = await guestCollection.where('nik', '==', nik).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    await snapshot.docs[0].ref.delete();
    res.json({ message: 'Guest deleted successfully!' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ message: 'Failed to delete guest', error: error.message });
  }
};
