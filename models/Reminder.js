const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicineName: {type: String, required: true},
    dosage: {type: String},
    time: {type: Date, required: true},
    repeat: {type: String, enum: ['None', 'Daily', 'Weekly'], default: 'None'},
    notes: {type: String},
    completed: {type: Boolean, default: false}
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Reminder', ReminderSchema);