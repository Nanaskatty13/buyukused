// ============================================================
// frontend/src/components/TVForm.jsx
// ============================================================

import React from "react";

// ============================================================
// TV BRANDS
// ============================================================

export const TV_BRANDS = [
  "Samsung",
  "LG",
  "Sony",
  "TCL",
  "Hisense",
  "Philips",
  "Panasonic",
  "Toshiba",
  "Sharp",
  "Skyworth",
  "JVC",
  "Haier",
  "Xiaomi",
  "Roku",
  "Vizio",
  "Other",
];

// ============================================================
// TV TYPES
// ============================================================

export const TV_TYPES = [
  "Smart TV",
  "LED TV",
  "LCD TV",
  "OLED TV",
  "QLED TV",
  "Mini-LED TV",
  "Plasma TV",
  "Android TV",
  "Google TV",
  "Fire TV",
  "Other",
];

// ============================================================
// TV MODELS
// ============================================================

export const TV_MODELS = {
  Samsung: [
    "Samsung Crystal UHD",
    "Samsung Neo QLED",
    "Samsung QLED",
    "Samsung OLED",
    "Samsung The Frame",
    "Samsung The Serif",
    "Samsung The Sero",
    "Other",
  ],

  LG: [
    "LG OLED C Series",
    "LG OLED G Series",
    "LG OLED B Series",
    "LG QNED",
    "LG NanoCell",
    "LG UHD",
    "Other",
  ],

  Sony: [
    "Sony BRAVIA",
    "Sony BRAVIA XR",
    "Sony OLED",
    "Sony Mini LED",
    "Sony LED",
    "Other",
  ],

  TCL: [
    "TCL QLED",
    "TCL Mini LED",
    "TCL Google TV",
    "TCL Android TV",
    "TCL Roku TV",
    "TCL UHD",
    "Other",
  ],

  Hisense: [
    "Hisense ULED",
    "Hisense Mini LED",
    "Hisense QLED",
    "Hisense Google TV",
    "Hisense Android TV",
    "Hisense UHD",
    "Other",
  ],

  Philips: [
    "Philips Ambilight",
    "Philips OLED",
    "Philips QLED",
    "Philips LED",
    "Philips Android TV",
    "Other",
  ],

  Panasonic: [
    "Panasonic OLED",
    "Panasonic LED",
    "Panasonic 4K TV",
    "Other",
  ],

  Toshiba: [
    "Toshiba Fire TV",
    "Toshiba Android TV",
    "Toshiba Smart TV",
    "Toshiba UHD",
    "Other",
  ],

  Sharp: [
    "Sharp Aquos",
    "Sharp Android TV",
    "Sharp 4K TV",
    "Other",
  ],

  Skyworth: [
    "Skyworth OLED",
    "Skyworth QLED",
    "Skyworth Android TV",
    "Skyworth Google TV",
    "Skyworth UHD",
    "Other",
  ],

  JVC: [
    "JVC Smart TV",
    "JVC Android TV",
    "JVC Google TV",
    "Other",
  ],

  Haier: [
    "Haier Smart TV",
    "Haier Android TV",
    "Haier Google TV",
    "Other",
  ],

  Xiaomi: [
    "Xiaomi TV A Series",
    "Xiaomi TV P Series",
    "Xiaomi TV QLED",
    "Xiaomi TV QLED Pro",
    "Other",
  ],

  Roku: [
    "Roku TV",
    "Roku Select",
    "Roku Plus",
    "Other",
  ],

  Vizio: [
    "Vizio V-Series",
    "Vizio M-Series",
    "Vizio P-Series",
    "Vizio OLED",
    "Other",
  ],

  Other: [
    "Other",
  ],
};

// ============================================================
// SCREEN SIZES
// ============================================================

export const TV_SCREEN_SIZES = [
  '24"',
  '32"',
  '40"',
  '42"',
  '43"',
  '48"',
  '50"',
  '55"',
  '58"',
  '60"',
  '65"',
  '70"',
  '75"',
  '77"',
  '80"',
  '82"',
  '85"',
  '86"',
  '88"',
  '98"',
  '100"',
  "Other",
];

// ============================================================
// RESOLUTION
// ============================================================

export const TV_RESOLUTIONS = [
  "HD",
  "Full HD",
  "2K",
  "4K UHD",
  "8K UHD",
  "Other",
];

