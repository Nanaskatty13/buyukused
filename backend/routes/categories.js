// backend/routes/categories.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// ─── Inline authentication middleware ────────────────────────
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
};

// ─── Public routes ────────────────────────────────────────────
router.get("/", getCategories);
router.get("/:id", getCategory);

// ─── Admin‑only routes ────────────────────────────────────────
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;