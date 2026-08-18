import React from 'react';

// ─── Laptop Brands ────────────────────────────────────────────────
export const LAPTOP_BRANDS = [
  'Apple',
  'Dell',
  'HP',
  'Lenovo',
  'Acer',
  'Asus',
  'Samsung',
  'Microsoft',
  'Toshiba',
  'Sony',
  'Razer',
  'MSI',
  'LG',
  'Huawei',
  'Xiaomi',
  'MacBook Neo',   // ✅ Added
  'Other',
];

// ─── Apple Models ─────────────────────────────────────────────────
const APPLE_MODELS = [
  'MacBook Air (M1)',
  'MacBook Air (M2)',
  'MacBook Air (M3)',
  'MacBook Pro 13" (M1)',
  'MacBook Pro 13" (M2)',
  'MacBook Pro 14" (M1 Pro/Max)',
  'MacBook Pro 14" (M2 Pro/Max)',
  'MacBook Pro 14" (M3 Pro/Max)',
  'MacBook Pro 16" (M1 Pro/Max)',
  'MacBook Pro 16" (M2 Pro/Max)',
  'MacBook Pro 16" (M3 Pro/Max)',
  'MacBook Pro 13" (Intel)',
  'MacBook Pro 15" (Intel)',
  'MacBook Pro 16" (Intel)',
  'MacBook (Retina)',
  'MacBook Air (Intel)',
];

// ─── Dell Models ──────────────────────────────────────────────────
const DELL_MODELS = [
  'XPS 13',
  'XPS 15',
  'XPS 17',
  'Inspiron 14',
  'Inspiron 15',
  'Inspiron 16',
  'Latitude 3420',
  'Latitude 3520',
  'Latitude 5420',
  'Latitude 5520',
  'Precision 3560',
  'Precision 5560',
  'Precision 5760',
  'Alienware m15',
  'Alienware m17',
  'Alienware x14',
  'Alienware x16',
];

// ─── HP Models ────────────────────────────────────────────────────
const HP_MODELS = [
  'Spectre x360 14',
  'Spectre x360 16',
  'Spectre Folio',
  'Envy x360 13',
  'Envy x360 15',
  'Envy 14',
  'Envy 16',
  'Pavilion 14',
  'Pavilion 15',
  'Pavilion 16',
  'Dragonfly G4',
  'EliteBook 840 G8',
  'EliteBook 845 G8',
  'EliteBook 1040 G8',
  'Omen 16',
  'Omen 17',
  'ZBook Fury 16 G9',
];

// ─── Lenovo Models ────────────────────────────────────────────────
const LENOVO_MODELS = [
  'ThinkPad X1 Carbon Gen 10',
  'ThinkPad X1 Carbon Gen 11',
  'ThinkPad X1 Yoga Gen 7',
  'ThinkPad X1 Nano Gen 2',
  'ThinkPad T14 Gen 3',
  'ThinkPad T14s Gen 3',
  'ThinkPad T16 Gen 2',
  'ThinkPad P16',
  'Yoga 9i',
  'Yoga 7i',
  'Yoga Slim 7i',
  'Legion 5 Pro',
  'Legion 7i',
  'Legion Slim 7i',
  'IdeaPad 5',
  'IdeaPad Duet',
];

// ─── Acer Models ──────────────────────────────────────────────────
const ACER_MODELS = [
  'Aspire 3',
  'Aspire 5',
  'Aspire 7',
  'Swift 3',
  'Swift 5',
  'Swift X',
  'Spin 5',
  'Spin 7',
  'Predator Helios 300',
  'Predator Triton 500',
  'Nitro 5',
  'ConceptD 3',
  'ConceptD 5',
];

// ─── Asus Models ──────────────────────────────────────────────────
const ASUS_MODELS = [
  'ZenBook 13 OLED',
  'ZenBook 14 OLED',
  'ZenBook 15 OLED',
  'ZenBook Pro Duo 15',
  'Vivobook 13',
  'Vivobook 14',
  'Vivobook 15',
  'Vivobook 16',
  'Vivobook Pro 15',
  'TUF Gaming F15',
  'TUF Gaming A15',
  'ROG Zephyrus G14',
  'ROG Zephyrus G15',
  'ROG Strix G16',
  'ROG Strix G18',
  'ROG Flow X13',
  'ExpertBook B9',
];

// ─── Samsung Models ──────────────────────────────────────────────
const SAMSUNG_MODELS = [
  'Galaxy Book 3 Ultra',
  'Galaxy Book 3 Pro 360',
  'Galaxy Book 3 Pro',
  'Galaxy Book 3 360',
  'Galaxy Book 2 Pro',
  'Galaxy Book 2 360',
  'Galaxy Book Pro',
  'Galaxy Book Pro 360',
  'Galaxy Book Go',
];

// ─── Microsoft Models ────────────────────────────────────────────
const MICROSOFT_MODELS = [
  'Surface Laptop 5',
  'Surface Laptop 4',
  'Surface Laptop 3',
  'Surface Pro 9',
  'Surface Pro 8',
  'Surface Pro X',
  'Surface Book 3',
  'Surface Studio 2',
  'Surface Laptop Studio',
];

