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
// APPLE IPAD MODELS
// ================================================================

export const IPAD_MODELS = [
  // =========================================================
  // iPad — Standard
  // =========================================================
  'iPad (1st generation) — 2010',
  'iPad 2 — 2011',
  'iPad (3rd generation) — 2012',
  'iPad (4th generation) — 2012',
  'iPad (5th generation) — 2017',
  'iPad (6th generation) — 2018',
  'iPad (7th generation) — 2019',
  'iPad (8th generation) — 2020',
  'iPad (9th generation) — 2021',
  'iPad (10th generation) — 2022',
  'iPad (A16) — 2025',

  // =========================================================
  // iPad Air
  // =========================================================
  'iPad Air (1st generation) — 2013',
  'iPad Air 2 — 2014',
  'iPad Air (3rd generation) — 2019',
  'iPad Air (4th generation) — 2020',
  'iPad Air (5th generation) — 2022',
  'iPad Air 11-inch (M2) — 2024',
  'iPad Air 13-inch (M2) — 2024',
  'iPad Air 11-inch (M3) — 2025',
  'iPad Air 13-inch (M3) — 2025',
  'iPad Air 11-inch (M4) — 2026',
  'iPad Air 13-inch (M4) — 2026',

  // =========================================================
  // iPad mini
  // =========================================================
  'iPad mini (1st generation) — 2012',
  'iPad mini 2 — 2013',
  'iPad mini 3 — 2014',
  'iPad mini 4 — 2015',
  'iPad mini (5th generation) — 2019',
  'iPad mini (6th generation) — 2021',
  'iPad mini (A17 Pro) — 2024',

  // =========================================================
  // iPad Pro — 9.7-inch
  // =========================================================
  'iPad Pro 9.7-inch — 2016',

  // =========================================================
  // iPad Pro — 10.5-inch
  // =========================================================
  'iPad Pro 10.5-inch — 2017',

  // =========================================================
  // iPad Pro — 11-inch
  // =========================================================
  'iPad Pro 11-inch (1st generation) — 2018',
  'iPad Pro 11-inch (2nd generation) — 2020',
  'iPad Pro 11-inch (3rd generation) — 2021',
  'iPad Pro 11-inch (4th generation) — 2022',
  'iPad Pro 11-inch (M4) — 2024',
  'iPad Pro 11-inch (M5) — 2025',

  // =========================================================
  // iPad Pro — 12.9-inch
  // =========================================================
  'iPad Pro 12.9-inch (1st generation) — 2015',
  'iPad Pro 12.9-inch (2nd generation) — 2017',
  'iPad Pro 12.9-inch (3rd generation) — 2018',
  'iPad Pro 12.9-inch (4th generation) — 2020',
  'iPad Pro 12.9-inch (5th generation) — 2021',
  'iPad Pro 12.9-inch (6th generation) — 2022',

  // =========================================================
  // iPad Pro — 13-inch
  // =========================================================
  'iPad Pro 13-inch (M4) — 2024',
  'iPad Pro 13-inch (M5) — 2025',

  // =========================================================
  // Other
  // =========================================================
  'Other',
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
// LENOVO TABLET MODELS
// ================================================================

const LENOVO_TAB_MODELS = [
  'Lenovo Tab P12',
  'Lenovo Tab P11',
  'Lenovo Yoga Tab 13',
  'Lenovo Tab M10',
  'Lenovo Tab M8',
];

// ================================================================
// HUAWEI TABLET MODELS
// ================================================================

const HUAWEI_TAB_MODELS = [
  'Huawei MatePad Pro 13.2"',
  'Huawei MatePad Pro 12.6"',
  'Huawei MatePad 11"',
  'Huawei MatePad T10',
  'Huawei MediaPad M5',
];

// ================================================================
// MICROSOFT TABLET MODELS
// ================================================================

const MICROSOFT_TAB_MODELS = [
  'Surface Pro 9',
  'Surface Pro 8',
  'Surface Pro X',
  'Surface Go 3',
  'Surface Go 2',
  'Surface Book 3',
];

// ================================================================
// AMAZON TABLET MODELS
// ================================================================

const AMAZON_TAB_MODELS = [
  'Fire HD 10',
  'Fire HD 8',
  'Fire HD 7',
  'Fire Max 11',
];

// ================================================================
// GOOGLE TABLET MODELS
// ================================================================

const GOOGLE_TAB_MODELS = [
  'Pixel Slate',
  'Pixel Tablet',
];

// ================================================================
// XIAOMI TABLET MODELS
// ================================================================

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
      // ✅ FIX: return an array with "Other" so the model dropdown isn't empty
      return ['Other'];
  }
};

