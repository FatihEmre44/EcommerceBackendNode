// models/Coupon.js
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  // 1. Kupon Kodu
  code: {
    type: String,
    required: [true, 'Lütfen kupon kodunu giriniz'],
    unique: true,
    uppercase: true, // Kullanıcı 'yaz20' yazsa da 'YAZ20' kaydeder
    trim: true
  },

  // 2. Kime Ait? (Global mi, Mağaza mı?)
  // Eğer burası boşsa (null) site genelinde geçerlidir (Admin Kuponu).
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    default: null
  },

  // 3. İndirim Detayları
  discountType: {
    type: String,
    enum: ['percent', 'fixed'], // Yüzde (%) veya Sabit Tutar (TL)
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  
  // En az ne kadarlık alışverişte geçerli? (Örn: 500 TL ve üzeri)
  minPurchaseAmount: {
    type: Number,
    default: 0
  },

  // 4. Süre Sınırları
  expirationDate: {
    type: Date,
    required: true
  },
  
  // 5. Kullanım Limitleri
  usageLimit: { // Toplam kaç kişi kullanabilir?
    type: Number,
    default: 1000 
  },
  usedCount: { // Şu ana kadar kaç kişi kullandı?
    type: Number,
    default: 0
  },
  
  // Bir kullanıcı bu kuponu daha önce kullandı mı?
  usedBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: { type: Date, default: Date.now }
});

// Bu fonksiyon "True" veya "Hata Mesajı" döner.
CouponSchema.methods.checkValidity = function(userId, cartTotal) {
  const now = new Date();

  // 1. Aktiflik Kontrolü
  if (!this.isActive) {
    throw new Error('Bu kupon şu an aktif değil.');
  }

  // 2. Tarih Kontrolü
  if (this.expirationDate < now) {
    throw new Error('Bu kuponun süresi dolmuş.');
  }

  // 3. Limit Kontrolü (Genel)
  if (this.usedCount >= this.usageLimit) {
    throw new Error('Bu kuponun kullanım limiti dolmuş.');
  }

  // 4. Kullanıcı Kontrolü (Daha önce kullanmış mı?)
  // userId'yi string'e çevirip bakıyoruz
  if (userId && this.usedBy.includes(userId)) {
    throw new Error('Bu kuponu daha önce kullandınız.');
  }

  // 5. Sepet Tutarı Kontrolü
  if (cartTotal < this.minPurchaseAmount) {
    throw new Error(`Bu kuponu kullanmak için en az ${this.minPurchaseAmount} TL tutarında alışveriş yapmalısınız.`);
  }

  return true; // Her şey yolunda
};

module.exports = mongoose.model('Coupon', CouponSchema);