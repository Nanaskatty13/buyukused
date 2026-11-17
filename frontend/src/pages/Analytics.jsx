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
    <div className="container liquid-analytics-page" style={{ padding: '40px 20px' }}>
      {/* ═══════════════════════════════════════════════════════
          LIQUID iOS27 — STYLES
          ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes liquid-analytics-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
          66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
        }

        /* ─── Page — liquid mirror background ──────────────── */
        .liquid-analytics-page {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            #eef4ff 0%,
            #f5f0ff 40%,
            #eaf7ff 70%,
            #f2f8ff 100%
          );
        }

        .liquid-analytics-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(circle at 8% 15%, rgba(0,102,204,0.22) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
            radial-gradient(circle at 92% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
            radial-gradient(circle at 50% 115%, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
            radial-gradient(circle at 30% 80%, rgba(59,130,246,0.12) 0%, transparent 50%);
          animation: liquid-analytics-float 24s ease-in-out infinite;
          will-change: transform;
        }

        /* ─── Stat cards — liquid glass panel ─────────────── */
        .liquid-analytics-page .liquid-analytics-stat {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(238,246,255,0.42) 50%,
            rgba(255,255,255,0.62) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 18px;
          box-shadow:
            0 8px 28px rgba(31,38,135,0.10),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(255,255,255,0.25);
          transition:
            transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
            border-color 0.2s ease;
        }
        .liquid-analytics-page .liquid-analytics-stat:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.98);
          box-shadow:
            0 14px 40px rgba(31,38,135,0.16),
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(255,255,255,0.3);
        }

        /* ─── Performance panel — liquid glass ────────────── */
        .liquid-analytics-page .liquid-analytics-panel {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(238,246,255,0.42) 50%,
            rgba(255,255,255,0.62) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 18px;
          box-shadow:
            0 8px 28px rgba(31,38,135,0.10),
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(255,255,255,0.25);
        }

        /* ─── Row divider — subtle liquid glass ───────────── */
        .liquid-analytics-page .liquid-analytics-row {
          border-bottom: 1px solid rgba(255,255,255,0.55);
          transition: background 0.15s ease;
          border-radius: 8px;
          padding: 8px 10px;
        }
        .liquid-analytics-page .liquid-analytics-row:hover {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.55) 0%,
            rgba(238,246,255,0.3) 100%
          );
        }

        /* ─── Reduced motion ──────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .liquid-analytics-page::before { animation: none !important; }
          .liquid-analytics-page .liquid-analytics-stat {
            transition: none !important;
          }
          .liquid-analytics-page .liquid-analytics-stat:hover {
            transform: none !important;
          }
        }
      `}</style>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="liquid-analytics-stat" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{totalAds}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Total Ads</div>
        </div>
        <div className="liquid-analytics-stat" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#8b5cf6' }}>{totalViews}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Total Views</div>
        </div>
        <div className="liquid-analytics-stat" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b' }}>{ads.length > 0 ? Math.round(totalViews / ads.length) : 0}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Avg Views / Ad</div>
        </div>
      </div>

      {ads.length > 0 && (
        <div className="liquid-analytics-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Ad Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ads.map(ad => (
              <div key={ad._id} className="liquid-analytics-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
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