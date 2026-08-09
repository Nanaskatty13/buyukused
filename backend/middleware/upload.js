
// backend/middleware/upload.js

const multer = require("multer");

// ==========================
// Storage
// ==========================
// Keep uploaded files in memory.
// The product controller sends the buffers to Cloudinary.

const storage = multer.memoryStorage();

// ==========================
// File Filter
// ==========================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG, WEBP, GIF images and MP4, MOV, AVI, WEBM videos are allowed"
    ),
    false
  );
};

// ==========================
// Multer Upload
// ==========================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;