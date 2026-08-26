const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5,
    message: { message: 'Too many registration attempts. Try again in an hour.' },
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: 'Too many OTP requests. Try again in an hour.' },
    standardHeaders: true,
    legacyHeaders: false
});

const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { message: 'Too many verification attempts. Try again in a few minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const verify2FALimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 5,
    message: { message: 'Too many 2FA attempts. Try again in 5 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

const aiLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10,
    message: { message: 'Too many AI requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginLimiter, registerLimiter, otpLimiter, otpVerifyLimiter, verify2FALimiter, aiLimiter };