const User = require('../models/User');
const Appointment = require('../models/Appointment');
const createNotification = require('../utils/createNotification');

const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, reason } = req.body;
        if (!doctorId || !date) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const doctor = await User.findOne({ _id: doctorId, role: 'doctor', verificationStatus: 'Verified' });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const appointment = await Appointment.create({
            patientId: req.user._id,
            doctorId, 
            date, 
            reason, 
            status: 'Pending'
        });

        await createNotification({
            recipientId: req.user._id,
            title: 'Appointment Booked',
            message: `Your appointment is scheduled for ${new Date(date).toLocaleString()}`,
            type: 'appointment'
        });
        await createNotification({
            recipientId: doctorId,
            title: 'New Appointment Request',
            message: `You have a new appointment request for ${new Date(date).toLocaleString()}`,
            type: 'appointment'
        });
        return res.status(201).json({ success: true, message: 'Appointment booked', data: appointment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body;
        let appointment;
        if (req.user.role === 'user') {
            appointment = await Appointment.findOne({ _id: id, patientId: req.user._id });
        } else if (req.user.role === 'doctor') {
            appointment = await Appointment.findOne({ _id: id, doctorId: req.user._id });
        }
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }
        appointment.date = date; 
        appointment.status = 'Pending';

        await appointment.save();
        await createNotification({
            recipientId: appointment.patientId,
            title: 'Appointment Rescheduled',
            message: `Your appointment has been rescheduled to ${new Date(date).toLocaleString()}`,
            type: 'appointment'
        });
        await createNotification({
            recipientId: appointment.doctorId,
            title: 'Appointment Rescheduled',
            message: `An appointment has been rescheduled to ${new Date(date).toLocaleString()}`,
            type: 'appointment'
        });
        return res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        let appointment;
        if (req.user.role === 'user') {
            appointment = await Appointment.findOne({ _id: id, patientId: req.user._id });
        } else if (req.user.role === 'doctor') {
            appointment = await Appointment.findOne({ _id: id, doctorId: req.user._id });
        }
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }
        if (['Completed', 'Cancelled'].includes(appointment.status)) {
            return res.status(400).json({ message: `Cannot cancel a ${appointment.status.toLowerCase()} appointment` });
        }
        appointment.status = 'Cancelled';

        await appointment.save();
        await createNotification({
            recipientId: appointment.patientId,
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled.',
            type: 'appointment'
        });
        await createNotification({
            recipientId: appointment.doctorId,
            title: 'Appointment Cancelled',
            message: 'An appointment with your patient has been cancelled.',
            type: 'appointment'
        });
        return res.status(200).json({ message: 'Appointment cancelled' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user._id }).populate({
            path: 'doctorId', 
            select: 'name email doctorProfile',
            populate: { path: 'doctorProfile', select: 'specialty' }
        }).sort({ date: -1 });

        return res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user._id }).populate('patientId', 'name email').sort({ date: 1 });
        return res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const markComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findOne({ _id: id, doctorId: req.user._id });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }
        if (['Completed', 'Cancelled'].includes(appointment.status)) {
            return res.status(400).json({ message: `Cannot complete a ${appointment.status.toLowerCase()} appointment` });
        }
        appointment.status = 'Completed';

        await appointment.save();
        await createNotification({
            recipientId: appointment.patientId,
            title: 'Appointment Completed',
            message: 'Your appointment has been marked as completed.',
            type: 'appointment'
        });
        return res.status(200).json({ message: 'Appointment marked as completed', appointment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findOne({ _id: id, doctorId: req.user._id });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending appointments can be confirmed' });
        }
        appointment.status = 'Confirmed';

        await appointment.save();
        await createNotification({
            recipientId: appointment.patientId,
            title: 'Appointment Confirmed',
            message: 'Your appointment has been confirmed by the doctor.',
            type: 'appointment'
        });
        return res.status(200).json({ message: 'Appointment confirmed', appointment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { bookAppointment, rescheduleAppointment, cancelAppointment, getMyAppointments, 
    getDoctorAppointments, markComplete, confirmAppointment };