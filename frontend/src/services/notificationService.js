// frontend/src/services/notificationService.js

import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔔 Notification API URL:", API_URL);

// ============================================================
// AUTH TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

// ============================================================
// AUTH CONFIG
// ============================================================

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
};

// ============================================================
// ERROR HANDLER
// ============================================================

const handleNotificationError = (error, action = "Notification request") => {
  console.error(`❌ ${action} failed:`, error);

  if (error.response) {
    console.error(
      `❌ ${action} status:`,
      error.response.status
    );

    console.error(
      `❌ ${action} response:`,
      error.response.data
    );

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${error.response.status}`;

    if (error.response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    if (error.response.status === 403) {
      throw new Error(
        error.response.data?.message ||
          "You are not authorized to perform this action."
      );
    }

    throw new Error(message);
  }

  if (error.request) {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection."
    );
  }

  throw new Error(
    error.message || "Something went wrong."
  );
};

// ============================================================
// GET USER NOTIFICATIONS
// GET /api/notifications/:userId
// ============================================================

export const getUserNotifications = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  try {
    const response = await axios.get(
      `${API_URL}/api/notifications/${userId}`,
      authConfig()
    );

    return response.data;
  } catch (error) {
    return handleNotificationError(
      error,
      "Get notifications"
    );
  }
};

// ============================================================
// GET ADMIN NOTIFICATIONS
// GET /api/notifications/admin
// ============================================================

export const getAdminNotifications = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/notifications/admin`,
      authConfig()
    );

    return response.data;
  } catch (error) {
    return handleNotificationError(
      error,
      "Get admin notifications"
    );
  }
};

// ============================================================
// CREATE NOTIFICATION
// POST /api/notifications
// ============================================================

export const createNotification = async ({
  userId,
  title,
  message,
  type = "info",
  link = "",
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!title?.trim()) {
    throw new Error("Notification title is required.");
  }

  if (!message?.trim()) {
    throw new Error("Notification message is required.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/notifications`,
      {
        userId,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link?.trim() || "",
      },
      authConfig()
    );

    return response.data;
  } catch (error) {
    return handleNotificationError(
      error,
      "Create notification"
    );
  }
};

// ============================================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ============================================================

export const markNotificationRead = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  try {
    const response = await axios.put(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {},
      authConfig()
    );

    return response.data;
  } catch (error) {
    return handleNotificationError(
      error,
      "Mark notification as read"
    );
  }
};

// ============================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ============================================================

export const deleteNotification = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  try {
    const response = await axios.delete(
      `${API_URL}/api/notifications/${notificationId}`,
      authConfig()
    );

    return response.data;
  } catch (error) {
    return handleNotificationError(
      error,
      "Delete notification"
    );
  }
};

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// Client-side helper
// ============================================================

export const markAllNotificationsRead = async (
  notifications = []
) => {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  if (unreadNotifications.length === 0) {
    return {
      success: true,
      message: "No unread notifications.",
      notifications: [],
    };
  }

  try {
    const results = await Promise.all(
      unreadNotifications.map((notification) =>
        markNotificationRead(notification._id)
      )
    );

    return {
      success: true,
      message: "All notifications marked as read.",
      notifications: results,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================================
// UNREAD COUNT
// Client-side helper
// ============================================================

export const getUnreadNotificationCount = (
  notifications = []
) => {
  return notifications.filter(
    (notification) => !notification.read
  ).length;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const notificationService = {
  getUserNotifications,
  getAdminNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
  getUnreadNotificationCount,
};

export default notificationService;