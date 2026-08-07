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

const { verifyToken, isAdmin } = require("../middleware/auth");


// ==========================
// ADMIN PROTECTION
// ==========================
router.use(verifyToken);
router.use(isAdmin);


// ==========================
// Dashboard
// ==========================
router.get(
    "/dashboard",
    getDashboardStats
);


// ==========================
// Users
// ==========================
router.get(
    "/users",
    getUsers
);


router.get(
    "/users/:id",
    getUserById
);


router.put(
    "/users/:id/role",
    updateUserRole
);


router.delete(
    "/users/:id",
    deleteUser
);


// ==========================
// Products
// ==========================
router.get(
    "/products",
    getProducts
);


router.delete(
    "/products/:id",
    deleteProduct
);


// ==========================
// Orders
// ==========================
router.get(
    "/orders",
    getOrders
);


router.put(
    "/orders/:id/status",
    updateOrderStatus
);


module.exports = router;