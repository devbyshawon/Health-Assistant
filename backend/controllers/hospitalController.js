const Hospital = require('../models/Hospital');

const getPublicHospitals = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        }

        const hospitals = await Hospital.find(query).sort({ name: 1 });
        return res.status(200).json({ results: hospitals.length, hospitals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const searchHospitals = async (req, res) => {
    try {
        const { name } = req.query;
        const query = { isActive: true };
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const hospitals = await Hospital.find(query).sort({ name: 1 });
        return res.status(200).json({ results: hospitals.length, hospitals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getNearbyHospitals = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required.' });
        }

        const distanceInMeters = parseFloat(radius) * 1000;
        const hospitals = await Hospital.find({
            isActive: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]  // lng first
                    },
                    $maxDistance: distanceInMeters
                }
            }
        });

        return res.status(200).json({ results: hospitals.length, hospitals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPublicHospitals, searchHospitals, getNearbyHospitals };
