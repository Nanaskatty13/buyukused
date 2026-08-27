// ============================================================
// backend/routes/reviewRoutes.js
// BuyUKUsed - Review Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  reportReview,
  replyToReview,
  deleteReply,
  getSellerSummary,
  getProductSummary,
} = require("../controllers/reviewController");

// IMPORTANT:
// Change this path ONLY if your authentication middleware
// is located somewhere else in your project.
const auth = require("../middleware/auth");

// ============================================================
// PUBLIC ROUTES
// ============================================================

// ------------------------------------------------------------
// GET REVIEWS
// ------------------------------------------------------------
// GET /api/reviews
//
// Examples:
// /api/reviews?sellerId=SELLER_ID
// /api/reviews?productId=PRODUCT_ID
// /api/reviews?sellerId=SELLER_ID&rating=5
// /api/reviews?productId=PRODUCT_ID&page=1&limit=10
//
// Authentication is NOT required to read reviews.
// ------------------------------------------------------------

router.get("/", getReviews);

// ============================================================
// PUBLIC SUMMARY ROUTES
// ============================================================

// ------------------------------------------------------------
// GET SELLER REVIEW SUMMARY
// ------------------------------------------------------------
// GET /api/reviews/seller/:sellerId/summary
// ------------------------------------------------------------

router.get(
  "/seller/:sellerId/summary",
  getSellerSummary
);

// ------------------------------------------------------------
// GET PRODUCT REVIEW SUMMARY
// ------------------------------------------------------------
// GET /api/reviews/product/:productId/summary
// ------------------------------------------------------------

router.get(
  "/product/:productId/summary",
  getProductSummary
);

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

// ------------------------------------------------------------
// CREATE REVIEW
// ------------------------------------------------------------
// POST /api/reviews
//
// Requires authentication.
// ------------------------------------------------------------

router.post(
  "/",
  auth,
  createReview
);

// ------------------------------------------------------------
// UPDATE REVIEW
// ------------------------------------------------------------
// PUT /api/reviews/:id
//
// Requires authentication.
// Only the review owner can edit.
// ------------------------------------------------------------

router.put(
  "/:id",
  auth,
  updateReview
);

// ------------------------------------------------------------
// DELETE REVIEW
// ------------------------------------------------------------
// DELETE /api/reviews/:id
//
// Requires authentication.
// Review owner or admin can delete.
// ------------------------------------------------------------

router.delete(
  "/:id",
  auth,
  deleteReview
);

// ------------------------------------------------------------
// TOGGLE HELPFUL
// ------------------------------------------------------------
// POST /api/reviews/:id/helpful
//
// Requires authentication.
// ------------------------------------------------------------

router.post(
  "/:id/helpful",
  auth,
  toggleHelpful
);

// ------------------------------------------------------------
// REPORT REVIEW
// ------------------------------------------------------------
// POST /api/reviews/:id/report
//
// Requires authentication.
// ------------------------------------------------------------

router.post(
  "/:id/report",
  auth,
  reportReview
);

// ============================================================
// SELLER REPLY ROUTES
// ============================================================

// ------------------------------------------------------------
// REPLY TO REVIEW
// ------------------------------------------------------------
// POST /api/reviews/:id/reply
//
// Requires authentication.
// Only the seller associated with the review can reply.
// ------------------------------------------------------------

router.post(
  "/:id/reply",
  auth,
  replyToReview
);

// ------------------------------------------------------------
// DELETE SELLER REPLY
// ------------------------------------------------------------
// DELETE /api/reviews/:id/reply
//
// Requires authentication.
// Seller or admin can remove the reply.
// ------------------------------------------------------------

router.delete(
  "/:id/reply",
  auth,
  deleteReply
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;