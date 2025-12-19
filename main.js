const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/db'); // Veritabanı bağlantı dosyamız

// --- KONFİGÜRASYON ---
dotenv.config();

// 1. Veritabanına Bağlan (Tek satır yeterli, içi db.js'de dolu)
connectDB();

// 2. Redis Bağlantısını Başlat
// Bu satır config/redis.js dosyasını çalıştırır ve bağlantıyı kurar.
require('./config/redis')

const app = express();
app.use(express.json()); // JSON verilerini okumak için şart

// Rotalar
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const store = require('./routes/store');

app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/stores', store);






// --- TEST ROTASI (Opsiyonel - Sunucu ayakta mı?) ---
app.get('/', (req, res) => {
    res.send({
        message: 'E-Ticaret API Çalışıyor! 🚀',
        time: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda başarıyla çalışıyor...`);
});