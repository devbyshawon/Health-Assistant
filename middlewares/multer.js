const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profile-pics/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile-${req.user._id}-${Date.now()}${ext}`);
    }
});

const profileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files allowed'), false);
    }
};

const uploadProfilePic = multer({
    storage: profileStorage,
    fileFilter: profileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const doctorStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/docs/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    }
});

const doctorFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, JPEG, PNG files allowed'), false);
    }
};

const uploadDoctorDocs = multer({
    storage: doctorStorage,
    fileFilter: doctorFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]);

module.exports = { uploadProfilePic, uploadDoctorDocs };