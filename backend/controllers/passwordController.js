// backend/controllers/passwordController.js

const crypto = require("crypto");

const User = require("../models/User");

const {
  sendPasswordResetEmail,
} = require("../services/email");

// ============================================================
// HELPER
// ============================================================

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ============================================================
// FORGOT PASSWORD
// POST /api/password/forgot
// ============================================================

exports.forgotPassword = async (
  req,
  res
) => {
  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    // ----------------------------------------------------------
    // VALIDATE EMAIL
    // ----------------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    // ----------------------------------------------------------
    // FIND USER
    // ----------------------------------------------------------

    const user =
      await User.findOne({
        email,
      }).select(
        "+resetPasswordToken +resetPasswordExpires"
      );

    // ----------------------------------------------------------
    // DON'T REVEAL WHETHER ACCOUNT EXISTS
    // ----------------------------------------------------------

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a reset link has been sent.",
      });
    }

    // ----------------------------------------------------------
    // CHECK ACCOUNT
    // ----------------------------------------------------------

    if (user.isActive === false) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a reset link has been sent.",
      });
    }

    // ----------------------------------------------------------
    // ONLY LOCAL PASSWORD ACCOUNTS
    // ----------------------------------------------------------

    if (
      user.provider &&
      user.provider !== "local"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists, a reset link has been sent.",
      });
    }

    // ----------------------------------------------------------
    // CHECK FRONTEND URL
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // GENERATE RESET TOKEN
    // ----------------------------------------------------------

    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const hashedToken =
      hashResetToken(resetToken);

    // ----------------------------------------------------------
    // SAVE HASHED TOKEN
    // ----------------------------------------------------------

    user.resetPasswordToken =
      hashedToken;

    user.resetPasswordExpires =
      new Date(
        Date.now() +
          60 * 60 * 1000
      );

    await user.save({
      validateBeforeSave: false,
    });

    // ----------------------------------------------------------
    // CREATE RESET URL
    // ----------------------------------------------------------

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    console.log(
      "🔐 Password reset URL generated for:",
      user.email
    );

    // ----------------------------------------------------------
    // SEND EMAIL
    // ----------------------------------------------------------

    try {
      await sendPasswordResetEmail(
        user.email,
        resetUrl,
        user.name
      );
    } catch (emailError) {
      console.error(
        "❌ Password reset email failed."
      );

      console.error(
        "Email error:",
        emailError?.message ||
          emailError
      );

      console.error(
        "Email error code:",
        emailError?.code ||
          "N/A"
      );

      console.error(
        "Email error data:",
        emailError?.data ||
          "N/A"
      );

      // Remove token because email wasn't sent.
      user.resetPasswordToken =
        undefined;

      user.resetPasswordExpires =
        undefined;

      await user.save({
        validateBeforeSave: false,
      });

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password reset email. Please try again later.",
      });
    }

    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Password reset link sent.",
    });
  } catch (error) {
    console.error(
      "❌ Forgot password controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

// ============================================================
// RESET PASSWORD
// POST /api/password/reset/:token
// ============================================================

exports.resetPassword = async (
  req,
  res
) => {
  try {
    const token =
      String(
        req.params?.token || ""
      ).trim();

    const password =
      String(
        req.body?.password || ""
      );

    const confirmPassword =
      String(
        req.body?.confirmPassword || ""
      );

    // ----------------------------------------------------------
    // TOKEN
    // ----------------------------------------------------------

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token is required",
      });
    }

    // ----------------------------------------------------------
    // PASSWORD
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // HASH TOKEN
    // ----------------------------------------------------------

    const hashedToken =
      hashResetToken(token);

    // ----------------------------------------------------------
    // FIND USER WITH VALID TOKEN
    // ----------------------------------------------------------

    const user =
      await User.findOne({
        resetPasswordToken:
          hashedToken,

        resetPasswordExpires: {
          $gt: new Date(),
        },
      }).select(
        "+resetPasswordToken +resetPasswordExpires +password"
      );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired token",
      });
    }

    // ----------------------------------------------------------
    // UPDATE PASSWORD
    //
    // IMPORTANT:
    // We assign plain password here.
    // User.js pre-save hook hashes it.
    // ----------------------------------------------------------

    user.password =
      password;

    // ----------------------------------------------------------
    // INVALIDATE RESET TOKEN
    // ----------------------------------------------------------

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpires =
      undefined;

    // ----------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------

    await user.save();

    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully",
    });
  } catch (error) {
    console.error(
      "❌ Reset password controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};