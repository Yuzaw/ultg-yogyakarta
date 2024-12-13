const jwt = require('jsonwebtoken');
const firestore = require('../config/firestore'); // Import konfigurasi Firestore
require('dotenv').config();

// Fungsi untuk login dan menghasilkan token JWT
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Mencari user berdasarkan username di Firestore
        const userRef = firestore.collection('users');
        const snapshot = await userRef.where('username', '==', username).where('password', '==', password).get();

        if (snapshot.empty) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // User ditemukan
        const user = snapshot.docs[0].data();

        // Membuat payload untuk JWT
        const payload = {
            username: user.username
        };

        // Membuat token JWT dengan secret key dan payload
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // Menyimpan token dalam cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true
        });

        // Mengirimkan respons login berhasil
        return res.status(200).json({
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
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
