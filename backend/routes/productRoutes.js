// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ============================================================
// IMPORT CONTROLLER (full logic from productController.js)
// ============================================================

const productController = require("../controllers/productController");

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images and videos are allowed"));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter,
});

// ============================================================
// ROUTES
// ============================================================

// GET all products (public)
router.get("/", productController.getProducts);

// GET single product
router.get("/:id", productController.getProductById);

// CREATE product (with file uploads)
router.post(
  "/",
  upload.array("files", 10), // Accept up to 10 files (images + video)
  productController.createProduct
);

// UPDATE product (with file uploads)
router.put(
  "/:id",
  upload.array("files", 10),
  productController.updateProduct
);

// UPDATE product status
router.patch("/:id/status", productController.updateProductStatus);

// DELETE product
router.delete("/:id", productController.deleteProduct);

// GET seller's products
router.get("/seller/me", productController.getSellerProducts);

module.exports = router;