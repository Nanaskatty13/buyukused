// frontend/src/components/CarForm.jsx
import React from 'react';

// ================================================================
// CAR BRANDS (Make)
// ================================================================

export const CAR_BRANDS = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Nissan',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Lexus',
  'Subaru',
  'Mazda',
  'Jeep',
  'Land Rover',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'Rolls-Royce',
  'Bentley',
  'Maserati',
  'Jaguar',
  'Volvo',
  'Alfa Romeo',
  'Fiat',
  'Citroën',
  'Peugeot',
  'Renault',
  'Dacia',
  'Mitsubishi',
  'Suzuki',
  'Daihatsu',
  'Isuzu',
  'Hino',
  'Other',
];

// ================================================================
// CAR MODELS PER BRAND (simplified – you can expand)
// ================================================================

const CAR_MODELS = {
  Toyota: [
    'Corolla', 'Camry', 'RAV4', 'Highlander', 'Sienna', 'Tacoma', 'Tundra',
    'Land Cruiser', 'Prado', 'Hilux', 'Fortuner', 'Innova', 'Yaris', 'C-HR',
    'Supra', 'GR86', 'Avalon', 'Prius', 'Mirai', 'Other',
  ],
  Honda: [
    'Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Odyssey', 'Ridgeline',
    'Passport', 'Insight', 'Clarity', 'Fit', 'Jazz', 'Other',
  ],
  Ford: [
    'F-150', 'Ranger', 'Mustang', 'Escape', 'Explorer', 'Edge', 'Expedition',
    'Focus', 'Fiesta', 'Fusion', 'Bronco', 'Bronco Sport', 'Maverick',
    'Transit', 'Other',
  ],
  Chevrolet: [
    'Silverado', 'Colorado', 'Camaro', 'Corvette', 'Equinox', 'Traverse',
    'Tahoe', 'Suburban', 'Malibu', 'Impala', 'Spark', 'Sonic', 'Bolt',
    'Other',
  ],
  Nissan: [
    'Altima', 'Maxima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Armada',
    'Frontier', 'Titan', 'Z', 'GT-R', 'Leaf', 'Kicks', 'Other',
  ],
  Hyundai: [
    'Elantra', 'Sonata', 'Accent', 'Tucson', 'Santa Fe', 'Palisade', 'Kona',
    'Ioniq', 'Nexo', 'Venue', 'Other',
  ],
  Kia: [
    'Forte', 'K5', 'Stinger', 'Soul', 'Sportage', 'Sorento', 'Telluride',
    'Carnival', 'Rio', 'Niro', 'EV6', 'Other',
  ],
  Volkswagen: [
    'Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'Taos', 'ID.4', 'Arteon',
    'Beetle', 'Other',
  ],
  'Mercedes-Benz': [
    'C-Class', 'E-Class', 'S-Class', 'A-Class', 'GLA', 'GLB', 'GLC', 'GLE',
    'GLS', 'G-Class', 'EQS', 'EQE', 'EQB', 'Sprinter', 'Other',
  ],
  BMW: [
    '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i3', 'i4',
    'iX', 'M3', 'M5', 'M4', 'M8', 'Other',
  ],
  Audi: [
    'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron',
    'R8', 'TT', 'Other',
  ],
  Lexus: [
    'IS', 'ES', 'GS', 'LS', 'RC', 'LC', 'UX', 'NX', 'RX', 'GX', 'LX',
    'RZ', 'Other',
  ],
  Subaru: [
    'Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent',
    'BRZ', 'WRX', 'Other',
  ],
  Mazda: [
    'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30',
    'Other',
  ],
  Jeep: [
    'Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade',
    'Gladiator', 'Patriot', 'Other',
  ],
  'Land Rover': [
    'Defender', 'Discovery', 'Range Rover', 'Range Rover Sport',
    'Range Rover Evoque', 'Range Rover Velar', 'Other',
  ],
  Porsche: [
    '911', 'Cayman', 'Boxster', 'Panamera', 'Taycan', 'Macan', 'Cayenne',
    'Other',
  ],
  Ferrari: [
    'F8 Tributo', 'SF90 Stradale', 'Roma', 'Portofino', '812 Superfast',
    'Ferrari California', 'Other',
  ],
  Lamborghini: [
    'Huracán', 'Aventador', 'Urus', 'Revuelto', 'Other',
  ],
  'Rolls-Royce': [
    'Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Spectre', 'Other',
  ],
  Bentley: [
    'Continental GT', 'Flying Spur', 'Bentayga', 'Mulsanne', 'Other',
  ],
  Maserati: [
    'Ghibli', 'Quattroporte', 'Levante', 'MC20', 'GranTurismo', 'Other',
  ],
  Jaguar: [
    'XF', 'XE', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace', 'Other',
  ],
  Volvo: [
    'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40', 'Other',
  ],
  'Alfa Romeo': [
    'Giulia', 'Stelvio', 'Tonale', '4C', 'Other',
  ],
  Fiat: [
    '500', 'Panda', 'Tipo', 'Doblo', 'Ducato', 'Other',
  ],
  Citroën: [
    'C3', 'C4', 'C5', 'C5 Aircross', 'Berlingo', 'Jumpy', 'Other',
  ],
  Peugeot: [
    '208', '308', '508', '2008', '3008', '5008', 'Rifter', 'Partner',
    'Other',
  ],
  Renault: [
    'Clio', 'Megane', 'Scenic', 'Captur', 'Kadjar', 'Koleos', 'Zoe',
    'Other',
  ],
  Dacia: [
    'Sandero', 'Logan', 'Duster', 'Jogger', 'Spring', 'Other',
  ],
  Mitsubishi: [
    'Outlander', 'Eclipse Cross', 'Pajero', 'L200', 'Mirage', 'Other',
  ],
  Suzuki: [
    'Swift', 'Vitara', 'SX4', 'Jimny', 'Ignis', 'Baleno', 'Other',
  ],
  Daihatsu: [
    'Terios', 'Sirion', 'YRV', 'Mira', 'Move', 'Other',
  ],
  Isuzu: [
    'D-Max', 'MU-X', 'N-Series', 'F-Series', 'Other',
  ],
  Hino: [
    'Dutro', 'Ranger', '500 Series', '700 Series', 'Other',
  ],
  Other: ['Other'],
};

