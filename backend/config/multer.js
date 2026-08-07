// backend/config/multer.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const name = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9]/g, "-");

    return {
      folder: "kn-classifieds/products",
      public_id: `${name}-${Date.now()}`,
      resource_type: "auto",
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
    };
  },
});


const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;

  const extname = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Only images and videos are allowed"
    )
  );
};


const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter,
});


module.exports = upload;