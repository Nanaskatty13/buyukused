// ============================================================
// backend/routes/reviews.js
// BuyUKUsed - Review Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  verifyToken,
} = require("../middleware/auth");

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
} = require("../controllers/reviewController");

// ============================================================
// TEST
// ============================================================

router.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "Reviews router is alive!",
  });
});

// ============================================================
// GET REVIEWS
//
// GET /api/reviews
//
// Examples:
//
// /api/reviews?sellerId=USER_ID
// /api/reviews?productId=PRODUCT_ID
// /api/reviews?sellerId=USER_ID&page=1&limit=10
// /api/reviews?sellerId=USER_ID&rating=5
//
// Public route.
// Login is NOT required to read reviews.
// ============================================================

router.get("/", getReviews);

// ============================================================
// GET SELLER RATING SUMMARY
//
// GET /api/reviews/seller/:sellerId/summary
//
// Public route.
// ============================================================

router.get(
  "/seller/:sellerId/summary",
  getSellerSummary
);

// ============================================================
// CREATE REVIEW
//
// POST /api/reviews
//
// Authentication required.
// ============================================================

router.post(
  "/",
  verifyToken,
  createReview
);

// ============================================================
// UPDATE REVIEW
//
// PUT /api/reviews/:id
//
// Authentication required.
// Controller checks ownership/admin permissions.
// ============================================================

router.put(
  "/:id",
  verifyToken,
  updateReview
);

// ============================================================
// DELETE REVIEW
//
// DELETE /api/reviews/:id
//
// Authentication required.
// Controller checks ownership/admin permissions.
// ============================================================

router.delete(
  "/:id",
  verifyToken,
  deleteReview
);

// ============================================================
// HELPFUL TOGGLE
//
// POST /api/reviews/:id/helpful
//
// Authentication required.
// ============================================================

router.post(
  "/:id/helpful",
  verifyToken,
  toggleHelpful
);

// ============================================================
// REPORT REVIEW
//
// POST /api/reviews/:id/report
//
// Authentication required.
// ============================================================

router.post(
  "/:id/report",
  verifyToken,
  reportReview
);

// ============================================================
// SELLER REPLY
//
// POST /api/reviews/:id/reply
//
// Authentication required.
// Controller verifies that logged-in user is the seller.
// ============================================================

router.post(
  "/:id/reply",
  verifyToken,
  replyToReview
);

// ============================================================
// DELETE SELLER REPLY
//
// DELETE /api/reviews/:id/reply
//
// Authentication required.
// ============================================================

router.delete(
  "/:id/reply",
  verifyToken,
  deleteReply
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;