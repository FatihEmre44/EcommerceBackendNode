// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Aynı e-posta ile ikinci kez kayıt olunamasın
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir email adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Şifre en az 6 karakter olsun
    select: false // Kullanıcıları listelerken şifre alanı gelmesin (Güvenlik)
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Sadece bu iki rolden biri olabilir
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Kayıt işlemi (save) yapılmadan hemen önce bu fonksiyon çalışır.
UserSchema.pre('save', async function(next) {
  // Eğer şifre değişmediyse (sadece isim güncellendiyse) tekrar şifreleme yapma
  if (!this.isModified('password')) {
    return next();
  }

  // Tuzlama (Salt) ve Hash işlemi
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// Kullanıcı giriş yaparken girilen şifre ile veritabanındaki şifreli hali kıyaslar
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);