// backend/controllers/notificationController.js

const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// ============================================================
// HELPER
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// GET USER NOTIFICATIONS
// GET /api/notifications/:userId
// ============================================================

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const requestingUserId =
      req.userId.toString();

    const requestedUserId =
      userId.toString();

    const isOwner =
      requestingUserId === requestedUserId;

    const isAdmin =
      req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const notifications =
      await Notification.find({
        userId: requestedUserId,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error(
      "❌ Get user notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ============================================================
// GET ADMIN NOTIFICATIONS
// GET /api/notifications/admin
// ============================================================

exports.getAdminNotifications = async (
  req,
  res
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const adminId =
      req.userId.toString();

    const notifications =
      await Notification.find({
        userId: adminId,
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error(
      "❌ Get admin notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin notifications",
    });
  }
};

// ============================================================
// CREATE NOTIFICATION
// POST /api/notifications
// ============================================================

exports.createNotification = async (
  req,
  res
) => {
  try {
    const {
      userId,
      title,
      message,
      type = "info",
      link = "",
    } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "userId, title and message are required",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const targetUserId =
      userId.toString();

    const currentUserId =
      req.userId.toString();

    const isAdmin =
      req.user?.role === "admin";

    // Normal users can only create
    // notifications for themselves.
    if (
      !isAdmin &&
      targetUserId !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot create notifications for another user",
      });
    }

    const allowedTypes = [
      "info",
      "success",
      "warning",
      "error",
    ];

    const notificationType =
      allowedTypes.includes(type)
        ? type
        : "info";

    const notification =
      await Notification.create({
        userId: targetUserId,
        title: String(title).trim(),
        message: String(message).trim(),
        type: notificationType,
        link: link
          ? String(link).trim()
          : "",
        read: false,
      });

    return res.status(201).json({
      success: true,
      message:
        "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error(
      "❌ Create notification error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create notification",
    });
  }
};

// ============================================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ============================================================

exports.markNotificationRead =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID",
        });
      }

      const notification =
        await Notification.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      const notificationUserId =
        notification.userId.toString();

      const currentUserId =
        req.userId.toString();

      const isOwner =
        notificationUserId ===
        currentUserId;

      const isAdmin =
        req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      notification.read = true;

      await notification.save();

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "❌ Mark notification read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark notification as read",
      });
    }
  };

// ============================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ============================================================

exports.deleteNotification =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID",
        });
      }

      const notification =
        await Notification.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      const notificationUserId =
        notification.userId.toString();

      const currentUserId =
        req.userId.toString();

      const isOwner =
        notificationUserId ===
        currentUserId;

      const isAdmin =
        req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await notification.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Delete notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notification",
      });
    }
  };