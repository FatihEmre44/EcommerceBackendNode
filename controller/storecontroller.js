const Store = require('../models/store');
const Product = require('../models/product');


// @desc    Mağaza Oluştur (Seller Başvurusu)
// @route   POST /api/stores
// @access  Private (Her kullanıcı 1 tane açabilir)
exports.createStore = async (req, res, next) => {
    try {
        // 1. Kullanıcının zaten mağazası var mı?
        const existingStore = await Store.findOne({ owner: req.user.id });

        if (existingStore) {
            return res.status(400).json({ success: false, message: 'Zaten bir mağazanız var.' });
        }

        // 2. Mağazayı oluştur
        req.body.owner = req.user.id;
        const store = await Store.create(req.body);

        res.status(201).json({
            success: true,
            data: store,
            message: 'Mağaza başarıyla oluşturuldu. Onay bekleniyor.'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mağazamı Getir
// @route   GET /api/stores/my-store
// @access  Private (Store Owner)
exports.getMyStore = async (req, res, next) => {
    try {
        const store = await Store.findOne({ owner: req.user.id });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Mağazanız bulunamadı.' });
        }

        res.status(200).json({
            success: true,
            data: store
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mağaza Güncelle
// @route   PUT /api/stores/my-store
// @access  Private (Sadece kendi mağazası)
exports.updateMyStore = async (req, res, next) => {
    try {
        const store = await Store.findOne({ owner: req.user.id });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Mağazanız bulunamadı.' });
        }

        // Modeldeki metodumuzu kullanalım (models/store.js'de tanımlıydı)
        // Eğer metod yoksa direkt assign edeceğiz ama modelde updateStoreDetails var.
        if (store.updateStoreDetails) {
            await store.updateStoreDetails(req.body);
        } else {
            // Fallback
            Object.assign(store, req.body);
            await store.save();
        }

        res.status(200).json({
            success: true,
            data: store,
            message: 'Mağaza güncellendi.'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mağazanın Ürünlerini Getir
// @route   GET /api/stores/my-store/products
// @access  Private (Store Owner)
exports.getStoreProducts = async (req, res, next) => {
    try {
        // 1. Mağazasını bul
        const store = await Store.findOne({ owner: req.user.id });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Mağaza bulunamadı.' });
        }

        // 2. Bu mağazaya ait silinmemiş ürünleri bul
        const products = await Product.find({
            store: store._id,
            isDeleted: false
        });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mağazadan Ürün Sil (Soft Delete)
// @route   DELETE /api/stores/my-store/products/:productId
// @access  Private (Store Owner)
exports.deleteStoreProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // 1. Mağazasını bul
        const store = await Store.findOne({ owner: req.user.id });

        if (!store) {
            return res.status(404).json({ success: false, message: 'Mağaza bulunamadı.' });
        }

        // 2. Ürünü bul
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
        }

        // 3. Bu ürün bu mağazaya mı ait?
        if (product.store.toString() !== store._id.toString()) {
            return res.status(403).json({ success: false, message: 'Bu ürünü silme yetkiniz yok.' });
        }

        // 4. Soft delete uygula
        if (product.softDelete) {
            await product.softDelete();
        } else {
            product.isDeleted = true;
            await product.save();
        }

        res.status(200).json({
            success: true,
            message: 'Ürün mağazanızdan silindi.'
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
