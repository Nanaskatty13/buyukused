
// backend/routes/auth.js

const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
} = require("../controllers/authController");

const {
  verifyToken,
} = require("../middleware/auth");

// ============================================================
// REGISTER
// POST /auth/register
// ============================================================

router.post("/register", register);

// ============================================================
// LOGIN
// POST /auth/login
// ============================================================

router.post("/login", login);

// ============================================================
// GET CURRENT USER
// GET /auth/me
// ============================================================

router.get("/me", verifyToken, getMe);

// ============================================================
// UPDATE PROFILE
// PUT /auth/profile
// ============================================================

router.put("/profile", verifyToken, updateProfile);

// ============================================================
// LOGOUT
// POST /auth/logout
// ============================================================

router.post("/logout", verifyToken, logout);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;