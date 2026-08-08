const multer = require('multer');
const { storage } = require('./cloudinary');   // Cloudinary storage

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
                   'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'), false);
  }
};

const upload = multer({
  storage,  // ← Cloudinary storage
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;