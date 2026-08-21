// ============================================================
// backend/routes/productRoutes.js
// BuyUKUsed Product Routes
// ============================================================

const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

// ============================================================
// CONTROLLER
// ============================================================

const productController =
  require("../controllers/productController");

// ============================================================
// VALIDATOR
// ============================================================

const {
  productValidator,
} = require("../src/validators/productValidator");

// ============================================================
// MULTER
// ============================================================

const storage =
  multer.memoryStorage();

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedExtensions =
    /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;

  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  const extensionValid =
    allowedExtensions.test(
      extension
    );

  const mimeValid =
    file.mimetype &&
    (
      file.mimetype.startsWith(
        "image/"
      ) ||
      file.mimetype.startsWith(
        "video/"
      )
    );

  if (
    extensionValid &&
    mimeValid
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only images and videos are allowed"
    )
  );
};

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        50 * 1024 * 1024,
    },

    fileFilter,
  });

// ============================================================
// GET ALL PRODUCTS
// ============================================================

router.get(
  "/",
  productController.getProducts
);

// ============================================================
// GET SELLER PRODUCTS
// IMPORTANT: MUST COME BEFORE /:id
// ============================================================

router.get(
  "/seller/me",
  productController.getSellerProducts
);

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

router.get(
  "/:id",
  productController.getProductById
);

// ============================================================
// CREATE PRODUCT
// ============================================================

router.post(
  "/",
  upload.array("files", 10),
  productValidator,
  productController.createProduct
);

// ============================================================
// UPDATE PRODUCT
// ============================================================

router.put(
  "/:id",
  upload.array("files", 10),
  productValidator,
  productController.updateProduct
);

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================

router.patch(
  "/:id/status",
  productController.updateProductStatus
);

// ============================================================
// DELETE PRODUCT
// ============================================================

router.delete(
  "/:id",
  productController.deleteProduct
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;