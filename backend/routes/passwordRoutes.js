// backend/routes/passwordRoutes.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/email");

const router = express.Router();

// POST /api/password/forgot
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    // Always return success to avoid revealing if email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Build reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.status(200).json({
      success: true,
      message: "Password reset link sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/password/reset/:token
router.post("/reset/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Password and confirmation are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;