// ============================================================
// backend/routes/passwordRoutes.js
// BuyUKUsed - Password Reset Routes
// ============================================================

const express = require("express");
const crypto = require("crypto");

const User = require("../models/User");

const {
  sendPasswordResetEmail,
} = require("../services/email");

const router = express.Router();

// ============================================================
// CONSTANTS
// ============================================================

const RESET_TOKEN_EXPIRATION_MS =
  60 * 60 * 1000; // 1 hour

const GENERIC_RESET_MESSAGE =
  "If that email exists, a password reset link has been sent.";

// ============================================================
// HELPERS
// ============================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

// ============================================================
// HASH RESET TOKEN
// ============================================================

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ============================================================
// EMAIL VALIDATION
// ============================================================

const isValidEmail = (email) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

// ============================================================
// REMOVE RESET TOKEN
// ============================================================

const clearResetToken = async (user) => {
  try {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    console.log(
      "🧹 Password reset token cleaned up."
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Failed to clean up password reset token:"
    );

    console.error(
      "Message:",
      error?.message || error
    );

    console.error(
      "Stack:",
      error?.stack || "N/A"
    );

    return false;
  }
};

// ============================================================
// POST /api/password/forgot
// ============================================================

router.post(
  "/forgot",
  async (req, res) => {
    try {
      console.log(
        "============================================================"
      );

      console.log(
        "🔐 PASSWORD RESET REQUEST"
      );

      console.log(
        "============================================================"
      );

      // ------------------------------------------------------
      // GET EMAIL
      // ------------------------------------------------------

      const email = normalizeEmail(
        req.body?.email
      );

      console.log(
        "📧 Password reset requested for:",
        email || "(empty)"
      );

      // ------------------------------------------------------
      // VALIDATE EMAIL
      // ------------------------------------------------------

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid email address.",
        });
      }

      // ------------------------------------------------------
      // FIND USER
      // ------------------------------------------------------

      const user =
        await User.findOne({
          email,
        });

      // ------------------------------------------------------
      // DO NOT REVEAL ACCOUNT EXISTENCE
      // ------------------------------------------------------

      if (!user) {
        console.log(
          "ℹ️ No account found for requested email."
        );

        return res.status(200).json({
          success: true,
          message:
            GENERIC_RESET_MESSAGE,
        });
      }

      console.log(
        "✅ User account found:",
        user.email
      );

      // ------------------------------------------------------
      // CHECK ACCOUNT STATUS
      // ------------------------------------------------------

      if (user.isActive === false) {
        console.log(
          "ℹ️ Account is inactive."
        );

        return res.status(200).json({
          success: true,
          message:
            GENERIC_RESET_MESSAGE,
        });
      }

      // ------------------------------------------------------
      // SOCIAL LOGIN ACCOUNT
      // ------------------------------------------------------

      if (
        user.provider &&
        user.provider !== "local"
      ) {
        console.log(
          "ℹ️ User uses social authentication:",
          user.provider
        );

        return res.status(200).json({
          success: true,
          message:
            GENERIC_RESET_MESSAGE,
        });
      }

      // ------------------------------------------------------
      // FRONTEND URL
      // ------------------------------------------------------

      const frontendUrl =
        String(
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

      console.log(
        "🌐 Password reset frontend:",
        frontendUrl
      );

      // ------------------------------------------------------
      // RESEND API KEY
      // ------------------------------------------------------

      const resendApiKey =
        String(
          process.env.RESEND_API_KEY || ""
        ).trim();

      if (!resendApiKey) {
        console.error(
          "❌ RESEND_API_KEY is not configured."
        );

        return res.status(500).json({
          success: false,
          message:
            "Password reset email service is not configured.",
        });
      }

      console.log(
        "✅ RESEND_API_KEY is configured."
      );

      // ------------------------------------------------------
      // GENERATE RESET TOKEN
      // ------------------------------------------------------

      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      // ------------------------------------------------------
      // HASH TOKEN
      // ------------------------------------------------------

      const hashedToken =
        hashResetToken(
          resetToken
        );

      // ------------------------------------------------------
      // EXPIRATION
      // ------------------------------------------------------

      const resetPasswordExpires =
        new Date(
          Date.now() +
            RESET_TOKEN_EXPIRATION_MS
        );

      // ------------------------------------------------------
      // SAVE TOKEN
      // ------------------------------------------------------

      user.resetPasswordToken =
        hashedToken;

      user.resetPasswordExpires =
        resetPasswordExpires;

      await user.save();

      console.log(
        "🔐 Password reset token created."
      );

      console.log(
        "⏰ Token expires:",
        resetPasswordExpires.toISOString()
      );

      // ------------------------------------------------------
      // CREATE RESET URL
      // ------------------------------------------------------

      const resetUrl =
        `${frontendUrl}/reset-password/${encodeURIComponent(
          resetToken
        )}`;

      console.log(
        "🔗 Password reset URL created."
      );

      // IMPORTANT:
      // Never log resetUrl because it contains
      // the secret reset token.

      // ------------------------------------------------------
      // SEND EMAIL
      // ------------------------------------------------------

      try {
        console.log(
          "============================================================"
        );

        console.log(
          "📨 SENDING PASSWORD RESET EMAIL"
        );

        console.log(
          "============================================================"
        );

        console.log(
          "📬 Recipient:",
          user.email
        );

        console.log(
          "👤 Name:",
          user.name || "there"
        );

        console.log(
          "📤 Email service:",
          "Resend"
        );

        console.log(
          "============================================================"
        );

        await sendPasswordResetEmail(
          user.email,
          resetUrl,
          user.name
        );

        console.log(
          "============================================================"
        );

        console.log(
          "✅ PASSWORD RESET EMAIL SENT"
        );

        console.log(
          "📬 Recipient:",
          user.email
        );

        console.log(
          "============================================================"
        );
      } catch (emailError) {
        // ====================================================
        // VERY DETAILED RESEND ERROR LOGGING
        // ====================================================

        console.error(
          "============================================================"
        );

        console.error(
          "❌ PASSWORD RESET EMAIL FAILED"
        );

        console.error(
          "============================================================"
        );

        console.error(
          "Message:",
          emailError?.message ||
            "No error message"
        );

        console.error(
          "Code:",
          emailError?.code ||
            "No error code"
        );

        console.error(
          "Name:",
          emailError?.name ||
            "No error name"
        );

        console.error(
          "Status:",
          emailError?.statusCode ??
            emailError?.status ??
            "No status"
        );

        console.error(
          "Type:",
          emailError?.type ||
            "No type"
        );

        console.error(
          "Response:",
          emailError?.response ||
            "No response"
        );

        console.error(
          "Data:",
          emailError?.data ||
            "No data"
        );

        // ----------------------------------------------------
        // FULL ERROR OBJECT
        // ----------------------------------------------------

        try {
          console.error(
            "Full error:",
            JSON.stringify(
              emailError,
              Object.getOwnPropertyNames(
                emailError
              ),
              2
            )
          );
        } catch (
          stringifyError
        ) {
          console.error(
            "Unable to stringify full error:",
            stringifyError?.message
          );
        }

        console.error(
          "Stack:",
          emailError?.stack ||
            "No stack"
        );

        console.error(
          "============================================================"
        );

        // ----------------------------------------------------
        // CLEAN TOKEN
        // ----------------------------------------------------

        await clearResetToken(
          user
        );

        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(500).json({
          success: false,
          message:
            "Unable to send password reset email. Please try again later.",
        });
      }

      // ------------------------------------------------------
      // SUCCESS RESPONSE
      // ------------------------------------------------------

      console.log(
        "🎉 Password reset request completed successfully."
      );

      console.log(
        "============================================================"
      );

      return res.status(200).json({
        success: true,
        message:
          GENERIC_RESET_MESSAGE,
      });
    } catch (error) {
      // ======================================================
      // GENERAL ERROR
      // ======================================================

      console.error(
        "============================================================"
      );

      console.error(
        "❌ FORGOT PASSWORD ROUTE ERROR"
      );

      console.error(
        "============================================================"
      );

      console.error(
        "Message:",
        error?.message ||
          error
      );

      console.error(
        "Name:",
        error?.name ||
          "N/A"
      );

      console.error(
        "Code:",
        error?.code ||
          "N/A"
      );

      console.error(
        "Stack:",
        error?.stack ||
          "N/A"
      );

      console.error(
        "============================================================"
      );

      return res.status(500).json({
        success: false,
        message:
          "Internal server error. Please try again later.",
      });
    }
  }
);

