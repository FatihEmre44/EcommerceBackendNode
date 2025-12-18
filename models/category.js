// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen kategori adını giriniz'],
    trim: true,
    unique: true,
    maxlength: [50, 'Kategori adı 50 karakteri geçemez']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  // --- ALT KATEGORİ MANTIĞI ---
  // Eğer bu bir alt kategoriyse üstü kim?
  // Boşsa (null) bu bir ana kategoridir.
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- OTOMATİK SLUG GÜNCELLEME ---
// Hem yeni kayıt hem de güncelleme sırasında isim değişirse çalışır.
CategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
  }
  
  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
  
  next();
});

CategorySchema.methods.updateCategoryDetails = async function(data) {
  
  // 1. İsim Değişikliği
  // İsim değişirse yukarıdaki pre('save') tetiklenir ve slug da değişir.
  if (data.name) {
    this.name = data.name;
  }

  // 2. Parent (Üst Kategori) Değişikliği
  if (data.parent !== undefined) {
    // KORUMA: Bir kategori kendi kendisinin babası olamaz!
    // Eğer gelen parent ID'si kendi ID'sine eşitse hata fırlat.
    if (data.parent && data.parent.toString() === this._id.toString()) {
      throw new Error('Bir kategori kendi kendisinin üst kategorisi olamaz.');
    }
    
    this.parent = data.parent;
  }

  return await this.save();
};

module.exports = mongoose.model('Category', CategorySchema);