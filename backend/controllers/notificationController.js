const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ recipientId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ recipientId: req.user._id })
        ]);

        return res.status(200).json({
            success: true,
            data: notifications,
            pagination: { page, limit, total, hasMore: skip + notifications.length < total }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notifications = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user._id }, 
            { isRead: true }, 
            { returnDocument: 'after' } 
        );
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