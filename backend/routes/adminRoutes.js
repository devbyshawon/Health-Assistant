const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/authMiddleware');

const { getPendingDoctors, verifyDoctor, getAllUsers, getAllDoctors,
    blockUser, unblockUser, deleteUser, getAuditLogs,
    getSystemSettings, updateSystemSettings, addHospital, 
    sendNotification, 
    sendBulkNotification,
    getAllHospitals,
    deactivateHospital,
    blockDoctor,
    unblockDoctor} = require('../controllers/adminController');

// All routes below require admin
router.use(protect, restrictTo('admin'));

// Doctor management
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/verify', verifyDoctor);
router.get('/doctors', getAllDoctors);
router.patch('/doctors/:id/block', blockDoctor);
router.patch('/doctors/:id/unblock', unblockDoctor);

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
router.get('/hospitals', getAllHospitals);
router.post('/hospital', addHospital);
router.patch('/hospitals/:id/deactivate', deactivateHospital);

// Notifications
router.post('/notify', sendNotification);
router.post('/notify/bulk', sendBulkNotification);

module.exports = router;