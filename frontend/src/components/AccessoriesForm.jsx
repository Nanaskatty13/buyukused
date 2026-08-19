// frontend/src/components/AccessoriesForm.jsx

import React from "react";

// ============================================================
// ACCESSORY OPTIONS
// ============================================================

export const ACCESSORY_TYPES = [
  "Phone Case",
  "Screen Protector",
  "Charger",
  "Charging Cable",
  "Power Bank",
  "Wireless Charger",
  "Earphones",
  "Headphones",
  "Bluetooth Speaker",
  "Smart Watch",
  "Watch Strap",
  "Phone Holder",
  "Car Charger",
  "Car Mount",
  "USB Hub",
  "Memory Card",
  "USB Flash Drive",
  "Adapter",
  "Laptop Bag",
  "Laptop Stand",
  "Keyboard",
  "Mouse",
  "Webcam",
  "Game Controller",
  "Game Console Accessory",
  "HDMI Cable",
  "Other",
];

export const ACCESSORY_BRANDS = [
  "Apple",
  "Samsung",
  "Anker",
  "Baseus",
  "Belkin",
  "JBL",
  "Sony",
  "Oraimo",
  "UGREEN",
  "Xiaomi",
  "Huawei",
  "Dell",
  "HP",
  "Lenovo",
  "Logitech",
  "Microsoft",
  "Nintendo",
  "PlayStation",
  "Xbox",
  "Generic",
  "Other",
];

export const ACCESSORY_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

export const ACCESSORY_COLORS = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Green",
  "Purple",
  "Pink",
  "Gray",
  "Silver",
  "Gold",
  "Transparent",
  "Other",
];

export const ACCESSORY_CONNECTIVITY = [
  "None",
  "Bluetooth",
  "Wi-Fi",
  "USB",
  "USB-C",
  "Lightning",
  "Micro USB",
  "3.5mm Jack",
  "Wireless",
  "NFC",
  "Other",
];

export const ACCESSORY_POWER = [
  "None",
  "USB",
  "USB-C",
  "Lightning",
  "Micro USB",
  "Battery",
  "Built-in Battery",
  "AC Power",
  "Wireless Charging",
  "Other",
];

// ============================================================
// COMPONENT
// ============================================================

const AccessoriesForm = ({
  formData,
  handleChange,
}) => {
  return (
    <div className="accessories-form">

      <h3
        style={{
          marginBottom: "18px",
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        🎧 Accessory Details
      </h3>

      {/* ACCESSORY TYPE */}
      <div className="form-group">
        <label>Accessory Type *</label>

        <select
          name="accessoryType"
          value={formData.accessoryType}
          onChange={handleChange}
          required
        >
          <option value="">Select accessory type</option>

          {ACCESSORY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* BRAND */}
      <div className="form-group">
        <label>Brand</label>

        <select
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        >
          <option value="">Select brand</option>

          {ACCESSORY_BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* MODEL */}
      <div className="form-group">
        <label>Model</label>

        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="e.g. AirPods Pro 2"
        />
      </div>

      {/* COMPATIBILITY */}
      <div className="form-group">
        <label>Compatible With</label>

        <input
          type="text"
          name="compatibility"
          value={formData.compatibility}
          onChange={handleChange}
          placeholder="e.g. iPhone 15, Samsung S24, MacBook"
        />

        <span className="hint">
          Enter the phones, laptops, tablets or devices this accessory works with.
        </span>
      </div>

      {/* COLOR */}
      <div className="form-group">
        <label>Color</label>

        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
        >
          <option value="">Select color</option>

          {ACCESSORY_COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {/* CONNECTIVITY */}
      <div className="form-group">
        <label>Connectivity</label>

        <select
          name="connectivity"
          value={formData.connectivity}
          onChange={handleChange}
        >
          <option value="">Select connectivity</option>

          {ACCESSORY_CONNECTIVITY.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* POWER */}
      <div className="form-group">
        <label>Power / Charging</label>

        <select
          name="powerType"
          value={formData.powerType}
          onChange={handleChange}
        >
          <option value="">Select power type</option>

          {ACCESSORY_POWER.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* STORAGE */}
      <div className="form-group">
        <label>Storage / Capacity</label>

        <select
          name="storage"
          value={formData.storage}
          onChange={handleChange}
        >
          <option value="">Not applicable</option>
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

      {/* WARRANTY */}
      <div className="form-group">
        <label>Warranty</label>

        <select
          name="warranty"
          value={formData.warranty}
          onChange={handleChange}
        >
          <option value="">No warranty</option>
          <option value="1 week">1 week</option>
          <option value="2 weeks">2 weeks</option>
          <option value="1 month">1 month</option>
          <option value="3 months">3 months</option>
          <option value="6 months">6 months</option>
          <option value="1 year">1 year</option>
        </select>
      </div>

      {/* CONDITION */}
      <div className="form-group">
        <label>Condition *</label>

        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          required
        >
          {ACCESSORY_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default AccessoriesForm;