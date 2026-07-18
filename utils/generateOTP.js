const crypto = require('crypto');

const generateOTP = (length = 6) => {
    if (length < 6 || length > 10) {
        throw new Error('OTP length must be between 6 and 10 digits');
    }

    const digits = '0123456789';
    let otp ='';
    for (let i = 0; i < length; i++) {
            const index = crypto.randomInt(0, digits.length); 
            otp += digits[index];
    }
    
    return otp;
};

module.exports = generateOTP;