// backend/config/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===============================
// DETERMINE UPLOAD DIRECTORY
// ===============================
const uploadDir = path.join(__dirname, "../public/uploads");

// ===============================
// CREATE DIRECTORY (if missing) with error handling
// ===============================
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Upload directory created: ${uploadDir}`);
  } else {
    console.log(`📁 Upload directory exists: ${uploadDir}`);
  }
} catch (err) {
  console.error(`❌ Failed to create upload directory: ${err.message}`);
  // In production, you might want to fallback to a different location or exit.
  // For now, we'll continue (multer might fail later, but at least the app starts).
}

// ===============================
// STORAGE CONFIG
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double-check that the directory exists (in case it was deleted)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // Sanitize filename: replace spaces and special chars
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// ===============================
// FILE FILTER
// ===============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  // Return a meaningful error (multer will send it to the error handler)
  cb(new Error("Only images (jpg, png, gif) and videos (mp4, mov, avi, webm) are allowed"));
};

// ===============================
// MULTER INSTANCE
// ===============================
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter,
});

// ===============================
// EXPORT
// ===============================
module.exports = upload;