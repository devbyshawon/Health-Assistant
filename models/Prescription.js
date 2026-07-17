const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
    fileUrl: {type: String, required: true},
    description: {type: String},
    extractedText: {type: String},
    uploadedAt: {type: Date, default: Date.now}
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);