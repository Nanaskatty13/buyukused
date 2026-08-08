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
    <div className="container" style={{ maxWidth: '600px', padding: '30px 20px' }}>
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
              <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={getImageUrl(img)} alt={`current ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => handleRemoveExistingImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220,38,38,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
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
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={preview} alt={`new ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeNewFile(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220,38,38,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
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
          <button type="button" className="btn-outline" onClick={handleDelete} disabled={deleting} style={{ flex: 1, background: '#dc2626', color: 'white', borderColor: '#dc2626' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;