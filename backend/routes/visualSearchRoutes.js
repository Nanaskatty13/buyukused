// ============================================================
// backend/routes/visualSearchRoutes.js
// BuyUKUsed Visual Search Routes
// ============================================================

const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

const upload = require("../middleware/upload");

// ============================================================
// VISUAL SEARCH
// ============================================================
//
// POST /api/visual-search
//
// Form-data:
// image = uploaded image
//
// Optional:
// category
// location
// minPrice
// maxPrice
// limit
//
// ============================================================

router.post(
  "/",
  upload.single("image"),
  productController.visualSearch
);

module.exports = router;