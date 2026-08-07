// backend/config/multer.js

const multer = require("multer");
const path = require("path");

// ===============================
// MEMORY STORAGE
// Files stay in memory temporarily
// then we upload them to Cloudinary
// ===============================

const storage = multer.memoryStorage();


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