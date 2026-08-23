// ============================================================
// frontend/src/pages/Admin/components/AdminHeader.jsx
// BuyUKUsed - Admin Header
// ============================================================

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

// IMPORTANT:
// AdminHeader.jsx is inside:
// src/pages/Admin/components/
//
// Therefore we need to go:
// components -> Admin -> pages -> src
//
// Correct paths:
// ../../../services/api
// ../../../context/AuthContext
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../../../services/api";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// MONGODB OBJECTID CHECK
// ============================================================

const isValidObjectId = (value) => {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(value)
  );
};

// ============================================================
// GET USER ID FROM JWT
//
// Fallback only.
// AuthContext user ID is preferred.
// ============================================================

const getUserIdFromToken = () => {
  try {
    // SSR-safe check
    if (
      typeof window === "undefined" ||
      !window.localStorage
    ) {
      return null;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");

    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    if (!base64Url) {
      return null;
    }

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      base64 +
      "=".repeat(
        (4 - (base64.length % 4)) % 4
      );

    const payload = JSON.parse(
      atob(padded)
    );

    const id =
      payload?.id ||
      payload?._id ||
      payload?.userId ||
      payload?.sub ||
      null;

    if (isValidObjectId(id)) {
      return id;
    }

    return null;
  } catch (error) {
    console.warn(
      "⚠️ Unable to extract user ID from JWT:",
      error
    );

    return null;
  }
};

// ============================================================
// GET REAL USER ID
// ============================================================

const getRealUserId = (user) => {
  const candidates = [
    user?._id,
    user?.id,
    user?.userId,
    user?.user?._id,
    user?.user?.id,
    user?.user?.userId,
  ];

  for (const candidate of candidates) {
    if (isValidObjectId(candidate)) {
      return candidate;
    }
  }

  return getUserIdFromToken();
};

// ============================================================
// COMPONENT
// ============================================================

const AdminHeader = ({
  onMenuClick,
}) => {
  const { user } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [notifications, setNotifications] =
    useState([]);

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  // ==========================================================
  // REAL USER ID
  // ==========================================================

  const userId = getRealUserId(user);

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications = useCallback(
    async () => {
      if (!userId) {
        console.warn(
          "⚠️ Cannot fetch notifications: valid user ID is missing."
        );

        setNotifications([]);

        return;
      }

      if (!isValidObjectId(userId)) {
        console.error(
          "❌ Refusing to request notifications with invalid user ID:",
          userId
        );

        setNotifications([]);

        return;
      }

      try {
        setNotificationLoading(true);

        console.log(
          "🔔 Fetching admin notifications for user:",
          userId
        );

        const response =
          await getNotifications(userId);

        console.log(
          "🔔 Admin notifications response:",
          response
        );

        // Support multiple API response formats.
        const notificationList =
          response?.notifications ||
          response?.data?.notifications ||
          response?.data ||
          [];

        setNotifications(
          Array.isArray(notificationList)
            ? notificationList
            : []
        );
      } catch (error) {
        console.error(
          "❌ Error fetching notifications:",
          error
        );

        setNotifications([]);
      } finally {
        setNotificationLoading(false);
      }
    },
    [userId]
  );

  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    fetchNotifications();

    // Refresh every 30 seconds.
    const interval = setInterval(
      () => {
        fetchNotifications();
      },
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    userId,
    fetchNotifications,
  ]);

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification?.isRead !== true
    ).length;

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllRead = async () => {
    if (!userId) {
      console.warn(
        "⚠️ Cannot mark notifications as read: user ID missing."
      );

      return;
    }

    if (!isValidObjectId(userId)) {
      console.error(
        "❌ Invalid user ID:",
        userId
      );

      return;
    }

    try {
      await markAllNotificationsAsRead(
        userId
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      );
    } catch (error) {
      console.error(
        "❌ Failed to mark notifications as read:",
        error
      );
    }
  };

  // ==========================================================
  // TOGGLE NOTIFICATIONS
  // ==========================================================

  const handleNotificationClick = () => {
    setShowNotifications(
      (previous) => !previous
    );
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatNotificationDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    try {
      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return "";
      }

      return parsedDate.toLocaleString();
    } catch {
      return "";
    }
  };

  // ==========================================================
  // ADMIN AVATAR
  // ==========================================================

  const avatar =
    user?.profileImage ||
    user?.avatar ||
    user?.photo ||
    user?.photoURL ||
    null;

  // ==========================================================
  // ADMIN NAME
  // ==========================================================

  const adminName =
    user?.name ||
    user?.fullName ||
    "Administrator";

  // ==========================================================
  // ADMIN EMAIL
  // ==========================================================

  const adminEmail =
    user?.email || "";

  // ==========================================================
  // ADMIN INITIAL
  // ==========================================================

  const adminInitial =
    adminName &&
    typeof adminName === "string"
      ? adminName
          .charAt(0)
          .toUpperCase()
      : "A";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <div className="flex items-center gap-3">

          {/* MOBILE MENU */}
          {typeof onMenuClick ===
            "function" && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
              aria-label="Open menu"
            >
              ☰
            </button>
          )}

          {/* TITLE */}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-xs text-gray-500">
              BuyUKUsed Administration
            </p>
          </div>
        </div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="flex items-center gap-3">

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="relative">

            <button
              type="button"
              onClick={
                handleNotificationClick
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-white transition hover:bg-gray-50"
              aria-label="Notifications"
              aria-expanded={
                showNotifications
              }
              aria-haspopup="true"
            >
              <span
                aria-hidden="true"
                className="text-lg"
              >
                🔔
              </span>

              {/* UNREAD BADGE */}
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* =================================================
                NOTIFICATION DROPDOWN
            ================================================= */}

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border bg-white shadow-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-4 py-3">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-gray-500">
                      {unreadCount} unread
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllRead
                      }
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* =================================================
                    NOTIFICATION LIST
                ================================================= */}

                <div className="max-h-96 overflow-y-auto">

                  {/* LOADING */}
                  {notificationLoading && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  )}

                  {/* EMPTY */}
                  {!notificationLoading &&
                    notifications.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    )}

                  {/* NOTIFICATIONS */}
                  {!notificationLoading &&
                    notifications.length > 0 &&
                    notifications.map(
                      (
                        notification,
                        index
                      ) => {

                        /*
                         * Prefer the MongoDB _id.
                         * Fall back to id.
                         * Finally use a stable combination
                         * instead of Math.random().
                         */
                        const notificationId =
                          notification?._id ||
                          notification?.id ||
                          `notification-${index}-${notification?.createdAt || ""}`;

                        return (
                          <div
                            key={
                              notificationId
                            }
                            className={`border-b px-4 py-3 transition ${
                              notification?.isRead
                                ? "bg-white"
                                : "bg-blue-50"
                            }`}
                          >
                            <div className="flex gap-3">

                              {/* CONTENT */}
                              <div className="min-w-0 flex-1">

                                <p className="text-sm font-semibold text-gray-900">
                                  {notification?.title ||
                                    "Notification"}
                                </p>

                                <p className="mt-1 break-words text-sm text-gray-600">
                                  {notification?.message ||
                                    ""}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {formatNotificationDate(
                                    notification?.createdAt
                                  )}
                                </p>
                              </div>

                              {/* UNREAD DOT */}
                              {!notification?.isRead && (
                                <span
                                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"
                                  aria-label="Unread"
                                />
                              )}

                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              ADMIN USER
          ================================================= */}

          <div className="hidden items-center gap-2 sm:flex">

            {/* NAME + EMAIL */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {adminName}
              </p>

              {adminEmail && (
                <p className="max-w-48 truncate text-xs text-gray-500">
                  {adminEmail}
                </p>
              )}
            </div>

            {/* AVATAR */}
            {avatar ? (
              <img
                src={avatar}
                alt={adminName}
                className="h-9 w-9 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white"
                aria-label={adminName}
              >
                {adminInitial}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminHeader;