// ============================================================
// backend/controllers/authController.js
// BuyUKUsed Authentication Controller
// ============================================================

"use strict";

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ============================================================
// RESEND
// ============================================================

let resend = null;

try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require("resend");

    resend = new Resend(
      process.env.RESEND_API_KEY
    );
  }
} catch (error) {
  console.error(
    "❌ Failed to initialize Resend:",
    error.message
  );
}

// ============================================================
// CONFIGURATION
// ============================================================

const FRONTEND_URL =
  (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");

const RESET_TOKEN_EXPIRES_IN =
  "15m";

const RESET_TOKEN_SECRET =
  process.env.PASSWORD_RESET_SECRET ||
  process.env.JWT_SECRET;

// ============================================================
// GENERATE JWT
// ============================================================

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// ============================================================
// SAFE USER
// ============================================================

const getSafeUser = (user) => {
  return {
    _id: user._id,

    id: user._id,

    name: user.name || "",

    email: user.email || "",

    phone: user.phone || "",

    role: user.role || "user",

    location:
      user.location || "Ghana",

    avatar:
      user.avatar ||
      user.photoURL ||
      "",

    photoURL:
      user.photoURL ||
      user.avatar ||
      "",

    provider:
      user.provider || "local",

    providerId:
      user.providerId || "",

    isActive:
      user.isActive !== false,

    lastLogin:
      user.lastLogin || null,

    createdAt:
      user.createdAt || null,

    updatedAt:
      user.updatedAt || null,

    riderProfile:
      user.role === "rider"
        ? {
            isAvailable:
              user.riderProfile
                ?.isAvailable === true,

            isVerified:
              user.riderProfile
                ?.isVerified === true,

            bikeType:
              user.riderProfile
                ?.bikeType || "",

            bikeNumber:
              user.riderProfile
                ?.bikeNumber || "",

            currentLocation:
              user.riderProfile
                ?.currentLocation || {
                address: "",
                latitude: null,
                longitude: null,
              },

            rating:
              typeof user
                .riderProfile
                ?.rating === "number"
                ? user.riderProfile
                    .rating
                : 5,

            totalDeliveries:
              user.riderProfile
                ?.totalDeliveries || 0,
          }
        : null,
  };
};

// ============================================================
// REGISTER
// ============================================================

exports.register = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body || {};

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password are required",
      });
    }

    const trimmedName =
      String(name).trim();

    const trimmedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const trimmedPhone =
      phone !== undefined &&
      phone !== null
        ? String(phone).trim()
        : "";

    let selectedRole = "user";

    if (role) {
      const providedRole =
        String(role)
          .trim()
          .toLowerCase();

      const allowedRoles = [
        "user",
        "buyer",
        "seller",
      ];

      if (
        allowedRoles.includes(
          providedRole
        )
      ) {
        selectedRole =
          providedRole;
      }
    }

    if (
      trimmedName.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        trimmedEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    if (
      String(password).length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    const existingUser =
      await User.findOne({
        email: trimmedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    const user =
      await User.create({
        name: trimmedName,

        email: trimmedEmail,

        password:
          String(password),

        phone: trimmedPhone,

        role: selectedRole,

        provider: "local",

        isActive: true,
      });

    const token =
      generateToken(user);

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      token,

      user:
        getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Registration error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors || {}
        ).map(
          (err) => err.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Validation error",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

exports.login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const trimmedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email: trimmedEmail,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (
      user.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    user.lastLogin =
      new Date();

    await user.save({
      validateBeforeSave: false,
    });

    const token =
      generateToken(user);

    return res.json({
      success: true,

      message:
        "Login successful",

      token,

      user:
        getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// GET CURRENT USER
// ============================================================

exports.getMe = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user._id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const user =
      await User.findById(
        req.user._id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    if (
      user.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    return res.json({
      success: true,
      user:
        getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ GetMe error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// UPDATE PROFILE
// ============================================================

exports.updateProfile =
  async (req, res) => {
    try {
      if (
        !req.user ||
        !req.user._id
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const {
        name,
        phone,
        location,
        avatar,
        photoURL,
      } = req.body || {};

      const updateFields = {};

      if (
        name !== undefined &&
        name !== null
      ) {
        const trimmedName =
          String(name).trim();

        if (
          trimmedName.length < 2
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Name must be at least 2 characters long",
          });
        }

        updateFields.name =
          trimmedName;
      }

      if (
        phone !== undefined &&
        phone !== null
      ) {
        updateFields.phone =
          String(phone).trim();
      }

      if (
        location !== undefined &&
        location !== null
      ) {
        updateFields.location =
          String(location).trim();
      }

      if (
        avatar !== undefined &&
        avatar !== null
      ) {
        updateFields.avatar =
          String(avatar).trim();
      }

      if (
        photoURL !== undefined &&
        photoURL !== null
      ) {
        updateFields.photoURL =
          String(photoURL).trim();
      }

      if (
        Object.keys(
          updateFields
        ).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No fields to update",
        });
      }

      const user =
        await User.findByIdAndUpdate(
          req.user._id,
          {
            $set: updateFields,
          },
          {
            new: true,
            runValidators: true,
          }
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Profile updated successfully",
        user:
          getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "❌ UpdateProfile error:",
        error
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        const errors =
          Object.values(
            error.errors || {}
          ).map(
            (err) => err.message
          );

        return res.status(400).json({
          success: false,
          message:
            "Validation error",
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Server error. Please try again later.",
      });
    }
  };

// ============================================================
// LOGOUT
// ============================================================

exports.logout = async (
  req,
  res
) => {
  return res.json({
    success: true,
    message:
      "Logged out successfully",
  });
};

// ============================================================
// PASSWORD RESET HELPERS
// ============================================================

const createPasswordResetToken =
  (user) => {
    if (!RESET_TOKEN_SECRET) {
      throw new Error(
        "PASSWORD_RESET_SECRET or JWT_SECRET is not configured"
      );
    }

    /*
     * A random nonce makes each reset request unique.
     *
     * We don't save the raw reset token in MongoDB.
     * The nonce is included in the JWT and signed.
     */
    const nonce =
      crypto.randomBytes(32).toString(
        "hex"
      );

    const token =
      jwt.sign(
        {
          purpose:
            "password-reset",

          userId:
            user._id.toString(),

          email:
            user.email,

          nonce,
        },
        RESET_TOKEN_SECRET,
        {
          expiresIn:
            RESET_TOKEN_EXPIRES_IN,
        }
      );

    return token;
  };

// ============================================================
// VERIFY PASSWORD RESET TOKEN
// ============================================================

const verifyPasswordResetToken =
  async (token) => {
    if (!token) {
      throw new Error(
        "Reset token is required"
      );
    }

    if (!RESET_TOKEN_SECRET) {
      throw new Error(
        "PASSWORD_RESET_SECRET or JWT_SECRET is not configured"
      );
    }

    let decoded;

    try {
      decoded =
        jwt.verify(
          token,
          RESET_TOKEN_SECRET
        );
    } catch (error) {
      if (
        error.name ===
        "TokenExpiredError"
      ) {
        throw new Error(
          "Password reset link has expired"
        );
      }

      throw new Error(
        "Invalid password reset link"
      );
    }

    if (
      decoded.purpose !==
      "password-reset"
    ) {
      throw new Error(
        "Invalid password reset token"
      );
    }

    if (
      !decoded.userId ||
      !mongooseIsValidObjectId(
        decoded.userId
      )
    ) {
      throw new Error(
        "Invalid password reset token"
      );
    }

    const user =
      await User.findById(
        decoded.userId
      ).select("+password");

    if (!user) {
      throw new Error(
        "Account associated with this reset link no longer exists"
      );
    }

    if (
      user.isActive === false
    ) {
      throw new Error(
        "This account has been deactivated"
      );
    }

    if (
      user.email !==
      decoded.email
    ) {
      throw new Error(
        "Invalid password reset token"
      );
    }

    return {
      user,
      decoded,
    };
  };

// ============================================================
// MONGOOSE OBJECT ID HELPER
// ============================================================

const mongooseIsValidObjectId =
  (value) => {
    try {
      const mongoose =
        require("mongoose");

      return mongoose.Types.ObjectId.isValid(
        value
      );
    } catch {
      return false;
    }
  };

// ============================================================
// FORGOT PASSWORD
// ============================================================

exports.forgotPassword =
  async (req, res) => {
    try {
      const email =
        String(
          req.body?.email || ""
        )
          .trim()
          .toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email address is required",
        });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(email)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid email address",
        });
      }

      // --------------------------------------------------------
      // FIND USER
      // --------------------------------------------------------

      const user =
        await User.findOne({
          email,
        });

      /*
       * Security:
       * Don't reveal whether an email exists.
       *
       * The frontend receives the same successful
       * response for an unknown email.
       */
      if (!user) {
        return res.json({
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

      if (
        user.isActive === false
      ) {
        return res.json({
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

      // --------------------------------------------------------
      // CHECK RESEND
      // --------------------------------------------------------

      if (!resend) {
        console.error(
          "❌ Resend is not configured"
        );

        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured on the server.",
        });
      }

      // --------------------------------------------------------
      // CREATE RESET TOKEN
      // --------------------------------------------------------

      const resetToken =
        createPasswordResetToken(
          user
        );

      // --------------------------------------------------------
      // RESET URL
      // --------------------------------------------------------

      const resetUrl =
        `${FRONTEND_URL}/reset-password/${encodeURIComponent(
          resetToken
        )}`;

      // --------------------------------------------------------
      // EMAIL
      // --------------------------------------------------------

      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        "buyukused <onboarding@resend.dev>";

      const emailResult =
        await resend.emails.send({
          from: fromEmail,

          to: [user.email],

          subject:
            "Reset your BuyUKUsed password",

          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Reset your BuyUKUsed password</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      max-width:600px;
      margin:40px auto;
      background:#ffffff;
      border-radius:12px;
      overflow:hidden;
      border:1px solid #e5e5e5;
    "
  >

    <div
      style="
        padding:30px;
        background:#111111;
        color:#ffffff;
      "
    >
      <h1
        style="
          margin:0;
          font-size:28px;
        "
      >
        BuyUKUsed
      </h1>

      <p
        style="
          margin:8px 0 0;
          color:#cccccc;
        "
      >
        Password reset request
      </p>
    </div>

    <div
      style="
        padding:35px 30px;
        color:#222222;
      "
    >
      <h2
        style="
          margin-top:0;
        "
      >
        Reset your password
      </h2>

      <p>
        Hello ${escapeHtml(
          user.name || "there"
        )},
      </p>

      <p>
        We received a request to reset
        the password for your BuyUKUsed
        account.
      </p>

      <p>
        Click the button below to create
        a new password.
      </p>

      <div
        style="
          margin:30px 0;
          text-align:center;
        "
      >
        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            padding:14px 24px;
            background:#111111;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Reset Password
        </a>
      </div>

      <p
        style="
          color:#666666;
          font-size:14px;
          line-height:1.6;
        "
      >
        This password reset link will
        expire in 15 minutes.
      </p>

      <p
        style="
          color:#666666;
          font-size:14px;
          line-height:1.6;
        "
      >
        If you did not request a password
        reset, you can safely ignore this
        email.
      </p>

      <hr
        style="
          border:0;
          border-top:1px solid #eeeeee;
          margin:30px 0;
        "
      />

      <p
        style="
          color:#999999;
          font-size:12px;
        "
      >
        BuyUKUsed
      </p>
    </div>
  </div>
</body>
</html>
          `,
        });

      // --------------------------------------------------------
      // HANDLE RESEND ERROR
      // --------------------------------------------------------

      if (
        emailResult?.error
      ) {
        console.error(
          "❌ Resend API error:",
          emailResult.error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to send password reset email.",
          error:
            process.env.NODE_ENV ===
            "production"
              ? undefined
              : emailResult.error,
        });
      }

      console.log(
        "✅ Password reset email sent:",
        emailResult?.data?.id ||
          "No email ID returned"
      );

      return res.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error) {
      console.error(
        "❌ Forgot password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to process password reset request.",
      });
    }
  };

// ============================================================
// VERIFY RESET TOKEN
// ============================================================

exports.verifyResetToken =
  async (req, res) => {
    try {
      const token =
        String(
          req.params?.token || ""
        ).trim();

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token is required",
        });
      }

      const {
        user,
      } =
        await verifyPasswordResetToken(
          token
        );

      return res.json({
        success: true,
        valid: true,
        message:
          "Password reset token is valid",
        email:
          user.email,
      });
    } catch (error) {
      console.error(
        "❌ Verify reset token error:",
        error.message
      );

      return res.status(400).json({
        success: false,
        valid: false,
        message:
          error.message ||
          "Invalid password reset token",
      });
    }
  };

// ============================================================
// RESET PASSWORD
// ============================================================

exports.resetPassword =
  async (req, res) => {
    try {
      const token =
        String(
          req.params?.token || ""
        ).trim();

      const {
        password,
        confirmPassword,
      } = req.body || {};

      // --------------------------------------------------------
      // VALIDATE TOKEN
      // --------------------------------------------------------

      if (!token) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token is required",
        });
      }

      // --------------------------------------------------------
      // VALIDATE PASSWORD
      // --------------------------------------------------------

      if (
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password and password confirmation are required",
        });
      }

      const newPassword =
        String(password);

      const confirmedPassword =
        String(confirmPassword);

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters long",
        });
      }

      if (
        newPassword !==
        confirmedPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passwords do not match",
        });
      }

      // --------------------------------------------------------
      // VERIFY TOKEN
      // --------------------------------------------------------

      const {
        user,
      } =
        await verifyPasswordResetToken(
          token
        );

      // --------------------------------------------------------
      // UPDATE PASSWORD
      // --------------------------------------------------------

      /*
       * Your User model already hashes passwords
       * in its pre-save hook.
       *
       * Therefore we assign the plain password
       * here and call save().
       *
       * Do NOT bcrypt.hash() it here if your
       * User model already has a pre-save hook.
       */

      user.password =
        newPassword;

      await user.save();

      console.log(
        `✅ Password successfully reset for ${user.email}`
      );

      // --------------------------------------------------------
      // GENERATE NORMAL LOGIN TOKEN
      // --------------------------------------------------------

      const loginToken =
        generateToken(user);

      return res.json({
        success: true,

        message:
          "Password reset successfully",

        token:
          loginToken,

        user:
          getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "❌ Reset password error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to reset password",
      });
    }
  };

// ============================================================
// HTML ESCAPE
// ============================================================

const escapeHtml = (value) => {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  register:
    exports.register,

  login:
    exports.login,

  getMe:
    exports.getMe,

  updateProfile:
    exports.updateProfile,

  logout:
    exports.logout,

  forgotPassword:
    exports.forgotPassword,

  verifyResetToken:
    exports.verifyResetToken,

  resetPassword:
    exports.resetPassword,
};