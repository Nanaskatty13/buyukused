// backend/routes/admin.js
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getProducts,
  deleteProduct,
  getOrders,
  updateOrderStatus
} = require("../controllers/adminController");

// ✅ Import from auth.js
const { verifyToken, isAdmin } = require("../middleware/auth");

// ==========================
// Admin Authentication
// ==========================
router.use(verifyToken);
router.use(isAdmin);

// ==========================
// Dashboard
// ==========================
router.get("/dashboard", getDashboardStats);

// ==========================
// Users Management
// ==========================
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// ==========================
// Products Management
// ==========================
router.get("/products", getProducts);
router.delete("/products/:id", deleteProduct);

// ==========================
// Orders Management
// ==========================
router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;