// backend/controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator"); // optional but recommended

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ==========================
// Register User
// ==========================
exports.register = async (req, res) => {
  try {
    // 1. Validate required fields
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, password, phone) are required",
      });
    }

    // 2. Trim and sanitize
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // 3. Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 4. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 5. Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 6. Create user (role defaults to "user" if not provided)
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password, // will be hashed by pre-save hook in User model
      phone: trimmedPhone,
      role: req.body.role || "user", // optionally allow setting role via request
    });

    // 7. Send response (exclude password)
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ==========================
// Login User
// ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user and explicitly select password (since it's excluded by default)
    const user = await User.findOne({ email: trimmedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login timestamp (optional)
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location || null,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ==========================
// Get Current User
// ==========================
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ==========================
// Update Profile
// ==========================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location, avatar } = req.body;

    // Build update object (only include fields that are provided)
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (phone) updateFields.phone = phone.trim();
    if (location) updateFields.location = location;
    if (avatar) updateFields.avatar = avatar;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ==========================
// Logout (stateless JWT – no server-side action)
// ==========================
exports.logout = async (req, res) => {
  // JWT is stateless; client must discard the token.
  // We just return a success response.
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};