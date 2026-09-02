// ============================================================
// backend/routes/admin.js
// BuyUKUsed Admin Routes
// ============================================================

const express = require("express");
const router = express.Router();

// ============================================================
// CONTROLLERS
// ============================================================

const {
  // Dashboard
  getDashboardStats,

  // Users
  getUsers,
  getUserById,
  updateUserRole,
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

  // Sellers
  getUnverifiedSellers,
  verifySeller,
  // ❌ revokeVerification removed – not exported
} = require("../controllers/adminController");

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth");

// ============================================================
// GLOBAL ADMIN PROTECTION
// ============================================================

router.use(verifyToken);
router.use(isAdmin);

// ============================================================
// DASHBOARD
// ============================================================

router.get("/dashboard", getDashboardStats);

// ============================================================
// USERS
// ============================================================

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// ============================================================
// PRODUCTS
// ============================================================

router.get("/products", getProducts);
router.delete("/products/:id", deleteProduct);

// ============================================================
// ORDERS
// ============================================================

router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);

// ============================================================
// RIDERS
// ============================================================

router.get("/riders", getRiders);
router.get("/riders/:id", getRiderById);
router.put("/riders/:id/approve", approveRider);
router.put("/riders/:id/reject", rejectRider);
router.put("/riders/:id/status", updateRiderStatus);
router.put("/riders/:id/profile", updateRiderProfile);

// ============================================================
// SELLER VERIFICATION
// ============================================================

router.get("/sellers/unverified", getUnverifiedSellers);
router.put("/sellers/:id/verify", verifySeller);
router.post("/sellers/:id/verify", verifySeller);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;