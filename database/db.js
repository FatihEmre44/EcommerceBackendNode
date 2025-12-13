const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Docker Compose dosyasında servisin ismini "mongo" koyduğumuz için
    // adresimiz: mongodb://mongo:27017/eticaret
    // Eğer Docker kullanmasaydık "localhost" yazardık.

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
    // Bağlantı yoksa sunucuyu kapat, çünkü veritabanı olmadan iş yapamayız.
    process.exit(1);
  }
};

module.exports = connectDB;