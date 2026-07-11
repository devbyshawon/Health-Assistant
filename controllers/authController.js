const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

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

module.exports = { register };