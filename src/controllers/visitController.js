const firestore = require('../config/firestore'); // Import Firestore

// Reference ke koleksi Firestore
const guestCollection = firestore.collection('guests');
const visitCollection = firestore.collection('visits');

// Get all visits
exports.getAllVisits = async (req, res) => {
  try {
    const snapshot = await visitCollection.get();
    const visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ message: 'All visits retrieved successfully!', visits });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve visits', error: error.message });
  }
};

// Get visit by ID
exports.getVisitByID = async (req, res) => {
  const { id } = req.params;
  try {
    const visitRef = visitCollection.doc(id);
    const visitDoc = await visitRef.get();

    if (!visitDoc.exists) {
      return res.status(404).json({ message: 'Visit not found!' });
    }

    res.json({ message: 'Visit retrieved successfully!', visit: { id, ...visitDoc.data() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve visit', error: error.message });
  }
};

// Scan RFID to get visit uuid
exports.scanRFID = async (req, res) => {
  const { rfid_uid } = req.body;
  try {
    const guestSnapshot = await guestCollection.where('rfid_uid', '==', rfid_uid).get();
    if (guestSnapshot.empty) {
      return res.status(404).json({ message: 'Guest not found! Please register the RFID UID first.' });
    }

    const guest = guestSnapshot.docs[0].data();

    const newVisit = {
      nik: guest.nik,
      nama: guest.nama,
      instansi: guest.instansi,
      keperluan: '-',
      jam_in: new Date().toTimeString().split(' ')[0],
      jam_out: '-',
      tanggal: new Date().toISOString().split('T')[0],
      no_kartu_daerah: '-', // Tambahkan field baru setelah tanggal
      no_kartu: '-',
      kendaraan_tamu: '-',
      plat_kendaraan: '-',
      security_induction: 'belum',
      ttd: '-',
      rfid_uid: guest.rfid_uid,
    };

    // Menambahkan kunjungan baru ke Firestore dan ambil id dokumen
    const visitDocRef = await visitCollection.add(newVisit);

    res.json({
      message: 'RFID scanned successfully and visit added!',
      visitDetails: { id: visitDocRef.id, ...newVisit },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add visit', error: error.message });
  }
};

// Add or Edit Visit Data
exports.addVisit = async (req, res) => {
  const { id } = req.params;
  const { keperluan, no_kartu, kendaraan_tamu, plat_kendaraan, security_induction, no_kartu_daerah, ttd } = req.body;

  try {
    const visitRef = visitCollection.doc(id);
    const visitDoc = await visitRef.get();

    if (!visitDoc.exists) {
      return res.status(404).json({ message: 'Visit not found!' });
    }

    const updatedData = {
      keperluan: keperluan || visitDoc.data().keperluan,
      no_kartu: no_kartu || visitDoc.data().no_kartu,
      kendaraan_tamu: kendaraan_tamu || visitDoc.data().kendaraan_tamu,
      plat_kendaraan: plat_kendaraan || visitDoc.data().plat_kendaraan,
      security_induction: security_induction || visitDoc.data().security_induction,
      no_kartu_daerah: no_kartu_daerah || visitDoc.data().no_kartu_daerah,
      ttd: ttd || visitDoc.data().ttd,
    };

    await visitRef.update(updatedData);

    res.status(200).json({ message: 'Visit updated successfully!', updatedVisit: updatedData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update visit', error: error.message });
  }
};

// Update jam_out using RFID UID
exports.editJamOut = async (req, res) => {
  const { rfid_uid } = req.body;
  try {
    const snapshot = await visitCollection
      .where('rfid_uid', '==', rfid_uid)
      .where('jam_out', '==', '-')
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: 'No visit found with the provided RFID UID and jam_out "-"!',
      });
    }

    // Ambil dokumen pertama yang cocok
    const visitDoc = snapshot.docs[0];

    // Update 'jam_out' dengan waktu saat ini
    const updatedJamOut = new Date().toTimeString().split(' ')[0];
    await visitDoc.ref.update({ jam_out: updatedJamOut });

    // Ambil ulang dokumen yang diperbarui
    const updatedDoc = await visitDoc.ref.get();

    res.status(200).json({
      message: 'Jam out updated successfully!',
      updatedVisit: updatedDoc.data(), // Data terbaru setelah update
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update jam_out', error: error.message });
  }
};

// Delete visit
exports.deleteVisit = async (req, res) => {
  const { id } = req.params;
  try {
    const visitRef = visitCollection.doc(id);
    const visitDoc = await visitRef.get();

    if (!visitDoc.exists) {
      return res.status(404).json({ message: 'Visit not found!' });
    }

    await visitRef.delete();

    res.json({ message: 'Visit deleted successfully!', deletedVisit: visitDoc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete visit', error: error.message });
  }
};

// Download all visits as CSV
exports.downloadVisits = async (req, res, next) => {
  try {
    const snapshot = await visitCollection.get(); // Fetch all visit data from Firestore
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No visits found' });
    }

    // Map the Firestore documents to a simple array of visit data
    const visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const fileName = `visits_data_${new Date().toISOString()}.csv`;

    res.jsonToCsv(visits, fileName); // Calls the middleware method
  } catch (error) {
    next(error); // Pass the error to the next middleware (error handler)
  }
};