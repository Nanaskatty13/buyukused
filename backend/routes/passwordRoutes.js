// backend/routes/passwordRoutes.js

const express = require("express");
const crypto = require("crypto");

const User = require("../models/User");

const {
  sendPasswordResetEmail,
} = require("../services/email");

const router = express.Router();

// ============================================================
// HELPERS
// ============================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ============================================================
// POST /api/password/forgot
// ============================================================

router.post("/forgot", async (req, res) => {
  try {
    // --------------------------------------------------------
    // GET EMAIL
    // --------------------------------------------------------

    const email = normalizeEmail(
      req.body?.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // --------------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user = await User.findOne({
      email,
    });

    // --------------------------------------------------------
    // DO NOT REVEAL WHETHER ACCOUNT EXISTS
    // --------------------------------------------------------

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a password reset link has been sent.",
      });
    }

    // --------------------------------------------------------
    // CHECK ACCOUNT STATUS
    // --------------------------------------------------------

    if (user.isActive === false) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a password reset link has been sent.",
      });
    }

    // --------------------------------------------------------
    // SOCIAL LOGIN ACCOUNT
    // --------------------------------------------------------

    if (
      user.provider &&
      user.provider !== "local"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a password reset link has been sent.",
      });
    }

    // --------------------------------------------------------
    // CHECK FRONTEND URL BEFORE CREATING TOKEN
    // --------------------------------------------------------

    const frontendUrl = String(
      process.env.FRONTEND_URL || ""
    )
      .trim()
      .replace(/\/+$/, "");

    if (!frontendUrl) {
      console.error(
        "❌ FRONTEND_URL is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Password reset service is not configured.",
      });
    }

    // --------------------------------------------------------
    // CHECK RESEND CONFIGURATION
    // --------------------------------------------------------

    if (
      !process.env.RESEND_API_KEY ||
      !String(
        process.env.RESEND_API_KEY
      ).trim()
    ) {
      console.error(
        "❌ RESEND_API_KEY is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Password reset email service is not configured.",
      });
    }

    // --------------------------------------------------------
    // GENERATE SECURE RESET TOKEN
    // --------------------------------------------------------

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    // --------------------------------------------------------
    // HASH TOKEN BEFORE DATABASE STORAGE
    // --------------------------------------------------------

    const hashedToken =
      hashResetToken(resetToken);

    // --------------------------------------------------------
    // TOKEN EXPIRATION
    // 1 HOUR
    // --------------------------------------------------------

    const resetPasswordExpires =
      new Date(
        Date.now() +
          60 * 60 * 1000
      );

    // --------------------------------------------------------
    // SAVE RESET TOKEN
    // --------------------------------------------------------

    user.resetPasswordToken =
      hashedToken;

    user.resetPasswordExpires =
      resetPasswordExpires;

    await user.save();

    console.log(
      `🔐 Password reset token created for ${user.email}`
    );

    // --------------------------------------------------------
    // CREATE RESET URL
    // --------------------------------------------------------

    const resetUrl =
      `${frontendUrl}/reset-password/${encodeURIComponent(
        resetToken
      )}`;

    console.log(
      "🔗 Password reset URL created successfully."
    );

    // Do NOT log the actual token or reset URL
    // in production because the URL contains the
    // secret reset token.

    // --------------------------------------------------------
    // SEND EMAIL
    // --------------------------------------------------------

    try {
      await sendPasswordResetEmail(
        user.email,
        resetUrl,
        user.name
      );

      console.log(
        `📧 Password reset email sent to ${user.email}`
      );
    } catch (emailError) {
      console.error(
        "❌ Password reset email failed."
      );

      console.error(
        "Message:",
        emailError?.message ||
          emailError
      );

      console.error(
        "Code:",
        emailError?.code ||
          "N/A"
      );

      console.error(
        "Resend data:",
        emailError?.data ||
          "N/A"
      );

      // ------------------------------------------------------
      // REMOVE TOKEN IF EMAIL FAILED
      // ------------------------------------------------------

      try {
        user.resetPasswordToken =
          undefined;

        user.resetPasswordExpires =
          undefined;

        await user.save();
      } catch (cleanupError) {
        console.error(
          "❌ Failed to remove reset token:",
          cleanupError
        );
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password reset email. Please try again later.",
      });
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "If that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "❌ Forgot password error:"
    );

    console.error(
      "Message:",
      error?.message ||
        error
    );

    console.error(
      "Stack:",
      error?.stack ||
        "N/A"
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error. Please try again later.",
    });
  }
});

// ============================================================
// POST /api/password/reset/:token
// ============================================================

router.post(
  "/reset/:token",
  async (req, res) => {
    try {
      // ------------------------------------------------------
      // GET TOKEN
      // ------------------------------------------------------

      const token = String(
        req.params?.token || ""
      ).trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token is required.",
        });
      }

      // ------------------------------------------------------
      // GET PASSWORD
      // ------------------------------------------------------

      const password = String(
        req.body?.password || ""
      );

      const confirmPassword = String(
        req.body?.confirmPassword || ""
      );

      // ------------------------------------------------------
      // VALIDATE PASSWORD
      // ------------------------------------------------------

      if (
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password and confirmation are required.",
        });
      }

      // ------------------------------------------------------
      // PASSWORD LENGTH
      // ------------------------------------------------------

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      // ------------------------------------------------------
      // PASSWORD MATCH
      // ------------------------------------------------------

      if (
        password !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passwords do not match.",
        });
      }

      // ------------------------------------------------------
      // HASH TOKEN
      // ------------------------------------------------------

      const hashedToken =
        hashResetToken(token);

      // ------------------------------------------------------
      // FIND USER
      //
      // User.js has:
      //
      // resetPasswordToken: select: false
      // resetPasswordExpires: select: false
      //
      // Therefore explicitly select both fields.
      // ------------------------------------------------------

      const user =
        await User.findOne({
          resetPasswordToken:
            hashedToken,

          resetPasswordExpires: {
            $gt: new Date(),
          },
        }).select(
          "+resetPasswordToken +resetPasswordExpires"
        );

      // ------------------------------------------------------
      // INVALID / EXPIRED TOKEN
      // ------------------------------------------------------

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      // ------------------------------------------------------
      // CHECK ACCOUNT STATUS
      // ------------------------------------------------------

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account has been deactivated.",
        });
      }

      // ------------------------------------------------------
      // UPDATE PASSWORD
      //
      // IMPORTANT:
      //
      // User.js has a pre-save hook that automatically
      // bcrypt-hashes the password.
      //
      // Therefore DO NOT manually hash the password here.
      // ------------------------------------------------------

      user.password =
        password;

      // ------------------------------------------------------
      // INVALIDATE RESET TOKEN
      // ------------------------------------------------------

      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpires =
        undefined;

      // ------------------------------------------------------
      // SAVE USER
      // ------------------------------------------------------

      await user.save();

      console.log(
        `✅ Password successfully reset for ${user.email}`
      );

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Reset password error:"
      );

      console.error(
        "Message:",
        error?.message ||
          error
      );

      console.error(
        "Stack:",
        error?.stack ||
          "N/A"
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password. Please try again later.",
      });
    }
  }
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;