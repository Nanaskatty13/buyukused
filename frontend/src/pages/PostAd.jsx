import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProductWithFiles } from '../api';

// ===============================
// LOCATION DATA
// ===============================

const countries = ['Ghana'];

const regions = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
  'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
  'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
];

const citiesByRegion = {
  'Greater Accra': [
    'Accra', 'Kwame Nkrumah Circle', 'Tema', 'Ashaiman', 'Madina', 'Adenta', 'Dzorwulu',
    'Kaneshie', 'Achimota', 'Legon', 'Osu', 'Labone', 'Cantonments',
    'Airport Residential', 'East Legon', 'Lakeside Estate', 'Sakumono',
    'Spintex', 'Atomic', 'Ablekuma', 'Mamprobi', 'Chorkor', 'Korle Bu',
    'Dansoman', 'Kisseman', 'Avenor', 'Bubuashie', 'Aboabo', 'Nima',
    'Maamobi', 'Alajo', 'Kokomlemle', 'Tesano', 'Abelemkpe', 'Kotobabi',
    'Roman Ridge', 'Ringway', 'Tudor', 'Asylum Down', 'North Ridge',
    'South Ridge', 'Independence Avenue', 'Sarakawa', 'La', 'Teshie',
    'Nungua', 'Prampram', 'Dodowa', 'Aburi', 'Nsawam', 'Amasaman',
    'Weija', 'Kasoa', 'Bawjiase'
  ],
  'Ashanti': [
    'Kumasi', 'Obuasi', 'Tafo', 'Bekwai', 'Mampong', 'Ejisu',
    'Kwadaso', 'Asokwa', 'Suame', 'Oforikrom', 'Nhyiaeso', 'Bantama',
    'Adum', 'Kejetia', 'Manhyia'
  ],
  'Central': [
    'Cape Coast', 'Elmina', 'Saltpond', 'Winneba', 'Mfantsiman',
    'Assin Foso', 'Twifo Praso', 'Kasoa'
  ],
  'Eastern': [
    'Koforidua', 'Nkawkaw', 'Akropong', 'Mpraeso', 'Akwatia',
    'Nsawam', 'Aburi', 'Suhum', 'Asamankese'
  ],
  'Western': [
    'Sekondi-Takoradi', 'Tarkwa', 'Prestea', 'Axim', 'Shama',
    'Apollonia', 'Elubo'
  ],
  'Volta': [
    'Ho', 'Hohoe', 'Keta', 'Akatsi', 'Sogakope', 'Jasikan', 'Kpeve'
  ],
  'Northern': [
    'Tamale', 'Yendi', 'Bimbilla', 'Walewale', 'Kpandai', 'Savelugu'
  ],
  'Upper East': [
    'Bolgatanga', 'Bawku', 'Navrongo', 'Paga', 'Zuarungu'
  ],
  'Upper West': [
    'Wa', 'Lawra', 'Jirapa', 'Nandom', 'Tumu'
  ],
  'Ahafo': [
    'Goaso', 'Mim', 'Ahafo', 'Kukuom', 'Sankore'
  ],
  'Bono': [
    'Sunyani', 'Techiman', 'Berekum', 'Dormaa Ahenkro', 'Nkoranza'
  ],
  'Bono East': [
    'Techiman', 'Atebubu', 'Kintampo', 'Jema', 'Yeji'
  ],
  'North East': [
    'Nalerigu', 'Bunkpurugu', 'Gambaga', 'Walewale'
  ],
  'Oti': [
    'Dambai', 'Jasikan', 'Kpandae', 'Nkwanta', 'Worawora'
  ],
  'Savannah': [
    'Damongo', 'Bole', 'Sawla', 'Tuna', 'Kpandai'
  ],
  'Western North': [
    'Sefwi Wiawso', 'Bibiani', 'Aowin', 'Juaboso', 'Enchi'
  ],
};

