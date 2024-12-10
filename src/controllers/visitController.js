const { v4: uuidv4 } = require('uuid');

// Simulasi penyimpanan guest dan visit dengan penambahan rfid_uid
let guestStore = [
  { id: uuidv4(), nik: '36720047456', nama: 'Ilham Andalas', instansi: 'PT. Example', rfid_uid: 'AB12CD34BC5B2' },
  { id: uuidv4(), nik: '23575955784', nama: 'Muhammad Andalas', instansi: 'CV. Example', rfid_uid: 'EF56GH780VH2' }
];

let visitStore = [
  {
    id: uuidv4(),
    nik: "36720047456",
    nama: "Ilham Andalas",
    instansi: "PT. Example",
    keperluan: "Business",
    jam_in: "08:00",
    jam_out: "10:00",
    tanggal: new Date().toISOString(),
    no_kartu: "-",
    kendaraan_tamu: "-",
    plat_kendaraan: "-",
    security_induction: "belum",
    ttd: "-",  // Menambahkan field ttd
    rfid_uid: 'AB12CD34BC5B2' // Tambahan rfid_uid
  },
  {
    id: uuidv4(),
    nik: "23575955784",
    nama: "Muhammad Andalas",
    instansi: "CV. Example",
    keperluan: "Business",
    jam_in: "08:00",
    jam_out: "10:00",
    tanggal: new Date().toISOString(),
    no_kartu: "-",
    kendaraan_tamu: "Motor",
    plat_kendaraan: "A 5678 DEF",
    security_induction: "belum",
    ttd: "-",  // Menambahkan field ttd
    rfid_uid: 'EF56GH780VH2' // Tambahan rfid_uid
  }
];

// Fungsi untuk memeriksa apakah guest sudah terdaftar
const isGuestRegistered = (nik, nama) => {
  return guestStore.some(guest => guest.nik === nik && guest.nama === nama);
};

// Get all visits
exports.getAllVisits = (req, res) => {
  res.json({ message: 'All visits retrieved successfully!', visits: visitStore });
};

// Get visit by NIK
exports.getVisitByNIK = (req, res) => {
  const { nik } = req.params;
  const visit = visitStore.find(item => item.nik === nik);

  if (!visit) {
    return res.status(404).json({ message: 'Visit not found!' });
  }

  res.json({ message: 'Visit retrieved successfully!', visit });
};

// Scan RFID to get visit uuid
exports.scanRFID = (req, res) => {
  const { rfid_uid } = req.body;

  // Cari tamu berdasarkan RFID UID
  const guest = guestStore.find(item => item.rfid_uid === rfid_uid);

  if (!guest) {
    return res.status(404).json({ message: 'Guest not found! Please register the RFID UID first.' });
  }

  // Generate visit id
  const id = uuidv4();

  // Auto-generate tanggal dan jam_in
  const currentDateTime = new Date();
  const tanggal = currentDateTime.toISOString().split('T')[0]; // Format YYYY-MM-DD
  const jam_in = currentDateTime.toTimeString().split(' ')[0]; // Format HH:MM:SS

  // Tambahkan kunjungan baru ke visitStore
  const newVisit = {
    id, // UUID untuk kunjungan
    nik: guest.nik,
    nama: guest.nama,
    instansi: guest.instansi,
    keperluan: "-", // Default, bisa diisi kemudian
    jam_in: jam_in,
    jam_out: "-", // Default
    tanggal: tanggal,
    no_kartu: "-", // Default
    kendaraan_tamu: "-", // Default
    plat_kendaraan: "-", // Default
    security_induction: "belum", // Default
    ttd: "-", // Default
    rfid_uid: guest.rfid_uid // Menambahkan rfid_uid
  };

  visitStore.push(newVisit); // Tambahkan ke visitStore

  res.json({
    message: 'RFID scanned successfully and visit added!',
    visitDetails: newVisit
  });
};

// Add or Edit Visit Data
exports.addVisit = (req, res) => {
  const { id } = req.params; // Ambil id dari parameter
  const { keperluan, no_kartu, kendaraan_tamu, plat_kendaraan, security_induction } = req.body;

  // Cari data visit berdasarkan id
  const visitIndex = visitStore.findIndex(item => item.id === id);

  if (visitIndex === -1) {
    return res.status(404).json({ message: 'Visit not found! Please ensure the id is correct.' });
  }

  // Update data visit
  visitStore[visitIndex] = {
    ...visitStore[visitIndex], // Salin data yang ada
    keperluan: keperluan || visitStore[visitIndex].keperluan, // Perbarui jika ada input
    no_kartu: no_kartu || visitStore[visitIndex].no_kartu, // Perbarui jika ada input
    kendaraan_tamu: kendaraan_tamu || visitStore[visitIndex].kendaraan_tamu, // Perbarui jika ada input
    plat_kendaraan: plat_kendaraan || visitStore[visitIndex].plat_kendaraan, // Perbarui jika ada input
    security_induction: security_induction || visitStore[visitIndex].security_induction // Perbarui jika ada input
  };

  res.status(200).json({
    message: 'Visit updated successfully!',
    updatedVisit: visitStore[visitIndex]
  });
};

// Function to edit jam_out using RFID UID
exports.editJamOut = (req, res) => {
  const { rfid_uid } = req.body; // Ambil rfid_uid dari body

  // Cari data visit berdasarkan rfid_uid dengan jam_out "-"
  const visitIndex = visitStore.findIndex(
    item => item.rfid_uid === rfid_uid && item.jam_out === "-"
  );

  if (visitIndex === -1) {
    return res.status(404).json({ 
      message: 'No visit found with the provided RFID UID and jam_out "-"!' 
    });
  }

  // Update jam_out ke waktu saat ini
  const currentTime = new Date().toTimeString().split(' ')[0]; // Format HH:MM:SS
  visitStore[visitIndex].jam_out = currentTime;

  res.status(200).json({
    message: 'Jam out updated successfully!',
    updatedVisit: visitStore[visitIndex]
  });
};

// Delete visit
exports.deleteVisit = (req, res) => {
  const { id } = req.params;

  const index = visitStore.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Visit not found!' });
  }

  const deletedVisit = visitStore.splice(index, 1); // Remove visit from the array
  res.json({
    message: 'Visit deleted successfully!',
    deletedVisit,
  });
};