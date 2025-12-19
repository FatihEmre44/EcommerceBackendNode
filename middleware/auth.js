const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 1. Giriş Yapmış Kullanıcıyı Doğrulama (Protect)
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Bu işlem için giriş yapmalısınız.' });
    }

    try {
        // Tokeni doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar');

        // Kullanıcıyı bul ve request'e ekle
        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Geçersiz token, lütfen tekrar giriş yapın.' });
    }
};

// 2. Rol Yetkilendirme (Authorize)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Bu işlem için yetkiniz yok. Gerekli roller: ${roles.join(', ')}`
            });
        }
        next();
    };
};
