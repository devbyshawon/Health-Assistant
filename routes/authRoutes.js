const express = require('express');
const { register, verifyOtp, resendOtp, login, verify2Fa, 
    logout, changePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/verify-2fa', protect, verify2Fa);
router.post('/logout', protect, logout);
router.patch('/change-password', protect, changePassword);
router.delete('/delete', protect, deleteAccount);

router.get('/me', protect, (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = router;