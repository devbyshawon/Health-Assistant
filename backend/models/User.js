const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({ 
    name: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},

    age: {type: Number},
    gender: {type: String, enum: ['Male', 'Female', 'Others'], default: null},
    contact: {type: String},
    profilePic: {type: String, default: null},
    birthday: {type: String},
    address: {type: String},
    bloodGroup: {type: String},
    intro: {type: String},
    emergencyContact: {
        name: {type: String},
        phone: {type: String},
        email: {type: String},
        relation: {type: String}
    },

    role: {type: String, enum: ['user', 'doctor', 'admin'], default: 'user'},
    isVerified: {type: Boolean, default: false},
    isEmailVerified: {type: Boolean, default: false},
    verificationStatus: {type: String, enum: ['None', 'Pending', 'Verified', 'Rejected'], default: 'None'},
    docsUploaded: {type: Boolean, default: false},
    doctorProfile: {type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile'},

    otp: {type: String}, 
    otpExpiresAt: {type: Date},

    isBlocked: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    deletedAt: {type: Date},

    isTwoFAEnabled: {type: Boolean, default: false},
    twoFAToken: {type: String, default: null},
    twoFATokenExpires: {type: Date, default: null},
    twoFASetupPending: {type: Boolean, default: false}
}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);   
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.otp;
    delete user.twoFAToken;
    delete user.twoFATokenExpires;
    return user;
};

UserSchema.virtual('completion').get(function() {
    const fields = ['name', 'username', 'email', 'age', 'gender', 'contact', 'birthday', 'address', 'bloodGroup', 'intro', 'profilePic'];
    const filled = fields.filter(field => this[field] && this[field] !== '');
    const percentage = Math.round((filled.length / fields.length) * 100);
    return percentage;
});

module.exports = mongoose.model('User', UserSchema);