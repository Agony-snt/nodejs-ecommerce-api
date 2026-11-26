const multer = require('multer');
const path = require('path');
const fs = require('fs');

const coverStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const coverUploadPath = path.join(__dirname, "../../../public/covers");
        if (!fs.existsSync(coverUploadPath)) {
            fs.mkdirSync(coverUploadPath, { recursive: true });
        }

        cb(null, coverUploadPath);
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + String(Math.floor(Math.random() * 1E12));
        const ext = path.extname(file.originalname);
        cb(null, `cover-${fileName}${ext}`);
    }
});

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const avatarUploadPath = path.join(__dirname, "../../../public/avatars");
        if (!fs.existsSync(avatarUploadPath)) {
            fs.mkdirSync(avatarUploadPath, { recursive: true });
        }

        cb(null, avatarUploadPath);
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + String(Math.floor(Math.random() * 1E12));
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${fileName}${ext}`);
    }
});

const iconStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const iconUploadPath = path.join(__dirname, "../../../public/icons");
        if (!fs.existsSync(iconUploadPath)) {
            fs.mkdirSync(iconUploadPath, { recursive: true });
        }

        cb(null, iconUploadPath);
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + String(Math.floor(Math.random() * 1E12));
        const ext = path.extname(file.originalname);
        cb(null, `icon-${fileName}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, ico)'));
};

exports.uploadCovers = multer({
    storage: coverStorage,
    limits: { fileSize: 6 * 1024 * 1024 }, // 6MB max
    fileFilter
});

exports.uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter
});

exports.uploadIcon = multer({
    storage: iconStorage,
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter
});