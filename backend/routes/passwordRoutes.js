// backend/routes/passwordRoutes.js

const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const {
  sendPasswordResetEmail,
} = require("../services/email");

const router = express.Router();

// ======================================================
// POST /api/password/forgot
// ======================================================

router.post("/forgot", async (req, res) => {
  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // --------------------------------------------------
    // Find user
    // --------------------------------------------------

    const user = await User.findOne({
      email,
    });

    // Always return success if user doesn't exist.
    // This prevents account/email enumeration.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a reset link has been sent.",
      });
    }

    // --------------------------------------------------
    // Generate secure reset token
    // --------------------------------------------------

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    const hashedToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // --------------------------------------------------
    // Save hashed token
    // --------------------------------------------------

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpires =
      Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // --------------------------------------------------
    // Frontend reset URL
    // --------------------------------------------------

    const frontendUrl =
      process.env.FRONTEND_URL;

    if (!frontendUrl) {
      console.error(
        "❌ FRONTEND_URL is not configured."
      );

      // Remove reset token because email cannot be sent.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Password reset service is not configured.",
      });
    }

    const resetUrl =
      `${frontendUrl.replace(/\/+$/, "")}` +
      `/reset-password/${resetToken}`;

    // --------------------------------------------------
    // Send reset email
    // --------------------------------------------------

    try {
      await sendPasswordResetEmail(
        user.email,
        resetUrl,
        user.name
      );
    } catch (emailError) {
      console.error(
        "❌ Password reset email failed:",
        emailError
      );

      // Do not leave a usable reset token behind
      // when the email could not be delivered.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password reset email. Please try again later.",
      });
    }

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Password reset link sent.",
    });
  } catch (error) {
    console.error(
      "❌ Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ======================================================
// POST /api/password/reset/:token
// ======================================================

router.post(
  "/reset/:token",
  async (req, res) => {
    try {
      const { token } =
        req.params;

      const password =
        String(
          req.body?.password || ""
        );

      const confirmPassword =
        String(
          req.body?.confirmPassword || ""
        );

      // ------------------------------------------------
      // Validate password
      // ------------------------------------------------

      if (
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password and confirmation are required",
        });
      }

      if (
        password !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passwords do not match",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token is required",
        });
      }

      // ------------------------------------------------
      // Hash token for database lookup
      // ------------------------------------------------

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      // ------------------------------------------------
      // Find valid, non-expired token
      // ------------------------------------------------

      const user =
        await User.findOne({
          resetPasswordToken:
            hashedToken,

          resetPasswordExpires: {
            $gt: Date.now(),
          },
        });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired token",
        });
      }

      // ------------------------------------------------
      // Update password
      // ------------------------------------------------

      user.password =
        await bcrypt.hash(
          password,
          10
        );

      // ------------------------------------------------
      // Invalidate reset token
      // ------------------------------------------------

      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpires =
        undefined;

      await user.save();

      // ------------------------------------------------
      // Success
      // ------------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully",
      });
    } catch (error) {
      console.error(
        "❌ Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Internal server error",
      });
    }
  }
);

module.exports = router;