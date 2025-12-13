
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
    unique: true, 
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir email adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin','seller'],
    default: 'user'
  },
  address: {
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    fullAddress: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- OTOMATİK ŞİFRELEME (Sihir Burada) ---
// Kayıt (save) komutu çalıştığında burası devreye girer.
UserSchema.pre('save', async function(next) {
  // Eğer şifre değişmediyse işlem yapma, pas geç.
  if (!this.isModified('password')) {
    return next();
  }

  // Şifre değişmiş! O zaman hemen şifrele.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.updateDetails = async function(data) {
  
  // 1. İsim Güncelleme
  if (data.name) this.name = data.name;

  // 2. E-Posta Güncelleme
  if (data.email && data.email !== this.email) this.email = data.email;

  // 3. Adres Güncelleme
  if (data.address) {
    this.address = {
      city: data.address.city || this.address.city,
      district: data.address.district || this.address.district,
      fullAddress: data.address.fullAddress || this.address.fullAddress
    };
  }
  // Eğer yeni bir şifre gönderildiyse, onu direkt ata.
  // Aşağıdaki .save() çalıştığında, yukarıdaki pre('save') bunu fark edip otomatik şifreleyecek.
  if (data.password) {
    this.password = data.password;
  }

  // Hepsini kaydet
  return await this.save();
};
module.exports = mongoose.model('User', UserSchema);