// ================================================================
// TABLET COLORS
// ================================================================
// IMPORTANT:
// This list intentionally contains NO duplicate values.
// This prevents React warnings such as:
// "Encountered two children with the same key, Purple."
// ================================================================

export const TABLET_COLORS = [
  // ─── Apple / Premium ──────────────────────────────────────────
  'Space Gray',
  'Space Black',
  'Silver',
  'Gold',
  'Rose Gold',
  'Starlight',
  'Midnight',
  'Blue',
  'Purple',
  'Pink',
  'Green',
  'Yellow',
  'Red',
  'Orange',

  // ─── Samsung / Android ───────────────────────────────────────
  'Graphite',
  'Mystic Black',
  'Mystic Bronze',
  'Mystic Navy',
  'Phantom Black',
  'Phantom Silver',
  'Phantom Gray',
  'Phantom White',
  'Cream',
  'Beige',
  'Lavender',
  'Mint',
  'Navy',

  // ─── General Colors ───────────────────────────────────────────
  'Black',
  'Matte Black',
  'Jet Black',
  'Dark Gray',
  'Gray',
  'Charcoal',
  'White',
  'Pearl White',
  'Arctic White',

  // ─── Blue ─────────────────────────────────────────────────────
  'Dark Blue',
  'Light Blue',
  'Sky Blue',
  'Navy Blue',
  'Sierra Blue',
  'Alpine Blue',

  // ─── Green ────────────────────────────────────────────────────
  'Dark Green',
  'Forest Green',
  'Olive Green',
  'Mint Green',
  'Alpine Green',

  // ─── Pink / Red ───────────────────────────────────────────────
  'Dark Red',
  'Coral',
  'Rose',
  'Light Pink',

  // ─── Purple ───────────────────────────────────────────────────
  'Deep Purple',
  'Light Purple',

  // ─── Brown / Beige ────────────────────────────────────────────
  'Brown',
  'Dark Brown',
  'Light Beige',
  'Sand',
  'Champagne',

  // ─── Metallic ─────────────────────────────────────────────────
  'Bronze',
  'Copper',

  // ─── Other ────────────────────────────────────────────────────
  'Other',
];

// ================================================================
// TABLET SCREEN SIZE OPTIONS
// ================================================================

export const TABLET_SCREEN_SIZES = [
  '7.0"',
  '7.9"',
  '8.0"',
  '8.3"',
  '8.7"',
  '9.0"',
  '9.7"',
  '10.1"',
  '10.2"',
  '10.4"',
  '10.5"',
  '10.9"',
  '11.0"',
  '11.6"',
  '12.0"',
  '12.4"',
  '12.9"',
  '13.0"',
  '13.2"',
  '13.6"',
  '14.0"',
  '14.6"',
  '15.6"',
  'Other',
];

// ================================================================
// STORAGE OPTIONS
// ================================================================

export const TABLET_STORAGE_OPTIONS = [
  '16GB',
  '32GB',
  '64GB',
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB',
];

// ================================================================
// CONNECTIVITY OPTIONS
// ================================================================

export const CONNECTIVITY_OPTIONS = [
  'Wi-Fi',
  'Wi-Fi + Cellular',
];

// ================================================================
// YEAR OPTIONS
// ================================================================

export const YEAR_OPTIONS = [];

