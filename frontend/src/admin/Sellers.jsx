// frontend/src/admin/Sellers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, verifySeller, revokeVerification } from '../services/api';

const Sellers = () => {
  const { token } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({}); // track per seller

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Get all users and filter only sellers
      const data = await getUsers({}, token);
      const allUsers = data?.users || [];
      const sellerList = allUsers.filter(user => user.role === 'seller');
      setSellers(sellerList);
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
      setError(err.message || 'Could not load sellers.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleToggleVerification = async (sellerId, currentStatus) => {
    const newStatus = !currentStatus;
    setActionLoading(prev => ({ ...prev, [sellerId]: true }));
    try {
      if (newStatus) {
        // verify
        await verifySeller(sellerId, token);
      } else {
        // unverify
        await revokeVerification(sellerId, token);
      }
      // Update local state
      setSellers(prev =>
        prev.map(s =>
          s._id === sellerId
            ? { ...s, isVerified: newStatus, verifiedAt: newStatus ? new Date().toISOString() : null }
            : s
        )
      );
    } catch (err) {
      console.error('Verification toggle error:', err);
      alert(err.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [sellerId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner">Loading sellers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#dc2626' }}>
        <p>{error}</p>
        <button
          onClick={fetchSellers}
          style={{
            marginTop: '12px',
            padding: '8px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Sellers Management</h2>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          Total: {sellers.length} sellers
        </span>
      </div>

      {sellers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
          No sellers found.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Phone</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Shop</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Verified</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => {
                const isVerified = seller.isVerified === true;
                const isLoading = actionLoading[seller._id];

                return (
                  <tr key={seller._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>
                      {seller.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4b5563' }}>
                      {seller.email || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4b5563' }}>
                      {seller.phone || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#4b5563' }}>
                      {seller.shopName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: isVerified ? '#d1fae5' : '#fee2e2',
                          color: isVerified ? '#065f46' : '#991b1b',
                        }}
                      >
                        {isVerified ? '✅ Verified' : '❌ Not Verified'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleVerification(seller._id, isVerified)}
                        disabled={isLoading}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          background: isVerified ? '#dc2626' : '#2563eb',
                          color: '#fff',
                          opacity: isLoading ? 0.6 : 1,
                        }}
                      >
                        {isLoading
                          ? '⏳'
                          : isVerified
                          ? 'Unverify'
                          : 'Verify'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Sellers;