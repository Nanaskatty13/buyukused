// ============================================================
// backend/routes/sellers.js
// BuyUKUsed Seller Routes
// ============================================================

const express = require("express");

const router = express.Router();

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
  getSellerAnalytics,
  getSellerEarnings,

  getMyProducts,

  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,

  getPublicSellerProfile,
  getPublicSellerProducts,

  verifySeller,
  rejectSeller,
} = require("../controllers/sellerController");

// ============================================================
// AUTH
// ============================================================

const {
  verifyToken,
  isSeller,
} = require("../middleware/auth");

// ============================================================
// VALIDATION HELPER
// ============================================================

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// ============================================================
// ADMIN MIDDLEWARE
// ============================================================

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
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
        (value) => value === true
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

    body("phone")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 30,
      })
      .withMessage(
        "Invalid phone number"
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
      .isLength({
        max: 30,
      })
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
      }),

    body("profileImage")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 2000,
      }),

    body("photo")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 2000,
      }),

    body("photoURL")
      .optional()
      .isString()
      .trim()
      .isLength({
        max: 2000,
      }),
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
// 4. ANALYTICS
// ============================================================

router.get(
  "/analytics",

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

  getSellerAnalytics
);

// ============================================================
// 5. EARNINGS
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
// 6. SELLER PRODUCTS
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
// 7. SELLER ORDERS
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

  getSellerOrders
);

// ============================================================
// 8. SINGLE SELLER ORDER
// ============================================================

router.get(
  "/orders/:orderId",

  verifyToken,

  isSeller,

  [
    param("orderId")
      .isMongoId()
      .withMessage(
        "Invalid order ID"
      ),
  ],

  validate,

  getSellerOrderById
);

// ============================================================
// 9. UPDATE SELLER ORDER STATUS
// ============================================================

router.put(
  "/orders/:orderId/status",

  verifyToken,

  isSeller,

  [
    param("orderId")
      .isMongoId()
      .withMessage(
        "Invalid order ID"
      ),

    body("status")
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

  updateSellerOrderStatus
);

// ============================================================
// 10. ADMIN VERIFY SELLER
// ============================================================
//
// POST /api/admin/sellers/:sellerId/verify
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
// 11. ADMIN REJECT SELLER
// ============================================================
//
// POST /api/admin/sellers/:sellerId/reject
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
// IMPORTANT:
// PUBLIC ROUTES MUST COME AFTER SPECIFIC ROUTES
// ============================================================

// ============================================================
// 12. PUBLIC SELLER PRODUCTS
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
// 13. PUBLIC SELLER PROFILE
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