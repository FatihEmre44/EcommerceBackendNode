const express = require('express');
const { getPendingStores, approveStore } = require('../controller/admincontroller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tüm rotalar korumalı ve sadece admin erişebilir
router.use(protect);
router.use(authorize('admin'));

router.get('/pending-stores', getPendingStores);
router.put('/approve-store/:id', approveStore);

module.exports = router;
