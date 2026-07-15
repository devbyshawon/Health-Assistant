const Notification = require('../models/Notification');

const createNotification = async ({ recipientId, title, message, type = 'system' }) => {
    try {
        const notification = new Notification({ recipientId, title, message, type });
        await notification.save();
        return notification;

    } catch (error) {
        console.error('Notification creation error:', error);
    }
};

module.exports = createNotification;