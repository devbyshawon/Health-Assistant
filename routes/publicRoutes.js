const express = require('express');
const router = express.Router();
const { getPublicDoctors, searchDoctors, getNearbyDoctors } = require("../controllers/doctorController");

// Public routes
router.get('/doctors', getPublicDoctors);
router.get('/doctors/search', searchDoctors);
router.get('/doctors/nearby', getNearbyDoctors);

module.exports = router;