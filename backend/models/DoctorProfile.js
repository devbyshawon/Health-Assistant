const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    isDoctorVerified: {
        type: Boolean,
        default: false
    },
    specialty: {type: String},
    bio: {type: String},
    phone: {type: String},
    experience: {type: Number},
    fees: {type: Number},
    rating: {type: Number, default: 0},

    clinicLocation: {
        type: {type: String, enum: ['Point'], default: 'Point'},
        coordinates: {type: [Number], default: [0, 0]}
    },

    availability: [{
        day: {type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']},
        startTime: String,
        endTime: String
    }],

    documents: [{
        filename: String,
        filetype: String,
        status: {type: String, enum: ['Pending','Verified','Rejected'], default: 'Pending'}
    }],

    credentials: {
        status: { type: String, enum: ['Pending','Verified','Rejected'], default: 'Pending' },
        feedback: String
    },
    
    isDeleted: {type: Boolean, default: false},
    deletedAt: {type: Date},
}, { 
    timestamps: true 
});

DoctorProfileSchema.index({ clinicLocation: '2dsphere' });

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);