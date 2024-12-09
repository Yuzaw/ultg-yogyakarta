const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder tempat menyimpan file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // Ambil ekstensi file
    cb(null, `${uniqueSuffix}${ext}`); // Format nama file
  },
});

// Middleware multer untuk upload file
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum ukuran file 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype); // Periksa mime type
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase()); // Periksa ekstensi

    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, or .png files are allowed!'));
  },
});

module.exports = upload;
