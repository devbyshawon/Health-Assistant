const express = require('express');
const { register, verifyOtp, resendOtp, login, verify2Fa, 
    logout, changePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { toggleTwoFA, getUserProfile, updateProfile, 
    uploadProfilePicController, getHealthSummary } = require('../controllers/userController');
const { registerLimiter, loginLimiter, otpLimiter, verify2FALimiter } = require('../middlewares/rateLimiter');
const { sanitizeProfileUpdate } = require('../middlewares/sanitizeMiddleware');
const validationHandler = require('../middlewares/validationHandler');
const { uploadProfilePic } = require('../middlewares/multer');

const router = express.Router();

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
router.get('/me', protect, (req, res) => {res.status(200).json({ user: req.user });});

module.exports = router;