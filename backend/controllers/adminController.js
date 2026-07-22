const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const AuditLog = require('../models/AuditLog');
const Hospital = require('../models/Hospital');
const SystemSetting = require('../models/SystemSetting');
const sendEmail = require('../utils/sendEmail');
const createNotification = require('../utils/createNotification');
const logAction = require('../utils/auditLog');

const verifyDoctor = async(req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const doctor = await User.findById(id);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        const doctorProfile = await DoctorProfile.findOne({ userId: id });
        if (!doctorProfile) {
            return res.status(404).json({ message: 'Doctor profile not found' });   
        } 

        if (action === 'approve') {
            doctor.verificationStatus = 'Verified';
            doctor.docsUploaded = true;
            doctorProfile.isDoctorVerified = true;
            doctorProfile.credentials.status = 'Verified';
            doctorProfile.documents.forEach(doc => (doc.status = 'Verified'));
        }
        if (action === 'reject') {
            doctor.verificationStatus = 'Rejected';
            doctor.docsUploaded = false;
            doctorProfile.isDoctorVerified = false;
            doctorProfile.credentials.status = 'Rejected';
            doctorProfile.documents.forEach(doc => (doc.status = 'Rejected'));
        }

        await doctor.save();
        await doctorProfile.save();
        await logAction(
            action === 'approve' ? 'Doctor Verified' : 'Doctor Rejected',
            req.user._id,
            { doctorId: doctor._id, email: doctor.email }
        );
        await sendEmail({
            to: doctor.email,
            subject: action === 'approve'
                ? 'Doctor Verification Approved - Health Assistant'
                : 'Doctor Verification Rejected - Health Assistant',
            text: action === 'approve'
                ? `Congratulations ${doctor.name}! Your doctor account has been approved. You can now log in and access the Health Assistant platform.`
                : `Hello ${doctor.name}, we're sorry to inform you that your doctor verification request has been rejected.`,
            html: action === 'approve'
                ? `
                    <h3>Hello Dr. ${doctor.name},</h3>

                    <p>Congratulations! Your doctor account has been successfully verified and approved by our administrator.</p>

                    <p>You can now log in to your Health Assistant account and start using all the doctor features available on the platform.</p>

                    <p>Thank you for joining Health Assistant!</p>
                `
                : `
                    <h3>Hello Dr. ${doctor.name},</h3>

                    <p>We're sorry to inform you that your doctor verification request has not been approved at this time.</p>

                    <p>If you believe this was a mistake or need further clarification, please contact our support team.</p>

                    <p>Thank you for your interest in joining Health Assistant.</p>
                `
        });
        return res.status(200).json({ status: 'Success', message: `Doctor verification ${action}d.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { search, exact } = req.query;
        const query = { role: 'user' };
        if (exact) {
            query.$or = [{ name: exact }, { email: exact }];
        } else if (search) {
            query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
        }
        const users = await User.find(query).select('-password');
        return res.status(200).json({ results: users.length, users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const query = { role: 'doctor' };
        if (req.query.verified === 'true') {
            query.verificationStatus = 'Verified';
        }
        const doctors = await User.find(query)
            .select('-password -otp -twoFAToken -twoFATokenExpires')
            .populate('doctorProfile');
        return res.status(200).json({ results: doctors.length, doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getPendingDoctors = async (req, res) => {
    try {
        const query = { role: 'doctor', verificationStatus: 'Pending' };
        const doctors = await User.find(query)
            .select('-password -otp -twoFAToken -twoFATokenExpires')
            .populate('doctorProfile');
        return res.status(200).json({ results: doctors.length, doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBlocked = true;
        await user.save();
        await logAction(
            'User Blocked', 
            req.user._id, 
            { userId: user._id, email: user.email }
        );
        return res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBlocked = false;
        await user.save();
        await logAction(
            'User Unblocked', 
            req.user._id, 
            { userId: user._id, email: user.email }
        );
        return res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isDeleted = true; 
        user.deletedAt = new Date();
        await user.save();
        await logAction(
            'User Deleted', 
            req.user._id, 
            { userId: user._id, email: user.email }
        );
        return res.status(200).json({ message: 'User Deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate('performedBy', 'email role').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        return res.status(200).json(settings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateSystemSettings = async (req, res) => {
    try {
        const { voiceInputEnabled, aiChatLogsEnabled } = req.body;
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({});
        }
        if (voiceInputEnabled !== undefined) {
            settings.voiceInputEnabled = voiceInputEnabled;
        }
        if (aiChatLogsEnabled !== undefined) {
            settings.aiChatLogsEnabled = aiChatLogsEnabled;
        }
        await settings.save();
        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const addHospital = async (req, res) => {
    try {
        const { name, address, phone, email, lat, lng  } = req.body;
        if (!name || !lat || !lng) {
            return res.status(400).json({ message: 'Name, latitude and longitude are required.' });
        }

        const hospital = await Hospital.create({
            name,
            address,
            phone,
            email,
            location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
        });
        return res.status(201).json({ success: true, data: hospital });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const sendNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;
        if (!userId || !title || !message || !type) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await sendEmail({
            to: user.email,
            subject: title,
            text: message,
            html: `
                <h3>Hello ${user.name},</h3>

                <p>${message}</p>

                <p>Thank you,<br>Health Assistant Team</p>
            `
        });
        await createNotification({
            recipientId: userId,
            title,
            message,
            type
        }); 
        return res.status(200).json({ success: true, message: 'Notification sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getPublicStats = async (req, res) => {
    try {
        const doctorCount = await User.countDocuments({ role: 'doctor', verificationStatus: 'Verified' });
        const patientCount = await User.countDocuments({ role: 'user' });
        const appointmentCount = await Appointment.countDocuments();

        const verifiedDoctorIds = await User.find(
            { role: 'doctor', verificationStatus: 'Verified' }
        ).distinct('_id');

        const specialties = await DoctorProfile.distinct('specialty', {
            userId: { $in: verifiedDoctorIds },
            specialty: { $nin: [null, ''] }
        });
        
        return res.status(200).json({
            doctors: doctorCount,
            patients: patientCount,
            appointments: appointmentCount,
            specialtyCount: specialties.length
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { verifyDoctor, getAllUsers, getAllDoctors, getPendingDoctors, blockUser, unblockUser, 
    deleteUser, getAuditLogs, getSystemSettings, updateSystemSettings, addHospital, sendNotification, getPublicStats };