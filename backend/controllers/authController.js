// backend/controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ============================================================
// GENERATE JWT TOKEN
// ============================================================

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
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
// SAFE USER RESPONSE
// ============================================================

const getSafeUser = (user) => {
  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.password;
  delete userObject.__v;

  return {
    id: userObject._id,
    name: userObject.name || "",
    email: userObject.email || "",
    phone: userObject.phone || "",
    location: userObject.location || "Ghana",
    avatar: userObject.avatar || "",
    photoURL: userObject.photoURL || "",
    provider: userObject.provider || "local",
    role: userObject.role || "buyer",
    isActive:
      userObject.isActive !== false,
    lastLogin: userObject.lastLogin || null,
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt,
  };
};

// ============================================================
// REGISTER
// POST /auth/register
// ============================================================

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body || {};

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------
    //
    // Phone is OPTIONAL because the User model defines:
    //
    // phone: {
    //   type: String,
    //   default: "",
    // }
    //
    // --------------------------------------------------------

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, and role are required",
      });
    }

    // --------------------------------------------------------
    // CLEAN INPUT
    // --------------------------------------------------------

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

    const selectedRole =
      String(role)
        .trim()
        .toLowerCase();

    // --------------------------------------------------------
    // NAME VALIDATION
    // --------------------------------------------------------

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long",
      });
    }

    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    // --------------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    // --------------------------------------------------------
    // ROLE VALIDATION
    // --------------------------------------------------------
    //
    // Public registration can only create:
    //
    // buyer
    // seller
    //
    // ADMIN MUST NEVER be selectable from the frontend.
    // --------------------------------------------------------

    if (
      !["buyer", "seller"].includes(
        selectedRole
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be either buyer or seller",
      });
    }

    // --------------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------------

    const existingUser =
      await User.findOne({
        email: trimmedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // --------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------
    //
    // User.js has a pre-save hook that hashes the password.
    //
    // DO NOT bcrypt.hash() here as well.
    // Otherwise the password could be double-hashed.
    // --------------------------------------------------------

    const user =
      await User.create({
        name: trimmedName,

        email: trimmedEmail,

        password: String(password),

        phone: trimmedPhone,

        role: selectedRole,

        location: "Ghana",

        provider: "local",

        isActive: true,

        lastLogin: null,
      });

    // --------------------------------------------------------
    // GENERATE TOKEN
    // --------------------------------------------------------

    const token =
      generateToken(user);

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log(
      "✅ New user registered:",
      user.email,
      `(${user.role})`
    );

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      token,

      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Registration error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE EMAIL
    // --------------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // --------------------------------------------------------
    // MONGOOSE VALIDATION
    // --------------------------------------------------------

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
// POST /auth/login
// ============================================================

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // --------------------------------------------------------
    // CLEAN EMAIL
    // --------------------------------------------------------

    const trimmedEmail =
      String(email)
        .trim()
        .toLowerCase();

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // ACTIVE STATUS
    // --------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    // --------------------------------------------------------
    // CHECK PASSWORD
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // UPDATE LAST LOGIN
    // --------------------------------------------------------

    user.lastLogin =
      new Date();

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // GENERATE TOKEN
    // --------------------------------------------------------

    const token =
      generateToken(user);

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log(
      "✅ User logged in:",
      user.email
    );

    return res.json({
      success: true,

      message:
        "Login successful",

      token,

      user: getSafeUser(user),
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
// GET /auth/me
// ============================================================

exports.getMe = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION CHECK
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // ACTIVE STATUS
    // --------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return res.json({
      success: true,
      user: getSafeUser(user),
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
// PUT /auth/profile
// ============================================================

exports.updateProfile =
  async (req, res) => {
    try {
      // ------------------------------------------------------
      // AUTHENTICATION
      // ------------------------------------------------------

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
      } = req.body || {};

      const updateFields = {};

      // ------------------------------------------------------
      // NAME
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // PHONE
      // ------------------------------------------------------

      if (
        phone !== undefined &&
        phone !== null
      ) {
        updateFields.phone =
          String(phone).trim();
      }

      // ------------------------------------------------------
      // LOCATION
      // ------------------------------------------------------

      if (
        location !== undefined &&
        location !== null
      ) {
        updateFields.location =
          String(location).trim();
      }

      // ------------------------------------------------------
      // AVATAR
      // ------------------------------------------------------

      if (
        avatar !== undefined &&
        avatar !== null
      ) {
        updateFields.avatar =
          String(avatar).trim();
      }

      // ------------------------------------------------------
      // NOTHING TO UPDATE
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      return res.json({
        success: true,

        message:
          "Profile updated successfully",

        user: getSafeUser(user),
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
            (err) =>
              err.message
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
// POST /auth/logout
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