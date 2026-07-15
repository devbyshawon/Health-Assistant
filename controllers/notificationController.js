const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: notifications });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notifications = await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user._id }, { isRead: true }, { returnDocument: 'after' } );
        if (!notifications) {
            return res.status(404).json({ message: 'Notifications not found' });
        }

        return res.status(200).json({ success: true, message: 'Marked as read', data: notifications });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getNotifications, markAsRead };