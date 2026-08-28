// ============================================================
// backend/routes/reviewRoutes.js
// BuyUKUsed Review Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  getProductReviews,
  getSellerReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  checkUserReview,
} = require("../controllers/reviewController");

// ============================================================
// AUTHENTICATION
// ============================================================

const passport = require("passport");

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
//
// This assumes your Passport JWT strategy is already configured
// in:
// backend/config/passport.js
//
// Public GET routes remain accessible without login.
// POST/PUT/DELETE require authentication.
// ============================================================

const requireAuth = passport.authenticate(
  "jwt",
  {
    session: false,
  }
);

// ============================================================
// GET PRODUCT REVIEWS
// ============================================================
//
// GET /api/reviews?productId=...&page=1&limit=10
//
// PUBLIC
// ============================================================

router.get(
  "/",
  (req, res, next) => {
    // If sellerId is supplied without productId,
    // return seller reviews.

    if (
      req.query.sellerId &&
      !req.query.productId
    ) {
      return getSellerReviews(
        req,
        res,
        next
      );
    }

    return getProductReviews(
      req,
      res,
      next
    );
  }
);

// ============================================================
// EXPLICIT PRODUCT REVIEWS
// ============================================================

router.get(
  "/product",
  getProductReviews
);

// ============================================================
// EXPLICIT SELLER REVIEWS
// ============================================================

router.get(
  "/seller",
  getSellerReviews
);

// ============================================================
// CHECK USER REVIEW
// ============================================================
//
// GET /api/reviews/check?type=PRODUCT&productId=...
//
// AUTHENTICATED
// ============================================================

router.get(
  "/check",
  requireAuth,
  checkUserReview
);

// ============================================================
// GET SINGLE REVIEW
// ============================================================
//
// GET /api/reviews/:id
//
// PUBLIC
// ============================================================

router.get(
  "/:id",
  getReviewById
);

// ============================================================
// CREATE REVIEW
// ============================================================
//
// POST /api/reviews
//
// AUTHENTICATED
// ============================================================

router.post(
  "/",
  requireAuth,
  createReview
);

// ============================================================
// UPDATE REVIEW
// ============================================================
//
// PUT /api/reviews/:id
//
// AUTHENTICATED
// ============================================================

router.put(
  "/:id",
  requireAuth,
  updateReview
);

// ============================================================
// DELETE REVIEW
// ============================================================
//
// DELETE /api/reviews/:id
//
// AUTHENTICATED
// ============================================================

router.delete(
  "/:id",
  requireAuth,
  deleteReview
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;