for (
  let year = 2010;
  year <= new Date().getFullYear() + 1;
  year++
) {
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

      {/* ========================================================
          TITLE
      ======================================================== */}

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >
        📱 Tablet Specifications
      </h3>

      {/* ========================================================
          BRAND
      ======================================================== */}

      <div
        className="form-group"
        style={{ marginBottom: '14px' }}
      >
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '4px',
          }}
        >
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
            border: errors.brand
              ? '1.5px solid #dc2626'
              : '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            background: 'white',
          }}
        >
          <option value="">Select brand</option>

          {TABLET_BRANDS.map((brand) => (
            <option
              key={brand}
              value={brand}
            >
              {brand}
            </option>
          ))}
        </select>

        {errors.brand && (
          <span
            style={{
              color: '#dc2626',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {errors.brand}
          </span>
        )}
      </div>

      {/* ========================================================
          MODEL
      ======================================================== */}

      <div
        className="form-group"
        style={{ marginBottom: '14px' }}
      >
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '4px',
          }}
        >
          Model *
        </label>

        <select
          name="model"
          value={formData.model || ''}
          onChange={handleChange}
          required
          disabled={!formData.brand}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: errors.model
              ? '1.5px solid #dc2626'
              : '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            background: 'white',
          }}
        >
          <option value="">
            {formData.brand
              ? 'Select model'
              : 'Select a brand first'}
          </option>

          {brandModels.map((model) => (
            <option
              key={model}
              value={model}
            >
              {model}
            </option>
          ))}
        </select>

        {errors.model && (
          <span
            style={{
              color: '#dc2626',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {errors.model}
          </span>
        )}
      </div>

      {/* ========================================================
          YEAR + STORAGE
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >

        {/* Year */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Year
          </label>

          <select
            name="year"
            value={formData.year || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.year
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select year</option>

            {YEAR_OPTIONS.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Storage */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Storage
          </label>

          <select
            name="storage"
            value={formData.storage || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.storage
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select storage</option>

            {TABLET_STORAGE_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================
          SCREEN SIZE + CONNECTIVITY
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >

        {/* Screen Size */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Screen Size
          </label>

          <select
            name="screenSize"
            value={formData.screenSize || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.screenSize
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select screen size
            </option>

            {TABLET_SCREEN_SIZES.map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Connectivity */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Connectivity
          </label>

          <select
            name="connectivity"
            value={formData.connectivity || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.connectivity
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select connectivity
            </option>

            {CONNECTIVITY_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================
          COLOR + CONDITION
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >

        {/* Color */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Color
          </label>

          <select
            name="color"
            value={formData.color || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.color
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select color
            </option>

            {TABLET_COLORS.map((color) => (
              <option
                key={color}
                value={color}
              >
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
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
              border: errors.condition
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select condition
            </option>

            {TABLET_CONDITION_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================
          BATTERY + WARRANTY
      ======================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >

        {/* Battery Health */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
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
              border: errors.batteryHealth
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          />
        </div>

        {/* Warranty */}

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Warranty
          </label>

          <select
            name="warranty"
            value={formData.warranty || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.warranty
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            {TABLET_WARRANTY_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================
          NEGOTIATION + SWAP
      ======================================================== */}

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '16px',
        }}
      >

        {/* Negotiation */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="checkbox"
            name="negotiation"
            checked={formData.negotiation || false}
            onChange={handleCheckboxChange}
          />

          <label
            style={{
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Negotiable
          </label>
        </div>

        {/* Swap */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="checkbox"
            name="swapAccepted"
            checked={formData.swapAccepted || false}
            onChange={handleCheckboxChange}
          />

          <label
            style={{
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Swap Accepted
          </label>
        </div>
      </div>

      {/* ========================================================
          REQUIRED FIELDS
      ======================================================== */}

      <div
        style={{
          marginTop: '12px',
          fontSize: '13px',
          color: 'var(--gray-500)',
        }}
      >
        * Required fields
      </div>

    </div>
  );
};

export default TabletForm;