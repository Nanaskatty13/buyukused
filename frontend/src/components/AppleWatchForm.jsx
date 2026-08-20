// ================================================================
// frontend/src/components/AppleWatchForm.jsx
// ================================================================

import React from "react";

// ================================================================
// SMARTWATCH BRANDS
// ================================================================

export const SMARTWATCH_BRANDS = [
  "Apple",
  "Samsung",
  "Garmin",
  "Fitbit",
  "Huawei",
  "Xiaomi",
  "Amazfit",
  "Suunto",
  "Polar",
  "Other",
];

// ================================================================
// APPLE WATCH MODELS
// ================================================================

const APPLE_WATCH_MODELS = [
  "Apple Watch Series 1",
  "Apple Watch Series 2",
  "Apple Watch Series 3",
  "Apple Watch Series 4",
  "Apple Watch Series 5",
  "Apple Watch Series 6",
  "Apple Watch SE (1st generation)",
  "Apple Watch Series 7",
  "Apple Watch Series 8",
  "Apple Watch Ultra",
  "Apple Watch SE (2nd generation)",
  "Apple Watch Series 9",
  "Apple Watch Ultra 2",
  "Apple Watch Series 10",
  "Apple Watch Series 11",
  "Apple Watch SE 3",
  "Apple Watch Ultra 3",
  "Other",
];

// ================================================================
// SAMSUNG
// ================================================================

const SAMSUNG_WATCH_MODELS = [
  "Galaxy Watch",
  "Galaxy Watch Active",
  "Galaxy Watch Active 2",
  "Galaxy Watch 3",
  "Galaxy Watch 4",
  "Galaxy Watch 4 Classic",
  "Galaxy Watch 5",
  "Galaxy Watch 5 Pro",
  "Galaxy Watch 6",
  "Galaxy Watch 6 Classic",
  "Galaxy Watch 7",
  "Galaxy Watch Ultra",
  "Galaxy Watch 8",
  "Other",
];

// ================================================================
// GARMIN
// ================================================================

const GARMIN_MODELS = [
  "Forerunner 45",
  "Forerunner 55",
  "Forerunner 245",
  "Forerunner 255",
  "Forerunner 265",
  "Forerunner 945",
  "Forerunner 955",
  "Fenix 6",
  "Fenix 7",
  "Epix Gen 2",
  "Venu 2",
  "Venu 3",
  "Vivoactive 4",
  "Vivoactive 5",
  "Other",
];

// ================================================================
// FITBIT
// ================================================================

const FITBIT_MODELS = [
  "Fitbit Versa",
  "Fitbit Versa 2",
  "Fitbit Versa 3",
  "Fitbit Versa 4",
  "Fitbit Sense",
  "Fitbit Sense 2",
  "Fitbit Ionic",
  "Fitbit Charge 3",
  "Fitbit Charge 4",
  "Fitbit Charge 5",
  "Fitbit Charge 6",
  "Other",
];

// ================================================================
// GENERIC
// ================================================================

const OTHER_MODELS = ["Other"];

// ================================================================
// GET MODELS
// ================================================================

export const getSmartwatchModelsByBrand = (brand) => {
  switch (brand) {
    case "Apple":
      return APPLE_WATCH_MODELS;

    case "Samsung":
      return SAMSUNG_WATCH_MODELS;

    case "Garmin":
      return GARMIN_MODELS;

    case "Fitbit":
      return FITBIT_MODELS;

    default:
      return OTHER_MODELS;
  }
};

// ================================================================
// WATCH SIZE
// ================================================================

export const WATCH_SIZE_OPTIONS = [
  "38mm",
  "40mm",
  "41mm",
  "42mm",
  "44mm",
  "45mm",
  "46mm",
  "47mm",
  "49mm",
  "51mm",
  "Other",
];

// ================================================================
// CONNECTIVITY
// ================================================================

export const WATCH_CONNECTIVITY_OPTIONS = [
  "GPS",
  "GPS + Cellular",
  "Wi-Fi",
  "Bluetooth",
  "GPS + Wi-Fi",
  "Other",
];

// ================================================================
// CASE MATERIAL
// ================================================================

export const WATCH_CASE_MATERIAL_OPTIONS = [
  "Aluminum",
  "Stainless Steel",
  "Titanium",
  "Ceramic",
  "Steel",
  "Plastic",
  "Other",
];

// ================================================================
// BAND MATERIAL
// ================================================================

export const WATCH_BAND_MATERIAL_OPTIONS = [
  "Sport Band",
  "Sport Loop",
  "Silicone",
  "Leather",
  "Stainless Steel",
  "Milanese Loop",
  "Nylon",
  "Fabric",
  "Metal",
  "Other",
];

// ================================================================
// DISPLAY
// ================================================================

export const WATCH_DISPLAY_OPTIONS = [
  "Retina OLED",
  "Always-On Retina OLED",
  "LTPO OLED",
  "Always-On LTPO OLED",
  "AMOLED",
  "LCD",
  "Other",
];

// ================================================================
// COLORS
// ================================================================

