import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import StatsCards from './components/StatsCards';
import RecentProducts from './components/RecentProducts';
import UsersTable from './components/UsersTable';
import ProductsTable from './components/ProductsTable';
import ReportsChart from './components/ReportsChart';
import Settings from './components/Settings';
import { getProducts, getUsers, getUserStats } from '../../api';
import './styles/admin.css';

// Simple notification/toast system
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    fontWeight: 600,
    zIndex: 9999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    background: type === 'success' ? '#16a34a' : '#dc2626',
  };

  return <div style={styles}>{message}</div>;
};

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');

  // --- Data fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productsData, usersData, statsData] = await Promise.all([
        getProducts({ limit: 50 }),
        getUsers({}, token),
        getUserStats(token),
      ]);
      setProducts(productsData.products || []);
      setUsers(usersData.users || []);
      setStats(statsData.stats || {});
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- Refresh (exposed to children via context or props) ---
  const refreshData = useCallback(() => {
    fetchData();
    showNotification('Data refreshed', 'success');
  }, [fetchData]);

  // --- Notification helper ---
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [token, user, fetchData]);

  // --- Filter products & users based on search ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.title?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // --- Render page content ---
  const renderPage = () => {
    const sharedProps = {
      products: filteredProducts,
      users: filteredUsers,
      loading,
      refreshData,
      showNotification,
      searchTerm,
      setSearchTerm,
    };

    switch (activePage) {
      case 'dashboard':
        return (
          <>
            <StatsCards stats={stats} products={filteredProducts} users={filteredUsers} />
            <RecentProducts products={filteredProducts} />
          </>
        );
      case 'users':
        return <UsersTable {...sharedProps} />;
      case 'products':
        return <ProductsTable {...sharedProps} />;
      case 'reports':
        return <ReportsChart products={filteredProducts} />;
      case 'settings':
        return <Settings {...sharedProps} />;
      default:
        return <StatsCards stats={stats} products={filteredProducts} users={filteredUsers} />;
    }
  };

  // --- Admin access guard ---
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={`admin-main ${!sidebarOpen ? 'expanded' : ''}`}>
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
            <div className="admin-error-banner" style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}
          {loading ? (
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