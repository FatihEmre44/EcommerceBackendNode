const express = require('express');
const { createStore, getMyStore, updateMyStore, getStoreProducts, deleteStoreProduct } = require('../controller/storecontroller');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createStore);
router.get('/my-store', getMyStore);
router.put('/my-store', updateMyStore);

// Ürün Yönetimi
router.get('/my-store/products', getStoreProducts);
router.delete('/my-store/products/:productId', deleteStoreProduct);

module.exports = router;

