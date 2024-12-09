const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const upload = require('../middlewares/upload');

let guestStore = [
  { id: uuidv4(), nik: '36720047456', nama: 'Ilham Andalas', instansi: 'PT. Example', rfid_uid: 'AB12CD34BC5B2' },
  { id: uuidv4(), nik: '23575955784', nama: 'Muhammad Andalas', instansi: 'CV. Example', rfid_uid: 'EF56GH780VH2' }
];

// Get all guest
exports.getAllGuest = (req, res) => {
  res.json({ message: 'All guest retrieved successfully!', guest: guestStore });
};

// Get guest by NIK
exports.getGuestByNIK = (req, res) => {
  const { nik } = req.params;
  const guest = guestStore.find(item => item.nik === nik);
  
  if (!guest) {
    return res.status(404).json({ message: 'Guest not found!' });
  }
  
  res.json({ message: 'Guest retrieved successfully!', guest });
};

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

    // Cek apakah NIK sudah ada di guestStore
    const existingGuest = guestStore.find(item => item.nik === nik);
    if (existingGuest) {
      return res.status(400).json({
        message: 'NIK already registered!',
        guest: existingGuest,
      });
    }

    // Jika NIK belum terdaftar, buat data tamu baru
    const newGuest = {
      id: uuidv4(),  // Generate a unique ID using UUID
      nik: nik,
      nama: nama,
      instansi: 'Unknown', // Default value for instansi
      rfid_uid: null, // Set RFID UID awal ke null
    };

    // Tambahkan tamu baru ke guestStore
    guestStore.push(newGuest);

    // Hapus file yang telah diproses
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Respons dengan teks hasil OCR dan data tamu baru
    res.status(200).json({
      message: 'KTP scanned and guest added successfully!',
      extractedText: text,
      extractedData: {
        nik: nik || 'NIK not found',
        nama: nama || 'Name not found',
      },
      newGuest: newGuest,
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
exports.updateGuestById = (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { nik, nama, instansi } = req.body; // Ambil data baru dari body request

  // Cari tamu berdasarkan ID
  const guestIndex = guestStore.findIndex(item => item.id === id);

  if (guestIndex === -1) {
    return res.status(404).json({ message: 'Guest not found!' });
  }

  // Validasi untuk memastikan NIK unik (jika NIK diubah)
  if (nik && nik !== guestStore[guestIndex].nik) {
    const nikExists = guestStore.some(item => item.nik === nik);
    if (nikExists) {
      return res.status(400).json({ message: 'NIK already registered to another guest!' });
    }
  }

  // Perbarui data tamu
  const updatedGuest = {
    ...guestStore[guestIndex],
    nik: nik || guestStore[guestIndex].nik, // Gunakan data baru atau data lama
    nama: nama || guestStore[guestIndex].nama,
    instansi: instansi || guestStore[guestIndex].instansi,
  };

  // Simpan perubahan ke guestStore
  guestStore[guestIndex] = updatedGuest;

  res.json({
    message: 'Guest updated successfully!',
    updatedGuest,
  });
};

// Update RFID by NIK
exports.updateRFIDByNIK = (req, res) => {
  const { nik } = req.params; // Ambil NIK dari parameter URL
  const { rfid_uid } = req.body; // Ambil RFID UID dari body request

  // Cari tamu berdasarkan NIK
  const guest = guestStore.find(item => item.nik === nik);

  if (!guest) {
    return res.status(404).json({ message: 'Guest not found!' });
  }

  // Perbarui RFID UID
  guest.rfid_uid = rfid_uid;

  res.json({
    message: 'RFID UID updated successfully!',
    updatedGuest: guest,
  });
};

// Delete guest
exports.deleteGuest = (req, res) => {
  const { nik } = req.params;
  
  const index = guestStore.findIndex(item => item.nik === nik);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Guest not found!' });
  }
  
  const deletedguest = guestStore.splice(index, 1); // Remove guest from the array
  res.json({
    message: 'Guest deleted successfully!',
    deletedguest,
  });
};