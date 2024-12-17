const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const firestore = require('../config/firestore');
const bucket = require('../config/storage');

const guestCollection = firestore.collection('guests');

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

// Get guest by ID
exports.getGuestById = async (req, res) => {
  const { id } = req.params;

  try {
    const guestSnapshot = await guestCollection.doc(id).get();

    if (!guestSnapshot.exists) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    const guest = { id: guestSnapshot.id, ...guestSnapshot.data() };
    res.json({ message: 'Guest retrieved successfully!', guest });
  } catch (error) {
    console.error('Error fetching guest by ID:', error);
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
    let nik = nikMatch ? nikMatch[1].replace(/\s+/g, '') : 'nik_invalid';

    // Regex untuk menangkap Nama
    const namaMatch = text.match(/Nama(?:\s*:\s*|\s+)(.+)/i);
    const nama = namaMatch ? namaMatch[1].trim() : 'nama_invalid';

    console.log('Extracted NIK (before cleaning):', nikMatch ? nikMatch[1] : 'not found');
    console.log('Cleaned NIK:', nik);
    console.log('Extracted Name:', nama);

    // Ganti nama file menjadi NIK
    const extension = path.extname(imagePath); // Ambil ekstensi file (misal .jpg, .png)
    const newImagePath = path.join(path.dirname(imagePath), `${nik}${extension}`);

    // Rename file
    fs.rename(imagePath, newImagePath, async (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Failed to rename file', error: err.message });
      }

      // Upload file gambar ke Google Cloud Storage
      const blob = bucket.file(`${nik}${extension}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: req.file.mimetype, // Set content type sesuai dengan file yang di-upload
        },
      });

      fs.createReadStream(newImagePath)
        .pipe(blobStream)
        .on('finish', async () => {
          console.log('File uploaded to Cloud Storage');
          
          // Hapus file lokal setelah upload
          fs.unlinkSync(newImagePath);

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
            imageUrl: `https://storage.googleapis.com/${bucket.name}/guests/${nik}${extension}`, // URL gambar yang disimpan di cloud
          };

          // Tambahkan tamu baru ke Firestore
          const newDoc = await guestCollection.add(newGuest);

          res.status(200).json({
            message: 'KTP scanned and guest added successfully!',
            extractedText: text,
            extractedData: {
              nik: nik,  // Will show 'nik_invalid' if not found
              nama: nama, // Will show 'nama_invalid' if not found
            },
            newGuest: { id: newDoc.id, ...newGuest },
          });
        })
        .on('error', (err) => {
          console.error('Error uploading file:', err);
          return res.status(500).json({ message: 'Failed to upload image to Cloud Storage', error: err.message });
        });
    });
  } catch (error) {
    console.error(error);
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

    const oldNik = guestSnapshot.data().nik;
    const oldExtension = path.extname(guestSnapshot.data().imageUrl); // Ambil ekstensi file lama dari URL gambar

    // Validasi untuk memastikan NIK unik
    if (nik && nik !== oldNik) {
      const nikSnapshot = await guestCollection.where('nik', '==', nik).get();
      if (!nikSnapshot.empty) {
        return res.status(400).json({ message: 'NIK already registered to another guest!' });
      }

      // Jika NIK berubah, ganti nama file gambar sesuai NIK yang baru di Google Cloud Storage
      const oldFile = bucket.file(`${oldNik}${oldExtension}`);
      const newFile = bucket.file(`${nik}${oldExtension}`); // Gunakan ekstensi yang sama dengan file lama

      // Copy file ke nama baru
      await oldFile.copy(newFile);

      // Hapus file lama setelah berhasil disalin
      await oldFile.delete();

      // Update data tamu di Firestore
      const updatedGuest = {
        ...guestSnapshot.data(),
        nik: nik || guestSnapshot.data().nik,
        nama: nama || guestSnapshot.data().nama,
        instansi: instansi || guestSnapshot.data().instansi,
        imageUrl: `https://storage.googleapis.com/${bucket.name}/guests/${nik}${oldExtension}`, // Update URL gambar dengan ekstensi yang benar
      };

      await guestRef.set(updatedGuest);

      res.json({
        message: 'Guest updated successfully!',
        updatedGuest,
      });
    } else {
      // Update tamu tanpa mengganti NIK
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
    }
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ message: 'Failed to update guest', error: error.message });
  }
};

// Update RFID by ID
exports.updateRFIDById = async (req, res) => {
  const { id } = req.params;
  const { rfid_uid } = req.body;

  try {
    const guestRef = guestCollection.doc(id);
    const guestSnapshot = await guestRef.get();

    if (!guestSnapshot.exists) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    const updatedGuest = { ...guestSnapshot.data(), rfid_uid };
    await guestRef.set(updatedGuest);

    res.json({ message: 'RFID updated successfully!', updatedGuest });
  } catch (error) {
    console.error('Error updating RFID:', error);
    res.status(500).json({ message: 'Failed to update RFID', error: error.message });
  }
};

// Delete guest by ID
exports.deleteGuest = async (req, res) => {
  const { id } = req.params;

  try {
    const guestRef = guestCollection.doc(id);
    const guestSnapshot = await guestRef.get();

    if (!guestSnapshot.exists) {
      return res.status(404).json({ message: 'Guest not found!' });
    }

    const { imageUrl } = guestSnapshot.data();
    const imageName = path.basename(imageUrl);

    await guestRef.delete();
    await bucket.file(imageName).delete();

    res.json({ message: 'Guest and associated image deleted successfully!' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ message: 'Failed to delete guest', error: error.message });
  }
};

exports.downloadGuests = async (req, res) => {
  try {
    const snapshot = await guestCollection.get();
    const guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const fileName = `guests_data_${new Date().toISOString()}.csv`;

    res.jsonToCsv(guests, fileName);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve guests', error: error.message });
  }
};