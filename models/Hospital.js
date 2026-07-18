const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    address: {type: String, default: ''},
    phone: {type: String},
    email: {type: String},
    location: {
        type: {type: String, enum: ['Point'], default: 'Point'},
        coordinates: {type: [Number], default: [0, 0], required: true}
    },
    isActive: {type: Boolean, default: true},
    meta: {type: Object, default: {}}
}, {
    timestamps: true
});

HospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', HospitalSchema);