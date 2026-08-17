import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalAds, setTotalAds] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ sellerId: user._id, limit: 100 });
        const products = Array.isArray(response) ? response : response?.products || [];
        setAds(products);
        setTotalAds(products.length);
        const views = products.reduce((sum, p) => sum + Number(p.views || 0), 0);
        setTotalViews(views);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="container" style={{ padding: '40px 20px' }}>Loading analytics...</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{totalAds}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Total Ads</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#8b5cf6' }}>{totalViews}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Total Views</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b' }}>{ads.length > 0 ? Math.round(totalViews / ads.length) : 0}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Avg Views / Ad</div>
        </div>
      </div>

      {ads.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Ad Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ads.map(ad => (
              <div key={ad._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span>{ad.title}</span>
                <span style={{ fontWeight: 600 }}>{ad.views || 0} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;