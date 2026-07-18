const User = require('../models/User');
const HealthLog = require('../models/HealthLog');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const toggleTwoFA = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (user.isTwoFAEnabled) {
            user.isTwoFAEnabled = false;
            user.twoFAToken = null;
            user.twoFATokenExpires = null;
            await user.save();
            return res.status(200).json({ message: '2FA disabled successfully' });
        }

        if (!user.isTwoFAEnabled) {
            const otp = generateOTP();
            user.twoFAToken = otp;
            user.twoFATokenExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.twoFASetupPending = true;
            await user.save();
            await sendEmail({
                to: user.email,
                subject: '2FA Setup OTP - Health Assistant',
                text: `Your 2FA setup OTP is: ${otp}. It expires in 10 minutes.`,
                html: `
                    <h3>Hello ${user.name},</h3>
                    
                    <p>Use the following OTP to complete your Two-Factor Authentication (2FA) setup:</p>
                    
                    <h2>${otp}</h2>

                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>

                    <p>If you didn't initiate this request, please ignore this email.</p>
                `
            });
            res.status(200).json({ message: 'OTP sent to your email. Verify to complete 2FA setup' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -twoFAToken -twoFATokenExpires -otpExpiresAt');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, username, age, gender, contact, birthday, address, bloodGroup, intro } = req.body;
        const allowedFields = ['name', 'username', 'age', 'gender', 'contact', 'birthday', 'address', 'bloodGroup', 'intro'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        if (updates.username) {
            const existing = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
            if (existing) {
                return res.status(400).json({ message: 'Username already taken' });
            }     
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        ).select('-password -otp -twoFAToken -twoFATokenExpires');
        return res.status(200).json({ message: 'Profile updated', user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const uploadProfilePicController = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = `/uploads/profile-pics/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: filePath },
            { returnDocument: 'after' }
        ).select('-password');
        return res.status(200).json({ message: 'Profile picture uploaded', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getHealthSummary = async (req, res) => {
    try {
        const logs = await HealthLog.find({ userId: req.user._id }).sort({ date: -1 });
        if (!logs.length) {
            return res.status(200).json({ success: true, summary: { latestLog: null, totalLogs: 0 } });
        }

        const latestLog = logs[0];
        const avgWeight = logs.reduce((sum, l) => 
            sum + (l.weight || 0), 0) / logs.length;
        const avgHR = logs.reduce((sum, l) => 
            sum + (l.vitals?.heartRate || 0), 0) / logs.length;
        const avgTemp = logs.reduce((sum, l) => 
            sum + (l.vitals?.temperature || 0), 0) / logs.length;

        const bpValues = logs
            .filter(l => l.vitals?.bloodPressure)
            .map(l => parseInt(l.vitals.bloodPressure.split('/')[0]));
        const avgBP = bpValues.length 
            ? bpValues.reduce((sum, val) => sum + val, 0) / bpValues.length 
            : null;

        return res.status(200).json({
            success: true,
            summary: {
                latestLog,
                averages: { weight: avgWeight, heartRate: avgHR, temperature: avgTemp, bloodPressure: avgBP },
                totalLogs: logs.length
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });    
    }
};

module.exports = { toggleTwoFA, getUserProfile, updateProfile, uploadProfilePicController, getHealthSummary };