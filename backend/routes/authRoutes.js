// ============================================================
// backend/routes/authRoutes.js
// BuyUKUsed Authentication Routes
// ============================================================

"use strict";

const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

// ============================================================
// PUBLIC AUTH
// ============================================================

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

// ============================================================
// PASSWORD RESET
// ============================================================

// Request reset email
router.post(
  "/forgot-password",
  forgotPassword
);

// Check whether reset token is valid
router.get(
  "/verify-reset-token/:token",
  verifyResetToken
);

// Set new password
router.post(
  "/reset-password/:token",
  resetPassword
);

// ============================================================
// PROTECTED AUTH
// ============================================================

// Current user
router.get(
  "/me",
  protect,
  getMe
);

// Update profile
router.put(
  "/profile",
  protect,
  updateProfile
);

// Logout
router.post(
  "/logout",
  protect,
  logout
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;