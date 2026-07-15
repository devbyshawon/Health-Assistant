const Reminder = require("../models/Reminder");

const createReminder = async (req, res) => {
    try {
        const { medicineName, dosage, time, repeat, notes } = req.body;
        if (!medicineName || !time) {
            return res.status(400).json({ message: 'Medicine name and time are required' });
        }

        const reminder = await Reminder.create({
            userId: req.user._id,
            medicineName,
            dosage,
            time,
            repeat,
            notes
        });

        return res.status(201).json({ success: true, message: 'Reminder created', data: reminder });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user._id }).sort({ time: 1 });
        
        return res.status(200).json({ success: true, data: reminders });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateReminder = async (req, res) => {
    try {
        const updated = await Reminder.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { returnDocument: 'after' }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        return res.status(200).json({ success: true, message: 'Reminder updated', data: updated });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteReminder = async (req, res) => {
    try {
        const deleted = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deleted) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        
        return res.status(200).json({ success: true, message: 'Reminder deleted' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createReminder, getReminders, updateReminder, deleteReminder };