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
  'Other',
];

// ─── Apple Models ─────────────────────────────────────────────────
const APPLE_MODELS = [
  // ============================================================
  // MacBook Neo
  // ============================================================
  'MacBook Neo (2026)',

  // ============================================================
  // MacBook Air
  // ============================================================
  'MacBook Air 13-inch (M1)',
  'MacBook Air 13-inch (M2)',
  'MacBook Air 13-inch (M3)',
  'MacBook Air 13-inch (M4)',

  'MacBook Air 15-inch (M2)',
  'MacBook Air 15-inch (M3)',
  'MacBook Air 15-inch (M4)',

  // Intel MacBook Air
  'MacBook Air 13-inch (Intel, 2018)',
  'MacBook Air 13-inch (Intel, 2019)',
  'MacBook Air 13-inch (Intel, 2020)',

  // ============================================================
  // MacBook Pro 13-inch
  // ============================================================
  'MacBook Pro 13-inch (M1)',
  'MacBook Pro 13-inch (M2)',

  'MacBook Pro 13-inch (Intel, 2016)',
  'MacBook Pro 13-inch (Intel, 2017)',
  'MacBook Pro 13-inch (Intel, 2018)',
  'MacBook Pro 13-inch (Intel, 2019)',
  'MacBook Pro 13-inch (Intel, 2020)',

  // ============================================================
  // MacBook Pro 14-inch
  // ============================================================
  'MacBook Pro 14-inch (M1 Pro/Max)',
  'MacBook Pro 14-inch (M2 Pro/Max)',
  'MacBook Pro 14-inch (M3 Pro/Max)',
  'MacBook Pro 14-inch (M4 Pro/Max)',

  // ============================================================
  // MacBook Pro 15-inch
  // ============================================================
  'MacBook Pro 15-inch (Intel, 2016)',
  'MacBook Pro 15-inch (Intel, 2017)',
  'MacBook Pro 15-inch (Intel, 2018)',
  'MacBook Pro 15-inch (Intel, 2019)',

  // ============================================================
  // MacBook Pro 16-inch
  // ============================================================
  'MacBook Pro 16-inch (Intel, 2019)',
  'MacBook Pro 16-inch (Intel, 2020)',
  'MacBook Pro 16-inch (M1 Pro/Max)',
  'MacBook Pro 16-inch (M2 Pro/Max)',
  'MacBook Pro 16-inch (M3 Pro/Max)',
  'MacBook Pro 16-inch (M4 Pro/Max)',

  // ============================================================
  // Older MacBook
  // ============================================================
  'MacBook 12-inch (Retina, 2015)',
  'MacBook 12-inch (Retina, 2016)',
  'MacBook 12-inch (Retina, 2017)',
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

// ─── Get models based on brand ───────────────────────────────────
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

    default:
      return [];
  }
};

