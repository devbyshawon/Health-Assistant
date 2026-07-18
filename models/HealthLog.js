const mongoose = require('mongoose');

const HealthLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {type: Date, required: true, default: Date.now},
    symptoms: [String],
    mood: {type: String},
    notes: {type: String},
    height: {type: Number},
    weight: {type: Number},
    
    vitals: {
        temperature: {type: Number, default: null},
        heartRate: {type: Number, default: null},
        bloodPressure: {type: String, default: null}
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('HealthLog', HealthLogSchema);