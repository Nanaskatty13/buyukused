// backend/config/cloudinary.js

const cloudinary =
  require("cloudinary").v2;

// ============================================================
// REQUIRED ENVIRONMENT VARIABLES
// ============================================================

const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing =
  requiredEnv.filter(
    (key) => !process.env[key]
  );

if (missing.length > 0) {
  console.error(
    "❌ Missing Cloudinary environment variables:",
    missing.join(", ")
  );
}

// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

  secure: true,
});

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  cloudinary,
};