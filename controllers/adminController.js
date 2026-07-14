const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const sendEmail = require('../utils/sendEmail');

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

module.exports = { verifyDoctor };