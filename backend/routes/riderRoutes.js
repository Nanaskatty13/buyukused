// backend/routes/riderRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// ============================================================
// RIDER REGISTRATION
// POST /api/riders/register
// ============================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      serviceArea,
      bikeType,
      bikeNumber,
      identificationNumber,
    } = req.body || {};

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !serviceArea ||
      !bikeType ||
      !bikeNumber ||
      !identificationNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, phone, service area, bike type, bike number, and identification number are required.",
      });
    }

    // ----------------------------------------------------------
    // CLEAN INPUT
    // ----------------------------------------------------------

    const cleanedName = String(name).trim();

    const cleanedEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanedPhone = String(phone).trim();

    const cleanedServiceArea =
      String(serviceArea).trim();

    const cleanedBikeType =
      String(bikeType).trim();

    const cleanedBikeNumber =
      String(bikeNumber).trim().toUpperCase();

    const cleanedIdentificationNumber =
      String(identificationNumber).trim();

    // ----------------------------------------------------------
    // VALIDATE NAME
    // ----------------------------------------------------------

    if (cleanedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long.",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE EMAIL
    // ----------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE PASSWORD
    // ----------------------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long.",
      });
    }

    // ----------------------------------------------------------
    // CHECK EXISTING USER
    // ----------------------------------------------------------

    const existingUser =
      await User.findOne({
        email: cleanedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // ----------------------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------------------
    //
    // User.js also hashes passwords in its pre-save hook.
    // Therefore we DO NOT hash here.
    //
    // ----------------------------------------------------------

    const rider = new User({
      name: cleanedName,
      email: cleanedEmail,
      password,
      phone: cleanedPhone,

      role: "rider",

      location: cleanedServiceArea,

      isActive: true,

      riderProfile: {
        isAvailable: false,
        isApproved: false,

        bikeType: cleanedBikeType,
        bikeNumber: cleanedBikeNumber,

        serviceArea: cleanedServiceArea,

        identificationNumber:
          cleanedIdentificationNumber,

        rating: 5,
        completedDeliveries: 0,
      },
    });

    await rider.save();

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Rider application submitted successfully. Your account is pending admin approval.",

      rider: {
        id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        role: rider.role,

        riderProfile: {
          isAvailable:
            rider.riderProfile.isAvailable,

          isApproved:
            rider.riderProfile.isApproved,

          bikeType:
            rider.riderProfile.bikeType,

          bikeNumber:
            rider.riderProfile.bikeNumber,

          serviceArea:
            rider.riderProfile.serviceArea,

          rating:
            rider.riderProfile.rating,

          completedDeliveries:
            rider.riderProfile
              .completedDeliveries,
        },
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
          "An account with this email already exists.",
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
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Validation error.",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit rider application.",
    });
  }
);

module.exports = router;