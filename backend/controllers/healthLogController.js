const HealthLog = require("../models/HealthLog");

const createHealthLog = async (req, res) => {
    try {
        const { symptoms, mood, notes, height, weight, vitals, temperature, heartRate, bloodPressure } = req.body;
        const healthLog = await HealthLog.create({
            userId: req.user._id,
            symptoms: symptoms || [],
            mood: mood || '',
            notes: notes || '',
            height: height ? Number(height) : null,
            weight: weight ? Number(weight) : null,
            vitals: {
                temperature: vitals?.temperature ?? temperature ?? null,
                heartRate: vitals?.heartRate ?? heartRate ?? null,
                bloodPressure: vitals?.bloodPressure ?? bloodPressure ?? null,
            }
        });
        return res.status(201).json({ success: true, data: healthLog });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getHealthLogs = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const logs = await HealthLog.find({ userId: req.user._id }).sort({ date: -1 });
        return res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateHealthLog = async (req, res) => {
    try {
        const { symptoms, mood, notes, height, weight, vitals, temperature, heartRate, bloodPressure } = req.body;
        const healthLog = await HealthLog.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id }, 
            {
                $set: {
                    symptoms: symptoms,
                    mood: mood || '',
                    notes: notes || '',
                    height: height ? Number(height) : null,
                    weight: weight ? Number(weight) : null,
                    vitals: {
                        temperature: vitals?.temperature ?? temperature ?? null,
                        heartRate: vitals?.heartRate ?? heartRate ?? null,
                        bloodPressure: vitals?.bloodPressure ?? bloodPressure ?? null,
                    }
                }
            },
            { returnDocument: 'after', runValidators: true }
        );
        if (!healthLog) {
            return res.status(404).json({ message: 'Health log not found '});
        }
        return res.status(200).json({ success: true, data: healthLog });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteHealthLog = async (req, res) => {
    try {
        const healthLog = await HealthLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!healthLog) {
            return res.status(404).json({ message: 'Health log not found' });
        }
        return res.status(200).json({ message: 'Health log deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createHealthLog, getHealthLogs, updateHealthLog, deleteHealthLog };