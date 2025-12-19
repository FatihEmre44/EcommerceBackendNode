const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Token Oluşturma Fonksiyonu
const sendTokenResponse = (user, statusCode, res) => {
    // Token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'gizli_anahtar', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// @desc    Kullanıcı Kaydı
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Güvenlik: Rolü her zaman 'user' yapıyoruz. Admin/Seller olmak için onay lazım.
        const user = await User.create({
            name,
            email,
            password,
            role: 'user'
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Giriş Yapma
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Email ve şifre kontrolü
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Lütfen email ve şifre giriniz' });
        }

        // Kullanıcıyı bul (şifreyi de getir)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri' });
        }

        // Şifre eşleşiyor mu?
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Güncel Kullanıcıyı Getir
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};