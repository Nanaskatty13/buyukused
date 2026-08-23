
// ============================================================
// backend/routes/visualSearchRoutes.js
// BuyUKUsed Visual Search Routes
// ============================================================

const express = require("express");

const router = express.Router();

const visualSearchController = require("../controllers/visualSearchController");

const upload = require("../middleware/upload");

// ============================================================
// VISUAL SEARCH
// ============================================================
//
// POST /api/visual-search
//
// Form-data:
//
// image = uploaded image
//
// Optional:
//
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
  visualSearchController.visualSearch
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;