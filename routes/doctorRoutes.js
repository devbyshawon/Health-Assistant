const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadDocument, getDoctorProfile, updateDoctorProfile } = require("../controllers/doctorController");
const { uploadDoctorDocs } = require("../middlewares/multer");

// DoctorProfile routes
router.post('/upload-docs', protect, restrictTo('doctor'), uploadDoctorDocs, uploadDocument);
router.get('/me', protect, restrictTo('doctor'), getDoctorProfile);
router.patch('/update-profile', protect, restrictTo('doctor'), updateDoctorProfile);

module.exports = router;