export const WATCH_COLORS = [
  "Silver",
  "Space Gray",
  "Space Black",
  "Gold",
  "Rose Gold",
  "Starlight",
  "Midnight",
  "Blue",
  "Graphite",
  "Black",
  "White",
  "Red",
  "Green",
  "Pink",
  "Purple",
  "Orange",
  "Yellow",
  "Natural Titanium",
  "Other",
];

// ================================================================
// WATER RESISTANCE
// ================================================================

export const WATCH_WATER_RESISTANCE_OPTIONS = [
  "None",
  "IPX7",
  "IP6X",
  "50m",
  "100m",
  "Other",
];

// ================================================================
// OPERATING SYSTEM
// ================================================================

export const WATCH_OS_OPTIONS = [
  "watchOS",
  "Wear OS",
  "Garmin OS",
  "Fitbit OS",
  "HarmonyOS",
  "Other",
];

// ================================================================
// CONDITION
// ================================================================

export const WATCH_CONDITION_OPTIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

// ================================================================
// WARRANTY
// ================================================================

export const WATCH_WARRANTY_OPTIONS = [
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

// ================================================================
// SHARED STYLES
// ================================================================

const inputStyle = (hasError = false) => ({
  width: "100%",
  padding: "10px 14px",
  border: hasError
    ? "1.5px solid #dc2626"
    : "1.5px solid var(--gray-200)",
  borderRadius: "var(--radius-md)",
  fontSize: "14px",
  background: "white",
  boxSizing: "border-box",
});

const labelStyle = {
  display: "block",
  fontWeight: 600,
  fontSize: "13px",
  marginBottom: "5px",
};

const groupStyle = {
  marginBottom: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

// ================================================================
// ERROR
// ================================================================

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <span
      style={{
        color: "#dc2626",
        fontSize: "12px",
        marginTop: "4px",
        display: "block",
      }}
    >
      {error}
    </span>
  );
};

// ================================================================
// CHECKBOX
// ================================================================

const CheckboxField = ({
  name,
  label,
  checked,
  onChange,
}) => {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={Boolean(checked)}
        onChange={onChange}
      />

      {label}
    </label>
  );
};

// ================================================================
// FORM
// ================================================================

