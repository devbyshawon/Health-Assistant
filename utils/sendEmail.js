const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Missing email credentials in environment variables');
        }
        
        const transporter = nodemailer.createTransport({ 
            service: 'gmail', 
            auth: { 
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            } 
        });
        const mailOptions = {
            from: `'Health Assistant' <${process.env.EMAIL_USER}>`,
            to, 
            subject,
            text: text || html?.replace(/<[^>]+>/g, ''),
            html 
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Email failed to send:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;