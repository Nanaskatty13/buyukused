// frontend/src/pages/Admin/components/AdminHeader.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { useAuth } from "../../../context/AuthContext";

import {
  getAdminNotifications,
  markNotificationRead,
} from "../../../services/api";

const AdminHeader = ({
  activePage,
  sidebarOpen,
  setSidebarOpen,
  onRefresh,
  onSearch,
  searchTerm,
}) => {
  const {
    user,
    token,
    logout,
  } = useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    showUserMenu,
    setShowUserMenu,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const notificationRef =
    useRef(null);

  const userMenuRef =
    useRef(null);

  // ============================================================
  // FETCH ADMIN NOTIFICATIONS
  // ============================================================

  const fetchNotifications =
    useCallback(async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);

        console.log(
          "🔔 Fetching admin notifications..."
        );

        // ─── FIXED: Use admin-specific endpoint ───
        const data =
          await getAdminNotifications(token);

        console.log(
          "✅ Admin notifications:",
          data
        );

        setNotifications(
          Array.isArray(
            data?.notifications
          )
            ? data.notifications
            : []
        );
      } catch (err) {
        console.error(
          "❌ Error fetching notifications:",
          err
        );

        if (
          err?.status === 401 ||
          err?.status === 403
        ) {
          console.warn(
            "⚠️ Notification endpoint rejected the current token."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [token]);

  // ============================================================
  // INITIAL NOTIFICATION LOAD
  // ============================================================

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
  }, [
    token,
    fetchNotifications,
  ]);

  // ============================================================
  // AUTO REFRESH
  // ============================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    const interval =
      setInterval(() => {
        fetchNotifications();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [
    token,
    fetchNotifications,
  ]);

  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  const handleMarkAsRead =
    async (id) => {
      if (!token || !id) {
        return;
      }

      try {
        await markNotificationRead(
          id,
          token
        );

        setNotifications(
          (prev) =>
            prev.map((notification) =>
              notification._id === id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
            )
        );
      } catch (err) {
        console.error(
          "❌ Error marking notification as read:",
          err
        );
      }
    };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllRead =
    async () => {
      if (!token) {
        return;
      }

      const unread =
        notifications.filter(
          (notification) =>
            !notification.read
        );

      if (unread.length === 0) {
        return;
      }

      try {
        await Promise.all(
          unread.map(
            (notification) =>
              markNotificationRead(
                notification._id,
                token
              )
          )
        );

        setNotifications(
          (prev) =>
            prev.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
        );
      } catch (err) {
        console.error(
          "❌ Error marking all notifications as read:",
          err
        );
      }
    };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout =
    async () => {
      setShowUserMenu(false);

      try {
        await logout();
      } catch (err) {
        console.error(
          "Logout error:",
          err
        );
      }
    };

  // ============================================================
  // CLICK OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setShowNotifications(false);
        }

        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(
            event.target
          )
        ) {
          setShowUserMenu(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // UNREAD COUNT
  // ============================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // ============================================================
  // PAGE TITLE
  // ============================================================

  const pageTitle =
    activePage
      ? activePage
          .charAt(0)
          .toUpperCase() +
        activePage.slice(1)
      : "Dashboard";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <header
      className="admin-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        padding: "12px 24px",
        background: "white",
        borderBottom:
          "1px solid var(--gray-200)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {/* ======================================================
          LEFT SIDE
      ====================================================== */}

      <div
        className="header-left"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen
            ? "✕"
            : "☰"}
        </button>

        {/* Page title */}
        <span
          style={{
            fontWeight: 600,
            fontSize: "16px",
            color:
              "var(--gray-600)",
          }}
        >
          {pageTitle}
        </span>

        {/* Search */}
        {onSearch && (
          <input
            type="text"
            placeholder="Search..."
            value={
              searchTerm || ""
            }
            onChange={(event) =>
              onSearch(
                event.target.value
              )
            }
            className="search-input"
            style={{
              padding:
                "8px 14px",
              border:
                "1.5px solid var(--gray-200)",
              borderRadius:
                "var(--radius-md)",
              fontSize: "14px",
              width: "200px",
            }}
          />
        )}

        {/* Refresh */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              padding:
                "6px 14px",
              background:
                "var(--gray-100)",
              border:
                "1px solid var(--gray-200)",
              borderRadius:
                "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "14px",
            }}
            aria-label="Refresh"
          >
            🔄
          </button>
        )}
      </div>

      {/* ======================================================
          RIGHT SIDE
      ====================================================== */}

      <div
        className="header-right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* ====================================================
            NOTIFICATIONS
        ==================================================== */}

        <div
          ref={notificationRef}
          style={{
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (prev) => !prev
              )
            }
            style={{
              position:
                "relative",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
            }}
            aria-label="Notifications"
          >
            🔔

            {unreadCount > 0 && (
              <span
                style={{
                  position:
                    "absolute",
                  top: "-6px",
                  right: "-6px",
                  background:
                    "#dc2626",
                  color: "white",
                  borderRadius:
                    "50%",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding:
                    "2px 6px",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  boxShadow:
                    "0 2px 4px rgba(220,38,38,0.3)",
                }}
              >
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="notification-dropdown"
              style={{
                position:
                  "absolute",
                top:
                  "calc(100% + 8px)",
                right: 0,
                width: "360px",
                maxHeight: "400px",
                background: "white",
                borderRadius:
                  "var(--radius-md)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.15)",
                border:
                  "1px solid var(--gray-200)",
                overflow:
                  "hidden",
                zIndex: 1000,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  padding:
                    "12px 16px",
                  borderBottom:
                    "1px solid var(--gray-200)",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  Notifications
                </span>

                {unreadCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      handleMarkAllRead
                    }
                    style={{
                      background:
                        "none",
                      border: "none",
                      color:
                        "var(--primary)",
                      fontSize:
                        "12px",
                      cursor:
                        "pointer",
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div
                style={{
                  overflowY:
                    "auto",
                  maxHeight:
                    "340px",
                }}
              >
                {loading ? (
                  <div
                    style={{
                      padding:
                        "20px",
                      textAlign:
                        "center",
                      color:
                        "var(--gray-400)",
                    }}
                  >
                    Loading...
                  </div>
                ) : notifications.length ===
                  0 ? (
                  <div
                    style={{
                      padding:
                        "20px",
                      textAlign:
                        "center",
                      color:
                        "var(--gray-400)",
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map(
                    (notif) => (
                      <div
                        key={
                          notif._id
                        }
                        onClick={() =>
                          handleMarkAsRead(
                            notif._id
                          )
                        }
                        style={{
                          padding:
                            "12px 16px",
                          borderBottom:
                            "1px solid var(--gray-100)",
                          cursor:
                            "pointer",
                          background:
                            notif.read
                              ? "white"
                              : "#f0f7ff",
                          transition:
                            "background 0.2s",
                        }}
                        onMouseEnter={(
                          event
                        ) => {
                          event.currentTarget.style.background =
                            notif.read
                              ? "var(--gray-50)"
                              : "#e8f0fe";
                        }}
                        onMouseLeave={(
                          event
                        ) => {
                          event.currentTarget.style.background =
                            notif.read
                              ? "white"
                              : "#f0f7ff";
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "13px",
                            color:
                              "var(--gray-800)",
                          }}
                        >
                          {
                            notif.message
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "var(--gray-400)",
                            marginTop:
                              "4px",
                          }}
                        >
                          {notif.createdAt
                            ? new Date(
                                notif.createdAt
                              ).toLocaleDateString()
                            : ""}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* ====================================================
            USER MENU
        ==================================================== */}

        <div
          ref={userMenuRef}
          style={{
            position:
              "relative",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowUserMenu(
                (prev) => !prev
              )
            }
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding:
                "4px 8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius:
                  "50%",
                background:
                  "var(--primary)",
                color: "white",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "A"}
            </div>

            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color:
                  "var(--gray-700)",
              }}
            >
              {user?.name ||
                "Admin"}
            </span>
          </button>

          {showUserMenu && (
            <div
              style={{
                position:
                  "absolute",
                top:
                  "calc(100% + 8px)",
                right: 0,
                width: "200px",
                background:
                  "white",
                borderRadius:
                  "var(--radius-md)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.15)",
                border:
                  "1px solid var(--gray-200)",
                overflow:
                  "hidden",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "8px",
                }}
              >
                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    width: "100%",
                    padding:
                      "8px 12px",
                    textAlign:
                      "left",
                    background:
                      "none",
                    border: "none",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    fontSize:
                      "14px",
                    borderRadius:
                      "var(--radius-sm)",
                    color:
                      "var(--gray-700)",
                  }}
                >
                  👤 Profile
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    width: "100%",
                    padding:
                      "8px 12px",
                    textAlign:
                      "left",
                    background:
                      "none",
                    border: "none",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    fontSize:
                      "14px",
                    borderRadius:
                      "var(--radius-sm)",
                    color:
                      "var(--gray-700)",
                  }}
                >
                  ⚙️ Settings
                </button>

                <hr
                  style={{
                    margin:
                      "4px 0",
                    borderColor:
                      "var(--gray-100)",
                  }}
                />

                {/* Logout */}
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  style={{
                    width: "100%",
                    padding:
                      "8px 12px",
                    textAlign:
                      "left",
                    background:
                      "none",
                    border: "none",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    fontSize:
                      "14px",
                    borderRadius:
                      "var(--radius-sm)",
                    color:
                      "#dc2626",
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;