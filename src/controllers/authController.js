// controllers/authController.js
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Mengimpor dotenv untuk mengakses .env

const users = [
    { username: 'admin', password: 'admin12345' },
    { username: 'admin2', password: 'admin67890' }
];

// Fungsi untuk login dan menghasilkan token JWT
exports.login = (req, res) => {
    const { username, password } = req.body;

    // Mencari user berdasarkan username dan password
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Membuat payload untuk JWT
        const payload = {
            username: user.username
        };

        // Membuat token JWT dengan secret key dan payload
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // Menyimpan token dalam cookie
        res.cookie('token', token, {
            httpOnly: true,  // Hanya dapat diakses melalui HTTP request
            secure: process.env.NODE_ENV === 'production', // Hanya untuk HTTPS di production
            maxAge: 3600000   // 1 jam
        });

        // Mengirimkan respons login berhasil
        return res.status(200).json({
            message: 'Login successful',
        });
    } else {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
};

// Fungsi untuk logout dan menghapus token JWT dari cookie
exports.logout = (req, res) => {
    // Menghapus token dari cookie
    res.clearCookie('token', {
        httpOnly: true,  // Hanya dapat diakses melalui HTTP request
        secure: process.env.NODE_ENV === 'production', // Hanya untuk HTTPS di production
    });

    // Mengirimkan respons logout berhasil
    return res.status(200).json({ message: 'Logout successful' });
};
