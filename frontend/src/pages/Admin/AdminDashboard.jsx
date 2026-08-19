// frontend/src/pages/Admin/AdminDashboard.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { useAuth } from "../../context/AuthContext";

import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import StatsCards from "./components/StatsCards";
import RecentProducts from "./components/RecentProducts";
import UsersTable from "./components/UsersTable";
import ProductsTable from "./components/ProductsTable";
import ReportsChart from "./components/ReportsChart";
import Settings from "./components/Settings";

// ─── NEW: Seller Management ──────────────────────────────────────
import Sellers from "../../admin/Sellers";

import {
  getProducts,
  getUsers,
  getUserStats,
  getRiders,
  approveRider,
  rejectRider,
  updateUser,
} from "../../services/api";

import "./styles/admin.css";

// ============================================================
// TOAST
// ============================================================

const Toast = ({
  message,
  type = "success",
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(
      onClose,
      4000
    );

    return () =>
      clearTimeout(timer);
  }, [onClose]);

  const styles = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    padding: "12px 24px",
    borderRadius: "10px",
    color: "white",
    fontWeight: 600,
    zIndex: 99999,
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.15)",
    background:
      type === "success"
        ? "#16a34a"
        : "#dc2626",
  };

  return (
    <div style={styles}>
      {message}
    </div>
  );
};

// ============================================================
// RIDER MANAGEMENT
// ============================================================

