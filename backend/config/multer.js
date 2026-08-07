// backend/config/multer.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const path = require("path");

// ===============================
// CLOUDINARY STORAGE
// ===============================

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kn-classifieds/products",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "mov",
      "avi",
      "webm",
    ],

    resource_type: "auto",

    public_id: (req, file) => {
      const name = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9]/g, "-");

      return `${name}-${Date.now()}`;
    },
  },
});


// ===============================
// FILE FILTER
// ===============================

const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Only images (jpg, jpeg, png, gif, webp) and videos (mp4, mov, avi, webm) are allowed"
    )
  );
};


// ===============================
// MULTER INSTANCE
// ===============================

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },

  fileFilter,
});


module.exports = upload;