// ─── Processor options ───────────────────────────────────────────
export const PROCESSOR_OPTIONS = [
  // ============================================================
  // APPLE SILICON
  // ============================================================

  // MacBook Neo
  'Apple A18 Pro',

  'Apple M1',
  'Apple M1 Pro',
  'Apple M1 Max',
  'Apple M1 Ultra',

  'Apple M2',
  'Apple M2 Pro',
  'Apple M2 Max',
  'Apple M2 Ultra',

  'Apple M3',
  'Apple M3 Pro',
  'Apple M3 Max',
  'Apple M3 Ultra',

  'Apple M4',
  'Apple M4 Pro',
  'Apple M4 Max',
  'Apple M4 Ultra',

  'Apple A-series / Other Apple Silicon',

  // ============================================================
  // INTEL CORE ULTRA
  // ============================================================
  'Intel Core Ultra 3',
  'Intel Core Ultra 5',
  'Intel Core Ultra 7',
  'Intel Core Ultra 9',

  'Intel Core Ultra 5 100 Series',
  'Intel Core Ultra 7 100 Series',
  'Intel Core Ultra 9 100 Series',

  'Intel Core Ultra 5 200 Series',
  'Intel Core Ultra 7 200 Series',
  'Intel Core Ultra 9 200 Series',

  // ============================================================
  // INTEL CORE i3
  // ============================================================
  'Intel Core i3',
  'Intel Core i3-2nd Gen',
  'Intel Core i3-3rd Gen',
  'Intel Core i3-4th Gen',
  'Intel Core i3-5th Gen',
  'Intel Core i3-6th Gen',
  'Intel Core i3-7th Gen',
  'Intel Core i3-8th Gen',
  'Intel Core i3-9th Gen',
  'Intel Core i3-10th Gen',
  'Intel Core i3-11th Gen',
  'Intel Core i3-12th Gen',
  'Intel Core i3-13th Gen',
  'Intel Core i3-N Series',

  // ============================================================
  // INTEL CORE i5
  // ============================================================
  'Intel Core i5',
  'Intel Core i5-2nd Gen',
  'Intel Core i5-3rd Gen',
  'Intel Core i5-4th Gen',
  'Intel Core i5-5th Gen',
  'Intel Core i5-6th Gen',
  'Intel Core i5-7th Gen',
  'Intel Core i5-8th Gen',
  'Intel Core i5-9th Gen',
  'Intel Core i5-10th Gen',
  'Intel Core i5-11th Gen',
  'Intel Core i5-12th Gen',
  'Intel Core i5-13th Gen',
  'Intel Core i5-14th Gen',

  // ============================================================
  // INTEL CORE i7
  // ============================================================
  'Intel Core i7',
  'Intel Core i7-2nd Gen',
  'Intel Core i7-3rd Gen',
  'Intel Core i7-4th Gen',
  'Intel Core i7-5th Gen',
  'Intel Core i7-6th Gen',
  'Intel Core i7-7th Gen',
  'Intel Core i7-8th Gen',
  'Intel Core i7-9th Gen',
  'Intel Core i7-10th Gen',
  'Intel Core i7-11th Gen',
  'Intel Core i7-12th Gen',
  'Intel Core i7-13th Gen',
  'Intel Core i7-14th Gen',

  // ============================================================
  // INTEL CORE i9
  // ============================================================
  'Intel Core i9',
  'Intel Core i9-8th Gen',
  'Intel Core i9-9th Gen',
  'Intel Core i9-10th Gen',
  'Intel Core i9-11th Gen',
  'Intel Core i9-12th Gen',
  'Intel Core i9-13th Gen',
  'Intel Core i9-14th Gen',

  // ============================================================
  // INTEL PENTIUM
  // ============================================================
  'Intel Pentium',
  'Intel Pentium Gold',
  'Intel Pentium Silver',
  'Intel Pentium N-Series',

  // ============================================================
  // INTEL CELERON
  // ============================================================
  'Intel Celeron',
  'Intel Celeron N-Series',
  'Intel Celeron 4xxx Series',
  'Intel Celeron 5xxx Series',
  'Intel Celeron 6xxx Series',

  // ============================================================
  // INTEL ATOM
  // ============================================================
  'Intel Atom',

  // ============================================================
  // AMD RYZEN 3
  // ============================================================
  'AMD Ryzen 3',
  'AMD Ryzen 3 3000 Series',
  'AMD Ryzen 3 4000 Series',
  'AMD Ryzen 3 5000 Series',
  'AMD Ryzen 3 7000 Series',
  'AMD Ryzen 3 8000 Series',

  // ============================================================
  // AMD RYZEN 5
  // ============================================================
  'AMD Ryzen 5',
  'AMD Ryzen 5 3000 Series',
  'AMD Ryzen 5 4000 Series',
  'AMD Ryzen 5 5000 Series',
  'AMD Ryzen 5 6000 Series',
  'AMD Ryzen 5 7000 Series',
  'AMD Ryzen 5 8000 Series',

  // ============================================================
  // AMD RYZEN 7
  // ============================================================
  'AMD Ryzen 7',
  'AMD Ryzen 7 3000 Series',
  'AMD Ryzen 7 4000 Series',
  'AMD Ryzen 7 5000 Series',
  'AMD Ryzen 7 6000 Series',
  'AMD Ryzen 7 7000 Series',
  'AMD Ryzen 7 8000 Series',

  // ============================================================
  // AMD RYZEN 9
  // ============================================================
  'AMD Ryzen 9',
  'AMD Ryzen 9 3000 Series',
  'AMD Ryzen 9 4000 Series',
  'AMD Ryzen 9 5000 Series',
  'AMD Ryzen 9 6000 Series',
  'AMD Ryzen 9 7000 Series',
  'AMD Ryzen 9 8000 Series',

  // ============================================================
  // AMD RYZEN AI
  // ============================================================
  'AMD Ryzen AI 5',
  'AMD Ryzen AI 7',
  'AMD Ryzen AI 9',

  // ============================================================
  // AMD ATHLON
  // ============================================================
  'AMD Athlon',
  'AMD Athlon Silver',
  'AMD Athlon Gold',

  // ============================================================
  // AMD A-SERIES
  // ============================================================
  'AMD A4',
  'AMD A6',
  'AMD A8',
  'AMD A9',
  'AMD A10',
  'AMD A12',

  // ============================================================
  // AMD FX
  // ============================================================
  'AMD FX',

  // ============================================================
  // QUALCOMM
  // ============================================================
  'Qualcomm Snapdragon X',
  'Qualcomm Snapdragon X Plus',
  'Qualcomm Snapdragon X Elite',
  'Qualcomm Snapdragon X2 Plus',
  'Qualcomm Snapdragon X2 Elite',

  // ============================================================
  // MEDIATEK
  // ============================================================
  'MediaTek Kompanio',

  // ============================================================
  // SAMSUNG
  // ============================================================
  'Samsung Exynos',

  // ============================================================
  // OTHER
  // ============================================================
  'Other',
  'Unknown',
];

