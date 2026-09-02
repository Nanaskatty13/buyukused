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
  updateUser,
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
  // USER FILTER
  // ==========================================================

  const [userFilter, setUserFilter] =
    useState("all");

  // ==========================================================
  // SELLER VERIFICATION STATE
  // ==========================================================

  const [
    unverifiedSellers,
    setUnverifiedSellers,
  ] = useState([]);

  // ==========================================================
  // USER VERIFICATION STATE
  // ==========================================================

  const [verifyingUsers, setVerifyingUsers] =
    useState({});

  // ==========================================================
  // SELLER VERIFICATION LOADING STATE
  // ==========================================================

  const [verifyingSellers, setVerifyingSellers] =
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
  // USER VERIFICATION CHECK
  // ==========================================================

  const isUserVerified = useCallback(
    (userItem) => {
      if (!userItem) {
        return false;
      }

      if (
        userItem.isVerified === true ||
        userItem.verified === true ||
        userItem.emailVerified === true
      ) {
        return true;
      }

      if (
        userItem.isVerified === false ||
        userItem.verified === false ||
        userItem.emailVerified === false
      ) {
        return false;
      }

      const status =
        userItem.verificationStatus ||
        userItem.verifyStatus ||
        userItem.status;

      if (
        typeof status === "string"
      ) {
        const normalized =
          status
            .trim()
            .toLowerCase();

        if (
          normalized ===
            "verified" ||
          normalized ===
            "approved" ||
          normalized ===
            "active"
        ) {
          return true;
        }

        if (
          normalized ===
            "unverified" ||
          normalized ===
            "pending" ||
          normalized ===
            "rejected"
        ) {
          return false;
        }
      }

      return false;
    },
    []
  );

  // ==========================================================
  // VERIFIED USERS
  // ==========================================================

  const verifiedUsers =
    useMemo(() => {
      return users.filter(
        (userItem) =>
          isUserVerified(userItem)
      );
    }, [
      users,
      isUserVerified,
    ]);

  // ==========================================================
  // UNVERIFIED USERS
  // ==========================================================

  const unverifiedUsers =
    useMemo(() => {
      return users.filter(
        (userItem) =>
          !isUserVerified(userItem)
      );
    }, [
      users,
      isUserVerified,
    ]);

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

        const loadedProducts =
          productsData?.products ||
          productsData?.data ||
          [];

        setProducts(
          Array.isArray(
            loadedProducts
          )
            ? loadedProducts
            : []
        );

        const loadedUsers =
          usersData?.users ||
          usersData?.data ||
          [];

        setUsers(
          Array.isArray(
            loadedUsers
          )
            ? loadedUsers
            : []
        );

        console.log(
          "👥 Total users:",
          Array.isArray(
            loadedUsers
          )
            ? loadedUsers.length
            : 0
        );

        setStats(
          statsData?.stats ||
            statsData?.data ||
            statsData ||
            {}
        );

        const loadedRiders =
          ridersData?.riders ||
          ridersData?.users ||
          ridersData?.data ||
          [];

        setRiders(
          Array.isArray(
            loadedRiders
          )
            ? loadedRiders
            : []
        );

        const loadedUnverifiedSellers =
          unverifiedData?.sellers ||
          unverifiedData?.users ||
          unverifiedData?.data ||
          [];

        setUnverifiedSellers(
          Array.isArray(
            loadedUnverifiedSellers
          )
            ? loadedUnverifiedSellers
            : []
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
  // FILTER USERS BY SEARCH
  // ==========================================================

  const searchedUsers =
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
  // FILTER USERS BY VERIFICATION
  // ==========================================================

  const filteredUsers =
    useMemo(() => {
      let result =
        searchedUsers;

      if (
        userFilter ===
        "verified"
      ) {
        result =
          result.filter(
            (userItem) =>
              isUserVerified(
                userItem
              )
          );
      }

      if (
        userFilter ===
        "unverified"
      ) {
        result =
          result.filter(
            (userItem) =>
              !isUserVerified(
                userItem
              )
          );
      }

      return result;
    }, [
      searchedUsers,
      userFilter,
      isUserVerified,
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
  // CLEAR PRODUCT CACHE
  // ==========================================================

  const clearProductCache = useCallback(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('products_v3_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      console.log(`🗑️ Cleared ${keysToRemove.length} product cache entries`);
    } catch (error) {
      console.warn('Could not clear product cache:', error);
    }
  }, []);

  // ==========================================================
  // VERIFY USER – USING updateUser
  // ==========================================================

  const handleVerifyUser =
    useCallback(
      async (userId) => {
        if (!userId) {
          showNotification(
            "User ID is missing",
            "error"
          );

          return;
        }

        if (!token) {
          showNotification(
            "Authentication token is missing",
            "error"
          );

          return;
        }

        if (
          verifyingUsers[userId]
        ) {
          return;
        }

        setVerifyingUsers(
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

          const response =
            await updateUser(
              userId,
              { isVerified: true },
              token
            );

          console.log(
            "✅ User verification response:",
            response
          );

          const verifiedUser =
            response?.user ||
            response?.data?.user ||
            null;

          setUsers(
            (previousUsers) =>
              previousUsers.map(
                (userItem) => {
                  if (
                    userItem._id !==
                    userId
                  ) {
                    return userItem;
                  }

                  return {
                    ...userItem,

                    isVerified:
                      true,

                    verified:
                      true,

                    verificationStatus:
                      "approved",

                    verifiedAt:
                      verifiedUser?.verifiedAt ||
                      new Date().toISOString(),

                    verifiedBy:
                      verifiedUser?.verifiedBy ||
                      user?._id ||
                      null,
                  };
                }
              )
          );

          // ✅ Clear product cache so the badge appears on product cards
          clearProductCache();

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
              "Failed to verify user",
            "error"
          );
        } finally {
          setVerifyingUsers(
            (previous) => ({
              ...previous,
              [userId]: false,
            })
          );
        }
      },
      [
        token,
        user,
        verifyingUsers,
        fetchData,
        showNotification,
        clearProductCache,
      ]
    );

  // ==========================================================
  // VERIFY SELLER
  // ==========================================================

  const handleVerifySeller =
    useCallback(
      async (sellerId) => {
        if (!sellerId) {
          showNotification(
            "Seller ID is missing",
            "error"
          );

          return;
        }

        if (!token) {
          showNotification(
            "Authentication token is missing",
            "error"
          );

          return;
        }

        if (
          verifyingSellers[
            sellerId
          ]
        ) {
          return;
        }

        setVerifyingSellers(
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

          // ✅ Also clear product cache for seller verification
          clearProductCache();

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
          setVerifyingSellers(
            (previous) => ({
              ...previous,
              [sellerId]: false,
            })
          );
        }
      },
      [
        token,
        verifyingSellers,
        fetchData,
        showNotification,
        clearProductCache,
      ]
    );

  // ==========================================================
  // SHARED PROPS (unchanged)
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
  // USER FILTER BUTTONS
  // ==========================================================

  const UserFilterButtons = () => {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setUserFilter("all")
          }
          style={{
            padding:
              "8px 16px",
            borderRadius:
              "9999px",
            border:
              userFilter === "all"
                ? "1px solid #2563eb"
                : "1px solid #d1d5db",
            background:
              userFilter === "all"
                ? "#2563eb"
                : "#ffffff",
            color:
              userFilter === "all"
                ? "#ffffff"
                : "#374151",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          All Users ({users.length})
        </button>

        <button
          type="button"
          onClick={() =>
            setUserFilter(
              "verified"
            )
          }
          style={{
            padding:
              "8px 16px",
            borderRadius:
              "9999px",
            border:
              userFilter ===
              "verified"
                ? "1px solid #16a34a"
                : "1px solid #d1d5db",
            background:
              userFilter ===
              "verified"
                ? "#16a34a"
                : "#ffffff",
            color:
              userFilter ===
              "verified"
                ? "#ffffff"
                : "#374151",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          ✓ Verified ({verifiedUsers.length})
        </button>

        <button
          type="button"
          onClick={() =>
            setUserFilter(
              "unverified"
            )
          }
          style={{
            padding:
              "8px 16px",
            borderRadius:
              "9999px",
            border:
              userFilter ===
              "unverified"
                ? "1px solid #dc2626"
                : "1px solid #d1d5db",
            background:
              userFilter ===
              "unverified"
                ? "#dc2626"
                : "#ffffff",
            color:
              userFilter ===
              "unverified"
                ? "#ffffff"
                : "#374151",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          ⚠ Unverified ({unverifiedUsers.length})
        </button>
      </div>
    );
  };

  // ==========================================================
  // RENDER ACTIVE PAGE (unchanged)
  // ==========================================================

  const renderPage = () => {
    switch (
      activePage
    ) {
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

            <div
              className="user-verification-widget"
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
                  👥
                </span>

                User Verification
              </h3>

              <UserFilterButtons />

              {unverifiedUsers.length >
              0 ? (
                <div>
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      marginBottom:
                        "10px",
                    }}
                  >
                    <strong
                      style={{
                        color:
                          "#dc2626",
                        fontSize:
                          "14px",
                      }}
                    >
                      Unverified Users
                    </strong>

                    <span
                      style={{
                        background:
                          "#fee2e2",
                        color:
                          "#dc2626",
                        padding:
                          "3px 9px",
                        borderRadius:
                          "9999px",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                      }}
                    >
                      {
                        unverifiedUsers.length
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      overflowX:
                        "auto",
                    }}
                  >
                    <table
                      style={{
                        width:
                          "100%",
                        borderCollapse:
                          "collapse",
                        fontSize:
                          "13px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign:
                                "left",
                              padding:
                                "10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            User
                          </th>
                          <th
                            style={{
                              textAlign:
                                "left",
                              padding:
                                "10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            Email
                          </th>
                          <th
                            style={{
                              textAlign:
                                "left",
                              padding:
                                "10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            Phone
                          </th>
                          <th
                            style={{
                              textAlign:
                                "left",
                              padding:
                                "10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            Role
                          </th>
                          <th
                            style={{
                              textAlign:
                                "center",
                              padding:
                                "10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              textAlign:
                                "center",
                              padding:
                                "10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {unverifiedUsers
                          .slice(
                            0,
                            10
                          )
                          .map(
                            (
                              userItem
                            ) => (
                              <tr
                                key={
                                  userItem._id
                                }
                              >
                                <td
                                  style={{
                                    padding:
                                      "10px",
                                    borderBottom:
                                      "1px solid #f3f4f6",
                                  }}
                                >
                                  <strong>
                                    {userItem.name ||
                                      "Unknown User"}
                                  </strong>
                                </td>
                                <td
                                  style={{
                                    padding:
                                      "10px",
                                    borderBottom:
                                      "1px solid #f3f4f6",
                                    color:
                                      "#6b7280",
                                  }}
                                >
                                  {userItem.email ||
                                    "—"}
                                </td>
                                <td
                                  style={{
                                    padding:
                                      "10px",
                                    borderBottom:
                                      "1px solid #f3f4f6",
                                    color:
                                      "#6b7280",
                                  }}
                                >
                                  {userItem.phone ||
                                    "—"}
                                </td>
                                <td
                                  style={{
                                    padding:
                                      "10px",
                                    borderBottom:
                                      "1px solid #f3f4f6",
                                  }}
                                >
                                  {userItem.role ||
                                    "user"}
                                </td>
                                <td
                                  style={{
                                    padding:
                                      "10px",
                                    borderBottom:
                                      "1px solid #f3f4f6",
                                    textAlign:
                                      "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      gap:
                                        "4px",
                                      background:
                                        "#fee2e2",
                                      color:
                                        "#dc2626",
                                      padding:
                                        "4px 9px",
                                      borderRadius:
                                        "9999px",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    ⚠ Unverified
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding:
                                      "10px",
                                    borderBottom:
                                      "1px solid #f3f4f6",
                                    textAlign:
                                      "center",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleVerifyUser(
                                        userItem._id
                                      )
                                    }
                                    disabled={
                                      Boolean(
                                        verifyingUsers[
                                          userItem._id
                                        ]
                                      )
                                    }
                                    style={{
                                      background:
                                        verifyingUsers[
                                          userItem._id
                                        ]
                                          ? "#9ca3af"
                                          : "#16a34a",
                                      color:
                                        "#ffffff",
                                      border:
                                        "none",
                                      padding:
                                        "7px 12px",
                                      borderRadius:
                                        "6px",
                                      cursor:
                                        verifyingUsers[
                                          userItem._id
                                        ]
                                          ? "not-allowed"
                                          : "pointer",
                                      fontWeight:
                                        600,
                                      fontSize:
                                        "12px",
                                      whiteSpace:
                                        "nowrap",
                                      opacity:
                                        verifyingUsers[
                                          userItem._id
                                        ]
                                          ? 0.7
                                          : 1,
                                    }}
                                  >
                                    {verifyingUsers[
                                      userItem._id
                                    ]
                                      ? "Verifying..."
                                      : "✓ Verify User"}
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>

                  {unverifiedUsers.length >
                    10 && (
                    <div
                      style={{
                        marginTop:
                          "12px",
                        textAlign:
                          "right",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setUserFilter(
                            "unverified"
                          );

                          setActivePage(
                            "users"
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
                            "13px",
                          fontWeight:
                            600,
                        }}
                      >
                        View all{" "}
                        {
                          unverifiedUsers.length
                        }{" "}
                        unverified users →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background:
                      "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    color:
                      "#15803d",
                    padding:
                      "14px",
                    borderRadius:
                      "8px",
                    fontSize:
                      "14px",
                  }}
                >
                  ✓ All users are verified.
                </div>
              )}
            </div>

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
                  gap:
                    "8px",
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
                              handleVerifySeller(
                                seller._id
                              )
                            }
                            disabled={
                              Boolean(
                                verifyingSellers[
                                  seller._id
                                ]
                              )
                            }
                            style={{
                              background:
                                verifyingSellers[
                                  seller._id
                                ]
                                  ? "#9ca3af"
                                  : "#2563eb",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "6px 16px",
                              borderRadius:
                                "6px",
                              cursor:
                                verifyingSellers[
                                  seller._id
                                ]
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                500,
                              fontSize:
                                "14px",
                              opacity:
                                verifyingSellers[
                                  seller._id
                                ]
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {verifyingSellers[
                              seller._id
                            ]
                              ? "Verifying..."
                              : "✓ Verify Seller"}
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

            <RecentProducts
              products={filteredProducts.slice(
                0,
                5
              )}
            />

            <div
              style={{
                marginTop:
                  "24px",
                display:
                  "flex",
                justifyContent:
                  "center",
                gap:
                  "10px",
                flexWrap:
                  "wrap",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setActivePage(
                    "users"
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
                Manage Users
              </button>

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
                    "#16a34a",
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
                <i className="fas fa-store" />
                Manage Sellers
              </button>
            </div>
          </>
        );

      case "users":
        return (
          <>
            <div
              style={{
                background:
                  "#ffffff",
                padding:
                  "16px",
                borderRadius:
                  "12px",
                marginBottom:
                  "16px",
                border:
                  "1px solid #e5e7eb",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 12px 0",
                  fontSize:
                    "16px",
                }}
              >
                User Verification
              </h3>

              <UserFilterButtons />
            </div>

            <UsersTable
              {...sharedProps}
            />
          </>
        );

      case "products":
        return (
          <ProductsTable
            {...sharedProps}
          />
        );

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

      case "sellers":
        return <Sellers />;

      case "reports":
        return (
          <ReportsChart
            products={
              filteredProducts
            }
          />
        );

      case "settings":
        return (
          <Settings
            {...sharedProps}
          />
        );

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