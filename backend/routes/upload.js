// backend/routes/upload.js

const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const { verifyToken } = require("../middleware/auth");

const router = express.Router();

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
});

// ============================================================
// MULTER MEMORY STORAGE
// ============================================================
//
// We do NOT use multer-storage-cloudinary.
//
// The file is temporarily kept in memory and then uploaded
// directly to Cloudinary using Cloudinary's v2 API.
//

const storage =
  multer.memoryStorage();

// ============================================================
// MULTER
// ============================================================

const upload = multer({
  storage,

  limits: {
    fileSize:
      50 * 1024 * 1024, // 50 MB
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",

      // Videos
      "video/mp4",
      "video/quicktime",
      "video/webm",

      // Contact files
      "text/vcard",
      "text/x-vcard",
      "text/directory",
      "application/vcard",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      return callback(
        null,
        true
      );
    }

    return callback(
      new Error(
        `Unsupported file type: ${file.mimetype}`
      ),
      false
    );
  },
});

// ============================================================
// UPLOAD BUFFER TO CLOUDINARY
// ============================================================

const uploadToCloudinary = (
  buffer,
  mimetype,
  folder = "chat-attachments"
) => {
  return new Promise(
    (resolve, reject) => {
      // ------------------------------------------------------
      // Determine resource type
      // ------------------------------------------------------

      let resourceType =
        "auto";

      if (
        mimetype.startsWith(
          "video/"
        )
      ) {
        resourceType =
          "video";
      } else if (
        mimetype.startsWith(
          "image/"
        )
      ) {
        resourceType =
          "image";
      } else {
        resourceType =
          "raw";
      }

      // ------------------------------------------------------
      // Cloudinary upload stream
      // ------------------------------------------------------

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,

            resource_type:
              resourceType,

            // Generate unique public IDs
            unique_filename: true,

            // Keep original filename where possible
            use_filename: true,
          },

          (
            error,
            result
          ) => {
            if (error) {
              return reject(
                error
              );
            }

            resolve(result);
          }
        );

      uploadStream.end(
        buffer
      );
    }
  );
};

// ============================================================
// POST /api/upload
// ============================================================

router.post(
  "/",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      // ------------------------------------------------------
      // CHECK FILE
      // ------------------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "No file uploaded.",
        });
      }

      // ------------------------------------------------------
      // CHECK CLOUDINARY CONFIG
      // ------------------------------------------------------

      if (
        !process.env
          .CLOUDINARY_CLOUD_NAME ||
        !process.env
          .CLOUDINARY_API_KEY ||
        !process.env
          .CLOUDINARY_API_SECRET
      ) {
        console.error(
          "❌ Cloudinary environment variables are missing."
        );

        return res.status(500).json({
          success: false,
          message:
            "Cloudinary is not configured.",
        });
      }

      // ------------------------------------------------------
      // UPLOAD TO CLOUDINARY
      // ------------------------------------------------------

      console.log(
        "☁️ Uploading file to Cloudinary:",
        req.file.originalname
      );

      const result =
        await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype,
          "chat-attachments"
        );

      // ------------------------------------------------------
      // CHECK RESULT
      // ------------------------------------------------------

      if (
        !result ||
        !result.secure_url
      ) {
        console.error(
          "❌ Cloudinary returned no secure URL:",
          result
        );

        return res.status(500).json({
          success: false,
          message:
            "Cloudinary upload failed.",
        });
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      console.log(
        "✅ Cloudinary upload successful:"
      );

      console.log(
        result.secure_url
      );

      return res.status(200).json({
        success: true,

        url:
          result.secure_url,

        secure_url:
          result.secure_url,

        public_id:
          result.public_id,

        resource_type:
          result.resource_type,

        format:
          result.format,

        originalName:
          req.file.originalname,

        mimeType:
          req.file.mimetype,

        size:
          req.file.size,
      });
    } catch (error) {
      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      console.error(
        "❌ Upload error:"
      );

      console.error(
        error
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
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      console.error(
        "❌ Multer error:",
        error
      );

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "File is too large. Maximum size is 50 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload error.",
      });
    }

    if (error) {
      console.error(
        "❌ Upload middleware error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Invalid file.",
      });
    }

    next();
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;