// backend/routes/notifications.js

const express = require("express");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth");

const {
  getUserNotifications,
  getAdminNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

// ============================================================
// ADMIN NOTIFICATIONS
// IMPORTANT: Must come BEFORE /:userId
// ============================================================

router.get(
  "/admin",
  verifyToken,
  isAdmin,
  getAdminNotifications
);

// ============================================================
// USER NOTIFICATIONS
// GET /api/notifications/:userId
// ============================================================

router.get(
  "/:userId",
  verifyToken,
  getUserNotifications
);

// ============================================================
// CREATE NOTIFICATION
// POST /api/notifications
// ============================================================

router.post(
  "/",
  verifyToken,
  createNotification
);

// ============================================================
// MARK AS READ
// PUT /api/notifications/:id/read
// ============================================================

router.put(
  "/:id/read",
  verifyToken,
  markNotificationRead
);

// ============================================================
// DELETE
// DELETE /api/notifications/:id
// ============================================================

router.delete(
  "/:id",
  verifyToken,
  deleteNotification
);

module.exports = router;