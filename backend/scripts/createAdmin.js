// backend/scripts/createAdmin.js

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = "nanaskatty0@gmail.com";
const ADMIN_PASSWORD = "Omega132";

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");
    console.log(`📦 Database: ${mongoose.connection.name}`);

    // Check whether admin already exists
    const existingAdmin = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase().trim(),
    });

    if (existingAdmin) {
      console.log("⚠️ An account with this email already exists.");

      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        existingAdmin.isActive = true;

        await existingAdmin.save();

        console.log("✅ Existing account promoted to admin.");
      } else {
        console.log("ℹ️ This account is already an admin.");
      }

      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin
    const admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: ADMIN_PASSWORD,
      phone: "",
      role: "admin",
      isActive: true,
    });

    console.log("========================================");
    console.log("✅ ADMIN ACCOUNT CREATED");
    console.log("========================================");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Active: ${admin.isActive}`);
    console.log("========================================");
    console.log("🔐 Password was hashed by the User model.");
    console.log("========================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:");
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

createAdmin();