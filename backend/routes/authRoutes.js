const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { registerLimiter, loginLimiter, otpLimiter, verify2FALimiter, aiLimiter } = require('../middlewares/rateLimiter');
const { uploadProfilePic, uploadPrescription } = require('../middlewares/multer');
const { sanitizeProfileUpdate } = require('../middlewares/sanitizeMiddleware');
const validationHandler = require('../middlewares/validationHandler');

const { register, verifyOtp, resendOtp, login, verify2Fa, 
    logout, changePassword, deleteAccount } = require('../controllers/authController');
const { toggleTwoFA, getUserProfile, updateProfile, 
    uploadProfilePicController, getHealthSummary } = require('../controllers/userController');
const { createHealthLog, getHealthLogs, updateHealthLog, deleteHealthLog } = require('../controllers/healthLogController');
const { createReminder, getReminders, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { bookAppointment, rescheduleAppointment, cancelAppointment, getMyAppointments } = require('../controllers/appointmentController');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { diagnoseSymptoms, chatSymptoms, simplifyMedicalTerm, getVisitPrep, getAIHistory } = require('../controllers/aiController');
const { uploadPrescriptions, getPrescriptions, extractPrescriptionText } = require('../controllers/prescriptionController');

// Auth routes (with rate limiters)
router.post('/register', registerLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', loginLimiter, login);
router.post('/verify-2fa', protect, verify2FALimiter, verify2Fa);
router.post('/logout', protect, logout);
router.patch('/change-password', protect, changePassword);
router.delete('/delete', protect, deleteAccount);

// Profile routes
router.get('/profile', protect, getUserProfile);
router.patch('/update-profile', protect, sanitizeProfileUpdate, validationHandler, updateProfile);
router.post('/upload-profile-pic', protect, uploadProfilePic.single('profilePic'), uploadProfilePicController);
router.patch('/toggle-2fa', protect, toggleTwoFA);
router.get('/health-summary', protect, getHealthSummary);

// Health Logs
router.post('/healthlogs', protect, createHealthLog);
router.get('/healthlogs', protect, getHealthLogs);
router.patch('/healthlogs/:id', protect, updateHealthLog);
router.delete('/healthlogs/:id', protect, deleteHealthLog);

// Reminders
router.post('/reminders', protect, createReminder);
router.get('/reminders', protect, getReminders);
router.patch('/reminders/:id', protect, updateReminder);
router.delete('/reminders/:id', protect, deleteReminder);

// Appointments
router.post('/appointments', protect, restrictTo('user'), bookAppointment);
router.patch('/appointments/:id/reschedule', protect, rescheduleAppointment);
router.patch('/appointments/:id/cancel', protect, cancelAppointment);
router.get('/appointments/my', protect, restrictTo('user'), getMyAppointments);

// Notifications
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:id/read', protect, markAsRead);

// Prescriptions
router.post('/prescriptions', protect, uploadPrescription.single('prescription'), uploadPrescriptions);
router.get('/prescriptions', protect, getPrescriptions);
router.post('/prescriptions/ocr', protect, uploadPrescription.single('prescription'), extractPrescriptionText);

// AI features (with rate limiter)
router.post('/ai/diagnose', protect, aiLimiter, diagnoseSymptoms);
router.post('/ai/chat', protect, aiLimiter, chatSymptoms);
router.post('/ai/simplify', protect, aiLimiter, simplifyMedicalTerm);
router.get('/ai/visit-prep/:condition', protect, aiLimiter, getVisitPrep);
router.get('/ai/history', protect, getAIHistory);

module.exports = router;