const RidersTable = ({
  riders,
  loading,
  refreshData,
  showNotification,
  searchTerm,
}) => {
  const [processingId, setProcessingId] =
    useState(null);

  const filteredRiders = useMemo(() => {
    if (!searchTerm) {
      return riders;
    }

    const term =
      searchTerm.toLowerCase();

    return riders.filter((rider) => {
      return (
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
    });
  }, [riders, searchTerm]);

  // ----------------------------------------------------------
  // APPROVE RIDER
  // ----------------------------------------------------------

  const handleApprove = async (
    riderId
  ) => {
    try {
      setProcessingId(riderId);

      await approveRider(riderId);

      showNotification(
        "Rider approved successfully",
        "success"
      );

      await refreshData();
    } catch (error) {
      console.error(
        "Approve rider error:",
        error
      );

      showNotification(
        error.message ||
          "Failed to approve rider",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ----------------------------------------------------------
  // REJECT RIDER
  // ----------------------------------------------------------

  const handleReject = async (
    riderId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this rider's approval?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(riderId);

      await rejectRider(riderId);

      showNotification(
        "Rider approval removed",
        "success"
      );

      await refreshData();
    } catch (error) {
      console.error(
        "Reject rider error:",
        error
      );

      showNotification(
        error.message ||
          "Failed to remove rider approval",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ----------------------------------------------------------
  // ACTIVATE / DEACTIVATE RIDER
  // ----------------------------------------------------------

  const handleToggleActive = async (
    rider
  ) => {
    const nextStatus =
      rider.isActive === false;

    const action =
      nextStatus
        ? "activate"
        : "deactivate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} this rider account?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(rider._id);

      await updateUser(
        rider._id,
        {
          isActive: nextStatus,
        }
      );

      showNotification(
        nextStatus
          ? "Rider account activated"
          : "Rider account deactivated",
        "success"
      );

      await refreshData();
    } catch (error) {
      console.error(
        "Toggle rider account error:",
        error
      );

      showNotification(
        error.message ||
          "Failed to update rider account",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="admin-loading">
        Loading riders...
      </div>
    );
  }

  // ----------------------------------------------------------
  // EMPTY STATE
  // ----------------------------------------------------------

  if (!filteredRiders.length) {
    return (
      <div
        className="admin-card"
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "12px",
          }}
        >
          🏍️
        </div>

        <h3>
          No riders found
        </h3>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          Rider accounts will appear
          here when users register
          as riders.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
            }}
          >
            Rider Management
          </h2>

          <p
            style={{
              margin:
                "6px 0 0",
              color: "#6b7280",
            }}
          >
            Manage rider applications,
            approvals and accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          style={{
            border: "1px solid #d1d5db",
            background: "#fff",
            padding:
              "9px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ======================================================
          RIDER TABLE
      ====================================================== */}

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            minWidth: "1050px",
          }}
        >
          <thead>
            <tr>
              {[
                "Rider",
                "Contact",
                "Motorcycle",
                "Service Area",
                "Approval",
                "Availability",
                "Deliveries",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    textAlign:
                      "left",
                    padding:
                      "13px 12px",
                    borderBottom:
                      "1px solid #e5e7eb",
                    fontSize:
                      "13px",
                    color:
                      "#6b7280",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRiders.map(
              (rider) => {
                const profile =
                  rider.riderProfile ||
                  {};

                const approved =
                  profile.isApproved ===
                  true;

                const available =
                  profile.isAvailable ===
                  true;

                const active =
                  rider.isActive !==
                  false;

                const processing =
                  processingId ===
                  rider._id;

                return (
                  <tr
                    key={
                      rider._id
                    }
                  >
                    {/* RIDER */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >
                        {rider.avatar ||
                        rider.photoURL ? (
                          <img
                            src={
                              rider.avatar ||
                              rider.photoURL
                            }
                            alt={
                              rider.name
                            }
                            style={{
                              width:
                                "40px",
                              height:
                                "40px",
                              borderRadius:
                                "50%",
                              objectFit:
                                "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "40px",
                              height:
                                "40px",
                              borderRadius:
                                "50%",
                              background:
                                "#e5e7eb",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontWeight:
                                700,
                            }}
                          >
                            {rider.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              "R"}
                          </div>
                        )}

                        <div>
                          <div
                            style={{
                              fontWeight:
                                700,
                            }}
                          >
                            {rider.name ||
                              "Unnamed Rider"}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#6b7280",
                            }}
                          >
                            {rider.email ||
                              "No email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div>
                        {rider.phone ||
                          "No phone"}
                      </div>

                      <small
                        style={{
                          color:
                            "#6b7280",
                        }}
                      >
                        {rider.location ||
                          "Ghana"}
                      </small>
                    </td>

                    {/* BIKE */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <strong>
                        {profile.bikeType ||
                          "Not provided"}
                      </strong>

                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#6b7280",
                          marginTop:
                            "3px",
                        }}
                      >
                        {profile.bikeNumber ||
                          "No bike number"}
                      </div>
                    </td>

                    {/* SERVICE AREA */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      {profile.serviceArea ||
                        "Not specified"}
                    </td>

                    {/* APPROVAL */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          display:
                            "inline-flex",
                          padding:
                            "5px 9px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          background:
                            approved
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            approved
                              ? "#166534"
                              : "#92400e",
                        }}
                      >
                        {approved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </td>

                    {/* AVAILABILITY */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          display:
                            "inline-flex",
                          padding:
                            "5px 9px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          background:
                            available
                              ? "#dcfce7"
                              : "#f3f4f6",
                          color:
                            available
                              ? "#166534"
                              : "#4b5563",
                        }}
                      >
                        {available
                          ? "Online"
                          : "Offline"}
                      </span>
                    </td>

                    {/* DELIVERIES */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <strong>
                        {
                          profile.completedDeliveries
                        }
                      </strong>

                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#6b7280",
                        }}
                      >
                        ⭐{" "}
                        {Number(
                          profile.rating ??
                            5
                        ).toFixed(1)}
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td
                      style={{
                        padding:
                          "14px 12px",
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "7px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        {!approved ? (
                          <button
                            type="button"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              handleApprove(
                                rider._id
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "#16a34a",
                              color:
                                "#fff",
                              padding:
                                "7px 10px",
                              borderRadius:
                                "7px",
                              cursor:
                                processing
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                600,
                              opacity:
                                processing
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            ✓ Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              handleReject(
                                rider._id
                              )
                            }
                            style={{
                              border:
                                "1px solid #dc2626",
                              background:
                                "#fff",
                              color:
                                "#dc2626",
                              padding:
                                "7px 10px",
                              borderRadius:
                                "7px",
                              cursor:
                                processing
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                600,
                              opacity:
                                processing
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            Remove Approval
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={
                            processing
                          }
                          onClick={() =>
                            handleToggleActive(
                              rider
                            )
                          }
                          style={{
                            border:
                              "1px solid #d1d5db",
                            background:
                              active
                                ? "#fff"
                                : "#111827",
                            color:
                              active
                                ? "#374151"
                                : "#fff",
                            padding:
                              "7px 10px",
                            borderRadius:
                              "7px",
                            cursor:
                              processing
                                ? "not-allowed"
                                : "pointer",
                            fontWeight:
                              600,
                            opacity:
                              processing
                                ? 0.6
                                : 1,
                          }}
                        >
                          {active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {
  const {
    user,
    token,
  } = useAuth();

  const [
    activePage,
    setActivePage,
  ] = useState("dashboard");

  const [stats, setStats] =
    useState({});

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    riders,
    setRiders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    notification,
    setNotification,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // NOTIFICATION
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
  // FETCH DASHBOARD DATA
  // ==========================================================

  const fetchData =
    useCallback(async () => {
      if (!token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [
          productsData,
          usersData,
          statsData,
          ridersData,
        ] = await Promise.all([
          getProducts({
            limit: 50,
          }),

          getUsers(
            {},
            token
          ),

          getUserStats(
            token
          ),

          getRiders(
            {},
            token
          ),
        ]);

        setProducts(
          productsData?.products ||
            []
        );

        setUsers(
          usersData?.users ||
            []
        );

        setStats(
          statsData?.stats ||
            {}
        );

        setRiders(
          ridersData?.riders ||
            []
        );
      } catch (err) {
        console.error(
          "❌ Admin fetch error:",
          err
        );

        setError(
          err.message ||
            "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

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
      user?.role ===
      "admin"
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
  // PAGE RENDER
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

            <RecentProducts
              products={
                filteredProducts
              }
            />

            {/* ─── Quick link to Sellers Management ─── */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setActivePage("sellers")
                }
                style={{
                  padding: "12px 24px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <i className="fas fa-users" />
                Manage Sellers & Users
              </button>
            </div>
          </>
        );

      case "users":
        return (
          <UsersTable
            {...sharedProps}
          />
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
              products={
                filteredProducts
              }
            />
          </>
        );
    }
  };

  // ==========================================================
  // ADMIN ACCESS GUARD
  // ==========================================================

  if (
    !user ||
    user.role !==
      "admin"
  ) {
    return (
      <div
        className="admin-access-denied"
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
  // ADMIN UI
  // ==========================================================

  return (
    <div className="admin-wrapper">
      {/* ====================================================
          TOAST
      ==================================================== */}

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

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

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

      {/* ====================================================
          MAIN
      ==================================================== */}

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
          {/* ERROR */}

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

          {/* LOADING */}

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