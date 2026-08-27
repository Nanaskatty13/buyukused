
// ============================================================
// backend/routes/listings.js
// BuyUKUsed - Spare Parts Listing Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  updateListingStatus,
} = require("../controllers/listingController");

const { protect } = require("../middleware/auth");
const { uploadListingImages } = require("../middleware/upload");

// ============================================================
// PUBLIC ROUTES
// ============================================================

// GET /api/listings
router.get("/", getListings);

// IMPORTANT:
// Keep /my BEFORE /:id so "my" is not treated as a listing ID.
router.get("/my", protect, getMyListings);

// GET /api/listings/:id
router.get("/:id", getListingById);

// ============================================================
// PRIVATE ROUTES
// ============================================================

// CREATE
// POST /api/listings
router.post(
  "/",
  protect,
  uploadListingImages,
  createListing
);

// UPDATE
// PUT /api/listings/:id
router.put(
  "/:id",
  protect,
  uploadListingImages,
  updateListing
);

// STATUS
// PATCH /api/listings/:id/status
router.patch(
  "/:id/status",
  protect,
  updateListingStatus
);

// DELETE
// DELETE /api/listings/:id
router.delete(
  "/:id",
  protect,
  deleteListing
);

module.exports = router;