// ================================================================
// CAR BODY TYPES
// ================================================================

export const CAR_BODY_TYPES = [
  'Sedan',
  'SUV',
  'Truck',
  'Van',
  'Wagon',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Minivan',
  'Roadster',
  'Pickup',
  'Off-road',
  'Other',
];

// ================================================================
// FUEL TYPES
// ================================================================

export const FUEL_TYPES = [
  'Petrol (Gasoline)',
  'Diesel',
  'Hybrid',
  'Plug-in Hybrid',
  'Electric',
  'LPG',
  'CNG',
  'Other',
];

// ================================================================
// TRANSMISSION
// ================================================================

export const TRANSMISSION_TYPES = [
  'Automatic',
  'Manual',
  'CVT',
  'Dual-clutch (DCT)',
  'Automated Manual (AMT)',
  'Other',
];

// ================================================================
// DRIVE TYPE
// ================================================================

export const DRIVE_TYPES = [
  'Front-Wheel Drive (FWD)',
  'Rear-Wheel Drive (RWD)',
  'All-Wheel Drive (AWD)',
  'Four-Wheel Drive (4WD)',
  'Other',
];

// ================================================================
// EXTERIOR COLORS
// ================================================================

export const EXTERIOR_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Brown',
  'Gold',
  'Orange',
  'Yellow',
  'Purple',
  'Pink',
  'Dark Blue',
  'Dark Gray',
  'Metallic',
  'Matte',
  'Other',
];

// ================================================================
// INTERIOR COLORS
// ================================================================

export const INTERIOR_COLORS = [
  'Black',
  'Beige',
  'Gray',
  'Brown',
  'Red',
  'Blue',
  'Tan',
  'Cream',
  'White',
  'Other',
];

// ================================================================
// CONDITION OPTIONS
// ================================================================

