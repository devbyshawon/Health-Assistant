const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadDoctorDocs } = require("../middlewares/multer");

const { uploadDocument, getDoctorProfile, updateDoctorProfile } = require("../controllers/doctorController");
const { getDoctorAppointments, markComplete } = require('../controllers/appointmentController');

// DoctorProfile routes
router.post('/upload-docs', protect, restrictTo('doctor'), uploadDoctorDocs, uploadDocument);
router.get('/me', protect, restrictTo('doctor'), getDoctorProfile);
router.patch('/update-profile', protect, restrictTo('doctor'), updateDoctorProfile);

// Doctor appoinment routes
router.get('/appointments', protect, restrictTo('doctor'), getDoctorAppointments);
router.patch('/appointments/:id/complete', protect, restrictTo('doctor'), markComplete);

module.exports = router;