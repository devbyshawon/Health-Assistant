const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/authMiddleware');

const { getPendingDoctors, verifyDoctor, getAllUsers, getAllDoctors,
    blockUser, unblockUser, deleteUser, getAuditLogs,
    getSystemSettings, updateSystemSettings, addHospital, 
    sendNotification } = require('../controllers/adminController');

// All routes below require admin
router.use(protect, restrictTo('admin'));

// Doctor management
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/verify', verifyDoctor);
router.get('/doctors', getAllDoctors);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

// Audit logs
router.get('/logs', getAuditLogs);

// System settings
router.get('/settings', getSystemSettings);
router.patch('/settings', updateSystemSettings);

// Hospital
router.post('/hospital', addHospital);

// Notifications
router.post('/notify', sendNotification);

module.exports = router;