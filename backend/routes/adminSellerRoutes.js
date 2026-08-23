// ============================================================
// backend/routes/adminSellerRoutes.js
// BuyUKUsed Admin Seller Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  param,
  body,
  validationResult,
} = require("express-validator");

const {
  verifySeller,
  rejectSeller,
} = require("../controllers/sellerController");

const {
  verifyToken,
} = require("../middleware/auth");

// ============================================================
// VALIDATION
// ============================================================

const validate = (
  req,
  res,
  next
) => {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,

      message:
        "Validation failed",

      errors:
        errors.array().map(
          (err) => ({
            field: err.path,
            message:
              err.msg,
          })
        ),
    });
  }

  next();
};

// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

const isAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !==
    "admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Admin access required.",
    });
  }

  next();
};

// ============================================================
// VERIFY SELLER
// ============================================================

router.post(
  "/:sellerId/verify",

  verifyToken,

  isAdmin,

  [
    param("sellerId")
      .isMongoId()
      .withMessage(
        "Invalid seller ID"
      ),
  ],

  validate,

  verifySeller
);

// ============================================================
// REJECT SELLER
// ============================================================

router.post(
  "/:sellerId/reject",

  verifyToken,

  isAdmin,

  [
    param("sellerId")
      .isMongoId()
      .withMessage(
        "Invalid seller ID"
      ),

    body("reason")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 500,
      })
      .withMessage(
        "Rejection reason must be 500 characters or less"
      ),
  ],

  validate,

  rejectSeller
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;