// models/Store.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  // 1. İlişkiler
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Bir satıcının sadece TEK mağazası olabilir
  },

  // 2. Temel Bilgiler
  name: {
    type: String,
    required: [true, 'Lütfen mağaza adını giriniz'],
    unique: true,
    trim: true,
    maxlength: [50, 'Mağaza adı 50 karakteri geçemez']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Lütfen mağaza açıklamasını giriniz'],
    maxlength: [500, 'Açıklama 500 karakteri geçemez']
  },

  // 3. Görseller (Logo ve Banner)
  logo: {
    public_id: { type: String },
    url: { type: String }
  },
  coverImage: {
    public_id: { type: String },
    url: { type: String }
  },

  // 4. İletişim ve Adres
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir iletişim maili giriniz'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Mağaza iletişim numarası zorunludur']
  },
  // Mağazanın fiziksel adresi (Depo/İade adresi)
  address: {
    city: String,
    district: String,
    fullAddress: String
  },
  socialMedia: {
    website: String,
    instagram: String,
    facebook: String
  },

  // 5. Yasal Bilgiler (Vergi Levhası vb.)
  taxInfo: {
    taxNumber: { type: String },
    taxOffice: { type: String },
    companyType: { 
      type: String, 
      enum: ['Sahıs', 'Limited', 'Anonim'],
      default: 'Sahıs'
    }
  },

  // 6. Durum ve Puanlama
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'closed'], 
    default: 'pending'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // 7. Silinme Durumu (Soft Delete)
  isDeleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- İNDEKSLEME ---
// Mağaza isminde hızlı arama için
StoreSchema.index({ name: 'text' });

// --- SLUG OLUŞTURMA ---
StoreSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
  }

  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, '-') 
    .replace(/[^\w-]+/g, ''); 

  next();
});

// --- AKILLI GÜNCELLEME METODU ---
StoreSchema.methods.updateStoreDetails = async function(data) {
  
  // 1. Temel Bilgiler
  if (data.name && data.name !== this.name) this.name = data.name;
  if (data.description) this.description = data.description;
  
  // 2. İletişim & Adres
  if (data.contactEmail) this.contactEmail = data.contactEmail;
  if (data.phone) this.phone = data.phone;
  
  // Nested (İç içe) objeleri güncelleme mantığı
  if (data.address) {
    this.address = { ...this.address, ...data.address };
  }
  if (data.socialMedia) {
    this.socialMedia = { ...this.socialMedia, ...data.socialMedia };
  }
  if (data.taxInfo) {
    this.taxInfo = { ...this.taxInfo, ...data.taxInfo };
  }

  // 3. Görseller
  if (data.logo) this.logo = data.logo;
  if (data.coverImage) this.coverImage = data.coverImage;

  // DİKKAT: 'status', 'rating', 'owner' buradan güncellenemez. 
  // Onlar için Admin paneli veya özel fonksiyonlar gerekir.

  return await this.save();
};

// --- MAĞAZA KAPATMA (SOFT DELETE) ---
StoreSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.status = 'closed'; // Durumu da kapalıya çekiyoruz
  return await this.save();
};

module.exports = mongoose.model('Store', StoreSchema);