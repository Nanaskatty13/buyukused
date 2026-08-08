// components/UsersTable.jsx
import React, { useState } from 'react';

// ✅ Fixed: correct path to your API module
import { updateUser, deleteUser } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const UsersTable = ({ users, loading, refreshData, showNotification }) => {
  const { token } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedUser, setSelectedUser] = useState(null); // for stats modal

  // Guard against missing props
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
        showNotification?.('User updated successfully', 'success');
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
    <div className="table-container">
      <h2>👥 Users ({users.length})</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Joined</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                {editingUser === user._id ? (
                  <>
                    <td style={{ padding: '8px' }}>
                      <input 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        style={{ padding: '6px', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{ padding: '6px', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <select 
                        value={editForm.role} 
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        style={{ padding: '6px', width: '100%' }}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={editForm.isActive} 
                          onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                        /> Active
                      </label>
                    </td>
                    <td colSpan="2" style={{ padding: '8px', color: 'var(--gray-400)' }}>—</td>
                    <td style={{ padding: '8px' }}>
                      <button 
                        onClick={() => handleSave(user._id)} 
                        style={{ background: '#16a34a', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingUser(null)} 
                        style={{ background: '#6b7280', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '8px' }}>{user.name}</td>
                    <td style={{ padding: '8px' }}>{user.email}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ 
                        background: user.role === 'admin' ? '#8b5cf6' : user.role === 'seller' ? '#f59e0b' : '#10b981',
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ color: user.isActive !== false ? '#16a34a' : '#dc2626' }}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>{user.location || '—'}</td>
                    <td style={{ padding: '8px', fontSize: '12px', color: 'var(--gray-500)' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button 
                        onClick={() => setSelectedUser(user)} 
                        style={{ background: '#6b7280', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', fontSize: '12px' }}
                      >
                        Stats
                      </button>
                      <button 
                        onClick={() => handleEdit(user)} 
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)} 
                        style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----- STATS MODAL ----- */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }} onClick={() => setSelectedUser(null)}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '18px',
                fontSize: '28px',
                cursor: 'pointer',
                color: 'var(--gray-400)',
                background: 'none',
                border: 'none',
              }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              📊 User Stats
            </h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '20px' }}>
              {selectedUser.name}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Role</div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedUser.role}</div>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Status</div>
                <div style={{ fontWeight: 600, color: selectedUser.isActive !== false ? '#16a34a' : '#dc2626' }}>
                  {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Location</div>
                <div style={{ fontWeight: 600 }}>{selectedUser.location || '—'}</div>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Joined</div>
                <div style={{ fontWeight: 600 }}>
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Email</div>
                <div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{selectedUser.email}</div>
              </div>
              {selectedUser.phone && (
                <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Phone</div>
                  <div style={{ fontWeight: 600 }}>{selectedUser.phone}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '20px',
                background: 'var(--gray-200)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;