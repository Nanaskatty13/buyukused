// ============================================================
// frontend/src/components/Navbar.jsx
// BuyUKUsed - Fixed Responsive Navbar
// ============================================================

import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getAdminNotifications } from "../services/api";

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  } catch {
    return null;
  }
};

// ============================================================
// API URL
// ============================================================

const getApiUrl = () => {
  try {
    const value = import.meta.env.VITE_API_URL;

    if (!value) {
      return "http://localhost:5000";
    }

    return String(value).replace(/\/+$/, "");
  } catch {
    return "http://localhost:5000";
  }
};

// ============================================================
// SAFE NUMBER
// ============================================================

const safeCount = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }

  return Math.floor(number);
};

// ============================================================
// BADGE
// ============================================================

const Badge = ({ count }) => {
  const value = safeCount(count);

  if (value <= 0) {
    return null;
  }

  return (
    <span className="navbar-badge">
      {value > 99 ? "99+" : value}
    </span>
  );
};

// ============================================================
// NAVBAR
// ============================================================

const Navbar = () => {
  const { user, logout } = useAuth();
  const { favorites = [] } = useCart();

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const [mobileDropdownOpen, setMobileDropdownOpen] =
    useState(false);

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [unreadMessages, setUnreadMessages] =
    useState(0);

  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(target)
      ) {
        setMobileDropdownOpen(false);
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

  // ==========================================================
  // CLOSE DROPDOWNS WHEN ROUTE CHANGES
  // ==========================================================

  useEffect(() => {
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  }, [location.pathname]);

  // ==========================================================
  // FETCH UNREAD COUNTS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const resetCounts = () => {
      if (cancelled) return;

      setUnreadNotifications(0);
      setUnreadMessages(0);
    };

    if (!user) {
      resetCounts();
      return;
    }

    const fetchCounts = async () => {
      if (cancelled) return;

      const token = getToken();

      if (!token) {
        resetCounts();
        return;
      }

      const apiUrl = getApiUrl();

      // ========================================================
      // NOTIFICATIONS
      // ========================================================

      let notificationCount = 0;

      // --------------------------------------------------------
      // ADMIN NOTIFICATIONS
      // --------------------------------------------------------

      if (user.role === "admin") {
        try {
          const data =
            await getAdminNotifications(token);

          const notifications =
            data?.notifications ||
            data?.data ||
            [];

          if (Array.isArray(notifications)) {
            notificationCount =
              notifications.filter(
                (notification) =>
                  notification &&
                  !notification.isRead
              ).length;
          }
        } catch (error) {
          console.warn(
            "Admin notification count failed:",
            error?.message || error
          );
        }
      }

      // --------------------------------------------------------
      // NORMAL USER NOTIFICATIONS
      // --------------------------------------------------------
      //
      // If your backend exposes:
      // GET /api/notifications/unread-count
      //
      // the navbar will automatically use it.
      //
      // If that endpoint is unavailable, the navbar safely
      // keeps the notification count at zero.
      // --------------------------------------------------------

      try {
        const response = await fetch(
          `${apiUrl}/api/notifications/unread-count`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          const apiCount =
            data?.count ??
            data?.unreadCount ??
            data?.unread ??
            data?.totalUnread;

          if (
            apiCount !== undefined &&
            apiCount !== null
          ) {
            notificationCount = safeCount(apiCount);
          }
        }
      } catch (error) {
        // Do not allow notification failure
        // to break the navbar.
      }

      if (!cancelled) {
        setUnreadNotifications(
          notificationCount
        );
      }

      // ========================================================
      // MESSAGES
      // ========================================================

      try {
        const response = await fetch(
          `${apiUrl}/api/messages/unread-count`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setUnreadMessages(0);
          }

          return;
        }

        const data = await response.json();

        const messageCount =
          data?.count ??
          data?.unreadCount ??
          data?.unread ??
          data?.totalUnread ??
          0;

        if (!cancelled) {
          setUnreadMessages(
            safeCount(messageCount)
          );
        }
      } catch (error) {
        if (!cancelled) {
          setUnreadMessages(0);
        }
      }
    };

    fetchCounts();

    // Refresh every 30 seconds.
    const interval = setInterval(
      fetchCounts,
      30000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn(
        "Logout error:",
        error?.message || error
      );
    } finally {
      setDropdownOpen(false);
      setMobileDropdownOpen(false);
      navigate("/");
    }
  };

  // ==========================================================
  // DROPDOWNS
  // ==========================================================

  const toggleDropdown = () => {
    setDropdownOpen(
      (previous) => !previous
    );

    setMobileDropdownOpen(false);
  };

  const toggleMobileDropdown = () => {
    setMobileDropdownOpen(
      (previous) => !previous
    );

    setDropdownOpen(false);
  };

  // ==========================================================
  // USER INITIAL
  // ==========================================================

  const userInitial =
    user?.name
      ?.charAt(0)
      ?.toUpperCase() || "U";

  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  const getProfileImage = () => {
    if (!user) {
      return null;
    }

    const image =
      user.profileImage ||
      user.photo ||
      user.avatar ||
      user.picture;

    if (!image) {
      return null;
    }

    if (
      typeof image === "string" &&
      /^https?:\/\//i.test(image)
    ) {
      return image;
    }

    if (typeof image !== "string") {
      return null;
    }

    const base = getApiUrl();

    if (image.startsWith("/")) {
      return `${base}${image}`;
    }

    return `${base}/${image}`;
  };

  const profileImageUrl =
    getProfileImage();

  // ==========================================================
  // FAVORITES
  // ==========================================================

  const favoriteCount = Array.isArray(
    favorites
  )
    ? favorites.length
    : 0;

  const handleHeartClick = (event) => {
    if (!user) {
      event.preventDefault();

      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <style>
        {`
          /* =====================================================
             FIXED NAVBAR
          ===================================================== */

          .navbar-sticky {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;

            width: 100% !important;

            min-width: 0;

            z-index: 99999 !important;

            box-sizing: border-box;

            background: rgba(255, 255, 255, 0.96);

            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);

            border-bottom:
              1px solid rgba(229, 231, 235, 0.8);

            box-shadow:
              0 2px 10px rgba(0, 0, 0, 0.05);

            isolation: isolate;
          }

          /* =====================================================
             NAVBAR CONTAINER
          ===================================================== */

          .navbar-container {
            width: 100%;

            max-width: 1280px;

            margin: 0 auto;

            padding: 8px 16px;

            min-height: 46px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            box-sizing: border-box;
          }

          /* =====================================================
             LOGO
          ===================================================== */

          .navbar-logo {
            font-size: 20px;

            font-weight: 800;

            color: #0055a5;

            text-decoration: none;

            display: flex;

            align-items: center;

            gap: 6px;

            flex-shrink: 1;

            min-width: 0;

            white-space: nowrap;
          }

          .navbar-logo i {
            font-size: 18px;
          }

          /* =====================================================
             START SELLING
          ===================================================== */

          .navbar-post-ad-btn {
            flex-shrink: 0;
          }

          .navbar-post-ad-text {
            display: inline;
          }

          /* =====================================================
             AVATAR
          ===================================================== */

          .navbar-avatar {
            width: 28px;
            height: 28px;

            border-radius: 50%;

            background: #0055a5;

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

            font-weight: 700;

            font-size: 12px;

            position: relative;

            overflow: hidden;

            flex-shrink: 0;
          }

          /* =====================================================
             RIGHT SIDE
          ===================================================== */

          .navbar-right {
            display: flex;

            align-items: center;

            gap: 12px;

            flex-shrink: 0;

            min-width: 0;
          }

          /* =====================================================
             ICON BUTTONS
          ===================================================== */

          .navbar-heart,
          .navbar-bell,
          .navbar-envelope {
            position: relative;

            width: 24px;
            height: 24px;

            color: #475569;

            text-decoration: none;

            display: flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;

            font-size: 18px;

            line-height: 1;

            transition:
              color 0.2s ease,
              transform 0.2s ease;
          }

          .navbar-heart:hover,
          .navbar-bell:hover,
          .navbar-envelope:hover {
            color: #0055a5;

            transform: translateY(-1px);
          }

          /* =====================================================
             UNREAD BADGE
          ===================================================== */

          .navbar-badge {
            position: absolute;

            top: -8px;
            right: -8px;

            min-width: 16px;
            height: 16px;

            padding: 0 4px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #e74c3c;

            color: white;

            border: 2px solid white;

            border-radius: 9999px;

            font-size: 9px;

            font-weight: 800;

            line-height: 1;

            box-sizing: border-box;

            pointer-events: none;
          }

          /* =====================================================
             DROPDOWN
          ===================================================== */

          .navbar-dropdown {
            animation:
              dropdownFade 0.18s ease;
          }

          @keyframes dropdownFade {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* =====================================================
             DESKTOP ONLY
          ===================================================== */

          .desktop-only {
            display: inline-block;
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 1024px) {
            .navbar-container {
              padding: 8px 12px;
              gap: 8px;
            }

            .navbar-logo {
              font-size: 18px;
            }

            .navbar-logo i {
              font-size: 16px;
            }

            .navbar-right {
              gap: 10px;
            }
          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 767px) {
            .navbar-container {
              min-height: 42px;

              padding:
                6px 10px;

              gap: 6px;
            }

            .navbar-logo {
              font-size: 17px;

              gap: 4px;
            }

            .navbar-logo i {
              font-size: 15px;
            }

            .navbar-post-ad-btn {
              padding:
                4px 9px !important;

              font-size:
                10px !important;
            }

            .navbar-post-ad-text {
              display: none !important;
            }

            .navbar-right {
              gap: 9px;
            }

            .navbar-heart,
            .navbar-bell,
            .navbar-envelope {
              width: 21px;
              height: 21px;

              font-size: 15px;
            }

            .navbar-avatar {
              width: 23px;
              height: 23px;

              font-size: 9px;
            }

            .navbar-badge {
              top: -6px;
              right: -6px;

              min-width: 13px;
              height: 13px;

              padding:
                0 3px;

              font-size: 7px;

              border-width: 1.5px;
            }

            .desktop-only {
              display: none !important;
            }
          }

          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 480px) {
            .navbar-container {
              min-height: 39px;

              padding:
                5px 7px;

              gap: 4px;
            }

            .navbar-logo {
              font-size: 15px;

              gap: 3px;
            }

            .navbar-logo i {
              font-size: 13px;
            }

            .navbar-post-ad-btn {
              padding:
                3px 7px !important;

              font-size:
                9px !important;
            }

            .navbar-right {
              gap: 7px;
            }

            .navbar-heart,
            .navbar-bell,
            .navbar-envelope {
              width: 19px;
              height: 19px;

              font-size: 13px;
            }

            .navbar-avatar {
              width: 20px;
              height: 20px;

              font-size: 8px;
            }

            .navbar-badge {
              top: -5px;
              right: -5px;

              min-width: 11px;
              height: 11px;

              padding:
                0 2px;

              font-size: 6px;
            }
          }

          /* =====================================================
             VERY SMALL MOBILE
          ===================================================== */

          @media (max-width: 360px) {
            .navbar-container {
              padding:
                4px 5px;
            }

            .navbar-logo {
              font-size: 14px;
            }

            .navbar-logo i {
              font-size: 12px;
            }

            .navbar-post-ad-btn {
              padding:
                3px 5px !important;
            }

            .navbar-right {
              gap: 5px;
            }

            .navbar-heart,
            .navbar-bell,
            .navbar-envelope {
              width: 18px;
              height: 18px;

              font-size: 12px;
            }

            .navbar-avatar {
              width: 19px;
              height: 19px;
            }
          }

          /* =====================================================
             REDUCE MOTION
          ===================================================== */

          @media (prefers-reduced-motion: reduce) {
            .navbar-dropdown {
              animation: none;
            }

            .navbar-heart,
            .navbar-bell,
            .navbar-envelope {
              transition: none;
            }
          }
        `}
      </style>

      {/* ========================================================
          FIXED HEADER
      ======================================================== */}

      <header className="navbar-sticky">
        <div className="navbar-container">

          {/* ====================================================
              LOGO
          ==================================================== */}

          <Link
            to="/"
            className="navbar-logo"
            aria-label="BuyUKUsed home"
          >
            <i className="fas fa-tag" />

            <span>
              BuyUk{" "}
              <span
                style={{
                  color: "#2ecc71",
                }}
              >
                Used
              </span>
            </span>
          </Link>

          {/* ====================================================
              START SELLING
          ==================================================== */}

          <Link
            to="/post-ad"
            className="navbar-post-ad-btn"
            style={{
              background: "#2ecc71",
              color: "white",
              padding: "6px 16px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition:
                "all 0.2s ease",
              boxShadow:
                "0 2px 4px rgba(46, 204, 113, 0.3)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                "#27ae60";

              event.currentTarget.style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "#2ecc71";

              event.currentTarget.style.transform =
                "translateY(0)";
            }}
          >
            <i
              className="fas fa-plus-circle"
              style={{
                fontSize: "13px",
              }}
            />

            <span className="navbar-post-ad-text">
              Start Selling
            </span>
          </Link>

          {/* ====================================================
              RIGHT SIDE
          ==================================================== */}

          <div className="navbar-right">

            {/* ==================================================
                FAVORITES
            ================================================== */}

            <Link
              to="/wishlist"
              onClick={handleHeartClick}
              className="navbar-heart"
              aria-label={`Favorites${
                favoriteCount > 0
                  ? `, ${favoriteCount} saved`
                  : ""
              }`}
              title="Favorites"
            >
              <i className="fas fa-heart" />

              <Badge count={favoriteCount} />
            </Link>

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            {user && (
              <Link
                to="/notifications"
                className="navbar-bell"
                aria-label={`Notifications${
                  unreadNotifications > 0
                    ? `, ${unreadNotifications} unread`
                    : ""
                }`}
                title="Notifications"
              >
                <i className="fas fa-bell" />

                <Badge
                  count={unreadNotifications}
                />
              </Link>
            )}

            {/* ==================================================
                MESSAGES
            ================================================== */}

            {user && (
              <Link
                to="/messages"
                className="navbar-envelope"
                aria-label={`Messages${
                  unreadMessages > 0
                    ? `, ${unreadMessages} unread`
                    : ""
                }`}
                title="Messages"
              >
                <i className="fas fa-envelope" />

                <Badge
                  count={unreadMessages}
                />
              </Link>
            )}

            {/* ==================================================
                LOGGED-IN USER
            ================================================== */}

            {user ? (
              <div
                ref={dropdownRef}
                style={{
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* USER BUTTON */}

                <div
                  onClick={toggleDropdown}
                  role="button"
                  tabIndex={0}
                  aria-expanded={dropdownOpen}
                  aria-label="Open account menu"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: "4px 7px",
                    borderRadius: "9999px",
                    background:
                      "rgba(241, 245, 249, 0.8)",
                    border:
                      "1px solid transparent",
                    transition:
                      "all 0.2s ease",
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      toggleDropdown();
                    }
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "#f1f5f9";

                    event.currentTarget.style.borderColor =
                      "#e2e8f0";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background =
                      "rgba(241, 245, 249, 0.8)";

                    event.currentTarget.style.borderColor =
                      "transparent";
                  }}
                >
                  {/* AVATAR */}

                  <div className="navbar-avatar">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={
                          user.name || "User"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      userInitial
                    )}

                    {user.role === "admin" && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          background:
                            "#f59e0b",
                          color: "white",
                          fontSize: "7px",
                          fontWeight: 700,
                          borderRadius: "50%",
                          padding: "1px 3px",
                          border:
                            "1px solid white",
                        }}
                      >
                        ★
                      </span>
                    )}
                  </div>

                  {/* USER NAME */}

                  <span
                    className="desktop-only"
                    style={{
                      fontSize: "13px",
                      color: "#334155",
                      fontWeight: 500,
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name}
                  </span>

                  {/* ARROW */}

                  <i
                    className={`desktop-only fas fa-chevron-${
                      dropdownOpen
                        ? "up"
                        : "down"
                    }`}
                    style={{
                      fontSize: "9px",
                      color: "#94a3b8",
                    }}
                  />
                </div>

                {/* =================================================
                    USER DROPDOWN
                ================================================= */}

                {dropdownOpen && (
                  <div
                    className="navbar-dropdown"
                    style={{
                      position: "absolute",
                      top:
                        "calc(100% + 8px)",
                      right: 0,
                      minWidth: "190px",
                      background:
                        "rgba(255, 255, 255, 0.98)",
                      backdropFilter:
                        "blur(14px)",
                      WebkitBackdropFilter:
                        "blur(14px)",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow:
                        "0 10px 35px rgba(0,0,0,0.14)",
                      padding: "4px 0",
                      zIndex: 100000,
                    }}
                  >
                    <Link
                      to="/post-ad"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        color: "#2ecc71",
                        fontWeight: 600,
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      <i className="fas fa-plus-circle" />
                      SELL
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        color: "#334155",
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      <i className="fas fa-user" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-ads"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        color: "#334155",
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      <i className="fas fa-box" />
                      My Ads
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        color: "#334155",
                        fontSize: "13px",
                        textDecoration: "none",
                      }}
                    >
                      <i className="fas fa-heart" />
                      Favorites

                      {favoriteCount > 0 && (
                        <span
                          style={{
                            marginLeft: "auto",
                            color: "#e74c3c",
                            fontWeight: 700,
                          }}
                        >
                          {favoriteCount}
                        </span>
                      )}
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() =>
                          setDropdownOpen(false)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 14px",
                          color: "#334155",
                          fontSize: "13px",
                          textDecoration: "none",
                        }}
                      >
                        <i className="fas fa-user-shield" />
                        Admin Dashboard
                      </Link>
                    )}

                    <hr
                      style={{
                        margin: "4px 0",
                        border: "none",
                        borderTop:
                          "1px solid #e5e7eb",
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "9px 14px",
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        fontSize: "13px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <i className="fas fa-sign-out-alt" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (

              /* ==================================================
                 LOGGED OUT
              ================================================== */

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {/* DESKTOP LOGIN */}

                <Link
                  to="/login"
                  className="desktop-only"
                  style={{
                    border:
                      "1px solid #0055a5",
                    color: "#0055a5",
                    padding: "4px 10px",
                    borderRadius:
                      "9999px",
                    fontWeight: 600,
                    fontSize: "12px",
                    textDecoration:
                      "none",
                  }}
                >
                  Log In
                </Link>

                {/* DESKTOP REGISTER */}

                <Link
                  to="/register"
                  className="desktop-only"
                  style={{
                    background: "#0055a5",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius:
                      "9999px",
                    fontWeight: 600,
                    fontSize: "12px",
                    textDecoration:
                      "none",
                  }}
                >
                  Sign Up
                </Link>

                {/* MOBILE ACCOUNT MENU */}

                <div
                  ref={mobileDropdownRef}
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    onClick={
                      toggleMobileDropdown
                    }
                    role="button"
                    tabIndex={0}
                    aria-expanded={
                      mobileDropdownOpen
                    }
                    aria-label="Open account menu"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "3px",
                      borderRadius:
                        "9999px",
                      background:
                        "rgba(241, 245, 249, 0.8)",
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        toggleMobileDropdown();
                      }
                    }}
                  >
                    <div className="navbar-avatar">
                      <i className="fas fa-user" />
                    </div>
                  </div>

                  {/* MOBILE DROPDOWN */}

                  {mobileDropdownOpen && (
                    <div
                      className="navbar-dropdown"
                      style={{
                        position: "absolute",
                        top:
                          "calc(100% + 8px)",
                        right: 0,
                        minWidth: "180px",
                        background:
                          "rgba(255, 255, 255, 0.98)",
                        backdropFilter:
                          "blur(14px)",
                        WebkitBackdropFilter:
                          "blur(14px)",
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "12px",
                        boxShadow:
                          "0 10px 35px rgba(0,0,0,0.14)",
                        padding: "4px 0",
                        zIndex: 100000,
                      }}
                    >
                      <Link
                        to="/wishlist"
                        onClick={() =>
                          setMobileDropdownOpen(
                            false
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                          padding:
                            "9px 14px",
                          color: "#334155",
                          fontSize: "13px",
                          textDecoration:
                            "none",
                        }}
                      >
                        <i className="fas fa-heart" />

                        Favorites

                        {favoriteCount > 0 && (
                          <span
                            style={{
                              marginLeft:
                                "auto",
                              color:
                                "#e74c3c",
                              fontWeight: 700,
                            }}
                          >
                            {favoriteCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/login"
                        onClick={() =>
                          setMobileDropdownOpen(
                            false
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                          padding:
                            "9px 14px",
                          color:
                            "#0055a5",
                          fontSize: "13px",
                          textDecoration:
                            "none",
                        }}
                      >
                        <i className="fas fa-sign-in-alt" />
                        Log In
                      </Link>

                      <Link
                        to="/register"
                        onClick={() =>
                          setMobileDropdownOpen(
                            false
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                          padding:
                            "9px 14px",
                          color:
                            "#0055a5",
                          fontSize: "13px",
                          textDecoration:
                            "none",
                        }}
                      >
                        <i className="fas fa-user-plus" />
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;