// ============================================================
// AdminDashboard.jsx
// ============================================================

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

// ─── API ─────────────────────────────────────────────────────
import {
  getAdminProducts,
  getAdminUsers,
  getAdminDashboardStats,
  getRiders,
  getUnverifiedSellers,
  verifySeller,

  // User verification
  verifyUser,
  unverifyUser,
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

  const [stats, setStats] =
    useState({});

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

  // ==========================================================
  // VERIFICATION LOADING STATE
  // ==========================================================

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
  // CHECK USER VERIFICATION STATUS
  // ==========================================================

  const isUserVerified =
    useCallback(
      (userItem) => {
        if (!userItem) {
          return false;
        }

        const verificationStatus =
          String(
            userItem.verificationStatus || ""
          ).toLowerCase();

        return Boolean(
          userItem.isVerified === true ||
            userItem.verified === true ||
            userItem.emailVerified === true ||
            verificationStatus === "verified" ||
            verificationStatus === "approved"
        );
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

        setProducts(
          productsData?.products ||
            productsData?.data ||
            []
        );

        setUsers(
          usersData?.users ||
            usersData?.data ||
            []
        );

        setStats(
          statsData?.stats ||
            statsData?.data ||
            statsData ||
            {}
        );

        setRiders(
          ridersData?.riders ||
            ridersData?.users ||
            ridersData?.data ||
            []
        );

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

        showNotification(
          message,
          "error"
        );
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
  // FILTERS
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

        setUnverifiedSellers(
          (previous) =>
            previous.filter(
              (seller) =>
                String(seller._id) !==
                String(sellerId)
            )
        );

        showNotification(
          "Seller verified successfully!",
          "success"
        );

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
  // VERIFY USER
  // ==========================================================

  const handleVerifyUser =
    async (userId) => {
      if (!userId) {
        showNotification(
          "User ID is missing",
          "error"
        );

        return;
      }

      if (verifying[userId]) {
        return;
      }

      setVerifying(
        (previous) => ({
          ...previous,
          [userId]: true,
        })
      );

      try {
        console.log(
          "🔐 Verifying user:",
          userId
        );

        await verifyUser(
          userId,
          token
        );

        setUsers(
          (previous) =>
            previous.map(
              (userItem) => {
                const currentId =
                  userItem._id ||
                  userItem.id;

                if (
                  String(currentId) !==
                  String(userId)
                ) {
                  return userItem;
                }

                return {
                  ...userItem,
                  isVerified: true,
                  verified: true,
                  verificationStatus: "approved",
                  verifiedAt:
                    new Date().toISOString(),
                };
              }
            )
        );

        showNotification(
          "User verified successfully!",
          "success"
        );

        await fetchData();
      } catch (err) {
        console.error(
          "❌ User verification error:",
          err
        );

        showNotification(
          err?.message ||
            "User verification failed",
          "error"
        );
      } finally {
        setVerifying(
          (previous) => ({
            ...previous,
            [userId]: false,
          })
        );
      }
    };

  // ==========================================================
  // UNVERIFY USER
  // ==========================================================

  const handleUnverifyUser =
    async (userId) => {
      if (!userId) {
        showNotification(
          "User ID is missing",
          "error"
        );

        return;
      }

      if (verifying[userId]) {
        return;
      }

      setVerifying(
        (previous) => ({
          ...previous,
          [userId]: true,
        })
      );

      try {
        console.log(
          "🔓 Removing user verification:",
          userId
        );

        await unverifyUser(
          userId,
          token
        );

        setUsers(
          (previous) =>
            previous.map(
              (userItem) => {
                const currentId =
                  userItem._id ||
                  userItem.id;

                if (
                  String(currentId) !==
                  String(userId)
                ) {
                  return userItem;
                }

                return {
                  ...userItem,
                  isVerified: false,
                  verified: false,
                  verificationStatus: "pending",
                  verifiedAt: null,
                  verifiedBy: null,
                };
              }
            )
        );

        showNotification(
          "User verification removed",
          "success"
        );

        await fetchData();
      } catch (err) {
        console.error(
          "❌ User unverification error:",
          err
        );

        showNotification(
          err?.message ||
            "Failed to remove user verification",
          "error"
        );
      } finally {
        setVerifying(
          (previous) => ({
            ...previous,
            [userId]: false,
          })
        );
      }
    };

  // ==========================================================
  // USER VERIFICATION PANEL
  // ==========================================================

  const renderUserVerificationPanel =
    () => {
      const verificationUsers =
        filteredUsers;

      const verifiedCount =
        verificationUsers.filter(
          (userItem) =>
            isUserVerified(
              userItem
            )
        ).length;

      const unverifiedCount =
        verificationUsers.length -
        verifiedCount;

      return (
        <div
          className="user-verification-widget"
          style={{
            background:
              "#ffffff",
            borderRadius:
              "12px",
            padding:
              "20px",
            marginBottom:
              "24px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.08)",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "16px",
              marginBottom:
                "18px",
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  margin:
                    "0 0 6px 0",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <span>
                  ✓
                </span>

                User Verification
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                  fontSize:
                    "14px",
                }}
              >
                Verify or remove
                verification from
                marketplace users.
              </p>
            </div>

            <div
              style={{
                display:
                  "flex",
                gap: "8px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  background:
                    "#dcfce7",
                  color:
                    "#166534",
                  padding:
                    "6px 10px",
                  borderRadius:
                    "20px",
                  fontSize:
                    "12px",
                  fontWeight:
                    600,
                }}
              >
                ✓ Verified:{" "}
                {verifiedCount}
              </span>

              <span
                style={{
                  background:
                    "#fef3c7",
                  color:
                    "#92400e",
                  padding:
                    "6px 10px",
                  borderRadius:
                    "20px",
                  fontSize:
                    "12px",
                  fontWeight:
                    600,
                }}
              >
                Unverified:{" "}
                {unverifiedCount}
              </span>
            </div>
          </div>

          {verificationUsers.length ===
          0 ? (
            <div
              style={{
                padding:
                  "24px",
                textAlign:
                  "center",
                color:
                  "#6b7280",
                background:
                  "#f9fafb",
                borderRadius:
                  "8px",
              }}
            >
              No users found.
            </div>
          ) : (
            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "10px",
              }}
            >
              {verificationUsers.map(
                (userItem) => {
                  const userId =
                    userItem._id ||
                    userItem.id;

                  if (!userId) {
                    return null;
                  }

                  const verified =
                    isUserVerified(
                      userItem
                    );

                  const busy =
                    Boolean(
                      verifying[
                        userId
                      ]
                    );

                  const isAdmin =
                    String(
                      userItem.role || ""
                    ).toLowerCase() ===
                    "admin";

                  return (
                    <div
                      key={
                        userId
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: "16px",
                        padding:
                          "14px",
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "8px",
                        background:
                          "#fff",
                      }}
                    >
                      <div
                        style={{
                          minWidth:
                            0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <strong>
                            {userItem.name ||
                              "User"}
                          </strong>

                          {verified ? (
                            <span
                              style={{
                                background:
                                  "#dcfce7",
                                color:
                                  "#166534",
                                padding:
                                  "3px 8px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              ✓ Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                background:
                                  "#fef3c7",
                                color:
                                  "#92400e",
                                padding:
                                  "3px 8px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              Unverified
                            </span>
                          )}

                          {isAdmin && (
                            <span
                              style={{
                                background:
                                  "#ede9fe",
                                color:
                                  "#6d28d9",
                                padding:
                                  "3px 8px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              Admin
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            color:
                              "#6b7280",
                            fontSize:
                              "14px",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {userItem.email ||
                            "No email"}
                        </div>

                        {userItem.phone && (
                          <div
                            style={{
                              marginTop:
                                "2px",
                              color:
                                "#9ca3af",
                              fontSize:
                                "13px",
                            }}
                          >
                            {userItem.phone}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          flexShrink:
                            0,
                        }}
                      >
                        {isAdmin ? (
                          <span
                            style={{
                              color:
                                "#9ca3af",
                              fontSize:
                                "12px",
                            }}
                          >
                            Admin account
                          </span>
                        ) : !verified ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleVerifyUser(
                                userId
                              )
                            }
                            disabled={
                              busy
                            }
                            style={{
                              background:
                                busy
                                  ? "#86efac"
                                  : "#16a34a",
                              color:
                                "#fff",
                              border:
                                "none",
                              padding:
                                "8px 14px",
                              borderRadius:
                                "7px",
                              cursor:
                                busy
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                600,
                              fontSize:
                                "13px",
                              opacity:
                                busy
                                  ? 0.8
                                  : 1,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {busy
                              ? "Verifying..."
                              : "✓ Verify User"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleUnverifyUser(
                                userId
                              )
                            }
                            disabled={
                              busy
                            }
                            style={{
                              background:
                                busy
                                  ? "#fca5a5"
                                  : "#dc2626",
                              color:
                                "#fff",
                              border:
                                "none",
                              padding:
                                "8px 14px",
                              borderRadius:
                                "7px",
                              cursor:
                                busy
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                600,
                              fontSize:
                                "13px",
                              opacity:
                                busy
                                  ? 0.8
                                  : 1,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {busy
                              ? "Removing..."
                              : "✕ Unverify User"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      );
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

    onVerifyUser:
      handleVerifyUser,

    onUnverifyUser:
      handleUnverifyUser,

    verifyingUser:
      verifying,
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
              setActivePage={
                setActivePage
              }
            />

            {/* ==================================================
                PENDING SELLER VERIFICATIONS – CLICKABLE CARD
            ================================================== */}

            <div
              onClick={() =>
                setActivePage(
                  "sellers"
                )
              }
              style={{
                cursor: "pointer",
              }}
            >
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
                  transition:
                    "all 0.2s ease",
                }}
                onMouseEnter={(
                  e
                ) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(
                  e
                ) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.08)";
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
                              onClick={(
                                e
                              ) => {
                                e.stopPropagation();
                                handleVerify(
                                  seller._id
                                );
                              }}
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
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();
                        setActivePage(
                          "sellers"
                        );
                      }}
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
            </div>

            {/* ==================================================
                RECENT PRODUCTS – CLICKABLE CARD
            ================================================== */}

            <div
              onClick={() =>
                setActivePage(
                  "products"
                )
              }
              style={{
                cursor: "pointer",
              }}
            >
              <RecentProducts
                products={filteredProducts.slice(
                  0,
                  5
                )}
              />
            </div>

            {/* ==================================================
                SELLER / USER MANAGEMENT BUTTON
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
          <>
            {renderUserVerificationPanel()}
            <UsersTable
              {...sharedProps}
            />
          </>
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
              setActivePage={
                setActivePage
              }
            />

            <div
              onClick={() =>
                setActivePage(
                  "products"
                )
              }
              style={{
                cursor: "pointer",
              }}
            >
              <RecentProducts
                products={filteredProducts.slice(
                  0,
                  5
                )}
              />
            </div>
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