// ===============================
// IPHONE COLORS (X to 17 Pro Max)
// ===============================
const iphoneColors = [
  'Space Gray', 'Silver', 'Gold', 'Black', 'White', 'Blue', 'Coral',
  'Yellow', 'Red', 'Purple', 'Green', 'Midnight Green', 'Graphite',
  'Pacific Blue', 'Midnight', 'Starlight', 'Pink', 'Sierra Blue',
  'Alpine Green', 'Deep Purple', 'Space Black', 'Black Titanium',
  'White Titanium', 'Blue Titanium', 'Natural Titanium', 'Desert Titanium',
  'Teal', 'Ultramarine', 'Product Red', 'Rose Gold', 'Matte Black',
  'Jet Black', 'Burgundy', 'Crimson'
];

// ===============================
// POST AD COMPONENT
// ===============================

const PostAd = () => {
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [selectedCountry, setSelectedCountry] = useState('Ghana');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Other',
    location: 'Ghana',
    description: '',
    sellerName: '',
    sellerPhone: '',
    storage: '',
    color: '',
    condition: 'Good',
    negotiation: false,
    swapAccepted: false,
    simStatus: 'Unlocked',
    batteryHealth: '',
    faceId: 'Working',          // ✅ NEW
  });

  const [mediaItems, setMediaItems] = useState([]);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ===============================
  // UPDATE LOCATION STRING
  // ===============================
  useEffect(() => {
    let loc = selectedCountry;
    if (selectedRegion) loc = `${selectedRegion}, ${loc}`;
    if (selectedCity) loc = `${selectedCity}, ${loc}`;
    setFormData(prev => ({ ...prev, location: loc }));
  }, [selectedCountry, selectedRegion, selectedCity]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedRegion('');
    setSelectedCity('');
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setSelectedCity('');
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const newItems = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleVideoChange = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      setMediaItems((prev) => [
        ...prev,
        {
          file,
          preview: URL.createObjectURL(file),
          type: 'video',
        },
      ]);
      e.target.value = '';
    }
  };

  const removeMedia = (index) => {
    URL.revokeObjectURL(mediaItems[index].preview);
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const goToNextStep = () => {
    if (!formData.title || !formData.price || !formData.sellerPhone) {
      setError('Please fill in all required fields: Title, Price, and Phone Number.');
      return;
    }
    setError('');
    setStep(2);
  };

  const goToPreviousStep = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!token) {
      setError('You are not authenticated. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = typeof formData[key] === 'boolean' ? String(formData[key]) : formData[key];
      form.append(key, value);
    });
    mediaItems.forEach((item) => {
      form.append('files', item.file);
    });

    try {
      const data = await createProductWithFiles(form, token);
      if (data.product) {
        navigate('/products');
      } else {
        setError(data.message || 'Failed to post ad');
      }
    } catch (err) {
      console.error('❌ Post ad error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      let result;
      if (authMode === 'login') {
        result = await login(authEmail, authPassword);
      } else {
        result = await register({
          name: authName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
        });
      }
      if (result.success) {
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        setAuthPhone('');
        setAuthError('');
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError('');
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="container" style={{ maxWidth: '600px', padding: '40px 20px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>📢 Post Free Ad</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
        {step === 1 ? 'Step 1 of 2 – Basic details' : 'Step 2 of 2 – Additional details'}
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ----- STEP 1 ----- */}
        {step === 1 && (
          <>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Ad Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Toyota Corolla 2020"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Price (GH₵) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
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

            {/* LOCATION DROPDOWNS */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Location *</label>
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', marginBottom: '8px' }}
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', marginBottom: '8px' }}
              >
                <option value="">Select Region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedRegion}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                <option value="">Select City</option>
                {selectedRegion && citiesByRegion[selectedRegion]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Your ad will appear as: <strong>{formData.location}</strong>
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Your Name</label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Your name"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Phone Number *</label>
              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="054 123 4567"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your item..."
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Upload Images (up to 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>You can select multiple images.</small>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Upload Video (optional)</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>MP4, MOV, AVI (max 50MB).</small>
            </div>

            {mediaItems.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                {mediaItems.map((item, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--gray-200)', flexShrink: 0, background: '#f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'rgba(220,38,38,0.9)')}
                      onMouseLeave={(e) => (e.target.style.background = 'rgba(0,0,0,0.6)')}
                    >
                      ✕
                    </button>
                    {item.type === 'video' ? (
                      <video src={item.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                    ) : (
                      <img src={item.preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {item.type === 'video' && (
                      <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>🎬</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={goToNextStep}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                marginTop: '16px',
              }}
            >
              Next: Additional Details →
            </button>
          </>
        )}

        {/* ----- STEP 2 ----- */}
        {step === 2 && (
          <>
            {/* Storage */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Storage</label>
              <select
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
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
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Select the storage capacity.
              </small>
            </div>

            {/* Color */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Color</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                <option value="">Select color</option>
                {iphoneColors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Choose the color of the device.
              </small>
            </div>

            {/* Battery Health */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Battery Health (%)</label>
              <input
                type="number"
                name="batteryHealth"
                value={formData.batteryHealth}
                onChange={handleChange}
                placeholder="e.g. 85"
                min="0"
                max="100"
                step="1"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              />
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Enter the battery health percentage (0–100). Leave blank if not applicable.
              </small>
            </div>

            {/* SIM Status */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>SIM Status</label>
              <select
                name="simStatus"
                value={formData.simStatus}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                <option value="eSIM Unlocked">eSIM Unlocked</option>
                <option value="SIM Unlocked">SIM Unlocked</option>
                <option value="Locked">Locked</option>
                <option value="Bypass">Bypass</option>
              </select>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Select the SIM lock status of the device.
              </small>
            </div>

            {/* Face ID */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Face ID</label>
              <select
                name="faceId"
                value={formData.faceId}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Select the Face ID status of the device.
              </small>
            </div>

            {/* Condition */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Negotiation & Swap */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Negotiation</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label>
                  <input
                    type="checkbox"
                    name="negotiation"
                    checked={formData.negotiation}
                    onChange={handleChange}
                  />
                  Price is negotiable
                </label>
              </div>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                If checked, buyers can negotiate the price.
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Swap Accepted</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label>
                  <input
                    type="checkbox"
                    name="swapAccepted"
                    checked={formData.swapAccepted}
                    onChange={handleChange}
                  />
                  I accept trades / swaps
                </label>
              </div>
              <small style={{ color: 'var(--gray-400)', display: 'block', marginTop: '4px' }}>
                Indicate that you are open to swapping items.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={goToPreviousStep}
                className="btn-outline"
                style={{ flex: 1, padding: '14px', border: '1.5px solid var(--gray-300)', borderRadius: 'var(--radius-full)', background: 'transparent', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ flex: 2, padding: '14px', border: 'none', borderRadius: 'var(--radius-full)', background: 'var(--secondary)', color: 'white', fontWeight: 700, fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Ad →'}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          style={{
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
          }}
          onClick={closeAuthModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '440px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAuthModal}
              style={{ position: 'absolute', top: '14px', right: '18px', fontSize: '28px', cursor: 'pointer', color: 'var(--gray-400)', background: 'none', border: 'none' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--gray-800)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--gray-400)')}
            >
              &times;
            </button>

            <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
              {authMode === 'login' ? 'Welcome Back 👋' : 'Join KN Classifieds 🚀'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '24px' }}>
              {authMode === 'login' ? 'Login to publish your ad' : 'Create an account to publish your ad'}
            </p>

            {authError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="John Doe"
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
                  />
                </div>
              )}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder={authMode === 'login' ? 'Enter your password' : 'Min 6 characters'}
                  required
                  minLength="6"
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
                />
              </div>
              {authMode === 'register' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Phone (optional)</label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="054 123 4567"
                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  background: authMode === 'login' ? 'var(--primary)' : 'var(--secondary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: authLoading ? 'not-allowed' : 'pointer',
                  opacity: authLoading ? 0.7 : 1,
                  marginTop: '4px',
                }}
              >
                {authLoading
                  ? authMode === 'login' ? 'Logging in...' : 'Creating account...'
                  : authMode === 'login' ? 'Log In →' : 'Create Account →'}
              </button>
            </form>

            <div className="auth-footer" style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--gray-500)' }}>
              {authMode === 'login' ? (
                <>
                  No account?{' '}
                  <span onClick={() => switchAuthMode('register')} style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Create free account
                  </span>
                </>
              ) : (
                <>
                  Already have account?{' '}
                  <span onClick={() => switchAuthMode('login')} style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Sign in
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================
// ✅ THIS IS THE IMPORTANT LINE – MUST BE PRESENT
// ===============================
export default PostAd;