// ============================================================
// POST /api/password/reset/:token
// ============================================================

router.post(
  "/reset/:token",
  async (req, res) => {
    try {
      console.log(
        "============================================================"
      );

      console.log(
        "🔐 PASSWORD RESET SUBMISSION"
      );

      console.log(
        "============================================================"
      );

      // ------------------------------------------------------
      // TOKEN
      // ------------------------------------------------------

      const token =
        String(
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
      // PASSWORD
      // ------------------------------------------------------

      const password =
        String(
          req.body?.password || ""
        );

      const confirmPassword =
        String(
          req.body?.confirmPassword ||
            ""
        );

      // ------------------------------------------------------
      // REQUIRED
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
      // INVALID / EXPIRED
      // ------------------------------------------------------

      if (!user) {
        console.log(
          "❌ Invalid or expired password reset token."
        );

        return res.status(400).json({
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      // ------------------------------------------------------
      // ACCOUNT STATUS
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
      // User.js should hash this automatically
      // through its pre-save hook.
      // ------------------------------------------------------

      user.password =
        password;

      // ------------------------------------------------------
      // INVALIDATE TOKEN
      // ------------------------------------------------------

      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpires =
        undefined;

      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      await user.save();

      console.log(
        "✅ Password successfully reset for:",
        user.email
      );

      console.log(
        "============================================================"
      );

      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "============================================================"
      );

      console.error(
        "❌ RESET PASSWORD ROUTE ERROR"
      );

      console.error(
        "============================================================"
      );

      console.error(
        "Message:",
        error?.message ||
          error
      );

      console.error(
        "Name:",
        error?.name ||
          "N/A"
      );

      console.error(
        "Code:",
        error?.code ||
          "N/A"
      );

      console.error(
        "Stack:",
        error?.stack ||
          "N/A"
      );

      console.error(
        "============================================================"
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
// EXPORT
// ============================================================

module.exports = router;