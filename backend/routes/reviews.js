// ============================================================
// backend/routes/reviews.js
// BuyUKUsed - Review Routes
// ============================================================

const express = require("express");
const router = express.Router();

const {
  getProductReviews,
  getSellerReviews,
  getUserReviews,          // <-- NEW
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  checkUserReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/auth");

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================

// Get product reviews (by productId query param)
router.get("/product", getProductReviews);

// Get seller reviews (by sellerId query param)
router.get("/seller", getSellerReviews);

// Get user reviews (by userId query param)  // <-- NEW
router.get("/user", getUserReviews);

// Get a single review by ID
router.get("/:id", getReviewById);

// ============================================================
// PROTECTED ROUTES (authentication required)
// ============================================================

// Create a review
router.post("/", protect, createReview);

// Update a review (owner only)
router.put("/:id", protect, updateReview);

// Delete a review (soft delete, owner only)
router.delete("/:id", protect, deleteReview);

// Check if the current user has reviewed a product/seller/user
router.get("/check", protect, checkUserReview);

module.exports = router;