// ─── MacBook Neo Models ──────────────────────────────────────────
const MACBOOK_NEO_MODELS = [
  'MacBook Neo (M3)',
  'MacBook Neo (M3 Pro)',
  'MacBook Neo (M3 Max)',
  'MacBook Neo (M4)',
  'MacBook Neo (M4 Pro)',
  'MacBook Neo (M4 Max)',
  'MacBook Neo (Intel Core i7)',
  'MacBook Neo (Intel Core i9)',
];

// ─── Get models based on brand ──────────────────────────────────
export const getModelsByBrand = (brand) => {
  switch (brand) {
    case 'Apple':
      return APPLE_MODELS;
    case 'Dell':
      return DELL_MODELS;
    case 'HP':
      return HP_MODELS;
    case 'Lenovo':
      return LENOVO_MODELS;
    case 'Acer':
      return ACER_MODELS;
    case 'Asus':
      return ASUS_MODELS;
    case 'Samsung':
      return SAMSUNG_MODELS;
    case 'Microsoft':
      return MICROSOFT_MODELS;
    case 'MacBook Neo':
      return MACBOOK_NEO_MODELS;
    default:
      return [];
  }
};

// ─── Processor options ───────────────────────────────────────────
export const PROCESSOR_OPTIONS = [
  'Intel Core i3',
  'Intel Core i5',
  'Intel Core i7',
  'Intel Core i9',
  'Intel Celeron',
  'Intel Pentium',
  'AMD Ryzen 3',
  'AMD Ryzen 5',
  'AMD Ryzen 7',
  'AMD Ryzen 9',
  'AMD Athlon',
  'Apple M1',
  'Apple M2',
  'Apple M3',
  'Apple M1 Pro',
  'Apple M1 Max',
  'Apple M2 Pro',
  'Apple M2 Max',
  'Apple M3 Pro',
  'Apple M3 Max',
  'Apple M4',          // ✅ Added for MacBook Neo
  'Apple M4 Pro',
  'Apple M4 Max',
  'Other',
];

// ─── RAM options ─────────────────────────────────────────────────
export const RAM_OPTIONS = ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'];

// ─── Storage options ─────────────────────────────────────────────
export const STORAGE_OPTIONS = ['128GB', '256GB', '512GB', '1TB', '2TB', '4TB'];

// ─── Screen size options ─────────────────────────────────────────
export const SCREEN_SIZE_OPTIONS = [
  '11"',
  '12"',
  '13.3"',
  '14"',
  '15.6"',
  '16"',
  '17.3"',
  '18"',
];

// ─── Graphics options ────────────────────────────────────────────
export const GRAPHICS_OPTIONS = [
  'Integrated Graphics',
  'Intel Iris Xe',
  'Intel UHD Graphics',
  'NVIDIA GeForce GTX 1650',
  'NVIDIA GeForce GTX 1660 Ti',
  'NVIDIA GeForce RTX 2050',
  'NVIDIA GeForce RTX 3050',
  'NVIDIA GeForce RTX 3060',
  'NVIDIA GeForce RTX 3070',
  'NVIDIA GeForce RTX 3080',
  'NVIDIA GeForce RTX 4050',
  'NVIDIA GeForce RTX 4060',
  'NVIDIA GeForce RTX 4070',
  'NVIDIA GeForce RTX 4080',
  'NVIDIA GeForce RTX 4090',
  'AMD Radeon Graphics',
  'AMD Radeon RX 6500M',
  'AMD Radeon RX 6600M',
  'AMD Radeon RX 6700M',
  'AMD Radeon RX 6800M',
  'Apple M1 7-core GPU',
  'Apple M1 8-core GPU',
  'Apple M2 8-core GPU',
  'Apple M2 10-core GPU',
  'Apple M3 8-core GPU',
  'Apple M3 10-core GPU',
  'Apple M3 Pro 14-core GPU',
  'Apple M3 Pro 18-core GPU',
  'Apple M3 Max 30-core GPU',
  'Apple M3 Max 40-core GPU',
  'Apple M4 10-core GPU',     // ✅ Added for MacBook Neo
  'Apple M4 Pro 16-core GPU',
  'Apple M4 Max 32-core GPU',
  'Other',
];

// ─── Condition options ───────────────────────────────────────────
export const CONDITION_OPTIONS = [
  'Brand New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
];

// ─── Warranty options ────────────────────────────────────────────
export const WARRANTY_OPTIONS = [
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

// ─── Component ────────────────────────────────────────────────────
const LaptopForm = ({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  const brandModels = getModelsByBrand(formData.brand);

  return (
    <div className="laptop-form">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        💻 Laptop Specifications
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
          {LAPTOP_BRANDS.map((brand) => (
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
        {/* Processor */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Processor
          </label>
          <select
            name="processor"
            value={formData.processor || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.processor ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select processor</option>
            {PROCESSOR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* RAM */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            RAM
          </label>
          <select
            name="ram"
            value={formData.ram || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.ram ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select RAM</option>
            {RAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
            {STORAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

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
            {SCREEN_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Graphics */}
        <div className="form-group">
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
            Graphics
          </label>
          <select
            name="graphics"
            value={formData.graphics || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.graphics ? '1.5px solid #dc2626' : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select graphics</option>
            {GRAPHICS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
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
            {CONDITION_OPTIONS.map((option) => (
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
            {WARRANTY_OPTIONS.map((option) => (
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

export default LaptopForm;