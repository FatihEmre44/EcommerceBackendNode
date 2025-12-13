// models/Store.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  // Bu mağaza kime ait? (User modeliyle ilişki)
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Bir satıcının sadece TEK mağazası olabilir
  },
  name: {
    type: String,
    required: [true, 'Lütfen mağaza adını giriniz'],
    unique: true,
    trim: true,
    maxlength: [50, 'Mağaza adı 50 karakteri geçemez']
  },
  // URL dostu isim (Örn: "fatih-teknoloji-market")
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Lütfen mağaza açıklamasını giriniz'],
    maxlength: [500, 'Açıklama 500 karakteri geçemez']
  },
  // Mağaza İletişim Bilgileri (Satıcının şahsi bilgilerinden farklı olabilir)
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir iletişim maili giriniz'
    ]
  },
  phone: {
    type: String
  },
  // Mağaza Durumu (Admin onayı gerekebilir)
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'], // Beklemede, Aktif, Yasaklı
    default: 'pending'
  },
  // Mağaza Puanı
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// --- SLUG OLUŞTURMA (Kaydetmeden Önce) ---
// Mağaza adı "Fatih Tech Market" ise, slug "fatih-tech-market" olur.
StoreSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
  }

  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, '-') // Boşlukları tire yap
    .replace(/[^\w-]+/g, ''); // Özel karakterleri temizle

  next();
});
StoreSchema.methods.updateStoreDetails = async function(data) {
  
  // 1. İsim Güncelleme
  // İsim değişirse yukarıdaki pre('save') tetiklenir ve slug da otomatik güncellenir.
  if (data.name && data.name !== this.name) {
    this.name = data.name;
  }

  // 2. Açıklama Güncelleme
  if (data.description) {
    this.description = data.description;
  }

  // 3. İletişim Bilgileri
  if (data.contactEmail) this.contactEmail = data.contactEmail;
  if (data.phone) this.phone = data.phone;
  return await this.save();
};

module.exports = mongoose.model('Store', StoreSchema);