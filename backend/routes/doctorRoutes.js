const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadDoctorDocs } = require("../middlewares/multer");

const { uploadDocument, getDoctorProfile, updateDoctorProfile, getMyPatients, getPatientHealthLogs } = require("../controllers/doctorController");
const { getDoctorAppointments, markComplete, cancelAppointment, confirmAppointment } = require('../controllers/appointmentController');

// DoctorProfile routes
router.post('/upload-docs', protect, restrictTo('doctor'), uploadDoctorDocs, uploadDocument);
router.get('/me', protect, restrictTo('doctor'), getDoctorProfile);
router.patch('/update-profile', protect, restrictTo('doctor'), updateDoctorProfile);

// Doctor appoinment routes
router.get('/appointments', protect, restrictTo('doctor'), getDoctorAppointments);
router.patch('/appointments/:id/complete', protect, restrictTo('doctor'), markComplete);
router.patch('/appointments/:id/cancel', protect, restrictTo('doctor'), cancelAppointment);
router.patch('/appointments/:id/confirm', protect, restrictTo('doctor'), confirmAppointment);
router.get('/patients', protect, restrictTo('doctor'), getMyPatients);
router.get('/patients/:patientId/healthlogs', protect, restrictTo('doctor'), getPatientHealthLogs);

module.exports = router;