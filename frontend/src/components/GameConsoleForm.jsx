// ============================================================
// frontend/src/components/GameConsoleForm.jsx
// ============================================================

import React from "react";

// ============================================================
// CONSOLE BRANDS
// ============================================================

export const CONSOLE_BRANDS = [
  "Sony",
  "Microsoft",
  "Nintendo",
  "Valve",
  "ASUS",
  "Lenovo",
  "AYANEO",
  "Logitech",
  "Steam Deck",
  "Other",
];

// ============================================================
// CONSOLE TYPES
// ============================================================

export const CONSOLE_TYPES = [
  "Home Console",
  "Handheld Console",
  "Hybrid Console",
];

// ============================================================
// CONSOLE MODELS
// ============================================================

export const CONSOLE_MODELS = {
  Sony: [
    "PlayStation 5",
    "PlayStation 5 Digital Edition",
    "PlayStation 5 Slim",
    "PlayStation 5 Slim Digital Edition",
    "PlayStation 5 Pro",
    "PlayStation 4",
    "PlayStation 4 Slim",
    "PlayStation 4 Pro",
    "PlayStation 3",
    "PlayStation 2",
    "PlayStation Portable",
    "PlayStation Vita",
  ],

  Microsoft: [
    "Xbox Series X",
    "Xbox Series S",
    "Xbox One",
    "Xbox One S",
    "Xbox One X",
    "Xbox 360",
  ],

  Nintendo: [
    "Nintendo Switch",
    "Nintendo Switch OLED",
    "Nintendo Switch Lite",
    "Nintendo Switch 2",
    "Nintendo Wii U",
    "Nintendo Wii",
    "Nintendo 3DS",
    "Nintendo 2DS",
  ],

  Valve: [
    "Steam Deck",
    "Steam Deck LCD",
    "Steam Deck OLED",
  ],

  ASUS: [
    "ROG Ally",
    "ROG Ally X",
  ],

  Lenovo: [
    "Legion Go",
    "Legion Go S",
  ],

  AYANEO: [
    "AYANEO 2",
    "AYANEO Air",
    "AYANEO Air Plus",
    "AYANEO Kun",
    "AYANEO Next",
  ],

  Logitech: [
    "Logitech G Cloud",
  ],

  "Steam Deck": [
    "Steam Deck",
    "Steam Deck LCD",
    "Steam Deck OLED",
  ],

  Other: [
    "Other",
  ],
};

// ============================================================
// EDITIONS
// ============================================================

export const CONSOLE_EDITIONS = [
  "Standard",
  "Digital",
  "Slim",
  "Pro",
  "OLED",
  "Special Edition",
  "Limited Edition",
  "Collector's Edition",
  "Other",
];

// ============================================================
// DISC DRIVE
// ============================================================

export const DISC_DRIVE_OPTIONS = [
  "Disc Drive",
  "Digital Only",
  "Not Applicable",
];

// ============================================================
// CONTROLLERS
// ============================================================

export const CONTROLLER_OPTIONS = [
  "1 Controller",
  "2 Controllers",
  "3 Controllers",
  "4 Controllers",
  "None",
];

// ============================================================
// RESOLUTION
// ============================================================

export const RESOLUTION_OPTIONS = [
  "720p",
  "1080p",
  "1440p",
  "4K",
  "8K",
];

// ============================================================
// VIDEO OUTPUT
// ============================================================

export const VIDEO_OUTPUT_OPTIONS = [
  "HDMI",
  "HDMI 2.1",
  "DisplayPort",
  "USB-C",
  "Other",
];

// ============================================================
// COMPONENT
// ============================================================

