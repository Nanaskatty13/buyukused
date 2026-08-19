import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = ({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const menuItems = [
    {
      id: "dashboard",
      icon: "fa-chart-pie",
      label: "Dashboard",
    },

    {
      id: "users",
      icon: "fa-users",
      label: "Users",
    },

    // ─── NEW: Sellers management ──────────────────────────────
    {
      id: "sellers",
      icon: "fa-store",
      label: "Sellers",
    },

    {
      id: "riders",
      icon: "fa-motorcycle",
      label: "Riders",
    },

    {
      id: "products",
      icon: "fa-box",
      label: "Products",
    },

    {
      id: "reports",
      icon: "fa-chart-line",
      label: "Reports",
    },

    {
      id: "settings",
      icon: "fa-gear",
      label: "Settings",
    },
  ];

  return (
    <>
      <div
        className={`admin-sidebar ${
          !sidebarOpen
            ? "collapsed"
            : ""
        }`}
      >
        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="sidebar-brand">

          <i className="fas fa-tag logo-icon"></i>

          <div className="brand-text">
            KN <span>Ads</span>

            <span className="brand-sub">
              Admin Panel
            </span>
          </div>

        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav className="sidebar-nav">

          {menuItems.map(
            (item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${
                  activePage ===
                  item.id
                    ? "active"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();

                  setActivePage(
                    item.id
                  );
                }}
              >
                <i
                  className={`fas ${item.icon}`}
                ></i>

                <span>
                  {item.label}
                </span>
              </a>
            )
          )}

        </nav>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="sidebar-footer">

          <Link
            to="/"
            className="back-to-site"
          >
            <i className="fas fa-arrow-left"></i>

            <span>
              Back to Site
            </span>
          </Link>

        </div>

      </div>

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      <div
        className={`sidebar-overlay ${
          !sidebarOpen
            ? "active"
            : ""
        }`}
        onClick={() =>
          setSidebarOpen(true)
        }
      ></div>
    </>
  );
};

export default AdminSidebar;