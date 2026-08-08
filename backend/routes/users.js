const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ─── Multer config for profile pictures ──────────────────────────
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/profiles"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

// ──────────────────────────────────────────────────────────────────
// ✅ PUBLIC / SELF routes (must come BEFORE /:id routes)
// ──────────────────────────────────────────────────────────────────

// UPDATE PROFILE (logged‑in user) – no admin required
router.put("/profile", verifyToken, profileUpload.single("photo"), async (req, res) => {
  try {
    const { name, email, phone, removePhoto } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;

    // Handle photo
    if (removePhoto === "true") {
      user.photoURL = null;
    } else if (req.file) {
      // Store full URL – works for both local and Cloudinary
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      user.photoURL = `${baseUrl}/uploads/profiles/${req.file.filename}`;
    }

    await user.save();
    res.json({ success: true, message: "Profile updated", user: user.toJSON() });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// ADMIN routes (require isAdmin)
// ──────────────────────────────────────────────────────────────────

// GET ALL USERS
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { search, role, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET STATS – must be before /:id
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalSellers, totalBuyers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "buyer" }),
    ]);
    res.json({ success: true, stats: { totalUsers, totalAdmins, totalSellers, totalBuyers } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET SINGLE USER (Admin only)
router.get("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE USER (Admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, password, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "admin" && role !== "admin" && req.userId.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot remove your own admin role" });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    } else if (password && password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    await user.save();
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE USER (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) return res.status(400).json({ success: false, message: "Cannot delete the last admin" });
    }
    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;