// ============================================================
// DISPLAY TECHNOLOGY
// ============================================================

export const DISPLAY_TECHNOLOGIES = [
  "LED",
  "LCD",
  "OLED",
  "QLED",
  "Neo QLED",
  "Mini-LED",
  "MicroLED",
  "NanoCell",
  "ULED",
  "Plasma",
  "Other",
];

// ============================================================
// REFRESH RATE
// ============================================================

export const REFRESH_RATES = [
  "50Hz",
  "60Hz",
  "75Hz",
  "100Hz",
  "120Hz",
  "144Hz",
  "165Hz",
  "240Hz",
  "Other",
];

// ============================================================
// OPERATING SYSTEM
// ============================================================

export const TV_OPERATING_SYSTEMS = [
  "Tizen",
  "webOS",
  "Google TV",
  "Android TV",
  "Roku TV",
  "Fire TV",
  "VIDAA",
  "My Home Screen",
  "SmartCast",
  "Other",
];

// ============================================================
// HDR
// ============================================================

export const HDR_OPTIONS = [
  "HDR10",
  "HDR10+",
  "Dolby Vision",
  "HLG",
  "HDR10 + Dolby Vision",
  "HDR10+ + Dolby Vision",
  "No HDR",
  "Other",
];

// ============================================================
// HDMI PORTS
// ============================================================

export const HDMI_OPTIONS = [
  "1 HDMI",
  "2 HDMI",
  "3 HDMI",
  "4 HDMI",
  "5 HDMI",
  "6 HDMI",
  "Other",
];

// ============================================================
// USB PORTS
// ============================================================

export const USB_OPTIONS = [
  "1 USB",
  "2 USB",
  "3 USB",
  "4 USB",
  "Other",
];

// ============================================================
// CONNECTIVITY
// ============================================================

export const TV_CONNECTIVITY_OPTIONS = [
  "Wi-Fi",
  "Wi-Fi + Bluetooth",
  "Wi-Fi + Ethernet",
  "Wi-Fi + Bluetooth + Ethernet",
  "Ethernet",
  "Bluetooth",
  "No Wireless Connectivity",
  "Other",
];

// ============================================================
// CONDITION
// ============================================================

export const TV_CONDITION_OPTIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

// ============================================================
// WARRANTY
// ============================================================

export const TV_WARRANTY_OPTIONS = [
  "No warranty",
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "1 year",
  "2 years",
  "3 years",
  "Other",
];

// ============================================================
// COLORS
// ============================================================

export const TV_COLORS = [
  "Black",
  "Silver",
  "Gray",
  "White",
  "Dark Gray",
  "Other",
];

// ============================================================
// COMPONENT
// ============================================================

