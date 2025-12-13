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
  // URL Dostu İsim (Örn: "iphone-15-pro-max")
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Lütfen ürün açıklamasını giriniz'],
    maxlength: [2000, 'Açıklama 2000 karakteri geçemez']
  },
  
  // 2. Fiyatlandırma
  price: {
    type: Number,
    required: [true, 'Lütfen fiyatı giriniz'],
    min: [0, 'Fiyat 0 dan küçük olamaz']
  },
  // İndirimli Fiyat (Opsiyonel)
  discountPrice: {
    type: Number,
    validate: {
      // Özel Validasyon: İndirimli fiyat, normal fiyattan BÜYÜK olamaz.
      validator: function(value) {
        // 'this.price'a erişebilmek için arrow function kullanmıyoruz.
        return value < this.price; 
      },
      message: 'İndirimli fiyat, normal fiyattan büyük veya eşit olamaz'
    }
  },

  // 3. Kategorizasyon
  category: {
    type: String,
    required: [true, 'Lütfen bir kategori giriniz'],
    // Burayı projenin ihtiyaçlarına göre genişletebilirsin
    enum: {
      values: ['Elektronik', 'Giyim', 'Kitap', 'Ev & Yaşam', 'Kozmetik', 'Spor', 'Diğer'],
      message: 'Lütfen geçerli bir kategori seçiniz'
    }
  },
  brand: {
    type: String,
    trim: true
  },

  // 4. Stok ve Envanter
  stock: {
    type: Number,
    required: [true, 'Stok bilgisi zorunludur'],
    min: [0, 'Stok 0 dan küçük olamaz'],
    default: 0
  },
  sold: {
    type: Number,
    default: 0 // Çok satanları listelemek için sayaç
  },

  // 5. Görseller (Dizi Halinde)
  // Cloudinary gibi bir servis kullanacağız, o yüzden public_id tutuyoruz.
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],

  // 6. İlişkiler (REFERANSLAR) 🔥
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

  // 7. Değerlendirme Sistemi
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- SLUG OLUŞTURMA ---
// Kaydetmeden önce ismi URL formatına çevir
ProductSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
  }

  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, '-') // Boşlukları tire yap
    .replace(/[^\w-]+/g, '') // Özel karakterleri sil
    // Benzersiz olması için sonuna rastgele sayı ekleyelim (Opsiyonel ama önerilir)
    + '-' + Math.floor(Math.random() * 1000);

  next();
});

module.exports = mongoose.model('Product', ProductSchema);