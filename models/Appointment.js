const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {type: Date, required: true},
    reason: {type: String},
    status: {type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending'},
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);