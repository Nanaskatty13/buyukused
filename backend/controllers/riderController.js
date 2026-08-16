// backend/controllers/riderController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ============================================================
// RIDER REGISTRATION
// POST /api/riders/register
// ============================================================

exports.registerRider = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
    } = req.body || {};

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, and phone number are required",
      });
    }

    const trimmedName = String(name).trim();

    const trimmedEmail = String(email)
      .trim()
      .toLowerCase();

    const trimmedPhone = String(phone).trim();

    const trimmedLocation =
      location !== undefined &&
      location !== null
        ? String(location).trim()
        : "Ghana";

    // ----------------------------------------------------------
    // VALIDATE NAME
    // ----------------------------------------------------------

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE EMAIL
    // ----------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE PASSWORD
    // ----------------------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE PHONE
    // ----------------------------------------------------------

    if (trimmedPhone.length < 7) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid phone number",
      });
    }

    // ----------------------------------------------------------
    // CHECK EXISTING ACCOUNT
    // ----------------------------------------------------------

    const existingUser = await User.findOne({
      email: trimmedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // ----------------------------------------------------------
    // CREATE RIDER
    // ----------------------------------------------------------

    const rider = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: String(password),
      phone: trimmedPhone,
      location: trimmedLocation,

      role: "rider",

      provider: "local",

      isActive: true,
    });

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Rider account created successfully",
      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        location: rider.location,
        role: rider.role,
        isActive: rider.isActive,
      },
    });
  } catch (error) {
    console.error(
      "❌ Rider registration error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(
        error.errors || {}
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