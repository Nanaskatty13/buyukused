// backend/routes/listings.js

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

// ---- Public routes ----
router.get("/", getListings);
router.get("/:id", getListingById);

// ---- Private routes (authentication required) ----
router.use(protect);
router.get("/my", getMyListings);
router.post("/", uploadListingImages, createListing);
router.put("/:id", uploadListingImages, updateListing);
router.patch("/:id/status", updateListingStatus);
router.delete("/:id", deleteListing);

module.exports = router;