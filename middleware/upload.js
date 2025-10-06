const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        'public/uploads/profiles',
        'public/uploads/wallpapers',
        'public/uploads/book-covers'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Single storage configuration that handles all file types
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine destination based on field name
        if (file.fieldname === 'profile_picture') {
            cb(null, 'public/uploads/profiles/');
        } else if (file.fieldname === 'wallpaper') {
            cb(null, 'public/uploads/wallpapers/');
        } else if (file.fieldname === 'cover_image') {
            cb(null, 'public/uploads/book-covers/');
        } else {
            cb(null, 'public/uploads/others/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'profile_picture' ? 'profile' : 
                      file.fieldname === 'wallpaper' ? 'wallpaper' :
                      file.fieldname === 'cover_image' ? 'book-cover' : 'file';
        cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Single upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for all images
    }
});

module.exports = upload;