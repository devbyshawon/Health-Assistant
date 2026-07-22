const express = require('express');
const router = express.Router();

const { getPublicDoctors, searchDoctors, getNearbyDoctors } = require("../controllers/doctorController");
const { getPublicStats } = require('../controllers/adminController');

// Public routes
router.get('/doctors', getPublicDoctors);
router.get('/doctors/search', searchDoctors);
router.get('/doctors/nearby', getNearbyDoctors);
router.get('/stats', getPublicStats);

module.exports = router;