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

module.exports = { uploadProfilePic };