const GameConsoleForm = ({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  // ----------------------------------------------------------
  // IMPORTANT:
  // Models are based on formData.brand.
  // The model selector writes directly to formData.model.
  // ----------------------------------------------------------

  const models =
    CONSOLE_MODELS[formData.brand] || [];

  return (
    <div className="game-console-form">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: "18px",
          }}
        >
          🎮 Game Console Details
        </h3>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Select the console model and provide its
          specifications.
        </p>
      </div>

      {/* ======================================================
          CONSOLE BRAND
      ====================================================== */}

      <div className="form-group">
        <label>
          Console Brand *
        </label>

        <select
          name="brand"
          value={formData.brand || ""}
          onChange={(e) => {
            // Change brand
            handleChange(e);

            // Reset model whenever brand changes.
            // This prevents a Sony model from remaining
            // selected when switching to Nintendo, Xbox, etc.
            handleChange({
              target: {
                name: "model",
                value: "",
                type: "text",
              },
            });
          }}
          required
        >
          <option value="">
            Select console brand
          </option>

          {CONSOLE_BRANDS.map((brand) => (
            <option
              key={brand}
              value={brand}
            >
              {brand}
            </option>
          ))}
        </select>

        {errors.brand && (
          <span className="field-error">
            {errors.brand}
          </span>
        )}
      </div>

      {/* ======================================================
          CONSOLE MODEL
      ====================================================== */}

      <div className="form-group">
        <label>
          Console Model *
        </label>

        <select
          name="model"
          value={formData.model || ""}
          onChange={handleChange}
          required
          disabled={!formData.brand}
        >
          <option value="">
            {formData.brand
              ? "Select console model"
              : "Select console brand first"}
          </option>

          {models.map((model) => (
            <option
              key={model}
              value={model}
            >
              {model}
            </option>
          ))}
        </select>

        {errors.model && (
          <span className="field-error">
            {errors.model}
          </span>
        )}
      </div>

      {/* ======================================================
          CONSOLE TYPE
      ====================================================== */}

      <div className="form-group">
        <label>
          Console Type
        </label>

        <select
          name="consoleType"
          value={formData.consoleType || ""}
          onChange={handleChange}
        >
          <option value="">
            Select console type
          </option>

          {CONSOLE_TYPES.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          EDITION
      ====================================================== */}

      <div className="form-group">
        <label>
          Edition
        </label>

        <select
          name="edition"
          value={formData.edition || ""}
          onChange={handleChange}
        >
          <option value="">
            Select edition
          </option>

          {CONSOLE_EDITIONS.map((edition) => (
            <option
              key={edition}
              value={edition}
            >
              {edition}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          DISC DRIVE
      ====================================================== */}

      <div className="form-group">
        <label>
          Disc Drive
        </label>

        <select
          name="discDrive"
          value={formData.discDrive || ""}
          onChange={handleChange}
        >
          <option value="">
            Select disc drive
          </option>

          {DISC_DRIVE_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          STORAGE
      ====================================================== */}

      <div className="form-group">
        <label>
          Storage
        </label>

        <select
          name="storage"
          value={formData.storage || ""}
          onChange={handleChange}
        >
          <option value="">
            Select storage
          </option>

          <option value="32GB">32GB</option>
          <option value="64GB">64GB</option>
          <option value="128GB">128GB</option>
          <option value="256GB">256GB</option>
          <option value="512GB">512GB</option>
          <option value="825GB">825GB</option>
          <option value="1TB">1TB</option>
          <option value="2TB">2TB</option>
          <option value="4TB">4TB</option>
        </select>
      </div>

      {/* ======================================================
          RAM
      ====================================================== */}

      <div className="form-group">
        <label>
          RAM
        </label>

        <select
          name="ram"
          value={formData.ram || ""}
          onChange={handleChange}
        >
          <option value="">
            Select RAM
          </option>

          <option value="4GB">4GB</option>
          <option value="8GB">8GB</option>
          <option value="12GB">12GB</option>
          <option value="16GB">16GB</option>
          <option value="24GB">24GB</option>
          <option value="32GB">32GB</option>
        </select>
      </div>

      {/* ======================================================
          CONTROLLERS
      ====================================================== */}

      <div className="form-group">
        <label>
          Controllers Included
        </label>

        <select
          name="controllersIncluded"
          value={
            formData.controllersIncluded || ""
          }
          onChange={handleChange}
        >
          <option value="">
            Select number of controllers
          </option>

          {CONTROLLER_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          BATTERY
      ====================================================== */}

      <div className="form-group">
        <label>
          Battery
        </label>

        <select
          name="battery"
          value={formData.battery || ""}
          onChange={handleChange}
        >
          <option value="">
            Select battery status
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

          <option value="Not Applicable">
            Not Applicable
          </option>
        </select>
      </div>

      {/* ======================================================
          SCREEN SIZE
      ====================================================== */}

      <div className="form-group">
        <label>
          Screen Size
        </label>

        <input
          type="text"
          name="screenSize"
          value={formData.screenSize || ""}
          onChange={handleChange}
          placeholder="e.g. 7 inches"
        />
      </div>

      {/* ======================================================
          RESOLUTION
      ====================================================== */}

      <div className="form-group">
        <label>
          Resolution
        </label>

        <select
          name="resolution"
          value={formData.resolution || ""}
          onChange={handleChange}
        >
          <option value="">
            Select resolution
          </option>

          {RESOLUTION_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          VIDEO OUTPUT
      ====================================================== */}

      <div className="form-group">
        <label>
          Video Output
        </label>

        <select
          name="videoOutput"
          value={formData.videoOutput || ""}
          onChange={handleChange}
        >
          <option value="">
            Select video output
          </option>

          {VIDEO_OUTPUT_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          YEAR
      ====================================================== */}

      <div className="form-group">
        <label>
          Release Year
        </label>

        <input
          type="number"
          name="year"
          value={formData.year || ""}
          onChange={handleChange}
          placeholder="e.g. 2024"
          min="1970"
          max="2030"
        />
      </div>

      {/* ======================================================
          CONNECTIVITY
      ====================================================== */}

      <div className="form-group">
        <label>
          Connectivity
        </label>

        <select
          name="connectivity"
          value={formData.connectivity || ""}
          onChange={handleChange}
        >
          <option value="">
            Select connectivity
          </option>

          <option value="Wi-Fi">
            Wi-Fi
          </option>

          <option value="Wi-Fi + Ethernet">
            Wi-Fi + Ethernet
          </option>

          <option value="Wi-Fi + 5G">
            Wi-Fi + 5G
          </option>

          <option value="Bluetooth">
            Bluetooth
          </option>

          <option value="Wi-Fi + Bluetooth">
            Wi-Fi + Bluetooth
          </option>
        </select>
      </div>

    </div>
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default GameConsoleForm;