// frontend/src/pages/PostAd.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProductWithFiles } from '../services/api';

// Import LaptopForm and its constants
import LaptopForm, {
  LAPTOP_BRANDS,
  getModelsByBrand,
  PROCESSOR_OPTIONS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  SCREEN_SIZE_OPTIONS,
  GRAPHICS_OPTIONS,
  CONDITION_OPTIONS,
  WARRANTY_OPTIONS,
} from '../components/LaptopForm';

// ✅ NEW: Import TabletForm
import TabletForm, {
  TABLET_BRANDS,
  getTabletModelsByBrand,
  TABLET_COLORS,
  TABLET_SCREEN_SIZES,
  TABLET_STORAGE_OPTIONS,
  CONNECTIVITY_OPTIONS,
  YEAR_OPTIONS,
  TABLET_CONDITION_OPTIONS,
  TABLET_WARRANTY_OPTIONS,
} from '../components/TabletForm';

// ===============================
// LOCATION DATA
// ===============================

const countries = ['Ghana'];

const regions = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
];

const citiesByRegion = {
  'Greater Accra': [
    'Accra',
    'Kwame Nkrumah Circle',
    'Tema',
    'Ashaiman',
    'Madina',
    'Adenta',
    'Dzorwulu',
    'Kaneshie',
    'Achimota',
    'Legon',
    'Osu',
    'Labone',
    'Cantonments',
    'Airport Residential',
    'East Legon',
    'Lakeside Estate',
    'Sakumono',
    'Spintex',
    'Atomic',
    'Ablekuma',
    'Mamprobi',
    'Chorkor',
    'Korle Bu',
    'Dansoman',
    'Kisseman',
    'Avenor',
    'Bubuashie',
    'Aboabo',
    'Nima',
    'Maamobi',
    'Alajo',
    'Kokomlemle',
    'Tesano',
    'Abelemkpe',
    'Kotobabi',
    'Roman Ridge',
    'Ringway',
    'Tudor',
    'Asylum Down',
    'North Ridge',
    'South Ridge',
    'Independence Avenue',
    'Sarakawa',
    'La',
    'Teshie',
    'Nungua',
    'Prampram',
    'Dodowa',
    'Aburi',
    'Nsawam',
    'Amasaman',
    'Weija',
    'Kasoa',
    'Bawjiase',
  ],

  Ashanti: [
    'Kumasi',
    'Obuasi',
    'Tafo',
    'Bekwai',
    'Mampong',
    'Ejisu',
    'Kwadaso',
    'Asokwa',
    'Suame',
    'Oforikrom',
    'Nhyiaeso',
    'Bantama',
    'Adum',
    'Kejetia',
    'Manhyia',
  ],

  Central: [
    'Cape Coast',
    'Elmina',
    'Saltpond',
    'Winneba',
    'Mfantsiman',
    'Assin Foso',
    'Twifo Praso',
    'Kasoa',
  ],

  Eastern: [
    'Koforidua',
    'Nkawkaw',
    'Akropong',
    'Mpraeso',
    'Akwatia',
    'Nsawam',
    'Aburi',
    'Suhum',
    'Asamankese',
  ],

  Western: [
    'Sekondi-Takoradi',
    'Tarkwa',
    'Prestea',
    'Axim',
    'Shama',
    'Apollonia',
    'Elubo',
  ],

  Volta: [
    'Ho',
    'Hohoe',
    'Keta',
    'Akatsi',
    'Sogakope',
    'Jasikan',
    'Kpeve',
  ],

  Northern: [
    'Tamale',
    'Yendi',
    'Bimbilla',
    'Walewale',
    'Kpandai',
    'Savelugu',
  ],

  'Upper East': [
    'Bolgatanga',
    'Bawku',
    'Navrongo',
    'Paga',
    'Zuarungu',
  ],

  'Upper West': [
    'Wa',
    'Lawra',
    'Jirapa',
    'Nandom',
    'Tumu',
  ],

  Ahafo: [
    'Goaso',
    'Mim',
    'Ahafo',
    'Kukuom',
    'Sankore',
  ],

  Bono: [
    'Sunyani',
    'Techiman',
    'Berekum',
    'Dormaa Ahenkro',
    'Nkoranza',
  ],

  'Bono East': [
    'Techiman',
    'Atebubu',
    'Kintampo',
    'Jema',
    'Yeji',
  ],

  'North East': [
    'Nalerigu',
    'Bunkpurugu',
    'Gambaga',
    'Walewale',
  ],

  Oti: [
    'Dambai',
    'Jasikan',
    'Kpandae',
    'Nkwanta',
    'Worawora',
  ],

  Savannah: [
    'Damongo',
    'Bole',
    'Sawla',
    'Tuna',
    'Kpandai',
  ],

  'Western North': [
    'Sefwi Wiawso',
    'Bibiani',
    'Aowin',
    'Juaboso',
    'Enchi',
  ],
};

