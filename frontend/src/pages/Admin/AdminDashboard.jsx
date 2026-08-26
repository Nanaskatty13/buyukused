import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "../../context/AuthContext";

// ─── Components ──────────────────────────────────────────────
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import StatsCards from "./components/StatsCards";
import UsersTable from "./components/UsersTable";
import ProductsTable from "./components/ProductsTable";
import RidersTable from "./components/RidersTable";
import ReportsChart from "./components/ReportsChart";
import Settings from "./components/Settings";
import Toast from "./components/Toast";
import RecentProducts from "./components/RecentProducts";

// ─── Seller Management ──────────────────────────────────────
import Sellers from "../../admin/Sellers";

// ─── API ──────────────────────────────────────────────────────
// IMPORTANT:
// Use the ADMIN endpoints for the admin dashboard instead of
// the regular user/product endpoints.
import {
  getAdminProducts,
  getAdminUsers,
  getAdminDashboardStats,
  getRiders,
  getUnverifiedSellers,
  verifySeller,
} from "../../services/api";

import "./styles/admin.css";

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {
  const { user, token } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [activePage, setActivePage] =
    useState("dashboard");

  const [stats, setStats] = useState({});

  const [products, setProducts] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [riders, setRiders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [notification, setNotification] =
    useState(null);

  const [error, setError] =
    useState("");

  // ==========================================================
  // SELLER VERIFICATION STATE
  // ==========================================================

  const [
    unverifiedSellers,
    setUnverifiedSellers,
  ] = useState([]);

  const [verifying, setVerifying] =
    useState({});

  // ==========================================================
  // TOAST
  // ==========================================================

  const showNotification =
    useCallback(
      (
        message,
        type = "success"
      ) => {
        setNotification({
          message,
          type,
        });
      },
      []
    );

  // ==========================================================
  // FETCH ADMIN DATA
  // ==========================================================

  const fetchData =
    useCallback(async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        console.log(
          "🔐 Loading admin dashboard..."
        );

        console.log(
          "👤 Admin:",
          user?.email
        );

        // IMPORTANT:
        // These are ADMIN endpoints.
        const [
          productsData,
          usersData,
          statsData,
          ridersData,
          unverifiedData,
        ] = await Promise.all([
          getAdminProducts(
            {
              limit: 50,
            },
            token
          ),

          getAdminUsers(
            {},
            token
          ),

          getAdminDashboardStats(
            token
          ),

          getRiders(
            {},
            token
          ),

          getUnverifiedSellers(
            token
          ),
        ]);

        console.log(
          "📦 Admin products response:",
          productsData
        );

        console.log(
          "👥 Admin users response:",
          usersData
        );

        console.log(
          "📊 Admin stats response:",
          statsData
        );

        console.log(
          "🏍️ Admin riders response:",
          ridersData
        );

        console.log(
          "🏪 Unverified sellers response:",
          unverifiedData
        );

        // ======================================================
        // PRODUCTS
        // ======================================================

        setProducts(
          productsData?.products ||
            productsData?.data ||
            []
        );

        // ======================================================
        // USERS
        // ======================================================

        setUsers(
          usersData?.users ||
            usersData?.data ||
            []
        );

        // ======================================================
        // STATS
        // ======================================================

        setStats(
          statsData?.stats ||
            statsData?.data ||
            statsData ||
            {}
        );

        // ======================================================
        // RIDERS
        // ======================================================

        setRiders(
          ridersData?.riders ||
            ridersData?.users ||
            ridersData?.data ||
            []
        );

        // ======================================================
        // UNVERIFIED SELLERS
        // ======================================================

        setUnverifiedSellers(
          unverifiedData?.sellers ||
            unverifiedData?.users ||
            unverifiedData?.data ||
            []
        );

        console.log(
          "✅ Admin dashboard data loaded"
        );
      } catch (err) {
        console.error(
          "❌ Admin fetch error:",
          err
        );

        const message =
          err?.message ||
          "Failed to load dashboard data";

        setError(message);

        // ======================================================
        // AUTH ERROR
        // ======================================================

        if (
          err?.status === 401 ||
          err?.status === 403
        ) {
          showNotification(
            message,
            "error"
          );
        } else {
          showNotification(
            message,
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    }, [
      token,
      user,
      showNotification,
    ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshData =
    useCallback(async () => {
      await fetchData();

      showNotification(
        "Data refreshed",
        "success"
      );
    }, [
      fetchData,
      showNotification,
    ]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (
      user?.role === "admin" &&
      token
    ) {
      fetchData();
    }
  }, [
    user,
    token,
    fetchData,
  ]);

  // ==========================================================
  // FILTER PRODUCTS
  // ==========================================================

  const filteredProducts =
    useMemo(() => {
      if (!searchTerm) {
        return products;
      }

      const term =
        searchTerm.toLowerCase();

      return products.filter(
        (product) =>
          product.title
            ?.toLowerCase()
            .includes(term) ||
          product.category
            ?.toLowerCase()
            .includes(term) ||
          product.location
            ?.toLowerCase()
            .includes(term)
      );
    }, [
      products,
      searchTerm,
    ]);

  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const filteredUsers =
    useMemo(() => {
      if (!searchTerm) {
        return users;
      }

      const term =
        searchTerm.toLowerCase();

      return users.filter(
        (userItem) =>
          userItem.name
            ?.toLowerCase()
            .includes(term) ||
          userItem.email
            ?.toLowerCase()
            .includes(term) ||
          userItem.phone
            ?.toLowerCase()
            .includes(term) ||
          userItem.role
            ?.toLowerCase()
            .includes(term)
      );
    }, [
      users,
      searchTerm,
    ]);

  // ==========================================================
  // FILTER RIDERS
  // ==========================================================

  const filteredRiders =
    useMemo(() => {
      if (!searchTerm) {
        return riders;
      }

      const term =
        searchTerm.toLowerCase();

      return riders.filter(
        (rider) =>
          rider.name
            ?.toLowerCase()
            .includes(term) ||
          rider.email
            ?.toLowerCase()
            .includes(term) ||
          rider.phone
            ?.toLowerCase()
            .includes(term) ||
          rider.riderProfile?.bikeType
            ?.toLowerCase()
            .includes(term) ||
          rider.riderProfile?.bikeNumber
            ?.toLowerCase()
            .includes(term) ||
          rider.riderProfile?.serviceArea
            ?.toLowerCase()
            .includes(term)
      );
    }, [
      riders,
      searchTerm,
    ]);

  // ==========================================================
  // VERIFY SELLER
  // ==========================================================

  const handleVerify =
    async (sellerId) => {
      if (!sellerId) {
        showNotification(
          "Seller ID is missing",
          "error"
        );

        return;
      }

      setVerifying(
        (previous) => ({
          ...previous,
          [sellerId]: true,
        })
      );

      try {
        console.log(
          "🔐 Verifying seller:",
          sellerId
        );

        await verifySeller(
          sellerId,
          token
        );

        // Remove seller immediately
        setUnverifiedSellers(
          (previous) =>
            previous.filter(
              (seller) =>
                seller._id !==
                sellerId
            )
        );

        showNotification(
          "Seller verified successfully!",
          "success"
        );

        // Refresh dashboard data
        await fetchData();
      } catch (err) {
        console.error(
          "❌ Seller verification error:",
          err
        );

        showNotification(
          err?.message ||
            "Verification failed",
          "error"
        );
      } finally {
        setVerifying(
          (previous) => ({
            ...previous,
            [sellerId]: false,
          })
        );
      }
    };

  // ==========================================================
  // SHARED PROPS
  // ==========================================================

  const sharedProps = {
    products:
      filteredProducts,

    users:
      filteredUsers,

    loading,

    refreshData,

    showNotification,

    searchTerm,

    setSearchTerm,
  };

  // ==========================================================
  // RENDER ACTIVE PAGE
  // ==========================================================

  const renderPage = () => {
    switch (
      activePage
    ) {
      // ======================================================
      // DASHBOARD
      // ======================================================

      case "dashboard":
        return (
          <>
            <StatsCards
              stats={stats}
              products={
                filteredProducts
              }
              users={
                filteredUsers
              }
            />

            {/* ==================================================
                PENDING SELLER VERIFICATIONS
            ================================================== */}

            <div
              className="pending-verifications-widget"
              style={{
                background:
                  "#fff",
                borderRadius:
                  "12px",
                padding:
                  "20px",
                margin:
                  "24px 0",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
                border:
                  "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 16px 0",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <span>
                  📋
                </span>

                Pending Seller
                Verifications

                <span
                  style={{
                    fontSize:
                      "14px",
                    background:
                      "#f3f4f6",
                    padding:
                      "2px 10px",
                    borderRadius:
                      "20px",
                    marginLeft:
                      "8px",
                  }}
                >
                  {
                    unverifiedSellers.length
                  }
                </span>
              </h3>

              {unverifiedSellers.length ===
              0 ? (
                <p
                  style={{
                    color:
                      "#6b7280",
                    margin:
                      "8px 0",
                  }}
                >
                  All sellers
                  are verified
                  🎉
                </p>
              ) : (
                <ul
                  style={{
                    listStyle:
                      "none",
                    padding:
                      0,
                    margin:
                      0,
                  }}
                >
                  {unverifiedSellers
                    .slice(
                      0,
                      5
                    )
                    .map(
                      (
                        seller
                      ) => (
                        <li
                          key={
                            seller._id
                          }
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            padding:
                              "12px 0",
                            borderBottom:
                              "1px solid #f3f4f6",
                          }}
                        >
                          <div>
                            <strong>
                              {seller.name ||
                                seller.shopName ||
                                "Seller"}
                            </strong>

                            {seller.email && (
                              <span
                                style={{
                                  marginLeft:
                                    "12px",
                                  color:
                                    "#6b7280",
                                  fontSize:
                                    "14px",
                                }}
                              >
                                {
                                  seller.email
                                }
                              </span>
                            )}

                            {seller.createdAt && (
                              <span
                                style={{
                                  marginLeft:
                                    "12px",
                                  fontSize:
                                    "12px",
                                  color:
                                    "#9ca3af",
                                }}
                              >
                                Joined{" "}
                                {new Date(
                                  seller.createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleVerify(
                                seller._id
                              )
                            }
                            disabled={
                              Boolean(
                                verifying[
                                  seller._id
                                ]
                              )
                            }
                            style={{
                              background:
                                "#2563eb",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "6px 16px",
                              borderRadius:
                                "6px",
                              cursor:
                                verifying[
                                  seller._id
                                ]
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                500,
                              fontSize:
                                "14px",
                              opacity:
                                verifying[
                                  seller._id
                                ]
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {verifying[
                              seller._id
                            ]
                              ? "Verifying..."
                              : "✓ Verify"}
                          </button>
                        </li>
                      )
                    )}
                </ul>
              )}

              {unverifiedSellers.length >
                5 && (
                <p
                  style={{
                    marginTop:
                      "8px",
                    textAlign:
                      "right",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActivePage(
                        "sellers"
                      )
                    }
                    style={{
                      background:
                        "none",
                      border:
                        "none",
                      color:
                        "#2563eb",
                      cursor:
                        "pointer",
                      fontSize:
                        "14px",
                    }}
                  >
                    View all{" "}
                    {
                      unverifiedSellers.length
                    }{" "}
                    pending →
                  </button>
                </p>
              )}
            </div>

            {/* ==================================================
                RECENT PRODUCTS
            ================================================== */}

            <RecentProducts
              products={filteredProducts.slice(
                0,
                5
              )}
            />

            {/* ==================================================
                SELLER / USER MANAGEMENT
            ================================================== */}

            <div
              style={{
                marginTop:
                  "24px",
                display:
                  "flex",
                justifyContent:
                  "center",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setActivePage(
                    "sellers"
                  )
                }
                style={{
                  padding:
                    "12px 24px",
                  background:
                    "#2563eb",
                  color:
                    "white",
                  border:
                    "none",
                  borderRadius:
                    "8px",
                  fontWeight:
                    600,
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                }}
              >
                <i className="fas fa-users" />
                Manage Sellers
                & Users
              </button>
            </div>
          </>
        );

      // ======================================================
      // USERS
      // ======================================================

      case "users":
        return (
          <UsersTable
            {...sharedProps}
          />
        );

      // ======================================================
      // PRODUCTS
      // ======================================================

      case "products":
        return (
          <ProductsTable
            {...sharedProps}
          />
        );

      // ======================================================
      // RIDERS
      // ======================================================

      case "riders":
        return (
          <RidersTable
            riders={
              filteredRiders
            }
            loading={
              loading
            }
            refreshData={
              refreshData
            }
            showNotification={
              showNotification
            }
            searchTerm={
              searchTerm
            }
          />
        );

      // ======================================================
      // SELLERS
      // ======================================================

      case "sellers":
        return <Sellers />;

      // ======================================================
      // REPORTS
      // ======================================================

      case "reports":
        return (
          <ReportsChart
            products={
              filteredProducts
            }
          />
        );

      // ======================================================
      // SETTINGS
      // ======================================================

      case "settings":
        return (
          <Settings
            {...sharedProps}
          />
        );

      // ======================================================
      // DEFAULT
      // ======================================================

      default:
        return (
          <>
            <StatsCards
              stats={stats}
              products={
                filteredProducts
              }
              users={
                filteredUsers
              }
            />

            <RecentProducts
              products={filteredProducts.slice(
                0,
                5
              )}
            />
          </>
        );
    }
  };

  // ==========================================================
  // ACCESS GUARD
  // ==========================================================

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <div
        style={{
          padding:
            "40px 20px",
          textAlign:
            "center",
        }}
      >
        <h2>
          Access Denied
        </h2>

        <p>
          You need admin
          privileges to
          view this page.
        </p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="admin-wrapper">
      {/* ======================================================
          TOAST
      ====================================================== */}

      {notification && (
        <Toast
          message={
            notification.message
          }
          type={
            notification.type
          }
          onClose={() =>
            setNotification(
              null
            )
          }
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <AdminSidebar
        activePage={
          activePage
        }
        setActivePage={
          setActivePage
        }
        sidebarOpen={
          sidebarOpen
        }
        setSidebarOpen={
          setSidebarOpen
        }
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div
        className={`admin-main ${
          !sidebarOpen
            ? "expanded"
            : ""
        }`}
      >
        <AdminHeader
          activePage={
            activePage
          }
          sidebarOpen={
            sidebarOpen
          }
          setSidebarOpen={
            setSidebarOpen
          }
          onRefresh={
            refreshData
          }
          onSearch={
            setSearchTerm
          }
          searchTerm={
            searchTerm
          }
        />

        <div className="admin-content">
          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="admin-error-banner"
              style={{
                background:
                  "#fee2e2",
                color:
                  "#dc2626",
                padding:
                  "12px 16px",
                borderRadius:
                  "8px",
                marginBottom:
                  "16px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading &&
          activePage !==
            "riders" &&
          activePage !==
            "sellers" ? (
            <div className="admin-loading">
              Loading dashboard...
            </div>
          ) : (
            renderPage()
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;