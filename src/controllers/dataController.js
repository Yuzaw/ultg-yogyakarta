const { v4: uuidv4 } = require('uuid');

let dataStore = []; // Simulasi penyimpanan data (untuk contoh saja)

// Get all data
exports.getAllData = (req, res) => {
  res.json({ message: 'All data retrieved successfully!', data: dataStore });
};

// Get data by ID
exports.getDataById = (req, res) => {
  const { id } = req.params;
  const data = dataStore.find(item => item.id === id);
  
  if (!data) {
    return res.status(404).json({ message: 'Data not found!' });
  }
  
  res.json({ message: 'Data retrieved successfully!', data });
};

// Add new data
exports.addData = (req, res) => {
  const { nik, nama } = req.body;
  
  // Generate UUID for the new data
  const newData = {
    id: uuidv4(),  // Generate a unique ID using UUID
    nik: nik,
    nama: nama,
  };
  
  dataStore.push(newData);
  res.status(201).json({
    message: 'Data added successfully!',
    newData,
  });
};

// Edit existing data
exports.editData = (req, res) => {
  const { id } = req.params;
  const { nik, nama } = req.body;
  
  const index = dataStore.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Data not found!' });
  }
  
  dataStore[index].nik = nik;  // Update nik
  dataStore[index].nama = nama; // Update nama
  res.json({
    message: 'Data updated successfully!',
    updatedData: dataStore[index],
  });
};

// Delete data
exports.deleteData = (req, res) => {
  const { id } = req.params;
  
  const index = dataStore.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Data not found!' });
  }
  
  const deletedData = dataStore.splice(index, 1); // Remove data from the array
  res.json({
    message: 'Data deleted successfully!',
    deletedData,
  });
};