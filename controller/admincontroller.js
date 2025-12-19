const Store = require('../models/store');
const User = require('../models/user');

// @desc    Tüm Bekleyen Mağazaları Listele
// @route   GET /api/admin/pending-stores
// @access  Private/Admin
exports.getPendingStores = async (req, res, next) => {
    try {
        const stores = await Store.find({ status: 'pending' }).populate('owner', 'name email');

        res.status(200).json({
            success: true,
            count: stores.length,
            data: stores
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mağazayı Onayla
// @route   PUT /api/admin/approve-store/:id
// @access  Private/Admin
exports.approveStore = async (req, res, next) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Mağaza bulunamadı' });
        }

        // Mağazayı aktifleştir
        store.status = 'active';
        await store.save();

        // Opsiyonel: Mağaza sahibinin rolünü 'seller' yap (Eğer hala user ise)
        // Bu sayede, sadece mağazası onaylananlar 'seller' yetkisine tam sahip olur.
        const user = await User.findById(store.owner);
        if (user && user.role !== 'admin') {
            user.role = 'seller';
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: store,
            message: 'Mağaza onaylandı ve kullanıcı satıcı yapıldı.'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
