// ============================================================
// backend/routes/adminRoutes.js
// BuyUKUsed - Admin Routes
// ============================================================

const express = require("express");

const router = express.Router();

// ============================================================
// MIDDLEWARE
// ============================================================

const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

// ============================================================
// ADMIN CONTROLLER
// ============================================================

const {
  // Dashboard
  getDashboardStats,

  // Users
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  verifySeller,
  unverifySeller,
  deleteUser,

  // Products
  getProducts,
  deleteProduct,

  // Orders
  getOrders,
  updateOrderStatus,

  // Riders
  getRiders,
  getRiderById,
  approveRider,
  rejectRider,
  updateRiderStatus,
  updateRiderProfile,
} = require("../controllers/adminController");

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================
//
// Every route in this router requires:
//
// 1. Valid JWT authentication
// 2. User must have role === "admin"
//
// ============================================================

router.use(authenticate);
router.use(requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================

// GET /api/admin/stats

router.get(
  "/stats",
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

// GET /api/admin/users

router.get(
  "/users",
  getUsers
);

// GET /api/admin/users/:id

router.get(
  "/users/:id",
  getUserById
);

// PATCH /api/admin/users/:id/role

router.patch(
  "/users/:id/role",
  updateUserRole
);

// PATCH /api/admin/users/:id/status

router.patch(
  "/users/:id/status",
  updateUserStatus
);

// ============================================================
// SELLER VERIFICATION
// ============================================================
//
// Primary seller endpoints:
//
// PATCH /api/admin/sellers/:id/verify
// PATCH /api/admin/sellers/:id/unverify
//
// Compatibility endpoints:
//
// PATCH /api/admin/users/:id/verify-seller
// PATCH /api/admin/users/:id/unverify-seller
//
// ============================================================

// ------------------------------------------------------------
// NEW / PRIMARY SELLER VERIFY ENDPOINT
// ------------------------------------------------------------

// PATCH /api/admin/sellers/:id/verify

router.patch(
  "/sellers/:id/verify",
  verifySeller
);

// ------------------------------------------------------------
// NEW / PRIMARY SELLER UNVERIFY ENDPOINT
// ------------------------------------------------------------

// PATCH /api/admin/sellers/:id/unverify

router.patch(
  "/sellers/:id/unverify",
  unverifySeller
);

// ------------------------------------------------------------
// COMPATIBILITY ENDPOINT
// ------------------------------------------------------------

// PATCH /api/admin/users/:id/verify-seller

router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

// ------------------------------------------------------------
// COMPATIBILITY ENDPOINT
// ------------------------------------------------------------

// PATCH /api/admin/users/:id/unverify-seller

router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
);

// ------------------------------------------------------------
// OPTIONAL COMPATIBILITY
// ------------------------------------------------------------

// PATCH /api/admin/sellers/:id/verify-seller

router.patch(
  "/sellers/:id/verify-seller",
  verifySeller
);

// PATCH /api/admin/sellers/:id/unverify-seller

router.patch(
  "/sellers/:id/unverify-seller",
  unverifySeller
);

// ============================================================
// DELETE USER
// ============================================================

// DELETE /api/admin/users/:id

router.delete(
  "/users/:id",
  deleteUser
);

// ============================================================
// PRODUCTS
// ============================================================

// GET /api/admin/products

router.get(
  "/products",
  getProducts
);

// DELETE /api/admin/products/:id

router.delete(
  "/products/:id",
  deleteProduct
);

// ============================================================
// ORDERS
// ============================================================

// GET /api/admin/orders

router.get(
  "/orders",
  getOrders
);

// PATCH /api/admin/orders/:id/status

router.patch(
  "/orders/:id/status",
  updateOrderStatus
);

// ============================================================
// RIDERS
// ============================================================

// GET /api/admin/riders

router.get(
  "/riders",
  getRiders
);

// GET /api/admin/riders/:id

router.get(
  "/riders/:id",
  getRiderById
);

// PATCH /api/admin/riders/:id/approve

router.patch(
  "/riders/:id/approve",
  approveRider
);

// PATCH /api/admin/riders/:id/reject

router.patch(
  "/riders/:id/reject",
  rejectRider
);

// PATCH /api/admin/riders/:id/status

router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

// PATCH /api/admin/riders/:id/profile

router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// DEBUG / ROUTE CONFIRMATION
// ============================================================
//
// GET /api/admin/test
//
// Useful for confirming that the deployed admin router
// is actually loaded.
//
// ============================================================

router.get(
  "/test",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin routes are working",
      sellerVerificationEndpoint:
        "PATCH /api/admin/sellers/:id/verify",
    });
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;