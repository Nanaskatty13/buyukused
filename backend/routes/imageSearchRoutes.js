// ============================================================
// backend/routes/imageSearchRoutes.js
// ============================================================

const express = require("express");
const multer = require("multer");

const {
  searchProductsByImage,
} = require("../controllers/imageSearchController");

const router =
  express.Router();

// ============================================================
// MULTER MEMORY STORAGE
// ============================================================

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        8 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        allowedTypes.includes(
          file.mimetype
        )
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only JPG, JPEG, PNG and WEBP images are supported"
          )
        );
      }
    },
  });

// ============================================================
// POST /api/products/image-search
// ============================================================

router.post(
  "/image-search",
  upload.single("image"),
  searchProductsByImage
);

module.exports = router;