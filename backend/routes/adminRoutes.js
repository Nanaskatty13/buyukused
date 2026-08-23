// ============================================================
// backend/routes/adminRoutes.js
// BuyUKUsed - Admin Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const {
  getDashboardStats,

  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,

  verifySeller,
  unverifySeller,

  deleteUser,

  getProducts,
  deleteProduct,

  getOrders,
  updateOrderStatus,

  getRiders,
  getRiderById,
  approveRider,
  rejectRider,
  updateRiderStatus,
  updateRiderProfile,
} = require("../controllers/adminController");

// ============================================================
// ALL ADMIN ROUTES
// ============================================================

router.use(authenticate);
router.use(requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================

router.get(
  "/stats",
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

router.get(
  "/users",
  getUsers
);

router.get(
  "/users/:id",
  getUserById
);

// ============================================================
// USER ROLE
// ============================================================

router.patch(
  "/users/:id/role",
  updateUserRole
);

// ============================================================
// USER STATUS
// ============================================================

router.patch(
  "/users/:id/status",
  updateUserStatus
);

// ============================================================
// SELLER VERIFICATION
// ============================================================

router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
);

// ============================================================
// DELETE USER
// ============================================================

router.delete(
  "/users/:id",
  deleteUser
);

// ============================================================
// PRODUCTS
// ============================================================

router.get(
  "/products",
  getProducts
);

router.delete(
  "/products/:id",
  deleteProduct
);

// ============================================================
// ORDERS
// ============================================================

router.get(
  "/orders",
  getOrders
);

router.patch(
  "/orders/:id/status",
  updateOrderStatus
);

// ============================================================
// RIDERS
// ============================================================

router.get(
  "/riders",
  getRiders
);

router.get(
  "/riders/:id",
  getRiderById
);

router.patch(
  "/riders/:id/approve",
  approveRider
);

router.patch(
  "/riders/:id/reject",
  rejectRider
);

router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;