// ─── Laptop Colors ────────────────────────────────────────────────
export const LAPTOP_COLORS = [
  // ============================================================
  // MACBOOK NEO — 2026
  // Official Apple finishes
  // ============================================================
  'Silver',
  'Blush',
  'Citrus',
  'Indigo',

  // ============================================================
  // APPLE / MACBOOK
  // ============================================================
  'Space Gray',
  'Space Black',
  'Midnight',
  'Starlight',
  'Gold',
  'Rose Gold',

  // ============================================================
  // BLACK / GRAY
  // ============================================================
  'Black',
  'Matte Black',
  'Jet Black',
  'Graphite',
  'Dark Gray',
  'Gray',
  'Charcoal',

  // ============================================================
  // WHITE
  // ============================================================
  'White',
  'Pearl White',
  'Arctic White',

  // ============================================================
  // BLUE
  // ============================================================
  'Blue',
  'Navy Blue',
  'Dark Blue',
  'Light Blue',
  'Sky Blue',

  // ============================================================
  // RED / PINK
  // ============================================================
  'Red',
  'Dark Red',
  'Pink',
  'Rose',
  'Coral',

  // ============================================================
  // GREEN
  // ============================================================
  'Green',
  'Dark Green',
  'Forest Green',
  'Olive Green',
  'Mint Green',

  // ============================================================
  // PURPLE
  // ============================================================
  'Purple',
  'Lavender',

  // ============================================================
  // BROWN / BEIGE
  // ============================================================
  'Brown',
  'Dark Brown',
  'Beige',
  'Sand',
  'Champagne',

  // ============================================================
  // OTHER
  // ============================================================
  'Orange',
  'Yellow',
  'Bronze',
  'Copper',

  'Other',
];

// ─── RAM options ─────────────────────────────────────────────────
export const RAM_OPTIONS = [
  '4GB',
  '8GB',
  '16GB',
  '32GB',
  '64GB',
  '128GB',
];

// ─── Storage options ─────────────────────────────────────────────
export const STORAGE_OPTIONS = [
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB',
  '4TB',
];

// ─── Screen size options ─────────────────────────────────────────
export const SCREEN_SIZE_OPTIONS = [
  '11.6"',
  '12.0"',
  '12.4"',
  '12.5"',
  '13.0"',
  '13.3"',
  '13.4"',
  '13.5"',
  '13.6"',
  '13.8"',
  '14.0"',
  '14.2"',
  '14.5"',
  '15.0"',
  '15.3"',
  '15.6"',
  '16.0"',
  '16.1"',
  '16.2"',
  '17.0"',
  '17.3"',
  '18.0"',
  '18.4"',
  'Other',
];