const TVForm = ({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  const models = TV_MODELS[formData.brand] || [];

  return (
    <div className="tv-form">

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
            fontWeight: 700,
          }}
        >
          📺 TV Details
        </h3>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Select the TV model and provide its specifications.
        </p>
      </div>

      {/* ======================================================
          BRAND + MODEL
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            TV Brand *
          </label>

          <select
            name="brand"
            value={formData.brand || ""}
            onChange={(e) => {
              handleChange(e);

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
            <option value="">Select TV brand</option>

            {TV_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
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

        <div className="form-group">
          <label>
            TV Model *
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
                ? "Select TV model"
                : "Select brand first"}
            </option>

            {models.map((model) => (
              <option key={model} value={model}>
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
      </div>

      {/* ======================================================
          TV TYPE + SCREEN SIZE
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            TV Type
          </label>

          <select
            name="tvType"
            value={formData.tvType || ""}
            onChange={handleChange}
          >
            <option value="">
              Select TV type
            </option>

            {TV_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Screen Size
          </label>

          <select
            name="screenSize"
            value={formData.screenSize || ""}
            onChange={handleChange}
          >
            <option value="">
              Select screen size
            </option>

            {TV_SCREEN_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          RESOLUTION + DISPLAY TECHNOLOGY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
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

            {TV_RESOLUTIONS.map((resolution) => (
              <option key={resolution} value={resolution}>
                {resolution}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Display Technology
          </label>

          <select
            name="displayTechnology"
            value={formData.displayTechnology || ""}
            onChange={handleChange}
          >
            <option value="">
              Select display technology
            </option>

            {DISPLAY_TECHNOLOGIES.map((technology) => (
              <option key={technology} value={technology}>
                {technology}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          REFRESH RATE + OPERATING SYSTEM
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            Refresh Rate
          </label>

          <select
            name="refreshRate"
            value={formData.refreshRate || ""}
            onChange={handleChange}
          >
            <option value="">
              Select refresh rate
            </option>

            {REFRESH_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Operating System
          </label>

          <select
            name="operatingSystem"
            value={formData.operatingSystem || ""}
            onChange={handleChange}
          >
            <option value="">
              Select operating system
            </option>

            {TV_OPERATING_SYSTEMS.map((os) => (
              <option key={os} value={os}>
                {os}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          HDR + HDMI
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            HDR
          </label>

          <select
            name="hdr"
            value={formData.hdr || ""}
            onChange={handleChange}
          >
            <option value="">
              Select HDR
            </option>

            {HDR_OPTIONS.map((hdr) => (
              <option key={hdr} value={hdr}>
                {hdr}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            HDMI Ports
          </label>

          <select
            name="hdmiPorts"
            value={formData.hdmiPorts || ""}
            onChange={handleChange}
          >
            <option value="">
              Select HDMI ports
            </option>

            {HDMI_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          USB + CONNECTIVITY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            USB Ports
          </label>

          <select
            name="usbPorts"
            value={formData.usbPorts || ""}
            onChange={handleChange}
          >
            <option value="">
              Select USB ports
            </option>

            {USB_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

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

            {TV_CONNECTIVITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          STORAGE + RAM
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            Internal Storage
          </label>

          <select
            name="storage"
            value={formData.storage || ""}
            onChange={handleChange}
          >
            <option value="">
              Select storage
            </option>

            <option value="8GB">8GB</option>
            <option value="16GB">16GB</option>
            <option value="32GB">32GB</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
          </select>
        </div>

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

            <option value="1GB">1GB</option>
            <option value="2GB">2GB</option>
            <option value="3GB">3GB</option>
            <option value="4GB">4GB</option>
            <option value="6GB">6GB</option>
            <option value="8GB">8GB</option>
            <option value="12GB">12GB</option>
            <option value="16GB">16GB</option>
          </select>
        </div>
      </div>

      {/* ======================================================
          YEAR + COLOR
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            Release Year
          </label>

          <input
            type="number"
            name="year"
            value={formData.year || ""}
            onChange={handleChange}
            placeholder="e.g. 2025"
            min="1950"
            max="2030"
          />
        </div>

        <div className="form-group">
          <label>
            Color
          </label>

          <select
            name="color"
            value={formData.color || ""}
            onChange={handleChange}
          >
            <option value="">
              Select color
            </option>

            {TV_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          CONDITION + WARRANTY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div className="form-group">
          <label>
            Condition *
          </label>

          <select
            name="condition"
            value={formData.condition || ""}
            onChange={handleChange}
            required
          >
            <option value="">
              Select condition
            </option>

            {TV_CONDITION_OPTIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>

          {errors.condition && (
            <span className="field-error">
              {errors.condition}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>
            Warranty
          </label>

          <select
            name="warranty"
            value={formData.warranty || ""}
            onChange={handleChange}
          >
            {TV_WARRANTY_OPTIONS.map((warranty) => (
              <option key={warranty} value={warranty}>
                {warranty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================
          SMART TV FEATURES
      ====================================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "16px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          <input
            type="checkbox"
            name="smartTV"
            checked={formData.smartTV || false}
            onChange={handleCheckboxChange}
          />
          Smart TV
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          <input
            type="checkbox"
            name="voiceControl"
            checked={formData.voiceControl || false}
            onChange={handleCheckboxChange}
          />
          Voice Control
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          <input
            type="checkbox"
            name="wallMountable"
            checked={formData.wallMountable || false}
            onChange={handleCheckboxChange}
          />
          Wall Mountable
        </label>
      </div>

      {/* ======================================================
          NEGOTIATION + SWAP
      ====================================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "16px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "13px",
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "13px",
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

      {/* ======================================================
          REQUIRED NOTE
      ====================================================== */}

      <div
        style={{
          marginTop: "12px",
          fontSize: "13px",
          color: "var(--gray-500)",
        }}
      >
        * Required fields
      </div>
    </div>
  );
};

export default TVForm;