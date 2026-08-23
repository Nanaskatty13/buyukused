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

// ─── Seller Management ──────────────────────────────────────
import Sellers from "../../admin/Sellers";

// ─── API ──────────────────────────────────────────────────────
import {
  getProducts,
  getUsers,
  getUserStats,
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

  // ─── New state for verification widget ────────────────────
  const [unverifiedSellers, setUnverifiedSellers] = useState([]);
  const [verifying, setVerifying] = useState({});

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
      const [productsData, usersData, statsData, ridersData, unverifiedData] = await Promise.all([
        getProducts({ limit: 50 }),
        getUsers({}, token),
        getUserStats(token),
        getRiders({}, token),
        getUnverifiedSellers(token),
      ]);

      setProducts(productsData?.products || []);
      setUsers(usersData?.users || []);
      setStats(statsData?.stats || {});
      setRiders(ridersData?.riders || []);
      setUnverifiedSellers(unverifiedData?.sellers || []);
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

  // ─── Verification handler ──────────────────────────────────
  const handleVerify = async (sellerId) => {
    setVerifying(prev => ({ ...prev, [sellerId]: true }));
    try {
      await verifySeller(sellerId, token);
      setUnverifiedSellers(prev => prev.filter(s => s._id !== sellerId));
      showNotification('Seller verified successfully!', 'success');
      refreshData();
    } catch (err) {
      showNotification(err.message || 'Verification failed', 'error');
    } finally {
      setVerifying(prev => ({ ...prev, [sellerId]: false }));
    }
  };

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

            {/* ─── Pending Verifications Widget ───────────────── */}
            <div className="pending-verifications-widget" style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              margin: '24px 0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> Pending Seller Verifications
                <span style={{ fontSize: '14px', background: '#f3f4f6', padding: '2px 10px', borderRadius: '20px', marginLeft: '8px' }}>
                  {unverifiedSellers.length}
                </span>
              </h3>

              {unverifiedSellers.length === 0 ? (
                <p style={{ color: '#6b7280', margin: '8px 0' }}>All sellers are verified 🎉</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {unverifiedSellers.slice(0, 5).map(seller => (
                    <li key={seller._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      <div>
                        <strong>{seller.name || seller.shopName}</strong>
                        <span style={{ marginLeft: '12px', color: '#6b7280', fontSize: '14px' }}>
                          {seller.email}
                        </span>
                        <span style={{ marginLeft: '12px', fontSize: '12px', color: '#9ca3af' }}>
                          Joined {new Date(seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleVerify(seller._id)}
                        disabled={verifying[seller._id]}
                        style={{
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '6px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '14px',
                          opacity: verifying[seller._id] ? 0.6 : 1,
                        }}
                      >
                        {verifying[seller._id] ? 'Verifying...' : '✓ Verify'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {unverifiedSellers.length > 5 && (
                <p style={{ marginTop: '8px', textAlign: 'right' }}>
                  <a href="#" onClick={() => setActivePage('sellers')} style={{ color: '#2563eb' }}>
                    View all {unverifiedSellers.length} pending →
                  </a>
                </p>
              )}
            </div>

            <RecentProducts products={filteredProducts.slice(0, 5)} />

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setActivePage('sellers')}
                style={{
                  padding: '12px 24px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
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