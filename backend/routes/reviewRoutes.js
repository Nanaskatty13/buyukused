// ============================================================
// backend/routes/reviewRoutes.js
// BuyUKUsed - Review Routes
// ============================================================

const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLER
// ============================================================

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

// ============================================================
// AUTHENTICATION
// ============================================================

const { protect } = require("../middleware/auth");

// ============================================================
// PUBLIC ROUTES
// ============================================================

// ------------------------------------------------------------
// GET /api/reviews
// ------------------------------------------------------------
//
// Examples:
//
// /api/reviews?sellerId=123
// /api/reviews?productId=123
// /api/reviews?sellerId=123&page=1&limit=10
// /api/reviews?sellerId=123&rating=5
//
// ------------------------------------------------------------

router.get(
  "/",
  getReviews
);

// ============================================================
// SELLER SUMMARY
// ============================================================

// GET /api/reviews/seller/:sellerId/summary

router.get(
  "/seller/:sellerId/summary",
  getSellerSummary
);

// ============================================================
// PRODUCT SUMMARY
// ============================================================

// GET /api/reviews/product/:productId/summary

router.get(
  "/product/:productId/summary",
  getProductSummary
);

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

router.use(protect);

// ============================================================
// CREATE REVIEW
// ============================================================

// POST /api/reviews

router.post(
  "/",
  createReview
);

// ============================================================
// UPDATE REVIEW
// ============================================================

// PUT /api/reviews/:id

router.put(
  "/:id",
  updateReview
);

// ============================================================
// DELETE REVIEW
// ============================================================

// DELETE /api/reviews/:id

router.delete(
  "/:id",
  deleteReview
);

// ============================================================
// HELPFUL
// ============================================================

// POST /api/reviews/:id/helpful

router.post(
  "/:id/helpful",
  toggleHelpful
);

// ============================================================
// REPORT
// ============================================================

// POST /api/reviews/:id/report

router.post(
  "/:id/report",
  reportReview
);

// ============================================================
// SELLER REPLY
// ============================================================

// POST /api/reviews/:id/reply

router.post(
  "/:id/reply",
  replyToReview
);

// ============================================================
// DELETE SELLER REPLY
// ============================================================

// DELETE /api/reviews/:id/reply

router.delete(
  "/:id/reply",
  deleteReply
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;