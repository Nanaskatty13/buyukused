
// backend/config/cloudinary.js

const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

// ==========================
// Cloudinary Configuration
// ==========================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================
// Validate Configuration
// ==========================

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    "⚠️ Cloudinary environment variables are not fully configured."
  );
}

module.exports = cloudinary;