const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const VALID_NOTIFICATION_TYPES = [
  "system",
  "product_viewed",
  "message",
  "order_update",
  "promotion",
  "other",
];

const isValidObjectId = (id) => {
  return Boolean(
    id &&
      mongoose.Types.ObjectId.isValid(id)
  );
};

const getCurrentUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.userId ||
    null
  );
};

const getCurrentUserRole = (req) => {
  return req.user?.role || "";
};

const isAdmin = (req) => {
  return getCurrentUserRole(req) === "admin";
};

const normalizeType = (type) => {
  if (
    !type ||
    typeof type !== "string"
  ) {
    return "system";
  }

  const normalized = type
    .trim()
    .toLowerCase();

  return VALID_NOTIFICATION_TYPES.includes(
    normalized
  )
    ? normalized
    : "system";
};

const cleanString = (
  value,
  defaultValue = ""
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  return String(value).trim();
};

exports.getUserNotifications = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const currentUserId =
      getCurrentUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const requestedUserId =
      userId.toString();

    const authenticatedUserId =
      currentUserId.toString();

    const owner =
      requestedUserId ===
      authenticatedUserId;

    if (!owner && !isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const notifications =
      await Notification.find({
        user: requestedUserId,
      })
        .populate(
          "sender",
          "name email avatar profileImage"
        )
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean();

    const unreadCount =
      await Notification.countDocuments({
        user: requestedUserId,
        read: false,
      });

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "❌ Get user notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    });
  }
};

exports.getAdminNotifications = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Admin only.",
      });
    }

    const adminId =
      getCurrentUserId(req);

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const notifications =
      await Notification.find({
        user: adminId,
      })
        .populate(
          "sender",
          "name email avatar profileImage"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .lean();

    const unreadCount =
      await Notification.countDocuments({
        user: adminId,
        read: false,
      });

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount,
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

exports.createNotification = async (
  req,
  res
) => {
  try {
    const {
      user,
      userId,
      sender,
      senderId,
      title,
      message,
      type = "system",
      link = "",
      read = false,
    } = req.body || {};

    const targetUserId =
      user || userId;

    const notificationSenderId =
      sender || senderId || null;

    if (
      !targetUserId ||
      !title ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "user, title and message are required",
      });
    }

    if (
      !isValidObjectId(
        targetUserId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification user ID",
      });
    }

    if (
      notificationSenderId &&
      !isValidObjectId(
        notificationSenderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid sender ID",
      });
    }

    const currentUserId =
      getCurrentUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const targetId =
      targetUserId.toString();

    const currentId =
      currentUserId.toString();

    const admin = isAdmin(req);

    if (
      !admin &&
      targetId !== currentId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot create notifications for another user",
      });
    }

    const notificationType =
      normalizeType(type);

    const notification =
      await Notification.create({
        user: targetId,
        sender:
          notificationSenderId || null,
        title: cleanString(title),
        message: cleanString(message),
        type: notificationType,
        link: cleanString(link),
        read: Boolean(read),
      });

    const populatedNotification =
      await Notification.findById(
        notification._id
      )
        .populate(
          "sender",
          "name email avatar profileImage"
        )
        .lean();

    return res.status(201).json({
      success: true,
      message:
        "Notification created successfully",
      notification:
        populatedNotification ||
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
          error.errors || {}
        ).map(
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Notification validation failed",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create notification",
    });
  }
};

exports.markNotificationRead =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID",
        });
      }

      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const notification =
        await Notification.findById(
          id
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      const notificationUserId =
        notification.user?.toString();

      const currentId =
        currentUserId.toString();

      const owner =
        notificationUserId ===
        currentId;

      if (!owner && !isAdmin(req)) {
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

exports.markAllNotificationsRead =
  async (req, res) => {
    try {
      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const result =
        await Notification.updateMany(
          {
            user: currentUserId,
            read: false,
          },
          {
            $set: {
              read: true,
            },
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
        modifiedCount:
          result.modifiedCount || 0,
      });
    } catch (error) {
      console.error(
        "❌ Mark all notifications read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark all notifications as read",
      });
    }
  };

exports.deleteNotification =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID",
        });
      }

      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const notification =
        await Notification.findById(
          id
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      const notificationUserId =
        notification.user?.toString();

      const currentId =
        currentUserId.toString();

      const owner =
        notificationUserId ===
        currentId;

      if (!owner && !isAdmin(req)) {
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

exports.deleteAllNotifications =
  async (req, res) => {
    try {
      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const result =
        await Notification.deleteMany({
          user: currentUserId,
        });

      return res.status(200).json({
        success: true,
        message:
          "All notifications deleted successfully",
        deletedCount:
          result.deletedCount || 0,
      });
    } catch (error) {
      console.error(
        "❌ Delete all notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete all notifications",
      });
    }
  };

module.exports = {
  getUserNotifications:
    exports.getUserNotifications,

  getAdminNotifications:
    exports.getAdminNotifications,

  createNotification:
    exports.createNotification,

  markNotificationRead:
    exports.markNotificationRead,

  markAllNotificationsRead:
    exports.markAllNotificationsRead,

  deleteNotification:
    exports.deleteNotification,

  deleteAllNotifications:
    exports.deleteAllNotifications,
};