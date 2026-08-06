import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // ✅ added for View buttons
import { useAuth } from '../../context/AuthContext';
import { getProducts, getUsers, getUserStats, deleteProduct, updateUser, deleteUser } from '../../api';

// ----- INLINE SUB-COMPONENTS -----

const StatsCards = ({ stats, products, users }) => {
  const cards = [
    { label: 'Total Users', value: stats.totalUsers || users.length, color: '#3b82f6' },
    { label: 'Admins', value: stats.totalAdmins || 0, color: '#8b5cf6' },
    { label: 'Sellers', value: stats.totalSellers || 0, color: '#f59e0b' },
    { label: 'Buyers', value: stats.totalBuyers || 0, color: '#10b981' },
    { label: 'Products', value: products.length, color: '#ec4899' },
  ];

  return (
    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {cards.map((c) => (
        <div key={c.label} className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
};

const RecentProducts = ({ products }) => {
  return (
    <div className="table-container" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>📦 Recent Products</h3>
      {products.length === 0 ? (
        <p style={{ color: 'var(--gray-400)' }}>No products yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Image</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 12px' }}><img src={p.image || 'https://placehold.co/50x50?text=No+Image'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                  <td style={{ padding: '8px 12px' }}>{p.title}</td>
                  <td style={{ padding: '8px 12px' }}>GH₵ {Number(p.price).toLocaleString()}</td>
                  <td style={{ padding: '8px 12px' }}>{p.category || 'Other'}</td>
                  <td style={{ padding: '8px 12px' }}><span style={{ background: p.status === 'active' ? '#10b981' : '#6b7280', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{p.status || 'active'}</span></td>
                  <td style={{ padding: '8px 12px' }}>
                    <Link to={`/product/${p._id}`} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '12px', display: 'inline-block' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length > 5 && <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--gray-400)' }}>... and {products.length - 5} more</p>}
        </div>
      )}
    </div>
  );
};

const UsersTable = ({ users, loading, refreshData, showNotification, token }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  if (!users) return <div>No users data</div>;

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'buyer',
      isActive: user.isActive !== false,
    });
  };

  const handleSave = async (id) => {
    try {
      const result = await updateUser(id, editForm, token);
      if (result.success) {
        showNotification?.('User updated', 'success');
        refreshData?.();
        setEditingUser(null);
      } else {
        showNotification?.(result.message || 'Update failed', 'error');
      }
    } catch (err) {
      showNotification?.(err.message || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const result = await deleteUser(id, token);
      if (result.success) {
        showNotification?.('User deleted', 'success');
        refreshData?.();
      } else {
        showNotification?.(result.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification?.(err.message || 'Something went wrong', 'error');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="table-container" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>👥 All Users</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                {editingUser === user._id ? (
                  <>
                    <td style={{ padding: '8px' }}><input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ padding: '6px', width: '100%' }} /></td>
                    <td style={{ padding: '8px' }}><input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={{ padding: '6px', width: '100%' }} /></td>
                    <td style={{ padding: '8px' }}>
                      <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} style={{ padding: '6px', width: '100%' }}>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <label><input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})} /> Active</label>
                    </td>
                    <td style={{ padding: '8px', color: 'var(--gray-400)' }}>—</td>
                    <td style={{ padding: '8px' }}>
                      <button onClick={() => handleSave(user._id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>Save</button>
                      <button onClick={() => setEditingUser(null)} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '8px 12px' }}>{user.name}</td>
                    <td style={{ padding: '8px 12px' }}>{user.email}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: user.role === 'admin' ? '#8b5cf6' : user.role === 'seller' ? '#f59e0b' : '#10b981', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>{user.role}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: user.isActive !== false ? '#16a34a' : '#dc2626' }}>{user.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>{user.location || '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <button onClick={() => setSelectedUser(user)} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', fontSize: '12px' }}>Stats</button>
                      <button onClick={() => handleEdit(user)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}>Edit</button>
                      <button onClick={() => handleDelete(user._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Stats Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '480px', width: '100%', padding: '32px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: '14px', right: '18px', fontSize: '28px', cursor: 'pointer', color: 'var(--gray-400)', background: 'none', border: 'none' }}>&times;</button>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>📊 User Stats</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '20px' }}>{selectedUser.name}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px' }}><div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Role</div><div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedUser.role}</div></div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px' }}><div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Status</div><div style={{ fontWeight: 600, color: selectedUser.isActive !== false ? '#16a34a' : '#dc2626' }}>{selectedUser.isActive !== false ? 'Active' : 'Inactive'}</div></div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px' }}><div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Location</div><div style={{ fontWeight: 600 }}>{selectedUser.location || '—'}</div></div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px' }}><div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Joined</div><div style={{ fontWeight: 600 }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}</div></div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px', gridColumn: '1 / -1' }}><div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Email</div><div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{selectedUser.email}</div></div>
              {selectedUser.phone && <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '8px', gridColumn: '1 / -1' }}><div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Phone</div><div style={{ fontWeight: 600 }}>{selectedUser.phone}</div></div>}
            </div>
            <button onClick={() => setSelectedUser(null)} style={{ width: '100%', padding: '12px', marginTop: '20px', background: 'var(--gray-200)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductsTable = ({ products, loading, refreshData, showNotification, token }) => {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const result = await deleteProduct(id, token);
      if (result.success) {
        showNotification?.('Product deleted', 'success');
        refreshData?.();
      } else {
        showNotification?.(result.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification?.(err.message || 'Something went wrong', 'error');
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (!products) return <div>No products data</div>;

  return (
    <div className="table-container" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '16px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>📦 All Products</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Image</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 12px' }}><img src={p.image || 'https://placehold.co/50x50?text=No+Image'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                <td style={{ padding: '8px 12px' }}>{p.title}</td>
                <td style={{ padding: '8px 12px' }}>GH₵ {Number(p.price).toLocaleString()}</td>
                <td style={{ padding: '8px 12px' }}>{p.category || 'Other'}</td>
                <td style={{ padding: '8px 12px' }}><span style={{ background: p.status === 'active' ? '#10b981' : '#6b7280', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>{p.status || 'active'}</span></td>
                <td style={{ padding: '8px 12px' }}>
                  <Link to={`/product/${p._id}`} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '12px', display: 'inline-block', marginRight: '4px' }}>
                    View
                  </Link>
                  <button onClick={() => handleDelete(p._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----- MAIN DASHBOARD -----

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

  // Toast component
  const Toast = ({ message, type, onClose }) => {
    React.useEffect(() => {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }, [onClose]);
    return (
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', borderRadius: '8px', color: 'white', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: type === 'success' ? '#16a34a' : '#dc2626' }}>
        {message}
      </div>
    );
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

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

  const refreshData = useCallback(() => {
    fetchData();
    showNotification('Data refreshed', 'success');
  }, [fetchData]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, fetchData]);

  // Filter products & users based on search
  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If not admin
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div><h2>Access Denied</h2><p>You need admin privileges.</p></div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: sidebarOpen ? '260px' : '70px',
        minHeight: '100vh',
        background: '#1a1a2e',
        color: 'white',
        padding: '20px 0',
        transition: 'width 0.3s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '0 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🛠️</span>
            {sidebarOpen && <span style={{ fontWeight: 700, fontSize: '18px' }}>Admin</span>}
          </div>
          {['dashboard', 'users', 'products', 'reports', 'settings'].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: activePage === page ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                color: 'white',
                width: '100%',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background 0.2s',
                borderRadius: '4px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => { if (activePage !== page) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '18px' }}>
                {page === 'dashboard' && '📊'}
                {page === 'users' && '👥'}
                {page === 'products' && '📦'}
                {page === 'reports' && '📈'}
                {page === 'settings' && '⚙️'}
              </span>
              {sidebarOpen && <span>{page.charAt(0).toUpperCase() + page.slice(1)}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main" style={{ flex: 1, background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--gray-600)' }}>
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', width: '200px' }}
            />
            <button onClick={refreshData} style={{ padding: '6px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>🔄 Refresh</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>{user?.name?.charAt(0) || 'A'}</div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content" style={{ padding: '24px' }}>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>⚠️ {error}</div>}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>Loading dashboard...</div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <>
                  <StatsCards stats={stats} products={filteredProducts} users={filteredUsers} />
                  <RecentProducts products={filteredProducts} />
                </>
              )}
              {activePage === 'users' && <UsersTable users={filteredUsers} loading={loading} refreshData={refreshData} showNotification={showNotification} token={token} />}
              {activePage === 'products' && <ProductsTable products={filteredProducts} loading={loading} refreshData={refreshData} showNotification={showNotification} token={token} />}
              {activePage === 'reports' && <div style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>📊 Reports – coming soon</div>}
              {activePage === 'settings' && <div style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>⚙️ Settings – coming soon</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;