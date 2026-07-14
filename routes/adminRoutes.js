const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { verifyDoctor } = require('../controllers/adminController');

// Admin routes
router.use(protect, restrictTo('admin')); // applies to all admin routes
router.patch('/doctors/:id/verify', verifyDoctor);

module.exports = router;