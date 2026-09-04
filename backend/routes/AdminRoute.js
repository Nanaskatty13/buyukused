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

  // Users
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,

  // Seller verification
  getUnverifiedSellers,
  verifySeller,
  unverifySeller,

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
// ALL ADMIN ROUTES
// ============================================================

// Every route below requires authentication.
router.use(authenticate);

// Every route below requires an admin account.
router.use(requireAdmin);

// ============================================================
// DASHBOARD
// ============================================================

router.get("/stats", getDashboardStats);

// ============================================================
// USERS
// ============================================================

// Get all users
router.get("/users", getUsers);

// Get user by ID
router.get("/users/:id", getUserById);

// ============================================================
// USER ROLE
// ============================================================

// Update user role
router.patch("/users/:id/role", updateUserRole);

// ============================================================
// USER STATUS
// ============================================================

// Activate/deactivate user
router.patch("/users/:id/status", updateUserStatus);

// ============================================================
// SELLER VERIFICATION
// ============================================================

// Get sellers who have not yet been verified
router.get(
  "/users/unverified-sellers",
  getUnverifiedSellers
);

// Verify seller
router.patch(
  "/users/:id/verify-seller",
  verifySeller
);

// Remove seller verification
router.patch(
  "/users/:id/unverify-seller",
  unverifySeller
);

// ============================================================
// DELETE USER
// ============================================================

router.delete("/users/:id", deleteUser);

// ============================================================
// PRODUCTS
// ============================================================

// Get all products
router.get("/products", getProducts);

// Delete product
router.delete("/products/:id", deleteProduct);

// ============================================================
// ORDERS
// ============================================================

// Get all orders
router.get("/orders", getOrders);

// Update order status
router.patch(
  "/orders/:id/status",
  updateOrderStatus
);

// ============================================================
// RIDERS
// ============================================================

// Get all riders
router.get("/riders", getRiders);

// Get rider by ID
router.get("/riders/:id", getRiderById);

// Approve rider
router.patch(
  "/riders/:id/approve",
  approveRider
);

// Reject rider
router.patch(
  "/riders/:id/reject",
  rejectRider
);

// Activate/deactivate rider
router.patch(
  "/riders/:id/status",
  updateRiderStatus
);

// Update rider profile
router.patch(
  "/riders/:id/profile",
  updateRiderProfile
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;