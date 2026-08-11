// frontend/src/components/TabletForm.jsx
import React from 'react';

// ================================================================
// TABLET BRANDS
// ================================================================

export const TABLET_BRANDS = [
  'Apple',
  'Samsung',
  'Lenovo',
  'Huawei',
  'Microsoft',
  'Amazon',
  'Google',
  'Xiaomi',
  'Other',
];

// ================================================================
// APPLE IPAD MODELS (by screen size)
// ================================================================

export const IPAD_MODELS = [
  // iPad Pro series
  'iPad Pro 11" (1st Gen) - 2018',
  'iPad Pro 11" (2nd Gen) - 2020',
  'iPad Pro 11" (3rd Gen) - 2021',
  'iPad Pro 11" (4th Gen) - 2022',
  'iPad Pro 11" (5th Gen) - 2024',
  'iPad Pro 12.9" (3rd Gen) - 2018',
  'iPad Pro 12.9" (4th Gen) - 2020',
  'iPad Pro 12.9" (5th Gen) - 2021',
  'iPad Pro 12.9" (6th Gen) - 2022',
  'iPad Pro 12.9" (7th Gen) - 2024',
  'iPad Pro 13" (M4) - 2024',
  
  // iPad Air series
  'iPad Air 3 (10.5") - 2019',
  'iPad Air 4 (10.9") - 2020',
  'iPad Air 5 (10.9") - 2022',
  'iPad Air 6 (11") - 2024',
  'iPad Air 6 (13") - 2024',
  'iPad Air 7 (11") - 2025',
  'iPad Air 7 (13") - 2025',
  
  // iPad mini series
  'iPad mini 5 (7.9") - 2019',
  'iPad mini 6 (8.3") - 2021',
  'iPad mini 7 (8.3") - 2024',
  
  // iPad standard series
  'iPad (7th Gen) 10.2" - 2019',
  'iPad (8th Gen) 10.2" - 2020',
  'iPad (9th Gen) 10.2" - 2021',
  'iPad (10th Gen) 10.9" - 2022',
  'iPad (11th Gen) 10.9" - 2024',
  'iPad (12th Gen) 11" - 2025',
];

// ================================================================
// SAMSUNG GALAXY TAB MODELS
// ================================================================

const SAMSUNG_TAB_MODELS = [
  'Galaxy Tab S9 Ultra 14.6"',
  'Galaxy Tab S9+ 12.4"',
  'Galaxy Tab S9 11"',
  'Galaxy Tab S8 Ultra 14.6"',
  'Galaxy Tab S8+ 12.4"',
  'Galaxy Tab S8 11"',
  'Galaxy Tab S7+ 12.4"',
  'Galaxy Tab S7 11"',
  'Galaxy Tab A8 10.5"',
  'Galaxy Tab A7 Lite 8.7"',
  'Galaxy Tab Active 5',
  'Galaxy Tab S6 Lite 10.4"',
  'Galaxy Tab S9 FE 10.9"',
  'Galaxy Tab S9 FE+ 12.4"',
];

// ================================================================
// OTHER TABLET MODELS
// ================================================================

const LENOVO_TAB_MODELS = [
  'Lenovo Tab P12',
  'Lenovo Tab P11',
  'Lenovo Yoga Tab 13',
  'Lenovo Tab M10',
  'Lenovo Tab M8',
];

const HUAWEI_TAB_MODELS = [
  'Huawei MatePad Pro 13.2"',
  'Huawei MatePad Pro 12.6"',
  'Huawei MatePad 11"',
  'Huawei MatePad T10',
  'Huawei MediaPad M5',
];

const MICROSOFT_TAB_MODELS = [
  'Surface Pro 9',
  'Surface Pro 8',
  'Surface Pro X',
  'Surface Go 3',
  'Surface Go 2',
  'Surface Book 3',
];

const AMAZON_TAB_MODELS = [
  'Fire HD 10',
  'Fire HD 8',
  'Fire HD 7',
  'Fire Max 11',
];

const GOOGLE_TAB_MODELS = [
  'Pixel Slate',
  'Pixel Tablet',
];

const XIAOMI_TAB_MODELS = [
  'Xiaomi Pad 6',
  'Xiaomi Pad 5',
  'Xiaomi Pad 6 Pro',
  'Xiaomi Pad 6S Pro',
];

// ================================================================
// GET MODELS BY BRAND
// ================================================================

export const getTabletModelsByBrand = (brand) => {
  switch (brand) {
    case 'Apple':
      return IPAD_MODELS;
    case 'Samsung':
      return SAMSUNG_TAB_MODELS;
    case 'Lenovo':
      return LENOVO_TAB_MODELS;
    case 'Huawei':
      return HUAWEI_TAB_MODELS;
    case 'Microsoft':
      return MICROSOFT_TAB_MODELS;
    case 'Amazon':
      return AMAZON_TAB_MODELS;
    case 'Google':
      return GOOGLE_TAB_MODELS;
    case 'Xiaomi':
      return XIAOMI_TAB_MODELS;
    default:
      return [];
  }
};

