// frontend/src/pages/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProduct, updateProductWithFiles, deleteProduct, getImageUrl } from '../services/api';

// Reuse the same location/color data from PostAd or define here
// (I'll assume you have them in a shared file, but for brevity I'll copy them)
// Alternatively, you can import from PostAd if you export them.

const EditProduct = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    location: '',
    condition: '',
    storage: '',
    color: '',
    sellerPhone: '',
    batteryHealth: '',
    faceId: '',
    simStatus: '',
    negotiation: false,
    swapAccepted: false,
    status: 'active',
    warranty: '', // NEW: warranty field
  });
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch product data ─────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        const p = data.product;
        if (!p) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        setFormData({
          title: p.title || '',
          price: p.price || '',
          description: p.description || '',
          category: p.category || '',
          location: p.location || '',
          condition: p.condition || '',
          storage: p.storage || '',
          color: p.color || '',
          sellerPhone: p.sellerPhone || '',
          batteryHealth: p.batteryHealth !== undefined ? p.batteryHealth : '',
          faceId: p.faceId || '',
          simStatus: p.simStatus || '',
          negotiation: p.negotiation || false,
          swapAccepted: p.swapAccepted || false,
          status: p.status || 'active',
          warranty: p.warranty || '', // NEW: pre-fill warranty
        });
        setImagesToKeep(p.images || (p.image ? [p.image] : []));
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRemoveExistingImage = (index) => {
    setImagesToKeep(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewFilePreviews(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Update product ──────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'price') {
        form.append(key, parseFloat(formData[key]) || 0);
      } else if (key === 'batteryHealth') {
        const val = parseFloat(formData[key]);
        form.append(key, isNaN(val) ? '' : val);
      } else if (key === 'negotiation' || key === 'swapAccepted') {
        form.append(key, formData[key] ? 'true' : 'false');
      } else {
        form.append(key, formData[key]);
      }
    });
    form.append('imagesToKeep', JSON.stringify(imagesToKeep));
    newFiles.forEach(file => form.append('files', file));

    try {
      const result = await updateProductWithFiles(id, form, token);
      if (result.success) {
        navigate(`/product/${id}`);
      } else {
        setError(result.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete product ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const result = await deleteProduct(id, token);
      if (result.success || result.message === 'Product deleted') {
        navigate('/products');
      } else {
        setError(result.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div className="container" style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>;

  return (
    <div className="container liquid-edit-page" style={{ maxWidth: '600px', padding: '30px 20px' }}>
      {/* ═══════════════════════════════════════════════════════
          LIQUID iOS27 — STYLES
          ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes liquid-edit-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
          66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
        }

        /* ─── Page — liquid mirror background ──────────── */
        .liquid-edit-page {
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

        .liquid-edit-page::before {
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
          animation: liquid-edit-float 24s ease-in-out infinite;
          will-change: transform;
        }

        /* ─── Form fields — liquid glass ───────────────── */
        .liquid-edit-page input[type="text"],
        .liquid-edit-page input[type="number"],
        .liquid-edit-page input[type="tel"],
        .liquid-edit-page select,
        .liquid-edit-page textarea {
          width: 100%;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.75);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.72) 0%,
            rgba(255,255,255,0.38) 100%
          );
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 10px rgba(31,38,135,0.06);
          color: #111827;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .liquid-edit-page input[type="text"]:focus,
        .liquid-edit-page input[type="number"]:focus,
        .liquid-edit-page input[type="tel"]:focus,
        .liquid-edit-page select:focus,
        .liquid-edit-page textarea:focus {
          border-color: rgba(0,102,204,0.6);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 0 0 3px rgba(0,102,204,0.14),
            0 4px 14px rgba(31,38,135,0.10);
        }

        /* ─── File input — liquid glass label feel ────── */
        .liquid-edit-page input[type="file"] {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.75);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.68) 0%,
            rgba(255,255,255,0.32) 100%
          );
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 10px rgba(31,38,135,0.06);
          font-size: 13px;
          color: #374151;
          width: 100%;
          cursor: pointer;
        }

        /* ─── Error banner — red liquid glass ─────────── */
        .liquid-edit-page .error-banner {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.65) 0%,
            rgba(254,226,226,0.6) 100%
          );
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(252,165,165,0.55);
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 4px 18px rgba(220,38,38,0.08);
        }

        /* ─── Image thumbnail — liquid glass frame ────── */
        .liquid-edit-page .liquid-edit-thumb {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.75);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.5) 0%,
            rgba(238,246,255,0.3) 100%
          );
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 8px rgba(31,38,135,0.08);
        }

        /* ─── Thumbnail remove button — liquid red glass ─ */
        .liquid-edit-page .liquid-edit-thumb-remove {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 22px;
          height: 22px;
          font-size: 11px;
          line-height: 1;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            rgba(239,68,68,0.94) 0%,
            rgba(220,38,38,0.88) 100%
          );
          backdrop-filter: blur(8px) saturate(180%);
          -webkit-backdrop-filter: blur(8px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 2px 8px rgba(239,68,68,0.35);
          transition: transform 0.15s ease;
        }
        .liquid-edit-page .liquid-edit-thumb-remove:hover {
          transform: scale(1.08);
        }

        /* ─── Save button — liquid blue glass ─────────── */
        .liquid-edit-page .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 22px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.4);
          background: linear-gradient(
            135deg,
            rgba(0,102,204,0.94) 0%,
            rgba(0,85,165,0.88) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(0,102,204,0.30);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .liquid-edit-page .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(0,102,204,0.42);
        }
        .liquid-edit-page .btn-primary:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .liquid-edit-page .btn-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 2px 8px rgba(0,102,204,0.15);
        }

        /* ─── Delete button — liquid red glass ────────── */
        .liquid-edit-page .btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 22px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.35);
          background: linear-gradient(
            135deg,
            rgba(239,68,68,0.92) 0%,
            rgba(220,38,38,0.85) 100%
          );
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 4px 14px rgba(239,68,68,0.30);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .liquid-edit-page .btn-outline:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.45),
            0 8px 24px rgba(239,68,68,0.42);
        }
        .liquid-edit-page .btn-outline:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .liquid-edit-page .btn-outline:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 2px 8px rgba(239,68,68,0.15);
        }

        /* ─── Text label readability on pastel bg ─────── */
        .liquid-edit-page label {
          color: #111827;
          font-weight: 600;
          font-size: 13px;
          display: block;
          margin-bottom: 6px;
        }
        .liquid-edit-page h2 {
          color: #111827;
        }

        /* ─── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .liquid-edit-page::before { animation: none !important; }
          .liquid-edit-page .btn-primary,
          .liquid-edit-page .btn-outline,
          .liquid-edit-page .liquid-edit-thumb-remove,
          .liquid-edit-page input,
          .liquid-edit-page select,
          .liquid-edit-page textarea {
            transition: none !important;
          }
          .liquid-edit-page .btn-primary:hover:not(:disabled),
          .liquid-edit-page .btn-outline:hover:not(:disabled),
          .liquid-edit-page .liquid-edit-thumb-remove:hover {
            transform: none !important;
          }
        }
      `}</style>

      <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>✏️ Edit Product</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Update your ad details</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleUpdate}>
        {/* ─── Basic Info ─── */}
        <div className="form-group">
          <label>Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Price (GH₵) *</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
        </div>

        <div className="form-group">
          <label>Seller Phone</label>
          <input type="tel" name="sellerPhone" value={formData.sellerPhone} onChange={handleChange} placeholder="054 123 4567" />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="Cars">Cars</option>
            <option value="Phones">Phones</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Jobs">Jobs</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home">Home</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
        </div>

        {/* ─── Specifications ─── */}
        <div className="form-group">
          <label>Condition</label>
          <select name="condition" value={formData.condition} onChange={handleChange}>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Storage</label>
          <select name="storage" value={formData.storage} onChange={handleChange}>
            <option value="">Select storage</option>
            <option value="16GB">16GB</option>
            <option value="32GB">32GB</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
            <option value="2TB">2TB</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Color</label>
          <select name="color" value={formData.color} onChange={handleChange}>
            <option value="">Select color</option>
            {[
              'Space Gray', 'Silver', 'Gold', 'Black', 'White', 'Blue', 'Coral',
              'Yellow', 'Red', 'Purple', 'Green', 'Midnight Green', 'Graphite',
              'Pacific Blue', 'Midnight', 'Starlight', 'Pink', 'Sierra Blue',
              'Alpine Green', 'Deep Purple', 'Space Black', 'Black Titanium',
              'White Titanium', 'Blue Titanium', 'Natural Titanium', 'Desert Titanium',
              'Teal', 'Ultramarine', 'Product Red', 'Rose Gold', 'Matte Black',
              'Jet Black', 'Burgundy', 'Crimson'
            ].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Battery Health (%)</label>
          <input type="number" name="batteryHealth" value={formData.batteryHealth} onChange={handleChange} min="0" max="100" step="1" />
        </div>

        <div className="form-group">
          <label>Face ID</label>
          <select name="faceId" value={formData.faceId} onChange={handleChange}>
            <option value="">Select Face ID status</option>
            <option value="Working">Working</option>
            <option value="Not Working">Not Working</option>
            <option value="Not Available">Not Available</option>
          </select>
        </div>

        <div className="form-group">
          <label>SIM Status</label>
          <select name="simStatus" value={formData.simStatus} onChange={handleChange}>
            <option value="">Select SIM status</option>
            <option value="eSIM Unlocked">eSIM Unlocked</option>
            <option value="SIM Unlocked">SIM Unlocked</option>
            <option value="Locked">Locked</option>
            <option value="Bypass">Bypass</option>
          </select>
        </div>

        {/* ─── NEW: Warranty Period ─── */}
        <div className="form-group">
          <label>Warranty Period</label>
          <select name="warranty" value={formData.warranty} onChange={handleChange}>
            <option value="">No warranty</option>
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="3 weeks">3 weeks</option>
            <option value="4 weeks">4 weeks</option>
            {/* 1–12 months */}
            {[...Array(12)].map((_, i) => {
              const months = i + 1;
              return (
                <option key={months} value={`${months} month${months > 1 ? 's' : ''}`}>
                  {months} month{months > 1 ? 's' : ''}
                </option>
              );
            })}
            <option value="1 year">1 year</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
          <div className="checkbox-group">
            <input type="checkbox" name="negotiation" checked={formData.negotiation} onChange={handleChange} />
            <label>Negotiable</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" name="swapAccepted" checked={formData.swapAccepted} onChange={handleChange} />
            <label>Swap Accepted</label>
          </div>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* ─── Images ─── */}
        <div className="form-group">
          <label>Current Images</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {imagesToKeep.map((img, idx) => (
              <div key={idx} className="liquid-edit-thumb">
                <img src={getImageUrl(img)} alt={`current ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="liquid-edit-thumb-remove">✕</button>
              </div>
            ))}
            {imagesToKeep.length === 0 && <span style={{ color: '#9ca3af' }}>No images</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Add New Images</label>
          <input type="file" multiple accept="image/*" onChange={handleNewFileChange} />
          {newFilePreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {newFilePreviews.map((preview, idx) => (
                <div key={idx} className="liquid-edit-thumb">
                  <img src={preview} alt={`new ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeNewFile(idx)} className="liquid-edit-thumb-remove">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Actions ─── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2 }}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn-outline" onClick={handleDelete} disabled={deleting} style={{ flex: 1 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;