const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /register
 * Register a new user
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ==========================
    // Check existing user
    // ==========================
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ==========================
    // Create user
    // Password is hashed automatically
    // by User model pre("save")
    // ==========================
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone: phone || "",
    });

    console.log("✅ NEW USER CREATED:", newUser.email);

    // ==========================
    // Generate Token
    // ==========================
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ==========================
    // Response
    // ==========================
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        photoURL: newUser.photoURL,
      },
    });

  } catch (error) {
    console.error("❌ Registration Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;