export const CAR_CONDITION_OPTIONS = [
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

export const CAR_WARRANTY_OPTIONS = [
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
// GET MODELS BY BRAND
// ================================================================

export const getCarModelsByBrand = (brand) => {
  return CAR_MODELS[brand] || CAR_MODELS['Other'];
};

// ================================================================
// CAR FORM COMPONENT
// ================================================================

const CarForm = ({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  const brandModels = getCarModelsByBrand(formData.brand);

  return (
    <div className="car-form">
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >
        🚗 Car Specifications
      </h3>

      {/* Brand */}
      <div className="form-group" style={{ marginBottom: '14px' }}>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '4px',
          }}
        >
          Brand (Make) *
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
          {CAR_BRANDS.map((brand) => (
            <option key={brand} value={brand}>
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

      {/* Model */}
      <div className="form-group" style={{ marginBottom: '14px' }}>
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
            {formData.brand ? 'Select model' : 'Select a brand first'}
          </option>
          {brandModels.map((model) => (
            <option key={model} value={model}>
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

      {/* Year + Mileage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >
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
          <input
            type="number"
            name="year"
            value={formData.year || ''}
            onChange={handleChange}
            min="1950"
            max="2030"
            placeholder="e.g. 2022"
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
          />
        </div>

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Mileage (km)
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage || ''}
            onChange={handleChange}
            min="0"
            placeholder="e.g. 50,000"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.mileage
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          />
        </div>
      </div>

      {/* Body Type + Fuel Type */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >
        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Body Type
          </label>
          <select
            name="bodyType"
            value={formData.bodyType || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.bodyType
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select body type</option>
            {CAR_BODY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Fuel Type
          </label>
          <select
            name="fuelType"
            value={formData.fuelType || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.fuelType
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select fuel type</option>
            {FUEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transmission + Drive Type */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >
        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Transmission
          </label>
          <select
            name="transmission"
            value={formData.transmission || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.transmission
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select transmission</option>
            {TRANSMISSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Drive Type
          </label>
          <select
            name="driveType"
            value={formData.driveType || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.driveType
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select drive type</option>
            {DRIVE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Engine Size + Seating Capacity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >
        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Engine Size (L)
          </label>
          <select
            name="engineSize"
            value={formData.engineSize || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.engineSize
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select engine size</option>
            <option value="1.0L">1.0L</option>
            <option value="1.2L">1.2L</option>
            <option value="1.4L">1.4L</option>
            <option value="1.5L">1.5L</option>
            <option value="1.6L">1.6L</option>
            <option value="1.8L">1.8L</option>
            <option value="2.0L">2.0L</option>
            <option value="2.5L">2.5L</option>
            <option value="3.0L">3.0L</option>
            <option value="3.5L">3.5L</option>
            <option value="4.0L">4.0L</option>
            <option value="5.0L">5.0L</option>
            <option value="6.0L">6.0L</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Seating Capacity
          </label>
          <select
            name="seatingCapacity"
            value={formData.seatingCapacity || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.seatingCapacity
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select seating capacity</option>
            <option value="2">2 seats</option>
            <option value="4">4 seats</option>
            <option value="5">5 seats</option>
            <option value="6">6 seats</option>
            <option value="7">7 seats</option>
            <option value="8">8 seats</option>
            <option value="9">9 seats</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Exterior Color + Interior Color */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >
        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Exterior Color
          </label>
          <select
            name="exteriorColor"
            value={formData.exteriorColor || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.exteriorColor
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select exterior color</option>
            {EXTERIOR_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Interior Color
          </label>
          <select
            name="interiorColor"
            value={formData.interiorColor || ''}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: errors.interiorColor
                ? '1.5px solid #dc2626'
                : '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              background: 'white',
            }}
          >
            <option value="">Select interior color</option>
            {INTERIOR_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Condition + Warranty */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginTop: '14px',
        }}
      >
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
            <option value="">Select condition</option>
            {CAR_CONDITION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.condition && (
            <span
              style={{
                color: '#dc2626',
                fontSize: '12px',
                marginTop: '4px',
                display: 'block',
              }}
            >
              {errors.condition}
            </span>
          )}
        </div>

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
            {CAR_WARRANTY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Negotiation + Swap */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '16px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <input
            type="checkbox"
            name="negotiation"
            checked={formData.negotiation || false}
            onChange={handleCheckboxChange}
          />
          Negotiable
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <input
            type="checkbox"
            name="swapAccepted"
            checked={formData.swapAccepted || false}
            onChange={handleCheckboxChange}
          />
          Swap Accepted
        </label>
      </div>

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

export default CarForm;