const AppleWatchForm = ({
  formData = {},
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  const brandModels = getSmartwatchModelsByBrand(
    formData.brand
  );

  return (
    <div className="apple-watch-form">

      {/* ======================================================
          TITLE
      ====================================================== */}

      <h3
        style={{
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: "18px",
        }}
      >
        ⌚ Smartwatch / Apple Watch Specifications
      </h3>

      {/* ======================================================
          BRAND + MODEL
      ====================================================== */}

      <div style={gridStyle}>

        {/* BRAND */}

        <div style={groupStyle}>
          <label style={labelStyle}>
            Brand *
          </label>

          <select
            name="brand"
            value={formData.brand || ""}
            onChange={handleChange}
            required
            style={inputStyle(errors.brand)}
          >
            <option value="">
              Select brand
            </option>

            {SMARTWATCH_BRANDS.map((brand) => (
              <option
                key={brand}
                value={brand}
              >
                {brand}
              </option>
            ))}
          </select>

          <ErrorMessage error={errors.brand} />
        </div>

        {/* MODEL */}

        <div style={groupStyle}>
          <label style={labelStyle}>
            Model *
          </label>

          <select
            name="model"
            value={formData.model || ""}
            onChange={handleChange}
            required
            disabled={!formData.brand}
            style={inputStyle(errors.model)}
          >
            <option value="">
              {formData.brand
                ? "Select model"
                : "Select a brand first"}
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

          <ErrorMessage error={errors.model} />
        </div>
      </div>

      {/* ======================================================
          SERIES + SIZE
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Watch Series
          </label>

          <input
            type="text"
            name="watchSeries"
            value={formData.watchSeries || ""}
            onChange={handleChange}
            placeholder="e.g. Apple Watch Series 10"
            style={inputStyle(errors.watchSeries)}
          />

          <ErrorMessage error={errors.watchSeries} />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Watch Size
          </label>

          <select
            name="watchSize"
            value={formData.watchSize || ""}
            onChange={handleChange}
            style={inputStyle(errors.watchSize)}
          >
            <option value="">
              Select size
            </option>

            {WATCH_SIZE_OPTIONS.map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>

          <ErrorMessage error={errors.watchSize} />
        </div>
      </div>

      {/* ======================================================
          CONNECTIVITY + COLOR
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Connectivity
          </label>

          <select
            name="watchConnectivity"
            value={formData.watchConnectivity || ""}
            onChange={handleChange}
            style={inputStyle(errors.watchConnectivity)}
          >
            <option value="">
              Select connectivity
            </option>

            {WATCH_CONNECTIVITY_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Color
          </label>

          <select
            name="color"
            value={formData.color || ""}
            onChange={handleChange}
            style={inputStyle(errors.color)}
          >
            <option value="">
              Select color
            </option>

            {WATCH_COLORS.map((color) => (
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

      {/* ======================================================
          CASE + BAND MATERIAL
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Case Material
          </label>

          <select
            name="watchCaseMaterial"
            value={formData.watchCaseMaterial || ""}
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select case material
            </option>

            {WATCH_CASE_MATERIAL_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Band Material
          </label>

          <select
            name="watchBandMaterial"
            value={formData.watchBandMaterial || ""}
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select band material
            </option>

            {WATCH_BAND_MATERIAL_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ======================================================
          BAND COLOR + DISPLAY
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Band Color
          </label>

          <select
            name="watchBandColor"
            value={formData.watchBandColor || ""}
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select band color
            </option>

            {WATCH_COLORS.map((color) => (
              <option
                key={color}
                value={color}
              >
                {color}
              </option>
            ))}
          </select>
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Display
          </label>

          <select
            name="watchDisplayType"
            value={formData.watchDisplayType || ""}
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select display
            </option>

            {WATCH_DISPLAY_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ======================================================
          BATTERY + OS
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Battery Health (%)
          </label>

          <input
            type="number"
            name="watchBatteryHealth"
            value={
              formData.watchBatteryHealth ?? ""
            }
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="e.g. 95"
            style={inputStyle(
              errors.watchBatteryHealth
            )}
          />

          <ErrorMessage
            error={errors.watchBatteryHealth}
          />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Operating System
          </label>

          <select
            name="watchOperatingSystem"
            value={
              formData.watchOperatingSystem || ""
            }
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select operating system
            </option>

            {WATCH_OS_OPTIONS.map((option) => (
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

      {/* ======================================================
          PROCESSOR + WATER RESISTANCE
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Processor / Chip
          </label>

          <input
            type="text"
            name="watchProcessor"
            value={formData.watchProcessor || ""}
            onChange={handleChange}
            placeholder="e.g. S10 SiP"
            style={inputStyle()}
          />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Water Resistance
          </label>

          <select
            name="watchWaterResistance"
            value={
              formData.watchWaterResistance || ""
            }
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select water resistance
            </option>

            {WATCH_WATER_RESISTANCE_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ======================================================
          COMPATIBILITY
      ====================================================== */}

      <div style={groupStyle}>
        <label style={labelStyle}>
          Compatibility
        </label>

        <input
          type="text"
          name="watchCompatibility"
          value={
            formData.watchCompatibility || ""
          }
          onChange={handleChange}
          placeholder="e.g. iPhone XS or later"
          style={inputStyle()}
        />
      </div>

      {/* ======================================================
          FEATURES
      ====================================================== */}

      <div
        style={{
          marginTop: "8px",
          marginBottom: "16px",
        }}
      >
        <label
          style={{
            ...labelStyle,
            marginBottom: "10px",
          }}
        >
          Features
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "12px 20px",
          }}
        >
          <CheckboxField
            name="watchAlwaysOnDisplay"
            label="Always-On Display"
            checked={
              formData.watchAlwaysOnDisplay
            }
            onChange={handleCheckboxChange}
          />

          <CheckboxField
            name="watchECG"
            label="ECG"
            checked={formData.watchECG}
            onChange={handleCheckboxChange}
          />

          <CheckboxField
            name="watchBloodOxygen"
            label="Blood Oxygen"
            checked={
              formData.watchBloodOxygen
            }
            onChange={handleCheckboxChange}
          />

          <CheckboxField
            name="watchFallDetection"
            label="Fall Detection"
            checked={
              formData.watchFallDetection
            }
            onChange={handleCheckboxChange}
          />

          <CheckboxField
            name="watchCrashDetection"
            label="Crash Detection"
            checked={
              formData.watchCrashDetection
            }
            onChange={handleCheckboxChange}
          />

          <CheckboxField
            name="watchBoxIncluded"
            label="Original Box Included"
            checked={
              formData.watchBoxIncluded
            }
            onChange={handleCheckboxChange}
          />

          <CheckboxField
            name="watchAccessoriesIncluded"
            label="Accessories Included"
            checked={
              formData.watchAccessoriesIncluded
            }
            onChange={handleCheckboxChange}
          />
        </div>
      </div>

      {/* ======================================================
          CONDITION + WARRANTY
      ====================================================== */}

      <div style={gridStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Condition *
          </label>

          <select
            name="condition"
            value={formData.condition || ""}
            onChange={handleChange}
            required
            style={inputStyle(errors.condition)}
          >
            <option value="">
              Select condition
            </option>

            {WATCH_CONDITION_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>

          <ErrorMessage
            error={errors.condition}
          />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>
            Warranty
          </label>

          <select
            name="warranty"
            value={formData.warranty || ""}
            onChange={handleChange}
            style={inputStyle()}
          >
            <option value="">
              Select warranty
            </option>

            {WATCH_WARRANTY_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ======================================================
          SELLING OPTIONS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "8px",
          marginBottom: "8px",
        }}
      >
        <CheckboxField
          name="negotiation"
          label="Negotiable"
          checked={formData.negotiation}
          onChange={handleCheckboxChange}
        />

        <CheckboxField
          name="swapAccepted"
          label="Swap Accepted"
          checked={formData.swapAccepted}
          onChange={handleCheckboxChange}
        />
      </div>

      {/* ======================================================
          REQUIRED
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

export default AppleWatchForm;