const express = require("express");
const Notification = require("../models/Notification");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ===== GET USER NOTIFICATIONS =====
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    // Check if user is requesting their own notifications or is admin
    if (req.params.userId !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===== GET ADMIN NOTIFICATIONS =====
router.get("/admin", verifyToken, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: "admin" }, { userId: req.userId }],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching admin notifications:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===== CREATE NOTIFICATION =====
router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title and message are required",
      });
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type: type || "info",
      link: link || "",
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===== MARK NOTIFICATION AS READ =====
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check ownership or admin
    if (notification.userId.toString() !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===== DELETE NOTIFICATION =====
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check ownership or admin
    if (notification.userId.toString() !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;