// ============================================================
// backend/routes/passwordRoutes.js
// BuyUKUsed Password Reset Routes
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
    .update(String(token))
    .digest("hex");
};

const genericSuccessMessage =
  "If that email exists, a password reset link has been sent.";

// ============================================================
// POST /api/password/forgot
// ============================================================

router.post("/forgot", async (req, res) => {
  try {
    console.log(
      "📧 Password reset request received"
    );

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    const email = normalizeEmail(
      req.body?.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }

    console.log(
      `🔎 Looking for user: ${email}`
    );

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user = await User.findOne({
      email,
    }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    // --------------------------------------------------------
    // USER DOES NOT EXIST
    //
    // Do not reveal whether the account exists.
    // --------------------------------------------------------

    if (!user) {
      console.log(
        "ℹ️ No account found for requested email."
      );

      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // --------------------------------------------------------
    // ACCOUNT DEACTIVATED
    // --------------------------------------------------------

    if (user.isActive === false) {
      console.log(
        "ℹ️ Password reset requested for inactive account."
      );

      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // --------------------------------------------------------
    // SOCIAL LOGIN
    // --------------------------------------------------------

    if (
      user.provider &&
      user.provider !== "local"
    ) {
      console.log(
        `ℹ️ ${email} uses ${user.provider} authentication.`
      );

      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // --------------------------------------------------------
    // FRONTEND URL
    // --------------------------------------------------------

    const frontendUrl = String(
      process.env.FRONTEND_URL || ""
    )
      .trim()
      .replace(/\/+$/, "");

    if (!frontendUrl) {
      console.error(
        "❌ FRONTEND_URL is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Password reset service is not configured.",
      });
    }

    // --------------------------------------------------------
    // RESEND API KEY
    // --------------------------------------------------------

    const resendApiKey = String(
      process.env.RESEND_API_KEY || ""
    ).trim();

    if (!resendApiKey) {
      console.error(
        "❌ RESEND_API_KEY is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Password reset email service is not configured.",
      });
    }

    // --------------------------------------------------------
    // EMAIL FUNCTION CHECK
    // --------------------------------------------------------

    if (
      typeof sendPasswordResetEmail !==
      "function"
    ) {
      console.error(
        "❌ sendPasswordResetEmail is not a function."
      );

      return res.status(500).json({
        success: false,
        message:
          "Password reset email service is not configured correctly.",
      });
    }

    // --------------------------------------------------------
    // GENERATE SECURE TOKEN
    // --------------------------------------------------------

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    // --------------------------------------------------------
    // HASH TOKEN
    //
    // Only the hash goes into MongoDB.
    // --------------------------------------------------------

    const hashedToken =
      hashResetToken(resetToken);

    // --------------------------------------------------------
    // EXPIRATION
    // --------------------------------------------------------

    const resetPasswordExpires =
      new Date(
        Date.now() +
          RESET_TOKEN_EXPIRATION_MS
      );

    // --------------------------------------------------------
    // SAVE TOKEN
    // --------------------------------------------------------

    user.resetPasswordToken =
      hashedToken;

    user.resetPasswordExpires =
      resetPasswordExpires;

    await user.save({
      validateBeforeSave: false,
    });

    console.log(
      `🔐 Password reset token created for ${email}`
    );

    // --------------------------------------------------------
    // RESET URL
    // --------------------------------------------------------

    const resetUrl =
      `${frontendUrl}/reset-password/${encodeURIComponent(
        resetToken
      )}`;

    console.log(
      "🔗 Password reset link generated."
    );

    // --------------------------------------------------------
    // SEND EMAIL
    // --------------------------------------------------------

    try {
      console.log(
        `📨 Sending password reset email to ${email}...`
      );

      await sendPasswordResetEmail(
        user.email,
        resetUrl,
        user.name || "there"
      );

      console.log(
        `✅ Password reset email sent successfully to ${email}`
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
        "Status:",
        emailError?.statusCode ||
          emailError?.status ||
          "N/A"
      );

      console.error(
        "Name:",
        emailError?.name ||
          "N/A"
      );

      console.error(
        "Response:",
        emailError?.response ||
          "N/A"
      );

      console.error(
        "Data:",
        emailError?.data ||
          "N/A"
      );

      // ------------------------------------------------------
      // CLEAN UP TOKEN
      // ------------------------------------------------------

      try {
        user.resetPasswordToken =
          undefined;

        user.resetPasswordExpires =
          undefined;

        await user.save({
          validateBeforeSave: false,
        });

        console.log(
          "🧹 Password reset token removed after email failure."
        );
      } catch (cleanupError) {
        console.error(
          "❌ Could not clean up reset token:",
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
      message: genericSuccessMessage,
    });
  } catch (error) {
    console.error(
      "❌ Forgot password route error."
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
      // TOKEN
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
      // PASSWORD
      // ------------------------------------------------------

      const password = String(
        req.body?.password || ""
      );

      const confirmPassword =
        String(
          req.body?.confirmPassword ||
            ""
        );

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
          "+password +resetPasswordToken +resetPasswordExpires"
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
      //
      // We assign the plain password here.
      // Your User.js pre-save hook should bcrypt-hash it.
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
        `✅ Password successfully reset for ${user.email}`
      );

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Reset password error."
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

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password. Please try again later.",
      });
    }
  }
);

// ============================================================
// GET /api/password/reset/:token
// VERIFY RESET TOKEN
// ============================================================

router.get(
  "/reset/:token",
  async (req, res) => {
    try {
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

      const hashedToken =
        hashResetToken(token);

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

      if (!user) {
        return res.status(400).json({
          success: false,
          valid: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          valid: false,
          message:
            "Your account has been deactivated.",
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        message:
          "Password reset token is valid.",
      });
    } catch (error) {
      console.error(
        "❌ Verify reset token error:",
        error
      );

      return res.status(500).json({
        success: false,
        valid: false,
        message:
          "Unable to verify password reset token.",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;