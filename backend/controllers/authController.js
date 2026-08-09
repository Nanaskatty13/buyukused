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
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, phone, and role are required",
      });
    }

    const trimmedName = String(name).trim();

    const trimmedEmail = String(email)
      .trim()
      .toLowerCase();

    const trimmedPhone = String(phone).trim();

    const selectedRole = String(role)
      .trim()
      .toLowerCase();

    if (!["buyer", "seller"].includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be either buyer or seller",
      });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      email: trimmedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    // User model should hash the password
    // using its pre-save hook.
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      phone: trimmedPhone,
      role: selectedRole,
      isActive: true,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location || "Ghana",
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: "Validation error",
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
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const trimmedEmail = String(email)
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: trimmedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    user.lastLogin = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location || "Ghana",
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);

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

exports.getMe = async (req, res) => {
  try {
    // verifyToken attaches the MongoDB user
    // to req.user.
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(
      req.user._id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ GetMe error:", error);

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

exports.updateProfile = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      name,
      phone,
      location,
      avatar,
    } = req.body;

    const updateFields = {};

    if (name !== undefined && name !== null) {
      const trimmedName =
        String(name).trim();

      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Name must be at least 2 characters long",
        });
      }

      updateFields.name = trimmedName;
    }

    if (phone !== undefined && phone !== null) {
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
      Object.keys(updateFields).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
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
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "❌ UpdateProfile error:",
      error
    );

    if (error.name === "ValidationError") {
      const errors = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: "Validation error",
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

exports.logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};
