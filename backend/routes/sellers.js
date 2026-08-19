// backend/routes/sellers.js

const express = require("express");

const router =
  express.Router();

const {
  body,
  query,
  param,
  validationResult,
} = require("express-validator");

// ============================================================
// CONTROLLERS
// ============================================================

const {
  registerSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerDashboard,
  getMyProducts,
  getSellerOrders,
  getSellerEarnings,
  getPublicSellerProfile,
  getPublicSellerProducts,
} = require("../controllers/sellerController");

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

const {
  verifyToken,
  isSeller,
} = require("../middleware/auth");

// ============================================================
// VALIDATION HELPER
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
            message: err.msg,
          })
        ),
    });
  }

  next();
};

// ============================================================
// 1. REGISTER SELLER
// ============================================================

router.post(
  "/register",
  verifyToken,
  [
    body("termsAccepted")
      .isBoolean()
      .withMessage(
        "Terms must be accepted"
      )
      .custom(
        (value) =>
          value === true
      )
      .withMessage(
        "You must accept the terms and conditions"
      ),

    body("shopName")
      .optional()
      .isString()
      .trim()
      .isLength({
        min: 2,
        max: 100,
      })
      .withMessage(
        "Shop name must be between 2 and 100 characters"
      ),

    body("businessType")
      .optional()
      .isString()
      .trim()
      .isIn([
        "individual",
        "business",
        "organization",
      ])
      .withMessage(
        "Invalid business type"
      ),

    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 500,
      })
      .withMessage(
        "Description must be less than 500 characters"
      ),

    body("taxId")
      .optional()
      .isString()
      .trim()
      .isLength({
        min: 5,
        max: 50,
      })
      .withMessage(
        "Tax ID must be between 5 and 50 characters"
      ),
  ],
  validate,
  registerSeller
);

// ============================================================
// 2. PRIVATE SELLER PROFILE
// ============================================================

router.get(
  "/profile",
  verifyToken,
  isSeller,
  getSellerProfile
);

router.put(
  "/profile",
  verifyToken,
  isSeller,
  [
    body("shopName")
      .optional()
      .isString()
      .trim()
      .isLength({
        min: 2,
        max: 100,
      })
      .withMessage(
        "Shop name must be between 2 and 100 characters"
      ),

    body("businessType")
      .optional()
      .isString()
      .trim()
      .isIn([
        "individual",
        "business",
        "organization",
      ])
      .withMessage(
        "Invalid business type"
      ),

    body("shopDescription")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 500,
      })
      .withMessage(
        "Description must be less than 500 characters"
      ),

    body("phone")
      .optional()
      .isString()
      .trim()
      .matches(
        /^[0-9+\-\s()]{8,20}$/
      )
      .withMessage(
        "Please provide a valid phone number"
      ),

    body("location")
      .optional()
      .isString()
      .trim()
      .isLength({
        min: 2,
        max: 100,
      })
      .withMessage(
        "Location must be between 2 and 100 characters"
      ),

    body("avatar")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 2000,
      })
      .withMessage(
        "Invalid avatar"
      ),

    body("profileImage")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 2000,
      })
      .withMessage(
        "Invalid profile image"
      ),

    body("photo")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 2000,
      })
      .withMessage(
        "Invalid photo"
      ),
  ],
  validate,
  updateSellerProfile
);

// ============================================================
// 3. DASHBOARD
// ============================================================

router.get(
  "/dashboard",
  verifyToken,
  isSeller,
  [
    query("period")
      .optional()
      .isString()
      .trim()
      .isIn([
        "today",
        "week",
        "month",
        "year",
        "all",
      ])
      .withMessage(
        "Invalid period"
      ),
  ],
  validate,
  getSellerDashboard
);

// ============================================================
// 4. EARNINGS
// ============================================================

router.get(
  "/earnings",
  verifyToken,
  isSeller,
  [
    query("period")
      .optional()
      .isString()
      .trim()
      .isIn([
        "week",
        "month",
        "year",
        "all",
      ])
      .withMessage(
        "Invalid period"
      ),
  ],
  validate,
  getSellerEarnings
);

// ============================================================
// 5. SELLER PRODUCTS
// ============================================================

router.get(
  "/products",
  verifyToken,
  isSeller,
  [
    query("page")
      .optional()
      .isInt({
        min: 1,
      })
      .withMessage(
        "Page must be a positive integer"
      )
      .toInt(),

    query("limit")
      .optional()
      .isInt({
        min: 1,
        max: 50,
      })
      .withMessage(
        "Limit must be between 1 and 50"
      )
      .toInt(),

    query("sort")
      .optional()
      .isString()
      .trim()
      .matches(
        /^-?[a-zA-Z0-9]+$/
      )
      .withMessage(
        "Invalid sort field"
      ),

    query("status")
      .optional()
      .isString()
      .trim()
      .isIn([
        "active",
        "pending",
        "sold",
        "inactive",
      ])
      .withMessage(
        "Invalid status"
      ),
  ],
  validate,
  getMyProducts
);

// ============================================================
// 6. SELLER ORDERS
// ============================================================

router.get(
  "/orders",
  verifyToken,
  isSeller,
  [
    query("page")
      .optional()
      .isInt({
        min: 1,
      })
      .withMessage(
        "Page must be a positive integer"
      )
      .toInt(),

    query("limit")
      .optional()
      .isInt({
        min: 1,
        max: 50,
      })
      .withMessage(
        "Limit must be between 1 and 50"
      )
      .toInt(),

    query("status")
      .optional()
      .isString()
      .trim()
      .isIn([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .withMessage(
        "Invalid order status"
      ),
  ],
  validate,
  getSellerOrders
);

// ============================================================
// 7. PUBLIC SELLER PRODUCTS
// IMPORTANT:
// This MUST appear before /:sellerId
// ============================================================

router.get(
  "/:sellerId/products",
  [
    param("sellerId")
      .isMongoId()
      .withMessage(
        "Invalid seller ID"
      ),

    query("page")
      .optional()
      .isInt({
        min: 1,
      })
      .withMessage(
        "Page must be a positive integer"
      )
      .toInt(),

    query("limit")
      .optional()
      .isInt({
        min: 1,
        max: 50,
      })
      .withMessage(
        "Limit must be between 1 and 50"
      )
      .toInt(),

    query("sort")
      .optional()
      .isString()
      .trim()
      .matches(
        /^-?[a-zA-Z0-9]+$/
      )
      .withMessage(
        "Invalid sort field"
      ),
  ],
  validate,
  getPublicSellerProducts
);

// ============================================================
// 8. PUBLIC SELLER PROFILE
// ============================================================

router.get(
  "/:sellerId",
  [
    param("sellerId")
      .isMongoId()
      .withMessage(
        "Invalid seller ID"
      ),
  ],
  validate,
  getPublicSellerProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;