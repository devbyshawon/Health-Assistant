const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addToBlacklist } = require('../utils/tokenBlacklist');

const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                if (existingUser.otpExpiresAt < new Date()) {
                    await User.deleteOne({ email });
                } else {
                    return res.status(400).json({ message: 'Email already in use, verify your OTP' });
                }
            } else {
                return res.status(400).json({ message: 'Email already registered' });
            }
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const newUser = new User({
            name, 
            username, 
            email: email.toLowerCase().trim(), 
            password,
            otp, 
            otpExpiresAt, 
            isVerified: false, 
            isEmailVerified: false, 
        });

        await newUser.save()

        await sendEmail({
            to: newUser.email,
            subject: 'Your OTP Code - Health Assistant',
            text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
            html: `<h3>Welcome to Health Assistant</h3><p>Your OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Check your email for the OTP.',
            userId: newUser._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });        
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp, role } = req.body;
        if (!email || !otp || !role) {
            return res.status(400).json({ message: 'All fields are required' });    
        }
        
        if (!['user', 'doctor'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be user or doctor' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        if (String(user.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.role = role;
        user.isVerified = true;
        user.isEmailVerified = true; 
        user.otp = null;
        user.otpExpiresAt = null;

        user.role = role;
        if (user.role === 'doctor') {
            user.verificationStatus = 'Pending';
            user.docsUploaded = false;
        }

        await user.save();

        if (role === 'user') {
            await sendEmail({
                to: user.email,
                subject: 'Registration Successful - Health Assistant',
                text: `Welcome ${user.name}! Your registration is complete.`,
                html: `<p>Welcome <strong>${user.name}</strong>! Your registration is now complete.</p>`
            });
        } else if (role === 'doctor') {
            await sendEmail({
                to: user.email,
                subject: 'Registration Pending - Health Assistant',
                text: `Welcome ${user.name}! Your account is pending admin verification.`,
                html: `<p>Welcome <strong>${user.name}</strong>! Your account is pending admin verification. We will notify you once reviewed.</p>`
            });
        }

        return res.status(200).json({
            message: role === 'user' 
                ? 'Email verified successfully. You can now login.' 
                : 'Email verified. Pending admin verification.',
            redirect: '/login'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Already verified' });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Your OTP Code - Health Assistant',
            text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
            html: `<h3>Welcome to Health Assistant</h3><p>Your OTP is: <b>${otp}</b>. It expires in 5 minutes.</p>`
        });

        res.status(200).json({ message: 'OTP resent successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'All fields are required' });   
        }

        const user = await User.findOne({ $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }] })
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account blocked' });
        }
        if (user.isDeleted) {
            return res.status(403).json({ message: 'Account deleted' });
        }
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        if (user.isTwoFAEnabled) {
            const otp = generateOTP();
            user.twoFAToken = otp;
            user.twoFATokenExpires = new Date(Date.now() + 10 * 60 * 1000);
        
            await user.save();
            await sendEmail({
                to: user.email,
                subject: 'Your OTP Code - Health Assistant',
                text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
                html: `<h3>Welcome to Health Assistant</h3><p>Your OTP is: <b>${otp}</b>. It expires in 10 minutes.</p>`
            });

            const tempToken = jwt.sign({ id: user._id, role: user.role, isTwoFAVerified: false }, process.env.JWT_SECRET, { expiresIn: '10m' });

            return res.status(200).json({ message: '2FA OTP sent', requiresTwoFA: true, token: tempToken });
        }

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email, isTwoFAVerified: true }, process.env.JWT_SECRET, { expiresIn: '1d' });

        if (user.role === 'doctor') {
            if (user.verificationStatus !== 'Verified') {
                return res.status(200).json({
                    message: 'Pending verification', 
                    redirect: '/doctor/upload-docs', 
                    token
                });
            }
        }

        res.status(200).json({ message: 'Login successful', token, user: { name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const verify2Fa = async (req, res) => {
    try {
        const { otp }  = req.body;

        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user.twoFAToken || user.twoFATokenExpires < new Date()) {
            return res.status(400).json({ message: 'OTP expired or invalid' });
        }

        if (user.twoFAToken !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        user.twoFAToken = null;
        user.twoFATokenExpires = null;

        if (user.twoFASetupPending) {
            user.isTwoFAEnabled = true;
            user.twoFASetupPending = false;
        }

        await user.save();

        const token = jwt.sign({ 
            id: user._id, 
            role: user.role, 
            email: user.email, 
            isTwoFAVerified: true 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' });

        return res.status(200).json({
            message: '2FA verified successfully',
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        addToBlacklist(token);
        return res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);
        const password = await user.comparePassword(currentPassword);
        if (!password) {
            return res.status(401).json({ message: 'Wrong password'});
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);    
        user.isDeleted = true;
        user.deletedAt = new Date()
        await user.save();
        
        return res.status(200).json({ message: 'Account deleted successfully' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, verifyOtp, resendOtp, login, verify2Fa, logout, changePassword, deleteAccount };