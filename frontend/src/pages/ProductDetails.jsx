import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, updateProductWithFiles } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user, token } = useAuth();
  const { toggleFavorite, isFavorite } = useCart();
  const navigate = useNavigate();

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    location: '',
    condition: '',
    storage: '',
    color: '',
    status: '',
    sellerPhone: '',
    batteryHealth: '',
    faceId: '',
    simStatus: '',
    negotiation: false,
    swapAccepted: false,
  });
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        if (data.product) {
          setProduct(data.product);
          // Pre‑fill edit form
          const p = data.product;
          setEditForm({
            title: p.title || '',
            price: p.price || '',
            description: p.description || '',
            category: p.category || '',
            location: p.location || '',
            condition: p.condition || '',
            storage: p.storage || '',
            color: p.color || '',
            status: p.status || 'active',
            sellerPhone: p.sellerPhone || '',
            batteryHealth: p.batteryHealth !== null && p.batteryHealth !== undefined ? p.batteryHealth : '',
            faceId: p.faceId || '',
            simStatus: p.simStatus || '',
            negotiation: p.negotiation || false,
            swapAccepted: p.swapAccepted || false,
          });
          const existingImages = p.images || (p.image ? [p.image] : []);
          setImagesToKeep(existingImages);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  const canEdit = user && (
    user.role === 'admin' ||
    (product?.sellerId?._id && product.sellerId._id === user._id) ||
    (product?.sellerId === user._id)
  );

  // ----- Edit handlers -----
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    const formData = new FormData();
    // Append text fields
    Object.keys(editForm).forEach(key => {
      if (key === 'price') {
        formData.append(key, parseFloat(editForm[key]) || 0);
      } else if (key === 'batteryHealth') {
        const val = parseFloat(editForm[key]);
        formData.append(key, isNaN(val) ? '' : val);
      } else if (key === 'negotiation' || key === 'swapAccepted') {
        formData.append(key, editForm[key] ? 'true' : 'false');
      } else {
        formData.append(key, editForm[key]);
      }
    });
    formData.append('imagesToKeep', JSON.stringify(imagesToKeep));
    newFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const result = await updateProductWithFiles(id, formData, token);
      if (result.success) {
        const updated = await getProduct(id);
        if (updated.product) {
          setProduct(updated.product);
          setImagesToKeep(updated.product.images || []);
          setNewFiles([]);
          setNewFilePreviews([]);
        }
        setShowEditModal(false);
      } else {
        setEditError(result.message || 'Update failed');
      }
    } catch (err) {
      setEditError(err.message || 'Something went wrong');
    } finally {
      setEditLoading(false);
    }
  };

  // ----- Image slider helpers -----
  const images = product?.images && product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;
  const totalImages = hasImages ? images.length : 1;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };
  const handleThumbClick = (index) => {
    setCurrentImageIndex(index);
  };
  const getCurrentImage = () => {
    if (hasImages) return images[currentImageIndex];
    return product?.image || 'https://placehold.co/600x600?text=No+Image';
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const phone = product?.sellerPhone || '0542928081';
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=Hello%2C%20I%27m%20interested%20in%20${encodeURIComponent(product.title)}`, '_blank');
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center', color: '#e74c3c' }}>{error}</div>;
  if (!product) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Product not found</div>;

  const liked = isFavorite(product._id);

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .product-detail {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
            .thumbnails img {
              width: 60px !important;
              height: 60px !important;
            }
            .details h1 {
              font-size: 22px !important;
            }
            .details .price {
              font-size: 26px !important;
            }
            .details .meta {
              font-size: 13px !important;
              gap: 10px !important;
            }
            .actions button {
              font-size: 14px !important;
              padding: 10px 18px !important;
            }
            .safety {
              font-size: 12px !important;
              padding: 12px 14px !important;
            }
            .specs-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 480px) {
            .thumbnails img {
              width: 50px !important;
              height: 50px !important;
            }
            .details h1 {
              font-size: 20px !important;
            }
            .details .price {
              font-size: 22px !important;
            }
            .actions {
              flex-direction: column !important;
            }
            .actions button {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}
      </style>

      <div className="container" style={{ padding: '30px 20px' }}>
        <div className="product-detail" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
        }}>
          {/* ----- Gallery ----- */}
          <div className="gallery">
            <div className="main-image" style={{
              position: 'relative',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '1/1',
            }}>
              <img src={getCurrentImage()} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {totalImages > 1 && (
                <>
                  <button onClick={handlePrev} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}>‹</button>
                  <button onClick={handleNext} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}>›</button>
                  <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                    {images.map((_, idx) => (
                      <button key={idx} onClick={() => handleThumbClick(idx)} style={{ width: '10px', height: '10px', borderRadius: '50%', background: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {hasImages && totalImages > 1 && (
              <div className="thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Thumb ${idx + 1}`} onClick={() => handleThumbClick(idx)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: currentImageIndex === idx ? '3px solid var(--primary)' : '2px solid transparent', flexShrink: 0 }} />
                ))}
              </div>
            )}
          </div>

          {/* ----- Details ----- */}
          <div className="details">
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{product.title}</h1>
            <div className="price" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              GH₵ {Number(product.price).toLocaleString()}
              {product.oldPrice && <span style={{ fontSize: '18px', fontWeight: 400, color: 'var(--gray-400)', textDecoration: 'line-through', marginLeft: '12px' }}>GH₵ {Number(product.oldPrice).toLocaleString()}</span>}
            </div>
            <div className="meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--gray-500)', marginBottom: '16px' }}>
              <span><i className="fas fa-map-marker-alt"></i> {product.location || 'Ghana'}</span>
              <span><i className="fas fa-tag"></i> {product.category}</span>
              <span><i className="fas fa-eye"></i> {product.views || 0} views</span>
              <span><i className="fas fa-clock"></i> {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}</span>
            </div>

            {/* ----- Specifications ----- */}
            {(product.storage || product.color || product.condition || product.batteryHealth !== null || product.faceId || product.simStatus || product.negotiation || product.swapAccepted) && (
              <div className="specs" style={{
                marginBottom: '20px',
                padding: '16px',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>📋 Specifications</h3>
                <div className="specs-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '8px',
                }}>
                  {product.storage && <div><strong>Storage:</strong> {product.storage}</div>}
                  {product.color && <div><strong>Color:</strong> {product.color}</div>}
                  {product.condition && <div><strong>Condition:</strong> {product.condition}</div>}
                  {product.batteryHealth !== null && product.batteryHealth !== undefined && (
                    <div><strong>Battery Health:</strong> {product.batteryHealth}%</div>
                  )}
                  {product.faceId && <div><strong>Face ID:</strong> {product.faceId}</div>}
                  {product.simStatus && <div><strong>SIM Status:</strong> {product.simStatus}</div>}
                  {product.negotiation && <div><strong>Negotiable:</strong> Yes</div>}
                  {product.swapAccepted && <div><strong>Swap Accepted:</strong> Yes</div>}
                </div>
              </div>
            )}

            <div className="description" style={{ color: 'var(--gray-700)', lineHeight: 1.7, marginBottom: '20px' }}>
              {product.description || 'No description provided.'}
            </div>

            <div className="seller" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}><i className="fas fa-user"></i> {product.sellerName || 'KN Seller'}</div>
              {product.sellerPhone && <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}><i className="fas fa-phone"></i> {product.sellerPhone}</div>}
            </div>

            <div className="actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleContact} className="btn-secondary" style={{ padding: '12px 32px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fab fa-whatsapp"></i> Contact Seller
              </button>
              {canEdit && (
                <button onClick={() => setShowEditModal(true)} style={{ padding: '12px 24px', border: '1.5px solid var(--primary)', borderRadius: 'var(--radius-full)', background: 'white', color: 'var(--primary)', fontWeight: 600, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-pen"></i> Edit
                </button>
              )}
              <button onClick={() => toggleFavorite(product._id)} className="btn-outline" style={{ padding: '12px 24px', border: '1.5px solid var(--gray-300)', borderRadius: 'var(--radius-full)', background: 'transparent', fontWeight: 600, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: liked ? '#e74c3c' : 'var(--gray-700)' }}>
                <i className={liked ? 'fas fa-heart' : 'far fa-heart'}></i> {liked ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="safety" style={{ marginTop: '20px', background: '#fef9c3', borderRadius: 'var(--radius-md)', padding: '14px 18px', fontSize: '13px', color: '#854d0e' }}>
              <strong><i className="fas fa-shield-alt"></i> Safety tips</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                <li>Avoid paying in advance, even for delivery</li>
                <li>Meet with the seller at a safe public place</li>
                <li>Inspect the item before paying</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ----- EDIT MODAL ----- */}
        {showEditModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setShowEditModal(false)}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', maxWidth: '600px', width: '100%', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '14px', right: '18px', fontSize: '28px', cursor: 'pointer', color: 'var(--gray-400)', background: 'none', border: 'none' }}>&times;</button>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>Edit Product</h2>

              {editError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>{editError}</div>}

              <form onSubmit={handleEditSubmit}>
                {/* Title */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Title *</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleEditChange} required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>

                {/* Price */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Price (GH₵) *</label>
                  <input type="number" name="price" value={editForm.price} onChange={handleEditChange} required step="0.01" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>

                {/* Seller Phone */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Seller Phone</label>
                  <input type="tel" name="sellerPhone" value={editForm.sellerPhone} onChange={handleEditChange} placeholder="e.g. 054 123 4567" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>

                {/* Category */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Category</label>
                  <select name="category" value={editForm.category} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
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

                {/* Location */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Location</label>
                  <input type="text" name="location" value={editForm.location} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Description</label>
                  <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', resize: 'vertical' }} />
                </div>

                {/* Condition */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Condition</label>
                  <select name="condition" value={editForm.condition} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                {/* Storage */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Storage</label>
                  <select name="storage" value={editForm.storage} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
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

                {/* Color */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Color</label>
                  <select name="color" value={editForm.color} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
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

                {/* Battery Health */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Battery Health (%)</label>
                  <input type="number" name="batteryHealth" value={editForm.batteryHealth} onChange={handleEditChange} min="0" max="100" step="1" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>

                {/* Face ID */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Face ID</label>
                  <select name="faceId" value={editForm.faceId} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                    <option value="">Select Face ID status</option>
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>

                {/* SIM Status */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>SIM Status</label>
                  <select name="simStatus" value={editForm.simStatus} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                    <option value="">Select SIM status</option>
                    <option value="eSIM Unlocked">eSIM Unlocked</option>
                    <option value="SIM Unlocked">SIM Unlocked</option>
                    <option value="Locked">Locked</option>
                    <option value="Bypass">Bypass</option>
                  </select>
                </div>

                {/* Negotiation & Swap */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="negotiation" checked={editForm.negotiation} onChange={handleEditChange} />
                    <label style={{ fontWeight: 600, fontSize: '13px' }}>Negotiation</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" name="swapAccepted" checked={editForm.swapAccepted} onChange={handleEditChange} />
                    <label style={{ fontWeight: 600, fontSize: '13px' }}>Swap Accepted</label>
                  </div>
                </div>

                {/* Status */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                {/* Images – Existing */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Current Images</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {imagesToKeep.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <img src={img} alt={`current ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => handleRemoveExistingImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220,38,38,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                    {imagesToKeep.length === 0 && <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>No images</span>}
                  </div>
                </div>

                {/* Upload new images */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Add New Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleNewFileChange} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                  {newFilePreviews.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {newFilePreviews.map((preview, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <img src={preview} alt={`new ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeNewFile(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(220,38,38,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={editLoading} style={{ width: '100%', padding: '14px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '16px', cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? 0.7 : 1 }}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>You might also like</h2>
          <div style={{ color: 'var(--gray-500)' }}>Related products coming soon...</div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;