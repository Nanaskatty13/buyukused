// backend/routes/upload.js

const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================

const cloudName = String(
  process.env.CLOUDINARY_CLOUD_NAME || ""
).trim();

const apiKey = String(
  process.env.CLOUDINARY_API_KEY || ""
).trim();

const apiSecret = String(
  process.env.CLOUDINARY_API_SECRET || ""
).trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    "⚠️ Cloudinary environment variables are not fully configured."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// ============================================================
// CLOUDINARY STORAGE
// ============================================================

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "chat-attachments",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "mov",
      "vcf",
      "vcard",
    ],

    resource_type: "auto",
  },
});

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// ============================================================
// POST /api/upload
// ============================================================

router.post(
  "/",
  verifyToken,
  upload.single("file"),

  async (req, res) => {
    try {
      // --------------------------------------------------------
      // CHECK FILE
      // --------------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
        });
      }

      // --------------------------------------------------------
      // CLOUDINARY URL
      // --------------------------------------------------------

      const url =
        req.file.secure_url ||
        req.file.path ||
        "";

      if (!url) {
        console.error(
          "❌ Cloudinary upload completed but no URL was returned:",
          req.file
        );

        return res.status(500).json({
          success: false,
          message:
            "File uploaded but no file URL was returned.",
        });
      }

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      console.log(
        "✅ File uploaded successfully:",
        url
      );

      return res.status(200).json({
        success: true,
        url,

        file: {
          url,
          publicId:
            req.file.filename ||
            req.file.public_id ||
            null,

          originalName:
            req.file.originalname ||
            null,

          mimetype:
            req.file.mimetype ||
            null,

          size:
            req.file.size ||
            null,

          resourceType:
            req.file.resource_type ||
            null,
        },
      });
    } catch (error) {
      // --------------------------------------------------------
      // UPLOAD ERROR
      // --------------------------------------------------------

      console.error(
        "❌ Cloudinary upload error:"
      );

      console.error(
        "Message:",
        error?.message ||
          error
      );

      console.error(
        "Stack:",
        error?.stack ||
          "N/A"
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "File upload failed.",
      });
    }
  }
);

// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      console.error(
        "❌ Multer error:",
        error
      );

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(413).json({
          success: false,
          message:
            "File too large. Maximum size is 50MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload error.",
      });
    }

    // Pass other errors to the global
    // Express error handler.
    return next(error);
  }
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;