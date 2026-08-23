// ============================================================
// frontend/src/components/AdminHeader.jsx
// BuyUKUsed - Admin Header
// ============================================================

import React, {
  useEffect,
  useState,
} from "react";

import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";

const AdminHeader = ({
  onMenuClick,
}) => {
  const {
    user,
  } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  // ==========================================================
  // GET REAL USER ID
  // ==========================================================

  const userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    null;

  // ==========================================================
  // FETCH ADMIN NOTIFICATIONS
  // ==========================================================

  const fetchNotifications =
    async () => {
      if (!userId) {
        console.warn(
          "⚠️ Cannot fetch notifications: user ID is missing"
        );

        return;
      }

      try {
        setNotificationLoading(true);

        console.log(
          "🔔 Fetching admin notifications for user:",
          userId
        );

        const response =
          await getNotifications(
            userId
          );

        console.log(
          "🔔 Admin notifications response:",
          response
        );

        const notificationList =
          response?.notifications ||
          response?.data?.notifications ||
          [];

        setNotifications(
          Array.isArray(
            notificationList
          )
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
        setNotificationLoading(
          false
        );
      }
    };

  // ==========================================================
  // LOAD WHEN USER IS AVAILABLE
  // ==========================================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    fetchNotifications();

    const interval =
      setInterval(
        fetchNotifications,
        30000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [userId]);

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.isRead !== true
    ).length;

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllRead =
    async () => {
      if (!userId) {
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

  const handleNotificationClick =
    () => {
      setShowNotifications(
        (previous) =>
          !previous
      );
    };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatNotificationDate =
    (date) => {
      if (!date) {
        return "";
      }

      try {
        return new Date(
          date
        ).toLocaleString();
      } catch {
        return "";
      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              ☰
            </button>
          )}

          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-xs text-gray-500">
              BuyUKUsed Administration
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* NOTIFICATIONS */}
          <div className="relative">

            <button
              type="button"
              onClick={
                handleNotificationClick
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-white hover:bg-gray-50"
              aria-label="Notifications"
            >
              🔔

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-xl border bg-white shadow-xl">

                <div className="flex items-center justify-between border-b px-4 py-3">

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-gray-500">
                      {unreadCount} unread
                    </p>
                  </div>

                  {unreadCount >
                    0 && (
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

                <div className="max-h-96 overflow-y-auto">

                  {notificationLoading && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  )}

                  {!notificationLoading &&
                    notifications.length ===
                      0 && (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    )}

                  {!notificationLoading &&
                    notifications.map(
                      (
                        notification
                      ) => (
                        <div
                          key={
                            notification._id ||
                            notification.id
                          }
                          className={`border-b px-4 py-3 ${
                            notification.isRead
                              ? "bg-white"
                              : "bg-blue-50"
                          }`}
                        >
                          <div className="flex gap-3">

                            <div className="flex-1">

                              <p className="text-sm font-semibold text-gray-900">
                                {
                                  notification.title
                                }
                              </p>

                              <p className="mt-1 text-sm text-gray-600">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {formatNotificationDate(
                                  notification.createdAt
                                )}
                              </p>

                            </div>

                            {!notification.isRead && (
                              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                            )}

                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
          </div>

          {/* ADMIN USER */}
          <div className="hidden items-center gap-2 sm:flex">

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name ||
                  "Administrator"}
              </p>

              <p className="text-xs text-gray-500">
                {user?.email || ""}
              </p>
            </div>

            {user?.profileImage ||
            user?.avatar ? (
              <img
                src={
                  user.profileImage ||
                  user.avatar
                }
                alt={
                  user.name ||
                  "Admin"
                }
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                {(
                  user?.name ||
                  "A"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminHeader;