// backend/config/multer.js

const multer = require("multer");

// ============================================================
// ALLOWED FILE TYPES
// ============================================================

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const allowedVideoTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

const allowedTypes = [
  ...allowedImageTypes,
  ...allowedVideoTypes,
];

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  console.log(
    `📁 Incoming file: ${file.originalname} | ${file.mimetype}`
  );

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}`
      ),
      false
    );
  }
};

// ============================================================
// MEMORY STORAGE
// ============================================================

const storage = multer.memoryStorage();

// ============================================================
// MULTER
// ============================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 6,
  },

  fileFilter,
});

// ============================================================
// EXPORT
// ============================================================

module.exports = upload;