// ─── Graphics options ────────────────────────────────────────────
export const GRAPHICS_OPTIONS = [
  // ============================================================
  // APPLE
  // ============================================================

  // MacBook Neo
  'Apple 5-core GPU',

  'Apple Integrated Graphics',
  'Apple 7-core GPU',
  'Apple 8-core GPU',
  'Apple 9-core GPU',
  'Apple 10-core GPU',
  'Apple 14-core GPU',
  'Apple 16-core GPU',
  'Apple 18-core GPU',
  'Apple 19-core GPU',
  'Apple 20-core GPU',
  'Apple 24-core GPU',
  'Apple 30-core GPU',
  'Apple 38-core GPU',
  'Apple 40-core GPU',

  // ============================================================
  // INTEL INTEGRATED
  // ============================================================
  'Intel UHD Graphics',
  'Intel UHD Graphics 600',
  'Intel UHD Graphics 605',
  'Intel UHD Graphics 610',
  'Intel UHD Graphics 615',
  'Intel UHD Graphics 620',
  'Intel UHD Graphics 630',
  'Intel Iris Graphics',
  'Intel Iris Plus Graphics',
  'Intel Iris Xe Graphics',
  'Intel Arc Graphics',

  // ============================================================
  // NVIDIA GEFORCE MX
  // ============================================================
  'NVIDIA GeForce MX110',
  'NVIDIA GeForce MX130',
  'NVIDIA GeForce MX150',
  'NVIDIA GeForce MX230',
  'NVIDIA GeForce MX250',
  'NVIDIA GeForce MX330',
  'NVIDIA GeForce MX350',
  'NVIDIA GeForce MX450',
  'NVIDIA GeForce MX550',
  'NVIDIA GeForce MX570',

  // ============================================================
  // NVIDIA GTX
  // ============================================================
  'NVIDIA GeForce GTX 1050',
  'NVIDIA GeForce GTX 1050 Ti',
  'NVIDIA GeForce GTX 1060',
  'NVIDIA GeForce GTX 1650',
  'NVIDIA GeForce GTX 1650 Ti',
  'NVIDIA GeForce GTX 1660',
  'NVIDIA GeForce GTX 1660 Ti',

  // ============================================================
  // NVIDIA RTX 20
  // ============================================================
  'NVIDIA GeForce RTX 2050',
  'NVIDIA GeForce RTX 2060',
  'NVIDIA GeForce RTX 2070',
  'NVIDIA GeForce RTX 2080',

  // ============================================================
  // NVIDIA RTX 30
  // ============================================================
  'NVIDIA GeForce RTX 3050',
  'NVIDIA GeForce RTX 3050 Ti',
  'NVIDIA GeForce RTX 3060',
  'NVIDIA GeForce RTX 3070',
  'NVIDIA GeForce RTX 3080',
  'NVIDIA GeForce RTX 3080 Ti',
  'NVIDIA GeForce RTX 3090',
  'NVIDIA GeForce RTX 3090 Ti',

  // ============================================================
  // NVIDIA RTX 40
  // ============================================================
  'NVIDIA GeForce RTX 4050',
  'NVIDIA GeForce RTX 4060',
  'NVIDIA GeForce RTX 4070',
  'NVIDIA GeForce RTX 4080',
  'NVIDIA GeForce RTX 4090',

  // ============================================================
  // NVIDIA RTX 50
  // ============================================================
  'NVIDIA GeForce RTX 5050',
  'NVIDIA GeForce RTX 5060',
  'NVIDIA GeForce RTX 5070',
  'NVIDIA GeForce RTX 5070 Ti',
  'NVIDIA GeForce RTX 5080',
  'NVIDIA GeForce RTX 5090',

  // ============================================================
  // NVIDIA PROFESSIONAL
  // ============================================================
  'NVIDIA RTX A1000',
  'NVIDIA RTX A2000',
  'NVIDIA RTX A3000',
  'NVIDIA RTX A4000',
  'NVIDIA RTX A4500',
  'NVIDIA RTX A5000',
  'NVIDIA RTX A5500',

  // ============================================================
  // AMD RADEON
  // ============================================================
  'AMD Radeon Graphics',
  'AMD Radeon Vega 3',
  'AMD Radeon Vega 6',
  'AMD Radeon Vega 7',
  'AMD Radeon Vega 8',
  'AMD Radeon Vega 10',
  'AMD Radeon Vega 11',

  'AMD Radeon RX 550',
  'AMD Radeon RX 560',
  'AMD Radeon RX 570',
  'AMD Radeon RX 580',
  'AMD Radeon RX 590',

  'AMD Radeon RX 5500M',
  'AMD Radeon RX 5600M',
  'AMD Radeon RX 5700M',
  'AMD Radeon RX 6600M',
  'AMD Radeon RX 6700M',
  'AMD Radeon RX 6800M',
  'AMD Radeon RX 6850M XT',

  'AMD Radeon RX 7600M',
  'AMD Radeon RX 7600M XT',
  'AMD Radeon RX 7700S',
  'AMD Radeon RX 7800M',
  'AMD Radeon RX 7900M',

  'AMD Radeon RX 7600',
  'AMD Radeon RX 7700 XT',
  'AMD Radeon RX 7800 XT',
  'AMD Radeon RX 7900 XT',
  'AMD Radeon RX 7900 XTX',

  // ============================================================
  // QUALCOMM
  // ============================================================
  'Qualcomm Adreno GPU',

  // ============================================================
  // OTHER
  // ============================================================
  'Integrated Graphics',
  'Dedicated Graphics',
  'Other',
];

