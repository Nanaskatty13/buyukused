const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // adjust path to your User model

const router = express.Router();

/**
 * POST /register
 * Register a new user
 * Body: { name, email, password, phone?, country?, profilePicture?, role? }
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      country,
      profilePicture,
      role,
    } = req.body;

    // --- Validation ---
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

    // Optional: validate role if provided
    const allowedRoles = ["buyer", "seller"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'buyer' or 'seller'",
      });
    }

    // --- Check if user already exists ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // --- Hash password ---
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Prepare user data ---
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      country: country || "",
      role: role || "buyer",
    };

    // --- Handle profile picture if provided ---
    if (profilePicture) {
      if (typeof profilePicture === "string" && profilePicture.startsWith("data:image/")) {
        userData.photoURL = profilePicture;
      } else {
        console.warn("Invalid profilePicture format, ignoring.");
      }
    }

    // --- Create user ---
    const newUser = new User(userData);
    await newUser.save();

    // --- Generate JWT token ---
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // --- Return user data (without password) ---
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      country: newUser.country || "",
      photoURL: newUser.photoURL || "",
      role: newUser.role || "buyer",
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;