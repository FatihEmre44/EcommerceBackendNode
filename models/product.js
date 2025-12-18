// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // 1. Ürün Temel Bilgileri
  name: {
    type: String,
    required: [true, 'Lütfen ürün adını giriniz'],
    trim: true,
    maxlength: [100, 'Ürün adı 100 karakteri geçemez']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Lütfen ürün açıklamasını giriniz'],
    maxlength: [2000, 'Açıklama 2000 karakteri geçemez']
  },
  
  // --- YENİ EKLENEN: STOK KODU (SKU) ---
  sku: {
    type: String,
    unique: true,
    default: function() {
        // Otomatik SKU üretimi: PRO-170123456789-55
        return 'PRO-' + Date.now() + '-' + Math.floor(Math.random() * 100);
    }
  },

  // 2. Fiyatlandırma
  price: {
    type: Number,
    required: [true, 'Lütfen fiyatı giriniz'],
    min: [0, 'Fiyat 0 dan küçük olamaz']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return value < this.price; 
      },
      message: 'İndirimli fiyat, normal fiyattan büyük veya eşit olamaz'
    }
  },

  // 3. Kategorizasyon
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Lütfen bir kategori seçiniz']
  },
  brand: {
    type: String,
    trim: true
  },
  // --- YENİ EKLENEN: ETİKETLER ---
  // Arama ve öneriler için (Örn: ["yazlık", "indirim", "oyun"])
  tags: [String],

  // --- YENİ EKLENEN: TEKNİK ÖZELLİKLER ---
  // Filtreleme yaparken hayat kurtarır (Ram: 16GB, Renk: Mavi vb.)
  specifications: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],

  // 4. Stok ve Envanter
  stock: {
    type: Number,
    required: [true, 'Stok bilgisi zorunludur'],
    min: [0, 'Stok 0 dan küçük olamaz'],
    default: 0
  },
  sold: { type: Number, default: 0 },

  // 5. Görseller
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true }
    }
  ],

  // 6. İlişkiler
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // 7. Değerlendirme
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  
  // 8. Durumlar
  isDeleted: { type: Boolean, default: false },
  // Admin onayı veya Satıcının ürünü geçici kapatması için
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
});

// --- İNDEKSLEME (PERFORMANS İÇİN KRİTİK) ---
// İsim, açıklama ve markada hızlı arama yapılmasını sağlar
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

// --- SLUG OLUŞTURMA ---
ProductSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, '-') 
    .replace(/[^\w-]+/g, '') 
    + '-' + Math.floor(Math.random() * 1000);
  next();
});

// --- GÜNCELLEME METODU ---
ProductSchema.methods.updateProductDetails = async function(data) {
  if (data.name) this.name = data.name;
  if (data.description) this.description = data.description;
  if (data.category) this.category = data.category;
  if (data.brand) this.brand = data.brand;
  
  // Sayısal kontroller
  if (data.price !== undefined) this.price = data.price;
  if (data.stock !== undefined) this.stock = data.stock;
  if (data.discountPrice !== undefined) this.discountPrice = data.discountPrice;
  
  if (data.images) this.images = data.images;
  
  // Yeni eklenen alanların güncellemesi
  if (data.tags) this.tags = data.tags;
  if (data.specifications) this.specifications = data.specifications;
  if (data.isActive !== undefined) this.isActive = data.isActive;

  return await this.save();
};

ProductSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false; // Silinen ürün aktif de olamaz
  return await this.save();
};

module.exports = mongoose.model('Product', ProductSchema);