// frontend/src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// ─── Seller Management (existing) ────────────────────────────
import Sellers from "../../admin/Sellers";

// ─── API ──────────────────────────────────────────────────────
import {
  getProducts,
  getUsers,
  getUserStats,
  getRiders,
} from "../../services/api";

import "./styles/admin.css";

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {
  const { user, token } = useAuth();

  // ─── State ────────────────────────────────────────────────
  const [activePage, setActivePage] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  // ─── Toast helper ──────────────────────────────────────────
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
  }, []);

  // ─── Fetch data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const [productsData, usersData, statsData, ridersData] = await Promise.all([
        getProducts({ limit: 50 }),
        getUsers({}, token),
        getUserStats(token),
        getRiders({}, token),
      ]);

      setProducts(productsData?.products || []);
      setUsers(usersData?.users || []);
      setStats(statsData?.stats || {});
      setRiders(ridersData?.riders || []);
    } catch (err) {
      console.error("❌ Admin fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ─── Refresh ───────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    await fetchData();
    showNotification("Data refreshed", "success");
  }, [fetchData, showNotification]);

  // ─── Initial load ──────────────────────────────────────────
  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user, token, fetchData]);

  // ─── Filters ───────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const filteredRiders = useMemo(() => {
    if (!searchTerm) return riders;
    const term = searchTerm.toLowerCase();
    return riders.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.riderProfile?.bikeType?.toLowerCase().includes(term) ||
        r.riderProfile?.bikeNumber?.toLowerCase().includes(term) ||
        r.riderProfile?.serviceArea?.toLowerCase().includes(term)
    );
  }, [riders, searchTerm]);

  // ─── Shared props ──────────────────────────────────────────
  const sharedProps = {
    products: filteredProducts,
    users: filteredUsers,
    loading,
    refreshData,
    showNotification,
    searchTerm,
    setSearchTerm,
  };

  // ─── Render active page ────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <StatsCards stats={stats} products={filteredProducts} users={filteredUsers} />
            <RecentProducts products={filteredProducts.slice(0, 5)} />
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setActivePage("sellers")}
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
                <i className="fas fa-users" /> Manage Sellers & Users
              </button>
            </div>
          </>
        );
      case "users":
        return <UsersTable {...sharedProps} />;
      case "products":
        return <ProductsTable {...sharedProps} />;
      case "riders":
        return <RidersTable riders={filteredRiders} loading={loading} refreshData={refreshData} showNotification={showNotification} searchTerm={searchTerm} />;
      case "sellers":
        return <Sellers />;
      case "reports":
        return <ReportsChart products={filteredProducts} />;
      case "settings":
        return <Settings {...sharedProps} />;
      default:
        return (
          <>
            <StatsCards stats={stats} products={filteredProducts} users={filteredUsers} />
            <RecentProducts products={filteredProducts.slice(0, 5)} />
          </>
        );
    }
  };

  // ─── Access guard ──────────────────────────────────────────
  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="admin-wrapper">
      {notification && (
        <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`admin-main ${!sidebarOpen ? "expanded" : ""}`}>
        <AdminHeader
          activePage={activePage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onRefresh={refreshData}
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
        />

        <div className="admin-content">
          {error && (
            <div className="admin-error-banner" style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}

          {loading && activePage !== "riders" && activePage !== "sellers" ? (
            <div className="admin-loading">Loading dashboard...</div>
          ) : (
            renderPage()
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;