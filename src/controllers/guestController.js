const { v4: uuidv4 } = require('uuid');

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

// Add new guest
exports.addGuest = (req, res) => {
  const { nik, nama, instansi } = req.body;

  // Periksa apakah NIK sudah terdaftar
  const existingGuest = guestStore.find(item => item.nik === nik);
  if (existingGuest) {
    return res.status(400).json({
      message: 'NIK already registered!',
    });
  }

  // Generate UUID untuk tamu baru
  const newguest = {
    id: uuidv4(),  // Generate a unique ID using UUID
    nik: nik,
    nama: nama,
    instansi: instansi, // Tambahkan instansi
    rfid_uid: null, // Set RFID UID awal ke null
  };

  guestStore.push(newguest);
  res.status(201).json({
    message: 'Guest added successfully!',
    newguest,
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