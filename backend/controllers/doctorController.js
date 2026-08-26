const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const HealthLog = require('../models/HealthLog');
const createNotification = require('../utils/createNotification');

const uploadDocument = async(req, res) => {
    try {
        const userId = req.user._id;
        const files = [];
        if (req.files?.idCard) {
            files.push(req.files.idCard[0]);
        }
        if (req.files?.certificate) {
            files.push(req.files.certificate[0]);
        }
        if (files.length === 0) {
            return res.status(400).json({ message: 'No documents uploaded' });
        }

        let profile = await DoctorProfile.findOne({ userId });
        if (!profile) { 
            profile = new DoctorProfile({
                userId,
                clinicLocation: { type: 'Point', coordinates: [0, 0] }
            });
        }
        if (profile.credentials?.status === 'Verified') {
            return res.status(400).json({ message: 'Your account is already verified.' });
        }

        const { specialty } = req.body;
        if (specialty) {
            profile.specialty = specialty;
        }

        files.forEach(file => {
            profile.documents.push({
                filename: file.filename,
                filetype: file.mimetype,
                status: 'Pending'
            });
        });

        profile.credentials.status = 'Pending';
        profile.credentials.feedback = '';

        await profile.save();
        await User.findByIdAndUpdate(userId, {
            verificationStatus: 'Pending',
            docsUploaded: true,
            doctorProfile: profile._id
        });

        try {
            const admins = await User.find({ role: 'admin' }).select('_id');
            await Promise.all(admins.map(admin => createNotification({
                recipientId: admin._id,
                title: 'New Doctor Verification Request',
                message: `${req.user.name} has submitted documents for verification.`,
                type: 'system'
            })));
        } catch (notifyErr) {
            console.error('Failed to notify admins of verification request:', notifyErr);
        }

        return res.status(200).json({ message: 'Documents uploaded successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorProfile = async(req, res) => {
    try {
        const doctor = await DoctorProfile.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        return res.status(200).json({ doctor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateDoctorProfile = async(req, res) => {
    try {
        const { specialty, bio, phone, experience, fees, availability, clinicLocation } = req.body;
        const allowedFields = ['specialty', 'bio', 'phone', 'experience', 'fees', 'availability', 'clinicLocation'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.clinicLocation) {
            const loc = updates.clinicLocation;
            if (loc.type !== 'Point' || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
                return res.status(400).json({ message: 'Invalid clinicLocation format' });
            }
        }

        if (updates.availability) {
            if (!Array.isArray(updates.availability)) {
                return res.status(400).json({ message: 'Availability must be an array' });
            }
            const validDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
            for (const slot of updates.availability) {
                if (!slot.day || !slot.startTime || !slot.endTime) {
                    return res.status(400).json({ message: 'Each slot needs day, startTime and endTime' });
                }
                if (!validDays.includes(slot.day)) {
                    return res.status(400).json({ message: `Invalid day: ${slot.day}` });
                }
            }
        }

        const updatedDoctor = await DoctorProfile.findOneAndUpdate({ userId: req.user._id }, { $set: updates }, { returnDocument: 'after', runValidators: true });
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        return res.status(200).json({ message: 'Profile updated', doctor: updatedDoctor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getPublicDoctors = async(req, res) => {
    try {
        const userQuery = { role: 'doctor', verificationStatus: 'Verified', isBlocked: false };
        if (req.query.name) {
            userQuery.name = { $regex: req.query.name, $options: 'i' };
        }

        let doctors = await User.find(userQuery)
            .select('name username profilePic doctorProfile')
            .populate('doctorProfile');
        doctors = doctors.filter(doc => doc.doctorProfile);
        return res.status(200).json({ results: doctors.length, doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const searchDoctors = async(req, res) => {
    try {
        const { name, specialty } = req.query;
        const userQuery = { role: 'doctor', verificationStatus: 'Verified', isBlocked: false };
        if (name) {
            userQuery.name = { $regex: name, $options: 'i' };
        }

        let doctors = await User.find(userQuery)
            .select('name username profilePic doctorProfile')
            .populate('doctorProfile');
        doctors = doctors.filter(doc => doc.doctorProfile);
        if (specialty) {
            doctors = doctors.filter(doc =>
                doc.doctorProfile?.specialty?.toLowerCase().includes(specialty.toLowerCase())
            );
        }
        return res.status(200).json({ results: doctors.length, doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getNearbyDoctors = async(req, res) => {
    try {
        const { lat, lng, radius=10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required.' });
        }

        const distanceInMeters = parseFloat(radius) * 1000;        
        const profiles = await DoctorProfile.find({
            clinicLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]  // lng first
                    },
                    $maxDistance: distanceInMeters
                }
            }
        }).populate({
            path: 'userId',
            match: { verificationStatus: 'Verified', isBlocked: false, role: 'doctor' },
            select: 'name email username profilePic'
        });

        const doctors = profiles.filter(doc => doc.userId);
        res.status(200).json({ results: doctors.length, doctors: doctors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getMyPatients = async (req, res) => {
    try {
        const patientIds = await Appointment.find({ doctorId: req.user._id }).distinct('patientId');
        const patients = await User.find({ _id: { $in: patientIds } }).select('name email');
        return res.status(200).json({ results: patients.length, patients });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getPatientHealthLogs = async (req, res) => {
    try {
        const { patientId } = req.params;

        const hasRelationship = await Appointment.findOne({ doctorId: req.user._id, patientId });
        if (!hasRelationship) {
            return res.status(403).json({ message: "You do not have access to this patient's records" });
        }

        const patient = await User.findById(patientId).select('name email age gender contact bloodGroup emergencyContact');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const logs = await HealthLog.find({ userId: patientId }).sort({ date: -1 });
        return res.status(200).json({ success: true, patient, logs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadDocument, getDoctorProfile, updateDoctorProfile, getPublicDoctors, 
    searchDoctors, getNearbyDoctors, getMyPatients, getPatientHealthLogs };