const iphoneColors = [
  'All Colors',
  'Space Gray',
  'Orange',
  'Deep Blue',
  'Silver',
  'Gold',
  'Black',
  'White',
  'Blue',
  'Coral',
  'Yellow',
  'Red',
  'Purple',
  'Green',
  'Midnight Green',
  'Graphite',
  'Pacific Blue',
  'Midnight',
  'Starlight',
  'Pink',
  'Sierra Blue',
  'Alpine Green',
  'Deep Purple',
  'Space Black',
  'Black Titanium',
  'White Titanium',
  'Blue Titanium',
  'Natural Titanium',
  'Desert Titanium',
  'Teal',
  'Ultramarine',
  'Product Red',
  'Rose Gold',
  'Matte Black',
  'Jet Black',
  'Burgundy',
  'Crimson',
];

// ===============================
// COMPONENT
// ===============================

const PostAd = () => {
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();

  // ─── ALL STATE DECLARATIONS ──────────────────────────────────────

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
    simStatus: 'SIM Unlocked',
    batteryHealth: '',
    faceId: 'Working',
    warranty: '',

    // Laptop-specific fields
    brand: '',
    model: '',
    processor: '',
    storage: '',
    ram: '',
    screenSize: '',
    graphics: '',

    // ✅ NEW: Tablet-specific fields
    year: '',
    connectivity: '',
  });

  const [mediaItems, setMediaItems] = useState([]);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ─── EFFECTS ──────────────────────────────────────────────────────

  useEffect(() => {
    let loc = selectedCountry;

    if (selectedRegion) {
      loc = `${selectedRegion}, ${loc}`;
    }

    if (selectedCity) {
      loc = `${selectedCity}, ${loc}`;
    }

    setFormData((prev) => ({
      ...prev,
      location: loc,
    }));
  }, [selectedCountry, selectedRegion, selectedCity]);

  // ─── GENERAL FORM HANDLER ────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Specific handler for checkbox changes (used by LaptopForm & TabletForm)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // ─── LOCATION HANDLERS ──────────────────────────────────────────

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

  // ─── IMAGE UPLOAD ────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);

    const imageFiles = selected.filter(
      (file) => file.type.startsWith('image/')
    );

    const existingImages = mediaItems.filter(
      (item) => item.type === 'image'
    ).length;

    const remaining = 5 - existingImages;

    if (remaining <= 0) {
      setError('You can upload a maximum of 5 images.');
      e.target.value = '';
      return;
    }

    const filesToAdd = imageFiles.slice(0, remaining);

    const newItems = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'image',
    }));

    if (imageFiles.length > remaining) {
      setError(
        `Only ${remaining} more image${
          remaining === 1 ? '' : 's'
        } can be added.`
      );
    } else {
      setError('');
    }

    setMediaItems((prev) => [...prev, ...newItems]);

    e.target.value = '';
  };

  // ─── VIDEO UPLOAD ────────────────────────────────────────────────

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      e.target.value = '';
      return;
    }

    const existingVideo = mediaItems.some(
      (item) => item.type === 'video'
    );

    if (existingVideo) {
      setError('You can upload only one video.');
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be smaller than 50MB.');
      e.target.value = '';
      return;
    }

    setMediaItems((prev) => [
      ...prev,
      {
        file,
        preview: URL.createObjectURL(file),
        type: 'video',
      },
    ]);

    setError('');
    e.target.value = '';
  };

  // ─── REMOVE MEDIA ────────────────────────────────────────────────

  const removeMedia = (index) => {
    const item = mediaItems[index];

    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }

    setMediaItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ─── STEP NAVIGATION ────────────────────────────────────────────

  const goToNextStep = () => {
    // ✅ Check required fields for Step 1
    if (
      !formData.title.trim() ||
      !formData.price ||
      !formData.sellerPhone.trim()
    ) {
      setError(
        'Please fill in all required fields: Title, Price, and Phone Number.'
      );
      return;
    }

    if (Number(formData.price) < 0) {
      setError('Price cannot be negative.');
      return;
    }

    // ✅ Laptop-specific: brand must be selected (shown in Step 1)
    if (formData.category === 'Laptops' && !formData.brand) {
      setError('Please select a laptop brand.');
      return;
    }

    // ✅ Tablet-specific: brand must be selected (shown in Step 1)
    if (formData.category === 'Tablets' && !formData.brand) {
      setError('Please select a tablet brand.');
      return;
    }

    setError('');
    setStep(2);
  };

  const goToPreviousStep = () => {
    setStep(1);
    setError('');
  };

  // ─── SUBMIT PRODUCT ─────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!token) {
      setError(
        'You are not authenticated. Please log in again.'
      );
      return;
    }

    if (mediaItems.length === 0) {
      setError(
        'Please upload at least one image for your ad.'
      );
      setStep(1);
      return;
    }

    // ✅ Validate laptop model (only if category is Laptops)
    if (formData.category === 'Laptops' && !formData.model) {
      setError('Please select a laptop model.');
      return;
    }

    // ✅ Validate tablet model (only if category is Tablets)
    if (formData.category === 'Tablets' && !formData.model) {
      setError('Please select a tablet model.');
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        const value =
          typeof formData[key] === 'boolean'
            ? String(formData[key])
            : formData[key];

        form.append(key, value);
      });

      mediaItems.forEach((item) => {
        form.append('files', item.file);
      });

      console.log(
        '📤 Uploading media:',
        mediaItems.map((item) => ({
          name: item.file.name,
          type: item.file.type,
          size: item.file.size,
        }))
      );

      const data = await createProductWithFiles(form, token);

      console.log(
        '✅ Product upload response:',
        data
      );

      if (data?.product) {
        // Clean up local previews
        mediaItems.forEach((item) => {
          if (item.preview) {
            URL.revokeObjectURL(item.preview);
          }
        });

        navigate('/products');
      } else {
        setError(
          data?.message ||
          'Failed to post ad.'
        );
      }
    } catch (err) {
      console.error(
        '❌ Post ad error:',
        err
      );

      setError(
        err?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── AUTH SUBMIT ────────────────────────────────────────────────

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    setAuthError('');
    setAuthLoading(true);

    try {
      let result;

      if (authMode === 'login') {
        result = await login(
          authEmail,
          authPassword
        );
      } else {
        result = await register({
          name: authName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
        });
      }

      if (result?.success) {
        setShowAuthModal(false);

        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        setAuthPhone('');
        setAuthError('');
      } else {
        setAuthError(
          result?.error ||
          'Authentication failed'
        );
      }
    } catch (err) {
      setAuthError(
        err?.message ||
        'Something went wrong'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── AUTH MODE ─────────────────────────────────────────────────

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError('');
  };

  // ─── CHECK CATEGORIES ──────────────────────────────────────────

  const isLaptop = formData.category === 'Laptops';
  const isTablet = formData.category === 'Tablets';

  // ─── RENDER ─────────────────────────────────────────────────────

  return (
    <div className="post-ad-container">

      <h2>📢 Post Free Ad</h2>

      <p className="subtitle">
        {step === 1
          ? 'Step 1 of 2 – Basic details'
          : 'Step 2 of 2 – Additional details'}
      </p>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* =========================================================
            STEP 1
        ========================================================= */}

        {step === 1 && (
          <>

            {/* ─── CATEGORY ──────────────────────────────────────── */}

            <div className="form-group">
              <label>Category *</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
      
                <option value="Phones">📱 Phones</option>
                <option value="Laptops">💻 Laptops</option>
                <option value="Tablets">📲 Tablets</option>
                <option value="Accessories">🎧 Accessories</option>
                <option value="Electronics">📺 Electronics</option>
              </select>
            </div>

            {/* ─── LAPTOP BRAND (conditional) ──────────────────── */}

            {isLaptop && (
              <div className="form-group">
                <label>Laptop Brand *</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  <option value="">Select brand</option>
                  {LAPTOP_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ─── TABLET BRAND (conditional) ──────────────────── */}

            {isTablet && (
              <div className="form-group">
                <label>Tablet Brand *</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    background: 'white',
                  }}
                >
                  <option value="">Select brand</option>
                  {TABLET_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ─── TITLE ──────────────────────────────────────────── */}

            <div className="form-group">
              <label>Ad Title *</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder='Ad Title'
                required
              />
            </div>

            {/* ─── PRICE ──────────────────────────────────────────── */}

            <div className="form-group">
              <label>Price (GH₵) *</label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* ─── LOCATION ──────────────────────────────────────── */}

            <div className="form-group">

              <label>Location *</label>

              <select
                value={selectedCountry}
                onChange={handleCountryChange}
              >
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                  >
                    {country}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={handleRegionChange}
              >
                <option value="">
                  Select Region
                </option>

                {regions.map((region) => (
                  <option
                    key={region}
                    value={region}
                  >
                    {region}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedRegion}
              >
                <option value="">
                  Select City
                </option>

                {selectedRegion &&
                  citiesByRegion[
                    selectedRegion
                  ]?.map((city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  ))}
              </select>

              <span className="hint">
                Your ad will appear as:{' '}
                <strong>
                  {formData.location}
                </strong>
              </span>

            </div>

            {/* ─── SELLER NAME ───────────────────────────────────── */}

            <div className="form-group">

              <label>Your Name</label>

              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Your name"
              />

            </div>

            {/* ─── PHONE ──────────────────────────────────────────── */}

            <div className="form-group">

              <label>Phone Number *</label>

              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="054 123 4567"
                required
              />

            </div>

            {/* ─── DESCRIPTION ───────────────────────────────────── */}

            <div className="form-group">

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your item..."
              />

            </div>

            {/* ─── IMAGES ────────────────────────────────────────── */}

            <div className="form-group">

              <label>
                Upload Images (up to 5)
              </label>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />

              <span className="hint">
                Select up to 5 images.
              </span>

            </div>

            {/* ─── VIDEO ─────────────────────────────────────────── */}

            <div className="form-group">

              <label>
                Upload Video (optional)
              </label>

              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleVideoChange}
              />

              <span className="hint">
                MP4, MOV, AVI or WEBM. Maximum 50MB.
              </span>

            </div>

            {/* ─── MEDIA PREVIEW ────────────────────────────────── */}

            {mediaItems.length > 0 && (

              <div className="media-grid">

                {mediaItems.map(
                  (item, index) => (

                    <div
                      key={`${item.file.name}-${index}`}
                      className="media-item"
                    >

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          removeMedia(index)
                        }
                      >
                        ✕
                      </button>

                      {item.type === 'video' ? (

                        <video
                          src={item.preview}
                          muted
                          playsInline
                          controls
                        />

                      ) : (

                        <img
                          src={item.preview}
                          alt={`Preview ${
                            index + 1
                          }`}
                        />

                      )}

                      {item.type === 'video' && (
                        <span className="video-badge">
                          🎬
                        </span>
                      )}

                    </div>

                  )
                )}

              </div>

            )}

            {/* ─── NEXT BUTTON ───────────────────────────────────── */}

            <button
              type="button"
              className="btn-primary"
              onClick={goToNextStep}
            >
              Next: Additional Details →
            </button>

          </>
        )}

        {/* =========================================================
            STEP 2
        ========================================================= */}

        {step === 2 && (
          <>

            {/* ─── LAPTOP FORM (conditional) ────────────────────── */}

            {isLaptop && (
              <LaptopForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {/* ─── TABLET FORM (conditional) ────────────────────── */}

            {isTablet && (
              <TabletForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {/* ─── GENERAL FIELDS (shown for all categories except Laptops & Tablets) ── */}

            {!isLaptop && !isTablet && (
              <>

                {/* STORAGE */}

                <div className="form-group">

                  <label>Storage</label>

                  <select
                    name="storage"
                    value={formData.storage}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select storage
                    </option>

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

                {/* COLOR */}

                <div className="form-group">

                  <label>Color</label>

                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select color
                    </option>

                    {iphoneColors.map(
                      (color) => (
                        <option
                          key={color}
                          value={color}
                        >
                          {color}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* BATTERY */}

                <div className="form-group">

                  <label>
                    Battery Health (%)
                  </label>

                  <input
                    type="number"
                    name="batteryHealth"
                    value={formData.batteryHealth}
                    onChange={handleChange}
                    placeholder="e.g. 85"
                    min="0"
                    max="100"
                    step="1"
                  />

                  <span className="hint">
                    Enter battery health percentage (0–100).
                  </span>

                </div>

                {/* SIM */}

                <div className="form-group">

                  <label>SIM Status</label>

                  <select
                    name="simStatus"
                    value={formData.simStatus}
                    onChange={handleChange}
                  >
                    <option value="eSIM Unlocked">
                      eSIM Unlocked
                    </option>

                    <option value="SIM Unlocked">
                      SIM Unlocked
                    </option>

                    <option value="Locked">
                      Locked
                    </option>

                    <option value="Bypass">
                      Bypass
                    </option>
                  </select>

                </div>

                {/* FACE ID */}

                <div className="form-group">

                  <label>Face ID</label>

                  <select
                    name="faceId"
                    value={formData.faceId}
                    onChange={handleChange}
                  >
                    <option value="Working">
                      Working
                    </option>

                    <option value="Not Working">
                      Not Working
                    </option>

                    <option value="Not Available">
                      Not Available
                    </option>
                  </select>

                </div>

              </>
            )}

            {/* ─── CONDITION (shown for all categories) ────────── */}

            <div className="form-group">

              <label>Condition</label>

              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="Brand New">
                  Brand New
                </option>

                <option value="Like New">
                  Like New
                </option>

                <option value="Excellent">
                  Excellent
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Fair">
                  Fair
                </option>

                <option value="Poor">
                  Poor
                </option>
              </select>

            </div>

            {/* ─── WARRANTY PERIOD ──────────────────────────────── */}

            <div className="form-group">

              <label>Warranty Period</label>

              <select
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
              >
                <option value="">No warranty</option>

                {/* 1–4 weeks */}
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

                {/* 1 year (explicit) */}
                <option value="1 year">1 year</option>
              </select>

              <span className="hint">
                Choose the warranty period you offer with this item.
              </span>

            </div>

            {/* NEGOTIATION */}

            <div className="form-group">

              <label>Negotiation</label>

              <div className="checkbox-group">

                <input
                  type="checkbox"
                  name="negotiation"
                  checked={
                    formData.negotiation
                  }
                  onChange={handleChange}
                />

                <span>
                  Price is negotiable
                </span>

              </div>

              <span className="hint">
                If checked, buyers can negotiate.
              </span>

            </div>

            {/* SWAP */}

            <div className="form-group">

              <label>Swap Accepted</label>

              <div className="checkbox-group">

                <input
                  type="checkbox"
                  name="swapAccepted"
                  checked={
                    formData.swapAccepted
                  }
                  onChange={handleChange}
                />

                <span>
                  I accept trades / swaps
                </span>

              </div>

              <span className="hint">
                Indicate you are open to swapping.
              </span>

            </div>

            {/* BUTTONS */}

            <div className="step-buttons">

              <button
                type="button"
                className="btn-outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ flex: 2 }}
              >
                {isSubmitting
                  ? 'Publishing...'
                  : 'Publish Ad →'}
              </button>

            </div>

          </>
        )}

      </form>

      {/* =========================================================
          AUTH MODAL
      ========================================================= */}

      {showAuthModal && (

        <div
          className="auth-overlay"
          onClick={closeAuthModal}
        >

          <div
            className="auth-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="close-btn"
              onClick={closeAuthModal}
            >
              &times;
            </button>

            <h2>
              {authMode === 'login'
                ? 'Welcome Back 👋'
                : 'Join KN Classifieds 🚀'}
            </h2>

            <p className="auth-subtitle">
              {authMode === 'login'
                ? 'Login to publish your ad'
                : 'Create an account to publish your ad'}
            </p>

            {authError && (
              <div className="error-banner">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>

              {authMode === 'register' && (

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={authName}
                    onChange={(e) =>
                      setAuthName(
                        e.target.value
                      )
                    }
                    placeholder="John Doe"
                    required
                  />

                </div>

              )}

              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(
                      e.target.value
                    )
                  }
                  placeholder="your@email.com"
                  required
                />

              </div>

              <div className="form-group">

                <label>Password</label>

                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(
                      e.target.value
                    )
                  }
                  placeholder={
                    authMode === 'login'
                      ? 'Enter your password'
                      : 'Min 6 characters'
                  }
                  required
                  minLength="6"
                />

              </div>

              {authMode === 'register' && (

                <div className="form-group">

                  <label>
                    Phone (optional)
                  </label>

                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) =>
                      setAuthPhone(
                        e.target.value
                      )
                    }
                    placeholder="054 123 4567"
                  />

                </div>

              )}

              <button
                type="submit"
                className={
                  authMode === 'login'
                    ? 'btn-primary'
                    : 'btn-secondary'
                }
                disabled={authLoading}
              >
                {authLoading
                  ? authMode === 'login'
                    ? 'Logging in...'
                    : 'Creating account...'
                  : authMode === 'login'
                    ? 'Log In →'
                    : 'Create Account →'}
              </button>

            </form>

            <div className="auth-footer">

              {authMode === 'login' ? (

                <>
                  No account?{' '}

                  <span
                    onClick={() =>
                      switchAuthMode(
                        'register'
                      )
                    }
                  >
                    Create free account
                  </span>
                </>

              ) : (

                <>
                  Already have account?{' '}

                  <span
                    onClick={() =>
                      switchAuthMode(
                        'login'
                      )
                    }
                  >
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

export default PostAd;