// models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  // 1. Sepet Kime Ait?
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // 2. Sepet İçeriği
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      },
      // Pazar yeri olduğu için hangi mağazadan olduğunu tutuyoruz
      store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      // O anki birim fiyat (Ürün fiyatı değişirse burayı güncellemek gerekir)
      price: {
        type: Number,
        required: true
      },
      // Seçilen Özellikler (Örn: Renk: Kırmızı, Beden: XL)
      selectedSpecs: [
        {
          key: String,   // Renk
          value: String  // Kırmızı
        }
      ]
    }
  ],

  // 3. Genel Toplam
  totalCartPrice: {
    type: Number,
    default: 0
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Her ürün ekleme/çıkarma işleminden sonra bu çağrılır.
CartSchema.methods.calculateTotal = function() {
  this.totalCartPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.updatedAt = Date.now();
};

module.exports = mongoose.model('Cart', CartSchema);