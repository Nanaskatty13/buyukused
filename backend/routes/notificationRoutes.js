const express = require("express");

const router = express.Router();

const {
  getUserNotifications,
  getAdminNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/admin",
  authMiddleware,
  getAdminNotifications
);

router.get(
  "/:userId",
  authMiddleware,
  getUserNotifications
);

router.post(
  "/",
  authMiddleware,
  createNotification
);

router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsRead
);

router.put(
  "/:id/read",
  authMiddleware,
  markNotificationRead
);

router.delete(
  "/all",
  authMiddleware,
  deleteAllNotifications
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;