// ─── Condition options ───────────────────────────────────────────
export const CONDITION_OPTIONS = [
  'Brand New',
  'Like New',
  'Excellent',
  'Uk Used',
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

      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >
        💻 Laptop Specifications
      </h3>

      {/* ============================================================
          BRAND
      ============================================================ */}

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
          <option value="">
            Select brand
          </option>

          {LAPTOP_BRANDS.map((brand) => (
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

      {/* ============================================================
          MODEL
      ============================================================ */}

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

      {/* ============================================================
          PROCESSOR + RAM
      ============================================================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >

        {/* Processor */}
        <div className="form-group">

          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Processor
          </label>

          <select
            name="processor"
            value={formData.processor || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.processor
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select processor
            </option>

            {PROCESSOR_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>

        </div>

        {/* RAM */}
        <div className="form-group">

          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            RAM
          </label>

          <select
            name="ram"
            value={formData.ram || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.ram
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select RAM
            </option>

            {RAM_OPTIONS.map((option) => (
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

      {/* ============================================================
          STORAGE + SCREEN SIZE
      ============================================================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >

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
            <option value="">
              Select storage
            </option>

            {STORAGE_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>

        </div>

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

            {SCREEN_SIZE_OPTIONS.map((option) => (
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

      {/* ============================================================
          GRAPHICS + COLOR
      ============================================================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >

        {/* Graphics */}
        <div className="form-group">

          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Graphics
          </label>

          <select
            name="graphics"
            value={formData.graphics || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.graphics
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">
              Select graphics
            </option>

            {GRAPHICS_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>

        </div>

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

            {LAPTOP_COLORS.map((color) => (
              <option
                key={color}
                value={color}
              >
                {color}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* ============================================================
          CONDITION + BATTERY
      ============================================================ */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >

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

            {CONDITION_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>

        </div>

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
      </div>

      {/* ============================================================
          WARRANTY
      ============================================================ */}

      <div
        className="form-group"
        style={{
          marginTop: '14px',
        }}
      >

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
          {WARRANTY_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

      </div>

      {/* ============================================================
          NEGOTIATION + SWAP
      ============================================================ */}

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '14px',
          flexWrap: 'wrap',
        }}
      >

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

      {/* ============================================================
          REQUIRED FIELDS
      ============================================================ */}

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

export default LaptopForm;