const mongoose = require('mongoose');

// Sipariş Kalemi Şeması (Sepetteki her bir ürün)
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true }, // Ürün adı değişse bile siparişteki hali kalsın
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // O anki satış fiyatı (Snapshot)
  image: { type: String, required: true },
  
  // Ürünün hangi mağazadan alındığı (Satıcı paneli için kritik)
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: true
  },
  

  selectedSpecs: [
    {
      key: String,   // Renk
      value: String  // Kırmızı
    }
  ]
});

const OrderSchema = new mongoose.Schema({
  // 1. Siparişi Veren Müşteri
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 2. Sipariş İçeriği (Dizi)
  orderItems: [OrderItemSchema],

  // 3. Teslimat Adresi 
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true }
  },

  // 4. Ödeme Bilgileri
  paymentMethod: {
    type: String,
    enum: ['CreditCard', 'BankTransfer'], // İleride Iyzico/Stripe eklenecek
    required: true
  },
  paymentResult: { // Ödeme firmasından dönen ID'ler
    id: String,
    status: String,
    email_address: String,
    update_time: String
  },

  // 5. Tutarlar
  itemsPrice: { type: Number, required: true, default: 0.0 }, // Ürünlerin toplamı
  taxPrice: { type: Number, required: true, default: 0.0 },   // KDV
  shippingPrice: { type: Number, required: true, default: 0.0 }, // Kargo
  totalPrice: { type: Number, required: true, default: 0.0 }, // GENEL TOPLAM

  // 6. Sipariş Durumu
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Processing'
  },
  
  // Kargo Takip No (Satıcı girince buraya işlenecek)
  trackingNumber: { type: String },
  
  deliveredAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// --- SİPARİŞ NUMARASI OLUŞTURMA ---
// Müşteriye "ID: 65a2b..." demek yerine "ORD-1702..." demek daha profesyoneldir.
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Örn: ORD-1738245678901
    this.orderNumber = `ORD-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);