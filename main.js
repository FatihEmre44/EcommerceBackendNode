const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// --- 1. REDIS BAĞLANTISI (YAML'dan gelen adresi kullan) ---
// process.env.REDIS_URL yoksa varsayılan olarak 'redis://redis:6379' kullan
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => console.log('❌ Redis Hatası:', err));

(async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis bağlantısı başarılı!');
    } catch (error) {
        console.log('❌ Redis bağlantı hatası:', error);
    }
})();

// --- 2. MONGODB BAĞLANTISI (YAML'dan gelen adresi kullan) ---
// process.env.MONGO_URI yoksa varsayılanı kullan
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/eticaret';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB bağlantısı başarılı!'))
    .catch(err => console.log('❌ MongoDB Hatası:', err));

// --- ROTALAR ---
app.get('/', (req, res) => {
    res.send({ 
        message: 'E-Ticaret Backend  12345(Hot Reload Aktif!) 🔥', 
        time: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Sunucu123 ${PORT} portunda çalışıyor...`);
});