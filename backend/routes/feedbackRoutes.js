// ============================================================
// backend/routes/feedbackRoutes.js
// ============================================================

"use strict";

const express = require("express");

const router =
  express.Router();

const feedbackController =
  require("../controllers/feedbackController");

// IMPORTANT:
// Change this import ONLY if your existing authentication
// middleware uses a different filename/export.
//
// Example expected:
// const { protect } = require("../middleware/auth");
//

const { protect } =
  require("../middleware/auth");

// ============================================================
// PUBLIC
// ============================================================

// Get seller feedback
router.get(
  "/seller/:sellerId",
  feedbackController.getSellerFeedback
);

// ============================================================
// AUTHENTICATED BUYER
// ============================================================

// Check whether current buyer can review seller
router.get(
  "/can-review/:sellerId",
  protect,
  feedbackController.canReviewSeller
);

// Leave seller feedback
router.post(
  "/seller/:sellerId",
  protect,
  feedbackController.createFeedback
);

// ============================================================
// SELLER
// ============================================================

// Seller responds to feedback
router.put(
  "/:feedbackId/respond",
  protect,
  feedbackController.respondToFeedback
);

// ============================================================

module.exports = router;