// ================================================================
// TABLET COLORS
// ================================================================

export const TABLET_COLORS = [
  'Space Gray',
  'Silver',
  'Gold',
  'Rose Gold',
  'Starlight',
  'Midnight',
  'Blue',
  'Pink',
  'Purple',
  'Green',
  'Red',
  'White',
  'Black',
  'Graphite',
  'Sierra Blue',
  'Alpine Green',
  'Deep Purple',
  'Coral',
  'Yellow',
  'Orange',
];

// ================================================================
// SCREEN SIZE OPTIONS (for tablets)
// ================================================================

export const TABLET_SCREEN_SIZES = [
  '7.9"',
  '8.3"',
  '8.7"',
  '9.7"',
  '10.2"',
  '10.4"',
  '10.5"',
  '10.9"',
  '11"',
  '11.6"',
  '12.4"',
  '12.9"',
  '13"',
  '13.2"',
  '13.6"',
  '14.6"',
  '15.6"',
];

// ================================================================
// STORAGE OPTIONS
// ================================================================

export const TABLET_STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

// ================================================================
// CONNECTIVITY OPTIONS
// ================================================================

export const CONNECTIVITY_OPTIONS = ['Wi-Fi', 'Wi-Fi + Cellular'];

// ================================================================
// YEAR OPTIONS
// ================================================================

export const YEAR_OPTIONS = [];
for (let year = 2015; year <= new Date().getFullYear() + 1; year++) {
  YEAR_OPTIONS.push(year.toString());
}

// ================================================================
// CONDITION OPTIONS
// ================================================================

export const TABLET_CONDITION_OPTIONS = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
];

// ================================================================
// WARRANTY OPTIONS
// ================================================================

export const TABLET_WARRANTY_OPTIONS = [
  'No warranty',
  '1 month',
  '2 months',
  '3 months',
  '6 months',
  '1 year',
  '2 years',
  '3 years',
  'Other',
];

// ================================================================
// TABLET FORM COMPONENT
// ================================================================

const TabletForm = ({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  const brandModels = getTabletModelsByBrand(formData.brand);

  return (
    <div className="tablet-form">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        📱 Tablet Specifications
      </h3>

      {/* Brand */}
      <div className="form-group" style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
          Brand *
        </label>
        <select
          name="brand"
          value={formData.brand || ''}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '10px 14px',
            border: errors.brand ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
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
        {errors.brand && (
          <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.brand}
          </span>
        )}
      </div>

      {/* Model */}
      <div className="form-group" style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
          Model *
        </label>
        <select
          name="model"
          value={formData.model || ''}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '10px 14px',
            border: errors.model ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            background: 'white',
          }}
          disabled={!formData.brand}
        >
          <option value="">
            {formData.brand ? 'Select model' : 'Select a brand first'}
          </option>
          {brandModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        {errors.model && (
          <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errors.model}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Year */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Year
          </label>
          <select
            name="year"
            value={formData.year || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.year ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select year</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Storage */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Storage
          </label>
          <select
            name="storage"
            value={formData.storage || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.storage ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select storage</option>
            {TABLET_STORAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Screen Size */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Screen Size
          </label>
          <select
            name="screenSize"
            value={formData.screenSize || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.screenSize ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select screen size</option>
            {TABLET_SCREEN_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Connectivity */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Connectivity
          </label>
          <select
            name="connectivity"
            value={formData.connectivity || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.connectivity ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select connectivity</option>
            {CONNECTIVITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Color */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Color
          </label>
          <select
            name="color"
            value={formData.color || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.color ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select color</option>
            {TABLET_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Condition *
          </label>
          <select
            name="condition"
            value={formData.condition || ''}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.condition ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select condition</option>
            {TABLET_CONDITION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Battery Health */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Battery Health (%)
          </label>
          <input
            type="number"
            name="batteryHealth"
            value={formData.batteryHealth || ''}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="e.g. 85"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.batteryHealth ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          />
        </div>

        {/* Warranty */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Warranty
          </label>
          <select
            name="warranty"
            value={formData.warranty || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.warranty ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            {TABLET_WARRANTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Negotiation & Swap */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            name="negotiation"
            checked={formData.negotiation || false}
            onChange={handleCheckboxChange}
          />
          <label style={{ fontWeight: 600, fontSize: '13px' }}>Negotiable</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            name="swapAccepted"
            checked={formData.swapAccepted || false}
            onChange={handleCheckboxChange}
          />
          <label style={{ fontWeight: 600, fontSize: '13px' }}>Swap Accepted</label>
        </div>
      </div>

      <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-500)' }}>
        * Required fields
      </div>
    </div>
  );
};

export default TabletForm;